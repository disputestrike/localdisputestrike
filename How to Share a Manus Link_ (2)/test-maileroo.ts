/**
 * Test script for Maileroo email service
 * 
 * Run with: npx tsx test-maileroo.ts
 */

import { config } from 'dotenv';
import { sendEmail, sendTrialWelcomeEmail } from './server/mailerooService';

// Load environment variables
config();

async function testMaileroo() {
  console.log('🧪 Testing Maileroo Email Service...\n');
  
  // Check if API key is configured
  if (!process.env.MAILEROO_API_KEY) {
    console.error('❌ MAILEROO_API_KEY not found in environment variables');
    process.exit(1);
  }
  
  console.log('✅ Maileroo API key found');
  console.log(`📧 From: ${process.env.MAILEROO_FROM_EMAIL}\n`);
  
  // Test 1: Simple email
  console.log('Test 1: Sending simple test email...');
  const test1 = await sendEmail({
    to: 'test@example.com', // Change this to your email to receive test
    subject: 'DisputeStrike - Maileroo Test Email',
    html: '<h1>Test Email</h1><p>This is a test email from DisputeStrike using Maileroo API.</p>',
    plain: 'Test Email\n\nThis is a test email from DisputeStrike using Maileroo API.',
    tags: {
      test: 'true',
      environment: 'development',
    },
  });
  
  if (test1) {
    console.log('✅ Test 1 passed: Simple email sent successfully\n');
  } else {
    console.log('❌ Test 1 failed: Could not send simple email\n');
  }
  
  // Test 2: Trial welcome email
  console.log('Test 2: Sending trial welcome email...');
  const test2 = await sendTrialWelcomeEmail(
    'test@example.com', // Change this to your email to receive test
    'John Doe'
  );
  
  if (test2) {
    console.log('✅ Test 2 passed: Trial welcome email sent successfully\n');
  } else {
    console.log('❌ Test 2 failed: Could not send trial welcome email\n');
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`Test 1 (Simple Email): ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 2 (Welcome Email): ${test2 ? '✅ PASS' : '❌ FAIL'}`);
  
  if (test1 && test2) {
    console.log('\n🎉 All tests passed! Maileroo is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
  }
}

// Run tests
testMaileroo().catch(error => {
  console.error('❌ Test error:', error);
  process.exit(1);
});
