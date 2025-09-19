import { Logo } from '@/components/Logo';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { AppHeader } from '@/components/AppHeader';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { api, getToken } from '@/lib/api';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import {
    Alert,
    Animated,
    Modal,
    Platform,
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

// Планы подписок теперь загружаются из API
const defaultSubscriptionOptions: SubscriptionOption[] = [
  {
    id: 'silver',
    title: 'Silver Pass',
    subtitle: 'Базовый доступ к залу',
    prices: {
      monthly: { 1: 0, 2: 0, 3: 0 }, // Не используется, только yearly
      yearly: {
        1: 350000,
        2: 600000,
        3: 750000
      }
    },
    description: 'Базовый доступ к залу на год',
    color: '#C0C0C0',
    icon: 'star',
    popular: false,
    features: [
      { text: 'Доступ к основному залу', included: true },
      { text: 'Групповые занятия', included: true },
      { text: 'Раздевалки и душевые', included: true },
      { text: 'Wi-Fi', included: true },
      { text: 'Персональный тренер', included: false },
      { text: 'Спа-процедуры', included: false },
    ]
  },
  {
    id: 'gold',
    title: 'Gold Pass',
    subtitle: 'Премиум доступ к залу',
    prices: {
      monthly: { 1: 0, 2: 0, 3: 0 }, // Не используется, только yearly
      yearly: {
        1: 500000,
        2: 900000,
        3: 1250000
      }
    },
    description: 'Премиум доступ к залу на год',
    color: '#FFD700',
    icon: 'star',
    popular: true,
    features: [
      { text: 'Доступ ко всем зонам', included: true },
      { text: 'Безлимитные посещения', included: true },
      { text: 'Персональный тренер', included: true },
      { text: 'Спа-процедуры', included: true },
      { text: 'Бассейн', included: true },
      { text: 'Групповые занятия', included: true },
    ]
  }
];

// Дополнительные услуги
const additionalServices = [
  {
    icon: 'fitness-center',
    title: 'Персональный тренер',
    description: 'Индивидуальные занятия с профессиональным тренером',
    price: 'По запросу',
    color: PRIMARY,
  },
  {
    icon: 'spa',
    title: 'СПА услуги',
    description: 'Массаж, сауна, wellness процедуры',
    price: 'По запросу',
    color: '#00BCD4',
  },
  {
    icon: 'restaurant',
    title: 'Спортивное питание',
    description: 'Протеины, витамины, спортивные добавки',
    price: 'По запросу',
    color: '#4CAF50',
  },
];


export default function SubscriptionScreen() {
  const { 
    activeSubscription, 
    familyMembers, 
    paymentHistory, 
    loading,
    loadSubscriptionData,
    setActiveSubscription,
    addFamilyMember,
    removeFamilyMember,
    freezeSubscription,
    cancelSubscription,
    purchaseSubscription
  } = useSubscription();
  
  // Безопасные значения из контекста
  const safeActiveSubscription = activeSubscription || null;
  const safeFamilyMembers = familyMembers || [];
  const safePaymentHistory = paymentHistory || [];
  const safeLoading = loading || false;
  
  const [selectedType, setSelectedType] = useState<SubscriptionType>('silver');
  const [selectedPeople, setSelectedPeople] = useState<PeopleCount>(1);
  const [selectedPeriod, setSelectedPeriod] = useState<PaymentPeriod>('yearly');
  const [refreshing, setRefreshing] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPlanForDetails, setSelectedPlanForDetails] = useState<SubscriptionOption | null>(null);
  const [subscriptionOptions, setSubscriptionOptions] = useState<SubscriptionOption[]>(defaultSubscriptionOptions);

  // Модальные окна для управления
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteMethod, setInviteMethod] = useState<'email' | 'phone'>('email');
  const [showFreezeHistoryModal, setShowFreezeHistoryModal] = useState(false);
  const [pendingSubscription, setPendingSubscription] = useState<{type: SubscriptionType, period: PaymentPeriod, people: PeopleCount} | null>(null);
  
  // Состояние для заморозки
  const [freezeDays, setFreezeDays] = useState(7);
  const [freezeStartDate, setFreezeStartDate] = useState('');
  const [freezeReason, setFreezeReason] = useState('');
  

  const insets = useSafeAreaInsets();

  // Состояние для FAQ
  const [openFaqItems, setOpenFaqItems] = useState<Set<number>>(new Set());
  const [faqAnimations, setFaqAnimations] = useState<Map<number, Animated.Value>>(new Map());

  // Анимационные значения
  const fadeAnim = useState(new Animated.Value(1))[0];
  const scaleAnim = useState(new Animated.Value(1))[0];
  const slideAnim = useState(new Animated.Value(0))[0];

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSubscriptionData();
    await loadSubscriptionPlans();
    setRefreshing(false);
  };

  // Функция для переключения состояния FAQ
  const toggleFaqItem = (index: number) => {
    const newOpenItems = new Set(openFaqItems);
    const isCurrentlyOpen = newOpenItems.has(index);
    
    if (isCurrentlyOpen) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    
    setOpenFaqItems(newOpenItems);
    
    // Анимация
    const newAnimations = new Map(faqAnimations);
    if (!newAnimations.has(index)) {
      newAnimations.set(index, new Animated.Value(0));
    }
    
    const animation = newAnimations.get(index)!;
    Animated.timing(animation, {
      toValue: isCurrentlyOpen ? 0 : 1,
      duration: 300,
      useNativeDriver: true, // Используем native driver для лучшей производительности
    }).start();
    
    setFaqAnimations(newAnimations);
  };

  // Данные FAQ
  const faqData = [
    {
      question: "Как работает система бронирования занятий?",
      answer: "Вы можете бронировать занятия через мобильное приложение. Найдите интересующий зал, выберите дату и время, затем нажмите 'Забронировать'. За 2 часа и за 1 час до начала занятия вы получите уведомление. Занятие можно отменить в любое время до его начала."
    },
    {
      question: "Можно ли заморозить абонемент?",
      answer: "Да, вы можете заморозить абонемент на срок от 7 до 30 дней. Заявка на заморозку подается минимум за 7 дней до желаемой даты начала заморозки. Silver Pass: 1 бесплатная заморозка до 30 дней в год. Gold Pass: 2 бесплатные заморозки по 30 дней каждая в год."
    },
    {
      question: "Как работает семейная подписка?",
      answer: "Семейная подписка позволяет пригласить до 2-3 человек (в зависимости от тарифа) в ваш абонемент. Владелец подписки может приглашать по email или телефону. Приглашенные пользователи получают уведомление и могут принять или отклонить приглашение."
    },
    {
      question: "Что входит в Silver Pass?",
      answer: "Silver Pass включает доступ к основному залу, групповые занятия, раздевалки и душевые, Wi-Fi. Это базовый тариф для индивидуальных тренировок. Подходит для тех, кто хочет начать свой фитнес-путь."
    },
    {
      question: "Что входит в Gold Pass?",
      answer: "Gold Pass включает все возможности Silver Pass плюс доступ к премиум зонам, приоритетное бронирование занятий, скидки на дополнительные услуги, эксклюзивные тренировки и больше возможностей для заморозки абонемента."
    },
    {
      question: "Как отменить занятие?",
      answer: "Отменить занятие можно в любое время до его начала. В разделе 'Расписание' найдите ваше занятие и нажмите 'Отменить занятие'. Отмененное занятие освободит место для других пользователей."
    },
    {
      question: "Можно ли пригласить друзей на занятие?",
      answer: "Да, в разделе 'Расписание' есть кнопка 'Позвать' для каждого забронированного занятия. Вы можете пригласить друзей присоединиться к вашему занятию, если у них есть активная подписка."
    },
    {
      question: "Что делать, если не могу посетить занятие?",
      answer: "Если вы не можете посетить занятие, обязательно отмените бронирование заранее. Это освободит место для других пользователей. При частых пропусках без отмены могут применяться ограничения на бронирование."
    }
  ];

  const loadSubscriptionPlans = async () => {
    try {
      console.log('🔄 Загружаем планы подписки...');
      const response = await api.getSubscriptionPlans();
      console.log('📊 Ответ API:', response);
      if (response.plans && response.plans.length > 0) {
        // Группируем планы по типу (Silver/Gold)
        const silverPlans = response.plans.filter((plan: any) => plan.name.includes('Silver'));
        const goldPlans = response.plans.filter((plan: any) => plan.name.includes('Gold'));
        
        console.log('🔍 Silver планы:', silverPlans);
        console.log('🔍 Gold планы:', goldPlans);
        
        const groupedPlans: SubscriptionOption[] = [];
        
        // Создаем Silver Pass план
        if (silverPlans.length > 0) {
          console.log('🔧 Создаем Silver Pass план...');
          const silverPlan = {
            id: 'silver' as SubscriptionType,
            title: 'Silver Pass',
            subtitle: 'Базовый доступ к залу',
            prices: {
              monthly: { 1: 0, 2: 0, 3: 0 },
              yearly: {
                1: silverPlans.find((p: any) => p.name.includes('1 человек'))?.price || 250000,
                2: silverPlans.find((p: any) => p.name.includes('2 человека'))?.price || 450000,
                3: silverPlans.find((p: any) => p.name.includes('3 человека'))?.price || 600000,
              }
            },
            description: 'Базовый доступ к залу на год',
            color: '#C0C0C0',
            icon: 'star',
            popular: false,
            features: silverPlans[0]?.features?.map((feature: string) => ({
              text: feature,
              included: true
            })) || []
          };
          groupedPlans.push(silverPlan);
        }
        
        // Создаем Gold Pass план
        if (goldPlans.length > 0) {
          console.log('🔧 Создаем Gold Pass план...');
          const goldPlan = {
            id: 'gold' as SubscriptionType,
            title: 'Gold Pass',
            subtitle: 'Премиум доступ к залу',
            prices: {
              monthly: { 1: 0, 2: 0, 3: 0 },
              yearly: {
                1: goldPlans.find((p: any) => p.name.includes('1 человек'))?.price || 350000,
                2: goldPlans.find((p: any) => p.name.includes('2 человека'))?.price || 650000,
                3: goldPlans.find((p: any) => p.name.includes('3 человека'))?.price || 900000,
              }
            },
            description: 'Премиум доступ к залу на год',
            color: '#FFD700',
            icon: 'star',
            popular: true,
            features: goldPlans[0]?.features?.map((feature: string) => ({
              text: feature,
              included: true
            })) || []
          };
          groupedPlans.push(goldPlan);
        }
        
        console.log('✅ Установлены планы:', groupedPlans);
        setSubscriptionOptions(groupedPlans);
      } else {
        console.log('⚠️ Планы не найдены, используем дефолтные');
        setSubscriptionOptions(defaultSubscriptionOptions);
      }
    } catch (error) {
      console.log('❌ Ошибка загрузки планов:', error);
      // Используем дефолтные планы в случае ошибки
      setSubscriptionOptions(defaultSubscriptionOptions);
    }
  };

  // Загружаем планы при монтировании компонента
  useEffect(() => {
    loadSubscriptionPlans();
  }, []);

  // Управление абонементом
  const handleFreezeSubscription = async () => {
    if (!safeActiveSubscription) return;

    if (!freezeStartDate) {
      Alert.alert('Ошибка', 'Выберите дату начала заморозки');
      return;
    }

    try {
      const result = await api.freezeSubscription(safeActiveSubscription?.id || '', {
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
    if (!safeActiveSubscription) return;

    try {
      await removeFamilyMember(memberId);
    } catch (error) {
      console.log('Failed to remove family member:', error);
    }
  };

  const handleAddFamilyMember = () => {
    console.log('🔍 Checking active subscription:', safeActiveSubscription);
    if (!safeActiveSubscription) {
      Alert.alert('Ошибка', 'У вас нет активной подписки');
      return;
    }

    // Проверяем, поддерживает ли платформа Alert.prompt
    if (Platform.OS === 'ios') {
      Alert.alert(
        'Пригласить в семейную подписку',
        'Выберите способ приглашения:',
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'По email',
            onPress: () => {
              Alert.prompt(
                'Пригласить по email',
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

                      await sendEmailInvitation(email);
                    }
                  }
                ],
                'plain-text'
              );
            }
          },
          {
            text: 'По номеру телефона',
            onPress: () => {
              Alert.prompt(
                'Пригласить по номеру телефона',
                'Введите номер телефона для отправки приглашения:',
                [
                  { text: 'Отмена', style: 'cancel' },
                  {
                    text: 'Пригласить',
                    onPress: async (phone) => {
                      if (!phone) {
                        Alert.alert('Ошибка', 'Номер телефона обязателен');
                        return;
                      }

                      // Валидация номера телефона (базовая)
                      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
                      if (!phoneRegex.test(phone)) {
                        Alert.alert('Ошибка', 'Введите корректный номер телефона');
                        return;
                      }

                      await sendPhoneInvitation(phone);
                    }
                  }
                ],
                'plain-text'
              );
            }
          }
        ]
      );
    } else {
      // Для Android показываем модальное окно для ввода данных
      setInviteMethod('email');
      setInviteEmail('');
      setInvitePhone('');
      setShowInviteModal(true);
    }
  };

  const sendEmailInvitation = async (email: string) => {
    try {
      console.log('📧 Sending email invitation to:', email);
      console.log('📧 Subscription ID:', safeActiveSubscription?.id);
      console.log('📧 Token exists:', !!(await getToken()));
      
      const result = await api.sendInvitation(safeActiveSubscription?.id || '', { email }) as any;
      console.log('📧 Invitation result:', result);
      
      setShowAddFamilyModal(false);
      Alert.alert('Успешно!', result.message || 'Приглашение отправлено');
      
      // Обновляем данные подписки
      await loadSubscriptionData();
    } catch (error) {
      console.error('❌ Failed to send email invitation:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      let errorMessage = 'Неизвестная ошибка';
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Не авторизован')) {
          errorMessage = 'Ошибка авторизации. Попробуйте войти в приложение заново.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Подписка не найдена. Проверьте, что у вас есть активная подписка.';
        } else if (error.message.includes('400')) {
          errorMessage = 'Некорректные данные. Проверьте email и попробуйте снова.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Ошибка', `Не удалось отправить приглашение: ${errorMessage}`);
    }
  };

  const sendPhoneInvitation = async (phone: string) => {
    try {
      console.log('📱 Sending phone invitation to:', phone);
      console.log('📱 Subscription ID:', safeActiveSubscription?.id);
      console.log('📱 Token exists:', !!(await getToken()));
      
      const result = await api.sendInvitation(safeActiveSubscription?.id || '', { phone }) as any;
      console.log('📱 Invitation result:', result);
      
      setShowAddFamilyModal(false);
      setShowInviteModal(false);
      Alert.alert('Успешно!', result.message || 'Приглашение отправлено');
      
      // Обновляем данные подписки
      await loadSubscriptionData();
    } catch (error) {
      console.error('❌ Failed to send phone invitation:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      let errorMessage = 'Неизвестная ошибка';
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Не авторизован')) {
          errorMessage = 'Ошибка авторизации. Попробуйте войти в приложение заново.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Подписка не найдена. Проверьте, что у вас есть активная подписка.';
        } else if (error.message.includes('400')) {
          errorMessage = 'Некорректные данные. Проверьте номер телефона и попробуйте снова.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Ошибка', `Не удалось отправить приглашение: ${errorMessage}`);
    }
  };

  const handleInviteFromModal = async () => {
    if (inviteMethod === 'email') {
      if (!inviteEmail.trim()) {
        Alert.alert('Ошибка', 'Введите email');
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inviteEmail)) {
        Alert.alert('Ошибка', 'Введите корректный email');
        return;
      }
      
      await sendEmailInvitation(inviteEmail);
    } else {
      if (!invitePhone.trim()) {
        Alert.alert('Ошибка', 'Введите номер телефона');
        return;
      }
      
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(invitePhone)) {
        Alert.alert('Ошибка', 'Введите корректный номер телефона');
        return;
      }
      
      await sendPhoneInvitation(invitePhone);
    }
  };

  const handleCancelSubscription = async () => {
    if (!safeActiveSubscription) return;

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
              console.log('🔄 Cancelling subscription:', safeActiveSubscription?.id);
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
    return option?.prices?.[selectedPeriod]?.[selectedPeople] || 0;
  };

  const calculateSavings = (option: SubscriptionOption): number => {
    const monthlyPrice = option?.prices?.monthly?.[selectedPeople] || 0;
    const yearlyPrice = option?.prices?.yearly?.[selectedPeople] || 0;
    if (monthlyPrice === 0) return 0;
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
      console.log(`Заявка на ${type}`);

      // Загружаем планы из API, чтобы найти правильный план
      const response = await api.getSubscriptionPlans();
      if (!response.plans || response.plans.length === 0) {
        Alert.alert('Ошибка', 'Планы подписки не найдены');
        return;
      }

      // Находим план по типу и количеству людей
      const planName = `${type === 'silver' ? 'Silver' : 'Gold'} Pass (${selectedPeople} ${selectedPeople === 1 ? 'человек' : selectedPeople === 2 ? 'человека' : 'человека'})`;
      const selectedPlan = response.plans.find((plan: any) => plan.name === planName);
      
      if (!selectedPlan) {
        Alert.alert('Ошибка', `План ${planName} не найден`);
        return;
      }

      // Создаем заявку на абонемент
      const result = await api.createSubscriptionRequest({
        planId: selectedPlan.id,
        period: selectedPeriod,
        peopleCount: selectedPeople,
        message: `Заявка на ${selectedPeople} ${selectedPeople === 1 ? 'человека' : 'человек'}`
      }) as any;

      Alert.alert(
        'Заявка отправлена!', 
        'Ваша заявка на абонемент отправлена. Наши сотрудники свяжутся с вами для подтверждения и оплаты.',
        [{ text: 'OK' }]
      );

      // Обновляем данные
      await loadSubscriptionData();

    } catch (error) {
      console.log('Failed to create subscription request:', error);
      Alert.alert('Ошибка', 'Не удалось отправить заявку на абонемент');
    }
  };

  const handleCompleteSubscription = async () => {
    if (!pendingSubscription) return;

    try {
      // Если есть активная подписка, сначала отменяем её
      if (safeActiveSubscription) {
        console.log('🔄 Отменяем активную подписку перед покупкой новой...');
        await cancelSubscription();
        console.log('✅ Активная подписка отменена');
      }

      // Находим план по типу и количеству людей
      const response = await api.getSubscriptionPlans();
      if (!response.plans || response.plans.length === 0) {
        Alert.alert('Ошибка', 'Планы подписки не найдены');
        return;
      }

      const planName = `${pendingSubscription.type === 'silver' ? 'Silver' : 'Gold'} Pass (${pendingSubscription.people} ${pendingSubscription.people === 1 ? 'человек' : pendingSubscription.people === 2 ? 'человека' : 'человека'})`;
      const selectedPlan = response.plans.find((plan: any) => plan.name === planName);
      
      if (!selectedPlan) {
        Alert.alert('Ошибка', `План ${planName} не найден`);
        return;
      }

      // Выполняем покупку подписки через контекст
      const result = await purchaseSubscription(
        selectedPlan.id,
        pendingSubscription.period,
        pendingSubscription.people
      );

      console.log('Результат покупки:', result);

      // Закрываем модальное окно
      setShowAddFamilyModal(false);
      setPendingSubscription(null);

      // Если подписка на несколько человек, показываем сообщение о возможности приглашения
      if (pendingSubscription.people > 1) {
        Alert.alert(
          'Подписка оформлена!', 
          `Теперь вы можете пригласить ${pendingSubscription.people - 1} ${pendingSubscription.people === 2 ? 'человека' : 'человек'} в семейную подписку.`,
          [
            { text: 'OK' }
          ]
        );
      } else {
        Alert.alert(
          'Успешно!', 
          `Подписка ${result.plan.name} активирована до ${new Date(result.endDate).toLocaleDateString('ru-RU')}`,
          [{ text: 'OK' }]
        );
      }

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
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return SUCCESS;
      case 'frozen': return '#2196F3';
      case 'expired': return '#F44336';
      case 'cancelled': return '#9E9E9E';
      default: return TEXT_MUTED;
    }
  };

  const getStatusText = (status?: string, isFrozen?: boolean, freezeStatus?: string) => {
    if (isFrozen) return 'Заморожен';
    if (freezeStatus === 'scheduled') return 'Заморозка запланирована';
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

  const selectedOption = subscriptionOptions?.find(opt => opt.id === selectedType);

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
        {safeActiveSubscription && (
          <View style={styles.safeActiveSubscriptionSection}>
            <View style={styles.safeActiveSubscriptionHeader}>
              <ThemedText type="heading2" style={styles.safeActiveSubscriptionTitle}>
                Ваш активный абонемент
              </ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(safeActiveSubscription?.status) }]}>
                <ThemedText style={styles.statusText}>
                  {getStatusText(safeActiveSubscription?.status, (safeActiveSubscription as any)?.isFrozen, (safeActiveSubscription as any)?.freezeInfo?.status)}
                </ThemedText>
              </View>
            </View>

            <View style={styles.safeActiveSubscriptionCard}>
              <View style={styles.subscriptionInfo}>
                <View style={styles.planBadge}>
                  <MaterialIcons
                    name={safeActiveSubscription?.plan?.name?.includes('Gold') ? 'star' : 'star-outline'}
                    size={20}
                    color={safeActiveSubscription?.plan?.name?.includes('Gold') ? SECONDARY : PRIMARY}
                  />
                  <ThemedText type="heading3" style={styles.planName}>
                    {(() => {
                      console.log('🔍 Plan data:', {
                        plan: safeActiveSubscription?.plan,
                        planName: safeActiveSubscription?.plan?.name,
                        fullSubscription: safeActiveSubscription
                      });
                      return safeActiveSubscription?.plan?.name || 'План';
                    })()}
                  </ThemedText>
                </View>

                <View style={styles.subscriptionDetails}>
                  <ThemedText style={styles.detailText}>
                    {(safeFamilyMembers?.length || 0) + 1} {(safeFamilyMembers?.length || 0) + 1 === 1 ? 'человек' : 'человек'}
                    {safeActiveSubscription?.plan?.name && (safeActiveSubscription.plan.name.includes('2') || safeActiveSubscription.plan.name.includes('3')) && 
                      ` (максимум ${safeActiveSubscription.plan.name.includes('2') ? '2' : '3'})`
                    }
                  </ThemedText>
                  <ThemedText style={styles.detailText}>
                    {safeActiveSubscription?.period === 'monthly' ? 'Месячная' : 'Годовая'} оплата
                  </ThemedText>
                  <ThemedText style={styles.detailText}>
                    До {safeActiveSubscription?.endDate ? new Date(safeActiveSubscription.endDate).toLocaleDateString('ru-RU') : 'Не указано'}
                  </ThemedText>
                  {/* Показываем информацию о владельце для приглашенных пользователей */}
                  {!safeActiveSubscription?.isOwner && safeActiveSubscription?.owner && (
                    <ThemedText style={[styles.detailText, { color: TEXT_MUTED, fontStyle: 'italic' }]}>
                      Владелец: {safeActiveSubscription.owner.name}
                    </ThemedText>
                  )}
                </View>
              </View>

              <View style={styles.subscriptionActions}>
                {/* Показываем кнопку "Заморозить" только владельцу подписки */}
                {safeActiveSubscription?.isOwner && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setShowFreezeModal(true)}
                  >
                    <MaterialIcons name="fitness-center" size={20} color={PRIMARY} />
                    <ThemedText style={styles.actionButtonText}>Заморозить</ThemedText>
                  </TouchableOpacity>
                )}

                {/* Показываем кнопку "Семья" только владельцу подписки, если есть семейные члены или подписка на несколько человек */}
                {safeActiveSubscription?.isOwner && ((safeFamilyMembers?.length || 0) > 0 || (safeActiveSubscription?.plan?.name && (safeActiveSubscription.plan.name.includes('2') || safeActiveSubscription.plan.name.includes('3')))) && (
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

              {/* Кнопка отмены подписки - только для владельца */}
              {safeActiveSubscription?.isOwner && (
                <View style={styles.cancelSubscriptionSection}>
                  <TouchableOpacity
                    style={styles.cancelSubscriptionButton}
                    onPress={handleCancelSubscription}
                  >
                    <MaterialIcons name="cancel" size={20} color={ERROR} />
                    <ThemedText style={styles.cancelSubscriptionText}>Отменить подписку</ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Прогресс бар для оставшихся дней */}
            <View style={styles.progressSection}>
              <View style={styles.progressInfo}>
                <ThemedText style={styles.progressLabel}>Осталось дней:</ThemedText>
                <ThemedText type="heading3" style={styles.daysLeft}>
                  {safeActiveSubscription?.endDate ? calculateDaysLeft(safeActiveSubscription.endDate) : 'Не указано'}
                </ThemedText>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${safeActiveSubscription?.startDate && safeActiveSubscription?.endDate ? calculateProgress(safeActiveSubscription.startDate, safeActiveSubscription.endDate) : 0}%` }
                  ]}
                />
              </View>
            </View>
          </View>
        )}

        {/* Информация о заморозке */}
        {((safeActiveSubscription as any)?.isFrozen || (safeActiveSubscription as any)?.freezeInfo?.status === 'scheduled') && (safeActiveSubscription as any)?.freezeInfo && (
          <View style={styles.freezeInfoSection}>
            <View style={styles.freezeInfoCard}>
              <View style={styles.freezeInfoHeader}>
                <MaterialIcons name="pause-circle-filled" size={24} color="#FF9800" />
                <ThemedText type="heading3" style={styles.freezeInfoTitle}>
                  {(safeActiveSubscription as any)?.freezeInfo?.status === 'scheduled' ? 'Заморозка запланирована' : 'Абонемент заморожен'}
                </ThemedText>
              </View>
              <View style={styles.freezeInfoContent}>
                <View style={styles.freezeInfoRow}>
                  <ThemedText style={styles.freezeInfoLabel}>Период заморозки:</ThemedText>
                  <ThemedText style={styles.freezeInfoValue}>
                    {new Date((safeActiveSubscription as any).freezeInfo.startDate).toLocaleDateString('ru-RU')} - {new Date((safeActiveSubscription as any).freezeInfo.endDate).toLocaleDateString('ru-RU')}
                  </ThemedText>
                </View>
                <View style={styles.freezeInfoRow}>
                  <ThemedText style={styles.freezeInfoLabel}>Дней заморозки:</ThemedText>
                  <ThemedText style={styles.freezeInfoValue}>
                    {(safeActiveSubscription as any).freezeInfo.days} дней
                  </ThemedText>
                </View>
                {(safeActiveSubscription as any).freezeInfo.reason && (
                  <View style={styles.freezeInfoRow}>
                    <ThemedText style={styles.freezeInfoLabel}>Причина:</ThemedText>
                    <ThemedText style={styles.freezeInfoValue}>
                      {(safeActiveSubscription as any).freezeInfo.reason}
                    </ThemedText>
                  </View>
                )}
                <View style={styles.freezeInfoNote}>
                  <MaterialIcons name="info" size={16} color="#FF9800" />
                  <ThemedText style={styles.freezeInfoNoteText}>
                    {(safeActiveSubscription as any)?.freezeInfo?.status === 'scheduled' 
                      ? 'Заморозка начнется в указанную дату. Во время заморозки вы не сможете посещать занятия, но дни абонемента не будут тратиться'
                      : 'Во время заморозки вы не можете посещать занятия, но дни абонемента не тратятся'
                    }
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <ThemedText type="heading1" style={styles.heroTitle}>
              {safeActiveSubscription ? 'Управление абонементом' : 'Выберите свой тариф'}
            </ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              {safeActiveSubscription
                ? 'Управляйте своим абонементом и семейными членами'
                : 'Получите доступ ко всем залам сети и эксклюзивным тренировкам'
              }
            </ThemedText>
          </View>
        </View>


        {/* Показываем выбор тарифов только если нет активной подписки */}
        {!safeActiveSubscription && (
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


            {/* Карточки тарифов */}
            <View style={styles.subscriptionsSection}>
              <ThemedText type="heading2" style={styles.sectionTitle}>
                Тарифы
              </ThemedText>
              
              <View style={styles.subscriptionCards}>
            {subscriptionOptions?.map((option) => (
              <Animated.View
                key={option?.id || 'unknown'}
                style={[
                  styles.subscriptionCard,
                  selectedType === option?.id && styles.subscriptionCardActive,
                  option?.popular && styles.subscriptionCardPopular,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                  }
                ]}
              >
                <TouchableOpacity
                  style={styles.subscriptionCardTouchable}
                  onPress={() => animateCardSelection(option?.id || 'yearly')}
                  activeOpacity={0.8}
                >
                {option?.popular && (
                  <View style={styles.popularBadge}>
                    <ThemedText style={styles.popularText}>Популярный</ThemedText>
                  </View>
                )}
                
                <View style={styles.cardHeader}>
                  <View style={[styles.planIcon, { backgroundColor: (option?.color || '#FF6246') + '20' }]}>
                    <MaterialIcons name={(option?.icon || 'fitness-center') as any} size={32} color={option?.color || '#FF6246'} />
                  </View>
                  
                  <View style={styles.planInfo}>
                    <ThemedText type="heading3" style={styles.planTitle}>
                      {option?.title || 'План'}
                    </ThemedText>
                    <ThemedText style={styles.planSubtitle}>
                      {option?.subtitle || 'Описание'}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.priceSection}>
                  <View style={styles.priceRow}>
                    <ThemedText type="heading1" style={[styles.price, { color: option?.color || '#FF6246' }]}>
                      {formatPrice(getCurrentPrice(option))}
                    </ThemedText>
                    <ThemedText style={styles.period}>
                      /год
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.peopleCount}>
                    на {selectedPeople} {selectedPeople === 1 ? 'человека' : selectedPeople < 5 ? 'человек' : 'человек'}
                  </ThemedText>
                  <View style={styles.savingsBadge}>
                    <ThemedText style={styles.savingsText}>
                      Годовой абонемент
                    </ThemedText>
                  </View>
                </View>

                <ThemedText style={styles.planDescription}>
                  {option?.description || 'Описание плана'}
                </ThemedText>

                <View style={styles.featuresSection}>
                  {(option?.features || []).slice(0, 4).map((feature, index) => (
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

                  {(option?.features?.length || 0) > 4 && (
                    <TouchableOpacity
                      style={styles.showMoreButton}
                      onPress={() => handleShowDetails(option)}
                    >
                      <ThemedText style={styles.showMoreText}>
                        Показать все особенности ({(option?.features?.length || 0)})
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
              style={[styles.subscribeButton, { backgroundColor: selectedOption?.color || PRIMARY }]}
              onPress={() => handleSubscribe(selectedType)}
            >
              <ThemedText style={styles.subscribeButtonText}>
                Оставить заявку на {selectedOption?.title || 'План'} • {formatPrice(getCurrentPrice(selectedOption))}
              </ThemedText>
            </Button>
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
            {faqData.map((faq, index) => (
              <View key={index} style={styles.faqItemContainer}>
                <TouchableOpacity 
                  style={styles.faqItem}
                  onPress={() => toggleFaqItem(index)}
                >
                  <ThemedText style={styles.faqQuestion}>
                    {faq.question}
                  </ThemedText>
                  <Ionicons 
                    name={openFaqItems.has(index) ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={TEXT_MUTED} 
                  />
                </TouchableOpacity>
                
                {openFaqItems.has(index) && (
                  <Animated.View 
                    style={[
                      styles.faqAnswer,
                      {
                        opacity: faqAnimations.get(index)?.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1],
                        }) || 0,
                        transform: [{
                          translateY: faqAnimations.get(index)?.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-10, 0],
                          }) || -10,
                        }],
                      }
                    ]}
                  >
                    <ThemedText style={styles.faqAnswerText}>
                      {faq.answer}
                    </ThemedText>
                  </Animated.View>
                )}
              </View>
            ))}
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
                  /год
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
                  Оставить заявку на {selectedPlanForDetails?.title}
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
                {safeActiveSubscription?.plan?.name?.includes('Gold') 
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
                      {days > 30 && safeActiveSubscription?.plan?.name === 'Silver' ? '5,000 ₸' : 'Бесплатно'}
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

            {safeFamilyMembers?.map((member) => (
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
                    Пригласить пользователя
                  </ThemedText>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              {/* Показываем кнопку приглашения если подписка на несколько человек и есть свободные места */}
              {safeActiveSubscription?.plan?.name && (safeActiveSubscription.plan.name.includes('2') || safeActiveSubscription.plan.name.includes('3')) && 
               (safeFamilyMembers?.length || 0) < (safeActiveSubscription.plan.name.includes('2') ? 1 : 2) && (
                <TouchableOpacity
                  style={styles.modalPrimaryButton}
                  onPress={handleAddFamilyMember}
                >
                  <ThemedText style={styles.modalPrimaryButtonText}>
                    Пригласить пользователя
                  </ThemedText>
                </TouchableOpacity>
              )}
              
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
            {safePaymentHistory?.map((payment) => (
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
                Члены семьи ({(safeFamilyMembers?.length || 0)}/{pendingSubscription ? pendingSubscription.people - 1 : 0})
              </ThemedText>
              
              {safeFamilyMembers?.map((member) => (
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

              {(safeFamilyMembers?.length || 0) < (pendingSubscription ? pendingSubscription.people - 1 : 0) && (
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

      {/* Модальное окно для приглашения в семейную подписку */}
      <Modal
        visible={showInviteModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText type="heading2" style={styles.modalTitle}>
              Пригласить в семейную подписку
            </ThemedText>
            <TouchableOpacity onPress={() => setShowInviteModal(false)}>
              <Ionicons name="close" size={24} color={TEXT_DARK} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalSection}>
              <ThemedText style={styles.modalDescription}>
                Выберите способ приглашения и введите контактные данные
              </ThemedText>
            </View>

            <View style={styles.modalSection}>
              <ThemedText type="heading3" style={styles.modalSectionTitle}>
                Способ приглашения
              </ThemedText>
              
              <View style={styles.inviteMethodSelector}>
                <TouchableOpacity
                  style={[
                    styles.inviteMethodButton,
                    inviteMethod === 'email' && styles.inviteMethodButtonActive
                  ]}
                  onPress={() => setInviteMethod('email')}
                >
                  <MaterialIcons 
                    name="email" 
                    size={20} 
                    color={inviteMethod === 'email' ? CARD_BG : TEXT_MUTED} 
                  />
                  <ThemedText style={[
                    styles.inviteMethodText,
                    inviteMethod === 'email' && styles.inviteMethodTextActive
                  ]}>
                    Email
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.inviteMethodButton,
                    inviteMethod === 'phone' && styles.inviteMethodButtonActive
                  ]}
                  onPress={() => setInviteMethod('phone')}
                >
                  <MaterialIcons 
                    name="phone" 
                    size={20} 
                    color={inviteMethod === 'phone' ? CARD_BG : TEXT_MUTED} 
                  />
                  <ThemedText style={[
                    styles.inviteMethodText,
                    inviteMethod === 'phone' && styles.inviteMethodTextActive
                  ]}>
                    Телефон
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalSection}>
              <ThemedText type="heading3" style={styles.modalSectionTitle}>
                {inviteMethod === 'email' ? 'Email адрес' : 'Номер телефона'}
              </ThemedText>
              
              <TextInput
                style={styles.inviteInput}
                placeholder={inviteMethod === 'email' ? 'example@email.com' : '+7 (777) 123-45-67'}
                value={inviteMethod === 'email' ? inviteEmail : invitePhone}
                onChangeText={inviteMethod === 'email' ? setInviteEmail : setInvitePhone}
                keyboardType={inviteMethod === 'email' ? 'email-address' : 'phone-pad'}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                style={[styles.modalSubscribeButton, { backgroundColor: PRIMARY }]}
                onPress={handleInviteFromModal}
              >
                <ThemedText style={styles.modalSubscribeButtonText}>
                  Отправить приглашение
                </ThemedText>
              </Button>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowInviteModal(false)}
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
  faqItemContainer: {
    backgroundColor: CARD_BG,
    borderBottomWidth: 1,
    borderBottomColor: BG,
  },
  faqItem: {
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
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: SURFACE_LIGHT,
    overflow: 'hidden',
  },
  faqAnswerText: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 20,
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
  modalPrimaryButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalPrimaryButtonText: {
    color: CARD_BG,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Active Subscription Styles
  safeActiveSubscriptionSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  safeActiveSubscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  safeActiveSubscriptionTitle: {
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
  safeActiveSubscriptionCard: {
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

  // Freeze Info Styles
  freezeInfoSection: {
    marginBottom: 24,
  },
  freezeInfoCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  freezeInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  freezeInfoTitle: {
    color: '#E65100',
    marginLeft: 12,
    fontWeight: '600',
  },
  freezeInfoContent: {
    gap: 12,
  },
  freezeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  freezeInfoLabel: {
    color: '#BF360C',
    fontSize: 14,
    fontWeight: '500',
  },
  freezeInfoValue: {
    color: '#D84315',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  freezeInfoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFE0B2',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  freezeInfoNoteText: {
    color: '#E65100',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },

  // Invite Modal Styles
  inviteMethodSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  inviteMethodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: SURFACE_LIGHT,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BORDER_LIGHT,
  },
  inviteMethodButtonActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  inviteMethodText: {
    color: TEXT_MUTED,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  inviteMethodTextActive: {
    color: CARD_BG,
  },
  inviteInput: {
    backgroundColor: SURFACE_LIGHT,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: TEXT_DARK,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    marginBottom: 20,
  },
}); 