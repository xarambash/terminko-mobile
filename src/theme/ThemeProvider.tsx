import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { darkTheme, lightTheme, type AppTheme, type ThemeMode } from './theme';

type ThemeContextValue = {
  mode: ThemeMode;
  theme: AppTheme;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export function AppThemeProvider({ children }: Props) {
  // Product decision: default theme is always light for now.
  const [mode, setMode] = useState<ThemeMode>('light');

  const value = useMemo<ThemeContextValue>(() => {
    return {
      mode,
      theme: mode === 'light' ? lightTheme : darkTheme,
      setMode,
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return context;
}
