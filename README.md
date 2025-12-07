# Vehicle Rental Management System

## 🔗 Live URL
https://vehicle-rental-system-bice-sigma.vercel.app/

---

##  Project Overview

The Vehicle Rental Management System is a full-stack web application that allows users to rent vehicles online. It supports role-based access for Admin and Customer and ensures secure and efficient booking management.

---

## Features

### 👤 Authentication
- User registration and login
- JWT-based authentication
- Role-based access control (Admin / Customer)

###  Vehicle Management
- Admin can create, update, and delete vehicles
- Vehicles cannot be deleted if they have active bookings
- Track real-time vehicle availability

###  Booking System
- Customers can book available vehicles
- Customers can cancel bookings before start date
- Admin can mark bookings as returned
- Auto status updates for vehicles:
  - Booked → `booked`
  - Cancelled/Returned → `available`

###  Data Safety
- Users cannot be deleted if they have active bookings
- Vehicles are protected from deletion if bookings are active

---

## 🛠 Technology Stack

**Backend:**
- Node.js
- Express.js
- TypeScript
- PostgreSQL

**Tools:**
- JWT (Authentication)
- bcrypt (Password Hashing)
- dotenv (Environment Variables)

---

## ⚙️ Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Johora99/vehicle-rental-system
cd vehicle-rental-system
```
### 2. Install Dependencies
```
npm install
```
### 3. Configure Environment Variables
Create a .env file in the root directory:
```
PORT=5000
CONNECTION_STR=postgresql_neon_db
JWT_SECRET=your_secret_key

```

## Run the Application
```
npm run dev

```

