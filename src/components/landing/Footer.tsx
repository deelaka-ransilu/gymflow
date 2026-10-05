import Link from "next/link";
import { WHATSAPP_LINK } from "@/components/landing/shared";

const PAGE_LINKS = [
  { label: "See it", href: "#see" },
  { label: "Your day at the desk", href: "#day" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const LINK = "text-white/70 transition-colors hover:text-white";

// The page footer (black): who we are, where to go, how to reach us.
export function Footer() {
  return (
    <footer className="bg-[#121212] text-white">
      <div className="mx-auto max-w-6xl px-6 pb-8 pt-16">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.5fr)_1fr_1fr]">
          <div>
            <a href="#top" className="font-heading text-3xl font-semibold">
              Gym<span className="text-accent">Flow</span>
            </a>
            <p className="mt-3 max-w-xs text-white/70">
              Simple gym management for small gyms. Check members in, take payments, and never
              miss a renewal.
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-sm font-semibold text-white">On this page</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {PAGE_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className={LINK}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold text-white">Get in touch</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="/app" className={LINK}>
                  Try the demo
                </Link>
              </li>
              <li>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK}
                >
                  Talk to us on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-white/10 pt-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} GymFlow. All rights reserved.</p>
          <p>The demo uses sample data. It stays in your browser.</p>
        </div>
      </div>
    </footer>
  );
}