# GymFlow MVP: Scope

One gym, one server, one front desk. Built for a single pilot customer first. Productize later.

## Goal

Replace the paper register and Excel sheet with a simple system that lets the front desk:

1. Register members quickly
2. Check them in and know instantly if they're allowed in
3. Record payments and print receipts
4. See who is expiring so no renewals are lost

The owner should also trust that the day's money adds up and that the data is backed up.

## Pilot gym facts

- 1 location, about 150 to 300 members (about 250 in the existing Excel sheet)
- 2 receptionists in shifts, plus the owner
- 1 old Windows PC at the desk, Wi-Fi router, unreliable internet, power cuts a few times a month (no UPS)
- A4 inkjet printer
- English-only staff UI

## Business rules

### Plans and fees

| Item | Price |
|---|---|
| 1 month | LKR 2,000 |
| 5 months | LKR 7,500 |
| Admission (joining) fee | LKR 500, one-time |

- Prices are stored in the database, **not hard-coded**, so the owner can change them.
- Admission fee is charged to new members only. It is charged again only if a member returns after more than about 3 months away. Only the owner can waive it.
- Discounts: owner only.

### Renewal

- Renewed **on time** (before or on the expiry date): new period starts from the old expiry date.
- Renewed **late**: new period starts from the payment date.
- No freezing in the MVP.

### Members

- Required: name, phone
- Collected: NIC, address, emergency contact, health declaration (tick box), photo
- NIC is unique when present. Phone numbers can be shared.
- Under-18 members can join without a NIC, with a parent or guardian's details recorded.
- Member numbers are assigned automatically.

### Check-in

- Scan a QR card (USB scanner) **or** type a phone number or name.
- Show: photo, name, status, expiry date, balance owed, last visit.
- Valid membership: green "Welcome back, [name]!" and attendance recorded.
- Expired: big red "Expired" warning. The receptionist can **override with one click**. Every override is logged with who and when.
- A balance owed is shown, but entry is still allowed.

### Payments

- Methods: cash and bank transfer (card optional, same flow).
- Part-payments allowed, with the balance tracked per member.
- Every payment records **who** took it and when.
- Receptionists **cannot edit or delete** payments.
- The owner can **cancel** a payment. It stays on record as cancelled and is never deleted.
- Printable A4 receipt with gym name, running receipt number, member, plan, amount, balance, and new expiry date.

### Roles

| Role | Can do |
|---|---|
| Owner | Everything, including revenue totals, cancelling payments, changing prices, reviewing overrides, backups |
| Receptionist | Add and edit members, check in, take payments, print receipts. Cannot see revenue totals or delete anything |

### Reminders

- A daily "Expiring in 7 days" list on screen for the receptionist to call from.
- No automatic WhatsApp or SMS in the MVP.

### Backups

- Automatic nightly backup (about 2:00 AM) to an external USB drive.
- "Backup Now" button for the owner.
- Dashboard shows "Last backup: today 2:00 AM" with a clear warning if a backup is missed.
- A backup on the same disk as the database does not count as a backup. The USB drive is required.
- Recommend a UPS (about LKR 15,000 to 25,000) to the pilot gym.

## MVP features

1. Login with Owner and Receptionist roles
2. Members: add, edit, search (by name, phone, member number, NIC), photo
3. Membership plans (editable prices) and assigning/renewing them
4. QR card generation and printing (laminated A6 card from the desk printer)
5. Check-in screen with USB scanner or typed search
6. Payments with part-payment support and printable receipt
7. Simple dashboard: active members, expiring in 7 days, today's check-ins, today's revenue (owner only)
8. Excel import of existing members, with a preview and error report
9. Nightly backup plus "Backup Now" and restore instructions
10. Override log and payment audit trail (who did what, when)

## NOT in the MVP

POS or shop, CRM or leads, classes and booking, workout plans, body progress, trainers module, member portal, freezing, multi-location, multi-company, Sinhala/Tamil, automatic WhatsApp/SMS, online payments (PayHere), licensing and the control cloud, update system, command palette, dark mode, PDF/Excel exports beyond basic CSV.

These come after the pilot gym has used the system and asked for them.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind, React Router, TanStack Query, React Hook Form, Zod, shadcn/ui |
| Backend | Node.js, TypeScript, Fastify (or Express), Zod |
| Database | PostgreSQL with Prisma migrations |
| Auth | JWT (access token), argon2 or bcrypt |
| Jobs | node-cron inside the API process |
| Deploy | Docker Compose: Nginx, backend, Postgres |
| Scanner | USB QR/barcode scanner (keyboard input, works over plain HTTP on the LAN) |

Target hardware: 4 CPU cores, 8 GB RAM, SSD.

## Performance targets

- Member search under 500 ms
- Check-in under 2 seconds
- Dashboard under 2 seconds
- Everything works with no internet.

## Rollout plan

1. Import the Excel data and check it with the owner.
2. Install on the gym PC or a small server on the LAN.
3. Run the paper register alongside the system for about 2 weeks.
4. Retire the paper register once the numbers match.

## Commercial (pilot)

- One-time setup: about LKR 50,000 to 100,000
- Monthly support and backups: about LKR 3,000 to 5,000
- Pilot discount in exchange for weekly feedback and a testimonial

## Build order

1. Repo, tooling, Docker Compose, Prisma schema
2. Walking skeleton (login, one protected route, one page) running on real hardware
3. Auth and roles
4. Members and Excel import
5. Plans and memberships
6. Check-in
7. Payments and receipts
8. Dashboard
9. Backup and restore drill
10. Pilot install

## Definition of done

- A receptionist can register a member, take a payment, and check them in without help.
- Check-in works with a USB scanner on the real gym PC.
- A backup has been restored successfully on a different machine.
- The owner's evening cash total matches the system's daily total.
- Pulling the power plug on the server and restarting it loses no recorded data.