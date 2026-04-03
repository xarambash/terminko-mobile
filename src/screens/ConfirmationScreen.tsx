import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';

import type { RootStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenScroll } from '../components/ScreenScroll';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { resetBookingDraft } from '../store/slices/bookingSlice';
import { bookingSummaryStyles } from '../styles/bookingSummaryStyles';
import { useAppTheme } from '../theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Confirmation'>;

function formatDateTime(iso: string): string {
  return format(parseISO(iso), 'PPP p');
}

export function ConfirmationScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const dispatch = useAppDispatch();
  const confirmation = useAppSelector((s) => s.booking.confirmation);

  const onBackHome = useCallback(() => {
    dispatch(resetBookingDraft());
    navigation.popToTop();
  }, [dispatch, navigation]);

  return (
    <ScreenScroll>
      <Text style={styles.emoji}>✓</Text>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('confirmation.title')}</Text>

      {confirmation && (
        <View
          style={[
            bookingSummaryStyles.card,
            {
              backgroundColor: theme.colors.background,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.contrast,
              marginBottom: 24,
            },
          ]}
        >
          <View style={bookingSummaryStyles.block}>
            <Text style={[bookingSummaryStyles.label, { color: theme.colors.contrast }]}>{t('confirmation.provider')}:</Text>
            <Text style={[bookingSummaryStyles.value, { color: theme.colors.contrast }]}>{confirmation.resourceName}</Text>
          </View>
          <View style={bookingSummaryStyles.block}>
            <Text style={[bookingSummaryStyles.label, { color: theme.colors.contrast }]}>{t('confirmation.service')}:</Text>
            <Text style={[bookingSummaryStyles.value, { color: theme.colors.contrast }]}>{confirmation.serviceName}</Text>
          </View>
          <View style={bookingSummaryStyles.block}>
            <Text style={[bookingSummaryStyles.label, { color: theme.colors.contrast }]}>{t('confirmation.dateTime')}:</Text>
            <Text style={[bookingSummaryStyles.value, { color: theme.colors.contrast }]}>
              {formatDateTime(confirmation.startAt)}
            </Text>
          </View>
        </View>
      )}

      <PrimaryButton onPress={onBackHome}>{t('confirmation.backHome')}</PrimaryButton>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
});
