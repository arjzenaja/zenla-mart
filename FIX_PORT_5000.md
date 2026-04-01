# 🔧 Fix: Port 5000 Already in Use

## Error yang Terjadi
```
Error: listen EADDRINUSE: address already in use :::5000
```

## Solusi Cepat

### Opsi 1: Gunakan Script (Recommended)
```powershell
cd server
.\kill-port-5000.ps1
```

Atau double-click file `kill-port-5000.bat`

### Opsi 2: Manual Stop Process

**PowerShell:**
```powershell
# Cari process yang menggunakan port 5000
Get-NetTCPConnection -LocalPort 5000 | Select-Object OwningProcess

# Stop process (ganti PID dengan ID yang ditemukan)
Stop-Process -Id <PID> -Force
```

**Atau stop semua Node.js process:**
```powershell
Get-Process -Name node | Stop-Process -Force
```

### Opsi 3: Gunakan Port Lain

Edit file `server/.env`:
```
PORT=5001
```

Atau edit `server/server.js`:
```javascript
const PORT = process.env.PORT || 5001; // Ubah dari 5000 ke 5001
```

**Jangan lupa update URL di admin panel:**
- Edit `admin/src/lib/api.js`:
  ```javascript
  const ADMIN_API_URL = 'http://localhost:5001'; // Ubah port
  ```

---

## Verifikasi Port Bebas

```powershell
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
```

Jika tidak ada output, berarti port sudah bebas.

---

## Setelah Port Bebas

Jalankan server:
```bash
cd server
npm start
```

---

## Tips

1. **Gunakan nodemon untuk development** (auto-restart):
   ```bash
   npm run dev
   ```

2. **Selalu stop server dengan Ctrl+C** sebelum menutup terminal

3. **Cek process yang berjalan:**
   ```powershell
   Get-Process -Name node
   ```
