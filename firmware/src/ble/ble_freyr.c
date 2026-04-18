#include "ble_freyr.h"
#include <zephyr/bluetooth/bluetooth.h>
#include <zephyr/bluetooth/hci.h>
#include <zephyr/bluetooth/conn.h>
#include <zephyr/bluetooth/uuid.h>
#include <zephyr/bluetooth/gatt.h>
#include <stdio.h>

/* --- UUIDs z Twojej specyfikacji --- */
#define BT_UUID_FREYR_SVC_VAL \
    BT_UUID_128_ENCODE(0x0000AAAA, 0x0000, 0x1000, 0x8000, 0x00805F9B34FB)
#define BT_UUID_FREYR_TEMP_VAL \
    BT_UUID_128_ENCODE(0x0000AAA1, 0x0000, 0x1000, 0x8000, 0x00805F9B34FB)
#define BT_UUID_FREYR_HUM_VAL \
    BT_UUID_128_ENCODE(0x0000AAA2, 0x0000, 0x1000, 0x8000, 0x00805F9B34FB)
#define BT_UUID_FREYR_INTERVAL_VAL \
    BT_UUID_128_ENCODE(0x0000AAA6, 0x0000, 0x1000, 0x8000, 0x00805F9B34FB)
#define BT_UUID_FREYR_LED_VAL \
    BT_UUID_128_ENCODE(0x0000AAA8, 0x0000, 0x1000, 0x8000, 0x00805F9B34FB)

static struct bt_uuid_128 freyr_svc_uuid = BT_UUID_INIT_128(BT_UUID_FREYR_SVC_VAL);
static struct bt_uuid_128 freyr_temp_uuid = BT_UUID_INIT_128(BT_UUID_FREYR_TEMP_VAL);
static struct bt_uuid_128 freyr_hum_uuid = BT_UUID_INIT_128(BT_UUID_FREYR_HUM_VAL);
static struct bt_uuid_128 freyr_interval_uuid = BT_UUID_INIT_128(BT_UUID_FREYR_INTERVAL_VAL);
static struct bt_uuid_128 freyr_led_uuid = BT_UUID_INIT_128(BT_UUID_FREYR_LED_VAL);

/* --- Zmienne przechowujące aktualny stan (bufor dla Read/Write) --- */
static int16_t current_temp = 0;
static uint16_t current_hum = 0;
static uint16_t sampling_interval = 10; /* Domyślnie 10 sekund */
static uint8_t led_status = 0;

/* --- Callbacks dla zapisu (Write) --- */
static ssize_t write_interval(struct bt_conn *conn, const struct bt_gatt_attr *attr,
                              const void *buf, uint16_t len, uint16_t offset, uint8_t flags)
{
    if (len != sizeof(uint16_t)) return BT_GATT_ERR(BT_ATT_ERR_INVALID_ATTRIBUTE_LEN);
    memcpy(&sampling_interval, buf, len);
    printf("BLE: Zmieniono interwal na %d s\n", sampling_interval);
    return len;
}

static ssize_t write_led(struct bt_conn *conn, const struct bt_gatt_attr *attr,
                         const void *buf, uint16_t len, uint16_t offset, uint8_t flags)
{
    if (len != sizeof(uint8_t)) return BT_GATT_ERR(BT_ATT_ERR_INVALID_ATTRIBUTE_LEN);
    memcpy(&led_status, buf, len);
    printf("BLE: Zmieniono status LED na %d\n", led_status);
    /* Tutaj mozesz wywolac funkcje zmieniajaca fizyczny stan GPIO */
    return len;
}

/* Callbacks dla notyfikacji */
static void ccc_cfg_changed(const struct bt_gatt_attr *attr, uint16_t value) {
    printf("BLE: Zmiana subskrypcji (Notify): %s\n", (value == BT_GATT_CCC_NOTIFY) ? "Wlaczona" : "Wylaczona");
}

/* --- TABELA GATT --- */
BT_GATT_SERVICE_DEFINE(freyr_svc,
    BT_GATT_PRIMARY_SERVICE(&freyr_svc_uuid),

    /* AAA1: Temperature (Read, Notify) */
    BT_GATT_CHARACTERISTIC(&freyr_temp_uuid.uuid, BT_GATT_CHRC_READ | BT_GATT_CHRC_NOTIFY,
                           BT_GATT_PERM_READ, bt_gatt_attr_read, NULL, &current_temp),
    BT_GATT_CCC(ccc_cfg_changed, BT_GATT_PERM_READ | BT_GATT_PERM_WRITE),

    /* AAA2: Humidity (Read, Notify) */
    BT_GATT_CHARACTERISTIC(&freyr_hum_uuid.uuid, BT_GATT_CHRC_READ | BT_GATT_CHRC_NOTIFY,
                           BT_GATT_PERM_READ, bt_gatt_attr_read, NULL, &current_hum),
    BT_GATT_CCC(ccc_cfg_changed, BT_GATT_PERM_READ | BT_GATT_PERM_WRITE),

    /* AAA6: Sampling Interval (Read, Write) */
    BT_GATT_CHARACTERISTIC(&freyr_interval_uuid.uuid, BT_GATT_CHRC_READ | BT_GATT_CHRC_WRITE,
                           BT_GATT_PERM_READ | BT_GATT_PERM_WRITE, bt_gatt_attr_read, write_interval, &sampling_interval),

    /* AAA8: LED status (Write) */
    BT_GATT_CHARACTERISTIC(&freyr_led_uuid.uuid, BT_GATT_CHRC_WRITE,
                           BT_GATT_PERM_WRITE, NULL, write_led, &led_status)
);

/* --- Advertising Data --- */
static const struct bt_data ad[] = {
    BT_DATA_BYTES(BT_DATA_FLAGS, (BT_LE_AD_GENERAL | BT_LE_AD_NO_BREDR)),
    BT_DATA_BYTES(BT_DATA_UUID128_ALL, BT_UUID_FREYR_SVC_VAL),
};

/* --- Publiczne API --- */
int ble_freyr_init(void)
{
    int err = bt_enable(NULL);
    if (err) return err;

    err = bt_le_adv_start(BT_LE_ADV_CONN_NAME, ad, ARRAY_SIZE(ad), NULL, 0);
    if (err) return err;

    printf("BLE: Rozpoczęto rozgłaszanie (Advertising) jako Freyr Node\n");
    return 0;
}

/* W tabeli GATT: 0 to Service. Temp: Chrc to 1, Val to 2. Hum: Chrc to 4, Val to 5. */
void ble_freyr_notify_temp(int16_t temp_celsius)
{
    current_temp = temp_celsius;
    bt_gatt_notify(NULL, &freyr_svc.attrs[2], &current_temp, sizeof(current_temp));
}

void ble_freyr_notify_humidity(uint16_t humidity_pct)
{
    current_hum = humidity_pct;
    bt_gatt_notify(NULL, &freyr_svc.attrs[5], &current_hum, sizeof(current_hum));
}

uint16_t ble_freyr_get_sampling_interval(void)
{
    return sampling_interval;
}