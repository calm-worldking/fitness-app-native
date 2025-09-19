import { ThemedText } from '@/components/ThemedText';
import { api } from '@/lib/api';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '../_layout';

// Брендовые цвета
const PRIMARY = '#FF6246';
const BG = '#FFE7D8';
const CARD_BG = '#FFFFFF';
const TEXT_DARK = '#000000';
const TEXT_MUTED = '#737373';
const ERROR = '#FF3B30';
const SURFACE_LIGHT = '#F8F9FA';
const BORDER_LIGHT = '#E9ECEF';

function EditProfileScreenContent() {
  const { user, signIn } = useUser();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState<{ uri: string } | null>(null);

  // Обновляем форму при изменении пользователя
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      // Устанавливаем аватар из профиля пользователя
      console.log('👤 Setting avatar from user profile:', {
        userAvatar: user.avatar,
        avatarType: typeof user.avatar,
        hasAvatar: !!user.avatar
      });
      
      if (user.avatar && typeof user.avatar === 'string') {
        const fullAvatarUrl = user.avatar.startsWith('http') 
          ? user.avatar 
          : `${process.env.EXPO_PUBLIC_PARTNER_API_BASE || 'https://partner.xnova.kz'}${user.avatar}`;
        console.log('📸 Setting avatar URL:', fullAvatarUrl);
        setAvatar({ uri: fullAvatarUrl });
      } else {
        console.log('📸 No avatar, setting to null');
        setAvatar(null);
      }
    }
  }, [user]);

  // Проверяем, авторизован ли пользователь
  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <Text>Пожалуйста, войдите в аккаунт</Text>
        <TouchableOpacity 
          style={{ marginTop: 16, padding: 12, backgroundColor: PRIMARY, borderRadius: 8 }}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={{ color: '#FFFFFF' }}>Войти</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите ваше имя');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите email');
      return;
    }

    setLoading(true);
    try {
      // Отправляем запрос на обновление профиля
      const response = await api.updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });
      
      // Обновляем пользователя в контексте
      const updatedUser = {
        ...response.user,
        avatar: avatar ? avatar.uri : (response.user.avatar || user?.avatar)
      };
      
      console.log('👤 Updating user context:', {
        responseUser: response.user,
        localAvatar: avatar,
        finalAvatar: updatedUser.avatar
      });
      
      signIn(updatedUser);
      
      Alert.alert('Успех!', 'Профиль обновлен', [
        { text: 'ОК', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Ошибка', error.message || 'Не удалось обновить профиль');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeAvatar = () => {
    Alert.alert(
      'Изменить фото',
      'Выберите способ',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Сделать фото', onPress: () => takePhoto() },
        { text: 'Выбрать из галереи', onPress: () => pickImage() },
        ...(avatar ? [{ text: 'Удалить фото', onPress: () => deleteAvatar(), style: 'destructive' as const }] : [])
      ]
    );
  };

  const takePhoto = async () => {
    try {
      // Запрашиваем разрешение на камеру
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Ошибка', 'Необходимо разрешение на использование камеры');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Ошибка', 'Не удалось сделать фото');
    }
  };

  const pickImage = async () => {
    try {
      // Запрашиваем разрешение на галерею
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Ошибка', 'Необходимо разрешение на доступ к галерее');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать изображение');
    }
  };

  const uploadAvatar = async (imageUri: string) => {
    try {
      setLoading(true);
      console.log('📸 Uploading avatar:', imageUri);
      
      const response = await api.uploadAvatar(imageUri);
      
      if (response.data?.avatarUrl && typeof response.data.avatarUrl === 'string') {
        const fullAvatarUrl = response.data.avatarUrl.startsWith('http') 
          ? response.data.avatarUrl 
          : `${process.env.EXPO_PUBLIC_PARTNER_API_BASE || 'https://partner.xnova.kz'}${response.data.avatarUrl}`;
        
        setAvatar({ uri: fullAvatarUrl });
        
        // Обновляем пользователя в контексте
        const updatedUser = {
          ...user,
          avatar: response.data.avatarUrl // Сохраняем относительный путь
        };
        signIn(updatedUser);
        
        // Также обновляем локальное состояние аватара
        setAvatar({ uri: fullAvatarUrl });
        
        // Перезагружаем данные пользователя из API для синхронизации
        try {
          const userProfile = await api.getUserProfile();
          if (userProfile.data) {
            signIn(userProfile.data);
            console.log('✅ User profile updated after avatar upload');
          }
        } catch (error) {
          console.log('⚠️ Failed to refresh user profile:', error);
        }
        
        Alert.alert('Успех!', 'Аватар успешно загружен');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить аватар');
    } finally {
      setLoading(false);
    }
  };

  const deleteAvatar = async () => {
    try {
      setLoading(true);
      console.log('🗑️ Deleting avatar');
      
      await api.deleteAvatar();
      
      setAvatar(null);
      
      // Обновляем пользователя в контексте
      const updatedUser = {
        ...user,
        avatar: null
      };
      signIn(updatedUser);
      
      Alert.alert('Успех!', 'Аватар удален');
    } catch (error) {
      console.error('Error deleting avatar:', error);
      Alert.alert('Ошибка', 'Не удалось удалить аватар');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar backgroundColor={CARD_BG} barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={TEXT_DARK} />
        </TouchableOpacity>
        <ThemedText type="heading2" style={styles.headerTitle}>
          Редактировать профиль
        </ThemedText>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Аватар */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleChangeAvatar} style={styles.avatarContainer}>
            {avatar ? (
              <Image source={avatar} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <MaterialIcons name="person" size={48} color={TEXT_MUTED} />
              </View>
            )}
            <View style={styles.avatarOverlay}>
              <MaterialIcons name="camera-alt" size={24} color={CARD_BG} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleChangeAvatar} style={styles.changeAvatarButton}>
            <Text style={styles.changeAvatarText}>
              {avatar ? 'Изменить фото' : 'Добавить фото'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Форма */}
        <View style={styles.formSection}>
          {/* Имя */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Полное имя</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="person" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
              <TextInput
                placeholder="Введите ваше имя"
                placeholderTextColor={TEXT_MUTED}
                autoComplete="name"
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
                style={styles.textInput}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
              <TextInput
                placeholder="Введите ваш email"
                placeholderTextColor={TEXT_MUTED}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                style={styles.textInput}
              />
            </View>
          </View>

          {/* Телефон */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Телефон</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="phone" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
              <TextInput
                placeholder="+7 (777) 123-45-67"
                placeholderTextColor={TEXT_MUTED}
                keyboardType="phone-pad"
                autoComplete="tel"
                value={formData.phone}
                onChangeText={(value) => updateFormData('phone', value)}
                style={styles.textInput}
              />
            </View>
          </View>
        </View>

        {/* Дополнительные настройки */}
        <View style={styles.settingsSection}>
          <ThemedText type="heading3" style={styles.sectionTitle}>
            Дополнительные настройки
          </ThemedText>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/profile/change-password')}
          >
            <MaterialIcons name="security" size={20} color={TEXT_MUTED} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Изменить пароль</Text>
              <Text style={styles.settingSubtitle}>Обновить пароль для безопасности</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={TEXT_MUTED} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="notifications" size={20} color={TEXT_MUTED} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Уведомления</Text>
              <Text style={styles.settingSubtitle}>Настройки push-уведомлений</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={TEXT_MUTED} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="language" size={20} color={TEXT_MUTED} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Язык</Text>
              <Text style={styles.settingSubtitle}>Русский</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={TEXT_MUTED} />
          </TouchableOpacity>
        </View>

        {/* Кнопка удаления аккаунта */}
        <View style={styles.dangerSection}>
          <TouchableOpacity 
            style={styles.deleteAccountButton}
            onPress={() => {
              Alert.alert(
                'Удалить аккаунт',
                'Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.',
                [
                  { text: 'Отмена', style: 'cancel' },
                  { text: 'Удалить', style: 'destructive', onPress: () => Alert.alert('Скоро', 'Функция будет доступна') }
                ]
              );
            }}
          >
            <MaterialIcons name="delete-forever" size={20} color={ERROR} />
            <Text style={styles.deleteAccountText}>Удалить аккаунт</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_DARK,
  },
  saveButton: {
    backgroundColor: PRIMARY,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: CARD_BG,
  },
  
  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  
  // Avatar section
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    backgroundColor: SURFACE_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: BORDER_LIGHT,
    borderStyle: 'dashed',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: CARD_BG,
  },
  changeAvatarButton: {
    backgroundColor: BG,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  changeAvatarText: {
    fontSize: 14,
    color: TEXT_DARK,
    fontWeight: '600',
  },
  
  // Form section
  formSection: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: TEXT_DARK,
    paddingVertical: 16,
    fontFamily: 'MuseoSansCyrl_500',
  },
  
  // Settings section
  settingsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BG,
  },
  settingContent: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: TEXT_DARK,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  
  // Danger section
  dangerSection: {
    marginTop: 32,
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: ERROR,
  },
  deleteAccountText: {
    fontSize: 16,
    color: ERROR,
    fontWeight: '600',
    marginLeft: 8,
    },
}); 

export default function EditProfileScreen() {
  return <EditProfileScreenContent />;
}

