import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';

import type { RootStackParamList } from '../navigation/types';
import { AppText } from '../components/AppText';
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
      <AppText style={styles.emoji}>✓</AppText>
      <AppText style={[styles.title, { color: theme.colors.text }]}>{t('confirmation.title')}</AppText>

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
            <AppText style={[bookingSummaryStyles.label, { color: theme.colors.contrast }]}>{t('confirmation.provider')}:</AppText>
            <AppText style={[bookingSummaryStyles.value, { color: theme.colors.contrast }]}>{confirmation.resourceName}</AppText>
          </View>
          <View style={bookingSummaryStyles.block}>
            <AppText style={[bookingSummaryStyles.label, { color: theme.colors.contrast }]}>{t('confirmation.service')}:</AppText>
            <AppText style={[bookingSummaryStyles.value, { color: theme.colors.contrast }]}>{confirmation.serviceName}</AppText>
          </View>
          <View style={bookingSummaryStyles.block}>
            <AppText style={[bookingSummaryStyles.label, { color: theme.colors.contrast }]}>{t('confirmation.dateTime')}:</AppText>
            <AppText style={[bookingSummaryStyles.value, { color: theme.colors.contrast }]}>
              {formatDateTime(confirmation.startAt)}
            </AppText>
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
