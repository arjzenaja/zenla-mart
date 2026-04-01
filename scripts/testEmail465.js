const nodemailer = require('nodemailer');

async function testConnection465() {
  console.log('--- Testing Gmail SMTPS (Port 465) ---');
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'arjzenimato1706@gmail.com',
      pass: 'rjibkjbrvgbwsrgy'
    },
    connectionTimeout: 10000
  });

  try {
    console.log('Verifying connection on 465...');
    await transporter.verify();
    console.log('✓ Connection verified successfully on 465!');
    
    console.log('Sending test email...');
    await transporter.sendMail({
      from: '"Zenla Mart" <arjzenimato1706@gmail.com>',
      to: 'arjzenimato1706@gmail.com',
      subject: 'Test Port 465',
      text: 'Testing if Port 465 is faster.'
    });
    console.log('✓ Test email sent successfully!');
  } catch (error) {
    console.error('! Connection/Send failed:', error.message);
  }
}

testConnection465();
