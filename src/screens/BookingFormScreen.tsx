import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';

import type { RootStackParamList } from '../navigation/types';
import { AppText } from '../components/AppText';
import { AppTextInput } from '../components/AppTextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenScroll } from '../components/ScreenScroll';
import { submitBooking } from '../store/bookingThunks';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { resetSubmit } from '../store/slices/bookingSlice';
import { useAppTheme } from '../theme/ThemeProvider';
import { bookingSummaryStyles } from '../styles/bookingSummaryStyles';
import { formatResourceName } from '../utils/formatResourceName';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingForm'>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BookingFormScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const dispatch = useAppDispatch();

  const { tenantId, resourceId, serviceId, slotStart, slotEnd, resources, services, submitStatus, submitError } =
    useAppSelector((s) => s.booking);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; phone?: string }>(
    {},
  );

  useEffect(() => {
    if (submitStatus === 'succeeded') {
      navigation.navigate('Confirmation');
    }
  }, [submitStatus, navigation]);

  useEffect(() => {
    return () => {
      dispatch(resetSubmit());
    };
  }, [dispatch]);

  const selectedResource = resources.find((r) => r.id === resourceId);
  const resourceName = selectedResource ? formatResourceName(selectedResource) : '';

  const selectedService = services.find((s) => s.serviceId === serviceId);
  const serviceName = selectedService?.service.name ?? '';
  const priceAtBooking = selectedService ? parseFloat(selectedService.price) : undefined;

  const { summaryDate, summaryTime } = useMemo(() => {
    if (!slotStart) return { summaryDate: '', summaryTime: '' };
    const start = parseISO(slotStart);
    return {
      summaryDate: format(start, 'PPP'),
      summaryTime: format(start, 'HH:mm'),
    };
  }, [slotStart]);

  const validate = useCallback(() => {
    const errors: { name?: string; email?: string; phone?: string } = {};
    if (!name.trim()) errors.name = t('bookingForm.validationName');
    if (!EMAIL_RE.test(email.trim())) errors.email = t('bookingForm.validationEmail');
    if (!phone.trim()) errors.phone = t('bookingForm.validationPhone');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [name, email, phone, t]);

  const onSubmit = useCallback(() => {
    if (!validate()) return;
    if (!tenantId || !resourceId || !serviceId || !slotStart || !slotEnd) return;

    void dispatch(
      submitBooking({
        tenantId,
        resourceName,
        serviceName,
        payload: {
          resourceId,
          serviceId,
          guest: { name: name.trim(), email: email.trim(), phone: phone.trim() },
          startAt: slotStart,
          endAt: slotEnd,
          priceAtBooking,
          notes: notes.trim() || undefined,
        },
      }),
    );
  }, [
    validate,
    dispatch,
    tenantId,
    resourceId,
    serviceId,
    slotStart,
    slotEnd,
    name,
    email,
    phone,
    notes,
    resourceName,
    serviceName,
    priceAtBooking,
  ]);

  const submitting = submitStatus === 'loading';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenScroll>
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
          <View style={bookingSummaryStyles.block}>
            <AppText style={[bookingSummaryStyles.label, { color: theme.colors.text }]}>{t('confirmation.provider')}:</AppText>
            <AppText style={[bookingSummaryStyles.value, { color: theme.colors.text }]}>{resourceName}</AppText>
          </View>
          <View style={bookingSummaryStyles.block}>
            <AppText style={[bookingSummaryStyles.label, { color: theme.colors.text }]}>{t('confirmation.service')}:</AppText>
            <AppText style={[bookingSummaryStyles.value, { color: theme.colors.text }]}>{serviceName}</AppText>
          </View>
          <View style={bookingSummaryStyles.block}>
            <AppText style={[bookingSummaryStyles.label, { color: theme.colors.text }]}>{t('bookingForm.summaryDate')}:</AppText>
            <AppText style={[bookingSummaryStyles.value, { color: theme.colors.text }]}>{summaryDate}</AppText>
          </View>
          <View style={bookingSummaryStyles.block}>
            <AppText style={[bookingSummaryStyles.label, { color: theme.colors.text }]}>{t('bookingForm.summaryStartTime')}:</AppText>
            <AppText style={[bookingSummaryStyles.value, { color: theme.colors.text }]}>{summaryTime}</AppText>
          </View>
          <View style={bookingSummaryStyles.block}>
            <AppText style={[bookingSummaryStyles.label, { color: theme.colors.text }]}>{t('bookingForm.summaryPrice')}:</AppText>
            <AppText style={[bookingSummaryStyles.value, { color: theme.colors.text }]}>{selectedService?.price ?? ''}</AppText>
          </View>
        </View>

        <View style={styles.form}>
          <AppTextInput
            style={[
              styles.input,
              {
                borderColor: fieldErrors.name ? theme.colors.error : theme.colors.text,
                backgroundColor: 'transparent',
                color: theme.colors.text,
              },
            ]}
            accessibilityLabel={t('bookingForm.name')}
            placeholder={t('bookingForm.name')}
            placeholderTextColor={theme.colors.text}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="next"
          />
          {fieldErrors.name ? (
            <AppText style={[styles.fieldError, { color: theme.colors.error }]}>{fieldErrors.name}</AppText>
          ) : null}

          <AppTextInput
            style={[
              styles.input,
              {
                borderColor: fieldErrors.email ? theme.colors.error : theme.colors.text,
                backgroundColor: 'transparent',
                color: theme.colors.text,
              },
            ]}
            accessibilityLabel={t('bookingForm.email')}
            placeholder={t('bookingForm.email')}
            placeholderTextColor={theme.colors.text}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
          />
          {fieldErrors.email ? (
            <AppText style={[styles.fieldError, { color: theme.colors.error }]}>{fieldErrors.email}</AppText>
          ) : null}

          <AppTextInput
            style={[
              styles.input,
              {
                borderColor: fieldErrors.phone ? theme.colors.error : theme.colors.text,
                backgroundColor: 'transparent',
                color: theme.colors.text,
              },
            ]}
            accessibilityLabel={t('bookingForm.phone')}
            placeholder={t('bookingForm.phone')}
            placeholderTextColor={theme.colors.text}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
            returnKeyType="next"
          />
          {fieldErrors.phone ? (
            <AppText style={[styles.fieldError, { color: theme.colors.error }]}>{fieldErrors.phone}</AppText>
          ) : null}

          <AppTextInput
            style={[
              styles.input,
              styles.notesInput,
              {
                borderColor: theme.colors.text,
                backgroundColor: 'transparent',
                color: theme.colors.text,
              },
            ]}
            accessibilityLabel={t('bookingForm.notes')}
            placeholder={t('bookingForm.notes')}
            placeholderTextColor={theme.colors.text}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            returnKeyType="done"
          />

          {submitStatus === 'failed' && submitError ? (
            <View
              style={[
                styles.errorBox,
                { backgroundColor: theme.colors.contrast, borderColor: theme.colors.error },
              ]}
            >
              <AppText style={[styles.errorTitle, { color: theme.colors.error }]}>{t('bookingForm.errorTitle')}</AppText>
              <AppText style={[styles.errorText, { color: theme.colors.error }]}>
                {submitError === 'network' ? t('bookingForm.errorNetwork') : submitError}
              </AppText>
            </View>
          ) : null}

          {submitting ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" />
              <AppText style={[styles.loadingText, { color: theme.colors.text }]}>
                {t('bookingForm.submitting')}
              </AppText>
            </View>
          ) : (
            <PrimaryButton onPress={onSubmit}>{t('bookingForm.submit')}</PrimaryButton>
          )}
        </View>
      </ScreenScroll>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { gap: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  notesInput: { height: 80, textAlignVertical: 'top' },
  fieldError: { fontSize: 13 },
  errorBox: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
  },
  errorTitle: { fontWeight: '600', marginBottom: 4 },
  errorText: { fontSize: 14 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 8 },
  loadingText: { fontSize: 15 },
});
