import { GymMap } from '@/components/GymMap';
import { ThemedView } from '@/components/ThemedView';
import { AppHeader } from '@/components/AppHeader';
import { api } from '@/lib/api';
import { shareInviteLink, copyInviteLink } from '@/lib/linking';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Брендовые цвета BIRGE GO
const PRIMARY = '#FF6246';
const BG = '#FFFFFF'; // Белый фон как на главной
const CARD_BG = '#FFFFFF';
const TEXT_DARK = '#000000';
const TEXT_MUTED = '#737373';
const HEADER_DARK = '#0D1F2C';
const SUCCESS = '#4CAF50';
const INFO = '#2196F3';
const SURFACE_LIGHT = '#F8F9FA';
const BORDER_LIGHT = '#E9ECEF';

interface BookedClass {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  gymName: string;
  gymAddress: string;
  gymRating: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  confirmedAt: string | null;
  canConfirm: boolean;
  canConfirmIn: number; // минуты до возможности подтверждения
  isPast: boolean;
  isUpcoming: boolean;
  isOngoing: boolean;
  location: {
    lat: number | null;
    lng: number | null;
  };
  startsAt: string; // Исходная дата для сортировки
}

export default function ScheduleScreen() {
  const [bookedClasses, setBookedClasses] = useState<BookedClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [showGoogleCalendarBanner, setShowGoogleCalendarBanner] = useState(true);

  // Загрузка реальных данных о бронированиях
  useEffect(() => {
    const loadBookings = async () => {
    try {
      setLoading(true);
        console.log('📡 Loading user bookings...');
        
        const result = await api.myBookings();
        
        console.log('📡 Bookings result:', JSON.stringify(result, null, 2));
        
        if (result.items && Array.isArray(result.items)) {
          const transformedBookings: BookedClass[] = result.items
            .filter((booking: any) => {
              // Проверяем структуру данных
              if (!booking.class || !booking.class.startsAt || !booking.class.endsAt) {
                console.log('📡 Invalid booking structure:', booking);
                return false;
              }
              return true;
            })
            .map((booking: any) => {
              console.log('📡 Processing booking:', JSON.stringify(booking, null, 2));
              
              const startDate = new Date(booking.class.startsAt);
              const endDate = new Date(booking.class.endsAt);
              const now = new Date();
              
              // Вычисляем время до возможности подтверждения (30 минут до начала)
              const confirmDeadline = new Date(startDate.getTime() - 30 * 60 * 1000);
              const canConfirmIn = Math.max(0, Math.floor((confirmDeadline.getTime() - now.getTime()) / (60 * 1000)));
              
              // Форматируем дату
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
              
              // Форматируем время
              const timeText = `${startDate.toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })} - ${endDate.toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}`;
              
              // Вычисляем длительность
              const durationMs = endDate.getTime() - startDate.getTime();
              const durationHours = Math.floor(durationMs / (60 * 60 * 1000));
              const durationMinutes = Math.floor((durationMs % (60 * 60 * 1000)) / (60 * 1000));
              const durationText = durationHours > 0 
                ? `${durationHours}ч ${durationMinutes > 0 ? durationMinutes + 'мин' : ''}`.trim()
                : `${durationMinutes}мин`;
          
          return {
                id: booking.id,
                title: booking.class.title,
                date: dateText,
                time: timeText,
                duration: durationText,
                gymName: booking.class.gym.name,
                gymAddress: booking.class.gym.address || '',
                gymRating: booking.class.gym.rating || 0,
                status: booking.status || 'pending',
                confirmedAt: booking.confirmedAt,
                canConfirm: booking.canConfirm || false,
                canConfirmIn,
                isPast: booking.isPast || false,
                isUpcoming: booking.isUpcoming || false,
                isOngoing: booking.isOngoing || false,
                location: {
                  lat: booking.class.gym.latitude || null,
                  lng: booking.class.gym.longitude || null,
                },
                startsAt: booking.class.startsAt, // Сохраняем исходную дату для сортировки
          };
        });
      
          // Сортируем занятия по времени начала (от ближайших к дальним)
          const sortedBookings = transformedBookings.sort((a, b) => {
            const dateA = new Date(a.startsAt);
            const dateB = new Date(b.startsAt);
            return dateA.getTime() - dateB.getTime();
          });
      
          setBookedClasses(sortedBookings);
        } else {
          setBookedClasses([]);
        }
      } catch (error) {
        console.log('📱 Failed to load bookings:', error);
      setBookedClasses([]);
    } finally {
      setLoading(false);
    }
      };
  
          loadBookings();
    }, []);

  // Обновляем данные при фокусе на экране
  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        try {
          setLoading(true);
          console.log('📡 Refreshing user bookings...');
          
          const result = await api.myBookings();
          
          if (result.items && Array.isArray(result.items)) {
            const transformedBookings: BookedClass[] = result.items.map((booking: any) => {
              const startDate = new Date(booking.class.startsAt);
              const endDate = new Date(booking.class.endsAt);
              const now = new Date();
              
              // Вычисляем время до возможности подтверждения (30 минут до начала)
              const confirmDeadline = new Date(startDate.getTime() - 30 * 60 * 1000);
              const canConfirmIn = Math.max(0, Math.floor((confirmDeadline.getTime() - now.getTime()) / (60 * 1000)));
              
              // Форматируем дату
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
              
              // Форматируем время
              const timeText = `${startDate.toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })} - ${endDate.toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}`;
              
              // Вычисляем длительность
              const durationMs = endDate.getTime() - startDate.getTime();
              const durationHours = Math.floor(durationMs / (60 * 60 * 1000));
              const durationMinutes = Math.floor((durationMs % (60 * 60 * 1000)) / (60 * 1000));
              const durationText = durationHours > 0 
                ? `${durationHours}ч ${durationMinutes > 0 ? durationMinutes + 'мин' : ''}`.trim()
                : `${durationMinutes}мин`;
              
              return {
                id: booking.id,
                title: booking.class.title,
                date: dateText,
                time: timeText,
                duration: durationText,
                gymName: booking.class.gym.name,
                gymAddress: booking.class.gym.address || '',
                gymRating: booking.class.gym.rating || 0,
                status: booking.status || 'pending',
                confirmedAt: booking.confirmedAt,
                canConfirm: booking.canConfirm || false,
                canConfirmIn,
                isPast: booking.isPast || false,
                isUpcoming: booking.isUpcoming || false,
                isOngoing: booking.isOngoing || false,
                location: {
                  lat: booking.class.gym.latitude || null,
                  lng: booking.class.gym.longitude || null,
                },
                startsAt: booking.class.startsAt, // Сохраняем исходную дату для сортировки
              };
            });
            
            // Сортируем занятия по времени начала (от ближайших к дальним)
            const sortedBookings = transformedBookings.sort((a, b) => {
              const dateA = new Date(a.startsAt);
              const dateB = new Date(b.startsAt);
              return dateA.getTime() - dateB.getTime();
            });
            
            setBookedClasses(sortedBookings);
          } else {
            setBookedClasses([]);
          }
        } catch (error) {
          console.log('📱 Failed to refresh bookings:', error);
          setBookedClasses([]);
        } finally {
          setLoading(false);
        }
      };
      
      refreshData();
    }, [])
  );

  const refreshBookings = async () => {
    try {
      setLoading(true);
      console.log('📡 Refreshing user bookings...');
      
      const result = await api.myBookings();
      
      if (result.items && Array.isArray(result.items)) {
        const transformedBookings: BookedClass[] = result.items.map((booking: any) => {
          const startDate = new Date(booking.class.startsAt);
          const endDate = new Date(booking.class.endsAt);
          const now = new Date();
          
          // Вычисляем время до возможности подтверждения (30 минут до начала)
          const confirmDeadline = new Date(startDate.getTime() - 30 * 60 * 1000);
          const canConfirmIn = Math.max(0, Math.floor((confirmDeadline.getTime() - now.getTime()) / (60 * 1000)));
          
          // Форматируем дату
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
          
          // Форматируем время
          const timeText = `${startDate.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })} - ${endDate.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}`;
          
          // Вычисляем длительность
          const durationMs = endDate.getTime() - startDate.getTime();
          const durationHours = Math.floor(durationMs / (60 * 60 * 1000));
          const durationMinutes = Math.floor((durationMs % (60 * 60 * 1000)) / (60 * 1000));
          const durationText = durationHours > 0 
            ? `${durationHours}ч ${durationMinutes > 0 ? durationMinutes + 'мин' : ''}`.trim()
            : `${durationMinutes}мин`;
          
          return {
            id: booking.id,
            title: booking.class.title,
            date: dateText,
            time: timeText,
            duration: durationText,
            gymName: booking.class.gym.name,
            gymAddress: booking.class.gym.address || '',
            gymRating: booking.class.gym.rating || 0,
            status: booking.status || 'pending',
            confirmedAt: booking.confirmedAt,
            canConfirm: booking.canConfirm || false,
            canConfirmIn,
            isPast: booking.isPast || false,
            isUpcoming: booking.isUpcoming || false,
            isOngoing: booking.isOngoing || false,
            location: {
              lat: booking.class.gym.latitude || 43.238949,
              lng: booking.class.gym.longitude || 76.889709,
            },
            startsAt: booking.class.startsAt, // Сохраняем исходную дату для сортировки
          };
        });
        
        // Сортируем занятия по времени начала (от ближайших к дальним)
        const sortedBookings = transformedBookings.sort((a, b) => {
          const dateA = new Date(a.startsAt);
          const dateB = new Date(b.startsAt);
          return dateA.getTime() - dateB.getTime();
        });
        
        setBookedClasses(sortedBookings);
      } else {
        setBookedClasses([]);
      }
    } catch (error) {
      console.log('📱 Failed to refresh bookings:', error);
      setBookedClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClass = async (classId: string) => {
    Alert.alert(
      'Отмена занятия',
      'Вы уверены, что хотите отменить это занятие?',
      [
        { text: 'Нет', style: 'cancel' },
        { 
          text: 'Отменить',
          style: 'destructive', 
          onPress: async () => {
            try {
              console.log('📡 Canceling booking:', classId);
              await api.cancelBooking(classId);
              
              // Обновляем список бронирований
              await refreshBookings();
              
              Alert.alert('Успешно', 'Занятие отменено!');
            } catch (error) {
              console.log('📱 Failed to cancel booking:', error);
              Alert.alert('Ошибка', 'Не удалось отменить занятие. Попробуйте еще раз.');
            }
          },
        },
      ]
    );
  };

  const handleConfirmClass = async (classId: string) => {
    Alert.alert(
      'Подтвердить занятие',
      'Подтвердите, что вы присутствуете на занятии',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Подтвердить',
          style: 'default', 
          onPress: async () => {
            try {
              console.log('📡 Confirming booking:', classId);
              await api.confirmBooking(classId);
              
              // Обновляем список бронирований
              await refreshBookings();
              
              Alert.alert('Успешно', 'Занятие подтверждено! Ваш стрик обновлён.');
            } catch (error) {
              console.log('📱 Failed to confirm booking:', error);
              Alert.alert('Ошибка', 'Не удалось подтвердить занятие. Попробуйте еще раз.');
            }
          },
        },
      ]
    );
  };

  const handleInvite = (classId: string) => {
    const classData = bookedClasses.find(cls => cls.id === classId);
    if (!classData) {
      Alert.alert('Ошибка', 'Информация о занятии не найдена');
      return;
    }

    Alert.alert(
      'Пригласить друга',
      'Выберите способ отправки приглашения',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Поделиться',
          onPress: () => {
            shareInviteLink({
              classId: classData.id,
              className: classData.title,
              gymName: classData.gymName,
              date: classData.date,
              time: classData.time,
              duration: classData.duration,
            });
          },
        },
        {
          text: 'Скопировать ссылку',
          onPress: () => {
            copyInviteLink({
              classId: classData.id,
              className: classData.title,
              gymName: classData.gymName,
              date: classData.date,
              time: classData.time,
              duration: classData.duration,
            });
          },
        },
      ]
    );
  };






  return (
    <ThemedView style={styles.container}>
      <StatusBar backgroundColor={HEADER_DARK} barStyle="light-content" translucent={false} />
      
      {/* Header */}
      <AppHeader />

      {/* Page Title */}
      <View style={styles.pageTitleContainer}>
        <Text style={styles.pageTitle}>
          Расписание
        </Text>
        </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <MaterialIcons name="schedule" size={48} color={PRIMARY} />
            <Text style={styles.loadingText}>Загрузка расписания...</Text>
          </View>
        ) : (
          <>
            {/* Google Calendar Banner */}
            {showGoogleCalendarBanner && (
          <View style={styles.calendarBanner}>
            <View style={styles.calendarBannerContent}>
                            <View style={styles.googleCalendarIcon}>
                <Text style={styles.calendarIconText}>
                  {new Date().getDate()}
                </Text>
              </View>
              <Text style={styles.calendarBannerText}>
                Не забудьте добавить занятия в свой календарь
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowGoogleCalendarBanner(false)}
            >
              <MaterialIcons name="close" size={20} color={TEXT_MUTED} />
            </TouchableOpacity>
          </View>
        )}

        {/* Date Indicator */}
        <View style={styles.dateIndicator}>
          <Text style={styles.dateText}>
            Сегодня {new Date().toLocaleDateString('ru-RU', { 
              day: 'numeric', 
              month: 'long' 
            })}
          </Text>
        </View>

        {/* Booked Classes */}
        {bookedClasses.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="event-busy" size={64} color={TEXT_MUTED} />
            <Text style={styles.emptyTitle}>Нет забронированных занятий</Text>
            <Text style={styles.emptySubtitle}>
              Забронируйте занятие, чтобы оно появилось здесь
            </Text>
          </View>
        ) : (
          bookedClasses.map((bookedClass) => (
            <View key={bookedClass.id} style={styles.classCard}>
              {/* Class Title */}
              <Text style={styles.classTitle}>{bookedClass.title}</Text>

              {/* Date and Time */}
              <View style={styles.timeInfo}>
                <View style={styles.timeItem}>
                  <MaterialIcons name="event" size={16} color={INFO} />
                  <Text style={styles.timeText}>{bookedClass.date}</Text>
                </View>
                <View style={styles.timeItem}>
                  <MaterialIcons name="access-time" size={16} color={INFO} />
                  <Text style={styles.timeText}>{bookedClass.time}</Text>
                </View>
              </View>

              {/* Confirmation Message */}
              {bookedClass.canConfirmIn > 0 && (
                <View style={styles.confirmationBox}>
                  <Text style={styles.confirmationText}>
                    Подтвердите занятие в течение 30 минут до его начала или в указанном интервале времени
                  </Text>
                </View>
              )}

              {/* Gym Info */}
              <View style={styles.gymInfo}>
                <View style={styles.gymHeader}>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>{bookedClass.gymRating}</Text>
                    <MaterialIcons name="star" size={12} color={SUCCESS} />
                  </View>
                  <Text style={styles.gymName}>{bookedClass.gymName}</Text>
                </View>
                <View style={styles.addressContainer}>
                  <MaterialIcons name="location-on" size={16} color={TEXT_MUTED} />
                  <Text style={styles.addressText}>{bookedClass.gymAddress}</Text>
                </View>
              </View>

              {/* Mini Map */}
              {bookedClass.location && bookedClass.location.lat && bookedClass.location.lng && (
                <View style={styles.miniMapContainer}>
                  <GymMap
                    latitude={bookedClass.location.lat}
                    longitude={bookedClass.location.lng}
                    gymName={bookedClass.gymName}
                    gymAddress={bookedClass.gymAddress}
                    height={120}
                    showMarker={true}
                    zoomLevel={15}
                  />
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {/* Кнопка подтверждения - показываем только для pending занятий */}
                {bookedClass.status === 'pending' && (
                  <TouchableOpacity 
                    style={[
                      styles.confirmButton,
                      !bookedClass.canConfirm && styles.confirmButtonDisabled
                    ]}
                    onPress={() => handleConfirmClass(bookedClass.id)}
                    disabled={!bookedClass.canConfirm}
                  >
                    <Text style={styles.confirmButtonText}>
                      {bookedClass.canConfirm ? 'Подтвердить занятие' : 
                       bookedClass.canConfirmIn > 0 ? `Подтвердить через ${bookedClass.canConfirmIn} мин` :
                       'Подтверждение недоступно'}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Статус подтверждённого занятия */}
                {bookedClass.status === 'confirmed' && (
                  <View style={styles.confirmedStatus}>
                    <MaterialIcons name="check-circle" size={20} color={SUCCESS} />
                    <Text style={styles.confirmedText}>
                      Занятие подтверждено
                    </Text>
                  </View>
                )}

                {/* Кнопка отмены - показываем для pending занятий, которые еще не начались */}
                {bookedClass.status === 'pending' && !bookedClass.isPast && (
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => handleCancelClass(bookedClass.id)}
                  >
                    <Text style={styles.cancelButtonText}>
                      Отменить занятие
                    </Text>
                  </TouchableOpacity>
                )}

                <View style={styles.secondaryActions}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => handleInvite(bookedClass.id)}
                  >
                    <MaterialIcons name="person-add" size={20} color={PRIMARY} />
                    <Text style={styles.secondaryButtonText}>Позвать</Text>
                  </TouchableOpacity>
                </View>
        </View>
            </View>
          ))
        )}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
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
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  calendarBanner: {
    backgroundColor: '#FFF8F0',
    margin: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE4D1',
    shadowColor: '#FF6246',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  calendarBannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleCalendarIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#4285F4',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  calendarIconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  calendarBannerText: {
    flex: 1,
    fontSize: 14,
    color: TEXT_DARK,
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
  },
  dateIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: SURFACE_LIGHT,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_DARK,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_DARK,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 24,
  },
  classCard: {
    backgroundColor: CARD_BG,
    margin: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  classTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 12,
    lineHeight: 24,
  },
  timeInfo: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    color: INFO,
    fontWeight: '500',
  },
  confirmationBox: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  confirmationText: {
    fontSize: 13,
    color: INFO,
    lineHeight: 18,
  },
  gymInfo: {
    marginBottom: 16,
  },
  gymHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: SUCCESS,
  },
  gymName: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_DARK,
    flex: 1,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressText: {
    fontSize: 14,
    color: TEXT_MUTED,
    flex: 1,
  },
  miniMapContainer: {
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  actionButtons: {
    gap: 12,
  },
  confirmButton: {
    backgroundColor: SUCCESS,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  confirmButtonText: {
    color: CARD_BG,
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: CARD_BG,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    gap: 8,
  },
  confirmedText: {
    color: SUCCESS,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: TEXT_DARK,
    fontWeight: '500',
  },
  buttonDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
  },
}); 