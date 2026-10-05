@AGENTS.md

# GymFlow

A simple gym management web app for small gyms: register members, check them in, take payments, and never miss a renewal. The first target is a single pilot gym in Sri Lanka (about 250 members, 2 receptionists, one old Windows PC at the desk).

This repo is currently a **static demo** hosted on GitHub Pages. All data lives in the visitor's browser. There is no backend yet.

- Repo: `deelaka-ransilu/gymflow` (public, required for free GitHub Pages)
- Live site: https://deelaka-ransilu.github.io/gymflow/
- Local folder: `E:\1-Active\GymFlow` (Windows, PowerShell 7, VS Code)
- Scope document: `README.md` (the original MVP scope, written before the static-demo decision; where they differ, this file wins)

## How to work with the owner of this repo

- Keep explanations short, plain and step by step. Give exact commands for PowerShell.
- Prefer the simplest thing that works. Do not add libraries, services or abstractions "for later".
- When a screen is finished, tell the owner what to click to test it.
- Always chain build and push so a failed build stops the push:
  `npm run build && git add . && git commit -m "message" && git push`
- Pushing to `main` deploys automatically through GitHub Actions. Never push a failing build.
- Check Kumo components with `npx @cloudflare/kumo doc <Name>` before using them. Do not guess props.

## Stack

| Area | Choice |
|---|---|
| Framework | Next.js 16, App Router, TypeScript, **static export** |
| Styling | Tailwind CSS v4 plus Cloudflare Kumo semantic tokens |
| Components | `@cloudflare/kumo` (React, built on Base UI), `@phosphor-icons/react` for icons |
| Storage | Dexie (IndexedDB) with `dexie-react-hooks` (`useLiveQuery`) |
| Fonts | Poppins (body), Barlow Condensed (headings), loaded with `next/font/google` |
| Hosting | GitHub Pages via `.github/workflows/deploy.yml` |

Planned but not installed yet: `qrcode` (QR cards in the browser).

## Commands

```
npm run dev      # local dev server at http://localhost:3000
npm run build    # static export into /out (must pass before every push)
npm run lint     # ESLint
```

There is no test suite yet. `npm run build` (which runs the TypeScript check) is the main safety net.

## Project structure

```
src/
  app/
    layout.tsx            fonts, <html data-mode="dark">
    globals.css           Tailwind, Kumo styles, theme token overrides
    page.tsx              landing page
    app/
      layout.tsx          app shell: demo banner, role switch, menu, seeds data on load
      page.tsx            Home dashboard (placeholder)
      check-in/page.tsx   Check-in (DONE)
      members/page.tsx    Members list (placeholder)
      expiring/page.tsx   Expiring soon (placeholder)
      backup/page.tsx     Backup (placeholder, owner only)
  components/
    StatusBadge.tsx       Active / Expiring soon / Expired pill
  db/
    types.ts              Role, Plan, Member, Payment, Visit, Setting
    db.ts                 Dexie database "gymflow" and its tables
    seed.ts               20 demo members, plans, settings; resetDemo, ensureSeeded
    queries.ts            nowLocal, lastVisit, recordVisit
  lib/
    rules.ts              all date and business rules (see below)
    format.ts             formatDate, initials
    role.tsx              Owner / Receptionist context, remembered in localStorage
```

Still to create: `src/app/app/members/new/`, `members/view/`, `members/pay/`.

## Architecture rules

1. **Static export only.** `next.config.ts` uses `output: "export"`. That means no API routes, no server actions, no middleware, no server-side rendering, no Prisma, and no dynamic route segments like `/members/[id]`.
2. **Use query strings for IDs.** Member profile is `/app/members/view?id=...` and payment is `/app/members/pay?id=...`. Read the id with `useSearchParams` in a client component, wrapped in `<Suspense>` if the build complains.
3. **`basePath` is `/gymflow` in production only.** Use `next/link` and `useRouter` so it is applied automatically. Never hard-code `/gymflow/` into links.
4. **Browser-only code goes in client components.** Anything touching Dexie, Kumo, `localStorage` or `window` needs `"use client"` at the top and must not run at module level. Read data inside hooks such as `useLiveQuery` or `useEffect`.
5. **Keep the data layer swappable.** Screens call functions from `src/db/` and `src/lib/`. No screen should talk to Dexie tables in a way that would be hard to replace with a real backend later. Check-in currently queries `db` directly for brevity; new work should prefer small functions in `src/db/queries.ts`.
6. **Business rules live in `src/lib/rules.ts`.** Do not re-implement date, status or renewal logic inside a page.
7. **Dates are plain strings.** Calendar dates are `YYYY-MM-DD`; timestamps are local ISO-like strings `YYYY-MM-DDTHH:mm:ss` from `nowLocal()`. Do not store `Date` objects or UTC timestamps in the database.
8. **Prices and the admission fee come from the database** (`plans` table and `settings` keys `admissionFee`, `expiringDays`), never from constants inside screens.
9. `localStorage` is used only for the role switch (`gf-role`). All business data goes in IndexedDB.

