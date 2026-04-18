#ifndef LIGHT_SENSOR_H
#define LIGHT_SENSOR_H

#include <stdint.h>

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

#endif