/**
 * Encryption Utilities for Sensitive Data
 * 
 * Uses AES-256-GCM for encrypting PII (SSN, DOB, addresses)
 * Compliant with PCI-DSS and HIPAA requirements
 */

import crypto from 'crypto';

// Encryption key should be 32 bytes for AES-256
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for AES
const AUTH_TAG_LENGTH = 16; // 16 bytes for GCM

/**
 * Encrypt sensitive data
 * @param plaintext - The data to encrypt
 * @returns Encrypted string in format: iv:authTag:ciphertext (all base64)
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return '';
  
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex'); // Ensure 32 bytes
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const authTag = cipher.getAuthTag();
    
    // Return format: iv:authTag:ciphertext
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
  } catch (error) {
    console.error('[Encryption] Error encrypting data:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt sensitive data
 * @param encryptedData - The encrypted string in format: iv:authTag:ciphertext
 * @returns Decrypted plaintext
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) return '';
  
  // Check if data is already plaintext (not encrypted)
  if (!encryptedData.includes(':')) {
    return encryptedData;
  }
  
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      // Data might be plaintext, return as-is
      return encryptedData;
    }
    
    const [ivBase64, authTagBase64, ciphertext] = parts;
    
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('[Encryption] Error decrypting data:', error);
    // Return original data if decryption fails (might be plaintext)
    return encryptedData;
  }
}

/**
 * Hash sensitive data for comparison (one-way)
 * Useful for SSN verification without storing plaintext
 */
export function hashSensitiveData(data: string): string {
  if (!data) return '';
  
  const salt = process.env.HASH_SALT || 'default-salt-change-in-production';
  return crypto
    .createHmac('sha256', salt)
    .update(data)
    .digest('hex');
}

/**
 * Mask sensitive data for display
 * @param data - The sensitive data
 * @param visibleChars - Number of characters to show at the end
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (!data || data.length <= visibleChars) return data;
  
  const masked = '*'.repeat(data.length - visibleChars);
  return masked + data.slice(-visibleChars);
}

/**
 * Validate that encryption key is properly configured
 */
export function validateEncryptionConfig(): boolean {
  if (!process.env.ENCRYPTION_KEY) {
    console.warn('[SECURITY WARNING] ENCRYPTION_KEY not set. Using random key (data will be lost on restart).');
    return false;
  }
  
  if (process.env.ENCRYPTION_KEY.length < 64) {
    console.warn('[SECURITY WARNING] ENCRYPTION_KEY should be at least 64 hex characters (32 bytes).');
    return false;
  }
  
  return true;
}

// Validate on module load
validateEncryptionConfig();
