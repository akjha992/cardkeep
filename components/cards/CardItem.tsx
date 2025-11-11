import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/types/card.types';
import { formatCardNumber, formatExpiryDate, maskCardNumber, removeSpacesFromCardNumber } from '@/utils/formatters';
import { copyToClipboard } from '@/utils/clipboard';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View, Alert, Pressable, Modal } from 'react-native';

// Standard credit card ratio (85.60 × 53.98 mm)
const CARD_ASPECT_RATIO = 1.586;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48; // Full width minus horizontal padding
const CARD_HEIGHT = CARD_WIDTH / CARD_ASPECT_RATIO;

interface CardItemProps {
  card: Card;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
}

export default function CardItem({ card, onDelete, onCopy }: CardItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handlePress = async () => {
    const cleanedCardNumber = removeSpacesFromCardNumber(card.cardNumber);
    await copyToClipboard(cleanedCardNumber);
    onCopy(card.id);
  };

  const handleDelete = () => {
    setIsMenuVisible(false);
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

  const handleLongPress = () => {
    setIsMenuVisible(true);
  };

  const styles = getStyles(isDark);
  const cardColors = card.color ? [card.color, card.color] : ['#2D2D2D', '#1A1A1A'];

  return (
    <>
      <Pressable
        style={styles.container}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={200}
      >
        <LinearGradient colors={cardColors} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.bankName}>{card.bankName.toUpperCase()}</Text>
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

          <View style={styles.cardTypeBadge}>
            <Text style={styles.cardTypeText}>{card.cardType}</Text>
          </View>
        </LinearGradient>
      </Pressable>

      <Modal
        transparent={true}
        animationType="fade"
        visible={isMenuVisible}
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={22} color={Colors.dark.text} />
              <Text style={styles.menuText}>Delete</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={[styles.menuItem, styles.disabledMenuItem]} disabled>
              <Ionicons name="pin-outline" size={22} color={Colors.dark.icon} />
              <Text style={[styles.menuText, styles.disabledMenuText]}>Pin</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
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
      flex: 1,
      marginRight: 60,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuContainer: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 14,
      padding: 8,
      width: 250,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    disabledMenuItem: {
      opacity: 0.5,
    },
    menuText: {
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontSize: 17,
      marginLeft: 16,
    },
    disabledMenuText: {
      color: isDark ? Colors.dark.icon : Colors.light.icon,
    },
    menuDivider: {
      height: 1,
      backgroundColor: isDark ? '#3A3A3C' : '#E5E5EA',
      marginHorizontal: 16,
    },
  });
