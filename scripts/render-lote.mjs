// Renderiza automaticamente cada video definido en videos.json.
// Uso: npm run lote            (o: node scripts/render-lote.mjs otro-archivo.json)
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const listPath = process.argv[2] ?? "videos.json";
const videos = JSON.parse(readFileSync(listPath, "utf8"));
const extraArgs = process.env.REMOTION_ARGS ?? "";
mkdirSync("out", { recursive: true });

for (const [i, video] of videos.entries()) {
  const output = `out/${video.archivo}.mp4`;
  // Las props van en un archivo para evitar problemas de comillas en Windows.
  const propsFile = join(tmpdir(), `remotion-props-${i}.json`);
  writeFileSync(propsFile, JSON.stringify(video.props ?? {}));
  console.log(`\n[${i + 1}/${videos.length}] ${output}`);
  execSync(
    `npx remotion render ${video.composicion ?? "HelloWorld"} "${output}" --props="${propsFile}" ${extraArgs}`,
    { stdio: "inherit" },
  );
}

console.log(`\nListo: ${videos.length} video(s) en la carpeta out/`);
