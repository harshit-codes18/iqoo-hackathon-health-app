import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Radius, SeverityColors, SeverityType, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'muted';
export type CardElevation = 'none' | 'sm' | 'md' | 'lg';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: CardVariant;
  elevation?: CardElevation;
  padding?: CardPadding;
  severity?: SeverityType;
}

export function Card({
  children,
  style,
  variant = 'default',
  elevation = 'sm',
  padding = 'md',
  severity,
}: CardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const getPadding = (): number => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return Spacing.sm;
      case 'md':
        return Spacing.md;
      case 'lg':
        return Spacing.lg;
    }
  };

  const getVariantStyles = (): ViewStyle => {
    // If severity is provided, use severity-themed colors for background and border
    if (severity) {
      const sevColors = SeverityColors[colorScheme][severity];
      return {
        backgroundColor: sevColors.bg,
        borderWidth: 1,
        borderColor: sevColors.border,
      };
    }

    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: themeColors.surface,
          borderWidth: 1,
          borderColor: themeColors.border,
        };
      case 'elevated':
        return {
          backgroundColor: themeColors.surface,
          borderWidth: 1,
          borderColor: colorScheme === 'dark' ? themeColors.border : '#F1F5F9',
        };
      case 'muted':
        return {
          backgroundColor: themeColors.surfaceMuted,
          borderWidth: 1,
          borderColor: themeColors.borderSubtle,
        };
      case 'default':
      default:
        return {
          backgroundColor: themeColors.surface,
          borderWidth: 1,
          borderColor: themeColors.border,
        };
    }
  };

  return (
    <View
      style={[
        styles.card,
        { padding: getPadding() },
        getVariantStyles(),
        !severity && Shadows[elevation],
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
});
