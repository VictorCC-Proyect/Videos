// Genera tokens.css a partir de tokens.json. Correr después de cada cambio de tokens:
//   node clonar/design/build-tokens.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const t = JSON.parse(readFileSync(join(aqui, "tokens.json"), "utf8"));

const vars = (colores) =>
  Object.entries(colores).map(([k, v]) => `  --c-${k}: ${v};`).join("\n");

const css = `/* Generado por build-tokens.mjs desde tokens.json. No editar a mano. */
:root {
${vars(t.color)}
  --font-sans: ${t.font.sans};
  --font-mono: ${t.font.mono};
${Object.entries(t.radius).map(([k, v]) => `  --r-${k}: ${v}px;`).join("\n")}
${Object.entries(t.shadow).map(([k, v]) => `  --shadow-${k}: ${v};`).join("\n")}
  --motion-fast: ${t.motion.fast};
  --motion-base: ${t.motion.base};
  --ease: ${t.motion.ease};
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  :root {
${vars(t["color-dark"]).replace(/^/gm, "  ")}
    color-scheme: dark;
  }
}
`;

writeFileSync(join(aqui, "tokens.css"), css);
writeFileSync(join(aqui, "../app/src/tokens.css"), css);
console.log("tokens.css escrito");
