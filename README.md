# PlantCare AIoT — Plan hackathonowy

Aplikacja mobilna (React Native) + firmware na nRF54L15-DK, która mierzy warunki dla rośliny, **identyfikuje gatunek przez LLM** i **weryfikuje/dobiera parametry uprawy** na podstawie pomiarów z czujników.

---

## 1. Wizja produktu

**Problem:** Ludzie zabijają rośliny domowe, bo nie wiedzą co to za gatunek i jakie warunki lubi. Internetowe poradniki są ogólnikowe — "umiarkowana wilgotność" nic nie mówi, gdy nie masz pojęcia ile jej faktycznie masz.

**Rozwiązanie:** Czujnik wkładany do doniczki + aplikacja. User robi zdjęcie rośliny → LLM identyfikuje gatunek → aplikacja porównuje aktualne odczyty BME280/TEMT6000/HW-390 z optymalnym zakresem dla tego gatunku → LLM generuje konkretne, spersonalizowane rekomendacje ("Twoja monstera ma 34% wilgotności gleby — za sucho, podlej ~150ml").

**Kluczowa różnica:** Nie kolejna apka z sensorem. **LLM jest w pętli weryfikacji** — nie tylko pokazuje dane, ale tłumaczy co z nimi zrobić w kontekście konkretnej rośliny.

---

## 2. Stack techniczny

### Hardware
- **nRF54L15-DK** — MCU z BLE 5.4 (główny kontroler)
- **BME280** (I²C) — temperatura, wilgotność powietrza, ciśnienie
- **TEMT6000** (ADC) — natężenie światła
- **HW-390** (ADC, capacitive) — wilgotność gleby *(pojemnościowy, nie koroduje jak rezystancyjny)*
- **VL53L1X / VL53L0X ToF** (I²C) — czujnik odległości jako **proximity wake-up trigger** (user zbliża rękę → budzi wyświetlacz)
- **Wyświetlacz OLED 1.3" SH1106/SSD1306** (I²C, 128×64) — lokalny podgląd pomiarów i statusu rośliny bez telefonu
- **LED RGB / 3× LED** — wskaźnik statusu (zielony OK / żółty uwaga / czerwony alarm)
- **Joystick** *(opcjonalnie)* — nawigacja po ekranach OLED (przeklikiwanie między parametrami)
- **Głośnik YD58** *(opcjonalnie)* — alarm dźwiękowy "podlej mnie"

### Firmware
- **Zephyr RTOS** (natywny dla nRF Connect SDK)
- **Nordic Soft Device / BLE host stack**
- GATT profil: custom service z charakterystykami per sensor + notify

### Mobile
- **React Native** (Expo Dev Client — *nie Expo Go*, bo potrzebujemy natywnego BLE)
- **react-native-ble-plx** — komunikacja BLE
- **Zustand** lub **Redux Toolkit** — state
- **React Navigation**
- **Victory Native** / **react-native-gifted-charts** — wykresy
- **expo-image-picker** / **react-native-vision-camera** — zdjęcie rośliny

### Backend / AI
- **Google Gemini API** — `gemini-3-flash-preview` — identyfikacja gatunku z obrazu (vision) + rekomendacje + chat kontekstowy
- Prosty proxy backend (**Node.js / Hono na Cloudflare Workers** albo **FastAPI**) — żeby nie trzymać klucza API w apce
- **Supabase** *(opcjonalnie)* — persystencja historii pomiarów, sync między urządzeniami

**Dlaczego Gemini 3 Flash:**
- Thinking model z konfigurowalnym poziomem rozumowania (minimal/low/medium/high) — można balansować jakość vs latencję vs koszt
- Multimodalne wejścia: tekst, obrazy, audio, wideo, PDF + 1M tokenów kontekstu — identyfikacja rośliny ze zdjęcia działa natywnie
- Automatic context caching — idealne dla naszego przypadku, bo gatunek + optymalne zakresy są stałe przez całą sesję
- $0.50 za 1M input tokens, $3 za 1M output tokens — tanio, starcza na hackathon i dalej

---

## 3. Struktura repozytorium

Monorepo, dwa główne foldery:

