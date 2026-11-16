<div align="center">

<img src="public/brand/logo.png" alt="Young10 Marketing" width="300" />

# Y10 CRM

### Mini CRM &amp; Sales Management SaaS

A production-ready, full-stack Customer Relationship Management platform built for **Young10 Marketing** — lead management, a drag-and-drop sales pipeline, real-time analytics, tasks & follow-ups, role-based access control, and a secure external lead-intake API.

The design system, wordmark, and color theme are derived directly from [young10marketing.com](https://young10marketing.com/).

[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-384BFE?style=for-the-badge)](./LICENSE)

</div>

---

## Product Tour

| Sign In | Analytics Dashboard |
| :---: | :---: |
| <img src="docs/screenshots/sign-in.png" alt="Sign in screen — Young10 Marketing brand" width="100%" /> | <img src="docs/screenshots/dashboard.png" alt="Real-time analytics dashboard" width="100%" /> |
| **Sales Pipeline** | **Lead Management** |
| <img src="docs/screenshots/pipeline.png" alt="Drag-and-drop pipeline kanban" width="100%" /> | <img src="docs/screenshots/leads.png" alt="Leads table with filters" width="100%" /> |

---

## Features

- **Authentication & RBAC** — email/password auth with JWT sessions (httpOnly cookies, `jose` + `bcryptjs`). Two roles: `ADMIN` and `SALES_REP`. The first registered account automatically becomes the workspace admin.
- **Lead Management** — full CRUD, live search, stage / status / source / assignee filters, sorting, pagination, admin-only assignment, mark-as-lost, and a complete activity trail.
- **Sales Pipeline** — five-stage kanban (New → Contacted → Qualified → Proposal → Won) with smooth drag-and-drop stage transitions powered by `@dnd-kit`.
- **Real-Time Analytics** — totals, open pipeline value, won revenue, conversion rate, weekly lead trend, stage breakdown, top sources, and a rep leaderboard — computed live from PostgreSQL and auto-refreshing every 20 seconds.
- **Tasks & Follow-ups** — priorities, due dates, overdue detection, status workflow, lead linking, and per-lead task creation.
- **Secure Lead Intake API** — `POST /api/v1/leads/ingest` authenticated with `x-api-key`, validated with zod, rate limited at 30 requests/minute per key. Keys are issued and revoked by admins in the Admin Console.
- **Admin Console** — team management (roles, activation) and API key management with usage tracking.
- **Brand-Faithful Design** — official Young10 Marketing logo and wordmark, brand blue `#384BFE`, ink `#0F0D1D`, Kumbh Sans typography, and a fully responsive light theme.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16 (App Router) · React 19 · TypeScript 5 |
| Backend | **Node.js** runtime — Next.js Route Handlers exposing a **REST API** designed with **FastAPI-style** conventions (versioned routes, strict request validation, consistent JSON envelope) |
| Database | **PostgreSQL** (Neon serverless) via **Prisma ORM** |
| Auth | JWT sessions — `jose` + `bcryptjs`, httpOnly cookies |
| API Contracts | Zod validation on every mutation |
| Drag & Drop | @dnd-kit |
| Charts | Recharts |
| Server State | TanStack Query (live polling) |
| Client State | Zustand |
| Styling | Tailwind CSS 4 · shadcn/ui · Kumbh Sans |

---

## Architecture

Y10 CRM is a single deployable **Next.js 16** application. The frontend (React 19) and the backend (Node.js REST API layer) live in one type-safe codebase and share `zod` schemas and TypeScript contracts end-to-end.

```mermaid
flowchart LR
    subgraph Browser["Browser — React 19 SPA"]
        UI["UI Layer<br/>shadcn/ui · Tailwind 4"]
        TQ["TanStack Query<br/>server state + polling"]
        ZS["Zustand<br/>UI state"]
    end

    subgraph Backend["Backend — Node.js Runtime (Next.js Route Handlers)"]
        AUTH["Auth Guard<br/>JWT sessions · RBAC"]
        VAL["Zod Validation"]
        RL["Rate Limiter<br/>30 req / min / key"]
        HANDLERS["REST Handlers<br/>FastAPI-style contracts"]
    end

    subgraph Data["Data Layer"]
        PRISMA["Prisma ORM"]
        PG[("PostgreSQL — Neon")]
    end

    EXT["External Lead Sources<br/>(x-api-key)"]

    UI --> TQ
    TQ -->|"fetch /api/*"| AUTH
    EXT -->|"POST /api/v1/leads/ingest"| RL
    RL --> VAL
    AUTH --> HANDLERS
    VAL --> HANDLERS
    HANDLERS --> PRISMA
    PRISMA --> PG
```

**Backend conventions** — the REST layer runs on the Node.js runtime and follows FastAPI-style design principles: strict typed request validation, predictable resource routing, a uniform JSON response envelope, and dependency-style guards (auth → validation → handler).

**Every** API response uses one envelope:

```json
// success
{ "success": true, "data": { ... } }

// failure
{ "success": false, "error": "Invalid email or password" }
```

### Data Model

