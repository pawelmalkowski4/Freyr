# Freyr's Eye — Oko Freja 🌱⚔️

## AIoT strażnik świętych ogrodów dla Inteligentnego Miasta Wikingów

Aplikacja mobilna (React Native + Expo), backend proxy (Hono/Cloudflare Workers) oraz firmware na nRF54L15-DK. System monitoruje warunki upraw, **identyfikuje gatunki roślin przez Gemini Vision** i **weryfikuje warunki wzrostu** na podstawie pomiarów z czujników — inteligentny strażnik zielnika, spichlerza i ogrodu osadniczego, z wbudowanym skaldem-doradcą.

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
