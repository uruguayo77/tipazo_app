import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { colors } from '@/constants/colors';
import { useSubscriptionStore } from '@/store/subscription-store';
import { router } from 'expo-router';
import { Crown, AlertCircle } from 'lucide-react-native';

interface SubscriptionBannerProps {
  compact?: boolean;
}

export const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({ 
  compact = false 
}) => {
  const { status, trialEndDate } = useSubscriptionStore();
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 375;
  
  // Calculate days remaining in trial
  const getDaysRemaining = (): number => {
    if (!trialEndDate) return 0;
    
    const now = new Date();
    const endDate = new Date(trialEndDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };
  
  const handlePress = () => {
    router.push('/subscription');
  };
  
  if (status === 'active') {
    return null; // Don't show banner for active subscribers
  }
  
  // Compact version for use in headers or small spaces
  if (compact) {
    return (
      <TouchableOpacity 
        style={[
          styles.compactContainer,
          status === 'trial' ? styles.compactContainerTrial : styles.compactContainerExpired
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {status === 'trial' ? (
          <View style={styles.compactContent}>
            <Crown size={16} color={colors.background} />
            <Text style={styles.compactTextTrial}>
              {getDaysRemaining()} días restantes
            </Text>
          </View>
        ) : (
          <View style={styles.compactContent}>
            <AlertCircle size={16} color={colors.error} />
            <Text style={styles.compactTextExpired}>
              Suscripción requerida
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity 
      style={[
        styles.container,
        status === 'expired' && styles.expiredContainer
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        {status === 'trial' ? (
          <Crown size={isSmallDevice ? 20 : 24} color={colors.primary} />
        ) : (
          <AlertCircle size={isSmallDevice ? 20 : 24} color={colors.error} />
        )}
      </View>
      
      <View style={styles.textContainer}>
        {status === 'trial' ? (
          <>
            <Text style={[styles.title, isSmallDevice && styles.titleSmall]}>
              Período de prueba: {getDaysRemaining()} días restantes
            </Text>
            <Text style={styles.description}>
              Disfruta de todas las funciones gratis. Después $4.99/mes.
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.title, isSmallDevice && styles.titleSmall]}>
              Suscripción requerida
            </Text>
            <Text style={styles.description}>
              Tu período de prueba ha terminado. Suscríbete para seguir recibiendo propinas.
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    alignItems: 'center',
  },
  expiredContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 4,
  },
  titleSmall: {
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.8,
  },
  compactContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  compactContainerTrial: {
    backgroundColor: colors.card,
    borderColor: colors.background,
    borderWidth: 2,
  },
  compactContainerExpired: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactTextTrial: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.background,
  },
  compactTextExpired: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.error,
  },
});