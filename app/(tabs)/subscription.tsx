import { Logo } from '@/components/Logo';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
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
const HEADER_DARK = '#0D1F2C';

type SubscriptionType = 'individual' | 'family';

interface SubscriptionFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface SubscriptionOption {
  id: SubscriptionType;
  title: string;
  subtitle: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  description: string;
  features: SubscriptionFeature[];
  popular?: boolean;
  color: string;
  icon: string;
}

const subscriptionOptions: SubscriptionOption[] = [
  {
    id: 'individual',
    title: 'Индивидуальный',
    subtitle: 'Для одного человека',
    price: '12 000 ₸',
    originalPrice: '15 000 ₸',
    discount: '20%',
    description: 'Идеально для персональных тренировок',
    color: PRIMARY,
    icon: 'person',
    features: [
      { text: 'Доступ ко всем залам сети', included: true },
      { text: 'Безлимитное посещение', included: true },
      { text: 'Групповые тренировки', included: true },
      { text: 'Бесплатная отмена за 8 часов', included: true },
      { text: 'Заморозка абонемента до 30 дней', included: true },
      { text: 'Персональный тренер', included: false },
      { text: 'Семейный доступ', included: false },
      { text: 'Приоритетная запись', included: false },
    ]
  },
  {
    id: 'family',
    title: 'Семейный',
    subtitle: 'До 4 человек',
    price: '19 900 ₸',
    originalPrice: '25 000 ₸',
    discount: '20%',
    description: 'Лучший выбор для всей семьи',
    color: SECONDARY,
    icon: 'family-restroom',
    popular: true,
    features: [
      { text: 'Все преимущества индивидуального', included: true },
      { text: 'До 4 человек на одном аккаунте', included: true, highlight: true },
      { text: 'Общий или раздельный баланс', included: true, highlight: true },
      { text: 'Семейные групповые тренировки', included: true, highlight: true },
      { text: 'Заморозка абонемента до 60 дней', included: true },
      { text: 'Приоритетная запись', included: true },
      { text: '2 консультации с тренером', included: true },
      { text: 'Скидка на персональные тренировки', included: true },
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
  { label: 'Семейных подписок', value: '312', icon: 'family-restroom' },
  { label: 'Средняя экономия', value: '35%', icon: 'savings' },
];

export default function SubscriptionScreen() {
  const [selectedType, setSelectedType] = useState<SubscriptionType>('family');
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(res => setTimeout(res, 1000));
    setRefreshing(false);
  };

  const handleManageFamilyPress = () => {
    router.navigate('../family/subscription');
  };

  const handleSubscribe = (type: SubscriptionType) => {
    // Здесь будет логика подписки
    console.log(`Подписка на ${type}`);
  };

  const selectedOption = subscriptionOptions.find(opt => opt.id === selectedType);

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
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <ThemedText type="heading1" style={styles.heroTitle}>
              Выберите свой тариф
            </ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              Получите доступ ко всем залам сети и эксклюзивным тренировкам
            </ThemedText>
          </View>
          <View style={styles.discountBadge}>
            <MaterialIcons name="local-offer" size={20} color={CARD_BG} />
            <ThemedText style={styles.discountText}>Скидка 20%</ThemedText>
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

        {/* Карточки тарифов */}
        <View style={styles.subscriptionsSection}>
          <ThemedText type="heading2" style={styles.sectionTitle}>
            Тарифы
          </ThemedText>
          
          <View style={styles.subscriptionCards}>
        {subscriptionOptions.map((option) => (
              <TouchableOpacity
            key={option.id}
            style={[
                  styles.subscriptionCard,
                  selectedType === option.id && styles.subscriptionCardActive,
                  option.popular && styles.subscriptionCardPopular
            ]}
              onPress={() => setSelectedType(option.id)}
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
                  
                  {option.discount && (
                    <View style={styles.discountLabel}>
                      <ThemedText style={styles.discountLabelText}>
                        -{option.discount}
                      </ThemedText>
                    </View>
                  )}
                </View>

                <View style={styles.priceSection}>
                  <View style={styles.priceRow}>
                    <ThemedText type="heading1" style={[styles.price, { color: option.color }]}>
                      {option.price}
                    </ThemedText>
                    <ThemedText style={styles.period}>/месяц</ThemedText>
                  </View>
                  {option.originalPrice && (
                    <ThemedText style={styles.originalPrice}>
                      {option.originalPrice}
                    </ThemedText>
                  )}
                </View>

                <ThemedText style={styles.planDescription}>
                  {option.description}
                </ThemedText>

                <View style={styles.featuresSection}>
                  {option.features.map((feature, index) => (
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
                </View>
            </TouchableOpacity>
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
                Подписаться на {selectedOption.title} • {selectedOption.price}
              </ThemedText>
      </Button>
          )}
      
      {selectedType === 'family' && (
        <Button 
              style={styles.manageButton}
          onPress={handleManageFamilyPress}
        >
              <ThemedText style={styles.manageButtonText}>
                Управление семейной подпиской
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
    padding: 20,
    borderWidth: 2,
    borderColor: BG,
    position: 'relative',
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
}); 