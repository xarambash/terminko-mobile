import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Avatar, Button, Card, Icon, Text, useTheme } from 'react-native-paper';

import type { Resource } from '../api/types';
import { BookingStepLayout } from '../components/booking-step-layout';
import { TENANT_SLUG } from '../constants/env';
import { bookingStepIndex } from '../constants/bookingFlow';
import type { RootStackParamList } from '../navigation/types';
import { fetchResources, fetchTenantBySlug } from '../store/bookingThunks';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { pickResource } from '../store/slices/bookingSlice';
import { formatResourceInitials, formatResourceName } from '../utils/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'ResourceSelect'>;

function ProviderAvatar({ resource }: { resource: Resource }) {
  const uri = resource.profilePicture?.trim() ?? '';
  const initials = formatResourceInitials(resource);
  if (uri) {
    return <Avatar.Image size={56} source={{ uri }} />;
  }
  return <Avatar.Text size={56} label={initials} />;
}

export function ResourceSelectScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { tenantId, tenantStatus, tenantErrorCode, resources, resourcesStatus, resourcesError } =
    useAppSelector((s) => s.booking);

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
  const showList = tenantStatus === 'succeeded' && resourcesStatus === 'succeeded' && !resourcesFailed;
  const missingSlug = !TENANT_SLUG;
  const showFullScreenLoader = !missingSlug && loading;
  const shellMode = showFullScreenLoader ? 'none' : missingSlug ? 'backOnly' : 'full';

  return (
    <BookingStepLayout
      activeStep={bookingStepIndex.resource}
      onBack={() => navigation.goBack()}
      backAccessibilityLabel={t('screens.back')}
      pageTitle={shellMode === 'full' ? t('resourceSelect.title') : undefined}
      shellMode={shellMode}
      safeAreaEdges={['top', 'left', 'right', 'bottom']}
      contentContainerStyle={showFullScreenLoader ? styles.centered : undefined}
    >
      {missingSlug && (
        <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
          {t('resourceSelect.missingSlug')}
        </Text>
      )}

      {showFullScreenLoader && (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {!showFullScreenLoader && !missingSlug && tenantFailed && (
        <View style={styles.block}>
          <Text variant="bodyMedium" style={[styles.errorText, { color: theme.colors.error }]}>
            {tenantErrorCode === 'tenantNotFound'
              ? t('resourceSelect.tenantNotFound')
              : t('resourceSelect.networkError')}
          </Text>
          <Button mode="contained" onPress={onRetryTenant} style={styles.retryBtn}>
            {t('resourceSelect.retry')}
          </Button>
        </View>
      )}

      {!showFullScreenLoader && !missingSlug && tenantStatus === 'succeeded' && resourcesFailed && (
        <View style={styles.block}>
          <Text variant="bodyMedium" style={[styles.errorText, { color: theme.colors.error }]}>
            {t('resourceSelect.resourcesError')}
          </Text>
          <Button mode="contained" onPress={onRetryResources} style={styles.retryBtn}>
            {t('resourceSelect.retry')}
          </Button>
        </View>
      )}

      {!showFullScreenLoader && showList && resources.length === 0 && (
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {t('resourceSelect.emptyList')}
        </Text>
      )}

      {!showFullScreenLoader &&
        showList &&
        resources.length > 0 &&
        resources.map((item) => (
          <Card
            key={item.id}
            mode="outlined"
            style={styles.card}
            onPress={() => onSelectResource(item.id)}
            accessibilityLabel={t('resourceSelect.chooseProviderA11y', {
              name: formatResourceName(item),
            })}
          >
            <View style={styles.cardInner}>
              <ProviderAvatar resource={item} />
              <View style={styles.cardTextCol}>
                <Text variant="titleMedium">{formatResourceName(item)}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {t('resourceSelect.provider')}
                </Text>
              </View>
              <Icon source="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
            </View>
          </Card>
        ))}
    </BookingStepLayout>
  );
}

const styles = StyleSheet.create({
  centered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loaderWrap: {
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  block: {
    marginBottom: 12,
  },
  errorText: {
    marginBottom: 12,
  },
  retryBtn: {
    alignSelf: 'flex-start',
  },
  card: {
    marginBottom: 12,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 14,
  },
  cardTextCol: {
    flex: 1,
  },
});
