import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Root } from '@/navigation/Root';
import { connect, MOCK_MODE } from '@/ble/manager';
import { useAppStore } from '@/state/app';
import { useSensorStore } from '@/state/sensors';

function useAutoReconnect() {
  const inFlight = useRef(false);

  const tryReconnect = async () => {
    if (inFlight.current) return;
    if (MOCK_MODE) return;
    if (useSensorStore.getState().connected) return;
    const s = useAppStore.getState();
    const active = s.plants.find(p => p.id === s.activePlantId);
    const deviceId = active?.deviceId;
    if (!deviceId) return;
    inFlight.current = true;
    try {
      await connect(deviceId);
    } catch (e) {
      // Device may be out of range — silent; next resume will retry.
      console.warn('auto-reconnect failed', e);
    } finally {
      inFlight.current = false;
    }
  };

  useEffect(() => {
    // Initial attempt on cold start.
    tryReconnect();

    const onChange = (state: AppStateStatus) => {
      if (state === 'active') tryReconnect();
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);
}

export default function App() {
  useEffect(() => {
    if (MOCK_MODE) connect('MOCK-A7F2');
  }, []);
  useAutoReconnect();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Root />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
