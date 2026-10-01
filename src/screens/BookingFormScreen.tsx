import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Divider, Surface, Text, useTheme } from 'react-native-paper';
import { format, parseISO } from 'date-fns';

import { BookingStepLayout } from '../components/booking-step-layout';
import { FormInput } from '../components/FormInput';
import { bookingStepIndex } from '../constants/bookingFlow';
import type { RootStackParamList } from '../navigation/types';
import { submitBooking } from '../store/bookingThunks';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { resetSubmit } from '../store/slices/bookingSlice';
import { EMAIL_REGEX } from '../utils/constants';
import { formatResourceName } from '../utils/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingForm'>;

export function BookingFormScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const { tenantId, resourceId, serviceId, slotStart, slotEnd, resources, services, submitStatus, submitError } =
    useAppSelector((s) => s.booking);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  useEffect(() => {
    if (submitStatus === 'succeeded') navigation.navigate('Confirmation');
  }, [submitStatus, navigation]);

  useEffect(() => {
    return () => { dispatch(resetSubmit()); };
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
    return raw ? `${raw} RSD` : '—';
  }, [selectedService?.price]);

  const summaryDate = useMemo(() => {
    if (!slotStart) return '—';
    return format(parseISO(slotStart), 'PPP');
  }, [slotStart]);

  const summaryTime = useMemo(() => {
    if (!slotStart || !slotEnd) return '—';
    return `${format(parseISO(slotStart), 'HH:mm')} – ${format(parseISO(slotEnd), 'HH:mm')}`;
  }, [slotStart, slotEnd]);

  const validate = useCallback(() => {
    const errors: { name?: string; email?: string; phone?: string } = {};
    if (!name.trim()) errors.name = t('bookingForm.validationName');
    if (!EMAIL_REGEX.test(email.trim())) errors.email = t('bookingForm.validationEmail');
    if (!phone.trim()) errors.phone = t('bookingForm.validationPhone');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [name, email, phone, t]);

  const onSubmit = useCallback(() => {
    if (!validate() || !tenantId || !resourceId || !serviceId || !slotStart || !slotEnd) return;
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
  }, [validate, dispatch, tenantId, resourceId, serviceId, slotStart, slotEnd, name, email, phone, notes, resourceName, serviceName, priceAtBooking]);

  const submitting = submitStatus === 'loading';

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BookingStepLayout
        activeStep={bookingStepIndex.form}
        onBack={() => navigation.goBack()}
        backAccessibilityLabel={t('screens.back')}
        safeAreaEdges={['top', 'left', 'right', 'bottom']}
        pageTitle={t('bookingForm.bookingOverview')}
        contentContainerStyle={styles.content}
      >
        <Surface style={styles.overviewCard} elevation={1}>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewCell}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {t('slotSelect.serviceLabel').toUpperCase()}
              </Text>
              <Text variant="titleSmall" numberOfLines={2}>{serviceName || '—'}</Text>
            </View>
            <View style={styles.overviewCell}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {t('bookingForm.summaryDate').toUpperCase()}
              </Text>
              <Text variant="titleSmall" numberOfLines={2}>{summaryDate}</Text>
            </View>
          </View>
          <Divider style={styles.overviewDivider} />
          <View style={styles.overviewGrid}>
            <View style={styles.overviewCell}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {t('bookingForm.summaryTime').toUpperCase()}
              </Text>
              <Text variant="titleSmall">{summaryTime}</Text>
            </View>
            <View style={styles.overviewCell}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {t('bookingForm.summaryPrice').toUpperCase()}
              </Text>
              <Text variant="titleSmall" style={{ color: theme.colors.primary }}>{priceDisplay}</Text>
            </View>
          </View>
        </Surface>

        <Text variant="labelMedium" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
          {t('bookingForm.yourDetails').toUpperCase()}
        </Text>

        <View style={styles.form}>
          <FormInput
            label={t('bookingForm.name')}
            value={name}
            onChangeText={setName}
            error={!!fieldErrors.name}
            errorText={fieldErrors.name}
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="next"
          />
          <FormInput
            label={t('bookingForm.email')}
            value={email}
            onChangeText={setEmail}
            error={!!fieldErrors.email}
            errorText={fieldErrors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
          />
          <FormInput
            label={t('bookingForm.phone')}
            value={phone}
            onChangeText={setPhone}
            error={!!fieldErrors.phone}
            errorText={fieldErrors.phone}
            keyboardType="phone-pad"
            autoComplete="tel"
            returnKeyType="next"
          />
          <FormInput
            label={t('bookingForm.notes')}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
            returnKeyType="done"
          />
        </View>

        <View style={styles.footer}>
          {submitStatus === 'failed' && submitError ? (
            <Surface style={[styles.errorBox, { borderColor: theme.colors.errorContainer }]} elevation={0}>
              <Text variant="labelMedium" style={{ color: theme.colors.error }}>
                {t('bookingForm.errorTitle')}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.error }}>
                {submitError === 'network' ? t('bookingForm.errorNetwork') : submitError}
              </Text>
            </Surface>
          ) : null}

          <Text variant="bodySmall" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            {t('bookingForm.afterSubmitHint')}
          </Text>

          <Button
            mode="contained"
            onPress={onSubmit}
            loading={submitting}
            disabled={submitting}
            style={styles.submitBtn}
            contentStyle={styles.submitBtnContent}
          >
            {submitting ? t('bookingForm.submitting') : t('bookingForm.submit')}
          </Button>
        </View>
      </BookingStepLayout>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
  },
  overviewCard: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  overviewCell: {
    flex: 1,
    gap: 2,
    paddingVertical: 6,
  },
  overviewDivider: {
    marginVertical: 4,
  },
  sectionLabel: {
    marginBottom: 8,
  },
  form: {
    gap: 8,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 16,
    gap: 8,
  },
  errorBox: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    gap: 4,
  },
  hint: {
    textAlign: 'center',
  },
  submitBtn: {
    borderRadius: 12,
  },
  submitBtnContent: {
    paddingVertical: 4,
  },
});
