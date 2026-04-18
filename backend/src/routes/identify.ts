import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../gemini';
import { generateContent, parseJsonResponse } from '../gemini';
import { identifyPrompt } from '../prompts';
import { identifyRequest, identifyResponseSchema, type IdentifyResponse } from '../schemas';

const detectMime = (b64: string): string => {
  if (b64.startsWith('/9j/')) return 'image/jpeg';
  if (b64.startsWith('iVBORw0KGgo')) return 'image/png';
  if (b64.startsWith('UklGR')) return 'image/webp';
  return 'image/jpeg';
};

export const identifyRoute = new Hono<{ Bindings: Env }>().post(
  '/',
  zValidator('json', identifyRequest),
  async (c) => {
    const { image } = c.req.valid('json');
    const stripped = image.includes(',') ? image.slice(image.indexOf(',') + 1) : image;
    const mimeType = detectMime(stripped);

    const text = await generateContent(c.env, {
      contents: [
        {
          role: 'user',
          parts: [
            { text: identifyPrompt() },
            { inlineData: { mimeType, data: stripped } },
          ],
        },
      ],
      responseSchema: identifyResponseSchema,
      temperature: 0.2,
    });

    const parsed = parseJsonResponse<IdentifyResponse>(text);

    if (parsed.common_name_old_norse === undefined) {
      parsed.common_name_old_norse = null;
    }

    return c.json(parsed);
  },
);
