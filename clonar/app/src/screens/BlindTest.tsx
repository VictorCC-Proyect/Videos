import { useState } from "react";
import { Eye, Play } from "lucide-react";
import { encodeMp3, fileName } from "../audio";
import { synthEleven } from "../engines/elevenlabs";
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

type Sample = { engine: EngineId; voiceName: string; blob: Blob; seconds: number };

// Prueba a ciegas: el mismo guion con cada motor, en orden aleatorio.
export function BlindTest() {
  const { prefs, elevenVoices, play, toast } = useApp();
  const [text, setText] = useState(SCRIPT);
  const [stVoice, setStVoice] = useState("M1");
  const [kkVoice, setKkVoice] = useState("em_alex");
  const [elVoice, setElVoice] = useState(elevenVoices.find((v) => /emiliano/i.test(v.name))?.id ?? elevenVoices[0]?.id ?? "");
  const [busy, setBusy] = useState<{ label: string; fraction?: number } | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [pick, setPick] = useState<number | null>(null);

  async function run() {
    setSamples([]);
    setRevealed(false);
    setPick(null);
    const out: Sample[] = [];
    try {
      const jobs: { engine: EngineId; voice: string; name: string }[] = [
        { engine: "supertonic", voice: stVoice, name: builtinVoices.supertonic.find((v) => v.id === stVoice)!.name },
        { engine: "kokoro", voice: kkVoice, name: builtinVoices.kokoro.find((v) => v.id === kkVoice)!.name },
      ];
      if (prefs.elevenKey && elVoice) jobs.push({ engine: "elevenlabs", voice: elVoice, name: elevenVoices.find((v) => v.id === elVoice)?.name ?? "ElevenLabs" });
      for (const [i, j] of jobs.entries()) {
        const label = `Motor ${i + 1} de ${jobs.length}`;
        const started = performance.now();
        setBusy({ label });
        const pcm =
          j.engine === "elevenlabs"
            ? await synthEleven(prefs.elevenKey, text, j.voice, { ...prefs.settings, modelId: "eleven_multilingual_v2" }, {})
            : await synthLocal(j.engine, text, j.voice, { speed: 1, steps: 8 }, (f, l) => setBusy({ label: `${label}: ${l.toLowerCase()}`, fraction: f }));
        out.push({ engine: j.engine, voiceName: j.name, blob: encodeMp3(pcm), seconds: (performance.now() - started) / 1000 });
      }
      setSamples(out.sort(() => Math.random() - 0.5));
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
      if (out.length) setSamples(out.sort(() => Math.random() - 0.5));
    } finally {
      setBusy(null);
    }
  }

  const letters = "ABC";
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <h1 className="text-[28px] font-bold leading-[34px]">Prueba a ciegas</h1>
      <p className="text-sm text-muted">
        El mismo texto con cada motor, en orden al azar. Escúchalos, elige el que suene más natural y después mira cuál era. La primera vez tarda porque descarga las voces: mejor con Wi-Fi.
      </p>
      <TextEditor value={text} onChange={setText} limit={300} disabled={!!busy} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Select label="Voz de Supertonic" value={stVoice} onChange={setStVoice} options={builtinVoices.supertonic.map((v) => ({ value: v.id, label: v.name }))} />
        <Select label="Voz de Kokoro" value={kkVoice} onChange={setKkVoice} options={builtinVoices.kokoro.map((v) => ({ value: v.id, label: v.name }))} />
        {prefs.elevenKey && elevenVoices.length > 0 && (
          <Select label="Voz de ElevenLabs" value={elVoice} onChange={setElVoice} options={elevenVoices.map((v) => ({ value: v.id, label: v.name }))} />
        )}
      </div>
      {busy ? <ProgressBar label={busy.label} value={busy.fraction !== undefined ? busy.fraction * 100 : undefined} /> : <Button onClick={run} disabled={!text.trim()}>Generar las muestras</Button>}

      {samples.length > 0 && (
        <div className="flex flex-col gap-2">
          {samples.map((s, i) => (
            <div key={i} className={`flex items-center gap-3 rounded-lg border p-3 ${pick === i ? "border-accent" : "border-line"}`}>
              <Button variant="secondary" size="sm" icon={<Play className="size-4" />} onClick={() => play(s.blob, `Muestra ${letters[i]}`, fileName(`muestra ${letters[i]}`, "mp3"))}>
                {letters[i]}
              </Button>
              <span className="flex-1 text-sm">{revealed ? `${engines[s.engine].name} · ${s.voiceName} · generada en ${s.seconds.toFixed(1)} s` : `Muestra ${letters[i]}`}</span>
              <Button variant={pick === i ? "primary" : "ghost"} size="sm" onClick={() => setPick(i)} aria-pressed={pick === i}>
                {pick === i ? "Elegida" : "Elegir"}
              </Button>
            </div>
          ))}
          <Button variant="secondary" icon={<Eye className="size-4" />} onClick={() => setRevealed(true)} disabled={pick === null} className="self-start">
            Ver cuál era cuál
          </Button>
        </div>
      )}
    </div>
  );
}
