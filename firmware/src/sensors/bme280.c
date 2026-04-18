#include "bme280.h"
#include <zephyr/device.h>
#include <zephyr/drivers/sensor.h>
#include <stdio.h>

/* Pobieramy urządzenie z naszego aliasu/etykiety w overlay */
static const struct device *bme_dev = DEVICE_DT_GET(DT_NODELABEL(bme280));

int bme280_init(void)
{
    if (!device_is_ready(bme_dev)) {
        return -ENODEV;
    }
    return 0;
}

void bme280_print_data(void)
{
    struct sensor_value temp, press, humidity;
    
    /* Pobranie nowych próbek z czujnika */
    if (sensor_sample_fetch(bme_dev) < 0) {
        printf("BME280: Blad odczytu!\n");
        return;
    }

    /* Wyciągnięcie konkretnych danych */
    sensor_channel_get(bme_dev, SENSOR_CHAN_AMBIENT_TEMP, &temp);
    sensor_channel_get(bme_dev, SENSOR_CHAN_PRESS, &press);
    sensor_channel_get(bme_dev, SENSOR_CHAN_HUMIDITY, &humidity);

    printf("BME280 -> Temp: %.1f C | Cisnienie: %.1f hPa | Wilgotnosc: %.1f %%\n",
           sensor_value_to_double(&temp),
           sensor_value_to_double(&press) * 10.0, /* Zephyr podaje ciśnienie w kPa, mnożymy razy 10 dla hPa */
           sensor_value_to_double(&humidity));
}