import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Download, KeyRound, Sparkles, Square } from "lucide-react";
import { downloadBlob, fileName } from "../audio";
import type { Generation } from "../db";
import { elevenCredits, elevenModels } from "../engines/elevenlabs";
import { engines, type EngineId, type SynthSettings, type Voice } from "../engines/types";
import { generate, type GenProgress } from "../generate";
import { previewBlob } from "../preview";
import { useApp } from "../state";
import { splitText } from "../text";
import { Button } from "../ui/Button";
import { ProgressBar } from "../ui/ProgressBar";
import { Select } from "../ui/Select";
import { Slider } from "../ui/Slider";
import { TextEditor } from "../ui/TextEditor";
import { VoicePicker } from "../ui/VoicePicker";
import { builtinVoices } from "../voices";

const DRAFT = "voz:borrador";
const readDraft = () => {
  try {
    return localStorage.getItem(DRAFT) ?? "";
  } catch {
    return "";
  }
};

// S01: el editor de texto a voz.
export function TtsScreen({ go }: { go: (route: string) => void }) {
  const { prefs, setPrefs, elevenVoices, play, toast } = useApp();
  const [text, setText] = useState(readDraft);
  const [picker, setPicker] = useState(false);
  const [busy, setBusy] = useState<GenProgress | null>(null);
  const [result, setResult] = useState<Generation | null>(null);
  const [credits, setCredits] = useState<{ used: number; limit: number } | null>(null);
  const abort = useRef<AbortController | null>(null);

  const engine = prefs.engine;
  const s = prefs.settings;
  const voices: Voice[] = engine === "elevenlabs" ? elevenVoices : builtinVoices[engine];
  const voice = voices.find((v) => v.id === prefs.voiceByEngine[engine]) ?? voices[0];
  const parts = useMemo(() => splitText(text, engines[engine].maxChars).length, [text, engine]);
  const needsKey = engine === "elevenlabs" && !prefs.elevenKey;
  const v3 = s.modelId === "eleven_v3";

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT, text);
    } catch {
      // sin almacenamiento local: el borrador no se guarda
    }
  }, [text]);

  useEffect(() => {
    if (engine === "elevenlabs" && prefs.elevenKey) elevenCredits(prefs.elevenKey).then(setCredits).catch(() => setCredits(null));
  }, [engine, prefs.elevenKey, result]);

  const setS = (patch: Partial<SynthSettings>) => setPrefs({ settings: { ...s, ...patch } });

  async function onGenerate() {
    if (!voice || !text.trim()) return;
    abort.current = new AbortController();
    setResult(null);
    setBusy({ label: "Preparando" });
    try {
      const gen = await generate(
        { text, engine, voiceId: voice.id, voiceName: voice.name, settings: s, elevenKey: prefs.elevenKey },
        setBusy,
        abort.current.signal,
      );
      setResult(gen);
      play(gen.audio, `${gen.voiceName} · ${engines[gen.engine].name}`, fileName(gen.text, "mp3"));
    } catch (e) {
      if ((e as Error).name !== "AbortError") toast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setBusy(null);
    }
  }

  async function onPreview(v: Voice) {
    try {
      toast(v.engine === "elevenlabs" ? "Cargando la muestra" : "Generando una muestra");
      play(await previewBlob(v), `Muestra · ${v.name}`, fileName(`muestra ${v.name}`, "mp3"));
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    }
  }

  const engineOptions = (Object.keys(engines) as EngineId[]).map((id) => ({ value: id, label: `${engines[id].name}${engines[id].free ? " · gratis" : ""}` }));

  const settingsPanel = (
    <div className="flex flex-col gap-4">
      <Select label="Motor" value={engine} onChange={(v) => setPrefs({ engine: v as EngineId })} options={engineOptions} />
      <p className="-mt-2 text-xs text-muted">{engines[engine].description}</p>

      {engine === "elevenlabs" && (
        <Select label="Modelo" value={s.modelId} onChange={(v) => setS({ modelId: v })} options={elevenModels.map((m) => ({ value: m.id, label: m.name }))} />
      )}

      <Slider
        label="Velocidad"
        value={s.speed}
        onChange={(v) => setS({ speed: v })}
        min={engine === "elevenlabs" ? 0.7 : 0.6}
        max={engine === "elevenlabs" ? 1.2 : 1.5}
        step={0.05}
        left="Más lenta"
        right="Más rápida"
        format={(v) => `${v.toFixed(2)}×`}
        disabled={engine === "elevenlabs" && v3}
        disabledHint="No disponible en v3"
      />

      {engine === "supertonic" && (
        <Slider label="Calidad" value={s.steps} onChange={(v) => setS({ steps: v })} min={4} max={16} step={1} left="Más rápida" right="Más natural" format={(v) => `${v} pasos`} />
      )}

      {engine === "elevenlabs" && (
        <>
          <Slider
            label="Estabilidad"
            value={s.stability}
            onChange={(v) => setS({ stability: v })}
            min={0}
            max={1}
            step={v3 ? 0.5 : 0.05}
            left="Más expresiva"
            right="Más estable"
            format={(v) => (v3 ? (v < 0.34 ? "Creativa" : v < 0.67 ? "Natural" : "Robusta") : `${Math.round(v * 100)} %`)}
          />
          <Slider label="Similitud" value={s.similarity} onChange={(v) => setS({ similarity: v })} min={0} max={1} step={0.05} left="Baja" right="Alta" format={(v) => `${Math.round(v * 100)} %`} disabled={v3} disabledHint="No disponible en v3" />
          <Slider label="Estilo" value={s.style} onChange={(v) => setS({ style: v })} min={0} max={1} step={0.05} left="Neutro" right="Exagerado" format={(v) => `${Math.round(v * 100)} %`} disabled={v3} disabledHint="No disponible en v3" />
          {credits && (
            <p className="text-xs text-muted">
              Créditos: {(credits.limit - credits.used).toLocaleString("es-MX")} de {credits.limit.toLocaleString("es-MX")} disponibles. Este texto gasta unos {text.length.toLocaleString("es-MX")}.
            </p>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <h1 className="text-[28px] font-bold leading-[34px]">Texto a voz</h1>

        <button
          type="button"
          onClick={() => setPicker(true)}
          disabled={!voices.length}
          className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-line bg-bg px-4 py-2 text-left hover:bg-surface disabled:opacity-60"
        >
          <span className="flex min-w-0 flex-col">
            <span className="text-xs text-muted">Voz</span>
            <span className="truncate text-sm font-semibold">{voice ? voice.name : engine === "elevenlabs" ? "Sin voces todavía" : "—"}</span>
          </span>
          <ChevronDown className="size-4 text-muted" aria-hidden />
        </button>

        {needsKey ? (
          <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-line p-4">
            <p className="text-sm text-muted">Para usar ElevenLabs (por ejemplo, la voz de Emiliano) pega tu clave en Configuración. Los motores gratuitos no la necesitan.</p>
            <Button variant="secondary" size="sm" icon={<KeyRound className="size-4" />} onClick={() => go("ajustes")}>
              Ir a Configuración
            </Button>
          </div>
        ) : null}

        <TextEditor value={text} onChange={setText} limit={engines[engine].maxChars} disabled={!!busy} />
        {parts > 1 && <p className="-mt-2 text-xs text-muted">Se generará en {parts} partes y se unirán en un solo audio.</p>}

        <details className="rounded-lg border border-line lg:hidden">
          <summary className="flex min-h-11 cursor-pointer items-center px-4 text-sm font-semibold">Ajustes de la voz</summary>
          <div className="border-t border-line p-4">{settingsPanel}</div>
        </details>

        {busy ? (
          <div className="flex flex-col gap-3 rounded-lg bg-surface p-4">
            <ProgressBar label={busy.label} value={busy.fraction !== undefined ? busy.fraction * 100 : undefined} />
            {busy.label.startsWith("Descargando") && <p className="text-xs text-muted">Solo pasa la primera vez. Después la voz queda guardada en tu dispositivo.</p>}
            <Button variant="secondary" size="sm" icon={<Square className="size-3.5" />} onClick={() => abort.current?.abort()} className="self-start">
              Cancelar
            </Button>
          </div>
        ) : (
          <Button size="lg" icon={<Sparkles className="size-4" />} onClick={onGenerate} disabled={!text.trim() || !voice || needsKey}>
            Generar voz
          </Button>
        )}

        {result && !busy && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-line p-3">
            <span className="text-sm">
              Listo: {Math.round(result.durationSec)} s con {result.voiceName}. También quedó en el historial.
            </span>
            <Button variant="secondary" size="sm" icon={<Download className="size-4" />} onClick={() => downloadBlob(result.audio, fileName(result.text, "mp3"))}>
              MP3
            </Button>
          </div>
        )}
      </div>

      <aside className="hidden w-80 shrink-0 flex-col gap-4 rounded-lg bg-surface p-4 lg:flex">
        <h2 className="text-lg font-semibold">Ajustes de la voz</h2>
        {settingsPanel}
      </aside>

      <VoicePicker
        open={picker}
        onClose={() => setPicker(false)}
        voices={voices}
        selectedId={voice?.id ?? ""}
        onPick={(v) => setPrefs({ voiceByEngine: { ...prefs.voiceByEngine, [engine]: v.id } })}
        onPreview={onPreview}
      />
    </div>
  );
}
