import { Image } from 'expo-image';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Logo } from '@/components/Logo';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardPressable, CardTitle } from '@/components/ui/Card';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface Gym {
  id: string;
  name: string;
  address: string;
  image: any;
  rating: number;
  distance: string;
}

const gyms: Gym[] = [
  {
    id: '1',
    name: 'FitLife Центральный',
    address: 'ул. Ленина, 42',
    image: require('../../assets/images/placeholder.jpg'),
    rating: 4.8,
    distance: '1.2 км'
  },
  {
    id: '2',
    name: 'FitLife Восточный',
    address: 'ул. Гагарина, 15',
    image: require('../../assets/images/placeholder.jpg'),
    rating: 4.6,
    distance: '3.5 км'
  },
  {
    id: '3',
    name: 'FitLife Южный',
    address: 'ул. Пушкина, 78',
    image: require('../../assets/images/placeholder.jpg'),
    rating: 4.9,
    distance: '5.1 км'
  }
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Логотип и приветствие */}
      <View style={styles.header}>
        {/* SVG логотип */}
        <Logo width={140} height={40} />
        <ThemedText type="heading1" style={[styles.welcome, { color: '#FF6246' }]}>Добро пожаловать!</ThemedText>
        <ThemedText type="muted" style={[styles.subtitle, { color: '#000000' }]}>Найдите идеальную тренировку для себя</ThemedText>
      </View>

      {/* Промо-баннер */}
      <ThemedView style={styles.promoContainer}>
        <Image
          source={require('../../assets/images/placeholder.jpg')}
          style={styles.promoBanner}
        />
        <ThemedView style={styles.promoContent}>
          <ThemedText type="title" style={styles.promoTitle}>
            Летняя акция
          </ThemedText>
          <ThemedText style={styles.promoDescription}>
            Скидка 20% на годовой абонемент до конца июля
          </ThemedText>
          <Button size="sm">
            Подробнее
          </Button>
        </ThemedView>
      </ThemedView>

      {/* Заголовок списка залов */}
      <ThemedView style={styles.sectionHeader}>
        <ThemedText type="subtitle">Фитнес-центры рядом</ThemedText>
        <TouchableOpacity>
          <ThemedText style={styles.seeAllText}>Все залы</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Список залов */}
      <ThemedView style={styles.gymsList}>
        {gyms.map((gym) => (
          <CardPressable key={gym.id} style={styles.gymCard}>
            <Image source={gym.image} style={styles.gymImage} />
            <CardContent>
              <CardTitle>{String(gym.name)}</CardTitle>
              <CardDescription>{String(gym.address)}</CardDescription>
              <ThemedView style={styles.gymDetails}>
                <ThemedView style={styles.ratingContainer}>
                  <ThemedText style={styles.ratingText}>{String(gym.rating)}</ThemedText>
                  <ThemedText style={styles.ratingIcon}>★</ThemedText>
                </ThemedView>
                <ThemedText style={styles.distanceText}>{String(gym.distance)}</ThemedText>
              </ThemedView>
            </CardContent>
          </CardPressable>
        ))}
      </ThemedView>

      {/* Секция популярных тренировок */}
      <ThemedView style={styles.sectionHeader}>
        <ThemedText type="subtitle">Популярные тренировки</ThemedText>
        <TouchableOpacity>
          <ThemedText style={styles.seeAllText}>Все тренировки</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.workoutsList}>
        {['Йога', 'Кроссфит', 'Пилатес', 'Бокс', 'Зумба'].map((workout, index) => (
          <Card key={`workout-${index}`} style={styles.workoutCard}>
            <CardContent>
              <ThemedText style={styles.workoutText}>{String(workout)}</ThemedText>
            </CardContent>
          </Card>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFE7D8',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF6246',
  },
  welcome: {
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 16,
  },
  promoContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  promoBanner: {
    ...StyleSheet.absoluteFillObject,
  },
  promoContent: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 16,
    justifyContent: 'flex-end',
  },
  promoTitle: {
    color: 'white',
    marginBottom: 8,
  },
  promoDescription: {
    color: 'white',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#FF6246',
  },
  gymsList: {
    gap: 16,
    marginBottom: 24,
  },
  gymCard: {
    marginBottom: 16,
  },
  gymImage: {
    width: '100%',
    height: 150,
  },
  gymDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginRight: 4,
  },
  ratingIcon: {
    color: '#FFD700',
  },
  distanceText: {
    fontSize: 14,
  },
  workoutsList: {
    marginBottom: 24,
  },
  workoutCard: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutText: {
    fontWeight: '500',
  },
});
