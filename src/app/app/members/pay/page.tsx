"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import QRCode from "qrcode";
import { Button, Input } from "@cloudflare/kumo";
import { db } from "@/db/db";
import { recordPayment, type PaymentResult } from "@/db/payments";
import { useRole } from "@/lib/role";
import { formatLKR } from "@/lib/rules";
import { formatDate } from "@/lib/format";

function printSheet(target: "receipt" | "card") {
  document.body.dataset.print = target;
  window.addEventListener(
    "afterprint",
    () => {
      delete document.body.dataset.print;
    },
    { once: true }
  );
  window.print();
}

function PayInner() {
  const params = useSearchParams();
  const id = params.get("id");
  const { role } = useRole();

  const member = useLiveQuery(
    async () => (id ? ((await db.members.get(id)) ?? null) : null),
    [id]
  );
  const plan = useLiveQuery(
    async () => (member ? ((await db.plans.get(member.planId)) ?? null) : null),
    [member?.planId]
  );

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"cash" | "bank">("cash");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [qr, setQr] = useState("");

  // Pre-fill the amount with the full balance the first time it loads.
  useEffect(() => {
    if (member && amount === "" && !result && member.balance > 0) {
      setAmount(String(member.balance));
    }
  }, [member, amount, result]);

  useEffect(() => {
    if (!member) return;
    QRCode.toDataURL(member.number, { margin: 1, width: 240 }).then(setQr);
  }, [member?.number]);

  if (member === undefined) return <p className="text-neutral-400">Loading...</p>;
  if (member === null) {
    return (
      <div>
        <h1 className="font-heading text-4xl">Member not found</h1>
        <Link href="/app/members" className="mt-4 inline-block text-accent hover:underline">
          Back to members
        </Link>
      </div>
    );
  }

  async function submit() {
    if (!member) return;
    setError("");
    setSaving(true);
    try {
      const r = await recordPayment(member.id, parseInt(amount, 10), method, role);
      setResult(r);
      setAmount("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  const methodBtn = (m: "cash" | "bank", label: string) => (
    <Button variant={method === m ? "primary" : "secondary"} onClick={() => setMethod(m)}>
      {label}
    </Button>
  );

  return (
    <div>
      <h1 className="font-heading text-4xl">Payment</h1>
      <p className="text-neutral-400">
        {member.name} · {member.number}
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-xl border border-[#2E2E2E] bg-[#1C1C1C] p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-400">Plan</span>
              <span>{plan?.name ?? "-"}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-neutral-400">Expires</span>
              <span>{formatDate(member.expiresOn)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-[#2E2E2E] pt-2 font-medium">
              <span>Balance owed</span>
              <span className={member.balance > 0 ? "text-yellow-400" : ""}>
                {formatLKR(member.balance)}
              </span>
            </div>
          </div>

          {member.balance > 0 ? (
            <>
              <Input
                label="Amount received (LKR)"
                description="Enter less than the balance for a part-payment."
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                error={error || undefined}
              />
              <div>
                <div className="mb-1 text-sm font-medium">Payment method</div>
                <div className="flex gap-2">
                  {methodBtn("cash", "Cash")}
                  {methodBtn("bank", "Bank transfer")}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="primary" onClick={submit} disabled={saving}>
                  {saving ? "Saving..." : "Record payment"}
                </Button>
                <Link href="/app/members">
                  <Button variant="secondary">Skip for now</Button>
                </Link>
              </div>
            </>
          ) : (
            <p className="text-neutral-300">Nothing owed. This member is fully paid.</p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            {result && (
              <Button variant="secondary" onClick={() => printSheet("receipt")}>
                Print receipt
              </Button>
            )}
            <Button variant="secondary" onClick={() => printSheet("card")}>
              Print member card
            </Button>
            <Link href="/app/members">
              <Button variant="ghost">Done</Button>
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          {result && (
            <div className="receipt-sheet max-w-sm rounded-lg bg-white p-6 text-black">
              <div className="font-heading text-2xl">GymFlow</div>
              <div className="text-xs text-neutral-600">Payment receipt</div>
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Receipt</span>
                  <span className="font-medium">{result.receiptNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date</span>
                  <span>
                    {formatDate(result.at.slice(0, 10))} {result.at.slice(11, 16)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Member</span>
                  <span>
                    {member.name} ({member.number})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Method</span>
                  <span>{result.method === "cash" ? "Cash" : "Bank transfer"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valid until</span>
                  <span>{formatDate(member.expiresOn)}</span>
                </div>
              </div>
              <div className="mt-4 flex justify-between border-t border-neutral-300 pt-3 text-base font-semibold">
                <span>Amount paid</span>
                <span>{formatLKR(result.amount)}</span>
              </div>
              <div className="mt-1 flex justify-between text-sm">
                <span>Balance remaining</span>
                <span>{formatLKR(result.balanceAfter)}</span>
              </div>
              <div className="mt-4 text-xs text-neutral-600">
                Received by {result.by === "owner" ? "Owner" : "Receptionist"}. Thank you!
              </div>
            </div>
          )}

          <div className="card-sheet max-w-xs rounded-lg bg-white p-6 text-black">
            <div className="font-heading text-2xl">GymFlow</div>
            <div className="mt-3 text-lg font-semibold">{member.name}</div>
            <div className="text-sm text-neutral-600">{member.number}</div>
            {qr && <img src={qr} alt={`QR code for ${member.number}`} className="mt-3 h-40 w-40" />}
            <div className="mt-2 text-xs text-neutral-600">Show this card at the front desk.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense fallback={<p className="text-neutral-400">Loading...</p>}>
      <PayInner />
    </Suspense>
  );
}