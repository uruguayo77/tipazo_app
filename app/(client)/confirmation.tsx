import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, useWindowDimensions, StatusBar } from 'react-native';
import { router, useLocalSearchParams, useRootNavigationState } from 'expo-router';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { CheckCircle, Home, QrCode } from 'lucide-react-native';
import { useLanguageStore } from '@/store/language-store';

export default function ConfirmationScreen() {
  const params = useLocalSearchParams<{ 
    workerId: string; 
    name: string; 
    amount: string;
  }>();
  
  const { name, amount } = params;
  const rootNavigationState = useRootNavigationState();
  const { t } = useLanguageStore();
  const { width, height } = useWindowDimensions();
  const isSmallDevice = width < 375;

  const handleScanAgain = () => {
    if (rootNavigationState?.key) {
      router.push('/(client)/scan');
    }
  };

  const handleHome = () => {
    if (rootNavigationState?.key) {
      router.push('/(auth)/welcome');
    }
  };

  return (
    <>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successContainer}>
            <View style={[
              styles.iconContainer, 
              isSmallDevice && styles.iconContainerSmall
            ]}>
              <CheckCircle size={isSmallDevice ? 60 : 80} color={colors.success} />
            </View>
            
            <Text style={[styles.title, isSmallDevice && styles.titleSmall]}>¡Gracias!</Text>
            <Text style={styles.message}>
              Tu propina de <Text style={styles.highlight}>${amount}</Text> para <Text style={styles.highlight}>{name}</Text> ha sido enviada con éxito.
            </Text>
          </View>
          
          <View style={[styles.imageContainer, { height: height * 0.2 }]}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000' }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={[styles.infoTitle, isSmallDevice && styles.infoTitleSmall]}>Por qué importan las propinas</Text>
            <Text style={styles.infoText}>
              Tu generosidad marca una diferencia real en la vida de los trabajadores de servicio. Las propinas a menudo constituyen una parte significativa de sus ingresos.
            </Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Button
            title="Escanear otro código"
            onPress={handleScanAgain}
            style={styles.scanButton}
            leftIcon={<QrCode size={isSmallDevice ? 18 : 20} color={colors.textDark} />}
          />
          <Button
            title="Volver al inicio"
            onPress={handleHome}
            variant="outline"
            style={styles.homeButton}
            leftIcon={<Home size={isSmallDevice ? 18 : 20} color={colors.textLight} />}
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
  content: {
    flex: 1,
    padding: '6%',
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: '8%',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '6%',
  },
  iconContainerSmall: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 16,
    textAlign: 'center',
  },
  titleSmall: {
    fontSize: 24,
  },
  message: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  highlight: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  imageContainer: {
    marginBottom: '8%',
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  infoContainer: {
    padding: '4%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 8,
  },
  infoTitleSmall: {
    fontSize: 16,
  },
  infoText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 22,
  },
  footer: {
    padding: '4%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    gap: 12,
  },
  scanButton: {
    width: '100%',
  },
  homeButton: {
    width: '100%',
  },
});