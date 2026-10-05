@AGENTS.md

# GymFlow

A simple gym management web app for small gyms: register members, check them in, take payments, and never miss a renewal. The first target is a single pilot gym in Sri Lanka (about 250 members, 2 receptionists, one old Windows PC at the desk). No pilot gym is confirmed yet, so every business rule below is a guessed default until the owner answers real questions.

This repo is currently a **static demo** hosted on GitHub Pages. All data lives in the visitor's browser. There is no backend yet. This is an MVP: build only what stops the owner from showing it to a gym.

- Repo: `deelaka-ransilu/gymflow` (public, required for free GitHub Pages)
- Live site: https://deelaka-ransilu.github.io/gymflow/
- Local folder: `E:\1-Active\GymFlow` (Windows, PowerShell 7, VS Code)
- Scope document: `README.md` (the original MVP scope, written before the static-demo decision; where they differ, this file wins)

## How to work with the owner of this repo

- Keep explanations short, plain and step by step. Give exact commands for PowerShell.
- When walking through terminal commands, give one step, then wait for the output before saying more.
- Give **full file contents** for any new or replaced file, never partial snippets.
- When unseen files are needed, give a PowerShell file-collector script (one txt output, run from the GymFlow root) instead of asking for pasted files.
- Prefer the simplest thing that works. Do not add libraries, services or abstractions "for later".
- When a screen is finished, tell the owner what to click to test it.
- Chain build and push so a failed build stops the push:
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
| QR codes | `qrcode` (member cards and the pay page, generated in the browser) |
| Fonts | Poppins (body), Barlow Condensed (headings), loaded with `next/font/google` |
| Hosting | GitHub Pages via `.github/workflows/deploy.yml` |

## Commands

```
npm run dev      # local dev server at http://localhost:3000
npm run build    # static export into /out (must pass before every push)
npm run lint     # ESLint
```

There is no test suite. `npm run build` (which runs the TypeScript check) is the main safety net.

## Project structure

```
src/
  app/
    layout.tsx              fonts, metadata, <html data-mode="dark">
    globals.css             Tailwind, Kumo styles, theme overrides, smooth scroll, print rules
    page.tsx                landing page (server component, see "Landing page")
    app/                    the demo, lives at /app
      layout.tsx            demo shell: sign-in gate, Mac window frame, menu, buttons under the window, seeds data
      page.tsx              Home dashboard
      check-in/page.tsx     Check-in
      members/page.tsx      Members list
      members/new/page.tsx  Add member
      members/view/page.tsx Member profile (?id=...)
      members/pay/page.tsx  Payment, receipt and QR card (?id=...)
      expiring/page.tsx     Expiring soon (Call, Message, Renew)
      backup/page.tsx       Backup (owner only)
  components/
    AnimatedBackground.tsx  WebGL orange halftone background for the demo
    AppPreview.tsx          fake Home dashboard in a Mac window, used on the landing page
    Login.tsx               "Sign in to the demo" screen (Owner / Receptionist)
    StatusBadge.tsx         Active / Expiring soon / Expired pill
    landing/
      Reveal.tsx            fade-and-slide on scroll, the only landing motion
      ScreenPictures.tsx    small HTML pictures of check-in, receipt and expiring screens
  db/
    types.ts                Role, Plan, Member, Payment, Visit, Setting
    db.ts                   Dexie database "gymflow" and its tables
    seed.ts                 20 demo members, plans, settings; resetDemo, ensureSeeded
    queries.ts              nowLocal, lastVisit, recordVisit
    members.ts              member create and update logic
    payments.ts             recordPayment, cancel payment, receipt numbers
    renewals.ts             renewal logic
  lib/
    rules.ts                all date and business rules (see below)
    format.ts               formatDate, initials
    role.tsx                demo sign-in and role context (see "Demo behavior")
```

## Architecture rules

