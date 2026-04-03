import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { TENANT_SLUG } from '../constants/env';
import type { RootStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenScroll } from '../components/ScreenScroll';
import { fetchResources, fetchTenantBySlug } from '../store/bookingThunks';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { pickResource } from '../store/slices/bookingSlice';
import { bookingSummaryStyles } from '../styles/bookingSummaryStyles';
import { useAppTheme } from '../theme/ThemeProvider';
import { formatResourceName } from '../utils/formatResourceName';

type Props = NativeStackScreenProps<RootStackParamList, 'ResourceSelect'>;

function ResourceAvatar({
  uri,
  fallbackLabel,
}: {
  uri: string | null;
  fallbackLabel: string;
}) {
  const { theme } = useAppTheme();
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(uri?.trim()) && !failed;
  const initial = fallbackLabel.trim().charAt(0).toUpperCase() || '?';

  return (
    <View
      style={[
        styles.avatarOuter,
        {
          backgroundColor: theme.colors.contrast,
          borderColor: theme.colors.background,
        },
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri: uri!.trim() }}
          style={styles.avatarImage}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text style={[styles.avatarInitial, { color: theme.colors.text }]}>{initial}</Text>
      )}
    </View>
  );
}

export function ResourceSelectScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
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
      {!missingSlug && (
        <Text style={[bookingSummaryStyles.pageHeading, { color: theme.colors.contrast }]}>
          {t('resourceSelect.title')}
        </Text>
      )}

      {missingSlug && (
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          {t('resourceSelect.missingSlug')}
        </Text>
      )}

      {!missingSlug && loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text style={[styles.hint, { color: theme.colors.text }]}>{t('resourceSelect.loading')}</Text>
        </View>
      )}

      {!missingSlug && tenantFailed && (
        <View style={styles.block}>
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            {tenantErrorCode === 'tenantNotFound'
              ? t('resourceSelect.tenantNotFound')
              : t('resourceSelect.networkError')}
          </Text>
          <PrimaryButton onPress={onRetryTenant}>{t('resourceSelect.retry')}</PrimaryButton>
        </View>
      )}

      {!missingSlug && tenantStatus === 'succeeded' && resourcesFailed && (
        <View style={styles.block}>
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            {t('resourceSelect.resourcesError')}
          </Text>
          <PrimaryButton onPress={onRetryResources}>{t('resourceSelect.retry')}</PrimaryButton>
        </View>
      )}

      {showList && resources.length === 0 && (
        <Text style={[styles.hint, { color: theme.colors.text }]}>
          {t('resourceSelect.emptyList')}
        </Text>
      )}

      {showList &&
        resources.length > 0 &&
        resources.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={t('resourceSelect.chooseProviderA11y', {
              name: formatResourceName(item),
            })}
            onPress={() => onSelectResource(item.id)}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: theme.colors.contrast },
              pressed && styles.rowPressed,
            ]}
          >
            <ResourceAvatar
              key={`${item.id}-${item.profilePicture ?? ''}`}
              uri={item.profilePicture}
              fallbackLabel={formatResourceName(item)}
            />
            <Text style={[styles.rowText, { color: theme.colors.text }]}>
              {formatResourceName(item)}
            </Text>
          </Pressable>
        ))}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  hint: { marginTop: 12, fontSize: 15 },
  errorText: { marginBottom: 12, fontSize: 15 },
  centered: { alignItems: 'center', paddingVertical: 24 },
  block: { marginBottom: 8 },
  row: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
  },
  rowPressed: { opacity: 0.85 },
  rowText: { fontSize: 16, fontWeight: '500', textAlign: 'center' },
  avatarOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarInitial: { fontSize: 32, fontWeight: '600' },
});
