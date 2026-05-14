import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { darkPalette, lightPalette } from '../src/theme/colors';

export default function RootLayout() {
  const scheme = useColorScheme();
  const t = scheme === 'dark' ? darkPalette : lightPalette;
  return (
    <SafeAreaProvider>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.surface },
          headerTitleStyle: { color: t.text, fontWeight: '600' },
          headerTintColor: t.accent,
          contentStyle: { backgroundColor: t.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="substance/[id]" options={{ title: '' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
