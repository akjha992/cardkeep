import { Card, CardCustomReminder } from '@/types/card.types';
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
const GLOBAL_CUSTOM_REMINDERS_KEY = 'global_custom_reminders';
const OVERDUE_GRACE_DAYS = 7;

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
  note?: string;
}

export interface GlobalCustomReminder extends CardCustomReminder {
  title: string;
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

export async function getGlobalCustomReminders(): Promise<GlobalCustomReminder[]> {
  try {
    const raw = await AsyncStorage.getItem(GLOBAL_CUSTOM_REMINDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => ({
        id: entry.id ?? String(Date.now()),
        dayOfMonth: Number(entry.dayOfMonth),
        label: typeof entry.label === 'string' ? entry.label : '',
        title: typeof entry.title === 'string' ? entry.title : '',
      }))
      .filter((entry) => !!entry.label && !!entry.title && Number.isFinite(entry.dayOfMonth));
  } catch (error) {
    console.error('Failed to load global custom reminders', error);
    return [];
  }
}

export async function setGlobalCustomReminders(reminders: GlobalCustomReminder[]): Promise<void> {
  await AsyncStorage.setItem(GLOBAL_CUSTOM_REMINDERS_KEY, JSON.stringify(reminders));
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
  const prevStatement = clampBillDay(today.getFullYear(), today.getMonth(), card.billGenerationDay);
  if (prevStatement < today) {
    reminders.push({ reason: 'statement', date: prevStatement });
  }

  if (typeof card.billingPeriodDays === 'number') {
    const period = card.billingPeriodDays;
    const dueDate = getDueDate(card.billGenerationDay, today, period);
    if (dueDate >= today) {
      reminders.push({ reason: 'due', date: dueDate });
    }

    // Previous-cycle due: previous statement date + billing period
    const year = today.getFullYear();
    const month = today.getMonth();
    const currentStatement = clampBillDay(year, month, card.billGenerationDay);
    const previousStatement = currentStatement >= today
      ? clampBillDay(year, month - 1, card.billGenerationDay)
      : currentStatement;
    const prevDue = startOfDay(new Date(previousStatement.getTime() + period * BillingConstants.DAY_IN_MS));
    if (prevDue < today) {
      reminders.push({ reason: 'due', date: prevDue });
    }
  }

  const expiryMonthIndex = extractExpiryMonth(card.expiryDate);
  if (expiryMonthIndex !== null) {
    const renewalDate = getNextRenewalDate(card.billGenerationDay, expiryMonthIndex, today);
    if (renewalDate >= today) {
      reminders.push({ reason: 'renewal', date: renewalDate });
    }
    const prevRenewal = clampBillDay(today.getFullYear() - (renewalDate >= today ? 0 : 1), expiryMonthIndex, card.billGenerationDay);
    if (prevRenewal < today) {
      reminders.push({ reason: 'renewal', date: prevRenewal });
    }
  }

  return reminders;
}

export async function getActiveReminders(
  cards: Card[],
  reminderWindowDays: number,
  today: Date = new Date(),
  enabledReasons: Partial<Record<ReminderReason, boolean>> = { statement: true, due: true, renewal: true },
  globalCustomReminders: GlobalCustomReminder[] = []
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
      if (daysUntil < 0) {
        if (Math.abs(daysUntil) > OVERDUE_GRACE_DAYS) {
          return;
        }
      } else if (daysUntil > reminderWindowDays) {
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

  // Global custom reminders (not tied to any card)
  if (globalCustomReminders.length > 0 && enabledReasons.custom !== false) {
    const year = normalizedToday.getFullYear();
    const month = normalizedToday.getMonth();
    const globalCard: Card = {
      id: 'global',
      cardNumber: '',
      cvv: '',
      expiryDate: '',
      bankName: 'Personal reminder',
      cardVariant: '',
      cardholderName: '',
      cardType: 'Credit',
      billGenerationDay: null,
      billingPeriodDays: null,
      skipReminders: false,
      customReminders: [],
      usageCount: 0,
      isPinned: false,
      createdAt: 0,
      lastUsedAt: 0,
    };

    globalCustomReminders.forEach((custom) => {
      if (!custom || typeof custom.dayOfMonth !== 'number') return;
      const dateThisMonth = clampBillDay(year, month, custom.dayOfMonth);
      const nextDate = dateThisMonth >= normalizedToday
        ? dateThisMonth
        : clampBillDay(year, month + 1, custom.dayOfMonth);

      const candidates = [] as Date[];
      if (dateThisMonth < normalizedToday) {
        candidates.push(dateThisMonth);
      }
      candidates.push(nextDate);

      candidates.forEach((date) => {
        const daysUntil = Math.round((date.getTime() - normalizedToday.getTime()) / BillingConstants.DAY_IN_MS);
        if (daysUntil < -OVERDUE_GRACE_DAYS || daysUntil > reminderWindowDays) {
          return;
        }
        const key = buildReminderKey(globalCard.id, 'custom', date.getTime(), custom.id);
        if (dismissals[key]) return;
        const reminder = createReminder(globalCard, 'custom', date, normalizedToday, custom.id);
        reminder.label = custom.title;
        reminder.sublabel = date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
        if (custom.label) {
          reminder.note = custom.label;
        }
        reminders.push(reminder);
      });
    });
  }

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
