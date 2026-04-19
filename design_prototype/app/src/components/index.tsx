import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, fonts, radius, space, shadow } from '@/theme/tokens';

export const Card = ({ children, style, paper2 }: { children: React.ReactNode; style?: ViewStyle; paper2?: boolean }) => (
  <View style={[
    { backgroundColor: paper2 ? colors.paper2 : colors.paper,
      borderRadius: radius.lg, padding: space.lg,
      marginHorizontal: space.lg, marginBottom: space.sm,
      borderWidth: 1, borderColor: 'rgba(30,26,22,0.08)' },
    shadow.card, style]}>{children}</View>
);

export const TitleSerif = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <Text style={[{ fontFamily: fonts.serif, fontSize: 24, color: colors.ink, fontWeight: '600' }, style]}>{children}</Text>
);

export const Mono = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => (
  <Text style={[{ fontFamily: fonts.mono, fontSize: 11, color: colors.inkFaint, letterSpacing: 0.8, textTransform: 'uppercase' }, style]}>{children}</Text>
);

export const StatusDot = ({ tone = 'good' }: { tone?: 'good' | 'warn' | 'bad' }) => (
  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors[tone] }} />
);

export const Chip = ({ label, tone = 'good' }: { label: string; tone?: 'good' | 'warn' | 'bad' }) => {
  const bg = { good: 'rgba(107,138,74,0.12)', warn: 'rgba(196,142,72,0.14)', bad: 'rgba(168,68,46,0.12)' }[tone];
  const fg = { good: colors.good, warn: '#8a5f28', bad: colors.bad }[tone];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 4,
      borderRadius: radius.pill, borderWidth: 1, borderColor: fg + '4d' }}>
      <StatusDot tone={tone} />
      <Text style={{ fontFamily: fonts.mono, fontSize: 10, color: fg, letterSpacing: 0.8, textTransform: 'uppercase' }}>{label}</Text>
    </View>
  );
};

export const Rune = ({ children, size = 22, color = colors.gold }: { children: React.ReactNode; size?: number; color?: string }) => (
  <Text style={{ fontFamily: fonts.serif, fontSize: size, color, lineHeight: size * 1.05 }}>{children}</Text>
);

export const SensorBar = ({ name, value, unit, min, max, optMin, optMax, status = 'good' }: {
  name: string; value: number; unit: string; min: number; max: number;
  optMin: number; optMax: number; status?: 'good' | 'warn' | 'bad';
}) => {
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  return (
    <View style={{ paddingVertical: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.ink, flex: 1 }}>{name}</Text>
        <Text style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.ink }}>{value}{unit}</Text>
      </View>
      <View style={{ height: 8, backgroundColor: colors.paper3, borderRadius: 999, overflow: 'visible' }}>
        <View style={{
          position: 'absolute', top: 0, bottom: 0,
          left: pct(optMin) + '%', width: (pct(optMax) - pct(optMin)) + '%',
          backgroundColor: 'rgba(107,138,74,0.28)', borderRadius: 999,
        }} />
        <View style={{
          position: 'absolute', top: -4, left: `${pct(value)}%`,
          marginLeft: -8, width: 16, height: 16, borderRadius: 8,
          backgroundColor: colors[status], borderWidth: 3, borderColor: colors.paper,
        }} />
      </View>
    </View>
  );
};
