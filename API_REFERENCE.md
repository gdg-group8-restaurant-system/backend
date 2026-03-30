# Restaurant Ordering Backend API Reference

Use this format directly in Postman.

## Base URLs

- Local: `http://localhost:5000`
- Production example: `https://api.yourdomain.com`

## Standard Headers

- `Content-Type: application/json`
- Protected routes: `Authorization: Bearer <accessToken>`
- Admin routes: `Authorization: Bearer <adminToken>`

---

## Endpoints (HTTP)

```text
GET http://localhost:5000/

POST http://localhost:5000/api/auth/register
POST http://localhost:5000/api/auth/login
POST http://localhost:5000/api/auth/logout
POST http://localhost:5000/api/auth/refresh
GET http://localhost:5000/api/auth/me

GET http://localhost:5000/api/menu
GET http://localhost:5000/api/menu/65f1a0a4f7c0d8a2de0f0015
POST http://localhost:5000/api/menu
PUT http://localhost:5000/api/menu/65f1a0a4f7c0d8a2de0f0015
DELETE http://localhost:5000/api/menu/65f1a0a4f7c0d8a2de0f0015
PATCH http://localhost:5000/api/menu/65f1a0a4f7c0d8a2de0f0015/availability

GET http://localhost:5000/api/cart
POST http://localhost:5000/api/cart
PUT http://localhost:5000/api/cart/65f1a0a4f7c0d8a2de0f1015
DELETE http://localhost:5000/api/cart/65f1a0a4f7c0d8a2de0f1015

POST http://localhost:5000/api/orders
GET http://localhost:5000/api/orders/my
GET http://localhost:5000/api/orders
PATCH http://localhost:5000/api/orders/65f1a0a4f7c0d8a2de0f2015/status
```

## Endpoints (HTTPS)

```text
GET https://api.yourdomain.com/

POST https://api.yourdomain.com/api/auth/register
POST https://api.yourdomain.com/api/auth/login
POST https://api.yourdomain.com/api/auth/logout
POST https://api.yourdomain.com/api/auth/refresh
GET https://api.yourdomain.com/api/auth/me

GET https://api.yourdomain.com/api/menu
GET https://api.yourdomain.com/api/menu/65f1a0a4f7c0d8a2de0f0015
POST https://api.yourdomain.com/api/menu
PUT https://api.yourdomain.com/api/menu/65f1a0a4f7c0d8a2de0f0015
DELETE https://api.yourdomain.com/api/menu/65f1a0a4f7c0d8a2de0f0015
PATCH https://api.yourdomain.com/api/menu/65f1a0a4f7c0d8a2de0f0015/availability

GET https://api.yourdomain.com/api/cart
POST https://api.yourdomain.com/api/cart
PUT https://api.yourdomain.com/api/cart/65f1a0a4f7c0d8a2de0f1015
DELETE https://api.yourdomain.com/api/cart/65f1a0a4f7c0d8a2de0f1015

POST https://api.yourdomain.com/api/orders
GET https://api.yourdomain.com/api/orders/my
GET https://api.yourdomain.com/api/orders
PATCH https://api.yourdomain.com/api/orders/65f1a0a4f7c0d8a2de0f2015/status
```

---

## Request Bodies

### Register

```json
{
  "name": "Elsa",
  "phoneNumber": "989928298",
  "studentId": "ETS1234/15",
  "password": "secret123"
}
```

### Login

```json
{
  "phoneNumber": "989928298",
  "password": "secret123"
}
```

### Create Menu Item (Admin)

```json
{
  "name": "Burger",
  "description": "Cheese burger",
  "price": 180,
  "category": "Fast Food",
  "image": "",
  "isAvailable": true,
  "preparationTime": 15
}
```

### Update Menu Item (Admin)

```json
{
  "name": "Veg Burger",
  "price": 160,
  "preparationTime": 12,
  "isAvailable": true
}
```

### Toggle Menu Availability (Admin)

```json
{
  "isAvailable": false
}
```

### Add To Cart

```json
{
  "menuItemId": "65f1a0a4f7c0d8a2de0f0015",
  "quantity": 2,
  "specialInstructions": "Less spicy"
}
```

### Update Cart Item

```json
{
  "quantity": 3,
  "specialInstructions": "No onion"
}
```

### Update Order Status (Admin)

```json
{
  "status": "preparing"
}
```

Valid status flow: `pending -> preparing -> ready -> completed`

---

## Notes

- Do not use `/15` as ID; API expects MongoDB ObjectId format.
- `POST /api/orders` requires verified user (`isVerified = true`) and non-empty cart.
