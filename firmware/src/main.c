#include <zephyr/kernel.h>
#include <stdio.h>

/* Moduł Bluetooth */
#include "ble/ble_freyr.h"

/* Twoje sensory */
#include "sensors/bme280.h"
#include "sensors/light_sensor.h" 
#include "sensors/soil_sensor.h"

int main(void)
{
    printf("\n*** START FREYR NODE (REAL HW) ***\n");

    if (ble_freyr_init() != 0) {
        printf("BLAD: Nie udalo sie zainicjowac Bluetooth!\n");
        return 0;
    }

    printf("Inicjalizacja czujnikow fizycznych...\n");
    
    if (bme280_init() != 0) printf("- BME280: BLAD!\n");
    else printf("- BME280: OK\n");

    if (light_sensor_init() != 0) printf("- Light Sensor: BLAD!\n");
    else printf("- Light Sensor: OK\n");

    if (soil_sensor_init() != 0) printf("- Soil Sensor: BLAD!\n");
    else printf("- Soil Sensor: OK\n");

    printf("\nSystem gotowy. Rozpoczynam odczyty...\n");

    while (1) {
        /* Deklarujemy zmienne raz na początku pętli */
        int16_t real_temp = 0;
        uint16_t real_hum = 0;
        int8_t soil_pct = -1;
        int32_t light_mv = -1;
        int32_t lux = 0;

        printf("\n--- ODCZYT SENSOROW ---\n");

        /* --- BME280 --- */
        if (bme280_read_for_ble(&real_temp, &real_hum) == 0) {
            printf("BME280 Powietrze:   Temp: %.2f C | Wilgotnosc: %.2f %%\n", 
                   real_temp / 100.0, real_hum / 100.0);
            ble_freyr_notify_temp(real_temp);
            ble_freyr_notify_humidity(real_hum);
        }

        /* --- GLEBA (HW-390) --- */
        soil_pct = soil_sensor_read_percentage();
        if (soil_pct >= 0) {
            printf("Wilgotnosc Gleby:   %d %%\n", soil_pct);
            ble_freyr_notify_soil(soil_pct);
        }

        /* --- ŚWIATŁO --- */
        /* Używamy nazwy funkcji, która jest w light_sensor.h */
        /* Jeśli w pliku .h masz inną nazwę, np. hw390_read_percent, zmień ją tutaj */
        light_mv = light_sensor_read_mv(); 
        
        if (light_mv >= 0) {
            lux = calculate_lux(light_mv); /* Upewnij się, że ta funkcja jest w main.c lub light_sensor.h */
            printf("Natezenie Swiatla:  %d lux (Sygnal: %d mV)\n", lux, light_mv);
            ble_freyr_notify_light(lux);
        }

        /* --- CZAS --- */
        uint16_t sleep_sec = ble_freyr_get_sampling_interval();
        if (sleep_sec < 1) sleep_sec = 1; 

        printf("Nastepny pomiar za: %d sekund...\n", sleep_sec);
        k_msleep(sleep_sec * 1000);
    }
}