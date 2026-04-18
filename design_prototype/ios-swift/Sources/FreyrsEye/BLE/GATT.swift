import Foundation
import CoreBluetooth

/// GATT contract — must match firmware/docs/ble-contract.md and app/src/ble/contract.ts
enum GATT {
    static let serviceUUID = CBUUID(string: "0000AAAA-0000-1000-8000-00805F9B34FB")

    static let temp       = CBUUID(string: "0000AAA1-0000-1000-8000-00805F9B34FB") // int16 °C×100
    static let humidity   = CBUUID(string: "0000AAA2-0000-1000-8000-00805F9B34FB") // uint16 %×100
    static let pressure   = CBUUID(string: "0000AAA3-0000-1000-8000-00805F9B34FB") // uint32 Pa
    static let light      = CBUUID(string: "0000AAA4-0000-1000-8000-00805F9B34FB") // uint16 lux
    static let soil       = CBUUID(string: "0000AAA5-0000-1000-8000-00805F9B34FB") // uint8 %
    static let interval   = CBUUID(string: "0000AAA6-0000-1000-8000-00805F9B34FB") // uint16 s
    static let deviceName = CBUUID(string: "0000AAA7-0000-1000-8000-00805F9B34FB") // utf8
    static let ledStatus  = CBUUID(string: "0000AAA8-0000-1000-8000-00805F9B34FB") // uint8 enum
    static let wakeDist   = CBUUID(string: "0000AAA9-0000-1000-8000-00805F9B34FB") // uint16 mm
    static let displayMode = CBUUID(string: "0000AAAA-0000-1000-8000-00805F9B34FB") // uint8 enum

    static let batteryService = CBUUID(string: "180F")
    static let batteryLevel   = CBUUID(string: "2A19")

    static let allSensorChars: [CBUUID] = [temp, humidity, pressure, light, soil]
}

enum LEDState: UInt8 { case off = 0, green = 1, yellow = 2, red = 3 }
enum DisplayMode: UInt8 { case auto = 0, alwaysOn = 1, off = 2 }
