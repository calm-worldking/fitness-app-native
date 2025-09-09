import { Logo } from '@/components/Logo';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { AppHeader } from '@/components/AppHeader';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { api } from '@/lib/api';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
    Animated,
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



// Брендовые цвета
const PRIMARY = '#FF6246';
const SECONDARY = '#FF8843';
const BG = '#FFE7D8';
const CARD_BG = '#FFFFFF';
const TEXT_DARK = '#000000';
const TEXT_MUTED = '#737373';
const SUCCESS = '#4CAF50';
const HEADER_DARK = '#0D1F2C';
const SURFACE_LIGHT = '#F8F9FA';
const BORDER_LIGHT = '#E9ECEF';
const ERROR = '#F44336';
const ACCENT_BG = '#FFF5F2';
const SHADOW_LIGHT = '#00000010';

type SubscriptionType = 'silver' | 'gold';
type PeopleCount = 1 | 2 | 3;
type PaymentPeriod = 'monthly' | 'yearly';


interface SubscriptionFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface SubscriptionOption {
  id: SubscriptionType;
  title: string;
  subtitle: string;
  prices: {
    monthly: Record<PeopleCount, number>;
    yearly: Record<PeopleCount, number>;
  };
  description: string;
  features: SubscriptionFeature[];
  popular?: boolean;
  color: string;
  icon: string;
}

const subscriptionOptions: SubscriptionOption[] = [
  {
    id: 'silver',
    title: 'Silver Pass',
    subtitle: 'Стандарт + групповые тренировки',
    prices: {
      monthly: {
        1: 41667,  // 350000 / 8.4
        2: 71429,  // 600000 / 8.4
        3: 89286   // 750000 / 8.4
      },
      yearly: {
        1: 350000,
        2: 600000,
        3: 750000
      }
    },
    description: '30 занятий в месяц',
    color: PRIMARY,
    icon: 'star-outline',
    features: [
      { text: 'Доступ ко всем залам сети', included: true },
      { text: '30 занятий в месяц', included: true },
      { text: 'Групповые тренировки', included: true },
      { text: 'Стандартные программы тренировок', included: true },
      { text: '1 заморозка в год (30 дней) — бесплатно', included: true },
      { text: 'Дополнительные 14 дней заморозки за 5 000 ₸', included: true },
      { text: 'Запрос заморозки минимум за 7 дней', included: true },
      { text: 'VIP зоны и оборудование', included: false },
      { text: 'Персональный тренер', included: false },
      { text: 'Приоритетная запись', included: false },
    ]
  },
  {
    id: 'gold',
    title: 'Gold Pass',
    subtitle: 'Стандарт + VIP зоны',
    prices: {
      monthly: {
        1: 59524,   // 500000 / 8.4
        2: 107143,  // 900000 / 8.4
        3: 148810   // 1250000 / 8.4
      },
      yearly: {
        1: 500000,
        2: 900000,
        3: 1250000
      }
    },
    description: '30 занятий в месяц',
    color: SECONDARY,
    icon: 'star',
    popular: true,
    features: [
      { text: 'Все преимущества Silver Pass', included: true, highlight: true },
      { text: '30 занятий в месяц', included: true },
      { text: 'Стандартные и VIP зоны', included: true, highlight: true },
      { text: '2 заморозки в год по 30 дней каждая — бесплатно', included: true, highlight: true },
      { text: 'Разбивка заморозки на 4×15 дней', included: true, highlight: true },
      { text: 'Автопродление при заморозке', included: true, highlight: true },
      { text: 'Ускоренная реактивация', included: true, highlight: true },
      { text: 'Приоритетная запись', included: true, highlight: true },
      { text: 'Персональный тренер (2 консультации)', included: true, highlight: true },
      { text: 'VIP оборудование и услуги', included: true, highlight: true },
    ]
  }
];

// Дополнительные услуги
const additionalServices = [
  {
    icon: 'fitness-center',
    title: 'Персональный тренер',
    description: 'Индивидуальные занятия с профессиональным тренером',
    price: 'от 5 000 ₸',
    color: PRIMARY,
  },
  {
    icon: 'spa',
    title: 'СПА услуги',
    description: 'Массаж, сауна, wellness процедуры',
    price: 'от 3 000 ₸',
    color: '#00BCD4',
  },
  {
    icon: 'restaurant',
    title: 'Спортивное питание',
    description: 'Протеины, витамины, спортивные добавки',
    price: 'от 2 500 ₸',
    color: '#4CAF50',
  },
];

// Статистика подписок
const subscriptionStats = [
  { label: 'Активных участников', value: '1,247', icon: 'people' },
  { label: 'Семейных подписок', value: '312', icon: 'groups' },
  { label: 'Средняя экономия', value: '35%', icon: 'savings' },
];

