import React from 'react';
import { View, StyleSheet, ViewStyle, useWindowDimensions } from 'react-native';
import { colors } from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'filled';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style,
  variant = 'elevated'
}) => {
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 375;

  const getCardStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return styles.elevatedCard;
      case 'outlined':
        return styles.outlinedCard;
      case 'filled':
        return styles.filledCard;
      default:
        return styles.elevatedCard;
    }
  };

  return (
    <View style={[
      styles.card, 
      getCardStyle(), 
      isSmallDevice && styles.cardSmallDevice,
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  cardSmallDevice: {
    padding: 12,
    marginVertical: 6,
  },
  elevatedCard: {
    backgroundColor: colors.card,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  outlinedCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  filledCard: {
    backgroundColor: colors.gray[100],
  },
});