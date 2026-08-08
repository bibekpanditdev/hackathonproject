// src/services/api.ts
//
// Powers the Sequential Tutor, Assessment Center, PDF Summarizer, and Career
// Guidance features. Every function calls the shared Groq -> NVIDIA client
// (see ./aiClient.ts) to generate real content, and only falls back to
// static demo content if BOTH providers fail (no key configured, both rate
// limited, offline, etc.) so the UI never hard-breaks.

import { chatComplete, chatCompleteJson } from './aiClient';
import {
  RoadmapStep,
  MicroLesson,
  RepairLesson,
  StudyPrioritySummary,
  AssessmentQuestion,
  PdfSummary,
} from '../types';

const JSON_ONLY = 'Respond ONLY with raw JSON. No markdown code fences, no commentary, no preamble.';

export async function fetchRoadmap(topic: string): Promise<{ topic: string; roadmap: RoadmapStep[] }> {
  try {
    const parsed = await chatCompleteJson<{ roadmap: any[] }>(
      `You are an expert curriculum designer. ${JSON_ONLY}`,
      `Create a 5-step learning roadmap for the topic: "${topic}".
Return JSON in exactly this shape:
{ "roadmap": [ { "stepNumber": number, "title": string, "summary": string, "estimatedMinutes": number } ] }
Exactly 5 steps, ordered from foundational to advanced, ending with an exam/review step.`,
      { temperature: 0.6, maxTokens: 800 }
    );

    return {
      topic,
      roadmap: (parsed.roadmap || []).map((step: any, idx: number) => ({
        id: `step_${idx + 1}`,
        stepNumber: step.stepNumber || idx + 1,
        title: step.title,
        summary: step.summary,
        estimatedMinutes: step.estimatedMinutes || 5,
        status: idx === 0 ? 'current' : 'locked',
      })),
    };
  } catch (err) {
    console.warn('AI roadmap generation failed, using offline fallback:', err);
    return {
      topic,
      roadmap: [
        { id: 'step_1', stepNumber: 1, title: `What is ${topic}?`, summary: `Foundational concepts and scope of ${topic}`, estimatedMinutes: 5, status: 'current' },
        { id: 'step_2', stepNumber: 2, title: 'Core Architectural Layers', summary: 'System components and interaction rules', estimatedMinutes: 7, status: 'locked' },
        { id: 'step_3', stepNumber: 3, title: 'Key Workflows & Protocol Flow', summary: 'Step-by-step execution patterns', estimatedMinutes: 8, status: 'locked' },
        { id: 'step_4', stepNumber: 4, title: 'Common Edge Cases & Problem Solving', summary: 'Diagnostic scenarios and exam practice', estimatedMinutes: 10, status: 'locked' },
        { id: 'step_5', stepNumber: 5, title: 'Study Priority & High-Yield Summary', summary: 'Key exam review & night-before checklist', estimatedMinutes: 5, status: 'locked' },
      ],
    };
  }
}

