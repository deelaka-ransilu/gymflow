import { db } from "./db";
import { buildDemo, PLANS, SETTINGS } from "./demo";
import { nowLocal } from "./queries";

/** Wipes everything and loads the sample members with 30 days of payments and check-ins. */
export async function resetDemo() {
  const { members, payments, visits } = buildDemo(nowLocal());

  await db.transaction("rw", [db.plans, db.members, db.payments, db.visits, db.settings], async () => {
    await Promise.all([
      db.plans.clear(),
      db.members.clear(),
      db.payments.clear(),
      db.visits.clear(),
      db.settings.clear(),
    ]);
    await db.plans.bulkAdd(PLANS);
    await db.members.bulkAdd(members);
    await db.payments.bulkAdd(payments);
    await db.visits.bulkAdd(visits);
    await db.settings.bulkAdd(SETTINGS);
  });
}

export async function ensureSeeded() {
  if ((await db.members.count()) === 0) await resetDemo();
}