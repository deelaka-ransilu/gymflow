type PageHeaderProps = {
  title: string;
  subtitle?: string;
  /** Buttons shown on the right of the title row. On phones they drop below the title. */
  actions?: React.ReactNode;
};

/** The heading every screen starts with. */
export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div>
        <h1 className="font-heading text-4xl">{title}</h1>
        {subtitle && <p className="text-neutral-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}