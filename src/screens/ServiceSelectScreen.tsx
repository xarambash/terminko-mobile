import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { BookingStepLayout } from '../components/booking-step-layout';
import { PrimaryButton } from '../components/PrimaryButton';
import { bookingStepIndex } from '../constants/bookingFlow';
import type { RootStackParamList } from '../navigation/types';
import { fetchServices } from '../store/bookingThunks';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { pickService } from '../store/slices/bookingSlice';
import { FONT_FAMILY_UI, FONT_FAMILY_UI_BOLD, landingBrand } from '../theme/theme';
import { formatResourceName } from '../utils/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'ServiceSelect'>;

function ProviderSummaryCard({ label, providerName }: { label: string; providerName: string }) {
  return (
    <View style={styles.providerCard}>
      <Text style={styles.providerLabel} maxFontSizeMultiplier={1.35}>
        {label}
      </Text>
      <Text style={styles.providerName} numberOfLines={2} maxFontSizeMultiplier={1.35}>
        {providerName}
      </Text>
    </View>
  );
}

export function ServiceSelectScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { tenantId, resourceId, resources, services, servicesStatus, servicesError } = useAppSelector(
    (s) => s.booking,
  );

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
    (serviceId: string) => {
      dispatch(pickService(serviceId));
      navigation.navigate('SlotSelect');
    },
    [dispatch, navigation],
  );

  const loading = servicesStatus === 'loading';
  const failed = servicesStatus === 'failed' && servicesError;
  const showList = servicesStatus === 'succeeded' && !failed;
  const contentContainerStyle = loading ? styles.scrollContentLoading : undefined;

  return (
    <BookingStepLayout
      variant="landing"
      activeStep={bookingStepIndex.service}
      onBack={() => navigation.goBack()}
      backAccessibilityLabel={t('screens.back')}
      pageTitle={t('screens.serviceSelect')}
      contentContainerStyle={contentContainerStyle}
      summary={
        !loading && selectedResourceName ? (
          <ProviderSummaryCard label={t('serviceSelect.providerLabel')} providerName={selectedResourceName} />
        ) : null
      }
    >
      {loading && (
        <View style={styles.fullScreenCenter}>
          <ActivityIndicator size="large" color={landingBrand.progressActive} />
        </View>
      )}

      {!loading && failed && (
        <View style={styles.block}>
          <Text style={styles.errorTextOnDark} maxFontSizeMultiplier={1.35}>
            {t('serviceSelect.error')}
          </Text>
          <PrimaryButton onPress={onRetry}>{t('serviceSelect.retry')}</PrimaryButton>
        </View>
      )}

      {!loading && showList && services.length === 0 && (
        <Text style={styles.hint} maxFontSizeMultiplier={1.35}>
          {t('serviceSelect.emptyList')}
        </Text>
      )}

      {!loading &&
        showList &&
        services.length > 0 &&
        services.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={t('serviceSelect.chooseServiceA11y', {
              name: item.service.name,
            })}
            onPress={() => onSelectService(item.serviceId)}
            style={({ pressed }) => [styles.serviceRow, pressed && styles.pressed]}
          >
            <View style={styles.rowContent}>
              <Text style={styles.serviceName} numberOfLines={2} maxFontSizeMultiplier={1.25}>
                {item.service.name}
              </Text>
              <Text style={styles.servicePrice} maxFontSizeMultiplier={1.25}>
                {item.price}
              </Text>
            </View>
            {item.service.description ? (
              <Text style={styles.rowDesc} maxFontSizeMultiplier={1.25}>
                {item.service.description}
              </Text>
            ) : null}
          </Pressable>
        ))}
    </BookingStepLayout>
  );
}

const styles = StyleSheet.create({
  scrollContentLoading: { flexGrow: 1, justifyContent: 'center' },
  fullScreenCenter: { alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  providerCard: {
    alignSelf: 'stretch',
    backgroundColor: landingBrand.cardSurface,
    borderWidth: 1,
    borderColor: landingBrand.cardBorder,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  providerLabel: {
    fontFamily: FONT_FAMILY_UI_BOLD,
    fontSize: 17,
    lineHeight: 20,
    color: landingBrand.metaLabel,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  providerName: {
    fontFamily: FONT_FAMILY_UI,
    fontSize: 20,
    lineHeight: 24,
    color: landingBrand.title,
  },
  hint: {
    marginTop: 12,
    fontSize: 18,
    fontFamily: FONT_FAMILY_UI,
    color: landingBrand.subtitle,
  },
  errorTextOnDark: {
    fontFamily: FONT_FAMILY_UI,
    fontSize: 18,
    color: '#e8a598',
    marginBottom: 12,
  },
  block: { marginBottom: 8 },
  serviceRow: {
    alignSelf: 'stretch',
    backgroundColor: landingBrand.cardSurface,
    borderWidth: 1,
    borderColor: landingBrand.cardBorder,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  pressed: { opacity: 0.88 },
  rowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  serviceName: {
    flex: 1,
    fontFamily: FONT_FAMILY_UI,
    fontSize: 22,
    lineHeight: 26,
    color: landingBrand.title,
  },
  servicePrice: {
    fontFamily: FONT_FAMILY_UI,
    fontSize: 20,
    lineHeight: 24,
    color: landingBrand.initialsGold,
  },
  rowDesc: {
    fontSize: 14,
    lineHeight: 18,
    marginTop: 8,
    fontFamily: FONT_FAMILY_UI,
    color: landingBrand.subtitle,
  },
});
