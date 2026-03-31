import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { TENANT_SLUG } from '../constants/env';
import type { RootStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenScroll } from '../components/ScreenScroll';
import { fetchResources, fetchTenantBySlug } from '../store/bookingThunks';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { pickResource } from '../store/slices/bookingSlice';
import type { Resource } from '../api/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ResourceSelect'>;

function resourceLabel(r: Resource): string {
  return `${r.firstName} ${r.lastName}`.trim();
}

export function ResourceSelectScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    tenantId,
    tenantStatus,
    tenantErrorCode,
    resources,
    resourcesStatus,
    resourcesError,
  } = useAppSelector((s) => s.booking);

  useEffect(() => {
    if (!TENANT_SLUG || tenantId) return;
    void dispatch(fetchTenantBySlug(TENANT_SLUG));
  }, [dispatch, tenantId]);

  useEffect(() => {
    if (!tenantId || resourcesStatus !== 'idle') return;
    void dispatch(fetchResources(tenantId));
  }, [dispatch, tenantId, resourcesStatus]);

  const onRetryTenant = useCallback(() => {
    if (!TENANT_SLUG) return;
    void dispatch(fetchTenantBySlug(TENANT_SLUG));
  }, [dispatch]);

  const onRetryResources = useCallback(() => {
    if (!tenantId) return;
    void dispatch(fetchResources(tenantId));
  }, [dispatch, tenantId]);

  const onSelectResource = useCallback(
    (id: string) => {
      dispatch(pickResource(id));
      navigation.navigate('ServiceSelect');
    },
    [dispatch, navigation],
  );

  const loading =
    tenantStatus === 'loading' || (tenantStatus === 'succeeded' && resourcesStatus === 'loading');
  const tenantFailed = tenantStatus === 'failed';
  const resourcesFailed = resourcesStatus === 'failed' && resourcesError;
  const showList =
    tenantStatus === 'succeeded' && resourcesStatus === 'succeeded' && !resourcesFailed;

  const missingSlug = !TENANT_SLUG;

  return (
    <ScreenScroll>
      <Text style={styles.title}>{t('screens.resourceSelect')}</Text>

      {missingSlug && (
        <Text style={styles.errorText}>{t('resourceSelect.missingSlug')}</Text>
      )}

      {!missingSlug && loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text style={styles.hint}>{t('resourceSelect.loading')}</Text>
        </View>
      )}

      {!missingSlug && tenantFailed && (
        <View style={styles.block}>
          <Text style={styles.errorText}>
            {tenantErrorCode === 'tenantNotFound'
              ? t('resourceSelect.tenantNotFound')
              : t('resourceSelect.networkError')}
          </Text>
          <PrimaryButton onPress={onRetryTenant}>{t('resourceSelect.retry')}</PrimaryButton>
        </View>
      )}

      {!missingSlug && tenantStatus === 'succeeded' && resourcesFailed && (
        <View style={styles.block}>
          <Text style={styles.errorText}>{t('resourceSelect.resourcesError')}</Text>
          <PrimaryButton onPress={onRetryResources}>{t('resourceSelect.retry')}</PrimaryButton>
        </View>
      )}

      {showList && resources.length === 0 && (
        <Text style={styles.hint}>{t('resourceSelect.emptyList')}</Text>
      )}

      {showList &&
        resources.length > 0 &&
        resources.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={t('resourceSelect.chooseProviderA11y', {
              name: resourceLabel(item),
            })}
            onPress={() => onSelectResource(item.id)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <Text style={styles.rowText}>{resourceLabel(item)}</Text>
          </Pressable>
        ))}

      <PrimaryButton onPress={() => navigation.goBack()}>{t('screens.back')}</PrimaryButton>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '600', marginBottom: 12 },
  hint: { color: '#666', marginTop: 12, fontSize: 15 },
  errorText: { color: '#b00020', marginBottom: 12, fontSize: 15 },
  centered: { alignItems: 'center', paddingVertical: 24 },
  block: { marginBottom: 8 },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
    marginBottom: 8,
  },
  rowPressed: { opacity: 0.85 },
  rowText: { fontSize: 16, fontWeight: '500', color: '#111' },
});
