import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme } from 'react-native-paper';

import type { RootStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { TENANT_SLUG } from '../constants/env';
import { fetchTenantBySlug } from '../store/bookingThunks';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { FONT_FAMILY_DISPLAY } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export function LandingScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const tenantName = useAppSelector((s) => s.booking.tenantName);

  useEffect(() => {
    if (!TENANT_SLUG) return;
    void dispatch(fetchTenantBySlug(TENANT_SLUG));
  }, [dispatch]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <View style={styles.root}>
        <View style={styles.top} />

        <View style={styles.bottom}>
          <Text style={[styles.salonTitle, { color: theme.colors.onBackground }]}>
            {tenantName ?? t('landing.salonName')}
          </Text>
          <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
          <Text variant="bodyMedium" style={[styles.tagline, { color: theme.colors.onSurfaceVariant }]}>
            {t('landing.tagline')}
          </Text>

          <PrimaryButton
            onPress={() => navigation.navigate('ResourceSelect')}
            style={styles.btn}
          >
            {t('landing.book')}
          </PrimaryButton>

          <PrimaryButton
            mode="outlined"
            onPress={() => navigation.navigate('CancelAppointment')}
            style={styles.btn}
          >
            {t('landing.cancel')}
          </PrimaryButton>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  root: {
    flex: 1,
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  top: {
    flex: 1,
  },
  bottom: {
    width: '100%',
    paddingBottom: 12,
  },
  salonTitle: {
    fontFamily: FONT_FAMILY_DISPLAY,
    fontSize: 52,
    textAlign: 'center',
    marginBottom: 0,
  },
  divider: {
    alignSelf: 'center',
    width: '36%',
    maxWidth: 160,
    height: 1,
    marginBottom: 20,
  },
  tagline: {
    textAlign: 'center',
    marginBottom: 22,
  },
  btn: {
    marginBottom: 12,
  },
});