```
plantcare/
├── app/                    # React Native + Expo Dev Client
│   ├── src/
│   │   ├── ble/            # react-native-ble-plx wrapper, GATT codec
│   │   ├── screens/        # Dashboard, Onboarding, AIAdvisor, History, Settings
│   │   ├── components/     # SensorCard, StatusBadge, PlantAvatar
│   │   ├── state/          # Zustand stores
│   │   ├── api/            # klient do backend proxy
│   │   └── utils/          # unit conversion, formatowanie
│   ├── app.json
│   └── package.json
│
├── firmware/               # Zephyr / nRF Connect SDK
│   ├── src/
│   │   ├── main.c          # entry point, orchestration
│   │   ├── sensors/        # bme280.c, temt6000.c, hw390.c, vl53l1x.c
│   │   ├── display/        # oled.c, screens.c (4 ekrany)
│   │   ├── ble/            # plantcare_service.c (GATT)
│   │   └── power/          # pm_policy.c, wake sources
│   ├── boards/             # overlays dla nRF54L15-DK
│   ├── prj.conf
│   └── CMakeLists.txt
│
├── backend/                # Cloudflare Worker / Hono proxy
│   ├── src/
│   │   ├── index.ts        # routes: /identify, /analyze, /chat
│   │   └── prompts.ts
│   └── wrangler.toml
│
├── docs/
│   ├── ble-contract.md     # SOURCE OF TRUTH — UUIDy, formaty bajtów
│   ├── power-budget.md     # pomiar poboru prądu per tryb
│   └── pitch.md
│
└── README.md
```

**Zasada:** `app/` i `firmware/` są niezależne, komunikują się wyłącznie przez BLE. Kontrakt w `docs/ble-contract.md` jest jedynym punktem synchronizacji. Jak coś tam się zmienia → PR, review po obu stronach, merge.

---

## 4. Architektura systemu

```
┌──────────────────────────────────┐                      ┌──────────────────────────────────┐
│  firmware/  (nRF54L15-DK)        │        BLE 5.4       │  app/  (React Native + Expo)     │
│  ┌────────────────────────────┐  │  ◄────────────────►  │  ┌────────────────────────────┐  │
│  │ sensors/  drivery          │  │   GATT notify +      │  │ ble/       react-ble-plx   │  │
│  │   bme280, temt6000,        │  │   write              │  │ screens/   Dashboard, …    │  │
│  │   hw390, vl53l1x           │  │                      │  │ state/     Zustand         │  │
│  ├────────────────────────────┤  │                      │  │ api/       HTTPS client    │  │
│  │ display/  OLED 4 ekrany    │  │                      │  └──────────────┬─────────────┘  │
│  ├────────────────────────────┤  │                      └─────────────────┼────────────────┘
│  │ ble/      GATT service     │  │                                        │ HTTPS
│  ├────────────────────────────┤  │                                        ▼
│  │ power/    PM policy        │  │                      ┌──────────────────────────────────┐
│  │  System OFF / DEEP SLEEP / │  │                      │  backend/  (Cloudflare Worker)   │
│  │  RUN — przełączane przez   │  │                      │    /identify  (vision)           │
│  │  timer + ToF + BLE event   │  │                      │    /analyze   (snapshot → raport)│
│  └────────────────────────────┘  │                      │    /chat      (kontekstowy chat) │
└──────────────────────────────────┘                      └──────────────────┬───────────────┘
                                                                             │
                                                             ┌───────────────▼──────────────┐
                                                             │  Gemini 3 Flash Preview      │
                                                             │  vision + text + caching     │
                                                             │  thinking_level: low/medium  │
                                                             └──────────────────────────────┘
```

---

## 5. Firmware — zakres i GATT profile

### BLE GATT Service: `PlantCare Service`
UUID: `0000AAAA-0000-1000-8000-00805F9B34FB` *(przykładowy, custom 128-bit)*

| Charakterystyka | UUID suffix | Właściwości | Format |
|---|---|---|---|
| Temperature | `AAA1` | Read, Notify | int16, °C × 100 |
| Humidity (air) | `AAA2` | Read, Notify | uint16, % × 100 |
| Pressure | `AAA3` | Read, Notify | uint32, Pa |
| Light level | `AAA4` | Read, Notify | uint16, lux |
| Soil moisture | `AAA5` | Read, Notify | uint8, 0–100% |
| Sampling interval | `AAA6` | Read, Write | uint16, sekundy |
| Device name/ID | `AAA7` | Read, Write | UTF-8 string |
| LED status | `AAA8` | Write | uint8 enum |
| Wake distance | `AAA9` | Read, Write | uint16, mm (próg ToF) |
| Display mode | `AAAA` | Read, Write | uint8 enum (auto/always-on/off) |

