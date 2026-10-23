// Puente con el Web Worker de los motores gratuitos.
import type { WorkerRequest, WorkerResponse } from "./worker";
import type { EngineId, Pcm } from "./types";

type Local = Exclude<EngineId, "elevenlabs">;
type Pending = { resolve: (v: WorkerResponse) => void; reject: (e: Error) => void; onProgress?: (f: number, label: string) => void };

let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, Pending>();

function getWorker() {
  if (worker) return worker;
  worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
    const msg = e.data;
    const p = pending.get(msg.id);
    if (!p) return;
    if (msg.type === "progress") return p.onProgress?.(msg.fraction, msg.label);
    pending.delete(msg.id);
    if (msg.type === "error") p.reject(new Error(msg.message));
    else p.resolve(msg);
  };
  worker.onerror = (e) => {
    for (const p of pending.values()) p.reject(new Error(e.message || "El motor de voz se detuvo"));
    pending.clear();
    worker = null;
  };
  return worker;
}

type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never;

function call(req: DistributiveOmit<WorkerRequest, "id">, onProgress?: Pending["onProgress"]) {
  const id = nextId++;
  return new Promise<WorkerResponse>((resolve, reject) => {
    pending.set(id, { resolve, reject, onProgress });
    getWorker().postMessage({ ...req, id });
  });
}

export async function loadLocal(engine: Local, onProgress?: Pending["onProgress"]) {
  const res = await call({ type: "load", engine }, onProgress);
  return res.type === "loaded" ? res.device : undefined;
}

export async function synthLocal(
  engine: Local,
  text: string,
  voice: string,
  opts: { speed: number; steps: number },
  onProgress?: Pending["onProgress"],
): Promise<Pcm> {
  const res = await call({ type: "synth", engine, text, voice, ...opts }, onProgress);
  if (res.type !== "audio") throw new Error("Respuesta inesperada del motor");
  return { samples: res.samples, sampleRate: res.sampleRate };
}
