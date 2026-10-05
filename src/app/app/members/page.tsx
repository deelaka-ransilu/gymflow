"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { Button, Input, LayerCard, Table } from "@cloudflare/kumo";
import { db } from "@/db/db";
import { StatusBadge } from "@/components/StatusBadge";
import { statusOf, formatLKR } from "@/lib/rules";
import { formatDate, initials } from "@/lib/format";

export default function MembersPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const members = useLiveQuery(() => db.members.toArray(), []);
  const plans = useLiveQuery(() => db.plans.toArray(), []);
  const expiringSetting = useLiveQuery(() => db.settings.get("expiringDays"), []);

  const expiringDays = expiringSetting?.value ?? 7;

  const planName = useMemo(() => {
    const map = new Map<string, string>();
    (plans ?? []).forEach((p) => map.set(p.id, p.name));
    return map;
  }, [plans]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...(members ?? [])].sort((a, b) => a.number.localeCompare(b.number));
    if (!q) return list;
    return list.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.number.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        (m.nic ?? "").toLowerCase().includes(q)
    );
  }, [members, query]);

  const open = (id: string) => router.push(`/app/members/view?id=${encodeURIComponent(id)}`);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl">Members</h1>
          <p className="text-neutral-400">
            {members ? `${members.length} members` : "Loading..."}
          </p>
        </div>
        <Button variant="primary" onClick={() => router.push("/app/members/new")}>
          Add member
        </Button>
      </div>

      <div className="mt-6 max-w-md">
        <Input
          aria-label="Search members"
          placeholder="Search by name, phone, member number or NIC"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="mt-6">
        <LayerCard className="p-0">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Member</Table.Head>
                <Table.Head className="hidden md:table-cell">Phone</Table.Head>
                <Table.Head className="hidden md:table-cell">Plan</Table.Head>
                <Table.Head className="hidden sm:table-cell">Expires</Table.Head>
                <Table.Head className="hidden sm:table-cell">Balance</Table.Head>
                <Table.Head>Status</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {rows.map((m) => (
                <Table.Row
                  key={m.id}
                  className="cursor-pointer hover:bg-white/5"
                  onClick={() => open(m.id)}
                >
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-medium">
                        {initials(m.name)}
                      </div>
                      <div>
                        <Link
                          href={`/app/members/view?id=${encodeURIComponent(m.id)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium hover:underline"
                        >
                          {m.name}
                        </Link>
                        <div className="text-xs text-neutral-400">{m.number}</div>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="hidden md:table-cell">{m.phone}</Table.Cell>
                  <Table.Cell className="hidden md:table-cell">
                    {planName.get(m.planId) ?? "-"}
                  </Table.Cell>
                  <Table.Cell className="hidden sm:table-cell">
                    {formatDate(m.expiresOn)}
                  </Table.Cell>
                  <Table.Cell className="hidden sm:table-cell">
                    {m.balance > 0 ? (
                      <span className="text-yellow-400">{formatLKR(m.balance)}</span>
                    ) : (
                      <span className="text-neutral-500">-</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <StatusBadge status={statusOf(m.expiresOn, expiringDays)} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          {members && rows.length === 0 && (
            <p className="px-4 py-8 text-center text-neutral-400">
              No members match "{query}".
            </p>
          )}
        </LayerCard>
      </div>
    </div>
  );
}