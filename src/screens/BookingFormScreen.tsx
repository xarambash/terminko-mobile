import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
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

import type { RootStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenScroll } from '../components/ScreenScroll';
import { submitBooking } from '../store/bookingThunks';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { resetSubmit } from '../store/slices/bookingSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingForm'>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BookingFormScreen({ navigation }: Props) {
  const { t } = useTranslation();
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
  const resourceName = selectedResource
    ? `${selectedResource.firstName} ${selectedResource.lastName}`.trim()
    : '';

  const selectedService = services.find((s) => s.serviceId === serviceId);
  const serviceName = selectedService?.service.name ?? '';
  const priceAtBooking = selectedService ? parseFloat(selectedService.price) : undefined;

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
        <Text style={styles.title}>{t('screens.bookingForm')}</Text>

        <Text style={styles.label}>{t('bookingForm.name')}</Text>
        <TextInput
          style={[styles.input, fieldErrors.name ? styles.inputError : null]}
          placeholder={t('bookingForm.namePlaceholder')}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="name"
          returnKeyType="next"
        />
        {fieldErrors.name ? <Text style={styles.fieldError}>{fieldErrors.name}</Text> : null}

        <Text style={styles.label}>{t('bookingForm.email')}</Text>
        <TextInput
          style={[styles.input, fieldErrors.email ? styles.inputError : null]}
          placeholder={t('bookingForm.emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          returnKeyType="next"
        />
        {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}

        <Text style={styles.label}>{t('bookingForm.phone')}</Text>
        <TextInput
          style={[styles.input, fieldErrors.phone ? styles.inputError : null]}
          placeholder={t('bookingForm.phonePlaceholder')}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoComplete="tel"
          returnKeyType="next"
        />
        {fieldErrors.phone ? <Text style={styles.fieldError}>{fieldErrors.phone}</Text> : null}

        <Text style={styles.label}>{t('bookingForm.notes')}</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder={t('bookingForm.notesPlaceholder')}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          returnKeyType="done"
        />

        {submitStatus === 'failed' && submitError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>{t('bookingForm.errorTitle')}</Text>
            <Text style={styles.errorText}>
              {submitError === 'network' ? t('bookingForm.errorNetwork') : submitError}
            </Text>
          </View>
        )}

        {submitting ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" />
            <Text style={styles.loadingText}>{t('bookingForm.submitting')}</Text>
          </View>
        ) : (
          <PrimaryButton onPress={onSubmit}>{t('bookingForm.submit')}</PrimaryButton>
        )}

        <PrimaryButton onPress={() => navigation.goBack()}>{t('screens.back')}</PrimaryButton>
      </ScreenScroll>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 4, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111',
  },
  inputError: { borderColor: '#b00020' },
  notesInput: { height: 80, textAlignVertical: 'top' },
  fieldError: { color: '#b00020', fontSize: 13, marginTop: 4 },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorTitle: { fontWeight: '600', color: '#b00020', marginBottom: 4 },
  errorText: { color: '#b00020', fontSize: 14 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 8 },
  loadingText: { color: '#555', fontSize: 15 },
});
