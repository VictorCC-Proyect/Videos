// Short: Cortisol: ¿enemigo o aliado?
// Del atleta al cerebro y las suprarrenales, el higado, el adipocito y la fibra muscular.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Cam, camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { Polvo, rnd } from "../fisio/modelos/comun";
import { Cadena, Higado, Mol, Vaso } from "../fisio/modelos/energia";
import { CilindroX } from "../fisio/modelos/musculo";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaCierre } from "./cierre";
import { Chip, Dato, Destello, INTER, K, Sello, ShortDef, Titular } from "./marco";
import { Atleta, InteriorFibra, Piso, Proteina, Rinones } from "./modelos";
import { Adipocito, Cerebro } from "./modelos-ayuno";
import { Glucosa, GLU, mezcla } from "./modelos-glucosa";
import { ACTH, CapsulaAnti, Cama, CORT, Estrellas, FrascoAnti, Luna, MolCortisol, Sol, Suprarrenales, SUPRA } from "./modelos-cortisol";

const GRASO = "#ffb000";
const HIGADO = "#e88a7a";

// ---- Curva diaria de cortisol (0-24 h) ------------------------------------------
const g = (x: number, c: number, s: number) => Math.exp(-(((x - c) / s) ** 2));
/** Ritmo normal: sube de madrugada, pico al despertar, baja durante el dia, minimo de noche. */
const normal = (x: number) => {
  const h = x * 24;
  return h < 7.5 ? 12 + 78 * g(h, 7.5, 2.3) : 12 + 78 * Math.exp(-(h - 7.5) / 4.5);
};
/** Cortisol cronicamente alto: no baja ni por la tarde ni de noche. */
const alto = (x: number) => {
  const h = x * 24;
  return h < 7.5 ? 52 + 40 * g(h, 7.5, 2.3) : 55 + 37 * Math.exp(-(h - 7.5) / 3);
};

