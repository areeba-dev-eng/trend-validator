// App.js  (MODIFIED)
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import SplashScreen   from './src/screens/SplashScreen';
import AuthNavigator  from './src/navigation/AuthNavigator';
import RootNavigator  from './src/navigation/RootNavigator';
import WelcomeModal   from './src/components/WelcomeModal';
import { navTheme }   from './src/theme/navTheme';
import { colors }     from './src/theme';

function AppContent() {
  const { user, loading, showWelcome, welcomeName, dismissWelcome } = useAuth();

  /* Show splash while Firebase checks persisted session */
  if (loading) return <SplashScreen />;

  return (
    <View style={styles.root}>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
      {user ? <RootNavigator /> : <AuthNavigator />}
      </NavigationContainer>

      {/* Welcome popup rendered above navigation */}
      {user && showWelcome && (
        <WelcomeModal name={welcomeName} onDismiss={dismissWelcome} />
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});