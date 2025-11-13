const BILL_PAYMENT_WINDOW_DAYS = 15;
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

export function getDueDate(billDay: number, referenceDate: Date = new Date()): Date {
  const today = startOfDay(referenceDate);
  const year = today.getFullYear();
  const month = today.getMonth();
  const currentBill = clampBillDay(year, month, billDay);
  const currentDue = new Date(currentBill.getTime() + BILL_PAYMENT_WINDOW_DAYS * DAY_IN_MS);
  if (currentDue >= today) {
    return startOfDay(currentDue);
  }
  const nextBill = clampBillDay(year, month + 1, billDay);
  return startOfDay(new Date(nextBill.getTime() + BILL_PAYMENT_WINDOW_DAYS * DAY_IN_MS));
}

export function getBillStatusMessage(
  billDay: number,
  referenceDate: Date = new Date()
): string {
  const today = startOfDay(referenceDate);
  const nextStatement = getNextStatementDate(billDay, today);
  const daysUntilStatement = Math.round((nextStatement.getTime() - today.getTime()) / DAY_IN_MS);
  if (daysUntilStatement === 0) {
    return 'Next bill today';
  }

  const year = today.getFullYear();
  const month = today.getMonth();
  const currentBill = clampBillDay(year, month, billDay);
  const currentDue = new Date(currentBill.getTime() + BILL_PAYMENT_WINDOW_DAYS * DAY_IN_MS);
  if (currentDue >= today) {
    const daysUntilDue = Math.round((currentDue.getTime() - today.getTime()) / DAY_IN_MS);
    if (daysUntilDue <= BILL_PAYMENT_WINDOW_DAYS && daysUntilDue >= 0) {
      const dueLabel = currentDue.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return `Bill may be due by ${dueLabel}`;
    }
  }

  return `Next bill in ${daysUntilStatement} days`;
}

export const BillingConstants = {
  BILL_PAYMENT_WINDOW_DAYS,
  DAY_IN_MS,
};
