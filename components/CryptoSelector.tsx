import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  FlatList,
  useWindowDimensions
} from 'react-native';
import { colors } from '@/constants/colors';
import { CryptoCurrency } from '@/types';
import { ChevronDown, X } from 'lucide-react-native';

interface CryptoSelectorProps {
  value: CryptoCurrency | undefined;
  onChange: (value: CryptoCurrency) => void;
  label?: string;
}

const CRYPTO_OPTIONS: CryptoCurrency[] = [
  'USDT',
  'USDC',
  'BITCOIN',
  'ETHEREUM',
  'TRX',
  'TON'
];

export const CryptoSelector: React.FC<CryptoSelectorProps> = ({
  value,
  onChange,
  label
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 375;

  const handleSelect = (option: CryptoCurrency) => {
    onChange(option);
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: CryptoCurrency }) => (
    <TouchableOpacity
      style={styles.optionItem}
      onPress={() => handleSelect(item)}
    >
      <Text style={[
        styles.optionText,
        item === value && styles.selectedOptionText
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectorText}>
          {value || 'Seleccionar tipo de criptomoneda'}
        </Text>
        <ChevronDown size={20} color={colors.textLight} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            isSmallDevice && styles.modalContentSmall
          ]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar criptomoneda</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={20} color={colors.textLight} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={CRYPTO_OPTIONS}
              renderItem={renderItem}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.optionsList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: colors.gray[700],
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectorText: {
    fontSize: 16,
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalContentSmall: {
    width: '95%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textLight,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsList: {
    padding: 8,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionText: {
    fontSize: 16,
    color: colors.textLight,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: '600',
  },
});