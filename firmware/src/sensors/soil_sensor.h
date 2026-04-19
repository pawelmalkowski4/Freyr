#ifndef SOIL_SENSOR_H
#define SOIL_SENSOR_H

#include <stdint.h>

/** * @brief Inicjalizacja ADC dla czujnika gleby 
 * @return 0 w przypadku sukcesu, wartość ujemna przy błędzie
 */
int soil_sensor_init(void);

/** * @brief Odczyt wilgotności gleby w procentach
 * @return Wartość 0 - 100 (%) lub -1 w przypadku błędu
 */
int8_t soil_sensor_read_percentage(void);

#endif /* SOIL_SENSOR_H */