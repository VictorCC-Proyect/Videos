// Short: Picos de glucosa y resistencia a la insulina.
// Del atleta (pan dulce + refresco) al intestino, al pancreas y a la membrana de la
// celula muscular: insulina, receptor, GLUT4, resistencia y contraccion sin insulina.
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { Polvo } from "../fisio/modelos/comun";
import { Vaso } from "../fisio/modelos/energia";
import { Humano } from "../fisio/modelos/cuerpo";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { ANTON, Chip, Dato, Destello, INTER, K, ShortDef, Titular } from "./marco";
import { Atleta, Frijoles, Pechuga, Piso, Plato } from "./modelos";
import { camViaje, cortesViaje, Viaje } from "./viaje";
import { EscenaCierre } from "./cierre";
import {
  Almidon,
  Brocoli,
  GLU,
  GLUT,
  GLUTS,
  Glucosa,
  Hoja,
  INS,
  ISLOTES,
  Llave,
  Manzana,
  Medidor,
  Membrana4,
  Mesa,
  Pancreas,
  PanDulce,
  REC,
  RECEPTORES,
  Refresco,
  VELLOS,
  Vellosidades,
} from "./modelos-glucosa";

// ---- Grafica 2D de glucosa en sangre -------------------------------------------

const g = (x: number, c: number, s: number) => Math.exp(-(((x - c) / s) ** 2));
const curvaPico = (x: number) => 88 + 100 * g(x, 0.25, 0.1) - 28 * g(x, 0.55, 0.12);
const curvaSuave = (x: number) => 88 + 38 * g(x, 0.36, 0.2);

const Grafica: React.FC<{
  b: number;
  a: number;
  z: number;
  prog: number;
  f: (x: number) => number;
  color: string;
  fantasma?: (x: number) => number;
  y?: number;
  alto?: number;
  caida?: number;
}> = ({ b, a, z, prog, f, color, fantasma, y = 260, alto = 380, caida = 0 }) => {
  const op = visible(b, a, z, 0.08);
  if (op <= 0) return null;
  const w = 960;
  const m = { l: 40, r: 40, t: 78, b: 40 };
  const X = (x: number) => m.l + x * (w - m.l - m.r);
  const Y = (v: number) => alto - m.b - ((v - 40) / 170) * (alto - m.t - m.b);
  const camino = (fn: (x: number) => number, hasta: number) => {
    const n = Math.max(2, Math.round(90 * hasta));
    return Array.from({ length: n + 1 })
      .map((_, i) => {
        const x = (i / n) * hasta;
        return `${i ? "L" : "M"}${X(x).toFixed(1)},${Y(fn(x)).toFixed(1)}`;
      })
      .join(" ");
  };
  const p = Math.max(0.001, prog);
  return (
    <div style={{ position: "absolute", left: 60, top: y, width: w, height: alto, opacity: op, transform: `scale(${0.94 + 0.06 * entre(b, a, a + 0.08)})` }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(4,14,17,0.84)", border: `4px solid ${color}`, borderRadius: 34, boxShadow: `0 0 50px ${color}44` }} />
      <div style={{ position: "absolute", left: 40, top: 20, fontFamily: INTER, fontWeight: 900, fontSize: 34, color: K.tinta, letterSpacing: 1 }}>GLUCOSA EN SANGRE</div>
      <svg width={w} height={alto} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={X(0)} x2={X(1)} y1={Y(88)} y2={Y(88)} stroke="#9fb8b4" strokeWidth={3} strokeDasharray="10 10" opacity={0.6} />
        <text x={X(1) - 4} y={Y(88) - 10} fill="#9fb8b4" fontFamily="InterV, Inter, sans-serif" fontWeight={700} fontSize={24} textAnchor="end">
          normal
        </text>
        {fantasma ? <path d={camino(fantasma, 1)} fill="none" stroke="#8a969a" strokeWidth={6} strokeDasharray="14 12" opacity={0.7} /> : null}
        <path d={camino(f, p)} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
        <circle cx={X(p)} cy={Y(f(p))} r={14} fill="#fff" stroke={color} strokeWidth={6} />
        {caida > 0 ? (
          <g opacity={caida}>
            <text x={X(0.55)} y={Y(f(0.55)) + 52} fill={K.rojo} fontFamily="Anton, Impact, sans-serif" fontSize={44} textAnchor="middle">
              CAÍDA
            </text>
            <text x={X(0.25)} y={Y(f(0.25)) - 18} fill={K.amarillo} fontFamily="Anton, Impact, sans-serif" fontSize={44} textAnchor="middle">
              PICO
            </text>
          </g>
        ) : null}
        <text x={X(1)} y={alto - 10} fill="#9fb8b4" fontFamily="InterV, Inter, sans-serif" fontWeight={700} fontSize={24} textAnchor="end">
          tiempo →
        </text>
      </svg>
    </div>
  );
};

// 0 · Gancho: pan dulce + refresco -> el medidor se dispara --------------------------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const sube = entre(b, 0.45, 0.75);
  const mg = Math.round(mix(88, 185, sube));
  const cam = camara(
    [
      { b: 0, p: [2.0, 1.4, 6.6], l: [0, 0.75, 0], fov: 36 },
      { b: 1, p: [-1.4, 1.3, 6.3], l: [0, 0.75, 0], fov: 36 },
    ],
    b,
  );
  const tope: V3 = [0.85, 0.06 + 1.5 * (0.35 + 0.6 * sube), 0];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <group rotation={[0.06 * (1 - sube), 0, 0]}>
          <Atleta ej="parado" brilla={0.1 + 0.6 * sube} colorBrillo={K.amarillo} />
        </group>
        <Piso color={sube > 0.5 ? K.rojo : K.lima} r={1.4} />
        <Mesa p={[-0.85, 0, 0.1]} alto={0.72} />
        <PanDulce p={[-0.95, 0.74, 0.12]} escala={0.32} giro={b * 0.5} />
        <Refresco p={[-0.7, 0.74, 0.05]} escala={0.75} />
        <Medidor p={[0.85, 0, 0]} nivel={0.35 + 0.6 * sube} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.95, 0.85, 0.12], t: "Pan dulce", a: 0.12, z: 0.5, o: [-30, -150], color: "#f7c873" },
          { p: [-0.7, 1.1, 0.05], t: "Refresco", a: 0.2, z: 0.5, o: [40, -170], color: K.rojo },
          { p: tope, t: `${mg} mg/dL`, a: 0.42, z: 1, o: [-60, -90], color: sube > 0.5 ? K.rojo : K.amarillo },
        ]}
      />
      <Chip b={b} a={0.04} z={0.42} t="¿SUEÑO DESPUÉS DE COMER?" x={540} y={330} color={K.morado} />
      <Titular b={b} a={0.6} z={1} y={280} tam={128} t={<>Pico de <span style={{ color: K.amarillo }}>glucosa</span></>} />
    </AbsoluteFill>
  );
};

