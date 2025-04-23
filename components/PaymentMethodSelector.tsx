import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Image } from 'react-native';
import { colors } from '@/constants/colors';
import { PaymentMethod } from '@/types';
import { CreditCard, Coins } from 'lucide-react-native';
import { useLanguageStore } from '@/store/language-store';

interface PaymentMethodSelectorProps {
  onSelectMethod: (method: PaymentMethod) => void;
  selectedMethod?: PaymentMethod;
  availableMethods: Array<{
    id: PaymentMethod;
    label: string;
    icon: React.ReactNode;
    qrCodeUrl?: string;
  }>;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onSelectMethod,
  selectedMethod,
  availableMethods,
}) => {
  const { t } = useLanguageStore();
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 375;

  const handleMethodPress = (method: PaymentMethod) => {
    // Add a small delay to prevent touch event conflicts
    setTimeout(() => {
      onSelectMethod(method);
    }, 10);
  };

  if (availableMethods.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, isSmallDevice && styles.titleSmall]}>{t('selectPaymentMethod')}</Text>
        <View style={styles.noMethodsContainer}>
          <Text style={styles.noMethodsText}>{t('noPaymentMethodsAvailable')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isSmallDevice && styles.titleSmall]}>{t('selectPaymentMethod')}</Text>
      
      <View style={styles.methodsContainer}>
        {availableMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodButton,
              selectedMethod === method.id && styles.selectedButton,
            ]}
            onPress={() => handleMethodPress(method.id)}
            activeOpacity={0.7}
          >
            <View style={styles.methodContent}>
              {method.icon}
              <Text 
                style={[
                  styles.methodText,
                  isSmallDevice && styles.methodTextSmall,
                  selectedMethod === method.id && styles.selectedText,
                ]}
              >
                {method.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {selectedMethod && availableMethods.find(m => m.id === selectedMethod)?.qrCodeUrl && (
        <View style={styles.qrCodeContainer}>
          <Text style={styles.qrCodeLabel}>{t('scanQRCodeToPay')}</Text>
          <Image 
            source={{ uri: availableMethods.find(m => m.id === selectedMethod)?.qrCodeUrl }}
            style={styles.qrCodeImage}
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: '4%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: colors.textLight,
  },
  titleSmall: {
    fontSize: 16,
  },
  methodsContainer: {
    gap: 12,
  },
  methodButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  methodText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textLight,
  },
  methodTextSmall: {
    fontSize: 14,
  },
  selectedText: {
    color: colors.textDark,
  },
  noMethodsContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  noMethodsText: {
    color: colors.textLight,
    fontSize: 14,
    textAlign: 'center',
  },
  qrCodeContainer: {
    marginTop: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  qrCodeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textLight,
    marginBottom: 16,
    textAlign: 'center',
  },
  qrCodeImage: {
    width: 200,
    height: 200,
    backgroundColor: colors.card,
    borderRadius: 8,
  },
});