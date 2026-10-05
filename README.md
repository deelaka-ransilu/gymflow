# GymFlow

A simple gym management demo for small gyms: check-ins, payments and renewals, all on one screen.

**Live demo:** https://deelaka-ransilu.github.io/gymflow/

This is a static demo. There is no server and no real login. All data lives in the browser (IndexedDB), so each browser has its own copy of the data and clearing browser data erases it. Use **Backup** to export and import a JSON file.

## What it does

- **Check-in**: search by name, phone or member number, or simulate a QR scan. Green for active, yellow when expiring soon, red when expired (with a logged "Let in anyway" override).
- **Members**: list, search, add, profile with payment and visit history.
- **Payments**: cash or bank transfer, part-payments with balance tracking, printable receipts and QR member cards.
- **Renewals**: renewing on time continues from the old expiry date, renewing late starts from today. The admission fee is charged again after about 3 months away.
- **Expiring**: members expiring in the next 7 days, grouped for phone calls.
- **Home**: active members, check-ins today, expiring count, money today (owner only).
- **Backup**: export and import JSON, last-export warning, reset demo data.
- **Roles**: an Owner / Receptionist switch. Receptionists cannot see revenue, open Backup, waive fees or cancel payments. This is for demonstration only and is not real security.

## Tech

- Next.js 16 (App Router) with static export (`output: 'export'`)
- Dexie (IndexedDB) for browser storage
- Cloudflare Kumo UI, Tailwind CSS v4
- `qrcode` for member cards
- Hosted on GitHub Pages, deployed by GitHub Actions on every push to `main`

## Project structure

```
src/
  app/            Pages (landing page and /app/* screens)
  components/     Shared UI such as StatusBadge
  db/             All database access (Dexie tables, seed, queries, payments, renewals)
  lib/            Business rules (dates, status, renewal, formatting) and role context
```

All data access lives in `src/db/` and the business rules live in `src/lib/`, so a real backend can replace `src/db/` later without rewriting the screens.

Because of static export, there are no dynamic routes. Member pages use query strings, for example `/app/members/view?id=...`.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. In production the site is served under the `/gymflow` base path.

## Build

```bash
npm run build
```

The static site is written to `out/`.

## Not in this demo

POS, CRM, classes, workouts, progress tracking, a member portal, membership freezing, multiple locations, Sinhala/Tamil, automatic WhatsApp/SMS, online payments, licensing, real authentication, and a USB QR scanner (the demo uses a Simulate scan button).