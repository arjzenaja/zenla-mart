const {
  getUserOrders,
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus
} = require('../services/order.service');

const getMyOrders = async (req, res, next) => {
  try {
    const searchQuery = req.query.search || null;
    const orders = await getUserOrders(req.user.id, searchQuery);
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrdersHandler = async (req, res, next) => {
  try {
    const filters = req.query;
    const result = await getAllOrders(filters);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.role === 'admin' ? null : req.user.id;
    const order = await getOrderById(id, userId);
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

const createOrderHandler = async (req, res, next) => {
  try {
    const { addressId, shippingCost, paymentMethod, notes, shippingMethod, shippingEstimate, items } = req.body;
    const fs = require('fs');
    fs.appendFileSync('debug_orders.log', JSON.stringify(req.body) + '\n');
    console.log('Creates Order Body:', req.body);

    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: 'Address ID is required'
      });
    }

    const order = await createOrder(req.user.id, {
      addressId,
      shippingCost,
      paymentMethod,
      notes,
      shippingMethod, 
      shippingEstimate,
      items // Pass items to service
    });
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatusHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const userId = req.user.role === 'admin' ? null : req.user.id;
    const order = await updateOrderStatus(id, status, userId);
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyOrders,
  getAllOrdersHandler,
  getOrder,
  createOrderHandler,
  updateOrderStatusHandler
};
