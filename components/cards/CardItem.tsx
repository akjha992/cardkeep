/**
 * Card Item Component
 * Basic card display component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/types/card.types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CardItemProps {
  card: Card;
}

export default function CardItem({ card }: CardItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Mask card number (show last 4 digits)
  const maskCardNumber = (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.length <= 4) return cleaned;
    const last4 = cleaned.slice(-4);
    return `**** **** **** ${last4}`;
  };

  const styles = getStyles(isDark);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.bankName}>{card.bankName}</Text>
          <Text style={styles.cardType}>{card.cardType}</Text>
        </View>

        <View style={styles.cardNumberContainer}>
          <Text style={styles.cardNumber}>{maskCardNumber(card.cardNumber)}</Text>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.label}>Cardholder Name</Text>
            <Text style={styles.value}>{card.cardholderName}</Text>
          </View>
          <View>
            <Text style={styles.label}>Expiry</Text>
            <Text style={styles.value}>{card.expiryDate}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    card: {
      backgroundColor: isDark ? Colors.dark.cardBackground : '#fff',
      borderRadius: 12,
      padding: 20,
      borderWidth: 1,
      borderColor: isDark ? Colors.dark.cardBorder : '#e0e0e0',
      minHeight: 200,
      justifyContent: 'space-between',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    bankName: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    cardType: {
      fontSize: 14,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
      textTransform: 'uppercase',
    },
    cardNumberContainer: {
      marginVertical: 20,
    },
    cardNumber: {
      fontSize: 24,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
      letterSpacing: 2,
      fontFamily: 'monospace',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    label: {
      fontSize: 12,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
      marginBottom: 4,
    },
    value: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
  });

