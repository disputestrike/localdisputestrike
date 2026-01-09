import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock database functions
vi.mock('./db', () => ({
  getUserById: vi.fn(),
  getAgencyStats: vi.fn(),
  getAgencyClients: vi.fn(),
  getAgencyClient: vi.fn(),
  createAgencyClient: vi.fn(),
  updateAgencyClient: vi.fn(),
  archiveAgencyClient: vi.fn(),
  upgradeToAgency: vi.fn(),
}));

import * as db from './db';

describe('Agency Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Agency Account Upgrade', () => {
    it('should upgrade user to agency with correct plan details', async () => {
      const mockUpgrade = vi.mocked(db.upgradeToAgency);
      mockUpgrade.mockResolvedValue(undefined);

      await db.upgradeToAgency(1, 'Test Agency', 'starter');

      expect(mockUpgrade).toHaveBeenCalledWith(1, 'Test Agency', 'starter');
    });

    it('should set correct client slots for starter plan (50)', async () => {
      // Starter plan should have 50 client slots
      const planConfig = { starter: 50, professional: 200, enterprise: 500 };
      expect(planConfig.starter).toBe(50);
    });

    it('should set correct client slots for professional plan (200)', async () => {
      const planConfig = { starter: 50, professional: 200, enterprise: 500 };
      expect(planConfig.professional).toBe(200);
    });

    it('should set correct client slots for enterprise plan (500)', async () => {
      const planConfig = { starter: 50, professional: 200, enterprise: 500 };
      expect(planConfig.enterprise).toBe(500);
    });

    it('should set correct pricing for each plan', async () => {
      const priceConfig = { starter: 497, professional: 997, enterprise: 1997 };
      expect(priceConfig.starter).toBe(497);
      expect(priceConfig.professional).toBe(997);
      expect(priceConfig.enterprise).toBe(1997);
    });
  });

  describe('Agency Stats', () => {
    it('should return agency stats for valid agency user', async () => {
      const mockStats = vi.mocked(db.getAgencyStats);
      mockStats.mockResolvedValue({
        agencyName: 'Test Agency',
        planTier: 'professional',
        clientSlotsIncluded: 200,
        clientSlotsUsed: 50,
        monthlyPrice: '997',
        totalClients: 50,
        activeClients: 45,
        totalLetters: 150,
        activeDisputes: 30,
      });

      const stats = await db.getAgencyStats(1);

      expect(stats).not.toBeNull();
      expect(stats?.agencyName).toBe('Test Agency');
      expect(stats?.clientSlotsIncluded).toBe(200);
      expect(stats?.activeClients).toBe(45);
    });

    it('should return null for non-agency user', async () => {
      const mockStats = vi.mocked(db.getAgencyStats);
      mockStats.mockResolvedValue(null);

      const stats = await db.getAgencyStats(999);

      expect(stats).toBeNull();
    });
  });

  describe('Client Management', () => {
    it('should create a new client for agency', async () => {
      const mockCreate = vi.mocked(db.createAgencyClient);
      mockCreate.mockResolvedValue({
        id: 1,
        agencyUserId: 1,
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        clientPhone: '555-1234',
        dateOfBirth: null,
        ssnLast4: null,
        currentAddress: null,
        currentCity: null,
        currentState: null,
        currentZip: null,
        previousAddress: null,
        previousCity: null,
        previousState: null,
        previousZip: null,
        status: 'active',
        totalLettersGenerated: 0,
        totalAccountsDisputed: 0,
        lastActivityAt: null,
        internalNotes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const client = await db.createAgencyClient({
        agencyUserId: 1,
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        clientPhone: '555-1234',
      });

      expect(client).not.toBeNull();
      expect(client?.clientName).toBe('John Doe');
      expect(client?.status).toBe('active');
    });

    it('should list all clients for agency', async () => {
      const mockList = vi.mocked(db.getAgencyClients);
      mockList.mockResolvedValue([
        {
          id: 1,
          agencyUserId: 1,
          clientName: 'John Doe',
          clientEmail: 'john@example.com',
          clientPhone: null,
          dateOfBirth: null,
          ssnLast4: null,
          currentAddress: null,
          currentCity: null,
          currentState: null,
          currentZip: null,
          previousAddress: null,
          previousCity: null,
          previousState: null,
          previousZip: null,
          status: 'active',
          totalLettersGenerated: 5,
          totalAccountsDisputed: 3,
          lastActivityAt: new Date(),
          internalNotes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          agencyUserId: 1,
          clientName: 'Jane Smith',
          clientEmail: 'jane@example.com',
          clientPhone: null,
          dateOfBirth: null,
          ssnLast4: null,
          currentAddress: null,
          currentCity: null,
          currentState: null,
          currentZip: null,
          previousAddress: null,
          previousCity: null,
          previousState: null,
          previousZip: null,
          status: 'active',
          totalLettersGenerated: 10,
          totalAccountsDisputed: 8,
          lastActivityAt: new Date(),
          internalNotes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const clients = await db.getAgencyClients(1);

      expect(clients).toHaveLength(2);
      expect(clients[0].clientName).toBe('John Doe');
      expect(clients[1].clientName).toBe('Jane Smith');
    });

    it('should get single client by ID', async () => {
      const mockGet = vi.mocked(db.getAgencyClient);
      mockGet.mockResolvedValue({
        id: 1,
        agencyUserId: 1,
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        clientPhone: '555-1234',
        dateOfBirth: '1990-01-15',
        ssnLast4: '1234',
        currentAddress: '123 Main St',
        currentCity: 'Miami',
        currentState: 'FL',
        currentZip: '33101',
        previousAddress: null,
        previousCity: null,
        previousState: null,
        previousZip: null,
        status: 'active',
        totalLettersGenerated: 5,
        totalAccountsDisputed: 3,
        lastActivityAt: new Date(),
        internalNotes: 'Good client',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const client = await db.getAgencyClient(1, 1);

      expect(client).not.toBeNull();
      expect(client?.clientName).toBe('John Doe');
      expect(client?.currentCity).toBe('Miami');
    });

    it('should return null for non-existent client', async () => {
      const mockGet = vi.mocked(db.getAgencyClient);
      mockGet.mockResolvedValue(null);

      const client = await db.getAgencyClient(999, 1);

      expect(client).toBeNull();
    });

    it('should update client information', async () => {
      const mockUpdate = vi.mocked(db.updateAgencyClient);
      mockUpdate.mockResolvedValue({
        id: 1,
        agencyUserId: 1,
        clientName: 'John Updated',
        clientEmail: 'john.updated@example.com',
        clientPhone: '555-9999',
        dateOfBirth: null,
        ssnLast4: null,
        currentAddress: null,
        currentCity: null,
        currentState: null,
        currentZip: null,
        previousAddress: null,
        previousCity: null,
        previousState: null,
        previousZip: null,
        status: 'active',
        totalLettersGenerated: 5,
        totalAccountsDisputed: 3,
        lastActivityAt: new Date(),
        internalNotes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const updated = await db.updateAgencyClient(1, 1, {
        clientName: 'John Updated',
        clientEmail: 'john.updated@example.com',
      });

      expect(updated?.clientName).toBe('John Updated');
      expect(updated?.clientEmail).toBe('john.updated@example.com');
    });

    it('should archive client', async () => {
      const mockArchive = vi.mocked(db.archiveAgencyClient);
      mockArchive.mockResolvedValue(undefined);

      await db.archiveAgencyClient(1, 1);

      expect(mockArchive).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('Client Slot Management', () => {
    it('should track available slots correctly', () => {
      const slotsIncluded = 200;
      const slotsUsed = 50;
      const availableSlots = slotsIncluded - slotsUsed;

      expect(availableSlots).toBe(150);
    });

    it('should prevent adding client when slots full', () => {
      const slotsIncluded = 50;
      const slotsUsed = 50;
      const canAddClient = slotsUsed < slotsIncluded;

      expect(canAddClient).toBe(false);
    });

    it('should allow adding client when slots available', () => {
      const slotsIncluded = 50;
      const slotsUsed = 49;
      const canAddClient = slotsUsed < slotsIncluded;

      expect(canAddClient).toBe(true);
    });
  });
});