### Logika firmware
1. Inicjalizacja peryferiów (I²C dla BME280 + VL53L1X + OLED, ADC dla TEMT6000 + HW-390)
2. Advertising BLE + reklamowanie serwisu
3. Po połączeniu: sample co N sekund (default 30s) → notify
4. **Proximity wake-up loop:** VL53L1X pollowany co ~200ms w trybie low-power. Gdy odczyt < threshold (default 30cm) → wybudź OLED, pokaż dane przez X sekund (default 10s), potem uśpij wyświetlacz.
5. Sleep mode między samplami (nRF54L15 ma świetny power management — z OLED-em off pobór idzie w µA)
6. LED status: green/yellow/red sterowane przez app przez write
7. OLED rysuje przez I²C — biblioteka `u8g2` albo lv_port_zephyr (jeśli chcecie LVGL)

**Kalibracja HW-390:** surowe wartości ADC trzeba zmapować na %. Pomiar w suchym powietrzu = 0%, w szklance wody = 100%. Zrobić to w kodzie jako dwie stałe i mapowanie liniowe.

**VL53L1X tips:**
- Tryb short-range (do ~1.3m) wystarczy, daje szybsze odczyty
- Hysteresis przy progu (np. wake przy <30cm, sleep przy >40cm) — inaczej migocze
- Można ustawić interrupt pin zamiast pollingu → jeszcze niższy pobór prądu

### OLED — co rysować (4 ekrany przewijane joystickiem)
1. **Status roślinki** — duża emotka (😊/😐/😢) + nazwa rośliny + ogólny werdykt
2. **Pomiary live** — 4 wiersze: 🌡️ 22.3°C · 💧 45% · ☀️ 320 lux · 🌱 58%
3. **Alert** — co zrobić TERAZ (ikonka konewki / słońca / termometru) + krótki tekst
4. **Info** — nazwa urządzenia, stan połączenia BLE, czas od ostatniego odczytu

---

## 6. Power management — cel: miesiące na baterii

Realna szansa: **nRF54L15 w System OFF ciągnie ~0.5µA**. Przy pojedynczym ogniwie Li-Ion 2000mAh i dobrym duty cycle można realnie dobić do **3–6 miesięcy pracy bez ingerencji**. To jest historia która sprzedaje się na pitchu.

### 6.1. Power states urządzenia

| Stan | Pobór | Kiedy | Co działa |
|---|---|---|---|
| **RUN active** | ~5–8 mA | user blisko, BLE połączone | MCU aktywny, OLED ON, sampling co 1s, BLE notify |
| **RUN idle** | ~1–2 mA | BLE połączone, user daleko | MCU idle, OLED OFF, sampling co 30s |
| **DEEP SLEEP** | ~20–50 µA | brak połączenia, advertising co 1s | RAM retention, VL53L1X int wake, RTC timer |
| **SYSTEM OFF** | ~0.5 µA | długa bezczynność (np. noc) | tylko GPIO wake (joystick/ToF interrupt) |

Przełączanie między stanami zarządza `firmware/src/power/pm_policy.c`. Wejście i wyjście z każdego stanu to state machine, nie porozrzucane ify.

### 6.2. Duty cycle czujników

**Sample co 30s** dla BME280/TEMT6000/HW-390 to sweet spot — parametry rośliny nie zmieniają się szybciej. W przerwach sensory są w sleep mode:

| Sensor | Pobór active | Pobór sleep | Czas pomiaru |
|---|---|---|---|
| BME280 | 3.6 µA (forced mode) | 0.1 µA | ~10 ms |
| TEMT6000 | ~20 µA (analog, ciągły) | wyłączany FET-em | ~1 ms (ADC sample) |
| HW-390 | ~5 mA (ciągły) | wyłączany FET-em! | ~10 ms |
| VL53L1X | 19 mA (active) / 10 µA (idle) | 5 µA (software standby) | ~50 ms |

**HW-390 i TEMT6000 MUSZĄ być zasilane przez GPIO lub MOSFET**, nie na stałe z 3.3V. Bez tego HW-390 sam wypali Wam 5mA ciągle = 120mAh/dzień = bateria siada w 2 tygodnie.

Schemat: GPIO_EN_SENSORS → gate MOSFET → zasilanie sensorów. Włącz tylko na czas pomiaru (~20ms co 30s = **0.07% duty cycle**, średni pobór idzie w µA).

### 6.3. Strategie wybudzania

Trzy niezależne źródła wake-up w stanie SYSTEM OFF:

1. **RTC timer** — co 30s na sample, co 1s na BLE advertising beacon
2. **VL53L1X interrupt** — gdy ktoś zbliży rękę (sprzętowy pin, zero CPU gdy nic się nie dzieje)
3. **BLE connection event** — telefon user-a szuka urządzenia, advertising → connect

