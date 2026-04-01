# Akun Test untuk Aplikasi Zenla Mart

## 📝 Akun Test yang Tersedia

Berikut adalah akun-akun test yang bisa digunakan untuk testing aplikasi:

### 1. Test User 1
- **Email**: `test@test.com`
- **Password**: `test123`
- **Name**: Test User 1
- **Phone**: 081234567890
- **Status**: Verified ✅

### 2. John Doe
- **Email**: `john@example.com`
- **Password**: `password123`
- **Name**: John Doe
- **Phone**: 081234567891
- **Status**: Verified ✅

### 3. Jane Smith
- **Email**: `jane@example.com`
- **Password**: `password123`
- **Name**: Jane Smith
- **Phone**: 081234567892
- **Status**: Verified ✅

---

## 🚀 Cara Membuat Akun Test Baru

### Opsi 1: Membuat Akun Test Default (3 akun sekaligus)
```bash
cd server
node scripts/createTestUser.js
```

### Opsi 2: Membuat Akun Test Custom
```bash
cd server
node scripts/createTestUser.js "Nama User" email@example.com password123 081234567890 true
```

**Parameter:**
- `name` - Nama user (required)
- `email` - Email user (required)
- `password` - Password user (required)
- `phone` - Nomor telepon (optional, default: 081234567890)
- `isVerified` - Status verified (optional, default: true)

**Contoh:**
```bash
node scripts/createTestUser.js "User Baru" user@test.com test123 081234567893 true
```

---

## 🔐 Cara Login

1. Buka aplikasi client di browser
2. Navigasi ke halaman `/login`
3. Masukkan email dan password dari salah satu akun test di atas
4. Klik tombol "Login"

---

## 📋 Testing Add to Cart Feature

Untuk testing fitur "Add to Cart" dengan authentication:

1. **Test Case 1: User Belum Login**
   - Buka halaman produk
   - Klik tombol "Add to Cart"
   - ✅ Harus redirect ke `/login`
   - Setelah login, harus redirect ke `/cart`

2. **Test Case 2: User Sudah Login**
   - Login terlebih dahulu menggunakan salah satu akun test
   - Buka halaman produk
   - Klik tombol "Add to Cart"
   - ✅ Produk harus ditambahkan ke cart
   - ✅ Harus redirect ke `/cart`

---

## 🛠️ Script yang Tersedia

- `scripts/createTestUser.js` - Membuat akun user test
- `scripts/createAdmin.js` - Membuat akun admin
- `scripts/resetAdminPassword.js` - Reset password admin
- `scripts/listAdmins.js` - List semua admin

---

## ⚠️ Catatan

- Semua akun test sudah dalam status **Verified** (tidak perlu verifikasi OTP)
- Password disimpan dalam bentuk hash (bcrypt)
- Akun test hanya untuk development/testing, jangan gunakan di production
- Jika email sudah terdaftar, script akan melewati dan tidak membuat duplikat

---

## 📞 Support

Jika ada masalah dengan akun test, silakan:
1. Cek file `server/data/users.json`
2. Atau jalankan ulang script `createTestUser.js`
