import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { Edge } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';

import { ShellHeader } from './ShellHeader';
import type { ShellMode } from './types';

export type { ShellMode };

type Props = {
  activeStep: number;
  onBack: () => void;
  backAccessibilityLabel: string;
  children: ReactNode;
  pageTitle?: string;
  summary?: ReactNode;
  shellMode?: ShellMode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  safeAreaEdges?: Edge[];
};

export function BookingStepLayout({
  activeStep,
  onBack,
  backAccessibilityLabel,
  children,
  pageTitle,
  summary,
  shellMode = 'full',
  contentContainerStyle,
  safeAreaEdges = ['top', 'left', 'right'],
}: Props) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={safeAreaEdges}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
      >
        <ShellHeader
          shellMode={shellMode}
          onBack={onBack}
          backLabel={backAccessibilityLabel}
          activeStep={activeStep}
          pageTitle={pageTitle}
        />
        {summary}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
});
