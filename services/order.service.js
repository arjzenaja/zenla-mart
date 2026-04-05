const prisma = require('../utils/prisma');
const { getProductById, reduceStockBatch } = require('./product.service');
const { clearCart, getUserCart } = require('./cart.service');
const { getAddressById } = require('./address.service');

const getUserOrders = async (userId, searchQuery = null) => {
  const where = { userId };
  
  if (searchQuery) {
    where.OR = [
      { orderNumber: { contains: searchQuery, mode: 'insensitive' } },
      { id: { contains: searchQuery, mode: 'insensitive' } }
    ];
  }
  
  return await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  });
};

const getAllOrders = async (filters = {}) => {
  const { status, search, startDate, endDate, page = 1, limit = 10 } = filters;
  
  const where = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { id: { contains: search, mode: 'insensitive' } }
    ];
  }
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    }),
    prisma.order.count({ where })
  ]);

  return {
    orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / take)
    }
  };
};

const getOrderById = async (id, userId = null) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { name: true, email: true } } }
  });
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  if (userId && order.userId !== userId) {
    throw new Error('Order not found');
  }
  
  return order;
};

const createOrder = async (userId, orderData) => {
  // Use transaction to ensure everything succeeds or fails together
  return await prisma.$transaction(async (tx) => {
    let cartItemsToProcess = [];

    // 1. Get Items
    if (orderData.items && Array.isArray(orderData.items) && orderData.items.length > 0) {
      cartItemsToProcess = orderData.items;
    } else {
      const cart = await getUserCart(userId);
      if (!cart.items || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }
      cartItemsToProcess = cart.items;
    }
    
    // 2. Verify Address
    const address = await getAddressById(orderData.addressId, userId);
    
    // 3. Prepare Order Items & Calculate Subtotal
    const orderItemsData = [];
    let subtotal = 0;
    
    for (const item of cartItemsToProcess) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        include: { variants: true }
      });
      
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      
      let variantName = null;
      let targetPrice = product.price;
      let targetStock = product.stock;

      if (item.variantId) {
        const variant = product.variants.find(v => v.id === item.variantId);
        if (!variant) throw new Error(`Variant not found for product ${product.name}`);
        variantName = variant.name;
        targetPrice = variant.price;
        targetStock = variant.stock;
      }

      if (targetStock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}${variantName ? ` (${variantName})` : ''}`);
      }

      const itemTotal = targetPrice * item.quantity;
      subtotal += itemTotal;
      
      orderItemsData.push({
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
    
    // 4. Generate Invoice & Order Number
    const now = new Date();
    const dateStr = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0');
    const invoiceNumber = `INV-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderNumber = `ORD-${Date.now()}`;

    // 5. Create Order & Items
    const newOrder = await tx.order.create({
      data: {
        userId,
        orderNumber,
        subtotal,
        shippingCost,
        total,
        status: 'pending',
        paymentMethod: orderData.paymentMethod || 'cash',
        paymentProofUrl: orderData.paymentProofUrl || '',
        paymentStatus: 'pending',
        notes: orderData.notes || '',
        shippingMethod: orderData.shippingMethod || 'regular',
        shippingEstimate: orderData.shippingEstimate || '',
        addressName: address.name,
        addressPhone: address.phone,
        addressDetail: address.address,
        addressCity: address.city,
        addressProvince: address.province,
        addressPostalCode: address.postalCode,
        items: {
          create: orderItemsData
        }
      },
      include: { items: true }
    });
    
    // 6. Reduce Stock Batch (Atomic inside transaction)
    for (const item of orderItemsData) {
      if (item.variantId) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
        if (variant.stock < item.quantity) throw new Error(`Stock mismatch for variant ${variant.name}`);
        
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } }
        });
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      } else {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (product.stock < item.quantity) throw new Error(`Stock mismatch for product ${product.name}`);
        
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }
    }
    
    // 7. Clear Cart
    if (!orderData.items) {
      const cart = await tx.cart.findUnique({ where: { userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    }
    
    return newOrder;
  });
};

const updateOrderStatus = async (id, status, userId = null) => {
  const where = { id };
  if (userId) where.userId = userId;

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'ready_for_pickup', 'picked_up', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid order status');
  }
  
  const data = { status };
  if (status === 'delivered' || status === 'picked_up') {
    data.paymentStatus = 'paid';
  }
  
  return await prisma.order.update({
    where,
    data
  });
};

module.exports = {
  getUserOrders,
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus
};
