import { Logo } from '@/components/Logo';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
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
import { useUser } from '../_layout';

// const { width: screenWidth } = Dimensions.get('window');

// Брендовые цвета
const PRIMARY = '#FF6246';
const SECONDARY = '#FF8843';
const BG = '#FFE7D8';
const CARD_BG = '#FFFFFF';
const TEXT_DARK = '#000000';
const TEXT_MUTED = '#737373';
const SUCCESS = '#4CAF50';
// const ERROR = '#FF3B30';

function LoginScreenContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { signIn } = useUser();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);
    try {
      const userData = await api.login(email, password);
      signIn(userData);
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Ошибка', error.message || 'Произошла ошибка при входе');
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
          <Text style={styles.subtitle}>
            Войдите в аккаунт, чтобы продолжить тренировки
          </Text>
        </View>

        {/* Форма входа */}
        <View style={styles.formSection}>
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
                value={email}
                onChangeText={setEmail}
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


          {/* Кнопка входа */}
          <Button 
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <MaterialIcons name="hourglass-empty" size={20} color={CARD_BG} />
                <Text style={styles.loginButtonText}>Вход...</Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>Войти</Text>
            )}
          </Button>
        </View>


        {/* Регистрация */}
        <View style={styles.registerSection}>
          <Text style={styles.registerText}>
            Нет аккаунта?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.registerLink}>
              Зарегистрироваться
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
}); 

export default function LoginScreen() {
  return <LoginScreenContent />;
}
