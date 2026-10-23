// Si el navegador cierra la pestaña mientras un motor usa cierto modo (WebGPU o
// WebAssembly), no hay error que atrapar. Antes de usarlo se anota el modo como
// "en curso"; si al abrir la app sigue anotado, ese modo hizo que se cerrara y la
// próxima vez se usa el siguiente de la lista.
import { diag } from "../diag";

export type Device = "webgpu" | "wasm";
const PENDING = "voz:modo-en-curso";
const FAILED = "voz:modos-que-fallaron";

function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // sin almacenamiento local: sin protección
  }
}

// Al cargar la app: si quedó un modo "en curso", se cerró con él.
const leftover = read<{ engine: string; device: Device } | null>(PENDING, null);
if (leftover) {
  const failed = read<Record<string, Device[]>>(FAILED, {});
  failed[leftover.engine] = [...new Set([...(failed[leftover.engine] ?? []), leftover.device])];
  write(FAILED, failed);
  write(PENDING, null);
  diag(`${leftover.engine}: la pestaña se cerró usando ${leftover.device}; no se volverá a usar ese modo`);
}

export function pickDevice(engine: string, candidates: Device[]): Device {
  const failed = read<Record<string, Device[]>>(FAILED, {})[engine] ?? [];
  // Si ya fallaron todos, se intenta el último (WebAssembly) de todos modos.
  return candidates.find((d) => !failed.includes(d)) ?? candidates[candidates.length - 1];
}

export function markRunning(engine: string, device: Device) {
  write(PENDING, { engine, device });
}

export function markDone() {
  write(PENDING, null);
}

export function resetGuard() {
  write(PENDING, null);
  write(FAILED, null);
}
