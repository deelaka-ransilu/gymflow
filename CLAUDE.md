@AGENTS.md

# GymFlow

A simple gym management web app for small gyms: register members, check them in, take payments, and never miss a renewal. The first target is a single pilot gym in Sri Lanka (about 250 members, 2 receptionists, one old Windows PC at the desk). No pilot gym is confirmed yet, so every business rule below is a guessed default until the owner answers real questions.

This repo is currently a **static demo** hosted on GitHub Pages. All data lives in the visitor's browser. There is no backend yet. This is an MVP: build only what stops the owner from showing it to a gym.

The app code is written to double as the final product. Everything that exists only because this is a demo (animated background, Mac window, demo bar, sample data) is kept apart from the app code, so it can be deleted for a real install (see "Demo behavior").

- Repo: `deelaka-ransilu/gymflow` (public, required for free GitHub Pages)
- Live site: https://deelaka-ransilu.github.io/gymflow/
- Local folder: `E:\1-Active\GymFlow` (Windows, PowerShell 7, VS Code)
- Scope document: `README.md` (the original MVP scope, written before the static-demo decision; where they differ, this file wins)

## How to work with the owner of this repo

- Keep explanations short, plain and step by step. Give exact commands for PowerShell. The owner types fast with many typos; read for intent.
- When walking through terminal commands, give one step, then wait for the output before saying more.
- Give **full file contents** for any new or replaced file, never partial snippets.
- When unseen files are needed, give a PowerShell file-collector script (one txt output, run from the GymFlow root) instead of asking for pasted files.
- Prefer the simplest thing that works. Do not add libraries, services or abstractions "for later".
- When a screen is finished, tell the owner what to click to test it.
- For visual work, the owner sends screenshots of `localhost:3000` at a wide window. Ask for one after every visual change.
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
| Charts | Hand-drawn HTML and SVG in `components/app/charts/`. No chart library (see "Dashboard") |
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
    page.tsx                landing page: only lists the sections and barbell seams (server component)
    app/                    the demo, lives at /app
      layout.tsx            demo entry: seeding, sign-in gate, full screen state; wraps DemoFrame and AppShell
      page.tsx              Home dashboard (stat cards, three charts, Expiring soon)
      check-in/page.tsx     Check-in
      members/page.tsx      Members list
      members/new/page.tsx  Add member
      members/view/page.tsx Member profile (?id=...)
      members/pay/page.tsx  Payment, receipt and QR card (?id=...)
      expiring/page.tsx     Expiring soon (Call, Message, Renew)
      backup/page.tsx       Backup (owner only)
  components/
    AnimatedBackground.tsx  WebGL orange halftone background for the demo
    AppPreview.tsx          fake Home dashboard in a Mac window, used in the landing hero
    Login.tsx               "Sign in to the demo" screen (Owner / Receptionist)
    StatusBadge.tsx         Active / Expiring soon / Expired pill
    app/                    the real app: shell and shared screen parts. Knows nothing about the demo
      AppShell.tsx          sidebar on lg and up, top bar plus slide-in drawer below; only the page area scrolls
      Sidebar.tsx           logo, member search, grouped nav, signed-in card with Sign out (purely presentational)
      nav.ts                the ONE list of main screens (NAV_ITEMS) and the active-link rule (isActive)
      MemberSearch.tsx      search by name, number, phone or NIC from any screen; "/" focuses it, Enter opens the first hit
      useExpiringCount.ts   live count for the Expiring badge (uses expiringMembers from db/stats.ts)
      PageHeader.tsx        title, subtitle and right-hand buttons; every screen should start with it
      BackupTimeline.tsx    backup history grouped by month on a vertical line, plus BackupChips
      charts/
        ChartCard.tsx       card with title and small note around a chart
        BarChart.tsx        HTML/CSS bars with the number above each bar
        LineChart.tsx       stretched SVG line with soft fill; all text sits outside the SVG
        StatusBar.tsx       one stacked bar in the status colours, with words and counts
    demo/
      DemoFrame.tsx         everything demo-only: background, Mac window, demo bar, buttons under the window
    landing/
      Nav.tsx               floating pill nav (client component)
      BarbellBand.tsx       barbell bar on the seam between two sections (client component)
      Reveal.tsx            fade-and-slide on scroll
      ScreenPictures.tsx    small HTML pictures of check-in, receipt and expiring screens
      shared.tsx            section colours, buttons, DemoButton, WhatsApp number and link
      sections/             one file per landing section
        Hero.tsx            black: headline, Try the demo, product window
        Questions.tsx       off-white: the three front-desk questions
        StatusPlates.tsx    black: green, yellow and red plates (id "see")
        DayAtDesk.tsx       orange: three rows with screen pictures (id "day")
        DemoRoles.tsx       off-white: Owner and Receptionist sign-ins (id "demo")
        Pricing.tsx         black: Founding gym offer card (id "pricing")
        Faq.tsx             off-white: questions in <details> (id "faq")
        Closing.tsx         orange: final Try the demo and WhatsApp (id "contact")
  db/
    types.ts                Role, Plan, Member, Payment, Visit, Setting, BackupLog
    db.ts                   Dexie database "gymflow", its tables and schema versions (now version 2)
    demo.ts                 demo only: pure buildDemo(now) that returns members, payments and visits
    seed.ts                 demo only: resetDemo (writes buildDemo to Dexie), ensureSeeded
    stats.ts                numbers for Home: lastDays, checkInsPerDay, moneyPerDay, moneyByMethod, statusCounts, expiringMembers
    backups.ts              backup history: logBackup, recentBackups, latestExport
    queries.ts              nowLocal, lastVisit, recordVisit
    members.ts              member create and update logic
    payments.ts             recordPayment, cancel payment, receipt numbers
    renewals.ts             renewal logic
  lib/
    rules.ts                all date and business rules (see below)
    format.ts               formatDate, initials, formatDay, formatMonthYear, formatSize
    role.tsx                demo sign-in and role context (see "Demo behavior")
