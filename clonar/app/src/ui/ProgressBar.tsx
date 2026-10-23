type Props = { label: string; value?: number };

export function ProgressBar({ label, value }: Props) {
  const known = value !== undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs font-medium text-muted">
        <span>{label}</span>
        {known && <span className="tabular-nums">{Math.round(value)} %</span>}
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={known ? Math.round(value) : undefined}
        className="h-1.5 overflow-hidden rounded-full bg-surface-2"
      >
        <div className={`h-full rounded-full bg-accent ${known ? "" : "w-1/3 animate-pulse"}`} style={known ? { width: `${value}%` } : undefined} />
      </div>
    </div>
  );
}
