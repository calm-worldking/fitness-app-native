import { Logo } from '@/components/Logo';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
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

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
    if (!formData.email.includes('@')) {
      Alert.alert('Ошибка', 'Пожалуйста, введите корректный email');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен содержать минимум 6 символов');
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
    const { error } = await supabase.auth.signUp({ 
      email: formData.email, 
      password: formData.password,
      options: {
        data: {
          name: formData.name,
        }
      }
    });
    setLoading(false);
    
    if (error) {
      Alert.alert('Ошибка регистрации', error.message);
    } else {
      Alert.alert(
        'Успех!', 
        'Регистрация прошла успешно! Проверьте email для подтверждения аккаунта.',
        [
          { text: 'ОК', onPress: () => router.replace('/auth/login') }
        ]
      );
    }
  };

  const handleSocialRegister = (provider: string) => {
    Alert.alert('Скоро', `Регистрация через ${provider} будет доступна в следующих версиях`);
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
          <ThemedText style={styles.subtitle}>
            Присоединяйтесь к семье здорового образа жизни
          </ThemedText>
        </View>

        {/* Форма регистрации */}
        <View style={styles.formSection}>
          {/* Имя */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Полное имя</ThemedText>
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
            <ThemedText style={styles.inputLabel}>Email</ThemedText>
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

          {/* Пароль */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Пароль</ThemedText>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
              <TextInput
                placeholder="Минимум 6 символов"
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
            <ThemedText style={styles.inputLabel}>Подтвердите пароль</ThemedText>
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
              <ThemedText style={styles.termsText}>
                Я согласен с{' '}
                <ThemedText style={styles.termsLink}>Условиями использования</ThemedText>
                {' '}и{' '}
                <ThemedText style={styles.termsLink}>Политикой конфиденциальности</ThemedText>
              </ThemedText>
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
                <ThemedText style={styles.registerButtonText}>Создание...</ThemedText>
              </View>
            ) : (
              <ThemedText style={styles.registerButtonText}>Создать аккаунт</ThemedText>
            )}
          </Button>
        </View>

        {/* Разделитель */}
        <View style={styles.dividerSection}>
          <View style={styles.dividerLine} />
          <ThemedText style={styles.dividerText}>или</ThemedText>
          <View style={styles.dividerLine} />
        </View>

        {/* Социальные кнопки */}
        <View style={styles.socialSection}>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialRegister('Google')}
          >
            <MaterialIcons name="login" size={20} color={TEXT_DARK} />
            <ThemedText style={styles.socialButtonText}>Регистрация через Google</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialRegister('Apple')}
          >
            <MaterialIcons name="smartphone" size={20} color={TEXT_DARK} />
            <ThemedText style={styles.socialButtonText}>Регистрация через Apple</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Вход */}
        <View style={styles.loginSection}>
          <ThemedText style={styles.loginText}>
            Уже есть аккаунт?{' '}
          </ThemedText>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <ThemedText style={styles.loginLink}>
              Войти
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Преимущества */}
        <View style={styles.benefitsSection}>
          <ThemedText type="defaultSemiBold" style={styles.benefitsTitle}>
            Что вас ждет:
          </ThemedText>
          
          <View style={styles.benefitItem}>
            <MaterialIcons name="family-restroom" size={20} color={PRIMARY} />
            <ThemedText style={styles.benefitText}>
              Семейная подписка для всей семьи
            </ThemedText>
          </View>
          
          <View style={styles.benefitItem}>
            <MaterialIcons name="fitness-center" size={20} color={SECONDARY} />
            <ThemedText style={styles.benefitText}>
              Доступ к премиум залам по всему городу
            </ThemedText>
          </View>
          
          <View style={styles.benefitItem}>
            <MaterialIcons name="analytics" size={20} color={SUCCESS} />
            <ThemedText style={styles.benefitText}>
              Персональная статистика и достижения
            </ThemedText>
          </View>

          <View style={styles.benefitItem}>
            <MaterialIcons name="groups" size={20} color="#A259FF" />
            <ThemedText style={styles.benefitText}>
              Групповые тренировки и мотивация
            </ThemedText>
          </View>
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
  
  // Divider
  dividerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BG,
  },
  dividerText: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginHorizontal: 16,
  },
  
  // Social buttons
  socialSection: {
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: BG,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
    marginLeft: 12,
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
  
  // Benefits section
  benefitsSection: {
    backgroundColor: BG,
    borderRadius: 16,
    padding: 20,
  },
  benefitsTitle: {
    fontSize: 16,
    color: TEXT_DARK,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: TEXT_DARK,
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
}); 