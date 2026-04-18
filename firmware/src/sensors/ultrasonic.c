#include "ultrasonic.h"
#include <zephyr/kernel.h>
#include <zephyr/device.h>
#include <zephyr/drivers/gpio.h>
#include <stdio.h>

static const struct gpio_dt_spec trig_pin = GPIO_DT_SPEC_GET(DT_PATH(zephyr_user), trigger_gpios);
static const struct gpio_dt_spec echo_pin = GPIO_DT_SPEC_GET(DT_PATH(zephyr_user), echo_gpios);

int ultrasonic_init(void)
{
    if (!gpio_is_ready_dt(&trig_pin)) return -ENODEV;
    if (gpio_pin_configure_dt(&trig_pin, GPIO_OUTPUT_INACTIVE) < 0) return -EIO;

    if (!gpio_is_ready_dt(&echo_pin)) return -ENODEV;
    if (gpio_pin_configure_dt(&echo_pin, GPIO_INPUT) < 0) return -EIO;

    return 0;
}

double ultrasonic_get_distance_cm(void)
{
    uint32_t start_time = 0;
    uint32_t end_time = 0;
    uint32_t timeout_start;

    gpio_pin_set_dt(&trig_pin, 0);
    k_msleep(2);

    gpio_pin_set_dt(&trig_pin, 1);
    k_busy_wait(15); 
    gpio_pin_set_dt(&trig_pin, 0);

    k_busy_wait(500);

    timeout_start = k_uptime_get_32();
    while (gpio_pin_get_dt(&echo_pin) == 0) {
        if (k_uptime_get_32() - timeout_start > 50) return -1.0; 
    }
    
    start_time = k_cycle_get_32();

    timeout_start = k_uptime_get_32();
    while (gpio_pin_get_dt(&echo_pin) == 1) {
        if (k_uptime_get_32() - timeout_start > 50) return -2.0; 
    }
    
    end_time = k_cycle_get_32();

    uint32_t cycles = end_time - start_time;
    double time_seconds = (double)k_cyc_to_ns_floor64(cycles) / 1000000000.0;
    double distance_cm = (time_seconds * 34300.0) / 2.0;

    return distance_cm;
}