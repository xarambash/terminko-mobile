import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BookingFormScreen } from '../screens/BookingFormScreen';
import { CancelAppointmentScreen } from '../screens/CancelAppointmentScreen';
import { ConfirmationScreen } from '../screens/ConfirmationScreen';
import { LandingScreen } from '../screens/LandingScreen';
import { ResourceSelectScreen } from '../screens/ResourceSelectScreen';
import { ServiceSelectScreen } from '../screens/ServiceSelectScreen';
import { SlotSelectScreen } from '../screens/SlotSelectScreen';
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
          headerTitleStyle: { color: theme.colors.text },
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'none',
          gestureEnabled: false,
        }}
      > 
        <Stack.Screen name="Landing" component={LandingScreen} options={{ title: '' }} />
        <Stack.Screen
          name="ResourceSelect"
          component={ResourceSelectScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="ServiceSelect"
          component={ServiceSelectScreen}
          options={{ title: '' }}
        />
        <Stack.Screen name="SlotSelect" component={SlotSelectScreen} options={{ title: '' }} />
        <Stack.Screen
          name="BookingForm"
          component={BookingFormScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="Confirmation"
          component={ConfirmationScreen}
          options={{ title: 'Done' }}
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
