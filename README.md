# ShopSphere — Full-Stack E-Commerce Application

ShopSphere is a modern, production-style full-stack e-commerce web application built with React, TypeScript, Tailwind CSS, Node.js, Express, PostgreSQL, and Prisma ORM.

## Architecture

- **Frontend (`/frontend`)**: React 18 + TypeScript + Vite + Tailwind CSS + Axios + React Router. Communicates with `/api/v1` via Vite dev proxy (or `VITE_API_BASE_URL`).
- **Backend (`/backend`)**: Node.js + Express + TypeScript REST API organized into `routes/`, `services/`, `middleware/`, and `prisma/`. Secured with Helmet, CORS, bcrypt password hashing, JWT authentication, role-based authorization (`CUSTOMER` / `ADMIN`), Zod input validation, and rate limiting on `/api/v1/auth`.
- **Database (`/database` & `/backend/prisma`)**: PostgreSQL managed by Prisma ORM with relational models for `User`, `Category`, `Product`, `Cart`, `CartItem`, `Order`, `OrderItem`, and `Address`.

## Project Structure

```
shopsphere/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── types/
│   │   └── __tests__/
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── __tests__/
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── database/
│   └── init.sql
├── .env.example
├── .gitignore
└── README.md
```

## Ubuntu Linux Setup Instructions

### 1. Prerequisites
- Node.js 20 LTS or 22 LTS (`node -v`)
- npm (`npm -v`)
- PostgreSQL 15+ (`sudo apt update && sudo apt install -y postgresql postgresql-contrib`)

### 2. PostgreSQL Database Setup
```bash
sudo systemctl start postgresql
sudo -u postgres psql -c "CREATE USER shopsphere_user WITH PASSWORD 'shopsphere_password';"
sudo -u postgres psql -c "CREATE DATABASE shopsphere_db OWNER shopsphere_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE shopsphere_db TO shopsphere_user;"
```

### 3. Environment Variables
```bash
cp .env.example backend/.env
```
Update `backend/.env` with your PostgreSQL `DATABASE_URL` and a strong `JWT_SECRET`.

### 4. Backend Setup, Migrations & Seed
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```
The API server runs at `http://localhost:5000` (health check: `GET /api/v1/health`).

### 5. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend dev server runs at `http://localhost:3000` (proxying `/api` to `http://localhost:5000`).

### 6. Running Tests
```bash
# Backend API tests (Vitest + Supertest)
cd backend && npm test

# Frontend component tests (Vitest + React Testing Library)
cd frontend && npm test
```

## Seeded Development Accounts

> **Warning:** These credentials are for local development only.

| Role     | Email                         | Password          |
|----------|-------------------------------|-------------------|
| Admin    | `admin@shopsphere.local`      | `Admin123!Dev`    |
| Customer | `customer@shopsphere.local`   | `Customer123!Dev` |

## Troubleshooting

- **PostgreSQL connection refused (`P1001`)**: Ensure PostgreSQL is running (`sudo systemctl status postgresql`) and `DATABASE_URL` in `backend/.env` matches your user/password/database.
- **Prisma Client not generated**: Run `npx prisma generate` inside `backend/`.
- **Port already in use**: Change `PORT` in `backend/.env` or `server.port` in `frontend/vite.config.ts`.