### 6.4. BLE optimization

Domyślne parametry BLE są **agresywne na pobór**. Dla PlantCare chcemy maksymalnie rzadkie interakcje:

- **Advertising interval:** 1000ms (nie 20ms!) gdy nie ma użytkownika w pobliżu. Adaptacyjnie zwalniaj do 2000ms po godzinie bez połączenia.
- **Connection interval:** 500–1000ms (nie 15ms). Dane z rośliny nie muszą lecieć 60× na sekundę.
- **Slave latency:** wysoka (np. 10) — DK może "przespać" kilka connection events jeśli nie ma nic do powiedzenia.
- **Transmit power:** -8dBm zamiast domyślnych 0dBm. Zasięg 2–3m w mieszkaniu wystarczy, oszczędność ~30% na radiu.

Implementacja: `bt_conn_le_param_update()` po połączeniu, nie w prj.conf.

### 6.5. OLED to żarłok

OLED 1.3" przy 100% pikseli świecących ciągnie ~20mA. Strategia:

- **Domyślnie wyłączony**, włącza się tylko przy wake przez ToF (`display/oled.c` → `oled_power_off()` po timeoucie)
- **Wygaszanie po 10s** bezczynności
- **Jasność dynamiczna** — z odczytu TEMT6000 regulować contrast (ciemno w pokoju → niska jasność, duża oszczędność)
- **Czarne tło, białe elementy** — OLED nie świeci czarnymi pikselami, więc im mniej białego tym mniej prądu. Prosty wireframe > wypełnione tła.

### 6.6. Budżet energetyczny — szacunek

Uproszczony worst-case dla baterii **2000 mAh** (np. 18650):

```
Idle state (90% czasu):              50 µA   = 0.050 mA
Sample burst co 30s (≈0.07% czasu):    5 mA  × 0.0007 = 0.0035 mA średnio
BLE advertising (co 1s):             ~200 µA średnio = 0.200 mA  
OLED wake (2% czasu, ~30 wybudzeń/dobę): 20 mA × 0.02 = 0.400 mA
                                              -------
                                     Σ ≈ 0.65 mA średnio

Czas pracy = 2000 mAh / 0.65 mA ≈ 3076 h ≈ 128 dni ≈ ~4 miesiące
```

Te liczby są **optymistyczne** — w rzeczywistości dojdą budget'y na BLE connection events gdy user otwiera apkę, transient power, samorozładowanie baterii. Realistycznie celujcie w **6–10 tygodni**, co i tak jest świetne.

### 6.7. Pomiar — jak sprawdzić czy faktycznie działa

- **Power Profiler Kit II** od Nordic — jeśli jest w zestawie hackathonu, to must. Pokazuje µA w czasie rzeczywistym, widać każdy spike.
- Jeśli nie ma PPK: multimetr w szeregu z zasilaniem, pomiar średni przez minutę w każdym state.
- Wyniki zapisujcie w `docs/power-budget.md` — tabelka "wersja firmware → mierzony średni pobór". To też dobry slajd na pitch.

### 6.8. Features driven by low power

- **Adaptive sampling** — w nocy (niska wartość TEMT6000 przez >1h) → interval 5min zamiast 30s. Roślina śpi, my też.
- **Smart advertising** — jeśli 24h bez połączenia, przechodzimy w SYSTEM OFF i advertising co 10s. User otwiera apkę → wake na ToF (zbliż rękę żeby wybudzić urządzenie z głębokiego snu).
- **Battery level charakterystyka BLE** — klasyczny `0x2A19` battery service + push notification w apce gdy <20%.

---

## 7. Mobile App — ekrany i flow

### 7.1. Onboarding
1. Skan urządzeń BLE → wybór swojego PlantCare-XXXX
2. Parowanie + nadanie nazwy urządzeniu ("Monstera w salonie")
3. **Zrobienie zdjęcia rośliny** → upload do Gemini 3 Flash Vision → identyfikacja gatunku
4. LLM zwraca: nazwa (PL + łac.), trudność uprawy, optymalne zakresy parametrów
5. Potwierdzenie przez użytkownika (możliwość korekty "To nie monstera, to filodendron")

### 7.2. Dashboard (główny ekran)
- Karty z aktualnymi odczytami (temp, wilgotność powietrza, światło, wilgotność gleby)
- Dla każdej karty: wartość + ikona stanu (✅ OK / ⚠️ uwaga / ❌ alarm) względem zakresu dla gatunku
- **Status ogólny roślinki** — jednozdaniowy werdykt od LLM ("Twoja monstera czuje się świetnie, trochę za mało światła w ostatnich godzinach")
- CTA: "Zapytaj AI" / "Historia" / "Szczegóły"

