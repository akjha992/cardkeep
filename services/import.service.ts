import { Card } from '@/types/card.types';
import { decrypt, generateHash } from '@/utils/crypto';
import { removeSpacesFromCardNumber } from '@/utils/formatters';
import * as FileSystem from 'expo-file-system/legacy';

import { getCards, setCards } from './storage.service';

interface ImportBundle {
  version: number;
  exportedAt: number;
  cards: Card[];
  hash: string;
}

export interface ImportSummary {
  imported: number;
  duplicates: number;
}

const EXPECTED_VERSION = 1;

export async function importCardData(fileUri: string, password: string): Promise<ImportSummary> {
  if (!password) {
    throw new Error('Password is required to import data.');
  }

  const encryptedPayload = await FileSystem.readAsStringAsync(fileUri);
  const decrypted = await decrypt(encryptedPayload, password);

  let bundle: ImportBundle;
  try {
    bundle = JSON.parse(decrypted) as ImportBundle;
  } catch (error) {
    throw new Error('Import file is corrupt or invalid.');
  }

  if (!bundle || !Array.isArray(bundle.cards) || typeof bundle.hash !== 'string') {
    throw new Error('Import file is missing required fields.');
  }

  if (bundle.version !== EXPECTED_VERSION) {
    throw new Error('Import file version is not supported.');
  }

  const cardsJson = JSON.stringify(bundle.cards);
  const computedHash = await generateHash(cardsJson);
  if (computedHash !== bundle.hash) {
    throw new Error('Import file failed integrity verification.');
  }

  const existingCards = await getCards();
  const normalizedNumbers = new Set(
    existingCards.map((card) => removeSpacesFromCardNumber(card.cardNumber))
  );

  const newCards: Card[] = [];
  let duplicates = 0;

  for (const card of bundle.cards) {
    if (!card?.cardNumber) {
      duplicates += 1;
      continue;
    }

    const normalizedNumber = removeSpacesFromCardNumber(card.cardNumber);
    if (!normalizedNumber || normalizedNumbers.has(normalizedNumber)) {
      duplicates += 1;
      continue;
    }

    normalizedNumbers.add(normalizedNumber);
    const billGenerationDay =
      card.cardType === 'Credit' && typeof card.billGenerationDay === 'number'
        ? card.billGenerationDay
        : null;
    const billingPeriodDays =
      card.cardType === 'Credit'
        ? typeof card.billingPeriodDays === 'number'
          ? card.billingPeriodDays
          : typeof card.billDueDay === 'number'
            ? card.billDueDay
            : null
        : null;

    const customReminders = Array.isArray(card.customReminders)
      ? card.customReminders
          .map((reminder) => {
            if (!reminder || typeof reminder.dayOfMonth !== 'number' || !reminder.label) {
              return null;
            }
            return {
              id: reminder.id ?? normalizedNumber + '-' + reminder.dayOfMonth,
              dayOfMonth: Math.min(Math.max(1, reminder.dayOfMonth), 31),
              label: String(reminder.label).trim(),
            };
          })
          .filter((value): value is NonNullable<typeof value> => Boolean(value))
      : [];

    newCards.push({
      ...card,
      cardNumber: normalizedNumber,
      billGenerationDay,
      billingPeriodDays,
      customReminders,
    });
  }

  if (newCards.length > 0) {
    await setCards([...existingCards, ...newCards]);
  }

  return {
    imported: newCards.length,
    duplicates,
  };
}