const Curva: React.FC<{
  b: number;
  a: number;
  z: number;
  prog: number;
  f: (x: number) => number;
  color?: string;
  fantasma?: (x: number) => number;
  y?: number;
  alto?: number;
  desde?: number;
  nota?: { x: number; t: string; color: string; op: number };
}> = ({ b, a, z, prog, f, color = CORT, fantasma, y = 400, alto: hh = 300, desde = 0, nota }) => {
  const op = visible(b, a, z, 0.08);
  if (op <= 0) return null;
  const w = 960;
  const m = { l: 40, r: 40, t: 70, b: 52 };
  const X = (x: number) => m.l + x * (w - m.l - m.r);
  const Y = (v: number) => hh - m.b - (v / 100) * (hh - m.t - m.b);
  const camino = (fn: (x: number) => number, ini: number, fin: number) => {
    const n = Math.max(2, Math.round(90 * (fin - ini)));
    return Array.from({ length: n + 1 })
      .map((_, i) => {
        const x = ini + ((fin - ini) * i) / n;
        return `${i ? "L" : "M"}${X(x).toFixed(1)},${Y(fn(x)).toFixed(1)}`;
      })
      .join(" ");
  };
  const p = Math.max(desde + 0.001, prog);
  return (
    <div style={{ position: "absolute", left: 60, top: y, width: w, height: hh, opacity: op, transform: `scale(${0.94 + 0.06 * entre(b, a, a + 0.08)})` }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(4,14,17,0.84)", border: `4px solid ${color}`, borderRadius: 34, boxShadow: `0 0 50px ${color}44` }} />
      <div style={{ position: "absolute", left: 40, top: 18, fontFamily: INTER, fontWeight: 900, fontSize: 32, color: K.tinta, letterSpacing: 1 }}>CORTISOL EN 24 H</div>
      <svg width={w} height={hh} style={{ position: "absolute", left: 0, top: 0 }}>
        {/* noche */}
        <rect x={X(0)} y={m.t - 6} width={X(6 / 24) - X(0)} height={hh - m.t - m.b + 6} fill="#4f8dff" opacity={0.12} />
        <rect x={X(22 / 24)} y={m.t - 6} width={X(1) - X(22 / 24)} height={hh - m.t - m.b + 6} fill="#4f8dff" opacity={0.12} />
        {fantasma ? <path d={camino(fantasma, 0, 1)} fill="none" stroke="#8a969a" strokeWidth={6} strokeDasharray="14 12" opacity={0.7} /> : null}
        <path d={camino(f, desde, p)} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
        <circle cx={X(p)} cy={Y(f(p))} r={13} fill="#fff" stroke={color} strokeWidth={6} />
        {[0, 6, 12, 18, 24].map((h) => (
          <text key={h} x={X(h / 24)} y={hh - 14} fill="#9fb8b4" fontFamily="InterV, Inter, sans-serif" fontWeight={700} fontSize={24} textAnchor="middle">
            {h === 0 ? "0 h" : `${h}:00`}
          </text>
        ))}
        {nota && nota.op > 0 ? (
          <text x={X(nota.x)} y={Y(f(nota.x)) - 24} fill={nota.color} opacity={nota.op} fontFamily="Anton, Impact, sans-serif" fontSize={40} textAnchor="middle">
            {nota.t}
          </text>
        ) : null}
      </svg>
    </div>
  );
};

const camAtleta = (b: number, a = 0, z = 1, ly = 0.6): Cam =>
  camara(
    [
      { b: a, p: [2.4, 1.3, 6.4], l: [0, ly, 0], fov: 36 },
      { b: z, p: [-2.0, 1.2, 6.1], l: [0, ly, 0], fov: 36 },
    ],
    b,
  );

// 0 · Gancho: amanece, el atleta despierta y el cortisol sube -----------------------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const sale = entre(b, 0.05, 0.85);
  const cam = camara(
    [
      { b: 0, p: [2.2, 1.1, 7.0], l: [0, 0.35, 0], fov: 36 },
      { b: 1, p: [-1.4, 1.0, 6.4], l: [0, 0.35, 0], fov: 36 },
    ],
    b,
  );
  const fondo = mezcla("#0a1630", "#b8642e", sale);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={fondo} luz={mix(0.55, 1.05, sale)}>
        <Estrellas op={1 - sale} />
        <Sol p={[1.3, mix(-1.2, 2.1, sale), -5]} r={0.7} />
        <Atleta ej="parado" brilla={0.1 + 0.35 * entre(b, 0.55, 0.8)} colorBrillo={CORT} />
        <Piso color={CORT} brillo={0.2 + 0.4 * sale} />
        {Array.from({ length: 6 }).map((_, i) => {
          const k = lineal(b, 0.55 + i * 0.05, 0.85 + i * 0.05);
          if (k <= 0) return null;
          const ini: V3 = [0.12 * (i % 2 ? 1 : -1), 1.05, 0.1];
          const fin: V3 = [(rnd(`g${i}`) - 0.5) * 1.6, 0.6 + rnd(`h${i}`) * 1.4, 0.5];
          return <MolCortisol key={i} p={mix3(ini, fin, k)} escala={0.45} op={Math.min(1, k * 4)} giro={b * 3 + i} />;
        })}
      </Escena3D>
      <Titular b={b} a={0.03} z={1.2} y={250} tam={120} t="Cortisol" color={CORT} />
      <Curva b={b} a={0.08} z={1.2} y={400} alto={250} prog={mix(0.02, 0.34, sale)} f={normal} nota={{ x: 0.32, t: "PICO AL DESPERTAR", color: K.amarillo, op: entre(b, 0.8, 0.9) }} />
      <Chip b={b} a={0.6} z={1.2} t="TE DESPIERTA" x={540} y={1100} color={CORT} />
    </AbsoluteFill>
  );
};

