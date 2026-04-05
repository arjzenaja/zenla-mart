const bcrypt = require('bcryptjs');
const { getUserByEmail, verifyUser, setOTP, incrementOTPAttempts, clearOTP, updateUserPassword, updateUser } = require('./user.service');
const { generateToken } = require('../utils/jwt.util');
const sendOtpEmail = require('../utils/sendOtpEmail');
const prisma = require('../utils/prisma');

const login = async (email, password) => {
  const user = await getUserByEmail(email);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user.id, user.role);
  
  const { password: _, otp, otpExpires, ...userWithoutPassword } = user;
  
  return {
    user: userWithoutPassword,
    token
  };
};

// Generate 6-digit numeric OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate & store OTP, and log it to console in development mode
const sendOTP = async (email) => {
  const user = await getUserByEmail(email);
  
  if (!user) {
    throw new Error('User not found');
  }

  const otp = generateOTP();
  await setOTP(email, otp);
  
  // Send OTP via Email (Asynchronous / Background)
  sendOtpEmail(email, otp, 'registration');
  
  return { success: true };
};

const verifyOTP = async (email, otp) => {
  const user = await getUserByEmail(email);
  
  if (!user) {
    throw new Error('User not found');
  }

  // Check attempt limit
  if ((user.otpAttempts || 0) >= 3) {
    await clearOTP(email);
    throw new Error('Terlalu banyak percobaan. OTP telah kedaluwarsa, silakan minta OTP baru.');
  }

  if (!user.otp || user.otp !== otp) {
    await incrementOTPAttempts(email);
    throw new Error('OTP salah');
  }

  if (new Date(user.otpExpires) < new Date()) {
    throw new Error('OTP telah kedaluwarsa');
  }

  await verifyUser(email);
  
  const token = generateToken(user.id, user.role);
  
  const { password: _, otp: __, otpExpires, otpAttempts, ...userWithoutPassword } = user;
  
  return {
    user: { ...userWithoutPassword, isVerified: true },
    token
  };
};

// Send OTP for password reset (separate from email verification OTP)
const sendResetOTP = async (email) => {
  const user = await getUserByEmail(email);
  
  // Always return success for security (don't reveal if email exists)
  if (!user) {
    return { sent: false };
  }

  const otp = generateOTP();
  await setOTP(email, otp);
  
  // Send OTP via Email (Asynchronous / Background)
  sendOtpEmail(email, otp, 'reset');
  
  return { sent: true };
};

// Verify OTP for password reset (without auto-verifying user)
const verifyResetOTP = async (email, otp) => {
  const user = await getUserByEmail(email);
  
  if (!user) {
    throw new Error('User not found');
  }

  // Check attempt limit
  if ((user.otpAttempts || 0) >= 3) {
    await clearOTP(email);
    throw new Error('Terlalu banyak percobaan. OTP telah kedaluwarsa, silakan minta OTP baru.');
  }

  if (!user.otp || user.otp !== otp) {
    await incrementOTPAttempts(email);
    throw new Error('OTP salah');
  }

  if (new Date(user.otpExpires) < new Date()) {
    throw new Error('OTP expired');
  }

  // Mark OTP as verified
  await prisma.user.update({
    where: { email },
    data: {
      otpVerified: true
    }
  });
  
  return { valid: true };
};

const resetPassword = async (email, otp, newPassword) => {
  const user = await getUserByEmail(email);
  
  if (!user) {
    throw new Error('User not found');
  }

  // Verify OTP is still valid and was verified
  if (!user.otp || user.otp !== otp) {
    throw new Error('OTP salah');
  }

  if (new Date(user.otpExpires) < new Date()) {
    throw new Error('OTP expired');
  }

  // Check if OTP was verified (to ensure it can only be used once)
  if (!user.otpVerified) {
    throw new Error('OTP belum diverifikasi. Silakan verifikasi OTP terlebih dahulu');
  }

  // Update password
  await updateUserPassword(user.id, newPassword);
  
  // Clear OTP and verified flag after successful password reset
  await clearOTP(email);
  await prisma.user.update({
    where: { email },
    data: {
      otpVerified: false
    }
  });
  
  return { message: 'Password berhasil diperbarui' };
};

module.exports = {
  login,
  sendOTP,
  generateOTP,
  verifyOTP,
  sendResetOTP,
  verifyResetOTP,
  resetPassword
};