export async function fetchMicroLesson(
  topic: string,
  stepTitle: string,
  stepNumber: number,
  totalSteps: number
): Promise<MicroLesson> {
  try {
    const data = await chatCompleteJson<any>(
      `You are a friendly, precise tutor. ${JSON_ONLY}`,
      `Write a micro-lesson for step ${stepNumber} of ${totalSteps} on the topic "${topic}", specifically covering "${stepTitle}".
Return JSON in exactly this shape:
{
  "content": string,          // 150-250 words, markdown ** for bold allowed
  "keyTakeaways": string[],   // exactly 3 short bullet points
  "analogy": string,          // one real-world analogy
  "checkQuestions": [ { "question": string, "options": string[], "correctAnswer": string, "explanation": string, "hint": string } ]
}`,
      { temperature: 0.7, maxTokens: 900 }
    );

    return {
      stepId: `step_${stepNumber}`,
      stepNumber,
      title: stepTitle,
      content: data.content,
      keyTakeaways: data.keyTakeaways || [],
      analogy: data.analogy || '',
      checkQuestions: (data.checkQuestions || []).map((q: any, i: number) => {
        const correctAnswer = q.correctAnswer || `Primary function of ${stepTitle}`;
        let options = Array.isArray(q.options) && q.options.length >= 2 ? q.options : null;
        if (!options) {
          options = [
            correctAnswer,
            `Alternative concept in ${topic}`,
            `Secondary mechanism of ${stepTitle}`,
            `Opposite approach to ${stepTitle}`,
          ];
        }
        if (!options.includes(correctAnswer)) {
          options[0] = correctAnswer;
        }

        return {
          id: `q_${Date.now()}_${i}`,
          ...q,
          correctAnswer,
          options,
        };
      }),
    };
  } catch (err) {
    console.warn('AI micro-lesson generation failed, using offline fallback:', err);
    return {
      stepId: `step_${stepNumber}`,
      stepNumber,
      title: stepTitle,
      content: `Welcome to **${stepTitle}**! In this step of **${topic}**, we focus on understanding how individual components fit into the larger architecture. Always remember: complex systems are simply small, well-defined rules stacked together.`,
      keyTakeaways: [
        `${stepTitle} establishes core communication rules`,
        'Every component plays a distinct role in processing information',
        'Mastering this concept makes advanced topics much easier to solve',
      ],
      analogy: `Think of ${stepTitle} like a relay race team — each runner passes the baton precisely to the next without dropping it!`,
      checkQuestions: [
        {
          id: `q_${Date.now()}_1`,
          question: `What is the primary objective of ${stepTitle}?`,
          options: [
            `To coordinate data or process flow predictably in ${topic}`,
            `To bypass system security controls entirely`,
            `To eliminate bandwidth monitoring`,
            `To modify physical hardware addresses`,
          ],
          correctAnswer: `To coordinate data or process flow predictably in ${topic}`,
          explanation: `By establishing clear parameters, ${stepTitle} ensures seamless operation without confusion.`,
          hint: 'Consider how rules keep systems organized!',
        },
      ],
    };
  }
}

export async function fetchAlternateExplanation(
  conceptTitle: string,
  style: 'analogy' | 'visual' | 'case_study'
): Promise<string> {
  const styleInstruction =
    style === 'analogy'
      ? 'Use a vivid, everyday-life analogy.'
      : style === 'visual'
      ? "Describe it in a way that's easy to picture, step by step, as if walking through a diagram."
      : 'Explain it through a short realistic case study or scenario.';

  try {
    const explanation = await chatComplete(
      'You are a tutor who explains concepts in fresh, memorable ways. Respond with plain text only, 3-5 sentences, no markdown fences.',
      `Explain the concept "${conceptTitle}" in a completely different way than a standard textbook definition. ${styleInstruction}`,
      { temperature: 0.8, maxTokens: 300 }
    );
    return explanation.trim();
  } catch (err) {
    console.warn('AI alternate explanation failed, using offline fallback:', err);
    return `Here is a fresh way to visualize **${conceptTitle}** (${style}): Imagine a busy coffee shop during morning rush hour. Order placement (Input) -> Barista brewing (Processing) -> Name called at counter (Output). Every step is distinct and synchronized!`;
  }
}

