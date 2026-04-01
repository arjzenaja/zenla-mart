# 🔒 Panduan Keamanan API

## Status Keamanan Saat Ini

### ✅ Yang Sudah Baik:
1. **Authentication & Authorization**
   - JWT token untuk authentication
   - Role-based access control (admin/user)
   - Protected routes untuk operasi admin

2. **CORS Configuration**
   - CORS sudah dikonfigurasi dengan origin whitelist
   - Credentials enabled untuk cookie support

3. **Basic Validation**
   - Validasi field required di controller
   - Error handling middleware

### ⚠️ Yang Perlu Diperbaiki:

#### 1. JWT Secret
**Masalah**: JWT_SECRET masih menggunakan default value
```javascript
// ❌ MASALAH: Default secret masih digunakan
const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
```

**Solusi**: 
- Pastikan `.env` file memiliki JWT_SECRET yang kuat
- Jangan commit `.env` ke git
- Gunakan random string yang panjang (minimal 32 karakter)

#### 2. Input Validation
**Masalah**: Validasi input masih sangat basic, tidak ada sanitization

**Rekomendasi**: Install dan gunakan `express-validator` atau `joi`

```bash
npm install express-validator
```

#### 3. Rate Limiting
**Masalah**: Tidak ada rate limiting, rentan terhadap brute force attack

**Rekomendasi**: Install `express-rate-limit`

```bash
npm install express-rate-limit
```

#### 4. Security Headers
**Masalah**: Tidak ada security headers (XSS protection, etc)

**Rekomendasi**: Install `helmet`

```bash
npm install helmet
```

#### 5. SQL Injection / NoSQL Injection
**Status**: ✅ Aman (menggunakan JSON files, bukan database)
**Catatan**: Saat migrasi ke database, pastikan menggunakan parameterized queries

#### 6. XSS Protection
**Status**: ⚠️ Perlu sanitization input
**Rekomendasi**: Sanitize semua user input sebelum disimpan

#### 7. File Upload Security
**Status**: ⚠️ Perlu validasi file type dan size
**Rekomendasi**: 
- Validasi file type (hanya image)
- Validasi file size (max 5MB)
- Rename file untuk menghindari path traversal
- Scan file untuk malware (optional)

## Rekomendasi Perbaikan Prioritas Tinggi

### 1. Environment Variables
Pastikan file `.env` memiliki:
```env
JWT_SECRET=<random_string_minimal_32_karakter>
NODE_ENV=production
PORT=5000
```

### 2. Input Validation
Tambahkan validasi yang lebih ketat untuk semua input user.

### 3. Rate Limiting
Implementasi rate limiting untuk:
- Login endpoint (max 5 attempts per 15 minutes)
- API endpoints umum (max 100 requests per 15 minutes)

### 4. Security Headers
Tambahkan helmet middleware untuk security headers.

## Checklist Keamanan untuk Production

- [ ] JWT_SECRET menggunakan random string yang kuat
- [ ] `.env` file tidak di-commit ke git
- [ ] Input validation untuk semua endpoints
- [ ] Rate limiting diimplementasikan
- [ ] Security headers dengan helmet
- [ ] File upload validation (type, size)
- [ ] HTTPS enabled (untuk production)
- [ ] Error messages tidak expose sensitive information
- [ ] Logging untuk security events
- [ ] Regular security updates untuk dependencies

## Testing Keamanan

### Manual Testing:
1. Coba akses admin endpoint tanpa token → harus return 401
2. Coba akses admin endpoint dengan user token (bukan admin) → harus return 403
3. Coba login dengan password salah berkali-kali → harus ada rate limiting
4. Coba upload file bukan image → harus ditolak
5. Coba input XSS payload → harus di-sanitize

### Tools untuk Testing:
- OWASP ZAP
- Burp Suite
- Postman Security Testing

## Catatan Penting

⚠️ **JANGAN PERNAH**:
- Commit `.env` file ke git
- Expose JWT_SECRET di frontend
- Trust user input tanpa validasi
- Return error messages yang detail di production
- Gunakan default credentials di production

✅ **SELALU**:
- Validasi semua input
- Gunakan HTTPS di production
- Update dependencies secara berkala
- Monitor error logs
- Backup data secara berkala
