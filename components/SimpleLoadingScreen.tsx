import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from './ThemedText';
import { BirgeGoLogo } from './BirgeGoLogo';

// Брендовые цвета BIRGE GO
const PRIMARY = '#FF6246';
const TEXT_MUTED = '#737373';

interface SimpleLoadingScreenProps {
  message?: string;
}

export function SimpleLoadingScreen({ 
  message = 'Загрузка...' 
}: SimpleLoadingScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <BirgeGoLogo 
          width={120} 
          height={36} 
          variant="primary"
        />
      </View>
      <ActivityIndicator size="large" color={PRIMARY} />
      <ThemedText style={styles.message}>{message}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
