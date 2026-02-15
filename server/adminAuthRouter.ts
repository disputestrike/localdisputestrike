/**
 * Admin Authentication Router
 * Handles admin login, session management, and admin CRUD operations
 */
import { Router } from "express";
import bcrypt from "bcryptjs";
import { getDb } from "./db";
import { adminAccounts, adminActivityLog } from "../drizzle/schema";
import { eq, desc, gt } from "drizzle-orm";

const router = Router();

// Admin session store (in production, use Redis or database sessions)
const adminSessions = new Map<string, { adminId: number; role: string; email: string; name: string; expiresAt: number }>();

// Generate session token
function generateSessionToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Middleware to verify admin session
export async function verifyAdminSession(req: any, res: any, next: any) {
  const sessionToken = req.cookies?.['admin-session'] || req.headers['x-admin-session'];
  
  if (!sessionToken) {
    return res.status(401).json({ error: 'No admin session' });
  }
  
  const session = adminSessions.get(sessionToken);
  if (!session || session.expiresAt < Date.now()) {
    adminSessions.delete(sessionToken);
    return res.status(401).json({ error: 'Session expired' });
  }
  
  req.admin = session;
  next();
}

// Reset all dispute data + delete admins + create fresh default admin (when locked out)
router.post("/reset-and-bootstrap", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const { resetAllDisputeData } = await import("./db");
    await resetAllDisputeData();
    await db.delete(adminAccounts).where(gt(adminAccounts.id, 0));
    const email = "admin@disputestrike.com";
    const password = "DisputeStrike2024!";
    const hashedPassword = await bcrypt.hash(password, 12);
    await db.insert(adminAccounts).values({
      email,
      passwordHash: hashedPassword,
      name: "Master Admin",
      role: "master_admin",
      status: "active",
    });
    adminSessions.clear();
    res.json({
      success: true,
      message: "All data deleted. Fresh admin created.",
      email,
      password,
    });
  } catch (error) {
    console.error("Reset and bootstrap error:", error);
    res.status(500).json({ error: "Failed: " + (error instanceof Error ? error.message : "unknown") });
  }
});

// Bootstrap: Create default admin ONLY when no admins exist (first-time setup)
router.post("/bootstrap", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const existing = await db.select().from(adminAccounts).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Admin already exists. Use existing credentials." });
    }
    const email = "admin@disputestrike.com";
    const password = "DisputeStrike2024!";
    const hashedPassword = await bcrypt.hash(password, 12);
    await db.insert(adminAccounts).values({
      email,
      passwordHash: hashedPassword,
      name: "Master Admin",
      role: "master_admin",
      status: "active",
    });
    res.json({
      success: true,
      message: "Default admin created. You can now log in.",
      email,
      password,
    });
  } catch (error) {
    console.error("Admin bootstrap error:", error);
    res.status(500).json({ error: "Failed to create admin" });
  }
});

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    
    // Find admin by email
    const [admin] = await db.select().from(adminAccounts).where(eq(adminAccounts.email, email.toLowerCase()));
    
    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Check if account is locked
    if (admin.lockedUntil && new Date(admin.lockedUntil) > new Date()) {
      return res.status(403).json({ error: "Account temporarily locked. Try again later." });
    }
    
    // Check if account is blocked
    if (admin.status === 'blocked') {
      return res.status(403).json({ error: "Account has been blocked. Contact master admin." });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    
    if (!isValid) {
      // Increment login attempts
      const attempts = (admin.loginAttempts || 0) + 1;
      const updates: any = { loginAttempts: attempts };
      
      // Lock account after 5 failed attempts
      if (attempts >= 5) {
        updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }
      
      await db.update(adminAccounts).set(updates).where(eq(adminAccounts.id, admin.id));
      
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Reset login attempts and update last login
    await db.update(adminAccounts)
      .set({ loginAttempts: 0, lockedUntil: null, lastLogin: new Date() })
      .where(eq(adminAccounts.id, admin.id));
    
    // Generate session token
    const sessionToken = generateSessionToken();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    adminSessions.set(sessionToken, {
      adminId: admin.id,
      role: admin.role,
      email: admin.email,
      name: admin.name,
      expiresAt,
    });
    
    // Log activity
    await db.insert(adminActivityLog).values({
      adminId: admin.id,
      action: 'login',
      details: 'Admin logged in',
      ipAddress: req.ip,
    });
    
    // Set cookie
    res.cookie('admin-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    
    res.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      sessionToken, // Also return token for localStorage fallback
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Admin Logout
router.post("/logout", (req, res) => {
  const sessionToken = req.cookies?.['admin-session'] || req.headers['x-admin-session'];
  if (sessionToken) {
    adminSessions.delete(sessionToken);
  }
  res.clearCookie('admin-session');
  res.json({ success: true });
});

// Get current admin session
router.get("/session", async (req, res) => {
  const sessionToken = req.cookies?.['admin-session'] || req.headers['x-admin-session'];
  
  if (!sessionToken) {
    return res.status(401).json({ error: 'No session' });
  }
  
  const session = adminSessions.get(sessionToken);
  if (!session || session.expiresAt < Date.now()) {
    adminSessions.delete(sessionToken);
    return res.status(401).json({ error: 'Session expired' });
  }
  
  const db = await getDb();
  if (!db) {
    return res.status(500).json({ error: "Database not available" });
  }
  
  // Get fresh admin data
  const [admin] = await db.select().from(adminAccounts).where(eq(adminAccounts.id, session.adminId));
  
  if (!admin || admin.status !== 'active') {
    adminSessions.delete(sessionToken);
    return res.status(401).json({ error: 'Account not active' });
  }
  
  res.json({
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    }
  });
});

// ============================================================================
// ADMIN MANAGEMENT ENDPOINTS (require admin session)
// ============================================================================

// Get all admins
router.get("/admins", verifyAdminSession, async (req: any, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    
    const admins = await db.select({
      id: adminAccounts.id,
      email: adminAccounts.email,
      name: adminAccounts.name,
      role: adminAccounts.role,
      status: adminAccounts.status,
      lastLogin: adminAccounts.lastLogin,
      createdAt: adminAccounts.createdAt,
    }).from(adminAccounts).orderBy(desc(adminAccounts.createdAt));
    
    res.json({ admins });
  } catch (error) {
    console.error("Get admins error:", error);
    res.status(500).json({ error: "Failed to get admins" });
  }
});

// Create new admin
router.post("/admins", verifyAdminSession, async (req: any, res) => {
  try {
    // Only master_admin can create admins
    if (req.admin.role !== 'master_admin') {
      return res.status(403).json({ error: "Only master admin can create admins" });
    }
    
    const { email, password, name, role } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name required" });
    }
    
    // Validate role
    const validRoles = ['admin', 'super_admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    
    // Check if email exists
    const [existing] = await db.select().from(adminAccounts).where(eq(adminAccounts.email, email.toLowerCase()));
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create admin
    const [result] = await db.insert(adminAccounts).values({
      email: email.toLowerCase(),
      passwordHash,
      name,
      role: role || 'admin',
      createdBy: req.admin.adminId,
    });
    
    // Log activity
    await db.insert(adminActivityLog).values({
      adminId: req.admin.adminId,
      action: 'create_admin',
      targetType: 'admin',
      targetId: result.insertId,
      details: `Created admin: ${email}`,
      ipAddress: req.ip,
    });
    
    res.json({ success: true, adminId: result.insertId });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ error: "Failed to create admin" });
  }
});

