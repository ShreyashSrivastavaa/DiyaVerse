# DiyaVerse: Architectural and Design Decisions (DECISIONS.md)

This document tracks all key technical decisions, architectural patterns, and rationale across all phases of DiyaVerse development.

---

### Decision 0.1: Technology Stack and Pinning
- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript strict mode.
- **Styling:** Tailwind CSS v3.4 with custom CSS variables for design tokens to ensure rock-solid stability with PostCSS and custom SVG animation classes.
- **Database & ORM:** Prisma 6.x connected to a dedicated PostgreSQL database (`diyaverse`) on Neon (AWS ap-southeast-1, closest low-latency region to India).
- **Rate Limiting:** PostgreSQL-backed `RateLimit` table using atomic sliding windows and daily salted IP hashes. No Redis dependency needed for MVP.
- **State & Animation:** Pure CSS transforms/opacity for ambient hero flicker & embers (reduced motion friendly, zero JS layout shifts); dynamically imported Framer Motion strictly for creator flow steps and sheets.

### Decision 0.2: Database Separation and Direct URLs
- Migrations and schema tracking use `DIRECT_URL` (direct endpoint `ep-empty-silence-azq8bvv3.c-3.ap-southeast-1.aws.neon.tech`), while production runtime uses `DATABASE_URL` (pooled connection via Neon PgBouncer).
- Initial schema `0_init` applied cleanly and verified.

### Decision 0.3: Typography and Font Loading
- **Headings:** Fraunces (Warm Serif, variable) for Latin headings, Noto Serif Devanagari for Hindi headings via `next/font/google` with `display: swap`.
- **Body & UI:** Inter for UI/body, Noto Sans Devanagari for Hindi with line-height 1.7.
- **Payload:** Pre-subsets and maximum two font families loaded on the first paint to keep LCP under 2.5s.

### Decision 0.4: Idempotency and Counter Integrity
- Diya creation requires an `idempotencyKey` (client UUID v4).
- The unique constraint on `Diya.idempotencyKey` prevents double submission or network retries from inserting duplicate records.
- In race conditions or retries, existing row is returned with 200 without counter increment.
- Diya insertion and Counter increment (`diyas_total`) occur strictly within a single Prisma `$transaction`.

### Decision 0.5: First-Party Privacy & Compliance
- No raw IP storage. Daily-rotating salted hash `hash(IP + date + salt)` used exclusively for rate limiting and deduplicating spam reports.
- No fingerprinting or cross-site tracking.
- Compliant with India's DPDP Act, 2023 principles: notice banner, purpose limitation, and consent toggle.

---

### Decision 1.1: 2,000-Wish Library & Similarity Guardrails
- Authored 2,000 active wishes across 9 categories + funny capped at 120 (English: 1,100; Hindi: 450; Hinglish: 450).
- Combinatorial generator used orthogonal 7-slot phrase matrices with unique 6-word prefixes and Jaccard 3-gram distance threshold <= 0.58.
- Validated via `scripts/wishes-validate.ts` ensuring grapheme lengths (40–140), unique IDs, no blocklist matches, and zero duplicate normalized texts. Seeded directly into Neon Postgres.
- All 900 Hindi and Hinglish wishes marked in `REVIEW.md` for human review prior to launch.

### Decision 1.2: Creator Flow UX & Non-Destructive Moderation
- Single-page creator at `/light` manages state machine (`choose`, `lighting`, `lit`, `error`).
- Submissions check moderation first; if rejected (422 `WISH_REJECTED`), the form remains active and typed text is preserved, presenting an inline alert and a "Surprise Me instead" option.
- 1.6s sacred lighting sequence (`LightingAnimation`) smoothly choreographs wick glow, flame scale-up, radial ambient glow, and wish fade-in, with instant fallback under `prefers-reduced-motion` or `saveData`.

### Decision 1.3: Dynamic OG Image & High-Res Card Rendering
- Public link previews use Next.js `ImageResponse` at `/d/[id]/opengraph-image` (1200x630, edge/node cached).
- High-resolution downloadable cards use `/api/diyas/[publicId]/card.png` (1080x1350) rendered dynamically with festive golden borders and typography.

### Decision 1.4: Community Reporting & Auto-Hide
- Unauthenticated reports deduplicated by daily salted IP hash.
- Auto-hide rule triggers when 3 distinct reporter hashes flag a diya: `wishVisible` is set to `false`, masking public wish text as "A quiet diya" while preserving the light on the wall and maintaining total counters.

### Decision 1.5: Honest Zero Counter State & Polling
- Initial counts server-rendered; clients poll `/api/stats/public` every 30s with an 800ms ease-out count-up.
- When counter = 0, no digits are rendered, displaying the invitation: "Be the first to light a diya this Diwali."

### Decision 1.6: Refresh Persistence
- Creator flow updates the browser address bar with `history.replaceState(null, "", "/light?d=" + publicId)`.
- On browser reload, `/light` fetches the existing record and immediately restores the lit card and wish without re-rolling.

