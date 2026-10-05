export type Status = "active" | "expiring" | "expired";

const DAY = 86400000;
const toDate = (s: string) => new Date(s + "T00:00:00Z");
const toStr = (d: Date) => d.toISOString().slice(0, 10);

export function today(): string {
  const n = new Date();
  const m = String(n.getMonth() + 1).padStart(2, "0");
  const d = String(n.getDate()).padStart(2, "0");
  return `${n.getFullYear()}-${m}-${d}`;
}

export function addDays(s: string, days: number): string {
  return toStr(new Date(toDate(s).getTime() + days * DAY));
}

export function addMonths(s: string, months: number): string {
  const d = toDate(s);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return toStr(d);
}

export function daysLeft(expiresOn: string, now = today()): number {
  return Math.round((toDate(expiresOn).getTime() - toDate(now).getTime()) / DAY);
}

export function statusOf(expiresOn: string, expiringDays = 7, now = today()): Status {
  const left = daysLeft(expiresOn, now);
  if (left < 0) return "expired";
  return left <= expiringDays ? "expiring" : "active";
}

// On time: new period starts at the old expiry date. Late: starts today.
export function renewalStart(expiresOn: string, now = today()): string {
  return expiresOn >= now ? expiresOn : now;
}

export function renewedExpiry(expiresOn: string, months: number, now = today()): string {
  return addMonths(renewalStart(expiresOn, now), months);
}

export const formatLKR = (n: number) => `LKR ${n.toLocaleString("en-LK")}`;