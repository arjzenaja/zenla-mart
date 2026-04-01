const { readData, writeData, generateId } = require('../utils/dataHelper.util');
const { getProductById, reduceStockBatch } = require('./product.service');
const { clearCart } = require('./cart.service');

const getUserOrders = async (userId, searchQuery = null) => {
  const orders = await readData('orders.json');
  let userOrders = orders.filter(order => order.userId === userId);
  
  // Filter by order number if search query provided
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    userOrders = userOrders.filter(order => 
      order.orderNumber?.toLowerCase().includes(query) ||
      order.id?.toLowerCase().includes(query)
    );
  }
  
  return userOrders.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
};

const getAllOrders = async (filters = {}) => {
  let orders = await readData('orders.json');
  
  // Filter by status
  if (filters.status) {
    orders = orders.filter(o => o.status === filters.status);
  }
  
  // Filter by order number search
  if (filters.search) {
    const query = filters.search.toLowerCase();
    orders = orders.filter(o => 
      o.orderNumber?.toLowerCase().includes(query) ||
      o.id?.toLowerCase().includes(query)
    );
  }
  
  // Filter by date range
  if (filters.startDate) {
    orders = orders.filter(o => new Date(o.createdAt) >= new Date(filters.startDate));
  }
  if (filters.endDate) {
    orders = orders.filter(o => new Date(o.createdAt) <= new Date(filters.endDate));
  }
  
  // Sort by date (newest first)
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedOrders = orders.slice(startIndex, endIndex);
  
  return {
    orders: paginatedOrders,
    pagination: {
      page,
      limit,
      total: orders.length,
      totalPages: Math.ceil(orders.length / limit)
    }
  };
};

const getOrderById = async (id, userId = null) => {
  const orders = await readData('orders.json');
  let order = orders.find(o => o.id === id);
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  // If userId provided, verify ownership
  if (userId && order.userId !== userId) {
    throw new Error('Order not found');
  }
  
  return order;
};

const createOrder = async (userId, orderData) => {
  const orders = await readData('orders.json');
  const { getUserCart } = require('./cart.service');
  const { getAddressById } = require('./address.service');
  
  let cartItemsToProcess = [];

  // If items are provided in orderData (e.g. from mobile), use them
  if (orderData.items && Array.isArray(orderData.items) && orderData.items.length > 0) {
    cartItemsToProcess = orderData.items;
  } else {
    // Get cart from database
    const cart = await getUserCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }
    cartItemsToProcess = cart.items;
  }
  
  // Verify address
  const address = await getAddressById(orderData.addressId, userId);
  
  // Calculate order items and total
  const orderItems = [];
  let subtotal = 0;
  
  for (const item of cartItemsToProcess) {
    // item structure might differ slightly between cart (DB) and mobile payload
    // Mobile payload expected: { productId, variantId, quantity }
    
    const product = await getProductById(item.productId);
    
    let variantName = null;
    let targetPrice = product.price;
    let targetStock = product.stock;

    if (item.variantId && product.variants) {
      const variant = product.variants.find(v => v.id === item.variantId || v._id === item.variantId);
      if (!variant) {
        throw new Error(`Variant not found for product ${product.name}`);
      }
      variantName = variant.name;
      if (variant.price) targetPrice = variant.price;
      targetStock = variant.stock;
    }

    if (targetStock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}${variantName ? ` (${variantName})` : ''}`);
    }

    const itemTotal = targetPrice * item.quantity;
    subtotal += itemTotal;
    
    orderItems.push({
      productId: product.id,
      variantId: item.variantId || null,
      variantName: variantName,
      productName: product.name,
      productImage: product.images[0] || '',
      price: targetPrice,
      quantity: item.quantity,
      total: itemTotal
    });
  }
  
  const shippingCost = 0;
  const total = subtotal + shippingCost;
  
  // Generate invoice number
  const now = new Date();
  const dateStr = now.getFullYear().toString() + 
                 (now.getMonth() + 1).toString().padStart(2, '0') + 
                 now.getDate().toString().padStart(2, '0');
  const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
  const invoiceNumber = `INV-${dateStr}-${randomStr}`;

  const newOrder = {
    id: generateId(),
    userId,
    orderNumber: 'ORD-' + Date.now(),
    invoiceNumber,
    items: orderItems,
    address: {
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode
    },
    subtotal,
    shippingCost,
    shippingMethod: orderData.shippingMethod || 'regular',
    shippingEstimate: orderData.shippingEstimate || '',
    total,
    status: 'pending',
    paymentMethod: orderData.paymentMethod || 'cash',
    paymentProofUrl: orderData.paymentProofUrl || '',
    paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : 'pending', // Both pending initially, but cod is handled differently
    notes: orderData.notes || '',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
  
  orders.push(newOrder);
  await writeData('orders.json', orders);
  
  // Reduce stock for all products in the order (atomic operation)
  try {
    const stockReductionItems = orderItems.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity
    }));
    console.log('Reducing stock for order items:', stockReductionItems);
    await reduceStockBatch(stockReductionItems);
    console.log('Stock reduced successfully for order:', newOrder.id);
  } catch (stockError) {
    console.error('Error reducing stock, rolling back order:', stockError);
    // If stock reduction fails, we should rollback the order
    // Remove the order we just created
    orders.pop();
    await writeData('orders.json', orders);
    throw stockError;
  }
  
  // Clear cart only if we used the backend cart
  // If items were passed explicitly (e.g. mobile), we don't clear backend cart 
  // (though mobile should clear its local cart)
  if (!orderData.items) {
    await clearCart(userId);
  }
  
  return newOrder;
};

const updateOrderStatus = async (id, status, userId = null) => {
  const orders = await readData('orders.json');
  const orderIndex = orders.findIndex(o => o.id === id);
  
  if (orderIndex === -1) {
    throw new Error('Order not found');
  }
  
  // If userId provided, verify ownership (for user updates)
  if (userId && orders[orderIndex].userId !== userId) {
    throw new Error('Order not found');
  }
  
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'ready_for_pickup', 'picked_up', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid order status');
  }
  
  orders[orderIndex].status = status;
  orders[orderIndex].updatedAt = new Date().toISOString();
  
  // Update payment status if order is delivered or picked up
  if (status === 'delivered' || status === 'picked_up') {
    orders[orderIndex].paymentStatus = 'paid';
  }
  
  await writeData('orders.json', orders);
  
  return orders[orderIndex];
};

module.exports = {
  getUserOrders,
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus
};
