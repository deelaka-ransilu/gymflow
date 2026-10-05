import { daysLeft, today } from "./rules";

export function formatDate(s: string): string {
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

/** "Today", "Yesterday", then a short day such as "Fri 2 Oct". Takes a date or a date-time. */
export function formatDay(s: string, now: string = today()): string {
  const date = s.slice(0, 10);
  const ago = daysLeft(now, date); // days from the date to now
  if (ago === 0) return "Today";
  if (ago === 1) return "Yesterday";
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** "2026-10" or any date starting with it becomes "October 2026". */
export function formatMonthYear(s: string): string {
  const [y, m] = s.slice(0, 7).split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/** A file size in plain words: "812 B", "184 KB", "2.4 MB". */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}