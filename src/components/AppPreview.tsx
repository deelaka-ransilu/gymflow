"use client";

import Link from "next/link";
import {
  Barbell,
  CalendarX,
  FloppyDisk,
  House,
  MagnifyingGlass,
  SignOut,
  UserCheck,
  Users,
  type Icon,
} from "@phosphor-icons/react";
import { Reveal } from "@/components/landing/Reveal";

// A picture of the real Home screen, drawn in HTML, CSS and SVG. Decoration only:
// not interactive, hidden from screen readers. All names and numbers are sample data.

const MENU: { label: string; Icon: Icon; active?: boolean; badge?: string }[] = [
  { label: "Home", Icon: House, active: true },
  { label: "Check-in", Icon: UserCheck },
  { label: "Members", Icon: Users },
  { label: "Expiring", Icon: CalendarX, badge: "6" },
];

const STATS = [
  { label: "Active members", value: "12", note: "20 in total" },
  { label: "Check-ins today", value: "24" },
  { label: "Expiring in 7 days", value: "6" },
  { label: "Money today", value: "LKR 14,500", note: "LKR 1,000 still owed" },
];

// Last 14 days of check-ins, today is the last one.
const CHECKINS = [14, 18, 22, 20, 17, 9, 6, 16, 21, 24, 22, 19, 12, 24];

// Last 30 days of money collected, in thousands of LKR.
const MONEY = [9, 0, 6, 12, 3, 8, 15, 0, 5, 7, 11, 4, 0, 9, 13, 6, 2, 10, 8, 0, 14, 5, 7, 12, 3, 9, 6, 11, 8, 14];

const STATUS = [
  { label: "Active", count: 12, color: "#22C55E", text: "text-green-500" },
  { label: "Expiring soon", count: 6, color: "#FACC15", text: "text-yellow-400" },
  { label: "Expired", count: 2, color: "#EF4444", text: "text-red-500" },
];

const MONEY_TOTALS = [
  { label: "Total", value: "LKR 186,000" },
  { label: "Cash", value: "LKR 118,500" },
  { label: "Bank transfer", value: "LKR 67,500" },
];

