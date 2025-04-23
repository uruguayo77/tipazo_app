import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, useWindowDimensions } from 'react-native';
import { colors } from '@/constants/colors';
import { useLanguageStore } from '@/store/language-store';

interface TipAmountSelectorProps {
  onSelectAmount: (amount: number) => void;
  initialAmount?: number;
}

const predefinedAmounts = [1, 3, 5, 10];

export const TipAmountSelector: React.FC<TipAmountSelectorProps> = ({
  onSelectAmount,
  initialAmount,
}) => {
  const { t } = useLanguageStore();
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 375;
  
  const [selectedAmount, setSelectedAmount] = useState<number | null>(initialAmount || null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const handleSelectAmount = (amount: number) => {
    // Add a small delay to prevent touch event conflicts
    setTimeout(() => {
      setSelectedAmount(amount);
      setIsCustom(false);
      onSelectAmount(amount);
    }, 10);
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setSelectedAmount(numValue);
      onSelectAmount(numValue);
    } else {
      setSelectedAmount(null);
    }
  };

  const handleCustomPress = () => {
    // Add a small delay to prevent touch event conflicts
    setTimeout(() => {
      setIsCustom(true);
      setSelectedAmount(null);
    }, 10);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isSmallDevice && styles.titleSmall]}>{t('selectTipAmount')}</Text>
      
      <View style={styles.amountsContainer}>
        {predefinedAmounts.map((amount) => (
          <TouchableOpacity
            key={amount}
            style={[
              styles.amountButton,
              isSmallDevice && styles.amountButtonSmall,
              selectedAmount === amount && !isCustom && styles.selectedButton,
            ]}
            onPress={() => handleSelectAmount(amount)}
            activeOpacity={0.7}
          >
            <Text 
              style={[
                styles.amountText,
                isSmallDevice && styles.amountTextSmall,
                selectedAmount === amount && !isCustom && styles.selectedText,
              ]}
            >
              ${amount}
            </Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          style={[
            styles.amountButton,
            isSmallDevice && styles.amountButtonSmall,
            isCustom && styles.selectedButton,
          ]}
          onPress={handleCustomPress}
          activeOpacity={0.7}
        >
          <Text 
            style={[
              styles.amountText,
              isSmallDevice && styles.amountTextSmall,
              isCustom && styles.selectedText,
            ]}
          >
            {t('custom')}
          </Text>
        </TouchableOpacity>
      </View>
      
      {isCustom && (
        <View style={styles.customAmountContainer}>
          <Text style={styles.dollarSign}>$</Text>
          <TextInput
            style={styles.customAmountInput}
            value={customAmount}
            onChangeText={handleCustomAmountChange}
            placeholder={t('enterAmount')}
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            keyboardType="decimal-pad"
            autoFocus
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
  amountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amountButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 70,
    alignItems: 'center',
  },
  amountButtonSmall: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 60,
  },
  selectedButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textLight,
  },
  amountTextSmall: {
    fontSize: 14,
  },
  selectedText: {
    color: colors.textDark,
  },
  customAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dollarSign: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textLight,
  },
  customAmountInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 18,
    color: colors.textLight,
  },
});