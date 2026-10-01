import { Pressable, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import type { TimeSlotProps } from './types';

export function TimeSlot({ label, selected, width, onPress, accessibilityLabel }: TimeSlotProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.tile,
        {
          width,
          borderColor: selected ? theme.colors.primary : theme.colors.outline,
          backgroundColor: selected ? theme.colors.primaryContainer : 'transparent',
        },
      ]}
    >
      <Text
        variant="bodySmall"
        numberOfLines={1}
        style={{
          color: selected ? theme.colors.onPrimaryContainer : theme.colors.onSurface,
          fontWeight: selected ? '600' : '400',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    height: 34,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
});
