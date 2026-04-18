# Freyr's Eye 🌱⚔️

Hackathon monorepo: **AIoT plant guardian** dla Inteligentnego Miasta Wikingów.

## Komponenty

| Folder | Stan | Opis |
|---|---|---|
| `app/` | ✅ Scaffold gotowy | React Native + Expo Dev Client. Otwórz `app/README.md`. |
| `ios-swift/` | ✅ Scaffold gotowy | Natywny iOS (SwiftUI + CoreBluetooth). Otwórz `ios-swift/README.md`. |
| `firmware/` | ⏳ Robi Bolek + Paweł | Zephyr / nRF54L15-DK. |
| `backend/` | ⏳ Do zrobienia | Cloudflare Worker proxy do Gemini 3 Flash. |
| `Freyr's Eye — Prototype.html` | ✅ Hi-fi mockup | Klikalny prototyp HTML (źródło designu dla `app/`). |
| `Freyr's Eye — Wireframes.html` | ✅ Wireframes | 5 ekranów × 3 warianty. |
| `uploads/README-1.md` | 📖 Brief | Pełny opis produktu, GATT contract, prompty Gemini. |

## Quick start (mobile app)

```bash
cd app
npm install
npx expo prebuild --clean
npx expo run:ios   # albo run:android
```

`MOCK_MODE = true` w `app/src/ble/manager.ts` symuluje czujnik — możesz developować UI bez DK.

## Następne kroki

1. **Push na GitHub** — zip `app/` + ten root, zrób repo `freyrs-eye`
2. **Backend** — Cloudflare Worker z endpointami `/identify`, `/analyze`, `/chat`, `/saga` (prompty w `uploads/README-1.md` Appendix A)
3. **Firmware** — synchronizacja kontraktu GATT (`app/src/ble/contract.ts` ↔ `firmware/docs/ble-contract.md`)
