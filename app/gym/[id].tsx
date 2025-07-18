import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Dimensions,
  Image as RNImage,
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
const SUCCESS = '#4CAF50';

// Моковые данные клубов
const gyms = [
  {
    id: '1',
    name: 'FitLife Центральный',
    address: 'ул. Ленина, 42',
    description: 'Современный фитнес-центр с бассейном, тренажерным залом и зонами для групповых занятий. Профессиональные тренеры помогут достичь ваших целей.',
    images: [
      require('@/assets/images/placeholder.jpg'),
      require('@/assets/images/placeholder.jpg'),
      require('@/assets/images/placeholder.jpg'),
    ],
    rating: 9.8,
    totalReviews: 27721,
    visits: 12,
    maxVisits: 12,
         features: [
       { name: 'Питьевая вода', icon: 'local-drink' as any },
       { name: 'Душ', icon: 'shower' as any },
       { name: 'Сауна', icon: 'hot-tub' as any },
       { name: 'Парковка', icon: 'local-parking' as any },
     ],
    amenities: [
      { title: 'Профессионализм тренера', rating: 9.9 },
      { title: 'Чистота помещения', rating: 9.8 },
      { title: 'Приветливость персонала', rating: 9.8 },
      { title: 'Чистота раздевалки', rating: 9.8 },
      { title: 'Состояние оборудования', rating: 9.8 },
    ],
  },
  {
    id: '2',
    name: 'FitLife Восточный',
    address: 'ул. Гагарина, 15',
    description: 'Уютный клуб с современным оборудованием и профессиональными тренерами.',
    images: [
      require('@/assets/images/placeholder.jpg'),
      require('@/assets/images/placeholder.jpg'),
    ],
    rating: 9.5,
    totalReviews: 15430,
    visits: 8,
    maxVisits: 12,
         features: [
       { name: 'Парковка', icon: 'local-parking' as any },
       { name: 'Душ', icon: 'shower' as any },
     ],
    amenities: [
      { title: 'Профессионализм тренера', rating: 9.6 },
      { title: 'Чистота помещения', rating: 9.4 },
    ],
  },
  {
    id: '3',
    name: 'FitLife Южный',
    address: 'ул. Пушкина, 78',
    description: 'Большой выбор групповых программ и просторный тренажерный зал.',
    images: [
      require('@/assets/images/placeholder.jpg'),
    ],
    rating: 9.7,
    totalReviews: 8950,
    visits: 10,
    maxVisits: 12,
         features: [
       { name: 'Сауна', icon: 'hot-tub' as any },
       { name: 'Питьевая вода', icon: 'local-drink' as any },
     ],
    amenities: [
      { title: 'Профессионализм тренера', rating: 9.8 },
      { title: 'Чистота помещения', rating: 9.6 },
    ],
  },
];

