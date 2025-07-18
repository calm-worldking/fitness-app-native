import { Logo } from '@/components/Logo';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

// Брендовые цвета
const PRIMARY = '#FF6246';
const SECONDARY = '#FF8843';
const BG = '#FFE7D8';
const CARD_BG = '#FFFFFF';
const TEXT_DARK = '#000000';
const TEXT_MUTED = '#737373';
const SUCCESS = '#4CAF50';
const HEADER_DARK = '#0D1F2C';

// Моковые данные
const gyms = [
  {
    id: '1',
    name: 'FitLife Центральный',
    address: 'ул. Ленина, 42',
    image: require('../../assets/images/placeholder.jpg'),
    rating: 9.8,
    distance: '1.2 км',
    price: '15 000 ₸',
    category: 'Премиум',
    features: ['Бассейн', 'Сауна'],
  },
  {
    id: '2', 
    name: 'FitLife Восточный',
    address: 'ул. Гагарина, 15',
    image: require('../../assets/images/placeholder.jpg'),
    rating: 9.5,
    distance: '3.5 км', 
    price: '12 000 ₸',
    category: 'Стандарт',
    features: ['Тренажеры', 'Групповые'],
  },
  {
    id: '3',
    name: 'FitLife Южный', 
    address: 'ул. Пушкина, 78',
    image: require('../../assets/images/placeholder.jpg'),
    rating: 9.7,
    distance: '5.1 км',
    price: '18 000 ₸',
    category: 'Премиум',
    features: ['Йога', 'Кроссфит'],
  }
];

const workoutTypes = [
  { icon: 'fitness-center', label: 'Силовые', count: 57, color: PRIMARY },
  { icon: 'self-improvement', label: 'Йога', count: 68, color: SECONDARY },
  { icon: 'pool', label: 'Плавание', count: 15, color: '#3EC6FF' },
  { icon: 'groups', label: 'Групповые', count: 42, color: '#A259FF' },
];

