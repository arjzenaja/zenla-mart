# Setup Admin Panel - Koneksi ke Server

**Catatan Penting:** Semua API berada di folder `server`. File `admin/src/lib/api.js` hanya utility untuk memanggil API yang ada di server, bukan membuat API baru.

## 1. Setup Environment Variables

Buat file `.env.local` di folder `admin` dengan isi berikut:

```env
# API Configuration - mengarah ke server API
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## 2. Pastikan Server Berjalan

**Server API harus berjalan terlebih dahulu** di port 5000. Jalankan:

```bash
cd server
npm install
npm start
```

Server akan berjalan di `http://localhost:5000` dan menyediakan semua endpoint API.

## 3. Menjalankan Admin Panel

```bash
cd admin
npm install
npm run dev
```

Admin panel akan berjalan di `http://localhost:3001` dan akan memanggil API dari server.

## 4. Menggunakan API di Komponen

Import API functions dari `src/lib/api.js`:

```javascript
'use client'
import { useEffect, useState } from 'react'
import { productsAPI } from '@/lib/api'

export default function ProductsComponent() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getAll()
        setProducts(response.data || response)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching products:', error)
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // ... rest of component
}
```

## API Functions yang Tersedia

- `authAPI` - Login, Register, Verify, dll
- `usersAPI` - CRUD Users
- `productsAPI` - CRUD Products
- `categoriesAPI` - CRUD Categories
- `ordersAPI` - CRUD Orders
- `bannersAPI` - CRUD Banners
- `slidesAPI` - CRUD Slides
- `dashboardAPI` - Dashboard stats dan sales
- `uploadAPI` - Upload files

## Authentication

Token akan otomatis disimpan di localStorage setelah login dan akan dikirim di header Authorization untuk setiap request.
