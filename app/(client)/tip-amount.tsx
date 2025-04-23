import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, useWindowDimensions, StatusBar } from 'react-native';
import { router, useLocalSearchParams, useRootNavigationState } from 'expo-router';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { TipAmountSelector } from '@/components/TipAmountSelector';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react-native';
import { useLanguageStore } from '@/store/language-store';

export default function TipAmountScreen() {
  const params = useLocalSearchParams<{ workerId: string; name: string; occupation: string }>();
  const { workerId, name, occupation } = params;
  const rootNavigationState = useRootNavigationState();
  const { t } = useLanguageStore();
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 375;
  
  const [tipAmount, setTipAmount] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState<number>(5);
  
  const handleBack = () => {
    if (rootNavigationState?.key) {
      router.back();
    }
  };

  const handleContinue = () => {
    if (!tipAmount) {
      alert('Por favor selecciona una cantidad de propina');
      return;
    }
    
    if (rootNavigationState?.key) {
      router.push({
        pathname: '/(client)/payment',
        params: { 
          workerId, 
          name, 
          occupation,
          amount: tipAmount.toString(),
          comment,
          rating: rating.toString()
        }
      });
    }
  };

  const handleSelectAmount = (amount: number) => {
    setTipAmount(amount);
  };

  const handleRating = (value: number) => {
    setRating(value);
  };

  return (
    <>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color={colors.textLight} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isSmallDevice && styles.headerTitleSmall]}>{t('tipAmount')}</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.content}>
          <View style={styles.recipientInfo}>
            <Text style={styles.recipientLabel}>Propina para</Text>
            <Text style={[styles.recipientName, isSmallDevice && styles.recipientNameSmall]}>{name}</Text>
            <Text style={styles.recipientOccupation}>{occupation}</Text>
          </View>
          
          <TipAmountSelector onSelectAmount={handleSelectAmount} />
          
          <View style={styles.ratingContainer}>
            <Text style={[styles.ratingTitle, isSmallDevice && styles.ratingTitleSmall]}>{t('rateYourExperience')}</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRating(star)}
                  style={styles.starButton}
                >
                  <Star 
                    size={isSmallDevice ? 28 : 32} 
                    color={star <= rating ? colors.primary : colors.gray[400]} 
                    fill={star <= rating ? colors.primary : 'transparent'} 
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.commentContainer}>
            <Text style={[styles.commentTitle, isSmallDevice && styles.commentTitleSmall]}>{t('leaveComment')}</Text>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              placeholder={t('writeComment')}
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              multiline
              maxLength={200}
            />
          </View>
        </View>
        
        <View style={styles.footer}>
          <Button
            title={t('continueToPayment')}
            onPress={handleContinue}
            disabled={!tipAmount}
            rightIcon={<ArrowRight size={isSmallDevice ? 18 : 20} color={colors.textDark} />}
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
  content: {
    flex: 1,
    padding: '4%',
  },
  recipientInfo: {
    marginBottom: '6%',
  },
  recipientLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  recipientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 4,
  },
  recipientNameSmall: {
    fontSize: 20,
  },
  recipientOccupation: {
    fontSize: 16,
    color: colors.textLight,
  },
  ratingContainer: {
    marginVertical: '4%',
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: colors.textLight,
  },
  ratingTitleSmall: {
    fontSize: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  starButton: {
    padding: 4,
  },
  commentContainer: {
    marginVertical: '4%',
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: colors.textLight,
  },
  commentTitleSmall: {
    fontSize: 16,
  },
  commentInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    color: colors.textLight,
  },
  footer: {
    padding: '4%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
});