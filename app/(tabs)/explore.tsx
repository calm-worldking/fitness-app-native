import { Logo } from '@/components/Logo';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    TextInput,
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

// Категории поиска
const searchCategories = [
  { id: 'all', label: 'Все', icon: 'search', color: PRIMARY },
  { id: 'premium', label: 'Премиум', icon: 'star', color: '#FFD700' },
  { id: 'standard', label: 'Стандарт', icon: 'fitness-center', color: SECONDARY },
  { id: 'nearby', label: 'Рядом', icon: 'location-on', color: SUCCESS },
  { id: 'new', label: 'Новые', icon: 'fiber-new', color: '#9C27B0' },
];

// Быстрые фильтры
const quickFilters = [
  { icon: 'map', label: 'На карте', color: '#3EC6FF' },
  { icon: 'favorite', label: 'Избранное', color: PRIMARY },
  { icon: 'schedule', label: 'Свободные места', color: SUCCESS },
  { icon: 'family-restroom', label: 'Семейные', color: '#A259FF' },
  { icon: 'accessibility', label: 'Доступность', color: SECONDARY },
  { icon: 'local-parking', label: 'С парковкой', color: '#4CAF50' },
];

// Виды занятий
const workoutTypes = [
  { icon: 'fitness-center', label: 'Силовые тренировки', count: 57, color: PRIMARY, description: 'Тренажерный зал, пауэрлифтинг' },
  { icon: 'pool', label: 'Водные виды спорта', count: 15, color: '#3EC6FF', description: 'Плавание, аквааэробика' },
  { icon: 'self-improvement', label: 'Йога и медитация', count: 68, color: SECONDARY, description: 'Хатха, Виньяса, медитация' },
  { icon: 'accessibility-new', label: 'Стретчинг и пилатес', count: 61, color: '#A259FF', description: 'Растяжка, пилатес, recovery' },
  { icon: 'sports-martial-arts', label: 'Боевые искусства', count: 22, color: '#E91E63', description: 'Бокс, кикбоксинг, каратэ' },
  { icon: 'directions-run', label: 'Танцы и кардио', count: 34, color: '#FF9800', description: 'Зумба, латина, кардио-танцы' },
  { icon: 'sports-gymnastics', label: 'Функциональный тренинг', count: 45, color: '#795548', description: 'Кроссфит, TRX, функционал' },
  { icon: 'spa', label: 'Wellness', count: 28, color: '#00BCD4', description: 'СПА, массаж, релаксация' },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const insets = useSafeAreaInsets();

  const toggleFilter = (filterLabel: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterLabel) 
        ? prev.filter(f => f !== filterLabel)
        : [...prev, filterLabel]
    );
  };

  const handleWorkoutTypePress = (workoutType: any) => {
    router.push('/explore' as any); // Можно добавить фильтрацию по типу
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
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Поисковая строка */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={22} color={TEXT_MUTED} style={styles.searchIcon} />
            <TextInput
              placeholder="Поиск клубов, тренировок..."
              placeholderTextColor={TEXT_MUTED}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color={TEXT_MUTED} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Категории поиска */}
        <View style={styles.categoriesSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {searchCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <MaterialIcons 
                  name={category.icon as any} 
                  size={18} 
                  color={selectedCategory === category.id ? CARD_BG : category.color} 
                />
                <ThemedText style={[
                  styles.categoryLabel,
                  selectedCategory === category.id && styles.categoryLabelActive
                ]}>
                  {category.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Быстрые фильтры */}
        <View style={styles.filtersSection}>
          <ThemedText type="heading3" style={styles.sectionTitle}>
            Быстрые фильтры
          </ThemedText>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
          >
            {quickFilters.map((filter, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.filterChip,
                  selectedFilters.includes(filter.label) && styles.filterChipActive
                ]}
                onPress={() => toggleFilter(filter.label)}
              >
                <MaterialIcons 
                  name={filter.icon as any} 
                  size={20} 
                  color={selectedFilters.includes(filter.label) ? CARD_BG : filter.color} 
                />
                <ThemedText style={[
                  styles.filterLabel,
                  selectedFilters.includes(filter.label) && styles.filterLabelActive
                ]}>
                  {filter.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Популярные направления */}
        <View style={styles.directionsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText type="heading2" style={styles.sectionTitle}>
              Популярные направления
            </ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.seeAllText}>Посмотреть все</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.directionsGrid}>
            {workoutTypes.map((type, index) => (
              <TouchableOpacity
                key={index}
                style={styles.directionCard}
                onPress={() => handleWorkoutTypePress(type)}
              >
                <View style={styles.directionHeader}>
                  <View style={[styles.directionIcon, { backgroundColor: type.color + '20' }]}>
                    <MaterialIcons name={type.icon as any} size={28} color={type.color} />
                  </View>
                  <View style={styles.directionStats}>
                    <ThemedText style={styles.directionCount}>{type.count}</ThemedText>
                    <ThemedText style={styles.directionCountLabel}>залов</ThemedText>
                  </View>
                </View>
                
                <ThemedText type="defaultSemiBold" style={styles.directionTitle}>
                  {type.label}
                </ThemedText>
                
                <ThemedText style={styles.directionDescription}>
                  {type.description}
                </ThemedText>
                
                <View style={styles.directionFooter}>
                  <ThemedText style={styles.exploreText}>Исследовать</ThemedText>
                  <Ionicons name="arrow-forward" size={16} color={PRIMARY} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Рекомендации */}
        <View style={styles.recommendationsSection}>
          <ThemedText type="heading2" style={styles.sectionTitle}>
            Рекомендуем попробовать
          </ThemedText>
          
          <View style={styles.recommendationCard}>
            <View style={styles.recommendationIcon}>
              <MaterialIcons name="psychology" size={32} color={PRIMARY} />
            </View>
            <View style={styles.recommendationContent}>
              <ThemedText type="defaultSemiBold" style={styles.recommendationTitle}>
                Персональные рекомендации
              </ThemedText>
              <ThemedText style={styles.recommendationText}>
                Ответьте на несколько вопросов, и мы подберем идеальные тренировки для вас
              </ThemedText>
            </View>
            <TouchableOpacity style={styles.recommendationButton}>
              <Ionicons name="arrow-forward" size={20} color={PRIMARY} />
            </TouchableOpacity>
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
    paddingTop: 20,
    paddingBottom: 100,
  },
  
  // Search section
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: TEXT_DARK,
    fontFamily: 'MuseoSansCyrl_500',
  },
  clearButton: {
    padding: 4,
  },
  
  // Categories
  categoriesSection: {
    marginBottom: 24,
  },
  categoriesScroll: {
    paddingLeft: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_DARK,
    marginLeft: 8,
  },
  categoryLabelActive: {
    color: CARD_BG,
  },
  
  // Filters
  filtersSection: {
    marginBottom: 32,
  },
  filtersScroll: {
    paddingLeft: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: BG,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterChipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: TEXT_DARK,
    marginLeft: 6,
  },
  filterLabelActive: {
    color: CARD_BG,
  },
  
  // Common section styles
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_DARK,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: PRIMARY,
    fontWeight: '600',
  },
  
  // Directions
  directionsSection: {
    marginBottom: 32,
  },
  directionsGrid: {
    paddingHorizontal: 16,
    gap: 16,
  },
  directionCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  directionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  directionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  directionStats: {
    alignItems: 'flex-end',
  },
  directionCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_DARK,
  },
  directionCountLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  directionTitle: {
    fontSize: 18,
    color: TEXT_DARK,
    marginBottom: 8,
  },
  directionDescription: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 20,
    marginBottom: 16,
  },
  directionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  exploreText: {
    fontSize: 14,
    color: PRIMARY,
    fontWeight: '600',
    marginRight: 8,
  },
  
  // Recommendations
  recommendationsSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  recommendationCard: {
    backgroundColor: BG,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: CARD_BG,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recommendationContent: {
    flex: 1,
    marginRight: 12,
  },
  recommendationTitle: {
    fontSize: 16,
    color: TEXT_DARK,
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 20,
  },
  recommendationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
