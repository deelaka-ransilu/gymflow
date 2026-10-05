@AGENTS.md

# GymFlow

A simple gym management web app for small gyms: register members, check them in, take payments, and never miss a renewal. The first target is a single pilot gym in Sri Lanka (about 250 members, 2 receptionists, one old Windows PC at the desk).

This repo is currently a **static demo** hosted on GitHub Pages. All data lives in the visitor's browser. There is no backend yet. Every screen on the original roadmap is built; what remains is polish and confirming a pilot gym.

- Repo: `deelaka-ransilu/gymflow` (public, required for free GitHub Pages)
- Live site: https://deelaka-ransilu.github.io/gymflow/
- Local folder: `E:\1-Active\GymFlow` (Windows, PowerShell 7, VS Code)
- `README.md` describes the static demo for visitors. Where `README.md` and this file differ, this file wins.

## How to work with the owner of this repo

- Keep explanations short, plain and step by step. Give exact commands for PowerShell.
- Prefer the simplest thing that works. Do not add libraries, services or abstractions "for later".
- For code changes, give **full file contents** for replaced files (the owner prefers whole files over diffs or snippets), and full contents for new files.
- When a screen is finished, tell the owner what to click to test it.
- Always chain build and push so a failed build stops the push:
  `npm run build && git add . && git commit -m "message" && git push`
- Pushing to `main` deploys automatically through GitHub Actions. Never push a failing build.
- Check Kumo components with `npx @cloudflare/kumo doc <Name>` before using them. Do not guess props.
- To see files you do not have, give the owner a PowerShell file-collector script (one txt output) instead of asking for pasted files one by one.

## Stack

| Area | Choice |
|---|---|
| Framework | Next.js 16, App Router, TypeScript, **static export** |
| Styling | Tailwind CSS v4 plus Cloudflare Kumo semantic tokens |
| Components | `@cloudflare/kumo` (React, built on Base UI), `@phosphor-icons/react` for icons |
| Storage | Dexie (IndexedDB) with `dexie-react-hooks` (`useLiveQuery`) |
| QR codes | `qrcode` (`@types/qrcode` as a dev dependency), drawn in the browser |
| Fonts | Poppins (body), Barlow Condensed (headings), loaded with `next/font/google` |
| Hosting | GitHub Pages via `.github/workflows/deploy.yml` |

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
    layout.tsx              fonts, <html data-mode="dark">, page metadata
    globals.css             Tailwind, Kumo styles, theme tokens, A4 print rules
    page.tsx                landing page
    app/
      layout.tsx            app shell: demo banner, role switch, menu, seeds data on load
      page.tsx              Home dashboard
      check-in/page.tsx     Check-in with demo chips
      members/page.tsx      Members list (Kumo Table, search)
      members/new/page.tsx  Add member form
      members/pay/page.tsx  Payment, receipt, QR member card
      members/view/page.tsx Member profile, Renew, owner Cancel payment
      expiring/page.tsx     Expiring soon, grouped
      backup/page.tsx       Backup (owner only)
  components/
    StatusBadge.tsx         Active / Expiring soon / Expired pill
    AppPreview.tsx          Mac-style window on the landing page, iframe of /app
  db/
    types.ts                Role, Plan, Member, Payment, Visit, Setting
    db.ts                   Dexie database "gymflow" and its tables
    seed.ts                 20 demo members, plans, settings; resetDemo, ensureSeeded
    queries.ts              nowLocal, lastVisit, recordVisit
    members.ts              admissionFee, nicInUse, createMember
    payments.ts             recordPayment (receipt numbers, balance reduction)
    renewals.ts             needsAdmissionAgain, renewMember, cancelPayment
  lib/
    rules.ts                all date and business rules (see below)
    format.ts               formatDate, initials
    role.tsx                Owner / Receptionist context, remembered in localStorage
