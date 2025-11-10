/**
 * Card type definitions
 */

export interface Card {
  id: string; // Unique identifier (UUID)
  cardNumber: string; // Full card number (stored securely)
  cvv: string; // CVV (stored securely)
  expiryDate: string; // MM/YY format
  bankName: string; // Bank name
  cardholderName: string; // Cardholder name
  cardType: 'Credit' | 'Debit'; // Card type (required)
  usageCount: number; // Number of times card number is copied
  isPinned: boolean; // Whether card is pinned
  createdAt: number; // Creation timestamp (Unix timestamp)
  lastUsedAt: number; // Last usage timestamp (Unix timestamp)
  color?: string; // User-selected color (optional)
}

export type CardType = 'Credit' | 'Debit';

