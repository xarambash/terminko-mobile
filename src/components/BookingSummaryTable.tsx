import { StyleSheet, Text, View } from 'react-native';

import { FONT_FAMILY_UI, landingBrand } from '../theme/theme';

export type SummaryTableRow = { label: string; value: string };

type Props = { rows: SummaryTableRow[]; marginBottom?: number };

/**
 * Figma: booking summary (label / value, hairlines) on dark `landingBrand` surface.
 * Used on booking form and confirmation.
 */
export function BookingSummaryTable({ rows, marginBottom = 0 }: Props) {
  if (rows.length === 0) return null;
  return (
    <View style={[styles.card, { marginBottom }]}>
      {rows.map((row, index) => (
        <View key={`${row.label}-${index}`}>
          {index > 0 ? <View style={styles.hairline} /> : null}
          <View style={styles.row}>
            <Text style={styles.label} numberOfLines={2}>
              {row.label}
            </Text>
            <Text style={styles.value} numberOfLines={3}>
              {row.value}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    backgroundColor: landingBrand.cardSurface,
    borderWidth: 1,
    borderColor: landingBrand.cardBorder,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  hairline: { height: StyleSheet.hairlineWidth, backgroundColor: landingBrand.cardBorder },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
  },
  label: {
    fontFamily: FONT_FAMILY_UI,
    fontSize: 20,
    lineHeight: 24,
    color: landingBrand.metaLabel,
    flexShrink: 0,
  },
  value: {
    flex: 1,
    textAlign: 'right',
    fontFamily: FONT_FAMILY_UI,
    fontSize: 20,
    lineHeight: 24,
    color: landingBrand.title,
  },
});
