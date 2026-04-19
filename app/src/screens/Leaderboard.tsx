import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, space } from '@/theme/tokens';
import { Card, TitleSerif, Mono } from '@/components';
import { useAppStore } from '@/state/app';
import { useSensorStore, graceScore } from '@/state/sensors';

type Entry = {
  id: string;
  name: string;
  title: string;
  score: number;
  isYou?: boolean;
};

const MOCK_VIKINGS: Omit<Entry, 'score' | 'isYou'>[] = [
  { id: 'v1',  name: 'Ragnar Lothbrok',      title: 'Jarl Kattegatu' },
  { id: 'v2',  name: 'Bjorn Ironside',       title: 'Syn Ragnara' },
  { id: 'v3',  name: 'Lagertha',             title: 'Tarczowniczka' },
  { id: 'v4',  name: 'Ivar Beinlausi',       title: 'Bez-kości' },
  { id: 'v5',  name: 'Floki Vilgerdarson',   title: 'Budowniczy łodzi' },
  { id: 'v6',  name: 'Rollo z Normandii',    title: 'Jarl Paryża' },
  { id: 'v7',  name: 'Sigurd Ormr-í-auga',   title: 'Oko-Węża' },
  { id: 'v8',  name: 'Astrid Sigvardsdottir', title: 'Królowa Hedeby' },
  { id: 'v9',  name: 'Helga Fair-Hair',      title: 'Żona Flokiego' },
  { id: 'v10', name: 'Ubbe Ragnarsson',      title: 'Osadnik Anglii' },
  { id: 'v11', name: 'Hvitserk',             title: 'Biała koszula' },
  { id: 'v12', name: 'Gunnar Halfdansson',   title: 'Jarl Uppsali' },
  { id: 'v13', name: 'Olaf Tryggvason',      title: 'Król Norwegii' },
  { id: 'v14', name: 'Thorvald Erikson',     title: 'Odkrywca Winlandii' },
  { id: 'v15', name: 'Einar Haraldsson',     title: 'Skald z Orkadów' },
  { id: 'v16', name: 'Freydis Eiriksdottir', title: 'Córa Eryka Rudego' },
  { id: 'v17', name: 'Erik Raudi',           title: 'Rudy — Grenlandia' },
  { id: 'v18', name: 'Harald Harfagri',      title: 'Pięknowłosy' },
  { id: 'v19', name: 'Magnus Barfot',        title: 'Bosonogi' },
  { id: 'v20', name: 'Sven Tveskæg',         title: 'Widłobrody' },
];

// Deterministic pseudo-random based on id (so leaderboard is stable between renders)
const stableScore = (id: string): number => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  // Range 25–95, clustered around 60–85
  const raw = Math.abs(hash) % 71 + 25;
  return raw;
};

