// Stub screens — full UI ports the prototype but kept compact for scaffold.
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image, KeyboardAvoidingView, Platform, Modal, FlatList, ActivityIndicator, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, space, radius } from '@/theme/tokens';
import { Card, TitleSerif, Mono, Chip, Rune, SensorBar, Chart } from '@/components';
import { useHistoryStore, selectHistoryForDevice } from '@/state/history';
import { useAppStore, selectActivePlant } from '@/state/app';
import { useSensorStore, graceScore } from '@/state/sensors';
import { chatWithGemini, identifyPlantFromImage } from '@/api/gemini';
import { analyzePlant, generateSaga, type AnalyzeResult, type SagaResult } from '@/api/advisor';
import * as ImagePicker from 'expo-image-picker';
import { Swipeable } from 'react-native-gesture-handler';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const formatWindow = (samples: { t: number }[]) => {
  if (samples.length === 0) return '';
  const first = samples[0].t;
  const last = samples[samples.length - 1].t;
  const deltaMin = Math.max(1, Math.round((last - first) / 60000));
  if (deltaMin < 60) return `ostatnie ${deltaMin} min`;
  const deltaH = Math.round(deltaMin / 60);
  if (deltaH < 48) return `ostatnie ${deltaH}h`;
  return `ostatnie ${Math.round(deltaH / 24)} dni`;
};

type PlantOptimal = {
  soilMin: number; soilMax: number;
  lightMin: number; lightMax: number;
  tempMin: number; tempMax: number;
  humidityMin: number; humidityMax: number;
};

const THRESHOLD_ROWS: { label: (tone: 'saga' | 'plain') => string; minKey: keyof PlantOptimal; maxKey: keyof PlantOptimal; unit: string }[] = [
  { label: (t) => t === 'saga' ? 'Ziemia (wilgoć)' : 'Wilgotność gleby',    minKey: 'soilMin',     maxKey: 'soilMax',     unit: '%' },
  { label: (t) => t === 'saga' ? 'Słońce'           : 'Światło',             minKey: 'lightMin',    maxKey: 'lightMax',    unit: 'lx' },
  { label: (t) => t === 'saga' ? 'Wicher'           : 'Temperatura',         minKey: 'tempMin',     maxKey: 'tempMax',     unit: '°C' },
  { label: (t) => t === 'saga' ? 'Opar'             : 'Wilgotność powietrza', minKey: 'humidityMin', maxKey: 'humidityMax', unit: '%' },
];

const ThresholdEditor = ({ optimal, onChange, tone }: {
  optimal: PlantOptimal;
  onChange: (next: PlantOptimal) => void;
  tone: 'saga' | 'plain';
}) => {
  const [draft, setDraft] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(optimal).map(([k, v]) => [k, String(v)])),
  );

  React.useEffect(() => {
    setDraft(Object.fromEntries(Object.entries(optimal).map(([k, v]) => [k, String(v)])));
  }, [optimal.soilMin, optimal.soilMax, optimal.lightMin, optimal.lightMax, optimal.tempMin, optimal.tempMax, optimal.humidityMin, optimal.humidityMax]);

  const commit = (key: keyof PlantOptimal, raw: string) => {
    const cleaned = raw.replace(',', '.').trim();
    const num = Number(cleaned);
    if (cleaned === '' || Number.isNaN(num)) {
      setDraft(d => ({ ...d, [key]: String(optimal[key]) }));
      return;
    }
    const next: PlantOptimal = { ...optimal, [key]: num };
    // Ensure min <= max pairing.
    if (key.endsWith('Min')) {
      const maxKey = key.replace(/Min$/, 'Max') as keyof PlantOptimal;
      if (next[maxKey] < num) next[maxKey] = num;
    } else if (key.endsWith('Max')) {
      const minKey = key.replace(/Max$/, 'Min') as keyof PlantOptimal;
      if (next[minKey] > num) next[minKey] = num;
    }
    onChange(next);
  };

  return (
    <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(30,26,22,0.08)' }}>
      <Mono style={{ marginBottom: 8 }}>
        {tone === 'saga' ? 'ZAKRESY OPTYMALNE' : 'ZAKRESY ALARMOWE'}
      </Mono>
      {THRESHOLD_ROWS.map((row) => (
        <View key={row.minKey} style={{ marginBottom: 12 }}>
          <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.ink, marginBottom: 6 }}>
            {row.label(tone)} <Text style={{ color: colors.inkFaint }}>({row.unit})</Text>
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <ThresholdInput label={tone === 'saga' ? 'od' : 'min'}
              value={draft[row.minKey]}
              onChangeText={(t) => setDraft(d => ({ ...d, [row.minKey]: t }))}
              onBlur={() => commit(row.minKey, draft[row.minKey])} />
            <ThresholdInput label={tone === 'saga' ? 'do' : 'max'}
              value={draft[row.maxKey]}
              onChangeText={(t) => setDraft(d => ({ ...d, [row.maxKey]: t }))}
              onBlur={() => commit(row.maxKey, draft[row.maxKey])} />
          </View>
        </View>
      ))}
    </View>
  );
};

