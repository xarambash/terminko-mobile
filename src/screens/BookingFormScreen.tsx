import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenScroll } from '../components/ScreenScroll';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingForm'>;

export function BookingFormScreen({ navigation }: Props) {
  const { t } = useTranslation();

  return (
    <ScreenScroll>
      <Text style={styles.title}>{t('screens.bookingForm')}</Text>
      <Text style={styles.hint}>{t('placeholder.api')}</Text>
      <PrimaryButton onPress={() => navigation.navigate('Confirmation')}>
        {t('screens.next')}
      </PrimaryButton>
      <PrimaryButton onPress={() => navigation.goBack()}>{t('screens.back')}</PrimaryButton>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '600', marginBottom: 12 },
  hint: { color: '#666', marginBottom: 20 },
});
