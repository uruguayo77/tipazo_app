import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Platform, useWindowDimensions, StatusBar } from 'react-native';
import { useAuthStore } from '@/store/auth-store';
import { colors } from '@/constants/colors';
import { QRCode } from '@/components/QRCode';
import { Card } from '@/components/Card';
import { Avatar } from '@/components/Avatar';
import { Share2, Download, Printer } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useLanguageStore } from '@/store/language-store';

export default function QRCodeScreen() {
  const { user } = useAuthStore();
  const [isSharing, setIsSharing] = useState(false);
  const { t } = useLanguageStore();
  const { width, height } = useWindowDimensions();
  const isSmallDevice = width < 375;

  if (!user) return null;

  // Create a URL with worker info that can be scanned
  const qrValue = `https://tipqr.app/tip/${user.id}?name=${encodeURIComponent(user.name)}&occupation=${encodeURIComponent((user as any).occupation || '')}`;

  const handleShare = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setIsSharing(true);
    try {
      await Share.share({
        message: `Escanea este código QR para dejar una propina a ${user.name}`,
        url: qrValue,
        title: 'Código QR de propina',
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // This would be implemented with actual download functionality
    // For now, just show a message
    alert('¡Función de descarga de código QR próximamente!');
  };

  const handlePrint = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // This would be implemented with actual print functionality
    // For now, just show a message
    alert('¡Función de impresión de código QR próximamente!');
  };

  const qrSize = Math.min(width * 0.7, 250);

  return (
    <>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <View style={styles.container}>
        <Card style={styles.qrContainer}>
          <View style={styles.profileInfo}>
            <Avatar source={user.photoUrl} name={user.name} size={isSmallDevice ? 50 : 60} />
            <View style={styles.nameContainer}>
              <Text style={[styles.name, isSmallDevice && styles.nameSmall]}>{user.name}</Text>
              <Text style={styles.occupation}>{(user as any).occupation || 'Trabajador de servicio'}</Text>
            </View>
          </View>
          
          <View style={styles.qrWrapper}>
            <QRCode
              value={qrValue}
              size={qrSize}
              logo={user.photoUrl}
              backgroundColor={colors.card}
              foregroundColor={colors.text}
            />
          </View>
          
          <Text style={styles.instructions}>
            {t('displayQRCodeInstructions')}
          </Text>
        </Card>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleShare}
            disabled={isSharing}
          >
            <View style={[styles.actionIcon, styles.shareIcon]}>
              <Share2 size={isSmallDevice ? 20 : 24} color={colors.textDark} />
            </View>
            <Text style={styles.actionText}>{t('share')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleDownload}
          >
            <View style={[styles.actionIcon, styles.downloadIcon]}>
              <Download size={isSmallDevice ? 20 : 24} color={colors.textDark} />
            </View>
            <Text style={styles.actionText}>{t('download')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handlePrint}
          >
            <View style={[styles.actionIcon, styles.printIcon]}>
              <Printer size={isSmallDevice ? 20 : 24} color={colors.textDark} />
            </View>
            <Text style={styles.actionText}>{t('print')}</Text>
          </TouchableOpacity>
        </View>
        
        <Card style={styles.tipsCard}>
          <Text style={[styles.tipsTitle, isSmallDevice && styles.tipsTitleSmall]}>{t('tipsForGettingMoreTips')}</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Coloca tu código QR en un lugar visible</Text>
            <Text style={styles.tipItem}>• Imprime varias copias para diferentes áreas</Text>
            <Text style={styles.tipItem}>• Añade una nota amistosa animando a dejar propina</Text>
            <Text style={styles.tipItem}>• Agradece a los clientes que dejan propinas</Text>
          </View>
        </Card>
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
  qrContainer: {
    alignItems: 'center',
    padding: '6%',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  nameContainer: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  nameSmall: {
    fontSize: 18,
  },
  occupation: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 4,
  },
  qrWrapper: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructions: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareIcon: {
    backgroundColor: colors.primary,
  },
  downloadIcon: {
    backgroundColor: colors.primary,
  },
  printIcon: {
    backgroundColor: colors.primary,
  },
  actionText: {
    fontSize: 14,
    color: colors.textLight,
  },
  tipsCard: {
    padding: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  tipsTitleSmall: {
    fontSize: 14,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});