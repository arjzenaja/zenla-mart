# Zenla Mart Backend API

Backend API untuk aplikasi e-commerce Zenla Mart menggunakan Node.js dan Express.

## Fitur

- ✅ Authentication & Authorization (JWT)
- ✅ User Management
- ✅ Address Management
- ✅ Product Management (CRUD)
- ✅ Category Management
- ✅ Banner & Home Slides Management
- ✅ Shopping Cart
- ✅ Wishlist
- ✅ Orders & Checkout
- ✅ Dashboard Admin
- ✅ File Upload (Images)
- ✅ OTP Verification
- ✅ Password Reset

## Teknologi

- **Node.js** - Runtime environment
- **Express** - Web framework
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **multer** - File upload
- **dotenv** - Environment variables
- **JSON Files** - Temporary database (siap migrasi ke MongoDB)

## Instalasi

1. Masuk ke folder server:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Buat file `.env` (copy dari `.env.example`):
```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

4. Edit file `.env` dan sesuaikan konfigurasi:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
APP_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

## Menjalankan Server

### Development Mode (dengan nodemon):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

Server akan berjalan di `http://localhost:5000`

## Default Admin Account

Setelah pertama kali menjalankan server, akan dibuat admin user default:

- **Email**: `admin@zenlamart.com`
- **Password**: `admin123`

**⚠️ PENTING**: Ganti password admin setelah pertama kali login!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify email dengan OTP
- `POST /api/auth/forgot-password` - Request OTP untuk reset password
- `POST /api/auth/reset-password` - Reset password dengan OTP

### Users
- `GET /api/users/me` - Get current user profile (Auth required)
- `PUT /api/users/me` - Update current user profile (Auth required)
- `GET /api/users` - Get all users (Admin only)
- `PUT /api/users/:id/role` - Update user role (Admin only)

### Addresses
- `GET /api/addresses` - Get user addresses (Auth required)
- `GET /api/addresses/:id` - Get address by ID (Auth required)
- `POST /api/addresses` - Create new address (Auth required)
- `PUT /api/addresses/:id` - Update address (Auth required)
- `DELETE /api/addresses/:id` - Delete address (Auth required)

### Products
- `GET /api/products` - Get all products (with filters, search, pagination)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

**Query Parameters untuk GET /api/products:**
- `search` - Search by name/description
- `category` - Filter by categoryId
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `sortBy` - Sort by (price, name, createdAt)
- `sortOrder` - Sort order (asc, desc)
- `page` - Page number
- `limit` - Items per page

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (Admin only)
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

### Banners
- `GET /api/banners` - Get all active banners
- `GET /api/banners/:id` - Get banner by ID
- `POST /api/banners` - Create banner (Admin only)
- `PUT /api/banners/:id` - Update banner (Admin only)
- `DELETE /api/banners/:id` - Delete banner (Admin only)

### Home Slides
- `GET /api/slides` - Get all active slides
- `GET /api/slides/:id` - Get slide by ID
- `POST /api/slides` - Create slide (Admin only)
- `PUT /api/slides/:id` - Update slide (Admin only)
- `DELETE /api/slides/:id` - Delete slide (Admin only)

### Cart
- `GET /api/cart` - Get user cart (Auth required)
- `POST /api/cart` - Add item to cart (Auth required)
- `PUT /api/cart/:productId` - Update cart item quantity (Auth required)
- `DELETE /api/cart/:productId` - Remove item from cart (Auth required)

### Wishlist
- `GET /api/wishlist` - Get user wishlist (Auth required)
- `POST /api/wishlist` - Add item to wishlist (Auth required)
- `DELETE /api/wishlist/:productId` - Remove item from wishlist (Auth required)

### Orders
- `GET /api/orders/my-orders` - Get user orders (Auth required)
- `POST /api/orders/checkout` - Create order/checkout (Auth required)
- `GET /api/orders/:id` - Get order by ID (Auth required)
- `GET /api/orders` - Get all orders (Admin only)
- `PUT /api/orders/:id/status` - Update order status (Admin only)

### Dashboard (Admin)
- `GET /api/dashboard/stats` - Get dashboard statistics (Admin only)

### Upload
- `POST /api/upload/image` - Upload image (Auth required, max 5MB)

## Authentication

Semua endpoint yang memerlukan authentication harus menyertakan header:
```
Authorization: Bearer <token>
```

Token didapat dari endpoint `/api/auth/login` atau `/api/auth/verify`.

## Struktur Folder

```
server/
├── data/              # JSON data files (auto-generated)
├── uploads/           # Uploaded files
├── controllers/       # Request handlers
├── routes/            # API routes
├── services/          # Business logic
├── middlewares/       # Middleware functions
├── utils/             # Utility functions
├── app.js             # Express app configuration
├── server.js          # Server entry point
└── package.json       # Dependencies
```

## Data Storage

Saat ini menggunakan JSON files sebagai temporary database:
- `data/users.json` - User data
- `data/products.json` - Product data
- `data/categories.json` - Category data
- `data/banners.json` - Banner data
- `data/slides.json` - Home slide data
- `data/carts.json` - Cart data
- `data/wishlists.json` - Wishlist data
- `data/orders.json` - Order data
- `data/addresses.json` - Address data

**Note**: Struktur kode sudah siap untuk migrasi ke MongoDB. Hanya perlu mengganti service layer.

## Error Handling

API mengembalikan response dengan format:
```json
{
  "success": false,
  "message": "Error message"
}
```

Status code:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Menambahkan Fitur Baru

1. Buat service di `services/`
2. Buat controller di `controllers/`
3. Buat route di `routes/`
4. Register route di `app.js`

### Migrasi ke MongoDB

1. Install mongoose: `npm install mongoose`
2. Buat connection di `utils/db.util.js`
3. Ganti semua `readData` dan `writeData` di services dengan mongoose queries
4. Buat models di folder `models/`

## Troubleshooting

### Port sudah digunakan
Ubah PORT di file `.env`

### File upload error
Pastikan folder `uploads/` ada dan memiliki permission write

### Data tidak tersimpan
Pastikan folder `data/` ada dan memiliki permission write

## License

ISC
