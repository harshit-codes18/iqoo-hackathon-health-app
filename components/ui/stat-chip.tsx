import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type StatChipVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';

export interface StatChipProps {
  label: string;
  value: string | number;
  variant?: StatChipVariant;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export function StatChip({
  label,
  value,
  variant = 'default',
  icon,
  size = 'md',
  style,
  onPress,
}: StatChipProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: themeColors.successBg,
          border: themeColors.successBorder,
          valColor: themeColors.success,
          lblColor: themeColors.textSecondary,
        };
      case 'warning':
        return {
          bg: themeColors.warningBg,
          border: themeColors.warningBorder,
          valColor: themeColors.warning,
          lblColor: themeColors.textSecondary,
        };
      case 'danger':
        return {
          bg: themeColors.dangerBg,
          border: themeColors.dangerBorder,
          valColor: themeColors.danger,
          lblColor: themeColors.textSecondary,
        };
      case 'info':
        return {
          bg: themeColors.infoBg,
          border: themeColors.infoBorder,
          valColor: themeColors.info,
          lblColor: themeColors.textSecondary,
        };
      case 'primary':
        return {
          bg: themeColors.primaryLight,
          border: colorScheme === 'dark' ? themeColors.border : '#BFDBFE',
          valColor: themeColors.primary,
          lblColor: themeColors.textSecondary,
        };
      case 'default':
      default:
        return {
          bg: themeColors.surfaceSubtle,
          border: themeColors.border,
          valColor: themeColors.textPrimary,
          lblColor: themeColors.textSecondary,
        };
    }
  };

  const vStyles = getVariantStyles();
  const isSmall = size === 'sm';

  const ContainerComponent = onPress ? Pressable : View;

  return (
    <ContainerComponent
      onPress={onPress}
      style={[
        styles.chip,
        isSmall ? styles.chipSm : styles.chipMd,
        {
          backgroundColor: vStyles.bg,
          borderColor: vStyles.border,
        },
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.value,
          isSmall ? styles.valueSm : styles.valueMd,
          { color: vStyles.valColor },
        ]}
      >
        {value}
      </Text>
      <Text
        style={[
          styles.label,
          isSmall ? styles.labelSm : styles.labelMd,
          { color: vStyles.lblColor },
        ]}
      >
        {label}
      </Text>
    </ContainerComponent>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chipSm: {
    paddingVertical: Spacing.xxs + 1,
    paddingHorizontal: Spacing.sm,
    gap: 4,
  },
  chipMd: {
    paddingVertical: Spacing.xs + 1,
    paddingHorizontal: Spacing.md,
    gap: 6,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontWeight: Typography.weights.bold,
  },
  valueSm: {
    fontSize: Typography.sizes.xs,
    lineHeight: 16,
  },
  valueMd: {
    fontSize: Typography.sizes.sm,
    lineHeight: 18,
  },
  label: {
    fontWeight: Typography.weights.medium,
  },
  labelSm: {
    fontSize: Typography.sizes.xs - 1,
    lineHeight: 15,
  },
  labelMd: {
    fontSize: Typography.sizes.xs,
    lineHeight: 18,
  },
});
