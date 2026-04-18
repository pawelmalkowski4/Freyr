#ifndef ULTRASONIC_H
#define ULTRASONIC_H

#include <stdint.h>

/**
 * @brief Inicjalizuje czujnik HC-SR04.
 */
int ultrasonic_init(void);

/**
 * @brief Odczytuje odległość w centymetrach.
 * @return Odległość w cm lub wartość ujemna przy błędzie.
 */
double ultrasonic_get_distance_cm(void);

#endif