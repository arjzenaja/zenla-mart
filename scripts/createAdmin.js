/**
 * Script untuk membuat akun admin baru
 * Usage: node scripts/createAdmin.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { readData, writeData, generateId } = require('../utils/dataHelper.util');

const createAdmin = async (name, email, password, phone = '081234567890') => {
  try {
    const users = await readData('users.json');
    
    // Check if email already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      console.log(`❌ Email ${email} sudah terdaftar!`);
      if (existingUser.role === 'admin') {
        console.log(`✅ Akun admin sudah ada dengan email: ${email}`);
        console.log(`   Untuk reset password, gunakan script resetAdminPassword.js`);
      }
      return null;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin user
    const adminUser = {
      id: generateId('admin'),
      name: name,
      email: email,
      password: hashedPassword,
      role: 'admin',
      phone: phone,
      isVerified: true, // Admin langsung verified
      otp: null,
      otpExpires: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(adminUser);
    await writeData('users.json', users);

    console.log('\n✅ ============================================');
    console.log('✅ Admin berhasil dibuat!');
    console.log('✅ ============================================');
    console.log(`📧 Email    : ${email}`);
    console.log(`🔑 Password : ${password}`);
    console.log(`👤 Name     : ${name}`);
    console.log(`📱 Phone    : ${phone}`);
    console.log('✅ ============================================\n');

    return adminUser;
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    throw error;
  }
};

// Run script
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('\n📝 Usage: node scripts/createAdmin.js <name> <email> <password> [phone]');
    console.log('\n📝 Contoh:');
    console.log('   node scripts/createAdmin.js "Admin User" admin@example.com admin123 081234567890\n');
    process.exit(1);
  }

  const [name, email, password, phone] = args;
  
  createAdmin(name, email, password, phone)
    .then(() => {
      console.log('✅ Selesai!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { createAdmin };
