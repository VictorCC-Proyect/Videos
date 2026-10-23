import { useEffect, useState } from "react";
import { Eye, Play, RotateCcw } from "lucide-react";
import { encodeMp3, fileName } from "../audio";
import { samples as samplesTable, type BlindSample } from "../db";
import { diag } from "../diag";
import { synthEleven } from "../engines/elevenlabs";
import { isIOS } from "../engines/fetchCached";
import { synthLocal } from "../engines/local";
import { engines, type EngineId } from "../engines/types";
import { useApp } from "../state";
import { Button } from "../ui/Button";
import { ProgressBar } from "../ui/ProgressBar";
import { Select } from "../ui/Select";
import { TextEditor } from "../ui/TextEditor";
import { builtinVoices } from "../voices";

const SCRIPT =
  "Ese ardor en las últimas repeticiones no es culpa del lactato. Los verdaderos culpables son los protones. Cuando entrenas intenso, tu músculo pide ATP más rápido de lo que el oxígeno alcanza a producirlo.";

const letters = "ABC";

// Prueba a ciegas: el mismo guion con cada motor. Cada motor se genera con su propio
// botón y la muestra se guarda en cuanto sale, así un cierre de la pestaña no borra las demás.
export function BlindTest() {
  const { prefs, elevenVoices, play, toast } = useApp();
  const [text, setText] = useState(SCRIPT);
  const [voices, setVoices] = useState<Record<EngineId, string>>({
    supertonic: "M1",
    elevenlabs: elevenVoices.find((v) => /emiliano/i.test(v.name))?.id ?? elevenVoices[0]?.id ?? "",
  });
  const [busy, setBusy] = useState<{ engine: EngineId; label: string; fraction?: number } | null>(null);
  const [done, setDone] = useState<BlindSample[]>([]);
  const [order, setOrder] = useState<EngineId[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [pick, setPick] = useState<EngineId | null>(null);

  useEffect(() => {
    samplesTable.toArray().then((list) => {
      const valid = list.filter((s) => s.engine in engines);
      setDone(valid);
      setOrder(valid.map((s) => s.engine).sort(() => Math.random() - 0.5));
    });
  }, []);

  const available: EngineId[] = ["supertonic", ...(prefs.elevenKey && elevenVoices.length ? (["elevenlabs"] as const) : [])];

  async function run(engine: EngineId) {
    setBusy({ engine, label: "Preparando" });
    setRevealed(false);
    setPick(null);
    const started = performance.now();
    try {
      const voice = voices[engine];
      const pcm =
        engine === "elevenlabs"
          ? await synthEleven(prefs.elevenKey, text, voice, { ...prefs.settings, modelId: "eleven_multilingual_v2" }, {})
          : await synthLocal(engine, text, voice, { speed: 1, steps: 8 }, (f, l) => setBusy({ engine, label: l, fraction: f }));
      const voiceName =
        engine === "elevenlabs" ? (elevenVoices.find((v) => v.id === voice)?.name ?? "ElevenLabs") : builtinVoices[engine].find((v) => v.id === voice)!.name;
      const sample: BlindSample = { engine, voiceName, blob: encodeMp3(pcm), seconds: (performance.now() - started) / 1000, createdAt: Date.now() };
      await samplesTable.put(sample);
      diag(`prueba a ciegas: muestra de ${engine} guardada`);
      setDone((d) => [...d.filter((s) => s.engine !== engine), sample]);
      setOrder((o) => (o.includes(engine) ? o : [...o, engine].sort(() => Math.random() - 0.5)));
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setBusy(null);
    }
  }

  async function reset() {
    await samplesTable.clear();
    setDone([]);
    setOrder([]);
    setRevealed(false);
    setPick(null);
  }

  const byEngine = (e: EngineId) => done.find((s) => s.engine === e);

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <h1 className="text-[28px] font-bold leading-[34px]">Prueba a ciegas</h1>
      <p className="text-sm text-muted">
        El mismo texto con cada motor. Genera uno por uno; las muestras aparecen abajo con letras al azar. Escúchalas, elige la más natural y después mira cuál era. La primera vez tarda porque descarga cada voz: mejor con Wi-Fi.
      </p>
      {isIOS && (
        <p className="rounded-md bg-surface p-3 text-xs text-muted">
          En iPhone, Supertonic (unos 400 MB) no cabe en la memoria de la pestaña y el navegador la cierra. Usa la app en la computadora; en el iPhone solo funciona ElevenLabs con tu clave.
        </p>
      )}
      <TextEditor value={text} onChange={setText} limit={300} disabled={!!busy} />

      <div className="flex flex-col gap-3">
        {available.map((engine) => {
          const options =
            engine === "elevenlabs" ? elevenVoices.map((v) => ({ value: v.id, label: v.name })) : builtinVoices[engine].map((v) => ({ value: v.id, label: v.name }));
          return (
            <div key={engine} className="flex flex-col gap-2 rounded-lg border border-line p-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Select label={`Voz de ${engines[engine].name}`} value={voices[engine]} onChange={(v) => setVoices((s) => ({ ...s, [engine]: v }))} options={options} disabled={!!busy} />
              </div>
              <Button variant={byEngine(engine) ? "secondary" : "primary"} onClick={() => run(engine)} disabled={!!busy || !text.trim()} loading={busy?.engine === engine}>
                {byEngine(engine) ? "Generar otra vez" : `Generar con ${engines[engine].name.split(" ")[0]}`}
              </Button>
            </div>
          );
        })}
      </div>

      {busy && <ProgressBar label={`${engines[busy.engine].name}: ${busy.label}`} value={busy.fraction !== undefined ? busy.fraction * 100 : undefined} />}

      {order.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Muestras</h2>
          {order.map((engine, i) => {
            const s = byEngine(engine);
            if (!s) return null;
            return (
              <div key={engine} className={`flex items-center gap-3 rounded-lg border p-3 ${pick === engine ? "border-accent" : "border-line"}`}>
                <Button variant="secondary" size="sm" icon={<Play className="size-4" />} onClick={() => play(s.blob, `Muestra ${letters[i]}`, fileName(`muestra ${letters[i]}`, "mp3"))}>
                  {letters[i]}
                </Button>
                <span className="flex-1 text-sm">{revealed ? `${engines[engine].name} · ${s.voiceName} · generada en ${s.seconds.toFixed(1)} s` : `Muestra ${letters[i]}`}</span>
                <Button variant={pick === engine ? "primary" : "ghost"} size="sm" onClick={() => setPick(engine)} aria-pressed={pick === engine}>
                  {pick === engine ? "Elegida" : "Elegir"}
                </Button>
              </div>
            );
          })}
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={<Eye className="size-4" />} onClick={() => setRevealed(true)} disabled={pick === null}>
              Ver cuál era cuál
            </Button>
            <Button variant="ghost" icon={<RotateCcw className="size-4" />} onClick={reset}>
              Empezar de nuevo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
