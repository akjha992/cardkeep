/**
 * Formats a card number string into groups of 4 digits.
 * e.g., "1234567890123456" -> "1234 5678 9012 3456"
 */
export const formatCardNumber = (number: string): string => {
  return (number.replace(/\s/g, '').match(/.{1,4}/g) || []).join(' ');
};

/**
 * Masks a card number, showing only the last 4 digits.
 * e.g., "1234567890123456" -> "**** **** **** 3456"
 */
export const maskCardNumber = (number: string): string => {
  const cleaned = number.replace(/\s/g, '');
  const last4 = cleaned.slice(-4);
  return `**** **** **** ${last4}`;
};

/**
 * Formats an expiry date from "MMYY" to "MM/YY".
 */
export const formatExpiryDate = (date: string): string => {
  if (date.length === 4) {
    return `${date.slice(0, 2)}/${date.slice(2, 4)}`;
  }
  // Return as is if already formatted or in a different format
  return date;
};

/**
 * Removes spaces from a card number string.
 * e.g., "1234 5678 9012 3456" -> "1234567890123456"
 */
export const removeSpacesFromCardNumber = (number: string): string => {
  return number.replace(/\s/g, '');
};