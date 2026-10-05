"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@cloudflare/kumo";
import { db } from "@/db/db";
import { cancelPayment, needsAdmissionAgain, renewMember } from "@/db/renewals";
import { useRole } from "@/lib/role";
import { daysLeft, formatLKR, renewedExpiry, statusOf } from "@/lib/rules";
import { formatDate, initials } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-sm text-neutral-400">{label}</div>
      <div className="font-medium">{value || "-"}</div>
    </div>
  );
}

function ViewInner() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");
  const { role } = useRole();

  const member = useLiveQuery(
    async () => (id ? ((await db.members.get(id)) ?? null) : null),
    [id]
  );
  const plans = useLiveQuery(() => db.plans.toArray(), []);
  const payments = useLiveQuery(
    async () => (id ? db.payments.where("memberId").equals(id).toArray() : []),
    [id]
  );
  const visits = useLiveQuery(
    async () => (id ? db.visits.where("memberId").equals(id).toArray() : []),
    [id]
  );
  const readmit = useLiveQuery(async () => (id ? needsAdmissionAgain(id) : false), [id, member?.expiresOn]);

  const [renewPlan, setRenewPlan] = useState("");
  const [waive, setWaive] = useState(false);
  const [error, setError] = useState("");
  const [renewOpen, setRenewOpen] = useState(false);

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

  const plan = plans?.find((p) => p.id === member.planId);
  const chosen = plans?.find((p) => p.id === (renewPlan || member.planId));
  const status = statusOf(member.expiresOn);
  const left = daysLeft(member.expiresOn);
  const sortedPayments = [...(payments ?? [])].sort((a, b) => b.at.localeCompare(a.at));
  const sortedVisits = [...(visits ?? [])].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 10);

  async function doRenew() {
    if (!member) return;
    setError("");
    try {
      await renewMember(member.id, renewPlan || member.planId, role === "owner" && waive);
      router.push(`/app/members/pay?id=${encodeURIComponent(member.id)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  async function doCancel(paymentId: number) {
    if (!window.confirm("Cancel this payment? The amount goes back onto the member's balance.")) return;
    try {
      await cancelPayment(paymentId, role);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  const selectClass =
    "w-full rounded-lg border border-[#2E2E2E] bg-[#1C1C1C] px-3 py-2 text-sm text-[#F5F5F5] outline-none focus:border-[#FF6A00]";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800 text-lg font-medium">
          {initials(member.name)}
        </div>
        <div className="flex-1">
          <h1 className="font-heading text-4xl">{member.name}</h1>
          <p className="text-neutral-400">
            {member.number} · {plan?.name ?? "-"}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-6 grid gap-4 rounded-xl border border-[#2E2E2E] bg-[#1C1C1C] p-4 sm:grid-cols-3">
        <Detail
          label="Expires"
          value={`${formatDate(member.expiresOn)} (${left >= 0 ? `${left} days left` : `expired ${-left} days ago`})`}
        />
        <Detail label="Joined" value={formatDate(member.joinedOn)} />
        <div>
          <div className="text-sm text-neutral-400">Balance owed</div>
          <div className={member.balance > 0 ? "font-medium text-yellow-400" : "font-medium"}>
            {formatLKR(member.balance)}
          </div>
        </div>
        <Detail label="Phone" value={member.phone} />
        <Detail label="NIC" value={member.nic} />
        <Detail label="Emergency / guardian contact" value={member.emergencyContact} />
        <Detail label="Address" value={member.address} />
        <Detail label="Fit to exercise" value={member.healthOk ? "Confirmed" : "Not confirmed"} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="primary" onClick={() => setRenewOpen((v) => !v)}>
          Renew
        </Button>
        {member.balance > 0 && (
          <Link href={`/app/members/pay?id=${encodeURIComponent(member.id)}`}>
            <Button variant="secondary">Take payment</Button>
          </Link>
        )}
        <Link href="/app/members">
          <Button variant="ghost">Back to members</Button>
        </Link>
      </div>

      {renewOpen && (
        <div className="mt-4 max-w-md space-y-3 rounded-xl border border-[#2E2E2E] bg-[#1C1C1C] p-4 text-sm">
          <div>
            <label className="mb-1 block font-medium" htmlFor="renew-plan">
              Plan
            </label>
            <select
              id="renew-plan"
              className={selectClass}
              value={renewPlan || member.planId}
              onChange={(e) => setRenewPlan(e.target.value)}
            >
              {(plans ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - {formatLKR(p.price)}
                </option>
              ))}
            </select>
          </div>
          {chosen && (
            <p className="text-neutral-300">
              New expiry date: <span className="font-medium">{formatDate(renewedExpiry(member.expiresOn, chosen.months))}</span>
            </p>
          )}
          {readmit && (
            <p className="text-yellow-400">
              Away for over 3 months, so the admission fee applies again.
            </p>
          )}
          {readmit && role === "owner" && (
            <label className="flex items-center gap-2 [&>input]:accent-[#FF6A00]">
              <input type="checkbox" checked={waive} onChange={(e) => setWaive(e.target.checked)} />
              Waive admission fee
            </label>
          )}
          {error && <p className="text-red-500">{error}</p>}
          <Button variant="primary" onClick={doRenew}>
            Renew and take payment
          </Button>
        </div>
      )}

      <h2 className="font-heading mt-10 text-2xl">Payments</h2>
      <div className="mt-3 overflow-hidden rounded-xl border border-[#2E2E2E] bg-[#1C1C1C]">
        {sortedPayments.length === 0 ? (
          <p className="p-4 text-neutral-400">No payments yet.</p>
        ) : (
          sortedPayments.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2E2E2E] px-4 py-3 text-sm last:border-b-0"
            >
              <div>
                <span className={p.cancelled ? "font-medium line-through" : "font-medium"}>
                  {p.receiptNo}
                </span>{" "}
                <span className="text-neutral-400">
                  {formatDate(p.at.slice(0, 10))} · {p.method === "cash" ? "Cash" : "Bank"} ·{" "}
                  {p.by === "owner" ? "Owner" : "Receptionist"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {p.cancelled && <span className="text-red-500">Cancelled</span>}
                <span className={p.cancelled ? "text-neutral-500 line-through" : ""}>
                  {formatLKR(p.amount)}
                </span>
                {role === "owner" && !p.cancelled && (
                  <Button variant="ghost" size="sm" onClick={() => doCancel(p.id!)}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <h2 className="font-heading mt-10 text-2xl">Recent visits</h2>
      <div className="mt-3 overflow-hidden rounded-xl border border-[#2E2E2E] bg-[#1C1C1C]">
        {sortedVisits.length === 0 ? (
          <p className="p-4 text-neutral-400">No visits yet.</p>
        ) : (
          sortedVisits.map((v) => (
            <div
              key={v.id}
              className="flex justify-between border-b border-[#2E2E2E] px-4 py-3 text-sm last:border-b-0"
            >
              <span>{formatDate(v.at.slice(0, 10))}</span>
              <span className="text-neutral-400">
                {v.override && <span className="mr-3 text-red-500">Override</span>}
                {v.at.slice(11, 16)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function ViewPage() {
  return (
    <Suspense fallback={<p className="text-neutral-400">Loading...</p>}>
      <ViewInner />
    </Suspense>
  );
}