export function LeaderboardScreen() {
  const tone = useAppStore(s => s.tone);
  const plants = useAppStore(s => s.plants);
  const sensors = useSensorStore();

  const myScore = useMemo(() => {
    if (plants.length === 0) return null;
    const scores = plants
      .map(p => graceScore(sensors, p.optimal))
      .filter((v): v is number => v != null);
    if (scores.length === 0) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [plants, sensors.temp, sensors.humidity, sensors.soil, sensors.light, sensors.connected]);

  const entries: Entry[] = useMemo(() => {
    const mocks: Entry[] = MOCK_VIKINGS.map(v => ({ ...v, score: stableScore(v.id) }));
    const all: Entry[] = myScore != null
      ? [...mocks, { id: 'you', name: tone === 'saga' ? 'Ty, jarlu' : 'Ty', title: tone === 'saga' ? 'Strażnik sadu' : 'Twoja osada', score: myScore, isYou: true }]
      : mocks;
    return all.sort((a, b) => b.score - a.score);
  }, [myScore, tone]);

  const myRank = entries.findIndex(e => e.isYou) + 1;

  const medal = (rank: number) => rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
  const scoreColor = (s: number) => s >= 75 ? colors.good : s >= 50 ? colors.goldDeep : colors.bad;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper2 }}>
      <ScrollView>
        <View style={{ padding: space.xl }}>
          <Mono>{tone === 'saga' ? 'Walhalla sadów' : 'Ranking'}</Mono>
          <TitleSerif style={{ fontSize: 30 }}>{tone === 'saga' ? 'Zaszczyt jarlów' : 'Leaderboard'}</TitleSerif>
          <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.inkSoft, marginTop: 4, lineHeight: 19 }}>
            {tone === 'saga'
              ? 'Średnia łaska Freyra z wszystkich twoich roślin w porównaniu z innymi jarlami.'
              : 'Średni wynik wszystkich twoich roślin w porównaniu z innymi użytkownikami.'}
          </Text>
        </View>

        {myScore != null && myRank > 0 && (
          <Card style={{ backgroundColor: colors.paper, borderColor: colors.gold, borderWidth: 1.5 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ alignItems: 'center', width: 52 }}>
                <TitleSerif style={{ fontSize: 26, color: colors.goldDeep }}>#{myRank}</TitleSerif>
                <Mono style={{ fontSize: 9 }}>MIEJSCE</Mono>
              </View>
              <View style={{ flex: 1, paddingLeft: 12 }}>
                <TitleSerif style={{ fontSize: 18 }}>{tone === 'saga' ? 'Ty, jarlu' : 'Twoja osada'}</TitleSerif>
                <Mono style={{ fontSize: 11 }}>
                  ŚREDNIA Z {plants.length} {plants.length === 1 ? 'ROŚLINY' : plants.length < 5 ? 'ROŚLIN' : 'ROŚLIN'}
                </Mono>
              </View>
              <TitleSerif style={{ fontSize: 28, color: scoreColor(myScore) }}>{myScore}%</TitleSerif>
            </View>
          </Card>
        )}

        {myScore == null && (
          <Card>
            <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.inkSoft, lineHeight: 19 }}>
              {tone === 'saga'
                ? 'Twój sad jeszcze nie ma znaków. Przypnij Oko do rośliny, by stanąć w szeregu jarlów.'
                : 'Podepnij czujnik BLE do którejś z roślin, aby dołączyć do rankingu.'}
            </Text>
          </Card>
        )}

        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          {entries.map((e, i) => {
            const rank = i + 1;
            const m = medal(rank);
            return (
              <View key={e.id} style={{
                flexDirection: 'row', alignItems: 'center',
                paddingVertical: 12, paddingHorizontal: 12,
                backgroundColor: e.isYou ? 'rgba(196,147,74,0.12)' : 'transparent',
                borderRadius: 12,
                borderBottomWidth: i === entries.length - 1 ? 0 : 1,
                borderBottomColor: 'rgba(30,26,22,0.06)',
              }}>
                <View style={{ width: 36, alignItems: 'center' }}>
                  {m ? (
                    <Text style={{ fontSize: 22 }}>{m}</Text>
                  ) : (
                    <Mono style={{ fontSize: 13, color: colors.inkFaint }}>#{rank}</Mono>
                  )}
                </View>
                <View style={{ flex: 1, paddingLeft: 8 }}>
                  <Text style={{ fontFamily: fonts.serif, fontSize: 16, color: colors.ink, fontWeight: e.isYou ? '700' : '500' }}>
                    {e.name}
                  </Text>
                  <Mono style={{ fontSize: 10, color: colors.inkSoft, marginTop: 2 }}>{e.title}</Mono>
                </View>
                <View style={{
                  paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill,
                  backgroundColor: `${scoreColor(e.score)}22`,
                  borderWidth: 1, borderColor: `${scoreColor(e.score)}55`,
                }}>
                  <Text style={{ fontFamily: fonts.mono, fontSize: 14, fontWeight: '700', color: scoreColor(e.score) }}>
                    {e.score}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
