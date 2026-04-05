const prisma = require('../utils/prisma');

async function checkTables() {
  try {
    console.log('🔍 Mencoba mengecek daftar schema yang tersedia...');
    const result = await prisma.$queryRaw`SELECT schema_name FROM information_schema.schemata`;
    console.log('Schema yang ditemukan:', result);
    
    if (result.length === 0) {
      console.log('⚠️ Database masih kosong (0 tabel). Tolong pastikan "Save and Deploy" di dashboard sudah diklik.');
    } else {
      console.log('✅ ' + result.length + ' tabel terdeteksi. Siap untuk migrasi!');
    }
  } catch (error) {
    console.error('❌ Error saat mengecek database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