// 1 · Eje cerebro -> suprarrenales -> cortisol ----------------------------------------
const Eje: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuera = b < 0.16;
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [0.6, 1.4, 5.8], l: [0, 1.0, 0], fov: 36 },
          { b: 0.16, p: [0.05, 1.68, 0.75], l: [0, 1.66, 0], fov: 36 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.16, p: [0, 0.6, 14], l: [0, -0.4, 0], fov: 40 },
          { b: 1, p: [-1.4, 0.4, 13.2], l: [0, -0.4, 0], fov: 40 },
        ],
        b,
      );
  const cer: V3 = [0, 2.7, 0];
  const hip: V3 = [0, 2.2, 0.35];
  const rin: V3 = [0, -1.6, 0];
  const sup = (l: number): V3 => [rin[0] + l * 0.68, rin[1] + 0.95, 0.3];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={fuera ? undefined : [9, 26]}>
        {fuera ? (
          <>
            <Atleta ej="parado" brilla={0.15} />
            <Piso />
          </>
        ) : (
          <>
            <Cerebro p={cer} escala={1.0} brillo={0.1} giro={-0.25 + b * 0.5} />
            {/* hipotalamo e hipofisis */}
            <Mol p={hip} color={ACTH} r={0.13} brillo={0.6 + 1.2 * entre(b, 0.6, 0.66) * (0.5 + 0.5 * Math.sin(b * 60))} />
            <Mol p={[0, 1.95, 0.4]} color={ACTH} r={0.1} brillo={0.8} />
            {/* vaso que baja hasta los rinones */}
            <Vaso desde={[0, 1.7, 0.1]} hasta={[0, -1.0, 0.1]} t={b * 1.2} radio={0.3} />
            <group position={rin} scale={0.8}>
              <Rinones brillo={0.02} />
              <Suprarrenales brillo={0.6 * entre(b, 0.7, 0.8)} />
            </group>
            {/* senal (ACTH) que baja por la sangre */}
            {Array.from({ length: 6 }).map((_, i) => {
              const k = lineal(b, 0.58 + i * 0.025, 0.74 + i * 0.025);
              if (k <= 0 || k >= 1) return null;
              const l = i % 2 ? 1 : -1;
              const p = k < 0.8 ? mix3([0, 1.8, 0.35], [0, rin[1] + 1.0, 0.35], k / 0.8) : mix3([0, rin[1] + 1.0, 0.35], sup(l), (k - 0.8) / 0.2);
              return <Mol key={i} p={p} color={ACTH} r={0.08} />;
            })}
            {/* cortisol que sale de las suprarrenales */}
            {Array.from({ length: 10 }).map((_, i) => {
              const a = 0.76 + (i >> 1) * 0.035;
              const k = lineal(b, a, a + 0.3);
              if (k <= 0) return null;
              const l = i % 2 ? 1 : -1;
              const fin: V3 = [l * (0.8 + rnd(`cx${i}`) * 1.4), rin[1] + 1.1 + rnd(`cy${i}`) * 2.2, 0.8];
              return <MolCortisol key={`c${i}`} p={mix3(sup(l), fin, k)} escala={0.6} op={Math.min(1, k * 5)} giro={b * 4 + i} />;
            })}
            <Polvo b={b} radio={6} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.16]} />
      {!fuera ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [-0.6, 2.5, 0.4], t: "Cerebro", a: 0.2, z: 0.55, o: [-60, -80], color: "#ff8fb0" },
            { p: hip, t: "Hipotálamo-hipófisis", a: 0.5, z: 1, o: [60, -110], color: ACTH },
            { p: [0, 0.6, 0.35], t: "Señal (ACTH)", a: 0.62, z: 0.8, o: [60, 0], color: ACTH },
            { p: [rin[0] - 0.7, rin[1] + 0.85, 0.3], t: "Suprarrenales", a: 0.32, z: 1, o: [-40, 130], color: SUPRA },
            { p: [rin[0] + 0.7, rin[1] - 0.4, 0.3], t: "Riñones", a: 0.4, z: 0.75, o: [40, 110], color: "#d26a73" },
            { p: [1.3, rin[1] + 2.4, 0.8], t: "Cortisol", a: 0.82, z: 1, o: [60, -70], color: CORT },
          ]}
        />
      ) : null}
      <Dato b={b} a={0.18} z={1.2} t="Suprarrenales" sub="encima de los riñones" color={SUPRA} y={250} tam={96} />
    </AbsoluteFill>
  );
};

