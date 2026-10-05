import { addDays, addMonths } from "@/lib/rules";
import type { Member, Payment, Plan, Role, Setting, Visit } from "./types";

/*
 * Demo data only. Nothing here touches the database: buildDemo() takes "now" as a
 * string and returns plain objects, so the same input always gives the same result.
 * seed.ts writes them to Dexie. For a real install, delete this file and seed.ts.
 */

const ONE_MONTH: Plan = { id: "plan-1", name: "1 month", months: 1, price: 2000 };
const FIVE_MONTHS: Plan = { id: "plan-5", name: "5 months", months: 5, price: 7500 };

export const PLANS: Plan[] = [ONE_MONTH, FIVE_MONTHS];
export const ADMISSION_FEE = 500;
export const SETTINGS: Setting[] = [
  { key: "admissionFee", value: ADMISSION_FEE },
  { key: "expiringDays", value: 7 },
];

type DemoMember = {
  name: string;
  /** Days until the current period ends. Negative = already expired. Above 35 means the 5 month plan. */
  expiresInDays: number;
  /** Periods paid before the current one. 0 = joined at the start of the current period. */
  earlierPeriods: number;
  /** Still unpaid on the current period (a part-payment). */
  owes?: number;
  /** The current period started today, so the payment shows up in "Money today". */
  renewedToday?: boolean;
  /** Expired, but the receptionist let them in once anyway. */
  letInAnyway?: boolean;
};

// Order matters: member numbers are GF-0001, GF-0002 ... in this order.
const DEMO_MEMBERS: DemoMember[] = [
  { name: "Nimal Perera", expiresInDays: 25, earlierPeriods: 4 },
  { name: "Kasun Fernando", expiresInDays: 12, earlierPeriods: 2 },
  { name: "Dilani Silva", expiresInDays: 3, earlierPeriods: 5 },
  { name: "Saman Kumara", expiresInDays: 5, earlierPeriods: 0 },
  { name: "Ishara Jayawardena", expiresInDays: 18, earlierPeriods: 3 },
  { name: "Chamari Wickramasinghe", expiresInDays: 40, earlierPeriods: 1 },
  { name: "Ruwan Bandara", expiresInDays: 1, earlierPeriods: 6 },
  { name: "Tharushi Gunasekara", expiresInDays: 60, earlierPeriods: 0, owes: 1000 },
  { name: "Amal Herath", expiresInDays: 90, earlierPeriods: 1 },
  { name: "Sanduni Weerasinghe", expiresInDays: 7, earlierPeriods: 2 },
  { name: "Lahiru Dissanayake", expiresInDays: 2, earlierPeriods: 0 },
  { name: "Nadeesha Karunaratne", expiresInDays: 30, earlierPeriods: 3, renewedToday: true },
  { name: "Malith Senanayake", expiresInDays: 120, earlierPeriods: 0 },
  { name: "Hiruni Abeysekara", expiresInDays: 10, earlierPeriods: 1 },
  { name: "Dinesh Ratnayake", expiresInDays: -3, earlierPeriods: 4, letInAnyway: true },
  { name: "Kavindi Madushani", expiresInDays: -15, earlierPeriods: 2 },
  { name: "Buddhika Jayasinghe", expiresInDays: 20, earlierPeriods: 0 },
  { name: "Sachini Liyanage", expiresInDays: 6, earlierPeriods: 3 },
  { name: "Thilina Samarasinghe", expiresInDays: 45, earlierPeriods: 1 },
  { name: "Anjali Rodrigo", expiresInDays: 75, earlierPeriods: 0 },
];

const SEED = 20261005;
const HISTORY_DAYS = 30;
/** How many members already have a check-in today. The last ones in the list, so the first member of each status stays free for the Try chips. */
const TODAY_CHECKINS = 4;
const FIRST_VISIT_MINUTE = 5 * 60 + 30;

/** Busier on weekdays, quiet on Sunday. Index 0 = Sunday. */
const DAY_FACTOR = [0.4, 1.1, 1.0, 1.0, 0.95, 0.85, 0.7];

/** When people come: early morning, a little at lunch, a big evening rush. Minutes since midnight. */
const VISIT_WINDOWS = [
  { from: 5 * 60 + 30, to: 8 * 60 + 30, weight: 30 },
  { from: 11 * 60, to: 14 * 60, weight: 10 },
  { from: 16 * 60 + 30, to: 20 * 60 + 30, weight: 55 },
  { from: 20 * 60 + 30, to: 21 * 60 + 30, weight: 5 },
];

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A UUID-shaped id for demo member number i. It uses its own generator, so it does not touch
 * the main random sequence (the visits and payments stay exactly as they were), and the same
 * member always gets the same id. Real members get crypto.randomUUID() in members.ts.
 */
function demoId(i: number): string {
  const r = mulberry32(SEED + i + 1);
  const hex = (n: number) =>
    Array.from({ length: n }, () => Math.floor(r() * 16).toString(16)).join("");
  const variant = (8 + Math.floor(r() * 4)).toString(16);
  return `${hex(8)}-${hex(4)}-4${hex(3)}-${variant}${hex(3)}-${hex(12)}`;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "YYYY-MM-DDTHH:mm:ss", the same shape nowLocal() produces. */
const atTime = (date: string, minute: number, second: number) =>
  `${date}T${pad(Math.floor(minute / 60))}:${pad(minute % 60)}:${pad(second)}`;

const dayOfWeek = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay();

const byTime = (a: { at: string }, b: { at: string }) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0);

