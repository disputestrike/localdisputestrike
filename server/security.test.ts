/**
 * Security Tests
 * Tests for encryption, input validation, and sanitization
 */

import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, maskSensitiveData, hashSensitiveData } from './encryption';
import { 
  sanitizeHtml, 
  sanitizeFileName, 
  sanitizeSqlInput,
  detectInjectionAttempt,
  ssnLast4Schema,
  dateOfBirthSchema,
  emailSchema,
  phoneSchema,
  nameSchema
} from './inputValidation';

describe('Encryption Module', () => {
  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt data correctly', () => {
      const plaintext = 'sensitive-data-123';
      const encrypted = encrypt(plaintext);
      
      // Encrypted should be different from plaintext
      expect(encrypted).not.toBe(plaintext);
      
      // Should contain the format iv:authTag:ciphertext
      expect(encrypted.split(':').length).toBe(3);
      
      // Decryption should return original
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });
    
    it('should handle empty strings', () => {
      expect(encrypt('')).toBe('');
      expect(decrypt('')).toBe('');
    });
    
    it('should return plaintext if not encrypted format', () => {
      const plaintext = 'not-encrypted';
      expect(decrypt(plaintext)).toBe(plaintext);
    });
    
    it('should produce different ciphertext for same plaintext (random IV)', () => {
      const plaintext = 'test-data';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);
      
      // Different encryptions should produce different ciphertext
      expect(encrypted1).not.toBe(encrypted2);
      
      // But both should decrypt to same value
      expect(decrypt(encrypted1)).toBe(plaintext);
      expect(decrypt(encrypted2)).toBe(plaintext);
    });
  });
  
  describe('maskSensitiveData', () => {
    it('should mask SSN correctly', () => {
      expect(maskSensitiveData('123456789', 4)).toBe('*****6789');
    });
    
    it('should mask with default 4 visible chars', () => {
      expect(maskSensitiveData('1234567890')).toBe('******7890');
    });
    
    it('should handle short strings', () => {
      expect(maskSensitiveData('123', 4)).toBe('123');
    });
    
    it('should handle empty strings', () => {
      expect(maskSensitiveData('')).toBe('');
    });
  });
  
  describe('hashSensitiveData', () => {
    it('should produce consistent hash for same input', () => {
      const data = 'test-ssn-1234';
      const hash1 = hashSensitiveData(data);
      const hash2 = hashSensitiveData(data);
      
      expect(hash1).toBe(hash2);
    });
    
    it('should produce different hash for different input', () => {
      const hash1 = hashSensitiveData('data1');
      const hash2 = hashSensitiveData('data2');
      
      expect(hash1).not.toBe(hash2);
    });
    
    it('should handle empty strings', () => {
      expect(hashSensitiveData('')).toBe('');
    });
  });
});

