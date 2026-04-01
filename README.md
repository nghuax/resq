# ResQ MVP

Vietnam-first roadside assistance and mobile repair MVP built with Next.js App Router, TypeScript, Tailwind CSS, React Hook Form, Zod, Leaflet, and a Convex-backed runtime data layer.

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
- Convex schema, seed data, and cloud-connected queries/mutations
- Prisma schema, migration SQL, and seed data retained as project deliverables and reference models

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- React Hook Form
- Zod
- Convex
- Custom JWT auth with OTP scaffold
- Leaflet + React Leaflet
- Prisma schema + migration artifacts retained in-repo

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the env file if needed:

```bash
cp .env.example .env
```

3. Link the app to the existing Convex project:

```bash
npm run convex:once
```

If you need to configure the project on a fresh machine, use:

```bash
npx convex dev --once --configure existing
```

This writes `.env.local` with the active deployment values. The current project is linked to:

- `https://bright-bear-144.convex.cloud`
- `https://bright-bear-144.convex.site`

4. Seed the Convex deployment:

```bash
npm run convex:seed
```

5. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

6. Optional Prisma reference tooling:

```bash
npm run db:generate
npm run db:dev
npm run db:push
npm run db:seed
```

These commands are kept for the Prisma deliverables and local reference database, but the running MVP now reads and writes through Convex.

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
npm run convex:dev
npm run convex:once
npm run convex:seed
npm run db:dev
npm run db:dev:ls
npm run db:dev:stop
npm run db:push
npm run db:seed
```

## Environment variables

Example values are in [`./.env.example`](./.env.example).

- `DATABASE_URL`: optional Prisma reference database URL used for Prisma tooling and generated types
- `JWT_SECRET`: secret used to sign session JWTs
- `NEXT_PUBLIC_APP_URL`: local app URL
- `CONVEX_DEPLOYMENT`: deployment selected by the Convex CLI
- `NEXT_PUBLIC_CONVEX_URL`: Convex cloud URL for client-side usage
- `CONVEX_HTTP_ACTIONS_URL`: Convex site / HTTP actions base URL
- `NEXT_PUBLIC_CONVEX_SITE_URL`: Convex CLI-generated site URL fallback
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
convex/
  schema.ts
  seed.ts
  auth.ts
  customer.ts
  admin.ts
  fixer.ts
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
- Runtime persistence for the MVP now goes through Convex.
- Prisma schema, migration SQL, and seed files are still included because they were part of the original deliverables and remain useful as typed reference models.
- Payment processing is mocked for the MVP, but invoice and payment records are stored.
- Request photo upload currently stores selected file names only. This keeps the MVP flow testable without wiring object storage yet.
- The migration SQL lives at [`./prisma/migrations/0001_init/migration.sql`](./prisma/migrations/0001_init/migration.sql).
- For a real live frontend deploy, add the Convex and JWT env vars to your hosting provider and connect the GitHub repo to Vercel or another Next.js host.
