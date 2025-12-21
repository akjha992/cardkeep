import { Card } from '@/types/card.types';
import { getGlobalCustomReminders, GlobalCustomReminder } from './reminders.service';
import { encrypt, generateHash } from '@/utils/crypto';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { getCards } from './storage.service';

const EXPORT_FILE_NAME = 'cardvault-export.json';
const MIME_TYPE = 'application/json';
const EXPORT_VERSION = 2;

type ExportBundle = {
  version: number;
  exportedAt: number;
  cards: Card[];
  globalCustomReminders: GlobalCustomReminder[];
  hash: string;
};

function sanitizeCard(card: Card): Card {
  return {
    ...card,
    usageCount: 0,
    lastUsedAt: 0,
  };
}

async function createBundle(includeUsage: boolean): Promise<{ bundle: ExportBundle; serialized: string }> {
  const [cards, globalCustomReminders] = await Promise.all([getCards(), getGlobalCustomReminders()]);
  const cardsForExport = includeUsage ? cards : cards.map(sanitizeCard);
  const payloadForHash = JSON.stringify({ cards: cardsForExport, globalCustomReminders });
  const hash = await generateHash(payloadForHash);
  const bundle: ExportBundle = {
    version: EXPORT_VERSION,
    exportedAt: Date.now(),
    cards: cardsForExport,
    globalCustomReminders,
    hash,
  };
  return { bundle, serialized: JSON.stringify(bundle) };
}

async function saveOnAndroid(encryptedPayload: string) {
  if (!FileSystem.StorageAccessFramework) {
    throw new Error('Storage Access Framework is not available on this device.');
  }

  const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!permissions.granted) {
    throw new Error('Storage permission was not granted.');
  }

  const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
    permissions.directoryUri,
    EXPORT_FILE_NAME,
    MIME_TYPE
  );

  await FileSystem.StorageAccessFramework.writeAsStringAsync(fileUri, encryptedPayload);
}

async function shareFile(tempFileUri: string) {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Sharing is not available on this platform.');
  }

  await Sharing.shareAsync(tempFileUri, {
    dialogTitle: 'Export Card Data',
    mimeType: MIME_TYPE,
    UTI: 'public.json',
  });
}

interface ExportOptions {
  includeUsage?: boolean;
}

export async function exportCardData(password: string, options: ExportOptions = {}): Promise<void> {
  if (!password) {
    throw new Error('Password is required to export data.');
  }

  const includeUsage = options.includeUsage ?? true;
  const { serialized } = await createBundle(includeUsage);
  const encryptedPayload = await encrypt(serialized, password);
  const tempFileUri = `${FileSystem.cacheDirectory}${EXPORT_FILE_NAME}`;

  await FileSystem.writeAsStringAsync(tempFileUri, encryptedPayload);

  try {
    if (Platform.OS === 'android') {
      await saveOnAndroid(encryptedPayload);
    } else {
      await shareFile(tempFileUri);
    }
  } finally {
    try {
      await FileSystem.deleteAsync(tempFileUri, { idempotent: true });
    } catch (error) {
      console.warn('Failed to cleanup temp export file:', error);
    }
  }
}
