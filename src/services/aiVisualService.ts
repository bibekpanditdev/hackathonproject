// src/services/aiVisualService.ts
//
// Powers the "Upload PDF or Chat -> Mindmap / Workflow / Graph / Ask Me More" feature.
// Provider calling + Groq->NVIDIA fallback now lives in ./aiClient.ts (shared with
// api.ts) instead of being duplicated here.

import type { AIVisualAnalysis, VisualChatTurn } from '../types/aiVisual';
import { chatCompleteJson } from './aiClient';

const SYSTEM_PROMPT = `You are an assistant inside EduMind that converts study documents or student questions into structured visual study data.
Always respond with ONLY valid JSON, no markdown fences, no commentary, matching this exact schema:

{
  "summary": "string, 2-3 sentences explaining the content in plain language",
  "mindMap": {
    "id": "root",
    "label": "string - the central topic",
    "children": [
      { "id": "string", "label": "string", "children": [ ... nested, max depth 3 ] }
    ]
  },
  "workflow": [
    { "id": "step1", "label": "string", "description": "1 short sentence", "next": ["step2"] }
  ],
  "graph": {
    "type": "bar" | "line" | "pie",
    "title": "string",
    "points": [ { "name": "string", "value": number } ]
  },
  "followUpQuestions": ["string", "string", "string"]
}

Rules:
- mindMap must have one root node and 3-7 top-level children, each with 0-4 children of their own.
- workflow must represent a logical sequence/process implied by the content (if the content has no clear process, represent the steps a student should take to learn/master it).
- graph must always be populated — if there's no numeric data in the source, use topic weight/frequency/importance as the values.
- followUpQuestions must be 3-4 genuinely useful next questions a student could ask about this content.
- Keep labels short (under 8 words) since they render inside diagram nodes.`;

function buildFallback(sourceType: 'pdf' | 'chat', sourceLabel: string): AIVisualAnalysis {
  // Keeps the UI usable if both Groq and Nvidia fail (no key, rate limited, offline).
  return {
    id: `analysis_${Date.now()}`,
    sourceType,
    sourceLabel,
    summary: `Here is a placeholder analysis of "${sourceLabel}". The AI call failed, so this is fallback demo data — check your VITE_GROQ_API_KEY / VITE_NVIDIA_API_KEY and network connection.`,
    mindMap: {
      id: 'root',
      label: sourceLabel.slice(0, 40) || 'Topic Overview',
      children: [
        { id: 'c1', label: 'Core Concept 1', children: [{ id: 'c1a', label: 'Detail A' }, { id: 'c1b', label: 'Detail B' }] },
        { id: 'c2', label: 'Core Concept 2', children: [{ id: 'c2a', label: 'Detail A' }] },
        { id: 'c3', label: 'Core Concept 3' },
      ],
    },
    workflow: [
      { id: 'step1', label: 'Understand basics', description: 'Read through the material once', next: ['step2'] },
      { id: 'step2', label: 'Identify key terms', description: 'Highlight unfamiliar vocabulary', next: ['step3'] },
      { id: 'step3', label: 'Practice recall', description: 'Answer follow-up questions', next: [] },
    ],
    graph: {
      type: 'bar',
      title: 'Topic Weight (demo data)',
      points: [
        { name: 'Concept 1', value: 40 },
        { name: 'Concept 2', value: 30 },
        { name: 'Concept 3', value: 20 },
        { name: 'Concept 4', value: 10 },
      ],
    },
    followUpQuestions: [
      `What is the most important idea in "${sourceLabel}"?`,
      'Can you quiz me on this?',
      'Explain this with a real-world analogy.',
    ],
    createdAt: new Date().toISOString(),
  };
}

/**
 * Analyze a chunk of text (from a PDF or typed question) and return structured
 * visual study data: summary, mindmap, workflow, graph, and follow-up questions.
 */
export async function generateVisualAnalysis(
  content: string,
  sourceType: 'pdf' | 'chat',
  sourceLabel: string,
  history: VisualChatTurn[] = []
): Promise<AIVisualAnalysis> {
  try {
    const json = await chatCompleteJson<any>(SYSTEM_PROMPT, content, {
      temperature: 0.4,
      history: history.map((h) => ({ role: h.role, content: h.content })),
    });

    return {
      id: `analysis_${Date.now()}`,
      sourceType,
      sourceLabel,
      summary: json.summary || '',
      mindMap: json.mindMap || { id: 'root', label: sourceLabel, children: [] },
      workflow: json.workflow || [],
      graph: json.graph || { type: 'bar', title: 'Overview', points: [] },
      followUpQuestions: json.followUpQuestions || [],
      createdAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('AI visual analysis failed, using offline fallback:', err);
    return buildFallback(sourceType, sourceLabel);
  }
}

/**
 * Extract raw text from an uploaded PDF file, client-side, using pdf.js.
 * Truncates to a safe length for the LLM context window.
 */
export async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  // @ts-ignore - vite-specific worker import
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
  }

  return fullText.trim().slice(0, 12000); // guard token limits
}
