import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import DayDetailScreen from '../screens/DayDetailScreen';
import LogMealScreen from '../screens/LogMealScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import { COLORS } from '../constants/theme';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen
        name="DayDetail"
        component={DayDetailScreen}
        options={{
          headerShown: true,
          title: 'Detalle del Día',
          headerTintColor: COLORS.slate900,
        }}
      />
      <Stack.Screen
        name="EditMeal"
        component={LogMealScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerShown: true,
          title: 'Editar Perfil',
          headerTintColor: COLORS.slate900,
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
