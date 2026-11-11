// Short: Fibras rápidas y lentas. Parte 3: qué decide el tipo de fibra y hasta dónde puede cambiar.
// Fuentes: Andersen y Aagaard 2000 (Muscle Nerve), Schiaffino et al. 2025 (Cold Spring Harb Perspect Biol), Coletti et al. 2022 (Eur J Transl Myol).
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { Polvo } from "../fisio/modelos/comun";
import { Mol } from "../fisio/modelos/energia";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaComentarios } from "./cierre";
import { ANTON, Chip, Dato, Destello, INTER, K, pop, ShortDef, Titular } from "./marco";
import { Atleta, Piso } from "./modelos";
import { emisiones, llegada, Tren, Velocimetro } from "./modelos-calambres";
import { F1FilaMiosina, F2_COL, F2Fibra, F2Pesa, F2Tacha } from "./modelos-fibras";
import { Ribosoma } from "./modelos-hipertrofia";
import { Barra3D, Calendario, Rotulos } from "./modelos-sueno";
import {
  F3_ROJO_TXT,
  F3Corte,
  f3CeldaLenta,
  f3CeldaRapida,
  F3FibraHibrida,
  f3Mezcla,
  F3Miosina,
  F3Nervio,
  f3NCeldas,
  F3Nucleo,
  F3Placa,
  F3Soma,
} from "./modelos-fibras3";
import { camViaje, Viaje } from "./viaje";

const ROJO = F3_ROJO_TXT;
const CA = "#7dffb0"; // iones de calcio

