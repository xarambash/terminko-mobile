export type ThemeMode = 'light' | 'dark';

export type ThemeColors = {
  /** Screen + navigation background */
  background: string;
  /** Cards, inputs, primary buttons, calendar body */
  contrast: string;
  /** Labels, body text, icons */
  headingColor: string;
  text: string;
  /** Validation and error messages */
  error: string;
};

/**
 * Single source for app typography. Change here + `useFonts` in App.tsx if you switch fonts.
 * Must match the key passed to `useFonts` from @expo-google-fonts/saira-stencil-one.
 */
export const FONT_FAMILY_TITLE = 'MontserratAlternates_400Regular' as const;
export const FONT_FAMILY_BODY = 'Ubuntu_400Regular' as const;

export type ThemeFonts = {
  body: typeof FONT_FAMILY_BODY;
};

export type AppTheme = {
  mode: ThemeMode;
  colors: ThemeColors;
  fonts: ThemeFonts;
};

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    background: '#F7F6E5',
    contrast: '#F3E3D0',
    headingColor: '#281C59',
    text: '#4B2E2B',
    error: '#F0f0f0',
  },
  fonts: { body: FONT_FAMILY_BODY },
};

/** Placeholder palette for dark mode — refine later. */
export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    background: '#281C59',
    contrast: '#D97A2B',
    headingColor: '#281C59',
    text: '#000000',
    error: '#FF8A95',
  },
  fonts: { body: FONT_FAMILY_BODY },
};
