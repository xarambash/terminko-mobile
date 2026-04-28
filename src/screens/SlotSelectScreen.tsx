import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { Calendar } from 'react-native-calendars';

import { BookingStepLayout } from '../components/booking-step-layout';
import { bookingStepIndex } from '../constants/bookingFlow';
import type { RootStackParamList } from '../navigation/types';
import { fetchSlots } from '../store/bookingThunks';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSelectedDate, setSelectedSlot } from '../store/slices/bookingSlice';
import {
  FONT_FAMILY_UI,
  FONT_FAMILY_UI_BOLD,
  landingBrand,
} from '../theme/theme';
import { formatResourceName } from '../utils/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'SlotSelect'>;

function formatSlotTime(iso: string): string {
  return format(parseISO(iso), 'HH:mm');
}

function ProviderServiceCard({
  providerName,
  serviceName,
  providerLabel,
  serviceLabel,
}: {
  providerName: string;
  serviceName: string;
  providerLabel: string;
  serviceLabel: string;
}) {
  return (
    <View style={summaryStyles.card}>
      <View style={summaryStyles.col}>
        <Text style={summaryStyles.label} numberOfLines={1}>
          {providerLabel}
        </Text>
        <Text style={summaryStyles.value} numberOfLines={2}>
          {providerName}
        </Text>
      </View>
      <View style={summaryStyles.divider} />
      <View style={summaryStyles.col}>
        <Text style={summaryStyles.label} numberOfLines={1}>
          {serviceLabel}
        </Text>
        <Text style={summaryStyles.value} numberOfLines={2}>
          {serviceName}
        </Text>
      </View>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: landingBrand.cardSurface,
    borderWidth: 1,
    borderColor: landingBrand.cardBorder,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 16,
    minHeight: 86,
  },
  col: { flex: 1, paddingHorizontal: 4 },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: landingBrand.cardBorder,
    marginHorizontal: 4,
  },
  label: {
    fontFamily: FONT_FAMILY_UI_BOLD,
    fontSize: 17,
    lineHeight: 20,
    color: landingBrand.metaLabel,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontFamily: FONT_FAMILY_UI,
    fontSize: 20,
    lineHeight: 24,
    color: landingBrand.title,
  },
});

function GoldRetryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [retryStyles.btn, pressed && { opacity: 0.9 }]}
    >
      <Text style={retryStyles.text}>{label}</Text>
    </Pressable>
  );
}

