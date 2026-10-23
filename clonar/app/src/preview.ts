import { encodeMp3 } from "./audio";
import { synthLocal } from "./engines/local";
import type { Voice } from "./engines/types";

const PHRASE = "Hola, así suena esta voz. ¿Te gusta cómo queda en tus videos?";
const cache = new Map<string, Blob>();

// Muestra corta de una voz. Las de ElevenLabs traen su propia muestra; las gratuitas se generan aquí.
export async function previewBlob(v: Voice): Promise<Blob> {
  const key = `${v.engine}:${v.id}`;
  const hit = cache.get(key);
  if (hit) return hit;
  let blob: Blob;
  if (v.engine === "elevenlabs") {
    if (!v.previewUrl) throw new Error("Esta voz no tiene muestra");
    blob = await (await fetch(v.previewUrl)).blob();
  } else {
    blob = encodeMp3(await synthLocal(v.engine, PHRASE, v.id, { speed: 1, steps: 6 }));
  }
  cache.set(key, blob);
  return blob;
}
