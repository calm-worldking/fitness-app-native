import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { ThemedText } from './ThemedText';
import { BirgeGoLogo } from './BirgeGoLogo';

const { width: screenWidth } = Dimensions.get('window');

// Брендовые цвета BIRGE GO
const PRIMARY = '#FF6246';
const SECONDARY = '#FF8843';
const BG = '#FFE7D8';
const CARD_BG = '#FFFFFF';
const DARK_ORANGE = '#E55A3A'; // Тёмно-оранжевый фон

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

export function LoadingScreen({ 
  message = 'Загрузка...', 
  showLogo = true 
}: LoadingScreenProps) {
  const slideValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Анимация появления
    const slideAnimation = Animated.timing(slideValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    });

    // Анимация масштабирования
    const scaleAnimation = Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);

    // Анимация прозрачности
    const opacityAnimation = Animated.timing(opacityValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    });

    // Анимация пульсации логотипа
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    slideAnimation.start();
    scaleAnimation.start();
    opacityAnimation.start();
    pulseAnimation.start();

    return () => {
      slideAnimation.stop();
      scaleAnimation.stop();
      opacityAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  const slideY = slideValue.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  const opacity = opacityValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            transform: [{ translateY: slideY }, { scale: scaleValue }],
            opacity,
          }
        ]}
      >
        {/* Красивая эмблемка BIRGE GO */}
        {showLogo && (
          <View style={styles.logoContainer}>
            <Animated.View 
              style={[
                styles.logoWrapper,
                {
                  transform: [{ scale: pulseValue }],
                }
              ]}
            >
              <BirgeGoLogo 
                width={280} 
                height={85} 
                variant="white"
              />
            </Animated.View>
          </View>
        )}

        {/* Сообщение */}
        <ThemedText style={styles.message}>{message}</ThemedText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  message: {
    fontSize: 18,
    color: CARD_BG,
    textAlign: 'center',
    fontWeight: '600',
    opacity: 0.9,
  },
}); 