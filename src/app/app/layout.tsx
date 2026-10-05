"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@cloudflare/kumo";
import { RoleProvider, useRole } from "@/lib/role";
import { ensureSeeded, resetDemo } from "@/db/seed";

const NAV = [
  { href: "/app", label: "Home", ownerOnly: false },
  { href: "/app/check-in", label: "Check-in", ownerOnly: false },
  { href: "/app/members", label: "Members", ownerOnly: false },
  { href: "/app/expiring", label: "Expiring", ownerOnly: false },
  { href: "/app/backup", label: "Backup", ownerOnly: true },
];

function Shell({ children }: { children: React.ReactNode }) {
  const { role, setRole } = useRole();
  const pathname = (usePathname() ?? "").replace(/\/$/, "");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureSeeded().then(() => setReady(true));
  }, []);

  const reset = async () => {
    await resetDemo();
    window.location.reload();
  };

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-center gap-3 border-b border-kumo-line bg-kumo-base px-4 py-2 text-sm text-kumo-subtle">
        <span>Demo mode. Data stays in this browser.</span>
        <Button variant="ghost" size="xs" onClick={reset}>Reset demo data</Button>
      </div>

      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href="/" className="font-heading text-2xl font-semibold">
          Gym<span className="text-accent">Flow</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm text-kumo-subtle">Viewing as</span>
          <Button size="sm" variant={role === "owner" ? "primary" : "secondary"} onClick={() => setRole("owner")}>
            Owner
          </Button>
          <Button size="sm" variant={role === "receptionist" ? "primary" : "secondary"} onClick={() => setRole("receptionist")}>
            Receptionist
          </Button>
        </div>
      </header>

      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6 pb-4">
        {NAV.filter((n) => !n.ownerOnly || role === "owner").map((n) => {
          const active = n.href === "/app" ? pathname === "/app" : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                active ? "bg-kumo-tint text-kumo-default" : "text-kumo-subtle hover:text-kumo-default"
              }`}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        {ready ? children : <p className="text-kumo-subtle">Loading…</p>}
      </main>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <Shell>{children}</Shell>
    </RoleProvider>
  );
}