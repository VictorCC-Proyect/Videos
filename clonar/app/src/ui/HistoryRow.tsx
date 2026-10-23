import { Download, Play, RotateCcw, Trash2 } from "lucide-react";
import { IconButton } from "./Button";

export type HistoryItem = { text: string; voice: string; engine: string; duration: string; when: string; failed?: boolean };

export function HistoryRow({ item }: { item: HistoryItem }) {
  return (
    <div className="flex items-center gap-2 border-b border-line py-2">
      <IconButton label="Escuchar" disabled={item.failed}><Play className="size-4" /></IconButton>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm text-fg">{item.text}</span>
        <span className={`truncate text-xs ${item.failed ? "text-danger" : "text-muted"}`}>
          {item.failed ? "No se pudo generar" : `${item.voice} · ${item.engine} · ${item.duration}`} · {item.when}
        </span>
      </div>
      <div className="hidden sm:flex">
        <IconButton label="Descargar" disabled={item.failed}><Download className="size-4" /></IconButton>
        <IconButton label="Usar estos ajustes"><RotateCcw className="size-4" /></IconButton>
        <IconButton label="Borrar"><Trash2 className="size-4" /></IconButton>
      </div>
    </div>
  );
}
