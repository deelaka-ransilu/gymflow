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
- When unseen files are needed, give a PowerShell file-collector script (one txt output, run from the GymFlow root) instead of asking for pasted files. Write it by hand for GymFlow; the built-in file-collector skill is hard-wired to the Blanche Bridal repos.
- Prefer the simplest thing that works. Do not add libraries, services or abstractions "for later".
- When a screen is finished, tell the owner what to click to test it.
- For visual work, the owner sends screenshots of `localhost:3000` at a wide window. Ask for one after every visual change.
- Chain build and push so a failed build stops the push:
  `npm run build && git add . && git commit -m "message" && git push`
- Pushing to `main` deploys automatically through GitHub Actions. Never push a failing build.
- Check Kumo components with `npx @cloudflare/kumo doc <Name>` before using them. Do not guess props.
- Never hand over a placeholder as if it were finished (an earlier AppPreview used empty grey boxes where the sidebar icons belong). If something is a stand-in, say so.
- For anything visual that needs a picture, write the image prompt first (see "Landing 3D pictures"), let the owner generate it, then write the code.
- When the owner does not answer a question, say which default you picked, build that, and keep the rest as a proposal. Do not describe a proposed change as built.

## Stack

| Area | Choice |
|---|---|
| Framework | Next.js 16, App Router, TypeScript, **static export** |
| Styling | Tailwind CSS v4 plus Cloudflare Kumo semantic tokens |
| Components | `@cloudflare/kumo` (React, built on Base UI), `@phosphor-icons/react` for icons |
| Storage | Dexie (IndexedDB) with `dexie-react-hooks` (`useLiveQuery`) |
| QR codes | `qrcode` (member cards and the pay page, generated in the browser) |
| Charts | Hand-drawn HTML and SVG in `components/app/charts/`. No chart library (see "Dashboard") |
| Landing pictures | Four generated 3D PNGs in `src/assests/landing/` (see "Landing 3D pictures") |
| Landing text animation | `Reveal` (fade) and `RevealText` (headline lines), both Tailwind classes plus an IntersectionObserver. No animation library |
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
  assests/                  (spelled "assests" on purpose, it is the owner's folder name; do not "fix" it without changing every import)
    landing/                generated 3D pictures for the landing page
      question-expired.png  hourglass, membership card, red cross badge
      question-owes.png     gold coin stack and receipt slip
      question-call.png     calendar, phone handset and speech bubble
      status-plates.png     stacked green, yellow and red plates with a white one leaning
  app/
    layout.tsx              fonts, metadata, <html data-mode="dark">
    globals.css             Tailwind, Kumo styles, theme overrides, smooth scroll, print rules
    page.tsx                landing page: only lists the sections, barbell seams and the footer (server component)
    app/                    the demo, lives at /app
      layout.tsx            demo entry: seeding, sign-in gate, full screen state; wraps DemoFrame and AppShell
      page.tsx              Home dashboard (stat cards, three charts, Expiring soon)
      check-in/page.tsx     Check-in
      members/page.tsx      Members list (PageHeader with Import, Export and Add member)
      members/new/page.tsx  Add member
      members/view/page.tsx Member profile (?id=...)
      members/pay/page.tsx  Payment, receipt and QR card (?id=...)
      expiring/page.tsx     Expiring soon (Call, Message, Renew)
      backup/page.tsx       Backup (owner only)
  components/
    AnimatedBackground.tsx  WebGL orange halftone background for the demo
    AppPreview.tsx          picture of the real Home screen (sidebar, stat cards, three charts) in a Mac window, used in the landing hero. A client component, uses the same Phosphor icons as the sidebar
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
      Footer.tsx            real footer: logo and one-line description, "On this page" links, "Get in touch" (demo and WhatsApp), copyright and demo-data note
      BarbellBand.tsx       barbell bar on the seam between two sections (client component)
      Reveal.tsx            fade-and-slide on scroll. Accepts only children, as, delay and className (NO style prop)
      RevealText.tsx        headline animation: each line slides up out of its own mask on scroll (client component). Takes lines (array), as, delay, className. See "Headline animation"
      ScreenPictures.tsx    small HTML pictures of check-in, receipt and expiring screens (their frame sets its own light text colour)
      shared.tsx            section colours, buttons, DemoButton, WhatsApp number and link
      sections/             one file per landing section
        Hero.tsx            black: headline (uses RevealText), Try the demo, product window
        Questions.tsx       off-white: the three front-desk questions, text left, 3D picture right
        StatusPlates.tsx    black: heading and three statuses left, 3D plates picture right (id "see")
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
3. **`basePath` is `/gymflow` in production only.** Use `next/link` and `useRouter` so it is applied automatically. Never hard-code `/gymflow/` into links. Plain `<a href>` only for `#anchors`, `tel:` and external links. Landing pictures are imported from `src/assests/landing/` and drawn with a plain `<img src={image.src}>`; **check on the live site that they load under `/gymflow`** (open item).
4. **Browser-only code goes in client components.** Anything touching Dexie, Kumo, `localStorage`, `window` or WebGL needs `"use client"` and must not run at module level. Read data inside hooks such as `useLiveQuery` or `useEffect`. The landing page (`page.tsx`) and the section files stay server components; `Nav`, `BarbellBand`, `Reveal`, `RevealText` and `AppPreview` are the client components there.
5. **Keep the data layer swappable.** Screens call functions from `src/db/` and `src/lib/`. Prefer small functions in `src/db/` over new direct `db` queries inside pages (check-in and expiring still query `db` directly for brevity). `src/db/` is the only place that knows where data is stored.
6. **Business rules live in `src/lib/rules.ts`.** Do not re-implement date, status or renewal logic inside a page. The "expiring" list and count come from `expiringMembers` in `src/db/stats.ts` (which uses `statusOf`); Home and the sidebar badge both use it, so use it for any new place that needs it.
7. **Dates are plain strings.** Calendar dates are `YYYY-MM-DD`; timestamps are local ISO-like strings `YYYY-MM-DDTHH:mm:ss` from `nowLocal()`. Do not store `Date` objects or UTC timestamps.
8. **Prices and the admission fee come from the database** (`plans` table and `settings` keys `admissionFee`, `expiringDays`), never from constants inside screens.
9. **`localStorage` holds only small UI and demo-sign-in settings:** `gf-role` and `gf-signed-in` (demo sign-in) and `gf-sidebar-collapsed` (sidebar open or collapsed). All business data goes in IndexedDB.
10. If the schema changes, add a new `this.version(n).stores({...})` in `db.ts`; never edit an old version in place. Restate every table in the new version.
11. **Keep demo and app apart.** Nothing in `components/app/` may import from `components/demo/`, `db/demo.ts` or `db/seed.ts`. Demo-only behavior goes in `DemoFrame.tsx`, `demo.ts`, `seed.ts` and the seeding effect in `app/app/layout.tsx`.
12. **Main screens are listed once, in `nav.ts`.** Adding a screen means one line there (set `ownerOnly` for owner-only screens). Every screen starts with `PageHeader`.
13. **`Reveal` takes no `style` prop.** To set an inline style (for example a coloured left border) put it on a plain `div` inside `Reveal`, not on `Reveal` itself.
14. **Headline animation goes through `RevealText`, and `Reveal` stays untouched.** Do not add animation props to `Reveal` (the whole landing page uses it). Do not write one-off animation code inside a section file. `RevealText` takes the lines as an array so the line breaks are chosen by hand.

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
- The Members page has **Import** and **Export** buttons next to **Add member**. They are buttons only for now and do nothing. The plan is an Excel file (needs the SheetJS library, to be agreed first). Still to decide: should Export include only members or payments too, and should Import skip or update members that already exist (same NIC).

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
- The owner can **cancel** a payment. Cancelled payments stay on record, flagged `cancelled`, and are never deleted. Cancelled payments are not counted in any total or chart. (Today the cancel uses `window.confirm`; a proper Kumo confirm dialog is an open item.)
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
- **Sidebar and app layout** (`AppShell`, `Sidebar`): on `lg` screens and up a sidebar sits on the left, 256px open and a 72px icon strip when collapsed. A small round button on the sidebar edge collapses and expands it, and the choice is remembered in `gf-sidebar-collapsed`. Groups: Menu (Home, Check-in, Members, Expiring with a yellow count badge) and Admin (Backup, owner only). Icons (Phosphor): House, UserCheck, Users, CalendarX, FloppyDisk, and a Barbell on the orange logo tile. When collapsed, the Expiring badge becomes a yellow dot and the search icon expands the sidebar. Below `lg` there is a top bar with a menu button that opens a slide-in drawer (Escape and the backdrop close it). Only the page area scrolls. The sidebar uses plain styled buttons, because Kumo `Button` icon and `className` props were not checked when it was built. (Since then the Kumo `Button` doc has been read: it does take `icon` and `className`, and the Members page uses `icon`.)
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

`page.tsx` only lists the sections in order, with a barbell bar on every seam between two colour blocks, and ends with the footer. Each section's content lives in its own file in `landing/sections/`. To change a section, open its file. To reorder, move the section and its seam together.

**Order, top to bottom** (colour of each block, then the bar on the seam below it):

| # | Section file | Colour | Bar on the seam below (`from` to `to`, `variant`) |
|---|---|---|---|
| 1 | `Hero` (headline, Try the demo, product window) | black | dark to light, `wave` |
| 2 | `Questions` ("Every front desk asks the same three things"), text left, 3D picture right | off-white | light to dark, `gentle` |
| 3 | `StatusPlates` ("Green. Yellow. Red.", id `see`), text left, 3D plates picture right | black | dark to orange, `deep` |
| 4 | `DayAtDesk` ("Your day at the desk", id `day`) | orange | orange to light, `straight` |
| 5 | `DemoRoles` ("Try it as the owner or the receptionist", id `demo`) | off-white | light to dark, `narrow` |
| 6 | `Pricing` (Founding gym offer, id `pricing`) | black | dark to light, `hump` |
| 7 | `Faq` (id `faq`) | off-white | light to orange, `wave` |
| 8 | `Closing` ("Try it with 20 sample members", id `contact`) | orange | none, then the footer |
| - | `Footer` (black, `landing/Footer.tsx`) | black | - |

**All landing text, as it stands** (for the planned rewrite; change it in the section files):
- **Nav:** logo, links See it / Pricing / FAQ, button Try the demo.
- **Hero:** "Run your gym from one simple screen." (two lines: "Run your gym from" / "one simple screen." in orange) / "Know in one second who can come in, who owes money, and who needs to renew." / Try the demo / "No sign-up. 20 sample members. Your data stays in this browser." / link "See how it works" / the Home picture.
- **Questions:** label "Every front desk asks the same three things." Then "Is this member expired?" (Green, yellow or red in one second, with the word beside it.), "Who still owes money?" (The balance shows on every member and at check-in.), "Who should I call this week?" (A daily list of expiring members, with Call and Message buttons.)
- **StatusPlates:** "Green. Yellow. Red." / "Every member lands on one of three plates. The word is always beside the colour." Three rows, each with a word label: Active ("Welcome. Let them in." / The visit is logged automatically. Nothing else to do.), Expiring soon ("Expiring soon. Ask them to renew." / It says how many days are left, so the conversation is easy.), Expired ("Expired. Stop and renew." / You can still let them in if you choose. The override is recorded.). Button Try the demo.
- **DayAtDesk:** "Your day at the desk." Three steps: Check the member in; Take payment, print the receipt; Call before they expire (each with a screen picture from `ScreenPictures.tsx`).
- **DemoRoles:** "Try it as the owner or the receptionist." / the sign-in explanation / Owner and Receptionist cards / Try the demo.
- **Pricing:** "Pricing." / card "Founding gym offer", "Talk to us", six included items, button Talk to us on WhatsApp.
- **Faq:** "Questions." Four questions: where the demo data goes, whether members need an app, whether the receptionist sees revenue, how to back up.
- **Closing:** "Try it with 20 sample members." / "Five minutes is enough to see if it fits your front desk." / Try the demo and Talk to us on WhatsApp.
- **Footer:** logo, "Simple gym management for small gyms. Check members in, take payments, and never miss a renewal."; "On this page" links (See it, Your day at the desk, Pricing, FAQ); "Get in touch" (Try the demo, Talk to us on WhatsApp); bottom line with the year and "The demo uses sample data. It stays in your browser."

- **Nav** (`Nav.tsx`): a floating pill fixed at the top with the GymFlow logo, links See it (`#see`), Pricing (`#pricing`), FAQ (`#faq`) and an orange **Try the demo** button. After 80px of scroll it shrinks and gets more solid. The text links are hidden on phones; the button always shows. The hero's "See how it works" link goes to `#day`.
- **Hero:** the headline uses `RevealText` (two lines slide up one after the other). The line below it and the button wait longer (`delay` 300 and 400 ms) so they appear after the headline lands. One big Try the demo button, the small line, and the product window (`AppPreview`, the whole window links to `/app`).
- **AppPreview:** a picture of the real Home screen: Mac title bar, a sidebar with the orange barbell logo tile, the search box with `/`, the same Phosphor icons as `nav.ts` (selected Home with an orange icon tile, the yellow Expiring badge 6), the Backup item, and the Owner card; then the Home header with Check-in and Add member, four stat cards, the Check-ins bars, the Membership status bar, and the Money collected line. Below tablet width the sidebar is hidden. All names and numbers are sample data. It is a client component because it uses the regular Phosphor icon import.
- **Questions** (`Questions.tsx`): each row is text on the left (the big question and the grey line under it) and a 3D picture on the right. On phones the picture sits above the question. Pictures are decoration (`alt=""`, `aria-hidden`).
- **StatusPlates** (`StatusPlates.tsx`): heading, intro line and the three status rows (each with a coloured left line and a word label pill) on the left, the stacked-plates picture on the right (above the text on phones), and a Try the demo button. The colour is never alone: each row carries its word.
- **DayAtDesk:** the screen pictures sit on dark cards inside the orange block. Their frame sets its own light text colour (`text-[#F5F5F5]`), because the orange section's black text made the name and values invisible.
- **Where Try the demo appears:** nav, hero, after the status plates, in the DemoRoles section, in the footer, and at the end (Closing, with WhatsApp as the second option).

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
- **No plates or collars on the barbell bars.** They were tried (speckled rubber plates, a 3D one-barbell drawing) and removed on purpose; only the bar remains. This rule is about the bars only. The 3D stacked-plates picture in the StatusPlates section is a separate, deliberate image.

## Headline animation (`Reveal` and `RevealText`)

Two small client components, both using an `IntersectionObserver` that fires once. Both keep the text in the page HTML (only hidden by CSS), so screen readers and search engines still read it, and both show the text straight away under "reduce motion". No animation library.

- **`Reveal`:** fade and slide up. Used for body text, cards, buttons, pictures and short headings. Props: `children`, `as`, `delay`, `className`. No `style` prop.
- **`RevealText`:** the headline animation. Each line slides up out of its own mask (an `overflow-hidden` wrapper) when the heading scrolls into view, one line after the other (120 ms apart). Props: `lines` (an array of strings or elements, one per line, so a line can hold an orange accent `<span>`), `as` (default `h2`, use `h1` for the Hero), `delay` (ms before the first line), `className` (the heading's size and font classes go here). Each wrapper has `pb-[0.12em]` and `-mb-[0.12em]` so letters with tails (g, y, p) are not clipped at a tight line height.
- **Usage:** `<RevealText as="h1" className="font-heading text-6xl font-semibold leading-none sm:text-8xl" lines={["Run your gym from", <span key="accent" className="text-accent">one simple screen.</span>]} />`. Give each element in `lines` a `key`.
- **Where it is used (built):** the Hero headline only.
- **Proposed, not built, not yet approved by the owner:** extra styles through a `variant` prop on `RevealText` (the default stays the line slide-up). The plan was: Questions use a left-to-right wipe; "Green. Yellow. Red." pops in word by word, each word in its status colour; "Your day at the desk" and the Closing headline use the line slide-up; the Owner/Receptionist, Pricing and FAQ headings keep the `Reveal` fade. The coloured words would use the status colours as decoration, like the plates picture, so the owner has to agree to that. Build one section at a time and ask for a screenshot after each.
- **Banned (still):** word-by-word headline animation across the page, a shine sweep on the button, floating tilted cards, crossed tickers. The line slide-up is the one allowed headline animation. The status-colour word pop above is only a proposal.
- Motion that exists on the landing page: `Reveal`, `RevealText`, the bar fade-in, the nav shrinking and smooth anchor scrolling (off for reduced motion).

**Rules for the landing page:**
- Every section leads to **Try the demo**.
- Only claim what is actually built. No invented proof (no logos, quotes or user counts) until the pilot gym is confirmed; a real owner quote is the future proof element. The footer has no email, address, social icons, or Privacy and Terms links for the same reason; add them only when they exist.
- Pricing is a single card, "Founding gym offer: Talk to us", with a list of what is built and no price. Do not add price tiers or an Automatic reminders tier until the backend exists.
- Motion is limited to what "Headline animation" lists. Do not add more without the owner asking.
- **Not BITprep-style layout.** Colour-blocked sections are allowed (the owner asked for them), but do not add floating tilted cards, crossed ticker bands or marquees, word-by-word headline animation across the whole page, a shine sweep on the button, or a hard offset shadow. These were removed on purpose. (The 3D pictures reuse the BITprep subject-illustration look on purpose; only the layout tricks are banned.) `RevealText` is line-based and is the owner's later, deliberate exception for headlines.
- `WHATSAPP_NUMBER` in `landing/shared.tsx` is still the placeholder `94XXXXXXXXX`. Replace it (country code, no `+` or spaces) before sharing the site. This is the only place it lives; the Pricing and Closing buttons and the footer all use it.
- Names, dates and amounts in `AppPreview` and `ScreenPictures` are sample data, not read from the database.
- Do not put text in a color that has poor contrast on the block it sits on. On off-white use black or near-black text and `#B34700` / `#C2410C` for orange accents; on orange use black text. A dark picture card placed on an orange or off-white block must set its own text colour.
- Images on the landing page are decoration: `alt=""` and `aria-hidden="true"`, with the meaning carried by the words beside them.

## Landing 3D pictures (image prompts)

Four generated pictures in `src/assests/landing/`. They match the BITprep subject illustrations (the owner's study platform), so the two products share one look. They are made outside the code with an image generator; the owner approves each one, then the code is written.

**Workflow**
1. Write the prompt first (one per picture). Keep each prompt self-contained.
2. The owner attaches a BITprep 3D illustration as the STYLE reference when generating. For the plates picture, also attach a photo of stacked plates as a COMPOSITION reference only (and tell the generator not to copy its brand name, lettering or colours).
3. Output: square 1:1, highest resolution, genuinely transparent background (PNG). No card, backdrop, floor, border, glow or cast shadow outside the objects.
4. Save with the exact file names in the structure above, then write or update the section file. A missing file fails the build.
5. Display sizes: Questions pictures about 112px on phones, 144px on tablet, 176px on desktop; the plates picture fills its half of the row (max width 28rem on phones). Design for clarity at about 150px wide.

**Shared style block (put in every prompt)**
- Premium, playful 3D illustration with chunky, rounded forms.
- Glossy plastic or ceramic-like surfaces with smooth bevels.
- Soft studio lighting from the upper left, smooth shading, controlled glossy highlights.
- Gentle three-quarter view, slightly from above, showing the front and one side. Minimal perspective distortion.
- Clean, polished surfaces: no grain, scratches or heavy texture.
- Natural, familiar colours for each object; a small harmonious palette, lively but not neon.
- Clear silhouettes and bold details that stay readable at small size. No tiny details, no clutter.
- No subject name, captions, labels, watermarks or lettering. Essential markings (a cross on a badge, dots on a bubble) are allowed.
- Keep the COMPLETE group inside the canvas, never cropped, centred with about 10-12% clear padding on every side.
- One object has the strongest emphasis; the others support it. Slight overlap is fine, but every object must stay recognizable.
- Before delivering, check: object count, nothing cropped, transparent background, style matches the reference, readable at small size, no text. If the tool cannot give the resolution or transparency, say so accurately.

**Picture 1: `question-expired.png` ("Is this member expired?"). THREE objects**
- MAIN: a chunky glossy hourglass with a warm wooden-brown frame, clear glass and orange sand, most of it already in the bottom bulb.
- A chunky gym membership card, charcoal black with a bold orange stripe and a simple barbell emblem (no text).
- A round glossy red status badge with a bold white cross (X), slightly overlapping the card's corner.
- Arrangement: hourglass behind and centre, card tilted at the front left, red badge at the front right.

**Picture 2: `question-owes.png` ("Who still owes money?"). TWO objects**
- MAIN: a chunky stack of glossy gold coins (five or six, slightly offset, embossed ring on the top coin, no numbers or letters).
- A chunky rolled-edge paper receipt slip, ivory white, standing upright behind and slightly right of the coins, with a warm yellow tab at the top and a few bold rounded grey lines (no readable text).
- Arrangement: coins front left, receipt behind, leaning slightly.

**Picture 3: `question-call.png` ("Who should I call this week?"). THREE objects**
- MAIN: a chunky glossy classic phone handset in bright green.
- A chunky calendar page, ivory with a thick orange top bar and two binder rings, a grid of rounded squares and ONE day highlighted with a bold orange circle (no numbers or letters).
- A chunky speech bubble in soft green with a small tail and three white dots inside.
- Arrangement: calendar behind and slightly left, handset front centre, bubble upper right overlapping the calendar corner.
- Note: green and red mean member status in the app, but here they are decoration (natural phone colours, a red cross for "expired"). If that ever causes confusion, make the phone and bubble blue.

**Picture 4: `status-plates.png` (Green. Yellow. Red.). ONE stacked pile, plates only**
- Bottom layer: two glossy RED plates, slightly offset. Middle layer: two glossy YELLOW plates, slightly smaller. Top layer: two glossy GREEN plates, smaller again, so the pile steps up like a tidy tower. The green plates are the main emphasis.
- One plain WHITE (ivory) plate leaning against the front of the pile, showing its face, with a clean rounded centre hole and a soft raised inner ring. No lettering, numbers or logos anywhere.
- Every plate has a chunky rounded rim, a visible centre hole and a smooth bevel.
- Colours: green near `#22C55E`, yellow near `#FACC15`, red near `#EF4444`, clean ivory white. No blue.
- The reference photo shows a blue layer and a brand name; neither may appear.

**Adding or replacing a picture:** keep the file name (or update the import), keep it square and transparent, and test at wide, tablet and phone width. The images are imported like `import img from "../../../assests/landing/status-plates.png"` and drawn with `<img src={img.src} width={img.width} height={img.height} alt="" aria-hidden="true" />`.

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
- Green, yellow and red mean member status only, and always appear with a word ("Active", "Expiring soon", "Expired"), never color alone. The yellow backup alert and the yellow Expiring badge are warnings, not member status, and always carry words too. The landing pictures use these colours as decoration only.
- Headings use Barlow Condensed via the `font-heading` class (weight 600). Everything else is Poppins, including names, dates, phone numbers and prices.
- Cards are 12px rounded with soft borders, no heavy shadows. Buttons are at least 44px tall for tablet use.
- Small grey text on cards uses `text-neutral-400` (`#A3A3A3`), not `neutral-500`, for enough contrast.
- Use plain language in all text. Error messages say what to do, for example "Phone number is already used by another member."
- Currency is shown as `LKR 2,000` using `formatLKR`.

## Kumo notes

- Theme is switched on by `data-mode="dark"` on `<html>` (set in `layout.tsx`). Colors are overridden in `globals.css` under `html[data-mode="dark"]` using Kumo tokens (`--color-kumo-brand`, `--color-kumo-base`, `--color-kumo-line`, `--text-color-kumo-default`, and so on).
- Tailwind classes backed by Kumo tokens: `bg-kumo-base`, `bg-kumo-tint`, `border-kumo-line`, `text-kumo-subtle`, `text-kumo-default`. The accent utility is `text-accent` (defined in `globals.css`). Note that `text-kumo-subtle` is a light grey made for dark backgrounds; on off-white or orange sections use `text-black/60` or `text-black/75` instead.
- **Button** (checked with `npx @cloudflare/kumo doc Button`): variants `primary`, `secondary`, `ghost`, `outline`, `destructive`, `secondary-destructive`; sizes `xs`, `sm`, `base`, `lg`; shapes `base`, `square`, `circle`; props `icon` (a Phosphor icon element), `loading`, `disabled`, `className`, `type`.
- Table: `Table`, `Table.Header`, `Table.Head`, `Table.Row`, `Table.Body`, `Table.Cell`, usually inside `<LayerCard className="p-0">`.
- Input accepts `label`, `description`, `error`, `size`. Field wraps other controls with `label`, `description`, `error`.
- **Dialog** (checked): `Dialog.Root`, `Dialog.Trigger` (with `render={(p) => <Button {...p}>...`), `<Dialog className="p-8" size="sm">` for the content, `Dialog.Title`, `Dialog.Description`, `Dialog.Close` (with `render` props for the buttons). Sizes `sm` (288px, for simple confirmations), `base`, `lg`, `xl`. A confirm dialog uses a secondary Cancel and a destructive action button, both wrapped in `Dialog.Close`.
- **Toasty** (checked): wrap the app in `<Toasty>`; inside it, `useKumoToastManager()` returns `add`, `update` and more. `variant` can be `default`, `success`, `error`, `warning`, `info`. The exact `add` options were not read yet; read the typings before using them.
- Other available components worth using: Select, DatePicker, Tabs, Banner, Empty (empty states), Pagination, Meter, Grid, CommandPalette.
- `Chart` exists but is a low-level wrapper around Apache ECharts (the consumer installs ECharts and passes it in). It is not used; charts are hand-drawn.
- `StatusBadge` is hand-built on purpose so the status colors stay exactly as specified.

## Status

Built: Check-in, Members list (with Import and Export buttons, buttons only), Add member, Payment with receipt and QR card, Member profile with Renew and cancel payment, Expiring (with Call, Message and Renew), demo sign-in, Mac window frame, animated background, the sidebar app layout with member search and Expiring badge, full screen mode, the closable demo bar, 30 days of sample history, the Home dashboard with three charts, and the Backup page with history.

The landing page redesign: floating pill nav, colour-blocked sections (black, off-white, orange), one file per section, barbell bars on every seam (six shapes, all symmetrical), pricing card, FAQ, closing section, a real footer, the redrawn `AppPreview`, and 3D pictures in the Questions and StatusPlates sections. The older barbell experiments (`BarbellFrame.tsx`, `BarbellHero.tsx`, plates and collars on the bars) were deleted.

**Pushed and confirmed:** commit `2a50041` (dashboard charts, backup history, PageHeader, CLAUDE.md update). The live site worked after it.

**Delivered and tested on localhost, not yet confirmed as pushed:** Members Import and Export buttons; the new `AppPreview`; the Questions pictures and layout; the StatusPlates layout and picture (including the fix for `Reveal` not taking `style`); the `ScreenPictures` contrast fix; the new `Footer` and `page.tsx`; the previous `CLAUDE.md`. Run `git status` and push with the chained command.

**Delivered, not yet tested or pushed:** `RevealText.tsx` and the Hero headline using it (with the Hero's line and button delays moved to 300 and 400 ms), and this `CLAUDE.md`. The owner has not yet sent a screenshot. Check that the two lines rise one after the other, "one simple screen." is orange, and the bottoms of g and y are not clipped; also check at phone width.

**Manual tests still unconfirmed** (click Reset demo data first): Renew on GF-0016 followed by a part-payment; Cancel payment as Owner and its absence as Receptionist; a second check-in blocked in one day; Simulate scan; Backup export, import, a bad file and the receptionist lock; Record payment then Print receipt (the sidebar must not appear on the receipt); the Check-in "Welcome" wording; the Message button on the Expiring page; the Try chips on Check-in (none should say "already checked in"); a payment of LKR 1,000 on GF-0008.

**Open items, in the agreed order:**
1. Push what is pending (see above). Then check the live GitHub Pages site: landing page, the four 3D pictures (they must load under the `/gymflow` base path), the footer links, **Try the demo** to the sign-in screen, the animated background on `/gymflow/app/`, **Back to website** and **Get this for your gym**, then press Reset demo data.
2. Headline animation: test the Hero, then agree the proposed styles for the other sections (see "Headline animation") and build them one at a time with a `variant` prop on `RevealText`.
3. Landing text rewrite: the owner wants to rewrite the text and flow of each section. Decide first who the page speaks to (gym owners) and the tone, then write the new text and edit the section files one at a time. Headings that use `RevealText` need their `lines` rewritten, not just a string.
4. DayAtDesk decision: A) keep the screen pictures (contrast fix only), B) add a small 3D icon per step and keep the screens (needs three more image prompts), C) replace the screens with 3D pictures. Recommended: A or B.
5. Toasts for saved payment and renewal (read the `useKumoToastManager` typings first) and a Kumo confirm dialog for Cancel payment (replace `window.confirm`).
6. Members Import and Export to Excel: agree what Export contains, how Import treats existing members, and add SheetJS.
7. Payments screen, owner only: list, date filter, totals split by cash and bank, CSV export. Add it to `nav.ts`.
8. Settings screen, owner only: plan prices, admission fee, expiring days (already read from the database).
9. Responsive pass: Members table as cards on tablet and phone, a phone and tablet check of the whole demo and the landing page (nav, barbell bars, section padding, orange section contrast, the new Questions and StatusPlates rows, the headline animation), a shared loading skeleton and empty states, and `PageHeader` on every screen that does not use it yet.
10. Small items: autofocus the Check-in input so a scanner works without a click; add a focus trap to the mobile drawer before any real launch; check VS Code's 1 problem in `src/app/app/members/page.tsx` (its message was never read).
11. Replace the WhatsApp placeholder number in `landing/shared.tsx`.
12. Show the demo to a real gym owner. Their answers decide the business rules, pricing and whether a backend is needed.
13. Optional: an Open Graph share image (needs a PNG in `public/` and an absolute URL).

## Not in scope (do not build unless asked)

POS or shop, CRM or leads, classes and booking, workout plans, body progress, trainers module, member portal, freezing, multi-location, multi-company, Sinhala or Tamil, automatic WhatsApp or SMS (needs a backend), online payments, licensing and a control cloud, an update system, a dark/light toggle, PDF or Excel exports beyond basic JSON and CSV (the planned Members Excel import and export is the one agreed exception), and any real authentication.

## Gotchas

- Running several commands on separate PowerShell lines does not stop when one fails. Use `&&` to chain them (PowerShell 7). In older PowerShell use `;`.
- GitHub Pages serves the site under `/gymflow/`. If CSS, JS or the landing pictures fail to load after a deploy, check `basePath` first.
- The pictures folder is `src/assests/landing/` (note the spelling). Imports must match it exactly.
- `Reveal` does not accept a `style` prop (TypeScript error "Property 'style' does not exist"). Put the style on an inner `div`.
- `RevealText` needs a `key` on every element inside `lines` (React warning otherwise). Its line wrappers use `overflow-hidden`, so keep the `pb-[0.12em]` and `-mb-[0.12em]` padding trick or letters with tails get cut off at `leading-none`.
- A dark picture card placed in the orange or off-white sections inherits that section's text colour (black). Set the card's own text colour, or its text will be nearly invisible (this happened in `ScreenPictures.tsx`).
- Dexie and WebGL cannot run during the build. A crash like "indexedDB is not defined" means a call is running at module level or during server rendering; move it into a hook inside a `"use client"` component.
- A barbell bar that looks cut by a straight line means the `from` and `to` colours do not match the real section colours; check `BLOCK` in `BarbellBand.tsx` against `shared.tsx`.
- `ensureSeeded` only seeds an empty database, so a browser that already holds older demo data (including anyone who opened the live demo earlier) keeps it until Reset demo data is pressed.
- After the schema upgrade to version 2, a stuck "Loading..." can mean another GymFlow tab is still open on the old version. Close the other tabs.
- `recordPayment` rejects an amount above the member's balance. Anything that writes history (the demo seeder) must write to `db.payments` directly, not through that function.
- The black round "N" in the corner of `localhost:3000` is the Next.js dev badge. It does not exist in the deployed site.
- Tailwind v4 "important" modifier is a trailing `!` (for example `print:block!`), as used in `AppShell` and `DemoFrame`.
- The mobile drawer closes with Escape and the backdrop but has no focus trap yet.
- VS Code shows a few yellow Tailwind suggestions (for example `w-[72px]` can be `w-18`, or a `focus-visible:outline` conflict in `AppShell`). They are style hints, not errors.
- `npm audit --omit=dev` found 0 vulnerabilities (checked 2026-10-05); the 5 high-severity warnings from plain `npm audit` are dev-tool only. Never run `npm audit fix --force`; it can break the project. Re-run `npm audit --omit=dev` before any real launch.
- The VS Code warning "Value 'github-pages' is not valid" in `deploy.yml` is a false positive and can be ignored. Git's "LF will be replaced by CRLF" warnings are harmless on Windows.
- The repo is public. Never commit real member data, Excel files or secrets. The `out/` folder is build output; do not edit it.

## Future direction (after a pilot gym is confirmed)

Move from the static demo to a real install at the gym: Next.js or a Node API with PostgreSQL on a small local server, a USB QR scanner, automatic nightly backups to a USB drive (which also replaces the browser-only backup history with real files), then automatic reminder messages (a paid add-on, since each message costs money), licensing and multi-location. Keep `src/db/` as the only place that knows where data is stored so the screens survive that change. At that point replace `DemoFrame` with a plain wrapper and delete `demo.ts`, `seed.ts` and the seeding effect.