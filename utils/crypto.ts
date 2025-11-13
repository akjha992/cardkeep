import 'react-native-get-random-values';
import CryptoJS from 'crypto-js';

interface EncryptedPayload {
  iv: string; // Base64 encoded IV
  ciphertext: string; // Base64 encoded cipher text
}

const IV_BYTE_LENGTH = 16; // AES block size (128-bit) for CBC mode

/**
 * Uses SHA-256 to derive a 32-byte key from the provided password.
 */
async function deriveKey(password: string): Promise<CryptoJS.lib.WordArray> {
  return CryptoJS.SHA256(password);
}

/**
 * Converts Uint8Array bytes into a CryptoJS WordArray for use as an IV.
 */
function wordArrayFromBytes(bytes: Uint8Array): CryptoJS.lib.WordArray {
  return CryptoJS.lib.WordArray.create(Array.from(bytes), bytes.length);
}

function getRandomBytes(byteLength: number): Uint8Array {
  const cryptoObj = (globalThis as any).crypto;

  if (!cryptoObj || typeof cryptoObj.getRandomValues !== 'function') {
    throw new Error('Secure random number generator is not available.');
  }

  const bytes = new Uint8Array(byteLength);
  cryptoObj.getRandomValues(bytes);
  return bytes;
}

/**
 * Encrypts a UTF-8 string using AES-256-CBC and returns a serialized payload
 * that contains both the IV and cipher text (both Base64 encoded).
 */
export async function encrypt(data: string, password: string): Promise<string> {
  if (!password) {
    throw new Error('Password is required for encryption');
  }

  const key = await deriveKey(password);
  const ivBytes = getRandomBytes(IV_BYTE_LENGTH);
  const iv = wordArrayFromBytes(ivBytes);

  const encrypted = CryptoJS.AES.encrypt(data, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const payload: EncryptedPayload = {
    iv: CryptoJS.enc.Base64.stringify(iv),
    ciphertext: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
  };

  return JSON.stringify(payload);
}

/**
 * Decrypts a serialized payload created by the `encrypt` function.
 */
export async function decrypt(serializedPayload: string, password: string): Promise<string> {
  if (!password) {
    throw new Error('Password is required for decryption');
  }

  let payload: EncryptedPayload;
  try {
    payload = JSON.parse(serializedPayload) as EncryptedPayload;
  } catch (error) {
    throw new Error('Invalid encrypted payload format');
  }

  if (!payload.iv || !payload.ciphertext) {
    throw new Error('Encrypted payload missing IV or ciphertext');
  }

  const key = await deriveKey(password);
  const iv = CryptoJS.enc.Base64.parse(payload.iv);
  const ciphertext = CryptoJS.enc.Base64.parse(payload.ciphertext);
  const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });

  const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const plaintext = CryptoJS.enc.Utf8.stringify(decrypted);
  if (!plaintext) {
    throw new Error('Failed to decrypt payload (incorrect password?)');
  }

  return plaintext;
}

/**
 * Generates a SHA-256 hash of the provided string and returns it as a hex string.
 */
export function generateHash(data: string): Promise<string> {
  return Promise.resolve(CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex));
}
