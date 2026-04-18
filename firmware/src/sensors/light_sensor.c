#include "light_sensor.h"
#include <zephyr/drivers/adc.h>
#include <zephyr/device.h>
#include <stdio.h>

#define ADC_NODE DT_ALIAS(adc0)

static const struct device *adc_dev = DEVICE_DT_GET(ADC_NODE);
static const struct adc_channel_cfg my_channel_cfg = 
    ADC_CHANNEL_CFG_DT(DT_CHILD(ADC_NODE, channel_0));

static uint32_t vref_mv;
static uint16_t sample_buffer;

int light_sensor_init(void)
{
    int err;

    if (!device_is_ready(adc_dev)) {
        return -ENODEV;
    }

    err = adc_channel_setup(adc_dev, &my_channel_cfg);
    if (err < 0) {
        return err;
    }

    vref_mv = adc_ref_internal(adc_dev);
    return 0;
}

int32_t light_sensor_read_mv(void)
{
    int err;
    int32_t val_mv;

    struct adc_sequence sequence = {
        .channels    = BIT(my_channel_cfg.channel_id),
        .buffer      = &sample_buffer,
        .buffer_size = sizeof(sample_buffer),
        .resolution  = 12,
    };

    err = adc_read(adc_dev, &sequence);
    if (err < 0) {
        return -1;
    }

    val_mv = (int32_t)sample_buffer;
    err = adc_raw_to_millivolts(vref_mv, my_channel_cfg.gain, sequence.resolution, &val_mv);
    
    if (err < 0) {
        return -1;
    }

    return val_mv;
}

int32_t calculate_lux(int32_t current_mv)
{
    if (current_mv <= LIGHT_MIN_MV) return 0;

    /* Wyliczamy "jasność" w skali 0.0 - 1.0 */
    double normalized = (double)(current_mv - LIGHT_MIN_MV) / (LIGHT_MAX_MV - LIGHT_MIN_MV);
    
    if (normalized > 1.0) normalized = 1.0;

    /* Używamy potęgi (np. 3.0), aby uzyskać nieliniowy wzrost luksów.
       Dzięki temu małe zmiany przy niskim świetle są lepiej widoczne. */
    double lux = pow(normalized, 3.0) * MAX_LUX;

    return (int32_t)lux;
}