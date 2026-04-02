import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { cancelAppointment } from '../api/appointments';
import { PrimaryButton } from '../components/PrimaryButton';
import { TENANT_SLUG } from '../constants/env';
import { getTenantBySlug } from '../api/tenants';
import { ScreenScroll } from '../components/ScreenScroll';
import { useAppTheme } from '../theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

export function CancelAppointmentScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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
    <ScreenScroll>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{t('screens.cancelAppointment')}</Text>
      <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>{t('cancelAppointment.hint')}</Text>

      <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>{t('cancelAppointment.code')}</Text>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: theme.colors.border,
            color: theme.colors.textPrimary,
            backgroundColor: theme.colors.surface,
          },
        ]}
        placeholder={t('cancelAppointment.codePlaceholder')}
        placeholderTextColor={theme.colors.textSecondary}
        value={cancellationCode}
        onChangeText={setCancellationCode}
        autoCapitalize="characters"
        autoCorrect={false}
      />

      {message ? (
        <Text
          style={[
            styles.message,
            { color: status === 'succeeded' ? theme.colors.success : theme.colors.error },
          ]}
        >
          {message}
        </Text>
      ) : null}

      {status === 'loading' ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            {t('cancelAppointment.submitting')}
          </Text>
        </View>
      ) : (
        <PrimaryButton onPress={() => void onCancelAppointment()}>
          {t('cancelAppointment.submit')}
        </PrimaryButton>
      )}
      <PrimaryButton onPress={() => navigation.goBack()}>{t('screens.back')}</PrimaryButton>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '600', marginBottom: 12 },
  hint: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 4,
  },
  message: { marginTop: 12, marginBottom: 4, fontSize: 14 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  loadingText: { fontSize: 14 },
});
