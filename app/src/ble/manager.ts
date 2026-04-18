// react-native-ble-plx wrapper with mock-mode fallback for development without HW
import { BleManager, Device, Subscription } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';
import { CHARS, FREYR_SERVICE_UUID, BATTERY_SERVICE_UUID, BATTERY_LEVEL_CHAR } from './contract';
import {
  decodeTemp, decodeHumidity, decodeLight, decodeSoil, decodeBattery,
} from './codec';
import { useSensorStore } from '@/state/sensors';
import { useHistoryStore } from '@/state/history';

let manager: BleManager | null = null;
const subs: Subscription[] = [];
let connectedDevice: Device | null = null;
let disconnectSub: Subscription | null = null;

// Flip to true only for dev on simulator (no BLE available). Real hardware → false.
export const MOCK_MODE = false;

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

// Match firmware devices by name prefix (firmware may or may not advertise service UUID).
const DEVICE_NAME_PATTERNS = ['freyr'];
const matchesFreyr = (dev: Device | { name?: string | null }) => {
  const n = (dev.name ?? '').toLowerCase();
  return DEVICE_NAME_PATTERNS.some((p) => n.includes(p));
};

export async function scan(onFound: (d: Device) => void, timeoutMs = 8000) {
  if (MOCK_MODE) {
    setTimeout(() => onFound({ id: 'MOCK-A7F2', name: 'Freyr-Eye-A7F2' } as Device), 600);
    return () => {};
  }
  const ok = await requestPermissions();
  if (!ok) throw new Error('Brak uprawnień Bluetooth.');
  // Unfiltered scan — some firmwares don't advertise the service UUID, so we
  // match by device name prefix on the client side.
  m().startDeviceScan(null, null, (err, dev) => {
    if (err) { console.warn('scan err', err); return; }
    if (dev && matchesFreyr(dev)) onFound(dev);
  });
  const stop = () => m().stopDeviceScan();
  setTimeout(stop, timeoutMs);
  return stop;
}

export async function connect(deviceId: string) {
  if (MOCK_MODE) { startMockStream(); return; }
  const set = useSensorStore.getState().set;
  const dev = await m().connectToDevice(deviceId, { requestMTU: 185 });
  await dev.discoverAllServicesAndCharacteristics();
  connectedDevice = dev;
  set({ connected: true, deviceName: dev.name ?? dev.id, lastUpdate: Date.now() });
  subscribeAll(dev);
  disconnectSub = dev.onDisconnected(() => {
    useSensorStore.getState().set({ connected: false });
    connectedDevice = null;
  });
}

function subscribeAll(dev: Device) {
  const set = useSensorStore.getState().set;
  const snapshotToHistory = () => {
    const s = useSensorStore.getState();
    useHistoryStore.getState().record(dev.id, {
      temp: s.temp, humidity: s.humidity, light: s.light, soil: s.soil,
    });
  };
  const wire = (charUuid: string, decode: (b: string) => number | null, key: string, service = FREYR_SERVICE_UUID) => {
    const s = dev.monitorCharacteristicForService(service, charUuid, (err, c) => {
      if (err || !c?.value) return;
      const decoded = decode(c.value);
      if (decoded == null) return; // firmware error sentinel, keep last value
      set({ [key]: decoded, lastUpdate: Date.now() } as any);
      snapshotToHistory();
    });
    subs.push(s);
  };
  wire(CHARS.TEMP,     decodeTemp,     'temp');
  wire(CHARS.HUMIDITY, decodeHumidity, 'humidity');
  wire(CHARS.LIGHT,    decodeLight,    'light');
  wire(CHARS.SOIL,     decodeSoil,     'soil');
  wire(BATTERY_LEVEL_CHAR, decodeBattery, 'battery', BATTERY_SERVICE_UUID);
}

let mockTimer: any;
const MOCK_DEVICE_ID = 'MOCK-A7F2';
function startMockStream() {
  const set = useSensorStore.getState().set;
  set({ connected: true, deviceName: 'Freyr-Eye-A7F2' });
  let t = 0;
  mockTimer = setInterval(() => {
    t++;
    const sample = {
      temp:     22 + Math.sin(t / 6) * 1.5,
      humidity: 48 + Math.sin(t / 8) * 6,
      light:    700 + Math.round(Math.sin(t / 4) * 250),
      soil:     58 + Math.round(Math.sin(t / 12) * 5),
    };
    set({
      ...sample,
      pressure: 101300 + Math.round(Math.sin(t / 10) * 80),
      battery:  87,
      lastUpdate: Date.now(),
    });
    useHistoryStore.getState().record(MOCK_DEVICE_ID, sample);
  }, 1500);
}

export async function disconnect() {
  if (mockTimer) { clearInterval(mockTimer); mockTimer = null; }
  subs.forEach(s => s.remove());
  subs.length = 0;
  disconnectSub?.remove();
  disconnectSub = null;
  if (connectedDevice) {
    try { await connectedDevice.cancelConnection(); } catch {}
    connectedDevice = null;
  }
  useSensorStore.getState().set({ connected: false, deviceName: null });
}
