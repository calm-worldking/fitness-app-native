import { LoadingScreen } from '@/components/LoadingScreen';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { api, clearToken, getToken } from '@/lib/api';
import { notificationService } from '@/lib/notifications';
import { Slot } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

// Тип пользователя
interface UserContextType {
  user: any;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (userData: any) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: false,
  signOut: async () => {},
  signIn: () => {},
});

export function useUser() {
  return useContext(UserContext);
}

export default function RootLayout() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 400);
    return () => clearTimeout(t);
  }, []);

  // Инициализируем сервис уведомлений
  useEffect(() => {
    const initNotifications = async () => {
      try {
        await notificationService.initialize();
        console.log('📱 Notification service initialized');
      } catch (error) {
        console.log('⚠️ Failed to initialize notification service:', error);
      }
    };
    
    initNotifications();
  }, []);

  // Проверяем токен при загрузке приложения
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        if (token) {
          console.log('🔐 Token found, fetching user data...');
          try {
            const response = await api.getCurrentUser();
            setUser(response.user);
            console.log('✅ User data loaded:', response.user);
          } catch {
            console.log('🔐 Invalid token, clearing and continuing as guest');
            // Если токен недействителен, просто очищаем его и продолжаем как гость
            await clearToken();
            setUser(null);
          }
        } else {
          console.log('🔐 No token found, user is not authenticated');
        }
      } catch (error) {
        console.log('🔐 Auth check failed, continuing as guest:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signOut = async () => {
    try {
      await clearToken();
      setUser(null);
      console.log('👋 User signed out');
    } catch (error) {
      console.error('❌ Sign out failed:', error);
    }
  };

  const signIn = (userData: any) => {
    setUser(userData);
    console.log('✅ User signed in:', userData);
  };

  if (showSplash) {
    return <LoadingScreen />;
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#FF6246" />
      </View>
    );
  }

  return (
    <UserContext.Provider value={{ user, loading, signOut, signIn }}>
      <SubscriptionProvider userId={user?.id}>
        <Slot />
      </SubscriptionProvider>
    </UserContext.Provider>
  );
}
