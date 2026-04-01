# Task 5 API Documentation

## Reviews API

### 1. Submit a Review
- **Endpoint:** `POST /api/reviews`
- **Access:** Student Only
- **Business Rule:** The order must securely belong to the logged-in student, and its status **must** be `completed`.
- **Request Body:**
  ```json
  {
    "orderId": "69cd818f6c4ca9305b0a4ace",
    "menuItemId": "69cd818a6c4ca9305b0a4abe", // Optional
    "comment": "Amazing food! Definitely coming back!"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Review submitted successfully",
    "data": {
      "userId": "69cd81846c4ca9305b0a4ab3",
      "orderId": "69cd818f6c4ca9305b0a4ace",
      "menuItemId": "69cd818a6c4ca9305b0a4abe",
      "comment": "Amazing food! Definitely coming back!",
      "_id": "69cd81936c4ca9305b0a4ae0",
      "createdAt": "2026-04-01T20:35:31.859Z",
      "updatedAt": "2026-04-01T20:35:31.859Z",
      "__v": 0
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: "Review submission blocked for orders that are not completed."

---

## Admin Dashboard API (Admins Only)

### 2. Verify Student
Manually flips `isVerified: false` to `true` for a registered student.
- **Endpoint:** `PATCH /api/admin/users/:id/verify`
- **Access:** Admin Only
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "User verified successfully",
    "data": {
      "_id": "69cd81846c4ca9305b0a4ab3",
      "name": "Test Student",
      "studentId": "ETS8070/16",
      "isVerified": true
    }
  }
  ```

### 3. Get All Orders
Used to populate the Admin Table listing orders across the entire university.
- **Endpoint:** `GET /api/admin/orders`
- **Access:** Admin Only
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "69cd818f6c4ca9305b0a4ace",
        "userId": {
          "_id": "69cd81846c4ca9305b0a4ab3",
          "name": "Test Student",
          "phoneNumber": "0979538217",
          "isVerified": true
        },
        "items": [
          {
            "name": "Burger",
            "price": 12.5,
            "quantity": 2
          }
        ],
        "totalPrice": 25,
        "status": "completed",
        "createdAt": "2026-04-01T20:35:27.388Z"
      }
    ]
  }
  ```

### 4. Dashboard Daily Stats
Computes analytics showing the Most Ordered Items and the total Daily Volumes for completed orders globally.
- **Endpoint:** `GET /api/admin/stats`
- **Access:** Admin Only
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "mostOrderedItems": [
        {
          "name": "Burger",
          "count": 2
        }
      ],
      "dailyOrderVolume": [
        {
          "date": "2026-04-01",
          "count": 1
        }
      ]
    }
  }
  ```