// 1 · Intestino: carbohidratos -> glucosa -> sangre -------------------------------------
const STARCH: V3[] = [
  [-0.9, 2.1, 0.4],
  [0.8, 2.4, -0.2],
  [-0.1, 2.8, 0.6],
];

const Intestino: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuera = b < 0.22;
  const digiere = entre(b, 0.3, 0.5);
  const baja = entre(b, 0.52, 0.76);
  const fluye = lineal(b, 0.76, 1);
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [0.4, 1.25, 5.8], l: [0, 0.8, 0], fov: 36 },
          { b: 0.22, p: [0.05, 1.1, 1.7], l: [0, 1.05, 0], fov: 36 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.22, p: [0, 3.2, 11.8], l: [0, 0.8, 0], fov: 40 },
          { b: 0.5, p: [0.2, 2.8, 11.0], l: [0, 0.6, 0], fov: 40 },
          { b: 1, p: [-0.3, 2.0, 10.2], l: [0, 0.4, 0], fov: 40 },
        ],
        b,
      );
  // glucosas sueltas: cada una va a una vellosidad y luego al capilar
  const sueltas = STARCH.flatMap((c, k) =>
    [0, 1, 2, 3].map((i) => {
      const paso = 0.34 + digiere * 0.5;
      const ini: V3 = [c[0] + (i - 1.5) * paso, c[1] + (i % 2 ? 0.06 : -0.06) * (1 + digiere * 3), c[2]];
      const v = VELLOS[(k * 4 + i) % 7];
      const punta: V3 = [v[0], 1.7, v[2]];
      const base: V3 = [v[0], 0.1, v[2]];
      const d = Math.min(1, Math.max(0, baja * 1.4 - ((k * 4 + i) / 12) * 0.4));
      let q = d < 0.5 ? mix3(ini, punta, d * 2) : mix3(punta, base, (d - 0.5) * 2);
      if (fluye > 0) {
        const f = (fluye * 1.3 + (k * 4 + i) / 12) % 1;
        q = mix3(base, [mix(-3.4, 3.4, f), -0.75, 1.65], Math.min(1, fluye * 4));
      }
      return q;
    }),
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={fuera ? undefined : [10, 30]}>
        {fuera ? (
          <>
            <Atleta ej="parado" brilla={entre(b, 0.05, 0.2) * 0.8} colorBrillo={K.amarillo} />
            <Piso />
          </>
        ) : (
          <>
            <Vellosidades b={b} brillo={baja} />
            <Vaso desde={[-3.6, -0.75, 1.65]} hasta={[3.6, -0.75, 1.65]} t={b * 1.6} radio={0.34} />
            {digiere < 0.98
              ? STARCH.map((c, k) => <Almidon key={k} p={c} separa={digiere} />)
              : sueltas.map((q, i) => <Glucosa key={i} p={q} />)}
            <Polvo b={b} radio={6} color="#ffd9e0" />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.22]} />
      {fuera ? <Chip b={b} a={0.02} z={0.22} t="INTESTINO" x={540} y={330} color={K.rosa} /> : null}
      {!fuera ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: STARCH[1], t: digiere < 0.5 ? "Carbohidratos" : "Glucosa", a: 0.24, z: 0.6, o: [60, -110], color: GLU },
            { p: [VELLOS[5][0], 1.6, VELLOS[5][2]], t: "Vellosidades", a: 0.5, z: 0.8, o: [40, -120], color: "#ff9fb2" },
            { p: [-1.0, -0.75, 1.65], t: "Capilar → sangre", a: 0.76, z: 1, o: [-20, 130], color: K.rojo },
          ]}
        />
      ) : null}
      <Dato b={b} a={0.8} z={1} t="Glucosa en sangre ↑" color={GLU} y={260} tam={92} />
    </AbsoluteFill>
  );
};

