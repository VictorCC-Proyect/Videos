// Marco de los shorts verticales (1080x1920): escena 3D a pantalla completa,
// subtitulos grandes sincronizados con la voz, marca del canal y barra de progreso.
import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  Series,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { durPlano, durTexto, durVoz, entre, FADE, FPS, PlanoDef, V3, visible } from "../fisio/motor";
import { Narracion } from "../fisio/ui";
import canal from "../../shorts/canal.json";

export const W = 1080;
export const H = 1920;
export const ANTON = '"Anton", "Impact", sans-serif';
export const INTER = '"InterV", "Inter", "Segoe UI", Arial, sans-serif';
export const K = {
  fondo: "#061317",
  fondo2: "#0c2a2f",
  tinta: "#f4f7f2",
  suave: "#9fb8b4",
  lima: "#c6f432",
  naranja: "#ff8a3d",
  cian: "#43e0ff",
  rosa: "#ff5c8a",
  rojo: "#ff4d4d",
  morado: "#a78bfa",
  amarillo: "#ffd23f",
};

export type ShortDef = { id: string; titulo: string; planos: PlanoDef[] };
export const durShort = (s: ShortDef) => s.planos.reduce((a, p) => a + durPlano(p), 0);

// ---- Fuentes -------------------------------------------------------------

const CSS_FUENTES = `
@font-face { font-family: "Anton"; src: url("${staticFile("fonts/Anton.woff2")}") format("woff2"); font-weight: 400; }
@font-face { font-family: "InterV"; src: url("${staticFile("fonts/Inter.woff2")}") format("woff2"); font-weight: 100 900; }
`;

const Fuentes: React.FC = () => {
  const [h] = useState(() => delayRender("fuentes"));
  useEffect(() => {
    Promise.all([document.fonts.load(`40px "Anton"`), document.fonts.load(`900 40px "InterV"`)])
      .catch(() => undefined)
      .finally(() => continueRender(h));
  }, [h]);
  return <style>{CSS_FUENTES}</style>;
};

// ---- Utilidades de animacion ---------------------------------------------

/** Rebote de entrada (0..1 con sobreimpulso). */
export const pop = (b: number, a: number, dur = 0.12) => {
  const t = Math.min(1, Math.max(0, (b - a) / dur));
  const c = 2.2;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

/** Gira un punto 90 grados en Z: los modelos horizontales (eje X) quedan de pie. */
export const deEje = ([x, y, z]: V3): V3 => [-y, x, z];

// ---- Graficos encima del 3D ---------------------------------------------

/** Texto grande que entra con rebote entre los beats a y z. */
export const Titular: React.FC<{
  b: number;
  a: number;
  z: number;
  t: React.ReactNode;
  y?: number;
  tam?: number;
  color?: string;
  giro?: number;
}> = ({ b, a, z, t, y = 300, tam = 130, color = K.tinta, giro = 0 }) => {
  const op = visible(b, a, z, 0.08);
  if (op <= 0) return null;
  const s = pop(b, a);
  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        right: 40,
        top: y,
        textAlign: "center",
        fontFamily: ANTON,
        fontSize: tam,
        lineHeight: 1,
        textTransform: "uppercase",
        color,
        opacity: op,
        transform: `scale(${s}) rotate(${giro}deg)`,
        WebkitTextStroke: "10px #04090b",
        paintOrder: "stroke fill",
        textShadow: "0 12px 40px rgba(0,0,0,0.6)",
      }}
    >
      {t}
    </div>
  );
};

/** Sello tipo "NO" / "MITO" que cae sobre la pantalla. */
export const Sello: React.FC<{ b: number; a: number; z: number; t: string; y?: number; color?: string }> = ({
  b,
  a,
  z,
  t,
  y = 470,
  color = K.rojo,
}) => {
  const op = visible(b, a, z, 0.05);
  if (op <= 0) return null;
  const k = Math.min(1, Math.max(0, (b - a) / 0.07));
  const s = interpolate(k, [0, 1], [2.6, 1]);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", opacity: op * k }}>
      <div
        style={{
          fontFamily: ANTON,
          fontSize: 170,
          lineHeight: 1,
          color,
          border: `14px solid ${color}`,
          borderRadius: 30,
          padding: "4px 50px",
          background: "rgba(6,19,23,0.55)",
          transform: `scale(${s}) rotate(-10deg)`,
        }}
      >
        {t}
      </div>
    </div>
  );
};

