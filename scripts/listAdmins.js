/**
 * Script untuk melihat daftar semua admin
 * Usage: node scripts/listAdmins.js
 */

require('dotenv').config();
const { readData } = require('../utils/dataHelper.util');

const listAdmins = async () => {
  try {
    const users = await readData('users.json');
    const admins = users.filter(user => user.role === 'admin');

    if (admins.length === 0) {
      console.log('\n❌ Tidak ada admin yang terdaftar.\n');
      return;
    }

    console.log('\n✅ ============================================');
    console.log(`✅ Daftar Admin (${admins.length} admin)`);
    console.log('✅ ============================================');
    
    admins.forEach((admin, index) => {
      console.log(`\n${index + 1}. ${admin.name}`);
      console.log(`   📧 Email      : ${admin.email}`);
      console.log(`   📱 Phone      : ${admin.phone || '-'}`);
      console.log(`   ✅ Verified   : ${admin.isVerified ? 'Yes' : 'No'}`);
      console.log(`   📅 Created    : ${new Date(admin.createdAt).toLocaleString('id-ID')}`);
    });

    console.log('\n✅ ============================================\n');
  } catch (error) {
    console.error('❌ Error listing admins:', error);
    throw error;
  }
};

// Run script
if (require.main === module) {
  listAdmins()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { listAdmins };
