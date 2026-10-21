# 🪔 DiyaVerse: A Sacred Diwali Light & Wish Experience

> **"This Diwali, Let's Light India Together."**  
> DiyaVerse is a production-ready, mobile-first Diwali web application designed to connect friends, families, and communities across India and the diaspora by lighting virtual diyas, sharing thoughtful blessings, and visualizing collective hope on an interactive public canvas wall.

---

## 🌟 Core Architectural Principles

1. **Honest Counters & Zero Phantom Numbers**  
   DiyaVerse never fabricates counters, simulates ghost traffic, or inflates engagement metrics. Every counter reflects exact transactional state in the database. When zero diyas are lit, the application proudly displays: *"Be the first to light a diya this Diwali."*

2. **Atomic Transactional Integrity**  
   Diya creation and counter increments execute inside a single PostgreSQL `$transaction`. If any step fails, the entire transaction rolls back, preventing counter drift and orphaned records.

3. **Privacy-First Engineering**  
   - **No Raw IP Storage:** Rate limiting uses a salted daily-rotating SHA-256 hash. Raw IPs are discarded immediately after request processing.  
   - **Zero PII Collection:** No user names, emails, or phone numbers are collected in public flows. Dedication tags are strictly moderated.  
   - **First-Party Analytics:** Event properties are strictly allowlisted with no free-text fields. User agents are categorized into coarse device and browser families without fingerprinting.

4. **Curated 2,000-Wish Library**  
   - Exactly 2,000 validated blessings across **English** (1,100), **Hindi** (600 in Devanagari script), and **Hinglish** (300 in Latin script).  
   - Six distinct categories: *Family, Friends, Prosperity & Success, Elders, Colleagues, and Reflective*.  
   - Zero duplicates, grapheme length validation (≤140 characters), and culturally reverent tone.

5. **HTML5 Canvas Community Wall**  
   - Renders thousands of illuminated diyas on an HTML5 canvas sprite layer at a smooth 60fps.  
   - DPR capped at 2.0 with frame time quality monitoring (<24ms target).  
   - Full keyboard accessibility and an alternate accessible paginated card view (`/wall?view=list`).

6. **Secure Owner-Only Administration Console**  
   - Password hashing powered by `@node-rs/argon2` (Argon2id).  
   - 32-byte cryptographically secure session tokens stored in HttpOnly cookies with 12h absolute and 2h idle timeouts.  
   - Double-submit cookie CSRF validation on all mutation endpoints.  
   - Immutable audit logging for all moderation, status changes, and wish toggles.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, Server & Client Components) |
| **Runtime** | React 19 + TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS v3.4 + Custom Deep Maroon & Gold Diwali Design Tokens |
| **Database** | PostgreSQL on Neon (Pooled Connection via Prisma 6.x) |
| **Animation** | HTML5 Canvas (Wall), Framer Motion (Creator flow only) |
| **Visualization** | Recharts (Admin console only, dynamically imported) |
| **Security** | Argon2id (`@node-rs/argon2`), nanoid, crypto constant-time comparison |
| **Testing** | Vitest (Unit & Integration), Playwright (End-to-End browser suite) |

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js** >= 20.x
- **PostgreSQL Database** (e.g. Neon serverless or local Postgres instance)

### 2. Environment Variables
Create a `.env` file in the project root:
```env
DATABASE_URL="postgresql://user:password@ep-xyz-pooler.us-east-1.aws.neon.tech/diyaverse?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xyz.us-east-1.aws.neon.tech/diyaverse?sslmode=require"
ADMIN_SESSION_SECRET="your-32-byte-hex-random-session-secret"
CRON_SECRET="your-secure-cron-secret-token"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Install Dependencies & Initialize Database
```bash
# Install dependencies
npm install

# Generate Prisma client and deploy schema migrations
npx prisma generate
npx prisma migrate deploy

# Seed the 2,000-wish library into database
npm run prisma:seed
```

### 4. Provision the Administrator Account
```bash
# Provision owner admin credentials interactively or with defaults
npm run admin:create
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

DiyaVerse includes a comprehensive test suite across unit, integration, and E2E layers:

```bash
# Run unit and integration tests (Vitest)
npm test

# Run End-to-End browser tests (Playwright)
npm run test:e2e

# Validate the 2,000-wish library (zero duplicates, length & script checks)
npm run wishes:validate

# Run manual counter reconciliation audit
npm run reconcile

# Typecheck TypeScript codebase
npm run typecheck

# Build for production and verify zero secret leaks in static bundles
npm run build
```

---

## 🛡️ Administration & Moderation Console

Access the admin console at `/admin` (redirects to `/admin/login`).

### Features:
- **Overview Dashboard:** 10 truthful metric cards (Unique Visitors, Sessions, Diyas Lit, Wishes Attached, Custom Wishes, Completion Rate, Shares Rate, Downloads, Returning Visitors).
- **Analytics & Trends:** Interactive charts showing daily traffic, diya lighting rate, style preferences, and category distributions.
- **Diya Management:** Paginated table with search by ID or dedication, status toggles (Hide, Restore, Soft-Delete), and audit log confirmation modals.
- **Moderation Queue:** Community report triage prioritizing auto-hidden diyas (flagged 3+ times) with action logging.
- **Wish Library Browser:** Filter and toggle active/inactive status across all 2,000 blessings.
- **System Health:** Live database ping latency, atomic counter synchronization checks, error logs, and one-click reconciliation execution.
- **Audit Log:** Immutable security log tracking all administrator mutations with before/after state diffs.

---

## ⏰ Scheduled Cron Jobs (`vercel.json`)

| Job | Route | Schedule | Purpose |
|---|---|---|---|
| **Hourly Rollup** | `/api/cron/rollup` | `0 * * * *` | Aggregates raw analytics events into `DailyStat` table in IST. |
| **Nightly Reconciliation** | `/api/cron/reconcile` | `30 21 * * *` | Reconciles atomic `Counter` against `COUNT(*)`, logs to `CounterReconciliation`, and auto-corrects. |
| **Weekly Retention** | `/api/cron/retention` | `0 3 * * 0` | Prunes analytics events and non-active sessions older than 90 days. |

---

## 📄 License & Attribution
Developed with reverence for the sacred festival of Diwali. Released under the MIT License.
