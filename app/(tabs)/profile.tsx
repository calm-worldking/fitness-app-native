import { Logo } from '@/components/Logo';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
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
import { useUser } from '../_layout';

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
const HEADER_DARK = '#0D1F2C';

// Моковые данные пользователя
const mockUser = {
  id: '1',
  name: 'Анна Петрова',
  email: 'anna.petrova@example.com',
  phone: '+7 (777) 123-45-67',
  avatar: require('@/assets/images/placeholder-user.jpg'),
  memberSince: '2023',
  subscription: {
    type: 'Семейная подписка',
    status: 'Активна',
    expiresAt: '15 января 2025',
    membersCount: 3,
    maxMembers: 4,
  },
  stats: {
    totalWorkouts: 156,
    thisMonth: 12,
    totalHours: 234,
    streak: 7,
    favoriteWorkout: 'Йога',
  },
  achievements: [
    { id: '1', title: 'Первая неделя', icon: 'star', color: WARNING, unlocked: true },
    { id: '2', title: '50 тренировок', icon: 'fitness-center', color: PRIMARY, unlocked: true },
    { id: '3', title: 'Йога мастер', icon: 'self-improvement', color: SECONDARY, unlocked: true },
    { id: '4', title: '100 тренировок', icon: 'emoji-events', color: SUCCESS, unlocked: false },
  ],
};

// Настройки приложения
const settingsOptions = [
  {
    section: 'Аккаунт',
    items: [
      { icon: 'edit', title: 'Редактировать профиль', subtitle: 'Имя, фото, контакты' },
      { icon: 'security', title: 'Безопасность', subtitle: 'Пароль, двухфакторная аутентификация' },
      { icon: 'family-restroom', title: 'Семейная подписка', subtitle: 'Управление участниками' },
    ]
  },
  {
    section: 'Предпочтения',
    items: [
      { icon: 'notifications', title: 'Уведомления', subtitle: 'Push, email, SMS' },
      { icon: 'language', title: 'Язык', subtitle: 'Русский' },
      { icon: 'dark-mode', title: 'Тема', subtitle: 'Светлая' },
    ]
  },
  {
    section: 'Данные',
    items: [
      { icon: 'analytics', title: 'Статистика', subtitle: 'Подробная аналитика тренировок' },
      { icon: 'download', title: 'Экспорт данных', subtitle: 'Скачать данные о тренировках' },
      { icon: 'backup', title: 'Резервные копии', subtitle: 'Синхронизация с облаком' },
    ]
  },
  {
    section: 'Поддержка',
    items: [
      { icon: 'help', title: 'Справка', subtitle: 'FAQ и руководства' },
      { icon: 'feedback', title: 'Обратная связь', subtitle: 'Оценить приложение' },
      { icon: 'bug-report', title: 'Сообщить о проблеме', subtitle: 'Техническая поддержка' },
    ]
  },
];

