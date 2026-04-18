// Backend client — proxies Gemini through Cloudflare Worker.
// See backend/ for endpoint implementations (separate repo or sibling folder).
import Constants from 'expo-constants';

const BASE = (Constants.expoConfig?.extra as any)?.BACKEND_URL || 'http://localhost:8787';

async function post<T>(path: string, body: any): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${path} ${r.status}`);
  return r.json();
}

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

export const api = {
  identify: (imageBase64: string) =>
    post<IdentifyResponse>('/identify', { image: imageBase64 }),

  analyze: (params: {
    species: string; oldNorseName?: string;
    optimal: any; current: any; avg24h: any; mode: 'saga' | 'plain';
    photo?: string;
  }) => post<{
    health_score: number;
    message: string;
    issues: { severity: 'low' | 'medium' | 'high'; description: string }[];
    actions: { priority: number; action: string; quantity: string; deadline_hours: number }[];
  }>('/analyze', params),

  chat: (params: {
    sessionId: string;
    plantId: string;
    message: string;
    mode: 'saga' | 'plain';
    history?: { role: 'user' | 'model'; text: string }[];
    plant?: {
      name?: string;
      species?: string;
      optimal?: {
        temperature_c: [number, number];
        humidity_pct: [number, number];
        light_lux: [number, number];
        soil_moisture_pct: [number, number];
      };
    };
    sensors?: {
      temperature_c?: number | null;
      humidity_pct?: number | null;
      light_lux?: number | null;
      soil_moisture_pct?: number | null;
    };
  }) => post<{ reply: string }>('/chat', params),

  saga: (params: { gardenName: string; plants: any; aggregates: any; events: any }) =>
    post<{ title: string; body: string; tone: 'hopeful' | 'neutral' | 'ominous' }>('/saga', params),
};

// Mock fallback when offline — returns the demo plant from README
export const mockApi = {
  identify: async (): Promise<IdentifyResponse> => ({
    common_name_pl: 'Len zwyczajny',
    common_name_old_norse: 'Lín',
    common_name_en: 'Common flax',
    scientific_name: 'Linum usitatissimum',
    confidence: 0.92,
    alternatives: ['Lnica pospolita'],
    optimal_conditions: {
      temperature_c: [16, 24],
      humidity_pct: [40, 65],
      light_lux: [600, 1500],
      soil_moisture_pct: [40, 70],
    },
    care_notes: 'Słońce 6+ godzin dziennie. Ziemia przepuszczalna, lekko wilgotna.',
    visible_issues: [],
    historical_use: 'Wikingowie uprawiali len na włókno (żagle, ubrania) i olej z nasion.',
  }),
};
