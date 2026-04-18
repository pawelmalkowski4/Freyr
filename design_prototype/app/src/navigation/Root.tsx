import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { useAppStore } from '@/state/app';
import { colors, fonts } from '@/theme/tokens';

import { OnboardingScreen } from '@/screens/Onboarding';
import { DashboardScreen } from '@/screens/Dashboard';
import { ChatScreen } from '@/screens/Chat';
import { KronikaSagaScreen } from '@/screens/KronikaSaga';
import { KronikaZnakiScreen } from '@/screens/KronikaZnaki';
import { UstawieniaScreen } from '@/screens/Ustawienia';
import { HordaScreen } from '@/screens/Horda';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tab = (rune: string, label: string) => ({
  tabBarIcon: ({ focused }: { focused: boolean }) => (
    <Text style={{ fontFamily: fonts.serif, fontSize: 22, color: focused ? colors.gold : colors.inkFaint }}>{rune}</Text>
  ),
  tabBarLabel: ({ focused }: { focused: boolean }) => (
    <Text style={{ fontFamily: fonts.sans, fontSize: 10, color: focused ? colors.goldDeep : colors.inkFaint }}>{label}</Text>
  ),
});

function Tabs() {
  const tone = useAppStore(s => s.tone);
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: colors.paper, borderTopColor: 'rgba(30,26,22,0.08)', height: 70, paddingTop: 8 },
    }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={tab('ᚠ', tone === 'saga' ? 'Oko' : 'Dom')} />
      <Tab.Screen name="Horda"     component={HordaScreen}     options={tab('ᛟ', tone === 'saga' ? 'Sad' : 'Rośliny')} />
      <Tab.Screen name="Chat"      component={ChatScreen}      options={tab('ᛗ', tone === 'saga' ? 'Mowa' : 'Czat')} />
      <Tab.Screen name="Kronika"   component={KronikaStack}    options={tab('ᚱ', tone === 'saga' ? 'Saga' : 'Kronika')} />
      <Tab.Screen name="Ustaw"     component={UstawieniaScreen} options={tab('ᚨ', 'Ustaw.')} />
    </Tab.Navigator>
  );
}

function KronikaStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="KronikaSaga"  component={KronikaSagaScreen} />
      <Stack.Screen name="KronikaZnaki" component={KronikaZnakiScreen} />
    </Stack.Navigator>
  );
}

export function Root() {
  const done = useAppStore(s => s.onboardingDone);
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!done && <Stack.Screen name="Onboarding" component={OnboardingScreen} />}
        <Stack.Screen name="Tabs" component={Tabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
