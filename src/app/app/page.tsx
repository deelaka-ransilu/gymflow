"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@cloudflare/kumo";
import { db } from "@/db/db";
import { useRole } from "@/lib/role";
import { daysLeft, formatLKR, today } from "@/lib/rules";
import { formatDate } from "@/lib/format";

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
  const active = members.filter((m) => daysLeft(m.expiresOn) >= 0).length;
  const checkInsToday = visits.filter((v) => v.at.startsWith(t)).length;
  const soon = members
    .filter((m) => {
      const l = daysLeft(m.expiresOn);
      return l >= 0 && l <= days;
    })
    .sort((a, b) => a.expiresOn.localeCompare(b.expiresOn));
  const moneyToday = payments
    .filter((p) => !p.cancelled && p.at.startsWith(t))
    .reduce((sum, p) => sum + p.amount, 0);
  const owed = members.reduce((sum, m) => sum + m.balance, 0);

  return (
    <div>
      <h1 className="font-heading text-4xl">Home</h1>
      <p className="text-neutral-400">Here is how the gym looks today.</p>

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

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/app/check-in">
          <Button variant="primary">Check-in</Button>
        </Link>
        <Link href="/app/members/new">
          <Button variant="secondary">Add member</Button>
        </Link>
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