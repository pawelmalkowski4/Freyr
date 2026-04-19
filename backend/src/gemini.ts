export type Env = {
  APP_NAME: string;
  GEMINI_MODEL: string;
  GEMINI_API_KEY?: string;
};

type Part =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

type Content = { role?: 'user' | 'model'; parts: Part[] };

type GenerateParams = {
  contents: Content[];
  systemInstruction?: { parts: { text: string }[] };
  responseSchema?: unknown;
  temperature?: number;
};

type GeminiResponse = {
  candidates?: {
    content?: { parts?: { text?: string }[] };
    finishReason?: string;
  }[];
  error?: { message?: string; code?: number };
  promptFeedback?: { blockReason?: string };
};

export class GeminiError extends Error {
  status: number;
  detail: unknown;
  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

const TIMEOUT_MS = 30_000;

export async function generateContent(env: Env, params: GenerateParams): Promise<string> {
  if (!env.GEMINI_API_KEY) {
    throw new GeminiError('GEMINI_API_KEY nie jest ustawiony na serwerze.', 500);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

  const body: Record<string, unknown> = {
    contents: params.contents,
  };
  if (params.systemInstruction) body.systemInstruction = params.systemInstruction;

  const generationConfig: Record<string, unknown> = {};
  if (params.responseSchema) {
    generationConfig.responseMimeType = 'application/json';
    generationConfig.responseSchema = params.responseSchema;
  }
  if (typeof params.temperature === 'number') {
    generationConfig.temperature = params.temperature;
  }
  if (Object.keys(generationConfig).length > 0) {
    body.generationConfig = generationConfig;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new GeminiError('Gemini timeout — spróbuj ponownie.', 504);
    }
    throw new GeminiError('Nie udało się połączyć z Gemini.', 502, String(err));
  } finally {
    clearTimeout(timer);
  }

  const data = (await response.json().catch(() => null)) as GeminiResponse | null;

  if (!response.ok) {
    const msg = data?.error?.message ?? `Gemini HTTP ${response.status}`;
    throw new GeminiError(msg, response.status >= 500 ? 502 : 400, data);
  }

  if (data?.promptFeedback?.blockReason) {
    throw new GeminiError(
      `Gemini odrzucił zapytanie: ${data.promptFeedback.blockReason}`,
      400,
      data.promptFeedback,
    );
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== 'string' || text.length === 0) {
    throw new GeminiError('Gemini nie zwrócił treści.', 502, data);
  }

  return text;
}

export function parseJsonResponse<T>(raw: string): T {
  const cleaned = raw
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new GeminiError('Gemini zwrócił niepoprawny JSON.', 502, raw);
  }
}
