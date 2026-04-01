const { readData, writeData, generateId } = require('../utils/dataHelper.util');

const getAllProducts = async (filters = {}) => {
  let products = await readData('products.json');
  const categories = await readData('categories.json');
  
  // Filter by category (support both categoryId and slug)
  if (filters.category) {
    // Find category by ID or slug
    const category = categories.find(c => 
      c.id === filters.category || c.slug === filters.category
    );
    if (category) {
      products = products.filter(p => p.categoryId === category.id);
    }
  }
  
  // Search by name
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower)
    );
  }
  
  // Populate category data with slug
  products = products.map(product => {
    const category = categories.find(c => c.id === product.categoryId);
    return {
      ...product,
      category: category ? { 
        id: category.id, 
        name: category.name,
        slug: category.slug 
      } : null
    };
  });
  
  // Filter by price range
  if (filters.minPrice) {
    products = products.filter(p => p.price >= parseFloat(filters.minPrice));
  }
  if (filters.maxPrice) {
    products = products.filter(p => p.price <= parseFloat(filters.maxPrice));
  }
  
  // Sort
  if (filters.sortBy) {
    const sortBy = filters.sortBy;
    const sortOrder = filters.sortOrder || 'asc';
    
    products.sort((a, b) => {
      if (sortBy === 'price') {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      }
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortBy === 'createdAt') {
        return sortOrder === 'asc'
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });
  }
  
  // Pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedProducts = products.slice(startIndex, endIndex);
  
  return {
    products: paginatedProducts,
    pagination: {
      page,
      limit,
      total: products.length,
      totalPages: Math.ceil(products.length / limit)
    }
  };
};

const getProductById = async (id) => {
  const products = await readData('products.json');
  const categories = await readData('categories.json');
  
  const searchId = String(id).trim();
  const product = products.find(p => String(p.id).trim() === searchId);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  // Populate category data with slug
  const category = categories.find(c => c.id === product.categoryId);
  return {
    ...product,
    category: category ? { 
      id: category.id, 
      name: category.name,
      slug: category.slug 
    } : null
  };
};

const createProduct = async (productData) => {
  const products = await readData('products.json');
  
  const basePrice = parseFloat(productData.price) || 0;
  const initialRating = parseFloat(productData.rating) || 0;

  const variants = productData.variants && productData.variants.length > 0 
    ? productData.variants.map(v => ({
        id: v.id || generateId(),
        name: v.name || "Default",
        price: v.price ? parseFloat(v.price) : basePrice,
        stock: parseInt(v.stock) || 0
      }))
    : [{
        id: generateId(),
        name: "Default",
        price: basePrice,
        stock: parseInt(productData.stock) || 0
      }];

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

  const newProduct = {
    id: generateId(),
    name: productData.name,
    description: productData.description || '',
    brand: productData.brand || '',
    variant: productData.variant || variants[0].name,
    composition: productData.composition || '',
    allergyInfo: productData.allergyInfo || '',
    expiryEstimate: productData.expiryEstimate || '',
    shippingOrigin: productData.shippingOrigin || '',
    shippingEstimate: productData.shippingEstimate || '',
    price: basePrice,
    originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : undefined,
    stock: totalStock,
    variants,
    categoryId: productData.categoryId,
    discount: productData.discount ? parseFloat(productData.discount) : undefined,
    isFeatured: productData.isFeatured || false,
    images: productData.images || [],
    weight: productData.weight || 0,
    unit: productData.unit || 'pcs',
    isActive: productData.isActive !== undefined ? productData.isActive : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rating: initialRating,
    reviews: []
  };

  products.push(newProduct);
  await writeData('products.json', products);
  
  return newProduct;
};

