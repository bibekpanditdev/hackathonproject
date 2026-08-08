import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to clean JSON strings wrapped in ```json ... ``` code blocks
function parseJSONFromText(text: string): any {
  if (!text) return null;
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse JSON from AI response:', err, 'Raw text:', text);
    return null;
  }
}

// Lazy initialization helper for Google GenAI SDK
let aiClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }
  return aiClient;
}

// Universal AI Caller supporting Groq (Llama 3.3 70B), NVIDIA (Llama 3.1 70B), and Gemini
async function callAIJSON(prompt: string, systemPrompt: string): Promise<any> {
  const groqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  const groqUrl = process.env.GROQ_BASE_URL || process.env.VITE_GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
  const groqModel = process.env.GROQ_MODEL || process.env.VITE_GROQ_MODEL || 'llama-3.1-8b-instant';

  const nvidiaKey = process.env.NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY;
  const nvidiaUrl = process.env.NVIDIA_BASE_URL || process.env.VITE_NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
  const nvidiaModel = process.env.NVIDIA_MODEL || process.env.VITE_NVIDIA_MODEL || 'meta/llama-3.3-70b-instruct';

  // 1. Try Groq first
  if (groqKey) {
    try {
      const res = await fetch(`${groqUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: groqModel,
          messages: [
            { role: 'system', content: `${systemPrompt}\nIMPORTANT: Respond strictly with valid JSON only. Do not include extra text or explanations.` },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        const parsed = parseJSONFromText(content);
        if (parsed) return parsed;
      } else {
        console.warn('Groq API error:', res.status, await res.text());
      }
    } catch (err) {
      console.warn('Groq request failed:', err);
    }
  }

  // 2. Try NVIDIA second
  if (nvidiaKey) {
    try {
      const res = await fetch(`${nvidiaUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${nvidiaKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: nvidiaModel,
          messages: [
            { role: 'system', content: `${systemPrompt}\nIMPORTANT: Respond strictly with valid JSON only. Do not include extra text or explanations.` },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        const parsed = parseJSONFromText(content);
        if (parsed) return parsed;
      } else {
        console.warn('NVIDIA API error:', res.status, await res.text());
      }
    } catch (err) {
      console.warn('NVIDIA request failed:', err);
    }
  }

  // 3. Try Gemini third
  const gemini = getGenAIClient();
  if (gemini) {
    try {
      const response = await gemini.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        },
      });
      const parsed = parseJSONFromText(response.text || '');
      if (parsed) return parsed;
    } catch (err) {
      console.warn('Gemini request failed:', err);
    }
  }

  return null;
}

async function callAIText(prompt: string, systemPrompt: string): Promise<string | null> {
  const groqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  const groqUrl = process.env.GROQ_BASE_URL || process.env.VITE_GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
  const groqModel = process.env.GROQ_MODEL || process.env.VITE_GROQ_MODEL || 'llama-3.1-8b-instant';

  const nvidiaKey = process.env.NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY;
  const nvidiaUrl = process.env.NVIDIA_BASE_URL || process.env.VITE_NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
  const nvidiaModel = process.env.NVIDIA_MODEL || process.env.VITE_NVIDIA_MODEL || 'meta/llama-3.3-70b-instruct';

  if (groqKey) {
    try {
      const res = await fetch(`${groqUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: groqModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.5,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || null;
      }
    } catch (err) {
      console.warn('Groq text request failed:', err);
    }
  }

  if (nvidiaKey) {
    try {
      const res = await fetch(`${nvidiaUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${nvidiaKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: nvidiaModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.5,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || null;
      }
    } catch (err) {
      console.warn('NVIDIA text request failed:', err);
    }
  }

  const gemini = getGenAIClient();
  if (gemini) {
    try {
      const response = await gemini.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: { systemInstruction: systemPrompt },
      });
      return response.text || null;
    } catch (err) {
      console.warn('Gemini text request failed:', err);
    }
  }

  return null;
}