```

## Architecture rules

1. **Static export only.** `next.config.ts` uses `output: "export"` with `trailingSlash: true`. That means no API routes, no server actions, no middleware, no server-side rendering, no Prisma, and no dynamic route segments like `/members/[id]`.
2. **Use query strings for IDs.** Member profile is `/app/members/view?id=...` and payment is `/app/members/pay?id=...`. Read the id with `useSearchParams` in a client component wrapped in `<Suspense>`. Member ids are UUIDs (see "Data model"); the readable numbers (`GF-0007`, `R-0001`) are separate.
3. **`basePath` is `/gymflow` in production only.** Use `next/link` and `useRouter` so it is applied automatically. Never hard-code `/gymflow/` into links. Plain `<a href>` only for `#anchors`, `tel:` and external links.
4. **Browser-only code goes in client components.** Anything touching Dexie, Kumo, `localStorage`, `window` or WebGL needs `"use client"` and must not run at module level. Read data inside hooks such as `useLiveQuery` or `useEffect`. The landing page (`page.tsx`) and the section files stay server components; only `Nav`, `BarbellBand` and `Reveal` are client components there.
5. **Keep the data layer swappable.** Screens call functions from `src/db/` and `src/lib/`. Prefer small functions in `src/db/` over new direct `db` queries inside pages (check-in and expiring still query `db` directly for brevity). `src/db/` is the only place that knows where data is stored.
6. **Business rules live in `src/lib/rules.ts`.** Do not re-implement date, status or renewal logic inside a page. The "expiring" list and count come from `expiringMembers` in `src/db/stats.ts` (which uses `statusOf`); Home and the sidebar badge both use it, so use it for any new place that needs it.
7. **Dates are plain strings.** Calendar dates are `YYYY-MM-DD`; timestamps are local ISO-like strings `YYYY-MM-DDTHH:mm:ss` from `nowLocal()`. Do not store `Date` objects or UTC timestamps.
8. **Prices and the admission fee come from the database** (`plans` table and `settings` keys `admissionFee`, `expiringDays`), never from constants inside screens.
9. **`localStorage` holds only small UI and demo-sign-in settings:** `gf-role` and `gf-signed-in` (demo sign-in) and `gf-sidebar-collapsed` (sidebar open or collapsed). All business data goes in IndexedDB.
10. If the schema changes, add a new `this.version(n).stores({...})` in `db.ts`; never edit an old version in place. Restate every table in the new version.
11. **Keep demo and app apart.** Nothing in `components/app/` may import from `components/demo/`, `db/demo.ts` or `db/seed.ts`. Demo-only behavior goes in `DemoFrame.tsx`, `demo.ts`, `seed.ts` and the seeding effect in `app/app/layout.tsx`.
12. **Main screens are listed once, in `nav.ts`.** Adding a screen means one line there (set `ownerOnly` for owner-only screens). Every screen starts with `PageHeader`.

