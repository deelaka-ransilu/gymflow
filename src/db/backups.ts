import { db } from "./db";
import { nowLocal } from "./queries";
import type { BackupLog } from "./types";

/*
 * The backup history: one line per export or import. It is a log, not a backup. It lives in
 * the same browser storage as everything else, and Import and Reset never touch it.
 */

/** Adds a line to the history, stamped with the current local time. */
export async function logBackup(entry: Omit<BackupLog, "id" | "at">): Promise<void> {
  await db.backups.add({ ...entry, at: nowLocal() });
}

/** The newest entries first. */
export function recentBackups(limit = 10): Promise<BackupLog[]> {
  return db.backups.orderBy("at").reverse().limit(limit).toArray();
}

/** The most recent export, or null if there has never been one. Imports do not count. */
export async function latestExport(): Promise<BackupLog | null> {
  const entry = await db.backups
    .orderBy("at")
    .reverse()
    .filter((b) => b.kind === "export")
    .first();
  return entry ?? null;
}