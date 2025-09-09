import { Logo } from '@/components/Logo';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
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
const INFO = '#2196F3';

interface InviteData {
  classId: string;
  className: string;
  gymName: string;
  date: string;
  time: string;
  duration: string;
}

export default function InviteScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processInvite = () => {
      try {
        // Получаем данные из URL параметров
        const type = params.type as string;
        const classId = params.classId as string;
        
        if (type === 'class' && classId) {
          const data: InviteData = {
            classId,
            className: decodeURIComponent(params.className as string || ''),
            gymName: decodeURIComponent(params.gymName as string || ''),
            date: decodeURIComponent(params.date as string || ''),
            time: decodeURIComponent(params.time as string || ''),
            duration: decodeURIComponent(params.duration as string || ''),
          };
          
          setInviteData(data);
        } else {
          Alert.alert('Ошибка', 'Неверная ссылка-приглашение');
          router.replace('/');
        }
      } catch (error) {
        console.error('Error processing invite:', error);
        Alert.alert('Ошибка', 'Не удалось обработать приглашение');
        router.replace('/');
      } finally {
        setLoading(false);
      }
    };

    processInvite();
  }, [params]);

  const handleJoinClass = () => {
    if (!inviteData) return;
    
    Alert.alert(
      'Присоединиться к занятию',
      `Хотите записаться на "${inviteData.className}" в ${inviteData.gymName}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Записаться',
          onPress: () => {
            // Здесь будет логика записи на занятие
            Alert.alert('Успешно!', 'Вы записались на занятие');
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleViewGym = () => {
    if (!inviteData) return;
    
    // Переходим к залу (пока просто показываем алерт)
    Alert.alert('Информация о зале', `Зал: ${inviteData.gymName}`);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={CARD_BG} barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <MaterialIcons name="schedule" size={48} color={PRIMARY} />
          <ThemedText style={styles.loadingText}>Загрузка приглашения...</ThemedText>
        </View>
      </View>
    );
  }

  if (!inviteData) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={CARD_BG} barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color={PRIMARY} />
          <ThemedText style={styles.errorText}>Неверная ссылка-приглашение</ThemedText>
          <Button onPress={() => router.replace('/')}>
            <ThemedText>Вернуться на главную</ThemedText>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={CARD_BG} barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={TEXT_DARK} />
        </TouchableOpacity>
        <Logo width={120} height={36} />
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Приглашение */}
        <View style={styles.inviteCard}>
          <View style={styles.inviteHeader}>
            <View style={styles.inviteIcon}>
              <MaterialIcons name="person-add" size={32} color={CARD_BG} />
            </View>
            <ThemedText type="heading1" style={styles.inviteTitle}>
              Приглашение на занятие
            </ThemedText>
          </View>

          {/* Информация о занятии */}
          <View style={styles.classInfo}>
            <ThemedText type="heading2" style={styles.className}>
              {inviteData.className}
            </ThemedText>
            
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={20} color={TEXT_MUTED} />
              <ThemedText style={styles.infoText}>{inviteData.gymName}</ThemedText>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialIcons name="event" size={20} color={TEXT_MUTED} />
              <ThemedText style={styles.infoText}>{inviteData.date}</ThemedText>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialIcons name="schedule" size={20} color={TEXT_MUTED} />
              <ThemedText style={styles.infoText}>{inviteData.time}</ThemedText>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialIcons name="timer" size={20} color={TEXT_MUTED} />
              <ThemedText style={styles.infoText}>{inviteData.duration}</ThemedText>
            </View>
          </View>

          {/* Кнопки действий */}
          <View style={styles.actionButtons}>
            <Button 
              style={styles.joinButton}
              onPress={handleJoinClass}
            >
              <MaterialIcons name="add" size={20} color={CARD_BG} />
              <ThemedText style={styles.joinButtonText}>Присоединиться</ThemedText>
            </Button>
            
            <TouchableOpacity 
              style={styles.viewGymButton}
              onPress={handleViewGym}
            >
              <MaterialIcons name="info" size={20} color={PRIMARY} />
              <ThemedText style={styles.viewGymButtonText}>Информация о зале</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Дополнительная информация */}
        <View style={styles.additionalInfo}>
          <View style={styles.benefitItem}>
            <MaterialIcons name="groups" size={20} color={PRIMARY} />
            <ThemedText style={styles.benefitText}>
              Тренируйтесь вместе с друзьями
            </ThemedText>
          </View>
          
          <View style={styles.benefitItem}>
            <MaterialIcons name="fitness-center" size={20} color={SECONDARY} />
            <ThemedText style={styles.benefitText}>
              Профессиональные тренеры
            </ThemedText>
          </View>
          
          <View style={styles.benefitItem}>
            <MaterialIcons name="analytics" size={20} color={SUCCESS} />
            <ThemedText style={styles.benefitText}>
              Отслеживайте прогресс
            </ThemedText>
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
  
  // Header
  header: {
    backgroundColor: CARD_BG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: BG,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  
  // Content
  content: {
    flex: 1,
    padding: 20,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: TEXT_MUTED,
    marginTop: 16,
  },
  
  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: TEXT_MUTED,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  
  // Invite card
  inviteCard: {
    backgroundColor: BG,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  inviteHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  inviteIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  inviteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_DARK,
    textAlign: 'center',
  },
  
  // Class info
  classInfo: {
    marginBottom: 24,
  },
  className: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: TEXT_DARK,
    marginLeft: 12,
    flex: 1,
  },
  
  // Action buttons
  actionButtons: {
    gap: 12,
  },
  joinButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CARD_BG,
    marginLeft: 8,
  },
  viewGymButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: PRIMARY,
  },
  viewGymButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY,
    marginLeft: 8,
  },
  
  // Additional info
  additionalInfo: {
    backgroundColor: BG,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 14,
    color: TEXT_DARK,
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
});

