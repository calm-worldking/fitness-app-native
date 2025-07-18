import { Logo } from '@/components/Logo';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StatusBar,
    StyleSheet,
    View
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Брендовые цвета
const PRIMARY = '#FF6246';
const SECONDARY = '#FF8843';
const BG = '#FFE7D8';
const CARD_BG = '#FFFFFF';
const TEXT_DARK = '#000000';
const TEXT_MUTED = '#737373';

interface LoadingScreenProps {
  onFinish?: () => void;
}

export function LoadingScreen({ onFinish }: LoadingScreenProps) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      // Анимация появления логотипа
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Анимация текста
      setTimeout(() => {
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, 400);

      // Анимация прогресс-бара
      setTimeout(() => {
        Animated.timing(progressWidth, {
          toValue: 100,
          duration: 4000,
          useNativeDriver: false,
        }).start(() => {
          // Завершение загрузки
          setTimeout(() => {
            onFinish?.();
          }, 1000);
        });
      }, 800);
    };

    startAnimation();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={CARD_BG} barStyle="dark-content" />
      
      {/* Фоновое изображение */}
      <Image 
        source={require('@/assets/images/loading.jpg')} 
        style={styles.backgroundImage}
        contentFit="cover"
      />
      
      {/* Оверлей */}
      <View style={styles.overlay} />
      
      {/* Контент */}
      <View style={styles.content}>
        {/* Логотип */}
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }]
            }
          ]}
        >
          <Logo width={200} height={60} />
        </Animated.View>
        
        {/* Текст приветствия */}
        <Animated.View 
          style={[
            styles.textContainer,
            { opacity: textOpacity }
          ]}
        >
          <ThemedText type="heading2" style={styles.welcomeText}>
            Добро пожаловать в будущее фитнеса
          </ThemedText>
          <ThemedText style={styles.subtitleText}>
            Семейные тренировки, персональный подход, максимальный результат
          </ThemedText>
        </Animated.View>
        
        {/* Прогресс-бар */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  width: progressWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                }
              ]} 
            />
          </View>
          
          <Animated.View 
            style={[
              styles.loadingTextContainer,
              { opacity: textOpacity }
            ]}
          >
            <ThemedText style={styles.loadingText}>Загружаем для вас лучшее...</ThemedText>
          </Animated.View>
        </View>
        
        {/* Иконки функций */}
        <Animated.View 
          style={[
            styles.featuresContainer,
            { opacity: textOpacity }
          ]}
        >
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: PRIMARY + '20' }]}>
              <MaterialIcons name="family-restroom" size={24} color={PRIMARY} />
            </View>
            <ThemedText style={styles.featureText}>Семейная подписка</ThemedText>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: SECONDARY + '20' }]}>
              <MaterialIcons name="fitness-center" size={24} color={SECONDARY} />
            </View>
            <ThemedText style={styles.featureText}>Безлимитные тренировки</ThemedText>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: '#4CAF50' + '20' }]}>
              <MaterialIcons name="analytics" size={24} color="#4CAF50" />
            </View>
            <ThemedText style={styles.featureText}>Отслеживание прогресса</ThemedText>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CARD_BG,
  },
  backgroundImage: {
    position: 'absolute',
    width: screenWidth,
    height: screenHeight,
  },
  overlay: {
    position: 'absolute',
    width: screenWidth,
    height: screenHeight,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_DARK,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitleText: {
    fontSize: 16,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 24,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: BG,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: PRIMARY,
    borderRadius: 2,
  },
  loadingTextContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: TEXT_MUTED,
    textAlign: 'center',
    fontWeight: '500',
  },
}); 