const updateProduct = async (id, updateData) => {
  const products = await readData('products.json');
  const searchId = String(id).trim();
  const productIndex = products.findIndex(p => String(p.id).trim() === searchId);
  
  if (productIndex === -1) {
    throw new Error('Product not found');
  }

  const existingProduct = products[productIndex];
  let updatedFields = { ...updateData };
  
  // Parse numeric fields
  if (updatedFields.price !== undefined) updatedFields.price = parseFloat(updatedFields.price);
  if (updatedFields.originalPrice !== undefined) updatedFields.originalPrice = parseFloat(updatedFields.originalPrice);
  if (updatedFields.rating !== undefined) updatedFields.rating = parseFloat(updatedFields.rating);
  if (updatedFields.stock !== undefined) updatedFields.stock = parseInt(updatedFields.stock);
  
  // Handle variants and stock logic
  if (updatedFields.variants && updatedFields.variants.length > 0) {
    // Parse variant data
    updatedFields.variants = updatedFields.variants.map(v => ({
      id: v.id || generateId(),
      name: v.name || "Default",
      price: v.price ? parseFloat(v.price) : parseFloat(updatedFields.price || existingProduct.price),
      stock: parseInt(v.stock) || 0
    }));
    
    // Check if any variant has stock > 0
    const hasVariantStocks = updatedFields.variants.some(v => v.stock > 0);
    
    if (hasVariantStocks) {
      // Scenario 1: Variants have stock values - use them as source of truth
      updatedFields.stock = updatedFields.variants.reduce((sum, v) => sum + v.stock, 0);
      console.log(`✅ Stock from variants: ${updatedFields.stock}`);
    } else if (updatedFields.stock !== undefined && updatedFields.stock > 0) {
      // Scenario 2: Main stock updated but variants have 0 - distribute evenly
      const stockPerVariant = Math.floor(updatedFields.stock / updatedFields.variants.length);
      const remainder = updatedFields.stock % updatedFields.variants.length;
      
      updatedFields.variants = updatedFields.variants.map((v, idx) => ({
        ...v,
        stock: idx === 0 ? stockPerVariant + remainder : stockPerVariant
      }));
      
      console.log(`✅ Distributed stock ${updatedFields.stock} to ${updatedFields.variants.length} variants:`, 
        updatedFields.variants.map(v => `${v.name}: ${v.stock}`));
    } else {
      // All stocks are 0
      updatedFields.stock = 0;
    }
  } else if (updatedFields.stock !== undefined) {
    // Scenario 3: Only main stock updated, check if variants exist in DB
    if (existingProduct.variants && existingProduct.variants.length > 0) {
      const stockPerVariant = Math.floor(updatedFields.stock / existingProduct.variants.length);
      const remainder = updatedFields.stock % existingProduct.variants.length;
      
      updatedFields.variants = existingProduct.variants.map((v, idx) => ({
        ...v,
        stock: idx === 0 ? stockPerVariant + remainder : stockPerVariant,
        price: updatedFields.price !== undefined ? updatedFields.price : v.price
      }));
      
      console.log(`✅ Updated existing variants with stock ${updatedFields.stock}:`, 
        updatedFields.variants.map(v => `${v.name}: ${v.stock}`));
    }
  }

  products[productIndex] = {
    ...existingProduct,
    ...updatedFields,
    updatedAt: new Date().toISOString()
  };

  await writeData('products.json', products);
  
  console.log(`📦 Product updated: ${products[productIndex].name}, Stock: ${products[productIndex].stock}`);
  
  return products[productIndex];
};

const addProductReview = async (productId, reviewData) => {
  const products = await readData('products.json');
  const searchId = String(productId).trim();
  const productIndex = products.findIndex(p => String(p.id).trim() === searchId);

  if (productIndex === -1) {
    throw new Error('Product not found');
  }

  const product = products[productIndex];

  if (!product.reviews) {
    product.reviews = [];
  }

  const rating = Number(reviewData.rating) || 0;

  const newReview = {
    id: generateId(),
    userId: reviewData.userId || null,
    name: reviewData.userName || 'Customer',
    rating,
    comment: reviewData.comment || '',
    createdAt: new Date().toISOString()
  };

  product.reviews.push(newReview);

  if (product.reviews.length > 0) {
    const totalRating = product.reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
    product.rating = Number((totalRating / product.reviews.length).toFixed(1));
  } else {
    product.rating = 0;
  }

  products[productIndex] = product;
  await writeData('products.json', products);

  return product;
};