## Data model (Dexie database `gymflow`, schema version 2)

| Table | Key and indexes | Purpose |
|---|---|---|
| `plans` | `id` | Plan name, months, price (`plan-1` = 1 month LKR 2,000; `plan-5` = 5 months LKR 7,500) |
| `members` | `id`, `number`, `phone`, `nic`, `expiresOn` | Member profile, current plan, join and expiry dates, balance owed. `id` is a UUID (`crypto.randomUUID()` for new members; the demo members get fixed UUID-shaped ids from `demoId` in `demo.ts`) |
| `payments` | `++id`, `memberId`, `at` | Receipt number, amount, method (`cash` or `bank`), kind (`admission`, `membership`, `balance`), who took it, `cancelled` flag |
| `visits` | `++id`, `memberId`, `at` | Attendance, with `override` when an expired member was let in |
| `settings` | `key` | Numeric settings: `admissionFee` (500), `expiringDays` (7). The old `lastExport` key is no longer used |
| `backups` | `++id`, `at` | Backup history log (version 2): `kind` (`export` or `import`), `fileName`, counts of members, payments and visits, optional `bytes`. Import and Reset never clear it |

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
- The sidebar search also finds a member by number, so a USB scanner that types a member number and presses Enter works from any screen.

**Payments**
- Methods: cash and bank transfer.
- Part-payments are allowed; the unpaid amount is kept in `member.balance`.
- Every payment records which role took it.
- Receptionists cannot edit or delete payments and cannot see revenue totals.
- The owner can **cancel** a payment. Cancelled payments stay on record, flagged `cancelled`, and are never deleted. Cancelled payments are not counted in any total or chart.
- Receipts and QR member cards are printed with the browser print dialog on A4. Print rules live in `globals.css` and use `body[data-print="receipt"|"card"]` with the classes `receipt-sheet` and `card-sheet`. The sidebar, top bar, demo bar and window frame are hidden when printing.

**Roles**
- Owner: everything, including revenue, the Money chart, cancelling payments, and the Backup page.
- Receptionist: add and edit members, check in, take payments, print receipts. No revenue, no Money chart, no Backup, no cancelling payments.

**Reminders**
- The Expiring page lists members in groups (Today, Next 3 days, then up to the `expiringDays` limit) with **Call** (`tel:` link), **Message** (opens WhatsApp with a ready-written reminder through a `wa.me` link) and **Renew**.
- The Message button converts local Sri Lankan numbers (`077...`) to `94...`. There are no automatic messages; sending them needs a backend.

**Backup** (owner only; see "Backup page")
- Export backup (JSON download), Import backup, a backup history, and Reset demo data. This matters because clearing browser data deletes everything.
- Every export and every successful import adds one row to the `backups` table. The "last backup" date and the warning come from the newest export row. Imports do not count as exports.
- The warning shows when there has never been an export or the last one is 7 or more days old.
- The history is a log, not a backup. It sits in the same browser storage as the data, so clearing the browser clears it too, and it shows the file name, not the file.

## Demo behavior

**Structure.** `src/app/app/layout.tsx` does three things: seeds the demo on first load, shows the sign-in gate, and holds the full screen state. It wraps everything in `DemoFrame` (demo only) and, after sign-in, the pages in `AppShell` (the real app layout). **For a real install:** replace `DemoFrame` with a plain wrapper, delete `demo.ts`, `seed.ts` and the seeding effect, and nothing in `components/app/` changes.