const retryStyles = StyleSheet.create({
  btn: {
    alignSelf: 'center',
    backgroundColor: landingBrand.primaryFill,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  text: { fontFamily: FONT_FAMILY_UI, fontSize: 20, color: landingBrand.primaryLabel },
});

export function SlotSelectScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { tenantId, resourceId, serviceId, resources, services, selectedDate, slots, slotsStatus, slotsError } =
    useAppSelector((s) => s.booking);

  const [pendingSlot, setPendingSlot] = useState<{ startAt: string; endAt: string } | null>(null);

  const { resourceSummaryName, serviceSummaryName } = useMemo(() => {
    const r = resourceId ? resources.find((x) => x.id === resourceId) : undefined;
    const svc = serviceId ? services.find((x) => x.serviceId === serviceId) : undefined;
    return {
      resourceSummaryName: r ? formatResourceName(r) : null,
      serviceSummaryName: svc?.service.name ?? null,
    };
  }, [resourceId, serviceId, resources, services]);

  useEffect(() => {
    setPendingSlot(null);
  }, [selectedDate]);

  useEffect(() => {
    if (!tenantId || !resourceId || !serviceId || !selectedDate || slotsStatus !== 'idle') return;
    void dispatch(fetchSlots({ tenantId, resourceId, serviceId, date: selectedDate }));
  }, [dispatch, tenantId, resourceId, serviceId, selectedDate, slotsStatus]);

  const onDayPress = useCallback(
    (day: { dateString: string }) => {
      dispatch(setSelectedDate(day.dateString));
    },
    [dispatch],
  );

  const onRetry = useCallback(() => {
    if (!tenantId || !resourceId || !serviceId || !selectedDate) return;
    dispatch(setSelectedDate(selectedDate));
  }, [dispatch, tenantId, resourceId, serviceId, selectedDate]);

  const onSelectSlot = useCallback((startAt: string, endAt: string) => {
    setPendingSlot({ startAt, endAt });
  }, []);

  const onContinue = useCallback(() => {
    if (!pendingSlot) return;
    dispatch(setSelectedSlot(pendingSlot));
    navigation.navigate('BookingForm');
  }, [pendingSlot, dispatch, navigation]);

  const today = format(new Date(), 'yyyy-MM-dd');

  const calendarMarked = useMemo(() => {
    const m: Record<string, object> = {};
    if (selectedDate) {
      m[selectedDate] = {
        selected: true,
        selectedColor: landingBrand.progressActive,
        selectedTextColor: landingBrand.background,
      };
    }
    if (selectedDate && selectedDate !== today) {
      m[today] = { marked: true, dotColor: landingBrand.progressActive };
    }
    if (!selectedDate) {
      m[today] = { marked: true, dotColor: landingBrand.progressActive };
    }
    return m;
  }, [selectedDate, today]);

  const calendarTheme = useMemo(
    () => ({
      backgroundColor: landingBrand.cardSurface,
      calendarBackground: landingBrand.cardSurface,
      dayTextColor: landingBrand.metaLabel,
      textDisabledColor: '#4a4038',
      textSectionTitleColor: landingBrand.metaLabel,
      textSectionTitleDisabledColor: '#3a3330',
      textMonthFontFamily: FONT_FAMILY_UI,
      textDayFontFamily: FONT_FAMILY_UI,
      textDayHeaderFontFamily: FONT_FAMILY_UI_BOLD,
      textMonthFontSize: 25,
      textMonthFontWeight: '400' as const,
      monthTextColor: landingBrand.title,
      arrowColor: landingBrand.title,
      selectedDayTextColor: landingBrand.background,
      selectedDayBackgroundColor: landingBrand.progressActive,
      todayTextColor: landingBrand.title,
      todayButtonTextColor: landingBrand.title,
      textDayHeaderFontSize: 14,
      textDayHeaderFontWeight: '700' as const,
      textDayFontSize: 18,
    }),
    [],
  );

  const slotsFailed = slotsStatus === 'failed' && slotsError;
  const showSlots = slotsStatus === 'succeeded' && !slotsFailed;
  const canFetchSlots = Boolean(tenantId && resourceId && serviceId && selectedDate);
  const slotsBusy =
    Boolean(selectedDate) && canFetchSlots && (slotsStatus === 'loading' || slotsStatus === 'idle');

  const summary =
    resourceSummaryName && serviceSummaryName ? (
      <ProviderServiceCard
        providerName={resourceSummaryName}
        serviceName={serviceSummaryName}
        providerLabel={t('serviceSelect.providerLabel').toLocaleUpperCase()}
        serviceLabel={t('slotSelect.serviceLabel').toLocaleUpperCase()}
      />
    ) : null;

  return (
    <BookingStepLayout
      variant="landing"
      activeStep={bookingStepIndex.slot}
      onBack={() => navigation.goBack()}
      backAccessibilityLabel={t('screens.back')}
      pageTitle={t('screens.slotSelect')}
      summary={summary}
    >
      <View
        style={[
          styles.calendarShell,
          Platform.OS === 'ios'
            ? { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10 }
            : { elevation: 4 },
        ]}
      >
        <Calendar
          onDayPress={onDayPress}
          markedDates={calendarMarked}
          minDate={today}
          firstDay={0}
          theme={calendarTheme}
          hideExtraDays
        />
      </View>

      {!selectedDate && (
        <Text style={styles.hint} maxFontSizeMultiplier={1.3}>
          {t('slotSelect.pickDate')}
        </Text>
      )}

      {selectedDate && (
        <View style={styles.slotsPanel}>
          <Text style={styles.availableLabel} maxFontSizeMultiplier={1.2}>
            {t('slotSelect.availableTimesLabel').toLocaleUpperCase()}
          </Text>

          {slotsBusy ? (
            <View style={styles.slotsPanelCenter}>
              <ActivityIndicator size="large" color={landingBrand.progressActive} />
            </View>
          ) : slotsFailed ? (
            <View style={styles.slotsPanelMessage}>
              <Text style={styles.errorText} maxFontSizeMultiplier={1.2}>
                {t('slotSelect.slotsError')}
              </Text>
              <GoldRetryButton label={t('slotSelect.retry')} onPress={onRetry} />
            </View>
          ) : showSlots && slots.length === 0 ? (
            <View style={styles.slotsPanelCenter}>
              <Text style={styles.hint} maxFontSizeMultiplier={1.2}>
                {t('slotSelect.noSlots')}
              </Text>
            </View>
          ) : showSlots && slots.length > 0 ? (
            <View style={styles.slotsGrid}>
              {slots.map((slot, index) => {
                const label = `${formatSlotTime(slot.startAt)} – ${formatSlotTime(slot.endAt)}`;
                const isSelected = pendingSlot?.startAt === slot.startAt && pendingSlot?.endAt === slot.endAt;
                return (
                  <Pressable
                    key={`${slot.startAt}-${slot.endAt}-${index}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={t('slotSelect.chooseSlotA11y', { time: label })}
                    onPress={() => onSelectSlot(slot.startAt, slot.endAt)}
                    style={({ pressed }) => [
                      styles.slotChip,
                      isSelected ? styles.slotChipSelected : styles.slotChipIdle,
                      pressed && { opacity: 0.9 },
                    ]}
                  >
                    <Text
                      style={[styles.slotText, isSelected ? styles.slotTextSelected : styles.slotTextIdle]}
                      numberOfLines={1}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
      )}

      {selectedDate && showSlots && slots.length > 0 && (
        <Pressable
          accessibilityRole="button"
          disabled={!pendingSlot}
          onPress={onContinue}
          style={({ pressed }) => [
            styles.continueBtn,
            !pendingSlot && styles.continueDisabled,
            pressed && pendingSlot && { opacity: 0.92 },
          ]}
        >
          <Text style={styles.continueLabel} maxFontSizeMultiplier={1.2}>
            {t('slotSelect.continue')}
          </Text>
        </Pressable>
      )}
    </BookingStepLayout>
  );
}

const styles = StyleSheet.create({
  calendarShell: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: landingBrand.cardBorder,
    backgroundColor: landingBrand.cardSurface,
    marginBottom: 8,
  },
  hint: {
    marginTop: 12,
    fontSize: 18,
    fontFamily: FONT_FAMILY_UI,
    textAlign: 'center',
    marginVertical: 12,
    color: landingBrand.subtitle,
  },
  errorText: {
    marginBottom: 12,
    fontSize: 16,
    fontFamily: FONT_FAMILY_UI,
    textAlign: 'center',
    color: '#e8a598',
  },
  availableLabel: {
    fontFamily: FONT_FAMILY_UI_BOLD,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.8,
    color: landingBrand.metaLabel,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  slotsPanel: { marginTop: 8, marginBottom: 8, minHeight: 120 },
  slotsPanelCenter: { minHeight: 120, justifyContent: 'center', alignItems: 'center' },
  slotsPanelMessage: { minHeight: 120, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotChip: {
    width: '31%',
    minWidth: 100,
    flexGrow: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotChipIdle: {
    backgroundColor: landingBrand.cardSurface,
    borderColor: landingBrand.cardBorder,
  },
  slotChipSelected: {
    backgroundColor: 'transparent',
    borderColor: landingBrand.progressActive,
  },
  slotText: { fontSize: 12, fontFamily: FONT_FAMILY_UI, textAlign: 'center' },
  slotTextIdle: { color: landingBrand.subtitle },
  slotTextSelected: { color: landingBrand.progressActive, fontWeight: '600' },
  continueBtn: {
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 32,
    backgroundColor: landingBrand.primaryFill,
    alignItems: 'center',
  },
  continueDisabled: { opacity: 0.4 },
  continueLabel: { fontFamily: FONT_FAMILY_UI_BOLD, fontSize: 22, color: landingBrand.background },
});
