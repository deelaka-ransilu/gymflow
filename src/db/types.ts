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