// test-email.js
require('dotenv').config({ path: './.env' });
const emailService = require('./src/utils/emailService');

async function testEmail() {
  try {
    console.log('🔧 Testing email configuration...');
    console.log('Host:', process.env.SMTP_HOST);
    console.log('Port:', process.env.SMTP_PORT);
    console.log('User:', process.env.SMTP_USER);
    
    await emailService.sendVerificationEmail(
      'mogesshitaw318@gmail.com', // Use YOUR email for testing
      'Test User',
      '123456'
    );
    
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testEmail();