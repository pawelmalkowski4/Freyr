import React from 'react';
import { View, Text, ViewStyle, TextStyle, DimensionValue } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
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

export const Chart = ({ data, color, opt, max = 100, min = 0 }: {
  data: number[]; color: string; opt?: [number, number]; max?: number; min?: number;
}) => {
  const w = 320, h = 70, pad = 4;
  if (data.length === 0) {
    return (
      <View style={{ height: 90, marginTop: 12, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.inkFaint, letterSpacing: 0.8 }}>
          BRAK HISTORII
        </Text>
      </View>
    );
  }
  const effMin = opt ? Math.min(min, opt[0], ...data) : Math.min(min, ...data);
  const effMax = opt ? Math.max(max, opt[1], ...data) : Math.max(max, ...data);
  const span = Math.max(effMax - effMin, 1);
  const norm = (v: number) => h - pad - ((v - effMin) / span) * (h - pad * 2);
  const single = data.length === 1;
  const pts = data.map((v, i) => [
    single ? w / 2 : pad + (i / (data.length - 1)) * (w - pad * 2),
    norm(v),
  ]);
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = path + ` L${w - pad} ${h - pad} L${pad} ${h - pad} Z`;
  return (
    <View style={{ height: 90, marginTop: 12 }}>
      <Svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }}>
        {opt && (
          <Rect
            x={pad}
            y={norm(opt[1])}
            width={w - pad * 2}
            height={Math.max(0, norm(opt[0]) - norm(opt[1]))}
            fill="rgba(107,138,74,0.15)"
          />
        )}
        <Path d={area} fill={color} opacity="0.15" />
        <Path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) =>
          i === pts.length - 1 ? (
            <Circle key={i} cx={p[0]} cy={p[1]} r="4" fill={color} stroke="#fff" strokeWidth="2" />
          ) : null
        )}
      </Svg>
    </View>
  );
};

export const SensorBar = ({ name, value, unit, min, max, optMin, optMax, status = 'good' }: {
  name: string; value: number | null; unit: string; min: number; max: number;
  optMin: number; optMax: number; status?: 'good' | 'warn' | 'bad';
}) => {
  // Expand axis if optimal range (or current value) exceeds provided min/max.
  const effMin = Math.min(min, optMin, value ?? optMin);
  const effMax = Math.max(max, optMax, value ?? optMax);
  const span = Math.max(effMax - effMin, 1);
  const clamp = (p: number) => Math.max(0, Math.min(100, p));
  const pct = (v: number) => clamp(((v - effMin) / span) * 100);
  const optLeft = `${pct(optMin)}%` as DimensionValue;
  const optWidth = `${Math.max(0, pct(optMax) - pct(optMin))}%` as DimensionValue;
  const hasValue = value != null;
  const valueLeft = hasValue ? (`${pct(value!)}%` as DimensionValue) : undefined;
  return (
    <View style={{ paddingVertical: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.ink, flex: 1 }}>{name}</Text>
        <Text style={{ fontFamily: fonts.mono, fontSize: 13, color: hasValue ? colors.ink : colors.inkFaint }}>
          {hasValue ? `${value}${unit}` : `— ${unit}`.trim()}
        </Text>
      </View>
      <View style={{ height: 8, backgroundColor: colors.paper3, borderRadius: 999, overflow: 'visible' }}>
        <View style={{
          position: 'absolute', top: 0, bottom: 0,
          left: optLeft, width: optWidth,
          backgroundColor: 'rgba(107,138,74,0.28)', borderRadius: 999,
        }} />
        {hasValue && valueLeft !== undefined && (
          <View style={{
            position: 'absolute', top: -4, left: valueLeft,
            marginLeft: -8, width: 16, height: 16, borderRadius: 8,
            backgroundColor: colors[status], borderWidth: 3, borderColor: colors.paper,
          }} />
        )}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        <Mono style={{ fontSize: 10, color: colors.inkFaint }}>{Math.round(effMin)}{unit}</Mono>
        <Mono style={{ fontSize: 10, color: colors.inkFaint }}>{Math.round(effMax)}{unit}</Mono>
      </View>
    </View>
  );
};