export type DemoData = { members: Member[]; payments: Payment[]; visits: Visit[] };

/** nowAt looks like "2026-10-05T14:30:00". Nothing in the result is later than this moment. */
export function buildDemo(nowAt: string): DemoData {
  const now = nowAt.slice(0, 10);
  const nowMinute = Number(nowAt.slice(11, 13)) * 60 + Number(nowAt.slice(14, 16));
  const rng = mulberry32(SEED);
  const second = () => Math.floor(rng() * 60);

  const members: Member[] = [];
  const payments: Payment[] = [];

  // ---- members and their payments ----
  DEMO_MEMBERS.forEach((spec, i) => {
    const plan = spec.expiresInDays > 35 ? FIVE_MONTHS : ONE_MONTH;
    const expiresOn = spec.renewedToday ? addMonths(now, plan.months) : addDays(now, spec.expiresInDays);
    const rawStart = addMonths(expiresOn, -plan.months);
    const currentStart = spec.renewedToday ? now : rawStart < now ? rawStart : now;

    // Start dates of every paid period, oldest first.
    const starts = [currentStart];
    for (let k = 1; k <= spec.earlierPeriods; k++) {
      starts.unshift(addMonths(currentStart, -k * plan.months));
    }

    const id = demoId(i);
    members.push({
      id,
      number: `GF-${String(i + 1).padStart(4, "0")}`,
      name: spec.name,
      phone: `0771234${String(100 + i)}`,
      healthOk: true,
      planId: plan.id,
      joinedOn: starts[0],
      expiresOn,
      balance: spec.owes ?? 0,
    });

    starts.forEach((start, k) => {
      const isFirst = k === 0;
      const isCurrent = k === starts.length - 1;
      const sampled = 8 * 60 + Math.floor(rng() * 690); // 08:00 to 19:29
      const minute = start === now ? Math.min(sampled, Math.max(nowMinute - 1, 0)) : sampled;
      const at = atTime(start, minute, second());
      const method: Payment["method"] = rng() < 0.7 ? "cash" : "bank";
      const by: Role = rng() < 0.85 ? "receptionist" : "owner";

      if (isFirst) {
        payments.push({ receiptNo: "", memberId: id, amount: ADMISSION_FEE, method, kind: "admission", at, by });
      }
      payments.push({
        receiptNo: "",
        memberId: id,
        amount: plan.price - (isCurrent ? (spec.owes ?? 0) : 0),
        method,
        kind: "membership",
        at,
        by,
      });
    });
  });

  // Receipt numbers in time order, so R-0001 is the oldest.
  payments.sort(byTime);
  payments.forEach((p, i) => {
    p.receiptNo = `R-${String(i + 1).padStart(4, "0")}`;
  });

  // ---- visits ----
  const windowStart = addDays(now, -(HISTORY_DAYS - 1));
  const attendance = members.map(() => 0.3 + rng() * 0.5); // how often each person trains

  const pickMinute = () => {
    let r = rng() * 100;
    for (const w of VISIT_WINDOWS) {
      if (r < w.weight) return w.from + Math.floor(rng() * (w.to - w.from));
      r -= w.weight;
    }
    return VISIT_WINDOWS[VISIT_WINDOWS.length - 1].from;
  };

  const visits: Visit[] = [];

  // Past days: a member can only come between joining and the end of their current period.
  for (let day = windowStart; day < now; day = addDays(day, 1)) {
    const factor = DAY_FACTOR[dayOfWeek(day)];
    members.forEach((m, i) => {
      if (day < m.joinedOn || day > m.expiresOn) return;
      if (rng() < Math.min(attendance[i] * factor, 0.9)) {
        visits.push({ memberId: m.id, at: atTime(day, pickMinute(), second()) });
      }
    });
  }

  // Today: a few members have already checked in, earlier than the current time.
  if (nowMinute > FIRST_VISIT_MINUTE) {
    members
      .filter((m) => m.joinedOn <= now && m.expiresOn >= now)
      .slice(-TODAY_CHECKINS)
      .forEach((m) => {
        const minute = FIRST_VISIT_MINUTE + Math.floor(rng() * (nowMinute - FIRST_VISIT_MINUTE));
        visits.push({ memberId: m.id, at: atTime(now, minute, second()) });
      });
  }

  // One expired member the receptionist let in anyway, so the override case has data.
  DEMO_MEMBERS.forEach((spec, i) => {
    if (!spec.letInAnyway) return;
    const date = addDays(members[i].expiresOn, 1);
    if (date >= windowStart && date < now) {
      visits.push({
        memberId: members[i].id,
        at: atTime(date, 17 * 60 + Math.floor(rng() * 180), second()),
        override: true,
      });
    }
  });

  visits.sort(byTime);
  return { members, payments, visits };
}