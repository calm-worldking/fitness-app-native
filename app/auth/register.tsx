import { Logo } from '@/components/Logo';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
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

const { width: screenWidth } = Dimensions.get('window');

// Брендовые цвета
const PRIMARY = '#FF6246';
const SECONDARY = '#FF8843';
const BG = '#FFE7D8';
const CARD_BG = '#FFFFFF';
const TEXT_DARK = '#000000';
const TEXT_MUTED = '#737373';
const SUCCESS = '#4CAF50';
const ERROR = '#FF3B30';

function RegisterScreenContent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите ваше имя');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите email');
      return false;
    }
    // Улучшенная валидация email - более строгая
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Ошибка', 'Пожалуйста, введите корректный email адрес (например: user@example.com)');
      return false;
    }
    // Дополнительная проверка на реалистичность
    if (formData.email.length < 5 || formData.email.split('@')[0].length < 2) {
      Alert.alert('Ошибка', 'Email адрес слишком короткий');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите номер телефона');
      return false;
    }
    // Валидация телефона (поддерживает различные форматы)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      Alert.alert('Ошибка', 'Пожалуйста, введите корректный номер телефона');
      return false;
    }
    // Улучшенная валидация пароля
    if (formData.password.length < 8) {
      Alert.alert('Ошибка', 'Пароль должен содержать минимум 8 символов');
      return false;
    }
    // Запрещаем пробелы в пароле
    if (formData.password.includes(' ')) {
      Alert.alert('Ошибка', 'Пароль не должен содержать пробелы');
      return false;
    }
    // Проверяем сложность пароля
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      Alert.alert('Ошибка', 'Пароль должен содержать заглавные и строчные буквы, а также цифры');
      return false;
    }
    // Дополнительная проверка на специальные символы (рекомендуется)
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
      Alert.alert('Ошибка', 'Пароль должен содержать хотя бы один специальный символ (!@#$%^&* и т.д.)');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return false;
    }
    if (!agreedToTerms) {
      Alert.alert('Ошибка', 'Пожалуйста, согласитесь с условиями использования');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await api.register(formData.name, formData.email, formData.phone, formData.password);
      // После успешной регистрации перенаправляем на страницу входа
      Alert.alert('Успех!', 'Регистрация прошла успешно! Теперь вы можете войти в систему.', [
        { text: 'ОК', onPress: () => router.replace('/auth/login') }
      ])
    } catch (e: any) {
      Alert.alert('Ошибка регистрации', e?.message || 'Не удалось создать аккаунт');
    } finally {
      setLoading(false);
    }
  };


  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar backgroundColor={CARD_BG} barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={TEXT_DARK} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Логотип и заголовок */}
        <View style={styles.logoSection}>
          <Logo width={160} height={48} />
          <ThemedText type="heading1" style={styles.title}>
            Создать аккаунт
          </ThemedText>
          <Text style={styles.subtitle}>
            Присоединяйтесь к семье здорового образа жизни
          </Text>
        </View>

        {/* Форма регистрации */}
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
            <Text style={styles.inputLabel}>Номер телефона</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="phone" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
              <TextInput
                placeholder="+7 (999) 123-45-67"
                placeholderTextColor={TEXT_MUTED}
                keyboardType="phone-pad"
                autoComplete="tel"
                value={formData.phone}
                onChangeText={(value) => updateFormData('phone', value)}
                style={styles.textInput}
              />
            </View>
          </View>

          {/* Пароль */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Пароль</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
              <TextInput
                placeholder="8+ символов, буквы, цифры, спец. символы"
                placeholderTextColor={TEXT_MUTED}
                secureTextEntry={!showPassword}
                autoComplete="password-new"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                style={[styles.textInput, { paddingRight: 50 }]}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                <Ionicons 
                  name={showPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color={TEXT_MUTED} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Подтверждение пароля */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Подтвердите пароль</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock-outline" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
              <TextInput
                placeholder="Повторите пароль"
                placeholderTextColor={TEXT_MUTED}
                secureTextEntry={!showConfirmPassword}
                autoComplete="password-new"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                style={[styles.textInput, { paddingRight: 50 }]}
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

          {/* Соглашение */}
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms && (
                <MaterialIcons name="check" size={16} color={CARD_BG} />
              )}
            </View>
            <View style={styles.checkboxText}>
              <Text style={styles.termsText}>
                Я согласен с{' '}
                <Text style={styles.termsLink}>Условиями использования</Text>
                {' '}и{' '}
                <Text style={styles.termsLink}>Политикой конфиденциальности</Text>
              </Text>
            </View>
          </TouchableOpacity>

          {/* Кнопка регистрации */}
          <Button 
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <MaterialIcons name="hourglass-empty" size={20} color={CARD_BG} />
                <Text style={styles.registerButtonText}>Создание...</Text>
              </View>
            ) : (
              <Text style={styles.registerButtonText}>Создать аккаунт</Text>
            )}
          </Button>
        </View>


        {/* Вход */}
        <View style={styles.loginSection}>
          <Text style={styles.loginText}>
            Уже есть аккаунт?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginLink}>
              Войти
            </Text>
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
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  
  // Logo section
  logoSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Form section
  formSection: {
    marginBottom: 24,
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
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  
  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: BG,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  checkboxText: {
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 20,
  },
  termsLink: {
    color: PRIMARY,
    fontWeight: '600',
  },
  
  // Register button
  registerButton: {
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
  registerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CARD_BG,
    marginLeft: 8,
  },
  
  // Login section
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  loginText: {
    fontSize: 16,
    color: TEXT_MUTED,
  },
  loginLink: {
    fontSize: 16,
    color: PRIMARY,
    fontWeight: '600',
  },
}); 

export default function RegisterScreen() {
  return <RegisterScreenContent />;
}
