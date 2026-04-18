// Decoders for raw BLE bytes → typed sensor values
import { Buffer } from 'buffer';

const buf = (b64: string) => Buffer.from(b64, 'base64');

export const decodeTemp     = (b64: string): number => buf(b64).readInt16LE(0) / 100;  // °C
export const decodeHumidity = (b64: string): number => buf(b64).readUInt16LE(0) / 100; // %

// Soil: int8 signed, negative value (e.g. -1) signals firmware read error → ignore.
export const decodeSoil = (b64: string): number | null => {
  const v = buf(b64).readInt8(0);
  return v < 0 ? null : v;
};

// Light: int32 signed, negative value signals firmware read error → ignore.
export const decodeLight = (b64: string): number | null => {
  const v = buf(b64).readInt32LE(0);
  return v < 0 ? null : v;
};

export const decodeBattery  = (b64: string): number => buf(b64).readUInt8(0);          // %
export const decodeString   = (b64: string): string => buf(b64).toString('utf-8');

export const encodeUInt8  = (v: number) => Buffer.from([v]).toString('base64');
export const encodeUInt16 = (v: number) => {
  const b = Buffer.alloc(2); b.writeUInt16LE(v, 0); return b.toString('base64');
};
