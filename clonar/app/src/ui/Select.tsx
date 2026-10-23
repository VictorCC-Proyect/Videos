import { useId } from "react";

type Props = { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; disabled?: boolean };

export function Select({ label, value, onChange, options, disabled }: Props) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-fg">{label}</label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-md border border-input bg-bg px-3 text-sm text-fg disabled:opacity-50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
