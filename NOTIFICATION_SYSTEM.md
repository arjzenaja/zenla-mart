# 🎯 Sistem Notifikasi Modern - Dokumentasi Lengkap

## 📋 Overview

Sistem notifikasi modern telah diimplementasikan di seluruh aplikasi e-commerce Zenla Mart. Sistem ini menggantikan semua `alert()` browser dengan toast notifications yang:

- ✨ **Modern & Professional** - Desain elegan dengan animasi smooth
- 📱 **Responsive** - Menyesuaikan posisi desktop (top-right) dan mobile (top-center)
- ♻️ **Reusable** - Dapat digunakan di seluruh aplikasi
- 🎨 **5 Jenis Notifikasi** - Success, Error, Warning, Info, Loading
- ⏱️ **Auto Dismiss** - Otomatis hilang setelah 3-4 detik
- 🖱️ **Manual Close** - Tombol X untuk menutup langsung
- 📊 **Max 3 Concurrent** - Maksimal 3 notifikasi tampil bersamaan

---

## 🏗️ Arsitektur Sistem

```
NotificationProvider (Layout)
  ├── NotificationContext (Context)
  ├── UseNotification Hook (Custom Hook)
  └── Toast Component (UI)
```

### File-file yang Dibuat/Diubah:

| File | Status | Fungsi |
|------|--------|--------|
| `src/context/NotificationContext.jsx` | ✅ Baru | Global context untuk state notifikasi |
| `src/context/NotificationProvider.jsx` | ✅ Baru | Provider wrapper untuk app |
| `src/component/Toast.jsx` | ✅ Update | Modern toast UI component |
| `src/utils/useNotification.js` | ✅ Baru | Custom hook untuk akses notifikasi |
| `src/app/layout.js` | ✅ Update | Wrap dengan NotificationProvider |

---

## 🎨 5 Jenis Notifikasi

### 1️⃣ Success (Warna: Emerald)
```jsx
showSuccess('Produk ditambahkan ke keranjang')
```
- Icon: ✅ Check
- Warna: Hijau Emerald
- Durasi: 3500ms (auto-dismiss)
- Gunakan: Aksi berhasil

### 2️⃣ Error (Warna: Red)
```jsx
showError('Gagal menambahkan produk ke keranjang')
```
- Icon: ❌ X/Error
- Warna: Merah Red
- Durasi: 3500ms (auto-dismiss)
- Gunakan: Aksi gagal/error

### 3️⃣ Warning (Warna: Amber)
```jsx
showWarning('Rating & komentar harus diisi')
```
- Icon: ⚠️ Alert
- Warna: Kuning Amber
- Durasi: 3500ms (auto-dismiss)
- Gunakan: Validasi/peringatan

### 4️⃣ Info (Warna: Blue)
```jsx
showInfo('Silakan login terlebih dahulu')
```
- Icon: ℹ️ Info
- Warna: Biru Blue
- Durasi: 3500ms (auto-dismiss)
- Gunakan: Informasi umum

### 5️⃣ Loading (Warna: Orange)
```jsx
showLoading('Memproses pemesanan Anda...')
```
- Icon: ⏳ Spinner (animasi)
- Warna: Orange (Brand Color)
- Durasi: 0 (tidak auto-dismiss)
- Gunakan: Loading state, operasi long-running

---

## 📖 Cara Menggunakan

### Step 1: Import Hook
```jsx
import { useNotification } from '@/utils/useNotification'
```

### Step 2: Gunakan Hook di Komponen
```jsx
const MyComponent = () => {
  const { showSuccess, showError, showWarning, showInfo, showLoading } = useNotification()
  
  // ... rest of component
}
```

### Step 3: Panggil Notifikasi di Event Handler
```jsx
const handleSubmit = async () => {
  try {
    // Loading state
    const loadingId = showLoading('Memproses...')
    
    // Operasi async
    await api.submit(data)
    
    // Remove loading dan show success
    removeNotification(loadingId)
    showSuccess('Berhasil!')
    
  } catch (error) {
    showError(error.message)
  }
}
```

