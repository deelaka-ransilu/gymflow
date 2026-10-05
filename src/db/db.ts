import Dexie, { type Table } from "dexie";
import type { BackupLog, Member, Payment, Plan, Setting, Visit } from "./types";

class GymDB extends Dexie {
  plans!: Table<Plan, string>;
  members!: Table<Member, string>;
  payments!: Table<Payment, number>;
  visits!: Table<Visit, number>;
  settings!: Table<Setting, string>;
  backups!: Table<BackupLog, number>;

  constructor() {
    super("gymflow");
    this.version(1).stores({
      plans: "id",
      members: "id, number, phone, nic, expiresOn",
      payments: "++id, memberId, at",
      visits: "++id, memberId, at",
      settings: "key",
    });
    // Version 2 adds the backup history. Existing browsers upgrade by themselves and keep their data.
    this.version(2).stores({
      plans: "id",
      members: "id, number, phone, nic, expiresOn",
      payments: "++id, memberId, at",
      visits: "++id, memberId, at",
      settings: "key",
      backups: "++id, at",
    });
  }
}

export const db = new GymDB();