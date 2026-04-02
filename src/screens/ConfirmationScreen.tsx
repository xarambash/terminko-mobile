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
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{t('confirmation.title')}</Text>

      {confirmation && (
        <View style={[styles.card, { backgroundColor: theme.colors.surfaceMuted }]}>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.colors.textSecondary }]}>
              {t('confirmation.provider')}
            </Text>
            <Text style={[styles.rowValue, { color: theme.colors.textPrimary }]}>
              {confirmation.resourceName}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.colors.textSecondary }]}>
              {t('confirmation.service')}
            </Text>
            <Text style={[styles.rowValue, { color: theme.colors.textPrimary }]}>
              {confirmation.serviceName}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.colors.textSecondary }]}>
              {t('confirmation.dateTime')}
            </Text>
            <Text style={[styles.rowValue, { color: theme.colors.textPrimary }]}>
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
  card: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  rowLabel: { fontSize: 14, flex: 1 },
  rowValue: { fontSize: 14, fontWeight: '600', flex: 2, textAlign: 'right' },
  divider: { height: 1 },
});
