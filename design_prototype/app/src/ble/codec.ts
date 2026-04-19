// Decoders for raw BLE bytes → typed sensor values
import { Buffer } from 'buffer';

const buf = (b64: string) => Buffer.from(b64, 'base64');

export const decodeTemp     = (b64: string) => buf(b64).readInt16LE(0) / 100;        // °C
export const decodeHumidity = (b64: string) => buf(b64).readUInt16LE(0) / 100;       // %
export const decodePressure = (b64: string) => buf(b64).readUInt32LE(0);             // Pa
export const decodeLight    = (b64: string) => buf(b64).readUInt16LE(0);             // lux
export const decodeSoil     = (b64: string) => buf(b64).readUInt8(0);                // %
export const decodeBattery  = (b64: string) => buf(b64).readUInt8(0);                // %
export const decodeString   = (b64: string) => buf(b64).toString('utf-8');

export const encodeUInt8  = (v: number) => Buffer.from([v]).toString('base64');
export const encodeUInt16 = (v: number) => {
  const b = Buffer.alloc(2); b.writeUInt16LE(v, 0); return b.toString('base64');
};
