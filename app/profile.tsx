import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useAuthStore } from '@/store/auth-store';
import { colors } from '@/constants/colors';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Avatar } from '@/components/Avatar';
import { router, useRootNavigationState } from 'expo-router';
import { User, Mail, Briefcase, CreditCard, Building, LogOut, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useLanguageStore } from '@/store/language-store';

export default function ProfileScreen() {
  const { user, logout, updateProfile, isLoading } = useAuthStore();
  const { t } = useLanguageStore();
  const rootNavigationState = useRootNavigationState();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [occupation, setOccupation] = useState((user as any)?.occupation || '');
  const [walletAddress, setWalletAddress] = useState((user as any)?.walletAddress || '');
  const [bankAccount, setBankAccount] = useState((user as any)?.bankAccount?.accountNumber || '');
  const [bankName, setBankName] = useState((user as any)?.bankAccount?.bankName || '');
  const [routingNumber, setRoutingNumber] = useState((user as any)?.bankAccount?.routingNumber || '');

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
        bankAccount: {
          accountNumber: bankAccount,
          routingNumber,
          bankName,
        },
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
      Alert.alert(t('permissionRequired'), t('photoPermissionMessage'));
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
        <Text style={styles.sectionTitle}>{t('paymentInformation')}</Text>
        
        {isEditing ? (
          <View style={styles.form}>
            <Input
              label={t('walletAddress')}
              value={walletAddress}
              onChangeText={setWalletAddress}
              placeholder={t('enterWalletAddress')}
              leftIcon={<CreditCard size={20} color={colors.gray[500]} />}
            />
            
            <Input
              label={t('bankAccount')}
              value={bankAccount}
              onChangeText={setBankAccount}
              placeholder={t('enterBankAccount')}
              leftIcon={<Building size={20} color={colors.gray[500]} />}
            />
            
            <Input
              label={t('routingNumber')}
              value={routingNumber}
              onChangeText={setRoutingNumber}
              placeholder={t('enterRoutingNumber')}
              leftIcon={<Building size={20} color={colors.gray[500]} />}
            />
            
            <Input
              label={t('bankName')}
              value={bankName}
              onChangeText={setBankName}
              placeholder={t('enterBankName')}
              leftIcon={<Building size={20} color={colors.gray[500]} />}
            />
          </View>
        ) : (
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <CreditCard size={20} color={colors.gray[500]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('walletAddress')}</Text>
                <Text style={styles.infoValue}>
                  {(user as any).walletAddress || t('notSpecified')}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Building size={20} color={colors.gray[500]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('bankAccount')}</Text>
                <Text style={styles.infoValue}>
                  {(user as any).bankAccount?.accountNumber 
                    ? `****${(user as any).bankAccount.accountNumber.slice(-4)}` 
                    : t('notSpecified')}
                </Text>
              </View>
            </View>
            
            {(user as any).bankAccount?.bankName && (
              <View style={styles.infoItem}>
                <Building size={20} color={colors.gray[500]} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t('bankName')}</Text>
                  <Text style={styles.infoValue}>{(user as any).bankAccount.bankName}</Text>
                </View>
              </View>
            )}
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
    color: colors.text,
    marginBottom: 4,
  },
  occupation: {
    fontSize: 16,
    color: colors.gray[600],
  },
  editButton: {
    minWidth: 150,
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
  logoutButton: {
    marginTop: 8,
    marginBottom: 32,
    borderColor: colors.error,
  },
});