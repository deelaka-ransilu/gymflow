import { db } from "./db";
import { today } from "@/lib/rules";

export function nowLocal(): string {
  const n = new Date();
  const p = (x: number) => String(x).padStart(2, "0");
  return `${today()}T${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())}`;
}

export async function lastVisit(memberId: string): Promise<string | undefined> {
  const all = await db.visits.where("memberId").equals(memberId).toArray();
  if (all.length === 0) return undefined;
  return all.map((v) => v.at).sort().reverse()[0];
}

export async function recordVisit(memberId: string, override = false) {
  const existing = await db.visits
    .where("at")
    .startsWith(today())
    .filter((v) => v.memberId === memberId)
    .first();
  if (existing) return { duplicate: true };
  await db.visits.add({ memberId, at: nowLocal(), override });
  return { duplicate: false };
}