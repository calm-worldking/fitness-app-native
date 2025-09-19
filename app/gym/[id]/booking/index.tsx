import { ParticipantsList } from '@/components/ParticipantsList';
import { SimpleLoadingScreen } from '@/components/SimpleLoadingScreen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { api, fetchClasses, fetchGym } from '@/lib/api';
import { notificationService } from '@/lib/notifications';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useMemo } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

// const { width: screenWidth } = Dimensions.get('window');

// Брендовые цвета BIRGE GO
const PRIMARY = '#FF6246';
const SECONDARY = '#FF8843';
const BG = '#FFE7D8';
const CARD_BG = '#FFFFFF';
const TEXT_DARK = '#000000';
const TEXT_MUTED = '#737373';
const SUCCESS = '#4CAF50';
// const WARNING = '#FF9800';
const ERROR = '#F44336';
const INFO = '#2196F3';
const HEADER_DARK = '#0D1F2C';
const SURFACE_LIGHT = '#F8F9FA';
const BORDER_LIGHT = '#E9ECEF';
const ACCENT_BG = '#FFF5F2';

// Дни недели (названия для локализации)
const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const DAY_FULL_NAMES = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

// Тип для занятия с дополнительными полями
interface ClassWithParticipants {
  id: string;
  title: string;
  type: string;
  startsAt: string;
  endsAt: string;
  coach: string;
  capacity: number;
  currentParticipants: number;
  description: string;
  participants: { id: string; name: string; avatar: string | null }[];
  isBooked: boolean;
  canBook: boolean;
}

