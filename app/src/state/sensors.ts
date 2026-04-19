import { create } from 'zustand';

export type SensorState = {
  connected: boolean;
  deviceName: string | null;
  temp: number | null;
  humidity: number | null;
  pressure: number | null;
  light: number | null;
  soil: number | null;
  battery: number | null;
  lastUpdate: number | null;
  set: (patch: Partial<Omit<SensorState, 'set'>>) => void;
};

export const useSensorStore = create<SensorState>((set) => ({
  connected: false,
  deviceName: null,
  temp: null, humidity: null, pressure: null, light: null, soil: null, battery: null,
  lastUpdate: null,
  set: (patch) => set(patch),
}));

// Per-parameter centrality score: 100 at the middle of [lo,hi], 60 at edges,
// drops below quickly as value leaves the range. Returns null when no reading.
function centralityScore(v: number | null, lo: number, hi: number): number | null {
  if (v == null) return null;
  const half = Math.max((hi - lo) / 2, 0.0001);
  const center = (lo + hi) / 2;
  const normalized = Math.abs(v - center) / half; // 0 at center, 1 at edge, >1 outside
  return Math.max(0, Math.min(100, 100 - normalized * 40));
}

// Derived: grace score 0-100. Returns null if no parameters have readings yet.
export function graceScore(
  s: SensorState,
  optimal: {
    soilMin: number; soilMax: number;
    lightMin: number; lightMax: number;
    tempMin: number; tempMax: number;
    humidityMin: number; humidityMax: number;
  },
): number | null {
  const parts: { value: number; weight: number }[] = [];
  const push = (score: number | null, weight: number) => {
    if (score != null) parts.push({ value: score, weight });
  };
  push(centralityScore(s.soil,     optimal.soilMin,     optimal.soilMax),     0.4);
  push(centralityScore(s.light,    optimal.lightMin,    optimal.lightMax),    0.2);
  push(centralityScore(s.temp,     optimal.tempMin,     optimal.tempMax),     0.2);
  push(centralityScore(s.humidity, optimal.humidityMin, optimal.humidityMax), 0.2);
  if (parts.length === 0) return null;
  const totalW = parts.reduce((acc, p) => acc + p.weight, 0);
  const weighted = parts.reduce((acc, p) => acc + p.value * p.weight, 0);
  return Math.round(weighted / totalW);
}