// 2 · Ejercicio: cortisol -> higado suelta glucosa, adipocito suelta grasa -------------
const Ejercicio: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuera = b < 0.22;
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [2.4, 1.3, 6.4], l: [0, 0.6, 0], fov: 36 },
          { b: 0.22, p: [0.3, 1.1, 2.0], l: [0, 1.05, 0], fov: 36 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.22, p: [0, 0.2, 16.5], l: [0, -0.6, 0], fov: 40 },
          { b: 1, p: [0.9, 0.1, 15.5], l: [0, -0.6, 0], fov: 40 },
        ],
        b,
      );
  const hig: V3 = [-1.3, 1.6, -0.6];
  const ad: V3 = [1.25, 1.55, 0];
  const vy = 0;
  const llega = entre(b, 0.25, 0.4);
  const suelta = entre(b, 0.4, 0.95);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={fuera ? undefined : [9, 28]}>
        {fuera ? (
          <>
            <Atleta ej="sprint" fase={b * 40} brilla={0.2 + 0.4 * entre(b, 0.1, 0.2)} colorBrillo={CORT} />
            <Piso color={CORT} />
          </>
        ) : (
          <>
            <group position={hig} scale={0.8}>
              <Higado brillo={0.08 + 0.25 * suelta} />
            </group>
            <Adipocito p={ad} r={0.9} gota={mix(0.72, 0.55, suelta)} brillo={0.15 * suelta} />
            <Vaso desde={[-3.2, vy, 0]} hasta={[3.2, vy, 0]} t={b * 1.2} radio={0.5} />
            <group position={[0, -1.6, -0.3]}>
              <CilindroX radio={0.6} largo={6} x={3} color="#c03a46" estriado={6} emisivo={0.35 * entre(b, 0.7, 0.95)} />
            </group>
            {/* cortisol en la sangre que llega a higado y adipocito */}
            {Array.from({ length: 6 }).map((_, i) => {
              const f = (b * 0.5 + i / 6) % 1;
              const enVaso: V3 = [mix(-3, 3, f), vy + 0.2 + Math.sin(i * 1.9) * 0.15, 0.35];
              const dest: V3 = i % 2 ? [hig[0] + 0.3, hig[1] - 0.5, 0.5] : [ad[0] - 0.3, ad[1] - 0.7, 0.6];
              const k = i < 4 ? entre(b, 0.28 + i * 0.03, 0.4 + i * 0.03) : 0;
              return <MolCortisol key={i} p={mix3(enVaso, dest, k * 0.85)} escala={0.38 * llega + 0.001} giro={b * 3 + i} op={llega} />;
            })}
            {/* glucosa: higado -> sangre -> musculo */}
            {Array.from({ length: 6 }).map((_, i) => {
              const a = 0.42 + i * 0.07;
              const k = lineal(b, a, a + 0.36);
              if (k <= 0 || k >= 1) return null;
              const p0: V3 = [hig[0] + 0.3 + (rnd(`gl${i}`) - 0.5) * 0.6, hig[1] - 0.4, 0.7];
              const p1: V3 = [-1.6 + i * 0.35, vy - 0.1, 0.5];
              const p2: V3 = [-1.8 + i * 0.4, -1.1, 0.7];
              const p = k < 0.5 ? mix3(p0, p1, k * 2) : mix3(p1, p2, (k - 0.5) * 2);
              return <Glucosa key={`g${i}`} p={p} escala={1.1} />;
            })}
            {/* acidos grasos: adipocito -> sangre -> musculo */}
            {Array.from({ length: 6 }).map((_, i) => {
              const a = 0.46 + i * 0.07;
              const k = lineal(b, a, a + 0.36);
              if (k <= 0 || k >= 1) return null;
              const p0: V3 = [ad[0] - 0.4, ad[1] - 0.7, 0.5];
              const p1: V3 = [1.6 - i * 0.3, vy - 0.15, 0.4];
              const p2: V3 = [1.8 - i * 0.4, -1.1, 0.7];
              const p = k < 0.5 ? mix3(p0, p1, k * 2) : mix3(p1, p2, (k - 0.5) * 2);
              return <Cadena key={`a${i}`} n={7} p={[p[0] - 0.35, p[1], p[2]]} color={GRASO} sep={0.11} brillo={0.6} />;
            })}
            <Polvo b={b} radio={6} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.22]} />
      {!fuera ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [0.2, vy + 0.3, 0.4], t: "Cortisol", a: 0.26, z: 0.55, o: [40, -150], color: CORT },
            { p: [hig[0] - 0.4, hig[1] + 0.4, 0], t: "Hígado", a: 0.4, z: 1, o: [-20, -80], color: HIGADO },
            { p: [-1.0, vy - 0.1, 0.5], t: "Glucosa", a: 0.5, z: 1, o: [-30, 120], color: GLU },
            { p: [ad[0] + 0.5, ad[1] + 0.6, 0], t: "Grasa", a: 0.62, z: 1, o: [20, -80], color: GRASO },
            { p: [1.6, -1.6, 0.6], t: "Músculo", a: 0.75, z: 1, o: [20, 110], color: K.rojo },
          ]}
        />
      ) : null}
      <Dato b={b} a={0.3} z={1.2} t="Energía para entrenar" color={K.lima} y={250} tam={84} />
    </AbsoluteFill>
  );
};

