const {
  getUserAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress
} = require('../services/address.service');

const getAddresses = async (req, res, next) => {
  try {
    const addresses = await getUserAddresses(req.user.id);
    
    res.json({
      success: true,
      addresses
    });
  } catch (error) {
    next(error);
  }
};

const getAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const address = await getAddressById(id, req.user.id);
    
    res.json({
      success: true,
      address
    });
  } catch (error) {
    next(error);
  }
};

const createAddressHandler = async (req, res, next) => {
  try {
    const { name, phone, address, city, province, postalCode, label, isDefault } = req.body;

    if (!name || !phone || !address || !city || !province || !postalCode) {
      return res.status(400).json({
        success: false,
        message: 'All address fields are required'
      });
    }

    // Validate label
    const validLabels = ['Home', 'Office', 'Custom'];
    const addressLabel = label && validLabels.includes(label) ? label : 'Home';

    const newAddress = await createAddress(req.user.id, {
      name,
      phone,
      address,
      city,
      province,
      postalCode,
      label: addressLabel,
      isDefault
    });
    
    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      address: newAddress
    });
  } catch (error) {
    next(error);
  }
};

const updateAddressHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate label if provided
    if (updateData.label) {
      const validLabels = ['Home', 'Office', 'Custom'];
      if (!validLabels.includes(updateData.label)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid label. Must be Home, Office, or Custom'
        });
      }
    }

    const updatedAddress = await updateAddress(id, req.user.id, updateData);
    
    res.json({
      success: true,
      message: 'Address updated successfully',
      address: updatedAddress
    });
  } catch (error) {
    next(error);
  }
};

const deleteAddressHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await deleteAddress(id, req.user.id);
    
    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const setDefaultAddressHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Update address to set as default (this will unset other defaults)
    const updatedAddress = await updateAddress(id, req.user.id, { isDefault: true });
    
    res.json({
      success: true,
      message: 'Default address updated successfully',
      address: updatedAddress
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAddresses,
  getAddress,
  createAddressHandler,
  updateAddressHandler,
  deleteAddressHandler,
  setDefaultAddressHandler
};
