import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    MuseoSansCyrl_100: require('../assets/fonts/MuseoSansCyrl_100.otf'),
    MuseoSansCyrl_300: require('../assets/fonts/MuseoSansCyrl_300.otf'),
    MuseoSansCyrl_500: require('../assets/fonts/MuseoSansCyrl_500.otf'),
    MuseoSansCyrl_700: require('../assets/fonts/MuseoSansCyrl_700.otf'),
    MuseoSansCyrl_900: require('../assets/fonts/MuseoSansCyrl_900.otf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
