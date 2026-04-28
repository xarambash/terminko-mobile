import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';

import { BookingOverviewGraphic, type BookingOverviewRow } from '../components/BookingOverviewGraphic';
import { BookingStepLayout } from '../components/booking-step-layout';
import { AppText } from '../components/AppText';
import { AppTextInput } from '../components/AppTextInput';
import { bookingStepIndex } from '../constants/bookingFlow';
import type { RootStackParamList } from '../navigation/types';
import { submitBooking } from '../store/bookingThunks';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { resetSubmit } from '../store/slices/bookingSlice';
import { FONT_FAMILY_UI, FONT_FAMILY_UI_BOLD, landingBrand } from '../theme/theme';
import { EMAIL_REGEX } from '../utils/constants';
import { formatResourceName } from '../utils/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingForm'>;

const inputText = (fontError: boolean) => ({
  fontFamily: FONT_FAMILY_UI,
  fontSize: 20,
  lineHeight: 24,
  color: landingBrand.title,
  borderColor: fontError ? '#c54a3e' : landingBrand.cardBorder,
  backgroundColor: landingBrand.cardSurface,
});

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
  const resourceName = selectedResource ? formatResourceName(selectedResource) : '';

  const selectedService = services.find((s) => s.serviceId === serviceId);
  const serviceName = selectedService?.service.name ?? '';

  const priceAtBooking = useMemo(() => {
    if (!selectedService) return undefined;
    const n = parseFloat(selectedService.price);
    return Number.isFinite(n) ? n : undefined;
  }, [selectedService]);

  const priceDisplay = useMemo(() => {
    const raw = selectedService?.price?.trim();
    if (!raw) return '—';
    return `${raw} RSD`;
  }, [selectedService?.price]);

  const summaryDate = useMemo(() => {
    if (!slotStart) return '';
    return format(parseISO(slotStart), 'PPP');
  }, [slotStart]);

  const summaryTimeRange = useMemo(() => {
    if (!slotStart || !slotEnd) return '';
    return `${format(parseISO(slotStart), 'HH:mm')} – ${format(parseISO(slotEnd), 'HH:mm')}`;
  }, [slotStart, slotEnd]);

  const overviewRows: BookingOverviewRow[] = useMemo(
    () => [
      { label: t('slotSelect.serviceLabel'), value: serviceName || '—' },
      { label: t('bookingForm.summaryDate'), value: summaryDate || '—' },
      { label: t('bookingForm.summaryTime'), value: summaryTimeRange || '—' },
      {
        label: t('bookingForm.summaryPrice'),
        value: priceDisplay,
        valueAccent: 'gold',
      },
    ],
    [t, serviceName, summaryDate, summaryTimeRange, priceDisplay],
  );

  const overviewRowKey = useMemo(
    () => overviewRows.map((r) => `${r.label}\u0000${r.value}`).join('|'),
    [overviewRows],
  );

  const validate = useCallback(() => {
    const errors: { name?: string; email?: string; phone?: string } = {};
    if (!name.trim()) errors.name = t('bookingForm.validationName');
    if (!EMAIL_REGEX.test(email.trim())) errors.email = t('bookingForm.validationEmail');
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
      <BookingStepLayout
        variant="landing"
        activeStep={bookingStepIndex.form}
        onBack={() => navigation.goBack()}
        backAccessibilityLabel={t('screens.back')}
        safeAreaEdges={['top', 'left', 'right', 'bottom']}
        contentContainerStyle={styles.layoutContent}
        pageTitle={t('bookingForm.bookingOverview')}
      >
        <View style={styles.overviewBlock}>
          <BookingOverviewGraphic
            key={overviewRowKey}
            rows={overviewRows}
            providerFullName={resourceName}
          />
        </View>

        <Text style={styles.yourDetailsHeading}>{t('bookingForm.yourDetails')}</Text>

        <View style={styles.form}>
          <AppTextInput
            style={[styles.input, inputText(!!fieldErrors.name)]}
            placeholderTextColor={landingBrand.metaLabel}
            accessibilityLabel={t('bookingForm.name')}
            placeholder={t('bookingForm.name')}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="next"
          />
          {fieldErrors.name ? <Text style={styles.fieldError}>{fieldErrors.name}</Text> : null}

          <AppTextInput
            style={[styles.input, inputText(!!fieldErrors.email)]}
            placeholderTextColor={landingBrand.metaLabel}
            accessibilityLabel={t('bookingForm.email')}
            placeholder={t('bookingForm.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
          />
          {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}

          <AppTextInput
            style={[styles.input, inputText(!!fieldErrors.phone)]}
            placeholderTextColor={landingBrand.metaLabel}
            accessibilityLabel={t('bookingForm.phone')}
            placeholder={t('bookingForm.phone')}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
            returnKeyType="next"
          />
          {fieldErrors.phone ? <Text style={styles.fieldError}>{fieldErrors.phone}</Text> : null}

          <AppTextInput
            style={[styles.input, styles.notesInput, inputText(false)]}
            placeholderTextColor={landingBrand.metaLabel}
            accessibilityLabel={t('bookingForm.notes')}
            placeholder={t('bookingForm.notes')}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
            returnKeyType="done"
          />

          {submitStatus === 'failed' && submitError ? (
            <View style={styles.errorBox}>
              <AppText style={styles.errorTitle}>{t('bookingForm.errorTitle')}</AppText>
              <Text style={styles.errorBody}>
                {submitError === 'network' ? t('bookingForm.errorNetwork') : submitError}
              </Text>
            </View>
          ) : null}

          <Text style={styles.hint} maxFontSizeMultiplier={1.2}>
            {t('bookingForm.afterSubmitHint')}
          </Text>

          {submitting ? (
            <View style={[styles.submitBtn, styles.submittingInner]}>
              <ActivityIndicator color={landingBrand.background} size="small" />
              <Text style={styles.submittingText}>{t('bookingForm.submitting')}</Text>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={onSubmit}
              style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.92 }]}
            >
              <Text style={styles.checkGlyph} maxFontSizeMultiplier={1.2}>
                ✓
              </Text>
              <Text style={styles.submitLabel} numberOfLines={1}>
                {t('bookingForm.submit')}
              </Text>
            </Pressable>
          )}
        </View>
      </BookingStepLayout>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  layoutContent: { paddingTop: 0 },
  overviewBlock: {
    alignSelf: 'stretch',
    marginBottom: 0,
  },
  yourDetailsHeading: {
    fontFamily: FONT_FAMILY_UI,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.4,
    color: landingBrand.metaLabel,
    textTransform: 'none',
    marginTop: 0,
    marginBottom: 12,
  },
  form: { gap: 12 },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  notesInput: { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 },
  fieldError: {
    fontFamily: FONT_FAMILY_UI,
    fontSize: 14,
    color: '#e8a598',
    marginTop: -4,
  },
  errorBox: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#5c2c28',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  errorTitle: { fontWeight: '600', marginBottom: 4, color: '#e8a598', fontSize: 15 },
  errorBody: { fontFamily: FONT_FAMILY_UI, fontSize: 14, color: '#e8a598' },
  hint: {
    fontFamily: FONT_FAMILY_UI,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: landingBrand.metaLabel,
    marginTop: 4,
  },
  submitBtn: {
    marginTop: 4,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: landingBrand.primaryFill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  submittingInner: { flexDirection: 'row', gap: 8 },
  submittingText: { fontFamily: FONT_FAMILY_UI, fontSize: 20, color: landingBrand.background },
  checkGlyph: {
    fontSize: 20,
    fontWeight: '700',
    color: landingBrand.background,
  },
  submitLabel: {
    fontFamily: FONT_FAMILY_UI_BOLD,
    fontSize: 22,
    color: landingBrand.background,
    textAlign: 'center',
  },
});
