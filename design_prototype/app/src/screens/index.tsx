// Stub screens — full UI ports the prototype but kept compact for scaffold.
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, space, radius } from '@/theme/tokens';
import { Card, TitleSerif, Mono, Chip, Rune, SensorBar } from '@/components';
import { useAppStore, selectActivePlant } from '@/state/app';
import { useSensorStore, graceScore } from '@/state/sensors';
import { mockApi } from '@/api/client';

export function OnboardingScreen({ navigation }: any) {
  const [step, setStep] = useState(0);
  const tone = useAppStore(s => s.tone);
  const finish = useAppStore(s => s.finishOnboarding);
  const addPlant = useAppStore(s => s.addPlant);

  const steps = [
    { rune: 'ᚠ', title: 'Freyr spogląda.', body: tone === 'saga' ? 'Dałeś ziarnu korzenie. Oko czuwa.' : 'Twoja roślina ma czujnik. Ten przewodnik trwa minutę.' },
    { rune: 'ᛗ', title: 'Obudź Oko.',      body: tone === 'saga' ? 'Wetknij drewno w ziemię, przyłóż dłoń.' : 'Wsuń sondę do oznaczonej linii. Przytrzymaj 3 s.' },
    { rune: 'ᚹ', title: 'Zwiąż z domem.',  body: tone === 'saga' ? 'Podaj imię sieci.' : 'Połącz z Wi-Fi 2.4 GHz.' },
    { rune: 'ᛟ', title: 'Nadaj imię.',     body: tone === 'saga' ? 'Każda roślina to istota. Jak ją zwiesz?' : 'Wybierz nazwę rośliny.' },
  ];
  const s = steps[step];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper, padding: space.xl }}>
      <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: 28 }}>
        {steps.map((_, i) => (
          <View key={i} style={{ width: i === step ? 24 : 6, height: 6, borderRadius: 3,
            backgroundColor: i === step ? colors.gold : 'rgba(30,26,22,0.2)' }} />
        ))}
      </View>
      <View style={{ alignItems: 'center', marginVertical: 40 }}>
        <Rune size={140}>{s.rune}</Rune>
      </View>
      <TitleSerif style={{ fontSize: 32, marginBottom: 12 }}>{s.title}</TitleSerif>
      <Text style={{ fontFamily: fonts.sans, fontSize: 15, color: colors.inkSoft, lineHeight: 22 }}>{s.body}</Text>
      <View style={{ flex: 1 }} />
      <TouchableOpacity
        style={{ backgroundColor: colors.gold, padding: 16, borderRadius: radius.pill, alignItems: 'center' }}
        onPress={async () => {
          if (step < steps.length - 1) return setStep(step + 1);
          // demo: seed a plant from mock identification
          const r = await mockApi.identify();
          addPlant({
            id: 'p1', name: tone === 'saga' ? 'Yggdrasil Młodszy' : r.common_name_pl,
            oldNorseName: r.common_name_old_norse ?? undefined,
            species: r.common_name_pl, scientificName: r.scientific_name,
            historicalUse: r.historical_use,
            optimal: {
              soilMin: r.optimal_conditions.soil_moisture_pct[0], soilMax: r.optimal_conditions.soil_moisture_pct[1],
              lightMin: r.optimal_conditions.light_lux[0], lightMax: r.optimal_conditions.light_lux[1],
              tempMin: r.optimal_conditions.temperature_c[0], tempMax: r.optimal_conditions.temperature_c[1],
              humidityMin: r.optimal_conditions.humidity_pct[0], humidityMax: r.optimal_conditions.humidity_pct[1],
            },
          });
          finish();
          navigation.replace('Tabs');
        }}>
        <Text style={{ color: '#fff', fontFamily: fonts.sans, fontWeight: '600', fontSize: 15 }}>
          {step < steps.length - 1 ? 'Dalej →' : 'Ukończ rytuał →'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export function DashboardScreen({ navigation }: any) {
  const tone = useAppStore(s => s.tone);
  const plant = useAppStore(selectActivePlant);
  const sensors = useSensorStore();
  const score = plant ? graceScore(sensors, plant.optimal) : 0;
  const status: 'good' | 'warn' | 'bad' = score > 70 ? 'good' : score > 40 ? 'warn' : 'bad';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper2 }}>
      <ScrollView>
        <View style={{ padding: space.xl, paddingBottom: 0 }}>
          <Mono>{tone === 'saga' ? 'Dom · Wieść z Sadu' : 'Dom · Teraz'}</Mono>
          <TitleSerif style={{ fontSize: 32, marginTop: 4 }}>{plant?.name ?? '—'}</TitleSerif>
        </View>
        <Card style={{ marginTop: space.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ fontFamily: fonts.serif, fontSize: 18, color: colors.goldDeep }}>
                {tone === 'saga' ? 'Łaska Freyra' : 'Stan'}
              </Text>
              <Text style={{ fontFamily: fonts.serif, fontWeight: '700', fontSize: 64, color: colors.ink, lineHeight: 64 }}>
                {score}<Text style={{ fontSize: 24, color: colors.inkSoft }}>%</Text>
              </Text>
            </View>
            <Chip label={status === 'good' ? 'Stabilnie' : status === 'warn' ? 'Czuwaj' : 'Działaj'} tone={status} />
          </View>
        </Card>
        <Card>
          <TitleSerif style={{ fontSize: 20, marginBottom: 4 }}>{tone === 'saga' ? 'Cztery żywioły' : 'Parametry'}</TitleSerif>
          {plant && sensors.soil != null && (
            <SensorBar name="Ziemia (wilgoć)" value={Math.round(sensors.soil!)} unit="%" min={0} max={100}
              optMin={plant.optimal.soilMin} optMax={plant.optimal.soilMax}
              status={sensors.soil >= plant.optimal.soilMin && sensors.soil <= plant.optimal.soilMax ? 'good' : 'warn'} />
          )}
          {plant && sensors.light != null && (
            <SensorBar name="Słońce" value={Math.round(sensors.light!)} unit=" lx" min={0} max={2000}
              optMin={plant.optimal.lightMin} optMax={plant.optimal.lightMax}
              status={sensors.light >= plant.optimal.lightMin ? 'good' : 'warn'} />
          )}
          {plant && sensors.temp != null && (
            <SensorBar name="Wicher (temp.)" value={Math.round(sensors.temp! * 10) / 10} unit="°C" min={10} max={35}
              optMin={plant.optimal.tempMin} optMax={plant.optimal.tempMax}
              status={sensors.temp >= plant.optimal.tempMin && sensors.temp <= plant.optimal.tempMax ? 'good' : 'warn'} />
          )}
        </Card>
        <TouchableOpacity onPress={() => navigation.navigate('Chat')}
          style={{ margin: space.lg, padding: 14, backgroundColor: colors.gold, borderRadius: radius.pill, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontFamily: fonts.sans, fontWeight: '600' }}>{tone === 'saga' ? 'Zapytaj Oka' : 'Porozmawiaj'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export function ChatScreen() {
  const tone = useAppStore(s => s.tone);
  const [msg, setMsg] = useState('');
  const messages = [
    { from: 'bot', text: tone === 'saga' ? 'Witaj, strażniku. Yggdrasil oddycha spokojnie.' : 'Cześć! Jak mogę pomóc?' },
    { from: 'user', text: tone === 'saga' ? 'Czy potrzebuje wody?' : 'Czy trzeba podlać?' },
    { from: 'bot', text: tone === 'saga' ? 'Nie dziś. Ziemia trzyma łaskę — 58%.' : 'Nie. Wilgoć 58%, w normie.' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper2 }}>
      <View style={{ padding: space.lg, backgroundColor: colors.paper, borderBottomWidth: 1, borderBottomColor: 'rgba(30,26,22,0.08)' }}>
        <TitleSerif>{tone === 'saga' ? 'Oko Freyra' : 'Asystent rośliny'}</TitleSerif>
        <Mono>{tone === 'saga' ? 'CZUWA · YGGDRASIL MŁODSZY' : 'ONLINE · MONSTERA'}</Mono>
      </View>
      <ScrollView style={{ flex: 1, padding: space.md }}>
        {messages.map((m, i) => (
          <View key={i} style={{ alignSelf: m.from === 'user' ? 'flex-end' : 'flex-start',
            backgroundColor: m.from === 'user' ? colors.gold : colors.paper,
            padding: 12, borderRadius: 18, marginBottom: 6, maxWidth: '78%',
            borderWidth: 1, borderColor: 'rgba(30,26,22,0.06)' }}>
            <Text style={{ color: m.from === 'user' ? '#fff' : colors.ink, fontFamily: fonts.sans, fontSize: 14.5 }}>{m.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', padding: space.md, gap: 8, backgroundColor: colors.paper, borderTopWidth: 1, borderTopColor: 'rgba(30,26,22,0.08)' }}>
        <TextInput value={msg} onChangeText={setMsg} placeholder={tone === 'saga' ? 'Mów do Oka…' : 'Napisz wiadomość…'}
          style={{ flex: 1, backgroundColor: colors.paper2, borderRadius: 22, paddingHorizontal: 16, fontFamily: fonts.sans }} />
        <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 18 }}>↑</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export function KronikaSagaScreen({ navigation }: any) {
  const tone = useAppStore(s => s.tone);
  const events = [
    { day: 'Dziś', rune: 'ᚹ', title: tone === 'saga' ? 'Ziemia zaszeptała' : 'Wilgoć spadła', detail: '28% · 14:22', tone: 'warn' as const },
    { day: 'Wczoraj', rune: 'ᛚ', title: tone === 'saga' ? 'Nakarmiłeś Yggdrasila' : 'Podlano', detail: '180 ml', tone: 'good' as const },
  ];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper2 }}>
      <View style={{ padding: space.xl, flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Mono>Kronika</Mono>
          <TitleSerif style={{ fontSize: 30 }}>{tone === 'saga' ? 'Saga sadu' : 'Zdarzenia'}</TitleSerif>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('KronikaZnaki')}>
          <Text style={{ color: colors.goldDeep, fontFamily: fonts.sans, fontSize: 12 }}>Znaki →</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
        {events.map((e, i) => (
          <Card key={i}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Rune color={colors[e.tone]}>{e.rune}</Rune>
              <View style={{ flex: 1 }}>
                <TitleSerif style={{ fontSize: 18 }}>{e.title}</TitleSerif>
                <Mono>{e.detail}</Mono>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export function KronikaZnakiScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper2 }}>
      <View style={{ padding: space.xl }}>
        <Mono>Kronika</Mono>
        <TitleSerif style={{ fontSize: 30 }}>Znaki żywiołów</TitleSerif>
      </View>
      <Card>
        <Text style={{ fontFamily: fonts.sans, color: colors.inkSoft }}>
          TODO: wykresy z Victory Native (linie per parametr, zakres optymalny zaznaczony zielonym pasem).
        </Text>
      </Card>
    </SafeAreaView>
  );
}

export function UstawieniaScreen() {
  const tone = useAppStore(s => s.tone);
  const setTone = useAppStore(s => s.setTone);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper2 }}>
      <View style={{ padding: space.xl }}>
        <Mono>Ustawienia</Mono>
        <TitleSerif style={{ fontSize: 30 }}>{tone === 'saga' ? 'Rytuały' : 'Konfiguracja'}</TitleSerif>
      </View>
      <Card>
        <TitleSerif style={{ fontSize: 20, marginBottom: 12 }}>Ton narracji</TitleSerif>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['saga', 'plain'] as const).map(t => (
            <TouchableOpacity key={t} onPress={() => setTone(t)} style={{
              flex: 1, padding: 14, borderRadius: radius.md,
              borderWidth: tone === t ? 2 : 1,
              borderColor: tone === t ? colors.gold : 'rgba(30,26,22,0.12)',
              backgroundColor: tone === t ? 'rgba(196,147,74,0.1)' : colors.paper,
            }}>
              <Text style={{ fontFamily: fonts.serif, fontSize: 18, color: colors.ink }}>
                {t === 'saga' ? 'Saga ᚠ' : 'Rzeczowo'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    </SafeAreaView>
  );
}

export function HordaScreen() {
  const tone = useAppStore(s => s.tone);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper2 }}>
      <View style={{ padding: space.xl }}>
        <Mono>{tone === 'saga' ? 'Sad' : 'Moje rośliny'}</Mono>
        <TitleSerif style={{ fontSize: 30 }}>{tone === 'saga' ? 'Horda Oczu' : 'Wszystkie'}</TitleSerif>
      </View>
      <Card>
        <Text style={{ fontFamily: fonts.sans, color: colors.inkSoft }}>
          TODO: mapa pomieszczeń + lista roślin (skopiuj layout z prototypu).
        </Text>
      </Card>
    </SafeAreaView>
  );
}
