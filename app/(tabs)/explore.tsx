import { Logo } from '@/components/Logo';
import { SimpleLoadingScreen } from '@/components/SimpleLoadingScreen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppHeader } from '@/components/AppHeader';
import { api } from '@/lib/api';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Linking,
    Modal,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Брендовые цвета BIRGE GO
const PRIMARY = '#FF6246';
const SECONDARY = '#FF8843';
const BG = '#FFE7D8';
const CARD_BG = '#FFFFFF';
const TEXT_DARK = '#000000';
const TEXT_MUTED = '#737373';
const HEADER_DARK = '#0D1F2C';
const SURFACE_LIGHT = '#F8F9FA';
const BORDER_LIGHT = '#E9ECEF';
const ERROR = '#F44336';
const ACCENT_BG = '#FFF5F2';
const SHADOW_LIGHT = '#00000010';
const SUCCESS = '#4CAF50'; // Новый цвет для статуса "Открыт"

interface Gym {
  id: string;
  name: string;
  address?: string | null;
  description?: string | null;
  photos: string[];
  activityTags?: string[];
  services: string[];
  instagram?: string | null;
  createdAt?: string;
  rating?: number;
  // GIS данные зала
  latitude?: number | null;
  longitude?: number | null;
  gisData?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
    placeId?: string;
  } | null;
  _count?: {
    classes: number;
    classTypes?: number;
  };
}

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activityTags, setActivityTags] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'classesCount'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [hasClassesOnly, setHasClassesOnly] = useState(false);
  const [showPopular, setShowPopular] = useState(false);
  const [showFiltersExpanded, setShowFiltersExpanded] = useState(false);
  const [_popularGyms, _setPopularGyms] = useState<Gym[]>([]);

  // Загружаем доступные теги и услуги
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [tagsRes, servicesRes] = await Promise.all([
          api.getActivityTags(),
          api.getServices()
        ]);
        
        if (tagsRes?.tags) {
          setActivityTags(tagsRes.tags);
        }
        
        if (servicesRes?.services) {
          setServices(servicesRes.services);
        }
      } catch (error) {
        console.log('Failed to load filters:', error);
      }
    };

    loadFilters();
  }, []);

  // Поиск залов
  const searchGyms = useCallback(async (query?: string, tags?: string[], services?: string[]) => {
    try {
      setLoading(true);
      
      const params: any = {
        take: 20,
        search: query || searchQuery,
        sortBy: sortBy,
        sortOrder: sortOrder,
        hasClasses: hasClassesOnly
      };

      if (tags && tags.length > 0) {
        params.activityTags = tags.join(',');
      }

      if (services && services.length > 0) {
        params.services = services.join(',');
      }

      const result = await api.searchGyms(params);

      if (result?.gyms) {
        // Преобразуем данные для соответствия интерфейсу Gym
        const transformedGyms: Gym[] = result.gyms.map((gym: any) => ({
          id: gym.id,
          name: gym.name,
          address: gym.address,
          description: gym.description,
          photos: gym.photos || [],
          activityTags: gym.activityTags || [],
          services: gym.services || [],
          instagram: gym.instagram,
          createdAt: gym.createdAt,
          rating: gym.rating,
          // GIS данные
          latitude: gym.latitude,
          longitude: gym.longitude,
          gisData: gym.gisData,
          _count: gym._count || { classes: 0, classTypes: 0 }
        }));
        setGyms(transformedGyms);
      } else {
        setGyms([]);
      }
    } catch (error) {
      console.log('Search failed:', error);
      setGyms([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy, sortOrder, hasClassesOnly]);

  // Обработка параметров из URL
  useEffect(() => {
    if (params.activityTags) {
      const tags = Array.isArray(params.activityTags) 
        ? params.activityTags 
        : [params.activityTags];
      setSelectedTags(tags);
      // Выполняем поиск с выбранными тегами
      searchGyms('', tags, []);
    }
  }, [params.activityTags, searchGyms]);

  // Загрузка популярных залов
  const loadPopularGyms = async () => {
    try {
      const result = await api.getPopularGyms();
      if (result?.popularGyms) {
        // Преобразуем данные для соответствия интерфейсу Gym
        const transformedPopularGyms: Gym[] = result.popularGyms.map((gym: any) => ({
          id: gym.id,
          name: gym.name,
          address: gym.address,
          description: gym.description,
          photos: gym.photos || [],
          activityTags: gym.activityTags || [],
          services: gym.services || [],
          instagram: gym.instagram,
          createdAt: gym.createdAt,
          rating: gym.rating,
          // GIS данные
          latitude: gym.latitude,
          longitude: gym.longitude,
          gisData: gym.gisData,
          _count: gym._count || { classes: 0, classTypes: 0 }
        }));
        setGyms(transformedPopularGyms);
      }
    } catch (error) {
      console.log('Failed to load popular gyms:', error);
    }
  };

  // Загрузка рекомендаций
  const _loadRecommendations = async () => {
    try {
      const params: any = { take: 10 };
      if (selectedTags.length > 0) {
        params.preferredTags = selectedTags.join(',');
      }
      if (selectedServices.length > 0) {
        params.preferredServices = selectedServices.join(',');
      }

      const result = await api.getGymRecommendations(params);
      if (result?.gyms) {
        // Преобразуем данные для соответствия интерфейсу Gym
        const transformedGyms: Gym[] = result.gyms.map((gym: any) => ({
          id: gym.id,
          name: gym.name,
          address: gym.address,
          description: gym.description,
          photos: gym.photos || [],
          activityTags: gym.activityTags || [],
          services: gym.services || [],
          instagram: gym.instagram,
          createdAt: gym.createdAt,
          rating: gym.rating,
          // GIS данные
          latitude: gym.latitude,
          longitude: gym.longitude,
          gisData: gym.gisData,
          _count: gym._count || { classes: 0, classTypes: 0 }
        }));
        setGyms(transformedGyms);
      }
    } catch (error) {
      console.log('Failed to load recommendations:', error);
    }
  };

  // Обработка поиска
  const handleSearch = () => {
    searchGyms(searchQuery, selectedTags, selectedServices);
  };

  // Обработка выбора тега
  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    searchGyms(searchQuery, newTags, selectedServices);
  };

  // Обработка выбора услуги
  const toggleService = (service: string) => {
    const newServices = selectedServices.includes(service)
      ? selectedServices.filter(s => s !== service)
      : [...selectedServices, service];
    
    setSelectedServices(newServices);
    searchGyms(searchQuery, selectedTags, newServices);
  };

  // Очистка всех фильтров
  const clearFilters = () => {
    setSelectedTags([]);
    setSelectedServices([]);
    setSortBy('name');
    setSortOrder('asc');
    setHasClassesOnly(false);
    searchGyms(searchQuery, [], []);
  };

  // Переключение популярных залов
  const togglePopular = () => {
    if (showPopular) {
      setShowPopular(false);
      searchGyms(searchQuery, selectedTags, selectedServices);
    } else {
      setShowPopular(true);
      loadPopularGyms();
    }
  };

  // Обновление при pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    if (showPopular) {
      await loadPopularGyms();
    } else {
      await searchGyms(searchQuery, selectedTags, selectedServices);
    }
    setRefreshing(false);
  };

  // Навигация к залу
  const handleGymPress = (gymId: string) => {
    router.push(`/gym/${gymId}`);
  };

  // Обработка нажатия на адрес (открытие карт)
  const handleAddressPress = async (gym: Gym) => {
    try {
      let url: string;

      if (gym.latitude && gym.longitude) {
        // Открываем карты с координатами зала
        url = `https://www.google.com/maps/search/?api=1&query=${gym.latitude},${gym.longitude}`;
        console.log('Opening maps for gym:', gym.name, 'at coordinates:', gym.latitude, gym.longitude);
      } else if (gym.address) {
        // Если нет координат, но есть адрес, открываем поиск по адресу
        url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gym.address)}`;
        console.log('Opening maps for gym:', gym.name, 'at address:', gym.address);
      } else {
        Alert.alert('Ошибка', 'Информация о местоположении недоступна');
        return;
      }

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback для устройств без Google Maps
        const fallbackUrl = `https://maps.apple.com/?q=${encodeURIComponent(gym.address || `${gym.latitude},${gym.longitude}`)}`;
        const fallbackSupported = await Linking.canOpenURL(fallbackUrl);
        if (fallbackSupported) {
          await Linking.openURL(fallbackUrl);
        } else {
          Alert.alert('Ошибка', 'Не удалось открыть карты. Пожалуйста, установите приложение карт.');
        }
      }
    } catch (error) {
      console.error('Error opening maps:', error);
      Alert.alert('Ошибка', 'Не удалось открыть карты');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar backgroundColor={HEADER_DARK} barStyle="light-content" translucent={false} />
      
      {/* Header */}
      <AppHeader />

      {/* Compact Header with Search */}
      <View style={styles.compactHeader}>
        <View style={styles.headerTop}>
          <ThemedText type="heading2" style={styles.pageTitle}>
            Поиск залов
          </ThemedText>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <MaterialIcons name="tune" size={24} color={PRIMARY} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={TEXT_MUTED} />
            <TextInput
              style={styles.searchInput}
              placeholder="Поиск по названию или адресу..."
              placeholderTextColor={TEXT_MUTED}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={TEXT_MUTED} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.searchIconButton} onPress={handleSearch}>
            <MaterialIcons name="search" size={24} color={CARD_BG} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={[styles.compactQuickAction, showPopular && styles.compactQuickActionActive]}
            onPress={togglePopular}
          >
            <MaterialIcons name="trending-up" size={18} color={showPopular ? CARD_BG : PRIMARY} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.compactQuickAction, hasClassesOnly && styles.compactQuickActionActive]}
            onPress={() => {
              setHasClassesOnly(!hasClassesOnly);
              searchGyms(searchQuery, selectedTags, selectedServices);
            }}
          >
            <MaterialIcons name="fitness-center" size={18} color={hasClassesOnly ? CARD_BG : PRIMARY} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.compactQuickAction, showFiltersExpanded && styles.compactQuickActionActive]}
            onPress={() => setShowFiltersExpanded(!showFiltersExpanded)}
          >
            <MaterialIcons name="filter-list" size={18} color={showFiltersExpanded ? CARD_BG : PRIMARY} />
          </TouchableOpacity>

          {(selectedTags.length > 0 || selectedServices.length > 0) && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearFilters}
            >
              <MaterialIcons name="clear" size={16} color={ERROR} />
            </TouchableOpacity>
          )}
        </View>

        {showFiltersExpanded && (
          <View style={styles.filtersSummary}>
            <ThemedText style={styles.filtersSummaryText}>
              Выбрано: {selectedTags.length} типов занятий, {selectedServices.length} услуг
            </ThemedText>
          </View>
        )}
      </View>

      {/* Filters Section */}
      {showFiltersExpanded && (
        <>
          {/* Activity Tags */}
          {activityTags.length > 0 && (
            <View style={styles.tagsContainer}>
              <ThemedText type="heading3" style={styles.tagsTitle}>
                Виды занятий
              </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.tagsList}>
                  {activityTags.map((tag) => (
              <TouchableOpacity
                      key={tag}
                style={[
                        styles.tag,
                        selectedTags.includes(tag) && styles.tagSelected
                ]}
                      onPress={() => toggleTag(tag)}
              >
                <ThemedText style={[
                        styles.tagText,
                        selectedTags.includes(tag) && styles.tagTextSelected
                ]}>
                        {tag}
                </ThemedText>
              </TouchableOpacity>
            ))}
                </View>
          </ScrollView>
        </View>
          )}

          {/* Services */}
          {services.length > 0 && (
            <View style={styles.tagsContainer}>
              <ThemedText type="heading3" style={styles.tagsTitle}>
                Услуги
          </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.tagsList}>
                  {services.map((service) => (
              <TouchableOpacity
                      key={service}
                style={[
                        styles.tag,
                        selectedServices.includes(service) && styles.tagSelected
                ]}
                      onPress={() => toggleService(service)}
              >
                <ThemedText style={[
                        styles.tagText,
                        selectedServices.includes(service) && styles.tagTextSelected
                ]}>
                        {service}
                </ThemedText>
              </TouchableOpacity>
            ))}
                </View>
          </ScrollView>
        </View>
          )}
        </>
      )}

      {/* Results */}
      <ScrollView
        style={styles.resultsContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY]}
            tintColor={PRIMARY}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <SimpleLoadingScreen message="Поиск залов..." />
        ) : gyms.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={64} color={TEXT_MUTED} />
            <ThemedText type="heading2" style={styles.emptyTitle}>
              Залы не найдены
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Попробуйте изменить параметры поиска
            </ThemedText>
          </View>
        ) : (
          <View style={styles.gymsList}>
            {gyms.map((gym) => (
              <TouchableOpacity
                key={gym.id}
                style={styles.gymCard}
                onPress={() => handleGymPress(gym.id)}
              >
                {/* Изображение зала */}
                <View style={styles.gymImageContainer}>
                  <View style={styles.gymImage}>
                    <MaterialIcons name="fitness-center" size={32} color="#fff" />
                  </View>
                  <View style={styles.gymImageOverlay}>
                    <View style={styles.gymRating}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <ThemedText style={styles.gymRatingText}>
                        {gym.rating || 4.5}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                <View style={styles.gymInfo}>
                  <ThemedText type="defaultSemiBold" style={styles.gymName}>
                    {gym.name}
                  </ThemedText>

                  {gym.address && (
                    <TouchableOpacity
                      style={styles.addressContainer}
                      onPress={() => handleAddressPress(gym)}
                    >
                      <MaterialIcons name="location-on" size={16} color={PRIMARY} />
                      <ThemedText style={styles.gymAddress}>
                        {gym.address}
                      </ThemedText>
                      {(gym.latitude && gym.longitude) && (
                        <MaterialIcons name="navigation" size={14} color={SECONDARY} />
                      )}
                    </TouchableOpacity>
                  )}

                </View>
                
                <MaterialIcons name="chevron-right" size={20} color={TEXT_MUTED} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText type="heading2" style={styles.modalTitle}>
              Фильтры
            </ThemedText>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color={TEXT_DARK} />
            </TouchableOpacity>
        </View>

          <ScrollView style={styles.modalContent}>
            {/* Sort Options */}
            <View style={styles.filterSection}>
              <ThemedText type="heading3" style={styles.filterSectionTitle}>
                Сортировка
          </ThemedText>
          
              <View style={styles.sortOptions}>
                <TouchableOpacity
                  style={[styles.sortOption, sortBy === 'name' && styles.sortOptionActive]}
                  onPress={() => setSortBy('name')}
                >
                  <ThemedText style={[styles.sortOptionText, sortBy === 'name' && styles.sortOptionTextActive]}>
                    По названию
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.sortOption, sortBy === 'createdAt' && styles.sortOptionActive]}
                  onPress={() => setSortBy('createdAt')}
                >
                  <ThemedText style={[styles.sortOptionText, sortBy === 'createdAt' && styles.sortOptionTextActive]}>
                    По дате добавления
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <View style={styles.sortOrderContainer}>
                <TouchableOpacity
                  style={[styles.sortOrderButton, sortOrder === 'asc' && styles.sortOrderButtonActive]}
                  onPress={() => setSortOrder('asc')}
                >
                  <MaterialIcons name="arrow-upward" size={16} color={sortOrder === 'asc' ? CARD_BG : TEXT_MUTED} />
                  <ThemedText style={[styles.sortOrderText, sortOrder === 'asc' && styles.sortOrderTextActive]}>
                    По возрастанию
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.sortOrderButton, sortOrder === 'desc' && styles.sortOrderButtonActive]}
                  onPress={() => setSortOrder('desc')}
                >
                  <MaterialIcons name="arrow-downward" size={16} color={sortOrder === 'desc' ? CARD_BG : TEXT_MUTED} />
                  <ThemedText style={[styles.sortOrderText, sortOrder === 'desc' && styles.sortOrderTextActive]}>
                    По убыванию
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Apply Filters Button */}
            <TouchableOpacity
              style={styles.applyFiltersButton}
              onPress={() => {
                setShowFilters(false);
                searchGyms(searchQuery, selectedTags, selectedServices);
              }}
            >
              <ThemedText style={styles.applyFiltersButtonText}>
                Применить фильтры
              </ThemedText>
            </TouchableOpacity>
      </ScrollView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  // Compact Header
  compactHeader: {
    backgroundColor: CARD_BG,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BG,
    shadowColor: SHADOW_LIGHT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: ACCENT_BG,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE_LIGHT,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: TEXT_DARK,
  },
  searchIconButton: {
    backgroundColor: PRIMARY,
    padding: 10,
    borderRadius: 12,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  header: {
    backgroundColor: HEADER_DARK,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationButton: {
    padding: 4,
  },
  pageTitleContainer: {
    backgroundColor: CARD_BG,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  quickActionsContainer: {
    backgroundColor: CARD_BG,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: BG,
    shadowColor: SHADOW_LIGHT,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactQuickAction: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: SURFACE_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BG,
    shadowColor: SHADOW_LIGHT,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  compactQuickActionActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOpacity: 0.2,
    elevation: 2,
  },
  clearButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: ERROR + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  filtersSummary: {
    marginTop: 12,
    padding: 12,
    backgroundColor: ACCENT_BG,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BG,
  },
  filtersSummaryText: {
    fontSize: 14,
    color: TEXT_DARK,
    textAlign: 'center',
  },
  tagsContainer: {
    backgroundColor: CARD_BG,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 8,
    shadowColor: SHADOW_LIGHT,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tagsTitle: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  tagsList: {
    flexDirection: 'row',
    gap: 12,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: ACCENT_BG,
    borderWidth: 1,
    borderColor: BG,
    shadowColor: SHADOW_LIGHT,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tagSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOpacity: 0.2,
    elevation: 2,
  },
  tagText: {
    fontSize: 14,
    color: TEXT_DARK,
    fontWeight: '500',
  },
  tagTextSelected: {
    color: CARD_BG,
  },
  resultsContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: TEXT_DARK,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: TEXT_MUTED,
    textAlign: 'center',
    paddingHorizontal: 32,
    fontSize: 16,
    lineHeight: 22,
  },
  gymsList: {
    padding: 20,
  },
  gymCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: SHADOW_LIGHT,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: BG,
  },
  gymImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  gymImage: {
    width: '100%',
    height: '100%',
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gymImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 6,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  gymRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  gymRatingText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  gymInfo: {
    flex: 1,
    marginLeft: 12,
  },
  gymHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gymName: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_DARK,
    flex: 1,
  },
  gymStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT_BG,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SUCCESS,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: TEXT_DARK,
    fontWeight: '500',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: ACCENT_BG,
  },
  gymAddress: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginLeft: 6,
    marginRight: 4,
    flex: 1,
  },
  gymDescription: {
    fontSize: 14,
    color: TEXT_DARK,
    marginBottom: 16,
    lineHeight: 20,
  },
  occupancyStats: {
    marginBottom: 16,
  },
  occupancyBar: {
    height: 8,
    backgroundColor: SURFACE_LIGHT,
    borderRadius: 4,
    overflow: 'hidden',
  },
  occupancyProgress: {
    height: '100%',
    backgroundColor: PRIMARY,
    borderRadius: 4,
  },
  occupancyText: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 8,
    textAlign: 'center',
  },
  participantsSection: {
    marginBottom: 16,
  },
  participantsTitle: {
    fontSize: 14,
    color: TEXT_DARK,
    fontWeight: '600',
    marginBottom: 12,
  },
  participantsList: {
    flexDirection: 'row',
    gap: 8,
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    backgroundColor: SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreParticipants: {
    backgroundColor: ACCENT_BG,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  moreParticipantsText: {
    fontSize: 12,
    color: PRIMARY,
    fontWeight: '500',
  },
  miniMapContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gymTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  gymTag: {
    backgroundColor: ACCENT_BG,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BG,
  },
  gymTagText: {
    fontSize: 12,
    color: PRIMARY,
    fontWeight: '500',
  },
  moreTags: {
    fontSize: 12,
    color: TEXT_MUTED,
    alignSelf: 'center',
    fontWeight: '500',
  },
  gymStats: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: CARD_BG,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: BG,
    shadowColor: SHADOW_LIGHT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginVertical: 24,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 20,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  sortOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: SURFACE_LIGHT,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    alignItems: 'center',
  },
  sortOptionActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_DARK,
  },
  sortOptionTextActive: {
    color: CARD_BG,
  },
  sortOrderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  sortOrderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: SURFACE_LIGHT,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    gap: 8,
  },
  sortOrderButtonActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  sortOrderText: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  sortOrderTextActive: {
    color: CARD_BG,
  },
  applyFiltersButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  applyFiltersButtonText: {
    color: CARD_BG,
    fontSize: 16,
    fontWeight: '600',
  },
});