// System instructions for EduMind AI
const SYSTEM_PROMPT_TUTOR = `You are EduMind, a patient, encouraging AI tutor.
You NEVER explain an entire subject at once. You teach ONE small concept at a time in small bite-sized micro-lessons.
Every micro-lesson must be short (~150-250 words), visually engaging with bullet takeaways and a simple real-world analogy.
You must always follow up with 1-2 check-understanding questions.
Tone: warm, encouraging, clear, structured, using light emojis (📶 💡 ✅).`;

// Health check endpoint
app.get('/api/health', (_req, res) => {
  const hasKey = Boolean(process.env.GROQ_API_KEY || process.env.NVIDIA_API_KEY || process.env.GEMINI_API_KEY);
  res.json({ status: 'ok', hasAiKey: hasKey });
});

// API: Generate Sequential Learning Roadmap
app.post('/api/tutor/roadmap', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const prompt = `Build a sequential 5-step learning roadmap for a student mastering: "${topic}".
Format as JSON:
{
  "topic": "${topic}",
  "roadmap": [
    { "stepNumber": 1, "title": "...", "summary": "...", "estimatedMinutes": 5 },
    { "stepNumber": 2, "title": "...", "summary": "...", "estimatedMinutes": 6 },
    { "stepNumber": 3, "title": "...", "summary": "...", "estimatedMinutes": 8 },
    { "stepNumber": 4, "title": "...", "summary": "...", "estimatedMinutes": 10 },
    { "stepNumber": 5, "title": "...", "summary": "...", "estimatedMinutes": 8 }
  ]
}`;

    const data = await callAIJSON(prompt, SYSTEM_PROMPT_TUTOR);

    if (data && data.roadmap && Array.isArray(data.roadmap)) {
      return res.json(data);
    }

    // Graceful fallback roadmap
    return res.json({
      topic,
      roadmap: [
        { stepNumber: 1, title: `Introduction to ${topic}`, summary: `Core foundations and basic terms of ${topic}`, estimatedMinutes: 5 },
        { stepNumber: 2, title: `Key Architectural Principles`, summary: `Fundamental structures and mechanics of ${topic}`, estimatedMinutes: 6 },
        { stepNumber: 3, title: `Core Workflows & Components`, summary: `How elements interact in ${topic}`, estimatedMinutes: 8 },
        { stepNumber: 4, title: `Advanced Concepts & Protocols`, summary: `Deeper mechanics, algorithms, or reactions`, estimatedMinutes: 10 },
        { stepNumber: 5, title: `Real-World Applications & Exam Highlights`, summary: `Practical problem solving and high-yield questions`, estimatedMinutes: 8 },
      ],
    });
  } catch (err: any) {
    console.error('Error generating roadmap:', err);
    res.status(500).json({ error: err.message || 'Failed to generate roadmap' });
  }
});

// API: Generate Step Micro-Lesson & Check Questions
app.post('/api/tutor/step', async (req, res) => {
  try {
    const { topic, stepTitle, stepNumber, totalSteps } = req.body;

    const prompt = `Create a micro-lesson for Step ${stepNumber} of ${totalSteps}: "${stepTitle}" in "${topic}".
Format as JSON:
{
  "stepNumber": ${stepNumber},
  "title": "${stepTitle}",
  "content": "Explanation in 150-250 words with markdown bolding...",
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
  "analogy": "A simple real-world analogy...",
  "checkQuestions": [
    {
      "id": "q1",
      "question": "Question text...",
      "correctAnswer": "Exact correct answer...",
      "explanation": "Clear explanation...",
      "hint": "Helpful hint..."
    }
  ]
}`;

    const data = await callAIJSON(prompt, SYSTEM_PROMPT_TUTOR);

    if (data && data.content && data.keyTakeaways) {
      return res.json(data);
    }

    return res.json({
      stepNumber: stepNumber || 1,
      title: stepTitle || `Understanding ${topic}`,
      content: `Welcome to Step ${stepNumber || 1}! In this step, we focus on **${stepTitle}**. Think of this like building blocks: every complex concept rests on a simple, predictable foundation. Notice how key elements interact systematically to deliver predictable results.`,
      keyTakeaways: [
        `Key concept 1: ${stepTitle} establishes core definitions`,
        'Key concept 2: Components work together through structured rules',
        'Key concept 3: Mastery requires recognizing common patterns in practice',
      ],
      analogy: `Imagine ${stepTitle} like a postal system sorting letters by zip code — each message follows a clear path to reach its exact target!`,
      checkQuestions: [
        {
          id: `q_${Date.now()}_1`,
          question: `What is the primary function of ${stepTitle}?`,
          correctAnswer: `To establish structured guidelines and rules for ${topic}`,
          explanation: `By providing clear rules, ${stepTitle} ensures seamless operations across the system.`,
          hint: `Think about how rules prevent confusion in complex systems!`,
        },
      ],
    });
  } catch (err: any) {
    console.error('Error generating step lesson:', err);
    res.status(500).json({ error: err.message || 'Failed to generate step lesson' });
  }
});

