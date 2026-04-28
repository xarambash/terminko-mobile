import { StyleSheet, View } from 'react-native';

import { BOOKING_FLOW_STEPS } from '../../constants/bookingFlow';
import { landingBrand, type AppTheme } from '../../theme/theme';
import type { BookingLayoutVariant } from './types';

type Props = {
  activeIndex: number;
  variant: BookingLayoutVariant;
  appTheme: AppTheme;
};

export function ProgressBar({ activeIndex, variant, appTheme }: Props) {
  const track =
    variant === 'landing' ? landingBrand.progressTrack : appTheme.colors.contrast;
  const active = variant === 'landing' ? landingBrand.progressActive : appTheme.colors.text;

  return (
    <View style={styles.progressRow}>
      {Array.from({ length: BOOKING_FLOW_STEPS }, (_, i) => (
        <View
          key={i}
          style={[
            styles.progressSegment,
            { backgroundColor: i <= activeIndex ? active : track },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
});
