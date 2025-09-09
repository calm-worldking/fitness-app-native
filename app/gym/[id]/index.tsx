import { GymMap } from '@/components/GymMap';
import { OptimizedImage } from '@/components/OptimizedImage';
import { SimpleLoadingScreen } from '@/components/SimpleLoadingScreen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { fetchGym } from '@/lib/api';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Linking,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Брендовые цвета
const PRIMARY = '#FF6246';
const SECONDARY = '#FF8843';
const BG = '#FFE7D8';
const CARD_BG = '#FFFFFF';
const TEXT_DARK = '#000000';
const TEXT_MUTED = '#737373';
const SUCCESS = '#4CAF50'; // Новый цвет для статистики


// Кэш для залов
const gymCache = new Map<string, any>();

export default function GymPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [gym, setGym] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Обработка нажатия на адрес (открытие карт)
  const handleAddressPress = async (gym: any) => {
    try {
      let url: string;

      if (gym.latitude && gym.longitude) {
        // Открываем карты с координатами зала
        url = `https://www.google.com/maps/search/?api=1&query=${gym.latitude},${gym.longitude}`;
        console.log('Opening maps for gym:', gym.name, 'at coordinates:', gym.latitude, gym.longitude);
      } else if (gym.address && gym.address !== 'Адрес не указан') {
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

    const loadGym = async () => {
      try {
        setLoading(true);
        
        // Проверяем кэш
        if (gymCache.has(id as string)) {
          console.log('🚀 Loading from cache:', id);
          setGym(gymCache.get(id as string));
          setLoading(false);
          return;
        }
        
        // Загружаем зал с сервера по ID
        console.log('📡 Fetching gym data from API...');
        const foundGym = await fetchGym(id as string);
        console.log('📡 Gym data received:', JSON.stringify(foundGym, null, 2));
        
        if (foundGym) {
          // Подготавливаем изображения
          let images: any[] = [];
          
          // Если есть фотографии из базы данных, используем их
          if (foundGym.photos && foundGym.photos.length > 0) {
            console.log('📸 Found photos:', foundGym.photos);
            images = foundGym.photos.map((photoUrl: string) => {
              console.log('🖼️ Processing photo URL:', photoUrl);
              return { uri: photoUrl };
            });
          }
          
          // Если нет фотографий или их мало, добавляем placeholder изображения
          if (images.length === 0) {
            console.log('📸 No photos found, using placeholders');
            images = [
              require('@/assets/images/placeholder_gym1.jpg'),
              require('@/assets/images/placeholder_gym2.jpg'),
              require('@/assets/images/placeholder_gym3.jpg'),
            ];
          } else if (images.length < 3) {
            // Добавляем placeholder изображения, если фотографий меньше 3
            console.log('📸 Adding placeholders to reach 3 images');
            const placeholders = [
              require('@/assets/images/placeholder_gym1.jpg'),
              require('@/assets/images/placeholder_gym2.jpg'),
              require('@/assets/images/placeholder_gym3.jpg'),
            ];
            images = [...images, ...placeholders.slice(0, 3 - images.length)];
          }

          console.log('📸 Final images array:', images);

          console.log('📍 GIS Data from API:', {
            latitude: foundGym.latitude,
            longitude: foundGym.longitude,
            gisData: foundGym.gisData,
            address: foundGym.address
          });

          console.log('📊 Gym services:', foundGym.services);
          console.log('📊 Gym classes count:', foundGym._count?.classes);

          const gymData = {
            id: foundGym.id,
            name: foundGym.name,
            address: foundGym.address || 'Адрес не указан',
            description: foundGym.description || 'Описание отсутствует',
            images: images,
            rating: foundGym.rating || 9.8,
            totalReviews: foundGym.totalReviews || 27721,
            visits: foundGym.visits || 12,
            maxVisits: foundGym.maxVisits || 12,
            // GIS данные
            latitude: foundGym.latitude,
            longitude: foundGym.longitude,
            gisData: foundGym.gisData,
            // Услуги из API
            features: foundGym.services?.map((service: string) => ({
              name: service,
              icon: 'fitness-center' as any
            })) || [],
            // Количество занятий
            classesCount: foundGym._count?.classes || 0,
            classTypesCount: foundGym._count?.classTypes || 0,
            amenities: foundGym.amenities || [
              { title: 'Профессионализм тренера', rating: 9.9 },
              { title: 'Чистота помещения', rating: 9.8 },
              { title: 'Приветливость персонала', rating: 9.8 },
              { title: 'Чистота раздевалки', rating: 9.8 },
              { title: 'Состояние оборудования', rating: 9.8 },
            ],
          };
          
          // Сохраняем в кэш
          gymCache.set(id as string, gymData);
          setGym(gymData);
        } else {
          throw new Error('Gym not found');
        }
      } catch (error) {
        console.error('Failed to load gym:', error);
        // Не устанавливаем моковые данные, показываем ошибку
        setGym(null);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (id) {
      loadGym();
    }
  }, [id]);



  const renderImageItem = ({ item }: { item: any; index: number }) => {
    return (
      <View style={styles.imageContainer}>
        <OptimizedImage
          source={item}
          style={styles.carouselImage}
          placeholder={require('@/assets/images/placeholder_gym1.jpg')}
          onLoad={() => console.log('✅ Image loaded successfully:', item)}
          onError={(error) => console.log('❌ Failed to load image:', item, error)}
        />
      </View>
    );
  };

  const renderDotIndicator = () => {
    return (
      <View style={styles.dotContainer}>
        {gym.images.map((_: any, index: number) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentImageIndex ? PRIMARY : 'rgba(255, 255, 255, 0.5)',
              },
            ]}
          />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
              <SimpleLoadingScreen message="Загружаем информацию о зале..." />
    );
  }

  if (!gym) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={TEXT_MUTED} />
          <ThemedText type="heading2" style={styles.errorTitle}>
            Ошибка загрузки
          </ThemedText>
          <ThemedText style={styles.errorText}>
            Не удалось загрузить информацию о зале. Проверьте подключение к интернету и попробуйте снова.
          </ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={() => {
            setLoading(true);
            setGym(null);
            // Перезагружаем данные
            if (id) {
              loadGym();
            }
          }}>
            <ThemedText style={styles.retryButtonText}>Повторить</ThemedText>
          </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Назад</ThemedText>
        </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Фиксированный header */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="heart-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero section с каруселью */}
        <View style={styles.heroSection}>
                  <FlatList
          data={gym.images}
          renderItem={renderImageItem}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
            setCurrentImageIndex(newIndex);
          }}
          style={styles.carousel}
          removeClippedSubviews={true}
          maxToRenderPerBatch={3}
          windowSize={5}
          initialNumToRender={1}
        />
          {renderDotIndicator()}
        </View>

        <View style={styles.content}>
          {/* Информация о зале */}
          <View style={styles.gymInfo}>
            <View style={styles.gymHeader}>
              <ThemedText type="heading1" style={styles.gymName}>
                {gym.name}
              </ThemedText>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color={PRIMARY} />
                <ThemedText style={styles.rating}>{gym.rating}</ThemedText>
                <ThemedText style={styles.reviewCount}>
                  ({gym.totalReviews.toLocaleString()})
                </ThemedText>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.addressContainer}
              onPress={() => handleAddressPress(gym)}
            >
              <Ionicons name="location-outline" size={16} color={PRIMARY} />
              <ThemedText style={styles.address}>{gym.address}</ThemedText>
              {(gym.latitude && gym.longitude) && (
                <View style={styles.gisInfo}>
                  <Ionicons name="navigate" size={14} color={SECONDARY} />
                  <ThemedText style={styles.gisText}>
                    📍 {gym.latitude.toFixed(6)}, {gym.longitude.toFixed(6)}
                  </ThemedText>
                </View>
              )}
              {(!gym.latitude || !gym.longitude) && (
                <View style={styles.gisInfo}>
                  <Ionicons name="location" size={14} color={TEXT_MUTED} />
                  <ThemedText style={[styles.gisText, { color: TEXT_MUTED }]}>
                    Координаты недоступны
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Статистика зала */}
          <View style={styles.statsSection}>
            <ThemedText type="heading2" style={styles.sectionTitle}>
              Статистика зала
            </ThemedText>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <MaterialIcons name="fitness-center" size={24} color={PRIMARY} />
                <ThemedText type="heading3" style={styles.statValue}>
                  {gym._count?.classes || 0}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Занятий сегодня</ThemedText>
              </View>
              
              <View style={styles.statCard}>
                <MaterialIcons name="people" size={24} color={SECONDARY} />
                <ThemedText type="heading3" style={styles.statValue}>
                  {gym._count?.classTypes || 0}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Типов занятий</ThemedText>
              </View>
              
              <View style={styles.statCard}>
                <MaterialIcons name="schedule" size={24} color={SUCCESS} />
                <ThemedText type="heading3" style={styles.statValue}>
                  23:00
              </ThemedText>
                <ThemedText style={styles.statLabel}>Работает до</ThemedText>
              </View>
            </View>
          </View>



          {/* Удобства */}
          <View style={styles.amenitiesSection}>
            <ThemedText type="heading2" style={styles.sectionTitle}>
              Удобства
            </ThemedText>
            <View style={styles.amenitiesList}>
              {gym.features.length > 0 ? (
                gym.features.map((feature: any, index: number) => (
                <View key={index} style={styles.amenityItem}>
                  <View style={styles.amenityIcon}>
                    <MaterialIcons name={feature.icon} size={20} color={PRIMARY} />
                  </View>
                  <ThemedText style={styles.amenityText}>{feature.name}</ThemedText>
                </View>
                ))
              ) : (
                <View style={styles.amenityItem}>
                  <View style={styles.amenityIcon}>
                    <MaterialIcons name="info" size={20} color={TEXT_MUTED} />
                  </View>
                  <ThemedText style={[styles.amenityText, { color: TEXT_MUTED }]}>
                    Услуги не указаны
                  </ThemedText>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.showAllButton}>
              <ThemedText style={styles.showAllText}>Показать все</ThemedText>
              <Ionicons name="chevron-forward" size={16} color={PRIMARY} />
            </TouchableOpacity>
          </View>

          {/* Описание */}
          <View style={styles.descriptionSection}>
            <ThemedText type="heading2" style={styles.sectionTitle}>
              Описание
            </ThemedText>
            <ThemedText style={styles.description}>
              {gym.description}
            </ThemedText>
          </View>

          {/* Mini Map */}
          {(gym.latitude && gym.longitude) && (
            <View style={styles.mapSection}>
              <ThemedText type="heading2" style={styles.sectionTitle}>
                Расположение
              </ThemedText>
              <GymMap
                latitude={gym.latitude}
                longitude={gym.longitude}
                gymName={gym.name}
                gymAddress={gym.address}
                height={200}
                showMarker={true}
                zoomLevel={15}
              />
            </View>
          )}

          {/* Кнопка записи */}
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={styles.scheduleButton}
              onPress={() => {
                console.log('🚀 Navigating to booking page with id:', id);
                console.log('🚀 Navigation path:', `/gym/${id}/booking`);
                router.push(`/gym/${id}/booking`);
              }}
            >
              <ThemedText style={styles.scheduleButtonText}>
                Посмотреть расписание
              </ThemedText>
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
    backgroundColor: CARD_BG,
  },
  
  // Фиксированный header
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  
  scrollView: {
    flex: 1,
  },
  
  // Hero section с каруселью
  heroSection: {
    position: 'relative',
    height: 300,
  },
  carousel: {
    height: 300,
  },
  imageContainer: {
    width: screenWidth,
    height: 300,
  },
  carouselImage: {
    width: screenWidth,
    height: 300,
  },
  dotContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  
  // Header buttons
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  
  // Content
  content: {
    padding: 16,
  },
  
  // Gym info
  gymInfo: {
    marginBottom: 24,
  },
  gymHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gymName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_DARK,
    flex: 1,
    marginRight: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginLeft: 4,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    color: TEXT_MUTED,
    marginLeft: 8,
    flex: 1,
  },
  gisInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 24,
  },
  gisText: {
    fontSize: 12,
    color: SECONDARY,
    marginLeft: 4,
    fontFamily: 'SpaceMono-Regular',
    fontWeight: '500',
  },
  
  // Stats section
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statCard: {
    width: '30%', // Adjust as needed for 3 columns
    backgroundColor: BG,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  
  // Amenities section
  amenitiesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 16,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
  },
  amenityIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  amenityText: {
    fontSize: 16,
    color: TEXT_DARK,
    flex: 1,
  },
  showAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  showAllText: {
    fontSize: 16,
    color: PRIMARY,
    marginRight: 4,
  },
  
  // Description
  descriptionSection: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: TEXT_DARK,
    marginTop: 8,
  },

  // Map section
  mapSection: {
    marginBottom: 24,
  },
  
  // Action section
  actionSection: {
    marginBottom: 32,
  },
  scheduleButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  scheduleButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CARD_BG,
  },



  // Error styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: CARD_BG,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: TEXT_MUTED,
  },

});
