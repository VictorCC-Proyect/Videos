// Parte un texto largo en trozos por debajo del límite del motor, sin cortar oraciones
// cuando se puede. Los párrafos siempre empiezan un trozo nuevo.
export function splitText(text: string, maxLen: number): string[] {
  const chunks: string[] = [];
  for (const para of text.split(/\n\s*\n+/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean)) {
    const sentences = para.match(/[^.!?…]+(?:[.!?…]+["'»”)]*|$)\s*/g) ?? [para];
    let current = "";
    for (const raw of sentences) {
      const s = raw.trim();
      if (!s) continue;
      if (s.length > maxLen) {
        if (current) chunks.push(current);
        current = "";
        chunks.push(...splitLong(s, maxLen));
      } else if (current && current.length + 1 + s.length > maxLen) {
        chunks.push(current);
        current = s;
      } else {
        current = current ? `${current} ${s}` : s;
      }
    }
    if (current) chunks.push(current);
  }
  return chunks;
}

// Una oración más larga que el límite: se corta en comas y, si una parte sigue
// siendo larga, en espacios. Luego se juntan las partes hasta llenar cada trozo.
function splitLong(s: string, maxLen: number): string[] {
  const pieces = s.split(/(?<=[,;:])\s+/).flatMap((clause) => (clause.length > maxLen ? clause.split(/\s+/) : [clause]));
  const out: string[] = [];
  let current = "";
  for (const piece of pieces) {
    if (current && current.length + 1 + piece.length > maxLen) {
      out.push(current);
      current = piece;
    } else {
      current = current ? `${current} ${piece}` : piece;
    }
  }
  if (current) out.push(current);
  return out;
}
