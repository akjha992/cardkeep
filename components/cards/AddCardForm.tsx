/**
 * Add Card Form Component
 * Basic form for adding a new card
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { saveCard } from '@/services/storage.service';
import { updateAppPreferences } from '@/services/preferences.service';
import { Card, CardType } from '@/types/card.types';
import { formatCardNumber } from '@/utils/formatters';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import 'react-native-get-random-values';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_DUE_WINDOW_DAYS = 15;

const KNOWN_BANK_DUE_WINDOWS: { pattern: RegExp; window: number }[] = [
  { pattern: /hdfc/i, window: 20 },
  { pattern: /icici/i, window: 18 },
  { pattern: /axis/i, window: 20 },
  { pattern: /sbi/i, window: 20 },
  { pattern: /american express|amex/i, window: 25 },
];

function getDueWindowForBank(bankName: string) {
  const normalized = bankName.trim();
  const match = KNOWN_BANK_DUE_WINDOWS.find(({ pattern }) => pattern.test(normalized));
  return match?.window ?? DEFAULT_DUE_WINDOW_DAYS;
}

function clampDay(day: number) {
  if (Number.isNaN(day)) return 1;
  return Math.min(Math.max(1, day), 31);
}

function addWindowToBillDay(billDay: number, windowDays: number) {
  if (!billDay) return '';
  let candidate = billDay + windowDays;
  while (candidate > 31) {
    candidate -= 31;
  }
  return clampDay(candidate);
}

function suggestDueDay(billDay: number, bankName: string) {
  return addWindowToBillDay(billDay, getDueWindowForBank(bankName));
}

interface AddCardFormProps {
  onSave: () => void;
  onCancel: () => void;
  initialCard?: Card;
  mode?: 'add' | 'edit';
  defaultCardType?: CardType;
}

export default function AddCardForm({
  onSave,
  onCancel,
  initialCard,
  mode = 'add',
  defaultCardType = 'Credit',
}: AddCardFormProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isEditMode = mode === 'edit' || Boolean(initialCard);
  const insets = useSafeAreaInsets();

  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [bankName, setBankName] = useState('');
  const [cardVariant, setCardVariant] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [cardType, setCardType] = useState<CardType>(defaultCardType);
  const [billGenerationDay, setBillGenerationDay] = useState('');
  const [billDueDay, setBillDueDay] = useState('');
  const [isDueDayManual, setIsDueDayManual] = useState(false);
  const [skipReminders, setSkipReminders] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numericBillDay = useMemo(() => {
    const trimmed = billGenerationDay.trim();
    if (!trimmed) {
      return null;
    }
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? null : parsed;
  }, [billGenerationDay]);

  const suggestedWindowDays = useMemo(() => getDueWindowForBank(bankName), [bankName]);

  useEffect(() => {
    if (!initialCard) {
      return;
    }

    setCardNumber(formatCardNumber(initialCard.cardNumber));
    setCvv(initialCard.cvv);
    setExpiryDate(initialCard.expiryDate);
    setBankName(initialCard.bankName);
    setCardholderName(initialCard.cardholderName);
    setCardVariant(initialCard.cardVariant ?? '');
    setSkipReminders(Boolean(initialCard.skipReminders));
    setCardType(initialCard.cardType);
    if (initialCard.cardType === 'Credit' && typeof initialCard.billGenerationDay === 'number') {
      setBillGenerationDay(String(initialCard.billGenerationDay));
    } else {
      setBillGenerationDay('');
    }
    if (initialCard.cardType === 'Credit' && typeof initialCard.billDueDay === 'number') {
      setBillDueDay(String(initialCard.billDueDay));
      setIsDueDayManual(true);
    } else {
      setBillDueDay('');
      setIsDueDayManual(false);
    }
  }, [initialCard]);

  useEffect(() => {
    if (!isEditMode) {
      setCardType(defaultCardType);
    }
  }, [defaultCardType, isEditMode]);

  const handleSelectCardType = (type: CardType) => {
    setCardType(type);
    if (type === 'Debit') {
      setBillGenerationDay('');
      setBillDueDay('');
      setIsDueDayManual(false);
      setErrors(prev => {
        if (!prev.billGenerationDay) return prev;
        const next = { ...prev };
        delete next.billGenerationDay;
        delete next.billDueDay;
        return next;
      });
    }
  };

  const handleBillDayChange = (value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    setBillGenerationDay(sanitized);
    if (!sanitized) {
      setBillDueDay('');
      setIsDueDayManual(false);
    }
  };

  const handleDueDayChange = (value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    setBillDueDay(sanitized);
    setIsDueDayManual(Boolean(sanitized));
    setErrors((prev) => {
      if (!prev.billDueDay) return prev;
      const next = { ...prev };
      delete next.billDueDay;
      return next;
    });
  };
  
  useEffect(() => {
    if (cardType !== 'Credit') {
      return;
    }
    if (!numericBillDay) {
      setBillDueDay('');
      setIsDueDayManual(false);
      return;
    }
    if (isDueDayManual) {
      return;
    }
    const autoDue = suggestDueDay(numericBillDay, bankName);
    setBillDueDay(String(autoDue));
  }, [cardType, numericBillDay, bankName, isDueDayManual]);

  const handleExpiryChange = (value: string) => {
    const digitsOnly = value.replace(/[^0-9]/g, '').slice(0, 4);
    if (digitsOnly.length <= 2) {
      setExpiryDate(digitsOnly);
      return;
    }
    const formatted = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
    setExpiryDate(formatted);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Card number validation (basic - just check length for now)
    const sanitizedCardNumber = cardNumber.replace(/\s/g, '');
    if (!sanitizedCardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d+$/.test(sanitizedCardNumber)) {
      newErrors.cardNumber = 'Card number must contain only digits';
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
    if (!cardVariant.trim()) {
      newErrors.cardVariant = 'Card variant is required';
    }

    // Cardholder name validation
    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    if (cardType === 'Credit') {
      if (billGenerationDay.trim()) {
        const day = Number(billGenerationDay.trim());
        if (Number.isNaN(day) || day < 1 || day > 31) {
          newErrors.billGenerationDay = 'Bill generation day must be between 1 and 31';
        }
      }
      if (billDueDay.trim()) {
        const day = Number(billDueDay.trim());
        if (Number.isNaN(day) || day < 1 || day > 31) {
          newErrors.billDueDay = 'Bill due day must be between 1 and 31';
        }
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
            cardVariant: '',
            cardholderName: '',
            cardType,
            billGenerationDay: null,
            billDueDay: null,
            skipReminders: false,
            usageCount: 0,
            isPinned: false,
            createdAt: now,
            lastUsedAt: now,
          };

      const parsedBillDay =
        cardType === 'Credit' && billGenerationDay.trim()
          ? Number(billGenerationDay.trim())
          : null;

      const parsedBillDueDay =
        cardType === 'Credit' && billDueDay.trim() ? Number(billDueDay.trim()) : null;

      const newCard: Card = {
        ...baseCard,
        cardNumber: cleanCardNumber,
        cvv: cvv.trim(),
        expiryDate: expiryDate.trim(),
        bankName: bankName.trim(),
        cardVariant: cardVariant.trim(),
        cardholderName: cardholderName.trim(),
        cardType,
        billGenerationDay: cardType === 'Credit' ? parsedBillDay : null,
        billDueDay: cardType === 'Credit' ? parsedBillDueDay : null,
        skipReminders,
      };

      await saveCard(newCard);
      if (!isEditMode) {
        await updateAppPreferences({ defaultCardType: cardType });
      }
      onSave();
    } catch (error) {
      Alert.alert('Error', 'Failed to save card. Please try again.');
      console.error('Error saving card:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = getStyles(isDark, insets.bottom);
  const usageInfo = isEditMode && initialCard ? (
    <View style={styles.usagePanel}>
      <Text style={styles.usageDetail}>
        Copied {initialCard.usageCount} time{initialCard.usageCount === 1 ? '' : 's'}
      </Text>
      {initialCard.lastUsedAt ? (
        <Text style={styles.usageSubdetail}>
          Last used {new Date(initialCard.lastUsedAt).toLocaleString()}
        </Text>
      ) : null}
    </View>
  ) : null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
    >
      <ScrollView
        style={styles.formScroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
      <View style={styles.titleRow}>
        <Text style={styles.title}>{isEditMode ? 'Edit Card' : 'Add New Card'}</Text>
        {usageInfo}
      </View>

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
          onChangeText={handleExpiryChange}
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

      {/* Card Variant */}
      <View style={styles.section}>
        <Text style={styles.label}>Card Variant *</Text>
        <TextInput
          style={[styles.input, errors.cardVariant && styles.inputError]}
          value={cardVariant}
          onChangeText={setCardVariant}
          placeholder="e.g., Signature, Millennia"
          placeholderTextColor={isDark ? '#666' : '#999'}
        />
        {errors.cardVariant && <Text style={styles.errorText}>{errors.cardVariant}</Text>}
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
            onChangeText={handleBillDayChange}
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

      {cardType === 'Credit' && (
        <View style={styles.section}>
          <Text style={styles.label}>Bill Due Day (Optional)</Text>
          <TextInput
            style={[styles.input, errors.billDueDay && styles.inputError]}
            value={billDueDay}
            onChangeText={handleDueDayChange}
            placeholder={
              numericBillDay ? String(addWindowToBillDay(numericBillDay, suggestedWindowDays)) : 'e.g., 5'
            }
            placeholderTextColor={isDark ? '#666' : '#999'}
            keyboardType="numeric"
            maxLength={2}
          />
          <Text style={styles.helperText}>
            Auto-filled ~{suggestedWindowDays} day(s) after your statement. Adjust if your bank uses a different
            window.
          </Text>
          {errors.billDueDay && <Text style={styles.errorText}>{errors.billDueDay}</Text>}
        </View>
      )}

      {!isEditMode && (
        <View style={styles.section}>
          <Text style={styles.label}>Reminders</Text>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle}>Receive reminders</Text>
              <Text style={styles.switchSubtitle}>
                Turn off to permanently skip statement, due, and renewal alerts.
              </Text>
            </View>
            <Switch
              value={!skipReminders}
              onValueChange={(value) => setSkipReminders(!value)}
              trackColor={{
                false: isDark ? '#3A3A3A' : '#D1D1D1',
                true: isDark ? Colors.dark.tint : Colors.light.tint,
              }}
              thumbColor="#fff"
            />
          </View>
        </View>
      )}
      </ScrollView>
      <View style={styles.buttonBar}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: Colors.light.tint },
            isSubmitting && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Save Card'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (isDark: boolean, bottomInset: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    formScroll: {
      flex: 1,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? Colors.dark.text : Colors.light.text,
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
    helperText: {
      fontSize: 12,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
      marginTop: 6,
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
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    switchTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    switchSubtitle: {
      marginTop: 4,
      fontSize: 13,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
    },
    usagePanel: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: isDark ? Colors.dark.inputBorder : '#ddd',
      backgroundColor: isDark ? Colors.dark.cardBackground ?? '#1a1a1a' : '#f5f5f5',
      marginLeft: 12,
    },
    usageDetail: {
      fontSize: 12,
      fontWeight: '500',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    usageSubdetail: {
      fontSize: 10,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
    },
    buttonBar: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: Math.max(bottomInset, 16),
      borderTopWidth: 1,
      borderTopColor: isDark ? Colors.dark.inputBorder : '#e0e0e0',
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
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
    submitButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    buttonDisabled: {
      opacity: 0.5,
    },
  });
