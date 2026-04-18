// Stub screens — full UI ports the prototype but kept compact for scaffold.
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, space, radius } from '@/theme/tokens';
import { Card, TitleSerif, Mono, Chip, Rune, SensorBar } from '@/components';
import { useAppStore, selectActivePlant } from '@/state/app';
import { useSensorStore, graceScore } from '@/state/sensors';
import { mockApi } from '@/api/client';
import { chatWithGemini, identifyPlantFromImage } from '@/api/gemini';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

export function AddPlantScreen({ navigation }: any) {
  const [isProcessing, setIsProcessing] = useState(false);
  const tone = useAppStore(s => s.tone);
  const addPlant = useAppStore(s => s.addPlant);

  const handleTakePic = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Potrzebujemy dostępu do kamery, aby rozpoznać roślinę!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        base64: true,
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0].base64) {
        setIsProcessing(true);
        try {
          const r = await identifyPlantFromImage(result.assets[0].base64);
          if (r.error) {
            alert(`⚠️ ${r.error}`);
          } else {
            addPlant({
              id: 'p' + Date.now(),
              name: tone === 'saga' ? r.common_name_old_norse || r.common_name_pl : r.common_name_pl,
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
            alert('Sukces! Roślina została rozpoznana i dodana.');
            navigation.goBack();
          }
        } catch (apiErr: any) {
          alert('Błąd sieci/AI: ' + apiErr.message);
        } finally {
          setIsProcessing(false);
        }
      }
    } catch (e: any) {
      alert(e.message);
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper, padding: space.xl }}>
      <View style={{ alignItems: 'flex-start', marginBottom: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingVertical: 10 }}>
          <TitleSerif style={{ fontSize: 24, color: colors.inkSoft }}>‹ Wróć</TitleSerif>
        </TouchableOpacity>
      </View>
      <View style={{ alignItems: 'center', marginVertical: 40 }}>
        <Rune size={120}>ᛟ</Rune>
      </View>
      <TitleSerif style={{ fontSize: 32, marginBottom: 12, textAlign: 'center' }}>
        {tone === 'saga' ? 'Obudź nowe Oko' : 'Dodaj nową roślinę'}
      </TitleSerif>
      <Text style={{ fontFamily: fonts.sans, fontSize: 15, color: colors.inkSoft, lineHeight: 22, textAlign: 'center' }}>
        {tone === 'saga' 
          ? 'Zrób zdjęcie istocie, a Freyr nada jej imię i odczyta jej potrzeby żywiołów.' 
          : 'Zrób zdjęcie roślinie. Sztuczna inteligencja rozpozna gatunek i dobierze idealne parametry.'}
      </Text>
      
      <View style={{ flex: 1 }} />
      
      {isProcessing && (
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontFamily: fonts.sans, color: colors.goldDeep, fontSize: 16 }}>
            {tone === 'saga' ? '👁 Odczytywanie znaków natury...' : '⏳ Rozpoznawanie rośliny przez AI...'}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={{ backgroundColor: colors.gold, padding: 16, borderRadius: radius.pill, alignItems: 'center', opacity: isProcessing ? 0.5 : 1 }}
        disabled={isProcessing}
        onPress={handleTakePic}>
        <Text style={{ color: '#fff', fontFamily: fonts.sans, fontWeight: '600', fontSize: 15 }}>
          {tone === 'saga' ? 'Wykonaj Rytuał Zdjęcia 📷' : 'Otwórz aparat 📷'}
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
  const currentPlant = useAppStore(selectActivePlant);
  const sensors = useSensorStore();
  const [msg, setMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<{from: 'bot'|'user', text: string}[]>([
    { from: 'bot', text: tone === 'saga' ? 'Witaj, strażniku. Oko czeka na Twoje pytania.' : 'Cześć! O co chcesz zapytać?' },
  ]);

  const handleSend = async () => {
    if (!msg.trim()) return;
    const newMsgs: {from: 'bot'|'user', text: string}[] = [...messages, { from: 'user', text: msg }];
    setMessages(newMsgs);
    setMsg('');
    setIsTyping(true);

    try {
      const reply = await chatWithGemini(newMsgs, tone, currentPlant, sensors);
      setMessages([...newMsgs, { from: 'bot', text: reply }]);
    } catch (e: any) {
      setMessages([...newMsgs, { from: 'bot', text: `[Błąd]: ${e.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

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
        {isTyping && (
          <View style={{ alignSelf: 'flex-start', backgroundColor: colors.paper, padding: 12, borderRadius: 18, marginBottom: 6 }}>
            <Text style={{ color: colors.inkSoft, fontFamily: fonts.sans, fontSize: 14 }}>{tone === 'saga' ? 'Oko spogląda w przyszłość...' : 'Pisze...'}</Text>
          </View>
        )}
      </ScrollView>
      <View style={{ flexDirection: 'row', padding: space.md, gap: 8, backgroundColor: colors.paper, borderTopWidth: 1, borderTopColor: 'rgba(30,26,22,0.08)' }}>
        <TextInput value={msg} onChangeText={setMsg} placeholder={tone === 'saga' ? 'Mów do Oka…' : 'Napisz wiadomość…'}
          style={{ flex: 1, backgroundColor: colors.paper2, borderRadius: 22, paddingHorizontal: 16, fontFamily: fonts.sans }} 
          onSubmitEditing={handleSend} />
        <TouchableOpacity onPress={handleSend} disabled={isTyping} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isTyping ? colors.inkSoft : colors.gold, alignItems: 'center', justifyContent: 'center' }}>
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

const Chart = ({ data, color, opt, max = 100, min = 0 }: any) => {
  const w = 320, h = 70, pad = 4;
  const norm = (v: number) => h - pad - ((v - min) / (max - min)) * (h - pad * 2);
  const pts = data.map((v: number, i: number) => [pad + (i / (data.length - 1)) * (w - pad * 2), norm(v)]);
  const path = pts.map((p: number[], i: number) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = path + ` L${w - pad} ${h - pad} L${pad} ${h - pad} Z`;
  return (
    <View style={{ height: 90, marginTop: 12 }}>
      <Svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }}>
        {opt && (
          <Rect x={pad} y={norm(opt[1])} width={w - pad * 2}
            height={Math.max(0, norm(opt[0]) - norm(opt[1]))}
            fill="rgba(107,138,74,0.15)" />
        )}
        <Path d={area} fill={color} opacity="0.15" />
        <Path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p: number[], i: number) => i === pts.length - 1 && (
          <Circle key={i} cx={p[0]} cy={p[1]} r="4" fill={color} stroke="#fff" strokeWidth="2" />
        ))}
      </Svg>
    </View>
  );
};

export function KronikaZnakiScreen() {
  const tone = useAppStore(s => s.tone);
  const series = [
    { name: tone === 'saga' ? 'Ziemia' : 'Wilgoć gleby', unit: '%', color: colors.good, data: [65, 62, 58, 55, 48, 42, 38, 58, 54, 50, 42, 32, 28, 58], opt: [40, 70] },
    { name: tone === 'saga' ? 'Słońce' : 'Światło',     unit: 'lx', color: colors.warn, data: [200, 420, 820, 1240, 1100, 800, 300, 180, 420, 860, 1160, 1200, 900, 820], opt: [500, 1500], max: 1500 },
    { name: tone === 'saga' ? 'Wicher' : 'Temperatura', unit: '°C', color: colors.bad, data: [19, 20, 21, 22, 23, 24, 23, 22, 22, 23, 24, 25, 23, 22], opt: [18, 26], max: 30, min: 15 },
  ];
  const ranges = ['24h', '7 dni', '30 dni', 'Rok'];
  const [range, setRange] = useState('7 dni');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper2 }}>
      <ScrollView>
        <View style={{ padding: space.xl }}>
          <Mono>Kronika</Mono>
          <TitleSerif style={{ fontSize: 30 }}>{tone === 'saga' ? 'Znaki żywiołów' : 'Historia pomiarów'}</TitleSerif>
        </View>

        {/* Range selector */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 4, padding: 4, backgroundColor: colors.paper, borderRadius: 999 }}>
            {ranges.map(r => (
              <TouchableOpacity key={r} onPress={() => setRange(r)} style={{
                flex: 1, backgroundColor: r === range ? colors.paper2 : 'transparent',
                paddingVertical: 8, borderRadius: 999, alignItems: 'center',
                shadowColor: '#000', shadowOpacity: r === range ? 0.05 : 0, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }
              }}>
                <Mono style={{ fontSize: 11, color: r === range ? colors.ink : colors.inkSoft, fontWeight: '500' }}>{r}</Mono>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {series.map((s, i) => (
          <Card key={i} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <TitleSerif style={{ fontSize: 20 }}>{s.name}</TitleSerif>
                <Mono style={{ fontSize: 11, color: colors.inkSoft, marginTop: 2 }}>
                  OBECNIE · {s.data[s.data.length - 1]}{s.unit}
                </Mono>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Mono style={{ fontSize: 11, color: colors.inkSoft }}>ZAKRES</Mono>
                <Mono style={{ fontSize: 13, color: colors.ink, marginTop: 2 }}>
                  {Math.min(...s.data)}–{Math.max(...s.data)}{s.unit}
                </Mono>
              </View>
            </View>
            <Chart data={s.data} color={s.color} opt={s.opt} max={s.max || 100} min={s.min || 0} />
          </Card>
        ))}

        {tone === 'saga' && (
          <Card style={{ backgroundColor: colors.paper, marginTop: 12 }}>
            <TitleSerif style={{ fontSize: 18, marginBottom: 6 }}>Wróżba tygodnia</TitleSerif>
            <Text style={{ fontSize: 13, color: colors.inkSoft, lineHeight: 20, fontFamily: fonts.sans }}>
              Ziemia dwukrotnie popadła w niepokój. Słońce hojne. Wicher łagodny. Dobry tydzień — lecz nakarm Yggdrasila częściej.
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const ThresholdSlider = ({ label, min, max, unit, value }: any) => (
  <View style={{ marginBottom: 14 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
      <Text style={{ fontSize: 13, color: colors.ink, fontFamily: fonts.sans }}>{label}</Text>
      <Mono style={{ fontWeight: '600', color: colors.ink }}>{value}{unit}</Mono>
    </View>
    <View style={{ height: 6, backgroundColor: colors.paper2, borderRadius: 999, position: 'relative', marginTop: 4 }}>
      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${((value - min) / (max - min) * 100)}%`, backgroundColor: colors.gold, borderRadius: 999 }} />
      <View style={{ position: 'absolute', left: `${((value - min) / (max - min) * 100)}%`, top: 3, transform: [{ translateX: -9 }, { translateY: -9 }], width: 18, height: 18, borderRadius: 9, backgroundColor: colors.paper, borderWidth: 2, borderColor: colors.gold, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }} />
    </View>
  </View>
);

export function UstawieniaScreen() {
  const tone = useAppStore(s => s.tone);
  const setTone = useAppStore(s => s.setTone);
  const plant = useAppStore(selectActivePlant);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper2 }}>
      <ScrollView>
        <View style={{ padding: space.xl }}>
          <Mono>Ustawienia</Mono>
          <TitleSerif style={{ fontSize: 30 }}>{tone === 'saga' ? 'Rytuały i progi' : 'Konfiguracja'}</TitleSerif>
        </View>

        {/* Plant profile */}
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.paper, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(30,26,22,0.08)' }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' }}>
              <TitleSerif style={{ fontSize: 24, color: '#fff' }}>ᛟ</TitleSerif>
            </View>
            <View style={{ flex: 1, paddingLeft: 12 }}>
              <TitleSerif style={{ fontSize: 20 }}>{plant?.name || (tone === 'saga' ? 'Yggdrasil Młodszy' : 'Monstera salonowa')}</TitleSerif>
              <Mono style={{ fontSize: 11, color: colors.inkSoft, marginTop: 2 }}>{plant?.species || 'Brak gatunku'} · Oko #A7F2</Mono>
            </View>
            <Text style={{ color: colors.inkSoft, fontSize: 24 }}>›</Text>
          </View>
        </View>

        {/* Tone toggle */}
        <Card style={{ marginBottom: 12 }}>
          <TitleSerif style={{ fontSize: 20, marginBottom: 4 }}>Ton narracji</TitleSerif>
          <Text style={{ fontSize: 12, color: colors.inkSoft, marginBottom: 12, fontFamily: fonts.sans }}>Czy Oko ma mówić rzeczowo, czy sagą?</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['saga', 'plain'] as const).map(t => (
              <TouchableOpacity key={t} onPress={() => setTone(t)} style={{
                flex: 1, padding: 12, borderRadius: 14,
                borderWidth: tone === t ? 2 : 1,
                borderColor: tone === t ? colors.gold : 'rgba(30,26,22,0.12)',
                backgroundColor: tone === t ? 'rgba(196,147,74,0.1)' : colors.paper,
              }}>
                <TitleSerif style={{ fontSize: 18, color: colors.ink }}>{t === 'saga' ? 'Saga ᚠ' : 'Rzeczowo'}</TitleSerif>
                <Text style={{ fontSize: 11, color: colors.inkSoft, marginTop: 4, fontFamily: fonts.sans }}>
                  {t === 'saga' ? '„Freyr mruży oko…"' : '„Wilgoć 28%"'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Grace thresholds */}
        <Card style={{ marginBottom: 12 }}>
          <TitleSerif style={{ fontSize: 20, marginBottom: 4 }}>Progi {tone === 'saga' ? 'łaski Freyra' : 'alarmów'}</TitleSerif>
          <Text style={{ fontSize: 12, color: colors.inkSoft, marginBottom: 16, fontFamily: fonts.sans }}>Kiedy Oko ma wołać, a kiedy milczeć.</Text>

          <ThresholdSlider label={tone === 'saga' ? 'Ziemia — próg niepokoju' : 'Wilgoć — ostrzeżenie'} min={0} max={100} unit="%" value={35} />
          <ThresholdSlider label={tone === 'saga' ? 'Ziemia — próg gniewu' : 'Wilgoć — alarm'} min={0} max={100} unit="%" value={20} />
          <ThresholdSlider label={tone === 'saga' ? 'Słońce — próg zmierzchu' : 'Światło — minimum'} min={0} max={2000} unit=" lx" value={500} />
        </Card>

        {/* Device rows */}
        <Card>
          {[
            { rune: 'ᛗ', title: 'Oko — parowanie', detail: '#A7F2' },
            { rune: 'ᚹ', title: 'Wi-Fi', detail: 'dom_2.4' },
            { rune: 'ᛒ', title: 'Powiadomienia', detail: 'Włączone' },
            { rune: 'ᚨ', title: 'O aplikacji', detail: 'v 0.7.2' },
          ].map((r, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: i === 3 ? 0 : 1, borderBottomColor: 'rgba(30,26,22,0.08)' }}>
              <TitleSerif style={{ fontSize: 20, color: colors.gold, width: 32 }}>{r.rune}</TitleSerif>
              <Text style={{ flex: 1, fontFamily: fonts.serif, fontSize: 18, color: colors.ink }}>{r.title}</Text>
              <Mono style={{ fontSize: 12, color: colors.inkSoft }}>{r.detail}</Mono>
              <Text style={{ color: colors.inkSoft, fontSize: 20, marginLeft: 8 }}>›</Text>
            </View>
          ))}
        </Card>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

