const BILL_PAYMENT_WINDOW_DAYS = 15; // default billing period when none is provided
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function clampBillDay(year: number, month: number, billDay: number): Date {
  const maxDay = new Date(year, month + 1, 0).getDate();
  const safeDay = Math.min(Math.max(1, billDay), maxDay);
  const date = new Date(year, month, safeDay);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getNextStatementDate(billDay: number, referenceDate: Date = new Date()): Date {
  const today = startOfDay(referenceDate);
  const year = today.getFullYear();
  const month = today.getMonth();
  const currentBill = clampBillDay(year, month, billDay);
  if (currentBill >= today) {
    return currentBill;
  }
  return clampBillDay(year, month + 1, billDay);
}

function getDueDateFromWindow(billDay: number, referenceDate: Date, windowDays: number) {
  const today = startOfDay(referenceDate);
  const year = today.getFullYear();
  const month = today.getMonth();
  const currentBill = clampBillDay(year, month, billDay);
  const currentDue = new Date(currentBill.getTime() + windowDays * DAY_IN_MS);
  if (currentDue >= today) {
    return startOfDay(currentDue);
  }
  const nextBill = clampBillDay(year, month + 1, billDay);
  return startOfDay(new Date(nextBill.getTime() + windowDays * DAY_IN_MS));
}

export function getDueDate(
  billDay: number,
  referenceDate: Date = new Date(),
  billingPeriodDays?: number | null
): Date {
  const today = startOfDay(referenceDate);

  // If no billing period provided, fall back to default window.
  if (typeof billingPeriodDays !== 'number' || billingPeriodDays <= 0) {
    return getDueDateFromWindow(billDay, referenceDate, BILL_PAYMENT_WINDOW_DAYS);
  }

  // Find the most recent statement on/before today.
  const year = today.getFullYear();
  const month = today.getMonth();
  const currentStatement = clampBillDay(year, month, billDay);
  const lastStatement = currentStatement > today ? clampBillDay(year, month - 1, billDay) : currentStatement;

  const dueFromLast = startOfDay(new Date(lastStatement.getTime() + billingPeriodDays * DAY_IN_MS));
  if (dueFromLast >= today) {
    return dueFromLast;
  }

  // Otherwise use the next statement + period.
  const nextStatement = getNextStatementDate(billDay, today);
  return startOfDay(new Date(nextStatement.getTime() + billingPeriodDays * DAY_IN_MS));
}

export function getBillStatusMessage(
  billDay: number,
  billingPeriodDays?: number | null,
  referenceDate: Date = new Date()
): string {
  const today = startOfDay(referenceDate);
  const nextStatement = getNextStatementDate(billDay, today);
  const daysUntilStatement = Math.round((nextStatement.getTime() - today.getTime()) / DAY_IN_MS);
  if (daysUntilStatement === 0) {
    return 'Next bill today';
  }

  if (typeof billingPeriodDays !== 'number') {
    return `Next bill in ${daysUntilStatement} days`;
  }

  const dueDate = getDueDate(billDay, today, billingPeriodDays);
  const daysUntilDue = Math.round((dueDate.getTime() - today.getTime()) / DAY_IN_MS);
  if (daysUntilDue >= 0 && daysUntilDue <= BILL_PAYMENT_WINDOW_DAYS) {
    const dueLabel = dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `Bill may be due by ${dueLabel}`;
  }

  return `Next bill in ${daysUntilStatement} days`;
}

export const BillingConstants = {
  BILL_PAYMENT_WINDOW_DAYS,
  DAY_IN_MS,
};

export function extractExpiryMonth(expiry: string): number | null {
  const normalized = expiry.trim();
  const match = normalized.match(/^(\d{2})\/?(\d{2})$/);
  if (!match) {
    return null;
  }
  const month = parseInt(match[1], 10);
  if (Number.isNaN(month) || month < 1 || month > 12) {
    return null;
  }
  return month - 1; // zero-based for Date constructor
}

export function getNextRenewalDate(
  billDay: number,
  expiryMonthIndex: number,
  referenceDate: Date = new Date()
): Date {
  const today = startOfDay(referenceDate);
  const year = today.getFullYear();
  const thisYearRenewal = clampBillDay(year, expiryMonthIndex, billDay);
  if (thisYearRenewal >= today) {
    return thisYearRenewal;
  }
  return clampBillDay(year + 1, expiryMonthIndex, billDay);
}
