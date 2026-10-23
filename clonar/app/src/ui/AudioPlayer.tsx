import { Download, Pause, Play } from "lucide-react";
import { IconButton } from "./Button";

type Props = { title: string; playing: boolean; onToggle: () => void; current: number; total: number; onSeek: (s: number) => void; onDownload?: () => void };

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function AudioPlayer({ title, playing, onToggle, current, total, onSeek, onDownload }: Props) {
  const pct = total ? (current / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 rounded-lg bg-surface p-2">
      <IconButton label={playing ? "Pausar" : "Reproducir"} onClick={onToggle} className="rounded-full bg-accent text-on-accent hover:bg-accent">
        {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
      </IconButton>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-fg">{title}</span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            aria-label="Posición del audio"
            aria-valuetext={`${mmss(current)} de ${mmss(total)}`}
            min={0}
            max={total || 1}
            step={0.1}
            value={current}
            onChange={(e) => onSeek(Number(e.target.value))}
            style={{ background: `linear-gradient(to right, var(--c-accent) ${pct}%, var(--c-surface-2) ${pct}%)` }}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent"
          />
          <span className="text-xs tabular-nums text-muted">{mmss(current)} / {mmss(total)}</span>
        </div>
      </div>
      {onDownload && (
        <IconButton label="Descargar MP3" onClick={onDownload}>
          <Download className="size-4" />
        </IconButton>
      )}
    </div>
  );
}
