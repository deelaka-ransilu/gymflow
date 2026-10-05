export type Bar = {
  key: string;
  value: number;
  /** Top line under the bar, for example the weekday letter. */
  label: string;
  /** Second line under the bar, for example the day of the month. */
  sublabel: string;
  /** Shown as a tooltip when the pointer rests on the bar. */
  title: string;
  /** The orange bar, used for today. */
  highlight?: boolean;
};

type BarChartProps = {
  data: Bar[];
  /** One sentence that describes the chart for screen readers. */
  ariaLabel: string;
};

/** Plain bars with the number above each one. No library, no SVG text. */
export function BarChart({ data, ariaLabel }: BarChartProps) {
  const max = Math.max(1, ...data.map((b) => b.value));

  return (
    <div>
      <div role="img" aria-label={ariaLabel} className="relative h-40">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 border-t border-dashed border-[#2E2E2E]" />
        <div aria-hidden="true" className="absolute inset-x-0 top-1/2 border-t border-dashed border-[#2E2E2E]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 border-t border-[#2E2E2E]" />

        <div className="relative flex h-full items-end gap-1.5">
          {data.map((b) => (
            <div
              key={b.key}
              title={b.title}
              className="group flex h-full flex-1 flex-col items-center justify-end"
            >
              {b.value > 0 && (
                <span
                  className={`mb-1 text-[11px] leading-none ${
                    b.highlight ? "font-semibold text-neutral-100" : "text-neutral-400"
                  }`}
                >
                  {b.value}
                </span>
              )}
              <div
                className={`w-full rounded-t-md transition-colors ${
                  b.highlight ? "bg-[#FF6A00]" : "bg-[#3A3A3A] group-hover:bg-[#555555]"
                }`}
                style={{ height: `${Math.max((b.value / max) * 80, b.value > 0 ? 3 : 1)}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      <div aria-hidden="true" className="mt-2 flex gap-1.5">
        {data.map((b) => (
          <div
            key={b.key}
            className={`flex-1 text-center text-[11px] leading-tight ${
              b.highlight ? "font-semibold text-neutral-100" : "text-neutral-400"
            }`}
          >
            <div>{b.label}</div>
            <div>{b.sublabel}</div>
          </div>
        ))}
      </div>
    </div>
  );
}