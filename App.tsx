import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { useStore } from './src/store/useStore';

export default function App() {
  const { setInitialData, dailyLogs } = useStore();

  useEffect(() => {
    // Check if we have any logs, if not, populate with mock data for demonstration
    if (Object.keys(dailyLogs).length === 0) {
      setInitialData();
    }
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
