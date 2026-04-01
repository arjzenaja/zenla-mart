const {
  getUserCart,
  addToCart,
  updateCartItem,
  removeFromCart
} = require('../services/cart.service');

const getCart = async (req, res, next) => {
  try {
    const cart = await getUserCart(req.user.id);
    
    res.json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};

const addToCartHandler = async (req, res, next) => {
  try {
    const { productId, quantity, variantId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const cart = await addToCart(req.user.id, productId, quantity || 1, variantId);
    
    res.json({
      success: true,
      message: 'Item added to cart',
      cart
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItemHandler = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity, variantId } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const cart = await updateCartItem(req.user.id, productId, quantity, variantId || req.query.variantId);
    
    res.json({
      success: true,
      message: 'Cart updated successfully',
      cart
    });
  } catch (error) {
    next(error);
  }
};

const removeFromCartHandler = async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    const { variantId } = req.query;
    const cart = await removeFromCart(req.user.id, productId, variantId);
    
    res.json({
      success: true,
      message: 'Item removed from cart',
      cart
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCartHandler,
  updateCartItemHandler,
  removeFromCartHandler
};
