#include "ble_freyr.h"
#include <zephyr/bluetooth/bluetooth.h>
#include <zephyr/bluetooth/hci.h>
#include <zephyr/bluetooth/conn.h>
#include <zephyr/bluetooth/uuid.h>
#include <zephyr/bluetooth/gatt.h>
#include <stdio.h>

/* --- UUIDs z Twojej specyfikacji oraz nowe dla Gleby i Światła --- */
#define BT_UUID_FREYR_SVC_VAL \
    BT_UUID_128_ENCODE(0x0000AAAA, 0x0000, 0x1000, 0x8000, 0x00805F9B34FB)
#define BT_UUID_FREYR_TEMP_VAL \
    BT_UUID_128_ENCODE(0x0000AAA1, 0x0000, 0x1000, 0x8000, 0x00805F9B34FB)
#define BT_UUID_FREYR_HUM_VAL \
    BT_UUID_128_ENCODE(0x0000AAA2, 0x0000, 0x1000, 0x8000, 0x00805F9B34FB)
#define BT_UUID_FREYR_SOIL_VAL \
    BT_UUID_128_ENCODE(0x0000AAA3, 0x0000, 0x1000, 0x8000, 0x00805F9B34FB)
#define BT_UUID_FREYR_LIGHT_VAL \
    BT_UUID_128_ENCODE(0x0000AAA4, 0x0000, 0x1000, 0x8000, 0x00805F9B34FB)
#define BT_UUID_FREYR_INTERVAL_VAL \
    BT_UUID_128_ENCODE(0x0000AAA6, 0x0000, 0x1000, 0x8000, 0x00805F9B34FB)
#define BT_UUID_FREYR_LED_VAL \
    BT_UUID_128_ENCODE(0x0000AAA8, 0x0000, 0x1000, 0x8000, 0x00805F9B34FB)

static struct bt_uuid_128 freyr_svc_uuid = BT_UUID_INIT_128(BT_UUID_FREYR_SVC_VAL);
static struct bt_uuid_128 freyr_temp_uuid = BT_UUID_INIT_128(BT_UUID_FREYR_TEMP_VAL);
static struct bt_uuid_128 freyr_hum_uuid = BT_UUID_INIT_128(BT_UUID_FREYR_HUM_VAL);
static struct bt_uuid_128 freyr_soil_uuid = BT_UUID_INIT_128(BT_UUID_FREYR_SOIL_VAL);
static struct bt_uuid_128 freyr_light_uuid = BT_UUID_INIT_128(BT_UUID_FREYR_LIGHT_VAL);
static struct bt_uuid_128 freyr_interval_uuid = BT_UUID_INIT_128(BT_UUID_FREYR_INTERVAL_VAL);
static struct bt_uuid_128 freyr_led_uuid = BT_UUID_INIT_128(BT_UUID_FREYR_LED_VAL);

/* --- Zmienne przechowujące aktualny stan (bufor dla Read/Write) --- */
static int16_t current_temp = 0;
static uint16_t current_hum = 0;
static int8_t current_soil = 0;
static int32_t current_light = 0;
static uint16_t sampling_interval = 10;
static uint8_t led_status = 0;

/* --- BEZPIECZNE FUNKCJE ODCZYTU --- */
static ssize_t read_temp(struct bt_conn *conn, const struct bt_gatt_attr *attr, void *buf, uint16_t len, uint16_t offset) {
    const int16_t *value = attr->user_data;
    return bt_gatt_attr_read(conn, attr, buf, len, offset, value, sizeof(*value));
}

static ssize_t read_hum(struct bt_conn *conn, const struct bt_gatt_attr *attr, void *buf, uint16_t len, uint16_t offset) {
    const uint16_t *value = attr->user_data;
    return bt_gatt_attr_read(conn, attr, buf, len, offset, value, sizeof(*value));
}

static ssize_t read_soil(struct bt_conn *conn, const struct bt_gatt_attr *attr, void *buf, uint16_t len, uint16_t offset) {
    const int8_t *value = attr->user_data;
    return bt_gatt_attr_read(conn, attr, buf, len, offset, value, sizeof(*value));
}

