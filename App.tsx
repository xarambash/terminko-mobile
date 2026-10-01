import { Explora_400Regular, useFonts } from '@expo-google-fonts/explora';

import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, useTheme } from 'react-native-paper';

import './src/i18n';
import { RootNavigator } from './src/navigation/RootNavigator';
import { store } from './src/store';
import { paperLightTheme } from './src/theme/paperTheme';

function AppShell() {
  const theme = useTheme();
  return (
    <>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ Explora_400Regular });

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <PaperProvider theme={paperLightTheme}>
          <AppShell />
        </PaperProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
