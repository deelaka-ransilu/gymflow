"use client";

import { useId } from "react";

type LineChartProps = {
  values: number[];
  /** Text under the left end of the line, for example the first date. */
  startLabel: string;
  /** Text under the right end of the line, for example today's date. */
  endLabel: string;
  /** One sentence that describes the chart for screen readers. */
  ariaLabel: string;
};

const W = 600;
const H = 160;
const PAD = 10;
const ORANGE = "#FF6A00";

/**
 * A line with a soft fill. The SVG is stretched to the card width and the stroke is
 * non-scaling, so the line keeps the same thickness at every width. All text lives
 * outside the SVG so it is never stretched.
 */
export function LineChart({ values, startLabel, endLabel, ariaLabel }: LineChartProps) {
  const gradientId = useId().replace(/:/g, "");
  const max = Math.max(1, ...values);
  const lastIndex = Math.max(values.length - 1, 1);

  const points = values.map((v, i) => {
    const x = (i / lastIndex) * W;
    const y = H - PAD - (v / max) * (H - PAD * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = `M${points.join("L")}`;
  const area = `${line}L${W},${H}L0,${H}Z`;

  return (
    <div>
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="block h-40 w-full"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ORANGE} stopOpacity="0.28" />
            <stop offset="100%" stopColor={ORANGE} stopOpacity="0" />
          </linearGradient>
        </defs>

        <line x1="0" x2={W} y1={PAD} y2={PAD} stroke="#2E2E2E" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
        <line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke="#2E2E2E" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
        <line x1="0" x2={W} y1={H - 1} y2={H - 1} stroke="#2E2E2E" vectorEffect="non-scaling-stroke" />

        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line}
          fill="none"
          stroke={ORANGE}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div aria-hidden="true" className="mt-2 flex justify-between text-[11px] text-neutral-400">
        <span>{startLabel}</span>
        <span>{endLabel}</span>
      </div>
    </div>
  );
}