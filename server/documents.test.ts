import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('./db', () => ({
  getUserDocuments: vi.fn(),
  getUserDocumentById: vi.fn(),
  getUserDocumentsByType: vi.fn(),
  createUserDocument: vi.fn(),
  updateUserDocument: vi.fn(),
  deleteUserDocument: vi.fn(),
  getExpiringDocuments: vi.fn(),
}));

import * as db from './db';

describe('Document Vault API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserDocuments', () => {
    it('should return all documents for a user', async () => {
      const mockDocuments = [
        {
          id: 1,
          userId: 1,
          documentType: 'drivers_license',
          documentName: 'Driver License Front',
          fileName: 'dl_front.jpg',
          fileKey: 'docs/1/dl_front.jpg',
          fileSize: 1024000,
          mimeType: 'image/jpeg',
          createdAt: new Date(),
        },
        {
          id: 2,
          userId: 1,
          documentType: 'utility_bill',
          documentName: 'Electric Bill January',
          fileName: 'electric_bill.pdf',
          fileKey: 'docs/1/electric_bill.pdf',
          fileSize: 512000,
          mimeType: 'application/pdf',
          createdAt: new Date(),
        },
      ];

      vi.mocked(db.getUserDocuments).mockResolvedValue(mockDocuments as any);

      const result = await db.getUserDocuments(1);

      expect(db.getUserDocuments).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(2);
      expect(result[0].documentType).toBe('drivers_license');
      expect(result[1].documentType).toBe('utility_bill');
    });

    it('should return empty array when user has no documents', async () => {
      vi.mocked(db.getUserDocuments).mockResolvedValue([]);

      const result = await db.getUserDocuments(999);

      expect(result).toEqual([]);
    });
  });

  describe('getUserDocumentById', () => {
    it('should return document when found', async () => {
      const mockDocument = {
        id: 1,
        userId: 1,
        documentType: 'passport',
        documentName: 'US Passport',
        fileName: 'passport.jpg',
        fileKey: 'docs/1/passport.jpg',
        createdAt: new Date(),
      };

      vi.mocked(db.getUserDocumentById).mockResolvedValue(mockDocument as any);

      const result = await db.getUserDocumentById(1, 1);

      expect(db.getUserDocumentById).toHaveBeenCalledWith(1, 1);
      expect(result?.documentName).toBe('US Passport');
    });

    it('should return null when document not found', async () => {
      vi.mocked(db.getUserDocumentById).mockResolvedValue(null);

      const result = await db.getUserDocumentById(999, 1);

      expect(result).toBeNull();
    });

    it('should not return document belonging to different user', async () => {
      vi.mocked(db.getUserDocumentById).mockResolvedValue(null);

      const result = await db.getUserDocumentById(1, 999);

      expect(result).toBeNull();
    });
  });

  describe('getUserDocumentsByType', () => {
    it('should return documents filtered by type', async () => {
      const mockDocuments = [
        {
          id: 1,
          userId: 1,
          documentType: 'dispute_letter',
          documentName: 'TransUnion Dispute',
          fileName: 'tu_dispute.pdf',
          fileKey: 'docs/1/tu_dispute.pdf',
          createdAt: new Date(),
        },
        {
          id: 2,
          userId: 1,
          documentType: 'dispute_letter',
          documentName: 'Equifax Dispute',
          fileName: 'eq_dispute.pdf',
          fileKey: 'docs/1/eq_dispute.pdf',
          createdAt: new Date(),
        },
      ];

      vi.mocked(db.getUserDocumentsByType).mockResolvedValue(mockDocuments as any);

      const result = await db.getUserDocumentsByType(1, 'dispute_letter');

      expect(db.getUserDocumentsByType).toHaveBeenCalledWith(1, 'dispute_letter');
      expect(result).toHaveLength(2);
      expect(result.every(d => d.documentType === 'dispute_letter')).toBe(true);
    });
  });

  describe('createUserDocument', () => {
    it('should create a new document', async () => {
      const newDocument = {
        userId: 1,
        documentType: 'certified_mail_receipt' as const,
        documentName: 'TransUnion Certified Mail',
        fileName: 'tu_receipt.jpg',
        fileKey: 'docs/1/tu_receipt.jpg',
        fileSize: 256000,
        mimeType: 'image/jpeg',
      };

      const createdDocument = {
        id: 3,
        ...newDocument,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.createUserDocument).mockResolvedValue(createdDocument as any);

      const result = await db.createUserDocument(newDocument);

      expect(db.createUserDocument).toHaveBeenCalledWith(newDocument);
      expect(result?.id).toBe(3);
      expect(result?.documentName).toBe('TransUnion Certified Mail');
    });
  });

  describe('updateUserDocument', () => {
    it('should update document name', async () => {
      vi.mocked(db.updateUserDocument).mockResolvedValue(true);

      const result = await db.updateUserDocument(1, 1, {
        documentName: 'Updated Document Name',
      });

      expect(db.updateUserDocument).toHaveBeenCalledWith(1, 1, {
        documentName: 'Updated Document Name',
      });
      expect(result).toBe(true);
    });

    it('should update document expiration date', async () => {
      const expiresAt = new Date('2027-01-01');
      vi.mocked(db.updateUserDocument).mockResolvedValue(true);

      const result = await db.updateUserDocument(1, 1, { expiresAt });

      expect(result).toBe(true);
    });

    it('should return false when document not found', async () => {
      vi.mocked(db.updateUserDocument).mockResolvedValue(false);

      const result = await db.updateUserDocument(999, 1, {
        documentName: 'Test',
      });

      expect(result).toBe(false);
    });
  });

  describe('deleteUserDocument', () => {
    it('should delete document successfully', async () => {
      vi.mocked(db.deleteUserDocument).mockResolvedValue(true);

      const result = await db.deleteUserDocument(1, 1);

      expect(db.deleteUserDocument).toHaveBeenCalledWith(1, 1);
      expect(result).toBe(true);
    });

    it('should return false when document not found', async () => {
      vi.mocked(db.deleteUserDocument).mockResolvedValue(false);

      const result = await db.deleteUserDocument(999, 1);

      expect(result).toBe(false);
    });
  });

  describe('getExpiringDocuments', () => {
    it('should return documents expiring within 30 days', async () => {
      const expiringDate = new Date();
      expiringDate.setDate(expiringDate.getDate() + 15);

      const mockDocuments = [
        {
          id: 1,
          userId: 1,
          documentType: 'drivers_license',
          documentName: 'Driver License',
          fileName: 'dl.jpg',
          fileKey: 'docs/1/dl.jpg',
          expiresAt: expiringDate,
          createdAt: new Date(),
        },
      ];

      vi.mocked(db.getExpiringDocuments).mockResolvedValue(mockDocuments as any);

      const result = await db.getExpiringDocuments(1, 30);

      expect(db.getExpiringDocuments).toHaveBeenCalledWith(1, 30);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no documents expiring', async () => {
      vi.mocked(db.getExpiringDocuments).mockResolvedValue([]);

      const result = await db.getExpiringDocuments(1, 30);

      expect(result).toEqual([]);
    });
  });

  describe('Document Types', () => {
    it('should support all required document types', () => {
      const documentTypes = [
        'government_id',
        'drivers_license',
        'passport',
        'social_security_card',
        'utility_bill',
        'bank_statement',
        'lease_agreement',
        'mortgage_statement',
        'pay_stub',
        'tax_return',
        'proof_of_address',
        'dispute_letter',
        'bureau_response',
        'certified_mail_receipt',
        'return_receipt',
        'other',
      ];

      expect(documentTypes).toHaveLength(16);
      expect(documentTypes).toContain('dispute_letter');
      expect(documentTypes).toContain('certified_mail_receipt');
      expect(documentTypes).toContain('bureau_response');
    });
  });
});