// 3 · Problema: se queda alto todo el dia ---------------------------------------------
const Problema: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camAtleta(b, 0, 1, 0.42);
  const rojo = entre(b, 0.3, 0.6);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={mezcla("#0c2a2f", "#3a1018", rojo)}>
        <Atleta ej="parado" brilla={0.15 + rojo * (0.3 + 0.15 * Math.sin(b * 25) ** 2)} colorBrillo={K.rojo} />
        <Piso color={K.rojo} />
        {Array.from({ length: 8 }).map((_, i) => {
          const f = (b * 0.4 + i / 8) % 1;
          const a = (i / 8) * Math.PI * 2 + b * 1.5;
          return <MolCortisol key={i} p={[Math.cos(a) * 1.0, 0.3 + f * 1.7, Math.sin(a) * 0.6]} escala={0.4} op={entre(b, 0.1, 0.25)} giro={b * 3 + i} />;
        })}
      </Escena3D>
      <Curva
        b={b}
        a={0.02}
        z={1.2}
        y={250}
        alto={320}
        prog={mix(0.3, 1, entre(b, 0.05, 0.4))}
        desde={0}
        f={alto}
        color={K.rojo}
        fantasma={normal}
        nota={{ x: 0.75, t: "ALTO TODO EL DÍA", color: K.rojo, op: entre(b, 0.35, 0.45) }}
      />
      <Chip b={b} a={0.5} z={1.2} t="POCO SUEÑO" x={290} y={1010} color={K.amarillo} />
      <Chip b={b} a={0.62} z={1.2} t="ESTRÉS" x={790} y={1010} color={K.amarillo} />
      <Chip b={b} a={0.75} z={1.2} t="DIETA MUY ESTRICTA" x={540} y={1100} color={K.amarillo} />
    </AbsoluteFill>
  );
};