## Data model (Dexie database `gymflow`, version 1)

| Table | Key and indexes | Purpose |
|---|---|---|
| `plans` | `id` | Plan name, months, price (`plan-1` = 1 month LKR 2,000; `plan-5` = 5 months LKR 7,500) |
| `members` | `id`, `number`, `phone`, `nic`, `expiresOn` | Member profile, current plan, join and expiry dates, balance owed |
| `payments` | `++id`, `memberId`, `at` | Receipt number, amount, method (`cash` or `bank`), kind (`admission`, `membership`, `balance`), who took it, `cancelled` flag |
| `visits` | `++id`, `memberId`, `at` | Attendance, with `override` when an expired member was let in |
| `settings` | `key` | Numeric settings: `admissionFee` (500), `expiringDays` (7) |

If the schema changes, add `this.version(2).stores({...})` in `db.ts`; never edit version 1 in place.

## Business rules

**Plans and fees**
- 1 month costs LKR 2,000. 5 months costs LKR 7,500. Admission (joining) fee is LKR 500, one time.
- The admission fee applies to new members. It is charged again only if the member returns after more than about 3 months away. Only the owner can waive it. Discounts are owner only.
- Freezing does not exist at this gym, so it is not built.

**Status** (`statusOf` in `rules.ts`)
- Expired: expiry date is before today.
- Expiring soon: 7 days or fewer left (including today).
- Active: otherwise.

**Renewal** (`renewedExpiry` in `rules.ts`)
- Renewed on time (expiry date today or later): the new period starts at the old expiry date.
- Renewed late (already expired): the new period starts today.

**Members**
- Required: name, phone. Also collected: NIC, address, emergency contact, health tick box, photo.
- NIC must be unique when present. Phone numbers may be shared (couples, parents paying for children).
- Under-18 members can join without a NIC if a guardian is recorded.
- Member numbers are `GF-0001` style, assigned automatically. Receipt numbers are `R-0001` style.

**Check-in**
- Active: green "Welcome back, [first name]!" and the visit is recorded.
- Expiring soon: yellow, shows days left, visit recorded.
- Expired: red "Membership expired". The receptionist may press **Let in anyway**, which records the visit with `override: true`.
- A balance owed is shown but never blocks entry.
- A member who is already checked in today is not recorded a second time.

**Payments**
- Methods: cash and bank transfer (card can follow the same flow).
- Part-payments are allowed; the unpaid amount is kept in `member.balance`.
- Every payment records which role took it.
- Receptionists cannot edit or delete payments and cannot see revenue totals.
- The owner can **cancel** a payment. Cancelled payments stay on record, flagged `cancelled`, and are never deleted.
- Receipts and QR member cards are printed with the browser print dialog on A4.

**Roles (demo)**
- Owner: everything, including revenue, cancelling payments, Backup page.
- Receptionist: add and edit members, check in, take payments, print receipts. No revenue, no Backup, no cancelling payments.
- The demo has no login. The role is a switch in the top bar. It is a convenience, not security.

**Reminders**
- A daily "Expiring" list (Today, Next 3 days, Next 7 days) with Call and Renew. No automatic messages.

**Backup**
- Export backup (JSON download) and Import backup. Show the last export date with a gentle warning. Reset demo data also lives on this page. This matters because clearing browser data deletes everything.

## Design system

Dark only. Never add a light mode.

| Use | Color |
|---|---|
| Page background | `#121212` |
| Cards | `#1C1C1C` |
| Raised items | `#242424` |
| Borders | `#2E2E2E` |
| Text | `#F5F5F5` |
| Secondary text | `#A3A3A3` |
| Accent (actions, selected menu) | `#FF6A00`, hover `#FF8533` |
| Active status | green `#22C55E` text on a faint green tint |
| Expiring status | yellow `#FACC15` text on a faint yellow tint |
| Expired status | red `#EF4444` text on a faint red tint |

