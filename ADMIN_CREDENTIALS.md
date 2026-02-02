# 🔐 Admin Credentials

## Akun Admin yang Tersedia

### Akun 1 (Default)
- **Email**: `admin@zenlamart.com`
- **Password**: `admin123`
- **Name**: Admin
- **Status**: ✅ Verified

### Akun 2 (Baru)
- **Email**: `admin@admin.com`
- **Password**: `admin123`
- **Name**: Super Admin
- **Status**: ✅ Verified

---

## 📝 Cara Login

1. Buka halaman admin: `http://localhost:3001`
2. Akan otomatis redirect ke `/login`
3. Masukkan email dan password salah satu akun di atas
4. Klik "SIGN IN"
5. Setelah login berhasil, akan redirect ke dashboard

---

## 🛠️ Script Management Admin

### Melihat Daftar Admin
```bash
cd server
node scripts/listAdmins.js
```

### Membuat Admin Baru
```bash
cd server
node scripts/createAdmin.js "Nama Admin" "email@example.com" "password123" "081234567890"
```

### Reset Password Admin
```bash
cd server
node scripts/resetAdminPassword.js "email@example.com" "passwordBaru123"
```

---

## ⚠️ Catatan Penting

- Pastikan server berjalan di port 5000 sebelum login
- Admin harus memiliki role "admin" dan status "isVerified: true"
- Password disimpan dalam bentuk hash (bcrypt)
- Jangan commit file `users.json` ke repository public!

---

## 🔒 Keamanan

Untuk production, pastikan:
1. Ganti password default
2. Gunakan password yang kuat
3. Jangan share kredensial admin
4. Gunakan environment variables untuk sensitive data
