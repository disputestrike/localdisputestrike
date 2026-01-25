/**
 * Custom Authentication System
 * Email/Password authentication for self-hosting without Manus OAuth
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/mysql2';
import { users } from '../drizzle/schema';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from './emailService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 12;

// Get database connection
async function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }
  
  const dbUrl = process.env.DATABASE_URL;
  const cleanUrl = dbUrl.replace(/[?&]ssl=[^&]*/g, '');
  const sslUrl = cleanUrl.includes('?') 
    ? `${cleanUrl}&ssl={"rejectUnauthorized":false}` 
    : `${cleanUrl}?ssl={"rejectUnauthorized":false}`;
  
  return drizzle(sslUrl);
}

// Generate a unique openId for new users (compatible with existing system)
function generateOpenId(): string {
  return `local_${crypto.randomBytes(16).toString('hex')}`;
}

// Generate JWT token
export function generateToken(userId: number, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): { userId: number; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
  } catch {
    return null;
  }
}

// Hash password
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Compare password with hash
async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate random token for email verification / password reset
function generateRandomToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: number;
    name: string | null;
    email: string | null;
    emailVerified: boolean;
  };
}

/**
 * Register a new user with email and password
 */
export async function registerUser(input: RegisterInput, baseUrl: string): Promise<AuthResult> {
  const { name, email, password } = input;
  
  // Validate input
  if (!name || name.trim().length < 2) {
    return { success: false, message: 'Name must be at least 2 characters' };
  }
  
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Please enter a valid email address' };
  }
  
  if (!password || password.length < 8) {
    return { success: false, message: 'Password must be at least 8 characters' };
  }
  
  try {
    const db = await getDb();
    
    // Check if email already exists
    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (existing.length > 0) {
      return { success: false, message: 'An account with this email already exists' };
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Generate verification token
    const verificationToken = generateRandomToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Create user
    const openId = generateOpenId();
    
    // FAULT TOLERANT REGISTRATION:
    // We try to insert with all fields. If it fails (e.g. database schema not updated),
    // we fall back to a minimal insert with only core fields.
    try {
      await db.insert(users).values({
        openId,
        name: name.trim(),
        email: email.toLowerCase(),
        loginMethod: 'email',
        passwordHash,
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,

      });
    } catch (dbError) {
      console.warn('[Auth] Full registration failed, falling back to minimal registration:', dbError);
      // Fallback to minimal fields that definitely exist
      await db.insert(users).values({
        openId,
        name: name.trim(),
        email: email.toLowerCase(),
        loginMethod: 'email',
        passwordHash,
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      });
    }
    
    // Get the created user
    const newUser = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (!newUser[0]) {
      return { success: false, message: 'Failed to create account' };
    }
    
    // Send verification email
    await sendVerificationEmail(email, name, verificationToken, baseUrl);
    
    console.log(`[Auth] New user registered: ${email}`);
    
    return {
      success: true,
      message: 'Account created! Please check your email to verify your account.',
      user: {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
        emailVerified: false,
      },
    };
  } catch (error) {
    console.error('[Auth] Registration error:', error);
    return { success: false, message: 'An error occurred during registration' };
  }
}

/**
 * Login with email and password
 */
