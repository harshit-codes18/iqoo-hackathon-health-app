import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'glass';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface CustomButtonProps {
  title?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function CustomButton({
  title,
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  haptic = true,
  style,
  textStyle,
}: CustomButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const handlePress = () => {
    if (disabled || loading) return;
    if (haptic) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } catch {
        // Safe fallback
      }
    }
    onPress?.();
  };

  // Base layout styles by size
  const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle; iconGap: number }> = {
    sm: {
      container: {
        paddingVertical: Spacing.xs + 2,
        paddingHorizontal: Spacing.md,
        borderRadius: Radius.sm,
        minHeight: 34,
      },
      text: {
        fontSize: Typography.sizes.sm,
        lineHeight: Typography.lineHeights.sm,
      },
      iconGap: 6,
    },
    md: {
      container: {
        paddingVertical: Spacing.sm + 3,
        paddingHorizontal: Spacing.lg,
        borderRadius: Radius.md,
        minHeight: 46,
      },
      text: {
        fontSize: Typography.sizes.base,
        lineHeight: Typography.lineHeights.base,
      },
      iconGap: 8,
    },
    lg: {
      container: {
        paddingVertical: Spacing.md + 2,
        paddingHorizontal: Spacing.xl,
        borderRadius: Radius.lg,
        minHeight: 54,
      },
      text: {
        fontSize: Typography.sizes.md,
        lineHeight: Typography.lineHeights.md,
      },
      iconGap: 10,
    },
  };

  // Theme-aware variant styling
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle; spinnerColor: string } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: themeColors.primary,
            borderWidth: 0,
            ...Shadows.sm,
          },
          text: {
            color: '#FFFFFF',
            fontWeight: Typography.weights.semiBold,
          },
          spinnerColor: '#FFFFFF',
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: colorScheme === 'dark' ? themeColors.surfaceElevated : themeColors.primaryLight,
            borderWidth: 1,
            borderColor: colorScheme === 'dark' ? themeColors.border : '#DBEAFE',
          },
          text: {
            color: themeColors.primary,
            fontWeight: Typography.weights.semiBold,
          },
          spinnerColor: themeColors.primary,
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: themeColors.borderStrong,
          },
          text: {
            color: themeColors.textPrimary,
            fontWeight: Typography.weights.medium,
          },
          spinnerColor: themeColors.textPrimary,
        };
      case 'danger':
        return {
          container: {
            backgroundColor: themeColors.dangerBg,
            borderWidth: 1,
            borderColor: themeColors.dangerBorder,
          },
          text: {
            color: themeColors.danger,
            fontWeight: Typography.weights.semiBold,
          },
          spinnerColor: themeColors.danger,
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 0,
          },
          text: {
            color: themeColors.primary,
            fontWeight: Typography.weights.medium,
          },
          spinnerColor: themeColors.primary,
        };
      case 'glass':
        return {
          container: {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.35)',
          },
          text: {
            color: '#FFFFFF',
            fontWeight: Typography.weights.semiBold,
          },
          spinnerColor: '#FFFFFF',
        };
    }
  };

  const currentVariant = getVariantStyles();
  const currentSize = sizeStyles[size];

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        currentSize.container,
        currentVariant.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={currentVariant.spinnerColor} />
      ) : (
        <View style={[styles.contentRow, { gap: currentSize.iconGap }]}>
          {icon && iconPosition === 'left' && icon}
          {title ? (
            <Text style={[styles.baseText, currentSize.text, currentVariant.text, textStyle]}>
              {title}
            </Text>
          ) : (
            children
          )}
          {icon && iconPosition === 'right' && icon}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.45,
  },
});