// 2 · Pancreas libera insulina = llave ----------------------------------------------
const llavePos = (i: number, f: number): V3 => {
  const isl = ISLOTES[i % ISLOTES.length];
  const ini: V3 = [isl[0] * 0.7, isl[1] * 0.7 - 0.1, isl[2] * 0.7];
  const vaso: V3 = [ini[0], 1.0, 0.2];
  if (f < 0.4) return mix3(ini, vaso, f / 0.4);
  return [vaso[0] + (f - 0.4) * 6, 1.0 + Math.sin(f * 9 + i) * 0.08, 0.2];
};

const PancreasEsc: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const detecta = entre(b, 0.05, 0.25);
  const libera = lineal(b, 0.2, 1);
  const cam = camara(
    [
      { b: 0, p: [0.3, 1.0, 8.6], l: [0, 0.0, 0], fov: 40 },
      { b: 0.6, p: [-0.2, 0.8, 7.6], l: [0, 0.05, 0], fov: 40 },
      { b: 1, p: [0.5, 0.9, 6.2], l: [0.3, 0.3, 0], fov: 40 },
    ],
    b,
  );
  const nL = 12;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[7, 24]}>
        <group position={[0, -0.1, 0]} scale={0.7} rotation={[0.15, -0.25, 0.05]}>
          <Pancreas brillo={detecta * 0.6} islotes={detecta} />
        </group>
        <Vaso desde={[-3.4, 1.0, 0.2]} hasta={[3.4, 1.0, 0.2]} t={b * 1.4} radio={0.42} />
        {Array.from({ length: 6 }).map((_, i) => {
          const f = (b * 0.9 + i / 6) % 1;
          return <Glucosa key={`g${i}`} p={[mix(-3.3, 3.3, f), 1.0 + Math.sin(i * 2) * 0.12, 0.25]} />;
        })}
        {Array.from({ length: nL }).map((_, i) => {
          const f = libera * 2.2 - i / nL;
          if (f <= 0 || f > 1.05) return null;
          return <Llave key={i} p={llavePos(i, f)} escala={1.2} giro={Math.sin(b * 6 + i) * 0.4} />;
        })}
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-1.1, 0.1, 0.3], t: "Páncreas", a: 0.03, z: 0.55, o: [-40, 130], color: "#f4b08e" },
          { p: [ISLOTES[2][0] * 0.7, ISLOTES[2][1] * 0.7 - 0.1, ISLOTES[2][2] * 0.7], t: "Células beta", a: 0.12, z: 0.55, o: [60, 150], color: K.amarillo },
          { p: [-2.0, 1.15, 0.25], t: "Glucosa", a: 0.05, z: 0.4, o: [-20, -120], color: GLU },
          { p: llavePos(1, Math.min(1, Math.max(0.3, libera * 2.2 - 1 / nL))), t: "Insulina", a: 0.32, z: 0.95, o: [-60, -130], color: INS },
        ]}
      />
      <Dato b={b} a={0.5} z={1} t="Insulina = llave" sub="abre la célula a la glucosa" color={INS} y={260} tam={100} />
    </AbsoluteFill>
  );
};

