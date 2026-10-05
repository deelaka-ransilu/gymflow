import Link from "next/link";

// Matches basePath in next.config.ts (only set in production).
const BASE = process.env.NODE_ENV === "production" ? "/gymflow" : "";

export function AppPreview() {
  return (
    <div className="relative mx-auto max-w-5xl">
      <div
        className="absolute inset-x-12 -top-6 h-40 rounded-full bg-accent/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="overflow-hidden rounded-2xl border border-kumo-line bg-[#121212] shadow-2xl shadow-black/60">
          <div className="relative flex items-center gap-2 border-b border-kumo-line bg-kumo-base px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <div className="mx-auto rounded-md bg-kumo-tint px-10 py-1 text-xs text-kumo-subtle">
              gymflow.app/app
            </div>
            <Link
              href="/app"
              className="absolute right-4 hidden text-xs text-kumo-subtle hover:text-white sm:block"
            >
              Open full screen
            </Link>
          </div>

          <iframe
            src={`${BASE}/app/`}
            title="GymFlow live demo"
            className="block h-[560px] w-full bg-[#121212] sm:h-[700px]"
          />
        </div>

        <div
          className="pointer-events-none absolute -bottom-16 -right-2 hidden w-64 rounded-2xl border border-green-500/40 bg-[#0f2418] p-4 shadow-xl shadow-black/50 lg:block"
          aria-hidden="true"
        >
          <p className="font-heading text-2xl font-semibold text-green-500">Welcome back, Nimal!</p>
          <p className="mt-1 text-xs text-kumo-subtle">GF-0001 · Checked in.</p>
        </div>

        <div
          className="pointer-events-none absolute -bottom-16 -left-2 hidden w-64 rounded-2xl border border-red-500/40 bg-[#2a1212] p-4 shadow-xl shadow-black/50 lg:block"
          aria-hidden="true"
        >
          <p className="font-heading text-2xl font-semibold text-red-500">Membership expired</p>
          <p className="mt-1 text-xs text-kumo-subtle">GF-0016 · Ask the member to renew.</p>
        </div>
      </div>
    </div>
  );
}