import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../navigation/types';
import {
  FONT_FAMILY_DISPLAY,
  FONT_FAMILY_UI,
  FONT_FAMILY_UI_BOLD,
  landingBrand,
} from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

function LandingOrnament() {
  const c = landingBrand.ornament;
  return (
    <View style={ornamentStyles.wrap} accessible={false} importantForAccessibility="no-hide-descendants">
      <View style={[ornamentStyles.ring, { width: 220, height: 220, borderColor: c }]} />
      <View style={[ornamentStyles.ring, { width: 168, height: 168, borderColor: c }]} />
      <View style={[ornamentStyles.ring, { width: 116, height: 116, borderColor: c }]} />
      <View style={[ornamentStyles.crossV, { backgroundColor: c }]} />
      <View style={[ornamentStyles.crossH, { backgroundColor: c }]} />
    </View>
  );
}

const ornamentStyles = StyleSheet.create({
  wrap: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
  },
  crossV: {
    position: 'absolute',
    left: 109.5,
    top: 74,
    width: 1,
    height: 72,
    opacity: 0.85,
  },
  crossH: {
    position: 'absolute',
    left: 74,
    top: 109.5,
    width: 72,
    height: 1,
    opacity: 0.85,
  },
});

export function LandingScreen({ navigation }: Props) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="light" />
      <View style={styles.root}>
        <View style={styles.top}>
          <LandingOrnament />
        </View>

        <View style={styles.bottom}>
          <Text style={styles.salonTitle}>{t('landing.salonName')}</Text>
          <View style={styles.divider} />
          <Text style={styles.tagline}>{t('landing.tagline')}</Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('ResourceSelect')}
            style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
          >
            <Text style={styles.btnPrimaryEmoji}>📅</Text>
            <Text style={styles.btnPrimaryLabel}>{t('landing.book')}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('CancelAppointment')}
            style={({ pressed }) => [styles.btnOutline, pressed && styles.pressed]}
          >
            <Text style={styles.btnOutlineLabel}>{t('landing.cancel')}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: landingBrand.background,
  },
  root: {
    flex: 1,
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  top: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 120,
  },
  bottom: {
    width: '100%',
    paddingBottom: 12,
  },
  salonTitle: {
    fontFamily: FONT_FAMILY_DISPLAY,
    fontSize: 52,
    color: landingBrand.title,
    textAlign: 'center',
    marginBottom: 10,
  },
  divider: {
    alignSelf: 'center',
    width: '36%',
    maxWidth: 160,
    height: 1,
    backgroundColor: landingBrand.accentLine,
    marginBottom: 12,
  },
  tagline: {
    fontFamily: FONT_FAMILY_UI,
    fontSize: 18,
    lineHeight: 22,
    color: landingBrand.subtitle,
    textAlign: 'center',
    marginBottom: 22,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: landingBrand.primaryFill,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  btnPrimaryEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  btnPrimaryLabel: {
    fontFamily: FONT_FAMILY_UI_BOLD,
    fontSize: 22,
    color: landingBrand.primaryLabel,
  },
  btnOutline: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: landingBrand.outlineBorder,
    backgroundColor: 'transparent',
  },
  btnOutlineLabel: {
    fontFamily: FONT_FAMILY_UI_BOLD,
    fontSize: 22,
    color: landingBrand.outlineLabel,
  },
  pressed: {
    opacity: 0.88,
  },
});
