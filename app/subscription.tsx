import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, Platform, useWindowDimensions, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { useSubscriptionStore } from '@/store/subscription-store';
import { ArrowLeft, Check, Crown, CreditCard, Calendar, Clock, Shield, Zap, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function SubscriptionScreen() {
  const { 
    status, 
    startTrial, 
    subscribe, 
    cancelSubscription, 
    restoreSubscription,
    trialEndDate,
    isLoading 
  } = useSubscriptionStore();
  
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 375;
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleStartTrial = async () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptics error:', error);
      }
    }
    
    try {
      await startTrial();
      Alert.alert(
        "¡Prueba iniciada!",
        "Tu período de prueba gratuito de 30 días ha comenzado. Disfruta de todas las funciones de TIPAZO."
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo iniciar el período de prueba. Por favor, inténtalo de nuevo."
      );
    }
  };
  
  const handleSubscribe = async () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptics error:', error);
      }
    }
    
    try {
      await subscribe();
      Alert.alert(
        "¡Suscripción exitosa!",
        "Tu suscripción a TIPAZO ha sido activada. Gracias por tu apoyo."
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo completar la suscripción. Por favor, inténtalo de nuevo."
      );
    }
  };
  
  const handleCancelSubscription = () => {
    setShowConfirmation(true);
  };
  
  const confirmCancelSubscription = async () => {
    try {
      await cancelSubscription();
      setShowConfirmation(false);
      Alert.alert(
        "Suscripción cancelada",
        "Tu suscripción ha sido cancelada. Puedes volver a suscribirte en cualquier momento."
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo cancelar la suscripción. Por favor, inténtalo de nuevo."
      );
    }
  };
  
  const handleRestoreSubscription = async () => {
    await restoreSubscription();
  };
  
  // Calculate days remaining in trial
  const getDaysRemaining = (): number => {
    if (!trialEndDate) return 0;
    
    const now = new Date();
    const endDate = new Date(trialEndDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };
  
  // Format date to readable string
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color={colors.textLight} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isSmallDevice && styles.headerTitleSmall]}>Suscripción</Text>
          <View style={styles.placeholder} />
        </View>
        
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <Crown size={isSmallDevice ? 28 : 32} color={colors.primary} />
            <Text style={[styles.title, isSmallDevice && styles.titleSmall]}>TIPAZO Premium</Text>
          </View>
          
          <Text style={styles.subtitle}>
            Recibe propinas sin límites y accede a todas las funciones
          </Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>$4.99</Text>
            <Text style={styles.pricePeriod}>/mes</Text>
          </View>
          
          <View style={styles.trialInfoContainer}>
            <Clock size={isSmallDevice ? 18 : 20} color={colors.textLight} />
            <Text style={styles.trialInfoText}>
              Prueba gratuita de 30 días, cancela cuando quieras
            </Text>
          </View>
          
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Incluye:</Text>
            
            <View style={styles.featureItem}>
              <Check size={20} color={colors.primary} />
              <Text style={styles.featureText}>Recibe propinas ilimitadas</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Check size={20} color={colors.primary} />
              <Text style={styles.featureText}>Estadísticas detalladas de tus propinas</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Check size={20} color={colors.primary} />
              <Text style={styles.featureText}>Retiros a múltiples métodos de pago</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Check size={20} color={colors.primary} />
              <Text style={styles.featureText}>Personalización de tu perfil y código QR</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Check size={20} color={colors.primary} />
              <Text style={styles.featureText}>Soporte prioritario</Text>
            </View>
          </View>
          
          {status === 'trial' && (
            <View style={styles.statusContainer}>
              <View style={styles.statusHeader}>
                <Crown size={20} color={colors.primary} />
                <Text style={styles.statusTitle}>Período de prueba activo</Text>
              </View>
              <Text style={styles.statusText}>
                Tu prueba gratuita termina en {getDaysRemaining()} días ({formatDate(trialEndDate)})
              </Text>
            </View>
          )}
          
          {status === 'active' && (
            <View style={styles.statusContainer}>
              <View style={styles.statusHeader}>
                <Shield size={20} color={colors.success} />
                <Text style={styles.statusTitle}>Suscripción activa</Text>
              </View>
              <Text style={styles.statusText}>
                Tu próximo pago será el {formatDate(trialEndDate)}
              </Text>
            </View>
          )}
          
          {status === 'expired' && (
            <View style={[styles.statusContainer, styles.expiredContainer]}>
              <View style={styles.statusHeader}>
                <AlertCircle size={20} color={colors.error} />
                <Text style={[styles.statusTitle, styles.expiredTitle]}>Suscripción expirada</Text>
              </View>
              <Text style={styles.statusText}>
                Tu suscripción ha expirado. Suscríbete para seguir recibiendo propinas.
              </Text>
            </View>
          )}
        </ScrollView>
        
        <View style={styles.footer}>
          {status === 'none' && (
            <Button
              title="Comenzar prueba gratuita"
              onPress={handleStartTrial}
              isLoading={isLoading}
              leftIcon={<Zap size={isSmallDevice ? 18 : 20} color={colors.textDark} />}
            />
          )}
          
          {status === 'trial' && (
            <>
              <Button
                title="Suscribirse ahora"
                onPress={handleSubscribe}
                isLoading={isLoading}
                leftIcon={<CreditCard size={isSmallDevice ? 18 : 20} color={colors.textDark} />}
              />
              <Button
                title="Cancelar prueba"
                variant="outline"
                onPress={handleCancelSubscription}
                style={styles.secondaryButton}
              />
            </>
          )}
          
          {status === 'active' && (
            <Button
              title="Cancelar suscripción"
              variant="outline"
              onPress={handleCancelSubscription}
            />
          )}
          
          {status === 'expired' && (
            <>
              <Button
                title="Suscribirse"
                onPress={handleSubscribe}
                isLoading={isLoading}
                leftIcon={<CreditCard size={isSmallDevice ? 18 : 20} color={colors.textDark} />}
              />
              <Button
                title="Restaurar compras"
                variant="ghost"
                onPress={handleRestoreSubscription}
                style={styles.restoreButton}
              />
            </>
          )}
        </View>
        
        {showConfirmation && (
          <View style={styles.confirmationOverlay}>
            <View style={styles.confirmationDialog}>
              <Text style={styles.confirmationTitle}>¿Cancelar suscripción?</Text>
              <Text style={styles.confirmationText}>
                Si cancelas, tu suscripción seguirá activa hasta el final del período actual, pero no se renovará automáticamente.
              </Text>
              <View style={styles.confirmationButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowConfirmation(false)}
                >
                  <Text style={styles.cancelButtonText}>No, mantener</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={confirmCancelSubscription}
                >
                  <Text style={styles.confirmButtonText}>Sí, cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  },
  contentContainer: {
    padding: '6%',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  titleSmall: {
    fontSize: 20,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 24,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
  },
  pricePeriod: {
    fontSize: 18,
    color: colors.textLight,
    marginBottom: 6,
    marginLeft: 4,
  },
  trialInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  trialInfoText: {
    fontSize: 14,
    color: colors.textLight,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: colors.textLight,
  },
  statusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  expiredContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
  },
  expiredTitle: {
    color: colors.error,
  },
  statusText: {
    fontSize: 14,
    color: colors.textLight,
  },
  footer: {
    padding: '4%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    gap: 12,
  },
  secondaryButton: {
    borderColor: colors.textLight,
  },
  restoreButton: {
    marginTop: 8,
  },
  confirmationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmationDialog: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmationText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textLight,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.error,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: colors.card,
    fontWeight: '600',
  },
});