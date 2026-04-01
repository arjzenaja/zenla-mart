const { readData, writeData, generateId } = require('../utils/dataHelper.util');
const { getProductById } = require('./product.service');

const getUserCart = async (userId) => {
  const carts = await readData('carts.json');
  const userCart = carts.find(c => c.userId === userId);
  
  if (!userCart) {
    return { items: [], total: 0 };
  }

  // Calculate total
  let total = 0;
  for (const item of userCart.items) {
    try {
      const product = await getProductById(item.productId);
      let price = product.price;
      
      if (item.variantId && product.variants) {
        const variant = product.variants.find(v => v.id === item.variantId);
        if (variant && variant.price) {
          price = variant.price;
        }
      }
      
      total += price * item.quantity;
    } catch (error) {
      // Product not found, skip
    }
  }

  return {
    items: userCart.items,
    total
  };
};

const addToCart = async (userId, productId, quantity = 1, variantId = null) => {
  const carts = await readData('carts.json');
  let userCart = carts.find(c => c.userId === userId);
  
  // Verify product exists and get latest stock
  const product = await getProductById(productId);

  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  // Get stock for variant or product
  let targetStock = product.stock;
  if (variantId && product.variants) {
    const variant = product.variants.find(v => v.id === variantId);
    if (!variant) throw new Error('Variant not found');
    targetStock = variant.stock;
  }

  const hasStock = typeof targetStock === 'number' && targetStock >= 0;

  // Jika qty melebihi stok, batasi ke stok maksimum tanpa melempar error
  if (hasStock && quantity > targetStock) {
    quantity = targetStock;
  }
  
  if (!userCart) {
    userCart = {
      id: generateId(),
      userId,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    carts.push(userCart);
  }

  // Check if product with same variant already in cart
  const existingItemIndex = userCart.items.findIndex(item => 
    item.productId === productId && item.variantId === variantId
  );
  
  if (existingItemIndex !== -1) {
    const currentQty = userCart.items[existingItemIndex].quantity || 0;
    let newQty = currentQty + quantity;

    if (hasStock && newQty > targetStock) {
      newQty = targetStock;
    }

    userCart.items[existingItemIndex].quantity = newQty;
  } else {
    userCart.items.push({
      productId,
      variantId,
      quantity
    });
  }

  userCart.updatedAt = new Date().toISOString();
  
  await writeData('carts.json', carts);
  
  return userCart;
};

const updateCartItem = async (userId, productId, quantity, variantId = null) => {
  const carts = await readData('carts.json');
  const userCart = carts.find(c => c.userId === userId);
  
  if (!userCart) {
    throw new Error('Cart not found');
  }

  const itemIndex = userCart.items.findIndex(item => 
    item.productId === productId && item.variantId === variantId
  );
  
  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }

  if (quantity <= 0) {
    userCart.items.splice(itemIndex, 1);
  } else {
    // Validate against stock dan batasi ke stok maksimum tanpa melempar error
    const product = await getProductById(productId);
    
    let targetStock = product.stock;
    if (variantId && product.variants) {
      const variant = product.variants.find(v => v.id === variantId);
      if (variant) targetStock = variant.stock;
    }

    const hasStock = typeof targetStock === 'number' && targetStock >= 0;

    let newQty = quantity;
    if (hasStock && newQty > targetStock) {
      newQty = targetStock;
    }

    userCart.items[itemIndex].quantity = newQty;
  }

  userCart.updatedAt = new Date().toISOString();
  
  await writeData('carts.json', carts);
  
  return userCart;
};

const removeFromCart = async (userId, productId, variantId = null) => {
  const carts = await readData('carts.json');
  const userCart = carts.find(c => c.userId === userId);
  
  if (!userCart) {
    throw new Error('Cart not found');
  }

  const itemIndex = userCart.items.findIndex(item => 
    item.productId === productId && item.variantId === variantId
  );
  
  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }

  userCart.items.splice(itemIndex, 1);
  userCart.updatedAt = new Date().toISOString();
  
  await writeData('carts.json', carts);
  
  return userCart;
};

const clearCart = async (userId) => {
  const carts = await readData('carts.json');
  const userCart = carts.find(c => c.userId === userId);
  
  if (!userCart) {
    return true;
  }

  userCart.items = [];
  userCart.updatedAt = new Date().toISOString();
  
  await writeData('carts.json', carts);
  
  return true;
};

module.exports = {
  getUserCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