// 3 · Musculo: insulina -> receptor -> GLUT4 sube -> entra la glucosa -------------------
const camMembrana = (b: number, a: number): ReturnType<typeof camara> =>
  camara(
    [
      { b: a, p: [0.8, 1.2, 12.4], l: [0, -0.2, 0], fov: 40 },
      { b: 1, p: [-0.7, 1.0, 11.6], l: [0, -0.2, 0], fov: 40 },
    ],
    b,
  );

const EtiqMembrana: React.FC<{ cam: ReturnType<typeof camara>; b: number; a: number }> = ({ cam, b, a }) => (
  <Etiquetas
    cam={cam}
    b={b}
    items={[
      { p: [RECEPTORES[0][0] - 0.2, 0.6, RECEPTORES[0][2]], t: "Receptor de insulina", a: a, z: 1, o: [-10, -200], color: REC },
      { p: [GLUTS[0][0], -0.1, GLUTS[0][2]], t: "GLUT4", a: a + 0.25, z: 1, o: [110, 150], color: GLUT },
      { p: [-1.6, -1.2, -1.0], t: "Interior de la célula muscular", a: a, z: 1, o: [-20, 90], color: "#ff8f9a" },
    ]}
  />
);

const Musculo: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const tv = lineal(b, 0, 0.28) * 0.71;
  const dentro = b >= 0.28;
  const insulina = entre(b, 0.3, 0.45);
  const unida = entre(b, 0.43, 0.5);
  const sube = entre(b, 0.5, 0.74);
  const entra = lineal(b, 0.74, 1);
  const cam = dentro ? camMembrana(b, 0.28) : camViaje(tv);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={dentro ? [9, 26] : undefined}>
        {dentro ? (
          <>
            <Membrana4 b={b} insulina={insulina} unida={unida} sube={sube} entra={entra} />
            <Polvo b={b} radio={5} />
          </>
        ) : (
          <Viaje t={tv} b={b} ej="parado" colorBrillo={K.lima} />
        )}
      </Escena3D>
      <Destello b={b} en={[...cortesViaje(0, 0.28 / 0.71).slice(0, 2), 0.28]} />
      {!dentro ? <Chip b={b} a={0.02} z={0.28} t="MÚSCULO" x={540} y={330} color={K.rojo} /> : null}
      {dentro ? <EtiqMembrana cam={cam} b={b} a={0.33} /> : null}
      {dentro ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [RECEPTORES[1][0], 1.3, RECEPTORES[1][2]], t: "Insulina", a: 0.33, z: 0.7, o: [60, -110], color: INS },
            { p: [GLUTS[2][0], 0.6, GLUTS[2][2]], t: "Glucosa entra", a: 0.78, z: 1, o: [60, -150], color: GLU },
          ]}
        />
      ) : null}
      <Chip b={b} a={0.33} z={1} t="SUPERFICIE DE LA CÉLULA" x={540} y={330} color={K.cian} />
    </AbsoluteFill>
  );
};

// 4 · Pico y caida: hambre y cansancio ------------------------------------------------
const Zzz: React.FC<{ b: number; a: number }> = ({ b, a }) => {
  const op = visible(b, a, 1.1, 0.06);
  if (op <= 0) return null;
  return (
    <>
      {[0, 1, 2].map((i) => {
        const f = ((b - a) * 2.5 + i / 3) % 1;
        return (
          <div key={i} style={{ position: "absolute", left: 640 + f * 120 + i * 10, top: 720 - f * 160, fontFamily: ANTON, fontSize: 50 + i * 16, color: K.morado, opacity: op * (1 - f) }}>
            Z
          </div>
        );
      })}
    </>
  );
};

