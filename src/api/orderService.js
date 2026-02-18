import client from './client';

export const createOrder = async (orderData) => {
  try {
    const response = await client.post('/orders/checkout', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    // Return error response data if available for better error handling in UI
    if (error.response && error.response.data) {
        throw error.response.data;
    }
    throw error;
  }
};
export const getUserOrders = async () => {
  try {
    const response = await client.get('/orders/my-orders');
    // The backend might return { success: true, orders: [...] } or just [...]
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    if (error.response && error.response.data) {
        throw error.response.data;
    }
    throw error;
  }
};
export const getOrderById = async (orderId) => {
  try {
    const response = await client.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order detail:', error);
    if (error.response && error.response.data) {
        throw error.response.data;
    }
    throw error;
  }
};