---

## 🎯 Implementasi di Halaman

### ✅ Sudah Terintegrasi:

#### 1. **ProductItem Component**
```jsx
// Add to Cart
showSuccess('Produk ditambahkan ke keranjang')
showError('Gagal menambahkan ke keranjang')

// Add to Wishlist
showSuccess('Produk ditambahkan ke wishlist')
showInfo('Silakan login terlebih dahulu')
```

#### 2. **Product Details Page** (`ProductDetails.jsx`)
```jsx
// Review Submission
showWarning('Rating & komentar harus diisi')
showWarning('Panjang ulasan minimal 5 karakter')
showSuccess('Review berhasil dikirim')

// Add to Wishlist
showSuccess('Produk ditambahkan ke wishlist')
showInfo('Silakan login terlebih dahulu')

// Out of Stock
showWarning('Produk ini sedang habis. Stok tidak tersedia.')
```

#### 3. **Checkout Page**
```jsx
// Validasi
showWarning('Silakan pilih alamat pengiriman')
showWarning('Silakan pilih metode pengiriman')
showWarning('Mohon konfirmasi pesanan dan alamat')

// Upload Bukti Transfer
showError('Format file harus gambar')
showError('Ukuran file maksimal 5MB')
showSuccess('Bukti transfer berhasil diunggah')

// Create Order
showLoading('Memproses pemesanan...')
showSuccess('Pesanan berhasil dibuat! Lanjut ke pembayaran...')
showError('Gagal membuat pesanan. Silakan coba lagi.')
```

#### 4. **My Account Page**
```jsx
// Profile Update
showInfo('Tidak ada perubahan untuk disimpan')
showSuccess('Profil berhasil diperbarui!')
showError('Gagal memperbarui profil')
```

#### 5. **My Orders Page**
```jsx
// Fetch Orders
showError('Gagal memuat pesanan. Silakan coba lagi.')
```

---

## 🔌 API Lengkap

```jsx
const {
  // Methods untuk menampilkan notifikasi
  showSuccess,      // Success notification
  showError,        // Error notification
  showWarning,      // Warning notification
  showInfo,         // Info notification
  showLoading,      // Loading notification (tidak auto-dismiss)
  
  // Methods advanced
  addNotification,  // Add custom notification
  removeNotification, // Remove notification by ID
  
  // State
  notifications     // Array of active notifications
} = useNotification()
```

### Signature Method:
```jsx
// Auto-dismiss notification
showSuccess(message)              // durasi default: 3500ms
showSuccess(message, duration)    // durasi custom

// Load notification (untuk long-running operation)
const loadingId = showLoading('Loading...')
// ... do something
removeNotification(loadingId)
showSuccess('Done!')
```

---

## 🎨 Customization

### Mengubah Durasi Auto-Dismiss Global

Edit file: `src/context/NotificationProvider.jsx`
```jsx
const newNotification = {
  id,
  type: 'info',
  duration: 3500,  // ← Ubah nilai ini (ms)
  ...notification,
}
```

### Mengubah Posisi Notifikasi

Edit file: `src/context/NotificationProvider.jsx`
```jsx
<div className="fixed top-4 right-4 md:top-6 md:right-6 z-50 flex flex-col gap-3">
  {/* ↑ Ubah className untuk mengubah posisi */}
</div>
```

Posisi tersedia:
- `top-4 right-4` = Top Right (Desktop)
- `top-4 left-4` = Top Left
- `bottom-4 right-4` = Bottom Right
- `md:top-6` = Responsive padding

### Mengubah Max Concurrent Notifications

Edit file: `src/context/NotificationProvider.jsx`
```jsx
setNotifications((prev) => {
  const updated = [...prev, newNotification]
  if (updated.length > 3) {  // ← Ubah angka ini
    return updated.slice(-3)
  }
  return updated
})
```

---

## 🎯 Best Practices

