import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { addDays, format, parseISO } from 'date-fns';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenScroll } from '../components/ScreenScroll';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SlotSelect'>;

/** Placeholder date picker — wire `react-native-calendars` or API-driven slots when integrating. */
export function SlotSelectScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [day, setDay] = useState(format(new Date(), 'yyyy-MM-dd'));

  return (
    <ScreenScroll>
      <Text style={styles.title}>{t('screens.slotSelect')}</Text>
      <Text style={styles.dayLabel}>{day}</Text>
      <Pressable
        onPress={() => setDay(format(addDays(parseISO(day), 1), 'yyyy-MM-dd'))}
      >
        <Text style={styles.link}>{t('screens.next')} (+1 day demo)</Text>
      </Pressable>
      <Text style={styles.hint}>{t('placeholder.api')}</Text>
      <PrimaryButton onPress={() => navigation.navigate('BookingForm')}>
        {t('screens.next')}
      </PrimaryButton>
      <PrimaryButton onPress={() => navigation.goBack()}>{t('screens.back')}</PrimaryButton>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '600', marginBottom: 12 },
  dayLabel: { fontSize: 18, marginBottom: 8 },
  link: { color: '#2563eb', marginBottom: 8 },
  hint: { color: '#666', marginVertical: 16 },
});
