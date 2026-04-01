const { readData, writeData, ensureDataDir } = require('./dataHelper.util');
const bcrypt = require('bcryptjs');

const initializeData = async () => {
  try {
    // Initialize users.json
    const users = await readData('users.json');
    if (users.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser = {
        id: 'admin-' + Date.now(),
        name: 'Admin',
        email: 'admin@zenlamart.com',
        password: hashedPassword,
        role: 'admin',
        phone: '081234567890',
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await writeData('users.json', [adminUser]);
      console.log('✅ Admin user created: admin@zenlamart.com / admin123');
    }

    // Initialize other data files
    const dataFiles = [
      'products.json',
      'categories.json',
      'banners.json',
      'slides.json',
      'carts.json',
      'wishlists.json',
      'orders.json',
      'addresses.json'
    ];

    for (const file of dataFiles) {
      const data = await readData(file);
      if (data.length === 0) {
        await writeData(file, []);
      }
    }

    console.log('✅ Data files initialized');
  } catch (error) {
    console.error('Error initializing data:', error);
    throw error;
  }
};

module.exports = { initializeData };
