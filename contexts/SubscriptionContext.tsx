import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface SubscriptionDto {
  id: string;
  planId: string;
  userId: string;
  status: string;
  planType: string;
  period: string;
  peopleCount: number;
  price: number;
  startDate: string;
  endDate: string;
  autoRenewal: boolean;
  createdAt: string;
  updatedAt: string;
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

      if (subscriptionData?.activeSubscription) {
        console.log('✅ Setting active subscription:', subscriptionData.activeSubscription.id);
        setActiveSubscription(subscriptionData.activeSubscription);
      } else {
        console.log('❌ No active subscription found');
        setActiveSubscription(null);
      }

      if (subscriptionData?.familyMembers) {
        setFamilyMembers(subscriptionData.familyMembers);
      } else {
        setFamilyMembers([]);
      }

      if (paymentData?.payments) {
        setPaymentHistory(paymentData.payments);
      } else {
        setPaymentHistory([]);
      }
    } catch (error) {
      console.log('❌ Failed to load subscription data:', error);
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
    if (!activeSubscription) return;

    try {
      await api.removeFamilyMember(activeSubscription.id, memberId);
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

  // Загружаем данные при изменении userId
  useEffect(() => {
    if (userId) {
      loadSubscriptionData();
    } else {
      setActiveSubscription(null);
      setFamilyMembers([]);
      setPaymentHistory([]);
    }
  }, [userId]);

  const value: SubscriptionContextType = {
    activeSubscription,
    familyMembers,
    paymentHistory,
    loading,
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
