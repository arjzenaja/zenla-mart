const { sendOTP, verifyOTP, resetPassword, sendResetOTP, verifyResetOTP, generateOTP } = require('../services/auth.service');
const { getUserByEmail, setOTP, clearOTP } = require('../services/user.service');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function testOtpFlow() {
  const testEmail = 'wywywhw@gmail.com'; // Existing user from users.json
  
  console.log('--- Starting OTP Flow Verification ---');

  try {
    // 1. Test OTP Generation & Email Sending (Simulation/Manual check needed for actual email)
    console.log('\n[1] Testing OTP Generation & Sending...');
    // We'll mock the email sending for automated verification if EMAIL_USER is not set
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'zenlamart@gmail.com') {
      console.log('NOTE: EMAIL_USER is not configured. Email sending might fail unless you have configured .env');
    }

    try {
      await sendOTP(testEmail);
      console.log('✓ sendOTP executed (if Email fails, we continue with DB checks)');
    } catch (e) {
      console.log('! sendOTP Email part failed (expected if .env invalid), but OTP was set in DB:', e.message);
    }

    const user = await getUserByEmail(testEmail);
    const validOtp = user.otp;
    console.log(`✓ OTP stored in database: ${validOtp}`);

    // 2. Test Verification (Success)
    console.log('\n[2] Testing Verification (Success)...');
    const result = await verifyOTP(testEmail, validOtp);
    console.log('✓ verifyOTP successful:', result.user.email);

    // 3. Test Verification (Failure - Incorrect)
    console.log('\n[3] Testing Verification (Failure - Incorrect)...');
    try {
      await sendOTP(testEmail); // Get new OTP
    } catch (e) {
      console.log('! sendOTP Email failed, continuing check...');
    }
    try {
      await verifyOTP(testEmail, '000000');
    } catch (e) {
      console.log('✓ verifyOTP failed as expected with wrong code:', e.message);
    }

    // 4. Test Attempt Limit
    console.log('\n[4] Testing Attempt Limit (3 max)...');
    let attempts = 1;
    let limitReached = false;
    try {
      await verifyOTP(testEmail, '111111'); // Attempt 2
      attempts++;
      await verifyOTP(testEmail, '222222'); // Attempt 3
      attempts++;
      await verifyOTP(testEmail, '333333'); // Attempt 4 - Should fail and clear OTP
    } catch (e) {
      console.log(`✓ Attempt ${attempts + 1} failed with:`, e.message);
      if (e.message.includes('Terlalu banyak percobaan')) {
        limitReached = true;
      }
    }
    
    const userAfterLimit = await getUserByEmail(testEmail);
    if (limitReached && !userAfterLimit.otp) {
      console.log('✓ OTP cleared after too many attempts');
    } else {
      console.log('! OTP NOT cleared after limit');
    }

    // 5. Test Expiry (Simulation)
    console.log('\n[5] Testing Expiry (Simulation)...');
    try {
      await sendOTP(testEmail);
    } catch (e) {
      console.log('! sendOTP Email failed, continuing check...');
    }
    // Manually expire the OTP in the database
    const users = await require('../utils/dataHelper.util').readData('users.json');
    const idx = users.findIndex(u => u.email === testEmail);
    users[idx].otpExpires = new Date(Date.now() - 1000).toISOString(); // Expired 1s ago
    await require('../utils/dataHelper.util').writeData('users.json', users);

    try {
      await verifyOTP(testEmail, users[idx].otp);
    } catch (e) {
      console.log('✓ verifyOTP failed as expected with expired code:', e.message);
    }

    console.log('\n--- Verification Finished ---');

  } catch (error) {
    console.error('FATAL ERROR during verification:', error);
  }
}

testOtpFlow();
