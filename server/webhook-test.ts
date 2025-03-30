/**
 * Webhook Test Utility
 * 
 * This is a command-line utility to test the webhook endpoint by sending a sample
 * lead payload to the webhook endpoint. Run this with:
 * 
 * npx tsx server/webhook-test.ts
 */

import { request } from 'http';
import { URL } from 'url';

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

function testWebhook() {
  console.log('Testing webhook endpoint...');
  console.log(`Sending POST request to: ${WEBHOOK_URL}`);
  
  const url = new URL(WEBHOOK_URL);
  const data = JSON.stringify(sampleWebhookData);
  
  const options = {
    hostname: url.hostname,
    port: url.port || 80,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'X-API-Key': process.env.WEBHOOK_API_KEY || 'test-api-key' // In development mode, API key check is bypassed
    }
  };
  
  const req = request(options, (res) => {
    let responseData = '';
    
    console.log(`Response status: ${res.statusCode}`);
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(responseData);
        console.log('Response data:', JSON.stringify(parsedData, null, 2));
        
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Webhook test successful!');
        } else {
          console.error('❌ Webhook test failed!');
        }
      } catch (e) {
        console.error('Error parsing response:', e);
        console.log('Raw response:', responseData);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Error testing webhook:', error);
  });
  
  req.write(data);
  req.end();
}

// Execute the test
testWebhook();