const prisma = require('../utils/prisma');

const getUserCart = async (userId) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              variants: true
            }
          }
        }
      }
    }
  });
  
  if (!cart) {
    return { items: [], total: 0 };
  }

  // Calculate total
  let total = 0;
  const items = cart.items.map(item => {
    let price = item.product.price;
    let variantName = null;
    
    if (item.variantId) {
      const variant = item.product.variants.find(v => v.id === item.variantId);
      if (variant) {
        price = variant.price;
        variantName = variant.name;
      }
    }
    
    total += price * item.quantity;
    
    return {
      ...item,
      productName: item.product.name,
      productImage: item.product.images[0] || '',
      price,
      variantName
    };
  });

  return {
    items,
    total
  };
};

const addToCart = async (userId, productId, quantity = 1, variantId = null) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true }
  });

  if (!product) {
    throw new Error('Product not found');
  }

  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  // Get stock
  let targetStock = product.stock;
  if (variantId) {
    const variant = product.variants.find(v => v.id === variantId);
    if (!variant) throw new Error('Variant not found');
    targetStock = variant.stock;
  }

  // Ensure cart exists
  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId }
  });

  // Check if item exists in cart
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      variantId
    }
  });

  if (existingItem) {
    let newQty = existingItem.quantity + quantity;
    if (newQty > targetStock) newQty = targetStock;

    return await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQty }
    });
  } else {
    let finalQty = quantity;
    if (finalQty > targetStock) finalQty = targetStock;

    return await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId,
        quantity: finalQty
      }
    });
  }
};

const updateCartItem = async (userId, productId, quantity, variantId = null) => {
  const cart = await prisma.cart.findUnique({
    where: { userId }
  });

  if (!cart) {
    throw new Error('Cart not found');
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      variantId
    }
  });

  if (!existingItem) {
    throw new Error('Item not found in cart');
  }

  if (quantity <= 0) {
    return await prisma.cartItem.delete({
      where: { id: existingItem.id }
    });
  } else {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true }
    });

    let targetStock = product.stock;
    if (variantId) {
      const variant = product.variants.find(v => v.id === variantId);
      if (variant) targetStock = variant.stock;
    }

    let finalQty = quantity;
    if (finalQty > targetStock) finalQty = targetStock;

    return await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: finalQty }
    });
  }
};

const removeFromCart = async (userId, productId, variantId = null) => {
  const cart = await prisma.cart.findUnique({
    where: { userId }
  });

  if (!cart) {
    throw new Error('Cart not found');
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      variantId
    }
  });

  if (!existingItem) {
    throw new Error('Item not found in cart');
  }

  return await prisma.cartItem.delete({
    where: { id: existingItem.id }
  });
};

const clearCart = async (userId) => {
  const cart = await prisma.cart.findUnique({
    where: { userId }
  });

  if (!cart) return true;

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id }
  });

  return true;
};

module.exports = {
  getUserCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