### 7.3. AI Advisor (killer feature)
- Chat z Gemini, który ma w kontekście:
  - Gatunek rośliny
  - Ostatnie 24h pomiarów (zagregowane)
  - Historyczne alerty
- Przykładowe pytania: "Czemu liście żółkną?", "Kiedy przesadzić?", "Czy mogę ją postawić w łazience?"
- Przycisk "Przeanalizuj warunki teraz" → LLM dostaje pełny snapshot + wyrzuca strukturalny raport

### 7.4. Historia
- Wykresy liniowe per parametr (1h / 24h / 7d / 30d)
- Oznaczenia zdarzeń ("Podlano", "Przesunięto w stronę okna")
- Eksport CSV

### 7.5. Ustawienia
- Częstotliwość samplingu
- Progi alarmów (auto z gatunku + manualna korekta)
- Powiadomienia push
- Firmware status + OTA update *(stretch goal)*

---

## 8. LLM — jak go użyć z sensem

Model: **`gemini-3-flash-preview`** przez Google AI Studio API (przez proxy backend w `backend/`).

### 8.1. Identyfikacja rośliny (vision)

Endpoint: `POST /identify`  
Wejście: obraz (base64/URL)  
`thinking_level: "medium"` — identyfikacja botaniczna wymaga rozumowania, ale nie szaleństwa  
`response_mime_type: "application/json"` + `response_schema` — Gemini 3 ma structured outputs natywnie, wykorzystaj

**System prompt:**
```
Jesteś botanikiem specjalizującym się w roślinach domowych uprawianych w Polsce.
Na podstawie zdjęcia zidentyfikuj gatunek. Jeśli nie jesteś pewien, podaj 2-3 najbardziej prawdopodobne
w polu `alternatives`. Zakresy optymalne podaj dla warunków domowych w strefie klimatu umiarkowanego.
Jeśli widzisz objawy choroby/stresu, wymień je w `visible_issues`.
```

**Response schema:**
```json
{
  "common_name_pl": "string",
  "common_name_en": "string",
  "scientific_name": "string",
  "confidence": "number (0.0-1.0)",
  "alternatives": ["string"],
  "optimal_conditions": {
    "temperature_c": [min, max],
    "humidity_pct": [min, max],
    "light_lux": [min, max],
    "soil_moisture_pct": [min, max]
  },
  "care_notes": "string",
  "visible_issues": ["string"]
}
```

Dla Gemini 3 ustaw `media_resolution: "medium"` lub `"high"` — wyższa rozdzielczość = lepsza identyfikacja liści/kwiatów, ale więcej tokenów. "High" sensowne na zdjęciach całej rośliny, "medium" wystarczy na zbliżenia.

### 8.2. Weryfikacja warunków (tekst)

Endpoint: `POST /analyze`  
Wejście: gatunek + snapshot pomiarów + agregaty 24h  
`thinking_level: "low"` — to proste porównanie z zakresami, nie wymaga głębokiego rozumowania  
`response_mime_type: "application/json"` + schema

**Prompt:**
```
Gatunek: {species}
Optymalne zakresy: {optimal}
Aktualne odczyty: {current}
Średnie z 24h: {avg_24h}

Oceń stan rośliny. Identyfikuj problemy. Zasugeruj 1-3 konkretne akcje z priorytetem.
Bądź konkretny: ilości w ml, odległości w cm, czas w godzinach.
Odpowiadaj po polsku. Max 150 słów w polu `message`.
```

### 8.3. Chat kontekstowy

Endpoint: `POST /chat`  
`thinking_level: "low"` domyślnie, `"medium"` jeśli user pyta o coś złożonego (np. diagnostyka liści)

Kontekst rośliny (gatunek + optymalne zakresy + ostatnie 24h agregatów) leci jako **explicit context cache** — Gemini 3 Flash wspiera automatic context caching. Przy pierwszej wiadomości stwórz cache z kontekstem, kolejne wiadomości używają cache ID → **koszt tokenów dla powtarzającego się kontekstu spada ~4x**, a latencja ~2x.

