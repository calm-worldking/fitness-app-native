import { useUser } from '@/app/_layout';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Если требуется аутентификация, но пользователь не авторизован
        console.log('🔒 User not authenticated, redirecting to login...');
        router.replace('/auth/login');
      } else if (!requireAuth && user) {
        // Если пользователь уже авторизован, но находится на страницах входа/регистрации
        console.log('✅ User already authenticated, redirecting to home...');
        router.replace('/');
      }
    }
  }, [user, loading, requireAuth]);

  // Показываем загрузку пока проверяем аутентификацию
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#FF6246" />
      </View>
    );
  }

  // Если требуется аутентификация и пользователь не авторизован, не показываем контент
  if (requireAuth && !user) {
    return null;
  }

  // Если не требуется аутентификация и пользователь авторизован, не показываем контент
  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
}

