import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ToastProvider } from '@/components/ui/Toast';
import { UnlockGate } from '@/components/security/UnlockGate';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <UnlockGate>
      <ToastProvider>
        <ThemeProvider value={DarkTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="add-card"
              options={{
                presentation: 'modal',
                headerShown: false,
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </ToastProvider>
    </UnlockGate>
  );
}
