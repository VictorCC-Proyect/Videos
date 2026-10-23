// Descarga un archivo grande una sola vez y lo guarda en la Cache del navegador.
// La descarga va directo a la Cache sin juntar copias en memoria: en el iPhone
// cada copia de un modelo de cientos de MB cuenta para el límite de la pestaña.
const CACHE = "voz-modelos-v1";

export async function fetchCached(url: string, onProgress?: (fraction: number) => void): Promise<Uint8Array> {
  let cache: Cache | undefined;
  try {
    cache = await caches.open(CACHE);
    const hit = await cache.match(url);
    if (hit) {
      onProgress?.(1);
      return new Uint8Array(await hit.arrayBuffer());
    }
  } catch {
    cache = undefined; // sin Cache API (modo privado): se descarga cada vez
  }

  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new Error("No se pudo descargar la voz. Revisa tu conexión a internet.");
  }
  if (!res.ok || !res.body) throw new Error(`No se pudo descargar ${url.split("/").pop()} (${res.status})`);

  const total = Number(res.headers.get("content-length")) || 0;
  let loaded = 0;
  const counted = res.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, ctrl) {
        loaded += chunk.length;
        if (total) onProgress?.(Math.min(loaded / total, 0.99));
        ctrl.enqueue(chunk);
      },
    }),
  );
  const streamed = new Response(counted, { headers: { "content-type": "application/octet-stream" } });

  if (cache) {
    try {
      await cache.put(url, streamed);
      const saved = await cache.match(url);
      if (saved) {
        onProgress?.(1);
        return new Uint8Array(await saved.arrayBuffer());
      }
    } catch {
      // Sin espacio en la Cache: se vuelve a descargar sin guardar.
      return fetchDirect(url, onProgress);
    }
  }
  const out = new Uint8Array(await streamed.arrayBuffer());
  onProgress?.(1);
  return out;
}

async function fetchDirect(url: string, onProgress?: (fraction: number) => void) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo descargar ${url.split("/").pop()} (${res.status})`);
  const out = new Uint8Array(await res.arrayBuffer());
  onProgress?.(1);
  return out;
}

export async function fetchJsonCached<T>(url: string): Promise<T> {
  const bytes = await fetchCached(url);
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

// iPhone y iPad (también el iPad que se presenta como Mac). Todos sus navegadores usan WebKit,
// que limita mucho la memoria por pestaña.
export const isIOS =
  /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1);
