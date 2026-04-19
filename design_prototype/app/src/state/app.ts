import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Tone = 'saga' | 'plain';

export type Plant = {
  id: string;
  name: string;
  oldNorseName?: string;
  species: string;
  scientificName: string;
  historicalUse?: string;
  optimal: {
    soilMin: number; soilMax: number;
    lightMin: number; lightMax: number;
    tempMin: number; tempMax: number;
    humidityMin: number; humidityMax: number;
  };
  photoUri?: string;
};

type AppState = {
  tone: Tone;
  plants: Plant[];
  activePlantId: string | null;
  onboardingDone: boolean;
  setTone: (t: Tone) => void;
  addPlant: (p: Plant) => void;
  setActive: (id: string) => void;
  finishOnboarding: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      tone: 'saga',
      plants: [],
      activePlantId: null,
      onboardingDone: false,
      setTone: (t) => set({ tone: t }),
      addPlant: (p) => set((s) => ({
        plants: [...s.plants, p],
        activePlantId: s.activePlantId ?? p.id,
      })),
      setActive: (id) => set({ activePlantId: id }),
      finishOnboarding: () => set({ onboardingDone: true }),
    }),
    {
      name: 'freyrs-app',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const selectActivePlant = (s: AppState) =>
  s.plants.find(p => p.id === s.activePlantId) ?? null;
