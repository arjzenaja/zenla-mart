/**
 * Script untuk membuat akun user test baru
 * Usage: node scripts/createTestUser.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { readData, writeData, generateId } = require('../utils/dataHelper.util');

const createTestUser = async (name, email, password, phone = '081234567890', isVerified = true) => {
  try {
    const users = await readData('users.json');
    
    // Check if email already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      console.log(`❌ Email ${email} sudah terdaftar!`);
      if (existingUser.role === 'user') {
        console.log(`✅ Akun user sudah ada dengan email: ${email}`);
        console.log(`   Password: (gunakan password yang sudah ada atau reset)`);
      }
      return null;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = {
      id: generateId(),
      name: name,
      email: email,
      password: hashedPassword,
      role: 'user', // User biasa, bukan admin
      phone: phone,
      isVerified: isVerified, // Default verified untuk test user
      otp: null,
      otpExpires: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeData('users.json', users);

    console.log('\n✅ ============================================');
    console.log('✅ User test berhasil dibuat!');
    console.log('✅ ============================================');
    console.log(`📧 Email      : ${email}`);
    console.log(`🔑 Password   : ${password}`);
    console.log(`👤 Name       : ${name}`);
    console.log(`📱 Phone      : ${phone}`);
    console.log(`✅ Verified   : ${isVerified ? 'Yes' : 'No'}`);
    console.log('✅ ============================================\n');

    return newUser;
  } catch (error) {
    console.error('❌ Error creating user:', error);
    throw error;
  }
};

// Create multiple test users at once
const createDefaultTestUsers = async () => {
  console.log('\n🚀 Membuat akun test default...\n');
  
  const testUsers = [
    {
      name: 'Test User 1',
      email: 'test@test.com',
      password: 'test123',
      phone: '081234567890',
      isVerified: true
    },
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      phone: '081234567891',
      isVerified: true
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      phone: '081234567892',
      isVerified: true
    }
  ];

  let createdCount = 0;
  let skippedCount = 0;

  for (const user of testUsers) {
    const result = await createTestUser(
      user.name,
      user.email,
      user.password,
      user.phone,
      user.isVerified
    );
    
    if (result) {
      createdCount++;
    } else {
      skippedCount++;
    }
  }

  console.log('\n📊 ============================================');
  console.log(`✅ Total dibuat: ${createdCount}`);
  console.log(`⏭️  Total dilewati: ${skippedCount}`);
  console.log('📊 ============================================\n');

  console.log('📝 Akun Test yang Tersedia:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  testUsers.forEach((user, index) => {
    console.log(`\n${index + 1}. ${user.name}`);
    console.log(`   Email    : ${user.email}`);
    console.log(`   Password : ${user.password}`);
  });
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

// Run script
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Jika tidak ada argumen, buat default test users
  if (args.length === 0) {
    createDefaultTestUsers()
      .then(() => {
        console.log('✅ Selesai!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
      });
  }
  // Jika ada argumen, buat user custom
  else if (args.length >= 3) {
    const [name, email, password, phone, isVerified] = args;
    
    createTestUser(
      name, 
      email, 
      password, 
      phone || '081234567890',
      isVerified !== 'false'
    )
      .then(() => {
        console.log('✅ Selesai!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
      });
  } else {
    console.log('\n📝 Usage:');
    console.log('   node scripts/createTestUser.js');
    console.log('   (Membuat 3 akun test default)\n');
    console.log('   ATAU\n');
    console.log('   node scripts/createTestUser.js <name> <email> <password> [phone] [isVerified]');
    console.log('\n📝 Contoh:');
    console.log('   node scripts/createTestUser.js "User Test" user@test.com test123 081234567890 true\n');
    process.exit(1);
  }
}

module.exports = { createTestUser, createDefaultTestUsers };
