/**
 * Main Cards List Screen
 */

import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '@/types/card.types';
import { deleteCard, incrementUsage, togglePin } from '@/services/storage.service';
import { getSortedCards, filterCards } from '@/services/cards.service';
import CardList from '@/components/cards/CardList';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToast } from '@/components/ui/Toast';
import * as Haptics from 'expo-haptics';
import { SearchBar } from '@/components/ui/SearchBar';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { showToast } = useToast();

  const [cards, setCards] = useState<Card[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadCards = useCallback(async () => {
    try {
      const loadedCards = await getSortedCards();
      setCards(loadedCards);
    } catch (error) {
      console.error('Error loading cards:', error);
      showToast({ message: 'Failed to load cards.', type: 'error' });
    }
  }, [showToast]);

  // Load cards when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [loadCards])
  );

  const filteredCards = useMemo(() => {
    return filterCards(cards, searchQuery);
  }, [cards, searchQuery]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCards();
    setRefreshing(false);
  }, [loadCards]);

  const handleAddCard = () => {
    router.push('/add-card');
  };

  const handleEditCard = (card: Card) => {
    router.push({
      pathname: '/add-card',
      params: { id: card.id },
    });
  };

  const handleDeleteCard = async (id: string) => {
    try {
      await deleteCard(id);
      await loadCards(); // Refresh the list
      showToast({ message: 'Card deleted successfully!', type: 'success' });
    } catch (error) {
      console.error('Error deleting card:', error);
      showToast({ message: 'Failed to delete card.', type: 'error' });
    }
  };

  const handleCopyCard = async (id: string) => {
    try {
      await incrementUsage(id);
      await loadCards(); // Refresh the list to reflect new usage count
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast({ message: 'Card number copied!', type: 'success' });
    } catch (error) {
      console.error('Error copying card:', error);
      showToast({ message: 'Failed to copy card number.', type: 'error' });
    }
  };

  const handleTogglePinCard = async (id: string) => {
    try {
      await togglePin(id);
      await loadCards(); // Refresh the list to reflect new pin status
      showToast({ message: 'Card pin status updated!', type: 'success' });
    } catch (error) {
      console.error('Error toggling pin:', error);
      showToast({ message: 'Failed to update card pin status.', type: 'error' });
    }
  };

  const styles = getStyles(isDark);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SearchBar onSearch={setSearchQuery} />
      <CardList
        cards={filteredCards}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onDeleteCard={handleDeleteCard}
        onCopyCard={handleCopyCard}
        onTogglePinCard={handleTogglePinCard}
        onEditCard={handleEditCard}
      />

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
