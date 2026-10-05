import Dexie, { type Table } from "dexie";
import type { Member, Payment, Plan, Setting, Visit } from "./types";

class GymDB extends Dexie {
  plans!: Table<Plan, string>;
  members!: Table<Member, string>;
  payments!: Table<Payment, number>;
  visits!: Table<Visit, number>;
  settings!: Table<Setting, string>;

  constructor() {
    super("gymflow");
    this.version(1).stores({
      plans: "id",
      members: "id, number, phone, nic, expiresOn",
      payments: "++id, memberId, at",
      visits: "++id, memberId, at",
      settings: "key",
    });
  }
}

export const db = new GymDB();