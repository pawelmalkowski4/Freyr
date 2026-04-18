import Constants from 'expo-constants';
import { api } from '@/api/client';
import type { Plant } from '@/state/app';
import type { SensorState } from '@/state/sensors';

const BACKEND_URL = (Constants.expoConfig?.extra as { BACKEND_URL?: string } | undefined)?.BACKEND_URL;
const HAS_PROXY_BACKEND = Boolean(BACKEND_URL && !BACKEND_URL.includes('example.workers.dev'));

type Mode = 'saga' | 'plain';

type OptimalConditions = {
  temperature_c: [number, number];
  humidity_pct: [number, number];
  light_lux: [number, number];
  soil_moisture_pct: [number, number];
};

type SensorSnapshot = {
  temperature_c?: number | null;
  humidity_pct?: number | null;
  light_lux?: number | null;
  soil_moisture_pct?: number | null;
};

export type AnalyzeResult = {
  health_score: number;
  message: string;
  issues: { severity: 'low' | 'medium' | 'high'; description: string }[];
  actions: { priority: number; action: string; quantity: string; deadline_hours: number }[];
};

export type SagaResult = {
  title: string;
  body: string;
  tone: 'hopeful' | 'neutral' | 'ominous';
};

const toOptimal = (p: Plant): OptimalConditions => ({
  temperature_c: [p.optimal.tempMin, p.optimal.tempMax],
  humidity_pct: [p.optimal.humidityMin, p.optimal.humidityMax],
  light_lux: [p.optimal.lightMin, p.optimal.lightMax],
  soil_moisture_pct: [p.optimal.soilMin, p.optimal.soilMax],
});

const toSnapshot = (s: SensorState): SensorSnapshot => ({
  temperature_c: s.temp,
  humidity_pct: s.humidity,
  light_lux: s.light,
  soil_moisture_pct: s.soil,
});

export async function analyzePlant(
  plant: Plant,
  sensors: SensorState,
  mode: Mode,
  photoBase64?: string,
): Promise<AnalyzeResult> {
  if (!HAS_PROXY_BACKEND) {
    throw new Error('Backend nie jest skonfigurowany. Ustaw BACKEND_URL w app.json.');
  }
  return api.analyze({
    species: plant.species,
    oldNorseName: plant.oldNorseName,
    optimal: toOptimal(plant),
    current: toSnapshot(sensors),
    avg24h: toSnapshot(sensors),
    mode,
    photo: photoBase64,
  });
}

export async function generateSaga(plants: Plant[], sensors: SensorState, gardenName: string): Promise<SagaResult> {
  if (!HAS_PROXY_BACKEND) {
    throw new Error('Backend nie jest skonfigurowany. Ustaw BACKEND_URL w app.json.');
  }
  return api.saga({
    gardenName,
    plants: plants.map((p) => ({
      name: p.name,
      species: p.species,
      optimal: toOptimal(p),
    })),
    aggregates: {
      current: toSnapshot(sensors),
    },
    events: [],
  });
}
