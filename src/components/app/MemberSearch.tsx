"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { db } from "@/db/db";

const MAX_RESULTS = 6;

const hrefFor = (id: string) => `/app/members/view?id=${encodeURIComponent(id)}`;

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return (
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT" ||
    el.isContentEditable
  );
}

/**
 * Find a member by name, member number, phone or NIC from any screen.
 * Press / to focus it. Enter opens the first result, which is also how a USB
 * barcode scanner that types a member number and presses Enter will work.
 */
export function MemberSearch({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const members = useLiveQuery(() => db.members.toArray(), []);

  // "/" focuses the search box (unless the person is already typing somewhere).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !isTyping(e.target)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const q = query.trim().toLowerCase();
  const results =
    q && members
      ? members
          .filter(
            (m) =>
              m.name.toLowerCase().includes(q) ||
              m.number.toLowerCase().includes(q) ||
              m.phone.includes(q) ||
              (m.nic ?? "").toLowerCase().includes(q)
          )
          .slice(0, MAX_RESULTS)
      : [];

  const finish = () => {
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
    onNavigate?.();
  };

  return (
    <div
      className="relative"
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <div className="flex h-10 items-center gap-2 rounded-xl border border-kumo-line bg-white/5 px-3 focus-within:border-accent">
        <MagnifyingGlass size={18} className="shrink-0 text-kumo-subtle" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) {
              router.push(hrefFor(results[0].id));
              finish();
            } else if (e.key === "Escape") {
              setQuery("");
              inputRef.current?.blur();
            }
          }}
          placeholder="Search members"
          aria-label="Search members by name, number, phone or NIC"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-sm text-kumo-default outline-none placeholder:text-kumo-subtle"
        />
        {!query && (
          <kbd className="rounded-md border border-kumo-line bg-black/30 px-1.5 text-xs text-kumo-subtle">
            /
          </kbd>
        )}
      </div>

      {open && q && (
        <div
          // Keep focus in the input while a result is being clicked.
          onMouseDown={(e) => e.preventDefault()}
          className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-kumo-line bg-[#242424] p-1 shadow-2xl shadow-black/60"
        >
          {results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-kumo-subtle">No member found.</p>
          ) : (
            <ul aria-label="Search results">
              {results.map((m) => (
                <li key={m.id}>
                  <Link
                    href={hrefFor(m.id)}
                    onClick={finish}
                    className="block rounded-lg px-3 py-2 hover:bg-white/5 focus-visible:bg-white/5 focus-visible:outline-none"
                  >
                    <span className="block truncate text-sm font-medium text-kumo-default">
                      {m.name}
                    </span>
                    <span className="block truncate text-xs text-kumo-subtle">
                      {m.number} · {m.phone}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}