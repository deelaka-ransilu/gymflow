"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/db";
import { daysLeft } from "@/lib/rules";

/**
 * How many members expire within the "expiringDays" setting (today included).
 * Same rule as the Home screen. Returns undefined while loading.
 */
export function useExpiringCount(): number | undefined {
  return useLiveQuery(async () => {
    const [members, setting] = await Promise.all([
      db.members.toArray(),
      db.settings.get("expiringDays"),
    ]);
    const days = setting?.value ?? 7;
    return members.filter((m) => {
      const left = daysLeft(m.expiresOn);
      return left >= 0 && left <= days;
    }).length;
  }, []);
}