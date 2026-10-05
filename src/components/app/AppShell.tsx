"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List } from "@phosphor-icons/react";
import { useRole } from "@/lib/role";
import { Sidebar } from "./Sidebar";
import { useExpiringCount } from "./useExpiringCount";

const COLLAPSED_KEY = "gf-sidebar-collapsed";

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * The real app layout: sidebar on lg screens and up, a top bar with a slide-in menu below that.
 * It knows nothing about the demo (no title bar, no background). Mount it only after sign-in,
 * on the client, because it reads localStorage when it first renders.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { role, signOut } = useRole();
  const pathname = usePathname() ?? "";
  const expiring = useExpiringCount();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const badges = { "/app/expiring": expiring };

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
    } catch {}
  };

  const closeDrawer = () => setDrawerOpen(false);

  // Escape closes the drawer.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row print:block!">
      {/* Desktop sidebar */}
      <div className="hidden shrink-0 border-r border-kumo-line lg:flex print:hidden">
        <Sidebar
          role={role}
          pathname={pathname}
          onSignOut={signOut}
          badges={badges}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          className={`${collapsed ? "w-[72px]" : "w-64"} transition-[width] duration-200 motion-reduce:transition-none`}
        />
      </div>

      {/* Phone and tablet top bar */}
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-kumo-line bg-kumo-base px-4 lg:hidden print:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          aria-expanded={drawerOpen}
          className="grid h-11 w-11 place-items-center rounded-lg text-kumo-default hover:bg-kumo-tint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <List size={24} />
        </button>
        <Link href="/app" className="font-heading text-2xl font-semibold">
          Gym<span className="text-accent">Flow</span>
        </Link>
      </header>

      {/* Page content. Only this part scrolls on lg screens. */}
      <main id="main" className="min-h-0 min-w-0 flex-1 overflow-y-auto print:overflow-visible!">
        <div className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-8">{children}</div>
      </main>

      {/* Phone and tablet drawer */}
      {drawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-40 flex lg:hidden print:hidden"
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeDrawer}
            className="absolute inset-0 bg-black/60"
          />
          <Sidebar
            role={role}
            pathname={pathname}
            onSignOut={() => {
              closeDrawer();
              signOut();
            }}
            badges={badges}
            onClose={closeDrawer}
            onNavigate={closeDrawer}
            className="w-72 max-w-[85vw] shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}