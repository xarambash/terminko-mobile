import { Pressable, StyleSheet, Text } from 'react-native';

import { FONT_FAMILY_UI, landingBrand, type AppTheme } from '../../theme/theme';
import type { BookingLayoutVariant } from './types';

type Props = {
  onPress: () => void;
  label: string;
  variant: BookingLayoutVariant;
  appTheme: AppTheme;
};

export function BackButton({ onPress, label, variant, appTheme }: Props) {
  if (variant === 'landing') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={({ pressed }) => [styles.backBtnLanding, pressed && styles.pressed]}
      >
        <Text style={styles.backIconLanding}>‹</Text>
      </Pressable>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.backBtnApp,
        {
          backgroundColor: appTheme.colors.contrast,
          borderColor: appTheme.colors.text,
        },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.backIconApp, { color: appTheme.colors.text }]}>‹</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backBtnLanding: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: landingBrand.backButtonBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: landingBrand.cardBorder,
  },
  backBtnApp: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  backIconLanding: {
    fontSize: 28,
    color: landingBrand.title,
    marginTop: -2,
    fontFamily: FONT_FAMILY_UI,
  },
  backIconApp: {
    fontSize: 28,
    marginTop: -2,
    fontFamily: FONT_FAMILY_UI,
  },
  pressed: { opacity: 0.88 },
});
