const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function testConnection() {
  console.log('--- Testing Gmail SMTP Connection ---');
  console.log('User:', process.env.EMAIL_USER);
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('✓ Connection verified successfully!');
    
    console.log('Sending test email...');
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test connection Zenla Mart',
      text: 'If you see this, email is working!'
    });
    console.log('✓ Test email sent successfully!');
  } catch (error) {
    console.error('! Connection/Send failed:', error.message);
  }
}

testConnection();
