import { Card } from '@/types/card.types';
import {
  BillingConstants,
  clampBillDay,
  extractExpiryMonth,
  getDueDate,
  getNextRenewalDate,
  getNextStatementDate,
} from '@/utils/billing';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DISMISSALS_KEY = 'reminder_dismissals';

export type ReminderReason = 'statement' | 'due' | 'renewal' | 'custom';

export interface CardReminder {
  key: string;
  card: Card;
  reason: ReminderReason;
  targetDate: number; // unix timestamp
  daysUntil: number;
  label: string;
  sublabel: string;
  customId?: string;
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

function buildReminderKey(cardId: string, reason: ReminderReason, targetDate: number, customId?: string) {
  return customId ? `${cardId}_${reason}_${targetDate}_${customId}` : `${cardId}_${reason}_${targetDate}`;
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function createReminder(
  card: Card,
  reason: ReminderReason,
  targetDate: Date,
  today: Date,
  customId?: string
): CardReminder {
  const daysUntil = Math.round((targetDate.getTime() - today.getTime()) / BillingConstants.DAY_IN_MS);
  let label: string;
  let sublabel: string;
  if (reason === 'statement') {
    label = 'Statement coming up';
    sublabel = `Statement on ${formatDateLabel(targetDate)}`;
  } else if (reason === 'due') {
    label = 'Payment may be due';
    sublabel = `Due by ${formatDateLabel(targetDate)}`;
  } else if (reason === 'renewal') {
    label = 'Card renewal coming up';
    sublabel = `Renew by ${formatDateLabel(targetDate)}`;
  } else {
    label = 'Custom reminder';
    sublabel = formatDateLabel(targetDate);
  }
  const key = buildReminderKey(card.id, reason, targetDate.getTime(), customId);
  return {
    key,
    card,
    reason,
    targetDate: targetDate.getTime(),
    daysUntil,
    label,
    sublabel,
    customId,
  };
}

function getFutureRemindersForCard(
  card: Card,
  today: Date
): Array<{ reason: ReminderReason; date: Date; label?: string; customId?: string }> {
  if (card.skipReminders) {
    return [];
  }

  if (card.cardType !== 'Credit' || typeof card.billGenerationDay !== 'number') {
    return [];
  }

  const reminders: Array<{ reason: ReminderReason; date: Date; label?: string; customId?: string }> = [];
  const statementDate = getNextStatementDate(card.billGenerationDay, today);
  if (statementDate >= today) {
    reminders.push({ reason: 'statement', date: statementDate });
  }

  if (typeof card.billDueDay === 'number') {
    const dueDate = getDueDate(card.billGenerationDay, today, card.billDueDay);
    if (dueDate >= today) {
      reminders.push({ reason: 'due', date: dueDate });
    }
  }

  const expiryMonthIndex = extractExpiryMonth(card.expiryDate);
  if (expiryMonthIndex !== null) {
    const renewalDate = getNextRenewalDate(card.billGenerationDay, expiryMonthIndex, today);
    if (renewalDate >= today) {
      reminders.push({ reason: 'renewal', date: renewalDate });
    }
  }

  if (Array.isArray(card.customReminders) && card.customReminders.length > 0) {
    const year = today.getFullYear();
    const month = today.getMonth();
    card.customReminders.forEach((custom) => {
      if (!custom || typeof custom.dayOfMonth !== 'number') {
        return;
      }
      const dateThisMonth = clampBillDay(year, month, custom.dayOfMonth);
      const nextDate = dateThisMonth >= today ? dateThisMonth : clampBillDay(year, month + 1, custom.dayOfMonth);
      reminders.push({ reason: 'custom', date: nextDate, label: custom.label, customId: custom.id });
    });
  }

  return reminders;
}

export async function getActiveReminders(
  cards: Card[],
  reminderWindowDays: number,
  today: Date = new Date(),
  enabledReasons: Partial<Record<ReminderReason, boolean>> = { statement: true, due: true, renewal: true }
): Promise<CardReminder[]> {
  const normalizedToday = startOfDay(today);
  const dismissals = await getDismissalMap();
  const reminders: CardReminder[] = [];

  cards.forEach((card) => {
    const events = getFutureRemindersForCard(card, normalizedToday).filter(
      ({ reason }) => enabledReasons[reason] !== false
    );
    events.forEach(({ reason, date, label, customId }) => {
      const daysUntil = Math.round((date.getTime() - normalizedToday.getTime()) / BillingConstants.DAY_IN_MS);
      if (daysUntil < 0 || daysUntil > reminderWindowDays) {
        return;
      }
      const key = buildReminderKey(card.id, reason, date.getTime(), customId);
      if (dismissals[key]) {
        return;
      }
      const reminder = createReminder(card, reason, date, normalizedToday, customId);
      if (reason === 'custom') {
        if (label) {
          reminder.label = label;
        }
        reminder.sublabel = date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
        if (customId) {
          reminder.customId = customId;
        }
      }
      reminders.push(reminder);
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
