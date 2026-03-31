import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenScroll } from '../components/ScreenScroll';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export function LandingScreen({ navigation }: Props) {
  const { t } = useTranslation();

  return (
    <ScreenScroll>
      <View style={styles.header}>
        <Text style={styles.brand}>{t('appName')}</Text>
        <Text style={styles.title}>{t('landing.title')}</Text>
        <Text style={styles.subtitle}>{t('landing.subtitle')}</Text>
      </View>
      <PrimaryButton onPress={() => navigation.navigate('ResourceSelect')}>
        {t('landing.book')}
      </PrimaryButton>
      <PrimaryButton onPress={() => navigation.navigate('Reservations')}>
        {t('landing.reservations')}
      </PrimaryButton>
      <PrimaryButton onPress={() => navigation.navigate('CancelAppointment')}>
        {t('landing.cancel')}
      </PrimaryButton>
      <PrimaryButton onPress={() => navigation.navigate('AboutUs')}>
        {t('landing.about')}
      </PrimaryButton>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 24 },
  brand: { fontSize: 14, fontWeight: '600', color: '#888', marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#555' },
});