1. **Static export only.** `next.config.ts` uses `output: "export"` with `trailingSlash: true`. That means no API routes, no server actions, no middleware, no server-side rendering, no Prisma, and no dynamic route segments like `/members/[id]`.
2. **Use query strings for IDs.** Member profile is `/app/members/view?id=...` and payment is `/app/members/pay?id=...`. Read the id with `useSearchParams` in a client component wrapped in `<Suspense>`.
3. **`basePath` is `/gymflow` in production only.** Use `next/link` and `useRouter` so it is applied automatically. Never hard-code `/gymflow/` into links. Plain `<a href>` only for `#anchors`, `tel:` and external links.
4. **Browser-only code goes in client components.** Anything touching Dexie, Kumo, `localStorage`, `window` or WebGL needs `"use client"` and must not run at module level. Read data inside hooks such as `useLiveQuery` or `useEffect`. The landing page (`page.tsx`) stays a server component; only `Reveal` is a client component there.
5. **Keep the data layer swappable.** Screens call functions from `src/db/` and `src/lib/`. Prefer small functions in `src/db/` over new direct `db` queries inside pages (check-in and expiring still query `db` directly for brevity).
6. **Business rules live in `src/lib/rules.ts`.** Do not re-implement date, status or renewal logic inside a page.
7. **Dates are plain strings.** Calendar dates are `YYYY-MM-DD`; timestamps are local ISO-like strings `YYYY-MM-DDTHH:mm:ss` from `nowLocal()`. Do not store `Date` objects or UTC timestamps.
8. **Prices and the admission fee come from the database** (`plans` table and `settings` keys `admissionFee`, `expiringDays`), never from constants inside screens.
9. **`localStorage` is used only for the demo sign-in:** `gf-role` and `gf-signed-in`. All business data goes in IndexedDB.
10. If the schema changes, add a new `this.version(n).stores({...})` in `db.ts`; never edit an old version in place.

## Data model (Dexie database `gymflow`)

| Table | Key and indexes | Purpose |
|---|---|---|
| `plans` | `id` | Plan name, months, price (`plan-1` = 1 month LKR 2,000; `plan-5` = 5 months LKR 7,500) |
| `members` | `id`, `number`, `phone`, `nic`, `expiresOn` | Member profile, current plan, join and expiry dates, balance owed |
| `payments` | `++id`, `memberId`, `at` | Receipt number, amount, method (`cash` or `bank`), kind (`admission`, `membership`, `balance`), who took it, `cancelled` flag |
| `visits` | `++id`, `memberId`, `at` | Attendance, with `override` when an expired member was let in |
| `settings` | `key` | Numeric settings: `admissionFee` (500), `expiringDays` (7) |

Check `db.ts` for the current schema version before changing anything.

## Business rules (guessed defaults, to confirm with the pilot gym)

**Plans and fees**
- 1 month costs LKR 2,000. 5 months costs LKR 7,500. Admission (joining) fee is LKR 500, one time.
- The admission fee applies to new members. It is charged again only if the member returns after more than about 90 days away. Only the owner can waive it. Discounts are owner only.
- Freezing does not exist at this gym, so it is not built.

**Status** (`statusOf` in `rules.ts`)
- Expired: expiry date is before today.
- Expiring soon: 7 days or fewer left (including today), from the `expiringDays` setting.
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
- Active: green "Welcome back, [first name]!" (or "Welcome, [first name]!" on a first visit) and the visit is recorded.
- Expiring soon: yellow, shows days left, visit recorded.
- Expired: red "Membership expired". The receptionist may press **Let in anyway**, which records the visit with `override: true`.
- A balance owed is shown but never blocks entry.
- A member already checked in today is not recorded a second time.
- Demo helpers on the screen: "Try:" chips for one active, one expiring and one expired member, and **Simulate scan** (random member).

