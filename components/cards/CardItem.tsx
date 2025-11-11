import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/types/card.types';
import { formatCardNumber, formatExpiryDate, maskCardNumber } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

// Standard credit card ratio (85.60 × 53.98 mm)
const CARD_ASPECT_RATIO = 1.586;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48; // Full width minus horizontal padding
const CARD_HEIGHT = CARD_WIDTH / CARD_ASPECT_RATIO;

interface CardItemProps {
  card: Card;
  onDelete: (id: string) => void;
}

export default function CardItem({ card, onDelete }: CardItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isRevealed, setIsRevealed] = useState(false);
  const opacity = useSharedValue(0);

  const toggleReveal = () => {
    setIsRevealed(!isRevealed);
    opacity.value = withTiming(isRevealed ? 0 : 1, { duration: 300 });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(card.id) },
      ],
      { cancelable: true }
    );
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const maskedAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - opacity.value,
    };
  });

  const styles = getStyles(isDark);
  const cardColors = card.color ? [card.color, card.color] : ['#2D2D2D', '#1A1A1A'];

  return (
    <TouchableOpacity style={styles.container} onPress={toggleReveal} activeOpacity={0.9}>
      <LinearGradient colors={cardColors} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.bankName}>{card.bankName.toUpperCase()}</Text>
        </View>

        <View style={styles.cardNumberContainer}>
          <Animated.View style={[styles.cardNumberOverlay, maskedAnimatedStyle]}>
            <Text style={styles.cardNumber}>{maskCardNumber(card.cardNumber)}</Text>
          </Animated.View>
          <Animated.View style={animatedStyle}>
            <Text style={styles.cardNumber}>{formatCardNumber(card.cardNumber)}</Text>
          </Animated.View>
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

        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color={Colors.dark.text} />
        </TouchableOpacity>

        <View style={styles.cardTypeBadge}>
          <Text style={styles.cardTypeText}>{card.cardType}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 24,
      marginVertical: 8,
      height: CARD_HEIGHT,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
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
      alignItems: 'center',
    },
    bankName: {
      color: Colors.dark.text,
      fontSize: 16,
      fontWeight: 'bold',
      letterSpacing: 1,
      flex: 1, // Allow bank name to take up space
      marginRight: 60, // Add margin to avoid overlapping with badge
    },
    deleteButton: {
      position: 'absolute',
      top: 55,
      right: 24,
      padding: 5,
      zIndex: 1,
    },
    bankLogo: {
      width: 40,
      height: 40,
      resizeMode: 'contain',
    },
    cardNumber: {
      color: Colors.dark.text,
      fontSize: 22,
      letterSpacing: 2,
      fontFamily: Fonts.mono,
    },
    cardNumberContainer: {
      justifyContent: 'center',
      height: 30, // Fixed height to prevent layout shift
      marginTop: 5,
    },
    cardNumberOverlay: {
      position: 'absolute',
      width: '100%',
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
    cardTypeBadge: {
      position: 'absolute',
      top: 22,
      right: 24,
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
  });
