# Freyr's Eye — Oko Freja 🌱⚔️

## AIoT strażnik świętych ogrodów dla Inteligentnego Miasta Wikingów

Aplikacja mobilna (React Native) + firmware na nRF54L15-DK, która monitoruje warunki upraw w grodzie, **identyfikuje gatunki roślin przez LLM** i **weryfikuje warunki wzrostu** na podstawie pomiarów z czujników. Inteligentny system zarządzania spichlerzem, zielnikiem i ogrodem osadniczym.

> _"Kiedy zima trwała osiem miesięcy, a gród liczył dwieście dusz, strata upraw oznaczała śmierć. Wikingowie nie mogli sobie pozwolić na zwiędłą roślinę."_

---

## 1. Wizja produktu

**Kontekst historyczny:** Wikingowie nie byli tylko wojownikami — byli **rolnikami, zielarzami, browarnikami**. Uprawiali len (na żagle i ubrania), jęczmień (chleb i piwo), zioła lecznicze (szałwia, tymianek, krwawnik), warzywa korzenne (rzepa, kapusta). Każdy gród miał ogród ziół przy domu wiedmy/zielarki. Bogowie płodności — **Freyr** i jego siostra **Freja** — byli patronami urodzaju. Zła uprawa = klątwa, głód, śmierć osady.

**Problem dla współczesnego "miasta Wikingów":** Smart city to nie tylko transport i energia. To też **produkcja żywności** — ogrody społecznościowe, miejskie uprawy ziół, szklarnie szkolne, pasieki. W rekonstrukcjach historycznych i skansenach wikińskich (np. Wolin, Biskupin) uprawia się autentyczne gatunki epoki — ale bez monitoringu giną przy pierwszej suszy. Ogólnikowe poradniki nie pomogą, gdy masz konkretny ogródek z konkretnymi warunkami.

**Rozwiązanie: Freyr's Eye** — "oko boga płodności" zatknięte w ziemi. Czujnik wkładany w grządkę + aplikacja jarla (właściciela ogrodu). User robi zdjęcie rośliny → LLM (jako **skald-zielarz**) identyfikuje gatunek → aplikacja porównuje odczyty BME280/TEMT6000/HW-390 z optymalnym zakresem → LLM generuje wyrocznię w stylu sagi: _"Len ten woła o wodę. Jeśli do wieczora nie spadnie deszcz Thora, podlej go dwiema czerpakami. Inaczej Freja odwróci od tej grządki wzrok."_

**Kluczowa różnica:** Nie kolejny smart-gardening dashboard. **LLM jako cyfrowy skald-zielarz** — nie tylko pokazuje dane, ale tłumaczy co z nimi zrobić w języku, który angażuje użytkownika i wpisuje się w kulturową warstwę smart-city. Technologia zamaskowana narracją = produkt z duszą, nie kolejny "IoT hub z wykresami".

### 1.1. Zastosowania w Inteligentnym Mieście Wikingów

Freyr's Eye skaluje się z jednej doniczki do całej osady:

| Skala                             | Zastosowanie                                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Pojedyncza grządka**            | Zielnik przy domu wiedmy — szałwia, tymianek, krwawnik, dziurawiec. Alarm gdy za sucho.                      |
| **Ogród warzywny**                | Kilka Freyr's Eye w sieci BLE, każdy pilnuje innej grządki (rzepa, kapusta, fasola). Telefon jarla agreguje. |
| **Spichlerz / świeże zbiory**     | BME280 monitoruje czy siano i ziarno nie pleśnieją (wilgotność powietrza). Kluczowe zimą.                    |
| **Sadzonki w ziemiance**          | Rozsada zaczynana wczesną wiosną w chacie — TEMT6000 mierzy czy światła ze świec starczy.                    |
| **Pasieka (stretch)**             | BME280 w ulu — temperatura roju = zdrowie pszczół. Miód to gospodarka osady.                                 |
| **Święty gaj / drzewa Yggdrasil** | HC-SR04 mierzy wysokość młodego drzewka rok do roku — pamięć pokoleń osady.                                  |

### 1.2. Dlaczego to pasuje do tematu "Inteligentne miasto Wikingów"

Inteligentne miasto to nie tylko sensory ruchu i inteligentne latarnie. **Produkcja żywności** jest fundamentem każdej cywilizacji, a dla Wikingów była różnicą między przeżyciem a klęską. Nasza aplikacja:

