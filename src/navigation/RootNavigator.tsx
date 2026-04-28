import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BookingFormScreen } from '../screens/BookingFormScreen';
import { CancelAppointmentScreen } from '../screens/CancelAppointmentScreen';
import { ConfirmationScreen } from '../screens/ConfirmationScreen';
import { LandingScreen } from '../screens/LandingScreen';
import { ResourceSelectScreen } from '../screens/ResourceSelectScreen';
import { ServiceSelectScreen } from '../screens/ServiceSelectScreen';
import { SlotSelectScreen } from '../screens/SlotSelectScreen';
import { FONT_FAMILY_BODY, landingBrand } from '../theme/theme';
import { useAppTheme } from '../theme/ThemeProvider';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { theme } = useAppTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { color: theme.colors.text, fontFamily: FONT_FAMILY_BODY },
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'none',
          gestureEnabled: false,
        }}
      > 
        <Stack.Screen
          name="Landing"
          component={LandingScreen}
          options={{
            title: '',
            headerShown: false,
            contentStyle: { backgroundColor: landingBrand.background },
          }}
        />
        <Stack.Screen
          name="ResourceSelect"
          component={ResourceSelectScreen}
          options={{
            title: '',
            headerShown: false,
            contentStyle: { backgroundColor: landingBrand.background },
          }}
        />
        <Stack.Screen
          name="ServiceSelect"
          component={ServiceSelectScreen}
          options={{ title: '', headerShown: false }}
        />
        <Stack.Screen
          name="SlotSelect"
          component={SlotSelectScreen}
          options={{ title: '', headerShown: false }}
        />
        <Stack.Screen
          name="BookingForm"
          component={BookingFormScreen}
          options={{ title: '', headerShown: false }}
        />
        <Stack.Screen
          name="Confirmation"
          component={ConfirmationScreen}
          options={{ title: '', headerShown: false }}
        />
        <Stack.Screen
          name="CancelAppointment"
          component={CancelAppointmentScreen}
          options={{
            title: '',
            headerBackButtonDisplayMode: 'minimal',
            headerBackTitle: '',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
