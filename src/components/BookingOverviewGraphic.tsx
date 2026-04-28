import { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import bookingAvatarPlaceholder from '../../assets/profile-pic.jpeg';
import { FONT_FAMILY_UI, FONT_FAMILY_UI_BOLD, landingBrand } from '../theme/theme';
import {
  BOOKING_AVATAR_TREE_GAP,
  BOOKING_GRAPH_ACCENT,
  BOOKING_HLINE_END_INSET,
  BOOKING_TIMELINE_NODE_OUTER,
  BOOKING_TIMELINE_NODE_OUTER_R,
  BOOKING_TIMELINE_RAIL_INSET_H,
} from '../utils/constants';

export type BookingOverviewRow = { label: string; value: string; valueAccent?: 'gold' };

function TimelineNode() {
  return (
    <View style={graphicStyles.nodeOuter}>
      <View style={graphicStyles.nodeRing} />
      <View style={graphicStyles.nodeCore} />
    </View>
  );
}

type Props = {
  rows: BookingOverviewRow[];
  providerFullName: string;
};

export function BookingOverviewGraphic({ rows, providerFullName }: Props) {
  const { t } = useTranslation();
  const [railW, setRailW] = useState(0);
  const [firstStackW, setFirstStackW] = useState<number | null>(null);
  const [lastStackW, setLastStackW] = useState<number | null>(null);

  const lineGeom = useMemo(() => {
    if (railW <= 0) return null;
    const n = rows.length;
    if (n <= 1) {
      const cx = railW / 2;
      return {
        centers: [cx],
        hLineLeft: cx - BOOKING_TIMELINE_NODE_OUTER_R + BOOKING_HLINE_END_INSET,
        hLineWidth: BOOKING_TIMELINE_NODE_OUTER - 2 * BOOKING_HLINE_END_INSET,
      };
    }
    if (firstStackW == null || lastStackW == null) return null;
    const L = firstStackW / 2;
    const R = railW - lastStackW / 2;
    const centers = rows.map((_, i) => L + (i / (n - 1)) * (R - L));
    return {
      centers,
      hLineLeft: L - BOOKING_TIMELINE_NODE_OUTER_R + BOOKING_HLINE_END_INSET,
      hLineWidth: R - L + BOOKING_TIMELINE_NODE_OUTER - 2 * BOOKING_HLINE_END_INSET,
    };
  }, [railW, firstStackW, lastStackW, rows]);

  if (rows.length === 0) return null;
  const nameLine = providerFullName.trim();
  return (
    <View style={graphicStyles.root} accessibilityLabel="Booking overview">
      <View style={graphicStyles.avatarWrap}>
        <View style={graphicStyles.avatarShell}>
          <View
            style={graphicStyles.avatarInner}
            accessibilityLabel={t('resourceSelect.title')}
          >
            <Image
              source={bookingAvatarPlaceholder}
              style={graphicStyles.avatarPhoto}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
          </View>
        </View>
        {nameLine ? (
          <>
            <Text style={graphicStyles.providerName} numberOfLines={2}>
              {nameLine}
            </Text>
            <Text style={graphicStyles.providerRole}>berber</Text>
          </>
        ) : null}
        <View style={graphicStyles.avatarStemWrap} pointerEvents="none">
          <View style={graphicStyles.avatarStemTick} />
        </View>
      </View>
      <View style={graphicStyles.timelineShell}>
        <View
          style={graphicStyles.railBounds}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            if (w > 0) setRailW(w);
          }}
        >
          <View
            style={[
              graphicStyles.hLineTrack,
              lineGeom != null
                ? { left: lineGeom.hLineLeft, width: lineGeom.hLineWidth }
                : graphicStyles.hLineFullSpan,
            ]}
          />
          <View style={graphicStyles.timelineCanvas}>
            {rows.map((row, index) => {
              const total = rows.length;
              const single = total <= 1;
              const isFirst = !single && index === 0;
              const isLast = !single && index === total - 1;
              const isMiddle = !single && !isFirst && !isLast;

              const centerX =
                lineGeom != null
                  ? lineGeom.centers[index]!
                  : total <= 1
                    ? undefined
                    : (index / (total - 1)) * (railW > 0 ? railW : 1);

              const colPositionStyle =
                lineGeom != null || (total > 1 && railW > 0)
                  ? {
                      left: centerX!,
                      transform: [{ translateX: '-50%' }] as const,
                    }
                  : undefined;

              return (
                <View
                  key={`col-${index}-${row.value}`}
                  style={[
                    graphicStyles.timelineColAbs,
                    single && graphicStyles.timelineColSingle,
                    isFirst && graphicStyles.timelineColEdge,
                    isMiddle && graphicStyles.timelineColMiddleAbs,
                    isLast && graphicStyles.timelineColEdge,
                    colPositionStyle,
                  ]}
                >
                  <View style={graphicStyles.nodeTickStack}>
                    <View style={graphicStyles.anchorRail}>
                      <View style={graphicStyles.nodeOnLineWrap}>
                        <TimelineNode />
                      </View>
                    </View>
                    <View style={graphicStyles.tickDown} />
                  </View>
                  <View
                    onLayout={
                      isFirst
                        ? (e) => {
                            const w = e.nativeEvent.layout.width;
                            if (w > 0) setFirstStackW(w);
                          }
                        : isLast
                          ? (e) => {
                              const w = e.nativeEvent.layout.width;
                              if (w > 0) setLastStackW(w);
                            }
                          : undefined
                    }
                    style={
                      isFirst
                        ? graphicStyles.labelValueStackLeading
                        : isLast
                          ? graphicStyles.labelValueStackTrailing
                          : graphicStyles.labelValueStackCenter
                    }
                  >
                    <Text
                      style={[
                        graphicStyles.nodeLabel,
                        isFirst && graphicStyles.nodeLabelAlignStart,
                        isLast && graphicStyles.nodeLabelAlignEnd,
                      ]}
                      numberOfLines={2}
                    >
                      {row.label}
                    </Text>
                    <Text
                      style={[
                        row.valueAccent === 'gold' ? graphicStyles.valueGold : graphicStyles.value,
                        isFirst && graphicStyles.valueAlignStart,
                        isLast && graphicStyles.valueAlignEnd,
                      ]}
                      numberOfLines={3}
                    >
                      {row.value}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const graphicStyles = StyleSheet.create({
  root: {
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: -10,
    paddingHorizontal: 0,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: 0,
    marginTop: 20,
  },
  /** Same 1px treatment as `tickDown` under timeline nodes; fills `BOOKING_AVATAR_TREE_GAP`. */
  avatarStemWrap: {
    width: '100%',
    height: BOOKING_AVATAR_TREE_GAP,
    alignItems: 'center',
    position: 'relative',
    top: 10,
  },
  avatarStemTick: {
    width: 1,
    height: BOOKING_AVATAR_TREE_GAP,
    backgroundColor: 'rgba(196, 165, 116, 0.55)',
    opacity: 0.9,
  },
  avatarShell: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    borderStyle: 'solid',
    borderColor: landingBrand.avatarRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: landingBrand.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarPhoto: {
    width: 80,
    height: 80,
    borderRadius: 50,
  },
  providerName: {
    fontFamily: FONT_FAMILY_UI_BOLD,
    fontSize: 30,
    lineHeight: 30,
    marginTop: 5,
    color: landingBrand.title,
    textAlign: 'center',
    letterSpacing: 0.3,
    maxWidth: '92%',
  },
  providerRole: {
    fontFamily: FONT_FAMILY_UI_BOLD,
    fontSize: 15,
    lineHeight: 20,
    marginTop: 0,
    fontStyle: 'italic',
    color: landingBrand.avatarRing,
    textAlign: 'center',
  },
  /** Field caption directly above each column value (below tick). */
  nodeLabel: {
    fontFamily: FONT_FAMILY_UI,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.4,
    marginTop: 8,
    color: landingBrand.metaLabel,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  nodeLabelAlignStart: {
    textAlign: 'left',
  },
  nodeLabelAlignEnd: {
    textAlign: 'right',
  },
  valueAlignStart: {
    textAlign: 'left',
  },
  valueAlignEnd: {
    textAlign: 'right',
  },
  timelineShell: {
    position: 'relative',
    alignSelf: 'stretch',
    width: '100%',
    minHeight: 140,
    marginBottom: 4,
  },
  railBounds: {
    position: 'relative',
    marginHorizontal: BOOKING_TIMELINE_RAIL_INSET_H,
    minHeight: 140,
  },
  /** Horizontal segment from first node’s left edge to last node’s right edge (see `lineGeom`). */
  hLineTrack: {
    position: 'absolute',
    top: 21,
    height: 1,
    backgroundColor: BOOKING_GRAPH_ACCENT,
    zIndex: 0,
    opacity: 0.4,
  },
  hLineFullSpan: {
    left: 0,
    right: 0,
  },
  timelineCanvas: {
    position: 'relative',
    width: '100%',
    minHeight: 140,
    zIndex: 1,
  },
  timelineColAbs: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    zIndex: 1,
    maxWidth: '34%',
  },
  timelineColSingle: {
    maxWidth: '88%',
  },
  timelineColEdge: {
    flexShrink: 1,
  },
  timelineColMiddleAbs: {
    maxWidth: '38%',
  },
  nodeTickStack: {
    alignItems: 'center',
  },
  labelValueStackLeading: {
    alignItems: 'flex-start',
  },
  labelValueStackTrailing: {
    alignItems: 'flex-end',
  },
  labelValueStackCenter: {
    alignItems: 'center',
  },
  anchorRail: {
    height: 30,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  nodeOnLineWrap: {
    marginTop: 14,
  },
  nodeOuter: {
    width: 16,
    height: 16,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Semi-transparent outer ring (mock: dot inside a soft ring). */
  nodeRing: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(201, 153, 90, 0.45)',
    backgroundColor: 'rgba(201, 153, 90, 0.12)',
  },
  nodeCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BOOKING_GRAPH_ACCENT,
    zIndex: 1,
  },
  tickDown: {
    width: 1,
    height: 20,
    marginTop: 4,
    backgroundColor: 'rgba(196, 165, 116, 0.55)',
    opacity: 0.9,
  },
  value: {
    fontFamily: FONT_FAMILY_UI_BOLD,
    fontSize: 22,
    lineHeight: 20,
    marginTop: 0,
    color: landingBrand.title,
    textAlign: 'center',
  },
  valueGold: {
    fontFamily: FONT_FAMILY_UI_BOLD,
    fontSize: 22,
    lineHeight: 20,
    marginTop: 0,
    color: landingBrand.progressActive,
    textAlign: 'center',
  },
});