export default function ProfileScreen() {
  const { user, signOut } = useUser();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(res => setTimeout(res, 1000));
    setRefreshing(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Выйти из аккаунта',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Выйти', style: 'destructive', onPress: signOut }
      ]
    );
  };

  const handleSettingPress = (setting: any) => {
    console.log('Setting pressed:', setting.title);
    // Здесь будет навигация к соответствующим экранам настроек
  };

  // Если пользователь не авторизован
  if (!user) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={HEADER_DARK} barStyle="light-content" translucent={false} />
        
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
          <View style={styles.guestContainer}>
            <View style={styles.guestIcon}>
              <MaterialIcons name="person-outline" size={64} color={TEXT_MUTED} />
            </View>
            
            <ThemedText type="heading1" style={styles.guestTitle}>
              Гостевой режим
            </ThemedText>
            
            <ThemedText style={styles.guestText}>
              Войдите или зарегистрируйтесь, чтобы получить полный доступ к возможностям приложения
            </ThemedText>
            
            <View style={styles.guestActions}>
              <Button 
                style={styles.loginButton} 
                onPress={() => router.push('/auth/login')}
              >
                <ThemedText style={styles.loginButtonText}>Войти</ThemedText>
              </Button>
              
              <Button 
                style={styles.registerButton} 
                onPress={() => router.push('/auth/register')}
              >
                <ThemedText style={styles.registerButtonText}>Зарегистрироваться</ThemedText>
              </Button>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Используем моковые данные для демонстрации
  const currentUser = mockUser;

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
        {/* Профиль пользователя */}
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <Image source={currentUser.avatar} style={styles.avatar} />
              <View style={styles.profileInfo}>
                <ThemedText type="heading2" style={styles.userName}>
                  {currentUser.name}
                </ThemedText>
                <ThemedText style={styles.userEmail}>
                  {currentUser.email}
                </ThemedText>
                <View style={styles.memberSince}>
                  <MaterialIcons name="star" size={16} color={WARNING} />
                  <ThemedText style={styles.memberSinceText}>
                    Участник с {currentUser.memberSince}
                  </ThemedText>
                </View>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <MaterialIcons name="edit" size={20} color={PRIMARY} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Подписка */}
        <View style={styles.subscriptionSection}>
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <View style={styles.subscriptionIcon}>
                <MaterialIcons name="family-restroom" size={24} color={SECONDARY} />
              </View>
              <View style={styles.subscriptionInfo}>
                <ThemedText type="defaultSemiBold" style={styles.subscriptionType}>
                  {currentUser.subscription.type}
                </ThemedText>
                <ThemedText style={styles.subscriptionStatus}>
                  {currentUser.subscription.status} до {currentUser.subscription.expiresAt}
                </ThemedText>
              </View>
              <TouchableOpacity 
                style={styles.manageButton}
                onPress={() => router.push('/family/subscription' as any)}
              >
                <ThemedText style={styles.manageButtonText}>Управление</ThemedText>
              </TouchableOpacity>
            </View>
            
            <View style={styles.membersInfo}>
              <View style={styles.membersCount}>
                <ThemedText style={styles.membersCountText}>
                  {currentUser.subscription.membersCount}/{currentUser.subscription.maxMembers} участников
                </ThemedText>
              </View>
              <View style={styles.membersBar}>
                <View style={[
                  styles.membersProgress,
                  { width: `${(currentUser.subscription.membersCount / currentUser.subscription.maxMembers) * 100}%` }
                ]} />
              </View>
            </View>
          </View>
        </View>

        {/* Статистика */}
        <View style={styles.statsSection}>
          <ThemedText type="heading2" style={styles.sectionTitle}>
            Статистика
          </ThemedText>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialIcons name="fitness-center" size={24} color={PRIMARY} />
              <ThemedText type="heading3" style={styles.statValue}>
                {currentUser.stats.totalWorkouts}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Всего тренировок</ThemedText>
            </View>
            
            <View style={styles.statCard}>
              <MaterialIcons name="calendar-month" size={24} color={SECONDARY} />
              <ThemedText type="heading3" style={styles.statValue}>
                {currentUser.stats.thisMonth}
              </ThemedText>
              <ThemedText style={styles.statLabel}>В этом месяце</ThemedText>
            </View>
            
            <View style={styles.statCard}>
              <MaterialIcons name="schedule" size={24} color={SUCCESS} />
              <ThemedText type="heading3" style={styles.statValue}>
                {currentUser.stats.totalHours}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Часов тренировок</ThemedText>
            </View>
            
            <View style={styles.statCard}>
              <MaterialIcons name="local-fire-department" size={24} color={WARNING} />
              <ThemedText type="heading3" style={styles.statValue}>
                {currentUser.stats.streak}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Дней подряд</ThemedText>
            </View>
          </View>
        </View>

        {/* Достижения */}
        <View style={styles.achievementsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText type="heading2" style={styles.sectionTitle}>
              Достижения
            </ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.seeAllText}>Посмотреть все</ThemedText>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.achievementsList}
          >
            {currentUser.achievements.map((achievement) => (
              <View 
                key={achievement.id} 
                style={[
                  styles.achievementCard,
                  !achievement.unlocked && styles.achievementCardLocked
                ]}
              >
                <View style={[
                  styles.achievementIcon,
                  { backgroundColor: achievement.color + '20' },
                  !achievement.unlocked && styles.achievementIconLocked
                ]}>
                  <MaterialIcons 
                    name={achievement.icon as any} 
                    size={24} 
                    color={achievement.unlocked ? achievement.color : TEXT_MUTED} 
                  />
                </View>
                <ThemedText style={[
                  styles.achievementTitle,
                  !achievement.unlocked && styles.achievementTitleLocked
                ]}>
                  {achievement.title}
                </ThemedText>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Настройки */}
        <View style={styles.settingsSection}>
          <ThemedText type="heading2" style={styles.sectionTitle}>
            Настройки
          </ThemedText>
          
          {settingsOptions.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.settingsGroup}>
              <ThemedText style={styles.settingsGroupTitle}>
                {section.section}
              </ThemedText>
              
              <View style={styles.settingsGroupItems}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.settingItem,
                      itemIndex === section.items.length - 1 && styles.settingItemLast
                    ]}
                    onPress={() => handleSettingPress(item)}
                  >
                    <MaterialIcons 
                      name={item.icon as any} 
                      size={20} 
                      color={TEXT_MUTED} 
                    />
                    <View style={styles.settingContent}>
                      <ThemedText style={styles.settingTitle}>
                        {item.title}
                      </ThemedText>
                      <ThemedText style={styles.settingSubtitle}>
                        {item.subtitle}
                      </ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={TEXT_MUTED} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Кнопка выхода */}
        <View style={styles.signOutSection}>
          <Button style={styles.signOutButton} onPress={handleSignOut}>
            <ThemedText style={styles.signOutText}>Выйти из аккаунта</ThemedText>
          </Button>
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
  
  // Guest mode
  guestContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  guestIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: BG,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 12,
  },
  guestText: {
    fontSize: 16,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  guestActions: {
    width: '100%',
    gap: 12,
  },
  loginButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: CARD_BG,
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: BG,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    color: TEXT_DARK,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Profile section
  profileSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  profileCard: {
    backgroundColor: BG,
    borderRadius: 16,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 8,
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberSinceText: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginLeft: 4,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Subscription section
  subscriptionSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  subscriptionCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: BG,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SECONDARY + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionType: {
    fontSize: 16,
    color: TEXT_DARK,
    marginBottom: 4,
  },
  subscriptionStatus: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  manageButton: {
    backgroundColor: BG,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  manageButtonText: {
    fontSize: 12,
    color: TEXT_DARK,
    fontWeight: '600',
  },
  membersInfo: {
    marginTop: 12,
  },
  membersCount: {
    marginBottom: 8,
  },
  membersCountText: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  membersBar: {
    height: 6,
    backgroundColor: BG,
    borderRadius: 3,
    overflow: 'hidden',
  },
  membersProgress: {
    height: '100%',
    backgroundColor: SECONDARY,
    borderRadius: 3,
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
  seeAllText: {
    fontSize: 14,
    color: PRIMARY,
    fontWeight: '600',
  },
  
  // Stats
  statsSection: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    width: (screenWidth - 56) / 2,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BG,
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
  
  // Achievements
  achievementsSection: {
    marginBottom: 32,
  },
  achievementsList: {
    paddingLeft: 16,
  },
  achievementCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginRight: 12,
    width: 100,
    borderWidth: 1,
    borderColor: BG,
  },
  achievementCardLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementIconLocked: {
    backgroundColor: BG,
  },
  achievementTitle: {
    fontSize: 12,
    color: TEXT_DARK,
    textAlign: 'center',
    fontWeight: '500',
  },
  achievementTitleLocked: {
    color: TEXT_MUTED,
  },
  
  // Settings
  settingsSection: {
    marginBottom: 32,
  },
  settingsGroup: {
    marginBottom: 24,
  },
  settingsGroupTitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingsGroupItems: {
    backgroundColor: CARD_BG,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BG,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: BG,
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingContent: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: TEXT_DARK,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  
  // Sign out
  signOutSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signOutText: {
    color: CARD_BG,
    fontSize: 16,
    fontWeight: '600',
  },
}); 