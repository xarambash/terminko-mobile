// import { SairaStencilOne_400Regular, useFonts } from '@expo-google-fonts/saira-stencil-one';
// import { Raleway_400Regular, useFonts } from '@expo-google-fonts/raleway';
// import { useFonts, Inconsolata_400Regular } from '@expo-google-fonts/inconsolata';
// import { useFonts, OpenSans_400Regular } from '@expo-google-fonts/open-sans';
import { CormorantGaramond_400Regular } from '@expo-google-fonts/cormorant-garamond';
import { Dongle_400Regular, Dongle_700Bold } from '@expo-google-fonts/dongle';
import { Explora_400Regular } from '@expo-google-fonts/explora';
import { MontserratAlternates_400Regular } from '@expo-google-fonts/montserrat-alternates';
import { Shizuru_400Regular } from '@expo-google-fonts/shizuru';
import { Ubuntu_400Regular, useFonts } from '@expo-google-fonts/ubuntu';

import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
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
      {/* Before navigator so nested screens (e.g. Landing) can override StatusBar */}
      <StatusBar style={mode === 'light' ? 'dark' : 'light'} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Ubuntu_400Regular,
    Shizuru_400Regular,
    MontserratAlternates_400Regular,
    Explora_400Regular,
    Dongle_400Regular,
    Dongle_700Bold,
    CormorantGaramond_400Regular,
  });

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

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
