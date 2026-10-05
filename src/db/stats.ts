import { addDays, statusOf, today, type Status } from "@/lib/rules";
import type { Member, Payment, Visit } from "./types";

/*
 * Numbers for the Home screen. Pure functions: they take plain arrays and return plain
 * numbers, so they work the same whatever database sits behind src/db/.
 * Status rules come from rules.ts (statusOf), never re-written here.
 */

/** The last `count` calendar days, oldest first, ending today. */
export function lastDays(count: number, now: string = today()): string[] {
  return Array.from({ length: count }, (_, i) => addDays(now, i - (count - 1)));
}

/** 0 = Sunday ... 6 = Saturday, for a YYYY-MM-DD date. */
export function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

/** Check-ins on each of the given days. */
export function checkInsPerDay(visits: Visit[], days: string[]): number[] {
  const counts = new Map<string, number>();
  for (const v of visits) {
    const day = v.at.slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  return days.map((d) => counts.get(d) ?? 0);
}

/** Money collected on each of the given days. Cancelled payments are not counted. */
export function moneyPerDay(payments: Payment[], days: string[]): number[] {
  const totals = new Map<string, number>();
  for (const p of payments) {
    if (p.cancelled) continue;
    const day = p.at.slice(0, 10);
    totals.set(day, (totals.get(day) ?? 0) + p.amount);
  }
  return days.map((d) => totals.get(d) ?? 0);
}

/** Money collected over the given days, split by how it was paid. */
export function moneyByMethod(payments: Payment[], days: string[]) {
  const inRange = new Set(days);
  let cash = 0;
  let bank = 0;
  for (const p of payments) {
    if (p.cancelled || !inRange.has(p.at.slice(0, 10))) continue;
    if (p.method === "cash") cash += p.amount;
    else bank += p.amount;
  }
  return { cash, bank, total: cash + bank };
}

/** How many members are active, expiring soon and expired. */
export function statusCounts(
  members: Member[],
  expiringDays: number,
  now: string = today()
): Record<Status, number> {
  const counts: Record<Status, number> = { active: 0, expiring: 0, expired: 0 };
  for (const m of members) counts[statusOf(m.expiresOn, expiringDays, now)] += 1;
  return counts;
}

/** Members whose membership ends within `expiringDays` (today included), soonest first. */
export function expiringMembers(
  members: Member[],
  expiringDays: number,
  now: string = today()
): Member[] {
  return members
    .filter((m) => statusOf(m.expiresOn, expiringDays, now) === "expiring")
    .sort((a, b) => a.expiresOn.localeCompare(b.expiresOn));
}