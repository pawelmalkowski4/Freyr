#ifndef LIGHT_SENSOR_H
#define LIGHT_SENSOR_H

#include <stdint.h>
#define LIGHT_MIN_MV 28      // Całkowita ciemność
#define LIGHT_MAX_MV 3262    // Mocna latarka / Pełne słońce
#define MAX_LUX 30000.0      // Ile luksów przypisać do latarki

/**
 * @brief Inicjalizuje ADC dla czujnika światła.
 * @return 0 przy sukcesie, ujemny kod błędu przy porażce.
 */
int light_sensor_init(void);

/**
 * @brief Odczytuje wartość z czujnika i przelicza na mV.
 * @return Napięcie w mV lub -1 w przypadku błędu.
 */
int32_t light_sensor_read_mv(void);

int32_t calculate_lux(int32_t current_mv);

#endif