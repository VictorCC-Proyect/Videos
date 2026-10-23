export type EngineId = "supertonic" | "kokoro" | "elevenlabs";

export type Voice = {
  id: string; // id dentro del motor (F1, ef_dora, voice_id de ElevenLabs)
  engine: EngineId;
  name: string;
  tags: string[];
  previewUrl?: string;
};

export type SynthSettings = {
  speed: number;
  steps: number; // Supertonic: pasos de refinado (más = mejor y más lento)
  stability: number; // ElevenLabs
  similarity: number; // ElevenLabs
  style: number; // ElevenLabs
  modelId: string; // ElevenLabs
};

export const defaultSettings: SynthSettings = {
  speed: 1,
  steps: 8,
  stability: 0.5,
  similarity: 0.75,
  style: 0,
  modelId: "eleven_multilingual_v2",
};

// Audio crudo de un trozo: muestras entre -1 y 1, mono.
export type Pcm = { samples: Float32Array; sampleRate: number };

export type LoadProgress = { engine: EngineId; fraction: number; label: string };

export type EngineInfo = {
  id: EngineId;
  name: string;
  description: string;
  maxChars: number; // por trozo
  free: boolean;
};

export const engines: Record<EngineId, EngineInfo> = {
  supertonic: {
    id: "supertonic",
    name: "Supertonic",
    description: "Gratis, en tu dispositivo. Rápido, 31 idiomas.",
    maxChars: 300,
    free: true,
  },
  kokoro: {
    id: "kokoro",
    name: "Kokoro (experimental)",
    description: "Gratis, en tu dispositivo. Voces en español en fase de prueba.",
    maxChars: 250,
    free: true,
  },
  elevenlabs: {
    id: "elevenlabs",
    name: "ElevenLabs",
    description: "Con tu clave. Gasta los créditos de tu plan.",
    maxChars: 2500,
    free: false,
  },
};
