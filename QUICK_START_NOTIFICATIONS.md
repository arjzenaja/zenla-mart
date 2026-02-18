# ⚡ Quick Start - Notification System

## Cepat Paham dalam 2 Menit

### 1️⃣ Import
```jsx
import { useNotification } from '@/utils/useNotification'
```

### 2️⃣ Use Hook
```jsx
const { showSuccess, showError, showWarning, showInfo, showLoading } = useNotification()
```

### 3️⃣ Use It
```jsx
// Success
showSuccess('Berhasil!')

// Error
showError('Gagal!')

// Warning
showWarning('Perhatian!')

// Info
showInfo('Informasi')

// Loading (long-running task)
const id = showLoading('Loading...')
// ... do something ...
removeNotification(id)
showSuccess('Selesai!')
```

---

## 📋 Cheat Sheet

```jsx
// Succcess notification
showSuccess('Produk ditambahkan ke keranjang')

// Error notification  
showError('Gagal menambahkan produk')

// Warning notification
showWarning('Email sudah terdaftar')

// Info notification
showInfo('Silakan login terlebih dahulu')

// Loading notification (manual dismiss)
const loadId = showLoading('Processing...')
removeNotification(loadId)

// Custom duration
showSuccess('Message', 5000)  // 5 seconds
```

---

## 🔥 Real Examples

### Add to Cart
```jsx
try {
  await cartAPI.addToCart(productId, quantity)
  showSuccess('Produk ditambahkan ke keranjang')
} catch (error) {
  showError(error.message || 'Gagal menambahkan produk')
}
```

### Form Submission
```jsx
const loadId = showLoading('Menyimpan...')
try {
  await api.submit(formData)
  removeNotification(loadId)
  showSuccess('Data berhasil disimpan!')
} catch (error) {
  removeNotification(loadId)
  showError(error.message)
}
```

### Validation
```jsx
if (!email) {
  showWarning('Email harus diisi')
  return
}

if (!isValidEmail(email)) {
  showError('Email tidak valid')
  return
}
```

---

## ✅ Already Integrated In:

- ✅ ProductItem (Add to Cart, Wishlist)
- ✅ ProductDetails (Reviews, Wishlist)
- ✅ Checkout (Order, Payment)
- ✅ My Account (Profile Update)
- ✅ My Orders (Load Orders)

---

## 📌 Remember

- No more `alert()`
- Max 3 concurrent notifications
- Auto-dismiss in 3.5 seconds
- Manual close with X button
- 5 types: Success, Error, Warning, Info, Loading

**That's it! You're ready to use it.** 🚀
