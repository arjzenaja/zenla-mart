const { readData, writeData, generateId } = require('../utils/dataHelper.util');
const { getProductById } = require('./product.service');
const { addToCart } = require('./cart.service');

const getUserWishlist = async (userId) => {
  const wishlists = await readData('wishlists.json');
  const userWishlist = wishlists.find(w => w.userId === userId);
  
  if (!userWishlist || !userWishlist.items || userWishlist.items.length === 0) {
    return { items: [], products: [] };
  }

  // Fetch full product details for each item
  const productPromises = userWishlist.items.map(productId => 
    getProductById(productId).catch(() => null)
  );
  
  const products = (await Promise.all(productPromises))
    .filter(product => product !== null)
    .map(product => ({
      ...product,
      // Determine stock status
      stockStatus: (product.stock && product.stock > 0) ? 'In stock' : 'Out of stock',
      // Get first image or default
      image: (product.images && product.images.length > 0) ? product.images[0] : (product.image || '/taro.png')
    }));

  return {
    items: userWishlist.items,
    products,
    createdAt: userWishlist.createdAt,
    updatedAt: userWishlist.updatedAt
  };
};

const addToWishlist = async (userId, productId) => {
  const wishlists = await readData('wishlists.json');
  let userWishlist = wishlists.find(w => w.userId === userId);
  
  // Verify product exists
  await getProductById(productId);
  
  if (!userWishlist) {
    userWishlist = {
      id: generateId(),
      userId,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    wishlists.push(userWishlist);
  }

  // Check if product already in wishlist
  if (userWishlist.items.includes(productId)) {
    throw new Error('Product already in wishlist');
  }

  userWishlist.items.push(productId);
  userWishlist.updatedAt = new Date().toISOString();
  
  await writeData('wishlists.json', wishlists);
  
  return userWishlist;
};

const removeFromWishlist = async (userId, productId) => {
  const wishlists = await readData('wishlists.json');
  const userWishlist = wishlists.find(w => w.userId === userId);
  
  if (!userWishlist) {
    throw new Error('Wishlist not found');
  }

  const itemIndex = userWishlist.items.indexOf(productId);
  
  if (itemIndex === -1) {
    throw new Error('Item not found in wishlist');
  }

  userWishlist.items.splice(itemIndex, 1);
  userWishlist.updatedAt = new Date().toISOString();
  
  await writeData('wishlists.json', wishlists);
  
  return userWishlist;
};

const removeAllFromWishlist = async (userId) => {
  const wishlists = await readData('wishlists.json');
  const userWishlist = wishlists.find(w => w.userId === userId);
  
  if (!userWishlist) {
    throw new Error('Wishlist not found');
  }

  userWishlist.items = [];
  userWishlist.updatedAt = new Date().toISOString();
  
  await writeData('wishlists.json', wishlists);
  
  return userWishlist;
};

const addToCartFromWishlist = async (userId, productId, shouldRemove = false) => {
  // Add product to cart
  const cart = await addToCart(userId, productId, 1);
  
  // Optionally remove from wishlist
  if (shouldRemove) {
    await removeFromWishlist(userId, productId);
  }
  
  return cart;
};

const addAllToCart = async (userId, shouldRemove = false) => {
  const wishlists = await readData('wishlists.json');
  const userWishlist = wishlists.find(w => w.userId === userId);
  
  if (!userWishlist || !userWishlist.items || userWishlist.items.length === 0) {
    throw new Error('Wishlist is empty');
  }

  const results = {
    added: [],
    failed: []
  };

  // Add each product to cart
  for (const productId of userWishlist.items) {
    try {
      const product = await getProductById(productId);
      // Only add if in stock
      if (product.stock && product.stock > 0) {
        await addToCart(userId, productId, 1);
        results.added.push(productId);
      } else {
        results.failed.push({ productId, reason: 'Out of stock' });
      }
    } catch (error) {
      results.failed.push({ productId, reason: error.message });
    }
  }

  // Optionally remove all from wishlist
  if (shouldRemove) {
    await removeAllFromWishlist(userId);
  }

  return results;
};

const getAllWishlists = async () => {
  const wishlists = await readData('wishlists.json');
  let users = [];
  
  try {
    users = await readData('users.json');
  } catch (error) {
    console.error('Error reading users:', error);
  }
  
  // Get user info for each wishlist
  const wishlistsWithUserInfo = wishlists.map(wishlist => {
    const user = users.find(u => u.id === wishlist.userId);
    return {
      ...wishlist,
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email
      } : null,
      itemCount: wishlist.items ? wishlist.items.length : 0
    };
  });
  
  return wishlistsWithUserInfo;
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
