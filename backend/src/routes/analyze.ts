import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../gemini';
import { generateContent, parseJsonResponse } from '../gemini';
import { analyzePrompt } from '../prompts';
import { analyzeRequest, analyzeResponseSchema, type AnalyzeResponse } from '../schemas';

const detectMime = (b64: string): string => {
  if (b64.startsWith('/9j/')) return 'image/jpeg';
  if (b64.startsWith('iVBORw0KGgo')) return 'image/png';
  if (b64.startsWith('UklGR')) return 'image/webp';
  return 'image/jpeg';
};

export const analyzeRoute = new Hono<{ Bindings: Env }>().post(
  '/',
  zValidator('json', analyzeRequest),
  async (c) => {
    const body = c.req.valid('json');

    const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [
      { text: analyzePrompt(body) },
    ];
    if (body.photo) {
      const stripped = body.photo.includes(',') ? body.photo.slice(body.photo.indexOf(',') + 1) : body.photo;
      parts.push({ inlineData: { mimeType: detectMime(stripped), data: stripped } });
    }

    const text = await generateContent(c.env, {
      contents: [
        {
          role: 'user',
          parts,
        },
      ],
      responseSchema: analyzeResponseSchema,
      temperature: body.mode === 'saga' ? 0.8 : 0.3,
    });

    const parsed = parseJsonResponse<AnalyzeResponse>(text);
    return c.json(parsed);
  },
);
