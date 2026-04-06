# Zenla Mart Backend API

Backend API untuk aplikasi e-commerce Zenla Mart menggunakan Node.js, Express, Prisma, dan PostgreSQL.

## Fitur

- Authentication & Authorization (JWT)
- User Management
- Address Management
- Product Management (CRUD)
- Category Management
- Banner & Home Slides Management
- Shopping Cart
- Wishlist
- Orders & Checkout
- Dashboard Admin
- File Upload (Images)
- OTP Verification
- Password Reset

## Teknologi

- **Node.js** - Runtime environment
- **Express** - Web framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **Docker** - Database container
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **multer** - File upload

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) & Docker Compose

## Setup & Deployment

### 1. Clone & Install Dependencies

```bash
git clone <repo-url>
cd zenla-mart-server
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` sesuai kebutuhan. Jika menggunakan Docker database default, `DATABASE_URL` tidak perlu diubah.

### 3. Start Database (Docker)

```bash
docker compose up -d
```

Ini akan menjalankan PostgreSQL di port `5432` dengan konfigurasi:

| Variable            | Value          |
| ------------------- | -------------- |
| `POSTGRES_USER`     | `zenla`        |
| `POSTGRES_PASSWORD` | `zenla_secret` |
| `POSTGRES_DB`       | `zenla_mart`   |

Cek status container:

```bash
docker compose ps
```

### 4. Run Prisma Migrations

Development (buat & apply migration):

```bash
npx prisma migrate dev
```

Production (apply migration yang sudah ada):

```bash
npx prisma migrate deploy
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Start Server

Development (dengan auto-reload):

```bash
npm run dev
```

Production:

```bash
npm start
```

Server berjalan di `http://localhost:5000` (default).

## Docker Commands

| Command                      | Description                        |
| ---------------------------- | ---------------------------------- |
| `docker compose up -d`       | Start database container           |
| `docker compose down`        | Stop database container            |
| `docker compose down -v`     | Stop & hapus data volume           |
| `docker compose ps`          | Cek status container               |
| `docker compose logs postgres` | Lihat logs database              |

## Prisma Commands

| Command                      | Description                        |
| ---------------------------- | ---------------------------------- |
| `npx prisma migrate dev`     | Run migrations (development)       |
| `npx prisma migrate deploy`  | Run migrations (production)        |
| `npx prisma studio`          | Open Prisma Studio (DB GUI)        |
| `npx prisma generate`        | Regenerate Prisma Client           |
| `npx prisma db seed`         | Run database seed                  |

## Default Admin Account

Setelah pertama kali menjalankan server, akan dibuat admin user default:

- **Email**: `admin@zenlamart.com`
- **Password**: `admin123`

**PENTING**: Ganti password admin setelah pertama kali login!

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
- `POST /api/addresses` - Create new address (Auth required)
- `PUT /api/addresses/:id` - Update address (Auth required)
- `DELETE /api/addresses/:id` - Delete address (Auth required)

### Products
- `GET /api/products` - Get all products (with filters, search, pagination)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin only)
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

### Banners
- `GET /api/banners` - Get all active banners
- `POST /api/banners` - Create banner (Admin only)
- `PUT /api/banners/:id` - Update banner (Admin only)
- `DELETE /api/banners/:id` - Delete banner (Admin only)

### Home Slides
- `GET /api/slides` - Get all active slides
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
zenla-mart-server/
├── prisma/            # Prisma schema & migrations
├── uploads/           # Uploaded files
├── controllers/       # Request handlers
├── routes/            # API routes
├── services/          # Business logic
├── middlewares/        # Middleware functions
├── utils/             # Utility functions
├── docker-compose.yml # Docker config for PostgreSQL
├── app.js             # Express app configuration
├── server.js          # Server entry point
└── package.json       # Dependencies
```

## Troubleshooting

### Port 5432 sudah digunakan
Stop PostgreSQL lokal atau ubah port di `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"
```
Lalu update `DATABASE_URL` di `.env` ke port 5433.

### Prisma migration error
```bash
npx prisma migrate reset   # Reset database (HAPUS SEMUA DATA)
npx prisma migrate dev      # Apply ulang migrations
```

### Container tidak jalan
```bash
docker compose logs postgres   # Cek error logs
docker compose down -v         # Reset container & volume
docker compose up -d           # Start ulang
```

## License

ISC
