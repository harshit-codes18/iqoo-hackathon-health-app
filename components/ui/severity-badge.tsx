import React, { ComponentProps } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Radius, SeverityColors, SeverityType, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export interface SeverityBadgeProps {
  severity: SeverityType;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function SeverityBadge({
  severity,
  size = 'md',
  showIcon = true,
  label,
  style,
  textStyle,
}: SeverityBadgeProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = SeverityColors[colorScheme][severity] ?? SeverityColors.light.normal;

  const displayLabel = label ?? colors.label;

  const getIconName = (): MaterialIconName => {
    switch (severity) {
      case 'normal':
        return 'check-circle';
      case 'mild':
        return 'info';
      case 'high':
        return 'arrow-upward';
      case 'low':
        return 'arrow-downward';
      default:
        return 'help-outline';
    }
  };

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        isSmall ? styles.badgeSm : styles.badgeMd,
        {
          backgroundColor: colors.badge,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {showIcon && (
        <MaterialIcons
          name={getIconName()}
          size={isSmall ? 12 : 14}
          color={colors.icon}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          isSmall ? styles.textSm : styles.textMd,
          { color: colors.text },
          textStyle,
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  badgeSm: {
    paddingVertical: Spacing.xxs,
    paddingHorizontal: Spacing.xs + 2,
    gap: 3,
  },
  badgeMd: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm + 2,
    gap: 5,
  },
  icon: {
    marginTop: 0.5,
  },
  text: {
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.4,
  },
  textSm: {
    fontSize: Typography.sizes.xs - 1,
    lineHeight: 13,
  },
  textMd: {
    fontSize: Typography.sizes.xs,
    lineHeight: 15,
  },
});
