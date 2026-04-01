# ResQ MVP

Vietnam-first roadside assistance and mobile repair MVP built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, PostgreSQL, React Hook Form, Zod, and Leaflet.

## What’s included

- Vietnamese-first mobile-responsive UI
- OTP-based phone login scaffold with a dev fallback code
- Customer, fixer, and admin roles
- Vehicle management with optional Vietnamese car registration details
- Saved addresses with coordinates
- Multi-step roadside help request flow
- Request tracking, history, invoice, payment, and review flows
- Admin request management and fixer assignment
- Fixer job dashboard and status updates
- Prisma schema, migration SQL, and seed data

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- React Hook Form
- Zod
- Prisma ORM
- PostgreSQL
- Custom JWT auth with OTP scaffold
- Leaflet + React Leaflet

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the env file if needed:

```bash
cp .env.example .env
```

3. Start a local PostgreSQL dev server with Prisma Dev, or point `DATABASE_URL` at your own PostgreSQL instance:

```bash
npm run db:dev
```

This prints a Postgres URL. Paste that value into `DATABASE_URL` inside `.env` if you are using Prisma Dev on your machine.

The project now also includes Convex URLs in `.env.example` for future client or HTTP action integrations. They do not replace PostgreSQL for the current MVP data model.

4. Push the schema and seed the database:

```bash
npm run db:push
npm run db:seed
```

5. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo login

The local OTP fallback code is:

```txt
123456
```

Seeded demo phone numbers:

- Admin: `0900000001`
- Fixer: `0900000002`
- Customer: `0900000003`
- Customer: `0900000004`

## Useful scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run check
npm run db:dev
npm run db:dev:ls
npm run db:dev:stop
npm run db:push
npm run db:seed
```

## Environment variables

Example values are in [`./.env.example`](./.env.example).

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: secret used to sign session JWTs
- `NEXT_PUBLIC_APP_URL`: local app URL
- `NEXT_PUBLIC_CONVEX_URL`: Convex cloud URL for client-side usage
- `CONVEX_HTTP_ACTIONS_URL`: Convex HTTP actions base URL
- `OTP_DEV_FALLBACK_CODE`: dev OTP code shown in local mode
- `NEXT_PUBLIC_DEFAULT_LAT`: default map latitude
- `NEXT_PUBLIC_DEFAULT_LNG`: default map longitude

## Main routes

- `/`
- `/services`
- `/help`
- `/about`
- `/auth`
- `/dashboard`
- `/dashboard/vehicles`
- `/dashboard/addresses`
- `/dashboard/history`
- `/request-help`
- `/requests/[id]/tracking`
- `/requests/[id]/payment`
- `/requests/[id]/invoice`
- `/requests/[id]/feedback`
- `/admin`
- `/fixer`
- `/fixer/jobs/[id]`

## API surface

Core endpoints included in `src/app/api`:

- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `GET /api/auth/me`
- `GET /api/vehicles`
- `POST /api/vehicles`
- `PUT /api/vehicles/:id/car-registration`
- `GET /api/addresses`
- `POST /api/addresses`
- `GET /api/services`
- `POST /api/requests`
- `GET /api/requests/:id`
- `GET /api/requests/:id/tracking`
- `PATCH /api/requests/:id/cancel`
- `GET /api/requests/:id/payment-summary`
- `POST /api/requests/:id/pay`
- `GET /api/requests/:id/invoice`
- `POST /api/requests/:id/review`
- `GET /api/admin/requests`
- `PATCH /api/admin/requests/:id/assign-fixer`
- `PATCH /api/admin/requests/:id/status`
- `GET /api/fixer/jobs`
- `PATCH /api/fixer/jobs/:id/status`

## Project structure

```txt
prisma/
  migrations/
  schema.prisma
  seed.ts
src/
  app/
    api/
    admin/
    auth/
    dashboard/
    fixer/
    help/
    request-help/
    requests/
    services/
  components/
    addresses/
    admin/
    auth/
    common/
    fixer/
    layout/
    payments/
    requests/
    reviews/
    ui/
    vehicles/
  lib/
  schemas/
  server/
    data/
    db/
    services/
```

## Notes

- The login flow is scaffolded for OTP and uses a dev fallback code locally instead of an SMS provider.
- PostgreSQL via Prisma remains the primary persistence layer for this MVP. Convex URLs are wired in as optional integration config, not as a replacement datastore.
- Payment processing is mocked for the MVP, but invoice and payment records are stored.
- Request photo upload currently stores selected file names only. This keeps the MVP flow testable without wiring object storage yet.
- The migration SQL lives at [`./prisma/migrations/0001_init/migration.sql`](./prisma/migrations/0001_init/migration.sql).
