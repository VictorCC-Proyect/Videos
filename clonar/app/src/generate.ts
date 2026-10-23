import { durationOf, encodeMp3, joinPcm } from "./audio";
import { db, type Generation } from "./db";
import { synthEleven } from "./engines/elevenlabs";
import { synthLocal } from "./engines/local";
import { engines, type EngineId, type Pcm, type SynthSettings } from "./engines/types";
import { splitText } from "./text";

export type GenProgress = { label: string; fraction?: number };

export type GenRequest = {
  text: string;
  engine: EngineId;
  voiceId: string;
  voiceName: string;
  settings: SynthSettings;
  elevenKey?: string;
};

// El ciclo principal: parte el texto, genera cada trozo, los une, convierte a MP3
// y lo guarda en el historial.
export async function generate(req: GenRequest, onProgress: (p: GenProgress) => void, signal?: AbortSignal): Promise<Generation> {
  const chunks = splitText(req.text, engines[req.engine].maxChars);
  if (!chunks.length) throw new Error("Escribe algo para generar");
  const parts: Pcm[] = [];

  for (let i = 0; i < chunks.length; i++) {
    if (signal?.aborted) throw new DOMException("Cancelado", "AbortError");
    const label = chunks.length > 1 ? `Generando parte ${i + 1} de ${chunks.length}` : "Generando";
    const base = i / chunks.length;
    onProgress({ label, fraction: base });

    if (req.engine === "elevenlabs") {
      if (!req.elevenKey) throw new Error("Pega tu clave de ElevenLabs en Configuración");
      parts.push(await synthEleven(req.elevenKey, chunks[i], req.voiceId, req.settings, { previous: chunks[i - 1], next: chunks[i + 1] }));
    } else {
      parts.push(
        await synthLocal(req.engine, chunks[i], req.voiceId, { speed: req.settings.speed, steps: req.settings.steps }, (f, l) =>
          onProgress(l === "Generando" ? { label, fraction: base + f / chunks.length } : { label: l, fraction: f }),
        ),
      );
    }
  }

  onProgress({ label: "Preparando el MP3" });
  const pcm = parts.length === 1 ? parts[0] : joinPcm(parts);
  const gen: Generation = {
    id: crypto.randomUUID(),
    text: req.text,
    engine: req.engine,
    voiceId: req.voiceId,
    voiceName: req.voiceName,
    settings: req.settings,
    charCount: req.text.length,
    durationSec: durationOf(pcm),
    audio: encodeMp3(pcm),
    createdAt: Date.now(),
  };
  await db.generations.put(gen);
  return gen;
}
