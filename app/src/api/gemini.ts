import { useAppStore, selectActivePlant } from '@/state/app';
import { useSensorStore } from '@/state/sensors';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export async function chatWithGemini(messages: {from: 'user' | 'bot', text: string}[], tone: 'saga' | 'plain', currentPlant: any, sensors: any) {
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
    parts: [{ text: m.text }]
  }));

  // Insert system instruction as first user message or handle via systemInstruction field (Gemini 1.5/2.0+ supports systemInstruction)
  const body = {
    systemInstruction: {
      parts: [{ text: systemPrompt + contextPrompt }]
    },
    contents: history
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Gemini error:', data);
    throw new Error(data.error?.message || 'Błąd połączenia z Gemini.');
  }

  return data.candidates[0].content.parts[0].text;
}

export async function identifyPlantFromImage(base64Image: string): Promise<any> {
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
    ]
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
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
  } catch (e) {
    console.error('Failed to parse Gemini response:', text);
    throw new Error('Nie udało się przetworzyć odpowiedzi od AI.');
  }
}
