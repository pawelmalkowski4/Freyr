# Power Budget

Dokument roboczy do pomiarów poboru prądu urządzenia.

## Docelowe stany

| Stan | Cel |
| --- | --- |
| RUN active | OLED on, BLE notify, szybki sampling |
| RUN idle | BLE połączone, OLED off, sampling co 30 s |
| DEEP SLEEP | brak połączenia, wake przez RTC lub ToF |
| SYSTEM OFF | najniższy pobór, wake przez GPIO |

## Do uzupełnienia

- Rzeczywisty pobór dla każdego stanu.
- Czas wybudzania OLED.
- Koszt energetyczny pojedynczego samplingu.
- Szacowana żywotność baterii dla interwałów 15 s / 30 s / 60 s.