**Payments**
- Methods: cash and bank transfer.
- Part-payments are allowed; the unpaid amount is kept in `member.balance`.
- Every payment records which role took it.
- Receptionists cannot edit or delete payments and cannot see revenue totals.
- The owner can **cancel** a payment. Cancelled payments stay on record, flagged `cancelled`, and are never deleted.
- Receipts and QR member cards are printed with the browser print dialog on A4. Print rules live in `globals.css` and use `body[data-print="receipt"|"card"]` with the classes `receipt-sheet` and `card-sheet`.

**Roles**
- Owner: everything, including revenue, cancelling payments, and the Backup page.
- Receptionist: add and edit members, check in, take payments, print receipts. No revenue, no Backup, no cancelling payments.

**Reminders**
- The Expiring page lists members in groups (Today, Next 3 days, then up to the `expiringDays` limit) with **Call** (`tel:` link), **Message** (opens WhatsApp with a ready-written reminder through a `wa.me` link) and **Renew**.
- The Message button converts local Sri Lankan numbers (`077...`) to `94...`. There are no automatic messages; sending them needs a backend.

**Backup**
- Owner only. Export backup (JSON download), Import backup, last export date with a gentle warning, and Reset demo data. This matters because clearing browser data deletes everything.

## Demo behavior

- **Sign-in:** opening `/app` first shows "Sign in to the demo" (`Login.tsx`) with **Continue as Owner** and **Continue as Receptionist**. No password; this is a convenience, not security. `src/lib/role.tsx` exposes `role`, `signedIn` (null while checking, then true or false), `signIn(role)` and `signOut()`, stored in `localStorage` keys `gf-role` and `gf-signed-in`. The top bar shows "Signed in as X" and a Sign out button.
- **Window frame:** on `lg` screens and up the whole demo sits in a Mac-style window (traffic lights, address bar, fixed height, content scrolls inside). Below `lg` it is full width with no frame. Printing hides the frame. The GymFlow logo in the demo links to `/app`.
- **Buttons under the window:** **Back to website** (`/`) and **Get this for your gym** (`/#contact`). All of this is in `src/app/app/layout.tsx`.
- **Background:** `AnimatedBackground.tsx` draws an orange halftone flow with a WebGL canvas (no iframe). It is capped near 30 fps, pauses when the tab is hidden, draws one still frame if "reduce motion" is on, and is hidden when printing. **Do not call `loseContext()` in the cleanup:** it broke the canvas in React dev strict mode. Do not go back to CSS blobs; they lagged.
- **Seeding:** the demo shell calls `ensureSeeded()` on load; the first visit fills the browser with 20 fake members covering every status (two expired, several expiring, one with a LKR 1,000 balance). **Reset demo data** on the Backup page calls `resetDemo()`.
- There is no scanner hardware. **Simulate scan** picks a random member and shows the same result as a real scan. On real hardware a USB scanner types the member number into the same search box and presses Enter.

## Landing page (`src/app/page.tsx`)

Calm, SaaS-style (Apple, Stripe, Linear inspiration): one idea per section, product shown large, one repeated action. Dark only.

**Section order:** sticky nav (How it works, Pricing, FAQ, Contact, orange **Try the demo**), hero ("Run your gym from one simple screen.", one big Try the demo button, "No sign-up. 20 sample members. Your data stays in this browser."), the product window (`AppPreview`, the whole window links to `/app`), "Every front desk asks the same three things", "Green. Yellow. Red." (three tall static colour panels, then a Try the demo button), "Your day at the desk" (three rows, each with a small picture from `ScreenPictures`), "Try it as the owner or the receptionist" (explains the two sign-ins, then a Try the demo button), Pricing, FAQ (native `<details>`), and the closing "Try it with 20 sample members" with Try the demo and WhatsApp.

