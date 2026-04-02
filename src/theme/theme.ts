export type ThemeMode = 'light' | 'dark';

export type AppTheme = {
  mode: ThemeMode;
  colors: {
    background: string;
    surface: string;
    surfaceMuted: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    primary: string;
    secondary: string;
    onPrimary: string;
    success: string;
    error: string;
    warning: string;
    info: string;
  };
};

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    background: '#9B8EC7',
    surface: '#FFFFFF',
    surfaceMuted: '#EEE5DA',
    border: '#D4C8B8',
    textPrimary: '#000000',
    textSecondary: '#4B4B4B',
    primary: '#F2EAE0',
    secondary: '#F2EAE0',
    onPrimary: '#000000',
    success: '#1A7F37',
    error: '#B00020',
    warning: '#9A6700',
    info: '#5A4FA3',
  },
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    background: '#141218',
    surface: '#1E1B24',
    surfaceMuted: '#2B2733',
    border: '#4A4357',
    textPrimary: '#F5F2FA',
    textSecondary: '#C9C3D6',
    primary: '#B7A8E7',
    secondary: '#2C2538',
    onPrimary: '#120F19',
    success: '#61D394',
    error: '#FF8A99',
    warning: '#F1C27A',
    info: '#B7A8E7',
  },
};
