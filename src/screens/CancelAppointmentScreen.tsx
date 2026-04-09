import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cancelAppointment } from '../api/appointments';
import { getTenantBySlug } from '../api/tenants';
import { TENANT_SLUG } from '../constants/env';
import { AppText } from '../components/AppText';
import { AppTextInput } from '../components/AppTextInput';
import { bookingSummaryStyles } from '../styles/bookingSummaryStyles';
import { useAppTheme } from '../theme/ThemeProvider';

export function CancelAppointmentScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const [cancellationCode, setCancellationCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const onCancelAppointment = useCallback(async () => {
    const trimmedCancellationCode = cancellationCode.trim();

    if (!trimmedCancellationCode) {
      setStatus('failed');
      setMessage(t('cancelAppointment.validationRequired'));
      return;
    }

    if (!TENANT_SLUG) {
      setStatus('failed');
      setMessage(t('cancelAppointment.missingSlug'));
      return;
    }

    setStatus('loading');
    setMessage(null);

    try {
      const tenant = await getTenantBySlug(TENANT_SLUG);
      await cancelAppointment(tenant.id, trimmedCancellationCode);
      setStatus('succeeded');
      setMessage(t('cancelAppointment.success'));
    } catch {
      setStatus('failed');
      setMessage(t('cancelAppointment.error'));
    }
  }, [cancellationCode, t]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.middle}>
        <AppText style={[bookingSummaryStyles.label, styles.heading, { color: theme.colors.text }]}>
          {t('cancelAppointment.heading')}
        </AppText>

        <AppTextInput
          style={[
            styles.field,
            styles.fieldInput,
            {
              borderColor: theme.colors.text,
              backgroundColor: 'transparent',
              color: theme.colors.text,
            },
          ]}
          textAlignVertical="center"
          placeholder={t('cancelAppointment.codePlaceholder')}
          placeholderTextColor={theme.colors.text}
          value={cancellationCode}
          onChangeText={setCancellationCode}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={status !== 'loading'}
        />

        <AppText style={[styles.hintBelow, { color: theme.colors.text }]}>{t('cancelAppointment.hint')}</AppText>

        {message ? (
          <AppText
            style={[
              styles.message,
              {
                color:
                  status === 'succeeded' ? theme.colors.contrast : theme.colors.error,
              },
            ]}
          >
            {message}
          </AppText>
        ) : null}
      </View>

      <View style={styles.footer}>
        {status === 'loading' ? (
          <View
            style={[
              styles.field,
              styles.fieldButton,
              { borderColor: theme.colors.background, backgroundColor: theme.colors.contrast },
            ]}
          >
            <ActivityIndicator color={theme.colors.text} />
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => void onCancelAppointment()}
            style={({ pressed }) => [
              styles.field,
              styles.fieldButton,
              {
                backgroundColor: theme.colors.contrast,
                borderColor: theme.colors.text,
              },
              pressed && styles.pressed,
            ]}
          >
            <AppText style={[styles.buttonLabel, { color: theme.colors.text }]}>
              {t('cancelAppointment.submit')}
            </AppText>
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const FIELD_HEIGHT = 48;

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  middle: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  heading: {
    textAlign: 'left',
    marginBottom: 16,
  },
  field: {
    alignSelf: 'stretch',
    width: '100%',
    height: FIELD_HEIGHT,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  fieldInput: {
    paddingVertical: 12,
    fontSize: 16,
  },
  fieldButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 0,
  },
  hintBelow: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'left',
    marginTop: 12,
    lineHeight: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 14,
    textAlign: 'left',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: { opacity: 0.85 },
});
