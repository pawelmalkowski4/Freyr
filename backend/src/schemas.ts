import { z } from 'zod';

// --- Request schemas (Zod) -------------------------------------------------

export const identifyRequest = z.object({
  image: z.string().min(32, 'Base64 image is too short'),
});

const rangeSchema = z.tuple([z.number(), z.number()]);

const optimalConditionsSchema = z.object({
  temperature_c: rangeSchema,
  humidity_pct: rangeSchema,
  light_lux: rangeSchema,
  soil_moisture_pct: rangeSchema,
});

const sensorSnapshotSchema = z
  .object({
    temperature_c: z.number().nullable().optional(),
    humidity_pct: z.number().nullable().optional(),
    light_lux: z.number().nullable().optional(),
    soil_moisture_pct: z.number().nullable().optional(),
  })
  .passthrough();

export const analyzeRequest = z.object({
  species: z.string().min(1),
  oldNorseName: z.string().nullable().optional(),
  optimal: optimalConditionsSchema,
  current: sensorSnapshotSchema,
  avg24h: sensorSnapshotSchema.optional(),
  mode: z.enum(['saga', 'plain']),
  photo: z.string().min(32).optional(),
});

export const chatRequest = z.object({
  sessionId: z.string().min(1),
  plantId: z.string().min(1),
  message: z.string().min(1).max(2000),
  mode: z.enum(['saga', 'plain']),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        text: z.string(),
      }),
    )
    .optional(),
  plant: z
    .object({
      name: z.string().optional(),
      species: z.string().optional(),
      optimal: optimalConditionsSchema.optional(),
    })
    .optional(),
  sensors: sensorSnapshotSchema.optional(),
});

export const sagaRequest = z.object({
  gardenName: z.string().min(1),
  plants: z.array(z.unknown()).default([]),
  aggregates: z.record(z.unknown()).default({}),
  events: z.array(z.unknown()).default([]),
});

// --- Gemini response schemas (JSON Schema subset) --------------------------
// Gemini expects OpenAPI-ish JSON Schema, not Zod. Types: STRING, NUMBER,
// INTEGER, BOOLEAN, ARRAY, OBJECT. `nullable` is supported.

const numberRange = {
  type: 'ARRAY',
  items: { type: 'NUMBER' },
  minItems: 2,
  maxItems: 2,
};

export const identifyResponseSchema = {
  type: 'OBJECT',
  properties: {
    common_name_pl: { type: 'STRING' },
    common_name_old_norse: { type: 'STRING', nullable: true },
    common_name_en: { type: 'STRING' },
    scientific_name: { type: 'STRING' },
    confidence: { type: 'NUMBER' },
    alternatives: { type: 'ARRAY', items: { type: 'STRING' } },
    optimal_conditions: {
      type: 'OBJECT',
      properties: {
        temperature_c: numberRange,
        humidity_pct: numberRange,
        light_lux: numberRange,
        soil_moisture_pct: numberRange,
      },
      required: ['temperature_c', 'humidity_pct', 'light_lux', 'soil_moisture_pct'],
    },
    care_notes: { type: 'STRING' },
    visible_issues: { type: 'ARRAY', items: { type: 'STRING' } },
    historical_use: { type: 'STRING' },
  },
  required: [
    'common_name_pl',
    'common_name_en',
    'scientific_name',
    'confidence',
    'alternatives',
    'optimal_conditions',
    'care_notes',
    'visible_issues',
    'historical_use',
  ],
};

export const analyzeResponseSchema = {
  type: 'OBJECT',
  properties: {
    health_score: { type: 'INTEGER' },
    message: { type: 'STRING' },
    issues: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          severity: { type: 'STRING', enum: ['low', 'medium', 'high'] },
          description: { type: 'STRING' },
        },
        required: ['severity', 'description'],
      },
    },
    actions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          priority: { type: 'INTEGER' },
          action: { type: 'STRING' },
          quantity: { type: 'STRING' },
          deadline_hours: { type: 'NUMBER' },
        },
        required: ['priority', 'action', 'quantity', 'deadline_hours'],
      },
    },
  },
  required: ['health_score', 'message', 'issues', 'actions'],
};

export const sagaResponseSchema = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    body: { type: 'STRING' },
    tone: { type: 'STRING', enum: ['hopeful', 'neutral', 'ominous'] },
  },
  required: ['title', 'body', 'tone'],
};

// --- Exported types --------------------------------------------------------

export type IdentifyRequest = z.infer<typeof identifyRequest>;
export type AnalyzeRequest = z.infer<typeof analyzeRequest>;
export type ChatRequest = z.infer<typeof chatRequest>;
export type SagaRequest = z.infer<typeof sagaRequest>;

export type IdentifyResponse = {
  common_name_pl: string;
  common_name_old_norse: string | null;
  common_name_en: string;
  scientific_name: string;
  confidence: number;
  alternatives: string[];
  optimal_conditions: {
    temperature_c: [number, number];
    humidity_pct: [number, number];
    light_lux: [number, number];
    soil_moisture_pct: [number, number];
  };
  care_notes: string;
  visible_issues: string[];
  historical_use: string;
};

export type AnalyzeResponse = {
  health_score: number;
  message: string;
  issues: { severity: 'low' | 'medium' | 'high'; description: string }[];
  actions: { priority: number; action: string; quantity: string; deadline_hours: number }[];
};

export type SagaResponse = {
  title: string;
  body: string;
  tone: 'hopeful' | 'neutral' | 'ominous';
};