// API: Explain Differently
app.post('/api/tutor/explain-differently', async (req, res) => {
  try {
    const { conceptTitle, style } = req.body;

    const styleInstructions =
      style === 'analogy'
        ? 'Use a vivid, everyday real-world analogy (e.g. airport, kitchen, traffic light).'
        : style === 'visual'
        ? 'Provide a step-by-step text/ASCII breakdown showing inputs, processes, and outputs.'
        : 'Provide a real-world engineering or practical case study example.';

    const prompt = `Explain "${conceptTitle}" using an alternative teaching style: ${style.toUpperCase()}.
${styleInstructions} Keep it engaging, encouraging, and under 200 words.`;

    const explanation = await callAIText(prompt, SYSTEM_PROMPT_TUTOR);

    if (explanation) {
      return res.json({ style, explanation });
    }

    return res.json({
      style,
      explanation: `Here is a fresh look at **${conceptTitle}** using a ${style} perspective:
Imagine a sports referee managing a fast-paced game. Instead of memorizing rules blindly, focus on why the rule exists — to keep play fair and flowing. In ${conceptTitle}, every component acts like a teammate passing the ball directly to the next player!`,
    });
  } catch (err: any) {
    console.error('Error in explain differently:', err);
    res.status(500).json({ error: err.message });
  }
});

// API: Diagnose -> Repair -> Recall Engine
app.post('/api/tutor/diagnose-repair', async (req, res) => {
  try {
    const { conceptTitle, question, studentAnswer, correctAnswer } = req.body;

    const prompt = `Analyze the student's wrong answer for concept "${conceptTitle}".
Question: "${question}"
Correct Answer: "${correctAnswer}"
Student Answer: "${studentAnswer}"

Return JSON:
{
  "errorType": "Careless mistake" OR "Misconception" OR "Knowledge gap",
  "diagnosticExplanation": "1-2 sentence friendly explanation why they got it wrong...",
  "microRepairContent": "100-word targeted micro-repair lesson...",
  "recallChallenge": {
    "id": "recall_1",
    "question": "New mini recall question...",
    "correctAnswer": "Exact answer...",
    "explanation": "Brief explanation..."
  }
}`;

    const data = await callAIJSON(prompt, SYSTEM_PROMPT_TUTOR);

    if (data && data.diagnosticExplanation && data.recallChallenge) {
      return res.json(data);
    }

    return res.json({
      errorType: 'Misconception',
      diagnosticExplanation: `You were close! You answered "${studentAnswer}", but the correct answer is "${correctAnswer}". This looks like a misconception where two related concepts were swapped.`,
      microRepairContent: `💡 **3-Minute Repair**: Focus on the core distinction! Remember that inputs dictate the pathway, while the protocol governs execution. Let's lock this in before moving on.`,
      recallChallenge: {
        id: `recall_${Date.now()}`,
        question: `Now that we clarified ${conceptTitle}, which rule directly controls execution?`,
        correctAnswer: correctAnswer,
        explanation: `Spot on! You fixed the gap!`,
      },
    });
  } catch (err: any) {
    console.error('Error in diagnose repair:', err);
    res.status(500).json({ error: err.message });
  }
});

