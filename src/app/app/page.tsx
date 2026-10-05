"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@cloudflare/kumo";
import { db } from "@/db/db";
import {
  checkInsPerDay,
  expiringMembers,
  lastDays,
  moneyByMethod,
  moneyPerDay,
  statusCounts,
  weekdayOf,
} from "@/db/stats";
import { useRole } from "@/lib/role";
import { daysLeft, formatLKR, today } from "@/lib/rules";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/app/PageHeader";
import { ChartCard } from "@/components/app/charts/ChartCard";
import { BarChart, type Bar } from "@/components/app/charts/BarChart";
import { LineChart } from "@/components/app/charts/LineChart";
import { StatusBar } from "@/components/app/charts/StatusBar";

const WEEKDAY_LETTER = ["S", "M", "T", "W", "T", "F", "S"];
const CHECKIN_DAYS = 14;
const MONEY_DAYS = 30;

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border border-[#2E2E2E] bg-[#1C1C1C] p-4">
      <div className="text-sm text-neutral-400">{label}</div>
      <div className="font-heading mt-1 text-4xl">{value}</div>
      {note && <div className="mt-1 text-xs text-neutral-500">{note}</div>}
    </div>
  );
}

export default function HomePage() {
  const { role } = useRole();
  const members = useLiveQuery(() => db.members.toArray(), []);
  const visits = useLiveQuery(() => db.visits.toArray(), []);
  const payments = useLiveQuery(() => db.payments.toArray(), []);
  const setting = useLiveQuery(() => db.settings.get("expiringDays"), []);
  const days = setting?.value ?? 7;

  if (!members || !visits || !payments) return <p className="text-neutral-400">Loading...</p>;

  const t = today();
  const status = statusCounts(members, days);
  const active = status.active + status.expiring;
  const soon = expiringMembers(members, days);
  const checkInsToday = visits.filter((v) => v.at.startsWith(t)).length;
  const moneyToday = payments
    .filter((p) => !p.cancelled && p.at.startsWith(t))
    .reduce((sum, p) => sum + p.amount, 0);
  const owed = members.reduce((sum, m) => sum + m.balance, 0);

  // Check-ins, last 14 days
  const checkInDays = lastDays(CHECKIN_DAYS);
  const checkInCounts = checkInsPerDay(visits, checkInDays);
  const bars: Bar[] = checkInDays.map((d, i) => ({
    key: d,
    value: checkInCounts[i],
    label: WEEKDAY_LETTER[weekdayOf(d)],
    sublabel: String(Number(d.slice(8))),
    title: `${formatDate(d)}: ${checkInCounts[i]} ${checkInCounts[i] === 1 ? "check-in" : "check-ins"}`,
    highlight: i === checkInDays.length - 1,
  }));

  // Money, last 30 days (owner only)
  const moneyDays = lastDays(MONEY_DAYS);
  const moneyValues = moneyPerDay(payments, moneyDays);
  const moneySplit = moneyByMethod(payments, moneyDays);

  return (
    <div>
      <PageHeader
        title="Home"
        subtitle="Here is how the gym looks today."
        actions={
          <>
            <Link href="/app/check-in">
              <Button variant="primary">Check-in</Button>
            </Link>
            <Link href="/app/members/new">
              <Button variant="secondary">Add member</Button>
            </Link>
          </>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active members" value={String(active)} note={`${members.length} in total`} />
        <Stat label="Check-ins today" value={String(checkInsToday)} />
        <Stat label={`Expiring in ${days} days`} value={String(soon.length)} />
        {role === "owner" ? (
          <Stat
            label="Money today"
            value={formatLKR(moneyToday)}
            note={owed > 0 ? `${formatLKR(owed)} still owed in total` : undefined}
          />
        ) : (
          <Stat label="Members owing money" value={String(members.filter((m) => m.balance > 0).length)} />
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Check-ins" note={`Last ${CHECKIN_DAYS} days`}>
          <BarChart
            data={bars}
            ariaLabel={`Check-ins per day for the last ${CHECKIN_DAYS} days. Today: ${checkInsToday}.`}
          />
        </ChartCard>

        <ChartCard title="Membership status" note={`${members.length} members`}>
          <StatusBar counts={status} />
        </ChartCard>

        {role === "owner" && (
          <ChartCard title="Money collected" note={`Last ${MONEY_DAYS} days`} className="lg:col-span-2">
            <LineChart
              values={moneyValues}
              startLabel={formatDate(moneyDays[0])}
              endLabel="Today"
              ariaLabel={`Money collected per day for the last ${MONEY_DAYS} days. Total ${formatLKR(moneySplit.total)}.`}
            />
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div>
                <div className="text-sm text-neutral-400">Total</div>
                <div className="font-heading mt-1 text-2xl">{formatLKR(moneySplit.total)}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-400">Cash</div>
                <div className="font-heading mt-1 text-2xl">{formatLKR(moneySplit.cash)}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-400">Bank transfer</div>
                <div className="font-heading mt-1 text-2xl">{formatLKR(moneySplit.bank)}</div>
              </div>
            </div>
          </ChartCard>
        )}
      </div>

      <div className="mt-10 flex items-end justify-between">
        <h2 className="font-heading text-2xl">Expiring soon</h2>
        <Link href="/app/expiring" className="text-sm text-accent hover:underline">
          See all
        </Link>
      </div>
      <div className="mt-3 overflow-hidden rounded-xl border border-[#2E2E2E] bg-[#1C1C1C]">
        {soon.length === 0 ? (
          <p className="p-4 text-neutral-400">Nobody is expiring soon.</p>
        ) : (
          soon.slice(0, 5).map((m) => (
            <Link
              key={m.id}
              href={`/app/members/view?id=${encodeURIComponent(m.id)}`}
              className="flex items-center justify-between border-b border-[#2E2E2E] px-4 py-3 text-sm last:border-b-0 hover:bg-white/5"
            >
              <span className="font-medium">
                {m.name} <span className="text-neutral-400">{m.number}</span>
              </span>
              <span className="text-neutral-300">
                {daysLeft(m.expiresOn) === 0 ? "Today" : formatDate(m.expiresOn)}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}