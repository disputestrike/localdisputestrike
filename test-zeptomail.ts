/**
 * Test ZeptoMail Integration
 * 
 * Run this script to test email sending via ZeptoMail
 * Usage: npx tsx test-zeptomail.ts
 */

import { config } from 'dotenv';
import { sendEmail, sendTrialWelcomeEmail, sendPasswordResetEmail } from './server/zeptomailService';

// Load environment variables
config();

async function testZeptoMail() {
  console.log('🧪 Testing ZeptoMail Integration...\n');
  
  // Test 1: Simple email
  console.log('Test 1: Sending simple email...');
  try {
    const result1 = await sendEmail({
      to: 'ben_peter@disputestrike.com', // Replace with your email for testing
      subject: 'Test Email from DisputeStrike',
      html: '<h1>Hello from DisputeStrike!</h1><p>This is a test email sent via ZeptoMail.</p>',
      plain: 'Hello from DisputeStrike! This is a test email sent via ZeptoMail.',
    });
    
    if (result1) {
      console.log('✅ Simple email sent successfully!\n');
    } else {
      console.log('❌ Failed to send simple email\n');
    }
  } catch (error) {
    console.error('❌ Error sending simple email:', error);
  }
  
  // Test 2: Trial welcome email
  console.log('Test 2: Sending trial welcome email...');
  try {
    const result2 = await sendTrialWelcomeEmail(
      'ben_peter@disputestrike.com', // Replace with your email for testing
      'John Doe'
    );
    
    if (result2) {
      console.log('✅ Trial welcome email sent successfully!\n');
    } else {
      console.log('❌ Failed to send trial welcome email\n');
    }
  } catch (error) {
    console.error('❌ Error sending trial welcome email:', error);
  }
  
  // Test 3: Password reset email
  console.log('Test 3: Sending password reset email...');
  try {
    const result3 = await sendPasswordResetEmail(
      'ben_peter@disputestrike.com', // Replace with your email for testing
      'test-reset-token-123'
    );
    
    if (result3) {
      console.log('✅ Password reset email sent successfully!\n');
    } else {
      console.log('❌ Failed to send password reset email\n');
    }
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
  }
  
  console.log('✨ ZeptoMail integration test complete!');
  console.log('\n📧 Check your inbox at ben_peter@disputestrike.com for the test emails.');
  console.log('💡 Remember to replace ben_peter@disputestrike.com with your actual email address.');
}

// Run the test
testZeptoMail().catch(console.error);
