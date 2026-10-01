import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { BackButton } from './BackButton';
import { ProgressBar } from './ProgressBar';
import type { ShellMode } from './types';

type Props = {
  shellMode: ShellMode;
  onBack: () => void;
  backLabel: string;
  activeStep: number;
  pageTitle?: string;
};

export function ShellHeader({ shellMode, onBack, backLabel, activeStep, pageTitle }: Props) {
  const theme = useTheme();

  if (shellMode === 'none') return null;

  if (shellMode === 'backOnly') {
    return (
      <View style={styles.headerRow}>
        <BackButton onPress={onBack} label={backLabel} />
      </View>
    );
  }

  return (
    <View style={styles.headerContainer}>
      <ProgressBar activeIndex={activeStep} />
      <View style={styles.headerRow}>
        <BackButton onPress={onBack} label={backLabel} />
        {pageTitle ? (
          <Text style={[styles.pageTitle, { color: theme.colors.onBackground }]} numberOfLines={2}>
            {pageTitle}
          </Text>
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
  pageTitle: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    fontSize: 22,
    lineHeight: 28,
  },
});
