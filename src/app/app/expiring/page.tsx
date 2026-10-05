"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@cloudflare/kumo";
import { db } from "@/db/db";
import type { Member } from "@/db/types";
import { daysLeft, formatLKR } from "@/lib/rules";
import { formatDate, initials } from "@/lib/format";

function Row({ m }: { m: Member }) {
  const left = daysLeft(m.expiresOn);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2E2E2E] px-4 py-3 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-medium">
          {initials(m.name)}
        </div>
        <div>
          <Link
            href={`/app/members/view?id=${encodeURIComponent(m.id)}`}
            className="font-medium hover:underline"
          >
            {m.name}
          </Link>
          <div className="text-xs text-neutral-400">
            {m.number} · {m.phone}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-neutral-300">
          {left === 0 ? "Expires today" : `Expires ${formatDate(m.expiresOn)}`}
        </span>
        {m.balance > 0 && <span className="text-yellow-400">Owes {formatLKR(m.balance)}</span>}
        <a href={`tel:${m.phone}`}>
          <Button variant="secondary" size="sm">
            Call
          </Button>
        </a>
        <Link href={`/app/members/view?id=${encodeURIComponent(m.id)}`}>
          <Button variant="primary" size="sm">
            Renew
          </Button>
        </Link>
      </div>
    </div>
  );
}

function Group({ title, members }: { title: string; members: Member[] }) {
  return (
    <section className="mt-8">
      <h2 className="font-heading text-2xl">
        {title} <span className="text-neutral-500">({members.length})</span>
      </h2>
      <div className="mt-3 overflow-hidden rounded-xl border border-[#2E2E2E] bg-[#1C1C1C]">
        {members.length === 0 ? (
          <p className="p-4 text-neutral-400">Nobody.</p>
        ) : (
          members.map((m) => <Row key={m.id} m={m} />)
        )}
      </div>
    </section>
  );
}

export default function ExpiringPage() {
  const members = useLiveQuery(() => db.members.toArray(), []);
  const setting = useLiveQuery(() => db.settings.get("expiringDays"), []);
  const days = setting?.value ?? 7;

  if (!members) return <p className="text-neutral-400">Loading...</p>;

  const soon = members
    .filter((m) => {
      const left = daysLeft(m.expiresOn);
      return left >= 0 && left <= days;
    })
    .sort((a, b) => a.expiresOn.localeCompare(b.expiresOn));

  const today0 = soon.filter((m) => daysLeft(m.expiresOn) === 0);
  const next3 = soon.filter((m) => {
    const l = daysLeft(m.expiresOn);
    return l >= 1 && l <= 3;
  });
  const rest = soon.filter((m) => daysLeft(m.expiresOn) > 3);

  return (
    <div>
      <h1 className="font-heading text-4xl">Expiring</h1>
      <p className="text-neutral-400">
        {soon.length} {soon.length === 1 ? "member expires" : "members expire"} in the next {days} days.
        Call them from this list.
      </p>

      <Group title="Today" members={today0} />
      <Group title="Next 3 days" members={next3} />
      <Group title={`4 to ${days} days`} members={rest} />
    </div>
  );
}