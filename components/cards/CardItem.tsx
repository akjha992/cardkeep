import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/types/card.types';
import { copyToClipboard } from '@/utils/clipboard';
import { formatExpiryDate, maskCardNumber, removeSpacesFromCardNumber } from '@/utils/formatters';
import { getBillStatusMessage } from '@/utils/billing';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

const CARD_ASPECT_RATIO = 1.586;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = CARD_WIDTH / CARD_ASPECT_RATIO;

interface CardItemProps {
  card: Card;
  onCopy: (id: string) => void;
  onEdit: (card: Card) => void;
}

export default function CardItem({ card, onCopy, onEdit }: CardItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

  const billStatusMessage = useMemo(() => {
    if (card.cardType !== 'Credit' || typeof card.billGenerationDay !== 'number') {
      return null;
    }
    return getBillStatusMessage(card.billGenerationDay);
  }, [card.cardType, card.billGenerationDay]);

  const cardColors = card.color ? [card.color, card.color] : ['#2D2D2D', '#1A1A1A'];

  const handlePress = async () => {
    const cleanedCardNumber = removeSpacesFromCardNumber(card.cardNumber);
    await copyToClipboard(cleanedCardNumber);
    onCopy(card.id);
  };

  const handleLongPress = () => {
    onEdit(card);
  };

  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={180}
    >
      <LinearGradient colors={cardColors} style={styles.card}>
        {card.isPinned && (
          <View style={styles.pinIconAbsolute}>
            <Ionicons name="pin" size={20} color={Colors.dark.icon} />
          </View>
        )}
        <View style={styles.cardHeader}>
          <Text style={styles.bankName}>{card.bankName.toUpperCase()}</Text>
          <View style={styles.cardTypeRow}>
            <View style={styles.cardTypeBadge}>
              <Text style={styles.cardTypeText}>{card.cardType}</Text>
            </View>
            {billStatusMessage && (
              <Text style={styles.billDayText}>{billStatusMessage}</Text>
            )}
          </View>
        </View>

        <View style={styles.cardNumberContainer}>
          <Text style={styles.cardNumber}>{maskCardNumber(card.cardNumber)}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.label}>Card Holder</Text>
            <Text style={styles.value}>{card.cardholderName.toUpperCase()}</Text>
          </View>
          <View style={styles.footerRight}>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.label}>Expires</Text>
              <Text style={styles.value}>{formatExpiryDate(card.expiryDate)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', marginLeft: 20 }}>
              <Text style={styles.label}>CVV</Text>
              <Text style={styles.value}>{card.cvv}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 24,
      marginVertical: 8,
      height: CARD_HEIGHT,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    card: {
      flex: 1,
      borderRadius: 16,
      padding: 24,
      justifyContent: 'space-between',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    cardTypeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    cardTypeBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 4,
    },
    cardTypeText: {
      color: Colors.dark.text,
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    billDayText: {
      color: Colors.dark.text,
      fontSize: 10,
      fontWeight: '500',
    },
    bankName: {
      color: Colors.dark.text,
      fontSize: 16,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    cardNumber: {
      color: Colors.dark.text,
      fontSize: 22,
      letterSpacing: 2,
      fontFamily: Fonts.mono,
    },
    cardNumberContainer: {
      justifyContent: 'center',
      height: 30,
      marginTop: 5,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    footerRight: {
      flexDirection: 'row',
    },
    label: {
      color: Colors.dark.icon,
      fontSize: 10,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    value: {
      color: Colors.dark.text,
      fontSize: 14,
      fontWeight: '500',
      fontFamily: Fonts.mono,
    },
    pinIconAbsolute: {
      position: 'absolute',
      top: 10,
      right: 5,
      zIndex: 1,
    },
  });
