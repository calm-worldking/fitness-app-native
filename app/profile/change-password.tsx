import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
const SECONDARY = '#FF8843';
const BG = '#FFE7D8';
const CARD_BG = '#FFFFFF';
const TEXT_DARK = '#000000';
const TEXT_MUTED = '#737373';
const SUCCESS = '#4CAF50';
const ERROR = '#FF3B30';

function ChangePasswordScreenContent() {
  const { user } = useUser();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const validateForm = () => {
    if (!formData.currentPassword.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите текущий пароль');
      return false;
    }

    if (!formData.newPassword.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите новый пароль');
      return false;
    }

    if (formData.newPassword.length < 6) {
      Alert.alert('Ошибка', 'Новый пароль должен содержать минимум 6 символов');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      Alert.alert('Ошибка', 'Новый пароль должен отличаться от текущего');
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // В реальном приложении здесь был бы API запрос для изменения пароля
      // await api.changePassword(formData.currentPassword, formData.newPassword);
      
      // Пока симулируем успешное изменение
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Успех!', 'Пароль успешно изменен', [
        { text: 'ОК', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Ошибка', error.message || 'Не удалось изменить пароль');
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
          Изменить пароль
        </ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Информация */}
        <View style={styles.infoSection}>
          <MaterialIcons name="security" size={48} color={PRIMARY} />
          <ThemedText type="heading2" style={styles.infoTitle}>
            Безопасность аккаунта
          </ThemedText>
          <Text style={styles.infoText}>
            Измените пароль для повышения безопасности вашего аккаунта
          </Text>
        </View>

        {/* Форма */}
        <View style={styles.formSection}>
          {/* Текущий пароль */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Текущий пароль</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
              <TextInput
                placeholder="Введите текущий пароль"
                placeholderTextColor={TEXT_MUTED}
                secureTextEntry={!showCurrentPassword}
                autoComplete="password"
                value={formData.currentPassword}
                onChangeText={(value) => updateFormData('currentPassword', value)}
                style={styles.textInput}
              />
              <TouchableOpacity 
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                style={styles.passwordToggle}
              >
                <Ionicons 
                  name={showCurrentPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color={TEXT_MUTED} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Новый пароль */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Новый пароль</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock-outline" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
              <TextInput
                placeholder="Минимум 6 символов"
                placeholderTextColor={TEXT_MUTED}
                secureTextEntry={!showNewPassword}
                autoComplete="password-new"
                value={formData.newPassword}
                onChangeText={(value) => updateFormData('newPassword', value)}
                style={styles.textInput}
              />
              <TouchableOpacity 
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.passwordToggle}
              >
                <Ionicons 
                  name={showNewPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color={TEXT_MUTED} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Подтверждение пароля */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Подтвердите новый пароль</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock-outline" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
              <TextInput
                placeholder="Повторите новый пароль"
                placeholderTextColor={TEXT_MUTED}
                secureTextEntry={!showConfirmPassword}
                autoComplete="password-new"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                style={styles.textInput}
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.passwordToggle}
              >
                <Ionicons 
                  name={showConfirmPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color={TEXT_MUTED} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Рекомендации */}
        <View style={styles.recommendationsSection}>
          <ThemedText type="heading3" style={styles.recommendationsTitle}>
            Рекомендации по паролю:
          </ThemedText>
          <View style={styles.recommendationItem}>
            <MaterialIcons name="check-circle" size={16} color={SUCCESS} />
            <Text style={styles.recommendationText}>Минимум 6 символов</Text>
          </View>
          <View style={styles.recommendationItem}>
            <MaterialIcons name="check-circle" size={16} color={SUCCESS} />
            <Text style={styles.recommendationText}>Используйте буквы и цифры</Text>
          </View>
          <View style={styles.recommendationItem}>
            <MaterialIcons name="check-circle" size={16} color={SUCCESS} />
            <Text style={styles.recommendationText}>Избегайте простых комбинаций</Text>
          </View>
        </View>

        {/* Кнопка изменения пароля */}
        <View style={styles.buttonSection}>
          <Button 
            style={styles.changePasswordButton}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <MaterialIcons name="hourglass-empty" size={20} color={CARD_BG} />
                <Text style={styles.changePasswordButtonText}>Изменение...</Text>
              </View>
            ) : (
              <Text style={styles.changePasswordButtonText}>Изменить пароль</Text>
            )}
          </Button>
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
  placeholder: {
    width: 40,
  },
  
  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  
  // Info section
  infoSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginTop: 16,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 20,
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
    position: 'relative',
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
  passwordToggle: {
    padding: 4,
  },
  
  // Recommendations section
  recommendationsSection: {
    backgroundColor: BG,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 16,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: TEXT_DARK,
    marginLeft: 12,
  },
  
  // Button section
  buttonSection: {
    marginTop: 16,
  },
  changePasswordButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changePasswordButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CARD_BG,
    marginLeft: 8,
    },
}); 

export default function ChangePasswordScreen() {
  return <ChangePasswordScreenContent />;
}

