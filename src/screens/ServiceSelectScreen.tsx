import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { RootStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenScroll } from '../components/ScreenScroll';
import { fetchServices } from '../store/bookingThunks';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { pickService } from '../store/slices/bookingSlice';
import type { ResourceService } from '../api/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ServiceSelect'>;

function effectiveDuration(s: ResourceService): number {
  return s.durationOverride ?? s.service.durationMinutes;
}

export function ServiceSelectScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { tenantId, resourceId, services, servicesStatus, servicesError } = useAppSelector(
    (s) => s.booking,
  );

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
      <Text style={styles.title}>{t('screens.serviceSelect')}</Text>

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text style={styles.hint}>{t('serviceSelect.loading')}</Text>
        </View>
      )}

      {failed && (
        <View style={styles.block}>
          <Text style={styles.errorText}>{t('serviceSelect.error')}</Text>
          <PrimaryButton onPress={onRetry}>{t('serviceSelect.retry')}</PrimaryButton>
        </View>
      )}

      {showList && services.length === 0 && (
        <Text style={styles.hint}>{t('serviceSelect.emptyList')}</Text>
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
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowName}>{item.service.name}</Text>
              <View style={styles.rowMeta}>
                <Text style={styles.rowPrice}>{item.price}</Text>
                <Text style={styles.rowDuration}>
                  {t('serviceSelect.min', { count: effectiveDuration(item) })}
                </Text>
              </View>
            </View>
            {item.service.description ? (
              <Text style={styles.rowDesc}>{item.service.description}</Text>
            ) : null}
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
  rowContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowName: { fontSize: 16, fontWeight: '500', color: '#111', flex: 1, marginRight: 8 },
  rowMeta: { alignItems: 'flex-end' },
  rowPrice: { fontSize: 15, fontWeight: '600', color: '#111' },
  rowDuration: { fontSize: 13, color: '#555', marginTop: 2 },
  rowDesc: { fontSize: 13, color: '#666', marginTop: 6 },
});
