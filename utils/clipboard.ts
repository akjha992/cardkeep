import * as Clipboard from 'expo-clipboard';

/**
 * Copies a string to the clipboard.
 * @param text The text to copy.
 */
export async function copyToClipboard(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
}
