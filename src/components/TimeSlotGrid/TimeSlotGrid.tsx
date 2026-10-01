import { useCallback, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { TimeSlot } from './TimeSlot';
import type { TimeSlotGridProps } from './types';

const GAP = 8;

export function TimeSlotGrid({
  slots,
  selectedStartAt,
  selectedEndAt,
  onSelect,
  getAccessibilityLabel,
  columns = 3,
}: TimeSlotGridProps) {
  const [containerWidth, setContainerWidth] = useState(0);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  }, []);

  const tileWidth = containerWidth > 0 ? (containerWidth - GAP * (columns - 1)) / columns : 0;

  return (
    <View style={styles.grid} onLayout={onLayout}>
      {tileWidth > 0 &&
        slots.map((slot, index) => {
          const selected = slot.startAt === selectedStartAt && slot.endAt === selectedEndAt;
          return (
            <TimeSlot
              key={`${slot.startAt}-${slot.endAt}-${index}`}
              label={slot.label}
              selected={selected}
              width={tileWidth}
              onPress={() => onSelect(slot.startAt, slot.endAt)}
              accessibilityLabel={getAccessibilityLabel?.(slot.label)}
            />
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
});
