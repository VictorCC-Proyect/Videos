// Web Worker: carga los modelos y genera el audio sin congelar la pantalla.
import type { Device } from "./crashGuard";
import type { EngineId } from "./types";

export type WorkerRequest =
  | { id: number; type: "load"; engine: Exclude<EngineId, "elevenlabs">; device: Device }
  | { id: number; type: "synth"; engine: Exclude<EngineId, "elevenlabs">; device: Device; text: string; voice: string; speed: number; steps: number };

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
    let pcm: { samples: Float32Array; sampleRate: number };
    // Cada worker importa solo su motor, así no carga el código del otro.
    if (req.engine === "supertonic") {
      const st = await import("./supertonic");
      await st.loadSupertonic(req.device, progress);
      if (req.type === "load") return post({ id: req.id, type: "loaded", device: st.supertonicDevice() });
      pcm = await st.synthSupertonic(req.text, req.voice, { speed: req.speed, steps: req.steps }, (s, t) => progress(s / t, "Generando"));
    } else {
      const kk = await import("./kokoro");
      await kk.loadKokoro(progress);
      if (req.type === "load") return post({ id: req.id, type: "loaded" });
      pcm = await kk.synthKokoro(req.text, req.voice, { speed: req.speed });
    }
    post({ id: req.id, type: "audio", samples: pcm.samples, sampleRate: pcm.sampleRate }, [pcm.samples.buffer]);
  } catch (err) {
    post({ id: req.id, type: "error", message: err instanceof Error ? err.message : String(err) });
  }
};
