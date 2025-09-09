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

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  streak: number;
  workoutsThisMonth: number;
  isActive: boolean;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  lastSeen: string;
}

interface SubscriptionFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  isAvailable: boolean;
  usageCount?: number;
  limit?: number;
}

export default function FamilySubscriptionScreen() {
  const router = useRouter();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: '1',
      name: 'Иван Иванов',
      email: 'ivan@example.com',
      avatar: require('../../assets/images/placeholder-user.jpg'),
      streak: 15,
      workoutsThisMonth: 12,
      isActive: true,
      role: 'owner',
      joinedAt: '2023-01-15',
      lastSeen: 'Сегодня в 14:30'
    },
    {
      id: '2',
      name: 'Мария Иванова',
      email: 'maria@example.com',
      avatar: require('../../assets/images/placeholder-user.jpg'),
      streak: 8,
      workoutsThisMonth: 9,
      isActive: true,
      role: 'admin',
      joinedAt: '2023-02-01',
      lastSeen: 'Вчера в 19:15'
    },
    {
      id: '3',
      name: 'Алексей Иванов',
      email: 'alexey@example.com',
      avatar: require('../../assets/images/placeholder-user.jpg'),
      streak: 3,
      workoutsThisMonth: 5,
      isActive: true,
      role: 'member',
      joinedAt: '2023-06-10',
      lastSeen: '3 дня назад'
    },
    {
      id: '4',
      name: 'Анна Иванова',
      email: 'anna@example.com',
      avatar: require('../../assets/images/placeholder-user.jpg'),
      streak: 0,
      workoutsThisMonth: 2,
      isActive: false,
      role: 'member',
      joinedAt: '2023-08-20',
      lastSeen: 'Неделю назад'
    }
  ]);

  const [subscriptionFeatures] = useState<SubscriptionFeature[]>([
    {
      id: '1',
      title: 'Безлимитные тренировки',
      description: 'Неограниченное посещение всех залов',
      icon: 'fitness-center',
      isAvailable: true,
      usageCount: 38,
      limit: -1
    },
    {
      id: '2',
      title: 'Групповые занятия',
      description: 'Все групповые программы включены',
      icon: 'groups',
      isAvailable: true,
      usageCount: 15,
      limit: -1
    },
    {
      id: '3',
      title: 'Персональные тренировки',
      description: 'Индивидуальные занятия с тренером',
      icon: 'person',
      isAvailable: true,
      usageCount: 2,
      limit: 4
    },
    {
      id: '4',
      title: 'СПА и велнес',
      description: 'Сауна, массаж, релаксация',
      icon: 'spa',
      isAvailable: true,
      usageCount: 5,
      limit: 8
    }
  ]);

  const toggleMemberStatus = (id: string) => {
    setFamilyMembers(members => 
      members.map(member => 
        member.id === id 
          ? { ...member, isActive: !member.isActive } 
          : member
      )
    );
  };

  const removeMember = (id: string) => {
    const member = familyMembers.find(m => m.id === id);
    if (member?.role === 'owner') {
      Alert.alert('Ошибка', 'Нельзя удалить владельца семейного аккаунта');
      return;
    }

    Alert.alert(
      'Удаление участника',
      `Вы уверены, что хотите удалить ${member?.name} из семейного аккаунта?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: () => {
            setFamilyMembers(members => members.filter(member => member.id !== id));
          }
        }
      ]
    );
  };

  const addMember = () => {
    if (familyMembers.length >= 4) {
      Alert.alert('Лимит достигнут', 'В семейной подписке может быть максимум 4 участника');
      return;
    }
    Alert.alert('Добавить участника', 'Функция добавления участника будет доступна скоро');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return PRIMARY;
      case 'admin': return SECONDARY;
      default: return TEXT_MUTED;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'owner': return 'Владелец';
      case 'admin': return 'Администратор';
      default: return 'Участник';
    }
  };

  // Статистика
  const activeMembers = familyMembers.filter(m => m.isActive).length;
  const totalWorkouts = familyMembers.reduce((sum, m) => sum + m.workoutsThisMonth, 0);
  const averageStreak = Math.round(
    familyMembers.reduce((sum, m) => sum + m.streak, 0) / familyMembers.length
  );

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={HEADER_DARK} barStyle="light-content" translucent={false} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
                          <ThemedText style={styles.superText}>SUPER</ThemedText>
          <Logo width={80} height={24} />
        </View>
        
        <TouchableOpacity style={styles.settingsButton}>
          <MaterialIcons name="settings" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Статистика семьи */}
        <View style={styles.statsSection}>
          <ThemedText type="heading2" style={styles.sectionTitle}>
            Семейная статистика
          </ThemedText>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialIcons name="people" size={24} color={PRIMARY} />
              <ThemedText type="heading3" style={styles.statValue}>
                {activeMembers}/{familyMembers.length}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Активных участников</ThemedText>
            </View>
            
            <View style={styles.statCard}>
              <MaterialIcons name="fitness-center" size={24} color={SECONDARY} />
              <ThemedText type="heading3" style={styles.statValue}>
                {totalWorkouts}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Тренировок в месяце</ThemedText>
            </View>
            
            <View style={styles.statCard}>
              <MaterialIcons name="whatshot" size={24} color={WARNING} />
              <ThemedText type="heading3" style={styles.statValue}>
                {averageStreak}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Средний стрик</ThemedText>
            </View>
          </View>
        </View>

        {/* Участники семьи */}
        <View style={styles.membersSection}>
          <View style={styles.sectionHeader}>
            <ThemedText type="heading2" style={styles.sectionTitle}>
              Участники семьи
            </ThemedText>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={addMember}
            >
              <MaterialIcons name="add" size={20} color={PRIMARY} />
              <ThemedText style={styles.addButtonText}>Добавить</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.membersList}>
            {familyMembers.map((member) => (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.memberInfo}>
                  <Image source={member.avatar} style={styles.memberAvatar} />
                  
                  <View style={styles.memberDetails}>
                    <View style={styles.memberHeader}>
                      <ThemedText type="defaultSemiBold" style={styles.memberName}>
                        {member.name}
                      </ThemedText>
                      <View style={[styles.roleBadge, { backgroundColor: getRoleColor(member.role) + '20' }]}>
                        <ThemedText style={[styles.roleText, { color: getRoleColor(member.role) }]}>
                          {getRoleText(member.role)}
                        </ThemedText>
                      </View>
                    </View>
                    
                    <ThemedText style={styles.memberEmail}>{member.email}</ThemedText>
                    
                    <View style={styles.memberStats}>
                      <View style={styles.memberStat}>
                        <MaterialIcons name="whatshot" size={16} color={WARNING} />
                        <ThemedText style={styles.memberStatText}>
                          {member.streak} дней
                        </ThemedText>
                      </View>
                      <View style={styles.memberStat}>
                        <MaterialIcons name="fitness-center" size={16} color={PRIMARY} />
                        <ThemedText style={styles.memberStatText}>
                          {member.workoutsThisMonth} тренировок
                        </ThemedText>
                      </View>
                    </View>
                    
                    <ThemedText style={styles.memberLastSeen}>
                      Последний визит: {member.lastSeen}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.memberActions}>
                  <TouchableOpacity
                    style={[
                      styles.statusToggle,
                      member.isActive ? styles.statusActive : styles.statusInactive
                    ]}
                    onPress={() => toggleMemberStatus(member.id)}
                  >
                    <MaterialIcons 
                      name={member.isActive ? 'toggle-on' : 'toggle-off'} 
                      size={24} 
                      color={member.isActive ? SUCCESS : TEXT_MUTED} 
                    />
                  </TouchableOpacity>
                  
                  {member.role !== 'owner' && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeMember(member.id)}
                    >
                      <MaterialIcons name="close" size={20} color={ERROR} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Доступные функции */}
        <View style={styles.featuresSection}>
          <ThemedText type="heading2" style={styles.sectionTitle}>
            Доступные функции
          </ThemedText>
          
          <View style={styles.featuresList}>
            {subscriptionFeatures.map((feature) => (
              <View key={feature.id} style={styles.featureCard}>
                <View style={styles.featureHeader}>
                  <View style={[styles.featureIcon, { backgroundColor: PRIMARY + '20' }]}>
                    <MaterialIcons 
                      name={feature.icon as any} 
                      size={24} 
                      color={feature.isAvailable ? PRIMARY : TEXT_MUTED} 
                    />
                  </View>
                  
                  <View style={styles.featureInfo}>
                    <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
                      {feature.title}
                    </ThemedText>
                    <ThemedText style={styles.featureDescription}>
                      {feature.description}
                    </ThemedText>
                  </View>

                  <View style={styles.featureStatus}>
                    {feature.isAvailable ? (
                      <MaterialIcons name="check-circle" size={20} color={SUCCESS} />
                    ) : (
                      <MaterialIcons name="lock" size={20} color={TEXT_MUTED} />
                    )}
                  </View>
                </View>

                {feature.isAvailable && feature.limit && feature.limit > 0 && (
                  <View style={styles.featureUsage}>
                    <View style={styles.usageInfo}>
                      <ThemedText style={styles.usageText}>
                        Использовано: {feature.usageCount}/{feature.limit}
                      </ThemedText>
                    </View>
                    <View style={styles.usageBar}>
                      <View style={[
                        styles.usageProgress,
                        { 
                          width: `${Math.min((feature.usageCount! / feature.limit) * 100, 100)}%`,
                          backgroundColor: feature.usageCount! >= feature.limit ? ERROR : PRIMARY
                        }
                      ]} />
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Информация о подписке */}
        <View style={styles.subscriptionSection}>
          <ThemedText type="heading2" style={styles.sectionTitle}>
            Информация о подписке
          </ThemedText>
          
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <View style={styles.subscriptionIcon}>
                <MaterialIcons name="groups" size={32} color={SECONDARY} />
              </View>
              <View style={styles.subscriptionInfo}>
                <ThemedText type="heading3" style={styles.subscriptionTitle}>
                  Семейная подписка Pro
                </ThemedText>
                <ThemedText style={styles.subscriptionPrice}>
                  19 900 ₸/месяц
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.subscriptionDetails}>
              <View style={styles.subscriptionDetail}>
                <ThemedText style={styles.detailLabel}>Статус:</ThemedText>
                <View style={styles.statusBadge}>
                  <MaterialIcons name="check-circle" size={16} color={SUCCESS} />
                  <ThemedText style={styles.statusText}>Активна</ThemedText>
                </View>
              </View>
              
              <View style={styles.subscriptionDetail}>
                <ThemedText style={styles.detailLabel}>Следующее списание:</ThemedText>
                <ThemedText style={styles.detailValue}>15 января 2025</ThemedText>
              </View>
              
              <View style={styles.subscriptionDetail}>
                <ThemedText style={styles.detailLabel}>Участников:</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {familyMembers.length}/4
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Действия */}
        <View style={styles.actionsSection}>
          <Button style={styles.upgradeButton}>
            <ThemedText style={styles.upgradeButtonText}>
              Улучшить подписку
            </ThemedText>
          </Button>
          
          <Button style={styles.manageButton}>
            <ThemedText style={styles.manageButtonText}>
              Настройки платежей
            </ThemedText>
          </Button>
          
          <TouchableOpacity style={styles.cancelButton}>
            <ThemedText style={styles.cancelButtonText}>
              Отменить подписку
            </ThemedText>
          </TouchableOpacity>
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
    paddingBottom: 16,
    paddingHorizontal: 16,
    minHeight: 80,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 16,
  },
  superText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CARD_BG,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
  
  // Members
  membersSection: {
    marginBottom: 32,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addButtonText: {
    fontSize: 14,
    color: PRIMARY,
    fontWeight: '600',
    marginLeft: 4,
  },
  membersList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  memberCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: BG,
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  memberDetails: {
    flex: 1,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    color: TEXT_DARK,
    marginRight: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  memberEmail: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginBottom: 8,
  },
  memberStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  memberStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberStatText: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginLeft: 4,
  },
  memberLastSeen: {
    fontSize: 11,
    color: TEXT_MUTED,
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusToggle: {
    padding: 4,
  },
  statusActive: {},
  statusInactive: {},
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ERROR + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Features
  featuresSection: {
    marginBottom: 32,
  },
  featuresList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  featureCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: BG,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    color: TEXT_DARK,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  featureStatus: {
    marginLeft: 12,
  },
  featureUsage: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BG,
  },
  usageInfo: {
    marginBottom: 8,
  },
  usageText: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  usageBar: {
    height: 4,
    backgroundColor: BG,
    borderRadius: 2,
    overflow: 'hidden',
  },
  usageProgress: {
    height: '100%',
    borderRadius: 2,
  },
  
  // Subscription
  subscriptionSection: {
    marginBottom: 32,
  },
  subscriptionCard: {
    backgroundColor: BG,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  subscriptionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: CARD_BG,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  subscriptionPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PRIMARY,
  },
  subscriptionDetails: {
    gap: 12,
  },
  subscriptionDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SUCCESS + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    color: SUCCESS,
    fontWeight: '600',
    marginLeft: 4,
  },
  
  // Actions
  actionsSection: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 32,
  },
  upgradeButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  upgradeButtonText: {
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
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: ERROR,
    fontSize: 14,
    fontWeight: '600',
  },
}); 
