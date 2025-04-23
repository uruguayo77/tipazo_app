import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, useWindowDimensions, StatusBar, Alert } from 'react-native';
import { router, useLocalSearchParams, useRootNavigationState } from 'expo-router';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { PaymentMethodSelector } from '@/components/PaymentMethodSelector';
import { useTipsStore } from '@/store/tips-store';
import { PaymentMethod, Worker } from '@/types';
import { ArrowLeft, CheckCircle, CreditCard, Coins } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useLanguageStore } from '@/store/language-store';

// Mock function to get worker details - in a real app, this would be an API call
const getWorkerDetails = async (workerId: string): Promise<Worker | null> => {
  // This is a mock implementation - in a real app, you would fetch this from your backend
  return {
    id: workerId,
    name: 'John Doe',
    email: 'john@example.com',
    userType: 'worker',
    createdAt: new Date().toISOString(),
    totalEarnings: 0,
    qrCode: 'https://example.com/qrcode',
    // These fields would be populated from the real worker's profile
    walletAddress: 'abc123xyz',
    cryptoType: 'USDT',
    paymentQrUrl: 'https://example.com/payment-qr',
    phoneNumber: '123456789',
    bankAccount: {
      accountNumber: '987654321',
      routingNumber: 'V12345678', // Used for Cédula de Identidad
      bankName: 'Banco de Venezuela',
    },
  };
};

export default function PaymentScreen() {
  const params = useLocalSearchParams<{ 
    workerId: string; 
    name: string; 
    occupation: string;
    amount: string;
    comment?: string;
    rating?: string;
  }>;
  
  const { workerId, name, amount, comment, rating } = params;
  const { sendTip, isLoading } = useTipsStore();
  const rootNavigationState = useRootNavigationState();
  const { t } = useLanguageStore();
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 375;
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [workerDetails, setWorkerDetails] = useState<Worker | null>(null);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<Array<{
    id: PaymentMethod;
    label: string;
    icon: React.ReactNode;
    qrCodeUrl?: string;
  }>>([]);
  
  useEffect(() => {
    const fetchWorkerDetails = async () => {
      if (workerId) {
        try {
          const details = await getWorkerDetails(workerId);
          setWorkerDetails(details);
          
          // Determine available payment methods based on worker's profile
          if (details) {
            const methods = [];
            
            // Check if Pago Móvil is available
            const hasPagoMovil = !!(
              (details.bankAccount?.routingNumber && details.phoneNumber) || 
              details.paymentQrUrl
            );
            
            if (hasPagoMovil) {
              methods.push({
                id: 'card' as PaymentMethod,
                label: 'Pago Móvil',
                icon: <CreditCard size={isSmallDevice ? 20 : 24} color={paymentMethod === 'card' ? colors.textDark : colors.textLight} />,
                qrCodeUrl: details.paymentQrUrl,
              });
            }
            
            // Check if USDT is available
            if (details.cryptoType === 'USDT' && details.walletAddress) {
              methods.push({
                id: 'usdt' as PaymentMethod,
                label: 'USDT',
                icon: <Coins size={isSmallDevice ? 20 : 24} color={paymentMethod === 'usdt' ? colors.textDark : colors.textLight} />,
              });
            }
            
            // Check if TON is available
            if (details.cryptoType === 'TON' && details.walletAddress) {
              methods.push({
                id: 'ton' as PaymentMethod,
                label: 'TON',
                icon: <Coins size={isSmallDevice ? 20 : 24} color={paymentMethod === 'ton' ? colors.textDark : colors.textLight} />,
              });
            }
            
            setAvailablePaymentMethods(methods);
            
            // If only one method is available, select it automatically
            if (methods.length === 1) {
              setPaymentMethod(methods[0].id);
            }
          }
        } catch (error) {
          console.error('Error fetching worker details:', error);
          Alert.alert('Error', 'No se pudieron cargar los detalles del trabajador');
        }
      }
    };
    
    fetchWorkerDetails();
  }, [workerId, isSmallDevice]);
  
  const handleBack = () => {
    if (isProcessing || isComplete) return;
    
    // Add a small delay to prevent touch event conflicts
    setTimeout(() => {
      if (rootNavigationState?.key) {
        router.back();
      }
    }, 50);
  };

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  const handlePayment = async () => {
    if (!paymentMethod || !workerId || !amount) {
      Alert.alert('Error', 'Por favor selecciona un método de pago');
      return;
    }
    
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptics error:', error);
      }
    }
    
    setIsProcessing(true);
    
    try {
      const tipAmount = parseFloat(amount);
      const tipRating = rating ? parseInt(rating, 10) : undefined;
      
      await sendTip(workerId, tipAmount, paymentMethod, comment, tipRating);
      
      setIsComplete(true);
      
      // Navigate to confirmation after a short delay
      setTimeout(() => {
        if (rootNavigationState?.key) {
          router.push({
            pathname: '/(client)/confirmation',
            params: { 
              workerId, 
              name, 
              amount,
            }
          });
        }
      }, 1500);
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'El pago falló. Por favor, inténtalo de nuevo.');
      setIsProcessing(false);
    }
  };

  return (
    <>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={[
              styles.backButton,
              (isProcessing || isComplete) && styles.disabledButton
            ]} 
            onPress={handleBack}
            disabled={isProcessing || isComplete}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={colors.textLight} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isSmallDevice && styles.headerTitleSmall]}>{t('payment')}</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.content}>
          {isComplete ? (
            <View style={styles.successContainer}>
              <View style={styles.successIconContainer}>
                <CheckCircle size={isSmallDevice ? 48 : 64} color={colors.success} />
              </View>
              <Text style={[styles.successTitle, isSmallDevice && styles.successTitleSmall]}>{t('paymentSuccessful')}</Text>
              <Text style={styles.successMessage}>
                Tu propina de ${amount} ha sido enviada a {name}.
              </Text>
            </View>
          ) : isProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.processingText}>{t('processingPayment')}</Text>
            </View>
          ) : (
            <>
              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Cantidad de propina</Text>
                <Text style={[styles.amount, isSmallDevice && styles.amountSmall]}>${amount}</Text>
                <Text style={styles.recipient}>para {name}</Text>
              </View>
              
              <PaymentMethodSelector
                onSelectMethod={handleSelectPaymentMethod}
                selectedMethod={paymentMethod}
                availableMethods={availablePaymentMethods}
              />
            </>
          )}
        </View>
        
        {!isProcessing && !isComplete && (
          <View style={styles.footer}>
            <Button
              title={t('payNow')}
              onPress={handlePayment}
              disabled={!paymentMethod || isLoading || availablePaymentMethods.length === 0}
              isLoading={isLoading}
            />
            
            {availablePaymentMethods.length === 0 && (
              <Text style={styles.noMethodsWarning}>
                {t('workerHasNoPaymentMethods')}
              </Text>
            )}
          </View>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4%',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textLight,
  },
  headerTitleSmall: {
    fontSize: 16,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: '4%',
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: '8%',
  },
  amountLabel: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 8,
  },
  amount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 8,
  },
  amountSmall: {
    fontSize: 36,
  },
  recipient: {
    fontSize: 16,
    color: colors.textLight,
  },
  footer: {
    padding: '4%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    fontSize: 18,
    color: colors.textLight,
    marginTop: 16,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '6%',
  },
  successIconContainer: {
    marginBottom: '6%',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 16,
    textAlign: 'center',
  },
  successTitleSmall: {
    fontSize: 20,
  },
  successMessage: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  noMethodsWarning: {
    marginTop: 12,
    color: colors.warning,
    textAlign: 'center',
    fontSize: 14,
  },
});