export async function fetchDiagnoseRepair(
  conceptTitle: string,
  question: string,
  studentAnswer: string,
  correctAnswer: string
): Promise<RepairLesson> {
  try {
    const data = await chatCompleteJson<any>(
      `You are a diagnostic tutor who identifies WHY a student got something wrong and gives a fast, targeted repair using active recall and spaced repetition techniques. ${JSON_ONLY}`,
      `Concept: "${conceptTitle}"
Question: "${question}"
Student's answer: "${studentAnswer}"
Correct answer: "${correctAnswer}"

Diagnose the error and return JSON in exactly this shape:
{
  "errorType": "Careless mistake" | "Misconception" | "Knowledge gap",
  "diagnosticExplanation": string,
  "microRepairContent": string,
  "activeRecallTips": string[],
  "improvementFormula": string,
  "recallChallenge": { "question": string, "correctAnswer": string, "explanation": string }
}

Rules:
- "diagnosticExplanation": Explain WHY the student got it wrong, what cognitive bias or gap led to the error.
- "microRepairContent": A 3-minute targeted repair lesson with key formulas, mnemonics, or visual cues.
- "activeRecallTips": 3-4 specific active recall strategies for this exact concept (e.g. "Cover the answer and try to recall from memory", "Draw the diagram without looking", "Explain the concept to someone else in 30 seconds", "Write the formula 3 times from memory").
- "improvementFormula": A step-by-step formula like "Step 1: Read the definition → Step 2: Close the book → Step 3: Write it from memory → Step 4: Compare → Step 5: Repeat in 24 hours". Make it specific to this concept.
- "recallChallenge": A follow-up question to verify the student understood the repair.`,
      { temperature: 0.6, maxTokens: 1000 }
    );

    return {
      errorType: data.errorType || 'Misconception',
      diagnosticExplanation: data.diagnosticExplanation || `You answered "${studentAnswer}" but the correct answer was "${correctAnswer}".`,
      microRepairContent: data.microRepairContent || `Review the core definition of ${conceptTitle} and practice recalling it from memory.`,
      activeRecallTips: Array.isArray(data.activeRecallTips) && data.activeRecallTips.length > 0
        ? data.activeRecallTips
        : [
            'Cover the answer and try to recall the concept from memory before checking.',
            `Draw a diagram of ${conceptTitle} without looking at notes.`,
            'Explain this concept aloud in 30 seconds as if teaching a friend.',
            'Write the key formula/definition 3 times from memory, then compare.',
          ],
      improvementFormula: data.improvementFormula || `Step 1: Re-read the definition of ${conceptTitle} → Step 2: Close your notes → Step 3: Write the answer from memory → Step 4: Compare with the correct answer → Step 5: Repeat this in 24 hours for long-term retention.`,
      recallChallenge: {
        id: `recall_${Date.now()}`,
        question: data.recallChallenge?.question || `Now explain: What is the correct approach for ${conceptTitle}?`,
        correctAnswer: data.recallChallenge?.correctAnswer || correctAnswer,
        explanation: data.recallChallenge?.explanation || 'Excellent! You have locked in the repair!',
      },
    };
  } catch (err) {
    console.warn('AI diagnose-repair failed, using offline fallback:', err);
    return {
      errorType: 'Misconception',
      diagnosticExplanation: `You selected "${studentAnswer}". The correct answer is "${correctAnswer}". This is a common misconception where two related concepts are confused.`,
      microRepairContent: `💡 **3-Minute Micro Repair**: Remember the key distinction — in "${conceptTitle}", the correct principle is "${correctAnswer}". Use the mnemonic: take the first letter of each keyword and form an acronym to lock it in.`,
      activeRecallTips: [
        'Cover this answer and try to recall it from memory in 60 seconds.',
        `Sketch a quick mind-map of ${conceptTitle} without looking at any notes.`,
        'Teach this concept to an imaginary student — if you can explain it simply, you understand it.',
        'Write the correct answer 3 times from memory, then compare with the original.',
      ],
      improvementFormula: `Step 1: Re-read the correct answer above → Step 2: Close your eyes and repeat it → Step 3: Write it down from memory → Step 4: Check your written answer → Step 5: Set a reminder to review in 24 hours (spaced repetition).`,
      recallChallenge: {
        id: `recall_${Date.now()}`,
        question: `Which element governs the core mechanism in ${conceptTitle}?`,
        correctAnswer,
        explanation: 'Great job! You have successfully repaired the knowledge gap.',
      },
    };
  }
}

export async function fetchStudyPrioritySummary(topic: string): Promise<StudyPrioritySummary> {
  try {
    return await chatCompleteJson<StudyPrioritySummary>(
      `You are an exam-prep strategist. ${JSON_ONLY}`,
      `Create a study priority summary for the topic "${topic}".
Return JSON in exactly this shape:
{
  "highYieldTopics": [{ "title": string, "reason": string }],
  "mediumYieldTopics": [{ "title": string, "reason": string }],
  "lowYieldTopics": [{ "title": string, "reason": string }],
  "nightBeforeChecklist": string[]
}
2-3 high-yield items, 1-2 medium-yield items, 1 low-yield item, 3-5 checklist items.`,
      { temperature: 0.6, maxTokens: 700 }
    );
  } catch (err) {
    console.warn('AI study summary failed, using offline fallback:', err);
    return {
      highYieldTopics: [
        { title: `${topic} Core Principles & Formulas`, reason: 'Found on 85% of previous exam papers' },
        { title: 'Primary Architecture & Layer Roles', reason: 'High point value multi-part questions' },
      ],
      mediumYieldTopics: [{ title: 'Sub-protocol interactions', reason: 'Common in short answer & true/false sections' }],
      lowYieldTopics: [{ title: 'Historical origin dates & deprecated standards', reason: 'Rarely tested' }],
      nightBeforeChecklist: [
        `Review 3 main definitions for ${topic}`,
        'Practice drawing the core sequence diagram',
        'Complete a 5-question quick self-quiz',
      ],
    };
  }
}

