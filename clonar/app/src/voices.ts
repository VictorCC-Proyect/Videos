import type { EngineId, Voice } from "./engines/types";

// Voces que trae cada motor gratuito. Las de ElevenLabs se leen de la cuenta del usuario.
// Esta lista vive aparte de los motores para que la página no cargue los modelos al abrir.
const supertonic: Voice[] = ["F1", "F2", "F3", "F4", "F5", "M1", "M2", "M3", "M4", "M5"].map((id) => ({
  id,
  engine: "supertonic",
  name: `${id.startsWith("F") ? "Femenina" : "Masculina"} ${id.slice(1)}`,
  tags: ["31 idiomas", id.startsWith("F") ? "Femenina" : "Masculina"],
}));

const kokoro: Voice[] = [
  { id: "ef_dora", engine: "kokoro", name: "Dora", tags: ["Español", "Femenina"] },
  { id: "em_alex", engine: "kokoro", name: "Álex", tags: ["Español", "Masculina"] },
  { id: "em_santa", engine: "kokoro", name: "Santa", tags: ["Español", "Masculina"] },
];

export const builtinVoices: Record<Exclude<EngineId, "elevenlabs">, Voice[]> = { supertonic, kokoro };
