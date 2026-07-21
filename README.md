# GearUp Backend

Rent Sports & Outdoor Gear Instantly — REST API built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

**Live API:** https://gearup-backend-nine-psi.vercel.app
**Postman Collection:** [postman/GearUp.postman_collection.json](./postman/GearUp.postman_collection.json)

## Tech Stack

- Node.js + Express (ESM)
- TypeScript
- PostgreSQL + Prisma ORM
- JWT authentication
- SSLCommerz payment gateway (sandbox)

## Project Structure

```
src/
  app/
    modules/        # auth, gear, category, rental, payment, provider, review, admin
    middlewares/     # auth, validateRequest, globalErrorHandler, notFound
    routes/          # route aggregator
    utils/           # prisma client, jwt, catchAsync, sendResponse, sslcommerz, httpStatus
  config/            # env config
  errors/            # AppError, zod error handler
  app.ts
  server.ts
api/
  index.ts           # Vercel serverless entry
prisma/
  schema.prisma
  seed.ts
```

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, SSLCOMMERZ credentials
npx prisma migrate deploy
npm run seed
npm run dev
```

## Roles

- **Customer** — browse gear, place rental orders, pay via SSLCommerz, track orders, leave reviews
- **Provider** — manage gear inventory, view/update incoming orders
- **Admin** — manage users, gear, rentals, categories

## Admin Credentials (seeded)

```
Email: admin@gearup.com
Password: Admin@12345
```

## API Overview

| Group | Base Path |
|---|---|
| Auth | `/api/auth` |
| Gear (public) | `/api/gear` |
| Categories (public) | `/api/categories` |
| Rentals | `/api/rentals` |
| Payments | `/api/payments` |
| Provider | `/api/provider` |
| Reviews | `/api/reviews` |
| Admin | `/api/admin` |

All error responses follow: `{ success, message, errorDetails }`.

## Payment Integration

Integrated with **SSLCommerz** (sandbox). Flow:

1. `POST /api/payments/create` — creates a rental payment session, returns `paymentUrl` to redirect the customer to.
2. Customer completes payment on SSLCommerz's hosted page.
3. SSLCommerz calls back to `GET/POST /api/payments/confirm` (success/fail/cancel/IPN), which validates the transaction and marks the rental order as `PAID`.
4. `GET /api/payments` / `GET /api/payments/:id` — payment history and details.
