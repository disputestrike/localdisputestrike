import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as db from './db';

describe('Agency Features', () => {
  let testUserId: number;
  let testClientId: number;
  const testOpenId = `test-agency-${Date.now()}`;
  const testEmail = `test-agency-${Date.now()}@test.com`;

  beforeAll(async () => {
    // Create a test user using upsertUser
    await db.upsertUser({
      openId: testOpenId,
      email: testEmail,
      name: 'Test Agency User',
    });
    
    // Get the user by openId
    const user = await db.getUserByOpenId(testOpenId);
    if (!user) throw new Error('Failed to create test user');
    testUserId = user.id;
    
    // Upgrade to agency
    await db.upgradeToAgency(testUserId, 'Test Agency', 'starter');
  });

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      // Archive any test clients
      const clients = await db.getAgencyClients(testUserId);
      for (const client of clients) {
        await db.archiveAgencyClient(client.id, testUserId);
      }
    }
  });

  describe('Stripe Checkout Integration', () => {
    it('should have agency products defined', async () => {
      // Import products
      const { AGENCY_PRODUCTS } = await import('./products');
      
      expect(AGENCY_PRODUCTS).toBeDefined();
      expect(AGENCY_PRODUCTS.starter).toBeDefined();
      expect(AGENCY_PRODUCTS.professional).toBeDefined();
      expect(AGENCY_PRODUCTS.enterprise).toBeDefined();
      
      // Check starter plan
      expect(AGENCY_PRODUCTS.starter.price).toBe(497);
      expect(AGENCY_PRODUCTS.starter.clientSlots).toBe(50);
      
      // Check professional plan
      expect(AGENCY_PRODUCTS.professional.price).toBe(997);
      expect(AGENCY_PRODUCTS.professional.clientSlots).toBe(200);
      
      // Check enterprise plan
      expect(AGENCY_PRODUCTS.enterprise.price).toBe(1997);
      expect(AGENCY_PRODUCTS.enterprise.clientSlots).toBe(500);
    });

    it('should upgrade user to agency account', async () => {
      const user = await db.getUserById(testUserId);
      
      expect(user).toBeDefined();
      expect(user?.accountType).toBe('agency');
      expect(user?.agencyName).toBe('Test Agency');
      expect(user?.agencyPlanTier).toBe('starter');
      expect(user?.clientSlotsIncluded).toBe(50);
    });

    it('should get agency stats', async () => {
      const stats = await db.getAgencyStats(testUserId);
      
      expect(stats).toBeDefined();
      expect(stats?.agencyName).toBe('Test Agency');
      expect(stats?.planTier).toBe('starter');
      expect(stats?.clientSlotsIncluded).toBe(50);
    });
  });

  describe('CSV Bulk Import', () => {
    it('should create multiple clients via bulk import', async () => {
      // Create first client
      const client1 = await db.createAgencyClient({
        agencyUserId: testUserId,
        clientName: 'Bulk Import Client 1',
        clientEmail: 'bulk1@test.com',
        clientPhone: '(555) 111-1111',
      });
      
      expect(client1).toBeDefined();
      expect(client1?.clientName).toBe('Bulk Import Client 1');
      
      // Create second client
      const client2 = await db.createAgencyClient({
        agencyUserId: testUserId,
        clientName: 'Bulk Import Client 2',
        clientEmail: 'bulk2@test.com',
      });
      
      expect(client2).toBeDefined();
      expect(client2?.clientName).toBe('Bulk Import Client 2');
      
      // Verify both clients exist
      const clients = await db.getAgencyClients(testUserId);
      expect(clients.length).toBeGreaterThanOrEqual(2);
      
      // Store for later tests
      testClientId = client1!.id;
    });

    it('should track client slots usage', async () => {
      const stats = await db.getAgencyStats(testUserId);
      
      expect(stats).toBeDefined();
      expect(stats?.clientSlotsUsed).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Agency Onboarding', () => {
    it('should complete onboarding', async () => {
      await db.completeAgencyOnboarding(testUserId);
      
      const user = await db.getUserById(testUserId);
      expect(user?.agencyOnboardingCompleted).toBe(true);
    });

    it('should track client creation for onboarding', async () => {
      const clients = await db.getAgencyClients(testUserId);
      expect(clients.length).toBeGreaterThan(0);
    });
  });

  describe('Client Management', () => {
    it('should get client by ID', async () => {
      if (testClientId) {
        const client = await db.getAgencyClient(testClientId, testUserId);
        
        expect(client).toBeDefined();
        expect(client?.clientName).toBe('Bulk Import Client 1');
      }
    });

    it('should update client information', async () => {
      if (testClientId) {
        await db.updateAgencyClient(testClientId, testUserId, {
          clientPhone: '(555) 999-9999',
          notes: 'Updated via test',
        });
        
        const client = await db.getAgencyClient(testClientId, testUserId);
        expect(client?.clientPhone).toBe('(555) 999-9999');
        expect(client?.notes).toBe('Updated via test');
      }
    });

    it('should archive client and free up slot', async () => {
      // Get initial slots used
      const statsBefore = await db.getAgencyStats(testUserId);
      const slotsBefore = statsBefore?.clientSlotsUsed || 0;
      
      // Create a new client to archive
      const tempClient = await db.createAgencyClient({
        agencyUserId: testUserId,
        clientName: 'Temp Client To Archive',
        clientEmail: 'temp@test.com',
      });
      
      // Verify slot was used
      const statsAfterCreate = await db.getAgencyStats(testUserId);
      expect(statsAfterCreate?.clientSlotsUsed).toBe(slotsBefore + 1);
      
      // Archive the client
      await db.archiveAgencyClient(tempClient!.id, testUserId);
      
      // Verify slot was freed
      const statsAfterArchive = await db.getAgencyStats(testUserId);
      expect(statsAfterArchive?.clientSlotsUsed).toBe(slotsBefore);
    });
  });
});
