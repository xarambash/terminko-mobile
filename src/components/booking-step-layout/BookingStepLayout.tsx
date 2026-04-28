import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { Edge } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';

import { landingBrand } from '../../theme/theme';
import { useAppTheme } from '../../theme/ThemeProvider';
import { ShellHeader } from './ShellHeader';
import type { BookingLayoutVariant, ShellMode } from './types';

export type { BookingLayoutVariant, ShellMode };

type Props = {
  activeStep: number;
  onBack: () => void;
  backAccessibilityLabel: string;
  children: ReactNode;
  variant: BookingLayoutVariant;
  /**
   * Large title (landing) or page heading (app). Omitted: only back + progress at top.
   */
  pageTitle?: string;
  /** Optional block between page title and main `children` (e.g. selection summary). */
  summary?: ReactNode;
  /**
   * `full` — back, progress, optional `pageTitle`.
   * `backOnly` — only back (e.g. missing config on provider step).
   * `none` — no top chrome (e.g. full-screen loading).
   */
  shellMode?: ShellMode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  safeAreaEdges?: Edge[];
};

/**
 * Shared shell for the booking flow: back, progress, optional page title, optional summary, scroll body.
 * Use `variant="landing"` for the provider list (dark hero). Use `variant="app"` for the rest of the flow.
 */
export function BookingStepLayout({
  activeStep,
  onBack,
  backAccessibilityLabel,
  children,
  variant,
  pageTitle,
  summary,
  shellMode = 'full',
  contentContainerStyle,
  safeAreaEdges = ['top', 'left', 'right'],
}: Props) {
  const { theme: appTheme } = useAppTheme();
  const bg = variant === 'landing' ? landingBrand.background : appTheme.colors.background;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={safeAreaEdges}>
      {variant === 'landing' ? (
        <StatusBar style="light" />
      ) : (
        <StatusBar style={appTheme.mode === 'dark' ? 'light' : 'dark'} />
      )}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
      >
        <ShellHeader
          shellMode={shellMode}
          variant={variant}
          onBack={onBack}
          backLabel={backAccessibilityLabel}
          activeStep={activeStep}
          appTheme={appTheme}
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
