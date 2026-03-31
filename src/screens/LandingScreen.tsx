import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { format, isAfter, isEqual, parseISO } from 'date-fns';

import { cancelAppointment, getInstallationAppointments } from '../api/appointments';
import type { GuestAppointment } from '../api/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenScroll } from '../components/ScreenScroll';
import { TENANT_SLUG } from '../constants/env';
import { ensureInstallationId } from '../lib/guestStorage';
import { getTenantBySlug } from '../api/tenants';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export function LandingScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [installationId, setInstallationId] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<GuestAppointment[]>([]);
  const [cancelingAppointmentId, setCancelingAppointmentId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');
  const [errorCode, setErrorCode] = useState<
    'missingInstallationId' | 'missingTenantSlug' | 'tenantNotFound' | 'network'
  >('network');

  const loadAppointments = useCallback(async () => {
    const storedInstallationId = await ensureInstallationId();
    setInstallationId(storedInstallationId);

    if (!storedInstallationId) {
      setTenantId(null);
      setAppointments([]);
      setStatus('failed');
      setErrorCode('missingInstallationId');
      return;
    }

    if (!TENANT_SLUG) {
      setTenantId(null);
      setAppointments([]);
      setStatus('failed');
      setErrorCode('missingTenantSlug');
      return;
    }

    setStatus('loading');
    setErrorCode('network');

    try {
      const tenant = await getTenantBySlug(TENANT_SLUG);
      setTenantId(tenant.id);
      const data = await getInstallationAppointments(tenant.id, storedInstallationId);
      setAppointments(data);
      setStatus('succeeded');
    } catch (e) {
      setTenantId(null);
      setAppointments([]);
      setStatus('failed');
      if (axios.isAxiosError(e) && e.response?.status === 404) {
        setErrorCode('tenantNotFound');
        return;
      }
      setErrorCode('network');
    }
  }, []);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  useFocusEffect(
    useCallback(() => {
      void loadAppointments();
    }, [loadAppointments]),
  );

  function appointmentProviderName(item: GuestAppointment): string {
    const first = item.resource?.firstName?.trim() ?? '';
    const last = item.resource?.lastName?.trim() ?? '';
    return `${first} ${last}`.trim() || t('reservations.unknownProvider');
  }

  function appointmentServiceName(item: GuestAppointment): string {
    return item.service?.name?.trim() || t('reservations.unknownService');
  }

  function isUpcomingScheduled(item: GuestAppointment): boolean {
    const normalizedStatus = item.status?.toLowerCase();
    if (normalizedStatus !== 'scheduled') {
      return false;
    }
    const start = parseISO(item.startAt);
    const end = parseISO(item.endAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return false;
    }
    const now = new Date();
    return (
      isAfter(start, now) ||
      isEqual(start, now) ||
      isAfter(end, now) ||
      isEqual(end, now)
    );
  }

  const upcomingScheduledAppointments = appointments
    .filter(isUpcomingScheduled)
    .sort((a, b) => parseISO(a.startAt).getTime() - parseISO(b.startAt).getTime());

  async function handleConfirmCancel(appointmentId: string) {
    if (!installationId || !tenantId) {
      return;
    }
    setCancelingAppointmentId(appointmentId);
    try {
      await cancelAppointment(tenantId, appointmentId, { installationId });
      await loadAppointments();
    } catch {
      Alert.alert(t('reservations.cancelFailedTitle'), t('reservations.cancelFailedMessage'));
    } finally {
      setCancelingAppointmentId(null);
    }
  }

  function openCancelConfirm(item: GuestAppointment) {
    const when = format(parseISO(item.startAt), 'PPP p');
    Alert.alert(
      t('reservations.cancelConfirmTitle'),
      t('reservations.cancelConfirmMessage', {
        service: appointmentServiceName(item),
        provider: appointmentProviderName(item),
        when,
      }),
      [
        { text: t('reservations.cancelKeep'), style: 'cancel' },
        {
          text: t('reservations.cancelAction'),
          style: 'destructive',
          onPress: () => {
            void handleConfirmCancel(item.id);
          },
        },
      ],
    );
  }

  return (
    <ScreenScroll>
      <View style={styles.header}>
        <Text style={styles.brand}>{t('appName')}</Text>
        <Text style={styles.title}>{t('landing.title')}</Text>
      </View>
      <PrimaryButton onPress={() => navigation.navigate('ResourceSelect')}>
        {t('landing.book')}
      </PrimaryButton>

      <Text style={styles.sectionTitle}>{t('screens.reservations')}</Text>

      {status === 'loading' && (
        <View style={styles.centered}>
          <ActivityIndicator size="small" />
          <Text style={styles.hint}>{t('reservations.loading')}</Text>
        </View>
      )}

      {status === 'failed' && (
        <View style={styles.block}>
          <Text style={styles.errorText}>
            {errorCode === 'missingInstallationId'
              ? t('reservations.missingInstallationId')
              : errorCode === 'missingTenantSlug'
                ? t('reservations.missingTenantSlug')
                : errorCode === 'tenantNotFound'
                  ? t('reservations.tenantNotFound')
                  : t('reservations.networkError')}
          </Text>
          {errorCode === 'missingInstallationId' && (
            <Text style={styles.hint}>
              {t('reservations.installationIdHint', { installationId: installationId ?? '—' })}
            </Text>
          )}
          {(errorCode === 'tenantNotFound' || errorCode === 'network') && (
            <PrimaryButton onPress={() => void loadAppointments()}>{t('reservations.retry')}</PrimaryButton>
          )}
        </View>
      )}

      {status === 'succeeded' && upcomingScheduledAppointments.length === 0 && (
        <Text style={styles.hint}>{t('reservations.emptyUpcoming')}</Text>
      )}

      {status === 'succeeded' &&
        upcomingScheduledAppointments.length > 0 &&
        upcomingScheduledAppointments.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>
              {format(parseISO(item.startAt), 'PPP p')} - {format(parseISO(item.endAt), 'p')}
            </Text>
            <Text style={styles.cardMeta}>
              {t('confirmation.provider')}: {appointmentProviderName(item)}
            </Text>
            <Text style={styles.cardMeta}>
              {t('confirmation.service')}: {appointmentServiceName(item)}
            </Text>
            <Pressable
              onPress={() => openCancelConfirm(item)}
              disabled={cancelingAppointmentId === item.id}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.cancelButtonPressed,
                cancelingAppointmentId === item.id && styles.cancelButtonDisabled,
              ]}
            >
              <Text style={styles.cancelButtonLabel}>
                {cancelingAppointmentId === item.id
                  ? t('reservations.canceling')
                  : t('reservations.cancelAction')}
              </Text>
            </Pressable>
          </View>
        ))}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 16 },
  brand: { fontSize: 14, fontWeight: '600', color: '#888', marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '700' },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginTop: 16, marginBottom: 10 },
  centered: { alignItems: 'center', paddingVertical: 14 },
  block: { marginBottom: 12 },
  hint: { color: '#666', marginBottom: 16, fontSize: 15 },
  errorText: { color: '#b00020', marginBottom: 8, fontSize: 15 },
  card: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 8 },
  cardMeta: { fontSize: 14, color: '#333', marginBottom: 3 },
  cancelButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#b00020',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelButtonPressed: { opacity: 0.9 },
  cancelButtonDisabled: { opacity: 0.6 },
  cancelButtonLabel: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
