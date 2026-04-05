const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');

const getUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email }
  });
};

const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id }
  });
};

const createUser = async (userData) => {
  // Check if email already exists
  const existingUser = await getUserByEmail(userData.email);
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  const newUser = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || 'user',
      phone: userData.phone || '',
      address: userData.address || '',
      city: userData.city || '',
      province: userData.province || '',
      postalCode: userData.postalCode || '',
    }
  });

  // Return user without password
  const { password, otp, otpExpires, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

const updateUser = async (id, updateData) => {
  // Don't allow updating password directly here
  const { password, phoneChanged, phoneChangeRequestedAt, ...safeUpdateData } = updateData;
  
  const updatedUser = await prisma.user.update({
    where: { id },
    data: safeUpdateData
  });

  // Return updated user
  const { password: _, otp, otpExpires, ...result } = updatedUser;
  
  if (phoneChanged) result.phoneChanged = phoneChanged;
  if (phoneChangeRequestedAt) result.phoneChangeRequestedAt = phoneChangeRequestedAt;
  
  return result;
};

const updateUserPassword = async (id, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword }
  });
  return true;
};

const verifyUser = async (email) => {
  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      isVerified: true,
      otp: null,
      otpExpires: null,
      otpAttempts: 0
    }
  });
  
  const { password, otp, otpExpires, otpAttempts, ...user } = updatedUser;
  return user;
};

const setOTP = async (email, otp) => {
  const otpExpires = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRES_IN) || 300000));
  
  await prisma.user.update({
    where: { email },
    data: {
      otp,
      otpExpires,
      otpVerified: false,
      otpAttempts: 0
    }
  });
  return true;
};

const clearOTP = async (email) => {
  await prisma.user.update({
    where: { email },
    data: {
      otp: null,
      otpExpires: null,
      otpVerified: false,
      otpAttempts: 0
    }
  });
  return true;
};

const deleteUser = async (id) => {
  const deletedUser = await prisma.user.delete({
    where: { id }
  });

  const { password, otp, otpExpires, ...userWithoutSensitive } = deletedUser;
  return userWithoutSensitive;
};

const getAllUsers = async () => {
  const users = await prisma.user.findMany();
  return users.map(user => {
    const { password, otp, otpExpires, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};

const createOrUpdateGoogleUser = async (googleData) => {
  const user = await prisma.user.upsert({
    where: { email: googleData.email },
    update: {
      name: googleData.name || undefined,
      image: googleData.image || undefined,
      isVerified: true,
      provider: 'google'
    },
    create: {
      name: googleData.name,
      email: googleData.email,
      image: googleData.image,
      role: 'user',
      provider: 'google',
      isVerified: true
    }
  });

  const { password, otp, otpExpires, ...userWithoutSensitive } = user;
  return userWithoutSensitive;
};

const incrementOTPAttempts = async (email) => {
  const user = await prisma.user.update({
    where: { email },
    data: {
      otpAttempts: {
        increment: 1
      }
    }
  });
  return user.otpAttempts;
};

module.exports = {
  getUserByEmail,
  getUserById,
  createUser,
  createOrUpdateGoogleUser,
  updateUser,
  updateUserPassword,
  verifyUser,
  setOTP,
  clearOTP,
  incrementOTPAttempts,
  getAllUsers,
  deleteUser
};
