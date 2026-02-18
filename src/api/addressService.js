import client from './client';

export const getAddresses = async () => {
    try {
        const response = await client.get('/addresses');
        return response.data;
    } catch (error) {
        console.error('Error fetching addresses:', error);
        throw error;
    }
};

export const getAddressById = async (id) => {
    try {
        const response = await client.get(`/addresses/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching address:', error);
        throw error;
    }
};

export const createAddress = async (addressData) => {
    try {
        const response = await client.post('/addresses', addressData);
        return response.data;
    } catch (error) {
        console.error('Error creating address:', error);
        throw error;
    }
};

export const updateAddress = async (id, addressData) => {
    try {
        const response = await client.put(`/addresses/${id}`, addressData);
        return response.data;
    } catch (error) {
        console.error('Error updating address:', error);
        throw error;
    }
};

export const deleteAddress = async (id) => {
    try {
        const response = await client.delete(`/addresses/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting address:', error);
        throw error;
    }
};

export const setDefaultAddress = async (id) => {
    try {
        const response = await client.patch(`/addresses/${id}/set-default`);
        return response.data;
    } catch (error) {
        console.error('Error setting default address:', error);
        throw error;
    }
};
