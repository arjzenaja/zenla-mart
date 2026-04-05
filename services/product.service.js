const prisma = require('../utils/prisma');

const getAllProducts = async (filters = {}) => {
  const {
    category,
    search,
    minPrice,
    maxPrice,
    sortBy,
    sortOrder = 'asc',
    page = 1,
    limit = 10
  } = filters;

  const where = {
    isActive: true
  };

  // Filter by category (support both categoryId and slug)
  if (category) {
    where.OR = [
      { categoryId: category },
      { category: { slug: category } }
    ];
  }

  // Search by name or description
  if (search) {
    where.OR = [
      ...(where.OR || []),
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  // Prepare sorting
  const orderBy = {};
  if (sortBy) {
    orderBy[sortBy] = sortOrder;
  } else {
    orderBy.createdAt = 'desc';
  }

  // Pagination calculation
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Execute query
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        variants: true,
        reviews: true
      }
    }),
    prisma.product.count({ where })
  ]);

  return {
    products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / take)
    }
  };
};

const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      variants: true,
      reviews: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!product) {
    throw new Error('Product not found');
  }

  return product;
};

const createProduct = async (productData) => {
  const basePrice = parseFloat(productData.price) || 0;
  
  const variants = productData.variants && productData.variants.length > 0 
    ? productData.variants.map(v => ({
        name: v.name || "Default",
        price: v.price ? parseFloat(v.price) : basePrice,
        stock: parseInt(v.stock) || 0
      }))
    : [{
        name: "Default",
        price: basePrice,
        stock: parseInt(productData.stock) || 0
      }];

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

  const product = await prisma.product.create({
    data: {
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
      stock: totalStock,
      categoryId: productData.categoryId,
      isFeatured: productData.isFeatured || false,
      images: productData.images || [],
      weight: parseFloat(productData.weight) || 0,
      unit: productData.unit || 'pcs',
      isActive: productData.isActive !== undefined ? productData.isActive : true,
      rating: parseFloat(productData.rating) || 0,
      variants: {
        create: variants
      }
    },
    include: {
      variants: true,
      category: true
    }
  });

  return product;
};

const updateProduct = async (id, updateData) => {
  const { variants, ...productFields } = updateData;
  
  // Parse numeric fields
  if (productFields.price !== undefined) productFields.price = parseFloat(productFields.price);
  if (productFields.rating !== undefined) productFields.rating = parseFloat(productFields.rating);
  if (productFields.stock !== undefined) productFields.stock = parseInt(productFields.stock);
  if (productFields.weight !== undefined) productFields.weight = parseFloat(productFields.weight);

  // If variants are provided, we need to handle them carefully
  // In this simple implementation, we'll replace them if provided
  const updatePayload = { ...productFields };
  
  if (variants && variants.length > 0) {
    updatePayload.variants = {
      deleteMany: {},
      create: variants.map(v => ({
        name: v.name,
        price: parseFloat(v.price),
        stock: parseInt(v.stock)
      }))
    };
    // Recalculate total stock from variants
    updatePayload.stock = variants.reduce((sum, v) => sum + parseInt(v.stock), 0);
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: updatePayload,
    include: {
      variants: true,
      category: true
    }
  });

  return updatedProduct;
};

const addProductReview = async (productId, reviewData) => {
  const rating = parseFloat(reviewData.rating) || 0;

  const review = await prisma.productReview.create({
    data: {
      productId,
      userId: reviewData.userId,
      name: reviewData.userName || 'Customer',
      rating,
      comment: reviewData.comment || ''
    }
  });

  // Re-calculate product rating
  const allReviews = await prisma.productReview.findMany({
    where: { productId }
  });

  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  await prisma.product.update({
    where: { id: productId },
    data: { rating: avgRating }
  });

  return review;
};

const deleteProduct = async (id) => {
  await prisma.product.delete({
    where: { id }
  });
  return true;
};

const reduceStock = async (productId, quantity, variantId = null) => {
  if (variantId) {
    return await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUnique({
        where: { id: variantId }
      });

      if (!variant || variant.stock < quantity) {
        throw new Error('Insufficient stock for variant');
      }

      const updatedVariant = await tx.productVariant.update({
        where: { id: variantId },
        data: { stock: { decrement: quantity } }
      });

      // Update main product total stock
      await tx.product.update({
        where: { id: productId },
        data: { stock: { decrement: quantity } }
      });

      return updatedVariant;
    });
  } else {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product || product.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    return await prisma.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } }
    });
  }
};

const reduceStockBatch = async (items) => {
  return await prisma.$transaction(async (tx) => {
    const results = [];
    for (const item of items) {
      const updated = await reduceStock(item.productId, item.quantity, item.variantId);
      results.push(updated);
    }
    return results;
  });
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
