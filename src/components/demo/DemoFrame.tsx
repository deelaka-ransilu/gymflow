"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowsIn, ArrowsOut } from "@phosphor-icons/react";
import { Button } from "@cloudflare/kumo";
import { AnimatedBackground } from "@/components/AnimatedBackground";

type DemoFrameProps = {
  pathname: string;
  fullScreen: boolean;
  onToggleFullScreen: () => void;
  onReset: () => void;
  children: React.ReactNode;
};

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * Everything that exists only because this is a demo: the animated background, the Mac window,
 * the "Demo mode" strip and the buttons under the window. Full screen drops the background and
 * the window but keeps the strip. The children stay mounted when switching, so nothing resets.
 * For the real install, replace this component with a plain wrapper.
 */
export function DemoFrame({
  pathname,
  fullScreen,
  onToggleFullScreen,
  onReset,
  children,
}: DemoFrameProps) {
  // Escape leaves full screen.
  useEffect(() => {
    if (!fullScreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onToggleFullScreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullScreen, onToggleFullScreen]);

  const outer = fullScreen
    ? "flex h-screen flex-col print:block! print:h-auto!"
    : "min-h-screen lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-8 print:block! print:p-0!";

  const frame = fullScreen
    ? "relative z-10 flex min-h-0 w-full flex-1 flex-col bg-[#121212] print:block! print:overflow-visible!"
    : "relative z-10 w-full bg-[#121212] lg:flex lg:h-[min(820px,calc(100vh-9rem))] lg:max-w-[1200px] lg:flex-col lg:overflow-hidden lg:rounded-2xl lg:border lg:border-kumo-line lg:shadow-2xl lg:shadow-black/60 print:block! print:h-auto! print:max-w-none! print:overflow-visible! print:border-0! print:shadow-none!";

  return (
    <div className={outer}>
      {!fullScreen && <AnimatedBackground />}

      <div className={frame}>
        {/* Mac-style title bar (laptops and desktops only, not in full screen) */}
        {!fullScreen && (
          <div className="hidden shrink-0 items-center gap-2 border-b border-kumo-line bg-kumo-base px-4 py-3 lg:flex print:hidden">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <div className="mx-auto rounded-md bg-kumo-tint px-10 py-1 text-xs text-kumo-subtle">
              gymflow.app{pathname || "/app"}
            </div>
            <div className="flex w-[52px] justify-end">
              <button
                type="button"
                onClick={onToggleFullScreen}
                aria-label="Full screen"
                title="Full screen"
                className={`grid h-8 w-8 place-items-center rounded-md text-kumo-subtle hover:bg-kumo-tint hover:text-kumo-default ${FOCUS}`}
              >
                <ArrowsOut size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Demo strip. In full screen the Exit button sits in its top right corner. */}
        <div className="relative flex shrink-0 flex-wrap items-center justify-center gap-3 border-b border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent print:hidden">
          <span>Demo mode. Data stays in this browser.</span>
          <Button variant="ghost" size="xs" onClick={onReset}>
            Reset demo data
          </Button>
          {fullScreen && (
            <button
              type="button"
              onClick={onToggleFullScreen}
              title="Exit full screen (Esc)"
              className={`flex items-center gap-1.5 rounded-md border border-accent/40 px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent/15 lg:absolute lg:right-3 lg:top-1/2 lg:-translate-y-1/2 ${FOCUS}`}
            >
              <ArrowsIn size={14} />
              Exit full screen
            </button>
          )}
        </div>

        {/* The app (or the loading text, or the sign-in screen) */}
        <div className="flex min-h-0 flex-1 flex-col lg:overflow-y-auto print:overflow-visible!">
          {children}
        </div>
      </div>

      {/* Buttons under the window */}
      {!fullScreen && (
        <div className="relative z-10 flex w-full flex-wrap items-center justify-center gap-3 px-4 py-5 lg:max-w-[1200px] print:hidden">
          <Link href="/">
            <Button variant="secondary" size="lg">
              ← Back to website
            </Button>
          </Link>
          <Link href="/#contact">
            <Button variant="primary" size="lg">
              Get this for your gym
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}