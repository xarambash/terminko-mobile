import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { TENANT_SLUG } from '../constants/env';
import type { RootStackParamList } from '../navigation/types';
import { AppText } from '../components/AppText';
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
        <AppText style={[styles.avatarInitial, { color: theme.colors.text }]}>{initial}</AppText>
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
        <AppText style={[bookingSummaryStyles.pageHeading, { color: theme.colors.text }]}>
          {t('resourceSelect.title')}
        </AppText>
      )}

      {missingSlug && (
        <AppText style={[styles.errorText, { color: theme.colors.error }]}>
          {t('resourceSelect.missingSlug')}
        </AppText>
      )}

      {!missingSlug && loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <AppText style={[styles.hint, { color: theme.colors.text }]}>{t('resourceSelect.loading')}</AppText>
        </View>
      )}

      {!missingSlug && tenantFailed && (
        <View style={styles.block}>
          <AppText style={[styles.errorText, { color: theme.colors.error }]}>
            {tenantErrorCode === 'tenantNotFound'
              ? t('resourceSelect.tenantNotFound')
              : t('resourceSelect.networkError')}
          </AppText>
          <PrimaryButton onPress={onRetryTenant}>{t('resourceSelect.retry')}</PrimaryButton>
        </View>
      )}

      {!missingSlug && tenantStatus === 'succeeded' && resourcesFailed && (
        <View style={styles.block}>
          <AppText style={[styles.errorText, { color: theme.colors.error }]}>
            {t('resourceSelect.resourcesError')}
          </AppText>
          <PrimaryButton onPress={onRetryResources}>{t('resourceSelect.retry')}</PrimaryButton>
        </View>
      )}

      {showList && resources.length === 0 && (
        <AppText style={[styles.hint, { color: theme.colors.text }]}>
          {t('resourceSelect.emptyList')}
        </AppText>
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
            style={[styles.row, { backgroundColor: 'white' }]}
          >
            <ResourceAvatar
              key={`${item.id}-${item.profilePicture ?? ''}`}
              uri='https://www.shutterstock.com/image-photo/beauty-charisma-head-shot-portrait-600nw-2647728057.jpg'
              fallbackLabel={formatResourceName(item)}
            />
            <View style={styles.rowTextContainer}>
              <AppText style={[styles.rowText, { color: theme.colors.text }]}>
                {formatResourceName(item)}
              </AppText>
              <AppText style={[styles.rowSmallerText, { color: theme.colors.text }]}>
                {t('resourceSelect.provider')}
              </AppText>
            </View>
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
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 8,
    boxShadow: '0 0 4px 0 rgba(0, 0, 0, 0.4)',
  },
  rowPressed: { opacity: 0.85 },
  rowTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  rowText: { fontSize: 20, fontWeight: '500', textAlign: 'center' },
  rowSmallerText: {fontSize: 14, fontWeight: '500', textAlign: 'center'},
  avatarOuter: {
    width: 74,
    height: 74,
    borderRadius: 44,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarInitial: { fontSize: 32, fontWeight: '600' },
});
