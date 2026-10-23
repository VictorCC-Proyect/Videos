// Registro de diagnóstico. Se guarda en localStorage en cada paso, así sobrevive
// aunque el navegador cierre la pestaña por falta de memoria y se puede leer al volver.
const KEY = "voz:diag";
const MAX = 80;

export type DiagEntry = { t: number; msg: string };

export function diag(msg: string) {
  try {
    const list: DiagEntry[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    list.push({ t: Date.now(), msg });
    localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX)));
  } catch {
    // sin almacenamiento local: no hay registro
  }
}

export function readDiag(): DiagEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function clearDiag() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // nada que borrar
  }
}

export function deviceSummary() {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return [
    navigator.userAgent,
    `WebGPU: ${"gpu" in navigator ? "sí" : "no"}`,
    `núcleos: ${navigator.hardwareConcurrency ?? "?"}`,
    nav.deviceMemory ? `memoria: ${nav.deviceMemory} GB` : "",
    `aislado: ${self.crossOriginIsolated ? "sí" : "no"}`,
  ]
    .filter(Boolean)
    .join(" · ");
}
