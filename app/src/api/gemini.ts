import Constants from 'expo-constants';
import { api, mockApi, IdentifyResponse } from '@/api/client';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const BACKEND_URL = (Constants.expoConfig?.extra as { BACKEND_URL?: string } | undefined)?.BACKEND_URL;
const HAS_PROXY_BACKEND = Boolean(BACKEND_URL && !BACKEND_URL.includes('example.workers.dev'));

function buildMockReply(
  tone: 'saga' | 'plain',
  currentPlant: { name?: string; species?: string } | null,
  sensors: { soil?: number | null; light?: number | null; temp?: number | null }
) {
  const plantName = currentPlant?.name ?? (tone === 'saga' ? 'młode drzewko' : 'roślina');
  const soil = sensors.soil == null ? null : Math.round(sensors.soil);
  const light = sensors.light == null ? null : Math.round(sensors.light);
  const temp = sensors.temp == null ? null : Math.round(sensors.temp * 10) / 10;

  if (tone === 'saga') {
    return `Oko widzi ${plantName}. ${
      soil != null ? `Ziemia trzyma ${soil}% wilgoci.` : 'Ziemia milczy.'
    } ${light != null ? `Słońce daje ${light} luksów.` : 'Słońce skryło znaki.'} ${
      temp != null ? `Wicher niesie ${temp}°C.` : 'Wicher nie zostawił śladu.'
    } Jeśli chcesz pełnej wyroczni, podłącz backend lub klucz Gemini.`;
  }

  return `${plantName}: ${
    soil != null ? `wilgotność gleby ${soil}%. ` : ''
  }${light != null ? `Światło ${light} lx. ` : ''}${
    temp != null ? `Temperatura ${temp}°C. ` : ''
  }Dla pełnej analizy podłącz backend albo skonfiguruj Gemini.`;
}

async function generateDirectChat(messages: { from: 'user' | 'bot'; text: string }[], tone: 'saga' | 'plain', currentPlant: any, sensors: any) {
  if (!GEMINI_API_KEY) {
    throw new Error('Brak klucza API Gemini (EXPO_PUBLIC_GEMINI_API_KEY).');
  }

  const systemPrompt = tone === 'saga'
    ? `Jesteś Okiem Freyra, mitycznym nordyckim duchem opiekuńczym roślin. Mów wzniośle, jak w sagach, używaj metafor żywiołów (Ziemia to wilgotność gleby, Wicher to temperatura, Słońce to światło). Bądź zwięzły.`
    : `Jesteś asystentem ogrodnika. Jesteś zwięzły i pomocny. Pomagasz dbać o roślinę.`;

  const contextPrompt = currentPlant
    ? `\nKontekst rośliny: ${currentPlant.name} (${currentPlant.species}).\nAktualne parametry z czujników: Wilgotność gleby: ${sensors.soil}%, Światło: ${sensors.light} lx, Temperatura: ${sensors.temp}C.`
    : `\nBrak dodanej rośliny.`;

  const history = messages.map(m => ({
    role: m.from === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }],
  }));

  const body = {
    systemInstruction: {
      parts: [{ text: systemPrompt + contextPrompt }],
    },
    contents: history,
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Gemini error:', data);
    throw new Error(data.error?.message || 'Błąd połączenia z Gemini.');
  }

  return data.candidates[0].content.parts[0].text as string;
}

export async function chatWithGemini(messages: {from: 'user' | 'bot', text: string}[], tone: 'saga' | 'plain', currentPlant: any, sensors: any) {
  const latestUserMessage = [...messages].reverse().find(message => message.from === 'user')?.text ?? '';
  const history = messages.slice(0, -1).map(m => ({
    role: m.from === 'user' ? ('user' as const) : ('model' as const),
    text: m.text,
  }));

  if (HAS_PROXY_BACKEND) {
    const plantPayload = currentPlant
      ? {
          name: currentPlant.name as string | undefined,
          species: currentPlant.species as string | undefined,
          optimal: currentPlant.optimal
            ? {
                temperature_c: [currentPlant.optimal.tempMin, currentPlant.optimal.tempMax] as [number, number],
                humidity_pct: [currentPlant.optimal.humidityMin, currentPlant.optimal.humidityMax] as [number, number],
                light_lux: [currentPlant.optimal.lightMin, currentPlant.optimal.lightMax] as [number, number],
                soil_moisture_pct: [currentPlant.optimal.soilMin, currentPlant.optimal.soilMax] as [number, number],
              }
            : undefined,
        }
      : undefined;
    const sensorsPayload = sensors
      ? {
          temperature_c: sensors.temp,
          humidity_pct: sensors.humidity,
          light_lux: sensors.light,
          soil_moisture_pct: sensors.soil,
        }
      : undefined;
    const response = await api.chat({
      sessionId: currentPlant?.id ?? 'local-session',
      plantId: currentPlant?.id ?? 'unknown-plant',
      message: latestUserMessage,
      mode: tone,
      history,
      plant: plantPayload,
      sensors: sensorsPayload,
    });
    return response.reply;
  }

  if (GEMINI_API_KEY) {
    return generateDirectChat(messages, tone, currentPlant, sensors);
  }

  return buildMockReply(tone, currentPlant, sensors);
}

async function identifyDirectFromGemini(base64Image: string): Promise<IdentifyResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error('Brak klucza API Gemini (EXPO_PUBLIC_GEMINI_API_KEY).');
  }

  const prompt = `Zidentyfikuj roślinę na tym zdjęciu. Zwróć wynik TYLKO w formacie JSON i nic więcej (bez znaczników markdown). 
Jeśli na zdjęciu NIE MA żadnej rośliny, zwróć TYLKO: {"error": "Nie rozpoznano rośliny na zdjęciu."}

Struktura JSON:
{
  "common_name_pl": "Polska nazwa",
  "scientific_name": "Nazwa łacińska",
  "common_name_old_norse": "Nazwa w stylu mitologii nordyckiej (wymyśl klimatyczną, np. Drzewo Życia, Włócznia Odyna)",
  "historical_use": "Krótki opis historyczny/ciekawostka",
  "optimal_conditions": {
    "soil_moisture_pct": [min, max],
    "light_lux": [min, max],
    "temperature_c": [min, max],
    "humidity_pct": [min, max]
  }
}`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          }
        ]
      }
    ],
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Błąd połączenia z Gemini Vision.');
  }

  const text = data.candidates[0].content.parts[0].text;
  // Cleanup json markdown if present
  const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
  
  try {
    return JSON.parse(cleanedText);
  } catch {
    console.error('Failed to parse Gemini response:', text);
    throw new Error('Nie udało się przetworzyć odpowiedzi od AI.');
  }
}

export async function identifyPlantFromImage(base64Image: string): Promise<IdentifyResponse> {
  if (HAS_PROXY_BACKEND) {
    return api.identify(base64Image);
  }

  if (GEMINI_API_KEY) {
    return identifyDirectFromGemini(base64Image);
  }

  return mockApi.identify();
}
