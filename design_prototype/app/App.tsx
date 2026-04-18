import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Root } from '@/navigation/Root';
import { connect, MOCK_MODE } from '@/ble/manager';

export default function App() {
  useEffect(() => {
    if (MOCK_MODE) connect('MOCK-A7F2');
  }, []);
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Root />
    </SafeAreaProvider>
  );
}
