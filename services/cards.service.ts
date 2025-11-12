import { Card } from '@/types/card.types';
import { getCards as getStorageCards } from './storage.service';

/**
 * Retrieves all cards from storage and applies sorting logic.
 * Pinned cards appear first, then cards are sorted by usage count (descending),
 * and finally by last used timestamp (most recent first) for cards with equal usage.
 * @returns A promise that resolves to an array of sorted Card objects.
 */
export async function getSortedCards(): Promise<Card[]> {
  const allCards = await getStorageCards();

  // Separate pinned and unpinned cards
  const pinnedCards = allCards.filter(card => card.isPinned);
  const unpinnedCards = allCards.filter(card => !card.isPinned);

  // Sort pinned cards: by lastUsedAt (most recent first)
  pinnedCards.sort((a, b) => b.lastUsedAt - a.lastUsedAt);

  // Sort unpinned cards:
  // 1. By usageCount (descending)
  // 2. Then by lastUsedAt (most recent first)
  unpinnedCards.sort((a, b) => {
    if (a.usageCount !== b.usageCount) {
      return b.usageCount - a.usageCount; // Higher usage first
    }
    return b.lastUsedAt - a.lastUsedAt; // More recent first
  });

  // Combine pinned and sorted unpinned cards
  return [...pinnedCards, ...unpinnedCards];
}

/**
 * Filters cards by a search query, checking bank name and cardholder name.
 * The search is case-insensitive and matches if all query terms are found.
 * @param cards An array of Card objects to filter.
 * @param query The search query string.
 * @returns A new array of Card objects that match the query.
 */
export function filterCards(cards: Card[], query: string): Card[] {
  if (!query) {
    return cards;
  }

  const searchTerms = query.toLowerCase().split(' ').filter(term => term);

  return cards.filter(card => {
    const cardInfo = `${card.bankName.toLowerCase()} ${card.cardholderName.toLowerCase()}`;
    return searchTerms.every(term => cardInfo.includes(term));
  });
}
