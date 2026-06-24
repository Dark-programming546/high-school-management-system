# High School Management System — Backend

REST API built with **Node.js**, **Express**, and **MongoDB (Mongoose)**.

## Tech Stack

- Node.js + Express 5
- MongoDB + Mongoose 9
- JWT Authentication (role-based: admin / teacher / student)
- bcryptjs for password hashing

## Project Structure

```
src/
├── config/         # Database connection
├── controllers/    # Route handlers
├── middleware/     # Auth guards, rate limiter
├── models/         # Mongoose schemas
├── routes/         # Express routers
├── services/       # Business logic (marks, promotion, ranking)
├── scripts/        # One-time scripts (e.g. create admin)
└── utils/          # Shared helpers
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your values in `.env`:

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | 256-bit secret (see below) |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d) |
| `CLIENT_URL` | Frontend URL for CORS |

Generate a strong JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Create the first admin account

```bash
npm run create-admin
```

### 4. Start the server

```bash
# Development
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`.

## API Overview

| Prefix | Description |
|---|---|
| `/api/admin` | Admin auth & profile |
| `/api/teacher-auth` | Teacher login & password change |
| `/api/student-auth` | Student login & password change |
| `/api/teachers` | Teacher CRUD |
| `/api/students` | Student CRUD |
| `/api/classes` | Class management |
| `/api/subjects` | Subject management |
| `/api/academic-years` | Academic year management |
| `/api/marks` | Mark entry |
| `/api/results` | Result calculation |
| `/api/ranking` | Student ranking |
| `/api/promotion` | Grade promotion |
| `/api/stream` | Stream assignment (Natural/Social) |
| `/api/dashboard` | Dashboard statistics |

## Security

- Login endpoints are rate-limited to **10 requests per 15 minutes** per IP
- CORS restricted to `CLIENT_URL`
- Passwords hashed with bcryptjs (salt rounds: 10)
- JWT tokens expire in 7 days