const quickActions = [
  { icon: 'calendar-today', label: 'Расписание', route: '/schedule', color: PRIMARY },
  { icon: 'card-membership', label: 'Абонементы', route: '/subscription', color: SECONDARY },
  { icon: 'family-restroom', label: 'Семейная подписка', route: '/family/subscription', color: '#A259FF' },
  { icon: 'analytics', label: 'Статистика', route: '/profile', color: SUCCESS },
];

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const insets = useSafeAreaInsets();
  
  // Восстанавливаем позицию скролла при возврате
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollViewRef.current && scrollPosition > 0) {
        scrollViewRef.current.scrollTo({ y: scrollPosition, animated: false });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(res => setTimeout(res, 1000));
    setRefreshing(false);
  };

  const handleGymPress = (gymId: string) => {
    router.push(`/gym/${gymId}` as any);
  };

  const handleQuickAction = (route: string) => {
    router.push(route as any);
  };

  const handleScroll = (event: any) => {
    setScrollPosition(event.nativeEvent.contentOffset.y);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={HEADER_DARK} barStyle="light-content" translucent={false} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Logo width={120} height={36} />
        <TouchableOpacity style={styles.notificationButton}>
          <MaterialIcons name="notifications-none" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY]}
            tintColor={PRIMARY}
          />
        }
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Промо баннер */}
        <View style={styles.promoSection}>
          <View style={styles.promoBanner}>
            <View style={styles.promoContent}>
              <ThemedText type="heading2" style={styles.promoTitle}>
                🔥 Скидка 30% на годовой абонемент
              </ThemedText>
              <ThemedText style={styles.promoSubtitle}>
                Получите доступ ко всем залам сети. Предложение ограничено!
              </ThemedText>
              <Button style={styles.promoButton}>
                <ThemedText style={styles.promoButtonText}>Получить скидку</ThemedText>
              </Button>
            </View>
            <View style={styles.promoImage}>
              <MaterialIcons name="local-fire-department" size={60} color={PRIMARY} />
            </View>
          </View>
        </View>

        {/* Быстрые действия */}
        <View style={styles.quickActionsSection}>
          <ThemedText type="heading2" style={styles.sectionTitle}>
            Быстрые действия
          </ThemedText>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.quickActionCard}
                onPress={() => handleQuickAction(action.route)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                  <MaterialIcons name={action.icon as any} size={24} color={action.color} />
                </View>
                <ThemedText style={styles.quickActionLabel}>{action.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Ближайшие залы */}
        <View style={styles.nearbySection}>
          <View style={styles.sectionHeader}>
            <ThemedText type="heading2" style={styles.sectionTitle}>
              Ближайшие залы
            </ThemedText>
            <TouchableOpacity onPress={() => router.push('/explore')}>
              <ThemedText style={styles.seeAllText}>Посмотреть все</ThemedText>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.gymsList}
          >
            {gyms.map((gym) => (
              <TouchableOpacity 
                key={gym.id} 
                style={styles.gymCard}
                onPress={() => handleGymPress(gym.id)}
              >
                <Image source={gym.image} style={styles.gymImage} />
                <View style={styles.gymInfo}>
                  <View style={styles.gymHeader}>
                    <ThemedText type="defaultSemiBold" style={styles.gymName}>
                      {gym.name}
                    </ThemedText>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={12} color={CARD_BG} />
                      <ThemedText style={styles.ratingText}>{gym.rating}</ThemedText>
                    </View>
                  </View>
                  
                  <View style={styles.gymDetails}>
                    <View style={styles.addressRow}>
                      <Ionicons name="location-outline" size={14} color={TEXT_MUTED} />
                      <ThemedText style={styles.addressText}>{gym.address}</ThemedText>
                    </View>
                    <ThemedText style={styles.distanceText}>{gym.distance}</ThemedText>
                  </View>
                  
                  <View style={styles.gymFooter}>
                    <View style={styles.featuresRow}>
                      {gym.features.slice(0, 2).map((feature, index) => (
                        <View key={index} style={styles.featureTag}>
                          <ThemedText style={styles.featureText}>{feature}</ThemedText>
                        </View>
                      ))}
                    </View>
                    <View style={styles.includedBadge}>
                      <MaterialIcons name="check-circle" size={16} color={SUCCESS} />
                      <ThemedText style={styles.includedText}>Включено</ThemedText>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Популярные виды тренировок */}
        <View style={styles.workoutTypesSection}>
          <ThemedText type="heading2" style={styles.sectionTitle}>
            Популярные тренировки
          </ThemedText>
          <View style={styles.workoutTypesGrid}>
            {workoutTypes.map((type, index) => (
              <TouchableOpacity key={index} style={styles.workoutTypeCard}>
                <View style={[styles.workoutTypeIcon, { backgroundColor: type.color + '20' }]}>
                  <MaterialIcons name={type.icon as any} size={32} color={type.color} />
                </View>
                <ThemedText type="defaultSemiBold" style={styles.workoutTypeLabel}>
                  {type.label}
                </ThemedText>
                <ThemedText style={styles.workoutTypeCount}>
                  {type.count} залов
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Статистика и достижения */}
        <View style={styles.statsSection}>
          <ThemedText type="heading2" style={styles.sectionTitle}>
            Ваша активность
          </ThemedText>
          <View style={styles.statsCards}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MaterialIcons name="trending-up" size={24} color={SUCCESS} />
              </View>
              <ThemedText type="heading3" style={styles.statValue}>12</ThemedText>
              <ThemedText style={styles.statLabel}>Тренировок в месяц</ThemedText>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MaterialIcons name="local-fire-department" size={24} color={PRIMARY} />
              </View>
              <ThemedText type="heading3" style={styles.statValue}>7</ThemedText>
              <ThemedText style={styles.statLabel}>Дней подряд</ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HEADER_DARK,
  },
  
  // Header
  header: {
    backgroundColor: HEADER_DARK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    paddingHorizontal: 16,
    minHeight: 80,
  },
  notificationButton: {
    padding: 4,
  },
  
  // ScrollView
  scrollView: {
    flex: 1,
    backgroundColor: CARD_BG,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  
  // Promo section
  promoSection: {
    marginBottom: 32,
  },
  promoBanner: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  promoContent: {
    flex: 1,
    marginRight: 16,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  promoSubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 16,
    lineHeight: 20,
  },
  promoButton: {
    backgroundColor: PRIMARY,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    color: CARD_BG,
    fontSize: 14,
    fontWeight: '600',
  },
  promoImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Quick actions
  quickActionsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (screenWidth - 56) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_DARK,
    textAlign: 'center',
  },
  
  // Nearby gyms
  nearbySection: {
    marginBottom: 40,
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: PRIMARY,
    fontWeight: '600',
  },
  gymsList: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  gymCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    marginRight: 16,
    marginBottom: 12,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  gymImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  gymInfo: {
    padding: 16,
  },
  gymHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gymName: {
    fontSize: 16,
    color: TEXT_DARK,
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    color: CARD_BG,
    marginLeft: 2,
    fontWeight: 'bold',
  },
  gymDetails: {
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginLeft: 4,
    flex: 1,
  },
  distanceText: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  gymFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  featureTag: {
    backgroundColor: SECONDARY + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: SECONDARY + '30',
  },
  featureText: {
    fontSize: 11,
    color: SECONDARY,
    fontWeight: '600',
  },
  includedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SUCCESS + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  includedText: {
    fontSize: 12,
    color: SUCCESS,
    fontWeight: '600',
    marginLeft: 4,
  },
  
  // Workout types
  workoutTypesSection: {
    marginBottom: 32,
  },
  workoutTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  workoutTypeCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (screenWidth - 56) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  workoutTypeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutTypeLabel: {
    fontSize: 14,
    color: TEXT_DARK,
    marginBottom: 4,
  },
  workoutTypeCount: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  
  // Stats section
  statsSection: {
    marginBottom: 32,
  },
  statsCards: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BG,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    textAlign: 'center',
  },
});

