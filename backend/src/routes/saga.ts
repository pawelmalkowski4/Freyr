import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../gemini';
import { generateContent, parseJsonResponse } from '../gemini';
import { sagaPrompt } from '../prompts';
import { sagaRequest, sagaResponseSchema, type SagaResponse } from '../schemas';

export const sagaRoute = new Hono<{ Bindings: Env }>().post(
  '/',
  zValidator('json', sagaRequest),
  async (c) => {
    const body = c.req.valid('json');

    const text = await generateContent(c.env, {
      contents: [
        {
          role: 'user',
          parts: [{ text: sagaPrompt(body) }],
        },
      ],
      responseSchema: sagaResponseSchema,
      temperature: 0.9,
    });

    const parsed = parseJsonResponse<SagaResponse>(text);
    return c.json(parsed);
  },
);