### ✅ DO:
```jsx
// 1. Gunakan message yang informatif
showError('Email sudah terdaftar. Gunakan email lain.')

// 2. Gunakan tipe notifikasi yang tepat
showWarning('Ada field yang belum diisi')  // bukan error
showError('Koneksi internet terputus')     // error

// 3. Remove loading saat selesai
const id = showLoading('Uploading...')
// ... upload process
removeNotification(id)

// 4. Gunakan durasi custom untuk info penting
showWarning('Email konfirmasi akan dikirim dalam 5 menit', 5000)
```

### ❌ DON'T:
```jsx
// 1. Tidak gunakan alert() lagi
alert('Success!')  // ❌ JANGAN

// 2. Tidak biarkan loading forever
showLoading('Processing...')  // ❌ Jangan, harus di-remove

// 3. Tidak gunakan untuk input validation yang simple
showError('Field required')  // ❌ Gunakan field error validation

// 4. Tidak tambah library baru untuk notifikasi
// ✅ Gunakan sistem ini saja
```

---

## 📱 Responsive Behavior

### Desktop (≥768px)
- Posisi: **Top Right**
- Padding: `right-4 md:right-6`
- Layout: Vertikal (stack)

### Mobile (<768px)
- Posisi: **Top Right** (sama)
- Padding: `right-4` (lebih kecil)
- Layout: Vertikal (stack)

Notifikasi otomatis menyesuaikan dengan lebar screen.

---

## 🐛 Troubleshooting

### Q: Notifikasi tidak muncul?
**A:** Pastikan komponen berada di dalam `<NotificationProvider>`. Provider sudah di-wrap di `layout.js`.

### Q: Notifikasi tidak hilang otomatis?
**A:** Jika menggunakan `showLoading()`, durasi default = 0 (not auto-dismiss). Gunakan `removeNotification(id)` untuk menghapusnya.

### Q: Notifikasi tampil lebih dari 3?
**A:** Sistem otomatis membatasi max 3 notifikasi. Notifikasi lama akan dihapus ketika notifikasi baru ditambahkan.

### Q: Warna notifikasi berbeda dengan theme?
**A:** Semua warna menggunakan default Tailwind/MUI. Untuk customize, edit di `src/component/Toast.jsx`.

---

## 🔄 Contoh Use Case Lengkap

### Scenario: User submit form dengan loading state

```jsx
import { useNotification } from '@/utils/useNotification'

const MyForm = () => {
  const { showSuccess, showError, showLoading, removeNotification } = useNotification()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      const loadingId = showLoading('Menyimpan data...')
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      removeNotification(loadingId)
      showSuccess('Data berhasil disimpan!')
      
    } catch (error) {
      showError(error.message || 'Gagal menyimpan data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={loading}>Submit</button>
    </form>
  )
}
```

---

## 📚 File Reference

| File | Lokasi | Deskripsi |
|------|--------|-----------|
| Context | `src/context/NotificationContext.jsx` | Define context object |
| Provider | `src/context/NotificationProvider.jsx` | Provide state & UI |
| Hook | `src/utils/useNotification.js` | Custom hook untuk akses |
| Component | `src/component/Toast.jsx` | Toast UI dengan 5 varian |
| Layout | `src/app/layout.js` | Wrap app dengan Provider |

---

## ✨ Highlight Fitur

🎯 **Modern Design**
- Gradient background
- Soft shadow dengan hover effect
- Rounded corners (border-radius 12px)
- Smooth animations (fade + slide)

🚀 **Performance**
- Tidak menggunakan library tambahan
- Lightweight (native React hooks)
- Efficient re-renders

🎨 **Consistent Branding**
- Warna sesuai brand palette
- Typography consistent
- Responsive di semua device

🔐 **Accessibility**
- Keyboard support (close button)
- ARIA labels
- High contrast colors

---

## 📞 Support

Jika ada pertanyaan atau mau menambah fitur notifikasi:
1. Edit di `src/component/Toast.jsx` untuk style changes
2. Edit di `src/context/NotificationProvider.jsx` untuk logic changes
3. Gunakan `useNotification()` hook di component mana pun

---

**✅ Sistem notifikasi siap digunakan di seluruh aplikasi!**
