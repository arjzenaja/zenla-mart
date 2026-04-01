/**
 * Script untuk reset password admin
 * Usage: node scripts/resetAdminPassword.js <email> <newPassword>
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { readData, writeData } = require('../utils/dataHelper.util');

const resetAdminPassword = async (email, newPassword) => {
  try {
    const users = await readData('users.json');
    const userIndex = users.findIndex(user => user.email === email);

    if (userIndex === -1) {
      console.log(`❌ User dengan email ${email} tidak ditemukan!`);
      return null;
    }

    const user = users[userIndex];

    if (user.role !== 'admin') {
      console.log(`❌ User ${email} bukan admin!`);
      return null;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    users[userIndex].password = hashedPassword;
    users[userIndex].updatedAt = new Date().toISOString();

    await writeData('users.json', users);

    console.log('\n✅ ============================================');
    console.log('✅ Password admin berhasil direset!');
    console.log('✅ ============================================');
    console.log(`📧 Email    : ${email}`);
    console.log(`🔑 Password : ${newPassword}`);
    console.log('✅ ============================================\n');

    return true;
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    throw error;
  }
};

// Run script
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('\n📝 Usage: node scripts/resetAdminPassword.js <email> <newPassword>');
    console.log('\n📝 Contoh:');
    console.log('   node scripts/resetAdminPassword.js admin@zenlamart.com admin123\n');
    process.exit(1);
  }

  const [email, newPassword] = args;
  
  resetAdminPassword(email, newPassword)
    .then(() => {
      console.log('✅ Selesai!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { resetAdminPassword };