export default function GymPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const gym = gyms.find((g) => g.id === id);

  if (!gym) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Клуб не найден</ThemedText>
        <Button onPress={() => router.back()}>Назад</Button>
      </ThemedView>
    );
  }

  const progressPercentage = (gym.visits / gym.maxVisits) * 100;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" barStyle="light-content" translucent />
      
      {/* Фиксированный header */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={CARD_BG} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="bookmark-outline" size={24} color={CARD_BG} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color={CARD_BG} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Главное изображение */}
        <View style={styles.heroSection}>
          <RNImage source={gym.images[0]} style={styles.heroImage} />
        </View>

        {/* Основная информация */}
        <View style={styles.content}>
          {/* Название и рейтинг */}
          <View style={styles.titleSection}>
            <ThemedText type="heading1" style={styles.gymName}>
              {gym.name}
            </ThemedText>
            
            <View style={styles.ratingRow}>
              <View style={styles.ratingBadge}>
                <ThemedText style={styles.ratingValue}>{gym.rating}</ThemedText>
                <Ionicons name="star" size={16} color={CARD_BG} style={styles.starIcon} />
              </View>
              <ThemedText style={styles.ratingLabel}>Отлично</ThemedText>
            </View>
            
            <ThemedText style={styles.reviewsCount}>{gym.totalReviews} оценка</ThemedText>
          </View>

          {/* Адрес */}
          <View style={styles.addressSection}>
            <Ionicons name="location-outline" size={20} color={TEXT_MUTED} />
            <ThemedText style={styles.address}>{gym.address}</ThemedText>
          </View>

          {/* Прогресс посещений */}
          <View style={styles.progressSection}>
            <ThemedText type="defaultSemiBold" style={styles.progressTitle}>
              {gym.visits} посещений из {gym.maxVisits}
            </ThemedText>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${progressPercentage}%` }
                  ]} 
                />
              </View>
              <TouchableOpacity>
                <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
              </TouchableOpacity>
            </View>
            
            <ThemedText style={styles.progressSubtitle}>
              Осталось здесь в этом месяце
            </ThemedText>
          </View>

          {/* Актуальное зала - секция с фото */}
          <View style={styles.gallerySection}>
            <View style={styles.sectionHeader}>
              <ThemedText type="heading2" style={styles.sectionTitle}>
                Актуальное зала
              </ThemedText>
              <TouchableOpacity>
                <ThemedText style={styles.addButton}>+ Добавить</ThemedText>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.gallery}
            >
              {gym.images.map((image, index) => (
                <View key={index} style={styles.galleryItem}>
                  <RNImage source={image} style={styles.galleryImage} />
                  <View style={styles.galleryOverlay}>
                    <ThemedText style={styles.galleryLabel}>
                      {index === 0 ? 'Главный зал' : index === 1 ? 'Раздевалка' : 'Кардио зона'}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.visitPrompt}>
              <ThemedText style={styles.visitPromptText}>
                Посетите зал и поделитесь актуальными фото!
              </ThemedText>
              <ThemedText style={styles.visitPromptSubtext}>
                Помогите другим участникам увидеть текущее состояние
              </ThemedText>
            </View>
          </View>

          {/* Удобства */}
          <View style={styles.amenitiesSection}>
            <ThemedText type="heading2" style={styles.sectionTitle}>
              Удобства
            </ThemedText>
            
            <View style={styles.amenitiesList}>
              {gym.features?.map((feature, index) => (
                <View key={index} style={styles.amenityItem}>
                  <View style={styles.amenityIcon}>
                    <MaterialIcons 
                      name={feature.icon} 
                      size={20} 
                      color={PRIMARY} 
                    />
                  </View>
                  <ThemedText style={styles.amenityText}>
                    {feature.name}
                  </ThemedText>
                </View>
              ))}
            </View>
            
            <TouchableOpacity style={styles.showAllButton}>
              <ThemedText style={styles.showAllText}>Показать все</ThemedText>
              <Ionicons name="chevron-forward" size={16} color={PRIMARY} />
            </TouchableOpacity>
          </View>

          {/* Рейтинг зала */}
          <View style={styles.ratingsSection}>
            <ThemedText type="heading2" style={styles.sectionTitle}>
              Рейтинг зала
            </ThemedText>
            
            {gym.amenities?.map((amenity, index) => (
              <View key={index} style={styles.ratingItem}>
                <ThemedText style={styles.ratingItemTitle}>
                  {amenity.title}
                </ThemedText>
                <ThemedText style={styles.ratingItemValue}>
                  {amenity.rating}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* Описание */}
          <View style={styles.descriptionSection}>
            <ThemedText type="heading2" style={styles.sectionTitle}>
              О клубе
            </ThemedText>
            <ThemedText style={styles.description}>
              {gym.description}
            </ThemedText>
          </View>

          {/* Кнопка записи */}
          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.scheduleButton}>
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
  
  // Hero section
  heroSection: {
    position: 'relative',
  },
  heroImage: {
    width: screenWidth,
    height: 300,
    resizeMode: 'cover',
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
    padding: 20,
  },
  
  // Title section
  titleSection: {
    marginBottom: 20,
  },
  gymName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CARD_BG,
  },
  starIcon: {
    marginLeft: 4,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  reviewsCount: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  
  // Address section
  addressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  address: {
    fontSize: 16,
    color: TEXT_MUTED,
    marginLeft: 8,
  },
  
  // Progress section
  progressSection: {
    backgroundColor: BG,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  progressTitle: {
    fontSize: 18,
    color: TEXT_DARK,
    marginBottom: 12,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: CARD_BG,
    borderRadius: 4,
    marginRight: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: PRIMARY,
    borderRadius: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  
  // Gallery section
  gallerySection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_DARK,
  },
  addButton: {
    fontSize: 16,
    color: TEXT_MUTED,
  },
  gallery: {
    marginBottom: 16,
  },
  galleryItem: {
    position: 'relative',
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  galleryImage: {
    width: 120,
    height: 120,
    resizeMode: 'cover',
  },
  galleryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
  },
  galleryLabel: {
    color: CARD_BG,
    fontSize: 12,
    fontWeight: '600',
  },
  visitPrompt: {
    backgroundColor: BG,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  visitPromptText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  visitPromptSubtext: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  
  // Ratings section
  ratingsSection: {
    marginBottom: 24,
  },
  ratingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  ratingItemTitle: {
    fontSize: 16,
    color: TEXT_DARK,
  },
  ratingItemValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_DARK,
  },
  
  // Amenities section
  amenitiesSection: {
    marginBottom: 24,
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
}); 