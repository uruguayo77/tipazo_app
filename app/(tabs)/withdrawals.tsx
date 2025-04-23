import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert, Platform, useWindowDimensions, StatusBar } from 'react-native';
import { useTipsStore } from '@/store/tips-store';
import { useAuthStore } from '@/store/auth-store';
import { colors } from '@/constants/colors';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { WithdrawalRequest } from '@/types';
import { Wallet, Building, ArrowRight, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useLanguageStore } from '@/store/language-store';

export default function WithdrawalsScreen() {
  const { user } = useAuthStore();
  const { tips, withdrawals, fetchTips, fetchWithdrawals, requestWithdrawal, isLoading } = useTipsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const { t } = useLanguageStore();
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 375;

  useEffect(() => {
    if (user) {
      fetchTips(user.id);
      fetchWithdrawals(user.id);
    }
  }, [user]);

  const onRefresh = async () => {
    if (user) {
      setRefreshing(true);
      await Promise.all([
        fetchTips(user.id),
        fetchWithdrawals(user.id)
      ]);
      setRefreshing(false);
    }
  };

  const calculateAvailableBalance = () => {
    const totalTips = tips.reduce((total, tip) => {
      if (tip.status === 'completed') {
        return total + tip.amount;
      }
      return total;
    }, 0);
    
    const totalWithdrawals = withdrawals.reduce((total, withdrawal) => {
      if (withdrawal.status !== 'failed') {
        return total + withdrawal.amount;
      }
      return total;
    }, 0);
    
    return Math.max(0, totalTips - totalWithdrawals);
  };

  const handleWithdraw = () => {
    const availableBalance = calculateAvailableBalance();
    setWithdrawalAmount(availableBalance);
    
    if (availableBalance <= 0) {
      Alert.alert('Sin fondos disponibles', 'No tienes fondos disponibles para retirar.');
      return;
    }
    
    Alert.alert(
      'Retirar fondos',
      `Saldo disponible: $${availableBalance.toFixed(2)}`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'A billetera',
          onPress: () => handleWithdrawalConfirm('wallet'),
        },
        {
          text: 'A banco',
          onPress: () => handleWithdrawalConfirm('bank'),
        },
      ]
    );
  };

  const handleWithdrawalConfirm = async (destination: 'wallet' | 'bank') => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptics error:', error);
      }
    }
    
    if (!user) return;
    
    try {
      await requestWithdrawal(user.id, withdrawalAmount, destination);
      Alert.alert(
        'Retiro solicitado',
        `Tu retiro de $${withdrawalAmount.toFixed(2)} a tu ${destination === 'wallet' ? 'billetera' : 'cuenta bancaria'} ha sido solicitado.`
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo solicitar el retiro. Por favor, inténtalo de nuevo.');
    }
  };

  const renderWithdrawalItem = ({ item }: { item: WithdrawalRequest }) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    };

    const getStatusIcon = () => {
      const iconSize = isSmallDevice ? 14 : 16;
      switch (item.status) {
        case 'completed':
          return <CheckCircle size={iconSize} color={colors.success} />;
        case 'pending':
          return <Clock size={iconSize} color={colors.warning} />;
        case 'failed':
          return <XCircle size={iconSize} color={colors.error} />;
        default:
          return null;
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'completed':
          return 'completado';
        case 'pending':
          return 'pendiente';
        case 'failed':
          return 'fallido';
        default:
          return status;
      }
    };

    return (
      <Card style={styles.withdrawalItem}>
        <View style={styles.withdrawalHeader}>
          <View style={styles.withdrawalInfo}>
            <View style={styles.withdrawalIconContainer}>
              {item.destination === 'wallet' ? (
                <Wallet size={isSmallDevice ? 18 : 20} color={colors.primary} />
              ) : (
                <Building size={isSmallDevice ? 18 : 20} color={colors.primary} />
              )}
            </View>
            <View>
              <Text style={[styles.withdrawalDestination, isSmallDevice && styles.withdrawalDestinationSmall]}>
                A {item.destination === 'wallet' ? 'Billetera' : 'Cuenta Bancaria'}
              </Text>
              <Text style={styles.withdrawalDate}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
          <View style={styles.withdrawalAmount}>
            <Text style={[styles.withdrawalAmountText, isSmallDevice && styles.withdrawalAmountTextSmall]}>${item.amount.toFixed(2)}</Text>
            <View style={styles.withdrawalStatus}>
              {getStatusIcon()}
              <Text style={[
                styles.withdrawalStatusText,
                item.status === 'completed' && styles.completedStatus,
                item.status === 'pending' && styles.pendingStatus,
                item.status === 'failed' && styles.failedStatus,
              ]}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <View style={styles.container}>
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{t('availableBalance')}</Text>
          <Text style={[styles.balanceAmount, isSmallDevice && styles.balanceAmountSmall]}>${calculateAvailableBalance().toFixed(2)}</Text>
          <Button
            title={t('withdrawFunds')}
            onPress={handleWithdraw}
            style={styles.withdrawButton}
            rightIcon={<ArrowRight size={isSmallDevice ? 18 : 20} color={colors.textDark} />}
            disabled={calculateAvailableBalance() <= 0}
          />
        </Card>
        
        <View style={styles.historyContainer}>
          <Text style={[styles.sectionTitle, isSmallDevice && styles.sectionTitleSmall]}>{t('withdrawalHistory')}</Text>
          
          <FlatList
            data={withdrawals}
            keyExtractor={(item) => item.id}
            renderItem={renderWithdrawalItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <EmptyState
                title={t('noWithdrawalsYet')}
                description={t('noWithdrawalsDescription')}
                icon={<Wallet size={48} color={colors.textLight} />}
              />
            }
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: '4%',
  },
  balanceCard: {
    padding: 24,
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 16,
    color: colors.gray[600],
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  balanceAmountSmall: {
    fontSize: 28,
  },
  withdrawButton: {
    width: '100%',
  },
  historyContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: colors.textLight,
  },
  sectionTitleSmall: {
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  withdrawalItem: {
    padding: 16,
    marginBottom: 12,
  },
  withdrawalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  withdrawalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  withdrawalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  withdrawalDestination: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  withdrawalDestinationSmall: {
    fontSize: 14,
  },
  withdrawalDate: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 4,
  },
  withdrawalAmount: {
    alignItems: 'flex-end',
  },
  withdrawalAmountText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  withdrawalAmountTextSmall: {
    fontSize: 16,
  },
  withdrawalStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  withdrawalStatusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  completedStatus: {
    color: colors.success,
  },
  pendingStatus: {
    color: colors.warning,
  },
  failedStatus: {
    color: colors.error,
  },
});