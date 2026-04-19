#ifndef BLE_FREYR_H
#define BLE_FREYR_H

#include <stdint.h>

int ble_freyr_init(void);

/* Funkcje notyfikujące (wypychające dane do telefonu) */
void ble_freyr_notify_temp(int16_t temp_celsius);
void ble_freyr_notify_humidity(uint16_t humidity_pct);
void ble_freyr_notify_soil(int8_t soil_pct);
void ble_freyr_notify_light(int32_t lux);

/* Funkcje pobierające ustawienia (z telefonu do urządzenia) */
uint16_t ble_freyr_get_sampling_interval(void);

#endif /* BLE_FREYR_H */