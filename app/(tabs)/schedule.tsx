import { Logo } from '@/components/Logo';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
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
const WARNING = '#FFD700';
const ERROR = '#FF3B30';
const HEADER_DARK = '#0D1F2C';

// Дни недели
const days = [
  { key: 'mon', label: 'Пн', date: '18' },
  { key: 'tue', label: 'Вт', date: '19' },
  { key: 'wed', label: 'Ср', date: '20' },
  { key: 'thu', label: 'Чт', date: '21' },
  { key: 'fri', label: 'Пт', date: '22' },
  { key: 'sat', label: 'Сб', date: '23' },
  { key: 'sun', label: 'Вс', date: '24' },
];

// Типы занятий
type WorkoutStatus = 'available' | 'booked' | 'completed' | 'cancelled' | 'full';

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  trainer: string;
  duration: number;
  gym: string;
  spots: {
    available: number;
    total: number;
  };
  status: WorkoutStatus;
  category: string;
  price?: string;
}

// Данные расписания
const scheduleData: { [key: string]: ScheduleItem[] } = {
  mon: [
    {
      id: '1',
      time: '07:00',
      title: 'Утренняя йога',
      trainer: 'Анна Петрова',
      duration: 60,
      gym: 'FitLife Центральный',
      spots: { available: 8, total: 20 },
      status: 'available',
      category: 'Йога',
    },
    {
      id: '2',
      time: '10:00',
      title: 'Силовая тренировка',
      trainer: 'Михаил Иванов',
      duration: 90,
      gym: 'FitLife Центральный',
      spots: { available: 2, total: 15 },
      status: 'available',
      category: 'Силовые',
    },
    {
      id: '3',
      time: '18:00',
      title: 'Кроссфит',
      trainer: 'Дмитрий Смирнов',
      duration: 60,
      gym: 'FitLife Восточный',
      spots: { available: 0, total: 12 },
      status: 'full',
      category: 'Кроссфит',
    },
    {
      id: '4',
      time: '19:30',
      title: 'Вечерняя растяжка',
      trainer: 'София Козлова',
      duration: 45,
      gym: 'FitLife Центральный',
      spots: { available: 15, total: 20 },
      status: 'booked',
      category: 'Стретчинг',
    },
  ],
  tue: [
    {
      id: '5',
      time: '08:00',
      title: 'Пилатес',
      trainer: 'Екатерина Волкова',
      duration: 60,
      gym: 'FitLife Южный',
      spots: { available: 5, total: 15 },
      status: 'available',
      category: 'Пилатес',
    },
    {
      id: '6',
      time: '12:00',
      title: 'Функциональный тренинг',
      trainer: 'Алексей Морозов',
      duration: 60,
      gym: 'FitLife Центральный',
      spots: { available: 3, total: 10 },
      status: 'available',
      category: 'Функциональный',
    },
  ],
  wed: [
    {
      id: '7',
      time: '09:00',
      title: 'Аквааэробика',
      trainer: 'Марина Белова',
      duration: 45,
      gym: 'FitLife Центральный',
      spots: { available: 8, total: 12 },
      status: 'available',
      category: 'Водные виды',
    },
    {
      id: '8',
      time: '17:00',
      title: 'Бокс',
      trainer: 'Игорь Соколов',
      duration: 90,
      gym: 'FitLife Восточный',
      spots: { available: 1, total: 8 },
      status: 'completed',
      category: 'Боевые искусства',
    },
  ],
  thu: [],
  fri: [],
  sat: [],
  sun: [],
};

// Статистика
const stats = {
  thisWeek: 4,
  thisMonth: 12,
  streak: 7,
  totalHours: 28,
};

// Функция получения цвета статуса
const getStatusColor = (status: WorkoutStatus) => {
  switch (status) {
    case 'available': return SUCCESS;
    case 'booked': return PRIMARY;
    case 'completed': return SUCCESS;
    case 'cancelled': return ERROR;
    case 'full': return TEXT_MUTED;
    default: return TEXT_MUTED;
  }
};