// 4 · Cronico: proteina muscular se desarma + adipocito abdominal crece ----------------
const PROTS: V3[] = [
  [-1.4, 0.8, 1.6],
  [1.2, 1.4, 1.4],
  [0.1, -0.6, 1.9],
  [-1.0, -2.2, 1.5],
  [1.4, -1.6, 1.4],
];
const Cronico: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fibra = b < 0.6;
  const cam = fibra
    ? camara(
        [
          { b: 0, p: [0, 0.3, 14], l: [0, -0.7, 0], fov: 40 },
          { b: 0.6, p: [0.6, 0.2, 10.8], l: [0, -0.7, 0], fov: 40 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.6, p: [0, 0.3, 9.5], l: [0, -0.5, 0], fov: 40 },
          { b: 1, p: [-0.8, 0.3, 8.6], l: [0, -0.5, 0], fov: 40 },
        ],
        b,
      );
  const crece = entre(b, 0.65, 1);
  const adC: V3 = [0, 0.6, 0];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 28]}>
        {fibra ? (
          <>
            <InteriorFibra b={b} pcr={0} brillo={0.05} />
            {PROTS.map((p, i) => (
              <Proteina key={i} p={p} n={12} escala={1.5} desarma={entre(b, 0.25 + i * 0.05, 0.45 + i * 0.05)} giro={b * 1.5 + i} seed={`cp${i}`} />
            ))}
            {Array.from({ length: 7 }).map((_, i) => {
              const k = lineal(b, 0.02 + i * 0.03, 0.3 + i * 0.03);
              const ini: V3 = [i % 2 ? 4 : -4, 2 - i * 0.6, 1.8];
              const fin: V3 = [(rnd(`fx${i}`) - 0.5) * 3.2, (rnd(`fy${i}`) - 0.5) * 4, 2.1];
              return <MolCortisol key={`c${i}`} p={mix3(ini, fin, k)} escala={0.6} giro={b * 3 + i} op={entre(b, 0, 0.08)} />;
            })}
          </>
        ) : (
          <>
            <Adipocito p={adC} r={mix(1.3, 1.75, crece)} gota={mix(0.6, 0.85, crece)} brillo={0.15 * crece} />
            {Array.from({ length: 8 }).map((_, i) => {
              const a = 0.62 + i * 0.04;
              const k = lineal(b, a, a + 0.18);
              if (k <= 0 || k >= 1) return null;
              const ang = (i / 8) * Math.PI * 2;
              const ini: V3 = [Math.cos(ang) * 3.2, adC[1] + Math.sin(ang) * 3.2, 1];
              const p = mix3(ini, [adC[0] + Math.cos(ang) * 0.6, adC[1] + Math.sin(ang) * 0.6, 0.6], k);
              return i % 2 ? <Glucosa key={i} p={p} escala={1.2} /> : <Cadena key={i} n={7} p={[p[0] - 0.35, p[1], p[2]]} color={GRASO} sep={0.11} brillo={0.6} />;
            })}
          </>
        )}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Destello b={b} en={[0.6]} />
      {fibra ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [2.6, 2.0, 1.8], t: "Cortisol alto", a: 0.08, z: 0.4, o: [-60, -120], color: CORT },
            { p: PROTS[1], t: "Proteína muscular", a: 0.3, z: 0.6, o: [-40, -130], color: K.lima },
            { p: [0.1, -0.6, 2.0], t: "Aminoácidos", a: 0.45, z: 0.6, o: [60, 160], color: K.cian },
          ]}
        />
      ) : (
        <Etiquetas cam={cam} b={b} items={[{ p: [adC[0] + 1.0, adC[1] + 1.0, 0.4], t: "Adipocito abdominal", a: 0.66, z: 1, o: [-30, -130], color: GRASO }]} />
      )}
      <Dato b={b} a={0.05} z={0.6} t="Proteína muscular ↓" sub="se degrada" color={K.rojo} y={250} tam={84} />
      <Dato b={b} a={0.6} z={1.2} t="Grasa abdominal ↑" sub="cortisol alto crónico" color={GRASO} y={250} tam={84} />
      <Chip b={b} a={0.68} z={1.2} t="APETITO ↑" x={300} y={1100} color={K.amarillo} />
      <Chip b={b} a={0.84} z={1.2} t="GRASA ABDOMINAL ↑" x={720} y={1100} color={GRASO} />
    </AbsoluteFill>
  );
};

