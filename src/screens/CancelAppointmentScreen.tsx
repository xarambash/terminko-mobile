import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text, useTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

import { cancelAppointment } from '../api/appointments';
import { getTenantBySlug } from '../api/tenants';
import { TENANT_SLUG } from '../constants/env';
import { FormInput } from '../components/FormInput';

export function CancelAppointmentScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [cancellationCode, setCancellationCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const onCancelAppointment = useCallback(async () => {
    const code = cancellationCode.trim();
    if (!code) {
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
      await cancelAppointment(tenant.id, code);
      setStatus('succeeded');
      setMessage(t('cancelAppointment.success'));
    } catch {
      setStatus('failed');
      setMessage(t('cancelAppointment.error'));
    }
  }, [cancellationCode, t]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.middle}>
          <Text variant="headlineSmall" style={styles.heading}>
            {t('cancelAppointment.heading')}
          </Text>

          <FormInput
            label={t('cancelAppointment.codePlaceholder')}
            value={cancellationCode}
            onChangeText={setCancellationCode}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={status !== 'loading'}
          />

          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('cancelAppointment.hint')}
          </Text>

          {message ? (
            <Text
              variant="bodyMedium"
              style={{ color: status === 'succeeded' ? theme.colors.primary : theme.colors.error }}
            >
              {message}
            </Text>
          ) : null}
        </View>

        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={() => void onCancelAppointment()}
            loading={status === 'loading'}
            disabled={status === 'loading'}
            style={styles.submitBtn}
            contentStyle={styles.submitBtnContent}
          >
            {t('cancelAppointment.submit')}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  middle: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  heading: {
    marginBottom: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  submitBtn: {
    borderRadius: 12,
  },
  submitBtnContent: {
    paddingVertical: 6,
  },
});
