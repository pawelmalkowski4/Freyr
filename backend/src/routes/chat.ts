import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../gemini';
import { generateContent } from '../gemini';
import { chatSystemPrompt, chatContextBlock } from '../prompts';
import { chatRequest } from '../schemas';

export const chatRoute = new Hono<{ Bindings: Env }>().post(
  '/',
  zValidator('json', chatRequest),
  async (c) => {
    const { message, mode, history, plant, sensors } = c.req.valid('json');

    const system = chatSystemPrompt(mode);
    const contextBlock = chatContextBlock({ plant, sensors });
    const systemText = contextBlock ? `${system}\n\nKontekst:\n${contextBlock}` : system;

    const contents = [
      ...(history ?? []).map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      })),
      { role: 'user' as const, parts: [{ text: message }] },
    ];

    const reply = await generateContent(c.env, {
      systemInstruction: { parts: [{ text: systemText }] },
      contents,
      temperature: mode === 'saga' ? 0.85 : 0.4,
    });

    return c.json({ reply: reply.trim() });
  },
);
