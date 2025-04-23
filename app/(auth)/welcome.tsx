import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { router, useRootNavigationState } from 'expo-router';
import { colors } from '@/constants/colors';
import { QrCode, Wallet } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  const rootNavigationState = useRootNavigationState();

  const handleClientFlow = () => {
    if (rootNavigationState?.key) {
      router.push('/(client)/scan');
    }
  };

  const handleWorkerFlow = () => {
    if (rootNavigationState?.key) {
      router.push('/(auth)/login');
    }
  };

  return (
    <>
      <StatusBar backgroundColor={colors.background} barStyle="light-content" />
      <LinearGradient
        colors={['#69c5f8', '#4a9fe0']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            {/* Logo image */}
            <View style={styles.titleContainer}>
              <Image 
                source={{ uri: 'https://iili.io/3MFsR5X.png' }} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            {/* Middle section with text */}
            <View style={styles.middleSection}>
              <View style={styles.taglineContainer}>
                <Text style={styles.taglineWhite}>UN CLICK</Text>
                <Text style={styles.taglineGreen}>UNA PROPINA</Text>
              </View>
            </View>

            {/* Action buttons */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={styles.button}
                onPress={handleClientFlow}
                activeOpacity={0.8}
              >
                <QrCode size={24} color="#000000" />
                <Text style={styles.buttonText}>DEJAR PROPINA</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.button}
                onPress={handleWorkerFlow}
                activeOpacity={0.8}
              >
                <Wallet size={24} color="#000000" />
                <Text style={styles.buttonText}>RECIBIR PROPINA</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: '5%',
    justifyContent: 'space-between',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    maxHeight: '40%',
  },
  logoImage: {
    width: '100%',
    height: 300,
  },
  middleSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  taglineContainer: {
    alignItems: 'center',
  },
  taglineWhite: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 2,
  },
  taglineGreen: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '600',
    letterSpacing: 2,
  },
  buttonsContainer: {
    marginTop: 30,
    marginBottom: '15%',
    gap: 16,
  },
  button: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 30,
    gap: 12,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
});