"use client";
import { useEffect, useRef, useState } from "react";

// A barbell bar that sits right on the seam between two sections, and the seam
// itself follows the bar. Put it between two sections. It takes no space
// itself (zero height), it overlaps the section above and below.
//
// Tell it the colour block above (`from`) and below (`to`). It paints the area
// above the bar in the `from` colour and the area below the bar in the `to`
// colour, so the straight edge between the two sections is hidden and the
// colour change follows the bar, even where the bar waves up and down.
//
// `variant` picks the shape of the bar (see BARS below). The five curved
// shapes are based on five real EZ-curl bars; "straight" is a normal barbell.
//
// The bar colour is picked automatically so it shows on both sides:
//   black and off-white  -> orange bar
//   black and orange     -> cream bar
//   orange and off-white -> dark bar
//
// The bar fades in when it scrolls into view (just shown, with no motion, if
// "reduce motion" is on).

type Block = "dark" | "light" | "orange";

const BLOCK = {
  dark: "#121212",
  light: "#F5F3EE",
  orange: "#FF6A00",
};

// Every shape is one smooth line across a 1000 x 100 box, flat at y = 50 on
// both ends. Each curve starts and ends going sideways, so every join is
// smooth with no sharp corners. The SVG is stretched to the full width, and
// the stroke is "non-scaling" so the bar stays the same thickness at every
// screen size.
//
// EVERY SHAPE MUST BE A MIRROR IMAGE around the middle (x = 500): any x on the
// left has a matching point at 1000 - x on the right, with the same y. For
// example, a point at x = 380 must have a twin at x = 620. To make a new shape,
// write the left half, then copy it backwards for the right half. Keep the
// pattern "C x1 y1 x2 y2 x y" where y1 equals the y you start at and y2 equals
// the y you end at.
const BARS = {
  // top bar in the photo: long and rippled (crest, dip, crest, dip, crest)
  wave: "M0 50 H200 C235 50 245 28 280 28 C330 28 340 72 390 72 C440 72 450 28 500 28 C550 28 560 72 610 72 C660 72 670 28 720 28 C755 28 765 50 800 50 H1000",
  // 2nd bar: the classic EZ curl, two dips and a crest
  gentle:
    "M0 50 H280 C320 50 340 72 385 72 C440 72 450 36 500 36 C550 36 560 72 615 72 C660 72 680 50 720 50 H1000",
  // 3rd bar: short, tight W
  narrow:
    "M0 50 H350 C375 50 385 76 420 76 C450 76 460 42 500 42 C540 42 550 76 580 76 C615 76 625 50 650 50 H1000",
  // 4th bar: deep, steep W
  deep: "M0 50 H300 C335 50 350 86 395 86 C440 86 455 14 500 14 C545 14 560 86 605 86 C650 86 665 50 700 50 H1000",
  // 5th bar: flat with one centred bump
  hump: "M0 50 H370 C425 50 440 26 500 26 C560 26 575 50 630 50 H1000",
  // a normal barbell
  straight: "M0 50 H1000",
};

export type BarVariant = keyof typeof BARS;

const TONES = {
  orange: { edge: "#8F3A00", body: "#FF6A00", shine: "#FFB37A" },
  cream: { edge: "#7A705F", body: "#F5F3EE", shine: "#FFFFFF" },
  dark: { edge: "#000000", body: "#1A1A1A", shine: "#6B6B6B" },
};

export function BarbellBand({
  from,
  to,
  variant = "gentle",
}: {
  from: Block;
  to: Block;
  variant?: BarVariant;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);
  const bar = BARS[variant];

  const pair = new Set<Block>([from, to]);
  const tone = pair.has("orange") ? (pair.has("dark") ? "cream" : "dark") : "orange";
  const c = TONES[tone];

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

  return (
    // zero-height wrapper: the band is centred on the seam and overlaps both sections
    <div aria-hidden="true" className="pointer-events-none relative z-10 h-0">
      <div ref={ref} className="absolute inset-x-0 top-0 h-20 -translate-y-1/2 sm:h-24 lg:h-28">
        <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="h-full w-full">
          {/* colour above the bar = the section above, colour below the bar = the section below */}
          <path d={`${bar} V0 H0 Z`} fill={BLOCK[from]} />
          <path d={`${bar} V100 H0 Z`} fill={BLOCK[to]} />
          {/* the bar itself: dark edge, body, thin light shine on top */}
          <g
            fill="none"
            strokeLinecap="butt"
            strokeLinejoin="round"
            className={`transition-opacity duration-700 ease-out motion-reduce:opacity-100 motion-reduce:transition-none ${
              shown ? "opacity-100" : "opacity-0"
            }`}
          >
            <path d={bar} stroke={c.edge} strokeWidth="17" vectorEffect="non-scaling-stroke" />
            <path d={bar} stroke={c.body} strokeWidth="13" vectorEffect="non-scaling-stroke" />
            <path
              d={bar}
              stroke={c.shine}
              strokeWidth="3"
              transform="translate(0 -3)"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}