**Implementacja w `backend/src/index.ts`:**
```ts
// Pierwsza wiadomość w sesji
const cache = await client.caches.create({
  model: "gemini-3-flash-preview",
  contents: [systemContext, plantProfile, recent24h],
  ttl: "1800s"  // 30 min
});

// Kolejne wiadomości user-a
const resp = await client.models.generateContent({
  model: "gemini-3-flash-preview",
  contents: [userMessage],
  cached_content: cache.name,
  config: { thinking_config: { thinking_level: "low" } }
});
```

### 8.4. Tuning parametrów dla hackathonu

| Endpoint | thinking_level | media_resolution | Typical tokens |
|---|---|---|---|
| `/identify` | medium | high | ~2000 in, ~400 out |
| `/analyze` | low | — | ~500 in, ~200 out |
| `/chat` (simple Q) | low | — | ~300 in (cache), ~150 out |
| `/chat` (complex) | medium | — | ~500 in (cache), ~400 out |

Szacowany koszt demo (~50 wywołań): **< $0.05**. Klucz API ze StudioMode + keszowanie = starczy spokojnie.

### 8.5. Gemini 3 — killer features do wykorzystania

- **Spatial reasoning** — Gemini 3 Flash ma upgraded visual reasoning. Możesz pytać "gdzie na liściu jest przebarwienie?" i dostać konkretną lokalizację. Fajny efekt w demo.
- **Grounding with Google Search** — dla niszowych gatunków można włączyć grounding → apka dostaje aktualne info z sieci (np. "ta odmiana monstery została niedawno przeklasyfikowana do..."). Pokazać w pitchu jako *explainable AI*.
- **Long context 1M tokenów** — możemy wysyłać pełną historię pomiarów z 30 dni bez agregacji, jeśli user chce głęboką analizę trendu.

---

## 9. Feature backlog (MoSCoW)

### Must have (MVP na hackathon)
- [ ] Firmware: BME280 + TEMT6000 + HW-390 → BLE notify
- [ ] Firmware: VL53L1X proximity wake + OLED display status + pomiarów
- [ ] Firmware: podstawowy power management (sleep między samplami, OLED off po timeoucie, MOSFET do sensorów)
- [ ] RN app: skan BLE, połączenie, live dashboard
- [ ] Zdjęcie → Gemini 3 Flash Vision → identyfikacja gatunku
- [ ] Porównanie pomiarów z zakresem optymalnym, kolorowe wskaźniki
- [ ] Prosty chat AI Advisor

### Should have
- [ ] Historia pomiarów (in-memory ring buffer + prosty wykres)
- [ ] Powiadomienia push przy przekroczeniu progów
- [ ] LED status na urządzeniu sterowany z apki
- [ ] Konfiguracja progu wake-up i trybu OLED z apki
- [ ] Adaptive sampling (wolniej w nocy, rzadsze advertising po długim braku połączenia)
- [ ] Battery level service BLE + widok stanu baterii w apce
- [ ] Kilka roślin per user (multi-device)

### Could have (*wow factor*)
- [ ] **Time-lapse wzrostu** — user co jakiś czas robi zdjęcie, apka składa animację
- [ ] **"Głos rośliny"** — LLM generuje komunikaty w pierwszej osobie ("Jest mi sucho, podlej mnie proszę") + TTS przez głośnik na DK *(łączy wszystkie peryferia)*
- [ ] **ToF jako height sensor** — zamontuj urządzenie nad rośliną, VL53L1X mierzy jej wysokość w czasie → prawdziwy wykres wzrostu
- [ ] **Gesty nad czujnikiem** — pomachaj ręką raz = następny ekran, dwa razy = cofnij (tanie "dotykowe" UI bez przycisku)
- [ ] **Tryb wakacji** — user wyjeżdża, apka szacuje ile rośliny wytrzymają
- [ ] **Światło dzienne vs. rośliny** — integracja z kalendarzem wschodów/zachodów, ostrzeżenie o zimie
- [ ] **Leaderboard** — najzdrowsza roślina w społeczności

### Won't have (teraz)
- Automatyczne podlewanie (brak pompy)
- Integracja z Apple Home / Google Home
- Machine learning on-device

---

## 10. Podział pracy (zespół 4 os, ~24–36h)

### Hardware / Firmware — **Bolek + Paweł**
- Setup Zephyr + nRF Connect SDK na nRF54L15-DK
- Drivery: BME280 (I²C), TEMT6000 (ADC), HW-390 (ADC + kalibracja), VL53L1X (I²C), OLED SH1106/SSD1306 (I²C)
- GATT service + charakterystyki + notify
- Proximity wake-up loop + renderowanie 4 ekranów OLED
- LED status + (opcjonalnie) joystick do przewijania ekranów
- **Deliverable na koniec fazy 1:** DK w trybie advertising, wszystkie sensory zwracają poprawne wartości, OLED budzi się na zbliżenie ręki

