# Add to Cart dengan Authentication Check

## Overview
Fitur ini memastikan bahwa hanya user yang sudah login yang bisa menambahkan produk ke cart. Jika user belum login, mereka akan diarahkan ke halaman login, dan setelah login berhasil akan otomatis diarahkan ke halaman cart.

## File yang Dibuat

### 1. `client/src/utils/auth.js`
Utility function untuk mengecek status autentikasi user:
- `isAuthenticated()` - Cek apakah user sudah login (berdasarkan token di localStorage)
- `getToken()` - Ambil token dari localStorage
- `clearAuth()` - Hapus token dari localStorage

### 2. `client/src/utils/cart.js`
Utility function untuk handle add to cart:
- `handleAddToCart(productId, quantity, router)` - Function utama untuk add to cart dengan auth check
- `getRedirectAfterLogin()` - Ambil redirect path yang disimpan
- `clearRedirectAfterLogin()` - Hapus redirect path

### 3. `client/src/utils/redirect.js`
Utility function untuk handle redirect setelah login:
- `handleRedirectAfterLogin(router, defaultPath)` - Redirect ke path yang disimpan atau default path

## Cara Penggunaan

### Di Komponen Produk

```jsx
import { handleAddToCart } from '@/utils/cart';
import { useRouter } from 'next/navigation';

const YourComponent = () => {
  const router = useRouter();

  return (
    <Button onClick={() => handleAddToCart(productId, quantity, router)}>
      Add to Cart
    </Button>
  );
};
```

### Di Halaman Login (Setelah Login Berhasil)

```jsx
import { handleRedirectAfterLogin } from '@/utils/redirect';
import { authAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      // Login user
      await authAPI.login(email, password);
      
      // Redirect ke cart (atau path yang disimpan) setelah login berhasil
      handleRedirectAfterLogin(router, '/');
    } catch (error) {
      alert(error.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Form fields */}
    </form>
  );
};
```

## Alur Kerja

1. **User menekan "Add to Cart"**
   - Function `handleAddToCart()` dipanggil
   
2. **Cek Autentikasi**
   - Jika **sudah login**: 
     - Produk ditambahkan ke cart via API
     - User diarahkan ke `/cart`
   - Jika **belum login**:
     - Path `/cart` disimpan di localStorage sebagai `redirectAfterLogin`
     - User diarahkan ke `/login`

3. **Setelah Login Berhasil**
   - Function `handleRedirectAfterLogin()` dipanggil
   - User otomatis diarahkan ke `/cart` (path yang disimpan)
   - Path yang disimpan dihapus dari localStorage

## Keamanan

- Tidak ada hardcode user
- Cek login berdasarkan token di localStorage
- Token dikirim otomatis via Authorization header di API calls
- Redirect path disimpan sementara dan dihapus setelah digunakan

## Catatan

- Function ini reusable dan bisa digunakan di komponen manapun
- Tidak menimbulkan infinite loop karena redirect path dihapus setelah digunakan
- Error handling sudah termasuk untuk network errors dan API errors
