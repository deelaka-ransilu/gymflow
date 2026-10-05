"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { label: "See it", href: "#see" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

// Floating pill nav. Always on screen, so "Try the demo" is never out of reach.
// After the hero it shrinks a little and becomes more solid.
export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <div
        className={`mx-auto flex items-center justify-between rounded-full border backdrop-blur-md transition-all duration-300 motion-reduce:transition-none ${
          scrolled
            ? "max-w-2xl border-white/15 bg-[#121212]/95 py-2 pl-5 pr-2 shadow-lg shadow-black/40"
            : "max-w-3xl border-white/10 bg-[#121212]/70 py-3 pl-6 pr-3"
        }`}
      >
        <a href="#top" className="font-heading text-2xl font-semibold">
          Gym<span className="text-accent">Flow</span>
        </a>
        <nav className="flex items-center gap-6">
          <div className="hidden items-center gap-6 text-sm text-kumo-subtle sm:flex">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="transition-colors hover:text-white">
                {l.label}
              </a>
            ))}
          </div>
          <Link
            href="/app"
            className="inline-block rounded-full bg-[#FF6A00] px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#FF8533]"
          >
            Try the demo
          </Link>
        </nav>
      </div>
    </header>
  );
}