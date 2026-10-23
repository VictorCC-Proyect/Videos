import { useEffect, useMemo, useState } from "react";
import { History, Search } from "lucide-react";
import { downloadBlob, fileName } from "../audio";
import { db, type Generation } from "../db";
import { engines } from "../engines/types";
import { useApp } from "../state";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { HistoryRow } from "../ui/HistoryRow";

const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
function relative(ts: number) {
  const s = (ts - Date.now()) / 1000;
  if (s > -60) return "hace un momento";
  if (s > -3600) return rtf.format(Math.round(s / 60), "minute");
  if (s > -86400) return rtf.format(Math.round(s / 3600), "hour");
  return rtf.format(Math.round(s / 86400), "day");
}
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

// S06: los audios ya generados, guardados en este dispositivo.
export function HistoryScreen({ go }: { go: (route: string) => void }) {
  const { play, setPrefs, prefs, toast } = useApp();
  const [items, setItems] = useState<Generation[] | null>(null);
  const [q, setQ] = useState("");

  const load = () => db.generations.orderBy("createdAt").reverse().toArray().then(setItems);
  useEffect(() => {
    load();
  }, []);

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return n && items ? items.filter((g) => g.text.toLowerCase().includes(n) || g.voiceName.toLowerCase().includes(n)) : items;
  }, [q, items]);

  async function remove(g: Generation) {
    await db.generations.delete(g.id);
    await load();
    toast("Audio borrado");
  }

  function reuse(g: Generation) {
    try {
      localStorage.setItem("voz:borrador", g.text);
    } catch {
      // sin almacenamiento local
    }
    setPrefs({ engine: g.engine, voiceByEngine: { ...prefs.voiceByEngine, [g.engine]: g.voiceId }, settings: g.settings });
    go("");
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[28px] font-bold leading-[34px]">Historial</h1>
      {items && items.length > 0 && (
        <label className="flex h-11 items-center gap-2 rounded-md border border-input px-3">
          <Search className="size-4 text-muted" aria-hidden />
          <span className="sr-only">Buscar en el historial</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por texto o voz" className="h-full flex-1 bg-transparent text-sm outline-none" />
        </label>
      )}
      {items === null ? (
        <p className="text-sm text-muted">Cargando…</p>
      ) : !items.length ? (
        <EmptyState icon={<History className="size-6" />} text="Aquí aparecerán los audios que generes en este dispositivo." action={<Button variant="secondary" size="sm" onClick={() => go("")}>Ir a texto a voz</Button>} />
      ) : (
        <div>
          {list!.map((g) => (
            <HistoryRow
              key={g.id}
              item={{ text: g.text, voice: g.voiceName, engine: engines[g.engine].name, duration: mmss(g.durationSec), when: relative(g.createdAt) }}
              onPlay={() => play(g.audio, `${g.voiceName} · ${engines[g.engine].name}`, fileName(g.text, "mp3"))}
              onDownload={() => downloadBlob(g.audio, fileName(g.text, "mp3"))}
              onReuse={() => reuse(g)}
              onDelete={() => remove(g)}
            />
          ))}
          {!list!.length && <p className="py-6 text-center text-sm text-muted">Nada coincide con “{q}”.</p>}
        </div>
      )}
      <p className="text-xs text-muted">El historial vive solo en este dispositivo. Si borras los datos del navegador, se borra.</p>
    </div>
  );
}
