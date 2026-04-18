/**
 * BLE GATT contract — must match firmware/docs/ble-contract.md
 * UUIDs from README §5.
 */

export const FREYR_SERVICE_UUID = '0000aaaa-0000-1000-8000-00805f9b34fb';

export const CHARS = {
  TEMP:        '0000aaa1-0000-1000-8000-00805f9b34fb', // int16 LE, °C×100
  HUMIDITY:    '0000aaa2-0000-1000-8000-00805f9b34fb', // uint16 LE, %×100
  SOIL:        '0000aaa3-0000-1000-8000-00805f9b34fb', // int8 LE, % (negative = error)
  LIGHT:       '0000aaa4-0000-1000-8000-00805f9b34fb', // int32 LE, lux (negative = error)
  INTERVAL:    '0000aaa6-0000-1000-8000-00805f9b34fb', // uint16 s
  DEVICE_NAME: '0000aaa7-0000-1000-8000-00805f9b34fb', // utf8
  LED_STATUS:  '0000aaa8-0000-1000-8000-00805f9b34fb', // uint8 enum
  WAKE_DIST:   '0000aaa9-0000-1000-8000-00805f9b34fb', // uint16 mm
  DISPLAY:     '0000aaaa-0000-1000-8000-00805f9b34fb', // uint8 enum
};

// Standard Battery Service
export const BATTERY_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb';
export const BATTERY_LEVEL_CHAR   = '00002a19-0000-1000-8000-00805f9b34fb';

export const LED_STATES = { OFF: 0, GREEN: 1, YELLOW: 2, RED: 3 } as const;
export const DISPLAY_MODES = { AUTO: 0, ALWAYS_ON: 1, OFF: 2 } as const;
