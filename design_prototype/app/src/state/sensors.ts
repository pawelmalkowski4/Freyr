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

// Derived: grace score 0-100
export function graceScore(s: SensorState, optimal: { soilMin: number; soilMax: number; lightMin: number; lightMax: number; tempMin: number; tempMax: number }): number {
  const score = (v: number | null, lo: number, hi: number) => {
    if (v == null) return 50;
    if (v >= lo && v <= hi) return 100;
    const dist = v < lo ? lo - v : v - hi;
    const range = hi - lo;
    return Math.max(0, 100 - (dist / range) * 100);
  };
  const a = score(s.soil,  optimal.soilMin,  optimal.soilMax);
  const b = score(s.light, optimal.lightMin, optimal.lightMax);
  const c = score(s.temp,  optimal.tempMin,  optimal.tempMax);
  return Math.round((a * 0.5 + b * 0.25 + c * 0.25));
}
