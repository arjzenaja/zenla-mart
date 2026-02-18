import client from './client';

export const getProfile = async () => {
    try {
        const response = await client.get('/users/me');
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
};

export const updateProfile = async (userData) => {
    try {
        const response = await client.put('/users/me', userData);
        return response.data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};
