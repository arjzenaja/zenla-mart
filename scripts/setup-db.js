const prisma = require('../utils/prisma');

async function setupDatabase() {
  console.log('🚀 Memulai pembuatan tabel di database online...');

  const queries = [
    `CREATE TABLE IF NOT EXISTS "User" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "email" TEXT NOT NULL UNIQUE, "password" TEXT, "role" TEXT NOT NULL DEFAULT 'user', "phone" TEXT DEFAULT '', "address" TEXT DEFAULT '', "city" TEXT DEFAULT '', "province" TEXT DEFAULT '', "postalCode" TEXT DEFAULT '', "isVerified" BOOLEAN NOT NULL DEFAULT false, "otp" TEXT, "otpExpires" TIMESTAMP(3), "otpVerified" BOOLEAN NOT NULL DEFAULT false, "otpAttempts" INTEGER NOT NULL DEFAULT 0, "image" TEXT, "provider" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL)`,
    
    `CREATE TABLE IF NOT EXISTS "Address" ("id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "name" TEXT NOT NULL, "phone" TEXT NOT NULL, "address" TEXT NOT NULL, "city" TEXT NOT NULL, "province" TEXT NOT NULL, "postalCode" TEXT NOT NULL, "isDefault" BOOLEAN NOT NULL DEFAULT false, "label" TEXT DEFAULT 'Home', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE)`,
    
    `CREATE TABLE IF NOT EXISTS "Category" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "slug" TEXT NOT NULL UNIQUE, "description" TEXT, "image" TEXT, "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL)`,
    
    `CREATE TABLE IF NOT EXISTS "Product" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "description" TEXT, "brand" TEXT DEFAULT '', "variant" TEXT DEFAULT '', "composition" TEXT DEFAULT '', "allergyInfo" TEXT DEFAULT '', "expiryEstimate" TEXT DEFAULT '', "shippingOrigin" TEXT DEFAULT '', "shippingEstimate" TEXT DEFAULT '', "price" DOUBLE PRECISION NOT NULL, "stock" INTEGER NOT NULL, "images" TEXT[], "weight" DOUBLE PRECISION NOT NULL DEFAULT 0, "unit" TEXT DEFAULT 'pcs', "isActive" BOOLEAN NOT NULL DEFAULT true, "rating" DOUBLE PRECISION NOT NULL DEFAULT 0, "isFeatured" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, "categoryId" TEXT NOT NULL, FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT)`,
    
    `CREATE TABLE IF NOT EXISTS "ProductVariant" ("id" TEXT PRIMARY KEY, "productId" TEXT NOT NULL, "name" TEXT NOT NULL, "price" DOUBLE PRECISION NOT NULL, "stock" INTEGER NOT NULL, FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE)`,
    
    `CREATE TABLE IF NOT EXISTS "ProductReview" ("id" TEXT PRIMARY KEY, "productId" TEXT NOT NULL, "userId" TEXT NOT NULL, "name" TEXT NOT NULL, "rating" DOUBLE PRECISION NOT NULL, "comment" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE, FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT)`,
    
    `CREATE TABLE IF NOT EXISTS "Cart" ("id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL UNIQUE, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE)`,
    
    `CREATE TABLE IF NOT EXISTS "CartItem" ("id" TEXT PRIMARY KEY, "cartId" TEXT NOT NULL, "productId" TEXT NOT NULL, "variantId" TEXT, "quantity" INTEGER NOT NULL DEFAULT 1, FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE, FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT)`,
    
    `CREATE TABLE IF NOT EXISTS "Order" ("id" TEXT PRIMARY KEY, "userId" TEXT, "orderNumber" TEXT NOT NULL UNIQUE, "subtotal" DOUBLE PRECISION NOT NULL, "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0, "total" DOUBLE PRECISION NOT NULL, "status" TEXT NOT NULL DEFAULT 'pending', "paymentMethod" TEXT NOT NULL DEFAULT 'cash', "paymentStatus" TEXT NOT NULL DEFAULT 'pending', "paymentProofUrl" TEXT DEFAULT '', "notes" TEXT DEFAULT '', "shippingMethod" TEXT DEFAULT 'regular', "shippingEstimate" TEXT DEFAULT '', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, "addressName" TEXT NOT NULL, "addressPhone" TEXT NOT NULL, "addressDetail" TEXT NOT NULL, "addressCity" TEXT NOT NULL, "addressProvince" TEXT NOT NULL, "addressPostalCode" TEXT NOT NULL, FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL)`,
    
    `CREATE TABLE IF NOT EXISTS "OrderItem" ("id" TEXT PRIMARY KEY, "orderId" TEXT NOT NULL, "productId" TEXT NOT NULL, "productName" TEXT NOT NULL, "productImage" TEXT, "variantId" TEXT, "variantName" TEXT, "price" DOUBLE PRECISION NOT NULL, "quantity" INTEGER NOT NULL, "total" DOUBLE PRECISION NOT NULL, FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE, FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT)`,
    
    `CREATE TABLE IF NOT EXISTS "Wishlist" ("id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL UNIQUE, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE)`,
    
    `CREATE TABLE IF NOT EXISTS "WishlistItem" ("id" TEXT PRIMARY KEY, "wishlistId" TEXT NOT NULL, "productId" TEXT NOT NULL, FOREIGN KEY ("wishlistId") REFERENCES "Wishlist"("id") ON DELETE CASCADE, FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT)`,
    
    `CREATE TABLE IF NOT EXISTS "Banner" ("id" TEXT PRIMARY KEY, "title" TEXT DEFAULT '', "image" TEXT NOT NULL, "link" TEXT DEFAULT '', "isActive" BOOLEAN NOT NULL DEFAULT true, "order" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL)`,
    
    `CREATE TABLE IF NOT EXISTS "Slide" ("id" TEXT PRIMARY KEY, "title" TEXT DEFAULT '', "subtitle" TEXT DEFAULT '', "image" TEXT NOT NULL, "link" TEXT DEFAULT '', "cta_text" TEXT DEFAULT '', "isActive" BOOLEAN NOT NULL DEFAULT true, "order" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL)`
  ];

  for (const query of queries) {
    try {
      await prisma.$executeRawUnsafe(query);
      console.log(`✅ Berhasil menjalankan perintah SQL.`);
    } catch (error) {
      console.error(`❌ Gagal menjalankan perintah SQL:`, error.message);
    }
  }

  console.log('✨ Pembuatan tabel selesai! Silakan jalankan node scripts/migrate-to-prisma.js');
  await prisma.$disconnect();
}

setupDatabase();
