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
        const { data, error } = await supabase.auth.getSession();
        if (error) setErrorMsg(error.message);
        setUser(data?.session?.user ?? null);
        setLoading(false);
      } catch (e: any) {
        setErrorMsg(e.message || 'Unknown error');
        setLoading(false);
      }
    };
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
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

  if (errorMsg) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#FF6246" />
      </View>
    );
  }

  return (
    <UserContext.Provider value={{ user, loading, signOut }}>
      <Slot />
    </UserContext.Provider>
  );
}