### Mobile + AI — **Maciek + Konrad**
- React Native + Expo Dev Client setup
- `react-native-ble-plx`: skan, pair, subscribe na characteristics
- State management (Zustand), nawigacja, dashboard z live values
- Flow onboardingu: kamera → zdjęcie → Gemini 3 Flash Vision → potwierdzenie gatunku
- Backend proxy (Cloudflare Workers / Hono) do Gemini API — **ukrywa klucz**, dodaje prompt caching
- AI Advisor chat + analiza kontekstowa
- Historia + wykresy (Victory Native)
- **Deliverable na koniec fazy 1:** apka łączy się z DK (choćby z mockowymi wartościami), wyświetla dashboard, identyfikacja rośliny przez Gemini działa end-to-end

### Interfejs Firmware ↔ App — **wszyscy 4 razem, godzina 6–8**
Ustalcie kontrakt GATT **pisemnie** (UUIDy + format bajtów per charakterystyka) zanim ktokolwiek zacznie implementować swoją stronę. Bez tego Bolek wyśle `int16 big-endian` a Maciek przeczyta `int16 little-endian` i stracicie 2h na debug.

### Design + pitch — **rotacyjnie ostatnie 4h**
Nie dedykujcie osoby na cały hack, bo jest Was 4. Ostatnie 4h wszyscy schodzą z kodu (kod = freeze) i:
- Maciek/Konrad: slajdy, skrypt pitcha, nagranie wideo-backupu dema
- Bolek/Paweł: polerowanie stanowiska, ładowanie DK, przygotowanie "mokrej gąbki" do pokazania reakcji

### Kto mówi w pitchu
- **Maciek** — hook + problem (produktowo, bo robisz amathi → masz wprawę w pitchach)
- **Bolek lub Paweł** — sekcja tech (pokazuje DK w ręku, jest wiarygodny bo klepał firmware)
- **Konrad** — demo na żywo (ręce na telefonie)
- **Ten kto nie mówi** — operator backupu: trzyma roślinę, ma włączone wideo w razie W.

---

## 11. Harmonogram (wariant 24h)

| Faza | Czas | Cele |
|---|---|---|
| **0–2h** | Setup | Monorepo (`app/`, `firmware/`, `backend/`, `docs/`), Nordic toolchain, RN project z BLE libką, klucz API, `docs/ble-contract.md` wstępnie spisany |
| **2–6h** | Sensor bring-up | Każdy czujnik osobno czyta poprawne wartości na DK. Apka pokazuje dummy dashboard. |
| **6–10h** | BLE end-to-end | Notify działa, RN odbiera i wyświetla liczby. **Działa naiwnie, bez power saving.** |
| **10–14h** | AI integration + OLED | Vision identyfikuje, `/analyze` zwraca rekomendacje. OLED rysuje 4 ekrany, ToF budzi wyświetlacz. |
| **14–17h** | Power optimization | Sleep między samplami, OLED timeout, MOSFET na sensory, BLE connection params. Pomiar poboru — porównaj przed/po. |
| **17–20h** | UI polish + wow | Dashboard, kolorowe wskaźniki, chat. 1–2 features z "Could have". |
| **20–22h** | Integracja + testy | End-to-end na prawdziwej roślinie. Pomiar ile urządzenie wytrzymało. |
| **22–24h** | Demo + pitch | Nagranie backupu wideo (**zawsze**), slajdy z wykresem poboru, próba. |

---

## 12. Ryzyka i mitigacje

