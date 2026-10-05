import type { Status } from "@/lib/rules";

const STYLES: Record<Status, string> = {
  active: "bg-green-500/15 text-green-500",
  expiring: "bg-yellow-400/15 text-yellow-400",
  expired: "bg-red-500/15 text-red-500",
};
const LABELS: Record<Status, string> = {
  active: "Active",
  expiring: "Expiring soon",
  expired: "Expired",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}