- **Sign-in:** opening `/app` first shows "Sign in to the demo" (`Login.tsx`) with **Continue as Owner** and **Continue as Receptionist**. No password; this is a convenience, not security. `src/lib/role.tsx` exposes `role`, `signedIn` (null while checking, then true or false), `signIn(role)` and `signOut()`, stored in `localStorage` keys `gf-role` and `gf-signed-in`. The sidebar's bottom card shows an avatar, "Signed in as X" and a Sign out button.
- **Sidebar and app layout** (`AppShell`, `Sidebar`): on `lg` screens and up a sidebar sits on the left, 256px open and a 72px icon strip when collapsed. A small round button on the sidebar edge collapses and expands it, and the choice is remembered in `gf-sidebar-collapsed`. Groups: Menu (Home, Check-in, Members, Expiring with a yellow count badge) and Admin (Backup, owner only). When collapsed, the Expiring badge becomes a yellow dot and the search icon expands the sidebar. Below `lg` there is a top bar with a menu button that opens a slide-in drawer (Escape and the backdrop close it). Only the page area scrolls. The sidebar uses plain styled buttons, because Kumo `Button` icon and `className` props were not checked.
- **Window frame** (`DemoFrame`): on `lg` screens and up the whole demo sits in a Mac-style window (traffic lights, address bar, fixed height, content scrolls inside). Below `lg` it is full width with no frame. Printing hides the frame.
- **Full screen:** the icon at the right end of the Mac title bar. It is a layout state, not the browser Fullscreen API (that does not work on iPhones). It removes the Mac window and the animated background so the app fills the tab. The page contents stay mounted, so a half-filled form is not lost. It resets on refresh. Esc always exits.
- **Demo bar:** an orange-tinted strip under the title bar with "Demo mode. Data stays in this browser." and **Reset demo data**. It has a close X on the right. In full screen, **Exit full screen** sits on the left of the bar. If the bar is closed in full screen, a small round exit button appears fixed at the top right. Closing the bar is not remembered, so it returns on refresh.
- **Buttons under the window:** **Back to website** (`/`) and **Get this for your gym** (`/#contact`, which is the Closing section on the landing page). Hidden in full screen.
- **Background:** `AnimatedBackground.tsx` draws an orange halftone flow with a WebGL canvas (no iframe). It is capped near 30 fps, pauses when the tab is hidden, draws one still frame if "reduce motion" is on, and is hidden when printing. It is not mounted in full screen. **Do not call `loseContext()` in the cleanup:** it broke the canvas in React dev strict mode. Do not go back to CSS blobs; they lagged.
- **Seeding and sample history:** `ensureSeeded()` fills an empty browser on first visit; **Reset demo data** (demo bar and Backup page) calls `resetDemo()`. `demo.ts` has a pure `buildDemo(now)` and `seed.ts` writes the result to Dexie. The data is deterministic for a given day. It contains 20 members covering every status (two expired, several expiring, GF-0008 owing LKR 1,000 as a real part-payment), each with a real join date and up to 6 earlier paid periods; one admission payment plus one membership payment per period, with receipt numbers in time order; 30 days of check-ins (busier on weekdays, quiet on Sunday, a morning and a big evening rush, members only between joining and expiry); up to 4 check-ins already today on the last members in the list (so the Try chips stay free); one expired member let in anyway; and one renewal today so Money today is not 0. No cancelled payments are seeded. A browser that already holds older data keeps it until Reset demo data is pressed.
- There is no scanner hardware. **Simulate scan** picks a random member and shows the same result as a real scan. On real hardware a USB scanner types the member number into the same search box and presses Enter.

## Dashboard (Home) and charts

