# 🚀 Quick Start Guide

## ⚠️ PENTING: Server Harus Berjalan Terlebih Dahulu!

**Sebelum menjalankan admin panel, pastikan server API sudah berjalan di port 5000:**

```bash
cd server
npm start
```

Server akan menampilkan:
```
🚀 Server running on port 5000
🌐 API URL: http://localhost:5000
```

**Atau gunakan script:**
- Windows: `START.bat` atau `START.ps1`
- Test endpoint: `node test-endpoint.js`

---

## Menjalankan Admin Panel

### 1. Development Mode
```bash
cd admin
npm run dev
```
Admin akan berjalan di: `http://localhost:3001`

### 2. Production Mode
```bash
cd admin
npm run build
npm start
```
Admin akan berjalan di: `http://localhost:3001`

---

## ⚠️ Port Configuration

Admin panel dikonfigurasi untuk berjalan di **port 3001** (bukan 3000).

Jika port 3001 sudah digunakan, Anda bisa:
1. Stop aplikasi yang menggunakan port 3001
2. Atau ubah port di `package.json`:
   ```json
   "dev": "next dev -p 3002"
   ```

---

## 🔐 Login Credentials

- **Email**: `admin@zenlamart.com`
- **Password**: `admin123`

atau

- **Email**: `admin@admin.com`
- **Password**: `admin123`

---

## 📋 Prerequisites

1. **Server harus berjalan** di port 5000:
   ```bash
   cd server
   npm start
   ```

2. **Node.js** terinstall (v18 atau lebih baru)

3. **Dependencies** sudah diinstall:
   ```bash
   cd admin
   npm install
   ```

---

## 🐛 Troubleshooting

### Error: "Port already in use"
- Cek aplikasi lain yang menggunakan port 3001
- Atau ubah port di `package.json`

### Error: "Route not found"
- Pastikan server berjalan di port 5000
- Cek file `admin/TROUBLESHOOTING.md`

### Error: "Cannot connect to server"
- Pastikan server API berjalan
- Test: `http://localhost:5000/health`
