# Y10 CRM - Mini CRM & Sales Management SaaS

A production-ready Customer Relationship Management platform built for **Young10 Marketing** (https://young10marketing.com/). The design system, logo mark, typography and color theme are derived directly from the Young10 Marketing brand.

## Features

- **Authentication & RBAC** - email/password auth with JWT sessions (httpOnly cookies), two roles: `ADMIN` and `SALES_REP`. The first registered account automatically becomes the workspace admin.
- **Lead Management** - full CRUD, live search, stage/status/source/assignee filters, sorting, pagination, admin-only assignment, mark-as-lost, activity tracking.
- **Sales Pipeline** - five-stage kanban (New, Contacted, Qualified, Proposal, Won) with drag-and-drop stage transitions powered by @dnd-kit.
- **Analytics Dashboard** - real-time metrics computed from PostgreSQL: totals, open pipeline value, won revenue, conversion rate, weekly trend, stage breakdown, top sources, rep leaderboard. Auto-refreshes every 20 seconds.
- **Tasks & Follow-ups** - priorities, due dates, overdue detection, status workflow, lead linking, per-lead task creation.
- **Secure Lead Intake API** - `POST /api/v1/leads/ingest` authenticated with `x-api-key`, validated with zod, rate limited (30 req/min per key). Keys are managed by admins in the Admin Console.
- **Admin Console** - team management (roles, activation), API key management with usage tracking, intake API documentation.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui, Kumbh Sans |
| Database | PostgreSQL (Neon) via Prisma ORM |
| Auth | Custom JWT sessions (jose + bcryptjs), httpOnly cookies |
| Drag & drop | @dnd-kit |
| Charts | Recharts |
| Server state | TanStack Query (live polling) |
| Client state | Zustand |

## Brand System

Extracted from young10marketing.com:

- Primary blue `#384BFE`, deep hover `#2B3AD1`
- Ink / dark surfaces `#0F0D1D`
- Logo ink `#1E1B1C`
- Text gray `#7A7A7A`
- Font: **Kumbh Sans** (400/500/600/700)
- Pinwheel logo mark recreated as SVG (`public/brand/icon.svg`, `src/components/brand/logo.tsx`)

## Getting Started

```bash
bun install

# configure environment
cp .env.example .env   # then set DATABASE_URL + JWT_SECRET

# push schema and seed demo data
bunx prisma db push
DATABASE_URL="<your-neon-url>" bun prisma/seed.ts

# run
bun run dev
```

### Demo accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@young10marketing.com | Admin@123 |
| Sales Rep | sarah@young10marketing.com | Sales@123 |
| Sales Rep | mike@young10marketing.com | Sales@123 |
| Sales Rep | emma@young10marketing.com | Sales@123 |

### External lead intake

```bash
curl -X POST https://<host>/api/v1/leads/ingest \
  -H "Content-Type: application/json" \
  -H "x-api-key: <key created in Admin Console>" \
  -d '{"firstName":"Jane","lastName":"Doe","email":"jane@acme.com","company":"Acme"}'
```

## Project Structure

```
src/
  app/
    page.tsx              # single-page application shell (auth gate + workspace)
    api/                  # REST API (Next.js route handlers)
      auth/               # register, login, logout, me
      users/              # list, create, update (admin)
      leads/              # CRUD + search + filters + assignment
      tasks/              # CRUD + filters
      analytics/          # aggregated dashboard metrics
      activities/         # activity feed
      api-keys/           # admin key management
      v1/leads/ingest/    # secure external intake endpoint
  components/
    brand/                # logo mark + wordmark
    auth/                 # sign-in / sign-up screen
    layout/               # sidebar, topbar
    dashboard/ leads/ pipeline/ tasks/ admin/ shared/
  hooks/use-crm.ts        # TanStack Query data layer
  store/crm-store.ts      # Zustand UI state
  lib/                    # db, auth, api helpers, validation, rate limit, constants
prisma/
  schema.prisma           # PostgreSQL schema
  seed.ts                 # demo data
```

## Role-Based Access Control

| Capability | Admin | Sales Rep |
|---|---|---|
| View leads | All | Only assigned / created |
| Assign leads | Yes | No |
| Delete leads | Yes | No |
| Update lead stage / notes | Yes | Yes (own leads) |
| Team & API key management | Yes | No |
| Analytics scope | Workspace-wide | Own book of business |
