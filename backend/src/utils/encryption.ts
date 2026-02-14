/**
 * AES-256 encryption utilities for router credentials
 * Provides at-rest encryption for sensitive credential data
 */

import AES from 'aes-js';
import crypto from 'node:crypto';

import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

// Encryption key (32 bytes for AES-256)
const ENCRYPTION_KEY = Buffer.from(config.ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32), 'utf8');

/**
 * Encrypt plaintext using AES-256-CBC
 * @param plaintext - The text to encrypt
 * @returns Base64 encoded encrypted string with IV prepended
 */
export function encrypt(plaintext: string): string {
  try {
    // Generate random IV (16 bytes for AES)
    const iv = Buffer.from(crypto.getRandomValues(new Uint8Array(16)));

    // Create cipher
    const aesCbc = new AES.ModeOfOperation.cbc(ENCRYPTION_KEY, iv);
    const plaintextBytes = Buffer.from(plaintext, 'utf8');

    // PKCS7 padding
    const paddingLength = 16 - (plaintextBytes.length % 16);
    const paddedBytes = Buffer.concat([
      plaintextBytes,
      Buffer.from(new Array(paddingLength).fill(paddingLength)),
    ]);

    // Encrypt
    const encryptedBytes = aesCbc.encrypt(paddedBytes);

    // Prepend IV to encrypted data and encode as base64
    const result = Buffer.concat([iv, encryptedBytes]);
    return result.toString('base64');
  } catch (error) {
    logger.error({ error }, 'Encryption failed');
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt ciphertext using AES-256-CBC
 * @param ciphertext - Base64 encoded encrypted string with IV prepended
 * @returns Decrypted plaintext
 */
export function decrypt(ciphertext: string): string {
  try {
    // Decode from base64
    const data = Buffer.from(ciphertext, 'base64');

    // Extract IV (first 16 bytes) and encrypted data
    const iv = data.subarray(0, 16);
    const encryptedData = data.subarray(16);

    // Create decipher
    const aesCbc = new AES.ModeOfOperation.cbc(ENCRYPTION_KEY, iv);

    // Decrypt
    const decryptedBytes = aesCbc.decrypt(encryptedData);

    // Remove PKCS7 padding
    const paddingLength = decryptedBytes[decryptedBytes.length - 1];
    const plaintextBytes = decryptedBytes.subarray(0, decryptedBytes.length - paddingLength);

    return Buffer.from(plaintextBytes).toString('utf8');
  } catch (error) {
    logger.error({ error }, 'Decryption failed');
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Encrypt router credentials object
 * @param credentials - Object containing username and password
 * @returns Encrypted string
 */
export function encryptRouterCredentials(credentials: {
  username: string;
  password: string;
}): string {
  const jsonString = JSON.stringify(credentials);
  return encrypt(jsonString);
}

/**
 * Decrypt router credentials object
 * @param encryptedCredentials - Encrypted string
 * @returns Decrypted credentials object
 */
export function decryptRouterCredentials(encryptedCredentials: string): {
  username: string;
  password: string;
} {
  const jsonString = decrypt(encryptedCredentials);
  return JSON.parse(jsonString);
}

/**
 * Hash sensitive data for comparison without storing plaintext
 * @param data - Data to hash
 * @returns SHA-256 hash
 */
export function hashData(data: string): string {
  return `hash:${crypto.createHash('sha256').update(data).digest('hex')}`;
}

/**
 * Generate secure random token
 * @param length - Token length in bytes (default 32)
 * @returns Hex-encoded random token
 */
export function generateSecureToken(length: number = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Buffer.from(bytes).toString('hex');
}

export default {
  encrypt,
  decrypt,
  encryptRouterCredentials,
  decryptRouterCredentials,
  hashData,
  generateSecureToken,
};
