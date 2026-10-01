import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Divider, Surface, Text, useTheme } from 'react-native-paper';
import { format, parseISO } from 'date-fns';

import { BookingStepLayout } from '../components/booking-step-layout';
import { PrimaryButton } from '../components/PrimaryButton';
import { bookingStepIndex } from '../constants/bookingFlow';
import type { RootStackParamList } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { resetBookingDraft } from '../store/slices/bookingSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'Confirmation'>;

export function ConfirmationScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const confirmation = useAppSelector((s) => s.booking.confirmation);

  const onBackHome = useCallback(() => {
    dispatch(resetBookingDraft());
    navigation.popToTop();
  }, [dispatch, navigation]);

  const rows = useMemo(
    () =>
      confirmation
        ? [
            { label: t('confirmation.provider'), value: confirmation.resourceName },
            { label: t('confirmation.service'), value: confirmation.serviceName },
            {
              label: t('confirmation.dateTime'),
              value: format(parseISO(confirmation.startAt), 'PPP p'),
            },
          ]
        : [],
    [t, confirmation],
  );

  return (
    <BookingStepLayout
      activeStep={bookingStepIndex.confirmation}
      onBack={onBackHome}
      backAccessibilityLabel={t('confirmation.backHome')}
      safeAreaEdges={['top', 'left', 'right', 'bottom']}
      contentContainerStyle={styles.content}
    >
      <View style={styles.hero}>
        <View style={[styles.checkBadge, { backgroundColor: theme.colors.primaryContainer }]}>
          <Text style={[styles.checkMark, { color: theme.colors.onPrimaryContainer }]}>✓</Text>
        </View>
        <Text variant="headlineMedium" style={{ color: theme.colors.onBackground }}>
          {t('confirmation.title')}
        </Text>
      </View>

      {rows.length > 0 && (
        <Surface style={styles.summaryCard} elevation={1}>
          {rows.map((row, index) => (
            <View key={row.label}>
              {index > 0 && <Divider />}
              <View style={styles.summaryRow}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {row.label}
                </Text>
                <Text variant="bodyMedium" style={styles.summaryValue}>
                  {row.value}
                </Text>
              </View>
            </View>
          ))}
        </Surface>
      )}

      <PrimaryButton
        onPress={onBackHome}
        style={styles.homeBtn}
      >
        {t('confirmation.backHome')}
      </PrimaryButton>
    </BookingStepLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  checkBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '700',
  },
  summaryCard: {
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  summaryValue: {
    textAlign: 'right',
    flex: 1,
  },
  homeBtn: {
    marginTop: 'auto',
  },
});