Rules:
- Orange is only for actions and the selected menu item.
- Green, yellow and red mean member status only, and always appear with a word ("Active", "Expiring soon", "Expired"), never color alone.
- Headings use Barlow Condensed via the `font-heading` class (weight 600). Everything else is Poppins, including names, dates, phone numbers and prices.
- Cards are 12px rounded with soft borders, no heavy shadows. Buttons are at least 44px tall for tablet use.
- Use plain language in all text. Error messages say what to do, for example "Phone number is already used by another member."
- Currency is shown as `LKR 2,000` using `formatLKR`.

## Kumo notes

- Theme is switched on by `data-mode="dark"` on `<html>` (set in `layout.tsx`). Colors are overridden in `globals.css` under `html[data-mode="dark"]` using Kumo tokens (`--color-kumo-brand`, `--color-kumo-base`, `--color-kumo-line`, `--text-color-kumo-default`, and so on).
- Tailwind classes backed by Kumo tokens: `bg-kumo-base`, `bg-kumo-tint`, `border-kumo-line`, `text-kumo-subtle`, `text-kumo-default`. The accent utility is `text-accent` (defined in `globals.css`).
- Button variants: `primary`, `secondary`, `ghost`, `outline`, `destructive`. Sizes: `xs`, `sm`, `base`, `lg`.
- Table: `Table`, `Table.Header`, `Table.Head`, `Table.Row`, `Table.Body`, `Table.Cell`, usually inside `<LayerCard className="p-0">`.
- Input accepts `label`, `description`, `error`, `size`. Field wraps other controls with `label`, `description`, `error`.
- Dialog: `Dialog.Root`, `Dialog.Trigger`, `<Dialog>` (content), `Dialog.Title`, `Dialog.Description`, `Dialog.Close`, with `render` props for the buttons.
- Other available components worth using: Select, DatePicker, Tabs, Banner, Toasty (toasts), Empty (empty states), Pagination, Meter, Grid, CommandPalette.
- `StatusBadge` is hand-built on purpose so the status colors stay exactly as specified.

## Demo behavior

- The landing page headline is "Run your gym from one simple screen." with the line "Check-ins, payments and renewals." Buttons: **Try the demo** (goes to `/app/check-in`) and **See how it works** (scrolls to the feature cards).
- The app shell calls `ensureSeeded()` on load; the first visit fills the browser with 20 fake members covering every status (two expired, several expiring, one with a LKR 1,000 balance).
- **Reset demo data** in the demo banner calls `resetDemo()` and reloads.
- There is no scanner hardware. **Simulate scan** picks a random member and shows the same result as a real scan. On real hardware a USB scanner types the member number into the same search box and presses Enter.

## Not in scope (do not build unless asked)

POS or shop, CRM or leads, classes and booking, workout plans, body progress, trainers module, member portal, freezing, multi-location, multi-company, Sinhala or Tamil, automatic WhatsApp or SMS, online payments, licensing and a control cloud, an update system, dark/light toggle, a command palette, PDF or Excel exports beyond basic JSON and CSV, and any real authentication.

## Roadmap (in order)

1. Check-in screen: done. Pending the owner's manual test report.
2. Members list with Kumo Table, search and status badges.
3. Add member form (admission fee added automatically, owner can waive).
4. Payment page: part-payments, receipt number, printable receipt, QR card.
5. Member profile with payment history, attendance and Renew; owner can cancel a payment.
6. Expiring page.
7. Home dashboard (money visible to the owner only).
8. Backup page: export, import, last-export warning, reset demo data.
9. Polish: empty states, toasts, tablet and phone layout, README update, npm audit review.

## Gotchas

- Running several commands on separate PowerShell lines does not stop when one fails. Use `&&` to chain them.
- GitHub Pages serves the site under `/gymflow/`. If CSS or JS fails to load after a deploy, check `basePath` first.
- Dexie cannot run during the build. A crash like "indexedDB is not defined" means a Dexie call is running at module level or during server rendering; move it into a hook inside a `"use client"` component.
- npm reports 5 high-severity audit warnings. Do not run `npm audit fix --force`; it can break the project. Review them before any real launch.
- The VS Code warning "Value 'github-pages' is not valid" in `deploy.yml` is a false positive and can be ignored. Git's "LF will be replaced by CRLF" warnings are harmless on Windows.
- The repo is public. Never commit real member data, Excel files or secrets.

## Future direction (after a pilot gym is confirmed)

Move from the static demo to a real install at the gym: Next.js or a Node API with PostgreSQL on a small local server, a USB QR scanner, automatic nightly backups to a USB drive, then licensing and multi-location. Keep `src/db/` as the only place that knows where data is stored so the screens survive that change.