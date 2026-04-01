const { readData, writeData, generateId } = require('../utils/dataHelper.util');
const bcrypt = require('bcryptjs');

const getUserByEmail = async (email) => {
  const users = await readData('users.json');
  return users.find(user => user.email === email);
};

const getUserById = async (id) => {
  const users = await readData('users.json');
  return users.find(user => user.id === id);
};

const createUser = async (userData) => {
  const users = await readData('users.json');
  
  // Check if email already exists
  const existingUser = users.find(user => user.email === userData.email);
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  const newUser = {
    id: generateId(),
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    role: userData.role || 'user',
    phone: userData.phone || '',
    address: userData.address || '',
    city: userData.city || '',
    province: userData.province || '',
    postalCode: userData.postalCode || '',
    isVerified: false,
    otp: null,
    otpExpires: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(newUser);
  await writeData('users.json', users);
  
  // Return user without password
  const { password, otp, otpExpires, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

const updateUser = async (id, updateData) => {
  const users = await readData('users.json');
  const userIndex = users.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  // Don't allow updating password directly here
  // Also exclude temporary fields used for logging/OTP flow
  const { password, phoneChanged, phoneChangeRequestedAt, ...safeUpdateData } = updateData;
  
  users[userIndex] = {
    ...users[userIndex],
    ...safeUpdateData,
    updatedAt: new Date().toISOString()
  };

  await writeData('users.json', users);
  
  // Return updated user with temporary fields for controller to use
  const { password: _, otp, otpExpires, ...updatedUser } = users[userIndex];
  
  // Add back temporary fields if they were in updateData (for logging purposes)
  if (phoneChanged) {
    updatedUser.phoneChanged = phoneChanged;
  }
  if (phoneChangeRequestedAt) {
    updatedUser.phoneChangeRequestedAt = phoneChangeRequestedAt;
  }
  
  return updatedUser;
};

const updateUserPassword = async (id, newPassword) => {
  const users = await readData('users.json');
  const userIndex = users.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  users[userIndex].password = hashedPassword;
  users[userIndex].updatedAt = new Date().toISOString();

  await writeData('users.json', users);
  return true;
};

const verifyUser = async (email) => {
  const users = await readData('users.json');
  const userIndex = users.findIndex(user => user.email === email);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  users[userIndex].isVerified = true;
  users[userIndex].otp = null;
  users[userIndex].otpExpires = null;
  users[userIndex].otpAttempts = 0;
  users[userIndex].updatedAt = new Date().toISOString();

  await writeData('users.json', users);
  
  const { password, otp, otpExpires, otpAttempts, ...user } = users[userIndex];
  return user;
};

const setOTP = async (email, otp) => {
  const users = await readData('users.json');
  const userIndex = users.findIndex(user => user.email === email);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  const otpExpires = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRES_IN) || 300000));
  
  users[userIndex].otp = otp;
  users[userIndex].otpExpires = otpExpires.toISOString();
  users[userIndex].otpVerified = false; // Reset verified flag when new OTP is set
  users[userIndex].otpAttempts = 0; // Reset attempts when new OTP is set
  users[userIndex].updatedAt = new Date().toISOString();

  await writeData('users.json', users);
  return true;
};

const clearOTP = async (email) => {
  const users = await readData('users.json');
  const userIndex = users.findIndex(user => user.email === email);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  users[userIndex].otp = null;
  users[userIndex].otpExpires = null;
  users[userIndex].otpVerified = false;
  users[userIndex].otpAttempts = 0;
  users[userIndex].updatedAt = new Date().toISOString();

  await writeData('users.json', users);
  return true;
};

const deleteUser = async (id) => {
  const users = await readData('users.json');
  const userIndex = users.findIndex(user => user.id === id);

  if (userIndex === -1) {
    throw new Error('User not found');
  }

  const deletedUser = users[userIndex];
  users.splice(userIndex, 1);

  await writeData('users.json', users);

  const { password, otp, otpExpires, ...userWithoutSensitive } = deletedUser;
  return userWithoutSensitive;
};

const getAllUsers = async () => {
  const users = await readData('users.json');
  return users.map(user => {
    const { password, otp, otpExpires, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};

const createOrUpdateGoogleUser = async (googleData) => {
  const users = await readData('users.json');
  let userIndex = users.findIndex(user => user.email === googleData.email);
  
  if (userIndex !== -1) {
    // Update existing user with Google info if needed
    users[userIndex] = {
      ...users[userIndex],
      name: googleData.name || users[userIndex].name,
      image: googleData.image || users[userIndex].image,
      isVerified: true, // Google accounts are verified
      provider: 'google',
      updatedAt: new Date().toISOString()
    };
    await writeData('users.json', users);
    const { password, otp, otpExpires, ...user } = users[userIndex];
    return user;
  }

  // Create new user
  const newUser = {
    id: generateId(),
    name: googleData.name,
    email: googleData.email,
    image: googleData.image,
    role: 'user',
    provider: 'google',
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(newUser);
  await writeData('users.json', users);
  return newUser;
};

const incrementOTPAttempts = async (email) => {
  const users = await readData('users.json');
  const userIndex = users.findIndex(user => user.email === email);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  users[userIndex].otpAttempts = (users[userIndex].otpAttempts || 0) + 1;
  users[userIndex].updatedAt = new Date().toISOString();

  await writeData('users.json', users);
  return users[userIndex].otpAttempts;
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
