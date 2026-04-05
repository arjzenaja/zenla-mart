const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DATA_DIR = path.join(__dirname, '../data');

const readJSON = (filename) => {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

async function migrate() {
  console.log('🚀 Starting migration from JSON to Prisma...');

  try {
    // 1. Migrate Categories
    const categories = readJSON('categories.json');
    console.log(`- Migrating ${categories.length} categories...`);
    for (const cat of categories) {
      await prisma.category.upsert({
        where: { id: cat.id },
        update: {},
        create: {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description || '',
          image: cat.image || '',
          isActive: cat.isActive !== undefined ? cat.isActive : true,
          createdAt: new Date(cat.createdAt || Date.now()),
          updatedAt: new Date(cat.updatedAt || Date.now())
        }
      });
    }

    // 2. Migrate Users
    const users = readJSON('users.json');
    const userIds = new Set(users.map(u => u.id)); // Simpan daftar ID user yang valid
    console.log(`- Migrating ${users.length} users...`);
    for (const u of users) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: {},
        create: {
          id: u.id,
          name: u.name,
          email: u.email,
          password: u.password,
          role: u.role || 'user',
          phone: u.phone || '',
          address: u.address || '',
          city: u.city || '',
          province: u.province || '',
          postalCode: u.postalCode || '',
          isVerified: u.isVerified || false,
          image: u.image || '',
          provider: u.provider || '',
          createdAt: new Date(u.createdAt || Date.now()),
          updatedAt: new Date(u.updatedAt || Date.now())
        }
      });
    }

    // 3. Migrate Products
    const products = readJSON('products.json');
    console.log(`- Migrating ${products.length} products...`);
    for (const p of products) {
      // Filter reviews to only include those with valid userIds
      const validReviews = (p.reviews || []).filter(r => userIds.has(r.userId));
      
      // Create product
      await prisma.product.upsert({
        where: { id: p.id },
        update: {},
        create: {
          id: p.id,
          name: p.name,
          description: p.description || '',
          brand: p.brand || '',
          variant: p.variant || '',
          composition: p.composition || '',
          allergyInfo: p.allergyInfo || '',
          expiryEstimate: p.expiryEstimate || '',
          shippingOrigin: p.shippingOrigin || '',
          shippingEstimate: p.shippingEstimate || '',
          price: parseFloat(p.price) || 0,
          stock: parseInt(p.stock) || 0,
          images: p.images || [],
          weight: parseFloat(p.weight) || 0,
          unit: p.unit || 'pcs',
          isActive: p.isActive !== undefined ? p.isActive : true,
          rating: parseFloat(p.rating) || 0,
          isFeatured: p.isFeatured || false,
          categoryId: p.categoryId,
          createdAt: new Date(p.createdAt || Date.now()),
          updatedAt: new Date(p.updatedAt || Date.now()),
          
          // Nested creation for variants
          variants: {
            create: (p.variants || []).map(v => ({
              id: v.id,
              name: v.name,
              price: parseFloat(v.price) || parseFloat(p.price) || 0,
              stock: parseInt(v.stock) || 0
            }))
          },
          
          // Nested creation for reviews
          reviews: {
            create: validReviews.map(r => ({
              id: r.id,
              userId: r.userId,
              name: r.name || 'Customer',
              rating: parseFloat(r.rating) || 0,
              comment: r.comment || '',
              createdAt: new Date(r.createdAt || Date.now())
            }))
          }
        }
      });
    }

    // 4. Migrate Addresses
    const addresses = readJSON('addresses.json');
    const validAddresses = addresses.filter(addr => userIds.has(addr.userId));
    console.log(`- Migrating ${validAddresses.length} addresses...`);
    for (const addr of validAddresses) {
      await prisma.address.upsert({
        where: { id: addr.id },
        update: {},
        create: {
          id: addr.id,
          userId: addr.userId,
          name: addr.name,
          phone: addr.phone,
          address: addr.address,
          city: addr.city,
          province: addr.province,
          postalCode: addr.postalCode,
          isDefault: addr.isDefault || false,
          label: addr.label || 'Home',
          createdAt: new Date(addr.createdAt || Date.now()),
          updatedAt: new Date(addr.updatedAt || Date.now())
        }
      });
    }

    // 5. Migrate Banners & Slides
    const banners = readJSON('banners.json');
    console.log(`- Migrating ${banners.length} banners...`);
    for (const b of banners) {
      await prisma.banner.upsert({
        where: { id: b.id },
        update: {},
        create: {
          id: b.id,
          title: b.title || '',
          image: b.image,
          link: b.link || '',
          isActive: b.isActive !== undefined ? b.isActive : true,
          order: b.order || 0,
          createdAt: new Date(b.createdAt || Date.now()),
          updatedAt: new Date(b.updatedAt || Date.now())
        }
      });
    }

    const slides = readJSON('slides.json');
    console.log(`- Migrating ${slides.length} slides...`);
    for (const s of slides) {
      await prisma.slide.upsert({
        where: { id: s.id },
        update: {},
        create: {
          id: s.id,
          title: s.title || '',
          subtitle: s.subtitle || '',
          image: s.image || '',
          link: s.link || '',
          cta_text: s.cta_text || '',
          isActive: s.isActive !== undefined ? s.isActive : true,
          order: s.order || 0,
          createdAt: new Date(s.createdAt || Date.now()),
          updatedAt: new Date(s.updatedAt || Date.now())
        }
      });
    }

    // 6. Migrate Carts
    const carts = readJSON('carts.json');
    const validCarts = carts.filter(c => userIds.has(c.userId));
    console.log(`- Migrating ${validCarts.length} carts...`);
    for (const c of validCarts) {
      await prisma.cart.upsert({
        where: { userId: c.userId },
        update: {},
        create: {
          id: c.id,
          userId: c.userId,
          createdAt: new Date(c.createdAt || Date.now()),
          updatedAt: new Date(c.updatedAt || Date.now()),
          items: {
            create: (c.items || []).map(item => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity
            }))
          }
        }
      });
    }

    // 7. Migrate Wishlists
    const wishlists = readJSON('wishlists.json');
    const validWishlists = wishlists.filter(w => userIds.has(w.userId));
    console.log(`- Migrating ${validWishlists.length} wishlists...`);
    for (const w of validWishlists) {
      await prisma.wishlist.upsert({
        where: { userId: w.userId },
        update: {},
        create: {
          id: w.id,
          userId: w.userId,
          createdAt: new Date(w.createdAt || Date.now()),
          updatedAt: new Date(w.updatedAt || Date.now()),
          items: {
            create: (w.items || []).map(productId => ({
              productId
            }))
          }
        }
      });
    }

    // 8. Migrate Orders
    const orders = readJSON('orders.json');
    console.log(`- Migrating ${orders.length} orders...`);
    for (const o of orders) {
      await prisma.order.upsert({
        where: { id: o.id },
        update: {},
        create: {
          id: o.id,
          userId: o.userId,
          orderNumber: o.orderNumber,
          subtotal: parseFloat(o.subtotal) || 0,
          shippingCost: parseFloat(o.shippingCost) || 0,
          total: parseFloat(o.total) || 0,
          status: o.status || 'pending',
          paymentMethod: o.paymentMethod || 'cash',
          paymentStatus: o.paymentStatus || 'pending',
          paymentProofUrl: o.paymentProofUrl || '',
          notes: o.notes || '',
          shippingMethod: o.shippingMethod || 'regular',
          shippingEstimate: o.shippingEstimate || '',
          addressName: o.address?.name || '',
          addressPhone: o.address?.phone || '',
          addressDetail: o.address?.address || '',
          addressCity: o.address?.city || '',
          addressProvince: o.address?.province || '',
          addressPostalCode: o.address?.postalCode || '',
          createdAt: new Date(o.createdAt || Date.now()),
          updatedAt: new Date(o.updatedAt || Date.now()),
          items: {
            create: (o.items || []).map(item => ({
              productId: item.productId,
              productName: item.productName || '',
              productImage: item.productImage || '',
              variantId: item.variantId,
              variantName: item.variantName,
              price: parseFloat(item.price) || 0,
              quantity: parseInt(item.quantity) || 0,
              total: parseFloat(item.total) || 0
            }))
          }
        }
      });
    }

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