```

## Architecture rules

1. **Static export only.** `next.config.ts` uses `output: "export"`. That means no API routes, no server actions, no middleware, no server-side rendering, no Prisma, and no dynamic route segments like `/members/[id]`.
2. **Use query strings for IDs.** Member profile is `/app/members/view?id=...` and payment is `/app/members/pay?id=...`. Read the id with `useSearchParams` in a client component, and wrap that component in `<Suspense>` or the build fails (see `pay` and `view` pages, which split into an inner component and a default export).
3. **`basePath` is `/gymflow` in production only.** Use `next/link` and `useRouter` so it is applied automatically. Never hard-code `/gymflow/` into links or `router.push`. **One exception:** an `<iframe src>` does not go through Next, so `AppPreview.tsx` builds its address from `process.env.NODE_ENV === "production" ? "/gymflow" : ""`, matching `next.config.ts`.
4. **Browser-only code goes in client components.** Anything touching Dexie, Kumo, `localStorage` or `window` needs `"use client"` at the top and must not run at module level. Read data inside hooks such as `useLiveQuery` or `useEffect`.
5. **Keep the data layer swappable.** Screens call functions from `src/db/` and `src/lib/`. Writes (create member, record payment, renew, cancel payment) live in `src/db/*.ts` as transactions. Some pages (Check-in, Members, Home, Expiring, profile) still read Dexie tables directly with `useLiveQuery` for brevity; new write logic should go in `src/db/`.
6. **Business rules live in `src/lib/rules.ts`.** Do not re-implement date, status or renewal logic inside a page.
7. **Dates are plain strings.** Calendar dates are `YYYY-MM-DD`; timestamps are local ISO-like strings `YYYY-MM-DDTHH:mm:ss` from `nowLocal()`. Do not store `Date` objects or UTC timestamps in the database.
8. **Prices and the admission fee come from the database** (`plans` table and `settings` keys `admissionFee`, `expiringDays`), never from constants inside screens. (`createMember` and the form fall back to 500 only if the setting is missing.)
9. `localStorage` is used only for the role switch (`gf-role`). All business data goes in IndexedDB.
10. **Money rule: `member.balance` is the amount still owed.** Adding a member sets it to plan price plus admission fee; Renew adds the plan price (plus admission fee after a long absence); recording a payment subtracts; cancelling a payment adds it back. Payments cannot exceed the balance.

## Data model (Dexie database `gymflow`, version 1)

| Table | Key and indexes | Purpose |
|---|---|---|
| `plans` | `id` | Plan name, months, price (`plan-1` = 1 month LKR 2,000; `plan-5` = 5 months LKR 7,500) |
| `members` | `id`, `number`, `phone`, `nic`, `expiresOn` | Member profile, current plan, join and expiry dates, balance owed |
| `payments` | `++id`, `memberId`, `at` | Receipt number, amount, method (`cash` or `bank`), kind (`admission`, `membership`, `balance`), who took it, `cancelled` flag |
| `visits` | `++id`, `memberId`, `at` | Attendance, with `override` when an expired member was let in |
| `settings` | `key` | Numeric settings: `admissionFee` (500), `expiringDays` (7), `lastExport` (timestamp in ms, set by Backup export) |

Notes:
- Member `id` is `m-1`... in the seed and `crypto.randomUUID()` for new members.
- The under-18 guardian contact is stored in `emergencyContact`; there is no separate guardian or date-of-birth field.
- The admission fee is included in the member's first balance and is not recorded as its own payment row. The `kind` on a payment is only a label (`membership` for a first payment made the day the member joined, otherwise `balance`).
- If the schema changes, add `this.version(2).stores({...})` in `db.ts`; never edit version 1 in place.

## Business rules

**Plans and fees**
- 1 month costs LKR 2,000. 5 months costs LKR 7,500. Admission (joining) fee is LKR 500, one time.
- The admission fee applies to new members. It is charged again only if the member returns after more than 90 days away (`needsAdmissionAgain` in `renewals.ts`). Only the owner can waive it. Discounts are owner only.
- Freezing does not exist at this gym, so it is not built.

**Status** (`statusOf` in `rules.ts`)
- Expired: expiry date is before today.
- Expiring soon: 7 days or fewer left (including today).
- Active: otherwise.

**Renewal** (`renewedExpiry` in `rules.ts`)
- Renewed on time (expiry date today or later): the new period starts at the old expiry date.
- Renewed late (already expired): the new period starts today.
- Renew changes the plan and expiry, adds the cost to the balance, then goes to the payment screen to collect money.

**Members**
- Required: name, phone. Also collected: NIC, address, emergency contact, health tick box. (Photo is not built; demo photos are initials in a circle.)
- NIC must be unique when present. Phone numbers may be shared (couples, parents paying for children).
- Under-18 members can join without a NIC if a guardian is recorded.
- Member numbers are `GF-0001` style, assigned automatically (highest existing number plus one). Receipt numbers are `R-0001` style.

**Check-in**
- Active: green "Welcome back, [first name]!" if there is a previous visit, otherwise "Welcome, [first name]!". The visit is recorded.
- Expiring soon: yellow, shows days left, visit recorded.
- Expired: red "Membership expired". The receptionist may press **Let in anyway**, which records the visit with `override: true`.
- A balance owed is shown but never blocks entry.
- A member who is already checked in today is not recorded a second time.
- Under the search box, "Try" chips check in `GF-0001` (active), `GF-0007` (expiring) and `GF-0016` (expired) in one click, for the demo.

**Payments**
- Methods: cash and bank transfer.
- Part-payments are allowed; the unpaid amount stays in `member.balance`.
- Every payment records which role took it.
- Receptionists cannot edit or delete payments and cannot see revenue totals.
- The owner can **cancel** a payment from the member profile. Cancelled payments stay on record, struck through and flagged `cancelled`, are never deleted, and the amount returns to the balance.
- Receipts and QR member cards are printed with the browser print dialog on A4. `printSheet()` sets `document.body.dataset.print` to `"receipt"` or `"card"`, and the `@media print` rules in `globals.css` hide everything except that sheet. The QR code contains only the member number, so a USB scanner (which types like a keyboard) works with the existing search box.

**Roles (demo)**
- Owner: everything, including revenue, waiving fees, cancelling payments, Backup page.
- Receptionist: add members, check in, take payments, print receipts. No revenue (Home shows "Members owing money" instead), no Backup (menu item hidden and the page is locked), no waiving fees, no cancelling payments.
- The demo has no login. The role is a switch in the top bar. It is a convenience, not security.

**Reminders**
- The Expiring page lists members expiring within `expiringDays`, grouped Today / Next 3 days / 4 to 7 days, each with Call (`tel:` link) and Renew (opens the profile). No automatic messages.

**Home dashboard**
- Active members (not expired), check-ins today, expiring count, money today (owner only; cancelled payments excluded), plus the next five expiring members.

**Backup**
- Export downloads one JSON file (`gymflow-backup-<date>.json`) and records `lastExport`. Import checks the file is a GymFlow backup, asks for confirmation, then replaces all data. A yellow warning shows when there has never been an export or the last one is 7 or more days old. Reset demo data also lives on this page. This matters because clearing browser data deletes everything.

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
- Orange is only for actions and the selected menu item (the landing page also uses it for the headline highlight).
- Green, yellow and red mean member status only, and always appear with a word ("Active", "Expiring soon", "Expired"), never color alone. (The red, yellow and green dots on the landing page's Mac window are window controls, not statuses.)
- Headings use Barlow Condensed via the `font-heading` class (weight 600). Everything else is Poppins, including names, dates, phone numbers and prices.
- Cards are 12px rounded with soft borders, no heavy shadows. Buttons are at least 44px tall for tablet use.
- Use plain language in all text. Error messages say what to do, for example "This NIC is already registered to another member."
- Currency is shown as `LKR 2,000` using `formatLKR`.

## Kumo notes

- Theme is switched on by `data-mode="dark"` on `<html>` (set in `layout.tsx`). Colors are overridden in `globals.css` under `html[data-mode="dark"]` using Kumo tokens (`--color-kumo-brand`, `--color-kumo-base`, `--color-kumo-line`, `--text-color-kumo-default`, and so on).
- Tailwind classes backed by Kumo tokens: `bg-kumo-base`, `bg-kumo-tint`, `border-kumo-line`, `text-kumo-subtle`, `text-kumo-default`. The accent utility is `text-accent` (defined in `globals.css`).
- Button variants: `primary`, `secondary`, `ghost`, `outline`, `destructive`. Sizes: `xs`, `sm`, `base`, `lg`.
- Table: `Table`, `Table.Header`, `Table.Head`, `Table.Row`, `Table.Body`, `Table.Cell`, inside `<LayerCard className="p-0">` (used on the Members list).
- Input accepts `label`, `description`, `error`, `size`. It does not stretch to a parent's `max-w-*`; add `w-full` to it. Field wraps other controls with `label`, `description`, `error`.
- Dialog: `Dialog.Root`, `Dialog.Trigger`, `<Dialog>` (content), `Dialog.Title`, `Dialog.Description`, `Dialog.Close`, with `render` props for the buttons. (Not used yet; destructive actions use `window.confirm`.)
- Other available components: Select, DatePicker, Tabs, Banner, Toasty (toasts), Empty (empty states), Pagination, Meter, Grid, CommandPalette.
- Plan pickers and checkboxes are plain HTML styled with the theme (checkbox `accent-[#FF6A00]`) instead of Kumo Select, to avoid guessing its API.
- `StatusBadge` is hand-built on purpose so the status colors stay exactly as specified.

## Demo behavior

- **Landing page** (`src/app/page.tsx`): centered headline "Run your gym from one simple screen." and the line "Know in one second who can come in, who owes money, and who needs to renew." Buttons: **Try the demo** (goes to `/app`) and **See how it works** (scrolls to the three-step section). Below the hero is `AppPreview`: a Mac-style window containing an iframe of the real `/app/` Home page, with two decorative floating cards (green welcome, red expired) on large screens. Then How it works (3 steps), three feature cards, a "Want this for your gym?" block with a WhatsApp button, and the footer "Demo data stays in your browser."
- **WhatsApp number is a placeholder.** `WHATSAPP_NUMBER = "94XXXXXXXXX"` at the top of `src/app/page.tsx` must be replaced (country code, no `+` or spaces) before sharing the link with anyone.
- The app shell calls `ensureSeeded()` on load; the first visit fills the browser with 20 fake members covering every status (two expired, several expiring, one with a LKR 1,000 balance). The iframe on the landing page runs the same app on the same site, so it shares the same browser data as the full app.
- In the app shell, the GymFlow logo link has `target="_top"` so clicking it inside the iframe leaves the iframe instead of nesting the landing page.
- **Reset demo data** in the demo banner calls `resetDemo()` and reloads.
- There is no scanner hardware. **Simulate scan** picks a random member and shows the same result as a real scan. On real hardware a USB scanner types the member number into the same search box and presses Enter.
- Page metadata (title, description, Open Graph title and description) is set in `src/app/layout.tsx`. There is no preview image yet.

## Not in scope (do not build unless asked)

POS or shop, CRM or leads, classes and booking, workout plans, body progress, trainers module, member portal, freezing, multi-location, multi-company, Sinhala or Tamil, automatic WhatsApp or SMS, online payments, licensing and a control cloud, an update system, dark/light toggle, a command palette, PDF or Excel exports beyond basic JSON, member photos, and any real authentication.

## Roadmap

Done (all built, pushed and deployed):

1. Check-in screen
2. Members list
3. Add member
4. Payment page with receipt and QR card
5. Member profile with Renew and owner Cancel payment
6. Expiring page
7. Home dashboard
8. Backup page
9. Landing page rework (hero, live Mac-window preview, how-it-works, contact block)

Open items:

- **Still to test manually:** Renew on GF-0016 followed by a part-payment; Cancel payment as Owner (and its absence as Receptionist); a second check-in of the same member in one day (should be blocked); Simulate scan; Backup export, import and the Receptionist lock; the landing page iframe on the live GitHub Pages site (it depends on the `/gymflow` base path).
- Replace the WhatsApp placeholder number.
- Polish: toasts for saved payments and renewals (check `npx @cloudflare/kumo doc Toasty` first), empty states, phone and tablet layout check.
- Review the npm audit warnings (`npm audit --omit=dev`) before any real launch.
- Optional: a share-preview image for the landing page (needs a PNG in `public/` and an absolute URL).

## Gotchas

- Running several commands on separate PowerShell lines does not stop when one fails. Use `&&` to chain them.
- GitHub Pages serves the site under `/gymflow/`. If CSS or JS fails to load after a deploy, check `basePath` first.
- Dexie cannot run during the build. A crash like "indexedDB is not defined" means a Dexie call is running at module level or during server rendering; move it into a hook inside a `"use client"` component.
- `useSearchParams` must sit inside a `<Suspense>` boundary in a static export, otherwise `npm run build` fails.
- `useLiveQuery` returns `undefined` while loading, and Dexie's `get()` also returns `undefined` when a row does not exist. To tell "loading" from "not found", return `?? null` inside the query (see the member lookups and the Backup page).
- `window.location.href` and string paths with `/gymflow/` break local development (no base path on localhost). Use `useRouter().push("/app/...")`.
- The landing page iframe auto-loads `/app/`; do not point it at a page that auto-focuses an input (Check-in does), or the landing page will scroll to the iframe on load.
- npm reports 5 high-severity audit warnings. Do not run `npm audit fix --force`; it can break the project.
- The VS Code warning "Value 'github-pages' is not valid" in `deploy.yml` is a false positive and can be ignored. Git's "LF will be replaced by CRLF" warnings are harmless on Windows.
- The repo is public. Never commit real member data, Excel files or secrets.
- After testing Renew, Cancel or Backup on the demo data, click **Reset demo data** so the seed numbers match what the docs and chips expect (`GF-0001`, `GF-0007`, `GF-0016`, `GF-0008`).

## Open questions

- Has a pilot gym actually been secured or visited? The business rules came from guessed defaults (renewal start, admission fee re-charge after 90 days, no freezing) and may change after talking to the real owner.
- GymFlow's own pricing and a "See plans" section are undecided.
- Whether to keep the demo as a single static site long term or start a real backend (PostgreSQL) once a pilot gym is confirmed.

## Future direction (after a pilot gym is confirmed)

Move from the static demo to a real install at the gym: Next.js or a Node API with PostgreSQL on a small local server, a USB QR scanner, automatic nightly backups to a USB drive, then licensing and multi-location. Keep `src/db/` as the only place that knows where data is stored so the screens survive that change.