import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '@/constants/colors';

interface QRCodeProps {
  value: string;
  size?: number;
  logo?: string;
  backgroundColor?: string;
  foregroundColor?: string;
}

export const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 200,
  logo,
  backgroundColor = colors.card,
  foregroundColor = colors.text,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setError("QR code value is required");
      setIsLoading(false);
      return;
    }

    // Encode the value for URL
    const encodedValue = encodeURIComponent(value);
    
    // Use QR code API to generate QR code
    // Note: Using a public API for demo purposes
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodedValue}&size=${size}x${size}&color=${foregroundColor.replace('#', '')}&bgcolor=${backgroundColor.replace('#', '')}`;
    
    setQrCodeUrl(apiUrl);
    setIsLoading(false);
  }, [value, size, backgroundColor, foregroundColor]);

  if (error) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (isLoading || !qrCodeUrl) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={{ uri: qrCodeUrl }}
        style={styles.qrCode}
        contentFit="contain"
        transition={300}
      />
      {logo && (
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: logo }}
            style={styles.logo}
            contentFit="cover"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  qrCode: {
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    position: 'absolute',
    width: '20%',
    height: '20%',
    backgroundColor: colors.card,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
});