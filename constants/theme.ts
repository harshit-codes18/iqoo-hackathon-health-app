import { Platform } from 'react-native';

const tintColorLight = '#2563EB'; // Medical royal blue
const tintColorDark = '#3B82F6';

export const Colors = {
  light: {
    // Standard Expo / Theme tokens (backward compatible)
    text: '#0F172A', // Slate 900
    background: '#F8FAFC', // Slate 50
    tint: tintColorLight,
    icon: '#64748B', // Slate 500
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,

    // Extended Health-Tech Palette
    primary: '#2563EB', // Blue 600
    primaryLight: '#EFF6FF', // Blue 50
    primaryForeground: '#FFFFFF',
    
    secondary: '#0D9488', // Teal 600
    secondaryLight: '#F0FDFA', // Teal 50
    secondaryForeground: '#FFFFFF',

    surface: '#FFFFFF',
    surfaceSubtle: '#F8FAFC',
    surfaceMuted: '#F1F5F9', // Slate 100
    surfaceElevated: '#FFFFFF',

    border: '#E2E8F0', // Slate 200
    borderSubtle: '#F1F5F9',
    borderStrong: '#CBD5E1',

    textPrimary: '#0F172A',
    textSecondary: '#475569', // Slate 600
    textMuted: '#94A3B8', // Slate 400
    textInverse: '#FFFFFF',

    success: '#16A34A', // Green 600
    successBg: '#F0FDF4',
    successBorder: '#BBF7D0',
    
    warning: '#D97706', // Amber 600
    warningBg: '#FFFBEB',
    warningBorder: '#FDE68A',

    danger: '#DC2626', // Red 600
    dangerBg: '#FEF2F2',
    dangerBorder: '#FECACA',

    info: '#0284C7', // Sky 600
    infoBg: '#F0F9FF',
    infoBorder: '#BAE6FD',
  },
  dark: {
    // Standard Expo / Theme tokens (backward compatible)
    text: '#F8FAFC',
    background: '#0B0F17',
    tint: tintColorDark,
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorDark,

    // Extended Health-Tech Palette
    primary: '#3B82F6',
    primaryLight: '#1E293B',
    primaryForeground: '#FFFFFF',

    secondary: '#14B8A6',
    secondaryLight: '#134E4A',
    secondaryForeground: '#FFFFFF',

    surface: '#141A23',
    surfaceSubtle: '#0F172A',
    surfaceMuted: '#1E293B',
    surfaceElevated: '#1E293B',

    border: '#243042',
    borderSubtle: '#1E293B',
    borderStrong: '#334155',

    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textInverse: '#0B0F17',

    success: '#22C55E',
    successBg: '#052E16',
    successBorder: '#166534',

    warning: '#F59E0B',
    warningBg: '#451A03',
    warningBorder: '#92400E',

    danger: '#EF4444',
    dangerBg: '#450A0A',
    dangerBorder: '#991B1B',

    info: '#38BDF8',
    infoBg: '#082F49',
    infoBorder: '#0369A1',
  },
};

export type SeverityType = 'normal' | 'mild' | 'high' | 'low';

export const SeverityColors = {
  light: {
    normal: {
      text: '#15803D',
      bg: '#F0FDF4',
      border: '#BBF7D0',
      badge: '#DCFCE7',
      icon: '#16A34A',
      label: 'NORMAL',
    },
    mild: {
      text: '#B45309',
      bg: '#FFFBEB',
      border: '#FDE68A',
      badge: '#FEF3C7',
      icon: '#D97706',
      label: 'MILD ATTENTION',
    },
    high: {
      text: '#B91C1C',
      bg: '#FEF2F2',
      border: '#FECACA',
      badge: '#FEE2E2',
      icon: '#DC2626',
      label: 'HIGH / ELEVATED',
    },
    low: {
      text: '#C2410C',
      bg: '#FFF7ED',
      border: '#FFEDD5',
      badge: '#FFEDD5',
      icon: '#EA580C',
      label: 'LOW / DEFICIENT',
    },
  },
  dark: {
    normal: {
      text: '#4ADE80',
      bg: '#052E16',
      border: '#166534',
      badge: '#14532D',
      icon: '#22C55E',
      label: 'NORMAL',
    },
    mild: {
      text: '#FCD34D',
      bg: '#451A03',
      border: '#92400E',
      badge: '#78350F',
      icon: '#F59E0B',
      label: 'MILD ATTENTION',
    },
    high: {
      text: '#F87171',
      bg: '#450A0A',
      border: '#991B1B',
      badge: '#7F1D1D',
      icon: '#EF4444',
      label: 'HIGH / ELEVATED',
    },
    low: {
      text: '#FB923C',
      bg: '#431407',
      border: '#9A3412',
      badge: '#7C2D12',
      icon: '#F97316',
      label: 'LOW / DEFICIENT',
    },
  },
};

export const Spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
};

export const Radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const Typography = {
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  lineHeights: {
    xs: 14,
    sm: 18,
    base: 22,
    md: 24,
    lg: 26,
    xl: 28,
    xxl: 32,
    xxxl: 38,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
};

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
