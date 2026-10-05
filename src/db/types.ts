export type Role = "owner" | "receptionist";

export type Plan = { id: string; name: string; months: number; price: number };

export type Member = {
  id: string;
  number: string;
  name: string;
  phone: string;
  nic?: string;
  address?: string;
  emergencyContact?: string;
  healthOk: boolean;
  planId: string;
  joinedOn: string; // YYYY-MM-DD
  expiresOn: string; // YYYY-MM-DD
  balance: number;
};

export type Payment = {
  id?: number;
  receiptNo: string;
  memberId: string;
  amount: number;
  method: "cash" | "bank";
  kind: "admission" | "membership" | "balance";
  at: string; // ISO date-time
  by: Role;
  cancelled?: boolean;
};

export type Visit = { id?: number; memberId: string; at: string; override?: boolean };

export type Setting = { key: string; value: number };

/** One line in the Backup history: a file that was exported, or a backup file that was imported. */
export type BackupLog = {
  id?: number;
  at: string; // local date-time, like nowLocal()
  kind: "export" | "import";
  fileName: string;
  /** How many records the file held. */
  members: number;
  payments: number;
  visits: number;
  /** File size in bytes. Not indexed, so no schema change was needed. Older rows have none. */
  bytes?: number;
};