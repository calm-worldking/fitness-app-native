import { Stack } from 'expo-router';

export default function GymIdLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="booking/index" 
        options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }} 
      />
    </Stack>
  );
}
