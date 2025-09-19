import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Настройка обработчика уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface WorkoutNotification {
  id: string;
  classId: string;
  classTitle: string;
  gymName: string;
  startTime: Date;
  notificationTime: Date;
  type: '1hour' | '2hours';
}

class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Проверяем, что устройство поддерживает уведомления
      if (!Device.isDevice) {
        console.log('Уведомления работают только на физических устройствах');
        return false;
      }

      // Запрашиваем разрешения
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Разрешение на уведомления не предоставлено');
        return false;
      }

      // Получаем push token (для будущего использования)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('workout-reminders', {
          name: 'Напоминания о тренировках',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6246',
        });
      }

      this.isInitialized = true;
      console.log('✅ NotificationService инициализирован');
      return true;
    } catch (error) {
      console.error('❌ Ошибка инициализации NotificationService:', error);
      return false;
    }
  }

  async scheduleWorkoutReminders(workout: {
    classId: string;
    classTitle: string;
    gymName: string;
    startTime: Date;
  }): Promise<WorkoutNotification[]> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Не удалось инициализировать сервис уведомлений');
      }
    }

    const notifications: WorkoutNotification[] = [];
    const now = new Date();
    
    console.log('📱 Scheduling notifications for workout:', {
      classTitle: workout.classTitle,
      startTime: workout.startTime.toISOString(),
      localStartTime: workout.startTime.toLocaleString('ru-RU'),
      now: now.toISOString(),
      localNow: now.toLocaleString('ru-RU'),
      timeUntilStart: Math.floor((workout.startTime.getTime() - now.getTime()) / (1000 * 60)) + ' минут'
    });

    // Уведомление за 2 часа
    const twoHoursBefore = new Date(workout.startTime.getTime() - 2 * 60 * 60 * 1000);
    console.log('📱 2-hour notification timing:', {
      twoHoursBefore: twoHoursBefore.toISOString(),
      localTwoHoursBefore: twoHoursBefore.toLocaleString('ru-RU'),
      willSchedule: twoHoursBefore > now,
      minutesUntilNotification: Math.floor((twoHoursBefore.getTime() - now.getTime()) / (1000 * 60))
    });
    
    if (twoHoursBefore > now) {
      const notificationId = await this.scheduleNotification({
        title: 'Тренировка через 2 часа! 💪',
        body: `${workout.classTitle} в ${workout.gymName}`,
        data: {
          classId: workout.classId,
          type: '2hours',
          startTime: workout.startTime.toISOString(),
        },
        trigger: {
          date: twoHoursBefore,
        },
      });

      if (notificationId) {
        notifications.push({
          id: notificationId,
          classId: workout.classId,
          classTitle: workout.classTitle,
          gymName: workout.gymName,
          startTime: workout.startTime,
          notificationTime: twoHoursBefore,
          type: '2hours',
        });
      }
    }

    // Уведомление за 1 час
    const oneHourBefore = new Date(workout.startTime.getTime() - 1 * 60 * 60 * 1000);
    console.log('📱 1-hour notification timing:', {
      oneHourBefore: oneHourBefore.toISOString(),
      localOneHourBefore: oneHourBefore.toLocaleString('ru-RU'),
      willSchedule: oneHourBefore > now,
      minutesUntilNotification: Math.floor((oneHourBefore.getTime() - now.getTime()) / (1000 * 60))
    });
    
    if (oneHourBefore > now) {
      const notificationId = await this.scheduleNotification({
        title: 'Тренировка через час! ⏰',
        body: `${workout.classTitle} в ${workout.gymName}`,
        data: {
          classId: workout.classId,
          type: '1hour',
          startTime: workout.startTime.toISOString(),
        },
        trigger: {
          date: oneHourBefore,
        },
      });

      if (notificationId) {
        notifications.push({
          id: notificationId,
          classId: workout.classId,
          classTitle: workout.classTitle,
          gymName: workout.gymName,
          startTime: workout.startTime,
          notificationTime: oneHourBefore,
          type: '1hour',
        });
      }
    }

    console.log(`📱 Запланировано ${notifications.length} уведомлений для тренировки "${workout.classTitle}"`);
    return notifications;
  }

  private async scheduleNotification(notification: {
    title: string;
    body: string;
    data: any;
    trigger: any;
  }): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: 'default',
        },
        trigger: notification.trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('❌ Ошибка планирования уведомления:', error);
      return null;
    }
  }

  async cancelWorkoutReminders(classId: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      const notificationsToCancel = scheduledNotifications.filter(
        notification => notification.content.data?.classId === classId
      );

      for (const notification of notificationsToCancel) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }

      console.log(`📱 Отменено ${notificationsToCancel.length} уведомлений для занятия ${classId}`);
    } catch (error) {
      console.error('❌ Ошибка отмены уведомлений:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('📱 Все уведомления отменены');
    } catch (error) {
      console.error('❌ Ошибка отмены всех уведомлений:', error);
    }
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('❌ Ошибка получения запланированных уведомлений:', error);
      return [];
    }
  }

  async getNotificationPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
    return await Notifications.getPermissionsAsync();
  }

  async requestNotificationPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
    return await Notifications.requestPermissionsAsync();
  }
}

// Экспортируем singleton instance
export const notificationService = NotificationService.getInstance();

// Хук для использования уведомлений в компонентах
export const useNotifications = () => {
  return {
    scheduleWorkoutReminders: (workout: Parameters<typeof notificationService.scheduleWorkoutReminders>[0]) =>
      notificationService.scheduleWorkoutReminders(workout),
    cancelWorkoutReminders: (classId: string) =>
      notificationService.cancelWorkoutReminders(classId),
    cancelAllNotifications: () =>
      notificationService.cancelAllNotifications(),
    getScheduledNotifications: () =>
      notificationService.getScheduledNotifications(),
    getNotificationPermissions: () =>
      notificationService.getNotificationPermissions(),
    requestNotificationPermissions: () =>
      notificationService.requestNotificationPermissions(),
    initialize: () =>
      notificationService.initialize(),
  };
};
