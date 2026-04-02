# 🍽️ Restaurant Ordering System — Backend

REST API for the University Restaurant Ordering System built with Node.js, Express, and MongoDB.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Authentication](#-authentication)
- [User Roles](#-user-roles)
- [Database Collections](#-database-collections)
- [Team & Task Division](#-team--task-division)
- [Contributing](#-contributing)

---

## 📖 Overview

This is the backend API for a university-based food ordering system. It handles:

- Student registration and login with Student ID validation
- JWT-based authentication with access and refresh tokens
- Menu management (admin only)
- Cart with per-item special instructions
- Order placement, tracking, and status lifecycle
- Favorites system
- Post-order reviews
- Admin dashboard with stats and student verification

> Newly registered students have `isVerified: false` by default.
> Admin must manually verify a student before they can place orders.

---

## 🛠️ Tech Stack

| Tool | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT auth |
| cookie-parser | Refresh token cookie |
| cors | Cross-origin requests |
| dotenv | Environment variables |

---

## 📁 Project Structure

```
backend/
│
├── config/
│   └── db.js                  # MongoDB connection
│
├── controllers/
│   ├── authController.js      # Register, login, logout, refresh, getMe
│   ├── menuController.js      # Menu CRUD
│   ├── cartController.js      # Cart management
│   ├── orderController.js     # Order placement & status
│   ├── favoriteController.js  # Favorites toggle
│   ├── reviewController.js    # Post-order reviews
│   └── adminController.js     # Admin stats & student verification
│
├── middleware/
│   ├── authMiddleware.js      # Verifies JWT access token
│   ├── adminMiddleware.js     # Restricts routes to admin only
│   └── studentVerify.js       # Validates Student ID format on register
│
├── models/
│   ├── User.js                # name, phone, studentId, password, role, isVerified
│   ├── MenuItem.js            # name, description, price, category, isAvailable
│   ├── Cart.js                # userId, items[]
│   ├── Order.js               # userId, items snapshot, totalPrice, status
│   ├── Favorite.js            # userId, menuItemId
│   └── Review.js              # userId, orderId, comment
│
├── routes/
│   ├── authRoutes.js          # /api/auth
│   ├── menuRoutes.js          # /api/menu
│   ├── cartRoutes.js          # /api/cart
│   ├── orderRoutes.js         # /api/orders
│   ├── favoriteRoutes.js      # /api/favorites
│   ├── reviewRoutes.js        # /api/reviews
│   └── adminRoutes.js         # /api/admin
│
├── utils/
│   ├── generateToken.js       # Generates access + refresh JWT tokens
│   └── studentIdValidator.js  # Regex validator for Student ID format
│
├── .env.example               # Environment variables template
├── .gitignore
├── app.js                     # Express app, middleware, routes
├── server.js                  # Server entry point
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [Git](https://git-scm.com/)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) free account

---

### 1. Clone the repository

```bash
git clone https://github.com/your-team/restaurant-ordering-system.git
cd restaurant-ordering-system/backend
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values — see [Environment Variables](#-environment-variables) below.

---

### 4. Start the server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Server runs on **http://localhost:5000**

---

### 5. Verify it is working

Open your browser or Postman and visit:

```
GET http://localhost:5000/
```

Expected response:

```json
{
  "message": "Backend server is running! Ready for Task 1–5",
  "status": "ok"
}
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
# ── Server ──────────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ── Database ────────────────────────────────────────────
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/restaurant-ordering

# ── JWT ─────────────────────────────────────────────────
JWT_SECRET=your_existing_secret

JWT_ACCESS_SECRET=generate_with_command_below
JWT_REFRESH_SECRET=generate_with_different_command_below
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# ── Student ID Validation ────────────────────────────────
# Regex must match your university Student ID format
# Example below matches: ETS1234/16
STUDENT_ID_REGEX=^ETS[0-9]{4}/[0-9]{2}$

# ── Frontend URL (for CORS) ──────────────────────────────
CLIENT_URL=http://localhost:5173
```

### Generate secure JWT secrets

Run this command twice — use the first output for `JWT_ACCESS_SECRET`, the second for `JWT_REFRESH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

> ⚠️ Never push your `.env` file to GitHub. It is already in `.gitignore`.

---

## 📡 API Reference

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new student |
| POST | `/api/auth/login` | Public | Login with phone + password |
| POST | `/api/auth/logout` | Public | Logout and clear cookie |
| POST | `/api/auth/refresh` | Public | Get new access token |
| GET | `/api/auth/me` | Student | Get current user info |

### Menu — `/api/menu`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/menu` | Public | Get all menu items |
| GET | `/api/menu/:id` | Public | Get single item |
| POST | `/api/menu` | Admin | Create menu item |
| PUT | `/api/menu/:id` | Admin | Edit menu item |
| DELETE | `/api/menu/:id` | Admin | Delete menu item |
| PATCH | `/api/menu/:id/availability` | Admin | Toggle availability |

### Cart — `/api/cart`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/cart` | Student | Get current cart |
| POST | `/api/cart` | Student | Add item to cart |
| PUT | `/api/cart/:itemId` | Student | Update quantity or instructions |
| DELETE | `/api/cart/:itemId` | Student | Remove single item |
| DELETE | `/api/cart` | Student | Clear entire cart |

### Orders — `/api/orders`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | Student (verified) | Place order from cart |
| GET | `/api/orders/my` | Student | Get own order history |
| GET | `/api/orders` | Admin | Get all orders |
| PATCH | `/api/orders/:id/status` | Admin | Update order status |

### Favorites — `/api/favorites`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/favorites` | Student | Get all favorites |
| POST | `/api/favorites/:menuItemId` | Student | Toggle favorite on/off |
| DELETE | `/api/favorites/:menuItemId` | Student | Remove favorite |

### Reviews — `/api/reviews`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/reviews` | Student | Submit review (completed orders only) |

### Admin — `/api/admin`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/orders` | Admin | All orders with full details |
| GET | `/api/admin/stats` | Admin | Most ordered items + daily volume |
| PATCH | `/api/admin/users/:id/verify` | Admin | Verify a student account |

---

## 🔑 Authentication

This API uses two tokens:

| Token | Lifetime | Where it lives |
|---|---|---|
| Access Token | 15 minutes | Response body — client stores in memory |
| Refresh Token | 7 days | httpOnly cookie — JS cannot read it |

### How to use the access token

Send it in the `Authorization` header on every protected request:

```
Authorization: Bearer <accessToken>
```

### When the access token expires

Call the refresh endpoint — it uses the cookie automatically:

```
POST /api/auth/refresh
```

You will get a new access token back.

---

## 👥 User Roles

### Student
- Self-registers via `/api/auth/register`
- Can browse menu freely without being verified
- Must be verified by admin before placing orders
- Cannot see other students' data
- Cannot access any admin routes

### Admin
- Created directly in the database (not via public registration)
- Full control over menu, orders, and student verification
- Access to analytics and dashboard data

---

## 🗃️ Database Collections

| Collection | Purpose |
|---|---|
| users | Students and admins |
| menuitems | Restaurant menu |
| carts | One cart per student, persistent |
| orders | Placed orders stored as snapshots |
| favorites | Saved menu items per student |
| reviews | Post-order text reviews |

---

## 👨‍💻 Team & Task Division

| Task | Scope | Status |
|---|---|---|
| Task 1 — Auth | User model, JWT, middleware, register, login | ✅ Done |
| Task 2 — Menu | MenuItem model, CRUD, admin protection | 🔄 In progress |
| Task 3 — Favorites | Favorite model, toggle, populate | 🔄 In progress |
| Task 4 — Cart & Orders | Cart, order placement, status lifecycle | 🔄 In progress |
| Task 5 — Reviews & Admin | Reviews, stats, student verification | 🔄 In progress |

---

## 🤝 Contributing

### Branch naming

```
task1/auth
task2/menu
task3/favorites
task4/cart-orders
task5/reviews-admin
```

### Workflow

```bash
# 1. Always pull latest before starting
git checkout main
git pull origin main

# 2. Create your task branch
git checkout -b task2/menu

# 3. Make your changes and commit
git add .
git commit -m "feat: add menu system with admin protection"

# 4. Push your branch
git push origin task2/menu

# 5. Open a Pull Request into main on GitHub
```

### Commit message format

```
feat: add new feature
fix: fix a bug
refactor: clean up code
docs: update README
```

---

> 🎓 GDG Capstone project — built with Node.js, Express, and MongoDB.
