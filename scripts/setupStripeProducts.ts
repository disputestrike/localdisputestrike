/**
 * Stripe Product Setup Script
 * 
 * Run this script to create the required Stripe products and prices
 * for the DisputeStrike V2 subscription tiers.
 * 
 * Usage:
 *   npx ts-node scripts/setupStripeProducts.ts
 * 
 * Required environment variables:
 *   STRIPE_SECRET_KEY - Your Stripe secret key
 */

import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10',
});

interface ProductConfig {
  name: string;
  description: string;
  metadata: Record<string, string>;
  prices: Array<{
    nickname: string;
    unit_amount: number;
    recurring?: {
      interval: 'month' | 'year';
    };
    metadata: Record<string, string>;
  }>;
}

const products: ProductConfig[] = [
  // $1 Trial
  {
    name: 'DisputeStrike Trial',
    description: '7-day trial access to credit monitoring and AI analysis',
    metadata: {
      tier: 'trial',
      type: 'one_time',
    },
    prices: [
      {
        nickname: 'Trial - $1',
        unit_amount: 100, // $1.00 in cents
        metadata: {
          tier: 'trial',
          display_name: '$1 Trial',
        },
      },
    ],
  },
  
  // Starter Tier - $49/mo
  {
    name: 'DisputeStrike Starter',
    description: 'Starter plan with 2 dispute rounds per month, credit monitoring, and AI recommendations',
    metadata: {
      tier: 'starter',
      rounds: '2',
      type: 'subscription',
    },
    prices: [
      {
        nickname: 'Starter Monthly - $49',
        unit_amount: 4900, // $49.00 in cents
        recurring: {
          interval: 'month',
        },
        metadata: {
          tier: 'starter',
          display_name: '$49/month',
          rounds: '2',
        },
      },
    ],
  },
  
  // Professional Tier - $69.95/mo
  {
    name: 'DisputeStrike Professional',
    description: 'Professional plan with 3 dispute rounds per month, credit monitoring, AI recommendations, and response analysis',
    metadata: {
      tier: 'professional',
      rounds: '3',
      type: 'subscription',
    },
    prices: [
      {
        nickname: 'Professional Monthly - $69.95',
        unit_amount: 6995, // $69.95 in cents
        recurring: {
          interval: 'month',
        },
        metadata: {
          tier: 'professional',
          display_name: '$69.95/month',
          rounds: '3',
        },
      },
    ],
  },
  
  // Complete Tier - $99.95/mo
  {
    name: 'DisputeStrike Complete',
    description: 'Complete plan with unlimited dispute rounds, credit monitoring, AI recommendations, response analysis, we mail for you, and CFPB complaints',
    metadata: {
      tier: 'complete',
      rounds: 'unlimited',
      type: 'subscription',
    },
    prices: [
      {
        nickname: 'Complete Monthly - $99.95',
        unit_amount: 9995, // $99.95 in cents
        recurring: {
          interval: 'month',
        },
        metadata: {
          tier: 'complete',
          display_name: '$99.95/month',
          rounds: 'unlimited',
          mailing: 'included',
          cfpb: 'included',
        },
      },
    ],
  },
];

async function createProducts() {
  console.log('🚀 Starting Stripe product setup...\n');
  
  const results: Record<string, { productId: string; priceIds: string[] }> = {};
  
  for (const productConfig of products) {
    console.log(`📦 Creating product: ${productConfig.name}`);
    
    try {
      // Create the product
      const product = await stripe.products.create({
        name: productConfig.name,
        description: productConfig.description,
        metadata: productConfig.metadata,
      });
      
      console.log(`   ✅ Product created: ${product.id}`);
      
      const priceIds: string[] = [];
      
      // Create prices for this product
      for (const priceConfig of productConfig.prices) {
        const priceData: Stripe.PriceCreateParams = {
          product: product.id,
          nickname: priceConfig.nickname,
          unit_amount: priceConfig.unit_amount,
          currency: 'usd',
          metadata: priceConfig.metadata,
        };
        
        if (priceConfig.recurring) {
          priceData.recurring = priceConfig.recurring;
        }
        
        const price = await stripe.prices.create(priceData);
        priceIds.push(price.id);
        
        console.log(`   💰 Price created: ${price.id} (${priceConfig.nickname})`);
      }
      
      results[productConfig.metadata.tier] = {
        productId: product.id,
        priceIds,
      };
      
      console.log('');
    } catch (error) {
      console.error(`   ❌ Error creating ${productConfig.name}:`, error);
    }
  }
  
  // Output environment variables
  console.log('\n' + '='.repeat(60));
  console.log('📋 Add these to your .env file:');
  console.log('='.repeat(60) + '\n');
  
  console.log('# Stripe Product IDs');
  if (results.trial) {
    console.log(`STRIPE_TRIAL_PRODUCT_ID=${results.trial.productId}`);
    console.log(`STRIPE_TRIAL_PRICE_ID=${results.trial.priceIds[0]}`);
  }
  if (results.starter) {
    console.log(`STRIPE_STARTER_PRODUCT_ID=${results.starter.productId}`);
    console.log(`STRIPE_STARTER_PRICE_ID=${results.starter.priceIds[0]}`);
  }
  if (results.professional) {
    console.log(`STRIPE_PROFESSIONAL_PRODUCT_ID=${results.professional.productId}`);
    console.log(`STRIPE_PROFESSIONAL_PRICE_ID=${results.professional.priceIds[0]}`);
  }
  if (results.complete) {
    console.log(`STRIPE_COMPLETE_PRODUCT_ID=${results.complete.productId}`);
    console.log(`STRIPE_COMPLETE_PRICE_ID=${results.complete.priceIds[0]}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Stripe product setup complete!');
  console.log('='.repeat(60));
  
  // Also save to a JSON file for reference
  const outputPath = './stripe-products.json';
  const fs = await import('fs');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n📁 Product IDs saved to ${outputPath}`);
}

// Run the setup
createProducts().catch(console.error);
