# 🚀 Cara Menjalankan Server

## Quick Start

### 1. Install Dependencies (jika belum)
```bash
cd server
npm install
```

### 2. Buat File .env (jika belum ada)
Copy `env-example.txt` menjadi `.env`:
```bash
# Windows PowerShell
Copy-Item env-example.txt .env

# Atau manual copy isi env-example.txt ke .env
```

### 3. Jalankan Server

**Development Mode (dengan auto-reload):**
```bash
cd server
npm run dev
```

**Production Mode:**
```bash
cd server
npm start
```

### 4. Verifikasi Server Berjalan

Server akan menampilkan:
```
🚀 Server running on port 5000
📦 Environment: development
🌐 API URL: http://localhost:5000
```

### 5. Test Endpoint

Buka browser dan akses:
- Health check: `http://localhost:5000/health`
- Harus menampilkan: `{"status":"OK","message":"Server is running"}`

---

## ⚠️ Troubleshooting

### Port 5000 sudah digunakan?
1. Cek aplikasi lain yang menggunakan port 5000
2. Atau ubah port di file `.env`:
   ```
   PORT=5001
   ```

### Error: "Cannot find module"
```bash
cd server
npm install
```

### Error: "Failed to initialize data"
- Pastikan folder `server/data` ada
- Pastikan file `.env` sudah dibuat

---

## 📋 Checklist Sebelum Login Admin

- [ ] Server berjalan di port 5000
- [ ] Health check berhasil: `http://localhost:5000/health`
- [ ] File `.env` sudah dibuat
- [ ] Dependencies sudah diinstall (`npm install`)
