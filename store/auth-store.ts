import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Worker, CryptoCurrency } from '@/types';

interface AuthState {
  user: User | Worker | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<Worker>, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<Worker> & { 
    cryptoType?: CryptoCurrency;
    bankName?: string;
    cedula?: string;
    phoneNumber?: string;
    paymentQrUrl?: string;
  }) => Promise<void>;
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call
          const user = await mockApiCall<Worker>({
            id: '1',
            name: 'John Doe',
            email,
            userType: 'worker',
            createdAt: new Date().toISOString(),
            totalEarnings: 0,
            qrCode: 'https://example.com/qrcode',
          });
          
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Login failed", 
            isLoading: false 
          });
        }
      },
      
      register: async (userData: Partial<Worker>, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call
          const user = await mockApiCall<Worker>({
            id: Date.now().toString(),
            name: userData.name || '',
            email: userData.email || '',
            userType: 'worker',
            createdAt: new Date().toISOString(),
            totalEarnings: 0,
            qrCode: 'https://example.com/qrcode',
            ...userData,
          });
          
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Registration failed", 
            isLoading: false 
          });
        }
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      updateProfile: async (userData: Partial<Worker> & { 
        cryptoType?: CryptoCurrency;
        bankName?: string;
        cedula?: string;
        phoneNumber?: string;
        paymentQrUrl?: string;
      }) => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call
          await mockApiCall(null, 500);
          
          set((state) => {
            if (!state.user) return { isLoading: false };
            
            // Handle payment information updates
            const updatedUser = { ...state.user, ...userData };
            
            // Update bank information
            if (userData.bankName || userData.cedula) {
              updatedUser.bankAccount = {
                ...(updatedUser.bankAccount || {}),
                bankName: userData.bankName || updatedUser.bankAccount?.bankName || '',
                routingNumber: userData.cedula || updatedUser.bankAccount?.routingNumber || '',
                accountNumber: updatedUser.bankAccount?.accountNumber || '',
              };
            }
            
            // Update phone number
            if (userData.phoneNumber) {
              updatedUser.phoneNumber = userData.phoneNumber;
            }
            
            // Update payment QR code
            if (userData.paymentQrUrl) {
              updatedUser.paymentQrUrl = userData.paymentQrUrl;
            }
            
            return {
              user: updatedUser,
              isLoading: false
            };
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Profile update failed", 
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);