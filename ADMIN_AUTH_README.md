# Sistem Login Admin - Dokumentasi

## 📋 Overview

Sistem login khusus untuk admin panel. Semua halaman admin **WAJIB** login terlebih dahulu. Hanya user dengan `role = "admin"` yang bisa mengakses.

## 🔐 Endpoints

### 1. POST `/admin/login`
Login admin dengan email dan password.

**Request Body:**
```json
{
  "email": "admin@zenlamart.com",
  "password": "admin123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "admin-xxx",
      "name": "Admin",
      "email": "admin@zenlamart.com",
      "role": "admin",
      "isVerified": true,
      "createdAt": "2026-02-01T04:31:27.576Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response Error (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Response Error (401) - Bukan Admin:**
```json
{
  "success": false,
  "message": "User is not an admin"
}
```

---

### 2. GET `/admin/me`
Validasi token dan return data admin saat ini.

**Headers Required:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "admin-xxx",
      "name": "Admin",
      "email": "admin@zenlamart.com",
      "role": "admin",
      "isVerified": true,
      "createdAt": "2026-02-01T04:31:27.576Z"
    }
  }
}
```

**Response Error (401) - Token tidak ada:**
```json
{
  "success": false,
  "message": "Authentication required. Please provide a token."
}
```

**Response Error (403) - Bukan Admin:**
```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

---

## 🛡️ Middleware

### 1. `authenticate` (auth.middleware.js)
- Validasi JWT token
- Extract user dari token
- Set `req.user` dengan data user

### 2. `requireAdmin` (admin.middleware.js)
- Cek apakah `req.user.role === "admin"`
- Return 403 jika bukan admin

---

## 🔄 Flow Login Admin

```
1. Admin buka halaman admin
   ↓
2. Frontend cek token di localStorage
   ↓
3. Jika token tidak ada:
   → Redirect ke /login
   ↓
4. Admin input email & password
   ↓
5. Frontend POST /admin/login
   ↓
6. Backend validasi:
   - Email exists?
   - Password correct?
   - Role = "admin"?
   - isVerified = true?
   ↓
7. Backend return JWT token
   ↓
8. Frontend simpan token ke localStorage
   ↓
9. Frontend redirect ke dashboard
   ↓
10. Setiap request ke /admin/*:
    - Attach token di header Authorization
    - Backend validasi token
    - Backend cek role = "admin"
    - Jika valid → akses diizinkan
    - Jika invalid → 401/403
```

---

## 🔒 Proteksi Route

Semua endpoint `/admin/*` (kecuali `/admin/login`) **WAJIB** menggunakan middleware:

```javascript
router.get('/me', authenticate, requireAdmin, getMe);
```

**Urutan Middleware:**
1. `authenticate` - Validasi JWT token
2. `requireAdmin` - Cek role admin

---

## 📝 Contoh Penggunaan di Frontend

### Login
```javascript
const response = await fetch('http://localhost:5000/admin/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@zenlamart.com',
    password: 'admin123'
  })
});

const data = await response.json();

if (data.success) {
  // Simpan token
  localStorage.setItem('token', data.data.token);
  // Redirect ke dashboard
  window.location.href = '/';
}
```

### Validasi Token
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:5000/admin/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();

if (data.success) {
  // Token valid, admin bisa akses
  console.log('Admin:', data.data.user);
} else {
  // Token invalid, redirect ke login
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

---

## 🚀 Cara Menjalankan

1. **Install dependencies:**
```bash
cd server
npm install
```

2. **Setup environment:**
Buat file `.env` dari `env-example.txt`:
```bash
# Windows
copy env-example.txt .env

# Linux/Mac
cp env-example.txt .env
```

3. **Jalankan server:**
```bash
npm start
# atau untuk development
npm run dev
```

Server akan berjalan di `http://localhost:5000`

---

## 👤 Default Admin Account

Default admin sudah ada di `data/users.json`:

- **Email:** `admin@zenlamart.com`
- **Password:** `admin123` (atau sesuai yang ada di database)
- **Role:** `admin`
- **Status:** `isVerified: true`

**Catatan:** Password sudah di-hash dengan bcrypt. Untuk membuat admin baru, gunakan endpoint register atau buat manual di `data/users.json` dengan password yang sudah di-hash.

---

## 📦 Struktur File

```
server/
├── controllers/
│   └── adminAuth.controller.js    # Controller untuk login & me
├── services/
│   └── adminAuth.service.js         # Business logic login admin
├── middlewares/
│   ├── auth.middleware.js          # Validasi JWT
│   └── admin.middleware.js          # Cek role admin
├── routes/
│   └── adminAuth.routes.js          # Route definitions
└── app.js                           # Register route /admin
```

---

## ⚠️ Catatan Penting

1. **Password di-hash** menggunakan bcrypt
2. **JWT token** expired time sesuai `JWT_EXPIRES_IN` di `.env` (default: 7d)
3. **Hanya admin verified** yang bisa login (`isVerified: true`)
4. **Token harus dikirim** di header `Authorization: Bearer <token>`
5. **Semua route `/admin/*`** (kecuali `/admin/login`) **WAJIB** protected

---

## 🧪 Testing

### Test Login
```bash
curl -X POST http://localhost:5000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zenlamart.com","password":"admin123"}'
```

### Test Get Me (dengan token)
```bash
curl -X GET http://localhost:5000/admin/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ✅ Checklist

- [x] POST /admin/login - Login admin
- [x] GET /admin/me - Validasi token & get admin data
- [x] Middleware authenticate - Validasi JWT
- [x] Middleware requireAdmin - Cek role admin
- [x] Proteksi semua route /admin/* (kecuali /admin/login)
- [x] Error handling untuk invalid token
- [x] Error handling untuk non-admin user
- [x] Password hashing dengan bcrypt
- [x] JWT token generation
