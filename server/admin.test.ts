import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("Admin Dashboard", () => {
  let adminCaller: ReturnType<typeof appRouter.createCaller>;
  let userCaller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    // Mock admin context
    const adminContext: TrpcContext = {
      user: {
        id: "admin-123",
        name: "Admin User",
        email: "admin@example.com",
        role: "admin",
        openId: "admin-openid",
        createdAt: Date.now(),
      },
    };

    // Mock regular user context
    const userContext: TrpcContext = {
      user: {
        id: "user-123",
        name: "Regular User",
        email: "user@example.com",
        role: "user",
        openId: "user-openid",
        createdAt: Date.now(),
      },
    };

    adminCaller = appRouter.createCaller(adminContext);
    userCaller = appRouter.createCaller(userContext);
  });

  describe("getStats", () => {
    it("should return stats for admin users", async () => {
      const result = await adminCaller.admin.getStats();

      expect(result).toBeDefined();
      expect(result.totalUsers).toBeGreaterThanOrEqual(0);
      expect(result.totalLetters).toBeGreaterThanOrEqual(0);
      expect(result.totalRevenue).toBeGreaterThanOrEqual(0);
      expect(result.successRate).toBeGreaterThanOrEqual(0);
      expect(result.lettersByBureau).toBeDefined();
      expect(result.conflictTypes).toBeDefined();
    });

    it("should reject non-admin users", async () => {
      await expect(userCaller.admin.getStats()).rejects.toThrow();
    });
  });

  describe("listUsers", () => {
    it("should return all users for admin", async () => {
      const result = await adminCaller.admin.listUsers();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("id");
        expect(result[0]).toHaveProperty("name");
        expect(result[0]).toHaveProperty("email");
        expect(result[0]).toHaveProperty("letterCount");
      }
    });

    it("should reject non-admin users", async () => {
      await expect(userCaller.admin.listUsers()).rejects.toThrow();
    });
  });

  describe("recentLetters", () => {
    it("should return recent letters for admin", async () => {
      const result = await adminCaller.admin.recentLetters();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(50);
      
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("id");
        expect(result[0]).toHaveProperty("bureau");
        expect(result[0]).toHaveProperty("userName");
      }
    });

    it("should reject non-admin users", async () => {
      await expect(userCaller.admin.recentLetters()).rejects.toThrow();
    });
  });
});
