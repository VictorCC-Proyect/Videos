// Web Worker: carga los modelos y genera el audio sin congelar la pantalla.
import { loadKokoro, synthKokoro } from "./kokoro";
import { loadSupertonic, supertonicDevice, synthSupertonic } from "./supertonic";
import type { EngineId } from "./types";

export type WorkerRequest =
  | { id: number; type: "load"; engine: Exclude<EngineId, "elevenlabs"> }
  | { id: number; type: "synth"; engine: Exclude<EngineId, "elevenlabs">; text: string; voice: string; speed: number; steps: number };

export type WorkerResponse =
  | { id: number; type: "progress"; fraction: number; label: string }
  | { id: number; type: "loaded"; device?: string }
  | { id: number; type: "audio"; samples: Float32Array; sampleRate: number }
  | { id: number; type: "error"; message: string };

const post = (msg: WorkerResponse, transfer: Transferable[] = []) => (self as unknown as Worker).postMessage(msg, transfer);

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const req = e.data;
  const progress = (fraction: number, label: string) => post({ id: req.id, type: "progress", fraction, label });
  try {
    if (req.engine === "supertonic") await loadSupertonic(progress);
    else await loadKokoro(progress);

    if (req.type === "load") {
      post({ id: req.id, type: "loaded", device: req.engine === "supertonic" ? supertonicDevice() : undefined });
      return;
    }
    const pcm =
      req.engine === "supertonic"
        ? await synthSupertonic(req.text, req.voice, { speed: req.speed, steps: req.steps }, (s, t) => progress(s / t, "Generando"))
        : await synthKokoro(req.text, req.voice, { speed: req.speed });
    post({ id: req.id, type: "audio", samples: pcm.samples, sampleRate: pcm.sampleRate }, [pcm.samples.buffer]);
  } catch (err) {
    post({ id: req.id, type: "error", message: err instanceof Error ? err.message : String(err) });
  }
};
