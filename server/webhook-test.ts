/**
 * Webhook Test Utility
 * 
 * This is a command-line utility to test the webhook endpoint by sending a sample
 * lead payload to the webhook endpoint. Run this with:
 * 
 * npx tsx server/webhook-test.ts
 */

import fetch from 'node-fetch';

// Default webhook URL (change this if your server runs on a different URL)
const WEBHOOK_URL = 'http://localhost:5000/api/webhook/leads';

// Sample lead data for testing
const sampleWebhookData = {
  name: 'Test Lead via Webhook',
  username: '@webhook_test',
  time: new Date().toISOString(),
  tags: ['Test', 'Webhook'],
  source: 'Webhook Test',
  avatar: null,
  assessment: 'Pending',
  columnId: 'newLeads',
  qualificationScore: 75,
  contactInfo: {
    email: 'test@example.com',
    phone: '+1234567890',
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zip: '12345'
    }
  },
  questionnaire: {
    interestedIn: ['Botox', 'Fillers'],
    previousTreatments: 'None',
    concerns: 'Aging around eyes',
    timeline: 'Within 1 month'
  }
};

async function testWebhook() {
  console.log('Testing webhook endpoint...');
  console.log(`Sending POST request to: ${WEBHOOK_URL}`);
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.WEBHOOK_API_KEY || 'test-api-key' // In development mode, API key check is bypassed
      },
      body: JSON.stringify(sampleWebhookData)
    });
    
    const responseData = await response.json();
    
    console.log(`Response status: ${response.status}`);
    console.log('Response data:', JSON.stringify(responseData, null, 2));
    
    if (response.ok) {
      console.log('✅ Webhook test successful!');
    } else {
      console.error('❌ Webhook test failed!');
    }
  } catch (error) {
    console.error('Error testing webhook:', error);
  }
}

// Execute the test
testWebhook();