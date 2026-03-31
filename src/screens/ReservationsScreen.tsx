import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenScroll } from '../components/ScreenScroll';
import { getGuestId } from '../lib/guestStorage';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Reservations'>;

export function ReservationsScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [guestId, setGuestIdState] = useState<string | null>(null);

  useEffect(() => {
    void getGuestId().then(setGuestIdState);
  }, []);

  return (
    <ScreenScroll>
      <Text style={styles.title}>{t('screens.reservations')}</Text>
      <Text style={styles.hint}>
        guestId: {guestId ?? '—'}
        {'\n'}
        {t('placeholder.api')}
      </Text>
      <PrimaryButton onPress={() => navigation.goBack()}>{t('screens.back')}</PrimaryButton>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '600', marginBottom: 12 },
  hint: { color: '#666', marginBottom: 20 },
});
