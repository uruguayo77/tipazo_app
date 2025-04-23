import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, useWindowDimensions, StatusBar } from 'react-native';
import { router, useRootNavigationState } from 'expo-router';
import { colors } from '@/constants/colors';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { ArrowLeft, ScanLine, FlipHorizontal } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useLanguageStore } from '@/store/language-store';

export default function ScanScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const rootNavigationState = useRootNavigationState();
  const { t } = useLanguageStore();
  const { width, height } = useWindowDimensions();
  const isSmallDevice = width < 375;

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptics error:', error);
      }
    }
    
    // Parse the QR code data
    try {
      // For demo purposes, we'll just extract worker ID from URL
      // In a real app, you'd parse the URL properly
      const url = new URL(data);
      const pathParts = url.pathname.split('/');
      const workerId = pathParts[pathParts.length - 1];
      
      // Extract name and occupation from query params if available
      const params = url.searchParams;
      const name = params.get('name') || 'Trabajador';
      const occupation = params.get('occupation') || '';
      
      // Use setTimeout to ensure any ongoing touch events are completed
      setTimeout(() => {
        if (rootNavigationState?.key) {
          // Navigate to worker profile
          router.push({
            pathname: '/(client)/worker-profile',
            params: { workerId, name, occupation }
          });
        }
      }, 100);
    } catch (error) {
      console.error('Error parsing QR code:', error);
      alert('Código QR inválido. Por favor, inténtalo de nuevo.');
      setScanned(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleBack = () => {
    // Use setTimeout to avoid touch event conflicts
    setTimeout(() => {
      if (rootNavigationState?.key) {
        router.back();
      }
    }, 50);
  };

  // Mock scan for web or when camera is not available
  const handleMockScan = () => {
    if (Platform.OS === 'web') {
      handleBarCodeScanned({ data: 'https://tipqr.app/tip/1?name=Juan%20Pérez&occupation=Barista' });
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <>
        <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
        <SafeAreaView style={styles.container}>
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionTitle}>{t('cameraPermissionTitle')}</Text>
            <Text style={styles.permissionText}>
              {t('cameraPermissionText')}
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestPermission}
              activeOpacity={0.7}
            >
              <Text style={styles.permissionButtonText}>{t('grantPermission')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const scanFrameSize = Math.min(width * 0.7, 250);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000000" barStyle="light-content" />
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <SafeAreaView style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color={colors.card} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, isSmallDevice && styles.headerTitleSmall]}>{t('scanQRCode')}</Text>
            <TouchableOpacity 
              style={styles.flipButton} 
              onPress={toggleCameraFacing}
              activeOpacity={0.7}
            >
              <FlipHorizontal size={24} color={colors.card} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.scanArea}>
            <View style={[
              styles.scanFrame,
              { width: scanFrameSize, height: scanFrameSize }
            ]}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
            </View>
            <ScanLine size={scanFrameSize - 10} color={colors.primary} style={styles.scanLine} />
          </View>
          
          <View style={styles.instructions}>
            <Text style={[styles.instructionsText, isSmallDevice && styles.instructionsTextSmall]}>
              {t('alignQRCodeInstructions')}
            </Text>
            
            {Platform.OS === 'web' && (
              <TouchableOpacity
                style={styles.mockScanButton}
                onPress={handleMockScan}
                activeOpacity={0.7}
              >
                <Text style={styles.mockScanButtonText}>{t('simulateScan')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.card,
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitleSmall: {
    fontSize: 16,
  },
  flipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.card,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.card,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.card,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.card,
  },
  scanLine: {
    position: 'absolute',
  },
  instructions: {
    padding: '6%',
    alignItems: 'center',
  },
  instructionsText: {
    color: colors.card,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  instructionsTextSmall: {
    fontSize: 14,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '6%',
    backgroundColor: colors.background,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '600',
  },
  mockScanButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  mockScanButtonText: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '600',
  },
});