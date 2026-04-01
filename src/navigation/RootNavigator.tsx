import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AboutUsScreen } from '../screens/AboutUsScreen';
import { BookingFormScreen } from '../screens/BookingFormScreen';
import { CancelAppointmentScreen } from '../screens/CancelAppointmentScreen';
import { ConfirmationScreen } from '../screens/ConfirmationScreen';
import { LandingScreen } from '../screens/LandingScreen';
import { ReservationsScreen } from '../screens/ReservationsScreen';
import { ResourceSelectScreen } from '../screens/ResourceSelectScreen';
import { ServiceSelectScreen } from '../screens/ServiceSelectScreen';
import { SlotSelectScreen } from '../screens/SlotSelectScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="Landing" component={LandingScreen} options={{ title: 'Terminko' }} />
        <Stack.Screen
          name="ResourceSelect"
          component={ResourceSelectScreen}
          options={{ title: 'Resource' }}
        />
        <Stack.Screen
          name="ServiceSelect"
          component={ServiceSelectScreen}
          options={{ title: 'Service' }}
        />
        <Stack.Screen name="SlotSelect" component={SlotSelectScreen} options={{ title: 'Time' }} />
        <Stack.Screen
          name="BookingForm"
          component={BookingFormScreen}
          options={{ title: 'Details' }}
        />
        <Stack.Screen
          name="Confirmation"
          component={ConfirmationScreen}
          options={{ title: 'Done' }}
        />
        <Stack.Screen
          name="Reservations"
          component={ReservationsScreen}
          options={{ title: 'Appointments' }}
        />
        <Stack.Screen
          name="CancelAppointment"
          component={CancelAppointmentScreen}
          options={{ title: 'Cancel' }}
        />
        <Stack.Screen name="AboutUs" component={AboutUsScreen} options={{ title: 'About' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
