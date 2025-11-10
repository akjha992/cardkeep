/**
 * Main Cards List Screen
 */

import React, { useState, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '@/types/card.types';
import { getCards } from '@/services/storage.service';
import CardList from '@/components/cards/CardList';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [cards, setCards] = useState<Card[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadCards = useCallback(async () => {
    try {
      const loadedCards = await getCards();
      setCards(loadedCards);
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  }, []);

  // Load cards when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [loadCards])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCards();
    setRefreshing(false);
  }, [loadCards]);

  const handleAddCard = () => {
    router.push('/add-card');
  };

  const styles = getStyles(isDark);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CardList cards={cards} onRefresh={handleRefresh} refreshing={refreshing} />

      <TouchableOpacity style={styles.fab} onPress={handleAddCard}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    fab: {
      position: 'absolute',
      right: 20,
      bottom: 80, // Increased bottom margin to avoid tab bar
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      zIndex: 1000,
    },
    fabText: {
      color: '#fff',
      fontSize: 24,
      fontWeight: 'bold',
    },
  });
