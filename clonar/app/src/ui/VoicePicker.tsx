import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Voice } from "../engines/types";
import { Modal } from "./Modal";
import { VoiceCard } from "./VoiceCard";

type Props = { open: boolean; onClose: () => void; voices: Voice[]; selectedId: string; onPick: (v: Voice) => void; onPreview?: (v: Voice) => void };

// S02: elegir voz sin salir del editor.
export function VoicePicker({ open, onClose, voices, selectedId, onPick, onPreview }: Props) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return n ? voices.filter((v) => `${v.name} ${v.tags.join(" ")}`.toLowerCase().includes(n)) : voices;
  }, [q, voices]);
  return (
    <Modal open={open} onClose={onClose} title="Elegir voz">
      <div className="flex flex-col gap-3">
        <label className="flex h-11 items-center gap-2 rounded-md border border-input px-3">
          <Search className="size-4 text-muted" aria-hidden />
          <span className="sr-only">Buscar voz</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o etiqueta" className="h-full flex-1 bg-transparent text-sm outline-none" />
        </label>
        <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
          {list.map((v) => (
            <VoiceCard
              key={v.id}
              voice={v}
              selected={v.id === selectedId}
              onSelect={() => {
                onPick(v);
                onClose();
              }}
              onPlay={onPreview ? () => onPreview(v) : undefined}
            />
          ))}
          {!list.length && <p className="py-6 text-center text-sm text-muted">Ninguna voz coincide con “{q}”.</p>}
        </div>
      </div>
    </Modal>
  );
}
