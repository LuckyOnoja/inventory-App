// Modern Industrial / Logistics inspired theme (Matches new logo)
export const gradients = {
  primary: ['#0033FF', '#001A99'] as const, // Vibrant Blue to Deep Blue
  secondary: ['#001A99', '#000B4D'] as const,
  accent: ['#3399FF', '#0033FF'] as const,
  success: ['#10B981', '#059669'] as const,
  warning: ['#FBBF24', '#D97706'] as const,
  error: ['#F87171', '#DC2626'] as const,
  dark: ['#050B1A', '#02060D'] as const,
  light: ['#F0F7FF', '#E0EFFF'] as const,
  glass: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)'] as const,
  glassDark: ['rgba(0, 51, 255, 0.1)', 'rgba(0, 0, 0, 0.4)'] as const,
};

export const lightColors = {
  primary: '#0033FF', // Logo Blue
  primaryDark: '#001A99',
  primaryLight: '#3366FF',
  secondary: '#64748B', // Professional Slate
  secondaryDark: '#475569',
  accent: '#0033FF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceLight: '#F1F5F9',
  surfaceDark: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  success: '#10B981',
  successLight: '#D1FAE5',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  card: '#FFFFFF',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(15, 23, 42, 0.6)',
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

export const darkColors = {
  primary: '#3366FF', // Vibrant Blue
  primaryDark: '#0033FF',
  primaryLight: '#6699FF',
  secondary: '#94A3B8', // Professional Slate
  secondaryDark: '#64748B',
  accent: '#3366FF',
  background: '#020617', // Deep Navy / Near Black
  surface: '#0F172A', // Navy Surface
  surfaceLight: '#1E293B',
  surfaceDark: '#020617',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  error: '#F87171',
  errorLight: 'rgba(239, 68, 68, 0.2)',
  warning: '#FBBF24',
  warningLight: 'rgba(245, 158, 11, 0.2)',
  success: '#34D399',
  successLight: 'rgba(16, 185, 129, 0.2)',
  info: '#60A5FA',
  infoLight: 'rgba(59, 130, 246, 0.2)',
  border: '#1E293B',
  borderLight: '#334155',
  card: 'rgba(15, 23, 42, 0.8)',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.8)',
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
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

const borderRadius = {
  xs: 4,
  sm: 10,
  md: 16,
  lg: 24, // Matches the squircle feel of the logo
  xl: 36,
  round: 9999,
};

const typography = {
  display: {
    fontSize: 42,
    fontWeight: '800' as const,
    lineHeight: 52,
    letterSpacing: -1,
  },
  h1: {
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 42,
    letterSpacing: -0.75,
  },
  h2: {
    fontSize: 26,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 30,
    letterSpacing: -0.25,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  bodyLarge: {
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400' as const,
  },
  body: {
    fontSize: 15,
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
    fontWeight: '600' as const,
    letterSpacing: 0.75,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
};

const getShadows = (color: string) => ({
  sm: {
    shadowColor: color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: color,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  lg: {
    shadowColor: color,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  glow: {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 15,
  }
});

// Light theme
export const lightTheme = {
  colors: lightColors,
  gradients: gradients,
  spacing,
  borderRadius,
  typography,
  shadows: getShadows(lightColors.primary),
  mode: 'light' as const,
};

// Dark theme
export const darkTheme = {
  colors: darkColors,
  gradients: gradients,
  spacing,
  borderRadius,
  typography,
  shadows: getShadows(darkColors.primary),
  mode: 'dark' as const,
};

// Default export
export const theme = darkTheme;
export const colors = darkColors;

export type ThemeType = typeof darkTheme;