import { db } from "./db";
import { nowLocal } from "./queries";
import type { Payment, Role } from "./types";
import { today } from "@/lib/rules";

export type PaymentResult = {
  receiptNo: string;
  amount: number;
  balanceAfter: number;
  at: string;
  method: Payment["method"];
  by: Role;
};

export async function recordPayment(
  memberId: string,
  amount: number,
  method: Payment["method"],
  by: Role
): Promise<PaymentResult> {
  return db.transaction("rw", db.members, db.payments, async () => {
    const member = await db.members.get(memberId);
    if (!member) throw new Error("Member not found.");
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Please enter an amount above zero.");
    }
    if (amount > member.balance) {
      throw new Error(`The amount is more than the balance owed (LKR ${member.balance.toLocaleString("en-LK")}).`);
    }

    const all = await db.payments.toArray();
    const highest = all.reduce((max, p) => {
      const n = parseInt(p.receiptNo.replace("R-", ""), 10);
      return Number.isNaN(n) ? max : Math.max(max, n);
    }, 0);
    const receiptNo = `R-${String(highest + 1).padStart(4, "0")}`;

    const isFirst =
      member.joinedOn === today() &&
      !all.some((p) => p.memberId === memberId && !p.cancelled);
    const at = nowLocal();

    await db.payments.add({
      receiptNo,
      memberId,
      amount,
      method,
      kind: isFirst ? "membership" : "balance",
      at,
      by,
    });

    const balanceAfter = member.balance - amount;
    await db.members.update(memberId, { balance: balanceAfter });

    return { receiptNo, amount, balanceAfter, at, method, by };
  });
}