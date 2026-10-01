import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Button, Card, Surface, Text, useTheme } from 'react-native-paper';

import { BookingStepLayout } from '../components/booking-step-layout';
import { PrimaryButton } from '../components/PrimaryButton';
import { bookingStepIndex } from '../constants/bookingFlow';
import type { RootStackParamList } from '../navigation/types';
import { fetchServices } from '../store/bookingThunks';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { pickService } from '../store/slices/bookingSlice';
import { formatResourceName } from '../utils/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'ServiceSelect'>;

function ProviderSummaryCard({ label, providerName }: { label: string; providerName: string }) {
  const theme = useTheme();
  return (
    <Surface style={styles.providerCard} elevation={1}>
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {label.toUpperCase()}
      </Text>
      <Text variant="titleMedium">{providerName}</Text>
    </Surface>
  );
}

export function ServiceSelectScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { tenantId, resourceId, serviceId, resources, services, servicesStatus, servicesError } =
    useAppSelector((s) => s.booking);

  const selectedResourceName = useMemo(() => {
    if (!resourceId) return null;
    const r = resources.find((x) => x.id === resourceId);
    return r ? formatResourceName(r) : null;
  }, [resourceId, resources]);

  useEffect(() => {
    if (!tenantId || !resourceId || servicesStatus !== 'idle') return;
    void dispatch(fetchServices({ tenantId, resourceId }));
  }, [dispatch, tenantId, resourceId, servicesStatus]);

  const onRetry = useCallback(() => {
    if (!tenantId || !resourceId) return;
    void dispatch(fetchServices({ tenantId, resourceId }));
  }, [dispatch, tenantId, resourceId]);

  const onSelectService = useCallback(
    (id: string) => {
      dispatch(pickService(id));
    },
    [dispatch],
  );

  const onContinue = useCallback(() => {
    if (!serviceId) return;
    navigation.navigate('SlotSelect');
  }, [serviceId, navigation]);

  const loading = servicesStatus === 'loading';
  const failed = servicesStatus === 'failed' && servicesError;
  const showList = servicesStatus === 'succeeded' && !failed;

  return (
    <BookingStepLayout
      activeStep={bookingStepIndex.service}
      onBack={() => navigation.goBack()}
      backAccessibilityLabel={t('screens.back')}
      pageTitle={t('screens.serviceSelect')}
      contentContainerStyle={loading ? styles.centered : styles.content}
      summary={
        !loading && selectedResourceName ? (
          <ProviderSummaryCard
            label={t('serviceSelect.providerLabel')}
            providerName={selectedResourceName}
          />
        ) : null
      }
    >
      {loading && (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {!loading && failed && (
        <View style={styles.block}>
          <Text variant="bodyMedium" style={[styles.errorText, { color: theme.colors.error }]}>
            {t('serviceSelect.error')}
          </Text>
          <Button mode="contained" onPress={onRetry} style={styles.retryBtn}>
            {t('serviceSelect.retry')}
          </Button>
        </View>
      )}

      {!loading && showList && services.length === 0 && (
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {t('serviceSelect.emptyList')}
        </Text>
      )}

      {!loading &&
        showList &&
        services.length > 0 &&
        services.map((item) => {
          const selected = item.serviceId === serviceId;
          return (
            <Card
              key={item.id}
              mode="outlined"
              style={[
                styles.card,
                selected && {
                  borderColor: theme.colors.primary,
                  backgroundColor: theme.colors.primaryContainer,
                },
              ]}
              onPress={() => onSelectService(item.serviceId)}
              accessibilityLabel={t('serviceSelect.chooseServiceA11y', { name: item.service.name })}
            >
              <View style={styles.cardInner}>
                <View style={styles.rowContent}>
                  <Text variant="titleMedium" style={styles.serviceName} numberOfLines={2}>
                    {item.service.name}
                  </Text>
                  <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
                    {item.price}
                  </Text>
                </View>
                {item.service.description ? (
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
                  >
                    {item.service.description}
                  </Text>
                ) : null}
              </View>
            </Card>
          );
        })}

      {!loading && showList && services.length > 0 && (
        <PrimaryButton onPress={onContinue} disabled={!serviceId} style={styles.continueBtn}>
          {t('serviceSelect.continue')}
        </PrimaryButton>
      )}
    </BookingStepLayout>
  );
}

const styles = StyleSheet.create({
  centered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
  },
  loaderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  providerCard: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 2,
  },
  block: {
    marginBottom: 8,
  },
  errorText: {
    marginBottom: 12,
  },
  retryBtn: {
    alignSelf: 'flex-start',
  },
  card: {
    marginBottom: 10,
  },
  cardInner: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  serviceName: {
    flex: 1,
  },
  continueBtn: {
    marginTop: 'auto',
  },
});