function NavRow({ label, Icon, active, badge }: { label: string; Icon: Icon; active?: boolean; badge?: string }) {
  return (
    <div
      className={`flex min-h-11 items-center gap-3 rounded-xl border p-1.5 pr-3 text-sm font-medium ${
        active
          ? "border-[#3a3a3a] bg-[#2a2a2a] text-kumo-default shadow-lg shadow-black/30"
          : "border-transparent text-kumo-subtle"
      }`}
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
          active ? "bg-accent text-black" : "bg-white/5"
        }`}
      >
        <Icon size={18} weight={active ? "fill" : "regular"} />
      </span>
      <span>{label}</span>
      {badge && (
        <span className="ml-auto rounded-full bg-[#FACC15]/15 px-2 py-0.5 text-xs font-semibold text-[#FACC15]">
          {badge}
        </span>
      )}
    </div>
  );
}

function Card({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-kumo-line bg-kumo-base p-3 sm:p-4">
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-xs font-medium sm:text-sm">{title}</div>
        {note && <div className="text-[10px] text-kumo-subtle sm:text-xs">{note}</div>}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function CheckInBars() {
  const max = Math.max(...CHECKINS);
  return (
    <div className="flex h-24 items-end gap-1 border-b border-dashed border-kumo-line sm:h-28">
      {CHECKINS.map((v, i) => {
        const today = i === CHECKINS.length - 1;
        return (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-0.5">
            <span className="hidden text-[9px] text-kumo-subtle sm:block">{v}</span>
            <div
              className={`w-full rounded-t-sm ${today ? "bg-[#FF6A00]" : "bg-[#3A3A3A]"}`}
              style={{ height: `${(v / max) * 70}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

function StatusBar() {
  const total = STATUS.reduce((n, s) => n + s.count, 0);
  return (
    <div>
      <div className="flex h-5 gap-0.5 overflow-hidden rounded-md">
        {STATUS.map((s) => (
          <div key={s.label} style={{ width: `${(s.count / total) * 100}%`, background: s.color }} />
        ))}
      </div>
      <div className="mt-3 space-y-1.5 text-xs">
        {STATUS.map((s) => (
          <div key={s.label} className="flex justify-between">
            <span className={`font-medium ${s.text}`}>{s.label}</span>
            <span className="text-neutral-300">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MoneyLine() {
  const max = Math.max(...MONEY);
  const step = 300 / (MONEY.length - 1);
  const pts = MONEY.map((v, i) => `${(i * step).toFixed(1)} ${(70 - (v / max) * 60).toFixed(1)}`);
  const line = `M${pts.join(" L")}`;
  return (
    <div>
      <svg viewBox="0 0 300 80" preserveAspectRatio="none" className="h-20 w-full sm:h-24">
        <path d={`${line} V80 H0 Z`} fill="#FF6A00" fillOpacity="0.12" />
        <path
          d={line}
          fill="none"
          stroke="#FF6A00"
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        {MONEY_TOTALS.map((t) => (
          <div key={t.label}>
            <div className="text-kumo-subtle">{t.label}</div>
            <div className="mt-0.5 font-medium">{t.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AppPreview() {
  return (
    <Reveal className="mx-auto max-w-5xl">
      <Link
        href="/app"
        aria-label="Open the GymFlow demo"
        className="group relative block overflow-hidden rounded-2xl border border-[#FF6A00]/30 bg-[#121212] shadow-[0_0_90px_-25px_rgba(255,106,0,0.55)] transition-colors hover:border-[#FF6A00]/60"
      >
        {/* Mac title bar */}
        <div className="flex items-center gap-2 border-b border-kumo-line bg-kumo-base px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <div className="mx-auto rounded-md bg-kumo-tint px-10 py-1 text-xs text-kumo-subtle">
            gymflow.app/app
          </div>
          <span className="w-[52px]" aria-hidden="true" />
        </div>

        {/* Fake app: sidebar plus Home (HTML and CSS only, not interactive) */}
        <div aria-hidden="true" className="flex h-[36rem] select-none overflow-hidden sm:h-[40rem]">
          {/* Sidebar, from tablet width up */}
          <div className="hidden w-60 shrink-0 flex-col border-r border-kumo-line bg-kumo-base sm:flex">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-4 pb-4 pt-5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-black">
                <Barbell size={22} weight="bold" />
              </span>
              <span className="font-heading text-2xl font-semibold leading-none">
                Gym<span className="text-accent">Flow</span>
              </span>
            </div>
            <div className="mx-4 border-t border-kumo-line" />

            {/* Search */}
            <div className="px-3 pt-4">
              <div className="flex h-10 items-center gap-2 rounded-xl border border-kumo-line bg-white/5 px-3 text-sm text-kumo-subtle">
                <MagnifyingGlass size={16} />
                <span>Search members</span>
                <span className="ml-auto rounded border border-kumo-line px-1.5 text-xs">/</span>
              </div>
            </div>

            {/* Menu */}
            <div className="flex-1 px-3">
              <p className="px-3 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-wider text-kumo-subtle/70">
                Menu
              </p>
              <div className="space-y-1">
                {MENU.map((m) => (
                  <NavRow key={m.label} {...m} />
                ))}
              </div>
              <p className="px-3 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-wider text-kumo-subtle/70">
                Admin
              </p>
              <NavRow label="Backup" Icon={FloppyDisk} />
            </div>

            {/* Signed in */}
            <div className="p-3">
              <div className="rounded-xl border border-kumo-line bg-kumo-tint p-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-base font-semibold text-black ring-2 ring-accent/30">
                    O
                  </span>
                  <div>
                    <div className="text-xs text-kumo-subtle">Signed in as</div>
                    <div className="text-sm font-semibold text-kumo-default">Owner</div>
                  </div>
                </div>
                <div className="mt-3 flex min-h-10 items-center justify-center gap-2 rounded-lg bg-black/30 text-sm font-medium text-kumo-default">
                  <SignOut size={18} />
                  Sign out
                </div>
              </div>
            </div>
          </div>

          {/* Home */}
          <div className="min-w-0 flex-1 overflow-hidden p-4 sm:p-6">
            <span className="font-heading text-xl font-semibold sm:hidden">
              Gym<span className="text-accent">Flow</span>
            </span>

            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="font-heading text-3xl sm:text-4xl">Home</h3>
                <p className="text-xs text-kumo-subtle sm:text-sm">Here is how the gym looks today.</p>
              </div>
              <div className="flex gap-2">
                <span className="rounded-lg bg-[#FF6A00] px-3 py-2 text-xs font-medium text-black sm:px-4 sm:text-sm">
                  Check-in
                </span>
                <span className="rounded-lg border border-kumo-line bg-kumo-tint px-3 py-2 text-xs font-medium sm:px-4 sm:text-sm">
                  Add member
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-xl border border-kumo-line bg-kumo-base p-3">
                  <div className="text-[11px] text-kumo-subtle sm:text-xs">{s.label}</div>
                  <div className="font-heading mt-1 text-2xl sm:text-3xl">{s.value}</div>
                  {s.note && <div className="mt-1 hidden text-[10px] text-neutral-500 sm:block">{s.note}</div>}
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <Card title="Check-ins" note="Last 14 days">
                <CheckInBars />
              </Card>
              <Card title="Membership status" note="20 members">
                <StatusBar />
              </Card>
            </div>

            <div className="mt-3">
              <Card title="Money collected" note="Last 30 days">
                <MoneyLine />
              </Card>
            </div>
          </div>
        </div>

        {/* Fade and button */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-[#121212] via-[#121212]/90 to-transparent px-4 pb-8 pt-24">
          <span className="rounded-xl bg-[#FF6A00] px-8 py-4 text-lg font-bold text-black transition-colors group-hover:bg-[#FF8533]">
            Try the demo
          </span>
        </div>
      </Link>
    </Reveal>
  );
}