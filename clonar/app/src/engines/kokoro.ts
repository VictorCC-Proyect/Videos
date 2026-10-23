// Motor Kokoro (Apache 2.0) con Transformers.js. Corre dentro del Web Worker.
// kokoro-js solo trae voces en inglés, así que para español se convierte el texto
// a fonemas con eSpeak NG (variante latinoamericana) y se usan las voces ef_dora,
// em_alex y em_santa del mismo modelo. Experimental: la calidad se confirma en la prueba a ciegas.
import { KokoroTTS } from "kokoro-js";
import { phonemize } from "phonemizer";
import type { Pcm } from "./types";

const MODEL = "onnx-community/Kokoro-82M-v1.0-ONNX";

let tts: KokoroTTS | null = null;
let loading: Promise<KokoroTTS> | null = null;

export function loadKokoro(onProgress: (fraction: number, label: string) => void): Promise<KokoroTTS> {
  if (tts) return Promise.resolve(tts);
  loading ??= (async () => {
    const device = "gpu" in navigator ? "webgpu" : "wasm";
    const files = new Map<string, number>();
    const progress_callback = (p: { status: string; file?: string; progress?: number }) => {
      if (p.status === "progress" && p.file) {
        files.set(p.file, (p.progress ?? 0) / 100);
        const vals = [...files.values()];
        onProgress(vals.reduce((a, b) => a + b, 0) / Math.max(vals.length, 2), "Descargando la voz");
      }
    };
    try {
      tts = await KokoroTTS.from_pretrained(MODEL, { dtype: device === "webgpu" ? "fp32" : "q8", device, progress_callback });
    } catch {
      tts = await KokoroTTS.from_pretrained(MODEL, { dtype: "q8", device: "wasm", progress_callback });
    }
    onProgress(1, "Preparando la voz");
    return tts;
  })();
  loading.catch(() => (loading = null));
  return loading;
}

const PUNCT = /(\s*[;:,.!?¡¿—…"«»“”()]+\s*)+/g;

// Convierte a fonemas lo que no es puntuación y deja la puntuación tal cual,
// porque el modelo la usa para las pausas y la entonación.
async function toPhonemes(text: string): Promise<string> {
  const parts: string[] = [];
  let last = 0;
  for (const m of text.matchAll(PUNCT)) {
    if (m.index! > last) parts.push(...(await phonemize(text.slice(last, m.index), "es-419")));
    parts.push(m[0].replace(/[¡¿]/g, ""));
    last = m.index! + m[0].length;
  }
  if (last < text.length) parts.push(...(await phonemize(text.slice(last), "es-419")));
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export async function synthKokoro(text: string, voiceId: string, opts: { speed: number }): Promise<Pcm> {
  if (!tts) throw new Error("El motor no está cargado");
  const phonemes = await toPhonemes(text);
  const { input_ids } = tts.tokenizer(phonemes, { truncation: true });
  const audio = await tts.generate_from_ids(input_ids, { voice: voiceId as never, speed: opts.speed });
  return { samples: audio.audio, sampleRate: audio.sampling_rate };
}