| Ryzyko | Mitigacja |
|---|---|
| BLE nie paruje na Androidzie/iOS | Testować na obu platformach od początku. Mieć emulator BLE jako fallback do demo. |
| HW-390 daje szum / zły kalibrowany | Średnia krocząca z 10 próbek + kalibracja przed demo (sucho/mokro). |
| Gemini API rate limit / lag | Cache rezultatów identyfikacji. Mieć przygotowane 2–3 gotowe "profile roślin" jako fallback. |
| Zdjęcie w słabym świetle = zła identyfikacja | Podpowiedzi w UI ("Zrób zdjęcie całej rośliny przy dziennym świetle"). |
| Bateria DK rozładuje się w trakcie demo | Podłączyć do power banku przez USB, mieć zapasowy. |
| Firmware crash przed demo | **Nie deployować nic na 2h przed prezentacją.** Freeze kodu. |
| Konflikt adresów I²C (BME280 + VL53L1X + OLED) | Sprawdzić adresy: BME280=0x76/77, VL53L1X=0x29, SSD1306=0x3C/3D. Jeśli kolizja → zmienić przez pin SDO/ADDR lub użyć drugiego I²C bus na nRF54L15. |
| OLED "duchy" / wolne odświeżanie | Nie rysować od zera co frame — dirty regions albo partial update. Przy I²C 400kHz pełna klatka 128×64 to ~20ms, akceptowalnie. |
| VL53L1X false triggers (np. od firanki) | Hysteresis + wymagaj 2–3 odczytów pod progiem zanim wake. |
| Power saving wprowadza niestabilność BLE | Najpierw naiwna wersja (sample + notify co 30s bez sleep), potem dopiero optymalizacja. Nie łącz PM z debugiem BLE. |
| Sensor w głębokim sleep daje złe odczyty | BME280 forced mode — jeden pomiar, nie ciągły. Po wake do pomiaru zawsze odczekać settling time (~40ms dla BME280). |
| Niedokładny pomiar poboru prądu → nieprawdziwe "4 miesiące" w pitchu | Nie podawaj liczb których nie zmierzyłeś. Mów "szacowany X" + pokaż tabelkę z założeń. Szacunki oparte na datasheetach są OK, ale oznacz je jasno. |

---

## 13. Pitch — struktura 3 min

1. **Hook (20s)** — "87% Polaków zabiło kiedyś roślinę doniczkową. My to naprawiamy." + zdjęcie zwiędłej rośliny.
2. **Problem (30s)** — Generyczne poradniki nie działają. Nie wiesz co masz i ile czego potrzebuje.
3. **Rozwiązanie (40s)** — Demo na żywo: zdjęcie → identyfikacja → pomiar → AI mówi co zrobić. **Zbliż rękę do urządzenia → OLED budzi się i pokazuje status — nie musisz wyciągać telefonu.**
4. **Tech (40s)** — nRF54L15 + BLE + Gemini 3. Low power, edge-first, AI w pętli. Działa standalone albo z apką. **"Średni pobór 0.65mA — bateria 18650 starcza na ~4 miesiące bez ładowania."** Pokazać wykres z PPK.
5. **Business (30s)** — Hardware $15 BOM, appka freemium, API dla sklepów ogrodniczych.
6. **Ask (20s)** — "Zagłosujcie na nas / kupcie nam pizzę / oto nasz GitHub."

---

## 14. Checklist dnia demo

- [ ] DK naładowany + kabel USB
- [ ] Telefon naładowany + zapasowy
- [ ] Hotspot na wypadek padu WiFi
- [ ] **Wideo backup** dema (nagrane wcześniej, gdyby BLE się sypnął)
- [ ] Prawdziwa roślina na stole (lub kilka)
- [ ] Przygotowana "mokra gąbka" żeby pokazać reakcję na zmianę wilgotności
- [ ] Slajdy na USB + w chmurze
- [ ] Zespół wie kto mówi kiedy

---

## Appendix A — Prompty do Gemini (szkice)

**Identyfikacja:**
```
Jesteś botanikiem specjalizującym się w roślinach domowych uprawianych w Polsce.
Na podstawie zdjęcia zidentyfikuj gatunek. Jeśli nie jesteś pewien, podaj 2-3 najbardziej prawdopodobne.
Zakresy optymalne podaj dla warunków domowych w strefie klimatu umiarkowanego.
Odpowiedz TYLKO poprawnym JSON-em bez markdown code fences.
```

**Analiza warunków:**
```
Gatunek: {species}
Optymalne zakresy: {optimal}
Aktualne odczyty: {current}
Średnie z 24h: {avg_24h}

Oceń stan rośliny. Identyfikuj problemy. Zasugeruj 1-3 konkretne akcje z priorytetem.
Bądź konkretny: ilości w ml, odległości w cm, czas w godzinach.
Odpowiadaj po polsku. Max 150 słów.
```

---

## Appendix B — Linki / rzeczy do sprawdzenia przed hackiem

- Nordic nRF Connect SDK docs (Zephyr BLE samples)
- `react-native-ble-plx` — setup pod iOS (wymaga permissions w Info.plist)
- Google Gemini API (`gemini-3-flash-preview`) — vision, thinking_level, context caching, structured outputs, ograniczenia rate
- HW-390 — przykładowe kody kalibracji (GitHub)
- BME280 driver dla Zephyr — już jest w SDK, wystarczy włączyć w Kconfig
