const nodemailer = require('nodemailer');

// Create persistent transporter to improve performance (reuse connection)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 15000
});

/**
 * Sends an OTP email to the user.
 * @param {string} email - Recipient email address
 * @param {string} otp - The 6-digit OTP code
 * @param {string} type - Type of verification ('registration', 'login', 'reset')
 */
const sendOtpEmail = async (email, otp, type = 'registration') => {
  let subject = 'Kode OTP Zenla Mart';
  let title = 'Verifikasi Akun Zenla Mart';
  let message = 'Gunakan kode OTP berikut untuk verifikasi akun kamu:';

  if (type === 'reset') {
    subject = 'Reset Password Zenla Mart';
    title = 'Reset Password Zenla Mart';
    message = 'Gunakan kode OTP berikut untuk mereset password kamu:';
  } else if (type === 'login') {
    subject = 'Verifikasi Login Zenla Mart';
    title = 'Verifikasi Login Zenla Mart';
    message = 'Gunakan kode OTP berikut untuk memverifikasi login kamu:';
  }

  const mailOptions = {
    from: `"Zenla Mart" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4A90E2; margin: 0;">Zenla Mart</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center;">
          <h2 style="color: #333; margin-top: 0;">${title}</h2>
          <p style="color: #666; font-size: 16px;">Halo,</p>
          <p style="color: #666; font-size: 16px;">${message}</p>
          <div style="background-color: #fff; border: 2px dashed #4A90E2; padding: 15px; margin: 20px auto; width: fit-content; border-radius: 5px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
          </div>
          <p style="color: #999; font-size: 14px;">Kode berlaku selama 5 menit.</p>
        </div>
        <div style="margin-top: 20px; color: #999; font-size: 12px; text-align: center;">
          <p>Jika kamu tidak meminta kode ini, abaikan email ini.</p>
          <p>&copy; ${new Date().getFullYear()} Zenla Mart. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    const startTime = Date.now();
    
    // Background sending: we log result but don't block the API
    transporter.sendMail(mailOptions)
      .then(info => {
        const duration = (Date.now() - startTime) / 1000;
        console.log(`[EMAIL] Success: ${email} (${duration}s)`);
      })
      .catch(err => {
        console.error(`[EMAIL] FAILED: ${email} | Error: ${err.message}`);
      });
      
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Setup Error:', error.message);
    throw new Error('Gagal memproses email OTP.');
  }
};

module.exports = sendOtpEmail;
