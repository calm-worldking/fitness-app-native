import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { api } from '@/lib/api';

// Цвета
const PRIMARY = '#007AFF';
const SUCCESS = '#34C759';
const ERROR = '#FF3B30';
const WARNING = '#FF9500';
const TEXT_DARK = '#1C1C1E';
const TEXT_LIGHT = '#8E8E93';
const SURFACE_LIGHT = '#F2F2F7';
const BORDER_LIGHT = '#C6C6C8';

interface Invitation {
  id: string;
  subscriptionId: string;
  inviter: {
    name: string;
    email: string;
  };
  subscription: {
    planName: string;
    period: string;
    owner: {
      name: string;
    };
  };
  message?: string;
  expiresAt: string;
  createdAt: string;
}

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function NotificationsModal({ visible, onClose }: NotificationsModalProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  console.log('🔔 NotificationsModal rendered, visible:', visible);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const response = await api.getInvitations();
      setInvitations(response.invitations || []);
    } catch (error) {
      console.log('Failed to load invitations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadInvitations();
    }
  }, [visible]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInvitations();
  };

  const handleRespondToInvitation = async (invitationId: string, action: 'accept' | 'reject') => {
    try {
      const result = await api.respondToInvitation(invitationId, action);
      
      if (action === 'accept') {
        Alert.alert(
          'Успешно!',
          result.message,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Приглашение отклонено',
          'Вы отклонили приглашение в семейную подписку.'
        );
      }

      // Обновляем список приглашений
      await loadInvitations();
    } catch (error) {
      console.log('Failed to respond to invitation:', error);
      Alert.alert('Ошибка', 'Не удалось обработать приглашение');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Истекло';
    if (diffDays === 1) return 'Истекает завтра';
    return `Истекает через ${diffDays} дней`;
  };

  console.log('🔔 Rendering NotificationsModal with visible:', visible);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="heading2" style={styles.headerTitle}>
            Уведомления
          </ThemedText>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={TEXT_DARK} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ThemedText>Загрузка уведомлений...</ThemedText>
            </View>
          ) : invitations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-outline" size={64} color={TEXT_LIGHT} />
              <ThemedText style={styles.emptyStateText}>
                У вас нет новых уведомлений
              </ThemedText>
            </View>
          ) : (
            <View style={styles.invitationsList}>
              {invitations.map((invitation) => (
                <View key={invitation.id} style={styles.invitationCard}>
                  <View style={styles.invitationHeader}>
                    <View style={styles.invitationIcon}>
                      <Ionicons name="people" size={24} color={PRIMARY} />
                    </View>
                    <View style={styles.invitationInfo}>
                      <ThemedText style={styles.invitationTitle}>
                        Приглашение в семейную подписку
                      </ThemedText>
                      <ThemedText style={styles.invitationSubtitle}>
                        {invitation.inviter.name} приглашает вас
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.invitationDetails}>
                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>План:</ThemedText>
                      <ThemedText style={styles.detailValue}>
                        {invitation.subscription.planName} ({invitation.subscription.period})
                      </ThemedText>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>Владелец:</ThemedText>
                      <ThemedText style={styles.detailValue}>
                        {invitation.subscription.owner.name}
                      </ThemedText>
                    </View>

                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>Отправлено:</ThemedText>
                      <ThemedText style={styles.detailValue}>
                        {formatDate(invitation.createdAt)}
                      </ThemedText>
                    </View>

                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>Статус:</ThemedText>
                      <ThemedText style={[styles.detailValue, styles.expiryText]}>
                        {getTimeUntilExpiry(invitation.expiresAt)}
                      </ThemedText>
                    </View>

                    {invitation.message && (
                      <View style={styles.messageContainer}>
                        <ThemedText style={styles.messageLabel}>Сообщение:</ThemedText>
                        <ThemedText style={styles.messageText}>
                          "{invitation.message}"
                        </ThemedText>
                      </View>
                    )}
                  </View>

                  <View style={styles.invitationActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleRespondToInvitation(invitation.id, 'reject')}
                    >
                      <Ionicons name="close" size={20} color={ERROR} />
                      <ThemedText style={[styles.actionButtonText, styles.rejectButtonText]}>
                        Отклонить
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => handleRespondToInvitation(invitation.id, 'accept')}
                    >
                      <Ionicons name="checkmark" size={20} color={SUCCESS} />
                      <ThemedText style={[styles.actionButtonText, styles.acceptButtonText]}>
                        Принять
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_LIGHT,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_DARK,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: TEXT_LIGHT,
    textAlign: 'center',
    marginTop: 16,
  },
  invitationsList: {
    padding: 20,
    gap: 16,
  },
  invitationCard: {
    backgroundColor: SURFACE_LIGHT,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  invitationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  invitationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  invitationInfo: {
    flex: 1,
  },
  invitationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  invitationSubtitle: {
    fontSize: 14,
    color: TEXT_LIGHT,
  },
  invitationDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: TEXT_LIGHT,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: TEXT_DARK,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  expiryText: {
    color: WARNING,
  },
  messageContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  messageLabel: {
    fontSize: 12,
    color: TEXT_LIGHT,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: TEXT_DARK,
    fontStyle: 'italic',
  },
  invitationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  rejectButton: {
    backgroundColor: '#FFFFFF',
    borderColor: ERROR,
  },
  acceptButton: {
    backgroundColor: SUCCESS,
    borderColor: SUCCESS,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  rejectButtonText: {
    color: ERROR,
  },
  acceptButtonText: {
    color: '#FFFFFF',
  },
});
