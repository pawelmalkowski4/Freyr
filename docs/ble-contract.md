# BLE Contract

Źródło prawdy dla komunikacji między `firmware/` i `app/`.

## Service

- Service UUID: `0000aaaa-0000-1000-8000-00805f9b34fb`

## Characteristics

| Name | UUID | Format | Direction |
| --- | --- | --- | --- |
| Temperature | `0000aaa1-0000-1000-8000-00805f9b34fb` | `int16` LE, °C × 100 | notify/read |
| Humidity | `0000aaa2-0000-1000-8000-00805f9b34fb` | `uint16` LE, % × 100 | notify/read |
| Soil moisture | `0000aaa3-0000-1000-8000-00805f9b34fb` | `int8` LE, % (ujemne = błąd odczytu) | notify/read |
| Light | `0000aaa4-0000-1000-8000-00805f9b34fb` | `int32` LE, lux (ujemne = błąd odczytu) | notify/read |
| Sampling interval | `0000aaa6-0000-1000-8000-00805f9b34fb` | `uint16`, sekundy | read/write |
| Device name | `0000aaa7-0000-1000-8000-00805f9b34fb` | UTF-8 | read/write |
| LED status | `0000aaa8-0000-1000-8000-00805f9b34fb` | `uint8` enum | write |
| Wake distance | `0000aaa9-0000-1000-8000-00805f9b34fb` | `uint16`, mm | read/write |
| Display mode | `0000aaaa-0000-1000-8000-00805f9b34fb` | `uint8` enum | read/write |

## Notes

- Każda zmiana UUID albo formatu bajtów wymaga aktualizacji `app/src/ble/contract.ts`.
- Aplikacja trzyma mock stream do czasu pojawienia się faktycznego advertisingu z firmware.
