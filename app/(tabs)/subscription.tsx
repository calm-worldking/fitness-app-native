import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type SubscriptionType = 'individual' | 'family';

interface SubscriptionOption {
  id: SubscriptionType;
  title: string;
  price: string;
  description: string;
  features: string[];
}

const subscriptionOptions: SubscriptionOption[] = [
  {
    id: 'individual',
    title: 'Индивидуальный',
    price: '2 500 ₽/месяц',
    description: 'Идеально для одного человека',
    features: [
      'Доступ ко всем залам сети',
      'Групповые тренировки',
      'Бесплатная отмена записи за 8 часов',
      'Заморозка абонемента до 30 дней'
    ]
  },
  {
    id: 'family',
    title: 'Семейный',
    price: '4 900 ₽/месяц',
    description: 'До 4 человек в одном абонементе',
    features: [
      'Все преимущества индивидуального тарифа',
      'До 4 человек на одном аккаунте',
      'Общий или раздельный баланс',
      'Семейные групповые тренировки',
      'Заморозка абонемента до 60 дней'
    ]
  }
];

export default function SubscriptionScreen() {
  const [selectedType, setSelectedType] = useState<SubscriptionType>('individual');

  const handleManageFamilyPress = () => {
    // Используем правильный формат пути для expo-router
    router.navigate('../family');
  };

  const getSubscriptionButtonText = () => {
    return `Оформить ${selectedType === 'individual' ? 'индивидуальный' : 'семейный'} абонемент`;
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Выберите абонемент</ThemedText>
      
      <ThemedView style={styles.optionsContainer}>
        {subscriptionOptions.map((option) => (
          <Card 
            key={option.id}
            style={[
              styles.optionCard,
              selectedType === option.id && styles.selectedCard
            ]}
          >
            <TouchableOpacity 
              style={styles.cardTouchable}
              onPress={() => setSelectedType(option.id)}
            >
              <CardHeader style={styles.cardHeader}>
                <CardTitle>{option.title}</CardTitle>
                <ThemedText type="heading2" style={styles.price}>{option.price}</ThemedText>
              </CardHeader>
              
              <CardContent>
                <CardDescription style={styles.description}>{option.description}</CardDescription>
                
                <ThemedView style={styles.featuresContainer}>
                  {option.features.map((feature, index) => (
                    <ThemedView key={index} style={styles.featureRow}>
                      <ThemedText style={styles.bulletPoint}>•</ThemedText>
                      <ThemedText style={styles.featureText}>{feature}</ThemedText>
                    </ThemedView>
                  ))}
                </ThemedView>
              </CardContent>
            </TouchableOpacity>
          </Card>
        ))}
      </ThemedView>
      
      <Button style={styles.subscribeButton}>
        {getSubscriptionButtonText()}
      </Button>
      
      {selectedType === 'family' && (
        <Button 
          variant="ghost"
          style={styles.manageFamilyButton}
          onPress={handleManageFamilyPress}
        >
          Управление участниками семейного аккаунта
        </Button>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    marginBottom: 16,
  },
  cardTouchable: {
    width: '100%',
  },
  selectedCard: {
    borderColor: '#FF6246',
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    color: '#FF6246',
  },
  description: {
    marginBottom: 16,
  },
  featuresContainer: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletPoint: {
    marginRight: 8,
    fontSize: 16,
  },
  featureText: {
    flex: 1,
  },
  subscribeButton: {
    marginTop: 24,
  },
  manageFamilyButton: {
    marginTop: 12,
  },
}); 