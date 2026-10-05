import { db } from "./db";
import { nowLocal } from "./queries";
import { admissionFee } from "./members";
import type { Role } from "./types";
import { renewedExpiry, today } from "@/lib/rules";

// Returns how long ago (in days) the membership ended, or null if still running.
function daysSinceExpiry(expiresOn: string): number {
  const a = new Date(expiresOn + "T00:00:00Z").getTime();
  const b = new Date(today() + "T00:00:00Z").getTime();
  return Math.round((b - a) / 86400000);
}

export async function needsAdmissionAgain(memberId: string): Promise<boolean> {
  const m = await db.members.get(memberId);
  if (!m) return false;
  return daysSinceExpiry(m.expiresOn) > 90;
}

// Extends the membership and adds what is owed to the balance.
// Money is taken afterwards on the payment screen.
export async function renewMember(
  memberId: string,
  planId: string,
  waiveAdmission: boolean
) {
  return db.transaction("rw", db.members, db.plans, db.settings, async () => {
    const m = await db.members.get(memberId);
    const plan = await db.plans.get(planId);
    if (!m || !plan) throw new Error("Member or plan not found.");

    const charge = (await needsAdmissionAgain(memberId)) && !waiveAdmission ? await admissionFee() : 0;
    await db.members.update(memberId, {
      planId,
      expiresOn: renewedExpiry(m.expiresOn, plan.months),
      balance: m.balance + plan.price + charge,
    });
  });
}

// Owner only. The payment stays on record, and the money goes back onto the balance.
export async function cancelPayment(paymentId: number, by: Role) {
  if (by !== "owner") throw new Error("Only the owner can cancel a payment.");
  await db.transaction("rw", db.members, db.payments, async () => {
    const p = await db.payments.get(paymentId);
    if (!p || p.cancelled) return;
    const m = await db.members.get(p.memberId);
    await db.payments.update(paymentId, { cancelled: true });
    if (m) await db.members.update(m.id, { balance: m.balance + p.amount });
  });
}

export { nowLocal };