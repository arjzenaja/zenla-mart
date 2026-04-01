# 🔄 Cara Restart Server

## Masalah: "Server endpoint not found" atau 404

Jika Anda melihat error "Server endpoint not found" atau endpoint mengembalikan 404, kemungkinan server perlu di-restart.

## Langkah-langkah:

### 1. Stop Server yang Berjalan

**Windows PowerShell:**
```powershell
# Cari process Node.js yang menggunakan port 5000
Get-Process -Name node | Where-Object {$_.Path -like "*node*"}

# Atau kill semua process Node.js
Get-Process -Name node | Stop-Process -Force
```

**Atau tekan `Ctrl+C` di terminal tempat server berjalan**

### 2. Restart Server

```bash
cd server
npm start
```

Atau jika menggunakan nodemon:
```bash
cd server
npm run dev
```

### 3. Verifikasi Server Berjalan

Server harus menampilkan:
```
🚀 Server running on port 5000
📦 Environment: development
🌐 API URL: http://localhost:5000
```

### 4. Test Endpoint

Jalankan test script:
```bash
cd server
node test-endpoint.js
```

Atau test manual di browser:
- `http://localhost:5000/health` → Harus return `{"status":"OK","message":"Server is running"}`
- `http://localhost:5000/admin/login` → Harus return error 400/401 (bukan 404)

---

## ⚠️ Jika Masih 404 Setelah Restart

1. **Cek file `server/app.js`** - Pastikan line 56 ada: `app.use('/admin', adminAuthRoutes);`

2. **Cek file `server/routes/adminAuth.routes.js`** - Pastikan ada route `/login`

3. **Cek console server** - Lihat apakah ada error saat server start

4. **Clear cache Node.js** (jika perlu):
   ```bash
   cd server
   rm -rf node_modules/.cache
   npm start
   ```

---

## 💡 Tips

- Selalu restart server setelah mengubah file di folder `server/`
- Gunakan `npm run dev` (nodemon) untuk auto-restart saat development
- Cek port 5000 tidak digunakan aplikasi lain