// Update admin
router.put("/admins/:id", verifyAdminSession, async (req: any, res) => {
  try {
    const adminId = parseInt(req.params.id);
    const { name, role, status, password } = req.body;
    
    // Only master_admin can update admins
    if (req.admin.role !== 'master_admin') {
      return res.status(403).json({ error: "Only master admin can update admins" });
    }
    
    // Can't modify own account through this endpoint
    if (adminId === req.admin.adminId) {
      return res.status(400).json({ error: "Use profile settings to modify your own account" });
    }
    
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    
    const [targetAdmin] = await db.select().from(adminAccounts).where(eq(adminAccounts.id, adminId));
    if (!targetAdmin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    
    // Can't modify master_admin
    if (targetAdmin.role === 'master_admin') {
      return res.status(403).json({ error: "Cannot modify master admin" });
    }
    
    const updates: any = {};
    if (name) updates.name = name;
    if (role && ['admin', 'super_admin'].includes(role)) updates.role = role;
    if (status && ['active', 'blocked', 'suspended'].includes(status)) updates.status = status;
    if (password) updates.passwordHash = await bcrypt.hash(password, 12);
    
    if (Object.keys(updates).length > 0) {
      await db.update(adminAccounts).set(updates).where(eq(adminAccounts.id, adminId));
      
      // Log activity
      await db.insert(adminActivityLog).values({
        adminId: req.admin.adminId,
        action: 'update_admin',
        targetType: 'admin',
        targetId: adminId,
        details: `Updated admin: ${targetAdmin.email}`,
        ipAddress: req.ip,
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Update admin error:", error);
    res.status(500).json({ error: "Failed to update admin" });
  }
});

// Delete admin
router.delete("/admins/:id", verifyAdminSession, async (req: any, res) => {
  try {
    const adminId = parseInt(req.params.id);
    
    // Only master_admin can delete admins
    if (req.admin.role !== 'master_admin') {
      return res.status(403).json({ error: "Only master admin can delete admins" });
    }
    
    // Can't delete self
    if (adminId === req.admin.adminId) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }
    
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    
    const [targetAdmin] = await db.select().from(adminAccounts).where(eq(adminAccounts.id, adminId));
    if (!targetAdmin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    
    // Can't delete master_admin
    if (targetAdmin.role === 'master_admin') {
      return res.status(403).json({ error: "Cannot delete master admin" });
    }
    
    await db.delete(adminAccounts).where(eq(adminAccounts.id, adminId));
    
    // Log activity
    await db.insert(adminActivityLog).values({
      adminId: req.admin.adminId,
      action: 'delete_admin',
      targetType: 'admin',
      targetId: adminId,
      details: `Deleted admin: ${targetAdmin.email}`,
      ipAddress: req.ip,
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Delete admin error:", error);
    res.status(500).json({ error: "Failed to delete admin" });
  }
});

// Get activity log
router.get("/activity", verifyAdminSession, async (req: any, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    
    const logs = await db.select({
      id: adminActivityLog.id,
      adminId: adminActivityLog.adminId,
      action: adminActivityLog.action,
      targetType: adminActivityLog.targetType,
      targetId: adminActivityLog.targetId,
      details: adminActivityLog.details,
      createdAt: adminActivityLog.createdAt,
    })
    .from(adminActivityLog)
    .orderBy(desc(adminActivityLog.createdAt))
    .limit(limit);
    
    res.json({ logs });
  } catch (error) {
    console.error("Get activity error:", error);
    res.status(500).json({ error: "Failed to get activity log" });
  }
});

// Change own password
router.post("/change-password", verifyAdminSession, async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password required" });
    }
    
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    
    const [admin] = await db.select().from(adminAccounts).where(eq(adminAccounts.id, req.admin.adminId));
    
    const isValid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }
    
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.update(adminAccounts).set({ passwordHash }).where(eq(adminAccounts.id, req.admin.adminId));
    
    res.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
});

export default router;
export { adminSessions };
