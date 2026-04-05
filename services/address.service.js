const prisma = require('../utils/prisma');

const getUserAddresses = async (userId) => {
  return await prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
};

const getAddressById = async (id, userId) => {
  const address = await prisma.address.findUnique({
    where: { id }
  });
  
  if (!address || address.userId !== userId) {
    throw new Error('Address not found');
  }
  
  return address;
};

const createAddress = async (userId, addressData) => {
  return await prisma.$transaction(async (tx) => {
    // If this is set as default, unset other defaults for this user
    if (addressData.isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    return await tx.address.create({
      data: {
        userId,
        name: addressData.name,
        phone: addressData.phone,
        address: addressData.address,
        city: addressData.city,
        province: addressData.province,
        postalCode: addressData.postalCode,
        label: addressData.label || 'Home',
        isDefault: addressData.isDefault || false
      }
    });
  });
};

const updateAddress = async (id, userId, updateData) => {
  return await prisma.$transaction(async (tx) => {
    // Check ownership
    const address = await tx.address.findUnique({ where: { id } });
    if (!address || address.userId !== userId) {
      throw new Error('Address not found');
    }

    // If setting as default, unset other defaults
    if (updateData.isDefault) {
      await tx.address.updateMany({
        where: { userId, id: { not: id } },
        data: { isDefault: false }
      });
    }

    return await tx.address.update({
      where: { id },
      data: updateData
    });
  });
};

const deleteAddress = async (id, userId) => {
  // Check ownership before deleting
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== userId) {
    throw new Error('Address not found');
  }

  await prisma.address.delete({
    where: { id }
  });
  
  return true;
};

module.exports = {
  getUserAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress
};
