import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { RootStackParamList } from '../navigation/types';
import { AppText } from '../components/AppText';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenScroll } from '../components/ScreenScroll';
import { fetchServices } from '../store/bookingThunks';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { pickService } from '../store/slices/bookingSlice';
import { bookingSummaryStyles } from '../styles/bookingSummaryStyles';
import { useAppTheme } from '../theme/ThemeProvider';
import { formatResourceName } from '../utils/formatResourceName';

type Props = NativeStackScreenProps<RootStackParamList, 'ServiceSelect'>;

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
              backgroundColor: 'theme.colors.background',
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.contrast,
            },
          ]}
        >
          <View style={bookingSummaryStyles.block}>
            <AppText style={[bookingSummaryStyles.label, { color: theme.colors.text }]}>{t('confirmation.provider')}:</AppText>
            <AppText style={[bookingSummaryStyles.value, { color: theme.colors.text }]}>{selectedResourceName}</AppText>
          </View>
        </View>
      ) : null}

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <AppText style={[styles.hint, { color: theme.colors.text }]}>{t('serviceSelect.loading')}</AppText>
        </View>
      )}

      {failed && (
        <View style={styles.block}>
          <AppText style={[styles.errorText, { color: theme.colors.error }]}>{t('serviceSelect.error')}</AppText>
          <PrimaryButton onPress={onRetry}>{t('serviceSelect.retry')}</PrimaryButton>
        </View>
      )}

      {showList && services.length === 0 && (
        <AppText style={[styles.hint, { color: theme.colors.text }]}>
          {t('serviceSelect.emptyList')}
        </AppText>
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
              { backgroundColor: 'white' },
              pressed && styles.rowPressed,
            ]}
          >
            <View style={styles.rowContent}>
              <AppText style={[styles.rowName, { color: theme.colors.text }]}>
                {item.service.name}
              </AppText>
              <View style={styles.rowMeta}>
                <AppText style={[styles.rowPrice, { color: theme.colors.text }]}>{item.price}</AppText>
              </View>
            </View>
            {item.service.description ? (
              <AppText style={[styles.rowDesc, { color: theme.colors.text }]}>
                {item.service.description}
              </AppText>
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
    boxShadow: '0 0 4px 0 rgba(0, 0, 0, 0.4)',
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
