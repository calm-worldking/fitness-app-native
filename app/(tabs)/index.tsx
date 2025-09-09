import { Logo } from '@/components/Logo';
import { SimpleLoadingScreen } from '@/components/SimpleLoadingScreen';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { AppHeader } from '@/components/AppHeader';
import { api, fetchGyms } from '@/lib/api';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
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

type GymCard = { 
  id: string; 
  name: string; 
  address?: string | null;
  _count?: { classes: number };
}

const workoutTypes = [
  { icon: 'fitness-center', label: 'Силовые', count: 57, color: PRIMARY, tag: 'силовые' },
  { icon: 'self-improvement', label: 'Йога', count: 68, color: SECONDARY, tag: 'йога' },
  { icon: 'pool', label: 'Плавание', count: 15, color: '#3EC6FF', tag: 'плавание' },
  { icon: 'groups', label: 'Групповые', count: 42, color: '#A259FF', tag: 'групповые' },
];

const quickActions = [
  { icon: 'calendar-today', label: 'Расписание', route: '/schedule', color: PRIMARY },
  { icon: 'card-membership', label: 'Абонементы', route: '/subscription', color: SECONDARY },
  { icon: 'groups', label: 'Семейная подписка', route: '/family/subscription', color: '#A259FF' },
  { icon: 'analytics', label: 'Статистика', route: '/profile', color: SUCCESS },
];

export default function HomeScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [gyms, setGyms] = useState<GymCard[]>([]);
  const [loadingGyms, setLoadingGyms] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userStats, setUserStats] = useState({
    thisMonth: 0,
    weekStreak: 0,
  });
  const insets = useSafeAreaInsets();
  
  // Кэш для залов
  const gymsCache = useMemo(() => new Map<string, any[]>(), []);
  
  // Восстанавливаем позицию скролла при возврате
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollViewRef.current && scrollPosition > 0) {
        scrollViewRef.current.scrollTo({ y: scrollPosition, animated: false });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [scrollPosition]);

  // Загружаем статистику при монтировании
  useEffect(() => {
    loadUserStats();
  }, []);
  
  const loadUserStats = async () => {
    try {
      console.log('📊 Loading user stats for home screen...');
      const stats = await api.getUserStats();
      setUserStats({
        thisMonth: stats.thisMonth,
        weekStreak: stats.weekStreak,
      });
    } catch (error) {
      console.log('❌ Failed to load user stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      setLoadingGyms(true);
      console.log('🔄 Refreshing gyms data...');
      const res = await fetchGyms({ take: 10 });
      const gymsData = res.items.map(g => ({ 
        id: g.id, 
        name: g.name, 
        address: g.address,
        _count: g._count
      }));
      
      // Обновляем кэш
      gymsCache.set('gyms_list', gymsData);
      setGyms(gymsData);
      
      // Загружаем статистику
      await loadUserStats();
    } catch (e) {
      console.warn('Failed to refresh gyms', e);
    } finally {
      setLoadingGyms(false);
      setRefreshing(false);
    }
  };

  const handleGymPress = (gymId: string) => {
    router.push(`/gym/${gymId}` as any);
  };

  const handleWorkoutTypePress = (workoutType: any) => {
    // Переходим на страницу залов с фильтром по типу тренировки
    router.push({
      pathname: '/(tabs)/explore' as any,
      params: {
        filter: workoutType.label.toLowerCase(),
        activityTags: workoutType.tag || workoutType.label.toLowerCase()
      }
    });
  };

  const handleQuickAction = (route: string) => {
    router.push(route as any);
  };

  const handleScroll = (event: any) => {
    setScrollPosition(event.nativeEvent.contentOffset.y);
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoadingGyms(true);
        
        // Проверяем кэш
        const cacheKey = 'gyms_list';
        if (gymsCache.has(cacheKey)) {
          console.log('🚀 Loading gyms from cache');
          setGyms(gymsCache.get(cacheKey)!);
          setLoadingGyms(false);
          return;
        }
        
        console.log('📡 Fetching gyms from API...');
        const res = await fetchGyms({ take: 10 });
        
        if (!res || !res.items) {
          console.warn('📱 No gyms data received, using fallback');
          setGyms([]);
          return;
        }
        
        const gymsData = res.items.map((g: any) => ({ 
          id: g.id, 
          name: g.name, 
          address: g.address,
          description: g.description,
          photos: g.photos || [],
          activityTags: g.activityTags || [],
          services: g.services || [],
          _count: g._count || { classes: 0, classTypes: 0 }
        }));
        
        if (mounted) {
          // Сохраняем в кэш
          gymsCache.set(cacheKey, gymsData);
          setGyms(gymsData);
        }
      } catch (e) {
        console.warn('Failed to load gyms', e);
        if (mounted) {
          setGyms([]);
        }
      } finally {
        if (mounted) {
          setLoadingGyms(false);
        }
      }
    };
    load();
    const interval = setInterval(load, 60_000); // polling раз в минуту
    return () => {
      mounted = false;
      clearInterval(interval);
    }
  }, [gymsCache]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={HEADER_DARK} barStyle="light-content" translucent={false} />
      
      {/* Header */}
      <AppHeader />

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
              <MaterialIcons name="whatshot" size={60} color={PRIMARY} />
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
          
          {loadingGyms ? (
            <View style={styles.loadingContainer}>
              <SimpleLoadingScreen message="Загружаем залы..." />
            </View>
          ) : (
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
                  <Image source={require('../../assets/images/placeholder_gym1.jpg')} style={styles.gymImage} />
                  <View style={styles.gymInfo}>
                    <View style={styles.gymHeader}>
                      <ThemedText type="defaultSemiBold" style={styles.gymName}>
                        {gym.name}
                      </ThemedText>
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color={CARD_BG} />
                        <ThemedText style={styles.ratingText}>9.6</ThemedText>
                      </View>
                    </View>
                    
                    <View style={styles.gymDetails}>
                      <View style={styles.addressRow}>
                        <Ionicons name="location-outline" size={14} color={TEXT_MUTED} />
                        <ThemedText style={styles.addressText}>{gym.address || '—'}</ThemedText>
                      </View>
                      <ThemedText style={styles.distanceText}>
                        {gym._count?.classes || 0} занятий
                      </ThemedText>
                    </View>
                    
                    <View style={styles.gymFooter}>
                      <View style={styles.featuresRow} />
                      <View style={styles.includedBadge}>
                        <MaterialIcons name="check-circle" size={16} color={SUCCESS} />
                        <ThemedText style={styles.includedText}>Включено</ThemedText>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Популярные виды тренировок */}
        <View style={styles.workoutTypesSection}>
          <ThemedText type="heading2" style={styles.sectionTitle}>
            Популярные тренировки
          </ThemedText>
          <View style={styles.workoutTypesGrid}>
            {workoutTypes.map((type, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.workoutTypeCard}
                onPress={() => handleWorkoutTypePress(type)}
              >
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
              <ThemedText type="heading3" style={styles.statValue}>{userStats.thisMonth}</ThemedText>
              <ThemedText style={styles.statLabel}>Тренировок в месяц</ThemedText>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MaterialIcons name="whatshot" size={24} color={PRIMARY} />
              </View>
              <ThemedText type="heading3" style={styles.statValue}>{userStats.weekStreak}</ThemedText>
              <ThemedText style={styles.statLabel}>Недель подряд</ThemedText>
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
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

