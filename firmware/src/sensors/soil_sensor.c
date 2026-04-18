#include "soil_sensor.h"
#include <zephyr/drivers/adc.h>
#include <zephyr/device.h>
#include <stdio.h>

/* Pobieramy alias adc0 z DeviceTree */
#define ADC_NODE DT_ALIAS(adc0)

static const struct device *adc_dev = DEVICE_DT_GET(ADC_NODE);

/* Konfiguracja dla channel_1 (czujnik gleby) */
static const struct adc_channel_cfg soil_channel_cfg = 
    ADC_CHANNEL_CFG_DT(DT_CHILD(ADC_NODE, channel_1));

static uint16_t sample_buffer;

/* Twoje stałe z kalibracji */
#define SOIL_VAL_DRY 3000
#define SOIL_VAL_WET 2200

int soil_sensor_init(void)
{
    if (!device_is_ready(adc_dev)) {
        return -1;
    }

    return adc_channel_setup(adc_dev, &soil_channel_cfg);
}

int8_t soil_sensor_read_percentage(void)
{
    struct adc_sequence sequence = {
        .channels    = BIT(soil_channel_cfg.channel_id),
        .buffer      = &sample_buffer,
        .buffer_size = sizeof(sample_buffer),
        .resolution  = 12,
    };

    int err = adc_read(adc_dev, &sequence);
    if (err < 0) {
        return -1; /* Błąd sprzętowy odczytu */
    }

    uint16_t raw = sample_buffer;

    /* 1. Zabezpieczenie granic (Clamp) przed dziwnymi wartościami */
    if (raw >= SOIL_VAL_DRY) {
        return 0;   /* Ekstremalnie sucho */
    }
    if (raw <= SOIL_VAL_WET) {
        return 100; /* Ekstremalnie mokro (lub zanurzone w wodzie) */
    }

    /* 2. Przeliczenie na procenty (odwrotna logika) */
    /* Odwracamy wzór: 100 - (procentowa odległość od stanu mokrego) */
    int percentage = 100 - ((raw - SOIL_VAL_WET) * 100) / (SOIL_VAL_DRY - SOIL_VAL_WET);
    
    return (int8_t)percentage;
}