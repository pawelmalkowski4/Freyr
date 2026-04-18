import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Sample = {
  t: number;
  temp?: number | null;
  humidity?: number | null;
  light?: number | null;
  soil?: number | null;
};

type HistoryState = {
  byDevice: Record<string, Sample[]>;
  record: (deviceId: string, sample: Omit<Sample, 't'>) => void;
  clear: (deviceId: string) => void;
};

const MAX_PER_DEVICE = 200;
const MIN_INTERVAL_MS = 5000; // don't record more often than every 5s

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      byDevice: {},
      record: (deviceId, sample) => {
        const existing = get().byDevice[deviceId] ?? [];
        const last = existing[existing.length - 1];
        const now = Date.now();
        if (last && now - last.t < MIN_INTERVAL_MS) return;
        const entry: Sample = { t: now, ...sample };
        const next = [...existing, entry].slice(-MAX_PER_DEVICE);
        set((s) => ({ byDevice: { ...s.byDevice, [deviceId]: next } }));
      },
      clear: (deviceId) => set((s) => {
        const { [deviceId]: _, ...rest } = s.byDevice;
        return { byDevice: rest };
      }),
    }),
    {
      name: 'freyrs-history',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export const selectHistoryForDevice = (deviceId: string | undefined | null) =>
  (s: HistoryState) => (deviceId ? s.byDevice[deviceId] ?? [] : []);
