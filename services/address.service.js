const { readData, writeData, generateId } = require('../utils/dataHelper.util');

const getUserAddresses = async (userId) => {
  const addresses = await readData('addresses.json');
  return addresses.filter(addr => addr.userId === userId);
};

const getAddressById = async (id, userId) => {
  const addresses = await readData('addresses.json');
  const address = addresses.find(addr => addr.id === id && addr.userId === userId);
  
  if (!address) {
    throw new Error('Address not found');
  }
  
  return address;
};

const createAddress = async (userId, addressData) => {
  const addresses = await readData('addresses.json');
  
  const newAddress = {
    id: generateId(),
    userId,
    name: addressData.name,
    phone: addressData.phone,
    address: addressData.address,
    city: addressData.city,
    province: addressData.province,
    postalCode: addressData.postalCode,
    label: addressData.label || 'Home', // Home, Office, or Custom
    isDefault: addressData.isDefault || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // If this is set as default, unset other defaults
  if (newAddress.isDefault) {
    addresses.forEach(addr => {
      if (addr.userId === userId) {
        addr.isDefault = false;
      }
    });
  }

  addresses.push(newAddress);
  await writeData('addresses.json', addresses);
  
  return newAddress;
};

const updateAddress = async (id, userId, updateData) => {
  const addresses = await readData('addresses.json');
  const addressIndex = addresses.findIndex(addr => addr.id === id && addr.userId === userId);
  
  if (addressIndex === -1) {
    throw new Error('Address not found');
  }

  // If setting as default, unset other defaults
  if (updateData.isDefault) {
    addresses.forEach(addr => {
      if (addr.userId === userId && addr.id !== id) {
        addr.isDefault = false;
      }
    });
  }

  addresses[addressIndex] = {
    ...addresses[addressIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  };

  await writeData('addresses.json', addresses);
  
  return addresses[addressIndex];
};

const deleteAddress = async (id, userId) => {
  const addresses = await readData('addresses.json');
  const addressIndex = addresses.findIndex(addr => addr.id === id && addr.userId === userId);
  
  if (addressIndex === -1) {
    throw new Error('Address not found');
  }

  addresses.splice(addressIndex, 1);
  await writeData('addresses.json', addresses);
  
  return true;
};

module.exports = {
  getUserAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress
};
