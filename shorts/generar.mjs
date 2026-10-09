// Arma el index.html (HyperFrames) de un short vertical a partir de:
//   <short>/guion.json        textos narrados (uno por beat; **negritas** = resaltado)
//   <short>/audio/tiempos.json duracion de cada narracion (lo escribe voz.py)
//   <short>/escenas.html      <style> + escenas con data-beat="i" o "i-j" + <script> de animacion
// En el <script> de escenas existen: tl (timeline GSAP), B[i] inicio del beat i, D[i] duracion,
// T duracion total. Uso: node shorts/generar.mjs shorts/creatina [shorts/ardor ...]
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const AQUI = path.dirname(new URL(import.meta.url).pathname);
const CANAL = JSON.parse(fs.readFileSync(path.join(AQUI, "canal.json"), "utf8"));
const W = 1080;
const H = 1920;
const ANTES = 0.15; // silencio antes de cada narracion
const DESPUES = 0.4; // respiro despues de cada narracion
const CRUCE = 0.3; // solape entre escenas (fundido cruzado)
const r3 = (x) => Math.round(x * 1000) / 1000;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Divide la narracion en bloques cortos de subtitulo, con su tiempo estimado por caracteres.
function bloques(texto, a0, dur) {
  const palabras = texto.split(/\s+/).filter(Boolean);
  let resaltando = false;
  const items = palabras.map((p) => {
    const abre = p.startsWith("**");
    if (abre) resaltando = true;
    const limpio = p.replace(/\*\*/g, "");
    const res = resaltando;
    if (p.replace(/[.,:;?!¿¡…]+$/, "").endsWith("**") || (abre && p.slice(2).includes("**"))) resaltando = false;
    const pausa = /[.?!…]$/.test(limpio) ? 7 : /[,:;]$/.test(limpio) ? 4 : 0;
    return { t: limpio, res, peso: limpio.length + 1 + pausa, corta: pausa > 0 };
  });
  const grupos = [];
  let g = [];
  for (const it of items) {
    g.push(it);
    const chars = g.reduce((a, x) => a + x.t.length + 1, 0);
    if (it.corta || g.length >= 3 || chars >= 15) {
      grupos.push(g);
      g = [];
    }
  }
  if (g.length) grupos.push(g);
  const total = items.reduce((a, x) => a + x.peso, 0);
  let acc = 0;
  return grupos.map((gr) => {
    const ini = a0 + (acc / total) * dur;
    acc += gr.reduce((a, x) => a + x.peso, 0);
    return { ini: r3(ini), html: gr.map((x) => (x.res ? `<em>${esc(x.t)}</em>` : esc(x.t))).join(" ") };
  });
}