/** Pastilla con un dato (ej. "+20–40 %"). */
export const Dato: React.FC<{
  b: number;
  a: number;
  z: number;
  t: React.ReactNode;
  sub?: string;
  x?: number;
  y?: number;
  color?: string;
  tam?: number;
}> = ({ b, a, z, t, sub, x, y = 250, color = K.lima, tam = 96 }) => {
  const op = visible(b, a, z, 0.08);
  if (op <= 0) return null;
  const s = pop(b, a);
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: x ?? 0,
        right: x === undefined ? 0 : undefined,
        display: "flex",
        justifyContent: "center",
        opacity: op,
        transform: `scale(${s})`,
      }}
    >
      <div
        style={{
          background: "rgba(4,14,17,0.82)",
          border: `4px solid ${color}`,
          borderRadius: 34,
          padding: "16px 40px",
          textAlign: "center",
          boxShadow: `0 0 50px ${color}55`,
        }}
      >
        <div style={{ fontFamily: ANTON, fontSize: tam, lineHeight: 1.05, color }}>{t}</div>
        {sub ? <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 34, color: K.tinta, marginTop: 4 }}>{sub}</div> : null}
      </div>
    </div>
  );
};

/** Chip pequeno (nombre de algo que aparece en 3D, fijo en pantalla). */
export const Chip: React.FC<{ b: number; a: number; z: number; t: string; x: number; y: number; color?: string }> = ({
  b,
  a,
  z,
  t,
  x,
  y,
  color = K.lima,
}) => {
  const op = visible(b, a, z, 0.08);
  if (op <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${pop(b, a)})`,
        opacity: op,
        fontFamily: INTER,
        fontWeight: 900,
        fontSize: 38,
        color: "#061317",
        background: color,
        padding: "10px 26px",
        borderRadius: 999,
        whiteSpace: "nowrap",
        boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
      }}
    >
      {t}
    </div>
  );
};

export const Destello: React.FC<{ b: number; en: number[]; color?: string }> = ({ b, en, color = "#fff" }) => {
  const op = Math.max(0, ...en.map((k) => 1 - Math.abs(b - k) / 0.035));
  return <AbsoluteFill style={{ background: color, opacity: op * 0.6 }} />;
};

// ---- Subtitulos estilo TikTok --------------------------------------------

type Bloque = { ini: number; fin: number; partes: { t: string; res: boolean }[] };

const bloques = (texto: string, desde: number, dur: number): Bloque[] => {
  let resaltando = false;
  const items = texto
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => {
      const abre = p.startsWith("**");
      if (abre) resaltando = true;
      const limpio = p.replace(/\*\*/g, "");
      const res = resaltando;
      if (p.replace(/[.,:;?!¿¡…]+$/, "").endsWith("**") || (abre && p.slice(2).includes("**"))) resaltando = false;
      const pausa = /[.?!…]$/.test(limpio) ? 7 : /[,:;]$/.test(limpio) ? 4 : 0;
      return { t: limpio, res, peso: limpio.length + 1 + pausa, corta: pausa > 0 };
    });
  const grupos: (typeof items)[] = [];
  let g: typeof items = [];
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
  const out = grupos.map((gr) => {
    const ini = desde + (acc / total) * dur;
    acc += gr.reduce((a, x) => a + x.peso, 0);
    return { ini, fin: 0, partes: gr.map((x) => ({ t: x.t, res: x.res })) };
  });
  out.forEach((o, i) => (o.fin = i + 1 < out.length ? out[i + 1].ini : desde + dur + 8));
  return out;
};

const Subtitulos: React.FC<{ textos: string[] }> = ({ textos }) => {
  const frame = useCurrentFrame();
  let inicio = 0;
  const todos: Bloque[] = [];
  textos.forEach((t) => {
    todos.push(...bloques(t, inicio + 4, durVoz(t) * FPS));
    inicio += durTexto(t);
  });
  const act = todos.find((x) => frame >= x.ini && frame < x.fin);
  if (!act) return null;
  const k = Math.min(1, (frame - act.ini) / 5);
  const s = interpolate(k, [0, 0.7, 1], [0.8, 1.06, 1]);
  return (
    <div
      style={{
        position: "absolute",
        left: 50,
        right: 50,
        top: 1210,
        textAlign: "center",
        fontFamily: INTER,
        fontWeight: 900,
        fontSize: 78,
        lineHeight: 1.08,
        letterSpacing: -0.5,
        textTransform: "uppercase",
        color: "#fff",
        WebkitTextStroke: "14px #04090b",
        paintOrder: "stroke fill",
        textShadow: "0 10px 30px rgba(0,0,0,0.55)",
        opacity: k,
        transform: `scale(${s})`,
      }}
    >
      {act.partes.map((p, i) => (
        <span key={i} style={{ color: p.res ? K.lima : "#fff" }}>
          {i ? " " : ""}
          {p.t}
        </span>
      ))}
    </div>
  );
};

// ---- Composicion ---------------------------------------------------------

const PlanoVertical: React.FC<{ plano: PlanoDef }> = ({ plano }) => {
  const frame = useCurrentFrame();
  const dur = durPlano(plano);
  const op = Math.min(
    interpolate(frame, [0, FADE], [0, 1], { extrapolateRight: "clamp" }),
    interpolate(frame, [dur - FADE, dur], [1, 0], { extrapolateLeft: "clamp" }),
  );
  const E = plano.Escena;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: op, transform: `scale(${1.04 - 0.04 * op})` }}>
        <E textos={plano.textos} />
      </AbsoluteFill>
      <Subtitulos textos={plano.textos} />
      <Narracion textos={plano.textos} />
    </AbsoluteFill>
  );
};

const Marca: React.FC = () => (
  <div style={{ position: "absolute", top: 200, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
    <span
      style={{
        fontFamily: INTER,
        fontWeight: 800,
        fontSize: 34,
        letterSpacing: 1,
        color: "rgba(244,247,242,0.85)",
        background: "rgba(4,12,14,0.5)",
        border: "2px solid rgba(198,244,50,0.5)",
        padding: "10px 26px",
        borderRadius: 999,
      }}
    >
      {canal.handle}
    </span>
  </div>
);

const Barra: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10, background: "rgba(255,255,255,0.08)" }}>
      <div style={{ height: "100%", width: `${(frame / durationInFrames) * 100}%`, background: `linear-gradient(90deg, ${K.cian}, ${K.lima})` }} />
    </div>
  );
};

export const ShortVista: React.FC<{ short: ShortDef }> = ({ short }) => (
  <AbsoluteFill style={{ background: K.fondo }}>
    <Fuentes />
    <Series>
      {short.planos.map((p) => (
        <Series.Sequence key={p.id} durationInFrames={durPlano(p)} name={p.id}>
          <PlanoVertical plano={p} />
        </Series.Sequence>
      ))}
    </Series>
    <Marca />
    <Barra />
  </AbsoluteFill>
);

/** Cierre comun de todos los shorts: personaje 3D + nombre del canal. */
export const Cierre: React.FC<{ b: number }> = ({ b }) => (
  <>
    <Titular b={b} a={0.02} z={1.2} y={250} tam={160} t={canal.nombre.split(".")[0]} />
    <Titular b={b} a={0.06} z={1.2} y={420} tam={104} color={K.lima} t={"." + (canal.nombre.split(".")[1] ?? "")} />
    <div style={{ position: "absolute", top: 1030, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: entre(b, 0.15, 0.3) }}>
      <div
        style={{
          fontFamily: INTER,
          fontWeight: 900,
          fontSize: 56,
          color: "#071316",
          background: K.lima,
          padding: "26px 70px",
          borderRadius: 999,
          boxShadow: `0 0 60px ${K.lima}99`,
          transform: `scale(${1 + 0.06 * Math.sin(b * 25)})`,
        }}
      >
        SÍGUEME
      </div>
    </div>
    <div
      style={{
        position: "absolute",
        top: 1480,
        left: 120,
        right: 120,
        textAlign: "center",
        fontFamily: INTER,
        fontWeight: 600,
        fontSize: 30,
        color: K.suave,
        opacity: entre(b, 0.2, 0.35),
      }}
    >
      Contenido educativo. No sustituye la consulta con un profesional de la salud.
    </div>
  </>
);
