import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '@/components/Logo';
import { NotificationsModal } from '@/components/NotificationsModal';

// Цвета
const HEADER_DARK = '#0D1F2C';

interface AppHeaderProps {
  showNotifications?: boolean;
}

export function AppHeader({ showNotifications = true }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

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
          </TouchableOpacity>
        )}
      </View>

      {/* Модальное окно уведомлений */}
      <NotificationsModal
        visible={showNotificationsModal}
        onClose={() => {
          console.log('🔔 Closing notifications modal from AppHeader');
          setShowNotificationsModal(false);
        }}
      />
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
  },
});
