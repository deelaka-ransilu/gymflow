"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { Button, Input } from "@cloudflare/kumo";
import { db } from "@/db/db";
import { admissionFee, createMember, nicInUse } from "@/db/members";
import { useRole } from "@/lib/role";
import { formatLKR } from "@/lib/rules";

type Errors = Partial<Record<"name" | "phone" | "nic" | "guardian" | "plan", string>>;

export default function NewMemberPage() {
  const router = useRouter();
  const { role } = useRole();
  const plans = useLiveQuery(() => db.plans.toArray(), []);
  const fee = useLiveQuery(() => admissionFee(), [], 500);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nic, setNic] = useState("");
  const [address, setAddress] = useState("");
  const [guardian, setGuardian] = useState("");
  const [healthOk, setHealthOk] = useState(false);
  const [under18, setUnder18] = useState(false);
  const [planId, setPlanId] = useState("");
  const [waive, setWaive] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const plan = plans?.find((p) => p.id === planId);
  const admission = waive ? 0 : fee;
  const total = (plan?.price ?? 0) + admission;

  async function submit() {
    const e: Errors = {};
    if (!name.trim()) e.name = "Please enter the member's name.";
    if (!phone.trim()) e.phone = "Please enter a phone number.";
    if (!planId) e.plan = "Please choose a plan.";
    if (under18) {
      if (!guardian.trim()) e.guardian = "Please enter a parent or guardian contact.";
    } else if (!nic.trim()) {
      e.nic = "Please enter the NIC number (or tick 'Under 18').";
    }
    if (nic.trim() && (await nicInUse(nic))) {
      e.nic = "This NIC is already registered to another member.";
    }
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    const id = await createMember(
      { name, phone, nic, address, emergencyContact: guardian, healthOk, planId },
      role === "owner" && waive
    );
    router.push(`/app/members/pay?id=${encodeURIComponent(id)}`);
  }

  const selectClass =
    "w-full rounded-lg border border-[#2E2E2E] bg-[#1C1C1C] px-3 py-2 text-sm text-[#F5F5F5] outline-none focus:border-[#FF6A00]";
  const checkClass = "flex items-center gap-2 text-sm text-neutral-200";

  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-4xl">Add member</h1>
      <p className="text-neutral-400">Fill in the details, then take the payment.</p>

      <div className="mt-6 space-y-4">
        <Input
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Input
          label="Phone"
          description="Phone numbers can be shared between members."
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
        />

        <label className={checkClass}>
          <input type="checkbox" checked={under18} onChange={(e) => setUnder18(e.target.checked)} />
          Member is under 18
        </label>

        <Input
          label={under18 ? "NIC (optional)" : "NIC"}
          value={nic}
          onChange={(e) => setNic(e.target.value)}
          error={errors.nic}
        />
        {under18 && (
          <Input
            label="Parent or guardian contact"
            value={guardian}
            onChange={(e) => setGuardian(e.target.value)}
            error={errors.guardian}
          />
        )}
        {!under18 && (
          <Input
            label="Emergency contact (optional)"
            value={guardian}
            onChange={(e) => setGuardian(e.target.value)}
          />
        )}
        <Input label="Address (optional)" value={address} onChange={(e) => setAddress(e.target.value)} />

        <label className={checkClass}>
          <input type="checkbox" checked={healthOk} onChange={(e) => setHealthOk(e.target.checked)} />
          Member confirms they are fit to exercise
        </label>

        <div>
          <label className="mb-1 block text-sm text-neutral-300" htmlFor="plan">
            Plan
          </label>
          <select
            id="plan"
            className={selectClass}
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
          >
            <option value="">Choose a plan</option>
            {(plans ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - {formatLKR(p.price)}
              </option>
            ))}
          </select>
          {errors.plan && <p className="mt-1 text-sm text-red-500">{errors.plan}</p>}
        </div>

        <div className="rounded-xl border border-[#2E2E2E] bg-[#1C1C1C] p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-400">Plan</span>
            <span>{plan ? formatLKR(plan.price) : "-"}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-neutral-400">Admission fee</span>
            <span>{formatLKR(admission)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-[#2E2E2E] pt-2 font-medium">
            <span>Total to pay</span>
            <span>{formatLKR(total)}</span>
          </div>
          {role === "owner" && (
            <label className={`${checkClass} mt-3`}>
              <input type="checkbox" checked={waive} onChange={(e) => setWaive(e.target.checked)} />
              Waive admission fee
            </label>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="primary" onClick={submit} disabled={saving}>
            {saving ? "Saving..." : "Save and take payment"}
          </Button>
          <Button variant="secondary" onClick={() => router.push("/app/members")}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}