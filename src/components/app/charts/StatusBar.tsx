import type { Status } from "@/lib/rules";

const ITEMS: { key: Status; label: string; color: string }[] = [
  { key: "active", label: "Active", color: "#22C55E" },
  { key: "expiring", label: "Expiring soon", color: "#FACC15" },
  { key: "expired", label: "Expired", color: "#EF4444" },
];

/** One stacked bar in the status colours. The words and counts are always shown under it. */
export function StatusBar({ counts }: { counts: Record<Status, number> }) {
  const summary = ITEMS.map((i) => `${i.label} ${counts[i.key]}`).join(", ");

  return (
    <div className="flex h-full flex-col justify-center">
      <div
        role="img"
        aria-label={`Membership status: ${summary}`}
        className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-[#2E2E2E]"
      >
        {ITEMS.filter((i) => counts[i.key] > 0).map((i) => (
          <div
            key={i.key}
            className="basis-0"
            style={{ flexGrow: counts[i.key], backgroundColor: i.color }}
          />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {ITEMS.map((i) => (
          <div key={i.key}>
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: i.color }}
              />
              {i.label}
            </div>
            <div className="font-heading mt-1 text-3xl">{counts[i.key]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}