describe('Input Validation Module', () => {
  describe('sanitizeHtml', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeHtml('<script>alert("xss")</script>')).not.toContain('<script>');
      expect(sanitizeHtml('<div>Hello</div>')).toBe('Hello');
    });
    
    it('should remove javascript: protocol', () => {
      expect(sanitizeHtml('javascript:alert(1)')).not.toContain('javascript:');
    });
    
    it('should remove event handlers', () => {
      expect(sanitizeHtml('onclick=alert(1)')).not.toContain('onclick=');
      expect(sanitizeHtml('onmouseover=hack()')).not.toContain('onmouseover=');
    });
    
    it('should encode special characters', () => {
      // Note: < and > are removed as HTML tags first, then & " ' are encoded
      const result = sanitizeHtml('Test & "quoted" text');
      expect(result).toContain('&amp;');
      expect(result).toContain('&quot;');
    });
    
    it('should handle empty strings', () => {
      expect(sanitizeHtml('')).toBe('');
    });
  });
  
  describe('sanitizeFileName', () => {
    it('should remove path traversal attempts', () => {
      expect(sanitizeFileName('../../../etc/passwd')).not.toContain('..');
      expect(sanitizeFileName('..\\..\\windows\\system32')).not.toContain('..');
    });
    
    it('should remove slashes', () => {
      expect(sanitizeFileName('path/to/file.pdf')).not.toContain('/');
      expect(sanitizeFileName('path\\to\\file.pdf')).not.toContain('\\');
    });
    
    it('should keep safe characters', () => {
      expect(sanitizeFileName('my-file_2024.pdf')).toBe('my-file_2024.pdf');
    });
    
    it('should replace unsafe characters with underscore', () => {
      expect(sanitizeFileName('file name!@#.pdf')).toBe('file_name___.pdf');
    });
  });
  
  describe('sanitizeSqlInput', () => {
    it('should remove SQL keywords', () => {
      expect(sanitizeSqlInput('SELECT * FROM users')).not.toMatch(/SELECT/i);
      expect(sanitizeSqlInput('DROP TABLE users')).not.toMatch(/DROP/i);
      expect(sanitizeSqlInput('UNION SELECT password')).not.toMatch(/UNION/i);
    });
    
    it('should remove SQL comments', () => {
      expect(sanitizeSqlInput('value -- comment')).not.toContain('--');
      expect(sanitizeSqlInput('value /* comment */')).not.toContain('/*');
    });
    
    it('should remove semicolons', () => {
      expect(sanitizeSqlInput('value; DROP TABLE')).not.toContain(';');
    });
  });
  
  describe('detectInjectionAttempt', () => {
    it('should detect SQL injection', () => {
      expect(detectInjectionAttempt("' OR '1'='1")).toBe(true);
      expect(detectInjectionAttempt('SELECT * FROM users')).toBe(true);
      expect(detectInjectionAttempt('1; DROP TABLE users')).toBe(true);
    });
    
    it('should detect XSS', () => {
      expect(detectInjectionAttempt('<script>alert(1)</script>')).toBe(true);
      expect(detectInjectionAttempt('javascript:alert(1)')).toBe(true);
      expect(detectInjectionAttempt('onclick=hack()')).toBe(true);
    });
    
    it('should detect path traversal', () => {
      expect(detectInjectionAttempt('../../../etc/passwd')).toBe(true);
      expect(detectInjectionAttempt('..\\windows\\system32')).toBe(true);
    });
    
    it('should allow normal input', () => {
      expect(detectInjectionAttempt('John Smith')).toBe(false);
      expect(detectInjectionAttempt('123 Main Street')).toBe(false);
      expect(detectInjectionAttempt('user@email.com')).toBe(false);
    });
  });
  
  describe('Zod Schemas', () => {
    describe('ssnLast4Schema', () => {
      it('should accept valid SSN last 4', () => {
        expect(() => ssnLast4Schema.parse('1234')).not.toThrow();
        expect(() => ssnLast4Schema.parse('0000')).not.toThrow();
      });
      
      it('should reject invalid SSN', () => {
        expect(() => ssnLast4Schema.parse('123')).toThrow();
        expect(() => ssnLast4Schema.parse('12345')).toThrow();
        expect(() => ssnLast4Schema.parse('abcd')).toThrow();
      });
    });
    
    describe('dateOfBirthSchema', () => {
      it('should accept valid dates', () => {
        expect(() => dateOfBirthSchema.parse('1990-01-15')).not.toThrow();
        expect(() => dateOfBirthSchema.parse('2000-12-31')).not.toThrow();
      });
      
      it('should reject invalid formats', () => {
        expect(() => dateOfBirthSchema.parse('01/15/1990')).toThrow();
        expect(() => dateOfBirthSchema.parse('1990-1-15')).toThrow();
      });
      
      it('should reject future dates', () => {
        expect(() => dateOfBirthSchema.parse('2030-01-01')).toThrow();
      });
    });
    
    describe('emailSchema', () => {
      it('should accept valid emails', () => {
        expect(() => emailSchema.parse('user@example.com')).not.toThrow();
        expect(() => emailSchema.parse('test.user@domain.org')).not.toThrow();
      });
      
      it('should reject invalid emails', () => {
        expect(() => emailSchema.parse('not-an-email')).toThrow();
        expect(() => emailSchema.parse('@nodomain.com')).toThrow();
      });
      
      it('should lowercase emails', () => {
        expect(emailSchema.parse('USER@EXAMPLE.COM')).toBe('user@example.com');
      });
    });
    
    describe('phoneSchema', () => {
      it('should accept valid phone numbers', () => {
        expect(() => phoneSchema.parse('555-123-4567')).not.toThrow();
        expect(() => phoneSchema.parse('+1 (555) 123-4567')).not.toThrow();
      });
      
      it('should reject invalid phone numbers', () => {
        expect(() => phoneSchema.parse('123')).toThrow();
        expect(() => phoneSchema.parse('not-a-phone')).toThrow();
      });
    });
    
    describe('nameSchema', () => {
      it('should accept valid names', () => {
        expect(() => nameSchema.parse('John Smith')).not.toThrow();
        expect(() => nameSchema.parse("Mary O'Connor")).not.toThrow();
        expect(() => nameSchema.parse('Jean-Pierre')).not.toThrow();
      });
      
      it('should reject names with invalid characters', () => {
        expect(() => nameSchema.parse('John123')).toThrow();
        expect(() => nameSchema.parse('John<script>')).toThrow();
      });
    });
  });
});
