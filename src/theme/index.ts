// Clean, simple, standard theme
export const gradients = {
  primary: ['#0033FF', '#000080'] as const, // Sharper, more vibrant bento blue
  secondary: ['#64748B', '#334155'] as const,
  accent: ['#0033FF', '#000080'] as const,
  success: ['#10B981', '#059669'] as const,
  warning: ['#F59E0B', '#D97706'] as const,
  error: ['#EF4444', '#DC2626'] as const,
  dark: ['#1E293B', '#0F172A'] as const,
  light: ['#FFFFFF', '#F8FAFC'] as const,
  glass: ['#FFFFFF', '#F8FAFC'] as const,
  glassDark: ['#1E293B', '#0F172A'] as const,
};

export const lightColors = {
  primary: '#001AFF',
  primaryDark: '#00008B',
  primaryLight: '#4D66FF',
  secondary: '#64748B',
  secondaryDark: '#475569',
  accent: '#001AFF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceLight: '#F1F5F9',
  surfaceDark: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  success: '#16A34A',
  successLight: '#DCFCE7',
  info: '#1A3FBB',
  infoLight: '#DBEAFE',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  card: '#FFFFFF',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(15, 23, 42, 0.5)',
  gray: {
    50: '#F9FAFB',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  }
};

// Dark theme uses the same clean palette as light but inverted
export const darkColors = {
  primary: '#001AFF',
  primaryDark: '#00008B',
  primaryLight: '#4D66FF',
  secondary: '#64748B',
  secondaryDark: '#475569',
  accent: '#001AFF',
  background: '#080B11', // Richer deep black-blue
  surface: '#121926',
  surfaceLight: '#1C2738',
  surfaceDark: '#080B11',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  error: '#F87171',
  errorLight: 'rgba(248, 113, 113, 0.15)',
  warning: '#FBBF24',
  warningLight: 'rgba(251, 191, 36, 0.15)',
  success: '#4ADE80',
  successLight: 'rgba(74, 222, 128, 0.15)',
  info: '#456DFF',
  infoLight: 'rgba(69, 109, 255, 0.15)',
  border: '#1E293B',
  borderLight: '#121926',
  card: '#121926',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.75)',
  gray: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  }
};

const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

const borderRadius = {
  xs: 6,
  sm: 12,
  md: 20,
  lg: 24,
  xl: 32,
  round: 9999,
};

const typography = {
  display: {
    fontSize: 36,
    fontWeight: '700' as const,
    lineHeight: 44,
  },
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 30,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
};

const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  glow: {
    shadowColor: '#000', // Assuming glow also uses a fixed color now
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
};

// Light theme (default)
export const lightTheme = {
  colors: lightColors,
  gradients: gradients,
  spacing,
  borderRadius,
  typography,
  shadows,
  mode: 'light' as const,
};

// Dark theme
export const darkTheme = {
  colors: darkColors,
  gradients: gradients,
  spacing,
  borderRadius,
  typography,
  shadows,
  mode: 'dark' as const,
};

// Default export — light theme for a clean standard look
export const theme = lightTheme;
export const colors = lightColors;

export type ThemeType = typeof lightTheme;