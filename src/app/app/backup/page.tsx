"use client";

import { useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@cloudflare/kumo";
import { db } from "@/db/db";
import { resetDemo } from "@/db/seed";
import { useRole } from "@/lib/role";
import { today } from "@/lib/rules";

const WARN_AFTER_DAYS = 7;

async function exportBackup() {
  const data = {
    app: "gymflow",
    version: 1,
    exportedAt: new Date().toISOString(),
    plans: await db.plans.toArray(),
    members: await db.members.toArray(),
    payments: await db.payments.toArray(),
    visits: await db.visits.toArray(),
    settings: await db.settings.toArray(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gymflow-backup-${today()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  await db.settings.put({ key: "lastExport", value: Date.now() });
}

async function importBackup(file: File) {
  const text = await file.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("This file is not a valid backup.");
  }
  const ok =
    data &&
    data.app === "gymflow" &&
    ["plans", "members", "payments", "visits", "settings"].every((k) => Array.isArray(data[k]));
  if (!ok) throw new Error("This file is not a GymFlow backup.");

  await db.transaction("rw", [db.plans, db.members, db.payments, db.visits, db.settings], async () => {
    await Promise.all([
      db.plans.clear(),
      db.members.clear(),
      db.payments.clear(),
      db.visits.clear(),
      db.settings.clear(),
    ]);
    await db.plans.bulkAdd(data.plans);
    await db.members.bulkAdd(data.members);
    await db.payments.bulkAdd(data.payments);
    await db.visits.bulkAdd(data.visits);
    await db.settings.bulkAdd(data.settings);
  });
}

export default function BackupPage() {
  const { role } = useRole();
  const lastExport = useLiveQuery(() => db.settings.get("lastExport"), []);
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (role !== "owner") {
    return (
      <div>
        <h1 className="font-heading text-4xl">Backup</h1>
        <p className="mt-2 text-neutral-400">Only the owner can open this page.</p>
      </div>
    );
  }

  const daysSince =
    lastExport === undefined ? undefined : Math.floor((Date.now() - lastExport.value) / 86400000);
  const stale = lastExport === null || (daysSince !== undefined && daysSince >= WARN_AFTER_DAYS);

  async function onExport() {
    setError("");
    await exportBackup();
    setMessage("Backup downloaded. Keep the file somewhere safe, like Google Drive or a USB stick.");
  }

  async function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setMessage("");
    setError("");
    if (!window.confirm("Importing replaces ALL current data with the backup file. Continue?")) return;
    try {
      await importBackup(file);
      setMessage("Backup imported. Your data has been replaced.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function onReset() {
    if (!window.confirm("Reset to the demo data? All current members and payments will be lost.")) return;
    setMessage("");
    setError("");
    await resetDemo();
    setMessage("Demo data restored.");
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-4xl">Backup</h1>
      <p className="text-neutral-400">
        Your data lives in this browser only. If the browser data is cleared, it is gone, so keep a recent backup.
      </p>

      {stale && (
        <div className="mt-6 rounded-xl border border-yellow-400/40 bg-yellow-400/10 p-4 text-sm text-yellow-400">
          {lastExport === null || lastExport === undefined
            ? "You have never exported a backup. Please export one now."
            : `Your last backup was ${daysSince} days ago. Please export a new one.`}
        </div>
      )}

      <div className="mt-6 space-y-4">
        <div className="rounded-xl border border-[#2E2E2E] bg-[#1C1C1C] p-4">
          <div className="font-medium">Export backup</div>
          <p className="mt-1 text-sm text-neutral-400">
            Downloads all members, payments and visits as one file.
            {lastExport && daysSince !== undefined && (
              <> Last export: {daysSince === 0 ? "today" : `${daysSince} days ago`}.</>
            )}
          </p>
          <div className="mt-3">
            <Button variant="primary" onClick={onExport}>
              Export backup
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-[#2E2E2E] bg-[#1C1C1C] p-4">
          <div className="font-medium">Import backup</div>
          <p className="mt-1 text-sm text-neutral-400">
            Restores a backup file. This replaces everything currently in the app.
          </p>
          <div className="mt-3">
            <input ref={fileRef} type="file" accept="application/json,.json" onChange={onImportFile} className="hidden" />
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              Choose backup file
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-[#2E2E2E] bg-[#1C1C1C] p-4">
          <div className="font-medium">Reset demo data</div>
          <p className="mt-1 text-sm text-neutral-400">
            Wipes everything and loads the 20 sample members again.
          </p>
          <div className="mt-3">
            <Button variant="destructive" onClick={onReset}>
              Reset demo data
            </Button>
          </div>
        </div>
      </div>

      {message && <p className="mt-4 text-sm text-green-500">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
    </div>
  );
}