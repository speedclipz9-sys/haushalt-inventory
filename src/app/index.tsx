import { useCallback, useContext, useState, type Context } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import AppDashboard from '../components/app-dashboard';
import IntroScreen from '../components/intro-screen';

const { AuthScreen } = require('../SMART Vorrat/screens/AuthScreen');
const { HouseholdSetupScreen } = require('../SMART Vorrat/screens/screens/HouseholdSetupScreen');
const { AuthContext } = require('../SMART Vorrat/AuthContext');
const { HouseholdContext } = require('../HouseholdContext');

export default function HomeScreen() {
  const [showIntro, setShowIntro] = useState(true);
  const finishIntro = useCallback(() => setShowIntro(false), []);
  const { user, loading: authLoading } = useContext(AuthContext as Context<any>);
  const { currentHousehold, loading: householdLoading } = useContext(
    HouseholdContext as Context<any>
  );
  const inviteHouseholdId =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('householdId') || ''
      : '';

  if (showIntro) return <IntroScreen onFinished={finishIntro} />;

  if (authLoading || householdLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Haushalt Inventory wird geladen...</Text>
      </View>
    );
  }
  if (!user) return <AuthScreen />;
  if (!currentHousehold) return <HouseholdSetupScreen initialHouseholdId={inviteHouseholdId} />;
  return <AppDashboard />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#333',
    fontSize: 16,
  },
});
