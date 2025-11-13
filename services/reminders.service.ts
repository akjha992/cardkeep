import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from '@/types/card.types';
import { getNextStatementDate, getDueDate, BillingConstants } from '@/utils/billing';

const DISMISSALS_KEY = 'reminder_dismissals';

export type ReminderReason = 'statement' | 'due';

export interface CardReminder {
  key: string;
  card: Card;
  reason: ReminderReason;
  targetDate: number; // unix timestamp
  daysUntil: number;
  label: string;
  sublabel: string;
}

interface DismissalMap {
  [key: string]: number;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

async function getDismissalMap(): Promise<DismissalMap> {
  try {
    const raw = await AsyncStorage.getItem(DISMISSALS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to read reminder dismissals', error);
    return {};
  }
}

async function setDismissalMap(map: DismissalMap): Promise<void> {
  await AsyncStorage.setItem(DISMISSALS_KEY, JSON.stringify(map));
}

function buildReminderKey(cardId: string, reason: ReminderReason, targetDate: number) {
  return `${cardId}_${reason}_${targetDate}`;
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function createReminder(
  card: Card,
  reason: ReminderReason,
  targetDate: Date,
  today: Date
): CardReminder {
  const daysUntil = Math.round((targetDate.getTime() - today.getTime()) / BillingConstants.DAY_IN_MS);
  const label = reason === 'statement' ? 'Statement coming up' : 'Payment may be due';
  const sublabel =
    reason === 'statement'
      ? `Statement on ${formatDateLabel(targetDate)}`
      : `Due by ${formatDateLabel(targetDate)}`;
  const key = buildReminderKey(card.id, reason, targetDate.getTime());
  return {
    key,
    card,
    reason,
    targetDate: targetDate.getTime(),
    daysUntil,
    label,
    sublabel,
  };
}

function getFutureRemindersForCard(card: Card, today: Date): Array<{ reason: ReminderReason; date: Date }> {
  if (card.cardType !== 'Credit' || typeof card.billGenerationDay !== 'number') {
    return [];
  }

  const reminders: Array<{ reason: ReminderReason; date: Date }> = [];
  const statementDate = getNextStatementDate(card.billGenerationDay, today);
  if (statementDate >= today) {
    reminders.push({ reason: 'statement', date: statementDate });
  }

  const dueDate = getDueDate(card.billGenerationDay, today);
  if (dueDate >= today) {
    reminders.push({ reason: 'due', date: dueDate });
  }

  return reminders;
}

export async function getActiveReminders(
  cards: Card[],
  reminderWindowDays: number,
  today: Date = new Date()
): Promise<CardReminder[]> {
  const normalizedToday = startOfDay(today);
  const dismissals = await getDismissalMap();
  const reminders: CardReminder[] = [];

  cards.forEach((card) => {
    const events = getFutureRemindersForCard(card, normalizedToday);
    events.forEach(({ reason, date }) => {
      const daysUntil = Math.round((date.getTime() - normalizedToday.getTime()) / BillingConstants.DAY_IN_MS);
      if (daysUntil < 0 || daysUntil > reminderWindowDays) {
        return;
      }
      const key = buildReminderKey(card.id, reason, date.getTime());
      if (dismissals[key]) {
        return;
      }
      reminders.push(createReminder(card, reason, date, normalizedToday));
    });
  });

  reminders.sort((a, b) => a.targetDate - b.targetDate);
  return reminders;
}

export async function dismissReminder(reminderKey: string): Promise<void> {
  const dismissals = await getDismissalMap();
  dismissals[reminderKey] = Date.now();
  await setDismissalMap(dismissals);
}

export async function clearOutdatedDismissals(): Promise<void> {
  const dismissals = await getDismissalMap();
  const now = Date.now();
  const filtered: DismissalMap = {};
  Object.entries(dismissals).forEach(([key, timestamp]) => {
    if (timestamp > now - 90 * 24 * 60 * 60 * 1000) {
      filtered[key] = timestamp;
    }
  });
  await setDismissalMap(filtered);
}

export async function resetAllDismissals(): Promise<void> {
  await setDismissalMap({});
}
