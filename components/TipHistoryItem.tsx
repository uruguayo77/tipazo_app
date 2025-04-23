import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { colors } from '@/constants/colors';
import { Tip } from '@/types';
import { Card } from './Card';
import { CreditCard, Coins, MessageSquare, Star } from 'lucide-react-native';

interface TipHistoryItemProps {
  tip: Tip;
}

export const TipHistoryItem: React.FC<TipHistoryItemProps> = ({ tip }) => {
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 375;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPaymentMethodIcon = () => {
    const iconSize = isSmallDevice ? 14 : 16;
    switch (tip.paymentMethod) {
      case 'card':
        return <CreditCard size={iconSize} color={colors.textLight} />;
      case 'usdt':
      case 'ton':
        return <Coins size={iconSize} color={colors.textLight} />;
      default:
        return null;
    }
  };

  const getPaymentMethodLabel = () => {
    switch (tip.paymentMethod) {
      case 'card':
        return 'Tarjeta de Crédito';
      case 'usdt':
        return 'USDT';
      case 'ton':
        return 'TON';
      default:
        return '';
    }
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, isSmallDevice && styles.amountSmall]}>${tip.amount.toFixed(2)}</Text>
          <Text style={styles.date}>{formatDate(tip.createdAt)}</Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, styles[`${tip.status}Badge`]]}>
            <Text style={styles.statusText}>{
              tip.status === 'completed' ? 'completado' : 
              tip.status === 'pending' ? 'pendiente' : 'fallido'
            }</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          {getPaymentMethodIcon()}
          <Text style={[styles.detailText, isSmallDevice && styles.detailTextSmall]}>{getPaymentMethodLabel()}</Text>
        </View>
        
        {tip.rating && (
          <View style={styles.detailItem}>
            <Star size={isSmallDevice ? 14 : 16} color={colors.warning} fill={colors.warning} />
            <Text style={[styles.detailText, isSmallDevice && styles.detailTextSmall]}>{tip.rating}</Text>
          </View>
        )}
      </View>
      
      {tip.comment && (
        <View style={styles.commentContainer}>
          <MessageSquare size={isSmallDevice ? 14 : 16} color={colors.textLight} />
          <Text style={[styles.comment, isSmallDevice && styles.commentSmall]}>{tip.comment}</Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  amountContainer: {
    flex: 1,
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  amountSmall: {
    fontSize: 18,
  },
  date: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: colors.success + '20',
  },
  pendingBadge: {
    backgroundColor: colors.warning + '20',
  },
  failedBadge: {
    backgroundColor: colors.error + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: 12,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
  },
  detailTextSmall: {
    fontSize: 12,
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  comment: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  commentSmall: {
    fontSize: 12,
    lineHeight: 18,
  },
});