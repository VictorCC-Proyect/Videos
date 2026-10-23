// Puente con los Web Workers de los motores gratuitos. Cada motor tiene su propio
// worker y solo uno vive a la vez: al usar uno se cierra el otro y se libera su memoria
// (los dos juntos no caben en una pestaña de iPhone).
import type { WorkerRequest, WorkerResponse } from "./worker";
import type { EngineId, Pcm } from "./types";

type Local = Exclude<EngineId, "elevenlabs">;
type Pending = { resolve: (v: WorkerResponse) => void; reject: (e: Error) => void; onProgress?: (f: number, label: string) => void };
type Slot = { worker: Worker; pending: Map<number, Pending> };

const slots = new Map<Local, Slot>();
let nextId = 1;

export function unloadLocal(engine: Local) {
  const slot = slots.get(engine);
  if (!slot) return;
  slot.worker.terminate();
  for (const p of slot.pending.values()) p.reject(new Error("Se cambió de motor"));
  slots.delete(engine);
}

function getSlot(engine: Local): Slot {
  for (const other of slots.keys()) if (other !== engine) unloadLocal(other);
  const existing = slots.get(engine);
  if (existing) return existing;

  const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
  const slot: Slot = { worker, pending: new Map() };
  worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
    const msg = e.data;
    const p = slot.pending.get(msg.id);
    if (!p) return;
    if (msg.type === "progress") return p.onProgress?.(msg.fraction, msg.label);
    slot.pending.delete(msg.id);
    if (msg.type === "error") p.reject(new Error(msg.message));
    else p.resolve(msg);
  };
  worker.onerror = (e) => {
    for (const p of slot.pending.values()) p.reject(new Error(e.message || "El motor de voz se detuvo"));
    slot.pending.clear();
    slots.delete(engine);
  };
  slots.set(engine, slot);
  return slot;
}

type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never;

function call(req: DistributiveOmit<WorkerRequest, "id">, onProgress?: Pending["onProgress"]) {
  const id = nextId++;
  const slot = getSlot(req.engine);
  return new Promise<WorkerResponse>((resolve, reject) => {
    slot.pending.set(id, { resolve, reject, onProgress });
    slot.worker.postMessage({ ...req, id });
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
