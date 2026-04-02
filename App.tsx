import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import './src/i18n';
import { RootNavigator } from './src/navigation/RootNavigator';
import { store } from './src/store';
import { AppThemeProvider, useAppTheme } from './src/theme/ThemeProvider';

function AppShell() {
  const { mode } = useAppTheme();

  return (
    <>
      <RootNavigator />
      <StatusBar style={mode === 'light' ? 'dark' : 'light'} />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppThemeProvider>
          <AppShell />
        </AppThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
