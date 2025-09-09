import { Logo } from '@/components/Logo';
import { ThemedView } from '@/components/ThemedView';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIMARY = '#FF6246';
const SUCCESS = '#4CAF50';
const BG = '#FFFFFF';
const CARD_BG = '#FFFFFF';
const TEXT_DARK = '#000000';
const TEXT_MUTED = '#737373';
const HEADER_DARK = '#0D1F2C';
const SURFACE_LIGHT = '#F8F9FA';
const BORDER_LIGHT = '#E9ECEF';

export default function BookingSuccessScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const handleViewSchedule = () => {
    router.push('/(tabs)/schedule');
  };

  const handleBackToHome = () => {
    router.push('/(tabs)');
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar backgroundColor={HEADER_DARK} barStyle="light-content" />
      
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Logo width={120} height={36} />
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.successIconContainer}>
          <View style={styles.successIcon}>
            <MaterialIcons name="check" size={48} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.successTitle}>Запись успешно создана!</Text>
        <Text style={styles.successSubtitle}>
          Вы записались на занятие. Не забудьте подтвердить участие за 30 минут до начала.
        </Text>

        <View style={styles.bookingCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="event" size={24} color={PRIMARY} />
            <Text style={styles.cardTitle}>Детали записи</Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <MaterialIcons name="fitness-center" size={20} color={TEXT_MUTED} />
              <Text style={styles.detailLabel}>Занятие:</Text>
              <Text style={styles.detailValue}>{params.classTitle || 'Название занятия'}</Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="location-on" size={20} color={TEXT_MUTED} />
              <Text style={styles.detailLabel}>Зал:</Text>
              <Text style={styles.detailValue}>{params.gymName || 'Название зала'}</Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="calendar-today" size={20} color={TEXT_MUTED} />
              <Text style={styles.detailLabel}>Дата:</Text>
              <Text style={styles.detailValue}>{params.date || 'Дата занятия'}</Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="access-time" size={20} color={TEXT_MUTED} />
              <Text style={styles.detailLabel}>Время:</Text>
              <Text style={styles.detailValue}>{params.time || 'Время занятия'}</Text>
            </View>

            {params.coach && (
              <View style={styles.detailRow}>
                <MaterialIcons name="person" size={20} color={TEXT_MUTED} />
                <Text style={styles.detailLabel}>Тренер:</Text>
                <Text style={styles.detailValue}>{params.coach}</Text>
              </View>
            )}

            {params.duration && (
              <View style={styles.detailRow}>
                <MaterialIcons name="timer" size={20} color={TEXT_MUTED} />
                <Text style={styles.detailLabel}>Длительность:</Text>
                <Text style={styles.detailValue}>{params.duration}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleViewSchedule}>
            <MaterialIcons name="schedule" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Посмотреть расписание</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={handleBackToHome}>
            <Text style={styles.backButtonText}>Вернуться на главную</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    backgroundColor: HEADER_DARK,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSpacer: {
    width: 120,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  successIconContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: SUCCESS,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: SUCCESS,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: TEXT_DARK,
    textAlign: 'center',
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 16,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  bookingCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_DARK,
    marginLeft: 12,
  },
  detailsContainer: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginLeft: 8,
    marginRight: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_DARK,
    flex: 1,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  backButtonText: {
    color: TEXT_MUTED,
    fontSize: 16,
    fontWeight: '500',
  },
});
