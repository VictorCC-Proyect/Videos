import { Download, Play, RotateCcw, Trash2 } from "lucide-react";
import { IconButton } from "./Button";

export type HistoryItem = { text: string; voice: string; engine: string; duration: string; when: string; failed?: boolean };

type Props = {
  item: HistoryItem;
  onPlay?: () => void;
  onDownload?: () => void;
  onReuse?: () => void;
  onDelete?: () => void;
};

export function HistoryRow({ item, onPlay, onDownload, onReuse, onDelete }: Props) {
  return (
    <div className="flex items-center gap-1 border-b border-line py-2">
      <IconButton label="Escuchar" onClick={onPlay} disabled={item.failed}><Play className="size-4" /></IconButton>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm text-fg">{item.text}</span>
        <span className={`truncate text-xs ${item.failed ? "text-danger" : "text-muted"}`}>
          {item.failed ? "No se pudo generar" : `${item.voice} · ${item.engine} · ${item.duration}`} · {item.when}
        </span>
      </div>
      <IconButton label="Descargar MP3" onClick={onDownload} disabled={item.failed}><Download className="size-4" /></IconButton>
      <IconButton label="Usar este texto y estos ajustes" onClick={onReuse} className="hidden sm:inline-flex"><RotateCcw className="size-4" /></IconButton>
      <IconButton label="Borrar" onClick={onDelete}><Trash2 className="size-4" /></IconButton>
    </div>
  );
}
