import React from 'react';
import { Tabs, router, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { colors } from '@/constants/colors';
import { Home, QrCode, Wallet, User } from 'lucide-react-native';
import { useLanguageStore } from '@/store/language-store';
import { SubscriptionBanner } from '@/components/SubscriptionBanner';
import { useSubscriptionStore } from '@/store/subscription-store';
import { View, StyleSheet } from 'react-native';

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();
  const { status } = useSubscriptionStore();
  const { t } = useLanguageStore();
  const rootNavigationState = useRootNavigationState();

  React.useEffect(() => {
    if (!isAuthenticated && rootNavigationState?.key) {
      // Only navigate when the root navigation is ready
      router.replace('/(auth)/welcome');
    }
  }, [isAuthenticated, rootNavigationState?.key]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.gray[200],
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '600',
        },
        // Add subscription banner to header if needed
        headerRight: () => {
          if (status === 'trial') {
            return (
              <View style={styles.headerRight}>
                <SubscriptionBanner compact />
              </View>
            );
          }
          return null;
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('dashboard'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="qr-code"
        options={{
          title: t('myQRCode'),
          tabBarIcon: ({ color, size }) => <QrCode size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="withdrawals"
        options={{
          title: t('withdrawals'),
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    marginRight: 16,
  },
});