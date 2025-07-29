import { LoadingScreen } from '@/components/LoadingScreen';
import { supabase } from '@/lib/supabase';
import { Slot, useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

// Тип пользователя
interface UserContextType {
  user: any;
  loading: boolean;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function useUser() {
  return useContext(UserContext);
}

export default function RootLayout() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const getSession = async () => {
      try {
        // Проверяем, что Supabase доступен
        if (!supabase) {
          console.warn('Supabase not available, running in offline mode');
          setUser(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Supabase auth error:', error.message);
          setErrorMsg(error.message);
        }
        setUser(data?.session?.user ?? null);
        setLoading(false);
      } catch (e: any) {
        console.warn('Supabase initialization error:', e.message);
        setErrorMsg(e.message || 'Unknown error');
        setLoading(false);
      }
    };
    getSession();

    // Безопасно подписываемся на изменения аутентификации
    try {
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      return () => {
        listener.subscription.unsubscribe();
      };
    } catch (e) {
      console.warn('Failed to set up auth listener:', e);
    }
  }, []);

  const signOut = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Показываем загрузочный экран
  if (showSplash) {
    return <LoadingScreen onFinish={handleSplashFinish} />;
  }

  // Показываем индикатор загрузки для аутентификации
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#FF6246" />
      </View>
    );
  }

  // Даже если есть ошибка с Supabase, продолжаем работу приложения
  if (errorMsg) {
    console.warn('Supabase error, continuing in offline mode:', errorMsg);
  }

  return (
    <UserContext.Provider value={{ user, loading, signOut }}>
      <Slot />
    </UserContext.Provider>
  );
}