- `PageHeader` with **Check-in** (primary) and **Add member** (secondary) on the right; they drop under the title on phones.
- Four stat cards: Active members, Check-ins today, Expiring in N days, and for the owner Money today (with the total still owed) or for the receptionist Members owing money.
- **Check-ins:** bar chart of the last 14 days. The number sits above each bar, today is orange, a tooltip shows the date and count.
- **Membership status:** one stacked bar in green, yellow and red with the words and counts under it.
- **Money collected:** owner only. A line for the last 30 days, with Total, Cash and Bank transfer under it. Daily totals can look spiky because each sample member pays about once a month.
- Then the **Expiring soon** list (first 5) with See all.
- All numbers come from `src/db/stats.ts` as pure functions of plain arrays. Charts are hand-drawn with no library: Kumo's `Chart` wraps Apache ECharts, which would have to be installed, and it fights the exact status colours. The line chart's SVG is stretched to the card width with a `non-scaling` stroke and keeps all text outside the SVG so text is never stretched.
- Charts describe themselves for screen readers with `aria-label`; the status bar always shows the words.

## Backup page

One centered column (`max-w-3xl`) in this order: a yellow **alert** (only when no backup exists or the last one is 7+ days old), the **Last backup** card (neutral: "Today" or "3 days ago", date and time, chips for members, payments, visits and file size), the **Export backup** card, the **Backup history** card (timeline grouped under month headings such as OCTOBER 2026, each entry with a download or upload icon tile, "Exported" or "Imported", the file name, "Today, 16:05" style timing and the chips; the newest tile is orange; 10 entries at a time with Show more; an empty state), the **Import backup** card, and a **Danger zone** with **Reset demo data**. Each action's result message shows under its own card. A note under the history says the list lives in this browser too. Receptionists see only "Only the owner can open this page."

## Landing page (`src/app/page.tsx` and `src/components/landing/`)

`page.tsx` only lists the sections in order, with a barbell bar on every seam between two colour blocks. Each section's content lives in its own file in `landing/sections/`. To change a section, open its file. To reorder, move the section and its seam together.

**Order, top to bottom** (colour of each block, then the bar on the seam below it):

| # | Section file | Colour | Bar on the seam below (`from` to `to`, `variant`) |
|---|---|---|---|
| 1 | `Hero` (headline, Try the demo, product window) | black | dark to light, `wave` |
| 2 | `Questions` ("Every front desk asks the same three things") | off-white | light to dark, `gentle` |
| 3 | `StatusPlates` ("Green. Yellow. Red.", id `see`) | black | dark to orange, `deep` |
| 4 | `DayAtDesk` ("Your day at the desk", id `day`) | orange | orange to light, `straight` |
| 5 | `DemoRoles` ("Try it as the owner or the receptionist", id `demo`) | off-white | light to dark, `narrow` |
| 6 | `Pricing` (Founding gym offer, id `pricing`) | black | dark to light, `hump` |
| 7 | `Faq` (id `faq`) | off-white | light to orange, `wave` |
| 8 | `Closing` ("Try it with 20 sample members", id `contact`) | orange | none, then the footer |

- **Nav** (`Nav.tsx`): a floating pill fixed at the top with the GymFlow logo, links See it (`#see`), Pricing (`#pricing`), FAQ (`#faq`) and an orange **Try the demo** button. After 80px of scroll it shrinks and gets more solid. The text links are hidden on phones; the button always shows. The hero's "See how it works" link goes to `#day`.
- **Hero:** same headline ("Run your gym from one simple screen."), one big Try the demo button, the line "No sign-up. 20 sample members. Your data stays in this browser.", and the product window (`AppPreview`, the whole window links to `/app`).
- **StatusPlates:** three round static competition-plate drawings in green, yellow and red, each with its status word. These are the status plates, separate from the barbell bars.
- **Where Try the demo appears:** nav, hero, after the status plates, in the DemoRoles section, and at the end (Closing, with WhatsApp as the second option).

**Section colours** (`shared.tsx`): `DARK` (`#121212`, white text), `LIGHT` (`#F5F3EE`, `#121212` text) and `ORANGE` (`#FF6A00`, black text). These are brand colour blocks (black, off-white, accent), not a theme toggle. Buttons: orange with black text on black and off-white sections (`PRIMARY_BTN`), black with white text on orange sections (`BLACK_BTN`), outlined black for the WhatsApp button on orange (`OUTLINE_BLACK_BTN`). `DemoButton` takes `tone="orange" | "black"`.

