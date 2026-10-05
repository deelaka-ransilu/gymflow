"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@cloudflare/kumo";
import { RoleProvider, useRole } from "@/lib/role";
import { ensureSeeded, resetDemo } from "@/db/seed";
import { Login } from "@/components/Login";

const NAV = [
  { href: "/app", label: "Home", ownerOnly: false },
  { href: "/app/check-in", label: "Check-in", ownerOnly: false },
  { href: "/app/members", label: "Members", ownerOnly: false },
  { href: "/app/expiring", label: "Expiring", ownerOnly: false },
  { href: "/app/backup", label: "Backup", ownerOnly: true },
];

function Shell({ children }: { children: React.ReactNode }) {
  const { role, signedIn, signOut } = useRole();
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
    <div className="min-h-screen bg-[#0a0a0a] lg:flex lg:items-center lg:justify-center lg:p-8 print:block! print:bg-transparent! print:p-0!">
      <div className="w-full bg-[#121212] lg:flex lg:h-[min(840px,calc(100vh-4rem))] lg:max-w-[1200px] lg:flex-col lg:overflow-hidden lg:rounded-2xl lg:border lg:border-kumo-line lg:shadow-2xl lg:shadow-black/60 print:block! print:h-auto! print:max-w-none! print:overflow-visible! print:border-0! print:shadow-none!">
        {/* Mac-style title bar (laptops and desktops only) */}
        <div className="hidden shrink-0 items-center gap-2 border-b border-kumo-line bg-kumo-base px-4 py-3 lg:flex print:hidden">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <div className="mx-auto rounded-md bg-kumo-tint px-10 py-1 text-xs text-kumo-subtle">
            gymflow.app{pathname || "/app"}
          </div>
          <span className="w-[52px]" aria-hidden="true" />
        </div>

        <div className="flex shrink-0 items-center justify-center gap-3 border-b border-kumo-line bg-kumo-base px-4 py-2 text-sm text-kumo-subtle print:hidden">
          <span>Demo mode. Data stays in this browser.</span>
          <Button variant="ghost" size="xs" onClick={reset}>Reset demo data</Button>
        </div>

        <div className="min-h-0 flex-1 lg:overflow-y-auto print:overflow-visible!">
          {signedIn === null ? (
            <p className="px-6 py-10 text-kumo-subtle">Loading…</p>
          ) : !signedIn ? (
            <Login />
          ) : (
            <>
              <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
                <Link href="/app" className="font-heading text-2xl font-semibold">
                  Gym<span className="text-accent">Flow</span>
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-kumo-subtle">
                    Signed in as{" "}
                    <span className="font-medium text-kumo-default">
                      {role === "owner" ? "Owner" : "Receptionist"}
                    </span>
                  </span>
                  <Button size="sm" variant="secondary" onClick={signOut}>
                    Sign out
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
            </>
          )}
        </div>
      </div>
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