**Rules for the landing page:**
- Every section leads to **Try the demo**.
- Only claim what is actually built. No invented proof (no logos, quotes or user counts) until the pilot gym is confirmed; a real owner quote is the future proof element.
- Pricing is a single card, "Founding gym offer: Talk to us", with a list of what is built and no price. Do not add price tiers or an Automatic reminders tier until the backend exists.
- Motion is limited to the gentle fade-and-slide on scroll (`Reveal`) and smooth anchor scrolling (off for reduced motion).
- **Not BITprep-style.** Do not add floating tilted cards, crossed ticker bands or marquees, word-by-word headline animation, a shine sweep on the button, or a hard offset shadow. These were removed on purpose.
- The preview in `AppPreview` is drawn in HTML and CSS, not a live iframe or screenshot. It uses a soft orange glow and a thin orange border.
- `WHATSAPP_NUMBER` at the top of `page.tsx` is still the placeholder `94XXXXXXXXX`. Replace it (country code, no `+` or spaces) before sharing the site.
- Names, dates and amounts in `AppPreview` and `ScreenPictures` are sample data, not read from the database.

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
| Accent (actions, selected menu) | `#FF6A00`, hover `#FF8533`, black text on orange buttons |
| Active status | green `#22C55E` text on a faint green tint |
| Expiring status | yellow `#FACC15` text on a faint yellow tint |
| Expired status | red `#EF4444` text on a faint red tint |

Rules:
- Orange is only for actions, the selected menu item and the accent word in headlines.
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

## Status

All roadmap screens are built and deployed: Check-in, Members list, Add member, Payment with receipt and QR card, Member profile with Renew and cancel payment, Expiring (with Call, Message and Renew), Home dashboard, Backup, demo sign-in, Mac window frame, animated background, and the redesigned landing page.

**Manual tests still unconfirmed** (click Reset demo data first): Renew on GF-0016 followed by a part-payment; Cancel payment as Owner and its absence as Receptionist; a second check-in blocked in one day; Simulate scan; Backup export, import, a bad file and the receptionist lock; Record payment then Print receipt; the Check-in "Welcome" wording; the Message button on the Expiring page.

**Open items:**
- Replace the WhatsApp placeholder number.
- Polish: toasts for saved payment and renewal (run `npx @cloudflare/kumo doc Toasty` first), empty states, phone and tablet check of the demo.
- Show the demo to a real gym owner. Their answers decide the business rules, pricing and whether a backend is needed.
- Optional: an Open Graph share image (needs a PNG in `public/` and an absolute URL).

## Not in scope (do not build unless asked)

POS or shop, CRM or leads, classes and booking, workout plans, body progress, trainers module, member portal, freezing, multi-location, multi-company, Sinhala or Tamil, automatic WhatsApp or SMS (needs a backend), online payments, licensing and a control cloud, an update system, dark/light toggle, PDF or Excel exports beyond basic JSON and CSV, and any real authentication.

## Gotchas

- Running several commands on separate PowerShell lines does not stop when one fails. Use `&&` to chain them (PowerShell 7). In older PowerShell use `;`.
- GitHub Pages serves the site under `/gymflow/`. If CSS or JS fails to load after a deploy, check `basePath` first.
- Dexie and WebGL cannot run during the build. A crash like "indexedDB is not defined" means a call is running at module level or during server rendering; move it into a hook inside a `"use client"` component.
- `npm audit --omit=dev` found 0 vulnerabilities (checked 2026-10-05); the 5 high-severity warnings from plain `npm audit` are dev-tool only. Never run `npm audit fix --force`; it can break the project. Re-run `npm audit --omit=dev` before any real launch.
- The VS Code warning "Value 'github-pages' is not valid" in `deploy.yml` is a false positive and can be ignored. Git's "LF will be replaced by CRLF" warnings are harmless on Windows.
- The repo is public. Never commit real member data, Excel files or secrets. The `out/` folder is build output; do not edit it.

## Future direction (after a pilot gym is confirmed)

Move from the static demo to a real install at the gym: Next.js or a Node API with PostgreSQL on a small local server, a USB QR scanner, automatic nightly backups to a USB drive, then automatic reminder messages (a paid add-on, since each message costs money), licensing and multi-location. Keep `src/db/` as the only place that knows where data is stored so the screens survive that change.