const Caida: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const prog = lineal(b, 0.04, 0.72);
  const cansa = entre(b, 0.55, 0.8);
  const cam = camara(
    [
      { b: 0, p: [1.0, 1.45, 4.6], l: [0, 1.3, 0], fov: 36 },
      { b: 1, p: [-0.8, 1.4, 4.3], l: [0, 1.3, 0], fov: 36 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} luz={1 - cansa * 0.35}>
        <group rotation={[0.1 * cansa, 0, 0]}>
          <Humano
            musculo={0.8}
            brilla={mix(0.7, 0.05, cansa)}
            colorBrillo={K.amarillo}
            pose={{ hombroD: [0.05 * cansa, 0, 0.05], hombroI: [0.05 * cansa, 0, -0.05], codoD: -0.05, codoI: -0.05, caderaD: [0, 0, 0.04], caderaI: [0, 0, -0.04], rodillaD: 0, rodillaI: 0 }}
          />
        </group>
        <Piso />
      </Escena3D>
      <Grafica b={b} a={0.0} z={1} prog={prog} f={curvaPico} color={prog > 0.42 ? K.rojo : K.amarillo} caida={entre(b, 0.5, 0.6)} />
      <Zzz b={b} a={0.78} />
      <Chip b={b} a={0.68} z={1} t="HAMBRE" x={290} y={1100} color={K.naranja} />
      <Chip b={b} a={0.8} z={1} t="CANSANCIO" x={790} y={1100} color={K.morado} />
    </AbsoluteFill>
  );
};

// 5 · Anos: los receptores responden menos ----------------------------------------------
const Anos: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const apaga = entre(b, 0.15, 0.6);
  const cam = camMembrana(b, 0);
  const anos = Math.round(mix(1, 10, entre(b, 0.05, 0.55)));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[9, 26]}>
        <Membrana4 b={b} insulina={1} unida={1 - apaga} rebote={apaga > 0.5} apagado={apaga} sube={0.3} nGlut={1} entra={0} nGlu={14} />
        <Polvo b={b} radio={5} />
      </Escena3D>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(90,90,110,${0.35 * apaga}) 100%)` }} />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [RECEPTORES[0][0] - 0.2, 0.6, RECEPTORES[0][2]], t: apaga > 0.5 ? "Receptores “sordos”" : "Receptor de insulina", a: 0.05, z: 1, o: [-10, -200], color: apaga > 0.5 ? "#b0b6c0" : REC },
          { p: [0.9, 1.6, 0.3], t: "La glucosa se queda afuera", a: 0.62, z: 1, o: [-80, -150], color: GLU },
        ]}
      />
      <Dato b={b} a={0.03} z={1} t={`${anos} ${anos === 1 ? "año" : "años"}`} sub="de picos repetidos" color={K.naranja} y={250} tam={110} />
      <Chip b={b} a={0.4} z={1} t="SEDENTARISMO" x={290} y={1100} color="#b0b6c0" />
      <Chip b={b} a={0.5} z={1} t="GRASA ABDOMINAL" x={770} y={1100} color={K.naranja} />
    </AbsoluteFill>
  );
};

// 6 · Resistencia a la insulina: el pancreas trabaja de mas -> diabetes tipo 2 ----------
const Resistencia: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const esfuerzo = entre(b, 0.2, 0.6);
  const lat = 0.5 + 0.5 * Math.sin(b * 50);
  const cam = camara(
    [
      { b: 0, p: [-0.4, 1.0, 8.8], l: [0, 0.1, 0], fov: 40 },
      { b: 1, p: [0.6, 1.1, 7.8], l: [0, 0.15, 0], fov: 40 },
    ],
    b,
  );
  const nL = Math.round(mix(6, 26, esfuerzo));
  const nG = Math.round(mix(10, 26, entre(b, 0.1, 0.8)));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[7, 24]}>
        <group position={[0, -0.3, 0]} scale={0.7} rotation={[0.15, -0.25, 0.05]}>
          <Pancreas brillo={0.3 + esfuerzo * (0.6 + 0.6 * lat)} islotes={0.4 + esfuerzo * lat} />
        </group>
        <Vaso desde={[-3.4, 1.25, 0.2]} hasta={[3.4, 1.25, 0.2]} t={b * 1.0} radio={0.6} />
        {Array.from({ length: nG }).map((_, i) => {
          const f = (b * 0.35 + i / nG) % 1;
          return <Glucosa key={`g${i}`} p={[mix(-3.3, 3.3, f), 1.25 + Math.sin(i * 2.3) * 0.32, 0.2 + Math.cos(i * 1.7) * 0.3]} />;
        })}
        {Array.from({ length: nL }).map((_, i) => {
          const f = (b * 1.6 + i / nL) % 1;
          const isl = ISLOTES[i % ISLOTES.length];
          const ini: V3 = [isl[0] * 0.7, isl[1] * 0.7 - 0.3, isl[2] * 0.7];
          const q: V3 = f < 0.35 ? mix3(ini, [ini[0], 1.2, 0.3], f / 0.35) : [ini[0] + (f - 0.35) * 5, 1.2 + Math.sin(i) * 0.3, 0.3 + Math.cos(i) * 0.25];
          return <Llave key={i} p={q} escala={1.1} giro={Math.sin(b * 8 + i) * 0.5} />;
        })}
        <Polvo b={b} radio={6} />
      </Escena3D>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(255,60,60,${0.3 * entre(b, 0.65, 0.8)}) 100%)` }} />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-1.1, -0.1, 0.3], t: "Páncreas al límite", a: 0.25, z: 1, o: [-30, 150], color: "#f4b08e" },
          { p: [-2.0, 1.5, 0.3], t: "Glucosa alta", a: 0.15, z: 1, o: [-10, -150], color: GLU },
        ]}
      />
      <Titular b={b} a={0.02} z={0.66} y={250} tam={104} t={<>Resistencia a la <span style={{ color: INS }}>insulina</span></>} />
      <Chip b={b} a={0.3} z={1} t="+ INSULINA  + INSULINA" x={540} y={1100} color={INS} />
      <Dato b={b} a={0.68} z={1} t="→ Diabetes tipo 2" color={K.rojo} y={270} tam={104} />
    </AbsoluteFill>
  );
};

