/**
 * Card type definitions
 */

export interface Card {
  id: string; // Unique identifier (UUID)
  cardNumber: string; // Full card number (stored securely)
  cvv: string; // CVV (stored securely)
  expiryDate: string; // MM/YY format
  bankName: string; // Bank name
  cardVariant?: string; // Specific card variant (e.g., Signature, Millennia)
  cardholderName: string; // Cardholder name
  cardType: 'Credit' | 'Debit'; // Card type (required)
  billGenerationDay?: number | null; // Optional bill generation day (1-31) for credit cards
  billDueDay?: number | null; // Optional bill due day (1-31) for credit cards
  skipReminders?: boolean; // If true, do not generate reminders for this card
  usageCount: number; // Number of times card number is copied
  isPinned: boolean; // Whether card is pinned
  createdAt: number; // Creation timestamp (Unix timestamp)
  lastUsedAt: number; // Last usage timestamp (Unix timestamp)
  color?: string; // User-selected color (optional)
}

export type CardType = 'Credit' | 'Debit';
