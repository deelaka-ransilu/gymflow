"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/db";
import { expiringMembers } from "@/db/stats";

/**
 * How many members expire within the "expiringDays" setting (today included).
 * Uses the same rule as the Home screen. Returns undefined while loading.
 */
export function useExpiringCount(): number | undefined {
  return useLiveQuery(async () => {
    const [members, setting] = await Promise.all([
      db.members.toArray(),
      db.settings.get("expiringDays"),
    ]);
    return expiringMembers(members, setting?.value ?? 7).length;
  }, []);
}