import { StyleSheet, Text, View } from 'react-native';

import { AppText } from '../AppText';
import { bookingSummaryStyles } from '../../styles/bookingSummaryStyles';
import { FONT_FAMILY_UI, landingBrand, type AppTheme } from '../../theme/theme';
import { BackButton } from './BackButton';
import { ProgressBar } from './ProgressBar';
import type { BookingLayoutVariant, ShellMode } from './types';

type Props = {
  shellMode: ShellMode;
  variant: BookingLayoutVariant;
  onBack: () => void;
  backLabel: string;
  activeStep: number;
  appTheme: AppTheme;
  pageTitle?: string;
};

export function ShellHeader({
  shellMode,
  variant,
  onBack,
  backLabel,
  activeStep,
  appTheme,
  pageTitle,
}: Props) {
  if (shellMode === 'none') return null;
  if (shellMode === 'backOnly') {
    return (
      <View style={styles.headerRow}>
        <BackButton onPress={onBack} label={backLabel} variant={variant} appTheme={appTheme} />
      </View>
    );
  }
  return (
    <View style={styles.headerContainer}>
      <ProgressBar activeIndex={activeStep} variant={variant} appTheme={appTheme} />
      <View style={styles.headerRow}>
        <BackButton onPress={onBack} label={backLabel} variant={variant} appTheme={appTheme} />
        {pageTitle && variant === 'landing' ? (
          <Text style={[styles.landingPageTitle, styles.titleInRow]} numberOfLines={3}>
            {pageTitle}
          </Text>
        ) : null}
        {pageTitle && variant === 'app' ? (
          <AppText
            style={[
              bookingSummaryStyles.pageHeading,
              styles.titleInRow,
              styles.appTitleInRow,
              { color: appTheme.colors.text },
            ]}
            numberOfLines={2}
          >
            {pageTitle}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 22,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 44,
  },
  titleInRow: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  appTitleInRow: {
    marginBottom: 0,
  },
  landingPageTitle: {
    fontFamily: FONT_FAMILY_UI,
    fontSize: 32,
    lineHeight: 36,
    color: landingBrand.title,
  },
});