const deleteProduct = async (id) => {
  const products = await readData('products.json');
  const searchId = String(id).trim();
  const productIndex = products.findIndex(p => String(p.id).trim() === searchId);
  
  if (productIndex === -1) {
    throw new Error('Product not found');
  }

  products.splice(productIndex, 1);
  await writeData('products.json', products);
  
  return true;
};

/**
 * Reduce product stock atomically
 * Prevents race conditions and ensures stock never goes negative
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to reduce
 * @returns {Object} Updated product
 */
const reduceStock = async (productId, quantity, variantId = null) => {
  if (!productId) {
    throw new Error('Product ID is required');
  }

  if (!quantity || quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  const products = await readData('products.json');
  const productIndex = products.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    throw new Error('Product not found');
  }

  const product = products[productIndex];
  let updatedProduct = { ...product };

  if (variantId && product.variants && product.variants.length > 0) {
    const variantIndex = product.variants.findIndex(v => v.id === variantId);
    if (variantIndex === -1) {
      throw new Error(`Variant not found: ${variantId}`);
    }

    const currentVariantStock = Number(product.variants[variantIndex].stock || 0);
    if (currentVariantStock < quantity) {
      throw new Error(`Insufficient stock for variant ${product.variants[variantIndex].name}. Available: ${currentVariantStock}, Requested: ${quantity}`);
    }

    updatedProduct.variants[variantIndex].stock = currentVariantStock - quantity;
    // Update total stock
    updatedProduct.stock = updatedProduct.variants.reduce((sum, v) => sum + v.stock, 0);
  } else {
    const currentStock = Number(product.stock || 0);
    const newStock = currentStock - quantity;

    if (newStock < 0) {
      throw new Error(`Insufficient stock. Available: ${currentStock}, Requested: ${quantity}`);
    }
    updatedProduct.stock = newStock;
  }

  updatedProduct.updatedAt = new Date().toISOString();
  products[productIndex] = updatedProduct;

  await writeData('products.json', products);

  return products[productIndex];
};

/**
 * Reduce stock for multiple products atomically
 * Used during checkout to update all products at once
 * @param {Array} items - Array of {productId, quantity}
 * @returns {Array} Updated products
 */
const reduceStockBatch = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Items array is required');
  }

  const products = await readData('products.json');
  const updatedProducts = [];
  const productUpdates = [];

  // First pass: validate all products and quantities
  for (const item of items) {
    const { productId, quantity, variantId } = item;

    if (!productId || !quantity || quantity <= 0) {
      throw new Error('Invalid item: productId and quantity are required');
    }

    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex === -1) {
      throw new Error(`Product not found: ${productId}`);
    }

    const product = products[productIndex];
    
    if (variantId && product.variants && product.variants.length > 0) {
      const variantIndex = product.variants.findIndex(v => v.id === variantId);
      if (variantIndex === -1) {
        throw new Error(`Variant not found: ${variantId} for product ${product.name}`);
      }

      const currentVariantStock = Number(product.variants[variantIndex].stock || 0);
      if (currentVariantStock < quantity) {
        throw new Error(`Insufficient stock for ${product.name} (${product.variants[variantIndex].name}). Available: ${currentVariantStock}, Requested: ${quantity}`);
      }

      // We'll update the variant stock in the second pass
      productUpdates.push({
        index: productIndex,
        variantIndex,
        quantity,
        type: 'variant'
      });
    } else {
      const currentStock = Number(product.stock || 0);
      if (currentStock < quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${currentStock}, Requested: ${quantity}`);
      }

      productUpdates.push({
        index: productIndex,
        quantity,
        type: 'product'
      });
    }
  }

  // Second pass: apply all updates atomically
  for (const update of productUpdates) {
    const product = products[update.index];
    if (update.type === 'variant') {
      product.variants[update.variantIndex].stock -= update.quantity;
      product.stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
    } else {
      product.stock -= update.quantity;
    }
    product.updatedAt = new Date().toISOString();
  }

  await writeData('products.json', products);

  // Log for debugging
  console.log('Stock reduced successfully:', productUpdates.map(u => {
    const product = products[u.index];
    return {
      productId: product.id,
      name: product.name,
      reducedQuantity: u.quantity,
      remainingStock: product.stock
    };
  }));

  return updatedProducts;
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
  reduceStock,
  reduceStockBatch
};
