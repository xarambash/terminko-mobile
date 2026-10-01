import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Button, Surface, Text, useTheme } from 'react-native-paper';
import { format, parseISO } from 'date-fns';
import { Calendar } from 'react-native-calendars';

import { BookingStepLayout } from '../components/booking-step-layout';
import { TimeSlotGrid, type TimeSlotItem } from '../components/TimeSlotGrid';
import { bookingStepIndex } from '../constants/bookingFlow';
import type { RootStackParamList } from '../navigation/types';
import { fetchSlots } from '../store/bookingThunks';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSelectedDate, setSelectedSlot } from '../store/slices/bookingSlice';
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
  const theme = useTheme();
  return (
    <Surface style={styles.summaryCard} elevation={1}>
      <View style={styles.summaryCol}>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {providerLabel}
        </Text>
        <Text variant="titleSmall" numberOfLines={2}>{providerName}</Text>
      </View>
      <View style={[styles.summaryDivider, { backgroundColor: theme.colors.outline }]} />
      <View style={styles.summaryCol}>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {serviceLabel}
        </Text>
        <Text variant="titleSmall" numberOfLines={2}>{serviceName}</Text>
      </View>
    </Surface>
  );
}

export function SlotSelectScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
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
    if (!tenantId || !resourceId || !serviceId || !selectedDate || slotsStatus !== 'idle') return;
    void dispatch(fetchSlots({ tenantId, resourceId, serviceId, date: selectedDate }));
  }, [dispatch, tenantId, resourceId, serviceId, selectedDate, slotsStatus]);

  const onDayPress = useCallback(
    (day: { dateString: string }) => {
      setPendingSlot(null);
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
    if (today !== selectedDate) {
      m[today] = {
        customStyles: {
          container: {
            borderWidth: 1.5,
            borderColor: theme.colors.primary,
            borderRadius: 18,
          },
          text: {
            color: theme.colors.primary,
            fontWeight: '600',
          },
        },
      };
    }
    if (selectedDate) {
      m[selectedDate] = {
        customStyles: {
          container: {
            backgroundColor: theme.colors.primary,
            borderRadius: 18,
          },
          text: {
            color: theme.colors.onPrimary,
            fontWeight: '600',
          },
        },
      };
    }
    return m;
  }, [selectedDate, today, theme]);

  const calendarTheme = useMemo(() => ({
    backgroundColor: 'transparent',
    calendarBackground: 'transparent',
    dayTextColor: theme.colors.onBackground,
    textDisabledColor: theme.colors.onSurfaceVariant,
    textSectionTitleColor: theme.colors.onSurfaceVariant,
    monthTextColor: theme.colors.onBackground,
    arrowColor: theme.colors.primary,
    selectedDayTextColor: theme.colors.onPrimary,
    selectedDayBackgroundColor: theme.colors.primary,
    todayTextColor: theme.colors.primary,
    textDayFontSize: 14,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 12,
  }), [theme]);

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
        providerLabel={t('serviceSelect.providerLabel').toUpperCase()}
        serviceLabel={t('slotSelect.serviceLabel').toUpperCase()}
      />
    ) : null;

  return (
    <BookingStepLayout
      activeStep={bookingStepIndex.slot}
      onBack={() => navigation.goBack()}
      backAccessibilityLabel={t('screens.back')}
      pageTitle={t('screens.slotSelect')}
      summary={summary}
    >
      <Calendar
        onDayPress={onDayPress}
        markedDates={calendarMarked}
        markingType="custom"
        minDate={today}
        firstDay={0}
        theme={calendarTheme}
        hideExtraDays
      />

      {!selectedDate && (
        <Text
          variant="bodyMedium"
          style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}
        >
          {t('slotSelect.pickDate')}
        </Text>
      )}

      {selectedDate && (
        <View style={styles.slotsPanel}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
            {t('slotSelect.availableTimesLabel').toUpperCase()}
          </Text>

          {slotsBusy ? (
            <View style={styles.slotsPanelCenter}>
              <ActivityIndicator size="small" />
            </View>
          ) : slotsFailed ? (
            <View style={styles.slotsPanelCenter}>
              <Text variant="bodySmall" style={{ color: theme.colors.error, marginBottom: 8 }}>
                {t('slotSelect.slotsError')}
              </Text>
              <Button mode="contained" onPress={onRetry} compact>
                {t('slotSelect.retry')}
              </Button>
            </View>
          ) : showSlots && slots.length === 0 ? (
            <View style={styles.slotsPanelCenter}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {t('slotSelect.noSlots')}
              </Text>
            </View>
          ) : showSlots && slots.length > 0 ? (
            <TimeSlotGrid
              slots={slots.map<TimeSlotItem>((slot) => ({
                startAt: slot.startAt,
                endAt: slot.endAt,
                label: `${formatSlotTime(slot.startAt)} – ${formatSlotTime(slot.endAt)}`,
              }))}
              selectedStartAt={pendingSlot?.startAt ?? null}
              selectedEndAt={pendingSlot?.endAt ?? null}
              onSelect={onSelectSlot}
              getAccessibilityLabel={(time) => t('slotSelect.chooseSlotA11y', { time })}
            />
          ) : null}
        </View>
      )}

      {selectedDate && showSlots && slots.length > 0 && (
        <Button
          mode="contained"
          onPress={onContinue}
          disabled={!pendingSlot}
          style={styles.continueBtn}
          contentStyle={styles.continueBtnContent}
        >
          {t('slotSelect.continue')}
        </Button>
      )}
    </BookingStepLayout>
  );
}

const styles = StyleSheet.create({
  hint: {
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  slotsPanel: {
    marginTop: 6,
    marginBottom: 4,
    minHeight: 80,
  },
  slotsPanelCenter: {
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueBtn: {
    marginTop: 8,
    borderRadius: 32,
  },
  continueBtnContent: {
    paddingVertical: 2,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 8,
  },
  summaryCol: {
    flex: 1,
    gap: 2,
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    marginHorizontal: 4,
  },
});
