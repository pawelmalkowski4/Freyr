# Freyr's Eye — iOS (SwiftUI)

Native iOS alternative to the React Native app. Same GATT contract, same backend, same design tokens.

## Stack
- SwiftUI (iOS 17+)
- CoreBluetooth (replaces react-native-ble-plx)
- URLSession + async/await (replaces fetch wrapper)
- UserDefaults + Codable (replaces Zustand persist)

## Project layout

```
ios-swift/
├── Package.swift
└── Sources/FreyrsEye/
    ├── App/FreyrsEyeApp.swift             # @main entry
    ├── Theme/Theme.swift                  # design tokens (synced with prototype-style.css)
    ├── BLE/
    │   ├── GATT.swift                     # UUIDs (sync with firmware)
    │   └── BLEManager.swift               # CBCentralManager + MOCK_MODE
    ├── State/
    │   ├── AppState.swift                 # plants, tone, onboarding (Codable + UserDefaults)
    │   └── SensorStore.swift              # live values + graceScore
    ├── API/APIClient.swift                # Cloudflare Worker proxy
    ├── Components/Components.swift        # Card, SensorBar, Chip, NavHead
    ├── Navigation/RootView.swift          # TabView
    └── Screens/
        ├── OnboardingView.swift
        ├── DashboardView.swift            # Wzrok Freja
        ├── ChatView.swift                 # Skald
        ├── KronikaView.swift              # Saga + Znaki
        ├── HordaView.swift
        └── SettingsView.swift
```

## Setup — how to turn this into a running Xcode app

Swift Package alone can't run on device (needs an Xcode app target for Info.plist + entitlements). Two options:

### Option A — Drop into a new Xcode project
1. Open Xcode → **New Project → iOS → App** (SwiftUI, Swift, iOS 17)
2. Name: `FreyrsEye`, bundle id: `io.freyrs.eye`
3. Delete the generated `ContentView.swift` and `FreyrsEyeApp.swift`
4. Drag all `Sources/FreyrsEye/**/*.swift` files into the project
5. Add Info.plist keys:
   - `NSBluetoothAlwaysUsageDescription` — "Freyr's Eye łączy się z czujnikiem rośliny."
   - `NSCameraUsageDescription` — "Aparat służy do identyfikacji gatunku."
   - `FEBackendURL` — your Cloudflare Worker URL (once backend is deployed)
6. Build & run on device (BLE doesn't work in simulator)

### Option B — Use as Swift Package in your own app
`.package(path: "../ios-swift")` then `import FreyrsEye`.

## Mock mode
`BLEManager.MOCK_MODE = true` — app runs in simulator with synthesized sensor stream. Flip to `false` once firmware advertises `0000AAAA-...`.

## Fonts
Cormorant Garamond + Inter + JetBrains Mono. Drop `.ttf` into project, add to `UIAppFonts` in Info.plist. Fallbacks are system fonts if missing.

## Why ship both RN and Swift?
- **RN scaffold** (`/app/`) — faster iteration, iOS + Android one codebase, good for MVP/demo
- **Swift scaffold** (this folder) — native polish, better BLE stability long-term, no Expo prebuild dance
Pick one. Both talk to the same `firmware/` GATT service and `backend/` endpoints.
