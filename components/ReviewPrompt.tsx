import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { ReviewModal } from './ReviewModal';
import { reviewsApi } from '@/lib/api';

// Брендовые цвета
const PRIMARY = '#FF6246';
const SECONDARY = '#FF8843';
const BG = '#FFE7D8';
const CARD_BG = '#FFFFFF';
const TEXT_DARK = '#000000';
const TEXT_MUTED = '#737373';
const SUCCESS = '#4CAF50';
const WARNING = '#FF9800';
const ERROR = '#F44336';

interface ReviewableBooking {
  id: string;
  className: string;
  gymName: string;
  date: string;
  time: string;
  confirmedAt: string;
}

interface ReviewPromptProps {
  onReviewSubmitted?: () => void;
}

export function ReviewPrompt({ onReviewSubmitted }: ReviewPromptProps) {
  const [reviewableBookings, setReviewableBookings] = useState<ReviewableBooking[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<ReviewableBooking | null>(null);
  const [loading, setLoading] = useState(false);

  // Загружаем доступные для отзыва занятия
  const loadReviewableBookings = async () => {
    try {
      setLoading(true);
      const response = await reviewsApi.getReviewableBookings();
      
      console.log('📱 Reviewable bookings response:', response);
      
      if (response && response.bookings && Array.isArray(response.bookings)) {
        // Преобразуем данные в нужный формат
        const formattedBookings: ReviewableBooking[] = response.bookings.map((booking: any) => {
          const startDate = new Date(booking.class.startsAt);
          const endDate = new Date(booking.class.endsAt);
          
          // Форматируем дату
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          let dateText = '';
          if (startDate.toDateString() === today.toDateString()) {
            dateText = 'Сегодня';
          } else if (startDate.toDateString() === tomorrow.toDateString()) {
            dateText = 'Завтра';
          } else {
            dateText = startDate.toLocaleDateString('ru-RU', { 
              day: 'numeric', 
              month: 'long' 
            });
          }
          
          // Форматируем время
          const timeText = `${startDate.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })} - ${endDate.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}`;
          
          return {
            id: booking.id,
            className: booking.class.title,
            gymName: booking.gym.name,
            date: dateText,
            time: timeText,
            confirmedAt: booking.confirmedAt
          };
        });
        
        setReviewableBookings(formattedBookings);
      } else {
        setReviewableBookings([]);
      }
    } catch (error) {
      console.log('📱 Failed to load reviewable bookings:', error);
      setReviewableBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviewableBookings();
  }, []);

  const handleReviewClick = (booking: ReviewableBooking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedBooking(null);
  };

  const handleReviewSubmitted = () => {
    // Обновляем список доступных отзывов
    loadReviewableBookings();
    onReviewSubmitted?.();
    handleCloseReviewModal();
  };

  const handleDismissAll = () => {
    Alert.alert(
      'Скрыть все отзывы',
      'Вы уверены, что хотите скрыть все запросы на отзывы?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Скрыть',
          style: 'destructive',
          onPress: () => {
            setReviewableBookings([]);
          }
        }
      ]
    );
  };

  // Не показываем компонент, если нет доступных отзывов
  if (reviewableBookings.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="rate-review" size={24} color={PRIMARY} />
          <ThemedText style={styles.headerTitle}>
            Оцените тренировки
          </ThemedText>
        </View>
        <TouchableOpacity onPress={handleDismissAll} style={styles.dismissButton}>
          <MaterialIcons name="close" size={20} color={TEXT_MUTED} />
        </TouchableOpacity>
      </View>

      {/* Список доступных отзывов */}
      <View style={styles.bookingsList}>
        {reviewableBookings.map((booking) => (
          <TouchableOpacity
            key={booking.id}
            style={styles.bookingCard}
            onPress={() => handleReviewClick(booking)}
          >
            <View style={styles.bookingInfo}>
              <ThemedText style={styles.gymName}>{booking.gymName}</ThemedText>
              <ThemedText style={styles.className}>{booking.className}</ThemedText>
              <View style={styles.bookingDetails}>
                <MaterialIcons name="event" size={14} color={TEXT_MUTED} />
                <ThemedText style={styles.bookingDate}>{booking.date}</ThemedText>
                <MaterialIcons name="access-time" size={14} color={TEXT_MUTED} />
                <ThemedText style={styles.bookingTime}>{booking.time}</ThemedText>
              </View>
            </View>
            <View style={styles.reviewButton}>
              <MaterialIcons name="star" size={20} color={WARNING} />
              <ThemedText style={styles.reviewButtonText}>Оценить</ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Модальное окно для отзыва */}
      {selectedBooking && (
        <ReviewModal
          visible={showReviewModal}
          onClose={handleCloseReviewModal}
          bookingId={selectedBooking.id}
          gymName={selectedBooking.gymName}
          className={selectedBooking.className}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: CARD_BG,
    margin: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: BG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  dismissButton: {
    padding: 4,
  },
  bookingsList: {
    gap: 12,
  },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  bookingInfo: {
    flex: 1,
  },
  gymName: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 2,
  },
  className: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 6,
  },
  bookingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookingDate: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginRight: 12,
  },
  bookingTime: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  reviewButtonText: {
    color: CARD_BG,
    fontSize: 12,
    fontWeight: '600',
  },
});