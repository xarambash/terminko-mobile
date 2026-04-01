import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { cancelAppointment } from '../api/appointments';
import { getTenantBySlug } from '../api/tenants';
import { PrimaryButton } from '../components/PrimaryButton';
import { TENANT_SLUG } from '../constants/env';
import { ScreenScroll } from '../components/ScreenScroll';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export function LandingScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellationCode, setCancellationCode] = useState('');
  const [cancelStatus, setCancelStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  const closeCancelModal = useCallback(() => {
    setIsCancelModalOpen(false);
    setCancellationCode('');
    setCancelStatus('idle');
    setCancelMessage(null);
  }, []);

  const onCancelAppointment = useCallback(async () => {
    const trimmedCancellationCode = cancellationCode.trim();

    if (!trimmedCancellationCode) {
      setCancelStatus('failed');
      setCancelMessage(t('cancelAppointment.validationRequired'));
      return;
    }

    if (!TENANT_SLUG) {
      setCancelStatus('failed');
      setCancelMessage(t('cancelAppointment.missingSlug'));
      return;
    }

    setCancelStatus('loading');
    setCancelMessage(null);

    try {
      const tenant = await getTenantBySlug(TENANT_SLUG);
      await cancelAppointment(tenant.id, trimmedCancellationCode);
      setCancelStatus('succeeded');
      setCancelMessage(t('cancelAppointment.success'));
    } catch {
      setCancelStatus('failed');
      setCancelMessage(t('cancelAppointment.error'));
    }
  }, [cancellationCode, t]);

  return (
    <ScreenScroll>
      <View style={styles.header}>
        <Text style={styles.brand}>{t('appName')}</Text>
        <Text style={styles.title}>{t('landing.title')}</Text>
        <Text style={styles.subtitle}>{t('landing.subtitle')}</Text>
      </View>
      <PrimaryButton onPress={() => navigation.navigate('ResourceSelect')}>
        {t('landing.book')}
      </PrimaryButton>
      <PrimaryButton onPress={() => setIsCancelModalOpen(true)}>
        {t('landing.cancel')}
      </PrimaryButton>

      <Modal
        visible={isCancelModalOpen}
        transparent
        animationType="fade"
        onRequestClose={closeCancelModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('cancelAppointment.title')}</Text>
            <Text style={styles.modalHint}>{t('cancelAppointment.hint')}</Text>

            <Text style={styles.inputLabel}>{t('cancelAppointment.code')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('cancelAppointment.codePlaceholder')}
              value={cancellationCode}
              onChangeText={setCancellationCode}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            {cancelMessage ? (
              <Text
                style={[
                  styles.modalMessage,
                  cancelStatus === 'succeeded' ? styles.modalSuccess : styles.modalError,
                ]}
              >
                {cancelMessage}
              </Text>
            ) : null}

            {cancelStatus === 'loading' ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" />
                <Text style={styles.loadingText}>{t('cancelAppointment.submitting')}</Text>
              </View>
            ) : (
              <PrimaryButton onPress={() => void onCancelAppointment()}>
                {t('cancelAppointment.submit')}
              </PrimaryButton>
            )}
            <PrimaryButton onPress={closeCancelModal}>{t('cancelAppointment.close')}</PrimaryButton>
          </View>
        </View>
      </Modal>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 24 },
  brand: { fontSize: 14, fontWeight: '600', color: '#888', marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#555' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, color: '#111' },
  modalHint: { color: '#555', marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#fff',
  },
  modalMessage: { marginTop: 12, fontSize: 14 },
  modalSuccess: { color: '#1a7f37' },
  modalError: { color: '#b00020' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  loadingText: { color: '#555', fontSize: 14 },
});
