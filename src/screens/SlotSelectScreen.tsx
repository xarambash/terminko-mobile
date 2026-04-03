import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { Calendar } from 'react-native-calendars';

import type { RootStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenScroll } from '../components/ScreenScroll';
import { fetchSlots } from '../store/bookingThunks';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSelectedDate, setSelectedSlot } from '../store/slices/bookingSlice';
import { bookingSummaryStyles } from '../styles/bookingSummaryStyles';
import { useAppTheme } from '../theme/ThemeProvider';
import { formatResourceName } from '../utils/formatResourceName';

type Props = NativeStackScreenProps<RootStackParamList, 'SlotSelect'>;

function formatSlotTime(iso: string): string {
  return format(parseISO(iso), 'HH:mm');
}

export function SlotSelectScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const dispatch = useAppDispatch();
  const { tenantId, resourceId, serviceId, resources, services, selectedDate, slots, slotsStatus, slotsError } =
    useAppSelector((s) => s.booking);

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
      dispatch(setSelectedDate(day.dateString));
    },
    [dispatch],
  );

  const onRetry = useCallback(() => {
    if (!tenantId || !resourceId || !serviceId || !selectedDate) return;
    dispatch(setSelectedDate(selectedDate));
  }, [dispatch, tenantId, resourceId, serviceId, selectedDate]);

  const onPickSlot = useCallback(
    (startAt: string, endAt: string) => {
      dispatch(setSelectedSlot({ startAt, endAt }));
      navigation.navigate('BookingForm');
    },
    [dispatch, navigation],
  );

  const today = format(new Date(), 'yyyy-MM-dd');
  const markedDates = selectedDate
    ? { [selectedDate]: { selected: true, selectedColor: theme.colors.background } }
    : {};

  const calendarTheme = useMemo(
    () => ({
      backgroundColor: theme.colors.contrast,
      calendarBackground: theme.colors.contrast,
      selectedDayBackgroundColor: theme.colors.background,
      selectedDayTextColor: theme.colors.text,
      dayTextColor: theme.colors.text,
      monthTextColor: theme.colors.text,
      todayTextColor: theme.colors.text,
      arrowColor: theme.colors.text,
      textDisabledColor: theme.colors.text,
      textInactiveColor: theme.colors.text,
      textSectionTitleColor: theme.colors.background,
      textSectionTitleDisabledColor: theme.colors.background,
      textMonthFontSize: 18,
      textMonthFontWeight: '600' as const,
      textDayHeaderFontSize: 12,
      textDayHeaderFontWeight: '500' as const,
      textDayFontSize: 15,
      weekVerticalMargin: 10,
    }),
    [theme],
  );

  const slotsLoading = slotsStatus === 'loading';
  const slotsFailed = slotsStatus === 'failed' && slotsError;
  const showSlots = slotsStatus === 'succeeded' && !slotsFailed;

  return (
    <ScreenScroll>
      {(resourceSummaryName || serviceSummaryName) && (
        <View
          style={[
            bookingSummaryStyles.card,
            {
              backgroundColor: theme.colors.background,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.contrast,
            },
          ]}
        >
          {resourceSummaryName ? (
            <View style={bookingSummaryStyles.block}>
              <Text style={[bookingSummaryStyles.label, { color: theme.colors.contrast }]}>{t('confirmation.provider')}:</Text>
              <Text style={[bookingSummaryStyles.value, { color: theme.colors.contrast }]}>{resourceSummaryName}</Text>
            </View>
          ) : null}
          {serviceSummaryName ? (
            <View style={bookingSummaryStyles.block}>
              <Text style={[bookingSummaryStyles.label, { color: theme.colors.contrast }]}>{t('confirmation.service')}:</Text>
              <Text style={[bookingSummaryStyles.value, { color: theme.colors.contrast }]}>{serviceSummaryName}</Text>
            </View>
          ) : null}
        </View>
      )}

      <View
        style={[
          styles.calendarShell,
          {
            backgroundColor: theme.colors.contrast,
            borderColor: theme.colors.background,
          },
          Platform.OS === 'ios'
            ? {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 12,
              }
            : { elevation: 6 },
        ]}
      >
        <Calendar
          onDayPress={onDayPress}
          markedDates={markedDates}
          minDate={today}
          theme={calendarTheme}
          hideExtraDays
        />
      </View>

      {!selectedDate && (
        <Text style={[styles.hint, { color: theme.colors.text }, styles.pickHint]}>
          {t('slotSelect.pickDate')}
        </Text>
      )}

      {selectedDate && slotsLoading && (
        <View style={styles.centered}>
          <ActivityIndicator size="small" />
          <Text style={[styles.hint, { color: theme.colors.text }]}>
            {t('slotSelect.loadingSlots')}
          </Text>
        </View>
      )}

      {selectedDate && slotsFailed && (
        <View style={styles.block}>
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            {t('slotSelect.slotsError')}
          </Text>
          <PrimaryButton onPress={onRetry}>{t('slotSelect.retry')}</PrimaryButton>
        </View>
      )}

      {selectedDate && showSlots && slots.length === 0 && (
        <Text style={[styles.hint, { color: theme.colors.text }]}>{t('slotSelect.noSlots')}</Text>
      )}

      {selectedDate && showSlots && slots.length > 0 && (
        <View style={styles.slotsGrid}>
          {slots.map((slot, index) => {
            const label = `${formatSlotTime(slot.startAt)} – ${formatSlotTime(slot.endAt)}`;
            return (
              <Pressable
                key={`${slot.startAt}-${slot.endAt}-${index}`}
                accessibilityRole="button"
                accessibilityLabel={t('slotSelect.chooseSlotA11y', { time: label })}
                onPress={() => onPickSlot(slot.startAt, slot.endAt)}
                style={({ pressed }) => [
                  styles.slotChip,
                  {
                    backgroundColor: theme.colors.contrast,
                    borderColor: theme.colors.background,
                  },
                  pressed && styles.slotChipPressed,
                ]}
              >
                <Text style={[styles.slotText, { color: theme.colors.text }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  calendarShell: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 4,
  },
  hint: { marginTop: 12, fontSize: 15 },
  pickHint: { textAlign: 'center', marginVertical: 16 },
  errorText: { marginBottom: 12, fontSize: 15 },
  centered: { alignItems: 'center', paddingVertical: 16 },
  block: { marginTop: 12, marginBottom: 8 },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  slotChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  slotChipPressed: { opacity: 0.75 },
  slotText: { fontSize: 14, fontWeight: '500' },
});
