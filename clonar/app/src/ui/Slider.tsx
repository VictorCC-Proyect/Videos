import { useId } from "react";

type Props = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  left?: string;
  right?: string;
  format?: (v: number) => string;
  disabled?: boolean;
  disabledHint?: string;
};

export function Slider({ label, value, onChange, min, max, step, left, right, format = String, disabled, disabledHint }: Props) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={`flex flex-col gap-1.5 ${disabled ? "opacity-50" : ""}`}>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-fg">{label}</label>
        <span className="text-xs font-medium text-muted">{disabled && disabledHint ? disabledHint : format(value)}</span>
      </div>
      <div className="flex h-11 items-center">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-valuetext={format(value)}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ background: `linear-gradient(to right, var(--c-accent) ${pct}%, var(--c-surface-2) ${pct}%)` }}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full disabled:cursor-not-allowed [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-input [&::-webkit-slider-thumb]:bg-bg [&::-webkit-slider-thumb]:shadow-card [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-input [&::-moz-range-thumb]:bg-bg"
        />
      </div>
      {(left || right) && (
        <div className="flex justify-between text-xs text-muted">
          <span>{left}</span>
          <span>{right}</span>
        </div>
      )}
    </div>
  );
}
