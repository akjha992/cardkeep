import { Card } from '@/types/card.types';
import { getCards as getStorageCards } from './storage.service';
import { CardSortOrder } from './preferences.service';

/**
 * Retrieves all cards from storage and applies sorting logic.
 * Pinned cards appear first, then cards are sorted by usage count (descending),
 * and finally by last used timestamp (most recent first) for cards with equal usage.
 * @returns A promise that resolves to an array of sorted Card objects.
 */
export async function getSortedCards(): Promise<Card[]> {
  const allCards = await getStorageCards();

  // Default: usage sort
  const pinnedCards = allCards.filter(card => card.isPinned);
  const unpinnedCards = allCards.filter(card => !card.isPinned);

  pinnedCards.sort((a, b) => b.lastUsedAt - a.lastUsedAt);
  unpinnedCards.sort(sortByUsage);

  return [...pinnedCards, ...unpinnedCards];
}

export function sortCards(cards: Card[], order: CardSortOrder): Card[] {
  const copy = [...cards];
  switch (order) {
    case 'bank':
      copy.sort((a, b) => a.bankName.localeCompare(b.bankName));
      break;
    case 'cardholder':
      copy.sort((a, b) => a.cardholderName.localeCompare(b.cardholderName));
      break;
    case 'recent':
      copy.sort((a, b) => b.createdAt - a.createdAt);
      break;
    case 'usage':
    default:
      copy.sort(sortByUsage);
      break;
  }
  return copy;
}

function sortByUsage(a: Card, b: Card) {
  if (a.usageCount !== b.usageCount) {
    return b.usageCount - a.usageCount;
  }
  return b.lastUsedAt - a.lastUsedAt;
}

/**
 * Filters cards by a search query, checking bank name and cardholder name.
 * The search is case-insensitive and matches if all query terms are found.
 * @param cards An array of Card objects to filter.
 * @param query The search query string.
 * @returns A new array of Card objects that match the query.
 */
function normalizeCardSearchFields(card: Card): string {
  const pieces = [
    card.bankName,
    card.cardVariant,
    card.cardholderName,
    card.cardType,
    card.cardNumber,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  return pieces.join(' ');
}

export function filterCards(cards: Card[], query: string): Card[] {
  if (!query.trim()) {
    return cards;
  }

  const searchTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return cards.filter((card) => {
    const haystack = normalizeCardSearchFields(card);
    return searchTerms.every((term) => haystack.includes(term));
  });
}
