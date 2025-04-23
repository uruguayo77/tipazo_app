import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, useWindowDimensions, StatusBar } from 'react-native';
import { useTipsStore } from '@/store/tips-store';
import { useAuthStore } from '@/store/auth-store';
import { colors } from '@/constants/colors';
import { TipHistoryItem } from '@/components/TipHistoryItem';
import { EmptyState } from '@/components/EmptyState';
import { Card } from '@/components/Card';
import { SubscriptionBanner } from '@/components/SubscriptionBanner';
import { Tip } from '@/types';
import { DollarSign, TrendingUp, Calendar, Inbox } from 'lucide-react-native';
import { useLanguageStore } from '@/store/language-store';
import { useSubscriptionStore } from '@/store/subscription-store';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { tips, fetchTips, isLoading } = useTipsStore();
  const { status, checkSubscriptionStatus } = useSubscriptionStore();
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useLanguageStore();
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 375;

  useEffect(() => {
    if (user) {
      fetchTips(user.id);
    }
    
    // Check subscription status on component mount
    checkSubscriptionStatus();
  }, [user]);

  const onRefresh = async () => {
    if (user) {
      setRefreshing(true);
      await fetchTips(user.id);
      checkSubscriptionStatus();
      setRefreshing(false);
    }
  };

  const calculateTotalEarnings = () => {
    return tips.reduce((total, tip) => total + tip.amount, 0);
  };

  const calculateTodayEarnings = () => {
    const today = new Date().toDateString();
    return tips
      .filter(tip => new Date(tip.createdAt).toDateString() === today)
      .reduce((total, tip) => total + tip.amount, 0);
  };

  const getRecentTips = (): Tip[] => {
    return [...tips]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  };

  if (tips.length === 0 && !isLoading) {
    return (
      <>
        <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
        <View style={styles.container}>
          {(status === 'trial' || status === 'expired') && (
            <SubscriptionBanner />
          )}
          <EmptyState
            title={t('noTipsYet')}
            description={t('noTipsDescription')}
            icon={<Inbox size={64} color={colors.textLight} />}
            style={styles.emptyState}
          />
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <View style={styles.container}>
        {(status === 'trial' || status === 'expired') && (
          <SubscriptionBanner />
        )}
        
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <DollarSign size={isSmallDevice ? 18 : 20} color={colors.primary} />
            </View>
            <Text style={[styles.statLabel, isSmallDevice && styles.statLabelSmall]}>{t('today')}</Text>
            <Text style={[styles.statValue, isSmallDevice && styles.statValueSmall]}>${calculateTodayEarnings().toFixed(2)}</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={isSmallDevice ? 18 : 20} color={colors.secondary} />
            </View>
            <Text style={[styles.statLabel, isSmallDevice && styles.statLabelSmall]}>{t('total')}</Text>
            <Text style={[styles.statValue, isSmallDevice && styles.statValueSmall]}>${calculateTotalEarnings().toFixed(2)}</Text>
          </Card>
        </View>
        
        <View style={styles.recentContainer}>
          <Text style={[styles.sectionTitle, isSmallDevice && styles.sectionTitleSmall]}>{t('recentTips')}</Text>
          
          <FlatList
            data={getRecentTips()}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TipHistoryItem tip={item} />}
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
                title={t('noTipsYet')}
                description={t('noTipsDescription')}
                icon={<Calendar size={48} color={colors.textLight} />}
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
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: colors.gray[500],
    marginBottom: 4,
  },
  statLabelSmall: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  statValueSmall: {
    fontSize: 20,
  },
  recentContainer: {
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
  },
});