import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/types/card.types';
import { getBillStatusMessage } from '@/utils/billing';
import { copyToClipboard } from '@/utils/clipboard';
import { formatExpiryDate, maskCardNumber, removeSpacesFromCardNumber } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useRef } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

const CARD_ASPECT_RATIO = 1.586;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = CARD_WIDTH / CARD_ASPECT_RATIO;
const ACCENT_COLORS = ['#F2994A', '#6DD5FA', '#A78BFA', '#34D399', '#F472B6'];

const pickAccentColor = (seed: string) => {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return ACCENT_COLORS[hash % ACCENT_COLORS.length];
};

interface CardItemProps {
  card: Card;
  onCopy: (id: string) => void;
  onEdit: (card: Card) => void;
}

export default function CardItem({ card, onCopy, onEdit }: CardItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  const scale = useRef(new Animated.Value(1)).current;

  const billStatusMessage = useMemo(() => {
    if (card.cardType !== 'Credit' || typeof card.billGenerationDay !== 'number') {
      return null;
    }
    return getBillStatusMessage(card.billGenerationDay);
  }, [card.cardType, card.billGenerationDay]);

  const cardColors = card.color ? [card.color, card.color] : ['#2D2D2D', '#1A1A1A'];
  const accentColor = useMemo(() => pickAccentColor(`${card.bankName}-${card.id}`), [card.bankName, card.id]);

  const handlePress = async () => {
    const cleanedCardNumber = removeSpacesFromCardNumber(card.cardNumber);
    await copyToClipboard(cleanedCardNumber);
    onCopy(card.id);
  };

  const handleLongPress = () => {
    onEdit(card);
  };

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  return (
    <Pressable
      style={styles.pressable}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={180}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.cardWrapper, { transform: [{ scale }] }]}>
        <LinearGradient colors={cardColors} style={styles.card}>
          <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
          {card.isPinned && (
            <View style={styles.pinIconAbsolute}>
              <Ionicons name="pin" size={20} color={Colors.dark.icon} />
            </View>
          )}
          <View style={styles.cardHeader}>
            <Text style={styles.bankName}>{card.bankName.toUpperCase()}</Text>
            <View style={styles.cardMetaColumn}>
              <View style={styles.cardTypeBadge}>
                <Text style={styles.cardTypeText}>{card.cardType}</Text>
              </View>
              {billStatusMessage && (
                <View style={styles.billChip}>
                  <Ionicons name="time-outline" size={12} color={Colors.dark.text} />
                  <Text style={styles.billDayText}>{billStatusMessage}</Text>
                </View>
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
      </Animated.View>
    </Pressable>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    pressable: {
      marginHorizontal: 24,
      marginVertical: 8,
      height: CARD_HEIGHT,
    },
    cardWrapper: {
      flex: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 6,
      borderRadius: 20,
    },
    card: {
      flex: 1,
      borderRadius: 20,
      padding: 24,
      justifyContent: 'space-between',
      overflow: 'hidden',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    cardMetaColumn: {
      alignItems: 'flex-end',
      gap: 6,
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
    billChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 2,
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 999,
    },
    billDayText: {
      color: Colors.dark.text,
      fontSize: 10,
      fontWeight: '600',
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
      top: 12,
      right: 10,
      zIndex: 1,
    },
    accentBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 6,
      opacity: 0.9,
    },
  });
