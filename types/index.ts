export type UserType = 'worker' | 'client';

export type PaymentMethod = 'card' | 'usdt' | 'ton';

export type CryptoCurrency = 'USDT' | 'USDC' | 'BITCOIN' | 'ETHEREUM' | 'TRX' | 'TON';

export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  userType: UserType;
  createdAt: string;
}

export interface Worker extends User {
  userType: 'worker';
  bio?: string;
  occupation?: string;
  totalEarnings: number;
  qrCode: string;
  walletAddress?: string;
  cryptoType?: CryptoCurrency;
  paymentQrUrl?: string;
  phoneNumber?: string;
  bankAccount?: {
    accountNumber: string;
    routingNumber: string; // Used for Cédula de Identidad
    bankName: string;
  };
}

export interface Tip {
  id: string;
  amount: number;
  workerId: string;
  clientId?: string;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'completed' | 'failed';
  comment?: string;
  rating?: number;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  workerId: string;
  amount: number;
  destination: 'wallet' | 'bank';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}