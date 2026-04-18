# Firmware

Szkielet pod implementację firmware dla nRF54L15-DK w oparciu o Zephyr.

## Plan katalogów

- `src/main.c` - punkt wejścia i orkiestracja.
- `src/sensors/` - odczyty czujników.
- `src/display/` - render OLED.
- `src/ble/` - custom GATT service.
- `src/power/` - polityka uśpienia i wybudzania.

Repo zawiera na razie tylko szkic struktury. Implementacja sterowników i build Zephyra jest jeszcze do wykonania.
