const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
  reduceStock
} = require('../services/product.service');

const getProducts = async (req, res, next) => {
  try {
    const filters = req.query;
    const result = await getAllProducts(filters);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    next(error);
  }
};

const createProductHandler = async (req, res, next) => {
  try {
    const { name, price, categoryId } = req.body;

    if (!name || !price || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and categoryId are required'
      });
    }

    const newProduct = await createProduct(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    next(error);
  }
};

const updateProductHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedProduct = await updateProduct(id, updateData);
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    next(error);
  }
};

const deleteProductHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await deleteProduct(id);
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    next(error);
  }
};

const addProductReviewHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Rating and comment are required'
      });
    }

    if (typeof comment !== 'string' || comment.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Comment must be at least 5 characters long'
      });
    }

    const user = req.user || {};

    const updatedProduct = await addProductReview(id, {
      rating,
      comment,
      userId: user.id,
      userName: user.name || user.email || 'Customer'
    });

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      product: updatedProduct
    });
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    next(error);
  }
};

const updateStockHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity === null) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required'
      });
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number'
      });
    }

    const updatedProduct = await reduceStock(id, quantity);

    res.json({
      success: true,
      message: 'Stock updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
  addProductReviewHandler,
  updateStockHandler
};
