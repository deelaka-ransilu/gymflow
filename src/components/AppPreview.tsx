import Link from "next/link";

const NAV = ["Home", "Check-in", "Members", "Expiring", "Backup"];

const STATS = [
  { label: "Active members", value: "18", note: "20 in total" },
  { label: "Check-ins today", value: "24" },
  { label: "Expiring in 7 days", value: "6" },
  { label: "Money today", value: "LKR 14,500", note: "LKR 1,000 still owed in total" },
];

const EXPIRING = [
  { name: "Ruwan Bandara", number: "GF-0007", date: "Today" },
  { name: "Lahiru Dissanayake", number: "GF-0011", date: "7 Oct 2026" },
  { name: "Dilani Silva", number: "GF-0003", date: "8 Oct 2026" },
  { name: "Saman Kumara", number: "GF-0004", date: "10 Oct 2026" },
];

export function AppPreview() {
  return (
    <div className="relative mx-auto max-w-5xl">
      <div
        className="absolute inset-x-12 -top-6 h-40 rounded-full bg-accent/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative">
        <Link
          href="/app"
          aria-label="Open the GymFlow demo"
          className="group relative block overflow-hidden rounded-2xl border border-kumo-line bg-[#121212] shadow-2xl shadow-black/60"
        >
          {/* Mac title bar */}
          <div className="flex items-center gap-2 border-b border-kumo-line bg-kumo-base px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <div className="mx-auto rounded-md bg-kumo-tint px-10 py-1 text-xs text-kumo-subtle">
              gymflow.app/app
            </div>
            <span className="w-[52px]" aria-hidden="true" />
          </div>

          {/* Fake dashboard (HTML and CSS only, not interactive) */}
          <div aria-hidden="true" className="select-none px-5 pb-28 pt-5 sm:px-8 sm:pt-6">
            <div className="flex items-center justify-between">
              <span className="font-heading text-xl font-semibold sm:text-2xl">
                Gym<span className="text-accent">Flow</span>
              </span>
              <span className="text-xs text-kumo-subtle sm:text-sm">
                Signed in as <span className="font-medium text-kumo-default">Owner</span>
              </span>
            </div>

            <div className="mt-4 flex gap-1 overflow-hidden">
              {NAV.map((n, i) => (
                <span
                  key={n}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium sm:px-4 sm:py-2 sm:text-sm ${
                    i === 0 ? "bg-kumo-tint text-kumo-default" : "text-kumo-subtle"
                  }`}
                >
                  {n}
                </span>
              ))}
            </div>

            <h3 className="font-heading mt-5 text-3xl sm:text-4xl">Home</h3>
            <p className="text-sm text-kumo-subtle">Here is how the gym looks today.</p>

            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-xl border border-kumo-line bg-kumo-base p-3 sm:p-4">
                  <div className="text-xs text-kumo-subtle sm:text-sm">{s.label}</div>
                  <div className="font-heading mt-1 text-2xl sm:text-4xl">{s.value}</div>
                  {s.note && <div className="mt-1 hidden text-xs text-neutral-500 sm:block">{s.note}</div>}
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <span className="rounded-lg bg-[#FF6A00] px-4 py-2 text-sm font-medium text-white">Check-in</span>
              <span className="rounded-lg border border-kumo-line bg-kumo-tint px-4 py-2 text-sm font-medium">
                Add member
              </span>
            </div>

            <h4 className="font-heading mt-6 text-xl sm:text-2xl">Expiring soon</h4>
            <div className="mt-2 overflow-hidden rounded-xl border border-kumo-line bg-kumo-base">
              {EXPIRING.map((m) => (
                <div
                  key={m.number}
                  className="flex items-center justify-between border-b border-kumo-line px-4 py-2.5 text-xs last:border-b-0 sm:text-sm"
                >
                  <span className="font-medium">
                    {m.name} <span className="text-kumo-subtle">{m.number}</span>
                  </span>
                  <span className="text-neutral-300">{m.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fade and button */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-[#121212] via-[#121212]/90 to-transparent px-4 pb-8 pt-24">
            <span className="rounded-lg bg-[#FF6A00] px-6 py-3 font-medium text-white shadow-lg transition-colors group-hover:bg-[#FF8533]">
              Try the demo
            </span>
          </div>
        </Link>

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