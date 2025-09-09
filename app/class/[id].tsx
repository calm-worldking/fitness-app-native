import { SimpleLoadingScreen } from '@/components/SimpleLoadingScreen';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { notificationService } from '@/lib/notifications';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// const { width: screenWidth } = Dimensions.get('window');

// Брендовые цвета BIRGE GO
const PRIMARY = '#FF6246';
// const SECONDARY = '#FF8843';
const BG = '#FFE7D8';
const CARD_BG = '#FFFFFF';
const TEXT_DARK = '#1A1A1A';
const TEXT_MUTED = '#737373';
const SUCCESS = '#4CAF50';
// const WARNING = '#FF9800';
// const ERROR = '#F44336';
const HEADER_DARK = '#0D1F2C';

interface ClassDetails {
  id: string;
  title: string;
  description?: string;
  coach?: string;
  startsAt: string;
  endsAt: string;
  capacity?: number;
  currentParticipants?: number;
  gym: {
    id: string;
    name: string;
    address?: string;
    photos: string[];
  };
  category: string;
  rating?: number;
  totalRatings?: number;
}

export default function ClassDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('🎯 ClassDetailScreen rendered with ID:', id);
  console.log('🎯 useLocalSearchParams result:', useLocalSearchParams());

  useEffect(() => {
    if (id) {
      loadClassDetails();
    }
  }, [id]);

  const loadClassDetails = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Loading class details for ID:', id);
      
      if (!id) {
        throw new Error('ID занятия не указан');
      }

      // Пытаемся загрузить данные через API
      try {
        console.log('📡 Fetching class data from API...');
        const classData = await api.fetchClass(id);
        console.log('✅ Class data received:', classData);
        
        // Преобразуем данные в формат ClassDetails
        const classDetailsData: ClassDetails = {
          id: classData.id,
          title: classData.title,
          description: classData.description || 'Описание занятия',
          coach: classData.coach || 'Тренер',
          startsAt: classData.startsAt,
          endsAt: classData.endsAt,
          capacity: classData.capacity || 20,
          currentParticipants: 3, // В реальном API это поле должно приходить
          gym: {
            id: classData.gym?.id || classData.gymId,
            name: classData.gym?.name || 'Спортзал',
            address: classData.gym?.address || 'Адрес зала',
            photos: ['https://via.placeholder.com/400x300/FF6246/FFFFFF?text=Gym+Photo'],
          },
          category: classData.title,
          rating: 9.8, // В реальном API это поле должно приходить
          totalRatings: 21532, // В реальном API это поле должно приходить
        };
        
        setClassDetails(classDetailsData);
      } catch (apiError) {
        console.error('❌ API недоступен:', apiError);
        Alert.alert('Ошибка', 'Не удалось загрузить информацию о занятии. Проверьте подключение к интернету.');
      }
    } catch (error) {
      console.error('💥 Failed to load class details:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить информацию о занятии');
    } finally {
      console.log('🏁 Loading finished');
      setLoading(false);
    }
  };

  const handleBookClass = () => {
    Alert.alert(
      'Записаться на занятие',
      `Вы уверены, что хотите записаться на "${classDetails?.title}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Записаться', 
          onPress: async () => {
            try {
              const bookingResult = await api.createBooking(classDetails?.id || '');
              console.log('📡 Booking created:', bookingResult);
              
              // Форматируем данные для страницы успеха
              const startDate = new Date(classDetails?.startsAt || '');
              const endDate = new Date(classDetails?.endsAt || '');
              
              const today = new Date();
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              
              let dateText = '';
              if (startDate.toDateString() === today.toDateString()) {
                dateText = 'Сегодня';
              } else if (startDate.toDateString() === tomorrow.toDateString()) {
                dateText = 'Завтра';
              } else {
                dateText = startDate.toLocaleDateString('ru-RU', { 
                  day: 'numeric', 
                  month: 'long' 
                });
              }
              
              const timeText = `${startDate.toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })} - ${endDate.toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}`;
              
              const durationMs = endDate.getTime() - startDate.getTime();
              const durationHours = Math.floor(durationMs / (60 * 60 * 1000));
              const durationMinutes = Math.floor((durationMs % (60 * 60 * 1000)) / (60 * 1000));
              const durationText = durationHours > 0 
                ? `${durationHours}ч ${durationMinutes > 0 ? durationMinutes + 'мин' : ''}`.trim()
                : `${durationMinutes}мин`;

              // Планируем уведомления о тренировке
              try {
                await notificationService.scheduleWorkoutReminders({
                  classId: classDetails?.id || '',
                  classTitle: classDetails?.title || '',
                  gymName: classDetails?.gym.name || '',
                  startTime: startDate,
                });
                console.log('📱 Уведомления о тренировке запланированы');
              } catch (notificationError) {
                console.log('⚠️ Не удалось запланировать уведомления:', notificationError);
                // Не блокируем процесс бронирования из-за ошибки уведомлений
              }
              
              // Перенаправляем на страницу успеха с данными
              router.push({
                pathname: '/booking-success',
                params: {
                  classTitle: classDetails?.title,
                  gymName: classDetails?.gym.name,
                  date: dateText,
                  time: timeText,
                  duration: durationText,
                  coach: classDetails?.coach,
                  bookingId: (bookingResult as any)?.id || 'unknown'
                }
              });
            } catch (error: any) {
              console.log('📱 Booking error:', error);
              Alert.alert('Ошибка', error.message || 'Не удалось записаться на занятие');
            }
          }
        }
      ]
    );
  };

  const handleGymPress = () => {
    if (classDetails?.gym.id) {
      router.push(`/gym/${classDetails.gym.id}`);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long',
      weekday: 'long'
    });
  };

  const getDuration = () => {
    if (!classDetails) return 0;
    const start = new Date(classDetails.startsAt);
    const end = new Date(classDetails.endsAt);
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  };

  if (loading) {
    return (
      <SimpleLoadingScreen message="Загружаем информацию о занятии..." />
    );
  }

  if (!classDetails) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar backgroundColor={HEADER_DARK} barStyle="light-content" />
        <View style={styles.errorContainer}>
          <ThemedText>Занятие не найдено</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={HEADER_DARK} barStyle="light-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText type="heading2" style={styles.headerTitle}>
          {classDetails.title}
        </ThemedText>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Фото зала */}
        <View style={styles.imageContainer}>
          <ExpoImage
            source={{ uri: classDetails.gym.photos[0] || 'https://via.placeholder.com/400x300/FF6246/FFFFFF?text=Gym+Photo' }}
            style={styles.gymImage}
            contentFit="cover"
            placeholder={require('@/assets/images/placeholder.jpg')}
          />
          <View style={styles.imageOverlay}>
            <View style={styles.recommendationBadge}>
              <MaterialIcons name="thumb-up" size={16} color={PRIMARY} />
              <ThemedText style={styles.recommendationText}>Рекомендуем</ThemedText>
            </View>
          </View>
        </View>

        {/* Основная информация */}
        <View style={styles.mainContent}>
          {/* Заголовок и рейтинг */}
          <View style={styles.titleSection}>
            <ThemedText type="heading1" style={styles.title}>
              {classDetails.title}
            </ThemedText>
            <View style={styles.ratingRow}>
              <View style={styles.ratingContainer}>
                <MaterialIcons name="star" size={20} color={SUCCESS} />
                <ThemedText style={styles.ratingText}>{classDetails.rating}</ThemedText>
              </View>
              <TouchableOpacity style={styles.categoryButton}>
                <ThemedText style={styles.categoryText}>{classDetails.category}</ThemedText>
                <Ionicons name="chevron-forward" size={16} color={TEXT_MUTED} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Участники */}
          <View style={styles.participantsSection}>
            <MaterialIcons name="group" size={20} color={PRIMARY} />
            <ThemedText style={styles.participantsText}>
              Идут {classDetails.currentParticipants} человека
            </ThemedText>
          </View>

          {/* Кнопки действий */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="map" size={24} color={TEXT_DARK} />
              <ThemedText style={styles.actionButtonText}>Карта</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="person-add" size={24} color={TEXT_DARK} />
              <ThemedText style={styles.actionButtonText}>Пригласить</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Прогресс посещений */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <ThemedText style={styles.progressText}>12 посещений из 12</ThemedText>
              <TouchableOpacity>
                <ThemedText style={styles.detailsLink}>Подробнее</ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '100%' }]} />
            </View>
            <ThemedText style={styles.progressSubtext}>
              Осталось здесь в этом месяце
            </ThemedText>
          </View>

          {/* Карточка зала */}
          <TouchableOpacity style={styles.gymCard} onPress={handleGymPress}>
            <ExpoImage
              source={{ uri: classDetails.gym.photos[0] || 'https://via.placeholder.com/60x60/FF6246/FFFFFF?text=Gym' }}
              style={styles.gymThumbnail}
              contentFit="cover"
            />
            <View style={styles.gymInfo}>
              <ThemedText type="defaultSemiBold" style={styles.gymName}>
                {classDetails.gym.name}
              </ThemedText>
              <View style={styles.gymRating}>
                <MaterialIcons name="star" size={16} color={SUCCESS} />
                <ThemedText style={styles.gymRatingText}>{classDetails.rating}</ThemedText>
              </View>
              <ThemedText style={styles.gymAddress}>{classDetails.gym.address}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
          </TouchableOpacity>

          {/* Рекомендация по времени */}
          <View style={styles.timeRecommendation}>
            <MaterialIcons name="access-time" size={20} color={PRIMARY} />
            <ThemedText style={styles.timeRecommendationText}>
              Советуем прийти на 15 минут раньше
            </ThemedText>
          </View>

          {/* Слот времени */}
          <View style={styles.timeSlot}>
            <View style={styles.timeInfo}>
              <ThemedText type="defaultSemiBold" style={styles.timeDate}>
                {formatDate(classDetails.startsAt)}
              </ThemedText>
              <View style={styles.timeDetails}>
                <ThemedText type="heading3" style={styles.timeText}>
                  {formatTime(classDetails.startsAt)}
                </ThemedText>
                <ThemedText style={styles.durationText}>{getDuration()} мин</ThemedText>
              </View>
            </View>
            <View style={styles.availabilityInfo}>
              <MaterialIcons name="person" size={16} color={TEXT_MUTED} />
              <ThemedText style={styles.availabilityText}>
                Осталось {classDetails.capacity && classDetails.currentParticipants ? 
                  classDetails.capacity - classDetails.currentParticipants : 37} мест
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
          </View>
        </View>
      </ScrollView>

      {/* Кнопка записи */}
      <View style={[styles.bottomButton, { paddingBottom: insets.bottom + 16 }]}>
        <Button 
          style={styles.bookButton}
          onPress={handleBookClass}
        >
          <ThemedText style={styles.bookButtonText}>Записаться</ThemedText>
        </Button>
        <ThemedText style={styles.availabilityBottomText}>
          Осталось {classDetails.capacity && classDetails.currentParticipants ? 
            classDetails.capacity - classDetails.currentParticipants : 37} мест
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CARD_BG,
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  shareButton: {
    padding: 4,
  },
  
  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  
  // Loading and Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Image
  imageContainer: {
    position: 'relative',
    height: 250,
  },
  gymImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  recommendationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recommendationText: {
    fontSize: 12,
    color: PRIMARY,
    fontWeight: '600',
    marginLeft: 4,
  },
  
  // Main Content
  mainContent: {
    padding: 16,
  },
  
  // Title Section
  titleSection: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: SUCCESS,
    marginLeft: 4,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    color: TEXT_DARK,
    fontWeight: '600',
    marginRight: 4,
  },
  
  // Participants
  participantsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  participantsText: {
    fontSize: 14,
    color: TEXT_DARK,
    marginLeft: 8,
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: BG,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    color: TEXT_DARK,
    fontWeight: '600',
    marginTop: 8,
  },
  
  // Progress
  progressSection: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: TEXT_DARK,
    fontWeight: '600',
  },
  detailsLink: {
    fontSize: 14,
    color: PRIMARY,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: BG,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: PRIMARY,
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  
  // Gym Card
  gymCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  gymThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  gymInfo: {
    flex: 1,
  },
  gymName: {
    fontSize: 16,
    color: TEXT_DARK,
    marginBottom: 4,
  },
  gymRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  gymRatingText: {
    fontSize: 14,
    color: SUCCESS,
    fontWeight: '600',
    marginLeft: 4,
  },
  gymAddress: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  
  // Time Recommendation
  timeRecommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  timeRecommendationText: {
    fontSize: 14,
    color: PRIMARY,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Time Slot
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: BG,
  },
  timeInfo: {
    flex: 1,
  },
  timeDate: {
    fontSize: 14,
    color: TEXT_DARK,
    marginBottom: 4,
  },
  timeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginRight: 8,
  },
  durationText: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  availabilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  availabilityText: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginLeft: 4,
  },
  
  // Bottom Button
  bottomButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: CARD_BG,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BG,
  },
  bookButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  bookButtonText: {
    color: CARD_BG,
    fontSize: 16,
    fontWeight: 'bold',
  },
  availabilityBottomText: {
    fontSize: 12,
    color: TEXT_MUTED,
    textAlign: 'center',
  },
});
