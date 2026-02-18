import client from './client';

export const getWishlist = async () => {
    try {
        const response = await client.get('/wishlist');
        return response.data;
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        throw error;
    }
};

export const addToWishlist = async (productId) => {
    try {
        const response = await client.post('/wishlist', { productId });
        return response.data;
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        throw error;
    }
};

export const removeFromWishlist = async (productId) => {
    try {
        const response = await client.delete(`/wishlist/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        throw error;
    }
};