// 7 · Lo que ayuda: fibra y proteina primero, alimentos enteros, caminar ------------------
const Ayuda: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const plato = b < 0.6;
  const cae = (a: number) => entre(b, a, a + 0.08);
  const cam = plato
    ? camara(
        [
          { b: 0, p: [0, 2.9, 4.6], l: [0, -0.25, 0], fov: 38 },
          { b: 0.6, p: [0.8, 2.6, 4.3], l: [0, -0.2, 0], fov: 38 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.6, p: [2.4, 1.3, 7.6], l: [0, 1.0, 0], fov: 36 },
          { b: 1, p: [1.2, 1.2, 7.9], l: [0, 1.0, 0], fov: 36 },
        ],
        b,
      );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {plato ? (
          <>
            <Plato p={[0, 0, 0]} escala={1.5} />
            <group position={[0, mix(1.2, 0, cae(0.06)), 0]}>
              <Brocoli p={[-0.35, 0.05, 0.1]} escala={1.1} />
              <Brocoli p={[-0.2, 0.05, -0.25]} escala={1.0} />
              <Hoja p={[-0.45, 0.07, -0.2]} giro={0.5} escala={1.1} />
              <Hoja p={[-0.1, 0.07, 0.35]} giro={-0.3} />
            </group>
            <group position={[0, mix(1.2, 0, cae(0.14)), 0]}>
              <Pechuga p={[0.3, 0.1, -0.05]} escala={0.8} />
            </group>
            <group position={[0, mix(1.2, 0, cae(0.2)), 0]}>
              <Frijoles p={[0.15, 0.06, 0.38]} escala={0.6} />
            </group>
            <group position={[0, mix(1.2, 0, cae(0.36)), 0]} scale={cae(0.36)}>
              <Manzana p={[0.75, 0.15, 0.85]} escala={1.1} />
            </group>
          </>
        ) : (
          <>
            <Humano fase={b * 30} marcha={0.6} musculo={0.8} brilla={0.35} colorBrillo={K.lima} />
            <Piso r={1.0} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.6]} />
      {plato ? (
        <>
          <Dato b={b} a={0.04} z={0.6} t="1° fibra + proteína" sub="después los carbohidratos" color={K.lima} y={260} tam={92} />
          <Etiquetas
            cam={cam}
            b={b}
            items={[
              { p: [-0.35, 0.3, 0.1], t: "Fibra", a: 0.12, z: 0.6, o: [-40, -120], color: "#5cc34f" },
              { p: [0.3, 0.2, -0.05], t: "Proteína", a: 0.2, z: 0.6, o: [40, -150], color: "#f3dcc0" },
            ]}
          />
          <Chip b={b} a={0.38} z={0.6} t="ALIMENTOS ENTEROS" x={540} y={1100} color={K.naranja} />
        </>
      ) : (
        <>
          <Grafica b={b} a={0.6} z={1} prog={lineal(b, 0.62, 0.95)} f={curvaSuave} fantasma={curvaPico} color={K.lima} y={250} alto={340} />
          <Chip b={b} a={0.62} z={1} t="CAMINAR DESPUÉS DE COMER" x={540} y={1100} color={K.lima} />
        </>
      )}
    </AbsoluteFill>
  );
};

