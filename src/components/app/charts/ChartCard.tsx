type ChartCardProps = {
  title: string;
  /** Small grey text on the right of the title, such as the time range. */
  note?: string;
  className?: string;
  children: React.ReactNode;
};

export function ChartCard({ title, note, className = "", children }: ChartCardProps) {
  return (
    <section className={`flex flex-col rounded-xl border border-[#2E2E2E] bg-[#1C1C1C] p-5 ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-heading text-xl">{title}</h2>
        {note && <span className="text-xs text-neutral-400">{note}</span>}
      </div>
      <div className="mt-4 flex-1">{children}</div>
    </section>
  );
}