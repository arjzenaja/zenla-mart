import client from './client';

export const getCart = async () => {
    try {
        const response = await client.get('/cart');
        return response.data;
    } catch (error) {
        console.error('Error fetching cart:', error);
        throw error;
    }
};

export const addToCart = async (productId, quantity, variants = []) => {
    try {
        const response = await client.post('/cart', { productId, quantity, variants });
        return response.data;
    } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
    }
};

export const updateCartItem = async (productId, quantity) => {
    try {
        const response = await client.put(`/cart/${productId}`, { quantity });
        return response.data;
    } catch (error) {
        console.error('Error updating cart item:', error);
        throw error;
    }
};

export const removeFromCart = async (productId) => {
    try {
        const response = await client.delete(`/cart/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Error removing from cart:', error);
        throw error;
    }
};
