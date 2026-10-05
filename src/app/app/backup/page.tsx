"use client";

import { useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@cloudflare/kumo";
import { FloppyDisk, Warning } from "@phosphor-icons/react";
import { db } from "@/db/db";
import { latestExport, logBackup, recentBackups } from "@/db/backups";
import type { BackupLog } from "@/db/types";
import { resetDemo } from "@/db/seed";
import { PageHeader } from "@/components/app/PageHeader";
import { BackupChips, BackupTimeline } from "@/components/app/BackupTimeline";
import { useRole } from "@/lib/role";
import { daysLeft, today } from "@/lib/rules";
import { formatDay } from "@/lib/format";

const WARN_AFTER_DAYS = 7;
const PAGE_SIZE = 10;

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
  const fileName = `gymflow-backup-${today()}.json`;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  await logBackup({
    kind: "export",
    fileName,
    members: data.members.length,
    payments: data.payments.length,
    visits: data.visits.length,
    bytes: blob.size,
  });
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

  // The backup history is not in this list on purpose: restoring a file must not erase the log.
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
  await logBackup({
    kind: "import",
    fileName: file.name,
    members: data.members.length,
    payments: data.payments.length,
    visits: data.visits.length,
    bytes: file.size,
  });
}

function agoText(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

const CARD = "rounded-xl border border-[#2E2E2E] bg-[#1C1C1C] p-5";

type Where = "export" | "import" | "reset";
type Note = { where: Where; ok: boolean; text: string };

/** The result of an action, shown right under the card whose button was pressed. */
function Notice({ note, where }: { note: Note | null; where: Where }) {
  if (!note || note.where !== where) return null;
  return <p className={`mt-3 text-sm ${note.ok ? "text-green-500" : "text-red-500"}`}>{note.text}</p>;
}

/** How fresh the last backup is. Neutral on purpose: the warning is the alert above it. */
function LastBackupCard({
  latest,
  daysSince,
}: {
  /** undefined = still loading, null = never exported */
  latest: BackupLog | null | undefined;
  daysSince: number | undefined;
}) {
  return (
    <div className={CARD}>
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-neutral-300">
          <FloppyDisk size={20} />
        </span>
        <span className="text-sm text-neutral-400">Last backup</span>
      </div>

      {latest === undefined ? (
        <p className="mt-4 text-neutral-400">Loading...</p>
      ) : latest === null ? (
        <>
          <div className="font-heading mt-4 text-3xl">No backup yet</div>
          <p className="mt-1 text-sm text-neutral-400">Nothing has been exported from this browser.</p>
        </>
      ) : (
        <>
          <div className="font-heading mt-4 text-4xl">{agoText(daysSince ?? 0)}</div>
          <p className="mt-1 text-sm text-neutral-400">
            {formatDay(latest.at)}, {latest.at.slice(11, 16)}
          </p>
          <div className="mt-3">
            <BackupChips entry={latest} />
          </div>
        </>
      )}
    </div>
  );
}

export default function BackupPage() {
  const { role } = useRole();
  // undefined = still loading, null = never exported
  const latest = useLiveQuery(() => latestExport(), []);
  const [limit, setLimit] = useState(PAGE_SIZE);
  // One extra row tells us whether "Show more" is needed.
  const fetched = useLiveQuery(() => recentBackups(limit + 1), [limit]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState<Note | null>(null);

  if (role !== "owner") {
    return (
      <div>
        <PageHeader title="Backup" subtitle="Only the owner can open this page." />
      </div>
    );
  }

  const daysSince = latest ? daysLeft(today(), latest.at.slice(0, 10)) : undefined;
  const neverExported = latest === null;
  const stale = neverExported || (daysSince !== undefined && daysSince >= WARN_AFTER_DAYS);
  const entries = fetched?.slice(0, limit);
  const hasMore = (fetched?.length ?? 0) > limit;

  async function onExport() {
    setNote(null);
    await exportBackup();
    setNote({
      where: "export",
      ok: true,
      text: "Backup downloaded. Keep the file somewhere safe, like Google Drive or a USB stick.",
    });
  }

  async function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setNote(null);
    if (!window.confirm("Importing replaces ALL current data with the backup file. Continue?")) return;
    try {
      await importBackup(file);
      setNote({ where: "import", ok: true, text: "Backup imported. Your data has been replaced." });
    } catch (err) {
      setNote({
        where: "import",
        ok: false,
        text: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  }

  async function onReset() {
    if (!window.confirm("Reset to the demo data? All current members and payments will be lost.")) return;
    setNote(null);
    await resetDemo();
    setNote({ where: "reset", ok: true, text: "Demo data restored." });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Backup"
        subtitle="Your data lives in this browser only. If the browser data is cleared, it is gone, so keep a recent backup."
      />

      <div className="mt-6 space-y-4">
        {/* 1. The alert, only when a backup is due */}
        {stale && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-yellow-400/40 bg-yellow-400/10 p-4 text-sm text-yellow-400"
          >
            <Warning size={20} className="mt-0.5 shrink-0" />
            <span>
              {neverExported
                ? "You have never exported a backup. Please export one now."
                : `Your last backup was ${daysSince} days ago. Please export a new one.`}
            </span>
          </div>
        )}

        {/* 2. How fresh the last backup is */}
        <LastBackupCard latest={latest} daysSince={daysSince} />

        {/* 3. Export */}
        <div className={CARD}>
          <div className="font-medium">Export backup</div>
          <p className="mt-1 text-sm text-neutral-400">Downloads all members, payments and visits as one file.</p>
          <div className="mt-3">
            <Button variant="primary" onClick={onExport}>
              Export backup
            </Button>
          </div>
          <Notice note={note} where="export" />
        </div>

        {/* 4. History */}
        <section className={CARD}>
          <h2 className="font-heading text-2xl">Backup history</h2>
          <div className="mt-5">
            {entries === undefined ? (
              <p className="text-sm text-neutral-400">Loading...</p>
            ) : (
              <BackupTimeline entries={entries} hasMore={hasMore} onShowMore={() => setLimit((n) => n + PAGE_SIZE)} />
            )}
          </div>
          <p className="mt-6 border-t border-[#2E2E2E] pt-4 text-xs text-neutral-400">
            This list is kept in this browser too, so clearing the browser data clears it as well. It shows the
            file name, not the file.
          </p>
        </section>

        {/* 5. Import */}
        <div className={CARD}>
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
          <Notice note={note} where="import" />
        </div>

        {/* 6. Reset */}
        <div className="pt-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Danger zone</div>
          <div className={`${CARD} mt-2`}>
            <div className="font-medium">Reset demo data</div>
            <p className="mt-1 text-sm text-neutral-400">Wipes everything and loads the 20 sample members again.</p>
            <div className="mt-3">
              <Button variant="destructive" onClick={onReset}>
                Reset demo data
              </Button>
            </div>
            <Notice note={note} where="reset" />
          </div>
        </div>
      </div>
    </div>
  );
}