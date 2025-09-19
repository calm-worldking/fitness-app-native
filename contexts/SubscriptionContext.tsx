import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface SubscriptionDto {
  id: string;
  planId: string;
  userId: string;
  status: string;
  period: string;
  price: number;
  startDate: string;
  endDate: string;
  autoRenewal: boolean;
  cancelledAt?: string;
  frozenUntil?: string;
  createdAt: string;
  updatedAt: string;
  peopleCount: number;
  isOwner: boolean;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  familyMembers: FamilyMemberDto[];
  pendingInvitations: any[];
  plan: {
    id: string;
    name: string;
    description: string;
    features: string[];
  };
}

interface FamilyMemberDto {
  id: string;
  subscriptionId: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  joinedAt: string;
  lastActivity?: string;
}

interface PaymentDto {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  paymentMethod: string;
  createdAt: string;
  paidAt?: string;
}

interface SubscriptionContextType {
  activeSubscription: SubscriptionDto | null;
  familyMembers: FamilyMemberDto[];
  paymentHistory: PaymentDto[];
  loading: boolean;
  loadSubscriptionData: () => Promise<void>;
  setActiveSubscription: (subscription: SubscriptionDto | null) => void;
  addFamilyMember: (memberData: { name: string; email: string; phone?: string }) => Promise<void>;
  removeFamilyMember: (memberId: string) => Promise<void>;
  freezeSubscription: (days: number) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  purchaseSubscription: (planId: string, period: 'monthly' | 'yearly', peopleCount?: number) => Promise<SubscriptionDto>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
  userId?: string;
}

export function SubscriptionProvider({ children, userId }: SubscriptionProviderProps) {
  const [activeSubscription, setActiveSubscription] = useState<SubscriptionDto | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberDto[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentDto[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSubscriptionData = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      console.log('🔄 Loading subscription data for user:', userId);
      
      const [subscriptionData, paymentData] = await Promise.all([
        api.getMySubscriptions(),
        api.getPaymentHistory({ take: 10 })
      ]);

      console.log('📊 Subscription data received:', JSON.stringify(subscriptionData, null, 2));
      console.log('💳 Payment data received:', JSON.stringify(paymentData, null, 2));

      // Обрабатываем новые данные из API
      if (subscriptionData?.data?.activeSubscription) {
        console.log('✅ Setting active subscription:', subscriptionData.data.activeSubscription.id);
        setActiveSubscription(subscriptionData.data.activeSubscription);
        
        // Устанавливаем участников семьи из активной подписки
        if (subscriptionData.data.activeSubscription.familyMembers) {
          console.log('👥 Setting family members:', subscriptionData.data.activeSubscription.familyMembers.length);
          setFamilyMembers(subscriptionData.data.activeSubscription.familyMembers);
        } else {
          console.log('❌ No family members found in active subscription');
          setFamilyMembers([]);
        }
      } else {
        console.log('❌ No active subscription found');
        setActiveSubscription(null);
        setFamilyMembers([]);
      }

      if (paymentData?.payments) {
        setPaymentHistory(paymentData.payments);
      } else {
        setPaymentHistory([]);
      }
    } catch (error) {
      console.log('❌ Failed to load subscription data:', error);
      // Если ошибка авторизации, не сбрасываем данные
      if (error.message && error.message.includes('Unauthorized')) {
        console.log('🚫 Authorization failed, keeping existing data');
        return;
      }
      setActiveSubscription(null);
      setFamilyMembers([]);
      setPaymentHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const addFamilyMember = async (memberData: { name: string; email: string; phone?: string }) => {
    if (!activeSubscription) return;

    try {
      await api.addFamilyMember(activeSubscription.id, memberData);
      await loadSubscriptionData();
    } catch (error) {
      console.log('Failed to add family member:', error);
      throw error;
    }
  };

  const removeFamilyMember = async (memberId: string) => {
    try {
      await api.removeFamilyMember(memberId);
      await loadSubscriptionData();
    } catch (error) {
      console.log('Failed to remove family member:', error);
      throw error;
    }
  };

  const freezeSubscription = async (days: number) => {
    if (!activeSubscription) return;

    try {
      await api.freezeSubscription(activeSubscription.id, days);
      await loadSubscriptionData();
    } catch (error) {
      console.log('Failed to freeze subscription:', error);
      throw error;
    }
  };

  const cancelSubscription = async () => {
    if (!activeSubscription) {
      console.log('❌ No active subscription to cancel');
      return;
    }

    try {
      console.log('🔄 Cancelling subscription:', activeSubscription.id);
      await api.cancelSubscription(activeSubscription.id);
      console.log('✅ Subscription cancelled successfully');
      setActiveSubscription(null);
      await loadSubscriptionData();
    } catch (error) {
      console.log('❌ Failed to cancel subscription:', error);
      throw error;
    }
  };

  const purchaseSubscription = async (planId: string, period: 'monthly' | 'yearly', peopleCount?: number) => {
    try {
      const result = await api.purchaseSubscription(planId, period, peopleCount) as SubscriptionDto;
      await loadSubscriptionData();
      return result;
    } catch (error) {
      console.log('Failed to purchase subscription:', error);
      throw error;
    }
  };

  // Убираем автоматическую загрузку данных подписки
  // Данные будут загружаться только при необходимости (например, при pull-to-refresh)
  useEffect(() => {
    if (!userId) {
      setActiveSubscription(null);
      setFamilyMembers([]);
      setPaymentHistory([]);
    }
  }, [userId]);

  const value: SubscriptionContextType = {
    activeSubscription: activeSubscription || null,
    familyMembers: familyMembers || [],
    paymentHistory: paymentHistory || [],
    loading: loading || false,
    loadSubscriptionData,
    setActiveSubscription,
    addFamilyMember,
    removeFamilyMember,
    freezeSubscription,
    cancelSubscription,
    purchaseSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