export async function fetchFlashcards(topic: string, count: number = 6): Promise<import('../types').Flashcard[]> {
  try {
    const data = await chatCompleteJson<{ flashcards: { front: string; back: string }[] }>(
      `You are an expert tutor creating study flashcard decks. ${JSON_ONLY}`,
      `Create ${count} high-yield study flashcards for the topic: "${topic}".
Return JSON in exactly this shape:
{ "flashcards": [ { "front": string, "back": string } ] }
"front" should be a clear question or key concept. "back" should be a concise 1-2 sentence answer/explanation.`,
      { temperature: 0.7, maxTokens: 900 }
    );

    return (data.flashcards || []).map((fc: any, idx: number) => ({
      id: `fc_${Date.now()}_${idx}`,
      front: fc.front || `Core Concept ${idx + 1} of ${topic}`,
      back: fc.back || `Key takeaway regarding ${topic}.`,
      subjectId: 'ai',
      status: 'new' as const,
    }));
  } catch (err) {
    console.warn('AI flashcard generation failed, using fallback:', err);
    return [
      {
        id: `fc_${Date.now()}_1`,
        front: `What is the primary objective of ${topic}?`,
        back: `To establish structured rules and coordinate process flows in ${topic}.`,
        subjectId: 'ai',
        status: 'new' as const,
      },
      {
        id: `fc_${Date.now()}_2`,
        front: `Why is modular architecture important in ${topic}?`,
        back: `It isolates components so changes in one module do not break adjacent modules.`,
        subjectId: 'ai',
        status: 'new' as const,
      },
      {
        id: `fc_${Date.now()}_3`,
        front: `How do you verify operational reliability in ${topic}?`,
        back: `By checking output consistency against expected baseline specifications.`,
        subjectId: 'ai',
        status: 'new' as const,
      },
      {
        id: `fc_${Date.now()}_4`,
        front: `What is a common edge case in ${topic}?`,
        back: `Resource contention or race conditions under high concurrent loads.`,
        subjectId: 'ai',
        status: 'new' as const,
      },
    ];
  }
}

