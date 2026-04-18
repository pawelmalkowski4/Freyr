// react-native-ble-plx wrapper with mock-mode fallback for development without HW
import { BleManager, Device, Subscription } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';
import { CHARS, FREYR_SERVICE_UUID, BATTERY_SERVICE_UUID, BATTERY_LEVEL_CHAR } from './contract';
import {
  decodeTemp, decodeHumidity, decodePressure, decodeLight, decodeSoil, decodeBattery,
} from './codec';
import { useSensorStore } from '@/state/sensors';

let manager: BleManager | null = null;
const subs: Subscription[] = [];

export const MOCK_MODE = true; // flip to false when firmware is ready

const m = () => (manager ??= new BleManager());

export async function requestPermissions() {
  if (Platform.OS !== 'android') return true;
  const perms = [
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  ];
  const granted = await PermissionsAndroid.requestMultiple(perms);
  return Object.values(granted).every(s => s === 'granted');
}

export async function scan(onFound: (d: Device) => void, timeoutMs = 8000) {
  if (MOCK_MODE) {
    setTimeout(() => onFound({ id: 'MOCK-A7F2', name: 'Freyr-Eye-A7F2' } as Device), 600);
    return () => {};
  }
  await requestPermissions();
  m().startDeviceScan([FREYR_SERVICE_UUID], null, (err, dev) => {
    if (err) { console.warn('scan err', err); return; }
    if (dev) onFound(dev);
  });
  setTimeout(() => m().stopDeviceScan(), timeoutMs);
  return () => m().stopDeviceScan();
}

export async function connect(deviceId: string) {
  if (MOCK_MODE) { startMockStream(); return; }
  const dev = await m().connectToDevice(deviceId);
  await dev.discoverAllServicesAndCharacteristics();
  subscribeAll(dev);
}

function subscribeAll(dev: Device) {
  const set = useSensorStore.getState().set;
  const wire = (charUuid: string, decode: (b: string) => number, key: string, service = FREYR_SERVICE_UUID) => {
    const s = dev.monitorCharacteristicForService(service, charUuid, (err, c) => {
      if (err || !c?.value) return;
      set({ [key]: decode(c.value) } as any);
    });
    subs.push(s);
  };
  wire(CHARS.TEMP,     decodeTemp,     'temp');
  wire(CHARS.HUMIDITY, decodeHumidity, 'humidity');
  wire(CHARS.PRESSURE, decodePressure, 'pressure');
  wire(CHARS.LIGHT,    decodeLight,    'light');
  wire(CHARS.SOIL,     decodeSoil,     'soil');
  wire(BATTERY_LEVEL_CHAR, decodeBattery, 'battery', BATTERY_SERVICE_UUID);
}

let mockTimer: any;
function startMockStream() {
  const set = useSensorStore.getState().set;
  set({ connected: true, deviceName: 'Freyr-Eye-A7F2' });
  let t = 0;
  mockTimer = setInterval(() => {
    t++;
    set({
      temp:     22 + Math.sin(t / 6) * 1.5,
      humidity: 48 + Math.sin(t / 8) * 6,
      pressure: 101300 + Math.round(Math.sin(t / 10) * 80),
      light:    700 + Math.round(Math.sin(t / 4) * 250),
      soil:     58 + Math.round(Math.sin(t / 12) * 5),
      battery:  87,
      lastUpdate: Date.now(),
    });
  }, 1500);
}

export function disconnect() {
  if (mockTimer) clearInterval(mockTimer);
  subs.forEach(s => s.remove());
  subs.length = 0;
  useSensorStore.getState().set({ connected: false });
}
