import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { RootStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenScroll } from '../components/ScreenScroll';
import { fetchServices } from '../store/bookingThunks';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { pickService } from '../store/slices/bookingSlice';
import type { ResourceService } from '../api/types';
import { bookingSummaryStyles } from '../styles/bookingSummaryStyles';
import { useAppTheme } from '../theme/ThemeProvider';
import { formatResourceName } from '../utils/formatResourceName';

type Props = NativeStackScreenProps<RootStackParamList, 'ServiceSelect'>;

function effectiveDuration(s: ResourceService): number {
  return s.durationOverride ?? s.service.durationMinutes;
}

export function ServiceSelectScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
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

  return (
    <ScreenScroll>
      {selectedResourceName ? (
        <View
          style={[
            bookingSummaryStyles.card,
            {
              backgroundColor: theme.colors.background,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.contrast,
            },
          ]}
        >
          <View style={bookingSummaryStyles.block}>
            <Text style={[bookingSummaryStyles.label, { color: theme.colors.contrast }]}>{t('confirmation.provider')}:</Text>
            <Text style={[bookingSummaryStyles.value, { color: theme.colors.contrast }]}>{selectedResourceName}</Text>
          </View>
        </View>
      ) : null}

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text style={[styles.hint, { color: theme.colors.text }]}>{t('serviceSelect.loading')}</Text>
        </View>
      )}

      {failed && (
        <View style={styles.block}>
          <Text style={[styles.errorText, { color: theme.colors.text }]}>{t('serviceSelect.error')}</Text>
          <PrimaryButton onPress={onRetry}>{t('serviceSelect.retry')}</PrimaryButton>
        </View>
      )}

      {showList && services.length === 0 && (
        <Text style={[styles.hint, { color: theme.colors.text }]}>
          {t('serviceSelect.emptyList')}
        </Text>
      )}

      {showList &&
        services.length > 0 &&
        services.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={t('serviceSelect.chooseServiceA11y', {
              name: item.service.name,
            })}
            onPress={() => onSelectService(item.serviceId)}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: theme.colors.contrast },
              pressed && styles.rowPressed,
            ]}
          >
            <View style={styles.rowContent}>
              <Text style={[styles.rowName, { color: theme.colors.text }]}>
                {item.service.name}
              </Text>
              <View style={styles.rowMeta}>
                <Text style={[styles.rowPrice, { color: theme.colors.text }]}>{item.price}</Text>
                <Text style={[styles.rowDuration, { color: theme.colors.text }]}>
                  {t('serviceSelect.min', { count: effectiveDuration(item) })}
                </Text>
              </View>
            </View>
            {item.service.description ? (
              <Text style={[styles.rowDesc, { color: theme.colors.text }]}>
                {item.service.description}
              </Text>
            ) : null}
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
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
  },
  rowPressed: { opacity: 0.85 },
  rowContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowName: { fontSize: 16, fontWeight: '500', flex: 1, marginRight: 8 },
  rowMeta: { alignItems: 'flex-end' },
  rowPrice: { fontSize: 15, fontWeight: '600' },
  rowDuration: { fontSize: 13, marginTop: 2 },
  rowDesc: { fontSize: 13, marginTop: 6 },
});
