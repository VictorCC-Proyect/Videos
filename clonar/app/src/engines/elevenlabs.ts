// API oficial de ElevenLabs con la clave del usuario. La clave vive solo en este dispositivo.
import type { Pcm, SynthSettings, Voice } from "./types";

const API = "https://api.elevenlabs.io";

export const elevenModels = [
  { id: "eleven_multilingual_v2", name: "Multilingual v2", maxChars: 2500, tags: false },
  { id: "eleven_v3", name: "Eleven v3 (con etiquetas de actuación)", maxChars: 2500, tags: true },
  { id: "eleven_flash_v2_5", name: "Flash v2.5 (más rápido, más barato)", maxChars: 2500, tags: false },
];

async function request(key: string, path: string, init: RequestInit = {}) {
  const res = await fetch(API + path, { ...init, headers: { "xi-api-key": key, ...(init.headers ?? {}) } });
  if (res.status === 401) throw new Error("La clave de ElevenLabs no es válida");
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.detail?.message ?? body?.detail?.status ?? "";
    } catch {
      // sin cuerpo JSON
    }
    throw new Error(`ElevenLabs respondió ${res.status}${detail ? `: ${detail}` : ""}`);
  }
  return res;
}

export async function listElevenVoices(key: string): Promise<Voice[]> {
  const res = await request(key, "/v2/voices?page_size=100");
  const body = (await res.json()) as {
    voices: { voice_id: string; name: string; preview_url?: string; labels?: Record<string, string>; category?: string }[];
  };
  return body.voices.map((v) => ({
    id: v.voice_id,
    engine: "elevenlabs" as const,
    name: v.name,
    previewUrl: v.preview_url,
    tags: [v.labels?.language, v.labels?.accent, v.labels?.gender, v.labels?.use_case ?? v.labels?.descriptive].filter(Boolean) as string[],
  }));
}

export async function elevenCredits(key: string) {
  const res = await request(key, "/v1/user/subscription");
  const s = (await res.json()) as { character_count: number; character_limit: number; next_character_count_reset_unix?: number };
  return { used: s.character_count, limit: s.character_limit, resetsAt: s.next_character_count_reset_unix };
}

// Devuelve PCM para unirlo igual que los trozos de los motores gratuitos.
export async function synthEleven(
  key: string,
  text: string,
  voiceId: string,
  settings: SynthSettings,
  context: { previous?: string; next?: string },
): Promise<Pcm> {
  const v3 = settings.modelId === "eleven_v3";
  const res = await request(key, `/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "audio/mpeg" },
    body: JSON.stringify({
      text,
      model_id: settings.modelId,
      // v3 no acepta similitud ni velocidad, y su estabilidad va por pasos.
      voice_settings: v3
        ? { stability: settings.stability < 0.34 ? 0 : settings.stability < 0.67 ? 0.5 : 1 }
        : { stability: settings.stability, similarity_boost: settings.similarity, style: settings.style, speed: settings.speed },
      ...(v3 ? {} : { previous_text: context.previous, next_text: context.next }),
    }),
  });
  const mp3 = await res.arrayBuffer();
  const ctx = new OfflineAudioContext(1, 1, 44100);
  const decoded = await ctx.decodeAudioData(mp3);
  return { samples: decoded.getChannelData(0).slice(), sampleRate: decoded.sampleRate };
}
