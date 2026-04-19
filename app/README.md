# Freyr's Eye — Mobile App

React Native (Expo Dev Client) — AIoT plant guardian for the "Inteligentne miasto Wikingów" hackathon.

## Stack
- Expo SDK 51 + Dev Client (BLE requires custom native build, not Go)
- React Navigation (bottom tabs + native stack)
- Zustand (state, persisted via AsyncStorage)
- react-native-ble-plx (BLE 5.4)
- react-native-svg + Victory Native (charts)
- TypeScript

## Setup

```bash
cd app
npm install
npx expo prebuild --clean   # generates ios/ and android/
npx expo run:ios            # or run:android
```

Then in another terminal: `npm start` to launch Metro.

> **Why not Expo Go?** `react-native-ble-plx` is a native module — needs a Dev Client build. After `prebuild`, install the dev client on your device once; subsequent JS changes hot-reload.

## Project layout

```
app/
├── App.tsx                          # entry, mounts Root navigator
├── app.json                         # Expo config (perms, plugins)
├── package.json
├── tsconfig.json (alias: @/* → src/*)
└── src/
    ├── ble/
    │   ├── contract.ts              # GATT UUIDs (sync with firmware)
    │   ├── codec.ts                 # byte → typed value decoders
    │   └── manager.ts               # scan/connect, MOCK_MODE for dev w/o HW
    ├── state/
    │   ├── app.ts                   # plants, tone, onboarding (persisted)
    │   └── sensors.ts               # live sensor values + graceScore()
    ├── api/client.ts                # backend proxy: identify/analyze/chat/saga
    ├── theme/tokens.ts              # colors/fonts from prototype
    ├── components/index.tsx         # Card, SensorBar, Chip, Rune, Mono
    ├── navigation/Root.tsx          # tabs + onboarding gate
    └── screens/                     # 7 screens (one file each, see /index.tsx for impls)
```

## Mock mode (no firmware needed)
`src/ble/manager.ts` ships with `MOCK_MODE = true` — synthesizes plausible sensor data so you can iterate UI before HW is ready. Flip to `false` once `firmware/` is advertising.

## Backend
Set `BACKEND_URL` in `app.json → expo.extra.BACKEND_URL` to your Cloudflare Worker URL once `backend/` is deployed. Until then, `mockApi` in `src/api/client.ts` returns the demo plant.

## Adding fonts
Cormorant Garamond + Inter + JetBrains Mono — load with `expo-font` in `App.tsx` (TODO).

## Permissions
- iOS: NSBluetoothAlwaysUsageDescription, NSCameraUsageDescription (in `app.json`)
- Android: BLUETOOTH_SCAN/CONNECT + ACCESS_FINE_LOCATION (in `app.json`)

## Next steps for MVP
1. Run `prebuild` + `run:ios`/`run:android` — verify shell renders
2. Add real fonts via `expo-font`
3. Replace `mockApi` with deployed backend URL
4. Flip `MOCK_MODE = false` when firmware advertises `0000aaaa-...` service
5. Port full Horda map + Victory charts from prototype HTML
