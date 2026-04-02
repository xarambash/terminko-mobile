import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { Calendar } from 'react-native-calendars';

import type { RootStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenScroll } from '../components/ScreenScroll';
import { fetchSlots } from '../store/bookingThunks';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSelectedDate, setSelectedSlot } from '../store/slices/bookingSlice';
import { useAppTheme } from '../theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'SlotSelect'>;

function formatSlotTime(iso: string): string {
  return format(parseISO(iso), 'HH:mm');
}

export function SlotSelectScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const dispatch = useAppDispatch();
  const { tenantId, resourceId, serviceId, selectedDate, slots, slotsStatus, slotsError } =
    useAppSelector((s) => s.booking);

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
    ? { [selectedDate]: { selected: true, selectedColor: theme.colors.primary } }
    : {};

  const slotsLoading = slotsStatus === 'loading';
  const slotsFailed = slotsStatus === 'failed' && slotsError;
  const showSlots = slotsStatus === 'succeeded' && !slotsFailed;

  return (
    <ScreenScroll>
      <Calendar
        onDayPress={onDayPress}
        markedDates={markedDates}
        minDate={today}
        theme={{
          backgroundColor: theme.colors.surface,
          calendarBackground: theme.colors.surface,
          selectedDayBackgroundColor: theme.colors.primary,
          selectedDayTextColor: theme.colors.onPrimary,
          dayTextColor: theme.colors.textPrimary,
          monthTextColor: theme.colors.textPrimary,
          todayTextColor: theme.colors.primary,
          arrowColor: theme.colors.primary,
          textDisabledColor: theme.colors.textSecondary,
        }}
      />

      {!selectedDate && (
        <Text style={[styles.hint, { color: theme.colors.textSecondary }, styles.pickHint]}>
          {t('slotSelect.pickDate')}
        </Text>
      )}

      {selectedDate && slotsLoading && (
        <View style={styles.centered}>
          <ActivityIndicator size="small" />
          <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
            {t('slotSelect.loadingSlots')}
          </Text>
        </View>
      )}

      {selectedDate && slotsFailed && (
        <View style={styles.block}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {t('slotSelect.slotsError')}
          </Text>
          <PrimaryButton onPress={onRetry}>{t('slotSelect.retry')}</PrimaryButton>
        </View>
      )}

      {selectedDate && showSlots && slots.length === 0 && (
        <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>{t('slotSelect.noSlots')}</Text>
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
                    backgroundColor: theme.colors.secondary,
                    borderColor: theme.colors.primary,
                  },
                  pressed && styles.slotChipPressed,
                ]}
              >
                <Text style={[styles.slotText, { color: theme.colors.textPrimary }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
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
