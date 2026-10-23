import { useId } from "react";

type Props = { value: string; onChange: (v: string) => void; limit: number; disabled?: boolean };

export function TextEditor({ value, onChange, limit, disabled }: Props) {
  const id = useId();
  const over = value.length > limit;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="sr-only">Texto para convertir en voz</label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Escribe o pega aquí lo que quieres que diga la voz…"
        className="min-h-48 w-full resize-y rounded-lg bg-bg p-4 text-base leading-6 text-fg placeholder:text-muted border border-line focus:border-input outline-none disabled:opacity-60"
      />
      <p className={`self-end text-xs font-medium ${over ? "text-danger" : "text-muted"}`} aria-live={over ? "polite" : "off"}>
        {value.length.toLocaleString("es-MX")} / {limit.toLocaleString("es-MX")}
        {over && " · se dividirá en partes"}
      </p>
    </div>
  );
}