- **Rozwiązuje realny problem** (monitoring upraw) w ramach tematu (kultura Wikingów)
- **Łączy hardware z narracją** — sensor w ziemi + LLM generujący przepowiednie Freja = immersja, nie tylko dane
- **Skaluje się** od prywatnego zielnika do całego grodu (mesh BLE, wielu Freyr's Eye)
- **Ma edukacyjną wartość** — użytkownik uczy się o autentycznych uprawach epoki przy okazji dbania o swoje rośliny
- **Jest demokratyczne** — od pojedynczego mieszkańca grodu po jarla zarządzającego zbiorami

---

## 2. Stack techniczny

### Hardware

- **nRF54L15-DK** — MCU z BLE 5.4 (główny kontroler)
- **BME280** (I²C) — temperatura, wilgotność powietrza, ciśnienie
- **TEMT6000** (ADC) — natężenie światła
- **HW-390** (ADC, capacitive) — wilgotność gleby _(pojemnościowy, nie koroduje jak rezystancyjny)_
- **VL53L1X / VL53L0X ToF** (I²C) — czujnik odległości jako **proximity wake-up trigger** (user zbliża rękę → budzi wyświetlacz)
- **Wyświetlacz OLED 1.3" SH1106/SSD1306** (I²C, 128×64) — lokalny podgląd pomiarów i statusu rośliny bez telefonu
- **LED RGB / 3× LED** — wskaźnik statusu (zielony OK / żółty uwaga / czerwony alarm)
- **Joystick** _(opcjonalnie)_ — nawigacja po ekranach OLED (przeklikiwanie między parametrami)
- **Głośnik YD58** _(opcjonalnie)_ — alarm dźwiękowy "podlej mnie"

### Firmware

- **Zephyr RTOS** (natywny dla nRF Connect SDK)
- **Nordic Soft Device / BLE host stack**
- GATT profil: custom service z charakterystykami per sensor + notify

### Mobile

- **React Native** (Expo Dev Client — _nie Expo Go_, bo potrzebujemy natywnego BLE)
- **react-native-ble-plx** — komunikacja BLE
- **Zustand** lub **Redux Toolkit** — state
- **React Navigation**
- **Victory Native** / **react-native-gifted-charts** — wykresy
- **expo-image-picker** / **react-native-vision-camera** — zdjęcie rośliny

### Backend / AI

- **Google Gemini API** — `gemini-3-flash-preview` — identyfikacja gatunku z obrazu (vision) + rekomendacje + chat kontekstowy
- Prosty proxy backend (**Node.js / Hono na Cloudflare Workers** albo **FastAPI**) — żeby nie trzymać klucza API w apce
- **Supabase** _(opcjonalnie)_ — persystencja historii pomiarów, sync między urządzeniami

**Dlaczego Gemini 3 Flash:**

- Thinking model z konfigurowalnym poziomem rozumowania (minimal/low/medium/high) — można balansować jakość vs latencję vs koszt
- Multimodalne wejścia: tekst, obrazy, audio, wideo, PDF + 1M tokenów kontekstu — identyfikacja rośliny ze zdjęcia działa natywnie
- Automatic context caching — idealne dla naszego przypadku, bo gatunek + optymalne zakresy są stałe przez całą sesję
- $0.50 za 1M input tokens, $3 za 1M output tokens — tanio, starcza na hackathon i dalej

---

## 3. Struktura repozytorium

Monorepo, dwa główne foldery:

```
freyrs-eye/
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
│   │   ├── ble/            # freyrs_service.c (GATT)
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

### BLE GATT Service: `Freyrs Eye Service`

UUID: `0000AAAA-0000-1000-8000-00805F9B34FB` _(przykładowy, custom 128-bit)_

| Charakterystyka   | UUID suffix | Właściwości  | Format                          |
| ----------------- | ----------- | ------------ | ------------------------------- |
| Temperature       | `AAA1`      | Read, Notify | int16, °C × 100                 |
| Humidity (air)    | `AAA2`      | Read, Notify | uint16, % × 100                 |
| Pressure          | `AAA3`      | Read, Notify | uint32, Pa                      |
| Light level       | `AAA4`      | Read, Notify | uint16, lux                     |
| Soil moisture     | `AAA5`      | Read, Notify | uint8, 0–100%                   |
| Sampling interval | `AAA6`      | Read, Write  | uint16, sekundy                 |
| Device name/ID    | `AAA7`      | Read, Write  | UTF-8 string                    |
| LED status        | `AAA8`      | Write        | uint8 enum                      |
| Wake distance     | `AAA9`      | Read, Write  | uint16, mm (próg ToF)           |
| Display mode      | `AAAA`      | Read, Write  | uint8 enum (auto/always-on/off) |

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

Estetyka: **runiczna grafika**, ramki w stylu wzorów skandynawskich, używamy charakterów ᚠ ᚢ ᚦ ᚨ ᚱ (fonty pixelowe z Unicode Futhark), duże ikony zamiast dużo tekstu. OLED 128×64 to idealna kanwa do monochromatycznego stylu "kamienia runicznego".

1. **Łaska Freja** — duża twarz bóstwa (😊 Freja zadowolona / 😐 obojętna / 😢 odwrócona), nazwa rośliny po staronordyjsku i polsku (_"Lín — Len zwyczajny"_), runiczny werdykt
2. **Znaki Ziemi** — 4 wiersze z ikonami run:
   - ᚦ (Thurisaz, grom) 🌡️ 22.3°C
   - ᛚ (Laguz, woda) 💧 45%
   - ᛋ (Sowilo, słońce) ☀️ 320 lux
   - ᛃ (Jera, plon) 🌱 58%
3. **Wieszczba** — co zrobić TERAZ, ikonka + krótki tekst w stylu wyroczni: _"Napój ziemię"_ / _"Przesuń w słońce"_ / _"Odsuń od ognia"_
4. **Runy grodu** — nazwa urządzenia (np. _"Sentinel-Yggdrasil"_), stan połączenia BLE (rune ᚹ = "wynn/radość" = połączone, ᚾ = "nauthiz/potrzeba" = rozłączone), czas od ostatniego znaku

**Ekran wake-up:** gdy user zbliża dłoń, OLED animuje się _"obudzeniem oka"_ — trzy kropki → oko się otwiera → pokazuje status. ~300ms, taniutki efekt, ale robi wrażenie.

---

## 6. Power management — cel: miesiące na baterii

Realna szansa: **nRF54L15 w System OFF ciągnie ~0.5µA**. Przy pojedynczym ogniwie Li-Ion 2000mAh i dobrym duty cycle można realnie dobić do **3–6 miesięcy pracy bez ingerencji**. To jest historia która sprzedaje się na pitchu.

### 6.1. Power states urządzenia

| Stan           | Pobór     | Kiedy                              | Co działa                                        |
| -------------- | --------- | ---------------------------------- | ------------------------------------------------ |
| **RUN active** | ~5–8 mA   | user blisko, BLE połączone         | MCU aktywny, OLED ON, sampling co 1s, BLE notify |
| **RUN idle**   | ~1–2 mA   | BLE połączone, user daleko         | MCU idle, OLED OFF, sampling co 30s              |
| **DEEP SLEEP** | ~20–50 µA | brak połączenia, advertising co 1s | RAM retention, VL53L1X int wake, RTC timer       |
| **SYSTEM OFF** | ~0.5 µA   | długa bezczynność (np. noc)        | tylko GPIO wake (joystick/ToF interrupt)         |

Przełączanie między stanami zarządza `firmware/src/power/pm_policy.c`. Wejście i wyjście z każdego stanu to state machine, nie porozrzucane ify.

### 6.2. Duty cycle czujników

**Sample co 30s** dla BME280/TEMT6000/HW-390 to sweet spot — parametry rośliny nie zmieniają się szybciej. W przerwach sensory są w sleep mode:

| Sensor   | Pobór active                  | Pobór sleep             | Czas pomiaru       |
| -------- | ----------------------------- | ----------------------- | ------------------ |
| BME280   | 3.6 µA (forced mode)          | 0.1 µA                  | ~10 ms             |
| TEMT6000 | ~20 µA (analog, ciągły)       | wyłączany FET-em        | ~1 ms (ADC sample) |
| HW-390   | ~5 mA (ciągły)                | wyłączany FET-em!       | ~10 ms             |
| VL53L1X  | 19 mA (active) / 10 µA (idle) | 5 µA (software standby) | ~50 ms             |

**HW-390 i TEMT6000 MUSZĄ być zasilane przez GPIO lub MOSFET**, nie na stałe z 3.3V. Bez tego HW-390 sam wypali Wam 5mA ciągle = 120mAh/dzień = bateria siada w 2 tygodnie.

Schemat: GPIO_EN_SENSORS → gate MOSFET → zasilanie sensorów. Włącz tylko na czas pomiaru (~20ms co 30s = **0.07% duty cycle**, średni pobór idzie w µA).

### 6.3. Strategie wybudzania

Trzy niezależne źródła wake-up w stanie SYSTEM OFF:

1. **RTC timer** — co 30s na sample, co 1s na BLE advertising beacon
2. **VL53L1X interrupt** — gdy ktoś zbliży rękę (sprzętowy pin, zero CPU gdy nic się nie dzieje)
3. **BLE connection event** — telefon user-a szuka urządzenia, advertising → connect

### 6.4. BLE optimization

Domyślne parametry BLE są **agresywne na pobór**. Dla Freyrs Eye chcemy maksymalnie rzadkie interakcje:

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

**Estetyka:** paleta ziemi i lnu (brązy, ciemna zieleń, kość słoniowa), font nagłówkowy stylizowany na runiczny (np. Nordique, Viking, Norse) + czytelny sans-serif do treści. Ikony minimalistyczne, oparte na starogermańskich znakach (runy Futhark). Subtelna tekstura pergaminu/drewna w tle. **Nie przesadzać** — to smart city, nie gra planszowa. Minimalizm + akcenty.

### 7.1. Onboarding — "Wezwij Oko Freja"

1. Ekran powitalny: _"Jarlu, tvój ogród czeka na ochronę."_ — przycisk "Przywołaj Oko" (skan BLE)
2. Skan urządzeń BLE → wybór swojego Freyr-Eye-XXXX
3. Parowanie + nazwanie ogrodu (_"Zielnik Ragnhild"_, _"Grządka przy kuźni"_, _"Spichlerz północny"_)
4. **Zrobienie zdjęcia rośliny** → upload do Gemini 3 Flash Vision → identyfikacja gatunku
5. LLM zwraca: nazwa polska + staronordyjska (jeśli znana) + łacińska, klasa uprawy (zielna/warzywna/lecznicza/zbożowa), optymalne zakresy
6. Potwierdzenie: _"Czy to jest len zwyczajny (Lín)?"_ z możliwością korekty
7. Ekran podsumowania: _"Oko Freja czuwa nad Twoim lnem. Freja zsyła pierwsze łaski."_ → przejście do dashboardu

### 7.2. Dashboard — "Wzrok Freja"

- **Pasek górny:** runiczny herb osady + nazwa ogrodu + stan baterii Oka (w %, z ikoną ogniska: pełne/tlące/wygaszone)
- **Centralna karta "Łaska Freja" (0-100)** — wielki procent + krótki werdykt w stylu sagi: _"Freja błogosławi temu zielu. Ciepło dnia i wilgoć ziemi są w harmonii."_
- Cztery karty pomiarów, każda z runą + wartością + statusem (✅ ⚠️ ❌) względem zakresu:
  - ᚦ Ciepło (temp)
  - ᛚ Woda (wilgotność powietrza + gleby)
  - ᛋ Słońce (lux)
  - ᛃ Plon (agregowany health score)
- **CTA:** "Poradź się skalda" (chat) · "Kronika" (historia) · "Ustawienia ogrodu"

### 7.3. Skald-Zielarz — chat kontekstowy _(killer feature)_

Chat z Gemini w personie **skalda-zielarza** który zna się na uprawach Wikingów i ma w kontekście:

- Gatunek rośliny (łacina + staronordyjska nazwa jeśli dostępna)
- Ostatnie 24h pomiarów (zagregowane)
- Historyczne alerty

Przykładowe pytania: _"Czemu liście żółkną?"_, _"Kiedy zbierać?"_, _"Czy przetrwa zimę w ziemiance?"_, _"Jak mądrze to posadzić pod Yggdrasilem mojego ogrodu?"_

Odpowiedzi stylizowane — skald miesza konkret z narracją: _"Słuchaj, jarl. Twój len trzykrotnie od świtu wołał o wodę. Jego korzenie — jak dusze zmarłych w Helu — pragną napoju. Zalej ziemię dwoma czerpakami przed zachodem słońca. Inaczej Freja odwróci wzrok, a zbiór będzie smętny."_

Przycisk **"Rzuć runy"** = natychmiastowa strukturalna analiza warunków + 1-3 konkretne akcje (ml wody, cm odległości od okna, godziny do działania).

### 7.4. Kronika (Saga) — historia pomiarów

- Wykresy liniowe per parametr (1 słońca / 1 dzień / 1 tydzień / 1 miesiąc — zamiast "h/d/w/m")
- Oznaczenia zdarzeń jako **zapiski w kronice**: _"Ósmy dzień miesiąca — podlano"_, _"Pełnia — przestawiono do okna"_
- **"Saga ogrodu"** — Gemini raz dziennie generuje 2-3 zdaniowy wpis kronikarski z ostatnich 24h: _"Dzień siódmy. Cieplejszy niż poprzedni. Len rósł w ciszy, Freja była łaskawa."_ — świetne dla engagementu i retencji
- Eksport kroniki jako PDF _(stretch)_ — stylizowany na manuskrypt

### 7.5. Ustawienia ogrodu

- Częstotliwość samplingu (_"Jak często Oko ma patrzeć"_)
- Progi alertów (auto z gatunku + manualna korekta)
- Powiadomienia push (_"Wezwania Freja"_)
- Tryb OLED, próg wake
- Firmware status + OTA update _(stretch)_
- **Tryb narracji:** Saga (pełna stylizacja) / Zwykły (konkretny polski, bez ozdób) — dla jurorów którzy nie kupują klimatu, pokażcie że umiecie się przełączyć

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
Jesteś botanikiem-zielarzem specjalizującym się w roślinach uprawianych w epoce wikińskiej
oraz we współczesnych zielnikach, warzywnikach i roślinach domowych w klimacie umiarkowanym.
Na podstawie zdjęcia zidentyfikuj gatunek. Jeśli nie jesteś pewien, podaj 2-3 alternatywy.
Podaj polską nazwę, staronordyjską (jeśli była znana Wikingom — np. Lín, Humli, Laukr)
oraz łacińską. Zakresy optymalne podaj dla uprawy domowej/przydomowej.
Dodaj `historical_use` — jak ta roślina była używana przez Wikingów (ubiór, jedzenie,
lekarstwo, rytuał) jeśli stosowne; jeśli to roślina pozaeuropejska/nowożytna, napisz "n/a".
```

**Response schema:**

```json
{
  "common_name_pl": "string",
  "common_name_old_norse": "string or null",
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
  "visible_issues": ["string"],
  "historical_use": "string"
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
Nazwa staronordyjska: {old_norse_name}
Optymalne zakresy: {optimal}
Aktualne odczyty: {current}
Średnie z 24h: {avg_24h}
Tryb narracji: {mode}  # "saga" albo "plain"

Oceń stan rośliny. Identyfikuj problemy. Zasugeruj 1-3 konkretne akcje z priorytetem.
Bądź konkretny: ilości w ml, odległości w cm, czas w godzinach.
Odpowiadaj po polsku. Max 150 słów w polu `message`.

Jeśli tryb = "saga": Użyj stylu skalda-zielarza. Odwołuj się do Freja/Frei, run, pór
roku według kalendarza wikińskiego. Zachowaj konkret (liczby!) ale ubierz go w narrację.
Jeśli tryb = "plain": Zwykły polski. Konkret, bez stylizacji.

Pole `actions` zawsze strukturalne (bez narracji), `message` dostosowane do trybu.
```

**Schema:**

```json
{
  "health_score": 0-100,
  "message": "string (stylizowany lub zwykły)",
  "issues": [{"severity": "low|medium|high", "description": "string"}],
  "actions": [{"priority": 1-3, "action": "string", "quantity": "string", "deadline_hours": number}]
}
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
  ttl: "1800s", // 30 min
});

// Kolejne wiadomości user-a
const resp = await client.models.generateContent({
  model: "gemini-3-flash-preview",
  contents: [userMessage],
  cached_content: cache.name,
  config: { thinking_config: { thinking_level: "low" } },
});
```

### 8.4. Tuning parametrów dla hackathonu

| Endpoint           | thinking_level | media_resolution | Typical tokens            |
| ------------------ | -------------- | ---------------- | ------------------------- |
| `/identify`        | medium         | high             | ~2000 in, ~400 out        |
| `/analyze`         | low            | —                | ~500 in, ~200 out         |
| `/chat` (simple Q) | low            | —                | ~300 in (cache), ~150 out |
| `/chat` (complex)  | medium         | —                | ~500 in (cache), ~400 out |

Szacowany koszt demo (~50 wywołań): **< $0.05**. Klucz API ze StudioMode + keszowanie = starczy spokojnie.

### 8.5. Gemini 3 — killer features do wykorzystania

- **Saga Generator** (nasz flagship) — raz dziennie endpoint `POST /saga` bierze agregaty 24h z jednego lub wielu ogrodów jarla i generuje wpis kronikarski w stylu sagi islandzkiej. Używamy `thinking_level: "medium"` + `temperature: 0.9` dla kreatywności. Wyjście: 2-4 zdania + sugestia tytułu wpisu (_"Saga o wodzie, której nie było"_). To jest co odróżnia naszą apkę od kolejnego dashboardu.
- **Spatial reasoning** — Gemini 3 Flash ma upgraded visual reasoning. Pytanie "gdzie na liściu jest przebarwienie?" zwraca konkretną lokalizację → nakładamy na zdjęcie w apce annotację ("tu wisi plama — prawdopodobnie grzyb"). Instant wow w demo.
- **Grounding with Google Search** — dla niszowych gatunków (zwłaszcza historycznych odmian lnu, jęczmienia browarniczego) włączamy grounding. Pitch: _"AI sięga do historycznych źródeł żeby zaleceć uprawę wg XI-wiecznych praktyk"_. Explainable AI z referencjami.
- **Long context 1M tokenów** — pełna historia pomiarów z 30 dni + pełne wpisy do Kroniki bez agregacji. Odpowiedzi chat bazują na faktycznej kilkutygodniowej historii, nie tylko na snapshoci.

---

## 9. Feature backlog (MoSCoW)

### Must have (MVP na hackathon)

- [ ] Firmware: BME280 + TEMT6000 + HW-390 → BLE notify
- [ ] Firmware: VL53L1X proximity wake + OLED display status + pomiarów (ekrany runiczne)
- [ ] Firmware: podstawowy power management (sleep między samplami, OLED off po timeoucie, MOSFET do sensorów)
- [ ] RN app: skan BLE, połączenie, live dashboard "Wzrok Freja"
- [ ] Zdjęcie → Gemini 3 Flash Vision → identyfikacja + staronordyjska nazwa + historyczne zastosowanie
- [ ] Porównanie pomiarów z zakresem optymalnym, kolorowe wskaźniki z runami
- [ ] Skald-Zielarz chat (tryb Saga + Plain do przełączania)

### Should have

- [ ] Kronika pomiarów (in-memory ring buffer + wykres + wpisy "dzień X...")
- [ ] Saga Generator (dzienny wpis od Gemini)
- [ ] Powiadomienia push _("Wezwania Freja")_ przy przekroczeniu progów
- [ ] LED status na urządzeniu sterowany z apki (zielony = łaska, czerwony = klątwa)
- [ ] Konfiguracja progu wake-up i trybu OLED z apki
- [ ] Adaptive sampling (wolniej w nocy, rzadsze advertising po długim braku połączenia)
- [ ] Battery level service BLE + widok stanu "ogniska" Oka w apce
- [ ] Kilka ogrodów per jarl (multi-device)

### Could have (_wow factor_)

- [ ] **Hordowy widok** — mapa grodu z kilkoma Freyr-Eye jako punkty na mapie, każdy z własnym statusem
- [ ] **Głos Freja** — LLM generuje komunikaty w pierwszej osobie rośliny/bóstwa (_"Jam jest len i wołam o wodę..."_) + TTS przez głośnik YD58 (łączy wszystkie peryferia w demo!)
- [ ] **Runy wzrostu** — ToF mierzy wysokość młodego drzewka/sadzonki w czasie, generuje "kronikę wzrostu"
- [ ] **Gesty nad Okiem** — pomachaj ręką raz = następna runa, dwa razy = cofnij (tanie "dotykowe" UI bez przycisku)
- [ ] **Wyprawa** — jarl wyjeżdża na Anglię, apka szacuje ile ogród wytrzyma i wysyła alerty zarządcy
- [ ] **Ragnarok Mode** — tryb ostrzegania o "końcu świata rośliny": gdy 3+ parametry są krytyczne, alarm głośny + czerwony LED + push
- [ ] **Kalendarz wikiński** — integracja z cyklem księżyca, dniami targowymi (Þingdagr), alerty _"Zbliża się Midgardsormr — ostatni dzień na zbiory przed zimą"_
- [ ] **Leaderboard grodów** — najzdrowszy ogród w całej "społeczności jarlów"

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

| Faza       | Czas                  | Cele                                                                                                                                              |
| ---------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0–2h**   | Setup                 | Monorepo (`app/`, `firmware/`, `backend/`, `docs/`), Nordic toolchain, RN project z BLE libką, klucz API, `docs/ble-contract.md` wstępnie spisany |
| **2–6h**   | Sensor bring-up       | Każdy czujnik osobno czyta poprawne wartości na DK. Apka pokazuje dummy dashboard.                                                                |
| **6–10h**  | BLE end-to-end        | Notify działa, RN odbiera i wyświetla liczby. **Działa naiwnie, bez power saving.**                                                               |
| **10–14h** | AI integration + OLED | Vision identyfikuje, `/analyze` zwraca rekomendacje. OLED rysuje 4 ekrany, ToF budzi wyświetlacz.                                                 |
| **14–17h** | Power optimization    | Sleep między samplami, OLED timeout, MOSFET na sensory, BLE connection params. Pomiar poboru — porównaj przed/po.                                 |
| **17–20h** | UI polish + wow       | Dashboard, kolorowe wskaźniki, chat. 1–2 features z "Could have".                                                                                 |
| **20–22h** | Integracja + testy    | End-to-end na prawdziwej roślinie. Pomiar ile urządzenie wytrzymało.                                                                              |
| **22–24h** | Demo + pitch          | Nagranie backupu wideo (**zawsze**), slajdy z wykresem poboru, próba.                                                                             |

---

## 12. Ryzyka i mitigacje

| Ryzyko                                                               | Mitigacja                                                                                                                                          |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| BLE nie paruje na Androidzie/iOS                                     | Testować na obu platformach od początku. Mieć emulator BLE jako fallback do demo.                                                                  |
| HW-390 daje szum / zły kalibrowany                                   | Średnia krocząca z 10 próbek + kalibracja przed demo (sucho/mokro).                                                                                |
| Gemini API rate limit / lag                                          | Cache rezultatów identyfikacji. Mieć przygotowane 2–3 gotowe "profile roślin" jako fallback.                                                       |
| Zdjęcie w słabym świetle = zła identyfikacja                         | Podpowiedzi w UI ("Zrób zdjęcie całej rośliny przy dziennym świetle").                                                                             |
| Bateria DK rozładuje się w trakcie demo                              | Podłączyć do power banku przez USB, mieć zapasowy.                                                                                                 |
| Firmware crash przed demo                                            | **Nie deployować nic na 2h przed prezentacją.** Freeze kodu.                                                                                       |
| Konflikt adresów I²C (BME280 + VL53L1X + OLED)                       | Sprawdzić adresy: BME280=0x76/77, VL53L1X=0x29, SSD1306=0x3C/3D. Jeśli kolizja → zmienić przez pin SDO/ADDR lub użyć drugiego I²C bus na nRF54L15. |
| OLED "duchy" / wolne odświeżanie                                     | Nie rysować od zera co frame — dirty regions albo partial update. Przy I²C 400kHz pełna klatka 128×64 to ~20ms, akceptowalnie.                     |
| VL53L1X false triggers (np. od firanki)                              | Hysteresis + wymagaj 2–3 odczytów pod progiem zanim wake.                                                                                          |
| Power saving wprowadza niestabilność BLE                             | Najpierw naiwna wersja (sample + notify co 30s bez sleep), potem dopiero optymalizacja. Nie łącz PM z debugiem BLE.                                |
| Sensor w głębokim sleep daje złe odczyty                             | BME280 forced mode — jeden pomiar, nie ciągły. Po wake do pomiaru zawsze odczekać settling time (~40ms dla BME280).                                |
| Niedokładny pomiar poboru prądu → nieprawdziwe "4 miesiące" w pitchu | Nie podawaj liczb których nie zmierzyłeś. Mów "szacowany X" + pokaż tabelkę z założeń. Szacunki oparte na datasheetach są OK, ale oznacz je jasno. |

---

## 13. Pitch — struktura 3 min

**Otwarcie wizualnie:** ciemny slajd, biały runiczny napis _"ᚠᚱᛖᛃᚱ'ᛋ ᛖᛃᛖ"_ rozjaśnia się jak wschód słońca nad fiordem. Cisza 2 sekundy.

1. **Hook (20s)** — _"Gdy zima trwała osiem miesięcy, a gród liczył dwieście dusz, zwiędła roślina oznaczała głód. Wikingowie nie mogli sobie pozwolić na martwy ogród."_ Slajd: rekonstrukcja skansenu (Wolin/Biskupin) z zielnikiem.
2. **Problem (30s)** — Inteligentne miasto to nie tylko transport i światła. To **produkcja żywności** — ogrody społecznościowe, zielniki w szkołach, skanseny, miejskie uprawy. Bez monitoringu giną przy pierwszej suszy. Klasyczne apki ogrodnicze nie rozumieją kontekstu — ani kulturowego, ani lokalnego.
3. **Rozwiązanie (50s)** — **Demo na żywo:**
   - Wkładamy Oko Freja w doniczkę z lnem/szałwią
   - Robimy zdjęcie → Gemini identyfikuje: _"Lín, len zwyczajny — Wikingowie robili z niego żagle"_
   - Dashboard pokazuje "Łaskę Freja: 67%" i runy pomiarów
   - Zbliżamy dłoń nad Oko → OLED się budzi z animacją oka, pokazuje status
   - Otwieramy Skalda-Zielarza: _"Czemu liście żółkną?"_ → odpowiedź w stylu sagi
   - Pokazujemy Sagę dnia wygenerowaną automatycznie
4. **Tech (30s)** — nRF54L15 + BLE 5.4 + Gemini 3 Flash. **Średni pobór 0.65 mA — jedna bateria 18650 starcza na ~4 miesiące.** Strażnik, który nie potrzebuje strażnika. Pokazać slajd z power budget.
5. **Skalowanie (20s)** — Od pojedynczego zielnika → do siatki Oczu w całym skansenie/ogrodzie społecznościowym. Mesh BLE, jedna apka jarla agreguje setki Freyr-Eye. Smart city produkujące własną żywność.
6. **Ask (10s)** — _"Zagłosujcie. A gdy wrócicie do domu — sprawdźcie swoje rośliny. Freja patrzy."_

**Rzeczy do pokazania na slajdach:**

- Slajd tytułowy: logo Freyr's Eye (można zrobić w Midjourney za 5 minut — oko w stylu runicznego wzoru)
- Mapa wartości: smart city = nie tylko transport; żywność to 30% emisji
- Screenshot dashboardu "Wzrok Freja" z runami i Łaską
- Wykres power budget (mA w czasie, PPK albo szacunek z datasheetów)
- Diagram skalowania: 1 Oko → 10 Oczu → skansen/dzielnica

---

## 14. Checklist dnia demo

- [ ] DK naładowany + kabel USB
- [ ] Telefon naładowany + zapasowy
- [ ] Hotspot na wypadek padu WiFi
- [ ] **Wideo backup** dema (nagrane wcześniej, gdyby BLE się sypnął)
- [ ] **Prawdziwa roślina z epoki wikińskiej** — najlepiej gałązka szałwii, tymianku, cebula dymka w ziemi, sadzonka lnu lub jęczmienia. Dostępne w Carrefourze/IKEI za ~15zł. **Wizualnie dużo mocniej zagra niż monstera.**
- [ ] Druga roślina na pokaz "porównania" (jedna OK, druga dramatycznie sucha → Freja odwraca wzrok)
- [ ] Przygotowana "mokra gąbka" żeby pokazać reakcję na zmianę wilgotności
- [ ] Drewniana podstawka pod DK _(opcjonalnie)_ — robi klimat. Kawałek deski + kilka runicznych znaków markerem = 10 minut roboty, 100× wzrost percepcji jakości.
- [ ] Slajdy na USB + w chmurze
- [ ] Zespół wie kto mówi kiedy
- [ ] **Przełącznik "tryb Saga / tryb zwykły"** sprawdzony — zawsze mieć przygotowanego jurora-sceptyka, który zapyta "a można bez tego całego teatru?". Macie na to gotową odpowiedź: _"Jasne, proszę."_ _kliknięcie_ demo działa normalnie → ogromny plus za **świadomość produktową**.

---

## Appendix A — Prompty do Gemini (szkice Saga-mode)

**Identyfikacja (v2 — Viking context):**

```
Jesteś botanikiem-zielarzem znającym uprawy epoki wikińskiej oraz współczesne rośliny
domowe i ogrodowe w klimacie umiarkowanym. Na podstawie zdjęcia:
1. Zidentyfikuj gatunek (polski + łacińska nazwa)
2. Jeśli roślina była znana Wikingom (len, jęczmień, chmiel, cebula, szałwia, krwawnik,
   dziurawiec, tymianek, bylica, rumianek, mięta, żywokost) — dodaj staronordyjską nazwę
   i krótką notkę o historycznym zastosowaniu
3. Jeśli to roślina pozaeuropejska lub wprowadzona po XII w. — uczciwie zaznacz "n/a"
   w polu historical_use
4. Podaj optymalne zakresy dla uprawy domowej/ogrodowej
Odpowiedz WYŁĄCZNIE poprawnym JSON wg response_schema.
```

**Analiza warunków (Saga mode):**

```
Gatunek: {species}
Nazwa staronordyjska: {old_norse_name}
Historyczne zastosowanie: {historical_use}
Optymalne zakresy: {optimal}
Aktualne odczyty: {current}
Średnie z 24h: {avg_24h}

Oceń stan rośliny jak stary skald-zielarz siedzący przy ogniu. Bądź konkretny:
liczby, ml wody, cm odległości, godziny do akcji. Stylizacja: odwołania do Freja/Frei,
run, pór roku według kalendarza wikińskiego, ale TYLKO w polu `message`.
Pole `actions` strukturalne i pragmatyczne, bez stylizacji.
Max 150 słów w `message`. Odpowiadaj po polsku.
```

**Saga Generator (daily):**

```
Ogród: {garden_name}
Rośliny: {plants_list}
Agregaty 24h per roślina: {aggregates}
Zdarzenia: {events}  # podlewania, alerty, ręczne wpisy

Napisz 2-4 zdania wpisu kronikarskiego w stylu sagi islandzkiej (Njáls saga, Egils saga).
Zawierać: faktyczne wydarzenia dnia, poetycką nazwę dnia (*"Dzień, w którym len zapomniał o wodzie"*),
subtelną mądrość. Bez przesady w stylizacji — skald oszczędza słów, nie sypie ich garścią.
Max 80 słów. Polski język, archaizowany lekko.

Zwróć JSON:
{
  "title": "string",
  "body": "string",
  "tone": "hopeful | neutral | ominous"
}
```

**Skald-Zielarz (chat, system prompt):**

```
Jesteś skaldem-zielarzem — starym mędrcem znającym rośliny epoki wikińskiej i współczesne.
Masz w kontekście:
- Gatunek rośliny jarla
- Optymalne warunki uprawy
- Aktualne i 24h-agregowane pomiary
- Historię ostatnich alertów

Odpowiadasz jarlu (użytkownikowi) konkretnie — zawsze liczby, akcje, terminy.
Stylizację (odwołania do bogów, run, pór roku wikińskich) stosuj umiarkowanie —
niech to będzie przyprawa, nie główne danie. Jeśli user przełączy `mode: plain`,
odpowiadasz zwykłym polskim bez stylizacji.

NIGDY nie wymyślaj faktów historycznych. Jeśli nie wiesz jak Wikingowie używali danej
rośliny — powiedz "Nie wiem, jak to ziele znali moi przodkowie" i daj konkretną
współczesną radę.
```

---

## Appendix B — Linki / rzeczy do sprawdzenia przed hackiem

- Nordic nRF Connect SDK docs (Zephyr BLE samples)
- `react-native-ble-plx` — setup pod iOS (wymaga permissions w Info.plist)
- Google Gemini API (`gemini-3-flash-preview`) — vision, thinking_level, context caching, structured outputs, ograniczenia rate
- HW-390 — przykładowe kody kalibracji (GitHub)
- BME280 driver dla Zephyr — już jest w SDK, wystarczy włączyć w Kconfig
- VL53L1X driver dla Zephyr — w SDK jako moduł, może wymagać dodatkowej konfiguracji w DTS
- U8g2 lub LVGL dla renderowania na OLED (SSD1306 / SH1106)
- **Font runiczny** — darmowe: "Ancient Runes", "Pixel Runes" (do ekranu OLED i w apce do nagłówków)
- Sagi islandzkie online (Njáls saga, Völuspá) — dla inspiracji stylu Gemini

---

## Appendix C — Rośliny epoki wikińskiej (dla Gemini knowledge)

Lista dla promptu + fallback profile gdy Gemini nie ma pewności:

| PL                   | Staronordyjski | Łacina                | Użycie                | Typ         |
| -------------------- | -------------- | --------------------- | --------------------- | ----------- |
| Len zwyczajny        | Lín            | Linum usitatissimum   | Włókno na żagle, olej | Uprawna     |
| Jęczmień zwyczajny   | Bygg           | Hordeum vulgare       | Chleb, piwo, kasza    | Zbożowa     |
| Chmiel zwyczajny     | Humli          | Humulus lupulus       | Piwo, konserwacja     | Pnąca       |
| Cebula               | Laukr          | Allium cepa           | Jedzenie, medycyna    | Warzywna    |
| Czosnek              | Geirlaukr      | Allium sativum        | Medycyna, przyprawa   | Warzywna    |
| Szałwia lekarska     | Salfa          | Salvia officinalis    | Zioła lecznicze       | Lecznicza   |
| Krwawnik pospolity   | Vallhumall     | Achillea millefolium  | Rany, krwawienia      | Lecznicza   |
| Dziurawiec zwyczajny | Jónsmessurunni | Hypericum perforatum  | Nastroje, rany        | Lecznicza   |
| Tymianek pospolity   | —              | Thymus vulgaris       | Przyprawa, medycyna   | Lecznicza   |
| Bylica piołun        | Malurt         | Artemisia absinthium  | Robaki, żołądek       | Lecznicza   |
| Rumianek             | Baldrsbrá      | Matricaria chamomilla | Sen, rany             | Lecznicza   |
| Mięta                | Minta          | Mentha                | Przyprawa, herbata    | Przyprawowa |
| Żywokost             | —              | Symphytum officinale  | Rany, złamania        | Lecznicza   |
| Bób                  | Baunir         | Vicia faba            | Jedzenie              | Strączkowa  |
| Kapusta              | Kál            | Brassica oleracea     | Jedzenie, kiszenie    | Warzywna    |
| Rzepa                | Næpa           | Brassica rapa         | Jedzenie              | Korzeniowa  |

**Uwaga:** niektóre nazwy staronordyjskie są poświadczone w sagach, inne to rekonstrukcje. Gemini powinno używać ich **tylko** gdy ma wysoką pewność — inaczej podawać pustą wartość w `common_name_old_norse`. W promptcie zaznaczyć: _"jeśli nie jesteś pewien staronordyjskiej nazwy, zwróć null — nie wymyślaj"_.

Te rośliny są dostępne w polskich marketach/ogrodnictwach i idealne na demo:

- **Len** — nasiona w markecie, rośnie szybko
- **Szałwia / tymianek / mięta** — gotowe sadzonki w Carrefourze, IKEI
- **Cebula dymka** — 3zł w warzywniaku, stawiasz w ziemi, rośnie w oczach
