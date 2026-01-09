/**
 * Input Validation and Sanitization Utilities
 * 
 * Prevents XSS, SQL Injection, and other injection attacks
 */

import { z } from 'zod';

// ============================================
// SANITIZATION FUNCTIONS
// ============================================

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes all HTML tags and dangerous characters
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script-related content
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    // Encode special characters
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Sanitize file names to prevent path traversal
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return '';
  
  return fileName
    // Remove path traversal attempts
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Keep only safe characters
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .trim();
}

/**
 * Sanitize SQL-like input (extra protection beyond ORM)
 */
export function sanitizeSqlInput(input: string): string {
  if (!input) return '';
  
  return input
    // Remove SQL keywords that could be dangerous
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/gi, '')
    // Remove SQL comment syntax
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    // Remove semicolons (statement terminators)
    .replace(/;/g, '')
    .trim();
}

// ============================================
// VALIDATION SCHEMAS (Zod)
// ============================================

/**
 * SSN validation (last 4 digits only)
 */
export const ssnLast4Schema = z.string()
  .length(4, 'SSN must be exactly 4 digits')
  .regex(/^\d{4}$/, 'SSN must contain only digits');

/**
 * Date of birth validation
 */
export const dateOfBirthSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((date) => {
    const parsed = new Date(date);
    const now = new Date();
    const minDate = new Date('1900-01-01');
    return parsed >= minDate && parsed <= now;
  }, 'Invalid date of birth');

/**
 * Email validation
 */
export const emailSchema = z.string()
  .email('Invalid email address')
  .max(320, 'Email too long')
  .transform(email => email.toLowerCase().trim());

/**
 * Phone number validation
 */
export const phoneSchema = z.string()
  .regex(/^[\d\s\-\+\(\)]{10,20}$/, 'Invalid phone number')
  .transform(phone => phone.replace(/[^\d+]/g, ''));

/**
 * Address validation
 */
export const addressSchema = z.string()
  .min(5, 'Address too short')
  .max(500, 'Address too long')
  .transform(sanitizeHtml);

/**
 * Name validation
 */
export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s\-'.]+$/, 'Name contains invalid characters')
  .transform(name => sanitizeHtml(name.trim()));

/**
 * File upload validation
 */
export const fileUploadSchema = z.object({
  fileName: z.string()
    .max(255, 'File name too long')
    .transform(sanitizeFileName),
  contentType: z.enum([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/html',
    'text/plain',
  ], { message: 'Invalid file type' }),
  size: z.number()
    .max(50 * 1024 * 1024, 'File too large (max 50MB)'),
});

/**
 * Credit bureau validation
 */
export const bureauSchema = z.enum(['transunion', 'equifax', 'experian']);

/**
 * Account number validation (masked)
 */
export const accountNumberSchema = z.string()
  .min(4, 'Account number too short')
  .max(30, 'Account number too long')
  .transform(sanitizeHtml);

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate and sanitize user profile input
 */
export function validateUserProfile(input: unknown) {
  const schema = z.object({
    firstName: nameSchema.optional(),
    lastName: nameSchema.optional(),
    dateOfBirth: dateOfBirthSchema.optional(),
    ssnLast4: ssnLast4Schema.optional(),
    phone: phoneSchema.optional(),
    email: emailSchema.optional(),
    currentAddress: addressSchema.optional(),
    currentCity: z.string().max(100).transform(sanitizeHtml).optional(),
    currentState: z.string().max(50).transform(sanitizeHtml).optional(),
    currentZip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code').optional(),
  });
  
  return schema.parse(input);
}

/**
 * Check for potential injection attacks in any string
 */
export function detectInjectionAttempt(input: string): boolean {
  if (!input) return false;
  
  const patterns = [
    // SQL injection
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
    /('|"|;|--|\*|\/\*|\*\/)/,
    // XSS
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    // Path traversal
    /\.\.\//,
    /\.\.\\/, 
    // Command injection
    /[;&|`$]/,
    // Null byte injection
    /\x00/,
  ];
  
  return patterns.some(pattern => pattern.test(input));
}

/**
 * Log and reject suspicious input
 */
export function validateAndLog(input: unknown, fieldName: string): boolean {
  const stringInput = String(input);
  
  if (detectInjectionAttempt(stringInput)) {
    console.warn(`[SECURITY] Potential injection attempt in ${fieldName}:`, stringInput.substring(0, 100));
    return false;
  }
  
  return true;
}
