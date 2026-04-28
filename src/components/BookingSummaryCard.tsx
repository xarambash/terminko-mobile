import { View } from 'react-native';

import { AppText } from './AppText';
import { bookingSummaryStyles } from '../styles/bookingSummaryStyles';
import type { AppTheme } from '../theme/theme';

export type SummaryRow = { label: string; value: string };

type Props = {
  theme: AppTheme;
  rows: SummaryRow[];
  /** Default: label/value use `text`. Use `contrast` for post-booking emphasis. */
  valueTone?: 'text' | 'contrast';
  marginBottom?: number;
};

export function BookingSummaryCard({ theme, rows, valueTone = 'text', marginBottom }: Props) {
  const labelColor = valueTone === 'contrast' ? theme.colors.contrast : theme.colors.text;
  const valueColor = valueTone === 'contrast' ? theme.colors.contrast : theme.colors.text;

  if (rows.length === 0) return null;

  return (
    <View
      style={[
        bookingSummaryStyles.card,
        {
          backgroundColor: theme.colors.background,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.contrast,
          marginBottom: marginBottom ?? 0,
        },
      ]}
    >
      {rows.map((row, index) => (
        <View key={`${row.label}-${index}`} style={bookingSummaryStyles.block}>
          <AppText style={[bookingSummaryStyles.label, { color: labelColor }]}>{row.label}:</AppText>
          <AppText style={[bookingSummaryStyles.value, { color: valueColor }]}>{row.value}</AppText>
        </View>
      ))}
    </View>
  );
}
