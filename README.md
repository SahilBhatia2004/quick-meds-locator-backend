
# Quick Medicine Commerce Backend

A scalable backend for a medicine ordering application that connects users with nearby pharmacies.

## Features

- User authentication and profile management
- Medicine search functionality
- Shopping cart management
- Order processing with nearest pharmacy assignment
- Pharmacy geolocation-based assignment

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Geospatial queries for pharmacy location

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create `.env` file based on `.env.example`
4. Start the server:
   ```
   npm start
   ```

## API Endpoints

### Users
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Update user password

### Medicines
- `GET /api/medicines/search?query=paracetamol` - Search for medicines
- `GET /api/medicines/:id` - Get medicine by ID

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/remove/:medicineId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart
- `POST /api/cart/prescription` - Upload prescription

### Pharmacies
- `GET /api/pharmacies` - Get all pharmacies
- `GET /api/pharmacies/nearest?longitude=123&latitude=456` - Find nearest pharmacies
- `POST /api/pharmacies/availability` - Check medicine availability at pharmacy
- `POST /api/pharmacies/find-with-medicines` - Find pharmacy with all medicines in stock

### Orders
- `POST /api/orders` - Create a new order
- `GET /api/orders` - Get all user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/cancel` - Cancel an order