static ssize_t read_light(struct bt_conn *conn, const struct bt_gatt_attr *attr, void *buf, uint16_t len, uint16_t offset) {
    const int32_t *value = attr->user_data;
    return bt_gatt_attr_read(conn, attr, buf, len, offset, value, sizeof(*value));
}

static ssize_t read_interval(struct bt_conn *conn, const struct bt_gatt_attr *attr, void *buf, uint16_t len, uint16_t offset) {
    const uint16_t *value = attr->user_data;
    return bt_gatt_attr_read(conn, attr, buf, len, offset, value, sizeof(*value));
}

/* --- Callbacks dla zapisu (Write) --- */
static ssize_t write_interval(struct bt_conn *conn, const struct bt_gatt_attr *attr, const void *buf, uint16_t len, uint16_t offset, uint8_t flags) {
    if (len != sizeof(uint16_t)) return BT_GATT_ERR(BT_ATT_ERR_INVALID_ATTRIBUTE_LEN);
    memcpy(&sampling_interval, buf, len);
    printf("BLE: Zmieniono interwal na %d s\n", sampling_interval);
    return len;
}

static ssize_t write_led(struct bt_conn *conn, const struct bt_gatt_attr *attr, const void *buf, uint16_t len, uint16_t offset, uint8_t flags) {
    if (len != sizeof(uint8_t)) return BT_GATT_ERR(BT_ATT_ERR_INVALID_ATTRIBUTE_LEN);
    memcpy(&led_status, buf, len);
    printf("BLE: Zmieniono status LED na %d\n", led_status);
    return len;
}

/* Callbacks dla notyfikacji */
static void ccc_cfg_changed(const struct bt_gatt_attr *attr, uint16_t value) {
    printf("BLE: Zmiana subskrypcji (Notify): %s\n", (value == BT_GATT_CCC_NOTIFY) ? "Wlaczona" : "Wylaczona");
}

/* --- TABELA GATT --- */
BT_GATT_SERVICE_DEFINE(freyr_svc,
    BT_GATT_PRIMARY_SERVICE(&freyr_svc_uuid.uuid),            /* Index 0 */

    /* AAA1: Temperature */
    BT_GATT_CHARACTERISTIC(&freyr_temp_uuid.uuid,             /* Index 1 */
                           BT_GATT_CHRC_READ | BT_GATT_CHRC_NOTIFY,
                           BT_GATT_PERM_READ, 
                           read_temp, NULL, &current_temp),   /* Index 2 (Wartość) */
    BT_GATT_CCC(ccc_cfg_changed, BT_GATT_PERM_READ | BT_GATT_PERM_WRITE), /* Index 3 */

    /* AAA2: Humidity */
    BT_GATT_CHARACTERISTIC(&freyr_hum_uuid.uuid,              /* Index 4 */
                           BT_GATT_CHRC_READ | BT_GATT_CHRC_NOTIFY,
                           BT_GATT_PERM_READ, 
                           read_hum, NULL, &current_hum),     /* Index 5 (Wartość) */
    BT_GATT_CCC(ccc_cfg_changed, BT_GATT_PERM_READ | BT_GATT_PERM_WRITE), /* Index 6 */

    /* AAA3: Soil Moisture */
    BT_GATT_CHARACTERISTIC(&freyr_soil_uuid.uuid,             /* Index 7 */
                           BT_GATT_CHRC_READ | BT_GATT_CHRC_NOTIFY,
                           BT_GATT_PERM_READ, 
                           read_soil, NULL, &current_soil),   /* Index 8 (Wartość) */
    BT_GATT_CCC(ccc_cfg_changed, BT_GATT_PERM_READ | BT_GATT_PERM_WRITE), /* Index 9 */

    /* AAA4: Light Intensity (Lux) */
    BT_GATT_CHARACTERISTIC(&freyr_light_uuid.uuid,            /* Index 10 */
                           BT_GATT_CHRC_READ | BT_GATT_CHRC_NOTIFY,
                           BT_GATT_PERM_READ, 
                           read_light, NULL, &current_light), /* Index 11 (Wartość) */
    BT_GATT_CCC(ccc_cfg_changed, BT_GATT_PERM_READ | BT_GATT_PERM_WRITE), /* Index 12 */

    /* AAA6: Sampling Interval */
    BT_GATT_CHARACTERISTIC(&freyr_interval_uuid.uuid,         /* Index 13 */
                           BT_GATT_CHRC_READ | BT_GATT_CHRC_WRITE,
                           BT_GATT_PERM_READ | BT_GATT_PERM_WRITE, 
                           read_interval, write_interval, &sampling_interval), /* Index 14 (Wartość) */

    /* AAA8: LED status */
    BT_GATT_CHARACTERISTIC(&freyr_led_uuid.uuid,              /* Index 15 */
                           BT_GATT_CHRC_WRITE,
                           BT_GATT_PERM_WRITE, 
                           NULL, write_led, &led_status)      /* Index 16 (Wartość) */
);

