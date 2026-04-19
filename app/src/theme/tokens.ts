// Theme tokens — synced with prototype CSS (prototype-style.css)
export const colors = {
  bg: '#1a1714',
  stage: '#2a2520',
  paper: '#f4ecdc',
  paper2: '#ebe0c9',
  paper3: '#e0d1b2',
  ink: '#1e1a16',
  inkSoft: '#5b4f40',
  inkFaint: '#9a8870',
  rule: '#c8b996',
  gold: '#c4934a',
  goldSoft: '#e3be7d',
  goldDeep: '#8a6328',
  good: '#6b8a4a',
  warn: '#c48e48',
  bad: '#a8442e',
};

export const fonts = {
  serif: 'CormorantGaramond_600SemiBold',  // load via expo-font
  sans: 'Inter_500Medium',
  mono: 'JetBrainsMono_400Regular',
};

export const radius = { sm: 8, md: 14, lg: 20, xl: 28, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  raised: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
};