```mermaid
erDiagram
    USER ||--o{ LEAD : "assigned / created"
    USER ||--o{ TASK : "assigned / created"
    USER ||--o{ ACTIVITY : performs
    USER ||--o{ API_KEY : creates
    LEAD ||--o{ TASK : has
    LEAD ||--o{ ACTIVITY : tracked

    USER {
        string id PK
        string name
        string email UK
        string passwordHash
        string role "ADMIN | SALES_REP"
        boolean active
    }
    LEAD {
        string id PK
        string firstName
        string lastName
        string email
        string phone
        string company
        string stage "NEW | CONTACTED | QUALIFIED | PROPOSAL | WON"
        string status "OPEN | LOST"
        string source
        float value
        boolean createdViaApi
        string assignedToId FK
    }
    TASK {
        string id PK
        string title
        string priority "LOW | MEDIUM | HIGH"
        string status "PENDING | IN_PROGRESS | COMPLETED"
        datetime dueDate
        string leadId FK
        string assignedToId FK
    }
    ACTIVITY {
        string id PK
        string type "LEAD_CREATED | STAGE_CHANGED | EXTERNAL_LEAD | ..."
        string message
        string userId FK
        string leadId FK
    }
    API_KEY {
        string id PK
        string name
        string key UK
        string prefix
        boolean active
        datetime lastUsedAt
    }
```

---

## API Documentation

Base URL: `/api` — all responses are JSON using the envelope above. Session endpoints authenticate via the `session` httpOnly cookie; the external intake endpoint authenticates via the `x-api-key` header.

### Authentication

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account. The **first** registered user becomes `ADMIN` | Public |
| `POST` | `/api/auth/login` | Sign in — sets the JWT session cookie | Public |
| `POST` | `/api/auth/logout` | Clear the session | Session |
| `GET` | `/api/auth/me` | Current user profile (id, name, email, role) | Session |

```bash
# Register — first user becomes workspace admin
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex Carter","email":"admin@young10marketing.com","password":"Demo123!"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"admin@young10marketing.com","password":"Demo123!"}'
```

### Leads

| Method | Endpoint | Description | Roles |
| --- | --- | --- | --- |
| `GET` | `/api/leads` | Searchable, filterable, paginated list | Admin: all · Rep: own |
| `POST` | `/api/leads` | Create a lead | Both |
| `GET` | `/api/leads/:id` | Lead detail | Scoped |
| `PATCH` | `/api/leads/:id` | Update fields / stage / notes | Scoped |
| `DELETE` | `/api/leads/:id` | Delete a lead | Admin |
| `POST` | `/api/leads/:id/assign` | Assign a lead to a rep | Admin |

**Query parameters** for `GET /api/leads`:

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `search` | string | — | Matches name, email, phone, company |
| `stage` | enum | `ALL` | `NEW` · `CONTACTED` · `QUALIFIED` · `PROPOSAL` · `WON` |
| `status` | enum | `ALL` | `OPEN` · `LOST` |
| `source` | enum | `ALL` | `WEBSITE` · `REFERRAL` · `SOCIAL_MEDIA` · `PAID_ADS` · `EMAIL_CAMPAIGN` · `COLD_CALL` · `EVENT` · `OTHER` |
| `assignedToId` | id | `ALL` | Filter by rep |
| `page` | int | `1` | Page number |
| `pageSize` | int | `10` | 1–100 |
| `sort` | string | `createdAt_desc` | e.g. `value_desc`, `firstName_asc` |

```bash
curl "http://localhost:3000/api/leads?search=acme&stage=QUALIFIED&page=1&pageSize=10" -b cookies.txt
```

### Tasks

| Method | Endpoint | Description | Roles |
| --- | --- | --- | --- |
| `GET` | `/api/tasks` | List with `status` (`ALL`·`PENDING`·`IN_PROGRESS`·`COMPLETED`), `mine` (bool), `leadId` filters + overdue counts | Both |
| `POST` | `/api/tasks` | Create a task (optionally linked to a lead) | Both |
| `PATCH` | `/api/tasks/:id` | Update status / priority / due date | Scoped |
| `DELETE` | `/api/tasks/:id` | Delete a task | Scoped |

### Analytics & Activity

| Method | Endpoint | Description | Roles |
| --- | --- | --- | --- |
| `GET` | `/api/analytics` | KPI totals, pipeline value, won revenue, conversion rate, weekly trend, stage breakdown, top sources, rep leaderboard | Admin: workspace · Rep: own |
| `GET` | `/api/activities?limit=10` | Latest workspace activity feed | Both |

### Team Administration

| Method | Endpoint | Description | Roles |
| --- | --- | --- | --- |
| `GET` | `/api/users` | List team members with lead counts | Admin |
| `POST` | `/api/users` | Create a team member | Admin |
| `GET` | `/api/users/:id` | Member detail | Admin |
| `PATCH` | `/api/users/:id` | Change role / activate / deactivate | Admin |

### API Keys

