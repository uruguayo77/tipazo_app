import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, useWindowDimensions, StatusBar, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams, useRootNavigationState } from 'expo-router';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { Avatar } from '@/components/Avatar';
import { ArrowLeft, Star, DollarSign } from 'lucide-react-native';
import { useLanguageStore } from '@/store/language-store';
import { Worker } from '@/types';

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
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
    bio: "Soy apasionado por preparar la taza de café perfecta. He sido barista durante 3 años y me encanta crear arte en café latte y experimentar con nuevos métodos de preparación.",
    occupation: 'Barista',
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

export default function WorkerProfileScreen() {
  const params = useLocalSearchParams<{ workerId: string; name: string; occupation: string }>();
  const rootNavigationState = useRootNavigationState();
  const { t } = useLanguageStore();
  const { width, height } = useWindowDimensions();
  const isSmallDevice = width < 375;
  
  const { workerId } = params;
  const [workerDetails, setWorkerDetails] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(4.9);
  
  useEffect(() => {
    const fetchWorkerDetails = async () => {
      if (workerId) {
        try {
          setIsLoading(true);
          const details = await getWorkerDetails(workerId);
          setWorkerDetails(details);
        } catch (error) {
          console.error('Error fetching worker details:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchWorkerDetails();
  }, [workerId]);
  
  const handleBack = () => {
    if (rootNavigationState?.key) {
      router.back();
    }
  };

  const handleTip = () => {
    if (rootNavigationState?.key) {
      router.push({
        pathname: '/(client)/tip-amount',
        params: { 
          workerId, 
          name: workerDetails?.name || params.name, 
          occupation: workerDetails?.occupation || params.occupation 
        }
      });
    }
  };

  // Display worker name and occupation from params if workerDetails is not available yet
  const displayName = workerDetails?.name || params.name;
  const displayOccupation = workerDetails?.occupation || params.occupation;
  const displayBio = workerDetails?.bio || 
    (displayOccupation === 'Barista' 
      ? "Soy apasionado por preparar la taza de café perfecta. He sido barista durante 3 años y me encanta crear arte en café latte y experimentar con nuevos métodos de preparación."
      : "Estoy dedicado a proporcionar un excelente servicio y hacer que tu experiencia sea memorable. ¡Gracias por considerar dejar una propina!");

  return (
    <>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color={colors.textLight} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isSmallDevice && styles.headerTitleSmall]}>{t('workerProfile')}</Text>
          <View style={styles.placeholder} />
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Cargando perfil...</Text>
          </View>
        ) : (
          <View style={styles.profileContainer}>
            <View style={styles.profileHeader}>
              <Avatar 
                source={workerDetails?.photoUrl} 
                name={displayName} 
                size={isSmallDevice ? 80 : 100} 
              />
              <View style={styles.nameContainer}>
                <Text style={[styles.name, isSmallDevice && styles.nameSmall]}>{displayName}</Text>
                <Text style={[styles.occupation, isSmallDevice && styles.occupationSmall]}>{displayOccupation}</Text>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      size={isSmallDevice ? 16 : 18} 
                      color={star <= Math.round(rating) ? colors.primary : colors.gray[300]} 
                      fill={star <= Math.round(rating) ? colors.primary : 'transparent'} 
                    />
                  ))}
                  <Text style={styles.ratingText}>({rating.toFixed(1)})</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoSection}>
              <Text style={[styles.sectionTitle, isSmallDevice && styles.sectionTitleSmall]}>{t('about')}</Text>
              <Text style={styles.bio}>
                {displayBio}
              </Text>
            </View>
            
            <View style={[styles.imageContainer, { height: height * 0.2 }]}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?q=80&w=1000' }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          </View>
        )}
        
        <View style={styles.footer}>
          <Button
            title="Dejar propina"
            onPress={handleTip}
            style={styles.tipButton}
            leftIcon={<DollarSign size={isSmallDevice ? 18 : 20} color={colors.textDark} />}
            disabled={isLoading}
          />
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textLight,
  },
  profileContainer: {
    flex: 1,
    padding: '4%',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '6%',
  },
  nameContainer: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 4,
  },
  nameSmall: {
    fontSize: 20,
  },
  occupation: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 8,
  },
  occupationSmall: {
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.textLight,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: '6%',
  },
  infoSection: {
    marginBottom: '6%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 12,
  },
  sectionTitleSmall: {
    fontSize: 16,
  },
  bio: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 24,
  },
  imageContainer: {
    marginBottom: '6%',
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  footer: {
    padding: '4%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  tipButton: {
    width: '100%',
  },
});