type Props = { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean };

export function Toggle({ label, checked, onChange, disabled }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex min-h-11 w-full items-center justify-between gap-3 text-left disabled:opacity-50"
    >
      <span className="text-sm font-semibold text-fg">{label}</span>
      <span className={`relative h-6 w-10 shrink-0 rounded-full transition-colors duration-[var(--motion-base)] ${checked ? "bg-accent" : "bg-surface-2"}`}>
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-bg shadow-card transition-transform duration-[var(--motion-base)] ${checked ? "translate-x-[18px]" : "translate-x-0.5"}`}
        />
      </span>
    </button>
  );
}
