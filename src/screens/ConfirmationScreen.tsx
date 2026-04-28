import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';

import { BookingStepLayout } from '../components/booking-step-layout';
import { BookingSummaryTable } from '../components/BookingSummaryTable';
import { bookingStepIndex } from '../constants/bookingFlow';
import type { RootStackParamList } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { resetBookingDraft } from '../store/slices/bookingSlice';
import { FONT_FAMILY_UI_BOLD, landingBrand } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Confirmation'>;

function formatDateTime(iso: string): string {
  return format(parseISO(iso), 'PPP p');
}

export function ConfirmationScreen({ navigation }: Props) {
  const { t } = useTranslation();
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
            { label: t('confirmation.dateTime'), value: formatDateTime(confirmation.startAt) },
          ]
        : [],
    [t, confirmation],
  );

  return (
    <BookingStepLayout
      variant="landing"
      activeStep={bookingStepIndex.confirmation}
      onBack={onBackHome}
      backAccessibilityLabel={t('confirmation.backHome')}
      safeAreaEdges={['top', 'left', 'right', 'bottom']}
    >
      <View style={styles.hero}>
        <View style={styles.checkBadge} accessibilityLabel={t('confirmation.title')}>
          <Text style={styles.checkMark} maxFontSizeMultiplier={1.2}>
            ✓
          </Text>
        </View>
        <Text style={styles.title} maxFontSizeMultiplier={1.2}>
          {t('confirmation.title')}
        </Text>
      </View>

      {rows.length > 0 ? <BookingSummaryTable rows={rows} marginBottom={24} /> : null}

      <Pressable
        accessibilityRole="button"
        onPress={onBackHome}
        style={({ pressed }) => [styles.homeBtn, pressed && { opacity: 0.9 }]}
      >
        <Text style={styles.homeLabel} numberOfLines={1} maxFontSizeMultiplier={1.2}>
          {t('confirmation.backHome')}
        </Text>
      </Pressable>
    </BookingStepLayout>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: 8 },
  checkBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: landingBrand.progressActive,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkMark: {
    fontSize: 36,
    lineHeight: 40,
    color: landingBrand.background,
    fontWeight: '700',
  },
  title: {
    fontFamily: FONT_FAMILY_UI_BOLD,
    fontSize: 32,
    lineHeight: 36,
    textAlign: 'center',
    color: landingBrand.title,
    marginBottom: 8,
  },
  homeBtn: {
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 32,
    backgroundColor: landingBrand.primaryFill,
    alignItems: 'center',
  },
  homeLabel: {
    fontFamily: FONT_FAMILY_UI_BOLD,
    fontSize: 22,
    color: landingBrand.background,
  },
});
