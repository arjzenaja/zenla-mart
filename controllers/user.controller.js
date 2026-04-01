const { getUserById, updateUser, getAllUsers, deleteUser } = require('../services/user.service');
const { getUserAddresses } = require('../services/address.service');
const { validateIndonesianPhone } = require('../utils/phoneValidation.util');

const getMe = async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { password, otp, otpExpires, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const { name, phone, address, city, province, postalCode } = req.body;
    
    // Validate name
    if (name !== undefined) {
      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Full Name is required'
        });
      }
    }

    // Get current user data to check if phone changed
    const currentUser = await getUserById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updateData = {};
    if (name !== undefined) {
      updateData.name = name.trim();
    }

    // Validate and normalize phone if provided
    if (phone !== undefined) {
      if (phone && phone.trim() !== '') {
        const phoneValidation = validateIndonesianPhone(phone);
        if (!phoneValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: phoneValidation.error
          });
        }
        updateData.phone = phoneValidation.normalized;

        // Log phone change for OTP verification (if phone actually changed)
        if (currentUser.phone !== phoneValidation.normalized) {
          // Store flag that phone needs verification
          // This can be used later for OTP verification flow
          updateData.phoneChanged = true;
          updateData.phoneChangeRequestedAt = new Date().toISOString();
          // Note: In production, you might want to:
          // 1. Send OTP to new phone number
          // 2. Mark phone as unverified until OTP is confirmed
          // 3. Keep old phone until verification is complete
          console.log(`[Phone Change] User ${req.user.id} requested phone change from ${currentUser.phone} to ${phoneValidation.normalized}`);
        }
      } else {
        // Allow clearing phone number
        updateData.phone = '';
      }
    }

    // Handle address fields
    if (address !== undefined) {
      updateData.address = address ? address.trim() : '';
    }
    if (city !== undefined) {
      updateData.city = city ? city.trim() : '';
    }
    if (province !== undefined) {
      updateData.province = province ? province.trim() : '';
    }
    if (postalCode !== undefined) {
      updateData.postalCode = postalCode ? postalCode.trim() : '';
    }

    const updatedUser = await updateUser(req.user.id, updateData);
    
    const { password, otp, otpExpires, phoneChanged, phoneChangeRequestedAt, ...userWithoutPassword } = updatedUser;
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userWithoutPassword,
      // Include phone change info if phone was changed (for frontend to handle OTP flow)
      ...(phoneChanged && {
        phoneChangePending: true,
        message: 'Profile updated. Phone number change requires verification.'
      })
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsersHandler = async (req, res, next) => {
  try {
    const users = await getAllUsers();
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role is required (user or admin)'
      });
    }

    const updatedUser = await updateUser(id, { role });
    
    const { password, otp, otpExpires, ...userWithoutPassword } = updatedUser;
    
    res.json({
      success: true,
      message: 'User role updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

const updateUserHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;
    
    // Validate name
    if (name !== undefined) {
      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Full Name is required'
        });
      }
    }

    // Get current user data
    const currentUser = await getUserById(id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updateData = {};
    if (name !== undefined) {
      updateData.name = name.trim();
    }

    // Validate and normalize phone if provided
    if (phone !== undefined) {
      if (phone && phone.trim() !== '') {
        const phoneValidation = validateIndonesianPhone(phone);
        if (!phoneValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: phoneValidation.error
          });
        }
        updateData.phone = phoneValidation.normalized;
      } else {
        // Allow clearing phone number
        updateData.phone = '';
      }
    }

    const updatedUser = await updateUser(id, updateData);
    
    const { password, otp, otpExpires, ...userWithoutPassword } = updatedUser;
    
    res.json({
      success: true,
      message: 'User updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

const getUserByIdHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('[getUserByIdHandler] Requested user ID:', id);
    
    const user = await getUserById(id);
    console.log('[getUserByIdHandler] User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('[getUserByIdHandler] User not found for ID:', id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const { password, otp, otpExpires, ...userWithoutPassword } = user;
    
    console.log('[getUserByIdHandler] Returning user data for ID:', id);
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('[getUserByIdHandler] Error:', error);
    next(error);
  }
};

const getUserAddressesHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verify user exists
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const addresses = await getUserAddresses(id);
    
    res.json({
      success: true,
      addresses
    });
  } catch (error) {
    next(error);
  }
};

const deleteUserHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Optional: prevent admin delete themselves via this endpoint
    if (req.user && req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account from this endpoint',
      });
    }

    const deletedUser = await deleteUser(id);

    res.json({
      success: true,
      message: 'User deleted successfully',
      user: deletedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  updateMe,
  getAllUsersHandler,
  getUserByIdHandler,
  updateUserRole,
  updateUserHandler,
  getUserAddressesHandler,
  deleteUserHandler
};