export function HordaScreen({ navigation }: any) {
  const tone = useAppStore(s => s.tone);
  const plants = [
    { id: 1, name: tone === 'saga' ? 'Yggdrasil Młodszy' : 'Monstera salonowa',  room: 'Salon',   rune: 'ᛟ', tone: 'good', value: 84, x: 22, y: 42 },
    { id: 2, name: tone === 'saga' ? 'Liść Freji' : 'Fikus gumowy',               room: 'Salon',   rune: 'ᚠ', tone: 'good', value: 72, x: 48, y: 56 },
    { id: 3, name: tone === 'saga' ? 'Pragnienie Lokiego' : 'Paproć łazienkowa',  room: 'Łazienka',rune: 'ᛚ', tone: 'warn', value: 52, x: 68, y: 28 },
    { id: 4, name: tone === 'saga' ? 'Włócznia Odyna' : 'Sansewieria',            room: 'Sypialnia',rune: 'ᛋ', tone: 'bad',  value: 18, x: 82, y: 72 },
    { id: 5, name: tone === 'saga' ? 'Wieniec Idun' : 'Bazylia kuchenna',         room: 'Kuchnia', rune: 'ᛝ', tone: 'good', value: 68, x: 18, y: 78 },
  ];

  const counts = {
    good: plants.filter(p => p.tone === 'good').length,
    warn: plants.filter(p => p.tone === 'warn').length,
    bad:  plants.filter(p => p.tone === 'bad').length,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper2 }}>
      <ScrollView>
        <View style={{ padding: space.xl, flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Mono>{tone === 'saga' ? 'Sad' : 'Moje rośliny'}</Mono>
            <TitleSerif style={{ fontSize: 30 }}>{tone === 'saga' ? 'Horda Oczu' : 'Wszystkie'}</TitleSerif>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('AddPlant')}>
            <Text style={{ color: colors.goldDeep, fontFamily: fonts.sans, fontSize: 32 }}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Summary chips */}
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(107,138,74,0.1)', borderWidth: 1, borderColor: 'rgba(107,138,74,0.25)', borderRadius: 14, padding: 12 }}>
            <TitleSerif style={{ fontSize: 28, color: colors.good, lineHeight: 32 }}>{counts.good}</TitleSerif>
            <Mono style={{ fontSize: 11, color: colors.good, marginTop: 2 }}>{tone === 'saga' ? 'W ŁASCE' : 'OK'}</Mono>
          </View>
          <View style={{ flex: 1, backgroundColor: 'rgba(196,142,72,0.1)', borderWidth: 1, borderColor: 'rgba(196,142,72,0.3)', borderRadius: 14, padding: 12 }}>
            <TitleSerif style={{ fontSize: 28, color: '#8a5f28', lineHeight: 32 }}>{counts.warn}</TitleSerif>
            <Mono style={{ fontSize: 11, color: '#8a5f28', marginTop: 2 }}>{tone === 'saga' ? 'W NIEPOKOJU' : 'UWAGA'}</Mono>
          </View>
          <View style={{ flex: 1, backgroundColor: 'rgba(168,68,46,0.1)', borderWidth: 1, borderColor: 'rgba(168,68,46,0.25)', borderRadius: 14, padding: 12 }}>
            <TitleSerif style={{ fontSize: 28, color: colors.bad, lineHeight: 32 }}>{counts.bad}</TitleSerif>
            <Mono style={{ fontSize: 11, color: colors.bad, marginTop: 2 }}>{tone === 'saga' ? 'W GNIEWIE' : 'ALARM'}</Mono>
          </View>
        </View>

        {/* Map */}
        <View style={{ height: 320, marginHorizontal: 16, backgroundColor: colors.paper, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(30,26,22,0.08)', position: 'relative', overflow: 'hidden' }}>
          {/* room labels */}
          <Mono style={{ position: 'absolute', top: 8, left: 12, fontSize: 10, color: colors.inkSoft }}>SALON</Mono>
          <Mono style={{ position: 'absolute', top: 8, right: 12, fontSize: 10, color: colors.inkSoft }}>ŁAZIENKA</Mono>
          <Mono style={{ position: 'absolute', bottom: 8, left: 12, fontSize: 10, color: colors.inkSoft }}>KUCHNIA</Mono>
          <Mono style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 10, color: colors.inkSoft }}>SYPIALNIA</Mono>
          {/* room dividers */}
          <View style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(30,26,22,0.1)' }} />
          <View style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(30,26,22,0.1)' }} />
          
          {plants.map(p => (
            <View key={p.id} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, transform: [{ translateX: -16 }, { translateY: -16 }] }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.paper, borderWidth: 2, borderColor: colors[p.tone as keyof typeof colors], alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: fonts.serif, color: colors[p.tone as keyof typeof colors], fontSize: 16 }}>{p.rune}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Plant List */}
        <View style={{ padding: 16, marginTop: 8 }}>
          {plants.map(p => (
            <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(30,26,22,0.08)' }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(196,147,74,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: fonts.serif, color: colors.gold, fontSize: 20 }}>{p.rune}</Text>
              </View>
              <View style={{ flex: 1, paddingLeft: 12 }}>
                <TitleSerif style={{ fontSize: 18 }}>{p.name}</TitleSerif>
                <Mono style={{ fontSize: 11, color: colors.inkSoft }}>{p.room}</Mono>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <TitleSerif style={{ fontSize: 18, color: colors[p.tone as keyof typeof colors] }}>{p.value}%</TitleSerif>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
