import { db } from "./db";
import type { Member, Plan } from "./types";
import { addDays, addMonths, today } from "@/lib/rules";

const PLANS: Plan[] = [
  { id: "plan-1", name: "1 month", months: 1, price: 2000 },
  { id: "plan-5", name: "5 months", months: 5, price: 7500 },
];

const NAMES = [
  "Nimal Perera", "Kasun Fernando", "Dilani Silva", "Saman Kumara", "Ishara Jayawardena",
  "Chamari Wickramasinghe", "Ruwan Bandara", "Tharushi Gunasekara", "Amal Herath", "Sanduni Weerasinghe",
  "Lahiru Dissanayake", "Nadeesha Karunaratne", "Malith Senanayake", "Hiruni Abeysekara", "Dinesh Ratnayake",
  "Kavindi Madushani", "Buddhika Jayasinghe", "Sachini Liyanage", "Thilina Samarasinghe", "Anjali Rodrigo",
];

// Days until expiry. Negative = already expired.
const OFFSETS = [25, 12, 3, 5, 18, 40, 1, 60, 90, 7, 2, 30, 120, 10, -3, -15, 20, 6, 45, 75];

export async function resetDemo() {
  const now = today();
  const members: Member[] = NAMES.map((name, i) => {
    const planId = OFFSETS[i] > 35 ? "plan-5" : "plan-1";
    const months = planId === "plan-5" ? 5 : 1;
    const expiresOn = addDays(now, OFFSETS[i]);
    return {
      id: `m-${i + 1}`,
      number: `GF-${String(i + 1).padStart(4, "0")}`,
      name,
      phone: `0771234${String(100 + i)}`,
      healthOk: true,
      planId,
      joinedOn: addMonths(expiresOn, -months),
      expiresOn,
      balance: i === 7 ? 1000 : 0,
    };
  });

  await db.transaction("rw", [db.plans, db.members, db.payments, db.visits, db.settings], async () => {
    await Promise.all([db.plans.clear(), db.members.clear(), db.payments.clear(), db.visits.clear(), db.settings.clear()]);
    await db.plans.bulkAdd(PLANS);
    await db.members.bulkAdd(members);
    await db.settings.bulkAdd([
      { key: "admissionFee", value: 500 },
      { key: "expiringDays", value: 7 },
    ]);
  });
}

export async function ensureSeeded() {
  if ((await db.members.count()) === 0) await resetDemo();
}