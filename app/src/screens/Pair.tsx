import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Device } from 'react-native-ble-plx';
import { colors, fonts, space, radius } from '@/theme/tokens';
import { Card, TitleSerif, Mono, Chip, Rune } from '@/components';
import { useSensorStore } from '@/state/sensors';
import { useAppStore, selectActivePlant } from '@/state/app';
import { MOCK_MODE, scan, connect, disconnect } from '@/ble/manager';

type FoundDevice = { id: string; name: string | null };

export function PairScreen({ navigation, route }: any) {
  const tone = useAppStore((s) => s.tone);
  const connected = useSensorStore((s) => s.connected);
  const deviceName = useSensorStore((s) => s.deviceName);
  const sensors = useSensorStore();
  const assignDevice = useAppStore((s) => s.assignDevice);
  const plants = useAppStore((s) => s.plants);
  const activePlant = useAppStore(selectActivePlant);
  const assignToPlantId: string | undefined = route?.params?.plantId;
  const assignToPlant = assignToPlantId ? plants.find(p => p.id === assignToPlantId) : null;
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<FoundDevice[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const stopScanRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      stopScanRef.current?.();
    };
  }, []);

  const handleScan = async () => {
    setDevices([]);
    setScanning(true);
    try {
      const stop = await scan((d: Device) => {
        setDevices((prev) => (prev.some((x) => x.id === d.id) ? prev : [...prev, { id: d.id, name: d.name }]));
      });
      stopScanRef.current = stop ?? null;
      setTimeout(() => {
        stopScanRef.current?.();
        setScanning(false);
      }, 8000);
    } catch (e: any) {
      setScanning(false);
      Alert.alert('Błąd skanowania', e.message ?? String(e));
    }
  };

  const handleConnect = async (d: FoundDevice) => {
    setConnectingId(d.id);
    try {
      await connect(d.id);
      stopScanRef.current?.();
      setScanning(false);
      if (assignToPlantId) {
        assignDevice(assignToPlantId, d.id, d.name);
        navigation.goBack();
      }
    } catch (e: any) {
      Alert.alert('Nie udało się połączyć', e.message ?? String(e));
    } finally {
      setConnectingId(null);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setDevices([]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper2 }}>
      <View style={{ paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <TitleSerif style={{ fontSize: 22, color: colors.inkSoft }}>‹ Wróć</TitleSerif>
        </TouchableOpacity>
        {MOCK_MODE && (
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: 'rgba(196,147,74,0.12)', borderWidth: 1, borderColor: colors.gold + '66' }}>
            <Mono style={{ fontSize: 10, color: colors.goldDeep }}>TRYB MOCK</Mono>
          </View>
        )}
      </View>

      <View style={{ paddingHorizontal: space.xl, marginBottom: space.md }}>
        <Mono>
          {assignToPlant
            ? (tone === 'saga' ? `Dla: ${assignToPlant.name}` : `Przypisz do: ${assignToPlant.name}`)
            : (tone === 'saga' ? 'Rytuał przywołania' : 'Parowanie urządzenia')}
        </Mono>
        <TitleSerif style={{ fontSize: 28, marginTop: 4 }}>
          {assignToPlant
            ? (tone === 'saga' ? 'Przypnij Oko rośliny' : 'Przypisz czujnik')
            : (tone === 'saga' ? 'Odnajdź Oko' : 'Połącz czujnik')}
        </TitleSerif>
      </View>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <TitleSerif style={{ fontSize: 18 }}>
              {connected ? (deviceName ?? 'Oko') : (tone === 'saga' ? 'Oko milczy' : 'Brak połączenia')}
            </TitleSerif>
            <Mono style={{ marginTop: 4 }}>
              {connected
                ? (tone === 'saga' ? 'CZUWA' : 'POŁĄCZONO')
                : (tone === 'saga' ? 'UŚPIONE' : 'ROZŁĄCZONO')}
            </Mono>
          </View>
          <Chip label={connected ? 'Online' : 'Offline'} tone={connected ? 'good' : 'bad'} />
        </View>

        {connected && (
          <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(30,26,22,0.08)' }}>
            <Mono style={{ marginBottom: 8 }}>ŻYWE ZNAKI</Mono>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {sensors.temp != null && (
                <SensorPill label={tone === 'saga' ? 'Wicher' : 'Temp.'} value={`${sensors.temp.toFixed(1)}°C`} />
              )}
              {sensors.humidity != null && (
                <SensorPill label={tone === 'saga' ? 'Opar' : 'Wilg.'} value={`${Math.round(sensors.humidity)}%`} />
              )}
              {sensors.soil != null && (
                <SensorPill label={tone === 'saga' ? 'Ziemia' : 'Gleba'} value={`${Math.round(sensors.soil)}%`} />
              )}
              {sensors.light != null && (
                <SensorPill label={tone === 'saga' ? 'Słońce' : 'Światło'} value={`${Math.round(sensors.light)} lx`} />
              )}
              {sensors.battery != null && (
                <SensorPill label={tone === 'saga' ? 'Ogień' : 'Bateria'} value={`${sensors.battery}%`} />
              )}
            </View>
          </View>
        )}
      </Card>

      {connected ? (
        <TouchableOpacity
          onPress={handleDisconnect}
          style={{ marginHorizontal: space.lg, marginTop: space.sm, padding: 14, borderRadius: radius.pill, alignItems: 'center', borderWidth: 1.5, borderColor: colors.bad }}>
          <Text style={{ color: colors.bad, fontFamily: fonts.sans, fontWeight: '600' }}>
            {tone === 'saga' ? 'Odeślij Oko w sen' : 'Rozłącz'}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={handleScan}
          disabled={scanning}
          style={{ marginHorizontal: space.lg, marginTop: space.sm, padding: 14, borderRadius: radius.pill, alignItems: 'center', backgroundColor: colors.gold, opacity: scanning ? 0.5 : 1 }}>
          <Text style={{ color: '#fff', fontFamily: fonts.sans, fontWeight: '600' }}>
            {scanning
              ? (tone === 'saga' ? 'Wzywam Oko…' : 'Skanuję…')
              : (tone === 'saga' ? 'Wezwij Oko' : 'Skanuj urządzenia')}
          </Text>
        </TouchableOpacity>
      )}

      <ScrollView style={{ marginTop: space.md }} contentContainerStyle={{ paddingBottom: space.xl }}>
        {!connected && devices.length > 0 && (
          <>
            <View style={{ paddingHorizontal: space.xl, marginBottom: space.sm }}>
              <Mono>{tone === 'saga' ? 'Znalezione Oczy' : 'Znalezione urządzenia'}</Mono>
            </View>
            {devices.map((d) => (
              <TouchableOpacity key={d.id} onPress={() => handleConnect(d)} disabled={connectingId !== null}>
                <Card>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(196,147,74,0.12)', alignItems: 'center', justifyContent: 'center' }}>
                      <Rune size={22}>ᚹ</Rune>
                    </View>
                    <View style={{ flex: 1 }}>
                      <TitleSerif style={{ fontSize: 17 }}>{d.name ?? 'Nieznane urządzenie'}</TitleSerif>
                      <Mono style={{ marginTop: 2 }}>{d.id}</Mono>
                    </View>
                    <Text style={{ color: connectingId === d.id ? colors.inkFaint : colors.goldDeep, fontFamily: fonts.sans, fontSize: 13 }}>
                      {connectingId === d.id ? '…' : (tone === 'saga' ? 'Przywołaj' : 'Połącz')}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </>
        )}

        {!connected && !scanning && devices.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: space.xl }}>
            <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.inkSoft, textAlign: 'center', lineHeight: 22 }}>
              {tone === 'saga'
                ? 'Jarlu, dotknij "Wezwij Oko" aby rozpocząć rytuał przywołania.'
                : 'Kliknij "Skanuj urządzenia" aby wyszukać dostępne czujniki.'}
            </Text>
            {Platform.OS === 'ios' && !MOCK_MODE && (
              <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.inkFaint, textAlign: 'center', marginTop: 12 }}>
                Uwaga: symulator iOS nie wspiera BLE. Użyj fizycznego urządzenia.
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const SensorPill = ({ label, value }: { label: string; value: string }) => (
  <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.paper2, borderWidth: 1, borderColor: 'rgba(30,26,22,0.08)' }}>
    <Mono style={{ fontSize: 10, color: colors.inkFaint }}>{label}</Mono>
    <Text style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.ink, marginTop: 2 }}>{value}</Text>
  </View>
);