const ThresholdInput = ({ label, value, onChangeText, onBlur }: {
  label: string; value: string; onChangeText: (t: string) => void; onBlur: () => void;
}) => (
  <View style={{ flex: 1, backgroundColor: colors.paper2, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(30,26,22,0.08)', paddingHorizontal: 12, paddingVertical: 8 }}>
    <Mono style={{ fontSize: 10, color: colors.inkFaint }}>{label.toUpperCase()}</Mono>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      keyboardType="decimal-pad"
      style={{ fontFamily: fonts.mono, fontSize: 15, color: colors.ink, paddingVertical: 2, marginTop: 2 }}
    />
  </View>
);

const HistoryRow = ({ label, data, color, opt, unit, max, min }: {
  label: string; data: number[]; color: string; opt: [number, number]; unit: string;
  max?: number; min?: number;
}) => (
  <View style={{ marginTop: 14 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.ink }}>{label}</Text>
      <Mono style={{ fontSize: 11, color: colors.inkFaint }}>
        {data.length > 0 ? `${Math.round(data[data.length - 1])}${unit}` : '—'}
      </Mono>
    </View>
    <Chart data={data} color={color} opt={opt} max={max ?? 100} min={min ?? 0} />
  </View>
);

export function AddPlantScreen({ navigation }: any) {
  const [isProcessing, setIsProcessing] = useState(false);
  const tone = useAppStore(s => s.tone);
  const addPlant = useAppStore(s => s.addPlant);
  const finishOnboarding = useAppStore(s => s.finishOnboarding);
  const onboardingDone = useAppStore(s => s.onboardingDone);

  const runIdentify = async (base64: string, photoUri: string) => {
    setIsProcessing(true);
    try {
      const r = await identifyPlantFromImage(base64);
      const identifyError = (r as { error?: string }).error;
      if (identifyError) {
        Alert.alert('Nie udało się rozpoznać', identifyError);
        return;
      }
      addPlant({
        id: 'p' + Date.now(),
        name: tone === 'saga' ? r.common_name_old_norse || r.common_name_pl : r.common_name_pl,
        oldNorseName: r.common_name_old_norse ?? undefined,
        species: r.common_name_pl, scientificName: r.scientific_name,
        historicalUse: r.historical_use,
        photoUri,
        optimal: {
          soilMin: r.optimal_conditions.soil_moisture_pct[0], soilMax: r.optimal_conditions.soil_moisture_pct[1],
          lightMin: r.optimal_conditions.light_lux[0], lightMax: r.optimal_conditions.light_lux[1],
          tempMin: r.optimal_conditions.temperature_c[0], tempMax: r.optimal_conditions.temperature_c[1],
          humidityMin: r.optimal_conditions.humidity_pct[0], humidityMax: r.optimal_conditions.humidity_pct[1],
        },
      });
      Alert.alert('Dodano roślinę', 'Roślina została rozpoznana i zapisana.');
      if (!onboardingDone) {
        finishOnboarding();
      }
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
      }
    } catch (apiErr: any) {
      Alert.alert('Błąd sieci/AI', apiErr.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Brak dostępu', 'Potrzebujemy dostępu do galerii.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.5,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled && result.assets[0].base64) {
      await runIdentify(result.assets[0].base64, result.assets[0].uri);
    }
  };

  const takeFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Brak dostępu', 'Potrzebujemy dostępu do kamery, aby rozpoznać roślinę.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.5,
    });
    if (!result.canceled && result.assets[0].base64) {
      await runIdentify(result.assets[0].base64, result.assets[0].uri);
    }
  };

  const handleTakePic = () => {
    Alert.alert(
      'Dodaj zdjęcie rośliny',
      'Wybierz źródło',
      [
        { text: 'Aparat', onPress: takeFromCamera },
        { text: 'Galeria', onPress: pickFromLibrary },
        { text: 'Anuluj', style: 'cancel' },
      ],
    );
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
      
      <TouchableOpacity
        style={{ backgroundColor: colors.gold, padding: 16, borderRadius: radius.pill, alignItems: 'center', opacity: isProcessing ? 0.5 : 1 }}
        disabled={isProcessing}
        onPress={handleTakePic}>
        <Text style={{ color: '#fff', fontFamily: fonts.sans, fontWeight: '600', fontSize: 15 }}>
          {tone === 'saga' ? 'Wykonaj Rytuał Zdjęcia 📷' : 'Otwórz aparat 📷'}
        </Text>
      </TouchableOpacity>

      <IdentifyLoader visible={isProcessing} tone={tone} />
    </SafeAreaView>
  );
}

