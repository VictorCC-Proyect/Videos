import { useState } from "react";
import { KeyRound, Mic } from "lucide-react";
import { fileName } from "../audio";
import { engines, type EngineId, type Voice } from "../engines/types";
import { previewBlob } from "../preview";
import { useApp } from "../state";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { FilterChips } from "../ui/FilterChips";
import { VoiceCard } from "../ui/VoiceCard";
import { builtinVoices } from "../voices";

const order: EngineId[] = ["supertonic", "elevenlabs"];

// S03/S04: las voces de cada motor, con muestra y botón para usarlas.
export function VoicesScreen({ go }: { go: (route: string) => void }) {
  const { prefs, setPrefs, elevenVoices, elevenError, play, toast } = useApp();
  const [tab, setTab] = useState<EngineId>(prefs.engine);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const voices: Voice[] = tab === "elevenlabs" ? elevenVoices : builtinVoices[tab];

  async function preview(v: Voice) {
    setLoadingId(v.id);
    try {
      play(await previewBlob(v), `Muestra · ${v.name}`, fileName(`muestra ${v.name}`, "mp3"));
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setLoadingId(null);
    }
  }

  function use(v: Voice) {
    setPrefs({ engine: v.engine, voiceByEngine: { ...prefs.voiceByEngine, [v.engine]: v.id } });
    go("");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-[28px] font-bold leading-[34px]">Voces</h1>
        <Button variant="secondary" size="sm" onClick={() => go("prueba")}>¿Cuál suena mejor? Prueba a ciegas</Button>
      </div>
      <FilterChips label="Motor" options={order.map((e) => engines[e].name)} active={[engines[tab].name]} onToggle={(name) => setTab(order.find((e) => engines[e].name === name)!)} />
      <p className="text-sm text-muted">{engines[tab].description}{tab !== "elevenlabs" && " La primera muestra tarda más porque descarga la voz."}</p>

      {tab === "elevenlabs" && !prefs.elevenKey ? (
        <EmptyState icon={<KeyRound className="size-6" />} text="Pega tu clave de ElevenLabs para ver las voces de tu cuenta, como Emiliano." action={<Button variant="secondary" size="sm" onClick={() => go("ajustes")}>Ir a Configuración</Button>} />
      ) : tab === "elevenlabs" && !voices.length ? (
        <EmptyState icon={<Mic className="size-6" />} text={elevenError ?? "Tu cuenta no tiene voces todavía. Agrégalas desde la biblioteca de ElevenLabs y vuelve aquí."} />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {voices.map((v) => (
            <div key={v.id} className="flex flex-col gap-2">
              <VoiceCard voice={v} playing={loadingId === v.id} onPlay={() => preview(v)} selected={prefs.voiceByEngine[v.engine] === v.id && prefs.engine === v.engine} onSelect={() => use(v)} />
            </div>
          ))}
        </div>
      )}
      {tab === "elevenlabs" && elevenError && voices.length > 0 && <p className="text-xs text-warning">{elevenError}. Se muestran las voces guardadas la última vez.</p>}
    </div>
  );
}
