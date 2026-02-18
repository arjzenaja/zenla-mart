import client from './client';

export const getPaymentMethods = async () => {
  try {
    const response = await client.get('/payment-methods');
    return response.data;
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
};
