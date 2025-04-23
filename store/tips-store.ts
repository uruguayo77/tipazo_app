import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tip, PaymentMethod, WithdrawalRequest } from '@/types';

interface TipsState {
  tips: Tip[];
  withdrawals: WithdrawalRequest[];
  isLoading: boolean;
  error: string | null;
  
  // Client actions
  sendTip: (
    workerId: string, 
    amount: number, 
    paymentMethod: PaymentMethod,
    comment?: string,
    rating?: number
  ) => Promise<Tip>;
  
  // Worker actions
  fetchTips: (workerId: string) => Promise<void>;
  requestWithdrawal: (
    workerId: string, 
    amount: number, 
    destination: 'wallet' | 'bank'
  ) => Promise<WithdrawalRequest>;
  fetchWithdrawals: (workerId: string) => Promise<void>;
}

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

// Mock data
const mockTips: Tip[] = [
  {
    id: '1',
    amount: 5,
    workerId: '1',
    clientId: 'anonymous',
    paymentMethod: 'card',
    status: 'completed',
    comment: "Great service!",
    rating: 5,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: '2',
    amount: 10,
    workerId: '1',
    clientId: 'anonymous',
    paymentMethod: 'usdt',
    status: 'completed',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: '3',
    amount: 3,
    workerId: '1',
    clientId: 'anonymous',
    paymentMethod: 'ton',
    status: 'completed',
    comment: "Thanks for the help!",
    rating: 4,
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  },
];

const mockWithdrawals: WithdrawalRequest[] = [
  {
    id: '1',
    workerId: '1',
    amount: 15,
    destination: 'wallet',
    status: 'completed',
    createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
  },
];

export const useTipsStore = create<TipsState>()(
  persist(
    (set, get) => ({
      tips: [],
      withdrawals: [],
      isLoading: false,
      error: null,
      
      sendTip: async (
        workerId: string, 
        amount: number, 
        paymentMethod: PaymentMethod,
        comment?: string,
        rating?: number
      ) => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call
          const newTip: Tip = {
            id: Date.now().toString(),
            amount,
            workerId,
            clientId: 'anonymous',
            paymentMethod,
            status: 'completed',
            comment,
            rating,
            createdAt: new Date().toISOString(),
          };
          
          await mockApiCall(null, 1000);
          
          set((state) => ({
            tips: [...state.tips, newTip],
            isLoading: false,
          }));
          
          return newTip;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to send tip", 
            isLoading: false 
          });
          throw error;
        }
      },
      
      fetchTips: async (workerId: string) => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call
          const tips = await mockApiCall(mockTips, 1000);
          
          set({ tips, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to fetch tips", 
            isLoading: false 
          });
        }
      },
      
      requestWithdrawal: async (
        workerId: string, 
        amount: number, 
        destination: 'wallet' | 'bank'
      ) => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call
          const newWithdrawal: WithdrawalRequest = {
            id: Date.now().toString(),
            workerId,
            amount,
            destination,
            status: 'pending',
            createdAt: new Date().toISOString(),
          };
          
          await mockApiCall(null, 1000);
          
          set((state) => ({
            withdrawals: [...state.withdrawals, newWithdrawal],
            isLoading: false,
          }));
          
          return newWithdrawal;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to request withdrawal", 
            isLoading: false 
          });
          throw error;
        }
      },
      
      fetchWithdrawals: async (workerId: string) => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call
          const withdrawals = await mockApiCall(mockWithdrawals, 1000);
          
          set({ withdrawals, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to fetch withdrawals", 
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'tips-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);