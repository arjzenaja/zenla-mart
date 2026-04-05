const prisma = require('./prisma');
const bcrypt = require('bcryptjs');

const initializeData = async () => {
  try {
    // Check if any admin exists
    const adminCount = await prisma.user.count({
      where: { role: 'admin' }
    });

    if (adminCount === 0) {
      console.log('ℹ️ No admin account found. Creating default admin...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await prisma.user.create({
        data: {
          name: 'Admin',
          email: 'admin@zenlamart.com',
          password: hashedPassword,
          role: 'admin',
          phone: '081234567890',
          isVerified: true
        }
      });
      
      console.log('✅ Default admin user created: admin@zenlamart.com / admin123');
    }

    console.log('✅ Database connection verified and initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    console.log('⚠️ Please ensure DATABASE_URL is correctly set in your .env file.');
    // Don't throw error here to allow server to start even if DB is not ready yet
    // But it's better to log it clearly.
  }
};

module.exports = { initializeData };
