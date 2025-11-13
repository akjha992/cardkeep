/**
 * Add Card Form Component
 * Basic form for adding a new card
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Card, CardType } from '@/types/card.types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { saveCard } from '@/services/storage.service';
import { formatCardNumber } from '@/utils/formatters';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';

interface AddCardFormProps {
  onSave: () => void;
  onCancel: () => void;
  initialCard?: Card;
  mode?: 'add' | 'edit';
}

export default function AddCardForm({
  onSave,
  onCancel,
  initialCard,
  mode = 'add',
}: AddCardFormProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isEditMode = mode === 'edit' || Boolean(initialCard);

  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [bankName, setBankName] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [cardType, setCardType] = useState<CardType>('Credit');
  const [billGenerationDay, setBillGenerationDay] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!initialCard) {
      return;
    }

    setCardNumber(formatCardNumber(initialCard.cardNumber));
    setCvv(initialCard.cvv);
    setExpiryDate(initialCard.expiryDate);
    setBankName(initialCard.bankName);
    setCardholderName(initialCard.cardholderName);
    setCardType(initialCard.cardType);
    setBillGenerationDay(
      initialCard.cardType === 'Credit' && typeof initialCard.billGenerationDay === 'number'
        ? String(initialCard.billGenerationDay)
        : ''
    );
  }, [initialCard]);

  const handleSelectCardType = (type: CardType) => {
    setCardType(type);
    if (type === 'Debit') {
      setBillGenerationDay('');
      setErrors(prev => {
        if (!prev.billGenerationDay) return prev;
        const next = { ...prev };
        delete next.billGenerationDay;
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Card number validation (basic - just check length for now)
    if (!cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }

    // CVV validation
    if (!cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
    }

    // Expiry date validation
    if (!expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = 'Expiry date must be in MM/YY format';
    }

    // Bank name validation
    if (!bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }

    // Cardholder name validation
    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    if (cardType === 'Credit' && billGenerationDay.trim()) {
      const day = Number(billGenerationDay.trim());
      if (Number.isNaN(day) || day < 1 || day > 31) {
        newErrors.billGenerationDay = 'Bill generation day must be between 1 and 31';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Remove spaces from card number for storage
      const cleanCardNumber = cardNumber.replace(/\s/g, '');
      const now = Date.now();
      const baseCard: Card = initialCard
        ? { ...initialCard }
        : {
            id: uuidv4(),
            cardNumber: '',
            cvv: '',
            expiryDate: '',
            bankName: '',
            cardholderName: '',
            cardType,
            billGenerationDay: null,
            usageCount: 0,
            isPinned: false,
            createdAt: now,
            lastUsedAt: now,
          };

      const parsedBillDay =
        cardType === 'Credit' && billGenerationDay.trim()
          ? Number(billGenerationDay.trim())
          : null;

      const newCard: Card = {
        ...baseCard,
        cardNumber: cleanCardNumber,
        cvv: cvv.trim(),
        expiryDate: expiryDate.trim(),
        bankName: bankName.trim(),
        cardholderName: cardholderName.trim(),
        cardType,
        billGenerationDay: cardType === 'Credit' ? parsedBillDay : null,
      };

      await saveCard(newCard);
      onSave();
    } catch (error) {
      Alert.alert('Error', 'Failed to save card. Please try again.');
      console.error('Error saving card:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = getStyles(isDark);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{isEditMode ? 'Edit Card' : 'Add New Card'}</Text>

      {/* Card Type */}
      <View style={styles.section}>
        <Text style={styles.label}>Card Type *</Text>
        <View style={styles.cardTypeContainer}>
          <TouchableOpacity
            style={[
              styles.cardTypeButton,
              cardType === 'Credit' && styles.cardTypeButtonActive,
            ]}
            onPress={() => handleSelectCardType('Credit')}
          >
            <Text
              style={[
                styles.cardTypeText,
                cardType === 'Credit' && styles.cardTypeTextActive,
              ]}
            >
              Credit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.cardTypeButton,
              cardType === 'Debit' && styles.cardTypeButtonActive,
            ]}
            onPress={() => handleSelectCardType('Debit')}
          >
            <Text
              style={[
                styles.cardTypeText,
                cardType === 'Debit' && styles.cardTypeTextActive,
              ]}
            >
              Debit
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Card Number */}
      <View style={styles.section}>
        <Text style={styles.label}>Card Number *</Text>
        <TextInput
          style={[styles.input, errors.cardNumber && styles.inputError]}
          value={cardNumber}
          onChangeText={setCardNumber}
          placeholder="1234 5678 9012 3456"
          placeholderTextColor={isDark ? '#666' : '#999'}
          keyboardType="numeric"
          maxLength={19} // 16 digits + 3 spaces
        />
        {errors.cardNumber && (
          <Text style={styles.errorText}>{errors.cardNumber}</Text>
        )}
      </View>

      {/* CVV */}
      <View style={styles.section}>
        <Text style={styles.label}>CVV *</Text>
        <TextInput
          style={[styles.input, errors.cvv && styles.inputError]}
          value={cvv}
          onChangeText={setCvv}
          placeholder="123"
          placeholderTextColor={isDark ? '#666' : '#999'}
          keyboardType="numeric"
          maxLength={4}
          secureTextEntry
        />
        {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
      </View>

      {/* Expiry Date */}
      <View style={styles.section}>
        <Text style={styles.label}>Expiry Date (MM/YY) *</Text>
        <TextInput
          style={[styles.input, errors.expiryDate && styles.inputError]}
          value={expiryDate}
          onChangeText={setExpiryDate}
          placeholder="12/25"
          placeholderTextColor={isDark ? '#666' : '#999'}
          keyboardType="numeric"
          maxLength={5}
        />
        {errors.expiryDate && (
          <Text style={styles.errorText}>{errors.expiryDate}</Text>
        )}
      </View>

      {/* Bank Name */}
      <View style={styles.section}>
        <Text style={styles.label}>Bank Name *</Text>
        <TextInput
          style={[styles.input, errors.bankName && styles.inputError]}
          value={bankName}
          onChangeText={setBankName}
          placeholder="Enter bank name"
          placeholderTextColor={isDark ? '#666' : '#999'}
        />
        {errors.bankName && (
          <Text style={styles.errorText}>{errors.bankName}</Text>
        )}
      </View>

      {/* Cardholder Name */}
      <View style={styles.section}>
        <Text style={styles.label}>Cardholder Name *</Text>
        <TextInput
          style={[styles.input, errors.cardholderName && styles.inputError]}
          value={cardholderName}
          onChangeText={setCardholderName}
          placeholder="John Doe"
          placeholderTextColor={isDark ? '#666' : '#999'}
      />
      {errors.cardholderName && (
        <Text style={styles.errorText}>{errors.cardholderName}</Text>
      )}
    </View>

      {cardType === 'Credit' && (
        <View style={styles.section}>
          <Text style={styles.label}>Bill Generation Day (Optional)</Text>
          <TextInput
            style={[styles.input, errors.billGenerationDay && styles.inputError]}
            value={billGenerationDay}
            onChangeText={(value) => {
              const sanitized = value.replace(/[^0-9]/g, '');
              setBillGenerationDay(sanitized);
            }}
            placeholder="e.g., 15"
            placeholderTextColor={isDark ? '#666' : '#999'}
            keyboardType="numeric"
            maxLength={2}
          />
          {errors.billGenerationDay && (
            <Text style={styles.errorText}>{errors.billGenerationDay}</Text>
          )}
        </View>
      )}

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.submitButton, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Save Card'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    content: {
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: 20,
    },
    section: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: isDark ? Colors.dark.inputBorder : '#ddd',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: isDark ? Colors.dark.text : Colors.light.text,
      backgroundColor: isDark ? Colors.dark.inputBackground : '#fff',
    },
    inputError: {
      borderColor: '#ff4444',
    },
    errorText: {
      color: '#ff4444',
      fontSize: 12,
      marginTop: 4,
    },
    cardTypeContainer: {
      flexDirection: 'row',
      gap: 10,
    },
    cardTypeButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? Colors.dark.inputBorder : '#ddd',
      alignItems: 'center',
      backgroundColor: isDark ? Colors.dark.inputBackground : '#fff',
    },
    cardTypeButtonActive: {
      borderColor: isDark ? Colors.dark.tint : Colors.light.tint,
      backgroundColor: isDark ? '#2A2A2A' : '#f0f0f0',
    },
    cardTypeText: {
      fontSize: 16,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    cardTypeTextActive: {
      fontWeight: '600',
      color: isDark ? Colors.dark.tint : Colors.light.tint,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 20,
    },
    button: {
      flex: 1,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: isDark ? Colors.dark.inputBackground : '#f0f0f0',
    },
    cancelButtonText: {
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontSize: 16,
      fontWeight: '600',
    },
    submitButton: {
      backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint,
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    buttonDisabled: {
      opacity: 0.5,
    },
  });