// API: Study Priority Summary
app.post('/api/tutor/summary', async (req, res) => {
  try {
    const { topic } = req.body;

    const prompt = `Generate an end-of-topic Study Priority Summary for: "${topic}".
Return JSON:
{
  "highYieldTopics": [{ "title": "...", "reason": "..." }],
  "mediumYieldTopics": [{ "title": "...", "reason": "..." }],
  "lowYieldTopics": [{ "title": "...", "reason": "..." }],
  "nightBeforeChecklist": ["Checklist item 1", "Checklist item 2", "Checklist item 3"]
}`;

    const data = await callAIJSON(prompt, SYSTEM_PROMPT_TUTOR);

    if (data && data.highYieldTopics && data.nightBeforeChecklist) {
      return res.json(data);
    }

    return res.json({
      highYieldTopics: [
        { title: `${topic} Core Principles & Protocols`, reason: 'Tested in >80% of exams' },
        { title: 'Key Definitions & Formulas', reason: 'Frequently appears in short answer questions' },
      ],
      mediumYieldTopics: [
        { title: 'Sub-component Interactions', reason: 'Useful for multi-part synthesis problems' },
      ],
      lowYieldTopics: [
        { title: 'Historical background & legacy versions', reason: 'Rarely tested on exams' },
      ],
      nightBeforeChecklist: [
        `Review the 3 core formulas/definitions for ${topic}`,
        'Practice 2 diagram drawing questions',
        'Self-quiz on key terminology',
      ],
    });
  } catch (err: any) {
    console.error('Error generating summary:', err);
    res.status(500).json({ error: err.message });
  }
});

// API: Assessment Quiz Generator
app.post('/api/assess/generate', async (req, res) => {
  try {
    const { topic, questionCount = 4 } = req.body;

    const prompt = `Generate an assessment quiz with ${questionCount} questions for "${topic}".
Mix of multiple choice (mcq), short answer (short_answer), and calculation/numeric (code_numeric).
Return JSON:
{
  "topic": "${topic}",
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "question": "Question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why Option A is correct...",
      "topic": "${topic}",
      "points": 25
    }
  ]
}`;

    const data = await callAIJSON(prompt, SYSTEM_PROMPT_TUTOR);

    if (data && data.questions && Array.isArray(data.questions)) {
      return res.json(data);
    }

    return res.json({
      topic,
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: `Which of the following best defines the primary purpose of ${topic}?`,
          options: [
            `To provide structured communication and resource sharing`,
            'To eliminate hardware bandwidth limits',
            'To encrypt all network packets by default',
            'To replace server databases',
          ],
          correctAnswer: 'To provide structured communication and resource sharing',
          explanation: 'It organizes resources and data transmission efficiently.',
          topic: topic,
          points: 25,
        },
        {
          id: 'q2',
          type: 'short_answer',
          question: `In 1-2 sentences, explain how components interact in ${topic}.`,
          correctAnswer: 'Components follow specific layer protocols to transmit data packages sequentially.',
          explanation: 'Components rely on protocol agreements at each stage.',
          topic: topic,
          points: 25,
        },
        {
          id: 'q3',
          type: 'code_numeric',
          question: `Calculate the maximum number of usable host addresses in a /28 subnet (255.255.255.240).`,
          correctAnswer: '14',
          explanation: 'A /28 subnet has 32 - 28 = 4 host bits. 2^4 = 16 addresses. Subtracting 2 (network & broadcast) leaves 14 usable hosts.',
          topic: topic,
          points: 25,
        },
      ],
    });
  } catch (err: any) {
    console.error('Error generating quiz:', err);
    res.status(500).json({ error: err.message });
  }
});

