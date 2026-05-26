export const lightColors = {
  background: '#f3f6ed',
  surface: '#ffffff',
  brand: '#0b2912',
  accent: '#5f8c22',
  textPrimary: '#0b2912',
  textSecondary: '#5c6752',
  textTertiary: '#7b8c75',
  border: '#d6d9cb',
  muted: '#8c9684',
  success: '#70b33e',
  danger: '#d22f20',
  dangerSubtle: '#fbeaea',
  highlight: '#d6f18a',
  highlightSubtle: '#ecf7bf',
  highlightBright: '#b7de66',
  inputBg: '#eef1e7',
  surfaceGreen: '#d6e3c1',
};

export const darkColors = {
  background: '#121a14', // dark green charcoal
  surface: '#1e2b20', // slightly lighter dark green for cards
  brand: '#a8d8b1', // inverted brand color for highlights/accents
  accent: '#7bb52b', // brightened accent
  textPrimary: '#F4F4F5', // off-white
  textSecondary: '#A1A1AA', // muted gray
  textTertiary: '#7b8c75', // keep
  border: '#2e4231', // dark green border
  muted: '#8c9684', // keep
  success: '#70b33e', // keep
  danger: '#ff6b6b', // brighten danger
  dangerSubtle: '#3d1a1a', // dark red subtle
  highlight: '#5f8c22', // tone down highlight for dark mode
  highlightSubtle: '#2e4231', // subtle dark green highlight
  highlightBright: '#a8d8b1',
  inputBg: '#1a241b', // very dark input bg
  surfaceGreen: '#243627', // dark surface green
};

// Keep COLORS for backward compatibility temporarily while we refactor
export const COLORS = lightColors;

export const TYPOGRAPHY = {
  fontFamily: 'PlusJakartaSans',
  // Size scale
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 28,
  display: 32,
  hero: 30,
  // Weight scale — use these instead of raw strings
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900', // Reserve for 1–2 true hero moments per screen only
};

// Border radius tokens — use these instead of ad-hoc integers
export const RADIUS = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  full: 999,
};

export const SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
  elevation: 8,
};