**Barbell bars** (`BarbellBand.tsx`):
- It sits on the seam between two sections. The wrapper has zero height (`h-0`, `z-10`), so it takes no space and overlaps both sections. It paints the area above the bar in the `from` colour and the area below in the `to` colour, so the colour change follows the bar. There is no straight edge cutting through the waves.
- Props: `from` and `to` (`"dark" | "light" | "orange"`, the colour of the section above and below) and `variant`.
- **Bar colour is automatic** from the pair: black and off-white gives an orange bar, black and orange gives a cream bar, orange and off-white gives a dark bar.
- **Variants:** `wave` (long rippled bar), `gentle` (classic EZ curl, two dips and a crest), `narrow` (short tight W), `deep` (deep steep W), `hump` (flat with one centred bump) and `straight` (normal barbell). The curved ones are based on real EZ-curl bars. Change a seam by changing the word in `variant="..."`.
- **Every shape must be symmetrical** (a mirror image around x = 500 in the 1000 x 100 box), start and end flat at y = 50, and use smooth curves with no sharp corners. To add a shape, add one line to `BARS` following the pattern in the comment above it.
- The SVG is stretched to the full width (`preserveAspectRatio="none"`) and the stroke is `non-scaling`, so the bar stays the same thickness at every width. Only the bar fades in on scroll; the colour split is always there.
- `BLOCK` in `BarbellBand.tsx` holds the three section colours. **If a section colour changes, change it in both `shared.tsx` and `BLOCK`.**
- **Sections need extra top padding** (about `pt-20` to `pt-32`) so their first heading does not sit under the bar. Do not put `overflow-hidden` on a section; it would clip the bar where it overlaps.
- **No plates.** Plates and collars were tried (speckled rubber plates, a 3D one-barbell drawing) and removed on purpose. Only the bar remains.

**Rules for the landing page:**
- Every section leads to **Try the demo**.
- Only claim what is actually built. No invented proof (no logos, quotes or user counts) until the pilot gym is confirmed; a real owner quote is the future proof element.
- Pricing is a single card, "Founding gym offer: Talk to us", with a list of what is built and no price. Do not add price tiers or an Automatic reminders tier until the backend exists.
- Motion is limited to the gentle fade-and-slide on scroll (`Reveal`), the bar fade-in, the nav shrinking and smooth anchor scrolling (off for reduced motion).
- **Not BITprep-style.** Colour-blocked sections are allowed (the owner asked for them), but do not add floating tilted cards, crossed ticker bands or marquees, word-by-word headline animation, a shine sweep on the button, or a hard offset shadow. These were removed on purpose.
- The preview in `AppPreview` is drawn in HTML and CSS, not a live iframe or screenshot. It uses a soft orange glow and a thin orange border. **It still shows the old Home layout (no sidebar, no charts) and needs updating.**
- `WHATSAPP_NUMBER` in `landing/shared.tsx` is still the placeholder `94XXXXXXXXX`. Replace it (country code, no `+` or spaces) before sharing the site. This is the only place it lives.
- Names, dates and amounts in `AppPreview` and `ScreenPictures` are sample data, not read from the database.
- Do not put text in a color that has poor contrast on the block it sits on. On off-white use black or near-black text and `#B34700` / `#C2410C` for orange accents; on orange use black text.

## Design system

The demo app (`/app`) is dark only. Never add a light mode or a theme toggle. The landing page uses full-width colour blocks in black, off-white and orange (see above); those are brand colours, not a second theme.

| Use | Color |
|---|---|
| Page background | `#121212` |
| Cards | `#1C1C1C` |
| Raised items | `#242424` |
| Borders | `#2E2E2E` |
| Text | `#F5F5F5` |
| Secondary text | `#A3A3A3` |
| Accent (actions, selected menu) | `#FF6A00`, hover `#FF8533`, black text on orange buttons |
| Landing off-white block | `#F5F3EE` |
| Active status | green `#22C55E` text on a faint green tint |
| Expiring status | yellow `#FACC15` text on a faint yellow tint |
| Expired status | red `#EF4444` text on a faint red tint |
| Chart bars | `#3A3A3A`, hover `#555555`, dashed gridlines `#2E2E2E` |