function generar(dir) {
  const guion = JSON.parse(fs.readFileSync(path.join(dir, "guion.json"), "utf8"));
  const tiempos = JSON.parse(fs.readFileSync(path.join(dir, "audio/tiempos.json"), "utf8"));
  const fuente = fs.readFileSync(path.join(dir, "escenas.html"), "utf8");
  if (tiempos.length !== guion.beats.length) throw new Error(`${dir}: guion y audio no coinciden; corre voz.py`);

  // Audio en mp3 (mas ligero que wav)
  tiempos.forEach((_, i) => {
    const wav = path.join(dir, `audio/b${String(i).padStart(2, "0")}.wav`);
    const mp3 = wav.replace(/\.wav$/, ".mp3");
    if (fs.existsSync(wav) && (!fs.existsSync(mp3) || fs.statSync(mp3).mtimeMs < fs.statSync(wav).mtimeMs)) {
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", wav, "-ac", "1", "-b:a", "96k", mp3]);
    }
  });
  fs.mkdirSync(path.join(dir, "fonts"), { recursive: true });
  for (const f of ["Anton.woff2", "Inter.woff2"]) fs.copyFileSync(path.join(AQUI, "comun/fonts", f), path.join(dir, "fonts", f));
  fs.copyFileSync(path.join(AQUI, "comun/gsap.min.js"), path.join(dir, "gsap.min.js"));

  const B = [];
  const D = [];
  let t = 0;
  tiempos.forEach((d) => {
    B.push(r3(t));
    D.push(r3(ANTES + d + DESPUES));
    t += ANTES + d + DESPUES;
  });
  const T = r3(t + 0.6);
  const fin = (j) => (j === D.length - 1 ? T : r3(B[j] + D[j] + CRUCE));

  const estilo = [...fuente.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
  const script = [...fuente.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join("\n");
  let cuerpo = fuente.replace(/<style>[\s\S]*?<\/style>/g, "").replace(/<script>[\s\S]*?<\/script>/g, "").trim();
  const escenas = [];
  cuerpo = cuerpo.replace(/data-beat="(\d+)(?:-(\d+))?"/g, (_, a, b) => {
    const i = +a;
    const j = b === undefined ? i : +b;
    escenas.push({ i, j });
    return `data-start="${B[i]}" data-duration="${r3(fin(j) - B[i])}" data-track-index="1"`;
  });

  const subs = [];
  guion.beats.forEach((txt, i) => {
    const bl = bloques(txt, B[i] + ANTES, tiempos[i]);
    bl.forEach((b, k) => subs.push({ ...b, fin: k + 1 < bl.length ? bl[k + 1].ini : r3(B[i] + ANTES + tiempos[i] + 0.25) }));
  });

  const audios = tiempos
    .map(
      (d, i) =>
        `<audio id="voz${i}" src="audio/b${String(i).padStart(2, "0")}.mp3" data-start="${r3(B[i] + ANTES)}" data-duration="${r3(d)}" data-track-index="9" data-volume="1"></audio>`,
    )
    .join("\n      ");

  const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>${esc(guion.titulo)}</title>
    <script src="gsap.min.js"></script>
    <style>
      @font-face { font-family: "Anton"; src: url("fonts/Anton.woff2") format("woff2"); font-weight: 400; }
      @font-face { font-family: "Inter"; src: url("fonts/Inter.woff2") format("woff2"); font-weight: 100 900; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #061317; }
      :root {
        --fondo: #061317; --fondo2: #0c2a2f; --tinta: #f4f7f2; --suave: #9fb8b4;
        --lima: #c6f432; --naranja: #ff8a3d; --cian: #43e0ff; --rosa: #ff5c8a; --rojo: #ff4d4d; --morado: #a78bfa;
      }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; font-family: "Inter", sans-serif; color: var(--tinta); background: var(--fondo); }
      .clip { position: absolute; inset: 0; }
      #fondo { background: radial-gradient(120% 80% at 50% 30%, var(--fondo2) 0%, var(--fondo) 70%); overflow: hidden; }
      #fondo .mancha { position: absolute; width: 900px; height: 900px; border-radius: 50%; filter: blur(140px); opacity: 0.32; }
      #m1 { left: -300px; top: 120px; background: var(--cian); }
      #m2 { right: -360px; top: 820px; background: var(--lima); opacity: 0.22; }
      #fondo .puntos { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,0.07) 2px, transparent 2.5px); background-size: 46px 46px; }
      .escena { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 300px 70px 760px; gap: 34px; text-align: center; }
      .titular { font-family: "Anton", sans-serif; font-size: 132px; line-height: 0.98; letter-spacing: 0.5px; text-transform: uppercase; }
      .medio { font-family: "Anton", sans-serif; font-size: 92px; line-height: 1; text-transform: uppercase; }
      .chico { font-size: 44px; font-weight: 700; color: var(--suave); line-height: 1.25; }
      .fila { display: flex; gap: 26px; align-items: center; justify-content: center; flex-wrap: wrap; }
      .chip { font-weight: 800; font-size: 40px; padding: 16px 30px; border-radius: 999px; background: rgba(255,255,255,0.08); border: 3px solid rgba(255,255,255,0.18); }
      .tarjeta { background: rgba(9,30,34,0.82); border: 3px solid rgba(255,255,255,0.12); border-radius: 36px; padding: 36px 44px; box-shadow: 0 30px 80px rgba(0,0,0,0.45); }
      .circ { width: 220px; height: 220px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: "Anton", sans-serif; font-size: 70px; color: #071316; }
      .lima { color: var(--lima); } .naranja { color: var(--naranja); } .cian { color: var(--cian); } .rosa { color: var(--rosa); } .rojo { color: var(--rojo); }
      #subs { pointer-events: none; }
      .sub { position: absolute; left: 60px; right: 60px; top: 1190px; text-align: center; font-weight: 900; font-size: 76px; line-height: 1.08; letter-spacing: -0.5px; text-transform: uppercase; color: #fff; opacity: 0; -webkit-text-stroke: 14px #04090b; paint-order: stroke fill; text-shadow: 0 10px 30px rgba(0,0,0,0.55); }
      .sub em { font-style: normal; color: var(--lima); }
      #marca { display: flex; justify-content: center; align-items: flex-start; padding-top: 205px; pointer-events: none; }
      #marca span { font-weight: 800; font-size: 34px; letter-spacing: 1px; color: rgba(244,247,242,0.78); background: rgba(4,12,14,0.45); border: 2px solid rgba(198,244,50,0.45); padding: 10px 26px; border-radius: 999px; }
      #barra { top: auto; height: 10px; bottom: 0; background: rgba(255,255,255,0.08); }
      #barra i { display: block; height: 100%; width: 100%; background: linear-gradient(90deg, var(--cian), var(--lima)); transform-origin: 0 50%; }
${estilo}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${T}" data-width="${W}" data-height="${H}">
      <div id="fondo" class="clip" data-start="0" data-duration="${T}" data-track-index="0">
        <div class="mancha" id="m1"></div>
        <div class="mancha" id="m2"></div>
        <div class="puntos"></div>
      </div>
${cuerpo}
      <div id="subs" class="clip" data-start="0" data-duration="${T}" data-track-index="5">
        ${subs.map((s, k) => `<div class="sub" id="sub${k}">${s.html}</div>`).join("\n        ")}
      </div>
      <div id="marca" class="clip" data-start="0" data-duration="${T}" data-track-index="6"><span>${esc(CANAL.handle)}</span></div>
      <div id="barra" class="clip" data-start="0" data-duration="${T}" data-track-index="7"><i id="barra-i"></i></div>
      ${audios}
    </div>
    <script>
      const B = ${JSON.stringify(B)};
      const D = ${JSON.stringify(D)};
      const T = ${T};
      const CANAL = ${JSON.stringify(CANAL)};
      const tl = gsap.timeline({ paused: true });
      // Fondo vivo y barra de progreso
      tl.fromTo("#m1", { x: 0, y: 0 }, { x: 260, y: 380, duration: T, ease: "sine.inOut" }, 0);
      tl.fromTo("#m2", { x: 0, y: 0 }, { x: -300, y: -420, duration: T, ease: "sine.inOut" }, 0);
      tl.fromTo("#barra-i", { scaleX: 0 }, { scaleX: 1, duration: T, ease: "none" }, 0);
      // Entrada y salida de cada escena (fundido cruzado)
      ${JSON.stringify(escenas.map(({ i, j }) => [B[i], fin(j), j === D.length - 1]))}.forEach(([a, b, ultima], k) => {
        const el = document.querySelectorAll(".escena")[k];
        if (!el) return;
        tl.fromTo(el, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }, a);
        if (!ultima) tl.to(el, { opacity: 0, scale: 0.96, duration: ${CRUCE}, ease: "power2.in" }, b - ${CRUCE});
      });
      // Subtitulos
      ${JSON.stringify(subs.map((s) => [s.ini, s.fin]))}.forEach(([a, b], k) => {
        const el = "#sub" + k;
        tl.fromTo(el, { opacity: 0, scale: 0.82, y: 18 }, { opacity: 1, scale: 1, y: 0, duration: 0.18, ease: "back.out(2.5)" }, a);
        tl.set(el, { opacity: 0 }, b);
      });
${script}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
  fs.writeFileSync(path.join(dir, "index.html"), html);
  console.log(`${dir}: ${T}s, ${tiempos.length} beats, ${subs.length} subtitulos, ${escenas.length} escenas`);
}

for (const d of process.argv.slice(2)) generar(d);
