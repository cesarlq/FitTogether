import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';
import { useStore } from './src/store/useStore';
import { supabase } from './src/services/supabase';
import { COLORS } from './src/constants/theme';
import { Session } from '@supabase/supabase-js';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { initialize, isInitialized, isLoading, setInitialData, dailyLogs, cleanup } = useStore();

  // Listen to auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        // Logged out — reset local state
        cleanup();
      }
    });

    return () => {
      subscription.unsubscribe();
      cleanup();
    };
  }, []);

  // Initialize store when we have a session
  useEffect(() => {
    if (session) {
      initialize();
    }
  }, [session]);

  // Seed demo data once initialized
  useEffect(() => {
    if (isInitialized && Object.keys(dailyLogs).length === 0) {
      setInitialData();
    }
  }, [isInitialized]);

  // Loading auth
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Not logged in → show Login
  if (!session) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <LoginScreen />
      </SafeAreaProvider>
    );
  }

  // Loading Supabase data
  if (isLoading && !isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando FitTogether...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.slate500,
  },
});
