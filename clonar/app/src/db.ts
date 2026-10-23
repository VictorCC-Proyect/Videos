import Dexie, { type EntityTable } from "dexie";
import { defaultSettings, type EngineId, type SynthSettings, type Voice } from "./engines/types";

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
  voiceByEngine: { supertonic: "M1", kokoro: "ef_dora" },
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

export async function getPrefs(): Promise<Prefs> {
  const p = await db.prefs.get("prefs");
  return { ...defaultPrefs, ...p, settings: { ...defaultSettings, ...p?.settings } };
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
