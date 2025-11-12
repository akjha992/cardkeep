/**
 * Storage service for managing card data
 * Uses AsyncStorage for all data (SecureStore will be added later for better security)
 * For V1, using AsyncStorage for simplicity - can be upgraded to SecureStore later
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from '@/types/card.types';

const CARDS_STORAGE_KEY = 'cards_data';

/**
 * Save a card to storage
 */
export async function saveCard(card: Card): Promise<void> {
  try {
    const cards = await getCards();
    const existingIndex = cards.findIndex((c) => c.id === card.id);

    if (existingIndex >= 0) {
      cards[existingIndex] = card;
    } else {
      cards.push(card);
    }

    await AsyncStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
  } catch (error) {
    console.error('Error saving card:', error);
    throw new Error('Failed to save card. Please try again.');
  }
}

/**
 * Get all cards from storage
 */
export async function getCards(): Promise<Card[]> {
  try {
    const cardsJson = await AsyncStorage.getItem(CARDS_STORAGE_KEY);
    if (!cardsJson) {
      return [];
    }
    return JSON.parse(cardsJson);
  } catch (error) {
    console.error('Error getting cards:', error);
    throw new Error('Failed to load cards. Please try again.');
  }
}

/**
 * Update a card
 */
export async function updateCard(id: string, updates: Partial<Card>): Promise<void> {
  try {
    const cards = await getCards();
    const cardIndex = cards.findIndex((c) => c.id === id);

    if (cardIndex === -1) {
      throw new Error('Card not found');
    }

    const updatedCard = { ...cards[cardIndex], ...updates };
    cards[cardIndex] = updatedCard;

    await AsyncStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
  } catch (error) {
    console.error('Error updating card:', error);
    throw new Error('Failed to update card. Please try again.');
  }
}

/**
 * Delete a card
 */
export async function deleteCard(id: string): Promise<void> {
  try {
    const cards = await getCards();
    const filteredCards = cards.filter((c) => c.id !== id);
    await AsyncStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(filteredCards));
  } catch (error) {
    console.error('Error deleting card:', error);
    throw new Error('Failed to delete card. Please try again.');
  }
}

/**
 * Increment usage count for a card
 */
export async function incrementUsage(id: string): Promise<void> {
  try {
    const cards = await getCards();
    const card = cards.find((c) => c.id === id);

    if (!card) {
      throw new Error('Card not found');
    }

    await updateCard(id, {
      usageCount: card.usageCount + 1,
      lastUsedAt: Date.now(),
    });
  } catch (error) {
    console.error('Error incrementing usage:', error);
    throw new Error('Failed to update usage. Please try again.');
  }
} // Added closing curly brace for incrementUsage

/**
 * Toggle pin status for a card
 */
export async function togglePin(id: string): Promise<void> {
  try {
    const cards = await getCards();
    const card = cards.find((c) => c.id === id);

    if (!card) {
      throw new Error('Card not found');
    }

    await updateCard(id, {
      isPinned: !card.isPinned,
    });
  } catch (error) {
    console.error('Error toggling pin:', error);
    throw new Error('Failed to toggle pin. Please try again.');
  }
}
