#ifndef BLE_FREYR_H
#define BLE_FREYR_H

#include <stdint.h>

/**
 * @brief Inicjalizuje stos Bluetooth i zaczyna rozgłaszanie (Advertising).
 */
int ble_freyr_init(void);

/**
 * @brief Aktualizuje i wysyła powiadomienie (Notify) o temperaturze.
 * @param temp_celsius Temperatura w formacie (C * 100)
 */
void ble_freyr_notify_temp(int16_t temp_celsius);

/**
 * @brief Aktualizuje i wysyła powiadomienie (Notify) o wilgotności.
 * @param humidity_pct Wilgotność w formacie (% * 100)
 */
void ble_freyr_notify_humidity(uint16_t humidity_pct);

/* Funkcja do pobierania ustawionego przez BLE interwału */
uint16_t ble_freyr_get_sampling_interval(void);

#endif