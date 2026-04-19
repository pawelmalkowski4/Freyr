#include <zephyr/kernel.h>
#include <zephyr/drivers/i2c.h>
#include <stdio.h>

/* Moduły projektu */
#include "ble/ble_freyr.h"
#include "sensors/bme280.h"
#include "sensors/light_sensor.h" 
#include "sensors/soil_sensor.h"
#include "sensors/ultrasonic.h" /* Dodany czujnik HC-SR04 */

/* Biblioteka wyświetlacza */
#include <zephyr/display/cfb.h>

int main(void)
{
    printf("\n*** FREYR NODE - SMART DISPLAY DEMO ***\n");

    /* 1. Inicjalizacja BLE i Sensorów */
    if (ble_freyr_init() != 0) {
        printf("BLAD: Bluetooth!\n");
        return 0;
    }
    bme280_init();
    light_sensor_init();
    soil_sensor_init();
    ultrasonic_init();

    /* 2. Inicjalizacja Ekranu SH1106 */
    const struct device *display_dev = DEVICE_DT_GET(DT_NODELABEL(sh1106));
    if (!device_is_ready(display_dev)) {
        printf("BLAD: Ekran nie gotowy!\n");
    } else {
        cfb_framebuffer_init(display_dev);
        cfb_framebuffer_set_font(display_dev, 0); 
        cfb_framebuffer_clear(display_dev, true);
        /* Na starcie wyłączamy ekran, żeby czekał na ruch! */
        display_blanking_on(display_dev);
        /* HACKATHONOWY WYTRYCH: Bezposrednia komenda odwracania kolorow! */
        /* 0x00 = to jest komenda, 0xA6 = Tryb Normalny (czarne tlo, biale cyfry) */
        uint8_t color_cmd[] = {0x00, 0xA6}; 
        
        /* Wysylamy to bezposrednio na szyne i2c22 pod adres ekranu (0x3C) */
        i2c_write(DEVICE_DT_GET(DT_NODELABEL(i2c22)), color_cmd, 2, 0x3C);
    }

    char screen_buf[32]; 

    /* Zmienne przechowujące ostatnie pomiary (żeby ekran miał co wyświetlać między wysyłkami BLE) */
    int16_t last_temp = 0;
    uint16_t last_hum = 0;
    int8_t last_soil = 0;
    int32_t last_lux = 0;

    /* Dwa niezależne liczniki (Timery) */
    uint16_t ble_timer = 9999; /* Wysoka wartość = wymuś odczyt od razu na starcie */
    uint8_t screen_timer = 0;  /* Licznik sekund, przez które ekran ma się jeszcze świecić */

    while (1) {
        /* --- 1. RADAR (Błyskawiczna reakcja) --- */
        double dist = ultrasonic_get_distance_cm();
        
        if (dist > 0.0 && dist < 5.0) {
            screen_timer = 5; 
        }

        /* --- 2. ODCZYT SENSORÓW I WYSYŁKA BLE (Tylko co zadeklarowany interwał) --- */
        uint16_t interval = ble_freyr_get_sampling_interval();
        if (interval < 1) interval = 1;

        if (ble_timer >= interval) {
            /* Mierzymy najświeższe dane */
            bme280_read_for_ble(&last_temp, &last_hum);
            last_soil = soil_sensor_read_percentage();
            last_lux = calculate_lux(light_sensor_read_mv());

            /* Wypychamy do telefonu */
            ble_freyr_notify_temp(last_temp);
            ble_freyr_notify_humidity(last_hum);
            ble_freyr_notify_soil(last_soil);
            ble_freyr_notify_light(last_lux);

            printf("BLE Wysłano: T:%.2fC H:%.2f%% S:%d%% L:%dlux\n", 
                   last_temp/100.0, last_hum/100.0, last_soil, last_lux);
            
            ble_timer = 0; /* Zerujemy stoper BLE */
        }

        /* --- 3. LOGIKA EKRANU (Smart Display) --- */
        if (device_is_ready(display_dev)) {
            if (screen_timer > 0) {
                /* Budzimy ekran i wypisujemy biały tekst na czarnym tle */
                display_blanking_off(display_dev);
                cfb_framebuffer_clear(display_dev, false);

                snprintf(screen_buf, sizeof(screen_buf), "Temp: %.2fC", last_temp / 100.0);
                cfb_print(display_dev, screen_buf, 0, 0);

                snprintf(screen_buf, sizeof(screen_buf), "Wilg: %.2f%%", last_hum / 100.0);
                cfb_print(display_dev, screen_buf, 0, 15);

                snprintf(screen_buf, sizeof(screen_buf), "Gleba: %d%%", last_soil);
                cfb_print(display_dev, screen_buf, 0, 33);

                snprintf(screen_buf, sizeof(screen_buf), "Lux: %d", last_lux);
                cfb_print(display_dev, screen_buf, 0, 47);

                cfb_framebuffer_finalize(display_dev);
                
                screen_timer--; /* Zmniejszamy licznik świecenia */
            } else {
                /* Nikt nie stoi w pobliżu (timer zjechał do zera) -> Wyłączamy sprzętowo matrycę */
                display_blanking_on(display_dev);
            }
        }

        /* --- 4. TIMING GŁÓWNEJ PĘTLI --- */
        /* Pętla blokuje się dokładnie na 1 sekundę. Dzięki temu HC-SR04 skanuje otoczenie co sekundę! */
        k_msleep(1000);
        ble_timer++;
    }

    return 0;
}
