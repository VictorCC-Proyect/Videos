import Dexie, { type EntityTable } from "dexie";
import { defaultSettings, engines, type EngineId, type SynthSettings, type Voice } from "./engines/types";

export type Generation = {
  id: string;
  text: string;
  engine: EngineId;
  voiceId: string;
  voiceName: string;
  settings: SynthSettings;
  charCount: number;
  durationSec: number;
  audio: Blob; // MP3
  createdAt: number;
};

export type SavedVoice = Voice & { key: string; savedAt: number };

export type Prefs = {
  id: "prefs";
  engine: EngineId;
  voiceByEngine: Partial<Record<EngineId, string>>;
  settings: SynthSettings;
  elevenKey: string;
};

export const defaultPrefs: Prefs = {
  id: "prefs",
  engine: "supertonic",
  voiceByEngine: { supertonic: "M1" },
  settings: defaultSettings,
  elevenKey: "",
};

// Todo vive en el navegador del dispositivo (IndexedDB). Nada sale a internet.
export const db = new Dexie("voz") as Dexie & {
  generations: EntityTable<Generation, "id">;
  voices: EntityTable<SavedVoice, "key">;
  prefs: EntityTable<Prefs, "id">;
};

db.version(1).stores({
  generations: "id, createdAt, voiceId",
  voices: "key, engine, savedAt",
  prefs: "id",
});
db.version(2).stores({ samples: "engine" });

// Muestras de la prueba a ciegas: se guardan en cuanto salen, por si la pestaña se cierra.
export type BlindSample = { engine: EngineId; voiceName: string; blob: Blob; seconds: number; createdAt: number };
export const samples = (db as unknown as { samples: EntityTable<BlindSample, "engine"> }).samples;

export async function getPrefs(): Promise<Prefs> {
  const p = await db.prefs.get("prefs");
  const merged = { ...defaultPrefs, ...p, settings: { ...defaultSettings, ...p?.settings } };
  // Un motor que ya no existe (Kokoro se quitó) vuelve al de por defecto.
  if (!(merged.engine in engines)) merged.engine = defaultPrefs.engine;
  return merged;
}

export async function savePrefs(patch: Partial<Prefs>) {
  const p = await getPrefs();
  await db.prefs.put({ ...p, ...patch, id: "prefs" });
}

// Pide al navegador que no borre los datos por falta de espacio.
export async function askPersistence() {
  try {
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}
