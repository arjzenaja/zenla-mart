const {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  removeAllFromWishlist,
  addToCartFromWishlist,
  addAllToCart,
  getAllWishlists
} = require('../services/wishlist.service');

const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await getUserWishlist(req.user.id);
    
    res.json({
      success: true,
      wishlist
    });
  } catch (error) {
    next(error);
  }
};

const addToWishlistHandler = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const wishlist = await addToWishlist(req.user.id, productId);
    
    res.json({
      success: true,
      message: 'Item added to wishlist',
      wishlist
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const removeFromWishlistHandler = async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    const wishlist = await removeFromWishlist(req.user.id, productId);
    
    res.json({
      success: true,
      message: 'Item removed from wishlist',
      wishlist
    });
  } catch (error) {
    next(error);
  }
};

const removeAllFromWishlistHandler = async (req, res, next) => {
  try {
    const wishlist = await removeAllFromWishlist(req.user.id);
    
    res.json({
      success: true,
      message: 'All items removed from wishlist',
      wishlist
    });
  } catch (error) {
    next(error);
  }
};

const addToCartFromWishlistHandler = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const { removeFromWishlist: remove } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const cart = await addToCartFromWishlist(req.user.id, productId, remove === true);
    
    res.json({
      success: true,
      message: 'Item added to cart' + (remove ? ' and removed from wishlist' : ''),
      cart
    });
  } catch (error) {
    next(error);
  }
};

const addAllToCartHandler = async (req, res, next) => {
  try {
    const { removeFromWishlist: remove } = req.body;
    
    const results = await addAllToCart(req.user.id, remove === true);
    
    res.json({
      success: true,
      message: `${results.added.length} item(s) added to cart`,
      results
    });
  } catch (error) {
    next(error);
  }
};

const getAllWishlistsHandler = async (req, res, next) => {
  try {
    const wishlists = await getAllWishlists();
    
    res.json({
      success: true,
      wishlists
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlistHandler,
  removeFromWishlistHandler,
  removeAllFromWishlistHandler,
  addToCartFromWishlistHandler,
  addAllToCartHandler,
  getAllWishlistsHandler
};
