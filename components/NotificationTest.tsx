import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { notificationService } from '@/lib/notifications';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

export function NotificationTest() {
  const [isLoading, setIsLoading] = useState(false);

  const testNotification = async () => {
    setIsLoading(true);
    try {
      // Создаем тестовое уведомление через 10 секунд
      const testTime = new Date(Date.now() + 10 * 1000);
      
      await notificationService.scheduleWorkoutReminders({
        classId: 'test-class-123',
        classTitle: 'Тестовая тренировка',
        gymName: 'Тестовый зал',
        startTime: testTime,
      });

      Alert.alert(
        'Тест запущен',
        'Уведомления запланированы на ближайшие 10 секунд. Проверьте, что уведомления включены в настройках устройства.'
      );
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось создать тестовое уведомление');
    } finally {
      setIsLoading(false);
    }
  };

  const checkPermissions = async () => {
    try {
      const permissions = await notificationService.getNotificationPermissions();
      Alert.alert(
        'Разрешения',
        `Статус уведомлений: ${permissions.status === 'granted' ? 'Разрешены ✅' : 'Запрещены ❌'}`
      );
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось проверить разрешения');
    }
  };

  const cancelAllNotifications = async () => {
    try {
      await notificationService.cancelAllNotifications();
      Alert.alert('Готово', 'Все уведомления отменены');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось отменить уведомления');
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="heading2" style={styles.title}>
        Тест уведомлений
      </ThemedText>
      
      <Button
        title="Проверить разрешения"
        onPress={checkPermissions}
        style={styles.button}
      />
      
      <Button
        title="Тестовое уведомление (10 сек)"
        onPress={testNotification}
        style={styles.button}
        loading={isLoading}
      />
      
      <Button
        title="Отменить все уведомления"
        onPress={cancelAllNotifications}
        style={[styles.button, styles.dangerButton]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    marginVertical: 8,
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
});
