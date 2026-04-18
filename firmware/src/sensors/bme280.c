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

int bme280_read_for_ble(int16_t *temp, uint16_t *hum)
{
    struct sensor_value t, h;
    
    if (sensor_sample_fetch(bme_dev) < 0) {
        return -1;
    }

    sensor_channel_get(bme_dev, SENSOR_CHAN_AMBIENT_TEMP, &t);
    sensor_channel_get(bme_dev, SENSOR_CHAN_HUMIDITY, &h);

    /* Konwersja na double, a potem mnożenie przez 100 (np. 22.53 * 100 = 2253) */
    *temp = (int16_t)(sensor_value_to_double(&t) * 100.0);
    *hum  = (uint16_t)(sensor_value_to_double(&h) * 100.0);

    return 0;
}