export default function BookingPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { activeSubscription } = useSubscription();
  const [gym, setGym] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0); // Начинаем с сегодняшнего дня
  // const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Загружаем данные зала и занятий
        const [gymData, classesData] = await Promise.all([
          fetchGym(id as string),
          fetchClasses({ gymId: id as string })
        ]);

        if (gymData) {
          setGym(gymData);
        }

        if (classesData && classesData.items && classesData.items.length > 0) {
          console.log('📅 Classes data from server:', classesData.items);
          console.log('📅 First class structure:', classesData.items[0]);
          
          // Логируем все даты занятий для отладки
          classesData.items.forEach((cls: any, index: number) => {
            const classDate = new Date(cls.startsAt);
            console.log(`📅 Class ${index + 1}:`, {
              title: cls.title,
              startsAt: cls.startsAt,
              localDate: classDate.toLocaleDateString('ru-RU'),
              localTime: classDate.toLocaleTimeString('ru-RU'),
              dayOfWeek: classDate.getDay(),
              dayName: DAY_NAMES[classDate.getDay() === 0 ? 6 : classDate.getDay() - 1]
            });
          });
          
          // Преобразуем данные API в формат с участниками
          const classesWithParticipants: ClassWithParticipants[] = classesData.items.map((cls: any) => ({
            id: cls.id,
            title: cls.title,
            type: cls.type || cls.title,
            startsAt: cls.startsAt,
            endsAt: cls.endsAt,
            coach: cls.coach || 'Тренер не указан',
            capacity: cls.capacity || 20,
            currentParticipants: cls._count?.bookings || 0,
            description: cls.description || cls.title,
            participants: cls.bookings?.map((booking: any) => ({
              id: booking.userEmail,
              name: booking.userEmail.split('@')[0] || 'Участник',
              avatar: null, // Пока без аватаров
            })) || [],
            isBooked: false, // Будет определено отдельно
            canBook: true
          }));
          
          console.log('🏋️ Classes with participants:', classesWithParticipants);
          setClasses(classesWithParticipants);
        } else {
          console.log('📅 No classes data available');
          setClasses([]);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  // Загружаем статус бронирований для занятий
  useEffect(() => {
    const loadBookingStatus = async () => {
      if (classes.length === 0) return;

      try {
        console.log('🔍 Loading user bookings to determine booking status...');
        const userBookings = await api.myBookings();

        if (userBookings.items) {
          setClasses(prevClasses =>
            prevClasses.map(cls => {
              // Проверяем, забронировано ли это занятие пользователем
              const isBooked = userBookings.items.some((booking: any) => booking.classId === cls.id);

              return {
                ...cls,
                isBooked,
                canBook: !isBooked && cls.currentParticipants < cls.capacity
              };
            })
          );
          console.log('✅ Booking status updated for classes');
        }
      } catch (error: any) {
        console.error('Failed to load booking status:', error);

        // Если проблема с аутентификацией, просто логируем, но не показываем алерт
        if (!error.message?.includes('Unauthorized') && !error.message?.includes('401')) {
          console.warn('Could not load booking status, proceeding without user bookings data');
        }
      }
    };

    loadBookingStatus();
  }, [classes.length]);

  // Получаем дату для выбранного дня (текущий день + следующие 6 дней)
  const getDateForDay = useMemo(() => {
    return (dayIndex: number) => {
      const today = new Date();
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + dayIndex);
      return targetDate;
    };
  }, []);

  // Получаем правильное название дня недели для даты
  const getDayNameForDate = useMemo(() => {
    return (date: Date) => {
      // В JavaScript getDay() возвращает 0 для воскресенья, 1 для понедельника и т.д.
      // Нам нужно преобразовать это в наш формат: 0 = Пн, 1 = Вт, ..., 6 = Вс
      const dayOfWeek = date.getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Воскресенье (0) становится 6, Понедельник (1) становится 0
      return DAY_NAMES[adjustedDay];
    };
  }, []);

  // Получаем полное название дня недели для даты
  const getFullDayNameForDate = useMemo(() => {
    return (date: Date) => {
      const dayOfWeek = date.getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      return DAY_FULL_NAMES[adjustedDay];
    };
  }, []);

  // Вычисляем выбранную дату с помощью useMemo для стабильности
  const selectedDateObj = useMemo(() => {
    const today = new Date();
    const selectedDate = new Date(today);
    selectedDate.setDate(today.getDate() + selectedDay);
    const dayName = getDayNameForDate(selectedDate);
    const fullDayName = getFullDayNameForDate(selectedDate);
    console.log('📅 Selected day index:', selectedDay, 'Selected date:', selectedDate.toLocaleDateString('ru-RU'), 'Day name:', dayName, 'Full day name:', fullDayName);
    return selectedDate;
  }, [selectedDay, getDayNameForDate, getFullDayNameForDate]);

  // Создаем строку даты в локальном времени для сравнения
  const selectedDateString = selectedDateObj.getFullYear() + '-' + 
    String(selectedDateObj.getMonth() + 1).padStart(2, '0') + '-' + 
    String(selectedDateObj.getDate()).padStart(2, '0');

  // Фильтруем занятия по выбранной дате
  const filteredClasses = classes.filter((cls: any) => {
    const classDate = new Date(cls.startsAt);
    // Используем локальное время для сравнения дат
    const classDateString = classDate.getFullYear() + '-' + 
      String(classDate.getMonth() + 1).padStart(2, '0') + '-' + 
      String(classDate.getDate()).padStart(2, '0');
    
    const matches = classDateString === selectedDateString;
    console.log('📅 Date comparison:', {
      classTitle: cls.title,
      classDate: classDateString,
      classDateFull: classDate.toLocaleDateString('ru-RU'),
      selectedDate: selectedDateString,
      selectedDateFull: selectedDateObj.toLocaleDateString('ru-RU'),
      matches: matches
    });
    return matches;
  });

  // Группируем занятия по типу
  const groupedClasses = filteredClasses.reduce((acc: any, cls: any) => {
    const type = cls.type || cls.title || 'Другое';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(cls);
    return acc;
  }, {});

  // Определяем статус занятия с улучшенной логикой
  const getClassStatus = (cls: any) => {
    const now = new Date();
    const classStart = new Date(cls.startsAt);
    const classEnd = new Date(cls.endsAt);
    
    // Проверяем, идет ли занятие сейчас
    if (now >= classStart && now <= classEnd) {
      return 'ongoing'; // Идет сейчас
    }
    
    // Проверяем, завершено ли занятие
    if (now > classEnd) {
      return 'completed'; // Завершено
    }
    
    // Проверяем, начинается ли занятие в ближайшие 24 часа
    const timeDiff = classStart.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff <= 24 && hoursDiff > 0) {
      return 'available'; // Доступно для записи (ближайшие 24 часа)
    } else if (hoursDiff > 24) {
      return 'upcoming'; // Предстоящее (более чем через 24 часа)
    }
    
    return 'completed'; // По умолчанию считаем завершенным
  };

  // Цвета для статусов
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return TEXT_MUTED;
      case 'ongoing': return SUCCESS;
      case 'available': return PRIMARY;
      case 'upcoming': return INFO; // Используем синий цвет для предстоящих занятий
      default: return TEXT_MUTED;
    }
  };

  // Текст для статусов
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Завершено';
      case 'ongoing': return 'Идет сейчас';
      case 'available': return 'Доступно';
      case 'upcoming': return 'Записаться'; // Более понятный текст для предстоящих занятий
      default: return 'Неизвестно';
    }
  };

  // Функция для проверки дублирования регистраций
  const checkDuplicateBooking = (classType: string, date: Date) => {
    const userBookings = classes.filter(cls => 
      cls.isBooked && 
      cls.type === classType &&
      new Date(cls.startsAt).toDateString() === date.toDateString()
    );
    return userBookings.length > 0;
  };

  // Функция для проверки возможности бронирования
  const canBookClass = (cls: any) => {
    if (!cls.canBook) return false;
    if (cls.currentParticipants >= cls.capacity) return false;
    
    const classDate = new Date(cls.startsAt);
    const isDuplicate = checkDuplicateBooking(cls.type, classDate);
    
    return !isDuplicate;
  };

  const handleBookClass = async (classId: string) => {
    // Проверяем, заморожена ли подписка
    if ((activeSubscription as any)?.isFrozen) {
      Alert.alert(
        'Абонемент заморожен',
        'Во время заморозки вы не можете записываться на занятия. Дождитесь окончания заморозки или обратитесь в поддержку.',
        [{ text: 'Понятно', style: 'default' }]
      );
      return;
    }

    // Проверяем, есть ли активная подписка
    if (!activeSubscription) {
      Alert.alert(
        'Нет активной подписки',
        'Для записи на занятия необходима активная подписка. Оформите абонемент во вкладке "Абонемент".',
        [{ text: 'Понятно', style: 'default' }]
      );
      return;
    }

    const selectedClass = classes.find(cls => cls.id === classId);
    if (!selectedClass) return;

    // Проверяем дублирование
    const classDate = new Date(selectedClass.startsAt);
    const isDuplicate = checkDuplicateBooking(selectedClass.type, classDate);
    
    if (isDuplicate) {
      Alert.alert(
        'Ошибка бронирования',
        'Вы уже записаны на занятие этого типа в этот день. Один человек может зарегистрироваться только один раз в день на занятие одного типа.',
        [{ text: 'Понятно', style: 'default' }]
      );
      return;
    }

    // Проверяем доступность мест
    if (selectedClass.currentParticipants >= selectedClass.capacity) {
      Alert.alert(
        'Мест нет',
        'К сожалению, на это занятие больше нет свободных мест.',
        [{ text: 'Понятно', style: 'default' }]
      );
      return;
    }

    // Показываем диалог подтверждения
    Alert.alert(
      'Записаться на занятие',
      `Вы уверены, что хотите записаться на "${selectedClass.title}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Записаться', 
          onPress: async () => {
            try {
              console.log('🎯 Booking class:', classId);

              // Создаем бронирование через API
              const bookingResult = await api.createBooking(classId);

              // Форматируем данные для страницы успеха
              // Правильно обрабатываем время - startsAt приходит в UTC, нужно учесть локальную зону
              const startDate = new Date(selectedClass.startsAt);
              const endDate = new Date(selectedClass.endsAt);
              
              console.log('📅 Booking notification timing:', {
                startsAt: selectedClass.startsAt,
                startDate: startDate.toISOString(),
                localStartDate: startDate.toLocaleString('ru-RU'),
                now: new Date().toLocaleString('ru-RU'),
                timeUntilStart: Math.floor((startDate.getTime() - new Date().getTime()) / (1000 * 60)) + ' минут'
              });
              
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

              // После успешного бронирования обновляем статус бронирований
              const userBookings = await api.myBookings();
              if (userBookings.items) {
                setClasses(prevClasses =>
                  prevClasses.map(cls => {
                    const isBooked = userBookings.items.some((booking: any) => booking.classId === cls.id);
                    return {
                      ...cls,
                      isBooked,
                      canBook: !isBooked && cls.currentParticipants < cls.capacity
                    };
                  })
                );
              }

              // Обновляем состояние локально с текущим пользователем
              setClasses(prevClasses =>
                prevClasses.map(cls =>
                  cls.id === classId
                    ? {
                        ...cls,
                        isBooked: true,
                        canBook: false,
                        currentParticipants: cls.currentParticipants + 1,
                        participants: [
                          ...cls.participants,
                          { id: 'current-user', name: 'Вы', avatar: null }
                        ]
                      }
                    : cls
                )
              );

              // Планируем уведомления о тренировке
              try {
                await notificationService.scheduleWorkoutReminders({
                  classId: selectedClass.id,
                  classTitle: selectedClass.title,
                  gymName: gym?.name || 'Название зала',
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
                  classTitle: selectedClass.title,
                  gymName: gym?.name || 'Название зала',
                  date: dateText,
                  time: timeText,
                  duration: durationText,
                  coach: selectedClass.coach,
                  bookingId: (bookingResult as any)?.id || 'unknown'
                }
              });
            } catch (error: any) {
              console.error('Failed to book class:', error);

              // Проверяем, является ли ошибка проблемой аутентификации
              if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
                Alert.alert(
                  'Требуется авторизация',
                  'Пожалуйста, войдите в систему для бронирования занятий.',
                  [
                    { text: 'Войти', onPress: () => router.push('/auth/login') },
                    { text: 'Отмена', style: 'cancel' }
                  ]
                );
              } else {
                Alert.alert(
                  'Ошибка',
                  error.message || 'Не удалось записаться на занятие. Попробуйте еще раз.',
                  [{ text: 'Понятно', style: 'default' }]
                );
              }
            }
          }
        }
      ]
    );
  };

  const handleCancelBooking = async (classId: string) => {
    try {
      console.log('❌ Canceling booking for class:', classId);

      // Получаем список бронирований пользователя, чтобы найти ID бронирования для этого занятия
      const userBookings = await api.myBookings();

      // Находим бронирование для этого занятия
      const booking = userBookings.items?.find((b: any) => b.classId === classId);

      if (!booking) {
        throw new Error('Бронирование не найдено');
      }

      // Отменяем бронирование через API
      await api.cancelBooking(booking.id);

      // Отменяем уведомления о тренировке
      try {
        await notificationService.cancelWorkoutReminders(classId);
        console.log('📱 Уведомления о тренировке отменены');
      } catch (notificationError) {
        console.log('⚠️ Не удалось отменить уведомления:', notificationError);
        // Не блокируем процесс отмены из-за ошибки уведомлений
      }

      // Обновляем состояние локально, удаляя текущего пользователя
      setClasses(prevClasses =>
        prevClasses.map(cls =>
          cls.id === classId
            ? {
                ...cls,
                isBooked: false,
                canBook: true,
                currentParticipants: cls.currentParticipants - 1,
                participants: cls.participants.filter((p: any) => p.id !== 'current-user')
              }
            : cls
        )
      );

      Alert.alert(
        'Отменено',
        'Бронирование отменено.',
        [{ text: 'Понятно', style: 'default' }]
      );
    } catch (error: any) {
      console.error('Failed to cancel booking:', error);

      // Проверяем, является ли ошибка проблемой аутентификации
      if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
        Alert.alert(
          'Требуется авторизация',
          'Пожалуйста, войдите в систему для отмены бронирования.',
          [
            { text: 'Войти', onPress: () => router.push('/auth/login') },
            { text: 'Отмена', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert(
          'Ошибка',
          error.message || 'Не удалось отменить бронирование. Попробуйте еще раз.',
          [{ text: 'Понятно', style: 'default' }]
        );
      }
    }
  };

  if (loading) {
    return <SimpleLoadingScreen message="Загружаем расписание..." />;
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar backgroundColor={HEADER_DARK} barStyle="light-content" translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Расписание</ThemedText>
        <View style={styles.headerRight} />
      </View>

      {/* Gym Info */}
      {gym && (
        <View style={styles.gymInfo}>
          <ThemedText style={styles.gymName}>{gym.name}</ThemedText>
          <ThemedText style={styles.gymAddress}>{gym.address}</ThemedText>
        </View>
      )}

      {/* Days Selector */}
      <View style={styles.daysContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScrollContent}>
          {Array.from({ length: 7 }, (_, index) => {
            const date = getDateForDay(index);
            const dayName = getDayNameForDate(date);
            const isSelected = selectedDay === index;
            const isToday = index === 0;
            
            return (
              <TouchableOpacity
                key={index}
                style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                onPress={() => setSelectedDay(index)}
              >
                <ThemedText style={[styles.dayName, isSelected && styles.dayNameSelected]}>
                  {dayName}
                </ThemedText>
                <ThemedText style={[styles.dayDate, isSelected && styles.dayDateSelected]}>
                  {date.getDate()}
                </ThemedText>
                {isToday && <View style={styles.todayIndicator} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Classes List */}
      <ScrollView style={styles.classesContainer} showsVerticalScrollIndicator={false}>
        {Object.keys(groupedClasses).length === 0 ? (
          <View style={styles.noClassesContainer}>
            <ThemedText style={styles.noClassesText}>
              На {getFullDayNameForDate(selectedDateObj).toLowerCase()}, {selectedDateObj.toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'long'
              })} занятий нет
            </ThemedText>
            <ThemedText style={styles.noClassesSubtext}>
              Выберите другую дату или попробуйте позже
            </ThemedText>
          </View>
        ) : (
          Object.entries(groupedClasses).map(([type, typeClasses]) => (
          <View key={type} style={styles.classTypeSection}>
                         <View style={styles.classTypeHeader}>
               <View style={styles.classTypeInfo}>
                 <ThemedText style={styles.classTypeTitle}>{type}</ThemedText>
                 <ThemedText style={styles.classTypeDuration}>
                   {(typeClasses as any[])[0]?.startsAt && (typeClasses as any[])[0]?.endsAt ? 
                     Math.floor((new Date((typeClasses as any[])[0].endsAt).getTime() - new Date((typeClasses as any[])[0].startsAt).getTime()) / (1000 * 60)) : 0} мин
                 </ThemedText>
               </View>
               <View style={styles.classTypeCountContainer}>
                 <ThemedText style={styles.classTypeCount}>{(typeClasses as any[]).length} занятий</ThemedText>
               </View>
             </View>

                         <View style={styles.timeSlotsGrid}>
               {(typeClasses as any[]).map((cls: any) => {
                 const status = getClassStatus(cls);
                 const statusColor = getStatusColor(status);
                 const statusText = getStatusText(status);
                 const isAvailable = status === 'available' || status === 'ongoing' || status === 'upcoming';
                 const duration = cls.startsAt && cls.endsAt ? 
                   Math.floor((new Date(cls.endsAt).getTime() - new Date(cls.startsAt).getTime()) / (1000 * 60)) : 0;

                 return (
                   <View key={cls.id} style={styles.timeSlotCard}>
                     <View style={styles.timeSlotHeader}>
                       <View style={styles.timeInfo}>
                         <ThemedText style={styles.timeSlotTime}>
                           {cls.startsAt ? new Date(cls.startsAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                         </ThemedText>
                         <ThemedText style={styles.timeSlotDuration}>
                           {duration} мин
                         </ThemedText>
                       </View>
                       <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                         <ThemedText style={[styles.statusText, { color: statusColor }]}>
                           {statusText}
                         </ThemedText>
                       </View>
                     </View>
                     
                     <ThemedText style={styles.timeSlotTitle}>
                       {cls.title}
                     </ThemedText>
                     
                     <View style={styles.coachInfo}>
                       <Ionicons name="person" size={14} color={TEXT_MUTED} />
                       <ThemedText style={styles.timeSlotCoach}>
                         {cls.coach}
                       </ThemedText>
                     </View>
                     
                     {/* Статистика занятости */}
                     <View style={styles.occupancySection}>
                       <View style={styles.occupancyBar}>
                         <View 
                           style={[
                             styles.occupancyProgress, 
                             { 
                               width: `${Math.min((cls.currentParticipants || 0) / (cls.capacity || 20) * 100, 100)}%`,
                               backgroundColor: (cls.currentParticipants || 0) >= (cls.capacity || 20) ? ERROR : PRIMARY
                             }
                           ]} 
                         />
                       </View>
                       <ThemedText style={styles.occupancyText}>
                         {cls.currentParticipants || 0} из {cls.capacity || 20} мест занято
                       </ThemedText>
                     </View>

                     {/* Участники */}
                     {cls.participants && cls.participants.length > 0 && (
                       <View style={styles.participantsSection}>
                         <ThemedText style={styles.participantsTitle}>
                           Участники ({cls.participants.length}):
                         </ThemedText>
                         <ParticipantsList
                           participants={cls.participants}
                           maxVisible={5}
                           totalCount={cls.participants.length}
                         />
                       </View>
                     )}

                     <View style={styles.timeSlotFooter}>
                       <View style={styles.participantsInfo}>
                         <Ionicons name="people" size={14} color={TEXT_MUTED} />
                         <ThemedText style={styles.participantsText}>
                           {cls.currentParticipants || 0}/{cls.capacity || 20}
                         </ThemedText>
                       </View>
                       
                       {cls.isBooked ? (
                         <TouchableOpacity 
                           style={[styles.bookButton, styles.cancelButton]}
                           onPress={() => handleCancelBooking(cls.id)}
                         >
                           <ThemedText style={styles.cancelButtonText}>Отменить</ThemedText>
                         </TouchableOpacity>
                       ) : isAvailable && canBookClass(cls) ? (
                         <TouchableOpacity 
                           style={styles.bookButton}
                           onPress={() => handleBookClass(cls.id)}
                         >
                           <ThemedText style={styles.bookButtonText}>Записаться</ThemedText>
                         </TouchableOpacity>
                       ) : (
                         <View style={[styles.bookButton, styles.disabledButton]}>
                           <ThemedText style={styles.disabledButtonText}>
                             {!canBookClass(cls) ? 'Недоступно' : 'Мест нет'}
                           </ThemedText>
                         </View>
                       )}
                     </View>
                   </View>
                 );
               })}
             </View>
           </View>
         ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: HEADER_DARK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  gymInfo: {
    padding: 8,
    backgroundColor: BG,
  },
  gymName: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 1,
  },
  gymAddress: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  daysContainer: {
    backgroundColor: CARD_BG,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_LIGHT,
  },
  daysScrollContent: {
    paddingHorizontal: 16,
  },
  dayButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: SURFACE_LIGHT,
    width: 56,
    height: 56,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  dayButtonSelected: {
    backgroundColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    borderColor: PRIMARY,
  },
  dayName: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginBottom: 2,
    fontWeight: '500',
  },
  dayNameSelected: {
    color: '#FFFFFF',
  },
  dayDate: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  dayDateSelected: {
    color: '#FFFFFF',
  },
  todayIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SUCCESS,
  },
  classesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  classTypeSection: {
    marginBottom: 24,
  },
  classTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  classTypeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 0,
  },
  classTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  classTypeDuration: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  classTypeCountContainer: {
    alignItems: 'flex-end',
  },
  classTypeCount: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  timeSlotsGrid: {
    gap: 12,
    marginBottom: 8,
  },
  timeSlotCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  timeSlotCardDisabled: {
    opacity: 0.6,
    backgroundColor: '#F8F8F8',
  },
  timeSlotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  timeInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  timeSlotTime: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 2,
  },
  timeSlotTimeDisabled: {
    color: TEXT_MUTED,
  },
  timeSlotDuration: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  timeSlotDurationDisabled: {
    color: TEXT_MUTED,
  },
  timeSlotTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  timeSlotTitleDisabled: {
    color: TEXT_MUTED,
  },
  timeSlotCoach: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginLeft: 4,
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: SURFACE_LIGHT,
    borderRadius: 8,
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: SURFACE_LIGHT,
    borderRadius: 8,
  },
  timeSlotCoachDisabled: {
    color: TEXT_MUTED,
  },
  timeSlotFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  participantsText: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  participantsTextDisabled: {
    color: TEXT_MUTED,
  },
  bookButton: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: PRIMARY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  noClassesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  noClassesText: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_DARK,
    textAlign: 'center',
    marginBottom: 12,
  },
  noClassesSubtext: {
    fontSize: 16,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Новые стили для улучшенных карточек
  occupancySection: {
    marginVertical: 12,
  },
  occupancyBar: {
    height: 6,
    backgroundColor: SURFACE_LIGHT,
    borderRadius: 3,
    overflow: 'hidden',
  },
  occupancyProgress: {
    height: '100%',
    borderRadius: 3,
  },
  occupancyText: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 6,
    textAlign: 'center',
  },
  participantsSection: {
    marginBottom: 12,
  },
  participantsTitle: {
    fontSize: 12,
    color: TEXT_DARK,
    fontWeight: '600',
    marginBottom: 8,
  },
  participantsList: {
    flexDirection: 'row',
    gap: 6,
  },
  participantAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreParticipantsText: {
    fontSize: 10,
    color: PRIMARY,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: ERROR,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: SURFACE_LIGHT,
  },
  disabledButtonText: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: '600',
  },
});