// Функция получения текста статуса
const getStatusText = (status: WorkoutStatus) => {
  switch (status) {
    case 'available': return 'Доступно';
    case 'booked': return 'Записан';
    case 'completed': return 'Завершено';
    case 'cancelled': return 'Отменено';
    case 'full': return 'Места нет';
    default: return '';
  }
};

export default function ScheduleScreen() {
  const [selectedDay, setSelectedDay] = useState('mon');
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(res => setTimeout(res, 1000));
    setRefreshing(false);
  };

  const handleBookWorkout = (item: ScheduleItem) => {
    if (item.status === 'available' && item.spots.available > 0) {
      Alert.alert(
        'Записаться на тренировку',
        `${item.title} в ${item.time}\nТренер: ${item.trainer}\nПродолжительность: ${item.duration} мин`,
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Записаться', onPress: () => console.log('Записан на тренировку') }
        ]
      );
    } else if (item.status === 'booked') {
      Alert.alert(
        'Отменить запись',
        `Вы записаны на ${item.title} в ${item.time}`,
        [
          { text: 'Назад', style: 'cancel' },
          { text: 'Отменить запись', style: 'destructive', onPress: () => console.log('Запись отменена') }
        ]
      );
    }
  };

  const selectedDayData = scheduleData[selectedDay] || [];

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
        {/* Статистика */}
        <View style={styles.statsSection}>
          <ThemedText type="heading2" style={styles.sectionTitle}>
            Ваша активность
          </ThemedText>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialIcons name="fitness-center" size={24} color={PRIMARY} />
              <ThemedText type="heading3" style={styles.statValue}>{stats.thisWeek}</ThemedText>
              <ThemedText style={styles.statLabel}>Тренировок на неделе</ThemedText>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="local-fire-department" size={24} color={SECONDARY} />
              <ThemedText type="heading3" style={styles.statValue}>{stats.streak}</ThemedText>
              <ThemedText style={styles.statLabel}>Дней подряд</ThemedText>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="schedule" size={24} color={SUCCESS} />
              <ThemedText type="heading3" style={styles.statValue}>{stats.totalHours}</ThemedText>
              <ThemedText style={styles.statLabel}>Часов в месяце</ThemedText>
            </View>
          </View>
        </View>

        {/* Календарь дней */}
        <View style={styles.calendarSection}>
          <ThemedText type="heading2" style={styles.sectionTitle}>
            Декабрь 2024
          </ThemedText>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.daysScroll}
          >
            {days.map((day) => (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.dayCard,
                  selectedDay === day.key && styles.dayCardActive
                ]}
                onPress={() => setSelectedDay(day.key)}
              >
                <ThemedText style={[
                  styles.dayLabel,
                  selectedDay === day.key && styles.dayLabelActive
                ]}>
                  {day.label}
                </ThemedText>
                <ThemedText style={[
                  styles.dayDate,
                  selectedDay === day.key && styles.dayDateActive
                ]}>
                  {day.date}
                </ThemedText>
                {scheduleData[day.key]?.length > 0 && (
                  <View style={[
                    styles.dayIndicator,
                    selectedDay === day.key && styles.dayIndicatorActive
                  ]} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Расписание на выбранный день */}
        <View style={styles.scheduleSection}>
          <View style={styles.sectionHeader}>
            <ThemedText type="heading2" style={styles.sectionTitle}>
              Расписание на {days.find(d => d.key === selectedDay)?.label}
            </ThemedText>
            <TouchableOpacity>
              <MaterialIcons name="add" size={24} color={PRIMARY} />
            </TouchableOpacity>
          </View>

          {selectedDayData.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="event-available" size={64} color={TEXT_MUTED} />
              <ThemedText type="heading3" style={styles.emptyTitle}>
                Свободный день
              </ThemedText>
              <ThemedText style={styles.emptyText}>
                На этот день нет запланированных тренировок
              </ThemedText>
              <Button style={styles.addWorkoutButton}>
                <ThemedText style={styles.addWorkoutText}>Найти тренировку</ThemedText>
              </Button>
            </View>
          ) : (
            <View style={styles.workoutsList}>
              {selectedDayData.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.workoutCard}
                  onPress={() => handleBookWorkout(item)}
                >
                  <View style={styles.workoutHeader}>
                    <View style={styles.workoutTime}>
                      <ThemedText type="heading3" style={styles.timeText}>
                        {item.time}
                      </ThemedText>
                      <ThemedText style={styles.durationText}>
                        {item.duration} мин
                      </ThemedText>
                    </View>
                    
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(item.status) + '20' }
                    ]}>
                      <ThemedText style={[
                        styles.statusText,
                        { color: getStatusColor(item.status) }
                      ]}>
                        {getStatusText(item.status)}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.workoutInfo}>
                    <ThemedText type="defaultSemiBold" style={styles.workoutTitle}>
                      {item.title}
                    </ThemedText>
                    <View style={styles.workoutDetails}>
                      <View style={styles.detailRow}>
                        <MaterialIcons name="person" size={16} color={TEXT_MUTED} />
                        <ThemedText style={styles.detailText}>{item.trainer}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <MaterialIcons name="location-on" size={16} color={TEXT_MUTED} />
                        <ThemedText style={styles.detailText}>{item.gym}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <MaterialIcons name="group" size={16} color={TEXT_MUTED} />
                        <ThemedText style={styles.detailText}>
                          {item.spots.available}/{item.spots.total} мест
                        </ThemedText>
                      </View>
                    </View>
                    
                    <View style={styles.categoryTag}>
                      <ThemedText style={styles.categoryText}>{item.category}</ThemedText>
                    </View>
                  </View>

                  <View style={styles.workoutActions}>
                    {item.status === 'available' && (
                      <View style={styles.spotsIndicator}>
                        <View style={[
                          styles.spotsBar,
                          { 
                            backgroundColor: item.spots.available < 3 ? WARNING : SUCCESS,
                            width: `${(item.spots.available / item.spots.total) * 100}%`
                          }
                        ]} />
                      </View>
                    )}
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color={TEXT_MUTED} 
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Быстрые действия */}
        <View style={styles.quickActionsSection}>
          <ThemedText type="heading2" style={styles.sectionTitle}>
            Быстрые действия
      </ThemedText>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionCard}>
              <MaterialIcons name="search" size={24} color={PRIMARY} />
              <ThemedText style={styles.quickActionText}>Найти тренировку</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <MaterialIcons name="history" size={24} color={SECONDARY} />
              <ThemedText style={styles.quickActionText}>История</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <MaterialIcons name="analytics" size={24} color={SUCCESS} />
              <ThemedText style={styles.quickActionText}>Статистика</ThemedText>
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
  
  // Common
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
  
  // Stats
  statsSection: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: BG,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  
  // Calendar
  calendarSection: {
    marginBottom: 32,
  },
  daysScroll: {
    paddingLeft: 16,
  },
  dayCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginRight: 12,
    minWidth: 60,
    borderWidth: 1,
    borderColor: BG,
  },
  dayCardActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  dayLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 4,
  },
  dayLabelActive: {
    color: CARD_BG,
  },
  dayDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  dayDateActive: {
    color: CARD_BG,
  },
  dayIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PRIMARY,
  },
  dayIndicatorActive: {
    backgroundColor: CARD_BG,
  },
  
  // Schedule
  scheduleSection: {
    marginBottom: 32,
  },
  
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    color: TEXT_DARK,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  addWorkoutButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  addWorkoutText: {
    color: CARD_BG,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Workouts list
  workoutsList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  workoutCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutTime: {
    alignItems: 'flex-start',
  },
  timeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_DARK,
  },
  durationText: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  workoutInfo: {
    marginBottom: 16,
  },
  workoutTitle: {
    fontSize: 16,
    color: TEXT_DARK,
    marginBottom: 8,
  },
  workoutDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginLeft: 8,
  },
  categoryTag: {
    backgroundColor: BG,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: TEXT_DARK,
    fontWeight: '500',
  },
  workoutActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spotsIndicator: {
    flex: 1,
    height: 4,
    backgroundColor: BG,
    borderRadius: 2,
    marginRight: 12,
    overflow: 'hidden',
  },
  spotsBar: {
    height: '100%',
    borderRadius: 2,
  },
  
  // Quick actions
  quickActionsSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: BG,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 12,
    color: TEXT_DARK,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
}); 