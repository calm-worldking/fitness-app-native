import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '@/components/Logo';
import { NotificationsModal } from '@/components/NotificationsModal';
import { api } from '@/lib/api';

// Цвета
const HEADER_DARK = '#0D1F2C';

interface AppHeaderProps {
  showNotifications?: boolean;
}

export function AppHeader({ showNotifications = true }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Загружаем количество непрочитанных приглашений
  const loadUnreadCount = async () => {
    try {
      const response = await api.getInvitations();
      const incomingInvitations = response.invitations?.incoming || [];
      setUnreadCount(incomingInvitations.length);
    } catch (error) {
      console.log('Failed to load unread count:', error);
    }
  };

  useEffect(() => {
    if (showNotifications) {
      loadUnreadCount();
      // Обновляем счетчик каждые 30 секунд
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [showNotifications]);

  return (
    <>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Logo width={120} height={36} />
        {showNotifications && (
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => {
              console.log('🔔 AppHeader notification button pressed');
              setShowNotificationsModal(true);
            }}
          >
            <MaterialIcons name="notifications-none" size={28} color="#fff" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Модальное окно уведомлений */}
      {showNotificationsModal && (
        <NotificationsModal
          visible={showNotificationsModal}
          onClose={() => {
            console.log('🔔 Closing notifications modal from AppHeader');
            setShowNotificationsModal(false);
            // Обновляем счетчик после закрытия модального окна
            loadUnreadCount();
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: HEADER_DARK,
  },
  notificationButton: {
    padding: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});


