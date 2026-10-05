"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { RoleProvider, useRole } from "@/lib/role";
import { ensureSeeded, resetDemo } from "@/db/seed";
import { Login } from "@/components/Login";
import { AppShell } from "@/components/app/AppShell";
import { DemoFrame } from "@/components/demo/DemoFrame";

function Shell({ children }: { children: React.ReactNode }) {
  const { signedIn } = useRole();
  const pathname = (usePathname() ?? "").replace(/\/$/, "");
  const [ready, setReady] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  // Demo only: fill the browser with sample members on the first visit.
  useEffect(() => {
    ensureSeeded().then(() => setReady(true));
  }, []);

  const reset = async () => {
    await resetDemo();
    window.location.reload();
  };

  return (
    <DemoFrame
      pathname={pathname}
      fullScreen={fullScreen}
      onToggleFullScreen={() => setFullScreen((f) => !f)}
      onReset={reset}
    >
      {signedIn === null ? (
        <p className="px-6 py-10 text-kumo-subtle">Loading…</p>
      ) : !signedIn ? (
        <Login />
      ) : (
        <AppShell>{ready ? children : <p className="text-kumo-subtle">Loading…</p>}</AppShell>
      )}
    </DemoFrame>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <Shell>{children}</Shell>
    </RoleProvider>
  );
}