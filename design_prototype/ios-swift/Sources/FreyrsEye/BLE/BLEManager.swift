import Foundation
import CoreBluetooth
import Combine

@MainActor
final class BLEManager: NSObject, ObservableObject {
    /// Flip to false once firmware is advertising.
    static let MOCK_MODE = true

    @Published var state: CBManagerState = .unknown
    @Published var discovered: [CBPeripheral] = []
    @Published var connected: CBPeripheral?

    private var central: CBCentralManager!
    private var sensorStore: SensorStore?
    private var mockTask: Task<Void, Never>?

    func start() {
        central = CBCentralManager(delegate: self, queue: .main)
    }

    func scan() {
        guard central?.state == .poweredOn else { return }
        discovered.removeAll()
        central.scanForPeripherals(withServices: [GATT.serviceUUID], options: nil)
        DispatchQueue.main.asyncAfter(deadline: .now() + 8) { [weak self] in
            self?.central?.stopScan()
        }
    }

    func connect(_ p: CBPeripheral) {
        central.connect(p, options: nil)
    }

    // MARK: - Mock

    func startMockStream(into store: SensorStore) {
        self.sensorStore = store
        store.connected = true
        store.deviceName = "Freyr-Eye-A7F2"
        mockTask = Task { [weak store] in
            var t = 0.0
            while !Task.isCancelled {
                await MainActor.run {
                    store?.temp     = 22 + sin(t / 6) * 1.5
                    store?.humidity = 48 + sin(t / 8) * 6
                    store?.pressure = 101_300 + sin(t / 10) * 80
                    store?.light    = 700 + sin(t / 4) * 250
                    store?.soil     = Int(58 + sin(t / 12) * 5)
                    store?.battery  = 87
                    store?.lastUpdate = Date()
                }
                t += 1
                try? await Task.sleep(nanoseconds: 1_500_000_000)
            }
        }
    }

    func stop() {
        mockTask?.cancel()
        if let p = connected { central?.cancelPeripheralConnection(p) }
    }
}

extension BLEManager: CBCentralManagerDelegate, CBPeripheralDelegate {
    nonisolated func centralManagerDidUpdateState(_ central: CBCentralManager) {
        Task { @MainActor in self.state = central.state }
    }

    nonisolated func centralManager(_ central: CBCentralManager,
                                     didDiscover peripheral: CBPeripheral,
                                     advertisementData: [String: Any],
                                     rssi RSSI: NSNumber) {
        Task { @MainActor in
            if !self.discovered.contains(where: { $0.identifier == peripheral.identifier }) {
                self.discovered.append(peripheral)
            }
        }
    }

    nonisolated func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        Task { @MainActor in
            peripheral.delegate = self
            self.connected = peripheral
            peripheral.discoverServices([GATT.serviceUUID, GATT.batteryService])
        }
    }

    nonisolated func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
        for svc in peripheral.services ?? [] {
            peripheral.discoverCharacteristics(nil, for: svc)
        }
    }

    nonisolated func peripheral(_ peripheral: CBPeripheral,
                                 didDiscoverCharacteristicsFor service: CBService,
                                 error: Error?) {
        for ch in service.characteristics ?? [] where ch.properties.contains(.notify) {
            peripheral.setNotifyValue(true, for: ch)
        }
    }

    nonisolated func peripheral(_ peripheral: CBPeripheral,
                                 didUpdateValueFor characteristic: CBCharacteristic,
                                 error: Error?) {
        guard let data = characteristic.value else { return }
        Task { @MainActor in
            self.handle(characteristic: characteristic.uuid, data: data)
        }
    }

    @MainActor
    private func handle(characteristic uuid: CBUUID, data: Data) {
        guard let s = sensorStore else { return }
        switch uuid {
        case GATT.temp:     s.temp     = Double(data.readInt16LE(at: 0)) / 100
        case GATT.humidity: s.humidity = Double(data.readUInt16LE(at: 0)) / 100
        case GATT.pressure: s.pressure = Double(data.readUInt32LE(at: 0))
        case GATT.light:    s.light    = Double(data.readUInt16LE(at: 0))
        case GATT.soil:     s.soil     = Int(data.readUInt8(at: 0))
        case GATT.batteryLevel: s.battery = Int(data.readUInt8(at: 0))
        default: break
        }
        s.lastUpdate = Date()
    }
}

// MARK: - Data decoders

extension Data {
    func readUInt8(at offset: Int) -> UInt8 { self[offset] }
    func readInt16LE(at offset: Int) -> Int16 {
        Int16(self[offset]) | (Int16(self[offset + 1]) << 8)
    }
    func readUInt16LE(at offset: Int) -> UInt16 {
        UInt16(self[offset]) | (UInt16(self[offset + 1]) << 8)
    }
    func readUInt32LE(at offset: Int) -> UInt32 {
        UInt32(self[offset]) |
        (UInt32(self[offset + 1]) << 8) |
        (UInt32(self[offset + 2]) << 16) |
        (UInt32(self[offset + 3]) << 24)
    }
}
