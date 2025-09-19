import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { AppHeader } from '@/components/AppHeader';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { api } from '@/lib/api';
import { notificationService } from '@/lib/notifications';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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


// Настройки приложения
const settingsOptions = [
  {
    section: 'Аккаунт',
    items: [
      { icon: 'edit', title: 'Редактировать профиль', subtitle: 'Имя, фото, контакты' },
      { icon: 'security', title: 'Безопасность', subtitle: 'Пароль, двухфакторная аутентификация' },
      { icon: 'groups', title: 'Семейная подписка', subtitle: 'Управление участниками' },
    ]
  },
  {
    section: 'Уведомления',
    items: [
      { icon: 'notifications', title: 'Напоминания о тренировках', subtitle: 'За 1 и 2 часа до занятия' },
      { icon: 'settings', title: 'Настройки уведомлений', subtitle: 'Управление разрешениями' },
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

function ProfileScreenContent() {
  const { user, signOut, signIn } = useUser();
  const { activeSubscription, loadSubscriptionData } = useSubscription();
  
  // Безопасные значения из контекста
  const safeUser = user || null;
  const safeActiveSubscription = activeSubscription || null;
  
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [safeUserStats, setUserStats] = useState({
    totalWorkouts: 0,
    thisMonth: 0,
    totalHours: 0,
    weekStreak: 0,
    favoriteWorkout: '-',
    completedBookings: 0,
    cancelledBookings: 0,
  });

  const loadUserStats = useCallback(async () => {
    if (!safeUser || !safeUser.id) return;
    
    try {
      console.log('📊 Loading safeUser stats...');
      const stats = await api.getUserStats();
      console.log('📊 User stats loaded:', stats);
      
      // Преобразуем данные в правильный формат
      const statsData = stats as any;
      const formattedStats = {
        totalWorkouts: statsData.totalWorkouts || 0,
        thisMonth: statsData.thisMonth || 0,
        totalHours: statsData.totalHours || 0,
        weekStreak: statsData.weekStreak || 0,
        favoriteWorkout: statsData.favoriteWorkout || '-',
        completedBookings: statsData.completedBookings || 0,
        cancelledBookings: statsData.cancelledBookings || 0,
      };
      
      setUserStats(formattedStats);
    } catch (error: any) {
      console.log('❌ Failed to load safeUser stats:', error);
      // Если ошибка авторизации, не пытаемся снова
      if (error.message && error.message.includes('Unauthorized')) {
        console.log('🚫 Authorization failed, stopping stats loading');
        return;
      }
    }
  }, [safeUser]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadSubscriptionData(),
        loadUserStats(),
        // Обновляем данные пользователя
        (async () => {
          try {
            const userResponse = await api.getCurrentUser();
            signIn(userResponse.user);
          } catch (error) {
            console.log('Failed to refresh user data:', error);
          }
        })(),
        new Promise(res => setTimeout(res, 1000))
      ]);
    } catch (error) {
      console.log('Failed to refresh profile data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Загружаем только статистику при монтировании компонента
  useEffect(() => {
    if (safeUser && safeUser.id) {
      loadUserStats();
    }
  }, [safeUser, loadUserStats]);

  // Убираем автоматическое обновление при фокусе - оно не нужно
  // useFocusEffect убран для предотвращения бесконечных запросов

  const handleSignOut = () => {
    Alert.alert(
      'Выйти из аккаунта',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Выйти', style: 'destructive', onPress: async () => {
          await signOut();
          // Перезагружаем приложение для сброса состояния
          router.replace('/');
        }}
      ]
    );
  };

  const handleHelpPress = () => {
    Alert.alert(
      'Справка',
      'Выберите, какую помощь вам нужна:',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Как записаться на занятие', 
          onPress: () => {
            Alert.alert(
              'Как записаться на занятие',
              '1. Найдите подходящий зал в разделе "Залы"\n2. Выберите интересующее занятие\n3. Нажмите "Записаться"\n4. Подтвердите бронирование\n\nНе забудьте прийти за 10-15 минут до начала!'
            );
          }
        },
        { 
          text: 'Как отменить занятие', 
          onPress: () => {
            Alert.alert(
              'Как отменить занятие',
              '1. Перейдите в раздел "Расписание"\n2. Найдите ваше бронирование\n3. Нажмите "Отменить"\n4. Подтвердите отмену\n\nОтмена возможна не позднее чем за 2 часа до начала занятия.'
            );
          }
        },
        { 
          text: 'Проблемы с подпиской', 
          onPress: () => {
            Alert.alert(
              'Проблемы с подпиской',
              'Если у вас проблемы с подпиской:\n\n• Проверьте статус в разделе "Подписка"\n• Убедитесь, что подписка активна\n• Проверьте срок действия\n\nЕсли проблема не решается, обратитесь в поддержку.'
            );
          }
        }
      ]
    );
  };

  const handleFeedbackPress = () => {
    Alert.alert(
      'Обратная связь',
      'Мы ценим ваше мнение! Как вы хотите оставить отзыв?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Оценить в App Store', 
          onPress: () => {
            Alert.alert(
              'Спасибо!',
              'Ваша оценка поможет нам улучшить приложение. Перейдите в App Store для оставления отзыва.'
            );
          }
        },
        { 
          text: 'Написать отзыв', 
          onPress: () => {
            Alert.alert(
              'Отзыв',
              'Напишите ваш отзыв о приложении. Что вам нравится? Что можно улучшить?',
              [
                { text: 'Отмена', style: 'cancel' },
                { 
                  text: 'Отправить', 
                  onPress: () => {
                    Alert.alert(
                      'Спасибо!',
                      'Ваш отзыв отправлен. Мы обязательно его рассмотрим!'
                    );
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleBugReportPress = () => {
    Alert.alert(
      'Сообщить о проблеме',
      'Опишите проблему, с которой вы столкнулись:',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Приложение не работает', 
          onPress: () => {
            Alert.alert(
              'Техническая проблема',
              'Попробуйте:\n\n1. Перезапустить приложение\n2. Проверить интернет-соединение\n3. Обновить приложение\n\nЕсли проблема остается, опишите её подробнее.',
              [
                { text: 'Отмена', style: 'cancel' },
                { 
                  text: 'Отправить отчет', 
                  onPress: () => {
                    Alert.alert(
                      'Отчет отправлен',
                      'Спасибо за сообщение! Мы исправим проблему в ближайшее время.'
                    );
                  }
                }
              ]
            );
          }
        },
        { 
          text: 'Ошибка при бронировании', 
          onPress: () => {
            Alert.alert(
              'Проблема с бронированием',
              'Опишите, что именно происходит при попытке записаться на занятие:',
              [
                { text: 'Отмена', style: 'cancel' },
                { 
                  text: 'Отправить отчет', 
                  onPress: () => {
                    Alert.alert(
                      'Отчет отправлен',
                      'Мы разберемся с проблемой бронирования и свяжемся с вами.'
                    );
                  }
                }
              ]
            );
          }
        },
        { 
          text: 'Другая проблема', 
          onPress: () => {
            Alert.alert(
              'Другая проблема',
              'Опишите вашу проблему максимально подробно:',
              [
                { text: 'Отмена', style: 'cancel' },
                { 
                  text: 'Отправить', 
                  onPress: () => {
                    Alert.alert(
                      'Спасибо!',
                      'Ваше сообщение получено. Мы ответим в течение 24 часов.'
                    );
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleWorkoutRemindersPress = async () => {
    try {
      const scheduledNotifications = await notificationService.getScheduledNotifications();
      const workoutNotifications = scheduledNotifications.filter(
        notification => notification.content.data?.classId
      );

      if (workoutNotifications.length === 0) {
        Alert.alert(
          'Напоминания о тренировках',
          'У вас нет запланированных напоминаний о тренировках.\n\nНапоминания автоматически создаются при бронировании занятий за 1 и 2 часа до начала.',
          [{ text: 'Понятно', style: 'default' }]
        );
        return;
      }

      const message = `У вас запланировано ${workoutNotifications.length} напоминаний о тренировках:\n\n` +
        workoutNotifications.map(notification => {
          const data = notification.content.data as any;
          const startTime = new Date(data.startTime);
          const type = data.type === '1hour' ? 'за 1 час' : 'за 2 часа';
          return `• ${data.classTitle} - ${type} (${startTime.toLocaleDateString('ru-RU')})`;
        }).join('\n');

      Alert.alert(
        'Напоминания о тренировках',
        message,
        [
          { text: 'Понятно', style: 'default' },
          { 
            text: 'Отменить все', 
            style: 'destructive',
            onPress: async () => {
              try {
                await notificationService.cancelAllNotifications();
                Alert.alert('Готово', 'Все напоминания отменены');
              } catch {
                Alert.alert('Ошибка', 'Не удалось отменить напоминания');
              }
            }
          }
        ]
      );
    } catch {
      Alert.alert('Ошибка', 'Не удалось загрузить информацию о напоминаниях');
    }
  };

  const handleNotificationSettingsPress = async () => {
    try {
      const permissions = await notificationService.getNotificationPermissions();
      
      if (permissions.status === 'granted') {
        Alert.alert(
          'Настройки уведомлений',
          'Уведомления включены ✅\n\nВы получаете напоминания о тренировках за 1 и 2 часа до начала занятий.',
          [
            { text: 'Понятно', style: 'default' },
            { 
              text: 'Отключить', 
              style: 'destructive',
              onPress: async () => {
                try {
                  await notificationService.cancelAllNotifications();
                  Alert.alert('Готово', 'Все уведомления отключены');
                } catch {
                  Alert.alert('Ошибка', 'Не удалось отключить уведомления');
                }
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Настройки уведомлений',
          'Уведомления отключены ❌\n\nДля получения напоминаний о тренировках необходимо разрешить уведомления.',
          [
            { text: 'Отмена', style: 'cancel' },
            { 
              text: 'Включить', 
              onPress: async () => {
                try {
                  const result = await notificationService.requestNotificationPermissions();
                  if (result.status === 'granted') {
                    Alert.alert('Готово', 'Уведомления включены! Теперь вы будете получать напоминания о тренировках.');
                  } else {
                    Alert.alert('Ошибка', 'Разрешение на уведомления не предоставлено');
                  }
                } catch {
                  Alert.alert('Ошибка', 'Не удалось включить уведомления');
                }
              }
            }
          ]
        );
      }
    } catch {
      Alert.alert('Ошибка', 'Не удалось проверить настройки уведомлений');
    }
  };

  const handleSettingPress = (setting: any) => {
    console.log('Setting pressed:', setting.title);
    
    // Навигация к соответствующим экранам настроек
    switch (setting.title) {
      case 'Редактировать профиль':
        router.push('/profile/edit');
        break;
      case 'Безопасность':
        router.push('/profile/change-password');
        break;
      case 'Семейная подписка':
        // Показываем семейную подписку только владельцу
        if (currentUser.subscription.isOwner) {
          router.push('/(tabs)/subscription' as any);
        } else {
          Alert.alert(
            'Доступ ограничен',
            'Управление семейной подпиской доступно только владельцу подписки.',
            [{ text: 'Понятно' }]
          );
        }
        break;
      case 'Справка':
        handleHelpPress();
        break;
      case 'Обратная связь':
        handleFeedbackPress();
        break;
      case 'Сообщить о проблеме':
        handleBugReportPress();
        break;
      case 'Напоминания о тренировках':
        handleWorkoutRemindersPress();
        break;
      case 'Настройки уведомлений':
        handleNotificationSettingsPress();
        break;
      default:
        Alert.alert('Скоро', `${setting.title} будет доступен в следующих версиях`);
    }
  };

  // Если пользователь не авторизован
  if (!safeUser) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={HEADER_DARK} barStyle="light-content" translucent={false} />
        
        <AppHeader />
        
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

  // Используем реальные данные пользователя или моковые данные как fallback
  const currentUser = {
    id: safeUser?.id || 'guest',
    name: safeUser?.name || 'Гость',
    email: safeUser?.email || 'guest@example.com',
    phone: safeUser?.phone || '',
    avatar: safeUser?.avatar && typeof safeUser.avatar === 'string' ? {
      uri: safeUser.avatar.startsWith('http') 
        ? safeUser.avatar 
        : `${process.env.EXPO_PUBLIC_PARTNER_API_BASE || 'https://partner.xnova.kz'}${safeUser.avatar}`
    } : null,
    memberSince: safeUser?.createdAt ? new Date(safeUser.createdAt).getFullYear().toString() : new Date().getFullYear().toString(),
    subscription: safeActiveSubscription ? {
      type: (() => {
        console.log('🔍 Profile plan data:', {
          plan: safeActiveSubscription?.plan,
          planName: safeActiveSubscription?.plan?.name,
          fullSubscription: safeActiveSubscription
        });
        return safeActiveSubscription?.plan?.name || 'План';
      })(),
      status: (safeActiveSubscription as any)?.isFrozen ? 'Заморожена' :
              (safeActiveSubscription as any)?.freezeInfo?.status === 'scheduled' ? 'Заморозка запланирована' :
              safeActiveSubscription.status === 'active' ? 'Активна' : 
              safeActiveSubscription.status === 'frozen' ? 'Заморожена' :
              safeActiveSubscription.status === 'cancelled' ? 'Отменена' : 'Неактивна',
      expiresAt: new Date(safeActiveSubscription.endDate).toLocaleDateString('ru-RU'),
      membersCount: (safeActiveSubscription.familyMembers?.length || 0) + 1, // +1 для владельца
      maxMembers: safeActiveSubscription.peopleCount || 1,
      isOwner: safeActiveSubscription.isOwner || false,
      owner: safeActiveSubscription.owner || null,
    } : {
      type: 'Без подписки',
      status: 'Неактивна',
      expiresAt: '-',
      membersCount: 0,
      maxMembers: 0,
      isOwner: false,
      owner: null,
    },
    stats: {
      totalWorkouts: safeUserStats?.totalWorkouts || 0,
      thisMonth: safeUserStats?.thisMonth || 0,
      totalHours: safeUserStats?.totalHours || 0,
      streak: safeUserStats?.weekStreak || 0,
      favoriteWorkout: safeUserStats?.favoriteWorkout || 'Не указано',
    },
    achievements: [],
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={HEADER_DARK} barStyle="light-content" translucent={false} />
      
      {/* Header */}
      <AppHeader />

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
              {currentUser.avatar ? (
                <Image source={currentUser.avatar} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <MaterialIcons name="person" size={32} color={TEXT_MUTED} />
                </View>
              )}
              <View style={styles.profileInfo}>
                <ThemedText type="heading2" style={styles.safeUserName}>
                  {currentUser.name}
                </ThemedText>
                <ThemedText style={styles.safeUserEmail}>
                  {currentUser.email}
                </ThemedText>
                <View style={styles.memberSince}>
                  <MaterialIcons name="star" size={16} color={WARNING} />
                  <ThemedText style={styles.memberSinceText}>
                    Участник с {currentUser.memberSince}
                  </ThemedText>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => router.push('/profile/edit')}
              >
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
                <MaterialIcons name="groups" size={24} color={SECONDARY} />
              </View>
              <View style={styles.subscriptionInfo}>
                <ThemedText type="defaultSemiBold" style={styles.subscriptionType}>
                  {currentUser.subscription.type}
                </ThemedText>
                <ThemedText style={styles.subscriptionStatus}>
                  {currentUser.subscription.status} до {currentUser.subscription.expiresAt}
                </ThemedText>
              </View>
              {/* Показываем кнопку "Управление" только владельцу подписки */}
              {currentUser.subscription.isOwner && (
                <TouchableOpacity 
                  style={styles.manageButton}
                  onPress={() => router.push('/(tabs)/subscription' as any)}
                >
                  <ThemedText style={styles.manageButtonText}>Управление</ThemedText>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.membersInfo}>
              <View style={styles.membersCount}>
                <ThemedText style={styles.membersCountText}>
                  {currentUser.subscription.membersCount}/{currentUser.subscription.maxMembers} участников
                </ThemedText>
                {/* Показываем информацию о владельце для приглашенных пользователей */}
                {!currentUser.subscription.isOwner && currentUser.subscription.owner && (
                  <ThemedText style={[styles.membersCountText, { color: TEXT_MUTED, fontStyle: 'italic', fontSize: 12 }]}>
                    Владелец: {currentUser.subscription.owner.name}
                  </ThemedText>
                )}
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
                {safeUserStats?.totalWorkouts || 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Всего тренировок</ThemedText>
            </View>
            
            <View style={styles.statCard}>
              <MaterialIcons name="calendar-month" size={24} color={SECONDARY} />
              <ThemedText type="heading3" style={styles.statValue}>
                {safeUserStats?.thisMonth || 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>В этом месяце</ThemedText>
            </View>
            
            <View style={styles.statCard}>
              <MaterialIcons name="schedule" size={24} color={SUCCESS} />
              <ThemedText type="heading3" style={styles.statValue}>
                {safeUserStats?.totalHours || 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Часов тренировок</ThemedText>
            </View>
            
            <View style={styles.statCard}>
              <MaterialIcons name="whatshot" size={24} color={WARNING} />
              <ThemedText type="heading3" style={styles.statValue}>
                {safeUserStats?.weekStreak || 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Недель подряд</ThemedText>
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
            {(currentUser.achievements || []).map((achievement: any) => (
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
  avatarPlaceholder: {
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
  },
  profileInfo: {
    flex: 1,
  },
  safeUserName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  safeUserEmail: {
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

export default function ProfileScreen() {
  return <ProfileScreenContent />;
}