import { db } from "./db";
import type { Member } from "./types";
import { addMonths, today } from "@/lib/rules";

export type NewMemberInput = {
  name: string;
  phone: string;
  nic?: string;
  address?: string;
  emergencyContact?: string;
  healthOk: boolean;
  planId: string;
};

export async function admissionFee(): Promise<number> {
  const s = await db.settings.get("admissionFee");
  return s?.value ?? 500;
}

export async function nicInUse(nic: string): Promise<boolean> {
  const clean = nic.trim().toLowerCase();
  if (!clean) return false;
  const all = await db.members.toArray();
  return all.some((m) => (m.nic ?? "").toLowerCase() === clean);
}

// Creates the member and sets balance = amount still to be paid.
// The payment screen reduces the balance when money is taken.
export async function createMember(
  input: NewMemberInput,
  waiveAdmission: boolean
): Promise<string> {
  const plan = await db.plans.get(input.planId);
  if (!plan) throw new Error("Plan not found");
  const fee = waiveAdmission ? 0 : await admissionFee();

  return db.transaction("rw", db.members, async () => {
    const all = await db.members.toArray();
    const highest = all.reduce((max, m) => {
      const n = parseInt(m.number.replace("GF-", ""), 10);
      return Number.isNaN(n) ? max : Math.max(max, n);
    }, 0);
    const number = `GF-${String(highest + 1).padStart(4, "0")}`;
    const start = today();

    const member: Member = {
      id: crypto.randomUUID(),
      number,
      name: input.name.trim(),
      phone: input.phone.trim(),
      nic: input.nic?.trim() || undefined,
      address: input.address?.trim() || undefined,
      emergencyContact: input.emergencyContact?.trim() || undefined,
      healthOk: input.healthOk,
      planId: input.planId,
      joinedOn: start,
      expiresOn: addMonths(start, plan.months),
      balance: plan.price + fee,
    };
    await db.members.add(member);
    return member.id;
  });
}