| Method | Endpoint | Description | Roles |
| --- | --- | --- | --- |
| `GET` | `/api/api-keys` | List keys (prefix + usage only) | Admin |
| `POST` | `/api/api-keys` | Issue a key — full secret shown once | Admin |
| `DELETE` | `/api/api-keys/:id` | Revoke a key | Admin |

### External Lead Intake — `POST /api/v1/leads/ingest`

Public HTTPS endpoint for external lead sources (landing pages, ads, forms). Authenticated with an `x-api-key` header, rate limited to **30 requests / minute / key**.

| Field | Type | Required |
| --- | --- | --- |
| `firstName` | string | Yes |
| `lastName` | string | Yes |
| `email` | email | No |
| `phone` | string | No |
| `company` | string | No |
| `jobTitle` | string | No |
| `source` | enum | No (default `WEBSITE`) |
| `value` | number | No (default `0`) |
| `notes` | string | No |

```bash
curl -X POST https://<host>/api/v1/leads/ingest \
  -H "Content-Type: application/json" \
  -H "x-api-key: y10_live_xxxxxxxxxxxx" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@acme.com",
    "company": "Acme Inc.",
    "source": "PAID_ADS",
    "value": 4500
  }'
```

```json
// 201 Created
{
  "success": true,
  "data": { "leadId": "cmh...", "message": "Lead captured successfully" }
}
```

Status codes: `201` created · `400` invalid payload · `401` missing/invalid key · `429` rate limited.

---

## Getting Started

### Prerequisites

- **Node.js 18+** (or [Bun](https://bun.sh/))
- A **PostgreSQL** database — [Neon](https://neon.tech/) offers a generous free serverless tier

### Setup

```bash
# 1. install dependencies
bun install            # or: npm install

# 2. configure environment
cp .env.example .env
#    → set DATABASE_URL to your PostgreSQL connection string
#    → set JWT_SECRET to a long random string (openssl rand -base64 48)

# 3. create the schema
bunx prisma db push    # or: npx prisma db push

# 4. seed demo data (20 leads, tasks, activities, team)
DATABASE_URL="<your-url>" bun prisma/seed.ts

# 5. run
bun run dev            # or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the first account you register becomes the workspace admin.

### Demo Accounts (after seeding)

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@young10marketing.com` | `Demo123!` |
| Sales Rep | `sarah@young10marketing.com` | `Demo123!` |
| Sales Rep | `mike@young10marketing.com` | `Demo123!` |

The sign-in screen also includes one-click demo buttons that autofill these credentials.

---

## Role-Based Access Control

| Capability | Admin | Sales Rep |
| --- | :---: | :---: |
| View leads | All workspace leads | Only assigned / created |
| Assign leads to reps | Yes | — |
| Delete leads | Yes | — |
| Update lead stage / notes | Yes | Own leads |
| Team management | Yes | — |
| API key management | Yes | — |
| Analytics scope | Workspace-wide | Own book of business |

---

## Deployment

The stack deploys cleanly to **Vercel** (frontend + Node.js API layer) with **Neon** (PostgreSQL):

```bash
# environment variables required in production
DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require"
JWT_SECRET="<long-random-secret>"

# generate the production client and build
bunx prisma generate && bunx prisma db push
bun run build
```

Any Node.js host works (Railway, Render, Fly.io, a VPS behind Nginx/Caddy) as long as the two environment variables above are provided.

---

## Project Structure

```
├─ src/
│  ├─ app/
│  │  ├─ page.tsx                 # application shell (auth gate + workspace)
│  │  └─ api/                     # REST API — Node.js route handlers
│  │     ├─ auth/                 # register · login · logout · me
│  │     ├─ leads/                # CRUD · assign  (+ /:id/assign)
│  │     ├─ tasks/                # CRUD
│  │     ├─ analytics/            # aggregated dashboard metrics
│  │     ├─ activities/           # activity feed
│  │     ├─ users/                # team management (admin)
│  │     ├─ api-keys/             # key issuing / revoking (admin)
│  │     └─ v1/leads/ingest/      # external intake (x-api-key)
│  ├─ components/
│  │  ├─ brand/                   # logo mark + wordmark
│  │  ├─ auth/                    # sign-in / sign-up experience
│  │  ├─ layout/                  # sidebar · topbar
│  │  ├─ dashboard/  pipeline/  leads/  tasks/  admin/  shared/
│  │  └─ ui/                      # shadcn/ui primitives
│  ├─ hooks/use-crm.ts            # TanStack Query data layer
│  ├─ store/crm-store.ts          # Zustand UI state
│  ├─ lib/                        # db · auth · api-helpers · validation · rate-limit
│  └─ types/                      # shared TypeScript contracts
├─ prisma/
│  ├─ schema.prisma               # PostgreSQL schema (5 models, 7 enums)
│  └─ seed.ts                     # demo data seeder
├─ docs/screenshots/              # product screenshots
└─ public/brand/                  # official Young10 Marketing logo assets
```

---

## License

Released under the [MIT License](./LICENSE).

<div align="center">

**Built for [Young10 Marketing](https://young10marketing.com/) — Professional Digital Marketing Agency, Sheridan, WY**

</div>
