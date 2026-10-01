import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { BOOKING_FLOW_STEPS } from '../../constants/bookingFlow';

type Props = {
  activeIndex: number;
};

export function ProgressBar({ activeIndex }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.progressRow}>
      {Array.from({ length: BOOKING_FLOW_STEPS }, (_, i) => (
        <View
          key={i}
          style={[
            styles.progressSegment,
            { backgroundColor: i <= activeIndex ? theme.colors.primary : theme.colors.surfaceVariant },
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
