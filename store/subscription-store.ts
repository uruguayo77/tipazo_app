import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

export type SubscriptionStatus = 'none' | 'trial' | 'active' | 'expired';

interface SubscriptionState {
  status: SubscriptionStatus;
  startDate: string | null;
  endDate: string | null;
  trialEndDate: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  startTrial: () => Promise<void>;
  subscribe: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  restoreSubscription: () => Promise<void>;
  checkSubscriptionStatus: () => void;
}

// Helper function to add days to a date
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Mock function to simulate API calls
const mockApiCall = <T>(data: T, delay = 1000, shouldFail = false): Promise<T> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("API call failed"));
      } else {
        resolve(data);
      }
    }, delay);
  });
};

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      status: 'none',
      startDate: null,
      endDate: null,
      trialEndDate: null,
      isLoading: false,
      error: null,
      
      startTrial: async () => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call to start trial
          await mockApiCall(null, 1000);
          
          const now = new Date();
          const trialEndDate = addDays(now, 30); // 30-day trial
          
          set({
            status: 'trial',
            startDate: now.toISOString(),
            trialEndDate: trialEndDate.toISOString(),
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to start trial", 
            isLoading: false 
          });
        }
      },
      
      subscribe: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would integrate with in-app purchases
          // For now, we'll just simulate a successful subscription
          await mockApiCall(null, 1000);
          
          const now = new Date();
          const endDate = addDays(now, 30); // 30-day subscription
          
          set({
            status: 'active',
            startDate: now.toISOString(),
            endDate: endDate.toISOString(),
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to subscribe", 
            isLoading: false 
          });
        }
      },
      
      cancelSubscription: async () => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call to cancel subscription
          await mockApiCall(null, 1000);
          
          // In a real app, the subscription would remain active until the end date
          // For demo purposes, we'll set it to expired immediately
          set({
            status: 'expired',
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to cancel subscription", 
            isLoading: false 
          });
        }
      },
      
      restoreSubscription: async () => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call to restore subscription
          await mockApiCall(null, 1000);
          
          // In a real app, this would check with the app store or payment provider
          // For demo purposes, we'll just set a new subscription
          const now = new Date();
          const endDate = addDays(now, 30);
          
          set({
            status: 'active',
            startDate: now.toISOString(),
            endDate: endDate.toISOString(),
            isLoading: false,
          });
          
          Alert.alert(
            "Suscripción restaurada",
            "Tu suscripción ha sido restaurada exitosamente."
          );
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to restore subscription", 
            isLoading: false 
          });
          
          Alert.alert(
            "Error",
            "No se pudo restaurar la suscripción. Por favor, inténtalo de nuevo."
          );
        }
      },
      
      checkSubscriptionStatus: () => {
        const state = get();
        
        // If no subscription, nothing to check
        if (state.status === 'none') {
          return;
        }
        
        const now = new Date();
        
        // Check if trial has ended
        if (state.status === 'trial' && state.trialEndDate) {
          const trialEnd = new Date(state.trialEndDate);
          if (now > trialEnd) {
            set({ status: 'expired' });
          }
        }
        
        // Check if subscription has ended
        if (state.status === 'active' && state.endDate) {
          const subscriptionEnd = new Date(state.endDate);
          if (now > subscriptionEnd) {
            set({ status: 'expired' });
          }
        }
      },
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);