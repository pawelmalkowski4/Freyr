#ifndef BME280_SENSOR_H
#define BME280_SENSOR_H

/**
 * @brief Inicjalizuje czujnik BME280.
 * @return 0 przy sukcesie, kod błędu przy porażce.
 */
int bme280_init(void);

/**
 * @brief Odczytuje i wypisuje w terminalu dane z BME280.
 */
void bme280_print_data(void);

#endif