function IdentifyLoader({ visible, tone }: { visible: boolean; tone: 'saga' | 'plain' }) {
  const rotation = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    const spin = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 4500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const fadeIn = Animated.timing(fade, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    });
    spin.start();
    fadeIn.start();
    return () => {
      spin.stop();
      rotation.setValue(0);
      fade.setValue(0);
    };
  }, [visible]);

  const [tipIndex, setTipIndex] = useState(0);
  const saganTips = [
    'Freyr odczytuje liście i łodygi…',
    'Skald szuka imienia staronordyjskiego…',
    'Runy doradzają jak o Ciebie dbać…',
    'Wicher szepcze o warunkach uprawy…',
  ];
  const plainTips = [
    'Gemini analizuje zdjęcie…',
    'Identyfikuję gatunek rośliny…',
    'Dobieram optymalne zakresy temperatury, światła, wilgoci…',
    'Zapisuję profil rośliny…',
  ];
  const tips = tone === 'saga' ? saganTips : plainTips;

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setTipIndex(i => (i + 1) % tips.length), 2200);
    return () => clearInterval(id);
  }, [visible, tips.length]);

  if (!visible) return null;
  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View
      pointerEvents="auto"
      style={{
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(26,23,20,0.92)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        opacity: fade,
      }}>
      <View style={{ alignItems: 'center', justifyContent: 'center', width: 180, height: 180 }}>
        <Animated.View style={{ transform: [{ rotate: spin }], position: 'absolute' }}>
          <Text style={{ fontFamily: fonts.serif, fontSize: 140, color: colors.gold, opacity: 0.25 }}>ᛟ</Text>
        </Animated.View>
        <Text style={{ fontFamily: fonts.serif, fontSize: 80, color: colors.gold }}>👁</Text>
      </View>

      <ActivityIndicator size="small" color={colors.gold} style={{ marginTop: 16 }} />

      <Text style={{
        fontFamily: fonts.serif, fontSize: 24, color: colors.paper,
        marginTop: 24, textAlign: 'center', fontWeight: '600',
      }}>
        {tone === 'saga' ? 'Oko przebudza się…' : 'Rozpoznaję roślinę'}
      </Text>

      <Text style={{
        fontFamily: fonts.sans, fontSize: 14, color: 'rgba(247,243,235,0.72)',
        marginTop: 14, textAlign: 'center', lineHeight: 20, minHeight: 40,
      }}>
        {tips[tipIndex]}
      </Text>
    </Animated.View>
  );
}

