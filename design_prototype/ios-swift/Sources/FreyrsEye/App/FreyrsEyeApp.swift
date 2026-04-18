import SwiftUI

@main
struct FreyrsEyeApp: App {
    @StateObject private var appState = AppState()
    @StateObject private var sensors = SensorStore()
    @StateObject private var ble = BLEManager()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(appState)
                .environmentObject(sensors)
                .environmentObject(ble)
                .task {
                    // Mock mode on by default so UI works without hardware
                    if BLEManager.MOCK_MODE {
                        ble.startMockStream(into: sensors)
                    } else {
                        ble.start()
                    }
                }
        }
    }
}
