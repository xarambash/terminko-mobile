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
 * Dark hero / landing palette from Figma (node 5:2 — Terminko mocks).
 * Rest of the app keeps `lightTheme`; use this only on the landing flow.
 */
export const landingBrand = {
  background: '#0f0d0b',
  title: '#f2e8d9',
  subtitle: '#9c8e7e',
  primaryFill: '#d4bc94',
  primaryLabel: '#0f0d0b',
  outlineBorder: '#9c8e7e',
  outlineLabel: '#f2e8d9',
  accentLine: '#c4a574',
  ornament: '#c4a574',
  /** Provider list (Figma node 6:34) */
  cardSurface: '#1a1816',
  cardBorder: '#2c2620',
  progressTrack: '#2c2620',
  progressActive: '#c9995a',
  initialsGold: '#c9995a',
  avatarRing: '#c9995a',
  backButtonBg: '#1a1816',
  /** Small uppercase label on service screen (Figma 10:65). */
  metaLabel: '#5c5248',
} as const;

/**
 * Single source for app typography. Change here + `useFonts` in App.tsx if you switch fonts.
 */
export const FONT_FAMILY_TITLE = 'MontserratAlternates_400Regular' as const;
export const FONT_FAMILY_BODY = 'Ubuntu_400Regular' as const;
/** Figma “Ana salon” script — Explora */
export const FONT_FAMILY_DISPLAY = 'Explora_400Regular' as const;
/** Figma UI copy — Dongle */
export const FONT_FAMILY_UI = 'Dongle_400Regular' as const;
export const FONT_FAMILY_UI_BOLD = 'Dongle_700Bold' as const;
/** Avatar initials on dark cards — Cormorant Garamond (Figma 6:34) */
export const FONT_FAMILY_INITIALS = 'CormorantGaramond_400Regular' as const;

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
