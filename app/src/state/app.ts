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
  deviceId?: string;
  deviceName?: string;
};

type AppState = {
  tone: Tone;
  plants: Plant[];
  activePlantId: string | null;
  onboardingDone: boolean;
  setTone: (t: Tone) => void;
  addPlant: (p: Plant) => void;
  removePlant: (id: string) => void;
  setActive: (id: string) => void;
  assignDevice: (plantId: string, deviceId: string, deviceName: string | null) => void;
  unassignDevice: (plantId: string) => void;
  updateOptimal: (plantId: string, optimal: Plant['optimal']) => void;
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
      removePlant: (id) => set((s) => {
        const plants = s.plants.filter(p => p.id !== id);
        const activePlantId = s.activePlantId === id
          ? (plants[0]?.id ?? null)
          : s.activePlantId;
        return { plants, activePlantId };
      }),
      setActive: (id) => set({ activePlantId: id }),
      assignDevice: (plantId, deviceId, deviceName) => set((s) => ({
        plants: s.plants.map(p => p.id === plantId ? { ...p, deviceId, deviceName: deviceName ?? undefined } : p),
      })),
      unassignDevice: (plantId) => set((s) => ({
        plants: s.plants.map(p => p.id === plantId ? { ...p, deviceId: undefined, deviceName: undefined } : p),
      })),
      updateOptimal: (plantId, optimal) => set((s) => ({
        plants: s.plants.map(p => p.id === plantId ? { ...p, optimal } : p),
      })),
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
