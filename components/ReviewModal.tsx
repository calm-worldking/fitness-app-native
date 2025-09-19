import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { reviewsApi } from '@/lib/api';

// Брендовые цвета
const PRIMARY = '#FF6246';
const BG = '#FFE7D8';
const CARD_BG = '#FFFFFF';
const TEXT_DARK = '#000000';
const TEXT_MUTED = '#737373';
const WARNING = '#FF9800';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  bookingId: string;
  gymName: string;
  className: string;
  onReviewSubmitted?: () => void;
}

export function ReviewModal({
  visible,
  onClose,
  bookingId,
  gymName,
  className,
  onReviewSubmitted
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleStarPress = (starRating: number) => {
    setRating(starRating);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Ошибка', 'Пожалуйста, поставьте оценку');
      return;
    }

    try {
      setSubmitting(true);
      await reviewsApi.createReview(bookingId, rating, comment.trim() || undefined);
      
      Alert.alert(
        'Спасибо!',
        'Ваш отзыв отправлен',
        [
          {
            text: 'OK',
            onPress: () => {
              setRating(0);
              setComment('');
              onClose();
              onReviewSubmitted?.();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Ошибка', 'Не удалось отправить отзыв. Попробуйте еще раз.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleStarPress(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={32}
              color={star <= rating ? WARNING : TEXT_MUTED}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableOpacity 
            style={styles.modal}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.dragIndicator} />
            <View style={styles.header}>
              <ThemedText type="heading2" style={styles.title}>
                Оцените тренировку
              </ThemedText>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={TEXT_DARK} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollContent}
              contentContainerStyle={styles.scrollContentContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              <View style={styles.content}>
                <View style={styles.classInfo}>
                  <ThemedText style={styles.gymName}>{gymName}</ThemedText>
                  <ThemedText style={styles.className}>{className}</ThemedText>
                </View>

                <View style={styles.ratingSection}>
                  <ThemedText style={styles.ratingLabel}>
                    Как вам тренировка?
                  </ThemedText>
                  {renderStars()}
                  {rating > 0 && (
                    <ThemedText style={styles.ratingText}>
                      {rating === 1 && 'Ужасно'}
                      {rating === 2 && 'Плохо'}
                      {rating === 3 && 'Нормально'}
                      {rating === 4 && 'Хорошо'}
                      {rating === 5 && 'Отлично!'}
                    </ThemedText>
                  )}
                </View>

                <View style={styles.commentSection}>
                  <ThemedText style={styles.commentLabel}>
                    Расскажите подробнее (необязательно)
                  </ThemedText>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Что понравилось или не понравилось?"
                    placeholderTextColor={TEXT_MUTED}
                    value={comment}
                    onChangeText={setComment}
                    multiline
                    numberOfLines={3}
                    maxLength={500}
                    textAlignVertical="top"
                  />
                  <ThemedText style={styles.charCount}>
                    {comment.length}/500
                  </ThemedText>
                </View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <ThemedText style={styles.submitButtonText}>
                  {submitting ? 'Отправляем...' : 'Отправить отзыв'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    maxHeight: '85%',
    minHeight: '60%',
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#D0D0D0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: BG,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_DARK,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  classInfo: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: BG,
    borderRadius: 12,
  },
  gymName: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  className: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  ratingSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
    marginHorizontal: 2,
  },
  ratingText: {
    fontSize: 14,
    color: WARNING,
    fontWeight: '600',
  },
  commentSection: {
    marginBottom: 24,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: TEXT_DARK,
    textAlignVertical: 'top',
    minHeight: 100,
    maxHeight: 150,
    backgroundColor: '#FAFAFA',
    lineHeight: 22,
  },
  charCount: {
    fontSize: 12,
    color: TEXT_MUTED,
    textAlign: 'right',
    marginTop: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: BG,
    backgroundColor: CARD_BG,
  },
  submitButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: TEXT_MUTED,
  },
  submitButtonText: {
    color: CARD_BG,
    fontSize: 16,
    fontWeight: '600',
  },
});
