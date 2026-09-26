import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

const { AuthProvider } = require('../../../SMART Vorrat/AuthContext');
const { HouseholdProvider } = require('../../../HouseholdContext');

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <HouseholdProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </HouseholdProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
