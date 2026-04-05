const prisma = require('../utils/prisma');
const { addToCart } = require('./cart.service');

const getUserWishlist = async (userId) => {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });
  
  if (!wishlist) {
    return { items: [], products: [] };
  }

  const products = wishlist.items.map(item => ({
    ...item.product,
    stockStatus: (item.product.stock && item.product.stock > 0) ? 'In stock' : 'Out of stock',
    image: (item.product.images && item.product.images.length > 0) ? item.product.images[0] : '/taro.png'
  }));

  return {
    items: wishlist.items.map(i => i.productId),
    products,
    createdAt: wishlist.createdAt,
    updatedAt: wishlist.updatedAt
  };
};

const addToWishlist = async (userId, productId) => {
  // Ensure wishlist exists
  const wishlist = await prisma.wishlist.upsert({
    where: { userId },
    update: {},
    create: { userId }
  });

  // Check if product already in wishlist
  const existingItem = await prisma.wishlistItem.findFirst({
    where: {
      wishlistId: wishlist.id,
      productId: productId
    }
  });

  if (existingItem) {
    throw new Error('Product already in wishlist');
  }

  return await prisma.wishlistItem.create({
    data: {
      wishlistId: wishlist.id,
      productId: productId
    }
  });
};

const removeFromWishlist = async (userId, productId) => {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId }
  });
  
  if (!wishlist) {
    throw new Error('Wishlist not found');
  }

  const existingItem = await prisma.wishlistItem.findFirst({
    where: {
      wishlistId: wishlist.id,
      productId: productId
    }
  });

  if (!existingItem) {
    throw new Error('Item not found in wishlist');
  }

  return await prisma.wishlistItem.delete({
    where: { id: existingItem.id }
  });
};

const removeAllFromWishlist = async (userId) => {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId }
  });
  
  if (!wishlist) return true;

  await prisma.wishlistItem.deleteMany({
    where: { wishlistId: wishlist.id }
  });
  
  return true;
};

const addToCartFromWishlist = async (userId, productId, shouldRemove = false) => {
  const cart = await addToCart(userId, productId, 1);
  
  if (shouldRemove) {
    await removeFromWishlist(userId, productId).catch(() => {});
  }
  
  return cart;
};

const addAllToCart = async (userId, shouldRemove = false) => {
  const wishlist = await getUserWishlist(userId);
  
  if (!wishlist.products || wishlist.products.length === 0) {
    throw new Error('Wishlist is empty');
  }

  const results = {
    added: [],
    failed: []
  };

  for (const product of wishlist.products) {
    try {
      if (product.stock && product.stock > 0) {
        await addToCart(userId, product.id, 1);
        results.added.push(product.id);
      } else {
        results.failed.push({ productId: product.id, reason: 'Out of stock' });
      }
    } catch (error) {
      results.failed.push({ productId: product.id, reason: error.message });
    }
  }

  if (shouldRemove) {
    await removeAllFromWishlist(userId).catch(() => {});
  }

  return results;
};

const getAllWishlists = async () => {
  return await prisma.wishlist.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      items: true
    }
  });
};

module.exports = {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  removeAllFromWishlist,
  addToCartFromWishlist,
  addAllToCart,
  getAllWishlists
};
