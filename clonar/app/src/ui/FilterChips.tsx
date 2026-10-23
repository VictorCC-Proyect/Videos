type Props = { label: string; options: string[]; active: string[]; onToggle: (o: string) => void };

export function FilterChips({ label, options, active, onToggle }: Props) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = active.includes(o);
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(o)}
            className={`h-9 rounded-full px-4 text-sm font-medium ${on ? "bg-accent text-on-accent" : "bg-surface text-fg hover:bg-surface-2"}`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
