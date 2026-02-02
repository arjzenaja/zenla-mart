# 🔧 Troubleshooting Admin Login

## Error: "Route not found"

Jika Anda melihat error "Route not found" saat login, ikuti langkah berikut:

### 1. Pastikan Server Berjalan

Server harus berjalan di port 5000 sebelum login:

```bash
cd server
npm start
```

Atau jika menggunakan nodemon:

```bash
cd server
npm run dev
```

Server akan menampilkan:
```
🚀 Server running on port 5000
🌐 API URL: http://localhost:5000
```

### 2. Test Endpoint Server

Buka browser dan akses:
- Health check: `http://localhost:5000/health`
- Admin login endpoint: `http://localhost:5000/admin/login` (POST)

### 3. Cek Environment Variables

Pastikan file `.env.local` di folder `admin` ada dan berisi:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Atau jika tidak ada, akan menggunakan default `http://localhost:5000`.

### 4. Cek CORS Configuration

Pastikan di `server/app.js`, CORS sudah dikonfigurasi untuk admin:

```javascript
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000', 
    process.env.ADMIN_URL || 'http://localhost:3001'
  ],
  credentials: true
}));
```

### 5. Test dengan cURL

Test endpoint login dengan cURL:

```bash
curl -X POST http://localhost:5000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zenlamart.com","password":"admin123"}'
```

Jika berhasil, akan mengembalikan JSON dengan token.

### 6. Cek Browser Console

Buka Developer Tools (F12) di browser dan cek:
- **Console tab**: Lihat error JavaScript
- **Network tab**: Lihat request ke server, cek status code dan response

### 7. Common Issues

#### Issue: "Cannot connect to server"
**Solution**: Pastikan server berjalan di port 5000

#### Issue: "404 Not Found"
**Solution**: 
- Pastikan route `/admin/login` ada di `server/routes/adminAuth.routes.js`
- Pastikan route sudah di-mount di `server/app.js`: `app.use('/admin', adminAuthRoutes)`

#### Issue: "CORS error"
**Solution**: 
- Pastikan CORS sudah dikonfigurasi di server
- Pastikan `credentials: true` di fetch request

#### Issue: "Invalid email or password"
**Solution**: 
- Gunakan email dan password yang benar
- Pastikan user memiliki role "admin"
- Pastikan user sudah verified (`isVerified: true`)

### 8. Debug Mode

Tambahkan console.log di `admin/src/lib/api.js` untuk debugging:

```javascript
console.log('Login URL:', url);
console.log('Request body:', { email, password });
console.log('Response:', data);
```

---

## Akun Admin yang Tersedia

- **Email**: `admin@zenlamart.com`
- **Password**: `admin123`

atau

- **Email**: `admin@admin.com`
- **Password**: `admin123`

---

## Still Having Issues?

1. Restart server
2. Clear browser cache dan localStorage
3. Cek file `server/data/users.json` - pastikan ada user dengan role "admin"
4. Cek server logs untuk error messages
