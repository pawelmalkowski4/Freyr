import asyncio
import os
from collections import deque
from bleak import BleakScanner, BleakClient
import plotext as plt

# --- Definicje UUID ---
SERVICE_UUID = "0000aaaa-0000-1000-8000-00805f9b34fb"
TEMP_UUID    = "0000aaa1-0000-1000-8000-00805f9b34fb"
HUM_UUID     = "0000aaa2-0000-1000-8000-00805f9b34fb"
PRESS_UUID   = "0000aaa3-0000-1000-8000-00805f9b34fb" 
DIST_UUID    = "0000aaa4-0000-1000-8000-00805f9b34fb" 
ADC_UUID     = "0000aaa5-0000-1000-8000-00805f9b34fb" 

# --- Pamięć podręczna na dane ---
# Przechowujemy ostatnie wartości do wyświetlania na żywo
current_data = {
    "temp": 0.0,
    "hum": 0.0,
    "press": 0.0,
    "dist": 0,
    "adc": 0
}

# Kolejki (bufory) do rysowania wykresów (przechowują max 60 ostatnich punktów)
HISTORY_SIZE = 60
history_temp = deque(maxlen=HISTORY_SIZE)
history_hum  = deque(maxlen=HISTORY_SIZE)

def notification_handler(sender, data):
    """Odbiera dane BLE i aktualizuje globalne zmienne"""
    uuid = str(sender.uuid).lower()
    
    try:
        if uuid == TEMP_UUID:
            val = int.from_bytes(data, byteorder='little', signed=True) / 100.0
            current_data["temp"] = val
            
        elif uuid == HUM_UUID:
            val = int.from_bytes(data, byteorder='little', signed=False) / 100.0
            current_data["hum"] = val

        elif uuid == PRESS_UUID:
            val = int.from_bytes(data, byteorder='little', signed=False) / 100.0
            current_data["press"] = val

        elif uuid == DIST_UUID:
            val = int.from_bytes(data, byteorder='little', signed=False)
            current_data["dist"] = val

        elif uuid == ADC_UUID:
            val = int.from_bytes(data, byteorder='little', signed=False)
            current_data["adc"] = val
            
    except Exception:
        pass # Ignorujemy błędy parsowania w locie, żeby nie psuć widoku terminala

async def update_dashboard():
    """Zadanie odświeżające terminal i rysujące wykresy ASCII"""
    while True:
        # Zapisz aktualny stan do historii (dla wykresów)
        # Zapisujemy tylko jeśli mamy już jakieś realne odczyty
        if current_data["temp"] != 0.0:
            history_temp.append(current_data["temp"])
        if current_data["hum"] != 0.0:
            history_hum.append(current_data["hum"])

        # Czyścimy terminal (zgodność z Windows/Linux)
        os.system('cls' if os.name == 'nt' else 'clear')
        
        # Wypisujemy aktualny status tekstowy
        print("=" * 50)
        print(" 📡 FREYR NODE - DASHBOARD TELEMETRYCZNY")
        print("=" * 50)
        print(f" [BME280]  Temperatura: {current_data['temp']:>6.2f} °C")
        print(f" [BME280]  Wilgotność:  {current_data['hum']:>6.2f} %")
        print(f" [BME280]  Ciśnienie:   {current_data['press']:>6.2f} hPa")
        print(f" [VL53L0X] Odległość:   {current_data['dist']:>6} mm")
        print(f" [ADC]     Napięcie:    {current_data['adc']:>6} mV")
        print("=" * 50)
        print("\n")

        # Rysujemy wykresy tylko, jeśli mamy wystarczająco dużo danych
        if len(history_temp) > 1 and len(history_hum) > 1:
            plt.cld() # Czyszczenie danych w plotext
            plt.clt() # Czyszczenie układu
            
            # Układ: 2 wiersze, 1 kolumna
            plt.subplots(2, 1)

            # Wykres temperatury
            plt.subplot(1, 1)
            plt.title("Historia Temperatury (°C)")
            plt.plot(list(history_temp), color="red", marker="dot")
            plt.plotsize(plt.tw(), 15) # Szerokość terminala, wysokość 15 znaków

            # Wykres wilgotności
            plt.subplot(2, 1)
            plt.title("Historia Wilgotności (%)")
            plt.plot(list(history_hum), color="blue", marker="dot")
            plt.plotsize(plt.tw(), 15)

            plt.show()
        else:
            print("\nZbyt mało danych do narysowania wykresu. Oczekiwanie...\n")

        # Odświeżaj widok co 1 sekundę
        await asyncio.sleep(1)

async def ble_client_task():
    """Zadanie obsługujące połączenie Bluetooth"""
    print("Skanowanie w poszukiwaniu Freyr Node...")
    
    device = await BleakScanner.find_device_by_filter(
        lambda d, ad: ad.local_name == "Freyr Node"
    )

    if not device:
        print("Nie znaleziono Freyr Node w pobliżu. Skrypt zostanie zakończony.")
        # Zatrzymujemy cały program
        os._exit(1)

    print(f"Połączono z {device.address}. Rozpoczynam strumieniowanie...")
    await asyncio.sleep(2) # Krótka pauza, żeby użytkownik zobaczył komunikat

    async with BleakClient(device) as client:
        services = await client.get_services()
        my_uuids = [TEMP_UUID, HUM_UUID, PRESS_UUID, DIST_UUID, ADC_UUID]
        
        for service in services:
            for char in service.characteristics:
                if char.uuid.lower() in my_uuids:
                    if "notify" in char.properties:
                        await client.start_notify(char.uuid, notification_handler)

        # Trzymaj połączenie otwarte
        while True:
            await asyncio.sleep(1)

async def main():
    # Uruchamiamy oba zadania równolegle:
    # 1. Obsługę BLE
    # 2. Rysowanie dashboardu w terminalu
    await asyncio.gather(
        ble_client_task(),
        update_dashboard()
    )

if __name__ == "__main__":
    try:
        # Konfiguracja terminala dla plotext
        plt.interactive(False)
        asyncio.run(main())
    except KeyboardInterrupt:
        os.system('cls' if os.name == 'nt' else 'clear')
        print("\nRozłączono i zakończono pracę programu.")