// API: Document / PDF Summarizer
app.post('/api/summarize/pdf', async (req, res) => {
  try {
    const { text, fileName } = req.body;

    const prompt = `Analyze this study text from "${fileName}":
"${text.substring(0, 3500)}"

Return JSON:
{
  "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
  "flashcards": [
    { "front": "Question...", "back": "Answer..." }
  ],
  "suggestedRoadmap": [
    { "id": "step_1", "stepNumber": 1, "title": "...", "summary": "...", "estimatedMinutes": 5 }
  ]
}`;

    const data = await callAIJSON(prompt, SYSTEM_PROMPT_TUTOR);

    if (data && data.keyPoints) {
      return res.json({
        id: `pdf_${Date.now()}`,
        fileName: fileName || 'Uploaded_Document.pdf',
        fileSize: `${Math.max(1, Math.round((text.length * 0.75) / 1024))} KB`,
        extractedTextPreview: text.substring(0, 300) + '...',
        keyPoints: data.keyPoints || [],
        flashcards: data.flashcards || [],
        suggestedRoadmap: (data.suggestedRoadmap || []).map((s: any, idx: number) => ({
          ...s,
          status: idx === 0 ? 'current' : 'locked',
        })),
        uploadedAt: new Date().toISOString().split('T')[0],
      });
    }

    return res.json({
      id: `pdf_${Date.now()}`,
      fileName: fileName || 'Uploaded_Study_Notes.pdf',
      fileSize: '1.4 MB',
      extractedTextPreview: text ? text.substring(0, 300) + '...' : 'Extracted core notes on computer systems and protocols.',
      keyPoints: [
        'Core Concept 1: Hierarchical layered architecture simplifies complex system design.',
        'Core Concept 2: Protocols govern request handshakes and data serialization.',
        'Core Concept 3: Error checking at the data link layer prevents packet corruption.',
        'Core Concept 4: Latency and bandwidth dictate real-time system performance.',
      ],
      flashcards: [
        { front: `What is the main takeaway from ${fileName || 'this document'}?`, back: 'Layered protocol design enables modular upgrades without breaking system compatibility.' },
        { front: 'Why is error checking essential in network transmission?', back: 'It detects bit flips and lost packets, triggering retransmission requests.' },
      ],
      suggestedRoadmap: [
        { id: 'step_1', stepNumber: 1, title: 'Document Foundations & Terminology', summary: 'Basic principles from document', estimatedMinutes: 5, status: 'current' },
        { id: 'step_2', stepNumber: 2, title: 'Core Mechanics & Frameworks', summary: 'Detailed workflow breakdown', estimatedMinutes: 7, status: 'locked' },
        { id: 'step_3', stepNumber: 3, title: 'Key Applications & Practice Cases', summary: 'Exam-focused problem solving', estimatedMinutes: 8, status: 'locked' },
      ],
      uploadedAt: new Date().toISOString().split('T')[0],
    });
  } catch (err: any) {
    console.error('Error summarizing document:', err);
    res.status(500).json({ error: err.message });
  }
});

// API: Career Guidance & Skill Gap Analyzer
app.post('/api/career/analyze', async (req, res) => {
  try {
    const { roleTitle, masteredConcepts = [] } = req.body;

    const prompt = `Perform a skill-gap analysis for a student targeting "${roleTitle}".
Mastered topics: ${JSON.stringify(masteredConcepts)}.

Return JSON:
{
  "roleTitle": "${roleTitle}",
  "matchPercentage": 78,
  "masteredSkills": ["Skill 1", "Skill 2"],
  "missingSkills": [
    { "name": "...", "topicToLearn": "..." }
  ],
  "interviewQuestions": [
    {
      "id": "iq1",
      "question": "...",
      "context": "...",
      "idealAnswerSample": "..."
    }
  ]
}`;

    const data = await callAIJSON(prompt, SYSTEM_PROMPT_TUTOR);

    if (data && data.missingSkills && data.interviewQuestions) {
      return res.json(data);
    }

    return res.json({
      roleTitle,
      matchPercentage: 72,
      masteredSkills: masteredConcepts.length > 0 ? masteredConcepts : ['Computer Networks Basics', 'Big-O Complexity'],
      missingSkills: [
        { name: 'Advanced Subnetting & CIDR', topicToLearn: 'Subnetting & IPv4 addressing' },
        { name: 'System Design & Load Balancers', topicToLearn: 'DNS & HTTP/HTTPS Security' },
      ],
      interviewQuestions: [
        {
          id: 'iq1',
          question: `What happens when you type google.com in a browser and hit enter?`,
          context: 'Classic networking & system design question for Engineers.',
          idealAnswerSample: 'DNS lookup resolves domain to IP -> TCP 3-way handshake -> TLS negotiation -> HTTP GET request -> Server processes response.',
        },
      ],
    });
  } catch (err: any) {
    console.error('Error analyzing career gap:', err);
    res.status(500).json({ error: err.message });
  }
});

// Vite Middleware Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduMind AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
