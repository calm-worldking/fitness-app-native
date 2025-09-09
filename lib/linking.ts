import * as Linking from 'expo-linking';
import { Alert, Share } from 'react-native';

// Типы ссылок
export type LinkType = 'class' | 'gym' | 'profile';

// Интерфейс для данных занятия
export interface ClassInviteData {
  classId: string;
  className: string;
  gymName: string;
  date: string;
  time: string;
  duration: string;
}

// Генерация ссылки для приглашения на занятие
export const generateClassInviteLink = (classData: ClassInviteData): string => {
  const baseUrl = Linking.createURL('/');
  const params = new URLSearchParams({
    type: 'class',
    classId: classData.classId,
    className: encodeURIComponent(classData.className),
    gymName: encodeURIComponent(classData.gymName),
    date: encodeURIComponent(classData.date),
    time: encodeURIComponent(classData.time),
    duration: encodeURIComponent(classData.duration),
  });
  
  return `${baseUrl}invite?${params.toString()}`;
};

// Парсинг ссылки-приглашения
export const parseInviteLink = (url: string): ClassInviteData | null => {
  try {
    const parsed = Linking.parse(url);
    const queryParams = parsed.queryParams;
    
    if (queryParams?.type === 'class' && queryParams?.classId) {
      return {
        classId: queryParams.classId as string,
        className: decodeURIComponent(queryParams.className as string || ''),
        gymName: decodeURIComponent(queryParams.gymName as string || ''),
        date: decodeURIComponent(queryParams.date as string || ''),
        time: decodeURIComponent(queryParams.time as string || ''),
        duration: decodeURIComponent(queryParams.duration as string || ''),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing invite link:', error);
    return null;
  }
};

// Поделиться ссылкой
export const shareInviteLink = async (classData: ClassInviteData) => {
  try {
    const inviteLink = generateClassInviteLink(classData);
    
    const shareResult = await Share.share({
      message: `Привет! Приглашаю тебя на занятие "${classData.className}" в ${classData.gymName} ${classData.date} в ${classData.time} (${classData.duration}). Присоединяйся! ${inviteLink}`,
      url: inviteLink,
      title: `Приглашение на ${classData.className}`,
    });
    
    if (shareResult.action === Share.sharedAction) {
      Alert.alert('Успешно!', 'Ссылка-приглашение отправлена');
    }
  } catch (error) {
    console.error('Error sharing invite link:', error);
    Alert.alert('Ошибка', 'Не удалось поделиться ссылкой');
  }
};

// Копировать ссылку в буфер обмена
export const copyInviteLink = async (classData: ClassInviteData) => {
  try {
    const inviteLink = generateClassInviteLink(classData);
    
    // В React Native нет прямого доступа к буферу обмена без дополнительных библиотек
    // Поэтому используем Share API как альтернативу
    await Share.share({
      message: inviteLink,
      url: inviteLink,
    });
    
    Alert.alert('Ссылка скопирована', 'Ссылка-приглашение готова для отправки');
  } catch (error) {
    console.error('Error copying invite link:', error);
    Alert.alert('Ошибка', 'Не удалось скопировать ссылку');
  }
};

