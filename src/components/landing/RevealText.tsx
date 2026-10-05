"use client";
import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

// Headline animation: each line slides up out of its own mask the first time
// the heading scrolls into view. Pass the lines yourself so the breaks are
// exactly where you want them (a line may contain an accent <span>).
// The text is always in the page HTML. With "reduce motion" on, it shows straight away.
export function RevealText({
  lines,
  as: Tag = "h2",
  delay = 0,
  className = "",
}: {
  lines: ReactNode[];
  as?: ElementType;
  /** Wait this many ms before the first line moves. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Component = Tag as ElementType;

  return (
    <Component ref={ref} className={className}>
      {lines.map((line, i) => (
        // The padding and negative margin stop the mask from clipping letters with tails
        // (g, y, p) when the heading uses a tight line height.
        <span key={i} className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
          <span
            style={{ transitionDelay: `${delay + i * 120}ms` }}
            className={`block transition-transform duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:transition-none ${
              shown ? "translate-y-0" : "translate-y-full"
            }`}
          >
            {line}
          </span>
        </span>
      ))}
    </Component>
  );
}