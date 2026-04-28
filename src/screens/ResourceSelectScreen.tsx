import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import type { Resource } from '../api/types';
import { BookingStepLayout } from '../components/booking-step-layout';
import { TENANT_SLUG } from '../constants/env';
import { bookingStepIndex } from '../constants/bookingFlow';
import type { RootStackParamList } from '../navigation/types';
import { fetchResources, fetchTenantBySlug } from '../store/bookingThunks';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { pickResource } from '../store/slices/bookingSlice';
import { FONT_FAMILY_INITIALS, FONT_FAMILY_UI, landingBrand } from '../theme/theme';
import { formatResourceInitials, formatResourceName } from '../utils/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'ResourceSelect'>;

function ProviderAvatar({ resource }: { resource: Resource }) {
  const [failed, setFailed] = useState(false);
  const uri = resource.profilePicture?.trim() ?? '';
  const showImage = Boolean(uri) && !failed;
  const initials = formatResourceInitials(resource);

  return (
    <View
      style={[
        styles.avatarOuter,
        {
          backgroundColor: landingBrand.background,
          borderColor: landingBrand.avatarRing,
        },
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri }}
          style={styles.avatarImage}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text style={styles.avatarInitials}>{initials}</Text>
      )}
    </View>
  );
}

function GoldRetryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}
    >
      <Text style={styles.retryLabel}>{label}</Text>
    </Pressable>
  );
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
  const showFullScreenLoader = !missingSlug && loading;

  const shellMode = showFullScreenLoader ? 'none' : missingSlug ? 'backOnly' : 'full';

  return (
    <BookingStepLayout
      variant="landing"
      activeStep={bookingStepIndex.resource}
      onBack={() => navigation.goBack()}
      backAccessibilityLabel={t('screens.back')}
      pageTitle={shellMode === 'full' ? t('resourceSelect.title') : undefined}
      shellMode={shellMode}
      safeAreaEdges={['top', 'left', 'right', 'bottom']}
      contentContainerStyle={showFullScreenLoader ? styles.scrollContentCentered : undefined}
    >
      {missingSlug && <Text style={styles.errorText}>{t('resourceSelect.missingSlug')}</Text>}

      {showFullScreenLoader && (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={landingBrand.progressActive} />
        </View>
      )}

      {!showFullScreenLoader && !missingSlug && tenantFailed && (
        <View style={styles.block}>
          <Text style={styles.errorText}>
            {tenantErrorCode === 'tenantNotFound'
              ? t('resourceSelect.tenantNotFound')
              : t('resourceSelect.networkError')}
          </Text>
          <GoldRetryButton label={t('resourceSelect.retry')} onPress={onRetryTenant} />
        </View>
      )}

      {!showFullScreenLoader && !missingSlug && tenantStatus === 'succeeded' && resourcesFailed && (
        <View style={styles.block}>
          <Text style={styles.errorText}>{t('resourceSelect.resourcesError')}</Text>
          <GoldRetryButton label={t('resourceSelect.retry')} onPress={onRetryResources} />
        </View>
      )}

      {!showFullScreenLoader && showList && resources.length === 0 && (
        <Text style={styles.hint}>{t('resourceSelect.emptyList')}</Text>
      )}

      {!showFullScreenLoader &&
        showList &&
        resources.length > 0 &&
        resources.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={t('resourceSelect.chooseProviderA11y', {
              name: formatResourceName(item),
            })}
            onPress={() => onSelectResource(item.id)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <ProviderAvatar resource={item} />
            <View style={styles.cardTextCol}>
              <Text style={styles.cardName}>{formatResourceName(item)}</Text>
              <Text style={styles.cardSubtitle}>{t('resourceSelect.provider')}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
    </BookingStepLayout>
  );
}

const styles = StyleSheet.create({
  scrollContentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  hint: {
    marginTop: 8,
    fontSize: 18,
    fontFamily: FONT_FAMILY_UI,
    color: landingBrand.subtitle,
  },
  errorText: {
    marginBottom: 16,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: FONT_FAMILY_UI,
    color: landingBrand.title,
  },
  block: { marginBottom: 12 },
  retryBtn: {
    alignSelf: 'flex-start',
    backgroundColor: landingBrand.primaryFill,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  retryLabel: {
    fontFamily: FONT_FAMILY_UI,
    fontSize: 20,
    color: landingBrand.primaryLabel,
  },
  pressed: { opacity: 0.88 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginBottom: 12,
    backgroundColor: landingBrand.cardSurface,
    borderWidth: 1,
    borderColor: landingBrand.cardBorder,
  },
  cardTextCol: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  cardName: {
    fontFamily: FONT_FAMILY_UI,
    fontSize: 24,
    lineHeight: 28,
    color: landingBrand.title,
  },
  cardSubtitle: {
    fontFamily: FONT_FAMILY_UI,
    fontSize: 16,
    lineHeight: 20,
    color: landingBrand.subtitle,
    marginTop: 2,
  },
  chevron: {
    fontSize: 28,
    color: landingBrand.subtitle,
    marginLeft: 8,
    fontFamily: FONT_FAMILY_UI,
  },
  avatarOuter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarInitials: {
    fontFamily: FONT_FAMILY_INITIALS,
    fontSize: 18,
    color: landingBrand.initialsGold,
  },
  loaderWrap: {
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
