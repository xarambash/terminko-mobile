import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';

import type { RootStackParamList } from '../navigation/types';
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
            <Text style={[bookingSummaryStyles.label, { color: theme.colors.contrast }]}>{t('confirmation.provider')}:</Text>
            <Text style={[bookingSummaryStyles.value, { color: theme.colors.contrast }]}>{resourceName}</Text>
          </View>
          <View style={bookingSummaryStyles.block}>
            <Text style={[bookingSummaryStyles.label, { color: theme.colors.contrast }]}>{t('confirmation.service')}:</Text>
            <Text style={[bookingSummaryStyles.value, { color: theme.colors.contrast }]}>{serviceName}</Text>
          </View>
          <View style={bookingSummaryStyles.block}>
            <Text style={[bookingSummaryStyles.label, { color: theme.colors.contrast }]}>{t('bookingForm.summaryDate')}:</Text>
            <Text style={[bookingSummaryStyles.value, { color: theme.colors.contrast }]}>{summaryDate}</Text>
          </View>
          <View style={bookingSummaryStyles.block}>
            <Text style={[bookingSummaryStyles.label, { color: theme.colors.contrast }]}>{t('bookingForm.summaryStartTime')}:</Text>
            <Text style={[bookingSummaryStyles.value, { color: theme.colors.contrast }]}>{summaryTime}</Text>
          </View>
          <View style={bookingSummaryStyles.block}>
            <Text style={[bookingSummaryStyles.label, { color: theme.colors.contrast }]}>{t('bookingForm.summaryPrice')}:</Text>
            <Text style={[bookingSummaryStyles.value, { color: theme.colors.contrast }]}>{selectedService?.price ?? ''}</Text>
          </View>
        </View>

        <View style={styles.form}>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: fieldErrors.name ? theme.colors.text : theme.colors.background,
                backgroundColor: theme.colors.contrast,
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
            <Text style={[styles.fieldError, { color: theme.colors.text }]}>{fieldErrors.name}</Text>
          ) : null}

          <TextInput
            style={[
              styles.input,
              {
                borderColor: fieldErrors.email ? theme.colors.text : theme.colors.background,
                backgroundColor: theme.colors.contrast,
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
            <Text style={[styles.fieldError, { color: theme.colors.text }]}>{fieldErrors.email}</Text>
          ) : null}

          <TextInput
            style={[
              styles.input,
              {
                borderColor: fieldErrors.phone ? theme.colors.text : theme.colors.background,
                backgroundColor: theme.colors.contrast,
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
            <Text style={[styles.fieldError, { color: theme.colors.text }]}>{fieldErrors.phone}</Text>
          ) : null}

          <TextInput
            style={[
              styles.input,
              styles.notesInput,
              {
                borderColor: theme.colors.background,
                backgroundColor: theme.colors.contrast,
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
                { backgroundColor: theme.colors.contrast, borderColor: theme.colors.text },
              ]}
            >
              <Text style={[styles.errorTitle, { color: theme.colors.text }]}>{t('bookingForm.errorTitle')}</Text>
              <Text style={[styles.errorText, { color: theme.colors.text }]}>
                {submitError === 'network' ? t('bookingForm.errorNetwork') : submitError}
              </Text>
            </View>
          ) : null}

          {submitting ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" />
              <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                {t('bookingForm.submitting')}
              </Text>
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