export default function SubscriptionScreen() {
  const { 
    activeSubscription, 
    familyMembers, 
    paymentHistory, 
    loadSubscriptionData,
    setActiveSubscription,
    addFamilyMember,
    removeFamilyMember,
    freezeSubscription,
    cancelSubscription,
    purchaseSubscription
  } = useSubscription();
  
  const [selectedType, setSelectedType] = useState<SubscriptionType>('gold');
  const [selectedPeople, setSelectedPeople] = useState<PeopleCount>(1);
  const [selectedPeriod, setSelectedPeriod] = useState<PaymentPeriod>('monthly');
  const [refreshing, setRefreshing] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPlanForDetails, setSelectedPlanForDetails] = useState<SubscriptionOption | null>(null);

  // Модальные окна для управления
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [showFreezeHistoryModal, setShowFreezeHistoryModal] = useState(false);
  const [pendingSubscription, setPendingSubscription] = useState<{type: SubscriptionType, period: PaymentPeriod, people: PeopleCount} | null>(null);
  
  // Состояние для заморозки
  const [freezeDays, setFreezeDays] = useState(7);
  const [freezeStartDate, setFreezeStartDate] = useState('');
  const [freezeReason, setFreezeReason] = useState('');
  

  const insets = useSafeAreaInsets();

  // Анимационные значения
  const fadeAnim = useState(new Animated.Value(1))[0];
  const scaleAnim = useState(new Animated.Value(1))[0];
  const slideAnim = useState(new Animated.Value(0))[0];

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSubscriptionData();
    setRefreshing(false);
  };

  // Управление абонементом
  const handleFreezeSubscription = async () => {
    if (!activeSubscription) return;

    if (!freezeStartDate) {
      Alert.alert('Ошибка', 'Выберите дату начала заморозки');
      return;
    }

    try {
      const result = await api.freezeSubscription(activeSubscription.id, {
        days: freezeDays,
        startDate: freezeStartDate,
        reason: freezeReason
      }) as any;

      setShowFreezeModal(false);
      setFreezeDays(7);
      setFreezeStartDate('');
      setFreezeReason('');

      Alert.alert(
        'Успешно!', 
        result.message,
        [{ text: 'OK' }]
      );

      // Обновляем данные подписки
      await loadSubscriptionData();
    } catch (error) {
      console.log('Failed to freeze subscription:', error);
      Alert.alert('Ошибка', 'Не удалось создать запрос на заморозку');
    }
  };

  const handleRemoveFamilyMember = async (memberId: string) => {
    if (!activeSubscription) return;

    try {
      await removeFamilyMember(memberId);
    } catch (error) {
      console.log('Failed to remove family member:', error);
    }
  };

  const handleAddFamilyMember = () => {
    if (!activeSubscription) return;

    Alert.prompt(
      'Пригласить в семейную подписку',
      'Введите email для отправки приглашения:',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Пригласить',
          onPress: async (email) => {
            if (!email) {
              Alert.alert('Ошибка', 'Email обязателен');
              return;
            }

            // Валидация email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
              Alert.alert('Ошибка', 'Введите корректный email');
              return;
            }

            try {
              const result = await api.sendInvitation(activeSubscription.id, { email }) as any;
              setShowAddFamilyModal(false);
              Alert.alert('Успешно!', result.message);
              
              // Обновляем данные подписки
              await loadSubscriptionData();
            } catch (error) {
              console.log('Failed to send invitation:', error);
              Alert.alert('Ошибка', 'Не удалось отправить приглашение');
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleCancelSubscription = async () => {
    if (!activeSubscription) return;

    Alert.alert(
      'Отменить подписку',
      'Вы уверены, что хотите отменить подписку? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Отменить подписку', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🔄 Cancelling subscription:', activeSubscription.id);
              await cancelSubscription();
              
              Alert.alert(
                'Успешно', 
                'Подписка отменена. Теперь вы можете выбрать новый тариф.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('❌ Failed to cancel subscription:', error);
              
              // Если API недоступен, предлагаем локальную отмену
              const errorMessage = error instanceof Error ? error.message : String(error);
              if (errorMessage && (errorMessage.includes('404') || errorMessage.includes('HTML'))) {
                Alert.alert(
                  'Сервер недоступен', 
                  'Не удалось связаться с сервером. Хотите отменить подписку локально?',
                  [
                    { text: 'Отмена', style: 'cancel' },
                    { 
                      text: 'Отменить локально', 
                      onPress: () => {
                        setActiveSubscription(null);
                        Alert.alert('Подписка скрыта', 'Подписка скрыта в приложении. Обратитесь в поддержку для полной отмены.');
                      }
                    }
                  ]
                );
              } else {
                Alert.alert('Ошибка', 'Не удалось отменить подписку. Попробуйте позже.');
              }
            }
          }
        }
      ]
    );
  };


  const formatPrice = (price: number): string => {
    return price.toLocaleString('ru-RU') + ' ₸';
  };

  const getCurrentPrice = (option: SubscriptionOption): number => {
    return option.prices[selectedPeriod][selectedPeople];
  };

  const calculateSavings = (option: SubscriptionOption): number => {
    const monthlyPrice = option.prices.monthly[selectedPeople];
    const yearlyPrice = option.prices.yearly[selectedPeople];
    return Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100);
  };

  // Анимация при выборе тарифа
  const animateCardSelection = (type: SubscriptionType) => {
    if (selectedType !== type) {
      // Анимация исчезновения
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setSelectedType(type);
        // Анимация появления
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  // Анимация при выборе количества людей
  const animatePeopleSelection = (people: PeopleCount) => {
    if (selectedPeople !== people) {
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setSelectedPeople(people);
      });
    }
  };



  const handleSubscribe = async (type: SubscriptionType) => {
    try {
      console.log(`Подписка на ${type}`);

      // Если подписка на несколько человек, показываем модальное окно для добавления членов семьи
      if (selectedPeople > 1) {
        setPendingSubscription({ type, period: selectedPeriod, people: selectedPeople });
        setShowAddFamilyModal(true);
        return;
      }

      // Если есть активная подписка, сначала отменяем её
      if (activeSubscription) {
        console.log('🔄 Отменяем активную подписку перед покупкой новой...');
        await cancelSubscription();
        console.log('✅ Активная подписка отменена');
      }

      // Выполняем покупку подписки через контекст
      const result = await purchaseSubscription(
        type,
        selectedPeriod,
        selectedPeople
      );

      console.log('Результат покупки:', result);

      // Показываем сообщение об успехе
      Alert.alert(
        'Успешно!', 
        `Подписка ${result.plan.name} активирована до ${new Date(result.endDate).toLocaleDateString('ru-RU')}`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Ошибка при покупке подписки:', error);
      Alert.alert('Ошибка', 'Не удалось оформить подписку. Попробуйте еще раз.');
    }
  };

  const handleCompleteSubscription = async () => {
    if (!pendingSubscription) return;

    try {
      // Если есть активная подписка, сначала отменяем её
      if (activeSubscription) {
        console.log('🔄 Отменяем активную подписку перед покупкой новой...');
        await cancelSubscription();
        console.log('✅ Активная подписка отменена');
      }

      // Выполняем покупку подписки через контекст
      const result = await purchaseSubscription(
        pendingSubscription.type,
        pendingSubscription.period,
        pendingSubscription.people
      );

      console.log('Результат покупки:', result);

      // Закрываем модальное окно
      setShowAddFamilyModal(false);
      setPendingSubscription(null);

      // Показываем сообщение об успехе
      Alert.alert(
        'Успешно!', 
        `Подписка ${result.plan.name} активирована до ${new Date(result.endDate).toLocaleDateString('ru-RU')}`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Ошибка при покупке подписки:', error);
      Alert.alert('Ошибка', 'Не удалось оформить подписку. Попробуйте еще раз.');
    }
  };

  const handleShowDetails = (option: SubscriptionOption) => {
    setSelectedPlanForDetails(option);
    setShowDetailsModal(true);
  };

  // Вспомогательные функции для активного абонемента
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return SUCCESS;
      case 'frozen': return '#2196F3';
      case 'expired': return '#F44336';
      case 'cancelled': return '#9E9E9E';
      default: return TEXT_MUTED;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'frozen': return 'Заморожен';
      case 'expired': return 'Истек';
      case 'cancelled': return 'Отменен';
      default: return 'Неизвестно';
    }
  };

  const calculateDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const calculateProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();

    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const selectedOption = subscriptionOptions.find(opt => opt.id === selectedType);

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
        {/* Активный абонемент */}
        {activeSubscription && (
          <View style={styles.activeSubscriptionSection}>
            <View style={styles.activeSubscriptionHeader}>
              <ThemedText type="heading2" style={styles.activeSubscriptionTitle}>
                Ваш активный абонемент
              </ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(activeSubscription.status) }]}>
                <ThemedText style={styles.statusText}>
                  {getStatusText(activeSubscription.status)}
                </ThemedText>
              </View>
            </View>

            <View style={styles.activeSubscriptionCard}>
              <View style={styles.subscriptionInfo}>
                <View style={styles.planBadge}>
                  <MaterialIcons
                    name={activeSubscription.plan.name === 'Gold' ? 'star' : 'star-outline'}
                    size={20}
                    color={activeSubscription.plan.name === 'Gold' ? SECONDARY : PRIMARY}
                  />
                  <ThemedText type="heading3" style={styles.planName}>
                    {activeSubscription.plan.name} Pass
                  </ThemedText>
                </View>

                <View style={styles.subscriptionDetails}>
                  <ThemedText style={styles.detailText}>
                    {familyMembers.length + 1} {familyMembers.length + 1 === 1 ? 'человек' : 'человек'}
                  </ThemedText>
                  <ThemedText style={styles.detailText}>
                    {activeSubscription.period === 'monthly' ? 'Месячная' : 'Годовая'} оплата
                  </ThemedText>
                  <ThemedText style={styles.detailText}>
                    До {new Date(activeSubscription.endDate).toLocaleDateString('ru-RU')}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.subscriptionActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setShowFreezeModal(true)}
                >
                  <MaterialIcons name="fitness-center" size={20} color={PRIMARY} />
                  <ThemedText style={styles.actionButtonText}>Заморозить</ThemedText>
                </TouchableOpacity>

                {familyMembers.length > 0 && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setShowFamilyModal(true)}
                  >
                    <MaterialIcons name="groups" size={20} color={PRIMARY} />
                    <ThemedText style={styles.actionButtonText}>Семья</ThemedText>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setShowPaymentHistoryModal(true)}
                >
                  <MaterialIcons name="receipt" size={20} color={PRIMARY} />
                  <ThemedText style={styles.actionButtonText}>История</ThemedText>
                </TouchableOpacity>
              </View>

              {/* Кнопка отмены подписки */}
              <View style={styles.cancelSubscriptionSection}>
                <TouchableOpacity
                  style={styles.cancelSubscriptionButton}
                  onPress={handleCancelSubscription}
                >
                  <MaterialIcons name="cancel" size={20} color={ERROR} />
                  <ThemedText style={styles.cancelSubscriptionText}>Отменить подписку</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Прогресс бар для оставшихся дней */}
            <View style={styles.progressSection}>
              <View style={styles.progressInfo}>
                <ThemedText style={styles.progressLabel}>Осталось дней:</ThemedText>
                <ThemedText type="heading3" style={styles.daysLeft}>
                  {calculateDaysLeft(activeSubscription.endDate)}
                </ThemedText>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${calculateProgress(activeSubscription.startDate, activeSubscription.endDate)}%` }
                  ]}
                />
              </View>
            </View>
          </View>
        )}

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <ThemedText type="heading1" style={styles.heroTitle}>
              {activeSubscription ? 'Управление абонементом' : 'Выберите свой тариф'}
            </ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              {activeSubscription
                ? 'Управляйте своим абонементом и семейными членами'
                : 'Получите доступ ко всем залам сети и эксклюзивным тренировкам'
              }
            </ThemedText>
          </View>
        </View>

        {/* Статистика */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            {subscriptionStats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <MaterialIcons name={stat.icon as any} size={24} color={PRIMARY} />
                <ThemedText type="heading3" style={styles.statValue}>
                  {stat.value}
                </ThemedText>
                <ThemedText style={styles.statLabel}>{stat.label}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Показываем выбор тарифов только если нет активной подписки */}
        {!activeSubscription && (
          <>
            {/* Выбор количества людей */}
            <Animated.View
              style={[
                styles.peopleSelectorSection,
                {
                  transform: [{ translateX: slideAnim }],
                }
              ]}
            >
              <ThemedText type="heading2" style={styles.sectionTitle}>
                Выберите количество человек
              </ThemedText>
              <View style={styles.peopleSelector}>
                {[1, 2, 3].map((count) => (
                  <TouchableOpacity
                    key={count}
                    style={[
                      styles.peopleOption,
                      selectedPeople === count && styles.peopleOptionActive
                    ]}
                    onPress={() => animatePeopleSelection(count as PeopleCount)}
                  >
                    <ThemedText style={[
                      styles.peopleOptionText,
                      selectedPeople === count && styles.peopleOptionTextActive
                    ]}>
                      {count} {count === 1 ? 'человек' : count < 5 ? 'человека' : 'человек'}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* Выбор периода оплаты */}
            <View style={styles.periodSelectorSection}>
              <ThemedText type="heading2" style={styles.sectionTitle}>
                Период оплаты
              </ThemedText>
              <View style={styles.periodSelector}>
                {[
                  { key: 'monthly', label: 'Ежемесячно', discount: null },
                  { key: 'yearly', label: 'Ежегодно', discount: 'Экономия до 30%' }
                ].map((period) => (
                  <TouchableOpacity
                    key={period.key}
                    style={[
                      styles.periodOption,
                      selectedPeriod === period.key && styles.periodOptionActive
                    ]}
                    onPress={() => setSelectedPeriod(period.key as PaymentPeriod)}
                  >
                    <View style={styles.periodOptionContent}>
                      <ThemedText style={[
                        styles.periodOptionText,
                        selectedPeriod === period.key && styles.periodOptionTextActive
                      ]}>
                        {period.label}
                      </ThemedText>
                      {period.discount && (
                        <View style={styles.savingsBadge}>
                          <ThemedText style={styles.savingsText}>{period.discount}</ThemedText>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Карточки тарифов */}
            <View style={styles.subscriptionsSection}>
              <ThemedText type="heading2" style={styles.sectionTitle}>
                Тарифы
              </ThemedText>
              
              <View style={styles.subscriptionCards}>
            {subscriptionOptions.map((option) => (
              <Animated.View
                key={option.id}
                style={[
                  styles.subscriptionCard,
                  selectedType === option.id && styles.subscriptionCardActive,
                  option.popular && styles.subscriptionCardPopular,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                  }
                ]}
              >
                <TouchableOpacity
                  style={styles.subscriptionCardTouchable}
                  onPress={() => animateCardSelection(option.id)}
                  activeOpacity={0.8}
                >
                {option.popular && (
                  <View style={styles.popularBadge}>
                    <ThemedText style={styles.popularText}>Популярный</ThemedText>
                  </View>
                )}
                
                <View style={styles.cardHeader}>
                  <View style={[styles.planIcon, { backgroundColor: option.color + '20' }]}>
                    <MaterialIcons name={option.icon as any} size={32} color={option.color} />
                  </View>
                  
                  <View style={styles.planInfo}>
                    <ThemedText type="heading3" style={styles.planTitle}>
                      {option.title}
                    </ThemedText>
                    <ThemedText style={styles.planSubtitle}>
                      {option.subtitle}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.priceSection}>
                  <View style={styles.priceRow}>
                    <ThemedText type="heading1" style={[styles.price, { color: option.color }]}>
                      {formatPrice(getCurrentPrice(option))}
                    </ThemedText>
                    <ThemedText style={styles.period}>
                      /{selectedPeriod === 'monthly' ? 'месяц' : 'год'}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.peopleCount}>
                    на {selectedPeople} {selectedPeople === 1 ? 'человека' : selectedPeople < 5 ? 'человек' : 'человек'}
                  </ThemedText>
                  {selectedPeriod === 'yearly' && (
                    <View style={styles.savingsBadge}>
                      <ThemedText style={styles.savingsText}>
                        Экономия {calculateSavings(option)}%
                      </ThemedText>
                    </View>
                  )}
                </View>

                <ThemedText style={styles.planDescription}>
                  {option.description}
                </ThemedText>

                <View style={styles.featuresSection}>
                  {option.features.slice(0, 4).map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <MaterialIcons
                        name={feature.included ? 'check-circle' : 'cancel'}
                        size={18}
                        color={feature.included ? SUCCESS : TEXT_MUTED}
                      />
                      <ThemedText style={[
                        styles.featureText,
                        !feature.included && styles.featureTextDisabled,
                        feature.highlight && styles.featureTextHighlight
                      ]}>
                        {feature.text}
                      </ThemedText>
                    </View>
                  ))}

                  {option.features.length > 4 && (
                    <TouchableOpacity
                      style={styles.showMoreButton}
                      onPress={() => handleShowDetails(option)}
                    >
                      <ThemedText style={styles.showMoreText}>
                        Показать все особенности ({option.features.length})
                      </ThemedText>
                      <MaterialIcons name="expand-more" size={16} color={PRIMARY} />
                    </TouchableOpacity>
                  )}
                </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Дополнительные услуги */}
        <View style={styles.servicesSection}>
          <ThemedText type="heading2" style={styles.sectionTitle}>
            Дополнительные услуги
          </ThemedText>
          
          <View style={styles.servicesList}>
            {additionalServices.map((service, index) => (
              <View key={index} style={styles.serviceCard}>
                <View style={[styles.serviceIcon, { backgroundColor: service.color + '20' }]}>
                  <MaterialIcons name={service.icon as any} size={24} color={service.color} />
                </View>
                
                <View style={styles.serviceInfo}>
                  <ThemedText type="defaultSemiBold" style={styles.serviceTitle}>
                    {service.title}
                  </ThemedText>
                  <ThemedText style={styles.serviceDescription}>
                    {service.description}
                  </ThemedText>
                </View>
                
                <View style={styles.servicePrice}>
                  <ThemedText style={styles.servicePriceText}>
                    {service.price}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Кнопки действий */}
        <View style={styles.actionsSection}>
          {selectedOption && (
            <Button
              style={[styles.subscribeButton, { backgroundColor: selectedOption.color }]}
              onPress={() => handleSubscribe(selectedType)}
            >
              <ThemedText style={styles.subscribeButtonText}>
                Подписаться на {selectedOption.title} • {formatPrice(getCurrentPrice(selectedOption))}
              </ThemedText>
            </Button>
          )}

          {selectedPeriod === 'yearly' && selectedOption && (
            <View style={styles.savingsInfo}>
              <ThemedText style={styles.savingsInfoText}>
                💰 Вы экономите {formatPrice((selectedOption.prices.monthly[selectedPeople] * 12) - getCurrentPrice(selectedOption))} при годовой оплате
              </ThemedText>
            </View>
          )}

          <TouchableOpacity style={styles.compareButton}>
            <ThemedText style={styles.compareButtonText}>
              Сравнить все тарифы
            </ThemedText>
            <Ionicons name="chevron-forward" size={16} color={PRIMARY} />
          </TouchableOpacity>
        </View>
          </>
        )}

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <ThemedText type="heading2" style={styles.sectionTitle}>
            Часто задаваемые вопросы
          </ThemedText>
          
          <View style={styles.faqList}>
            <TouchableOpacity style={styles.faqItem}>
              <ThemedText style={styles.faqQuestion}>
                Можно ли заморозить абонемент?
              </ThemedText>
              <Ionicons name="chevron-down" size={20} color={TEXT_MUTED} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.faqItem}>
              <ThemedText style={styles.faqQuestion}>
                Как добавить членов семьи?
              </ThemedText>
              <Ionicons name="chevron-down" size={20} color={TEXT_MUTED} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.faqItem}>
              <ThemedText style={styles.faqQuestion}>
                Можно ли отменить подписку?
              </ThemedText>
              <Ionicons name="chevron-down" size={20} color={TEXT_MUTED} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Модальное окно с деталями тарифа */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <View style={[styles.planIcon, { backgroundColor: selectedPlanForDetails?.color + '20' }]}>
                <MaterialIcons name={selectedPlanForDetails?.icon as any} size={32} color={selectedPlanForDetails?.color} />
              </View>
              <View style={styles.modalTitleContainer}>
                <ThemedText type="heading2" style={styles.modalTitle}>
                  {selectedPlanForDetails?.title}
                </ThemedText>
                <ThemedText style={styles.modalSubtitle}>
                  {selectedPlanForDetails?.subtitle}
                </ThemedText>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDetailsModal(false)}
            >
              <Ionicons name="close" size={24} color={TEXT_DARK} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Цена */}
            <View style={styles.modalPriceSection}>
              <View style={styles.priceRow}>
                <ThemedText type="heading1" style={[styles.modalPrice, { color: selectedPlanForDetails?.color }]}>
                  {selectedPlanForDetails ? formatPrice(getCurrentPrice(selectedPlanForDetails)) : ''}
                </ThemedText>
                <ThemedText style={styles.modalPeriod}>
                  /{selectedPeriod === 'monthly' ? 'месяц' : 'год'}
                </ThemedText>
              </View>
              <ThemedText style={styles.modalPeopleCount}>
                на {selectedPeople} {selectedPeople === 1 ? 'человека' : selectedPeople < 5 ? 'человек' : 'человек'}
              </ThemedText>
            </View>

            {/* Описание */}
            <View style={styles.modalSection}>
              <ThemedText type="heading3" style={styles.modalSectionTitle}>
                Описание
              </ThemedText>
              <ThemedText style={styles.modalDescription}>
                {selectedPlanForDetails?.description}
              </ThemedText>
            </View>

            {/* Все особенности */}
            <View style={styles.modalSection}>
              <ThemedText type="heading3" style={styles.modalSectionTitle}>
                Все особенности
              </ThemedText>
              <View style={styles.modalFeaturesList}>
                {selectedPlanForDetails?.features.map((feature, index) => (
                  <View key={index} style={styles.modalFeatureRow}>
                    <MaterialIcons
                      name={feature.included ? 'check-circle' : 'cancel'}
                      size={20}
                      color={feature.included ? SUCCESS : TEXT_MUTED}
                    />
                    <ThemedText style={[
                      styles.modalFeatureText,
                      !feature.included && styles.modalFeatureTextDisabled,
                      feature.highlight && styles.modalFeatureTextHighlight
                    ]}>
                      {feature.text}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>

            {/* Кнопки действий */}
            <View style={styles.modalActions}>
              <Button
                style={[styles.modalSubscribeButton, { backgroundColor: selectedPlanForDetails?.color }]}
                onPress={() => {
                  if (selectedPlanForDetails) {
                    handleSubscribe(selectedPlanForDetails.id);
                    setShowDetailsModal(false);
                  }
                }}
              >
                <ThemedText style={styles.modalSubscribeButtonText}>
                  Выбрать {selectedPlanForDetails?.title}
                </ThemedText>
              </Button>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowDetailsModal(false)}
              >
                <ThemedText style={styles.modalCloseButtonText}>
                  Закрыть
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Модальное окно заморозки абонемента */}
      <Modal
        visible={showFreezeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFreezeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText type="heading2" style={styles.modalTitle}>
              Заморозка абонемента
            </ThemedText>
            <TouchableOpacity onPress={() => setShowFreezeModal(false)}>
              <Ionicons name="close" size={24} color={TEXT_DARK} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalSection}>
              <ThemedText style={styles.modalDescription}>
                {activeSubscription?.plan.name === 'Gold' 
                  ? 'Gold Pass: 2 бесплатные заморозки по 30 дней каждая в год. При заморозке срок действия автоматически продлевается.'
                  : 'Silver Pass: 1 бесплатная заморозка до 30 дней в год. Дополнительные дни за 5,000 ₸. Запрос подается минимум за 7 дней.'
                }
              </ThemedText>
            </View>

            {/* Выбор количества дней */}
            <View style={styles.modalSection}>
              <ThemedText type="heading3" style={styles.modalSectionTitle}>
                Количество дней
              </ThemedText>
              <View style={styles.freezeOptions}>
                {[7, 14, 30].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.freezeOption,
                      freezeDays === days && styles.freezeOptionActive
                    ]}
                    onPress={() => setFreezeDays(days)}
                  >
                    <ThemedText style={[
                      styles.freezeOptionText,
                      freezeDays === days && styles.freezeOptionTextActive
                    ]}>
                      {days} дней
                    </ThemedText>
                    <ThemedText style={[
                      styles.freezeOptionPrice,
                      freezeDays === days && styles.freezeOptionPriceActive
                    ]}>
                      {days > 30 && activeSubscription?.plan.name === 'Silver' ? '5,000 ₸' : 'Бесплатно'}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Выбор даты начала */}
            <View style={styles.modalSection}>
              <ThemedText type="heading3" style={styles.modalSectionTitle}>
                Дата начала заморозки
              </ThemedText>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => {
                  // Здесь можно добавить DatePicker
                  const minDate = new Date();
                  minDate.setDate(minDate.getDate() + 7);
                  setFreezeStartDate(minDate.toISOString().split('T')[0]);
                }}
              >
                <ThemedText style={styles.datePickerText}>
                  {freezeStartDate ? new Date(freezeStartDate).toLocaleDateString('ru-RU') : 'Выберите дату (минимум через 7 дней)'}
                </ThemedText>
                <Ionicons name="calendar-outline" size={20} color={PRIMARY} />
              </TouchableOpacity>
            </View>

            {/* Причина заморозки */}
            <View style={styles.modalSection}>
              <ThemedText type="heading3" style={styles.modalSectionTitle}>
                Причина заморозки (необязательно)
              </ThemedText>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  multiline
                  numberOfLines={3}
                  placeholder="Укажите причину заморозки..."
                  value={freezeReason}
                  onChangeText={setFreezeReason}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                style={[styles.modalSubscribeButton, { backgroundColor: PRIMARY }]}
                onPress={handleFreezeSubscription}
                disabled={!freezeStartDate}
              >
                <ThemedText style={styles.modalSubscribeButtonText}>
                  Создать запрос на заморозку
                </ThemedText>
              </Button>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowFreezeModal(false)}
              >
                <ThemedText style={styles.modalCloseButtonText}>
                  Отмена
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Модальное окно управления семьей */}
      <Modal
        visible={showFamilyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFamilyModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText type="heading2" style={styles.modalTitle}>
              Семейные члены
            </ThemedText>
            <TouchableOpacity onPress={() => setShowFamilyModal(false)}>
              <Ionicons name="close" size={24} color={TEXT_DARK} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalSection}>
              <ThemedText style={styles.modalDescription}>
                Управляйте членами семьи, которые имеют доступ к вашему абонементу.
              </ThemedText>
            </View>

            {familyMembers.map((member) => (
              <View key={member.id} style={styles.familyMember}>
                <View style={styles.familyMemberInfo}>
                  <ThemedText type="defaultSemiBold" style={styles.familyMemberName}>
                    {member.name}
                  </ThemedText>
                  <ThemedText style={styles.familyMemberEmail}>
                    {member.email}
                  </ThemedText>
                  <ThemedText style={styles.familyMemberStatus}>
                    {member.status === 'active' ? 'Активен' : 'Неактивен'}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  style={styles.removeMemberButton}
                  onPress={() => handleRemoveFamilyMember(member.id)}
                >
                  <MaterialIcons name="person-remove" size={20} color={ERROR} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity 
              style={styles.addMemberButton}
              onPress={() => handleAddFamilyMember()}
            >
              <MaterialIcons name="person-add" size={20} color={PRIMARY} />
                  <ThemedText style={styles.addMemberText}>
                    Пригласить по email
                  </ThemedText>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowFamilyModal(false)}
              >
                <ThemedText style={styles.modalCloseButtonText}>
                  Закрыть
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Модальное окно истории платежей */}
      <Modal
        visible={showPaymentHistoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPaymentHistoryModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText type="heading2" style={styles.modalTitle}>
              История платежей
            </ThemedText>
            <TouchableOpacity onPress={() => setShowPaymentHistoryModal(false)}>
              <Ionicons name="close" size={24} color={TEXT_DARK} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {paymentHistory.map((payment) => (
              <View key={payment.id} style={styles.paymentItem}>
                <View style={styles.paymentInfo}>
                  <ThemedText type="defaultSemiBold" style={styles.paymentType}>
                    {payment.type === 'purchase' ? 'Покупка' :
                     payment.type === 'renewal' ? 'Продление' :
                     payment.type === 'extension' ? 'Расширение' : 'Возврат'}
                  </ThemedText>
                  <ThemedText style={styles.paymentDate}>
                    {new Date(payment.createdAt).toLocaleDateString('ru-RU')}
                  </ThemedText>
                </View>
                <View style={styles.paymentAmount}>
                  <ThemedText style={[styles.paymentAmountText, {
                    color: payment.type === 'refund' ? ERROR : SUCCESS
                  }]}>
                    {payment.type === 'refund' ? '-' : ''}{payment.amount.toLocaleString('ru-RU')} ₸
                  </ThemedText>
                  <View style={[styles.paymentStatus, {
                    backgroundColor: payment.status === 'completed' ? SUCCESS + '20' : '#FFC10720'
                  }]}>
                    <ThemedText style={[styles.paymentStatusText, {
                      color: payment.status === 'completed' ? SUCCESS : '#FFC107'
                    }]}>
                      {payment.status === 'completed' ? 'Оплачено' :
                       payment.status === 'pending' ? 'Ожидает' : 'Неудачно'}
                    </ThemedText>
                  </View>
                </View>
              </View>
            ))}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowPaymentHistoryModal(false)}
              >
                <ThemedText style={styles.modalCloseButtonText}>
                  Закрыть
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Модальное окно для добавления членов семьи при покупке подписки */}
      <Modal
        visible={showAddFamilyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowAddFamilyModal(false);
          setPendingSubscription(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText type="heading2" style={styles.modalTitle}>
              Добавить членов семьи
            </ThemedText>
            <TouchableOpacity onPress={() => {
              setShowAddFamilyModal(false);
              setPendingSubscription(null);
            }}>
              <Ionicons name="close" size={24} color={TEXT_DARK} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalSection}>
              <ThemedText style={styles.modalDescription}>
                Вы покупаете подписку на {pendingSubscription?.people} {pendingSubscription?.people === 1 ? 'человека' : 'человек'}. 
                Пригласите членов семьи по email - они получат уведомление и смогут присоединиться к подписке.
              </ThemedText>
            </View>

            <View style={styles.modalSection}>
              <ThemedText type="heading3" style={styles.modalSectionTitle}>
                Члены семьи ({familyMembers.length}/{pendingSubscription ? pendingSubscription.people - 1 : 0})
              </ThemedText>
              
              {familyMembers.map((member) => (
                <View key={member.id} style={styles.familyMember}>
                  <View style={styles.familyMemberInfo}>
                    <ThemedText type="defaultSemiBold" style={styles.familyMemberName}>
                      {member.name}
                    </ThemedText>
                    <ThemedText style={styles.familyMemberEmail}>
                      {member.email}
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    style={styles.removeMemberButton}
                    onPress={() => handleRemoveFamilyMember(member.id)}
                  >
                    <MaterialIcons name="person-remove" size={20} color={ERROR} />
                  </TouchableOpacity>
                </View>
              ))}

              {familyMembers.length < (pendingSubscription ? pendingSubscription.people - 1 : 0) && (
                <TouchableOpacity 
                  style={styles.addMemberButton}
                  onPress={() => handleAddFamilyMember()}
                >
                  <MaterialIcons name="person-add" size={20} color={PRIMARY} />
                  <ThemedText style={styles.addMemberText}>
                    Пригласить по email
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.modalActions}>
              <Button
                style={[styles.modalSubscribeButton, { backgroundColor: PRIMARY }]}
                onPress={handleCompleteSubscription}
                disabled={familyMembers.length < (pendingSubscription ? pendingSubscription.people - 1 : 0)}
              >
                <ThemedText style={styles.modalSubscribeButtonText}>
                  Оформить подписку
                </ThemedText>
              </Button>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setShowAddFamilyModal(false);
                  setPendingSubscription(null);
                }}
              >
                <ThemedText style={styles.modalCloseButtonText}>
                  Отмена
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
        </Modal>

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
  
  // Hero section
  heroSection: {
    backgroundColor: BG,
    margin: 16,
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroContent: {
    flex: 1,
    marginRight: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 20,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  discountText: {
    color: CARD_BG,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  
  // Stats
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BG,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 11,
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  
  // Subscriptions
  subscriptionsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_DARK,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  subscriptionCards: {
    paddingHorizontal: 16,
    gap: 16,
  },
  subscriptionCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: BG,
    position: 'relative',
    marginBottom: 16,
  },
  subscriptionCardTouchable: {
    padding: 20,
  },
  subscriptionCardActive: {
    borderColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  subscriptionCardPopular: {
    borderColor: SECONDARY,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: SECONDARY,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  popularText: {
    color: CARD_BG,
    fontSize: 12,
    fontWeight: '600',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  planSubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  discountLabel: {
    backgroundColor: SUCCESS + '20',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountLabelText: {
    color: SUCCESS,
    fontSize: 12,
    fontWeight: '600',
  },
  priceSection: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  period: {
    fontSize: 16,
    color: TEXT_MUTED,
    marginLeft: 4,
  },
  originalPrice: {
    fontSize: 14,
    color: TEXT_MUTED,
    textDecorationLine: 'line-through',
    marginTop: 4,
  },
  planDescription: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 20,
    lineHeight: 20,
  },
  featuresSection: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: TEXT_DARK,
    marginLeft: 12,
    flex: 1,
  },
  featureTextDisabled: {
    color: TEXT_MUTED,
  },
  featureTextHighlight: {
    fontWeight: '600',
    color: TEXT_DARK,
  },
  
  // Services
  servicesSection: {
    marginBottom: 32,
  },
  servicesList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  serviceCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BG,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    color: TEXT_DARK,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    color: TEXT_MUTED,
    lineHeight: 18,
  },
  servicePrice: {
    alignItems: 'flex-end',
  },
  servicePriceText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY,
  },
  
  // Actions
  actionsSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
    gap: 12,
  },
  subscribeButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: CARD_BG,
    fontSize: 16,
    fontWeight: 'bold',
  },
  manageButton: {
    backgroundColor: BG,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  manageButtonText: {
    color: TEXT_DARK,
    fontSize: 16,
    fontWeight: '600',
  },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  compareButtonText: {
    fontSize: 14,
    color: PRIMARY,
    fontWeight: '600',
    marginRight: 8,
  },
  
  // FAQ
  faqSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  faqList: {
    gap: 1,
    backgroundColor: BG,
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqItem: {
    backgroundColor: CARD_BG,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 14,
    color: TEXT_DARK,
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },

  // People selector
  peopleSelectorSection: {
    marginBottom: 32,
  },
  peopleSelector: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  peopleOption: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: BG,
  },
  peopleOptionActive: {
    borderColor: PRIMARY,
    backgroundColor: BG,
  },
  peopleOptionText: {
    fontSize: 16,
    color: TEXT_MUTED,
    fontWeight: '600',
  },
  peopleOptionTextActive: {
    color: PRIMARY,
  },
  peopleCount: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 4,
    textAlign: 'center',
  },

  // Period selector
  periodSelectorSection: {
    marginBottom: 32,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  periodOption: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: BG,
  },
  periodOptionActive: {
    borderColor: PRIMARY,
    backgroundColor: BG,
  },
  periodOptionContent: {
    alignItems: 'center',
  },
  periodOptionText: {
    fontSize: 16,
    color: TEXT_MUTED,
    fontWeight: '600',
    marginBottom: 4,
  },
  periodOptionTextActive: {
    color: PRIMARY,
  },

  // Savings badges and info
  savingsBadge: {
    backgroundColor: SUCCESS + '20',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
  },
  savingsText: {
    color: SUCCESS,
    fontSize: 12,
    fontWeight: '600',
  },
  savingsInfo: {
    backgroundColor: SUCCESS + '10',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: SUCCESS + '30',
  },
  savingsInfoText: {
    color: TEXT_DARK,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Show more button
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  showMoreText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: CARD_BG,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_LIGHT,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalTitleContainer: {
    marginLeft: 16,
    flex: 1,
  },
  modalTitle: {
    marginBottom: 4,
  },
  modalSubtitle: {
    color: TEXT_MUTED,
    fontSize: 16,
  },
  closeButton: {
    padding: 8,
    marginLeft: 16,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalPriceSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_LIGHT,
  },
  modalPrice: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  modalPeriod: {
    fontSize: 18,
    color: TEXT_MUTED,
    marginLeft: 8,
    marginTop: 8,
  },
  modalPeopleCount: {
    color: TEXT_MUTED,
    fontSize: 14,
    marginTop: 8,
  },
  modalSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_LIGHT,
  },
  modalSectionTitle: {
    marginBottom: 12,
  },
  modalDescription: {
    color: TEXT_DARK,
    fontSize: 16,
    lineHeight: 24,
  },
  modalFeaturesList: {
    gap: 16,
  },
  modalFeatureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  modalFeatureText: {
    fontSize: 16,
    color: TEXT_DARK,
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  modalFeatureTextDisabled: {
    color: TEXT_MUTED,
    textDecorationLine: 'line-through',
  },
  modalFeatureTextHighlight: {
    fontWeight: '600',
    color: TEXT_DARK,
  },
  modalActions: {
    paddingVertical: 32,
    gap: 12,
  },
  modalSubscribeButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalSubscribeButtonText: {
    color: CARD_BG,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: SURFACE_LIGHT,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  modalCloseButtonText: {
    color: TEXT_DARK,
    fontSize: 16,
    fontWeight: '600',
  },

  // Active Subscription Styles
  activeSubscriptionSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  activeSubscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activeSubscriptionTitle: {
    color: TEXT_DARK,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: CARD_BG,
    fontSize: 12,
    fontWeight: '600',
  },
  activeSubscriptionCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 20,
    shadowColor: SHADOW_LIGHT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: BG,
  },
  subscriptionInfo: {
    marginBottom: 16,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    marginLeft: 8,
    color: TEXT_DARK,
  },
  subscriptionDetails: {
    gap: 4,
  },
  detailText: {
    color: TEXT_MUTED,
    fontSize: 14,
  },
  subscriptionActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER_LIGHT,
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: PRIMARY,
    marginTop: 4,
  },
  progressSection: {
    marginTop: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    color: TEXT_MUTED,
    fontSize: 14,
  },
  daysLeft: {
    color: PRIMARY,
  },
  progressBar: {
    height: 4,
    backgroundColor: SURFACE_LIGHT,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: PRIMARY,
    borderRadius: 2,
  },

  // Freeze Modal Styles
  freezeOptions: {
    gap: 12,
  },
  freezeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: SURFACE_LIGHT,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  freezeOptionActive: {
    borderColor: PRIMARY,
    backgroundColor: ACCENT_BG,
  },
  freezeOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  freezeOptionTextActive: {
    color: PRIMARY,
  },
  freezeOptionPrice: {
    color: SUCCESS,
    fontSize: 14,
  },
  freezeOptionPriceActive: {
    color: PRIMARY,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: SURFACE_LIGHT,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  datePickerText: {
    fontSize: 16,
    color: TEXT_DARK,
  },
  textInputContainer: {
    backgroundColor: SURFACE_LIGHT,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    padding: 16,
  },
  textInput: {
    fontSize: 16,
    color: TEXT_DARK,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Family Modal Styles
  familyMember: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: SURFACE_LIGHT,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  familyMemberInfo: {
    flex: 1,
  },
  familyMemberName: {
    color: TEXT_DARK,
    marginBottom: 4,
  },
  familyMemberEmail: {
    color: TEXT_MUTED,
    fontSize: 14,
    marginBottom: 2,
  },
  familyMemberStatus: {
    color: SUCCESS,
    fontSize: 12,
  },
  removeMemberButton: {
    padding: 8,
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: ACCENT_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BG,
    marginBottom: 20,
  },
  addMemberText: {
    color: PRIMARY,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Payment History Styles
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: SURFACE_LIGHT,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentType: {
    color: TEXT_DARK,
    marginBottom: 4,
  },
  paymentDate: {
    color: TEXT_MUTED,
    fontSize: 12,
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  paymentAmountText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Cancel Subscription Styles
  cancelSubscriptionSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER_LIGHT,
  },
  cancelSubscriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: CARD_BG,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ERROR,
  },
  cancelSubscriptionText: {
    fontSize: 14,
    color: ERROR,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 