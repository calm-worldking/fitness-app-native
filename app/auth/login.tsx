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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    
    if (error) {
      Alert.alert('Ошибка входа', error.message);
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('Скоро', `Вход через ${provider} будет доступен в следующих версиях`);
  };

  const handleForgotPassword = () => {
    Alert.alert('Восстановление пароля', 'Функция восстановления пароля будет доступна скоро');
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
            Добро пожаловать!
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Войдите в аккаунт, чтобы продолжить тренировки
          </ThemedText>
        </View>

        {/* Форма входа */}
        <View style={styles.formSection}>
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
                value={email}
                onChangeText={setEmail}
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
                placeholder="Введите пароль"
                placeholderTextColor={TEXT_MUTED}
                secureTextEntry={!showPassword}
                autoComplete="password"
                value={password}
                onChangeText={setPassword}
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

          {/* Забыли пароль */}
          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
            <ThemedText style={styles.forgotPasswordText}>
              Забыли пароль?
            </ThemedText>
          </TouchableOpacity>

          {/* Кнопка входа */}
          <Button 
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <MaterialIcons name="hourglass-empty" size={20} color={CARD_BG} />
                <ThemedText style={styles.loginButtonText}>Вход...</ThemedText>
              </View>
            ) : (
              <ThemedText style={styles.loginButtonText}>Войти</ThemedText>
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
            onPress={() => handleSocialLogin('Google')}
          >
            <MaterialIcons name="login" size={20} color={TEXT_DARK} />
            <ThemedText style={styles.socialButtonText}>Войти через Google</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialLogin('Apple')}
          >
            <MaterialIcons name="smartphone" size={20} color={TEXT_DARK} />
            <ThemedText style={styles.socialButtonText}>Войти через Apple</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Регистрация */}
        <View style={styles.registerSection}>
          <ThemedText style={styles.registerText}>
            Нет аккаунта?{' '}
          </ThemedText>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <ThemedText style={styles.registerLink}>
              Зарегистрироваться
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Дополнительная информация */}
        <View style={styles.infoSection}>
          <View style={styles.benefitItem}>
            <MaterialIcons name="family-restroom" size={20} color={PRIMARY} />
            <ThemedText style={styles.benefitText}>
              Семейная подписка до 4 человек
            </ThemedText>
          </View>
          
          <View style={styles.benefitItem}>
            <MaterialIcons name="fitness-center" size={20} color={SECONDARY} />
            <ThemedText style={styles.benefitText}>
              Безлимитный доступ ко всем залам
            </ThemedText>
          </View>
          
          <View style={styles.benefitItem}>
            <MaterialIcons name="analytics" size={20} color={SUCCESS} />
            <ThemedText style={styles.benefitText}>
              Отслеживание прогресса всей семьи
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
    paddingVertical: 32,
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
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: PRIMARY,
    fontWeight: '600',
  },
  
  // Login button
  loginButton: {
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
  loginButtonText: {
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
    marginBottom: 32,
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
  
  // Register section
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  registerText: {
    fontSize: 16,
    color: TEXT_MUTED,
  },
  registerLink: {
    fontSize: 16,
    color: PRIMARY,
    fontWeight: '600',
  },
  
  // Info section
  infoSection: {
    backgroundColor: BG,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 14,
    color: TEXT_DARK,
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
}); 