Rules:
- Orange is only for actions, the selected menu item, the accent word in headlines, the highlighted data in charts (today's bar, the money line, the newest backup entry) and (on the landing page) the orange colour blocks and barbell bars.
- Green, yellow and red mean member status only, and always appear with a word ("Active", "Expiring soon", "Expired"), never color alone. The yellow backup alert and the yellow Expiring badge are warnings, not member status, and always carry words too.
- Headings use Barlow Condensed via the `font-heading` class (weight 600). Everything else is Poppins, including names, dates, phone numbers and prices.
- Cards are 12px rounded with soft borders, no heavy shadows. Buttons are at least 44px tall for tablet use.
- Small grey text on cards uses `text-neutral-400` (`#A3A3A3`), not `neutral-500`, for enough contrast.
- Use plain language in all text. Error messages say what to do, for example "Phone number is already used by another member."
- Currency is shown as `LKR 2,000` using `formatLKR`.

## Kumo notes

- Theme is switched on by `data-mode="dark"` on `<html>` (set in `layout.tsx`). Colors are overridden in `globals.css` under `html[data-mode="dark"]` using Kumo tokens (`--color-kumo-brand`, `--color-kumo-base`, `--color-kumo-line`, `--text-color-kumo-default`, and so on).
- Tailwind classes backed by Kumo tokens: `bg-kumo-base`, `bg-kumo-tint`, `border-kumo-line`, `text-kumo-subtle`, `text-kumo-default`. The accent utility is `text-accent` (defined in `globals.css`). Note that `text-kumo-subtle` is a light grey made for dark backgrounds; on off-white or orange sections use `text-black/60` or `text-black/75` instead.
- Button variants: `primary`, `secondary`, `ghost`, `outline`, `destructive`. Sizes: `xs`, `sm`, `base`, `lg`.
- Table: `Table`, `Table.Header`, `Table.Head`, `Table.Row`, `Table.Body`, `Table.Cell`, usually inside `<LayerCard className="p-0">`.
- Input accepts `label`, `description`, `error`, `size`. Field wraps other controls with `label`, `description`, `error`.
- Dialog: `Dialog.Root`, `Dialog.Trigger`, `<Dialog>` (content), `Dialog.Title`, `Dialog.Description`, `Dialog.Close`, with `render` props for the buttons.
- Other available components worth using: Select, DatePicker, Tabs, Banner, Toasty (toasts), Empty (empty states), Pagination, Meter, Grid, CommandPalette.
- `Chart` exists but is a low-level wrapper around Apache ECharts (the consumer installs ECharts and passes it in). It is not used; charts are hand-drawn.
- `StatusBadge` is hand-built on purpose so the status colors stay exactly as specified.

## Status

Built: Check-in, Members list, Add member, Payment with receipt and QR card, Member profile with Renew and cancel payment, Expiring (with Call, Message and Renew), demo sign-in, Mac window frame, animated background, the sidebar app layout with member search and Expiring badge, full screen mode, the closable demo bar, 30 days of sample history, the Home dashboard with three charts, and the Backup page with history.

The landing page redesign is finished: floating pill nav, colour-blocked sections (black, off-white, orange), one file per section, barbell bars on every seam (six shapes, all symmetrical), pricing card, FAQ and closing section. The older barbell experiments (`BarbellFrame.tsx`, `BarbellHero.tsx`, plates and collars) were deleted.

**Manual tests still unconfirmed** (click Reset demo data first): Renew on GF-0016 followed by a part-payment; Cancel payment as Owner and its absence as Receptionist; a second check-in blocked in one day; Simulate scan; Backup export, import, a bad file and the receptionist lock; Record payment then Print receipt (the sidebar must not appear on the receipt); the Check-in "Welcome" wording; the Message button on the Expiring page; the Try chips on Check-in (none should say "already checked in"); a payment of LKR 1,000 on GF-0008.

**Open items, in the agreed order:**
1. Check the live GitHub Pages site once after each deploy: landing page, **Try the demo** to the sign-in screen, the animated background on `/gymflow/app/`, **Back to website** and **Get this for your gym** under the `/gymflow` base path, then press Reset demo data.
2. Toasts for saved payment and renewal (run `npx @cloudflare/kumo doc Toasty` first) and a confirm dialog for Cancel payment.
3. Payments screen, owner only: list, date filter, totals split by cash and bank, CSV export. Add it to `nav.ts`.
4. Settings screen, owner only: plan prices, admission fee, expiring days (already read from the database).
5. Responsive pass: Members table as cards on tablet and phone, a phone and tablet check of the whole demo, a shared loading skeleton and empty states, and `PageHeader` on every screen that does not use it yet.
6. Small items: autofocus the Check-in input so a scanner works without a click; add a focus trap to the mobile drawer before any real launch.
7. Update the landing `AppPreview` picture to the new Home layout (sidebar and charts).
8. Check the landing page at phone and tablet widths (nav, barbell bars, section padding, orange section contrast).
9. Replace the WhatsApp placeholder number in `landing/shared.tsx`.
10. Show the demo to a real gym owner. Their answers decide the business rules, pricing and whether a backend is needed.
11. Optional: an Open Graph share image (needs a PNG in `public/` and an absolute URL).

## Not in scope (do not build unless asked)

POS or shop, CRM or leads, classes and booking, workout plans, body progress, trainers module, member portal, freezing, multi-location, multi-company, Sinhala or Tamil, automatic WhatsApp or SMS (needs a backend), online payments, licensing and a control cloud, an update system, a dark/light toggle, PDF or Excel exports beyond basic JSON and CSV, and any real authentication.

## Gotchas

- Running several commands on separate PowerShell lines does not stop when one fails. Use `&&` to chain them (PowerShell 7). In older PowerShell use `;`.
- GitHub Pages serves the site under `/gymflow/`. If CSS or JS fails to load after a deploy, check `basePath` first.
- Dexie and WebGL cannot run during the build. A crash like "indexedDB is not defined" means a call is running at module level or during server rendering; move it into a hook inside a `"use client"` component.
- A barbell bar that looks cut by a straight line means the `from` and `to` colours do not match the real section colours; check `BLOCK` in `BarbellBand.tsx` against `shared.tsx`.
- `ensureSeeded` only seeds an empty database, so a browser that already holds older demo data (including anyone who opened the live demo earlier) keeps it until Reset demo data is pressed.
- After the schema upgrade to version 2, a stuck "Loading..." can mean another GymFlow tab is still open on the old version. Close the other tabs.
- `recordPayment` rejects an amount above the member's balance. Anything that writes history (the demo seeder) must write to `db.payments` directly, not through that function.
- The black round "N" in the corner of `localhost:3000` is the Next.js dev badge. It does not exist in the deployed site.
- Tailwind v4 "important" modifier is a trailing `!` (for example `print:block!`), as used in `AppShell` and `DemoFrame`.
- The mobile drawer closes with Escape and the backdrop but has no focus trap yet.
- `npm audit --omit=dev` found 0 vulnerabilities (checked 2026-10-05); the 5 high-severity warnings from plain `npm audit` are dev-tool only. Never run `npm audit fix --force`; it can break the project. Re-run `npm audit --omit=dev` before any real launch.
- The VS Code warning "Value 'github-pages' is not valid" in `deploy.yml` is a false positive and can be ignored. Git's "LF will be replaced by CRLF" warnings are harmless on Windows.
- The repo is public. Never commit real member data, Excel files or secrets. The `out/` folder is build output; do not edit it.

## Future direction (after a pilot gym is confirmed)

Move from the static demo to a real install at the gym: Next.js or a Node API with PostgreSQL on a small local server, a USB QR scanner, automatic nightly backups to a USB drive (which also replaces the browser-only backup history with real files), then automatic reminder messages (a paid add-on, since each message costs money), licensing and multi-location. Keep `src/db/` as the only place that knows where data is stored so the screens survive that change. At that point replace `DemoFrame` with a plain wrapper and delete `demo.ts`, `seed.ts` and the seeding effect.