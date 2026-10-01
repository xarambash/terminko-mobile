export type TimeSlotItem = {
  startAt: string;
  endAt: string;
  label: string;
};

export type TimeSlotGridProps = {
  slots: TimeSlotItem[];
  selectedStartAt: string | null;
  selectedEndAt: string | null;
  onSelect: (startAt: string, endAt: string) => void;
  getAccessibilityLabel?: (label: string) => string;
  columns?: number;
};

export type TimeSlotProps = {
  label: string;
  selected: boolean;
  width: number;
  onPress: () => void;
  accessibilityLabel?: string;
};