export function DashboardScreen({ navigation }: any) {
  const tone = useAppStore(s => s.tone);
  const plant = useAppStore(selectActivePlant);
  const unassignDevice = useAppStore(s => s.unassignDevice);
  const sensors = useSensorStore();
  const connected = useSensorStore(s => s.connected);
  const deviceName = useSensorStore(s => s.deviceName);
  const updateOptimal = useAppStore(s => s.updateOptimal);
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [editingThresholds, setEditingThresholds] = useState(false);

  const history = useHistoryStore(selectHistoryForDevice(plant?.deviceId));

  const handleAssignDevice = () => {
    if (!plant) return;
    const root = navigation.getParent()?.getParent() ?? navigation.getParent() ?? navigation;
    root.navigate('Pair', { plantId: plant.id });
  };
  const handleUnassignDevice = () => {
    if (!plant?.deviceId) return;
    Alert.alert(
      tone === 'saga' ? 'Odłącz Oko' : 'Odłączyć czujnik?',
      tone === 'saga' ? `Czy rozwiązać więź z Okiem tej rośliny?` : `Odpiąć "${plant.deviceName ?? plant.deviceId}" od tej rośliny?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        { text: tone === 'saga' ? 'Odłącz' : 'Odłącz', style: 'destructive', onPress: () => unassignDevice(plant.id) },
      ],
    );
  };
  const localScore = plant ? graceScore(sensors, plant.optimal) : null;
  const score = analysis?.health_score ?? localScore;
  const hasScore = score != null;
  const status: 'good' | 'warn' | 'bad' = !hasScore ? 'warn' : score > 70 ? 'good' : score > 40 ? 'warn' : 'bad';

  const runAnalyze = async (photoBase64?: string) => {
    if (!plant) return;
    setAnalyzing(true);
    try {
      const r = await analyzePlant(plant, sensors, tone, photoBase64);
      setAnalysis(r);
    } catch (e: any) {
      Alert.alert('Błąd analizy', e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const pickPhotoForAnalysis = async (source: 'camera' | 'library') => {
    try {
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Brak dostępu', 'Potrzebujemy dostępu do kamery.');
          return;
        }
        const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.5 });
        if (!result.canceled && result.assets[0].base64) {
          await runAnalyze(result.assets[0].base64);
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Brak dostępu', 'Potrzebujemy dostępu do galerii.');
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          base64: true,
          quality: 0.5,
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });
        if (!result.canceled && result.assets[0].base64) {
          await runAnalyze(result.assets[0].base64);
        }
      }
    } catch (e: any) {
      Alert.alert('Błąd', e.message);
    }
  };

  const handleAnalyze = () => {
    if (!plant) return;
    Alert.alert(
      tone === 'saga' ? 'Rytuał wyroczni' : 'Diagnoza AI',
      tone === 'saga'
        ? 'Czy Oko ma spojrzeć też na jej obraz?'
        : 'Dołączyć aktualne zdjęcie rośliny? (Pomaga AI wykryć choroby, niedobory, szkodniki.)',
      [
        { text: tone === 'saga' ? 'Bez obrazu' : 'Bez zdjęcia', onPress: () => runAnalyze() },
        { text: tone === 'saga' ? 'Aparat' : 'Zrób zdjęcie', onPress: () => pickPhotoForAnalysis('camera') },
        { text: 'Galeria', onPress: () => pickPhotoForAnalysis('library') },
        { text: 'Anuluj', style: 'cancel' },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper2 }}>
      <ScrollView>
        <View style={{ padding: space.xl, paddingBottom: 0 }}>
          {navigation.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 12, alignSelf: 'flex-start' }}>
              <TitleSerif style={{ fontSize: 22, color: colors.inkSoft }}>‹ {tone === 'saga' ? 'Sad' : 'Rośliny'}</TitleSerif>
            </TouchableOpacity>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Mono>{tone === 'saga' ? 'Dom · Wieść z Sadu' : 'Dom · Teraz'}</Mono>
              <TitleSerif style={{ fontSize: 32, marginTop: 4 }}>{plant?.name ?? '—'}</TitleSerif>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Pair')}>
              <Chip
                label={connected ? (deviceName ?? 'Oko') : (tone === 'saga' ? 'Uśpione' : 'Offline')}
                tone={connected ? 'good' : 'bad'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {plant?.photoUri && (
          <View style={{ marginHorizontal: space.lg, marginTop: space.md, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(30,26,22,0.08)' }}>
            <Image
              source={{ uri: plant.photoUri }}
              style={{ width: '100%', height: 220, backgroundColor: colors.paper }}
              resizeMode="cover"
            />
          </View>
        )}

        {plant && (
          <Card style={{ marginTop: space.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Mono>{tone === 'saga' ? 'Oko rośliny' : 'Czujnik'}</Mono>
                <TitleSerif style={{ fontSize: 18, marginTop: 2 }}>
                  {plant.deviceName ?? plant.deviceId ?? (tone === 'saga' ? 'Brak przypięcia' : 'Nie przypisano')}
                </TitleSerif>
                {plant.deviceId && (
                  <Mono style={{ fontSize: 10, marginTop: 2 }}>
                    {connected && deviceName === (plant.deviceName ?? plant.deviceId)
                      ? (tone === 'saga' ? 'CZUWA' : 'POŁĄCZONO')
                      : (tone === 'saga' ? 'UŚPIONE' : 'ROZŁĄCZONO')}
                  </Mono>
                )}
              </View>
              {plant.deviceId ? (
                <TouchableOpacity onPress={handleUnassignDevice} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.bad }}>
                  <Text style={{ color: colors.bad, fontFamily: fonts.sans, fontSize: 12, fontWeight: '600' }}>
                    {tone === 'saga' ? 'Odłącz' : 'Odłącz'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleAssignDevice} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.gold }}>
                  <Text style={{ color: '#fff', fontFamily: fonts.sans, fontSize: 12, fontWeight: '600' }}>
                    {tone === 'saga' ? 'Przypnij Oko' : 'Przypisz'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        )}
        <Card style={{ marginTop: space.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.serif, fontSize: 18, color: colors.goldDeep }}>
                {tone === 'saga' ? 'Łaska Freyra' : 'Stan'}
              </Text>
              {hasScore ? (
                <Text style={{ fontFamily: fonts.serif, fontWeight: '700', fontSize: 64, color: colors.ink, lineHeight: 64 }}>
                  {score}<Text style={{ fontSize: 24, color: colors.inkSoft }}>%</Text>
                </Text>
              ) : (
                <>
                  <Text style={{ fontFamily: fonts.serif, fontWeight: '700', fontSize: 40, color: colors.inkFaint, lineHeight: 44, marginTop: 4 }}>
                    —
                  </Text>
                  <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.inkSoft, marginTop: 6, lineHeight: 18 }}>
                    {tone === 'saga'
                      ? 'Oko jeszcze nie przyniosło znaków. Przypnij i połącz.'
                      : 'Brak pomiarów. Przypisz czujnik BLE, aby policzyć stan.'}
                  </Text>
                </>
              )}
            </View>
            {hasScore && (
              <Chip label={status === 'good' ? 'Stabilnie' : status === 'warn' ? 'Czuwaj' : 'Działaj'} tone={status} />
            )}
          </View>
        </Card>
        {plant && (
          <Card>
            <TitleSerif style={{ fontSize: 20, marginBottom: 4 }}>{tone === 'saga' ? 'Cztery żywioły' : 'Parametry'}</TitleSerif>
            {!connected && (
              <Mono style={{ color: colors.inkFaint, marginBottom: 6 }}>
                {tone === 'saga' ? 'BRAK ZNAKÓW · POKAZUJEMY ZAKRESY' : 'BRAK POMIARÓW · POKAZUJEMY ZAKRESY OPTYMALNE'}
              </Mono>
            )}
            <SensorBar
              name={tone === 'saga' ? 'Ziemia (wilgoć)' : 'Wilgotność gleby'}
              value={sensors.soil == null ? null : Math.round(sensors.soil)}
              unit="%" min={0} max={100}
              optMin={plant.optimal.soilMin} optMax={plant.optimal.soilMax}
              status={sensors.soil != null && sensors.soil >= plant.optimal.soilMin && sensors.soil <= plant.optimal.soilMax ? 'good' : 'warn'} />
            <SensorBar
              name={tone === 'saga' ? 'Słońce' : 'Światło'}
              value={sensors.light == null ? null : Math.round(sensors.light)}
              unit=" lx" min={0} max={2000}
              optMin={plant.optimal.lightMin} optMax={plant.optimal.lightMax}
              status={sensors.light != null && sensors.light >= plant.optimal.lightMin ? 'good' : 'warn'} />
            <SensorBar
              name={tone === 'saga' ? 'Wicher (temp.)' : 'Temperatura'}
              value={sensors.temp == null ? null : Math.round(sensors.temp * 10) / 10}
              unit="°C" min={10} max={35}
              optMin={plant.optimal.tempMin} optMax={plant.optimal.tempMax}
              status={sensors.temp != null && sensors.temp >= plant.optimal.tempMin && sensors.temp <= plant.optimal.tempMax ? 'good' : 'warn'} />
            <SensorBar
              name={tone === 'saga' ? 'Opar (wilgoć)' : 'Wilgotność powietrza'}
              value={sensors.humidity == null ? null : Math.round(sensors.humidity)}
              unit="%" min={0} max={100}
              optMin={plant.optimal.humidityMin} optMax={plant.optimal.humidityMax}
              status={sensors.humidity != null && sensors.humidity >= plant.optimal.humidityMin && sensors.humidity <= plant.optimal.humidityMax ? 'good' : 'warn'} />

            <TouchableOpacity
              onPress={() => setEditingThresholds(v => !v)}
              style={{ marginTop: 14, paddingVertical: 8, alignItems: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(30,26,22,0.12)' }}>
              <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.goldDeep, fontWeight: '600' }}>
                {editingThresholds
                  ? (tone === 'saga' ? 'Zamknij rytuał' : 'Zamknij edycję')
                  : (tone === 'saga' ? 'Nastaw progi rytuałów' : 'Edytuj progi alarmów')}
              </Text>
            </TouchableOpacity>

            {editingThresholds && (
              <ThresholdEditor
                optimal={plant.optimal}
                onChange={(next) => updateOptimal(plant.id, next)}
                tone={tone}
              />
            )}
          </Card>
        )}

        {plant && (
          <Card>
            <TitleSerif style={{ fontSize: 20, marginBottom: 4 }}>
              {tone === 'saga' ? 'Kronika żywiołów' : 'Historia pomiarów'}
            </TitleSerif>
            {history.length === 0 ? (
              <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.inkSoft, marginTop: 8 }}>
                {tone === 'saga'
                  ? 'Kronika milczy. Przypnij Oko i czekaj na pierwsze znaki.'
                  : 'Brak danych. Podepnij czujnik i poczekaj na pierwsze odczyty.'}
              </Text>
            ) : (
              <>
                <Mono style={{ color: colors.inkFaint, marginTop: 4 }}>
                  {history.length} {tone === 'saga' ? 'znaków' : 'pomiarów'} · {formatWindow(history)}
                </Mono>
                <HistoryRow label={tone === 'saga' ? 'Ziemia' : 'Wilgoć gleby'}
                  data={history.map(h => h.soil).filter((v): v is number => v != null)}
                  color={colors.good} opt={[plant.optimal.soilMin, plant.optimal.soilMax]} unit="%" max={100} />
                <HistoryRow label={tone === 'saga' ? 'Słońce' : 'Światło'}
                  data={history.map(h => h.light).filter((v): v is number => v != null)}
                  color={colors.warn} opt={[plant.optimal.lightMin, plant.optimal.lightMax]} unit=" lx" max={2000} />
                <HistoryRow label={tone === 'saga' ? 'Wicher' : 'Temperatura'}
                  data={history.map(h => h.temp).filter((v): v is number => v != null)}
                  color={colors.bad} opt={[plant.optimal.tempMin, plant.optimal.tempMax]} unit="°C" max={35} min={10} />
                <HistoryRow label={tone === 'saga' ? 'Opar' : 'Wilgoć powietrza'}
                  data={history.map(h => h.humidity).filter((v): v is number => v != null)}
                  color={colors.goldDeep} opt={[plant.optimal.humidityMin, plant.optimal.humidityMax]} unit="%" max={100} />
              </>
            )}
          </Card>
        )}

        {plant && (
          <TouchableOpacity
            onPress={handleAnalyze}
            disabled={analyzing}
            style={{ marginHorizontal: space.lg, marginTop: space.md, padding: 14, borderRadius: radius.pill, alignItems: 'center', borderWidth: 1.5, borderColor: colors.gold, opacity: analyzing ? 0.5 : 1 }}>
            <Text style={{ color: colors.goldDeep, fontFamily: fonts.sans, fontWeight: '600' }}>
              {analyzing
                ? (tone === 'saga' ? 'Oko rozważa znaki…' : 'Analizuję…')
                : (tone === 'saga' ? 'Proś Oko o wyrocznię' : 'Poproś o diagnozę AI')}
            </Text>
          </TouchableOpacity>
        )}

        {analysis && (
          <Card style={{ marginTop: space.md }}>
            <TitleSerif style={{ fontSize: 20, marginBottom: 8 }}>
              {tone === 'saga' ? 'Wyrocznia Oka' : 'Diagnoza AI'}
            </TitleSerif>
            <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.ink, lineHeight: 21, marginBottom: 12 }}>
              {analysis.message}
            </Text>
            {analysis.actions.length > 0 && (
              <View style={{ marginTop: 4 }}>
                <Mono style={{ marginBottom: 8 }}>{tone === 'saga' ? 'RUNY DO RZUCENIA' : 'CO ZROBIĆ'}</Mono>
                {analysis.actions.map((a, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: a.priority === 1 ? colors.bad : a.priority === 2 ? colors.warn : colors.good, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 1 }}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{a.priority}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.ink, fontWeight: '600' }}>{a.action}</Text>
                      <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.inkSoft, marginTop: 2 }}>
                        {a.quantity} · {a.deadline_hours === 0 ? 'natychmiast' : `w ${a.deadline_hours}h`}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card>
        )}

        <TouchableOpacity
          onPress={() => {
            const root = navigation.getParent()?.getParent() ?? navigation.getParent() ?? navigation;
            root.navigate('Chat', plant ? { plantId: plant.id } : undefined);
          }}
          style={{ margin: space.lg, padding: 14, backgroundColor: colors.gold, borderRadius: radius.pill, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontFamily: fonts.sans, fontWeight: '600' }}>{tone === 'saga' ? 'Zapytaj Oka' : 'Porozmawiaj'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export function ChatScreen({ route }: any) {
  const tone = useAppStore(s => s.tone);
  const plants = useAppStore(s => s.plants);
  const activePlant = useAppStore(selectActivePlant);
  const sensors = useSensorStore();

  // Explicit context plant for this chat, can differ from app's active plant.
  const initialPlantId: string | undefined = route?.params?.plantId;
  const initialPlant = initialPlantId
    ? plants.find(p => p.id === initialPlantId) ?? null
    : activePlant;
  const [contextPlant, setContextPlant] = useState(initialPlant);
  const [plantPickerOpen, setPlantPickerOpen] = useState(false);

  // React to route param changes (e.g. re-entering Chat from another plant).
  React.useEffect(() => {
    if (initialPlantId) {
      const p = plants.find(x => x.id === initialPlantId);
      if (p) setContextPlant(p);
    }
  }, [initialPlantId]);

  const [msg, setMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<{from: 'bot'|'user', text: string}[]>([
    { from: 'bot', text: tone === 'saga' ? 'Witaj, strażniku. Oko czeka na Twoje pytania.' : 'Cześć! O co chcesz zapytać?' },
  ]);
  const scrollRef = React.useRef<ScrollView | null>(null);
  const tabBarHeight = useBottomTabBarHeight();

  const handleSend = async () => {
    if (!msg.trim()) return;
    const newMsgs: {from: 'bot'|'user', text: string}[] = [...messages, { from: 'user', text: msg }];
    setMessages(newMsgs);
    setMsg('');
    setIsTyping(true);

    try {
      const reply = await chatWithGemini(newMsgs, tone, contextPlant, sensors);
      setMessages([...newMsgs, { from: 'bot', text: reply }]);
    } catch (e: any) {
      setMessages([...newMsgs, { from: 'bot', text: `[Błąd]: ${e.message}` }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper2 }} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={tabBarHeight}>
        <View style={{ padding: space.lg, backgroundColor: colors.paper, borderBottomWidth: 1, borderBottomColor: 'rgba(30,26,22,0.08)' }}>
          <TitleSerif>{tone === 'saga' ? 'Oko Freyra' : 'Asystent rośliny'}</TitleSerif>
          <Mono>
            {contextPlant
              ? `${tone === 'saga' ? 'CZUWA' : 'ONLINE'} · ${(contextPlant.name ?? '').toUpperCase()}`
              : (tone === 'saga' ? 'OKO CZEKA NA ROŚLINĘ' : 'BEZ KONTEKSTU ROŚLINY')}
          </Mono>
        </View>

        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: space.md }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
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

        {contextPlant && (
          <View style={{ paddingHorizontal: space.md, paddingTop: 6, paddingBottom: 0, backgroundColor: colors.paper }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: colors.paper2, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(30,26,22,0.08)' }}>
              <Text style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.goldDeep, fontWeight: '600' }}>
                {contextPlant.name}
              </Text>
              <TouchableOpacity onPress={() => setContextPlant(null)}>
                <Text style={{ color: colors.inkFaint, fontSize: 14 }}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ flexDirection: 'row', paddingHorizontal: space.md, paddingTop: space.sm, paddingBottom: space.sm, gap: 8, backgroundColor: colors.paper, borderTopWidth: 1, borderTopColor: 'rgba(30,26,22,0.08)', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => setPlantPickerOpen(true)}
            style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.goldDeep, fontSize: 22, fontFamily: fonts.sans, lineHeight: 22, marginTop: -2 }}>+</Text>
          </TouchableOpacity>
          <TextInput
            value={msg}
            onChangeText={setMsg}
            placeholder={tone === 'saga' ? 'Mów do Oka…' : 'Napisz wiadomość…'}
            placeholderTextColor={colors.inkFaint}
            style={{ flex: 1, backgroundColor: colors.paper2, borderRadius: 22, paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 10 : 6, fontFamily: fonts.sans, color: colors.ink }}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={handleSend} disabled={isTyping || !msg.trim()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: (isTyping || !msg.trim()) ? colors.inkFaint : colors.gold, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 18 }}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={plantPickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPlantPickerOpen(false)}>
        <TouchableOpacity activeOpacity={1} onPress={() => setPlantPickerOpen(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}
            style={{ backgroundColor: colors.paper, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, paddingBottom: 30, maxHeight: '70%' }}>
            <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.inkFaint, marginBottom: 16 }} />
            <TitleSerif style={{ fontSize: 20, marginHorizontal: space.lg, marginBottom: 8 }}>
              {tone === 'saga' ? 'Na którą roślinę spojrzy Oko?' : 'Wybierz roślinę do rozmowy'}
            </TitleSerif>
            <FlatList
              data={plants}
              keyExtractor={(p) => p.id}
              ListEmptyComponent={
                <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.inkSoft, paddingHorizontal: space.lg, paddingVertical: space.md }}>
                  {tone === 'saga' ? 'Sad jest pusty.' : 'Nie masz jeszcze roślin.'}
                </Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { setContextPlant(item); setPlantPickerOpen(false); }}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: space.lg, borderBottomWidth: 1, borderBottomColor: 'rgba(30,26,22,0.06)' }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: contextPlant?.id === item.id ? colors.gold : 'rgba(196,147,74,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Text style={{ fontFamily: fonts.serif, color: contextPlant?.id === item.id ? '#fff' : colors.gold, fontSize: 18 }}>ᛟ</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <TitleSerif style={{ fontSize: 17 }}>{item.name}</TitleSerif>
                    <Mono style={{ fontSize: 11 }}>{item.species}</Mono>
                  </View>
                  {contextPlant?.id === item.id && (
                    <Text style={{ color: colors.goldDeep, fontSize: 16 }}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
            {contextPlant && (
              <TouchableOpacity
                onPress={() => { setContextPlant(null); setPlantPickerOpen(false); }}
                style={{ marginTop: 8, marginHorizontal: space.lg, paddingVertical: 12, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.inkFaint, alignItems: 'center' }}>
                <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.inkSoft }}>
                  {tone === 'saga' ? 'Rozmawiaj bez rośliny' : 'Usuń kontekst rośliny'}
                </Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

export function KronikaSagaScreen({ navigation }: any) {
  const tone = useAppStore(s => s.tone);
  const plants = useAppStore(s => s.plants);
  const activePlant = useAppStore(selectActivePlant);
  const sensors = useSensorStore();
  const [saga, setSaga] = useState<SagaResult | null>(null);
  const [loading, setLoading] = useState(false);

  const events = [
    { day: 'Dziś', rune: 'ᚹ', title: tone === 'saga' ? 'Ziemia zaszeptała' : 'Wilgoć spadła', detail: '28% · 14:22', tone: 'warn' as const },
    { day: 'Wczoraj', rune: 'ᛚ', title: tone === 'saga' ? 'Nakarmiłeś Yggdrasila' : 'Podlano', detail: '180 ml', tone: 'good' as const },
  ];

  const handleGenerateSaga = async () => {
    if (plants.length === 0) {
      Alert.alert('Brak roślin', 'Dodaj najpierw roślinę w sekcji Horda.');
      return;
    }
    setLoading(true);
    try {
      const r = await generateSaga(plants, sensors, activePlant?.name ?? 'Sad jarla');
      setSaga(r);
    } catch (e: any) {
      Alert.alert('Błąd generowania sagi', e.message);
    } finally {
      setLoading(false);
    }
  };

  const toneColor: Record<SagaResult['tone'], string> = {
    hopeful: colors.good,
    neutral: colors.goldDeep,
    ominous: colors.bad,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper2 }}>
      <View style={{ padding: space.xl }}>
        <Mono>Kronika</Mono>
        <TitleSerif style={{ fontSize: 30 }}>{tone === 'saga' ? 'Saga sadu' : 'Zdarzenia'}</TitleSerif>
      </View>
      <ScrollView>
        <TouchableOpacity
          onPress={handleGenerateSaga}
          disabled={loading}
          style={{ marginHorizontal: space.lg, marginBottom: space.md, padding: 14, borderRadius: radius.pill, alignItems: 'center', borderWidth: 1.5, borderColor: colors.gold, opacity: loading ? 0.5 : 1 }}>
          <Text style={{ color: colors.goldDeep, fontFamily: fonts.sans, fontWeight: '600' }}>
            {loading
              ? (tone === 'saga' ? 'Skald układa słowa…' : 'Generuję…')
              : (tone === 'saga' ? 'Poproś skalda o sagę dnia' : 'Wygeneruj wpis dnia')}
          </Text>
        </TouchableOpacity>

        {saga && (
          <Card style={{ borderLeftWidth: 3, borderLeftColor: toneColor[saga.tone] }}>
            <Mono style={{ marginBottom: 6 }}>{saga.tone.toUpperCase()}</Mono>
            <TitleSerif style={{ fontSize: 20, marginBottom: 8 }}>{saga.title}</TitleSerif>
            <Text style={{ fontFamily: fonts.serif, fontSize: 15, color: colors.ink, lineHeight: 23 }}>
              {saga.body}
            </Text>
          </Card>
        )}

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
            <Chart data={s.data} color={s.color} opt={s.opt as [number, number]} max={s.max || 100} min={s.min || 0} />
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

export function UstawieniaScreen({ navigation }: any) {
  const tone = useAppStore(s => s.tone);
  const setTone = useAppStore(s => s.setTone);
  const connected = useSensorStore(s => s.connected);
  const deviceName = useSensorStore(s => s.deviceName);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper2 }}>
      <ScrollView>
        <View style={{ padding: space.xl }}>
          <Mono>Ustawienia</Mono>
          <TitleSerif style={{ fontSize: 30 }}>{tone === 'saga' ? 'Rytuały' : 'Konfiguracja'}</TitleSerif>
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

        {/* Device rows */}
        <Card>
          {([
            { rune: 'ᛗ', title: 'Oko — parowanie', detail: connected ? (deviceName ?? 'połączono') : 'rozłączono', onPress: () => navigation.navigate('Pair') },
            { rune: 'ᛒ', title: 'Powiadomienia', detail: 'Włączone' },
            { rune: 'ᚨ', title: 'O aplikacji', detail: 'v 0.7.2' },
          ] as { rune: string; title: string; detail: string; onPress?: () => void }[]).map((r, i, arr) => {
            const content = (
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: i === arr.length - 1 ? 0 : 1, borderBottomColor: 'rgba(30,26,22,0.08)' }}>
                <TitleSerif style={{ fontSize: 20, color: colors.gold, width: 32 }}>{r.rune}</TitleSerif>
                <Text style={{ flex: 1, fontFamily: fonts.serif, fontSize: 18, color: colors.ink }}>{r.title}</Text>
                <Mono style={{ fontSize: 12, color: colors.inkSoft }}>{r.detail}</Mono>
                <Text style={{ color: colors.inkSoft, fontSize: 20, marginLeft: 8 }}>›</Text>
              </View>
            );
            return r.onPress ? (
              <TouchableOpacity key={i} onPress={r.onPress}>{content}</TouchableOpacity>
            ) : (
              <View key={i}>{content}</View>
            );
          })}
        </Card>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

export function HordaScreen({ navigation }: any) {
  const tone = useAppStore(s => s.tone);
  const storedPlants = useAppStore(s => s.plants);
  const activeId = useAppStore(s => s.activePlantId);
  const setActive = useAppStore(s => s.setActive);
  const removePlant = useAppStore(s => s.removePlant);
  const sensors = useSensorStore();

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      tone === 'saga' ? 'Odeślij Oko' : 'Usunąć roślinę?',
      tone === 'saga'
        ? `Czy naprawdę pozwolisz "${name}" odejść w mgłę Helu?`
        : `Usunąć "${name}"? Tej operacji nie można cofnąć.`,
      [
        { text: 'Anuluj', style: 'cancel' },
        { text: tone === 'saga' ? 'Odeślij' : 'Usuń', style: 'destructive', onPress: () => removePlant(id) },
      ],
    );
  };

  const runes = ['ᛟ', 'ᚠ', 'ᛚ', 'ᛋ', 'ᛝ', 'ᚨ', 'ᚱ', 'ᚷ'];

  const plants = storedPlants.map((p, i) => {
    const score = graceScore(sensors, p.optimal);
    const toneKey: 'good' | 'warn' | 'bad' =
      score == null ? 'warn' : score > 70 ? 'good' : score > 40 ? 'warn' : 'bad';
    return {
      id: p.id,
      name: p.name,
      species: p.species,
      rune: runes[i % runes.length],
      photoUri: p.photoUri,
      tone: toneKey,
      score,
      value: score == null ? '—' : `${score}%`,
    };
  });

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
        <View style={{ padding: 16, marginTop: 8 }}>
          {plants.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.inkSoft, textAlign: 'center', marginBottom: 16 }}>
                {tone === 'saga' ? 'Sad jest pusty. Przywołaj pierwsze Oko.' : 'Nie masz jeszcze żadnych roślin.'}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AddPlant')}
                style={{ backgroundColor: colors.gold, paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.pill }}>
                <Text style={{ color: '#fff', fontFamily: fonts.sans, fontWeight: '600' }}>
                  {tone === 'saga' ? 'Dodaj pierwszą roślinę' : 'Dodaj roślinę'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            plants.map(p => (
              <Swipeable
                key={p.id}
                friction={2}
                rightThreshold={40}
                renderRightActions={() => (
                  <TouchableOpacity
                    onPress={() => handleDelete(p.id, p.name)}
                    style={{ backgroundColor: colors.bad, justifyContent: 'center', alignItems: 'center', width: 80 }}>
                    <Text style={{ color: '#fff', fontFamily: fonts.sans, fontSize: 13, fontWeight: '600' }}>
                      {tone === 'saga' ? 'Odeślij' : 'Usuń'}
                    </Text>
                  </TouchableOpacity>
                )}>
                <TouchableOpacity
                  onPress={() => {
                    setActive(p.id);
                    navigation.navigate('Dashboard');
                  }}
                  activeOpacity={0.7}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 0, backgroundColor: colors.paper2, borderBottomWidth: 1, borderBottomColor: 'rgba(30,26,22,0.08)' }}>
                  {p.photoUri ? (
                    <Image
                      source={{ uri: p.photoUri }}
                      style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.paper, borderWidth: p.id === activeId ? 2 : 0, borderColor: colors.gold }}
                    />
                  ) : (
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: p.id === activeId ? colors.gold : 'rgba(196,147,74,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontFamily: fonts.serif, color: p.id === activeId ? '#fff' : colors.gold, fontSize: 22 }}>{p.rune}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1, paddingLeft: 12 }}>
                    <TitleSerif style={{ fontSize: 18 }}>{p.name}</TitleSerif>
                    <Mono style={{ fontSize: 11, color: colors.inkSoft }}>{p.species}</Mono>
                  </View>
                  <TitleSerif style={{ fontSize: 18, color: p.score == null ? colors.inkFaint : colors[p.tone as keyof typeof colors] }}>{p.value}</TitleSerif>
                  <Text style={{ color: colors.inkFaint, fontSize: 20, marginLeft: 8 }}>›</Text>
                </TouchableOpacity>
              </Swipeable>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
