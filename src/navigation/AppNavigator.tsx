import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import DayDetailScreen from '../screens/DayDetailScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen
        name="DayDetail"
        component={DayDetailScreen}
        options={{ headerShown: true, title: 'Day Detail' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