export async function generateQuiz(topic: string, questionCount: number = 4): Promise<AssessmentQuestion[]> {
  try {
    const data = await chatCompleteJson<{ questions: any[] }>(
      `You are an expert exam assessment writer. ${JSON_ONLY}`,
      `Write exactly ${questionCount} multiple-choice (MCQ) questions for the topic "${topic}".
Every question MUST be type "mcq" with exactly 4 options.
Return JSON in exactly this shape:
{
  "questions": [
    {
      "type": "mcq",
      "question": string,
      "options": [string, string, string, string],
      "correctAnswer": string,
      "explanation": string,
      "points": number
    }
  ]
}
Rules:
- Every question must have exactly 4 distinct options.
- One option must match "correctAnswer" exactly.
- Points per question should sum to 100.
- Make questions challenging and exam-relevant.`,
      { temperature: 0.7, maxTokens: 1500 }
    );

    return (data.questions || []).map((q: any, idx: number) => {
      const correctAnswer = q.correctAnswer || `Standard answer for ${topic}`;
      let options = Array.isArray(q.options) && q.options.length >= 4 ? q.options.slice(0, 4) : [
        correctAnswer,
        `Alternative concept in ${topic}`,
        `Secondary mechanism of ${topic}`,
        `Opposite approach to ${topic}`,
      ];

      if (!options.includes(correctAnswer)) {
        options[0] = correctAnswer;
      }

      return {
        id: `q_${Date.now()}_${idx}`,
        topic,
        type: 'mcq' as const,
        question: q.question || `Question ${idx + 1} regarding ${topic}`,
        options,
        correctAnswer,
        explanation: q.explanation || 'Detailed concept explanation.',
        points: q.points || Math.floor(100 / questionCount),
      };
    });
  } catch (err) {
    console.warn('AI quiz generation failed, using fallback:', err);
    const fallback: AssessmentQuestion[] = [];
    const templates = [
      { q: `What is the primary function of ${topic}?`, opts: [`To manage structured resources and communication in ${topic}`, 'To bypass physical hardware limits', 'To replace all server databases', 'To encrypt offline files'], a: `To manage structured resources and communication in ${topic}`, ex: 'It organizes resources and data transmission systematically.' },
      { q: `Which principle is most critical for reliability in ${topic}?`, opts: ['Redundancy and fault tolerance', 'Maximum throughput only', 'Single point of control', 'Aesthetic design'], a: 'Redundancy and fault tolerance', ex: 'Redundancy ensures the system remains operational even when individual components fail.' },
      { q: `What role do standardized protocols play in ${topic}?`, opts: ['They establish rules for data formatting and handshakes', 'They eliminate the need for hardware', 'They only apply to wireless systems', 'They slow down data transfer intentionally'], a: 'They establish rules for data formatting and handshakes', ex: 'Standardized rules ensure different systems can understand each other.' },
      { q: `Which architectural layer handles end-to-end reliability in ${topic}?`, opts: ['Transport Layer', 'Physical Layer', 'Data Link Layer', 'Presentation Layer'], a: 'Transport Layer', ex: 'The Transport Layer governs end-to-end flow control and error recovery.' },
    ];
    for (let i = 0; i < Math.min(questionCount, templates.length); i++) {
      const t = templates[i];
      fallback.push({ id: `q${i + 1}_${Date.now()}`, type: 'mcq', question: t.q, options: t.opts, correctAnswer: t.a, explanation: t.ex, topic, points: Math.floor(100 / questionCount) });
    }
    return fallback;
  }
}

export async function summarizePdf(text: string, fileName: string): Promise<PdfSummary> {
  const truncated = text.length > 12000 ? text.slice(0, 12000) : text;

  try {
    const data = await chatCompleteJson<{ keyPoints: string[]; flashcards: any[]; suggestedRoadmap: any[] }>(
      `You summarize study documents into structured study material. ${JSON_ONLY}`,
      `Summarize the following document text into study material.
Document text:
"""
${truncated}
"""
Return JSON in exactly this shape:
{
  "keyPoints": string[],
  "flashcards": [{ "front": string, "back": string }],
  "suggestedRoadmap": [ { "stepNumber": number, "title": string, "summary": string, "estimatedMinutes": number } ]
}
4-6 key points, 4-6 flashcards, exactly 3 roadmap steps.`,
      { temperature: 0.5, maxTokens: 1200 }
    );

    return {
      id: `pdf_${Date.now()}`,
      fileName: fileName || 'Uploaded_Document.pdf',
      fileSize: `${(text.length / 1024).toFixed(1)} KB`,
      extractedTextPreview: text.substring(0, 250) + '...',
      keyPoints: data.keyPoints,
      flashcards: data.flashcards,
      suggestedRoadmap: (data.suggestedRoadmap || []).map((s: any, idx: number) => ({
        id: `s${idx + 1}`,
        stepNumber: s.stepNumber || idx + 1,
        title: s.title,
        summary: s.summary,
        estimatedMinutes: s.estimatedMinutes || 5,
        status: idx === 0 ? 'current' : 'locked',
      })),
      uploadedAt: new Date().toISOString().split('T')[0],
    };
  } catch (err) {
    console.warn('AI PDF summarization failed, using offline fallback:', err);
    return {
      id: `pdf_${Date.now()}`,
      fileName: fileName || 'Uploaded_Document.pdf',
      fileSize: '1.2 MB',
      extractedTextPreview: text.substring(0, 250) + '...',
      keyPoints: [
        'Layered system design isolates changes and promotes modular software updates.',
        'Network bandwidth measures max capacity; latency measures transmission round-trip delay.',
        'Subnetting reduces broadcast domain sizes and conserves IP addresses.',
        'Public-key cryptography uses paired asymmetric keys for secure handshakes.',
      ],
      flashcards: [
        { front: 'What is the main advantage of modular layer design?', back: 'It allows changing one layer without needing to rebuild adjacent layers.' },
        { front: 'How is subnet mask calculated?', back: 'By setting network bits to 1s and host bits to 0s in binary notation.' },
      ],
      suggestedRoadmap: [
        { id: 's1', stepNumber: 1, title: 'Document Foundations', summary: 'Core terminology from document', estimatedMinutes: 5, status: 'current' },
        { id: 's2', stepNumber: 2, title: 'Core Mechanics', summary: 'Detailed workflow breakdown', estimatedMinutes: 7, status: 'locked' },
        { id: 's3', stepNumber: 3, title: 'Exam Review', summary: 'High-yield practice questions', estimatedMinutes: 5, status: 'locked' },
      ],
      uploadedAt: new Date().toISOString().split('T')[0],
    };
  }
}