// 5 · Lo que lo regula: dormir, comer, descansar, manejar estres ------------------------
const Regula: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [1.6, 2.6, 5.4], l: [0, 0.05, 0], fov: 36 },
      { b: 1, p: [-1.4, 2.5, 5.0], l: [0, 0.05, 0], fov: 36 },
    ],
    b,
  );
  const respira = Math.sin(b * 18) * 0.02;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo="#0a1630" luz={0.75}>
        <Estrellas />
        <Luna p={[1.6, 2.3, -3.5]} r={0.35} />
        <Cama />
        {/* atleta acostado boca arriba, cabeza hacia la almohada */}
        <group position={[0.75, 0.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <group rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, 1 + respira]}>
            <Atleta ej="parado" brilla={0.12} colorBrillo={K.cian} musculo={0.8} />
          </group>
        </group>
        {/* Zzz */}
        {Array.from({ length: 3 }).map((_, i) => {
          const f = (b * 2 + i / 3) % 1;
          return <Mol key={i} p={[-0.9 + f * 0.5, 0.75 + f * 1.0, 0.2]} color="#9fb8ff" r={0.05 + f * 0.04} op={1 - f} />;
        })}
      </Escena3D>
      <Curva b={b} a={0.02} z={1.2} y={250} alto={300} prog={mix(0.35, 1, entre(b, 0.05, 0.6))} desde={0} f={normal} color={K.cian} nota={{ x: 0.92, t: "BAJA DE NOCHE", color: K.cian, op: entre(b, 0.55, 0.65) }} />
      <Chip b={b} a={0.1} z={1.2} t="DORMIR 7–9 H" x={290} y={1010} color={K.cian} />
      <Chip b={b} a={0.42} z={1.2} t="COMER SUFICIENTE" x={760} y={1010} color={K.lima} />
      <Chip b={b} a={0.58} z={1.2} t="DESCANSOS" x={290} y={1100} color={K.lima} />
      <Chip b={b} a={0.76} z={1.2} t="MANEJAR ESTRÉS" x={760} y={1100} color={K.lima} />
    </AbsoluteFill>
  );
};

// 6 · Suplementos "anticortisol": NO -------------------------------------------------
const Suplementos: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.8, 1.2, 4.2], l: [0, 0.35, 0], fov: 36 },
      { b: 1, p: [-0.6, 1.1, 3.8], l: [0, 0.35, 0], fov: 36 },
    ],
    b,
  );
  const tacha = entre(b, 0.55, 0.68);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={mezcla("#0c2a2f", "#3a1018", tacha)}>
        <FrascoAnti p={[0, 0, 0]} escala={1} tacha={tacha} giro={Math.sin(b * 3) * 0.25 * (1 - tacha)} />
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2 + b * 1.6;
          return <CapsulaAnti key={i} p={[Math.cos(a) * 0.9, 0.25 + Math.sin(a * 2) * 0.12 + i * 0.06, Math.sin(a) * 0.6]} rot={[a, a * 0.7, 0.6]} escala={1.3} />;
        })}
        <Piso color={tacha > 0 ? K.rojo : CORT} r={0.9} />
      </Escena3D>
      <Titular b={b} a={0.03} z={1.2} y={260} tam={104} t="¿Anticortisol?" color={CORT} />
      <Sello b={b} a={0.58} z={1.2} t="NO" y={1000} />
    </AbsoluteFill>
  );
};

const T = [
  "El **cortisol** no es tu enemigo: es la hormona que te **despierta** cada mañana.",
  "Lo producen las **glándulas suprarrenales**, encima de los riñones, cuando tu cerebro detecta estrés.",
  "Durante el ejercicio, el cortisol ayuda a liberar **glucosa** y grasa para darte energía.",
  "El problema es cuando se queda **alto todo el día**: poco sueño, estrés constante o dietas demasiado estrictas.",
  "El cortisol alto por mucho tiempo favorece la degradación de **proteína muscular**, aumenta el apetito y la **grasa abdominal**.",
  "Lo que lo regula: **dormir** de 7 a 9 horas, comer suficiente, entrenar con descansos y manejar el estrés.",
  "Y no, no necesitas suplementos **anticortisol**.",
  "Sígueme para más **nutrición explicada con ciencia**.",
];

const ESCENAS = [Gancho, Eje, Ejercicio, Problema, Cronico, Regula, Suplementos, EscenaCierre];

export const CORTISOL: ShortDef = {
  id: "Short-Cortisol",
  titulo: "Cortisol: ¿enemigo o aliado?",
  planos: ESCENAS.map((Escena, i) => ({ id: `cortisol-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