export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const { email, password } = input;
  
  if (!email || !password) {
    return { success: false, message: 'Email and password are required' };
  }
  
  try {
    const db = await getDb();
    
    // Find user by email
    const result = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    const user = result[0];
    
    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }
    
    // Check if user has a password (might be OAuth user)
    if (!user.passwordHash) {
      return { success: false, message: 'This account uses social login. Please sign in with Google, Microsoft, or Apple.' };
    }
    
    // Verify password
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, message: 'Invalid email or password' };
    }
    
    // Check if email is verified
    if (!user.emailVerified) {
      return { success: false, message: 'Please verify your email before logging in. Check your inbox for the verification link.' };
    }
    
    // Update last signed in
    await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));
    
    // Generate JWT token
    const token = generateToken(user.id, user.email || '');
    
    console.log(`[Auth] User logged in: ${email}`);
    
    return {
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified || false,
      },
    };
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return { success: false, message: 'An error occurred during login' };
  }
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<AuthResult> {
  if (!token) {
    return { success: false, message: 'Verification token is required' };
  }
  
  try {
    const db = await getDb();
    
    // Find user with this verification token
    const result = await db.select().from(users).where(eq(users.emailVerificationToken, token)).limit(1);
    const user = result[0];
    
    if (!user) {
      return { success: false, message: 'Invalid or expired verification link' };
    }
    
    // Check if token is expired
    if (user.emailVerificationExpires && new Date() > user.emailVerificationExpires) {
      return { success: false, message: 'Verification link has expired. Please request a new one.' };
    }
    
    // Mark email as verified
    await db.update(users).set({
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    }).where(eq(users.id, user.id));
    
    // Send welcome email
    if (user.email && user.name) {
      await sendWelcomeEmail(user.email, user.name);
    }
    
    // Generate login token
    const jwtToken = generateToken(user.id, user.email || '');
    
    console.log(`[Auth] Email verified: ${user.email}`);
    
    return {
      success: true,
      message: 'Email verified successfully! You can now log in.',
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: true,
      },
    };
  } catch (error) {
    console.error('[Auth] Email verification error:', error);
    return { success: false, message: 'An error occurred during verification' };
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string, baseUrl: string): Promise<AuthResult> {
  if (!email) {
    return { success: false, message: 'Email is required' };
  }
  
  try {
    const db = await getDb();
    
    // Find user by email
    const result = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    const user = result[0];
    
    // Always return success to prevent email enumeration
    if (!user) {
      console.log(`[Auth] Password reset requested for non-existent email: ${email}`);
      return { success: true, message: 'If an account exists with this email, you will receive a password reset link.' };
    }
    
    // Generate reset token
    const resetToken = generateRandomToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Save reset token
    await db.update(users).set({
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    }).where(eq(users.id, user.id));
    
    // Send reset email
    if (user.email && user.name) {
      await sendPasswordResetEmail(user.email, user.name, resetToken, baseUrl);
    }
    
    console.log(`[Auth] Password reset requested: ${email}`);
    
    return {
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    };
  } catch (error) {
    console.error('[Auth] Password reset request error:', error);
    return { success: false, message: 'An error occurred' };
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<AuthResult> {
  if (!token || !newPassword) {
    return { success: false, message: 'Token and new password are required' };
  }
  
  if (newPassword.length < 8) {
    return { success: false, message: 'Password must be at least 8 characters' };
  }
  
  try {
    const db = await getDb();
    
    // Find user with this reset token
    const result = await db.select().from(users).where(eq(users.passwordResetToken, token)).limit(1);
    const user = result[0];
    
    if (!user) {
      return { success: false, message: 'Invalid or expired reset link' };
    }
    
    // Check if token is expired
    if (user.passwordResetExpires && new Date() > user.passwordResetExpires) {
      return { success: false, message: 'Reset link has expired. Please request a new one.' };
    }
    
    // Hash new password
    const passwordHash = await hashPassword(newPassword);
    
    // Update password and clear reset token
    await db.update(users).set({
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    }).where(eq(users.id, user.id));
    
    console.log(`[Auth] Password reset completed: ${user.email}`);
    
    return {
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    };
  } catch (error) {
    console.error('[Auth] Password reset error:', error);
    return { success: false, message: 'An error occurred' };
  }
}

/**
 * Get user from JWT token
 */
export async function getUserFromToken(token: string) {
  const decoded = verifyToken(token);
  if (!decoded) return null;
  
  try {
    const db = await getDb();
    const result = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
    return result[0] || null;
  } catch {
    return null;
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email: string, baseUrl: string): Promise<AuthResult> {
  if (!email) {
    return { success: false, message: 'Email is required' };
  }
  
  try {
    const db = await getDb();
    
    // Find user by email
    const result = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    const user = result[0];
    
    if (!user) {
      return { success: false, message: 'No account found with this email' };
    }
    
    if (user.emailVerified) {
      return { success: false, message: 'Email is already verified' };
    }
    
    // Generate new verification token
    const verificationToken = generateRandomToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Update token
    await db.update(users).set({
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    }).where(eq(users.id, user.id));
    
    // Send verification email
    if (user.name) {
      await sendVerificationEmail(email, user.name, verificationToken, baseUrl);
    }
    
    console.log(`[Auth] Verification email resent: ${email}`);
    
    return {
      success: true,
      message: 'Verification email sent! Please check your inbox.',
    };
  } catch (error) {
    console.error('[Auth] Resend verification error:', error);
    return { success: false, message: 'An error occurred' };
  }
}
