#ifndef BME280_SENSOR_H
#define BME280_SENSOR_H

#include <stdint.h>

/**
 * @brief Inicjalizuje czujnik BME280.
 * @return 0 przy sukcesie, kod błędu przy porażce.
 */
int bme280_init(void);

/**
 * @brief Odczytuje i wypisuje w terminalu dane z BME280.
 */
void bme280_print_data(void);

/** * @brief Pobiera dane z BME280 do wysyłki po BLE
 * @param temp Wskaźnik na zmienną temperatury (zwraca np. 2250 dla 22.50 °C)
 * @param hum Wskaźnik na zmienną wilgotności powietrza (zwraca np. 4500 dla 45.00 %)
 * @return 0 w przypadku sukcesu, -1 przy błędzie
 */
int bme280_read_for_ble(int16_t *temp, uint16_t *hum);

#endif