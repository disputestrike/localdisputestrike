/**
 * Google OAuth Authentication Service
 * 
 * Handles Google Sign-In for DisputeStrike
 * - OAuth 2.0 flow
 * - User creation/login
 * - Token generation
 * - Self-healing database migration
 */

import crypto from 'crypto';
import { eq, sql } from 'drizzle-orm';
import { getDb } from './db';
import { users } from '../drizzle/schema';
import { generateToken } from './customAuth';

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '56326714738-d92eth6jol7qf0uh8vpfqrvsdoivdut7.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';

// Generate a unique openId for new users
function generateOpenId(): string {
  return `google_${crypto.randomBytes(16).toString('hex')}`;
}

/**
 * Self-healing database migration
 * Automatically adds missing columns if they don't exist
 */
async function ensureSchemaUpdated(db: any) {
  try {
    console.log('[Google Auth] Checking database schema...');
    
    // Check if googleId column exists
    try {
      await db.execute(sql`SELECT googleId FROM users LIMIT 1`);
      console.log('[Google Auth] Schema is up to date.');
    } catch (e: any) {
      if (e.message && (e.message.includes('Unknown column') || e.message.includes('no such column'))) {
        console.log('[Google Auth] Missing googleId column. Attempting to add it...');
        await db.execute(sql`ALTER TABLE users ADD COLUMN googleId VARCHAR(255) UNIQUE`);
        console.log('[Google Auth] Successfully added googleId column.');
      } else {
        throw e;
      }
    }
  } catch (error) {
    console.error('[Google Auth] Schema update failed:', error);
    // We don't throw here to allow the rest of the flow to attempt to proceed
  }
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export interface GoogleAuthResult {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: number;
    name: string | null;
    email: string | null;
    emailVerified: boolean;
    isNewUser: boolean;
  };
}

/**
 * Get Google OAuth authorization URL
 */
export function getGoogleAuthUrl(redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    ...(state && { state }),
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<{
  access_token: string;
  id_token: string;
  refresh_token?: string;
} | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('[Google Auth] Token exchange failed:', error);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('[Google Auth] Token exchange error:', error);
    return null;
  }
}

/**
 * Get user info from Google using access token
 */
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo | null> {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('[Google Auth] User info fetch failed:', error);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('[Google Auth] User info error:', error);
    return null;
  }
}

/**
 * Handle Google OAuth callback - create or login user
 */
export async function handleGoogleCallback(code: string, redirectUri: string): Promise<GoogleAuthResult> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, message: 'Database not available' };
    }
    
    // Run self-healing migration
    await ensureSchemaUpdated(db);
    
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    if (!tokens) {
      return { success: false, message: 'Failed to exchange authorization code' };
    }
    
    // Get user info from Google
    const googleUser = await getGoogleUserInfo(tokens.access_token);
    if (!googleUser) {
      return { success: false, message: 'Failed to get user info from Google' };
    }
    
    if (!googleUser.email) {
      return { success: false, message: 'No email provided by Google' };
    }
    
    // Check if user already exists
    const existingUsers = await db.select().from(users).where(eq(users.email, googleUser.email.toLowerCase())).limit(1);
    const existingUser = existingUsers[0];
    
    if (existingUser) {
      // User exists - update their info and log them in
      await db.update(users).set({
        name: googleUser.name || existingUser.name,
        lastSignedIn: new Date(),
        emailVerified: true, // Google emails are verified
        googleId: googleUser.id, // Link Google ID if not already linked
      }).where(eq(users.id, existingUser.id));
      
      const token = generateToken(existingUser.id, existingUser.email || '');
      
      console.log(`[Google Auth] Existing user logged in: ${googleUser.email}`);
      
      return {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: existingUser.id,
          name: googleUser.name || existingUser.name,
          email: existingUser.email,
          emailVerified: true,
          isNewUser: false,
        },
      };
    }
    
    // New user - create account
    const openId = generateOpenId();
    
    await db.insert(users).values({
      openId,
      googleId: googleUser.id,
      name: googleUser.name || 'User',
      email: googleUser.email.toLowerCase(),
      loginMethod: 'google',
      emailVerified: true, // Google emails are verified
    });
    
    // Get the created user
    const newUsers = await db.select().from(users).where(eq(users.email, googleUser.email.toLowerCase())).limit(1);
    const newUser = newUsers[0];
    
    if (!newUser) {
      return { success: false, message: 'Failed to create account' };
    }
    
    const token = generateToken(newUser.id, newUser.email || '');
    
    console.log(`[Google Auth] New user registered: ${googleUser.email}`);
    
    return {
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        emailVerified: true,
        isNewUser: true,
      },
    };
  } catch (error) {
    console.error('[Google Auth] Callback error:', error);
    return { success: false, message: 'An error occurred during Google sign-in' };
  }
}
