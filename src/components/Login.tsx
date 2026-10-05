"use client";
import { useRole } from "@/lib/role";
import type { Role } from "@/db/types";

const OPTIONS: { role: Role; title: string; text: string }[] = [
  {
    role: "owner",
    title: "Owner",
    text: "Sees everything: money, backup, and can cancel payments.",
  },
  {
    role: "receptionist",
    title: "Receptionist",
    text: "Check-in, members and payments. No revenue or backup.",
  },
];

export function Login() {
  const { signIn } = useRole();

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-16 text-center">
      <span className="font-heading text-4xl font-semibold">
        Gym<span className="text-accent">Flow</span>
      </span>
      <h1 className="font-heading mt-8 text-3xl font-semibold">Sign in to the demo</h1>
      <p className="mt-2 text-kumo-subtle">No password needed. Pick who you want to be.</p>

      <div className="mt-6 grid gap-3 text-left">
        {OPTIONS.map((o) => (
          <button
            key={o.role}
            type="button"
            onClick={() => signIn(o.role)}
            className="min-h-[44px] rounded-xl border border-kumo-line bg-kumo-base p-4 transition-colors hover:border-[#FF6A00] focus-visible:border-[#FF6A00] focus-visible:outline-none"
          >
            <span className="block text-lg font-semibold">Continue as {o.title}</span>
            <span className="mt-1 block text-sm text-kumo-subtle">{o.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}