// ---- Barra de porcentaje de IIx (HTML) --------------------------------------------------
const MAXP = 20;
const BarraPct: React.FC<{ b: number; a: number; z: number; valor: number; titulo: string; y?: number; marca?: { v: number; t: string } }> = ({
  b,
  a,
  z,
  valor,
  titulo,
  y = 250,
  marca,
}) => {
  const op = visible(b, a, z, 0.08);
  if (op <= 0) return null;
  const ancho = 820;
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: (1080 - ancho) / 2,
        width: ancho,
        opacity: op,
        transform: `scale(${pop(b, a)})`,
        background: "rgba(4,14,17,0.82)",
        border: `4px solid ${F2_COL.IIx}`,
        borderRadius: 30,
        padding: "16px 30px 22px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 40, color: K.tinta }}>{titulo}</div>
        <div style={{ fontFamily: ANTON, fontSize: 92, lineHeight: 1, color: F2_COL.IIx }}>{Math.round(valor)} %</div>
      </div>
      <div style={{ position: "relative", height: 44, marginTop: 12, borderRadius: 22, background: "rgba(255,255,255,0.1)" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${Math.min(1, valor / MAXP) * 100}%`,
            borderRadius: 22,
            background: F2_COL.IIx,
            boxShadow: `0 0 26px ${F2_COL.IIx}`,
          }}
        />
        {marca ? (
          <div style={{ position: "absolute", left: `${(marca.v / MAXP) * 100}%`, top: -14, bottom: -14, borderLeft: `5px dashed ${K.amarillo}` }}>
            <div
              style={{
                position: "absolute",
                top: -40,
                left: 0,
                transform: "translateX(-50%)",
                fontFamily: INTER,
                fontWeight: 900,
                fontSize: 28,
                color: K.amarillo,
                whiteSpace: "nowrap",
              }}
            >
              {marca.t}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// 0 · Gancho: atleta -> corte del muslo (I, IIa, IIx) -------------------------------------
const C0_R = 1.15;
const C0_I = f3CeldaLenta([-0.45, 0.45], C0_R);
const C0_IIa = f3CeldaRapida(30, C0_R);
const C0_IIx = f3CeldaRapida(2, C0_R);

const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const A = 0.42;
  const fuera = b < A;
  const t = Math.pow(lineal(b, 0.04, A), 1.5) * 0.275;
  const cam = fuera
    ? camViaje(t)
    : camara(
        [
          { b: A, p: [0.5, 0.1, 10.0], l: [0, -0.25, 0], fov: 40 },
          { b: 1, p: [-0.4, 0.0, 9.2], l: [0, -0.25, 0], fov: 40 },
        ],
        b,
      );
  const y0 = -0.05;
  const en = (q: V3): V3 => [q[0], q[1] + y0, q[2]];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2} niebla={fuera ? undefined : [6, 20]}>
        {fuera ? (
          <Viaje t={t} b={b} ej="parado" colorBrillo={ROJO} />
        ) : (
          <>
            <F3Corte p={[0, y0, 0]} r={C0_R} lentas={0.45} iix={0.2} brillaIIx={entre(b, 0.6, 0.68) * (1 - entre(b, 0.9, 1))} />
            <Polvo b={b} radio={5} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[A]} />
      <Chip b={b} a={0.0} z={A} t="FIBRAS MUSCULARES · PARTE 3" x={540} y={330} color={K.lima} />
      {!fuera ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: en(C0_I), t: "Lenta · I", a: A + 0.03, z: 1, o: [-90, -120], color: ROJO },
            { p: en(C0_IIa), t: "IIa", a: A + 0.07, z: 1, o: [90, -110], color: F2_COL.IIa },
            { p: en(C0_IIx), t: "Rápida · IIx", a: A + 0.11, z: 1, o: [-40, 150], color: F2_COL.IIx },
          ]}
        />
      ) : null}
      <Titular b={b} a={0.6} z={1} y={290} tam={120} t={<>¿Hasta dónde <span style={{ color: K.lima }}>cambian</span>?</>} />
    </AbsoluteFill>
  );
};

// 1 · La miosina define el tipo: tres miosinas a distinta velocidad -------------------------
const FILAS = [
  { y: 0.75, color: ROJO, vel: 1.8, t: "Miosina I · lenta" },
  { y: -0.25, color: F2_COL.IIa, vel: 3.6, t: "Miosina IIa" },
  { y: -1.25, color: F2_COL.IIx, vel: 6.4, t: "Miosina IIx · rápida" },
];

const Miosinas: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.3, 0.0, 11.2], l: [0, -0.62, 0], fov: 40 },
      { b: 1, p: [-0.3, -0.1, 10.8], l: [0, -0.62, 0], fov: 40 },
    ],
    b,
  );
  const arranca = (k: number) => Math.max(0, b - 0.04 - k * 0.03);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {FILAS.map((f, i) => (
          <F1FilaMiosina key={i} p={[0, f.y, 0]} fase={arranca(i) * f.vel} color={f.color} paso={0.06} />
        ))}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={FILAS.map((f, i) => ({ p: [-1.0, f.y, 0.1] as V3, t: f.t, a: 0.06 + i * 0.05, z: 1.2, o: [0, 70] as [number, number], color: f.color }))}
      />
      <Rotulos
        cam={cam}
        b={b}
        items={FILAS.map((f, i) => ({
          p: [1.45, f.y + 0.3, 0] as V3,
          t: `${Math.floor(arranca(i) * f.vel * 5)} ATP`,
          a: 0.42,
          z: 1.2,
          color: K.naranja,
          tam: 40,
          ancla: "der" as const,
          anton: true,
        }))}
      />
      <Dato b={b} a={0.03} z={1.2} t="LA MIOSINA DEFINE EL TIPO" sub="MHC I · IIa · IIx" color={K.lima} y={250} tam={72} />
      <Chip b={b} a={0.5} z={1.2} t="GASTO DE ATP: I < IIa < IIx" x={540} y={1110} color={K.naranja} />
    </AbsoluteFill>
  );
};

// 2 · La neurona decide: inervación cruzada ------------------------------------------------
const SL: V3 = [-0.85, 1.5, 0];
const SR: V3 = [0.85, 1.5, 0];
const FX = 0.85;
const FIB_Y = -0.55;
const PL = (x: number): V3 => [x, 0.25, 0.3];
const RECTO = (s: V3, tam: number): V3[] => [[s[0], s[1] - tam, 0], [s[0], 1.0, 0.04], [s[0], 0.6, 0.18], PL(s[0])];
const CRUZ_L: V3[] = [[SL[0], SL[1] - 0.13, 0], [SL[0], 1.05, 0.04], [-0.3, 0.85, 0.2], [0.55, 0.5, 0.3], PL(FX)];
const CRUZ_R: V3[] = [[SR[0], SR[1] - 0.22, 0], [SR[0], 1.05, -0.04], [0.3, 0.85, -0.2], [-0.55, 0.5, 0.1], PL(-FX)];
const EM_L = emisiones(() => 9);
const EM_R = emisiones((x) => ((x * 4) % 1 < 0.1 ? 60 : 0));
const DUR_P = 0.09;

const Cruzada: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.4, 0.3, 11.8], l: [0, -0.5, 0], fov: 40 },
      { b: 1, p: [-0.6, 0.4, 11.2], l: [0, -0.5, 0], fov: 40 },
    ],
    b,
  );
  const corte = entre(b, 0.46, 0.56);
  const crece = entre(b, 0.58, 0.72);
  const cruzado = b >= 0.57;
  const conv = entre(b, 0.74, 0.95);
  const antes = (e: number) => e < 0.44;
  const despues = (e: number) => e > 0.72;
  const emL0 = EM_L.filter(antes);
  const emR0 = EM_R.filter(antes);
  const emL1 = EM_L.filter(despues);
  const emR1 = EM_R.filter(despues);
  const durC = DUR_P * 1.3;
  const actIzq = Math.max(llegada(b, emL0, DUR_P), llegada(b, emR1, durC));
  const actDer = Math.max(llegada(b, emR0, DUR_P), llegada(b, emL1, durC));
  const colIzq = f3Mezcla(F2_COL.I, F2_COL.IIa, conv * 0.9);
  const colDer = f3Mezcla(F2_COL.IIx, F2_COL.I, conv * 0.75);
  const rL = RECTO(SL, 0.13);
  const rR = RECTO(SR, 0.22);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 24]}>
        <F3Soma p={SL} tam={0.13} act={entre(b, 0.02, 0.1) * 0.6} seed="sl" />
        <F3Soma p={SR} tam={0.22} act={entre(b, 0.02, 0.1) * 0.6} seed="sr" />
        {!cruzado ? (
          <>
            <F3Nervio pts={rL} z={mix(1, 0.42, corte)} r={0.025} />
            <F3Nervio pts={rR} z={mix(1, 0.42, corte)} r={0.035} />
            <F3Placa p={PL(-FX)} op={1 - corte} />
            <F3Placa p={PL(FX)} op={1 - corte} />
            <Tren pts={rL} b={b} em={emL0} dur={DUR_P} r={0.045} />
            <Tren pts={rR} b={b} em={emR0} dur={DUR_P} r={0.06} />
          </>
        ) : (
          <>
            <F3Nervio pts={CRUZ_L} z={mix(0.3, 1, crece)} r={0.025} act={crece > 0.99 ? 0.3 : 0} />
            <F3Nervio pts={CRUZ_R} z={mix(0.3, 1, crece)} r={0.035} act={crece > 0.99 ? 0.3 : 0} />
            <F3Placa p={PL(-FX)} op={entre(b, 0.7, 0.74)} />
            <F3Placa p={PL(FX)} op={entre(b, 0.7, 0.74)} />
            <Tren pts={CRUZ_L} b={b} em={emL1} dur={durC} r={0.045} />
            <Tren pts={CRUZ_R} b={b} em={emR1} dur={durC} r={0.06} />
          </>
        )}
        <F2Fibra p={[-FX, FIB_Y, 0]} color={colIzq} r={0.28} alto={1.8} act={actIzq * 0.5} seed="ci" />
        <F2Fibra p={[FX, FIB_Y, 0]} color={colDer} r={0.28} alto={1.8} act={actDer * 0.5} seed="cd" />
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [SL[0] - 0.12, SL[1], 0], t: "Neurona lenta", a: 0.1, z: 1, o: [-40, 90], color: ROJO },
          { p: [SR[0] + 0.15, SR[1], 0], t: "Neurona rápida", a: 0.16, z: 1, o: [40, 100], color: F2_COL.IIx },
          { p: [0, 0.68, 0.2], t: "Inervación cruzada", a: 0.66, z: 1, o: [-150, 150], color: K.amarillo },
        ]}
      />
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [-FX - 0.36, FIB_Y, 0], t: conv > 0.5 ? "más rápida" : "Fibra lenta", a: 0.12, z: 1, color: conv > 0.5 ? F2_COL.IIa : ROJO, tam: 34, ancla: "der" },
          { p: [FX + 0.36, FIB_Y, 0], t: conv > 0.5 ? "más lenta" : "Fibra rápida", a: 0.12, z: 1, color: conv > 0.5 ? ROJO : F2_COL.IIx, tam: 34, ancla: "izq" },
        ]}
      />
      <Dato b={b} a={0.08} z={0.45} t="LA NEURONA DECIDE" sub="qué miosina fabrica la fibra" color={F2_COL.nervio} y={250} tam={76} />
      <Dato b={b} a={0.47} z={1} t="SE CAMBIA EL NERVIO" sub="Buller y cols. 1960" color={K.amarillo} y={250} tam={76} />
      <Chip b={b} a={0.45} z={1} t="EXPERIMENTO CLÁSICO" x={540} y={1110} color={K.amarillo} />
    </AbsoluteFill>
  );
};

// 3 · Patrón de la señal: tónico (lento y constante) vs ráfagas --------------------------------
const EM_TON = emisiones((x) => (x > 0.04 ? 11 : 0));
const EM_RAF = emisiones((x) => (x > 0.06 && (x * 5) % 1 < 0.09 ? 70 : 0));
const DUR_3 = 0.07;
const TAU_CA = 0.06;
const calcio = (b: number, em: number[], dur: number, amp: number) => {
  let s = 0;
  for (const e of em) {
    const d = b - e - dur;
    if (d >= 0) s += amp * Math.exp(-d / TAU_CA);
  }
  return Math.min(1, s);
};
const IONES: V3[] = Array.from({ length: 24 }).map((_, i) => [
  -0.55 + ((i * 0.37) % 1) * 1.7,
  Math.sin(i * 2.1) * 0.22,
  Math.cos(i * 1.7) * 0.22,
]);
const FILAS3 = [
  { y: 0.8, em: EM_TON, amp: 0.13, t: "Lentos y constantes", col: ROJO },
  { y: -0.8, em: EM_RAF, amp: 0.4, t: "Ráfagas cortas y fuertes", col: F2_COL.IIx },
];

const Patron: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.5, 0.4, 11.8], l: [0, -0.7, 0], fov: 40 },
      { b: 1, p: [-0.4, 0.3, 11.2], l: [0, -0.7, 0], fov: 40 },
    ],
    b,
  );
  const genLento = entre(b, 0.72, 0.86);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 24]}>
        {FILAS3.map((f, i) => {
          const s: V3 = [-1.55, f.y, 0];
          const ax: V3[] = [[s[0] + 0.15, f.y, 0], [-1.15, f.y + 0.05, 0.05], [-0.85, f.y, 0.2], [-0.62, f.y, 0.36]];
          const ca = calcio(b, f.em, DUR_3, f.amp);
          const nIon = Math.round(ca * IONES.length);
          const act = llegada(b, f.em, DUR_3);
          return (
            <group key={i}>
              <F3Soma p={s} tam={i === 0 ? 0.13 : 0.2} act={act * 0.8} seed={`p${i}`} />
              <F3Nervio pts={ax} r={i === 0 ? 0.022 : 0.03} />
              <F3Placa p={ax[3]} act={act} />
              <Tren pts={ax} b={b} em={f.em} dur={DUR_3} r={0.045} />
              <group position={[0.35, f.y, 0]} rotation={[0, 0, Math.PI / 2]}>
                <F2Fibra p={[0, 0, 0]} color={i === 0 ? F2_COL.I : F2_COL.IIx} r={0.36} alto={2.2} op={0.4} act={act * 0.3} seed={`pf${i}`} />
              </group>
              {IONES.slice(0, nIon).map((q, k) => (
                <Mol key={k} p={[q[0] + 0.1, f.y + q[1], q[2]]} color={CA} r={0.035} brillo={1.2} />
              ))}
              <F3Nucleo
                p={[1.1, f.y, 0]}
                r={0.31}
                giro={b * 3}
                genes={[
                  { color: ROJO, on: i === 0 ? genLento : 0 },
                  { color: F2_COL.IIx, on: i === 1 ? genLento * 0.8 : 0 },
                ]}
              />
            </group>
          );
        })}
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-1.1, FILAS3[0].y + 0.05, 0.05], t: FILAS3[0].t, a: 0.22, z: 1, o: [20, -110], color: ROJO },
          { p: [-1.1, FILAS3[1].y + 0.05, 0.05], t: FILAS3[1].t, a: 0.3, z: 1, o: [20, 120], color: F2_COL.IIx },
          { p: [0.1, FILAS3[0].y - 0.2, 0.2], t: "Calcio elevado", a: 0.5, z: 1, o: [-40, 110], color: CA },
          { p: [1.1, FILAS3[0].y - 0.1, 0.27], t: "Genes lentos", a: 0.74, z: 1, o: [-20, 110], color: ROJO },
        ]}
      />
      <Dato b={b} a={0.03} z={0.5} t="PATRÓN DE LA SEÑAL" sub="no solo cuánta, sino cómo llega" color={F2_COL.nervio} y={250} tam={86} />
      <Dato b={b} a={0.52} z={1} t={<>CALCIO ↑ → GENES LENTOS</>} sub="vía calcineurina" color={CA} y={250} tam={72} />
    </AbsoluteFill>
  );
};

// 4 · Fibra híbrida: dos miosinas a la vez ---------------------------------------------------
const RIB_L: V3 = [-1.15, 0.55, 0.2];
const RIB_R: V3 = [1.15, 0.55, 0.2];

const Hibrida: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.5, 0.2, 9.9], l: [0, -0.56, 0], fov: 40 },
      { b: 1, p: [-0.5, 0.3, 9.3], l: [0, -0.56, 0], fov: 40 },
    ],
    b,
  );
  const mezcla = mix(0.15, 0.55, entre(b, 0.1, 0.9));
  const fab = (b * 9) % 1;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[6, 20]}>
        <F3FibraHibrida p={[0, -0.25, 0]} r={0.5} alto={2.2} a={F2_COL.IIa} z={F2_COL.IIx} mezcla={mezcla} giro={b * 0.8} />
        <Ribosoma p={RIB_L} color={F2_COL.IIa} n={fab * 7} avance={b * 30} escala={0.7} />
        <Ribosoma p={RIB_R} color={F2_COL.IIx} n={((fab + 0.5) % 1) * 7} avance={b * 30} escala={0.7} />
        {Array.from({ length: 10 }).map((_, i) => {
          const izq = i % 2 === 0;
          const t0 = 0.12 + i * 0.075;
          const u = lineal(b, t0, t0 + 0.2);
          if (u <= 0 || u >= 1) return null;
          const desde: V3 = izq ? [RIB_L[0] + 0.1, RIB_L[1] + 0.5, 0.3] : [RIB_R[0] - 0.1, RIB_R[1] + 0.5, 0.3];
          const hasta: V3 = [izq ? -0.35 : 0.35, -0.1 - (i % 4) * 0.25, 0.45];
          const q = mix3(desde, hasta, u);
          return (
            <F3Miosina
              key={i}
              p={[q[0], q[1] + Math.sin(u * Math.PI) * 0.3, q[2]]}
              color={izq ? F2_COL.IIa : F2_COL.IIx}
              escala={0.9}
              giro={izq ? -0.6 : Math.PI + 0.6}
              op={Math.min(1, (1 - u) * 6)}
            />
          );
        })}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [RIB_L[0], RIB_L[1] - 0.15, RIB_L[2]], t: "Miosina IIa", a: 0.12, z: 1, o: [-10, 170], color: F2_COL.IIa },
          { p: [RIB_R[0], RIB_R[1] - 0.15, RIB_R[2]], t: "Miosina IIx", a: 0.18, z: 1, o: [-10, 170], color: F2_COL.IIx },
        ]}
      />
      <Dato b={b} a={0.08} z={1} t="FIBRA HÍBRIDA" sub="en obra · dos miosinas a la vez" color={F2_COL.IIa} y={250} tam={96} />
      <Chip b={b} a={0.5} z={1} t="IIa + IIx EN LA MISMA FIBRA" x={540} y={1110} color={F2_COL.IIa} />
    </AbsoluteFill>
  );
};

// 5 · Estudio: 3 meses de pesas, IIx 9 % -> 2 % ----------------------------------------------
const C5_R = 0.95;
const NC = f3NCeldas(C5_R);
const CORTE_P: V3 = [0, -0.3, 0];
const CAL_P: V3 = [-1.0, 0.98, 0.2];
const PESA_P: V3 = [0.95, 1.02, 0.3];

const Estudio: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.4, 0.3, 9.0], l: [0, -0.5, 0], fov: 40 },
      { b: 1, p: [-0.4, 0.2, 8.6], l: [0, -0.5, 0], fov: 40 },
    ],
    b,
  );
  const prog = entre(b, 0.3, 0.8);
  const pct = mix(9.3, 2.0, prog);
  const sube = Math.abs(Math.sin(b * 16)) * 0.12 * (b < 0.85 ? 1 : 0);
  const cel = f3CeldaRapida(Math.floor(0.093 * NC) - 1, C5_R);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[7, 22]}>
        <F3Corte p={CORTE_P} r={C5_R} lentas={0.45} iix={pct / 100} brillaIIx={0.6 + 0.4 * Math.sin(b * 20)} />
        <group position={CAL_P} scale={0.5}>
          <Calendario marca={lineal(b, 0.12, 0.8)} />
        </group>
        <F2Pesa p={[PESA_P[0], PESA_P[1] + sube, PESA_P[2]]} escala={0.55} giro={0.3} />
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [CAL_P[0], CAL_P[1] - 0.42, CAL_P[2]], t: "3 meses", a: 0.1, z: 1, color: K.morado, tam: 38 },
          { p: [PESA_P[0], PESA_P[1] - 0.38, PESA_P[2]], t: "pesas", a: 0.1, z: 1, color: K.naranja, tam: 38 },
        ]}
      />
      <Etiquetas
        cam={cam}
        b={b}
        items={[{ p: [cel[0] + CORTE_P[0], cel[1] + CORTE_P[1], 0.06], t: "IIx → IIa", a: 0.5, z: 1, o: [-60, 160], color: F2_COL.IIa }]}
      />
      <BarraPct b={b} a={0.03} z={1} valor={pct} titulo="FIBRAS IIx" y={240} />
      <Chip b={b} a={0.2} z={1} t="ANDERSEN Y AAGAARD 2000" x={540} y={1145} color={K.cian} />
    </AbsoluteFill>
  );
};

// 6 · Desentrenamiento: IIx 2 % -> 17 % (rebote) -------------------------------------------
const Rebote: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [-0.4, 0.2, 8.6], l: [0, -0.5, 0], fov: 40 },
      { b: 1, p: [0.4, 0.3, 9.0], l: [0, -0.5, 0], fov: 40 },
    ],
    b,
  );
  const prog = entre(b, 0.3, 0.72);
  const pct = mix(2.0, 17.2, prog);
  const tacha = entre(b, 0.06, 0.14);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[7, 22]}>
        <F3Corte p={CORTE_P} r={C5_R} lentas={0.45} iix={pct / 100} brillaIIx={entre(b, 0.3, 0.4) * (0.6 + 0.4 * Math.sin(b * 20))} />
        <group position={CAL_P} scale={0.5}>
          <Calendario marca={lineal(b, 0.1, 0.72)} />
        </group>
        <F2Pesa p={PESA_P} escala={0.55} giro={0.3} />
        {tacha > 0.01 ? <F2Tacha p={[PESA_P[0], PESA_P[1], PESA_P[2] + 0.3]} tam={0.45 * tacha} /> : null}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [CAL_P[0], CAL_P[1] - 0.42, CAL_P[2]], t: "3 meses", a: 0.06, z: 1, color: K.morado, tam: 38 },
          { p: [PESA_P[0], PESA_P[1] - 0.38, PESA_P[2]], t: "sin entrenar", a: 0.1, z: 1, color: K.rojo, tam: 38 },
        ]}
      />
      <BarraPct b={b} a={0.03} z={1} valor={pct} titulo="FIBRAS IIx" y={240} marca={{ v: 9.3, t: "inicio 9 %" }} />
      <Chip b={b} a={0.76} z={1} t="EFECTO REBOTE" x={540} y={1145} color={K.amarillo} />
    </AbsoluteFill>
  );
};

// 7 · Más rápida, pero pierde la fuerza ganada -----------------------------------------------
const Fuerza: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.3, 0.4, 8.2], l: [0, -0.45, 0], fov: 40 },
      { b: 1, p: [-0.3, 0.3, 7.8], l: [0, -0.45, 0], fov: 40 },
    ],
    b,
  );
  const rapida = entre(b, 0.1, 0.45);
  const pierde = entre(b, 0.52, 0.9);
  const col = f3Mezcla(F2_COL.IIa, F2_COL.IIx, rapida * 0.85);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[6, 20]}>
        <F2Fibra p={[0, -0.3, 0]} color={col} r={0.32} grosor={1 - pierde * 0.15} alto={2.0} act={rapida * 0.2 * (1 - pierde)} seed="fz" />
        <group position={[-1.05, 0.55, 0]} scale={0.75}>
          <Velocimetro v={mix(0.35, 0.85, rapida)} />
        </group>
        <group position={[1.05, -1.25, 0]}>
          <Barra3D valor={mix(1.3, 1.0, pierde)} color={K.naranja} alto={1.4} r={0.2} />
        </group>
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [-1.05, 0.25, 0], t: "Velocidad", a: 0.06, z: 1, color: K.cian, tam: 36 },
          { p: [1.05, 0.85, 0], t: "Fuerza", a: 0.06, z: 1, color: K.naranja, tam: 36 },
          { p: [1.32, 0.23, 0], t: "inicio", a: 0.55, z: 1, color: K.tinta, tam: 28, ancla: "izq" },
        ]}
      />
      <Chip b={b} a={0.14} z={1} t="MÁS RÁPIDA" x={300} y={1110} color={K.cian} />
      <Chip b={b} a={0.55} z={1} t="PIERDE FUERZA" x={780} y={1110} color={K.naranja} />
      <Dato b={b} a={0.03} z={1} t="SIN ENTRENAR" sub="programa rápido, menos fuerza" color={K.rojo} y={250} tam={92} />
    </AbsoluteFill>
  );
};

// 8 y 9 · Dos unidades motoras: con la edad / entrenando ---------------------------------------
const U_L: V3 = [-0.75, 1.55, 0];
const U_R: V3 = [0.85, 1.55, 0];
const BP_L: V3 = [-0.75, 0.95, 0.12];
const BP_R: V3 = [0.85, 0.95, -0.06];
const FIBX = [-1.25, -0.75, -0.25, 0.25, 0.75, 1.25];
const RAPIDAS = [1, 3, 5];
const FY = -0.55;
const PLACA = (x: number): V3 => [x, 0.1, 0.21];
const RAMA = (bp: V3, x: number): V3[] => [bp, [mix(bp[0], x, 0.6), 0.5, mix(bp[2], 0.21, 0.5)], PLACA(x)];
const AXON = (s: V3, bp: V3, tam: number): V3[] => [[s[0], s[1] - tam, 0], [s[0] + 0.03, mix(s[1], bp[1], 0.5), bp[2] * 0.5], bp];
const EM_U_L = emisiones(() => 8);

const Unidades: React.FC<{
  b: number;
  ret?: number; // la neurona rapida retrae sus ramas 0..1
  apaga?: number;
  brote?: number; // la lenta extiende ramas a las huerfanas 0..1
  conv?: number; // las huerfanas se vuelven rojas 0..1
  emR?: number[]; // impulsos de la rapida
}> = ({ b, ret = 0, apaga = 0, brote = 0, conv = 0, emR = [] }) => {
  const axL = AXON(U_L, BP_L, 0.13);
  const axR = AXON(U_R, BP_R, 0.22);
  const actL = llegada(b, EM_U_L, 0.12);
  const actR = llegada(b, emR, 0.12);
  return (
    <>
      <F3Soma p={U_L} tam={0.13} act={0.3} seed="ul" />
      <F3Soma p={U_R} tam={0.22} act={0.3 + actR * 0.6} apaga={apaga} seed="ur" />
      <F3Nervio pts={axL} r={0.024} />
      <F3Nervio pts={axR} r={0.034} apaga={apaga} />
      <Tren pts={axL} b={b} em={EM_U_L} dur={0.06} r={0.04} />
      {emR.length ? <Tren pts={axR} b={b} em={emR} dur={0.06} r={0.055} /> : null}
      {FIBX.map((x, i) => {
        const rapida = RAPIDAS.includes(i);
        if (!rapida) {
          return (
            <group key={i}>
              <F3Nervio pts={RAMA(BP_L, x)} r={0.016} />
              <F3Placa p={PLACA(x)} />
              <F2Fibra p={[x, FY, 0]} color={F2_COL.I} r={0.2} alto={1.3} act={actL * 0.3} seed={`uf${i}`} />
            </group>
          );
        }
        const huerfana = ret > 0.98 && brote < 0.98;
        const col = f3Mezcla(i === 5 ? F2_COL.IIx : F2_COL.IIa, F2_COL.I, conv);
        return (
          <group key={i}>
            <F3Nervio pts={RAMA(BP_R, x)} z={1 - ret} r={0.02} apaga={apaga} />
            <F3Nervio pts={RAMA(BP_L, x)} z={brote} r={0.016} />
            <F3Placa p={PLACA(x)} op={ret < 0.98 ? 1 : brote > 0.98 ? 1 : 0.25} />
            {emR.length ? <Tren pts={RAMA(BP_R, x)} b={b} em={emR.map((e) => e + 0.06)} dur={0.05} r={0.04} /> : null}
            <F2Fibra
              p={[x, FY, 0]}
              color={huerfana ? f3Mezcla(col, "#5a5050", 0.35) : col}
              r={0.22}
              alto={1.3}
              act={(brote > 0.98 ? actL : actR) * 0.35}
              seed={`uf${i}`}
            />
          </group>
        );
      })}
    </>
  );
};

const camUnid = (b: number) =>
  camara(
    [
      { b: 0, p: [0.5, 0.5, 12.0], l: [0, -0.28, 0], fov: 40 },
      { b: 1, p: [-0.5, 0.6, 11.4], l: [0, -0.28, 0], fov: 40 },
    ],
    b,
  );

const Edad: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camUnid(b);
  const ret = entre(b, 0.24, 0.46);
  const apaga = entre(b, 0.26, 0.48);
  const brote = entre(b, 0.52, 0.72);
  const conv = entre(b, 0.76, 0.94);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 24]}>
        <Unidades b={b} ret={ret} apaga={apaga} brote={brote} conv={conv} />
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [U_L[0] - 0.12, U_L[1], 0], t: "Neurona lenta", a: 0.06, z: 1, o: [-60, 80], color: ROJO },
          { p: [U_R[0] + 0.15, U_R[1], 0], t: apaga > 0.5 ? "Se pierde" : "Neurona rápida", a: 0.1, z: 1, o: [60, 90], color: apaga > 0.5 ? K.suave : F2_COL.IIx },
          { p: [0.0, 0.62, 0.15], t: "La lenta las adopta", a: 0.56, z: 0.8, o: [60, 220], color: K.amarillo },
        ]}
      />
      <Dato b={b} a={0.02} z={0.5} t="CON LA EDAD" sub="fibras rápidas pierden su neurona" color={K.morado} y={250} tam={84} />
      <Dato b={b} a={0.52} z={0.8} t="REINERVACIÓN LENTA" sub="una neurona lenta las adopta" color={ROJO} y={250} tam={76} />
      <Dato b={b} a={0.8} z={1} t="SE VUELVEN LENTAS" sub="fibras del mismo tipo, agrupadas" color={ROJO} y={250} tam={76} />
    </AbsoluteFill>
  );
};

// 9 · Entrenar fuerza conserva las conexiones ------------------------------------------------
const EM_U_R = emisiones((x) => ((x * 3) % 1 < 0.12 ? 45 : 0));

const Conserva: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const A = 0.4;
  const fuera = b < A;
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [1.3, 1.2, 6.6], l: [0.1, 0.78, 0], fov: 36 },
          { b: A, p: [0.4, 1.1, 6.0], l: [0.1, 0.78, 0], fov: 36 },
        ],
        b,
      )
    : camUnid(b);
  const k = Math.sin(((b * 3.4) % 1) * Math.PI);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2} niebla={fuera ? undefined : [8, 24]}>
        {fuera ? (
          <group rotation={[0, 0.35, 0]}>
            <Atleta ej="curl" k={k} brilla={0.2 + 0.4 * k} colorBrillo={K.lima} />
            <Piso color={K.lima} />
          </group>
        ) : (
          <>
            <Unidades b={b} emR={EM_U_R.filter((e) => e > A)} />
            <Polvo b={b} radio={6} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[A]} />
      {!fuera ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [U_L[0] - 0.12, U_L[1], 0], t: "Neurona lenta", a: A + 0.04, z: 1, o: [-60, 80], color: ROJO },
            { p: [U_R[0] + 0.15, U_R[1], 0], t: "Rápida: sigue conectada", a: A + 0.08, z: 1, o: [-30, 120], color: F2_COL.IIx },
          ]}
        />
      ) : null}
      <Dato b={b} a={0.03} z={A} t="EJERCICIO TODA LA VIDA" sub="ayuda a conservar las conexiones" color={K.lima} y={250} tam={76} />
      <Dato b={b} a={A + 0.04} z={1} t="ENTRENA FUERZA" sub="para envejecer mejor" color={K.lima} y={250} tam={86} />
      <Chip b={b} a={A + 0.2} z={1} t="COLETTI ET AL. 2022" x={540} y={1150} color={K.cian} />
    </AbsoluteFill>
  );
};

const Final: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Qué tema para la <span style={{ color: K.lima }}>parte 4</span>?</>}
    escribe="Quiero…"
    ideas={["FIBRAS Y DEPORTE", "FIBRAS Y EDAD", "CRECER CADA FIBRA"]}
  />
);

const T = [
  "En la parte dos viste que el entrenamiento puede cambiar tus fibras. Hoy vamos más profundo: ¿qué decide el tipo de una fibra y **hasta dónde** puede cambiar?",
  "El tipo de fibra lo marca su **miosina**: cada tipo fabrica una versión distinta, más lenta o más rápida, que gasta ATP a diferente velocidad.",
  "¿Y quién decide qué miosina fabricar? Sobre todo, la **neurona** que la controla. En experimentos clásicos, al cambiarle el nervio a un músculo, sus fibras cambiaron de tipo.",
  "Lo que cuenta es el **patrón** de la señal: impulsos lentos y constantes mantienen el calcio elevado en la fibra y encienden los genes de fibra **lenta**.",
  "Mientras cambian, muchas fibras son **híbridas**: fabrican dos tipos de miosina al mismo tiempo, como una fibra en obra.",
  "En un estudio, con tres meses de pesas, las fibras **dos X** bajaron de un nueve a un dos por ciento: casi todas se volvieron **dos A**.",
  "Pero después de tres meses **sin entrenar**, las dos X regresaron y quedaron por encima del inicio: un **diecisiete** por ciento. Es el efecto **rebote**.",
  "Sin entrenamiento, la fibra vuelve a un programa más rápido, pero el músculo también pierde la **fuerza** que habías ganado.",
  "Con la edad pasa lo contrario: algunas fibras rápidas pierden su neurona, una neurona **lenta** las adopta, y se vuelven lentas.",
  "El ejercicio a lo largo de la vida ayuda a **conservar** esas conexiones. Por eso entrenar fuerza es clave para envejecer mejor.",
  "¿Qué tema quieres para la parte cuatro? **Escríbelo en los comentarios**.",
];

const ESCENAS = [Gancho, Miosinas, Cruzada, Patron, Hibrida, Estudio, Rebote, Fuerza, Edad, Conserva, Final];

export const FIBRAS3: ShortDef = {
  id: "Short-Fibras3",
  titulo: "¿Se pueden cambiar tus fibras musculares? Parte 3",
  planos: ESCENAS.map((Escena, i) => ({ id: `fibras3-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
