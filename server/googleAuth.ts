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
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '56326714738-d92eth6jol7qf0uh8vpfqrvsdoivdut7.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';

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
    // Only select columns that exist in the database
    const existingUsers = await db.select({
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
      firstName: users.firstName,
      middleInitial: users.middleInitial,
      lastName: users.lastName,
      address: users.address,
      city: users.city,
      state: users.state,
      zipCode: users.zipCode,
      ssn: users.ssn,
      dateOfBirth: users.dateOfBirth,
      phoneNumber: users.phoneNumber,
      identityiqUserId: users.identityiqUserId,
      identityiqEnrollmentDate: users.identityiqEnrollmentDate,
      identityiqStatus: users.identityiqStatus,
      creditConcern: users.creditConcern,
      creditGoal: users.creditGoal,
      signatureUrl: users.signatureUrl,
      signatureCreatedAt: users.signatureCreatedAt,
      affiliateSource: users.affiliateSource,
      affiliateClickedAt: users.affiliateClickedAt,
      processingFeePaid: users.processingFeePaid,
      processingFeeAmount: users.processingFeeAmount,
      processingFeePaidAt: users.processingFeePaidAt,
      addressVerified: users.addressVerified,
      addressVerifiedAt: users.addressVerifiedAt,
      lobAddressId: users.lobAddressId,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).where(eq(users.email, googleUser.email.toLowerCase())).limit(1);
    const existingUser = existingUsers[0];
    
    if (existingUser) {
      // User exists - update their info and log them in
      // We use a safe update that doesn't touch the googleId column
      await db.update(users).set({
        name: googleUser.name || existingUser.name,
        lastSignedIn: new Date(),
        emailVerified: true, // Google emails are verified
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
      firstName: users.firstName,
      middleInitial: users.middleInitial,
      lastName: users.lastName,
      address: users.address,
      city: users.city,
      state: users.state,
      zipCode: users.zipCode,
      ssn: users.ssn,
      dateOfBirth: users.dateOfBirth,
      phoneNumber: users.phoneNumber,
      identityiqUserId: users.identityiqUserId,
      identityiqEnrollmentDate: users.identityiqEnrollmentDate,
      identityiqStatus: users.identityiqStatus,
      creditConcern: users.creditConcern,
      creditGoal: users.creditGoal,
      signatureUrl: users.signatureUrl,
      signatureCreatedAt: users.signatureCreatedAt,
      affiliateSource: users.affiliateSource,
      affiliateClickedAt: users.affiliateClickedAt,
      processingFeePaid: users.processingFeePaid,
      processingFeeAmount: users.processingFeeAmount,
      processingFeePaidAt: users.processingFeePaidAt,
      addressVerified: users.addressVerified,
      addressVerifiedAt: users.addressVerifiedAt,
      lobAddressId: users.lobAddressId,
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

    // Insert new user without using the googleId column to avoid schema errors
    await db.insert(users).values({
      openId,
      name: googleUser.name || 'User',
      email: googleUser.email.toLowerCase(),
      loginMethod: 'google',
      emailVerified: true, // Google emails are verified
    });
    
    // Get the created user
    const newUsers = await db.select({
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
      firstName: users.firstName,
      middleInitial: users.middleInitial,
      lastName: users.lastName,
      address: users.address,
      city: users.city,
      state: users.state,
      zipCode: users.zipCode,
      ssn: users.ssn,
      dateOfBirth: users.dateOfBirth,
      phoneNumber: users.phoneNumber,
      identityiqUserId: users.identityiqUserId,
      identityiqEnrollmentDate: users.identityiqEnrollmentDate,
      identityiqStatus: users.identityiqStatus,
      creditConcern: users.creditConcern,
      creditGoal: users.creditGoal,
      signatureUrl: users.signatureUrl,
      signatureCreatedAt: users.signatureCreatedAt,
      affiliateSource: users.affiliateSource,
      affiliateClickedAt: users.affiliateClickedAt,
      processingFeePaid: users.processingFeePaid,
      processingFeeAmount: users.processingFeeAmount,
      processingFeePaidAt: users.processingFeePaidAt,
      addressVerified: users.addressVerified,
      addressVerifiedAt: users.addressVerifiedAt,
      lobAddressId: users.lobAddressId,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).where(eq(users.email, googleUser.email.toLowerCase())).limit(1);
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
