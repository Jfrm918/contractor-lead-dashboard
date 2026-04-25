# Contractor Lead System

Next.js dashboard + backend for contractor missed-call recovery and lead management.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app runs fully in **mock-data mode** when no database is configured — the dashboard and API routes work using in-memory seed data.

## Environment Variables

Copy `.env.example` to `.env` and fill in the values you need:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | No (dev) / Yes (prod) | Postgres connection string. When absent the app uses an in-memory mock layer. |
| `TWILIO_AUTH_TOKEN` | No (dev) / Yes (prod) | Used for Twilio webhook signature validation. |
| `NODE_ENV` | No | `development` (default), `production`, or `test`. |

## Database Setup (optional for local dev)

When you're ready to use a real Postgres database:

```bash
# 1. Set DATABASE_URL in .env
# 2. Run migrations
npx prisma migrate dev

# 3. (Optional) Open Prisma Studio to inspect data
npx prisma studio
```

The Prisma schema lives at `prisma/schema.prisma` and covers: `clients`, `client_settings`, `leads`, `lead_events`.

## API Routes

### Client Settings
- `GET  /api/clients/:clientId/settings` — read settings for a client
- `PUT  /api/clients/:clientId/settings` — update settings (validated with Zod)

### Twilio Webhooks
- `POST /api/webhooks/twilio/call` — inbound call webhook; accepts `application/x-www-form-urlencoded` (Twilio default) or JSON; resolves client from tracked number, classifies call outcome, creates/updates lead, logs event.

## Project Structure

```
src/
  app/
    api/
      clients/[clientId]/settings/route.ts   # Settings CRUD
      webhooks/twilio/call/route.ts           # Twilio call webhook
    page.tsx                                  # Dashboard UI
  components/                                 # UI components
  lib/
    api-response.ts                           # {success, data/error} envelope
    db.ts                                     # Prisma singleton w/ mock fallback
    env.ts                                    # Zod-validated env vars
    mock-db.ts                                # In-memory data layer for dev
    schemas.ts                                # Shared Zod schemas
    data.ts                                   # UI seed/demo data
    auth-context.tsx                          # Auth context (placeholder)
prisma/
  schema.prisma                               # Database schema
```

## Stack

- **Next.js 16** (App Router)
- **React 19** + TypeScript
- **Tailwind CSS v4**
- **Prisma** (Postgres ORM)
- **Zod** (runtime validation)
