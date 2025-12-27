// Light theme colors
export const lightColors = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  secondary: '#10B981',
  secondaryDark: '#059669',
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

// Dark theme colors
export const darkColors = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  secondary: '#10B981',
  secondaryDark: '#059669',
  background: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#334155',
  surfaceDark: '#0F172A',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  success: '#10B981',
  successLight: '#D1FAE5',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  border: '#475569',
  borderLight: '#64748B',
  card: '#1E293B',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(15, 23, 42, 0.8)',
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
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
};

const typography = {
  display: {
    fontSize: 36,
    fontWeight: 'bold' as const,
    lineHeight: 44,
  },
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
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
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
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

const getShadows = (black: string) => ({
  sm: {
    shadowColor: black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});

// Light theme
export const lightTheme = {
  colors: lightColors,
  spacing,
  borderRadius,
  typography,
  shadows: getShadows(lightColors.black),
};

// Dark theme
export const darkTheme = {
  colors: darkColors,
  spacing,
  borderRadius,
  typography,
  shadows: getShadows(darkColors.black),
};

// Default export (light theme for backwards compatibility)
export const theme = lightTheme;
export const colors = lightColors;

export type ThemeType = typeof lightTheme;