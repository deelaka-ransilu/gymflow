"use client";
import { useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@cloudflare/kumo";
import { db } from "@/db/db";
import type { Member } from "@/db/types";
import { lastVisit, recordVisit } from "@/db/queries";
import { daysLeft, formatLKR, statusOf, today } from "@/lib/rules";
import { formatDate, initials } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

type Result = {
  member: Member;
  planName: string;
  last?: string;
  checkedIn: boolean;
  already: boolean;
  overridden: boolean;
};

const BANNER = {
  active: "border-green-500/40 bg-green-500/10",
  expiring: "border-yellow-400/40 bg-yellow-400/10",
  expired: "border-red-500/40 bg-red-500/10",
};
const HEADLINE = {
  active: "text-green-500",
  expiring: "text-yellow-400",
  expired: "text-red-500",
};

// One-click demo members: one for each colour.
const DEMO_CHIPS = [
  { number: "GF-0001", label: "Active member", dot: "bg-green-500" },
  { number: "GF-0007", label: "Expiring soon", dot: "bg-yellow-400" },
  { number: "GF-0016", label: "Expired", dot: "bg-red-500" },
];

export default function CheckIn() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const members = useLiveQuery(() => db.members.toArray(), [], [] as Member[]);

  const todays = useLiveQuery(
    async () => {
      const v = (await db.visits.where("at").startsWith(today()).toArray()).sort((a, b) =>
        b.at.localeCompare(a.at)
      );
      const ms = await db.members.bulkGet(v.map((x) => x.memberId));
      return v.map((x, i) => ({
        id: x.id,
        time: x.at.slice(11, 16),
        name: ms[i]?.name ?? "Unknown",
        override: x.override,
      }));
    },
    [],
    []
  );

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return members
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.phone.includes(q) ||
          m.number.toLowerCase().includes(q) ||
          (m.nic ?? "").toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [members, query]);

  async function select(m: Member) {
    const status = statusOf(m.expiresOn);
    const plan = await db.plans.get(m.planId);
    const last = await lastVisit(m.id);
    let checkedIn = false;
    let already = false;
    if (status !== "expired") {
      const r = await recordVisit(m.id);
      checkedIn = true;
      already = r.duplicate;
    }
    setResult({ member: m, planName: plan?.name ?? "", last, checkedIn, already, overridden: false });
    setQuery("");
  }

  async function letIn() {
    if (!result) return;
    await recordVisit(result.member.id, true);
    setResult({ ...result, checkedIn: true, overridden: true });
  }

  function next() {
    setResult(null);
    setQuery("");
    inputRef.current?.focus();
  }

  function simulateScan() {
    if (members.length === 0) return;
    select(members[Math.floor(Math.random() * members.length)]);
  }

  function pickDemo(number: string) {
    const found = members.find((x) => x.number === number);
    if (found) select(found);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") return next();
    if (e.key !== "Enter") return;
    const q = query.trim().toLowerCase();
    const exact = members.find((m) => m.number.toLowerCase() === q || m.phone === q);
    if (exact) return select(exact);
    if (matches.length === 1) select(matches[0]);
  }

  const m = result?.member;
  const status = m ? statusOf(m.expiresOn) : null;
  const left = m ? daysLeft(m.expiresOn) : 0;
  const firstName = m ? m.name.split(" ")[0] : "";

  return (
    <div className="max-w-3xl">
      <h1 className="font-heading text-4xl font-semibold">Check-in</h1>
      <p className="mt-1 text-kumo-subtle">Scan a card, or type a name, phone or member number.</p>

      <div className="mt-6 flex gap-3">
        <input
          ref={inputRef}
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setResult(null);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search member or scan card"
          className="h-14 flex-1 rounded-xl border border-kumo-line bg-kumo-base px-4 text-lg outline-none focus:border-accent"
        />
        <Button size="lg" variant="secondary" onClick={simulateScan}>
          Simulate scan
        </Button>
      </div>

      {!result && query.trim() === "" && members.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-kumo-subtle">Try:</span>
          {DEMO_CHIPS.map((c) => (
            <button
              key={c.number}
              onClick={() => pickDemo(c.number)}
              className="flex items-center gap-2 rounded-full border border-kumo-line bg-kumo-base px-3 py-1.5 text-sm hover:bg-kumo-tint"
            >
              <span className={`h-2 w-2 rounded-full ${c.dot}`} />
              {c.label}
            </button>
          ))}
        </div>
      )}

      {matches.length > 0 && (
        <div className="mt-3 overflow-hidden rounded-xl border border-kumo-line bg-kumo-base">
          {matches.map((x) => (
            <button
              key={x.id}
              onClick={() => select(x)}
              className="flex w-full items-center justify-between gap-3 border-b border-kumo-line px-4 py-3 text-left last:border-b-0 hover:bg-kumo-tint"
            >
              <span>
                <span className="font-medium">{x.name}</span>
                <span className="ml-3 text-sm text-kumo-subtle">
                  {x.number} · {x.phone}
                </span>
              </span>
              <StatusBadge status={statusOf(x.expiresOn)} />
            </button>
          ))}
        </div>
      )}

      {query.trim() !== "" && matches.length === 0 && (
        <p className="mt-3 text-kumo-subtle">No member found. Check the spelling or try the phone number.</p>
      )}

      {result && m && status && (
        <div className={`mt-6 rounded-2xl border p-6 ${BANNER[status]}`}>
          <p className={`font-heading text-4xl font-semibold ${HEADLINE[status]}`}>
            {status === "expired" && !result.overridden
              ? "Membership expired"
              : result.overridden
                ? "Let in with override"
                : result.last
                  ? `Welcome back, ${firstName}!`
                  : `Welcome, ${firstName}!`}
          </p>
          <p className="mt-1 text-kumo-subtle">
            {status === "expired" &&
              !result.overridden &&
              `Expired on ${formatDate(m.expiresOn)}. Ask the member to renew.`}
            {result.overridden && "This override has been recorded."}
            {status === "expiring" &&
              !result.overridden &&
              (left === 0 ? "Expires today." : `Expires in ${left} day${left === 1 ? "" : "s"}.`)}
            {status === "active" && !result.overridden && result.already && "Already checked in today."}
            {status === "active" && !result.overridden && !result.already && "Checked in."}
          </p>

          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-kumo-tint text-xl font-semibold">
              {initials(m.name)}
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-semibold">{m.name}</p>
              <p className="text-sm text-kumo-subtle">
                {m.number} · {result.planName}
              </p>
            </div>
            <div className="ml-auto">
              <StatusBadge status={status} />
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-kumo-subtle">Expires</dt>
              <dd className="mt-1 font-medium">{formatDate(m.expiresOn)}</dd>
            </div>
            <div>
              <dt className="text-kumo-subtle">Last visit</dt>
              <dd className="mt-1 font-medium">{result.last ? formatDate(result.last) : "First visit"}</dd>
            </div>
            <div>
              <dt className="text-kumo-subtle">Balance owed</dt>
              <dd className={`mt-1 font-medium ${m.balance > 0 ? "text-yellow-400" : ""}`}>
                {m.balance > 0 ? formatLKR(m.balance) : "None"}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            {status === "expired" && !result.checkedIn && (
              <Button variant="outline" onClick={letIn}>
                Let in anyway
              </Button>
            )}
            <Button variant="primary" onClick={next}>
              Next member
            </Button>
          </div>
        </div>
      )}

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-semibold">Today&apos;s check-ins</h2>
        {todays.length === 0 ? (
          <p className="mt-2 text-kumo-subtle">No check-ins yet today.</p>
        ) : (
          <ul className="mt-3 overflow-hidden rounded-xl border border-kumo-line bg-kumo-base">
            {todays.map((v) => (
              <li
                key={v.id}
                className="flex items-center justify-between border-b border-kumo-line px-4 py-2 last:border-b-0"
              >
                <span>{v.name}</span>
                <span className="text-sm text-kumo-subtle">
                  {v.override && <span className="mr-3 text-red-500">Override</span>}
                  {v.time}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}