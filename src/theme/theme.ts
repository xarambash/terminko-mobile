export type ThemeMode = 'light' | 'dark';

/** Three-color palette: screen chrome, surfaces, typography. */
export type ThemeColors = {
  /** Screen + navigation background */
  background: string;
  /** Cards, inputs, primary buttons, calendar body */
  contrast: string;
  /** Labels, body text, icons */
  text: string;
};

export type AppTheme = {
  mode: ThemeMode;
  colors: ThemeColors;
};

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    background: '#79AE6F',
    contrast: '#F2EDC2',
    text: '#000000',
  },
};

/** Placeholder palette for dark mode — refine later. */
export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    background: '#121212',
    contrast: '#1E1E1E',
    text: '#E8E8E8',
  },
};
