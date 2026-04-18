#include <zephyr/kernel.h>
#include <stdio.h>
#include "sensors/light_sensor.h"
#include "sensors/ultrasonic.h"
#include "sensors/bme280.h"

int main(void)
{
    printf("\n*** START SYSTEMU POMIAROWEGO ***\n");

    if (light_sensor_init() != 0) {
        printf("Błąd ADC (Swiatlo)!\n");
    }

    if (ultrasonic_init() != 0) {
        printf("Błąd GPIO (HC-SR04)!\n");
    }

    if (bme280_init() != 0) {
        printf("Błąd I2C (BME280)! Sprawdź kable i adres I2C.\n");
    }

    while (1) {
        int32_t lux_mv = light_sensor_read_mv();
        double dist = ultrasonic_get_distance_cm();

        printf("\n--- ODCZYT CZUJNIKOW ---\n");
        
        /* 1. Światło */
        if (lux_mv >= 0) {
            printf("Swiatlo:  %d mV\n", lux_mv);
        }
        
        
        /* 2. Dystans */
        if (dist == -1.0) {
            printf("Dystans:  Blad (-1) - Czujnik milczy\n");
        } else if (dist == -2.0) {
            printf("Dystans:  Blad (-2) - Zawieszone na 1\n");
        } else {
            printf("Dystans:  %.2f cm\n", dist);
        }

        /* 3. BME280 */
        bme280_print_data();

        k_msleep(2000); /* Zmiana na 2 sekundy dla czytelności w terminalu */
    }
}