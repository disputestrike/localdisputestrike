/**
 * Google OAuth Authentication Service
 * 
 * Handles Google Sign-In for DisputeStrike
 * - OAuth 2.0 flow
 * - User creation/login
 * - Token generation
 * - Bulletproof implementation using existing openId column
 */

import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { getDb } from './db';
import { users } from '../drizzle/schema';
import { generateToken } from './customAuth';

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

function assertGoogleConfig(): { clientId: string; clientSecret: string } {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.");
  }
  return { clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET };
}

// Generate a unique openId for new users
function generateOpenId(googleId: string): string {
  // Use the Google ID as part of the openId to ensure uniqueness and linkability
  return `google_${googleId}`;
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
  const { clientId } = assertGoogleConfig();
  const params = new URLSearchParams({
    client_id: clientId,
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
    const { clientId, clientSecret } = assertGoogleConfig();
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
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
export async function handleGoogleCallback(
  code: string,
  redirectUri: string,
  affiliateSource?: 'smartcredit' | 'identityiq' | 'direct_upload' | 'none'
): Promise<GoogleAuthResult> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, message: 'Database not available' };
    }
    
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
    
    // Check if user already exists by email
    // Try full query first, fallback to minimal if columns don't exist
    let existingUser: any;
    try {
      const existingUsers = await db.select({
        id: users.id,
        openId: users.openId,
        name: users.name,
        email: users.email,
        loginMethod: users.loginMethod,
        role: users.role,
        passwordHash: users.passwordHash,
        emailVerified: users.emailVerified,
        affiliateSource: users.affiliateSource,
        emailVerificationToken: users.emailVerificationToken,
        emailVerificationExpires: users.emailVerificationExpires,
        passwordResetToken: users.passwordResetToken,
        passwordResetExpires: users.passwordResetExpires,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      }).from(users).where(eq(users.email, googleUser.email.toLowerCase())).limit(1);
      existingUser = existingUsers[0];
    } catch (queryError: any) {
      console.warn('[Google Auth] Full query failed, trying minimal query:', queryError.message);
      // Fallback to minimal columns that definitely exist
      try {
        const minimalUsers = await db.select({
          id: users.id,
          email: users.email,
          name: users.name,
          openId: users.openId,
          loginMethod: users.loginMethod,
          role: users.role,
        }).from(users).where(eq(users.email, googleUser.email.toLowerCase())).limit(1);
        existingUser = minimalUsers[0];
        if (existingUser) {
          // Set defaults for missing fields
          existingUser = {
            ...existingUser,
            passwordHash: null,
            emailVerified: false,
            affiliateSource: 'direct_upload',
            emailVerificationToken: null,
            emailVerificationExpires: null,
            passwordResetToken: null,
            passwordResetExpires: null,
            createdAt: null,
            updatedAt: null,
          };
        }
      } catch (minimalError: any) {
        console.error('[Google Auth] Minimal query also failed:', minimalError.message);
        throw new Error(`Database query failed: ${minimalError.message}`);
      }
    }
    
    if (existingUser) {
      // User exists - update their info and log them in
      // Try to update with lastSignedIn, fallback if column doesn't exist
      try {
        await db.update(users).set({
          name: googleUser.name || existingUser.name,
          lastSignedIn: new Date(),
          emailVerified: true, // Google emails are verified
        }).where(eq(users.id, existingUser.id));
      } catch (updateError: any) {
        // If lastSignedIn or emailVerified don't exist, try without them
        if (updateError.message?.includes('lastSignedIn') || updateError.message?.includes('emailVerified')) {
          console.warn('[Google Auth] Update with lastSignedIn/emailVerified failed, trying without:', updateError.message);
          try {
            await db.update(users).set({
              name: googleUser.name || existingUser.name,
            }).where(eq(users.id, existingUser.id));
          } catch (simpleUpdateError: any) {
            console.warn('[Google Auth] Simple update also failed, continuing:', simpleUpdateError.message);
            // Continue anyway - user can still log in
          }
        } else {
          throw updateError;
        }
      }

      if (affiliateSource === 'smartcredit') {
        try {
          await db.update(users).set({
            affiliateSource: 'smartcredit',
          }).where(eq(users.id, existingUser.id));
        } catch (affiliateError: any) {
          console.warn('[Google Auth] affiliateSource update failed, continuing:', affiliateError.message);
        }
      }
      
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
    
    // New user - create account using openId as the link
    const openId = generateOpenId(googleUser.id);
    
    // Check if a user with this openId already exists (edge case)
    const usersByOpenId = await db.select({
      id: users.id,
      openId: users.openId,
      name: users.name,
      email: users.email,
      loginMethod: users.loginMethod,
      role: users.role,
      passwordHash: users.passwordHash,
      emailVerified: users.emailVerified,
      emailVerificationToken: users.emailVerificationToken,
      emailVerificationExpires: users.emailVerificationExpires,
      passwordResetToken: users.passwordResetToken,
      passwordResetExpires: users.passwordResetExpires,
      // firstName: users.firstName,
      // middleInitial: users.middleInitial,
      // lastName: users.lastName,
      // address: users.address,
      // city: users.city,
      // state: users.state,
      // zipCode: users.zipCode,
      // ssn: users.ssn,
      // dateOfBirth: users.dateOfBirth,
      // phoneNumber: users.phoneNumber,
      // identityiqUserId: users.identityiqUserId,
      // identityiqEnrollmentDate: users.identityiqEnrollmentDate,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).where(eq(users.openId, openId)).limit(1);
    if (usersByOpenId[0]) {
      const user = usersByOpenId[0];
      const token = generateToken(user.id, user.email || '');
      return {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: true,
          isNewUser: false,
        },
      };
    }

    // Insert new user - try with emailVerified, fallback if column doesn't exist
    try {
      await db.insert(users).values({
        openId,
        name: googleUser.name || 'User',
        email: googleUser.email.toLowerCase(),
        loginMethod: 'google',
        emailVerified: true, // Google emails are verified
        affiliateSource: affiliateSource || 'direct_upload',
      });
    } catch (insertError: any) {
      if (insertError.message?.includes('emailVerified') || insertError.message?.includes('affiliateSource')) {
        console.warn('[Google Auth] Insert with emailVerified/affiliateSource failed, trying without:', insertError.message);
        await db.insert(users).values({
          openId,
          name: googleUser.name || 'User',
          email: googleUser.email.toLowerCase(),
          loginMethod: 'google',
        });
      } else {
        throw insertError;
      }
    }
    
    // Get the created user - try full query, fallback to minimal
    let newUsers: any[];
    try {
      newUsers = await db.select({
        id: users.id,
        openId: users.openId,
        name: users.name,
        email: users.email,
        loginMethod: users.loginMethod,
        role: users.role,
        passwordHash: users.passwordHash,
        emailVerified: users.emailVerified,
        emailVerificationToken: users.emailVerificationToken,
        emailVerificationExpires: users.emailVerificationExpires,
        passwordResetToken: users.passwordResetToken,
        passwordResetExpires: users.passwordResetExpires,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      }).from(users).where(eq(users.email, googleUser.email.toLowerCase())).limit(1);
    } catch (selectError: any) {
      console.warn('[Google Auth] Full select after insert failed, trying minimal:', selectError.message);
      newUsers = await db.select({
        id: users.id,
        openId: users.openId,
        name: users.name,
        email: users.email,
        loginMethod: users.loginMethod,
        role: users.role,
      }).from(users).where(eq(users.email, googleUser.email.toLowerCase())).limit(1);
    }
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
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[Google Auth] Callback error:', err.message, err.stack);
    const message =
      process.env.NODE_ENV === 'development'
        ? `Google sign-in failed: ${err.message}`
        : 'An error occurred during Google sign-in';
    return { success: false, message };
  }
}
