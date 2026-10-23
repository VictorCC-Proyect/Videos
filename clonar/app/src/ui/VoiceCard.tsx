import { Check, Pause, Play, Plus } from "lucide-react";
import { IconButton } from "./Button";

export type VoiceInfo = { name: string; tags: string[] };

type Props = {
  voice: VoiceInfo;
  playing?: boolean;
  onPlay?: () => void;
  selected?: boolean;
  onSelect?: () => void;
  saved?: boolean;
  onSave?: () => void;
};

export function VoiceCard({ voice, playing, onPlay, selected, onSelect, saved, onSave }: Props) {
  return (
    <div className={`flex items-center gap-3 rounded-lg border bg-bg p-3 ${selected ? "border-accent" : "border-line"}`}>
      <IconButton label={`${playing ? "Pausar" : "Escuchar"} ${voice.name}`} onClick={onPlay} className="shrink-0 rounded-full bg-surface">
        {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
      </IconButton>
      <button type="button" onClick={onSelect} aria-pressed={onSelect ? selected : undefined} className="flex min-h-11 min-w-0 flex-1 flex-col items-start justify-center text-left">
        <span className="truncate text-sm font-semibold text-fg">{voice.name}</span>
        <span className="truncate text-xs text-muted">{voice.tags.join(" · ")}</span>
      </button>
      {onSave && (
        <IconButton label={saved ? `${voice.name} ya está en tus voces` : `Guardar ${voice.name}`} onClick={onSave} disabled={saved}>
          {saved ? <Check className="size-4 text-success" /> : <Plus className="size-4" />}
        </IconButton>
      )}
    </div>
  );
}
