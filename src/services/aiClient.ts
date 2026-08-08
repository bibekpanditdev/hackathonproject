// src/services/aiClient.ts
//
// Single shared client for calling Groq (primary) and NVIDIA NIM (fallback),
// both OpenAI-compatible chat completion APIs. Every AI-backed feature in the
// app (tutor roadmap/lessons/quizzes/career guidance in api.ts, and the
// mindmap/workflow visualizer in aiVisualService.ts) goes through this one
// module instead of each re-implementing its own fetch + fallback logic.
//
// Env vars (Vite — must be prefixed VITE_ to be readable in the browser):
//   VITE_GROQ_API_KEY,   VITE_GROQ_BASE_URL,   VITE_GROQ_MODEL
//   VITE_NVIDIA_API_KEY, VITE_NVIDIA_BASE_URL, VITE_NVIDIA_MODEL
//
// Behavior: tries Groq first. On ANY failure (bad/missing key, rate limit,
// network error, non-2xx response) it automatically retries the exact same
// request against NVIDIA. Only throws once every configured provider has
// failed — callers (api.ts, aiVisualService.ts) catch that and fall back to
// static demo content so the UI never hard-breaks.
//
// Security note: these calls run in the browser, so API keys are visible in
// the network tab. That's fine for prototyping; before shipping publicly,
// move this fetch behind a small serverless function / Firebase Cloud
// Function and keep the keys server-side.
interface ImportMetaEnv {
  readonly VITE_GROQ_API_KEY?: string;
  readonly VITE_GROQ_BASE_URL?: string;
  readonly VITE_GROQ_MODEL?: string;
  readonly VITE_NVIDIA_API_KEY?: string;
  readonly VITE_NVIDIA_BASE_URL?: string;
  readonly VITE_NVIDIA_MODEL?: string;
  readonly [key: string]: string | boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface ProviderConfig {
  name: 'groq' | 'nvidia';
  baseUrl: string;
  model: string;
  apiKey?: string;
}

function getEnvValue(...keys: string[]): string | undefined {
  const metaEnv = ((import.meta as any).env || {}) as Record<string, string | boolean | undefined>;
  const procEnv = (typeof process !== 'undefined' && process.env ? process.env : {}) as Record<string, string | undefined>;

  for (const key of keys) {
    const value = metaEnv[key] ?? procEnv[key];
    if (typeof value === 'string' && value.trim() !== '') {
      return value;
    }
  }

  return undefined;
}

function getProviders(): ProviderConfig[] {
  const groqKey = getEnvValue('VITE_GROQ_API_KEY', 'GROQ_API_KEY');
  const groqBase = getEnvValue('VITE_GROQ_BASE_URL', 'GROQ_BASE_URL') || 'https://api.groq.com/openai/v1';
  const customGroqModel = getEnvValue('VITE_GROQ_MODEL', 'GROQ_MODEL');

  const nvidiaKey = getEnvValue('VITE_NVIDIA_API_KEY', 'NVIDIA_API_KEY');
  const nvidiaBase = getEnvValue('VITE_NVIDIA_BASE_URL', 'NVIDIA_BASE_URL') || 'https://integrate.api.nvidia.com/v1';
  const customNvidiaModel = getEnvValue('VITE_NVIDIA_MODEL', 'NVIDIA_MODEL') || 'meta/llama-3.3-70b-instruct';

  const providers: ProviderConfig[] = [];

  if (groqKey) {
    const groqModels = customGroqModel
      ? [customGroqModel, 'llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'mixtral-8x7b-32768']
      : ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'mixtral-8x7b-32768'];

    // Deduplicate models preserving order
    const uniqueGroqModels = Array.from(new Set(groqModels));

    for (const model of uniqueGroqModels) {
      providers.push({
        name: 'groq',
        baseUrl: groqBase,
        model,
        apiKey: groqKey,
      });
    }
  }

  if (nvidiaKey) {
    providers.push({
      name: 'nvidia',
      baseUrl: nvidiaBase,
      model: customNvidiaModel,
      apiKey: nvidiaKey,
    });
  }

  return providers;
}

export interface CallOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  /** Prior conversation turns to include before the final user message. */
  history?: ChatMessage[];
}

async function callProvider(
  provider: ProviderConfig,
  systemPrompt: string,
  userContent: string,
  options: CallOptions
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...(options.history || []),
    { role: 'user', content: userContent },
  ];

  const res = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1200,
      ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`${provider.name} error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error(`${provider.name} returned an empty response`);
  return content;
}

/**
 * Calls Groq first; falls back to NVIDIA on any failure. Throws only if
 * every configured provider fails.
 */
export async function chatComplete(
  systemPrompt: string,
  userContent: string,
  options: CallOptions = {}
): Promise<string> {
  const providers = getProviders().filter((p) => !!p.apiKey);

  if (providers.length === 0) {
    throw new Error(
      'No AI provider configured. Set VITE_GROQ_API_KEY and/or VITE_NVIDIA_API_KEY in your .env file.'
    );
  }

  let lastError: Error | null = null;

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    const isLast = i === providers.length - 1;
    try {
      return await callProvider(provider, systemPrompt, userContent, options);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(
        `[aiClient] ${provider.name} failed${isLast ? '' : ', falling back to next provider...'}:`,
        lastError.message
      );
    }
  }

  throw lastError || new Error('All AI providers failed');
}

/** Strips markdown code fences and parses a JSON string returned by the model. */
export function extractJson<T = any>(raw: string): T {
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned) as T;
}

/**
 * Same as chatComplete, but requests JSON mode and parses the result.
 * If the model returns malformed JSON, retries once with a stricter nudge
 * before giving up.
 */
export async function chatCompleteJson<T = any>(
  systemPrompt: string,
  userContent: string,
  options: CallOptions = {}
): Promise<T> {
  const raw = await chatComplete(systemPrompt, userContent, { ...options, jsonMode: true });

  try {
    return extractJson<T>(raw);
  } catch {
    const retryRaw = await chatComplete(
      systemPrompt,
      `${userContent}\n\nYour previous reply was not valid JSON. Reply again with ONLY the JSON object, nothing else.`,
      { ...options, jsonMode: true, temperature: 0.2 }
    );
    return extractJson<T>(retryRaw);
  }
}