// 8 · Musculo en movimiento: GLUT4 sube sin insulina ----------------------------------------
const Movimiento: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const tv = lineal(b, 0, 0.3) * 0.71;
  const dentro = b >= 0.3;
  const n0 = tv < 0.28;
  const sube = entre(b, 0.36, 0.66);
  const entra = lineal(b, 0.64, 1);
  const cam = dentro ? camMembrana(b, 0.3) : camViaje(tv);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={dentro ? [9, 26] : undefined}>
        {dentro ? (
          <>
            <Membrana4 b={b} insulina={0} sube={sube} entra={entra} contrae={1} />
            <Polvo b={b} radio={5} />
          </>
        ) : n0 ? (
          <>
            <Humano fase={b * 30} marcha={0.6} musculo={0.8} brilla={entre(b, 0.03, 0.1) * 0.7} colorBrillo={K.lima} />
            <Piso />
          </>
        ) : (
          <Viaje t={tv} b={b} ej="parado" />
        )}
      </Escena3D>
      <Destello b={b} en={[...cortesViaje(0, 0.3 / 0.71).slice(0, 2), 0.3]} />
      {!dentro ? <Chip b={b} a={0.02} z={0.3} t="MÚSCULO EN MOVIMIENTO" x={540} y={330} color={K.lima} /> : null}
      {dentro ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [-1.2, -1.9, 0.2], t: "Contracción", a: 0.32, z: 1, o: [80, -40], color: "#ff8f9a" },
            { p: [GLUTS[0][0], -0.1, GLUTS[0][2]], t: "GLUT4", a: 0.55, z: 1, o: [110, 150], color: GLUT },
            { p: [RECEPTORES[0][0] - 0.2, 0.6, RECEPTORES[0][2]], t: "Receptor vacío", a: 0.34, z: 1, o: [-10, -200], color: REC },
          ]}
        />
      ) : null}
      {dentro ? <Dato b={b} a={0.32} z={1} t="Sin insulina" sub="la contracción sube los GLUT4" color={K.lima} y={250} tam={100} /> : null}
      <Chip b={b} a={0.7} z={1} t="✓ ENTRA LA GLUCOSA" x={540} y={1100} color={GLU} />
    </AbsoluteFill>
  );
};

const T = [
  "¿Ese sueño después de comer pan dulce con refresco? Es un **pico de glucosa**.",
  "Los carbohidratos se digieren en el intestino y llegan a la sangre como **glucosa**.",
  "El páncreas responde liberando **insulina**: la llave que abre las células para que la glucosa entre.",
  "En el músculo, la insulina lleva los transportadores **GLUT4** a la superficie, y por ahí entra la glucosa.",
  "Si comes muchos azúcares rápidos, la glucosa sube muy alto y luego **cae de golpe**: hambre y cansancio.",
  "Cuando esto se repite por años, junto con sedentarismo y grasa abdominal, las células **responden cada vez menos** a la insulina.",
  "Eso es la **resistencia a la insulina**: el páncreas tiene que producir más y más, y puede terminar en **diabetes tipo 2**.",
  "Lo que ayuda: comer **fibra y proteína** primero, preferir alimentos enteros y **caminar** después de comer.",
  "Porque el músculo en movimiento capta glucosa **incluso sin insulina**.",
  "Sígueme para más **nutrición explicada con ciencia**.",
];

const ESCENAS = [Gancho, Intestino, PancreasEsc, Musculo, Caida, Anos, Resistencia, Ayuda, Movimiento, EscenaCierre];

export const GLUCOSA: ShortDef = {
  id: "Short-Glucosa",
  titulo: "Picos de glucosa y resistencia a la insulina",
  planos: ESCENAS.map((Escena, i) => ({ id: `glucosa-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