export async function analyzeCareerGap(roleTitle: string, masteredConcepts: string[]): Promise<any> {
  const mastered = masteredConcepts.length > 0 ? masteredConcepts : ['Computer Networks Basics', 'Big-O Complexity'];

  try {
    const data = await chatCompleteJson<{ matchPercentage: number; missingSkills: any[]; interviewQuestions: any[] }>(
      `You are a career-readiness coach. ${JSON_ONLY}`,
      `A student wants to become a "${roleTitle}". They have already mastered: ${mastered.join(', ')}.
Return JSON in exactly this shape:
{
  "matchPercentage": number,
  "missingSkills": [{ "name": string, "topicToLearn": string }],
  "interviewQuestions": [ { "question": string, "context": string, "idealAnswerSample": string } ]
}
2-4 missing skills, 2 interview questions.`,
      { temperature: 0.6, maxTokens: 900 }
    );

    return {
      roleTitle,
      matchPercentage: data.matchPercentage,
      masteredSkills: mastered,
      missingSkills: data.missingSkills,
      interviewQuestions: (data.interviewQuestions || []).map((q: any, idx: number) => ({
        id: `iq${idx + 1}`,
        ...q,
      })),
    };
  } catch (err) {
    console.warn('AI career gap analysis failed, using offline fallback:', err);
    return {
      roleTitle,
      matchPercentage: 72,
      masteredSkills: mastered,
      missingSkills: [
        { name: 'Subnetting & IP Routing', topicToLearn: 'Subnetting & IPv4 addressing' },
        { name: 'System Design Principles', topicToLearn: 'DNS & HTTP/HTTPS Security' },
      ],
      interviewQuestions: [
        {
          id: 'iq1',
          question: 'How does TCP guarantee reliable delivery over an unreliable network?',
          context: 'Core backend engineering interview question.',
          idealAnswerSample: 'TCP uses sequence numbers, ACKs, checksums, timeout retransmissions, and flow control (sliding window).',
        },
      ],
    };
  }
}

export async function breakDownAssignment(taskTitle: string): Promise<string[]> {
  try {
    const data = await chatCompleteJson<{ subtasks: string[] }>(
      `You are an expert study strategist who breaks large academic tasks into clear, bite-sized actionable steps. ${JSON_ONLY}`,
      `Break down the following assignment into 3-4 actionable sub-tasks: "${taskTitle}".
Return JSON in exactly this shape:
{ "subtasks": [ string, string, string ] }`,
      { temperature: 0.6, maxTokens: 400 }
    );
    return Array.isArray(data.subtasks) && data.subtasks.length > 0
      ? data.subtasks
      : [
          `Phase 1: Research definitions and outline key requirements for ${taskTitle}`,
          `Phase 2: Draft main section and work through core practice problems`,
          `Phase 3: Final review, proofread, and verify accuracy`,
        ];
  } catch (err) {
    console.warn('AI task breakdown fallback:', err);
    return [
      `Phase 1: Gather notes and outline ${taskTitle}`,
      `Phase 2: Work through main sections and calculations`,
      `Phase 3: Final review and submission check`,
    ];
  }
}