/* --- Pakiet główny --- */
static const struct bt_data ad[] = {
    BT_DATA_BYTES(BT_DATA_FLAGS, (BT_LE_AD_GENERAL | BT_LE_AD_NO_BREDR)),
    BT_DATA(BT_DATA_NAME_COMPLETE, CONFIG_BT_DEVICE_NAME, sizeof(CONFIG_BT_DEVICE_NAME) - 1),
};

static const struct bt_data sd[] = {};

static void connected(struct bt_conn *conn, uint8_t err) {
    if (err) {
        printf("BLE: Blad polaczenia (err %u)\n", err);
    } else {
        printf("BLE: Polaczono z aplikacja!\n");
    }
}

static void disconnected(struct bt_conn *conn, uint8_t reason) {
    printf("BLE: Rozlaczono (powod 0x%02x). Wznawiam rozglaszanie (Advertising)...\n", reason);
    
    struct bt_le_adv_param adv_param = {
        .id = BT_ID_DEFAULT,
        .sid = 0,
        .options = BT_LE_ADV_OPT_CONN, 
        .interval_min = BT_GAP_ADV_FAST_INT_MIN_2,
        .interval_max = BT_GAP_ADV_FAST_INT_MAX_2,
    };
    
    /* Płytka straciła połączenie, więc wymuszamy ponowne włączenie "widzialności" */
    int err = bt_le_adv_start(&adv_param, ad, ARRAY_SIZE(ad), sd, ARRAY_SIZE(sd));
    if (err) {
        printf("BLE: Nie udalo sie wznowic rozglaszania (err %d)\n", err);
    }
}

/* Zarejestrowanie powyższych funkcji w systemie */
BT_CONN_CB_DEFINE(conn_callbacks) = {
    .connected = connected,
    .disconnected = disconnected,
};

int ble_freyr_init(void)
{
    int err = bt_enable(NULL);
    if (err) return err;

    struct bt_le_adv_param adv_param = {
        .id = BT_ID_DEFAULT,
        .sid = 0,
        .options = BT_LE_ADV_OPT_CONN, 
        .interval_min = BT_GAP_ADV_FAST_INT_MIN_2,
        .interval_max = BT_GAP_ADV_FAST_INT_MAX_2,
    };

    err = bt_le_adv_start(&adv_param, ad, ARRAY_SIZE(ad), NULL, 0);
    if (err) {
        printf("BLE: Blad startu (err %d)\n", err);
        return err;
    }

    printf("BLE: Rozpoczeto rozglaszanie\n");
    return 0;
}

/* --- FUNKCJE WYSYŁAJĄCE DANE --- */

void ble_freyr_notify_temp(int16_t temp_celsius) {
    current_temp = temp_celsius;
    bt_gatt_notify(NULL, &freyr_svc.attrs[2], &current_temp, sizeof(current_temp));
}

void ble_freyr_notify_humidity(uint16_t humidity_pct) {
    current_hum = humidity_pct;
    bt_gatt_notify(NULL, &freyr_svc.attrs[5], &current_hum, sizeof(current_hum));
}

void ble_freyr_notify_soil(int8_t soil_pct) {
    current_soil = soil_pct;
    bt_gatt_notify(NULL, &freyr_svc.attrs[8], &current_soil, sizeof(current_soil));
}

void ble_freyr_notify_light(int32_t lux) {
    current_light = lux;
    bt_gatt_notify(NULL, &freyr_svc.attrs[11], &current_light, sizeof(current_light));
}

uint16_t ble_freyr_get_sampling_interval(void) {
    return sampling_interval;
}