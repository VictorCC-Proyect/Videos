import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { db, defaultPrefs, getPrefs, savePrefs, type Prefs } from "./db";
import { listElevenVoices } from "./engines/elevenlabs";
import type { Voice } from "./engines/types";
import { Toast } from "./ui/Toast";

type Playing = { url: string; title: string; blob: Blob; filename: string };

type AppState = {
  prefs: Prefs;
  setPrefs: (patch: Partial<Prefs>) => void;
  elevenVoices: Voice[];
  elevenError: string | null;
  refreshEleven: () => Promise<void>;
  playing: Playing | null;
  play: (blob: Blob, title: string, filename: string) => void;
  toast: (message: string, kind?: "success" | "error") => void;
};

const Ctx = createContext<AppState | null>(null);

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp fuera de AppProvider");
  return v;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefsState] = useState<Prefs>(defaultPrefs);
  const [elevenVoices, setElevenVoices] = useState<Voice[]>([]);
  const [elevenError, setElevenError] = useState<string | null>(null);
  const [playing, setPlaying] = useState<Playing | null>(null);
  const [toastMsg, setToastMsg] = useState<{ message: string; kind: "success" | "error" } | null>(null);
  const toastTimer = useRef<number>(undefined);

  useEffect(() => {
    getPrefs().then(setPrefsState);
  }, []);

  const setPrefs = useCallback((patch: Partial<Prefs>) => {
    setPrefsState((p) => ({ ...p, ...patch }));
    savePrefs(patch);
  }, []);

  const toast = useCallback((message: string, kind: "success" | "error" = "success") => {
    setToastMsg({ message, kind });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), kind === "error" ? 7000 : 4000);
  }, []);

  const refreshEleven = useCallback(async () => {
    if (!prefs.elevenKey) {
      setElevenVoices([]);
      setElevenError(null);
      return;
    }
    try {
      const voices = await listElevenVoices(prefs.elevenKey);
      setElevenVoices(voices);
      setElevenError(null);
      await db.voices.bulkPut(voices.map((v) => ({ ...v, key: `elevenlabs:${v.id}`, savedAt: Date.now() })));
    } catch (e) {
      setElevenError(e instanceof Error ? e.message : String(e));
      // Sin conexión: se usan las voces guardadas la última vez.
      const saved = await db.voices.where("engine").equals("elevenlabs").toArray();
      setElevenVoices(saved);
    }
  }, [prefs.elevenKey]);

  useEffect(() => {
    refreshEleven();
  }, [refreshEleven]);

  const play = useCallback((blob: Blob, title: string, filename: string) => {
    setPlaying((old) => {
      if (old) URL.revokeObjectURL(old.url);
      return { url: URL.createObjectURL(blob), title, blob, filename };
    });
  }, []);

  return (
    <Ctx.Provider value={{ prefs, setPrefs, elevenVoices, elevenError, refreshEleven, playing, play, toast }}>
      {children}
      {toastMsg && (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
          <div className="pointer-events-auto max-w-md">
            <Toast kind={toastMsg.kind} message={toastMsg.message} />
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
