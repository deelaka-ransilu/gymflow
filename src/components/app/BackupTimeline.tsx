"use client";

import { Button } from "@cloudflare/kumo";
import { ClockCounterClockwise, DownloadSimple, UploadSimple } from "@phosphor-icons/react";
import type { BackupLog } from "@/db/types";
import { formatDay, formatMonthYear, formatSize } from "@/lib/format";

/** Small grey chips: how many members, payments and visits a backup held, and its size. */
export function BackupChips({ entry }: { entry: BackupLog }) {
  const chips = [
    `${entry.members} members`,
    `${entry.payments} payments`,
    `${entry.visits} visits`,
    ...(entry.bytes !== undefined ? [formatSize(entry.bytes)] : []),
  ];
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((c) => (
        <span key={c} className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-neutral-300">
          {c}
        </span>
      ))}
    </div>
  );
}

type BackupTimelineProps = {
  /** Newest first. */
  entries: BackupLog[];
  hasMore: boolean;
  onShowMore: () => void;
};

/** Entries on a thin vertical line, grouped under a heading for each month. */
export function BackupTimeline({ entries, hasMore, onShowMore }: BackupTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <ClockCounterClockwise size={32} className="text-neutral-600" />
        <p className="text-sm text-neutral-400">No backups yet. Export one and it will show up here.</p>
      </div>
    );
  }

  const groups: { key: string; items: BackupLog[] }[] = [];
  for (const b of entries) {
    const key = b.at.slice(0, 7);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(b);
    else groups.push({ key, items: [b] });
  }
  const newestId = entries[0].id;

  return (
    <div>
      <div className="space-y-7">
        {groups.map((g) => (
          <div key={g.key}>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              {formatMonthYear(g.key)}
            </h3>

            <ol className="relative ml-4 mt-4 border-l border-[#2E2E2E]">
              {g.items.map((b) => {
                const isNewest = b.id === newestId;
                const isExport = b.kind === "export";
                return (
                  <li key={b.id} className="relative pb-6 pl-8 last:pb-0">
                    <span
                      aria-hidden="true"
                      className={`absolute -left-4 top-0 grid h-8 w-8 place-items-center rounded-lg border ${
                        isNewest
                          ? "border-accent bg-accent text-black"
                          : "border-[#2E2E2E] bg-[#242424] text-neutral-300"
                      }`}
                    >
                      {isExport ? <DownloadSimple size={16} weight="bold" /> : <UploadSimple size={16} weight="bold" />}
                    </span>

                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                      <span className="text-sm font-semibold text-kumo-default">
                        {isExport ? "Exported" : "Imported"}
                      </span>
                      <time dateTime={b.at} className="text-xs text-neutral-400">
                        {formatDay(b.at)}, {b.at.slice(11, 16)}
                      </time>
                    </div>
                    <p className="mt-0.5 break-all text-sm text-neutral-300">{b.fileName}</p>
                    <div className="mt-2">
                      <BackupChips entry={b} />
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-6">
          <Button variant="secondary" size="sm" onClick={onShowMore}>
            Show more
          </Button>
        </div>
      )}
    </div>
  );
}