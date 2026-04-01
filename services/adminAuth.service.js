const bcrypt = require('bcryptjs');
const { getUserByEmail, getUserById } = require('./user.service');
const { generateToken } = require('../utils/jwt.util');

/**
 * Login admin - hanya user dengan role "admin" yang bisa login
 */
const loginAdmin = async (email, password) => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Cek apakah user adalah admin
  if (user.role !== 'admin') {
    throw new Error('User is not an admin');
  }

  // Cek apakah user sudah verified
  if (!user.isVerified) {
    throw new Error('Account not verified. Please verify your email first.');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate JWT token
  const token = generateToken(user.id, user.role);

  // Return user data tanpa password
  const { password: _, otp, otpExpires, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token
  };
};

/**
 * Get admin profile by ID
 */
const getAdminProfile = async (userId) => {
  const user = await getUserById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  if (user.role !== 'admin') {
    throw new Error('User is not an admin');
  }

  // Return user data tanpa password
  const { password, otp, otpExpires, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

module.exports = {
  loginAdmin,
  getAdminProfile
};
