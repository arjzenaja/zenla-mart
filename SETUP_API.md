# 🚀 Setup Panduan API Mobile

## ✅ Yang Sudah Dikerjakan

Saya telah membuat sistem API terpusat untuk aplikasi mobile Anda dengan struktur berikut:

### 📁 File yang Dibuat/Diupdate:

1. **`src/config/api.js`** - Konfigurasi URL terpusat
2. **`src/services/api.js`** - Service API dengan fetch (alternatif)
3. **`src/api/client.js`** - Client axios yang sudah diupdate
4. **`API_USAGE.md`** - Panduan lengkap penggunaan

## 🔧 LANGKAH SETUP (PENTING!)

### 1️⃣ Cari IP Address Komputer Anda

**Windows:**
```bash
ipconfig
```
Cari "IPv4 Address" (contoh: 192.168.1.5)

**Mac/Linux:**
```bash
ifconfig
```
Cari "inet" (contoh: 192.168.1.5)

### 2️⃣ Update File Konfigurasi

Buka file: **`src/config/api.js`**

Ganti baris ini:
```javascript
const DEV_BASE_URL = "http://192.168.1.5:5000/api"; // GANTI DENGAN IP ANDA
```

Dengan IP Anda yang sebenarnya, contoh:
```javascript
const DEV_BASE_URL = "http://192.168.100.12:5000/api"; // IP Anda
```

### 3️⃣ Pastikan Backend Berjalan

Jalankan backend server:
```bash
cd server
npm start
```

Pastikan server berjalan di port 5000.

### 4️⃣ Test Koneksi dari HP/Emulator

Buka browser di HP Anda, akses:
```
http://[IP_ANDA]:5000/api
```

Contoh:
```
http://192.168.100.12:5000/api
```

**Jika tidak bisa diakses:**
- ✅ Pastikan HP dan Laptop dalam WiFi yang sama
- ✅ Matikan firewall sementara
- ✅ Cek IP sudah benar

## 📱 Cara Menggunakan API Service

### Existing Code (Sudah Bekerja)

Kode yang sudah ada di `ProfileScreen.js` dan `EditProfileScreen.js` **TIDAK PERLU DIUBAH**.

Mereka sudah menggunakan:
```javascript
import { getProfile, updateProfile } from '../api/userService';
```

Service ini sudah otomatis menggunakan konfigurasi baru.

### Contoh Penggunaan untuk Screen Baru

#### Login:
```javascript
import { login } from '../api/authService';

const handleLogin = async () => {
  try {
    const data = await login(email, password);
    navigation.navigate('Home');
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

#### Get Products:
```javascript
import client from '../api/client';

const fetchProducts = async () => {
  try {
    const response = await client.get('/products');
    setProducts(response.data.products);
  } catch (error) {
    Alert.alert('Error', 'Gagal memuat produk');
  }
};
```

#### Create Order:
```javascript
import client from '../api/client';

const createOrder = async () => {
  try {
    const response = await client.post('/orders', {
      items: cartItems,
      shippingAddress: address,
    });
    Alert.alert('Sukses', 'Pesanan berhasil dibuat!');
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

## 🎯 Keuntungan Sistem Baru

✅ **Satu tempat konfigurasi** - Ganti IP di satu file saja
✅ **Auto switch environment** - Dev/Production otomatis
✅ **Token otomatis** - Tidak perlu manual attach token
✅ **Timeout handling** - Request tidak hang selamanya
✅ **Debug logging** - Hanya muncul di development
✅ **Error handling** - Pesan error yang jelas

## 🐛 Debugging

### Lihat Request di Console

Saat development, setiap request akan log:
```
🌐 API Request: /users/me
🔑 Token found: YES
```

### Jika API Gagal

1. **Cek console** - Lihat error message
2. **Cek BASE_URL** - Pastikan IP benar
3. **Cek backend** - Pastikan server running
4. **Cek WiFi** - HP dan laptop harus satu jaringan
5. **Test di browser** - Buka URL di browser HP

### Common Errors:

**"Network request failed"**
- Backend tidak running
- IP salah
- Tidak satu WiFi

**"Request timeout"**
- Backend terlalu lambat
- Koneksi internet bermasalah

**"401 Unauthorized"**
- Token expired/invalid
- Logout dan login ulang

## 🚀 Production Deployment

Saat deploy ke production:

1. Update `src/config/api.js`:
```javascript
const PROD_BASE_URL = "https://yourdomain.com/api";
```

2. Build production:
```bash
npm run build
```

3. App otomatis pakai PROD_BASE_URL

## 📝 Catatan Penting

⚠️ **JANGAN:**
- Hardcode `localhost` atau IP di screen
- Fetch langsung tanpa service
- Simpan token di state saja
- Buat endpoint khusus mobile

✅ **LAKUKAN:**
- Gunakan service yang sudah ada
- Update IP di `config/api.js`
- Pakai try/catch untuk error handling
- Test di device fisik, bukan hanya emulator

## 🔍 File Structure

```
mobile/
├── src/
│   ├── config/
│   │   └── api.js          ← UPDATE IP DI SINI
│   ├── api/
│   │   ├── client.js       ← Axios client (updated)
│   │   ├── authService.js  ← Login/Register
│   │   ├── userService.js  ← Profile
│   │   ├── productService.js
│   │   └── orderService.js
│   ├── services/
│   │   └── api.js          ← Alternative fetch service
│   └── screens/
│       ├── ProfileScreen.js
│       └── EditProfileScreen.js
└── API_USAGE.md            ← Panduan lengkap
```

## ✅ Checklist Setup

- [ ] Cari IP address komputer
- [ ] Update `src/config/api.js` dengan IP yang benar
- [ ] Jalankan backend server
- [ ] Test akses dari browser HP
- [ ] Restart Metro bundler (Ctrl+C, npm start)
- [ ] Test login dari mobile app
- [ ] Cek console untuk debug logs

## 🆘 Butuh Bantuan?

Jika masih ada masalah:
1. Screenshot error message
2. Cek console logs
3. Pastikan backend endpoint sama dengan web
4. Test endpoint dengan Postman/Thunder Client dulu
