# 🚗 Vehicle Rental System

A RESTful API backend for a vehicle rental management system with role-based authentication and booking management.

## 🔗 Links

**Live Deployment:** https://l2-a2.onrender.com/

**GitHub Repository:** https://github.com/HackWithNoman/L2-A2

---

## ✨ Features

### Authentication & Authorization

- User registration with password hashing (bcrypt)
- JWT-based authentication with role-based access control
- Two roles: **Admin** and **Customer**

### Vehicle Management

- Create, read, update, and delete vehicles
- Track availability status (available/booked)
- Daily rent price calculation

### User Management

- Admin-only user listing
- Profile updates (own profile or all if admin)
- Delete users with active booking check

### Booking System

- Create bookings with automatic price calculation
- Customer: View own bookings, cancel before start date
- Admin: View all bookings, mark as returned
- Automatic vehicle status updates

---

## 🛠️ Technology Stack

| Category         | Technology         |
| ---------------- | ------------------ |
| Runtime          | Node.js            |
| Language         | TypeScript         |
| Framework        | Express.js         |
| Database         | PostgreSQL (Neon)  |
| Authentication   | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs           |

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v18+)
- PostgreSQL database (Neon / local)
- Bun (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/HackWithNoman/L2-A2.git
cd L2-A2

# Install dependencies
npm install
# or
bun install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
CONNECTION_STR=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-at-least-256-bits-long
PORT=3000
```

### Running the Application

```bash
# Development mode
npm run dev
# or
bun dev

# Production build
npm run build
npm start
```

The server will run on `http://localhost:3000` (or the PORT specified in .env).

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint              | Description       |
| ------ | --------------------- | ----------------- |
| POST   | `/api/v1/auth/signup` | Register new user |
| POST   | `/api/v1/auth/signin` | Login and get JWT |

### Vehicles

| Method | Endpoint                      | Access     |
| ------ | ----------------------------- | ---------- |
| GET    | `/api/v1/vehicles`            | Public     |
| GET    | `/api/v1/vehicles/:vehicleId` | Public     |
| POST   | `/api/v1/vehicles`            | Admin only |
| PUT    | `/api/v1/vehicles/:vehicleId` | Admin only |
| DELETE | `/api/v1/vehicles/:vehicleId` | Admin only |

### Users

| Method | Endpoint                | Access       |
| ------ | ----------------------- | ------------ |
| GET    | `/api/v1/users`         | Admin only   |
| PUT    | `/api/v1/users/:userId` | Admin or Own |
| DELETE | `/api/v1/users/:userId` | Admin only   |

### Bookings

| Method | Endpoint                      | Access         |
| ------ | ----------------------------- | -------------- |
| GET    | `/api/v1/bookings`            | Role-based     |
| POST   | `/api/v1/bookings`            | Customer/Admin |
| PUT    | `/api/v1/bookings/:bookingId` | Role-based     |

---

## 📁 Project Structure

```
├── src/
│   ├── config/
│   │   ├── db.ts          # Database connection & init
│   │   └── index.ts       # Config management
│   ├── middleware/
│   │   ├── auth.ts        # JWT authentication
│   │   └── asyncHandler.ts
│   ├── modules/
│   │   ├── auth/          # Authentication (signup, signin)
│   │   ├── bookings/     # Booking management
│   │   ├── users/        # User management
│   │   └── vehicles/     # Vehicle management
│   ├── server.ts         # Express app entry point
│   └── types/            # TypeScript declarations
├── .env                  # Environment variables
├── package.json
├── tsconfig.json
└── vercel.json           # Vercel deployment config
```