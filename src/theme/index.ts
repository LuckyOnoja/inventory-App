// Web3 / Cyberpunk inspired theme
export const gradients = {
  primary: ['#0066FF', '#00CC66'] as const, // Blue to Green
  secondary: ['#00CC66', '#3B82F6'] as const,
  accent: ['#F472B6', '#9333EA'] as const,
  success: ['#34D399', '#10B981'] as const,
  warning: ['#FBBF24', '#F59E0B'] as const,
  error: ['#F87171', '#EF4444'] as const,
  dark: ['#050B14', '#0A1220'] as const,
  light: ['#F0F9FF', '#E0F2FE'] as const,
  glass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'] as const,
  glassDark: ['rgba(5, 11, 20, 0.6)', 'rgba(5, 11, 20, 0.4)'] as const,
};

export const lightColors = {
  primary: '#0066FF', // Vibrant Blue
  primaryDark: '#0052CC',
  primaryLight: '#3385FF',
  secondary: '#00CC66', // Vibrant Green
  secondaryDark: '#00A352',
  accent: '#D946EF',
  background: '#F0F9FF', // Very light blue tint
  surface: '#FFFFFF',
  surfaceLight: '#E0F2FE',
  surfaceDark: '#BAE6FD',
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
  border: '#E0F2FE',
  borderLight: '#F0F9FF',
  card: '#FFFFFF',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(15, 23, 42, 0.5)',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
};

export const darkColors = {
  primary: '#3399FF', // Bright Blue
  primaryDark: '#0066FF',
  primaryLight: '#66B2FF',
  secondary: '#33FF99', // Bright Green
  secondaryDark: '#00CC66',
  accent: '#E879F9',
  background: '#050B14', // Deep Dark Blue
  surface: '#0A1424', // Slightly lighter
  surfaceLight: '#111F36',
  surfaceDark: '#02060D',
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
  card: 'rgba(10, 20, 36, 0.7)', // Glassy Blue/Black
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.7)',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
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
  sm: 8,
  md: 12,
  lg: 20,
  xl: 32,
  round: 9999,
};

const typography = {
  display: {
    fontSize: 40,
    fontWeight: '800' as const,
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
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
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  buttonSmall: {
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
};

const getShadows = (color: string) => ({
  sm: {
    shadowColor: color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: color,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  glow: {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
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
  mode: 'light',
};

// Dark theme
export const darkTheme = {
  colors: darkColors,
  gradients: gradients,
  spacing,
  borderRadius,
  typography,
  shadows: getShadows(darkColors.primary),
  mode: 'dark',
};

// Default export
export const theme = darkTheme;
export const colors = darkColors;

export type ThemeType = typeof darkTheme;