import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Image } from 'react-native';
import { useAuthStore } from '@/store/auth-store';
import { colors } from '@/constants/colors';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Avatar } from '@/components/Avatar';
import { CryptoSelector } from '@/components/CryptoSelector';
import { BankSelector } from '@/components/BankSelector';
import { router, useRootNavigationState } from 'expo-router';
import { User, Mail, Briefcase, CreditCard, Building, LogOut, Camera, Upload, QrCode, Phone, Crown } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useLanguageStore } from '@/store/language-store';
import { CryptoCurrency } from '@/types';
import { useSubscriptionStore } from '@/store/subscription-store';

export default function ProfileScreen() {
  const { user, logout, updateProfile, isLoading } = useAuthStore();
  const { status, trialEndDate } = useSubscriptionStore();
  const { t } = useLanguageStore();
  const rootNavigationState = useRootNavigationState();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [occupation, setOccupation] = useState((user as any)?.occupation || '');
  const [walletAddress, setWalletAddress] = useState((user as any)?.walletAddress || '');
  const [cryptoType, setCryptoType] = useState<CryptoCurrency | undefined>((user as any)?.cryptoType);
  const [bankName, setBankName] = useState((user as any)?.bankAccount?.bankName || '');
  const [cedula, setCedula] = useState((user as any)?.bankAccount?.routingNumber || '');
  const [phoneNumber, setPhoneNumber] = useState((user as any)?.phoneNumber || '');
  const [paymentQrUrl, setPaymentQrUrl] = useState((user as any)?.paymentQrUrl || '');

  // Calculate days remaining in trial
  const getDaysRemaining = (): number => {
    if (!trialEndDate) return 0;
    
    const now = new Date();
    const endDate = new Date(trialEndDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirmation'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('logout'),
          onPress: () => {
            logout();
            if (rootNavigationState?.key) {
              router.replace('/(auth)/welcome');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleEditToggle = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (isEditing) {
      // Save changes
      updateProfile({
        name,
        email,
        occupation,
        walletAddress,
        cryptoType,
        bankName,
        cedula,
        phoneNumber,
        paymentQrUrl
      });
    }
    
    setIsEditing(!isEditing);
  };

  const handlePickImage = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Permiso requerido", "Necesitamos permiso para acceder a tu galería de fotos.");
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      updateProfile({
        photoUrl: result.assets[0].uri,
      });
    }
  };

  const handlePickPaymentQR = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Permiso requerido", "Necesitamos permiso para acceder a tu galería de fotos.");
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPaymentQrUrl(result.assets[0].uri);
    }
  };

  const handleManageSubscription = () => {
    router.push('/subscription');
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={handlePickImage} disabled={isLoading}>
          <View style={styles.avatarContainer}>
            <Avatar source={user.photoUrl} name={user.name} size={100} />
            <View style={styles.cameraIconContainer}>
              <Camera size={20} color={colors.card} />
            </View>
          </View>
        </TouchableOpacity>
        
        {!isEditing ? (
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.occupation}>{(user as any).occupation || t('serviceWorker')}</Text>
          </View>
        ) : null}
        
        <Button
          title={isEditing ? t('saveProfile') : t('editProfile')}
          variant={isEditing ? "primary" : "outline"}
          onPress={handleEditToggle}
          isLoading={isLoading}
          style={styles.editButton}
        />
      </View>
      
      {/* Subscription Card - Updated to white background */}
      <Card style={styles.subscriptionCard}>
        <View style={styles.subscriptionHeader}>
          <Crown size={24} color={colors.primary} />
          <Text style={styles.subscriptionTitle}>TIPAZO Premium</Text>
        </View>
        
        {status === 'trial' && (
          <View style={styles.daysRemainingContainer}>
            <Text style={styles.daysRemainingText}>{getDaysRemaining()} días restantes</Text>
          </View>
        )}
        
        <Text style={styles.subscriptionStatus}>
          {status === 'none' && "No tienes una suscripción activa"}
          {status === 'trial' && "Período de prueba activo"}
          {status === 'active' && "Suscripción activa"}
          {status === 'expired' && "Suscripción expirada"}
        </Text>
        
        <Button
          title={
            status === 'none' ? "Comenzar prueba gratuita" :
            status === 'trial' ? "Administrar suscripción" :
            status === 'active' ? "Administrar suscripción" :
            "Renovar suscripción"
          }
          variant="primary"
          onPress={handleManageSubscription}
          style={styles.subscriptionButton}
        />
      </Card>
      
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>{t('personalInformation')}</Text>
        
        {isEditing ? (
          <View style={styles.form}>
            <Input
              label={t('fullName')}
              value={name}
              onChangeText={setName}
              leftIcon={<User size={20} color={colors.gray[500]} />}
            />
            
            <Input
              label={t('email')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={20} color={colors.gray[500]} />}
            />
            
            <Input
              label={t('occupation')}
              value={occupation}
              onChangeText={setOccupation}
              leftIcon={<Briefcase size={20} color={colors.gray[500]} />}
            />
          </View>
        ) : (
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <User size={20} color={colors.gray[500]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('fullName')}</Text>
                <Text style={styles.infoValue}>{user.name}</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Mail size={20} color={colors.gray[500]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('email')}</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Briefcase size={20} color={colors.gray[500]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('occupation')}</Text>
                <Text style={styles.infoValue}>{(user as any).occupation || t('notSpecified')}</Text>
              </View>
            </View>
          </View>
        )}
      </Card>
      
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Pago Móvil</Text>
        
        {isEditing ? (
          <View style={styles.form}>
            <BankSelector
              label="Nombre del banco"
              value={bankName}
              onChange={setBankName}
            />
            
            <Input
              label="Cédula de Identidad"
              value={cedula}
              onChangeText={setCedula}
              keyboardType="numeric"
              placeholder="Ingresa tu cédula de identidad"
              leftIcon={<Building size={20} color={colors.gray[500]} />}
            />
            
            <Input
              label="Número de teléfono"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="numeric"
              placeholder="Ingresa tu número telefónico"
              leftIcon={<Phone size={20} color={colors.gray[500]} />}
            />
            
            <View style={styles.separatorContainer}>
              <Text style={styles.separatorText}>O puedes usar tu...</Text>
            </View>
            
            <View style={styles.qrUploadSection}>
              <Text style={styles.qrUploadLabel}>Código QR de pago</Text>
              
              <TouchableOpacity 
                style={styles.qrUploadButton}
                onPress={handlePickPaymentQR}
              >
                <QrCode size={20} color={colors.textDark} />
                <Text style={styles.qrUploadButtonText}>Agregar</Text>
              </TouchableOpacity>
              
              {paymentQrUrl ? (
                <View style={styles.qrPreviewContainer}>
                  <Image 
                    source={{ uri: paymentQrUrl }}
                    style={styles.qrPreview}
                    resizeMode="contain"
                  />
                </View>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Building size={20} color={colors.gray[500]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nombre del banco</Text>
                <Text style={styles.infoValue}>
                  {(user as any).bankAccount?.bankName || t('notSpecified')}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Building size={20} color={colors.gray[500]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Cédula de Identidad</Text>
                <Text style={styles.infoValue}>
                  {(user as any).bankAccount?.routingNumber || t('notSpecified')}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Phone size={20} color={colors.gray[500]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Número de teléfono</Text>
                <Text style={styles.infoValue}>
                  {(user as any).phoneNumber || t('notSpecified')}
                </Text>
              </View>
            </View>
            
            {(user as any).paymentQrUrl && (
              <View style={styles.qrDisplayContainer}>
                <Text style={styles.qrDisplayLabel}>Código QR de pago:</Text>
                <Image 
                  source={{ uri: (user as any).paymentQrUrl }}
                  style={styles.qrDisplay}
                  resizeMode="contain"
                />
              </View>
            )}
          </View>
        )}
      </Card>
      
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Información de Criptomoneda</Text>
        
        {isEditing ? (
          <View style={styles.form}>
            <CryptoSelector
              label="Tipo de criptomoneda"
              value={cryptoType}
              onChange={setCryptoType}
            />
            
            <Input
              label="Dirección de billetera"
              value={walletAddress}
              onChangeText={setWalletAddress}
              placeholder="Ingresa tu dirección de billetera"
              leftIcon={<CreditCard size={20} color={colors.gray[500]} />}
            />
          </View>
        ) : (
          <View style={styles.infoList}>
            {(user as any).cryptoType && (
              <View style={styles.infoItem}>
                <CreditCard size={20} color={colors.gray[500]} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Tipo de criptomoneda</Text>
                  <Text style={styles.infoValue}>{(user as any).cryptoType}</Text>
                </View>
              </View>
            )}
            
            <View style={styles.infoItem}>
              <CreditCard size={20} color={colors.gray[500]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Dirección de billetera</Text>
                <Text style={styles.infoValue}>
                  {(user as any).walletAddress || t('notSpecified')}
                </Text>
              </View>
            </View>
          </View>
        )}
      </Card>
      
      <Button
        title={t('logout')}
        variant="outline"
        onPress={handleLogout}
        style={styles.logoutButton}
        leftIcon={<LogOut size={20} color={colors.error} />}
        textStyle={{ color: colors.error }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.card,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 4,
  },
  occupation: {
    fontSize: 16,
    color: colors.textLight,
  },
  editButton: {
    minWidth: 150,
  },
  subscriptionCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.card, // Changed to white background
    position: 'relative',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text, // Changed to dark text for white background
  },
  daysRemainingContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: colors.card,
    borderColor: colors.background,
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  daysRemainingText: {
    color: colors.background,
    fontWeight: '600',
    fontSize: 12,
  },
  subscriptionStatus: {
    fontSize: 14,
    color: colors.gray[500],
    marginBottom: 16,
  },
  subscriptionButton: {
    marginTop: 8,
  },
  section: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  form: {
    gap: 8,
  },
  infoList: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.gray[500],
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
  },
  separatorContainer: {
    marginTop: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  separatorText: {
    fontSize: 14,
    color: colors.gray[500],
    fontStyle: 'italic',
  },
  qrUploadSection: {
    marginTop: 8,
  },
  qrUploadLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: colors.gray[700],
  },
  qrUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    alignSelf: 'flex-start',
  },
  qrUploadButtonText: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: '600',
  },
  qrPreviewContainer: {
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 8,
    height: 150,
  },
  qrPreview: {
    width: '100%',
    height: '100%',
  },
  qrDisplayContainer: {
    marginTop: 12,
  },
  qrDisplayLabel: {
    fontSize: 14,
    color: colors.gray[500],
    marginBottom: 8,
  },
  qrDisplay: {
    width: '100%',
    height: 150,
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 32,
    borderColor: colors.error,
  },
});