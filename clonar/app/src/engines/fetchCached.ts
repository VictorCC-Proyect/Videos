// Descarga un archivo grande una sola vez y lo guarda en la Cache del navegador.
// Así el modelo no se vuelve a bajar cada vez que se abre la app.
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
    // Sin Cache API (modo privado): se descarga cada vez.
  }

  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new Error("No se pudo descargar la voz. Revisa tu conexión a internet.");
  }
  if (!res.ok || !res.body) throw new Error(`No se pudo descargar ${url.split("/").pop()} (${res.status})`);
  const total = Number(res.headers.get("content-length")) || 0;
  const reader = res.body.getReader();
  const parts: Uint8Array[] = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parts.push(value);
    loaded += value.length;
    if (total) onProgress?.(loaded / total);
  }
  const out = new Uint8Array(loaded);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  onProgress?.(1);
  try {
    await cache?.put(url, new Response(out, { headers: { "content-type": "application/octet-stream" } }));
  } catch {
    // Sin espacio: funciona igual, solo que se volverá a descargar.
  }
  return out;
}

export async function fetchJsonCached<T>(url: string): Promise<T> {
  const bytes = await fetchCached(url);
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}
