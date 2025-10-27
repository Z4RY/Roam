import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          
         <Stack.Screen name="(onboarding)/onboarding" options={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 200,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            presentation: 'card',
            animationTypeForReplace: 'push',
          }}  />
          <Stack.Screen name="(auth)/login" options={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 200,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            presentation: 'card',
            animationTypeForReplace: 'push',
          }}  />
          <Stack.Screen name="(tabs)" options={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 200,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            presentation: 'card',
            animationTypeForReplace: 'push',
          }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
