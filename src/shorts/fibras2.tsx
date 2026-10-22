// Short: Fibras rápidas y lentas. Parte 2: cómo se reclutan y si se pueden cambiar
// Neurona motora -> unidad motora -> principio del tamaño -> adaptaciones al entrenamiento.
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, Cam, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { Polvo, Tubo } from "../fisio/modelos/comun";
import { Humano } from "../fisio/modelos/cuerpo";
import { Cadena, Enlace, Glucogeno, Mol } from "../fisio/modelos/energia";
import { Cerebro } from "../fisio/capitulos/cap6";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaComentarios } from "./cierre";
import { Chip, Dato, Destello, INTER, K, ShortDef, Titular } from "./marco";
import { Atleta, Frijoles, Huevo, Pechuga, Piso, Plato } from "./modelos";
import { NERVIO_C, puntoVia, ViaMotora } from "./modelos-contraccion";
import {
  F2_COL,
  F2ADN,
  F2Arroz,
  F2Barra,
  F2Fibra,
  F2Flecha,
  F2Haz,
  F2Medula,
  F2Pesa,
  F2Tacha,
  F2Unidad,
} from "./modelos-fibras";

const AA = [K.lima, K.cian, K.naranja, K.rosa, K.morado, K.amarillo];

/** Barra horizontal (señal / fuerza) con marcas de umbral. */
const Medidor: React.FC<{
  b: number;
  a: number;
  z: number;
  valor: number;
  titulo: string;
  y: number;
  marcas?: { v: number; c: string; t: string }[];
}> = ({ b, a, z, valor, titulo, y, marcas = [] }) => {
  const op = visible(b, a, z, 0.08);
  if (op <= 0) return null;
  const ancho = 760;
  return (
    <div style={{ position: "absolute", top: y, left: (1080 - ancho) / 2, width: ancho, opacity: op }}>
      <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 40, color: K.tinta, textAlign: "center", marginBottom: 12, textShadow: "0 4px 16px #000" }}>
        {titulo}
      </div>
      <div style={{ position: "relative", height: 56, borderRadius: 999, background: "rgba(4,14,17,0.85)", border: "4px solid rgba(255,255,255,0.35)", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${Math.max(0, Math.min(1, valor)) * 100}%`,
            background: `linear-gradient(90deg, ${K.amarillo}, ${K.naranja})`,
            boxShadow: `0 0 30px ${K.amarillo}`,
          }}
        />
      </div>
      <div style={{ position: "relative", height: 50 }}>
        {marcas.map((m, i) => (
          <div key={i} style={{ position: "absolute", left: `${m.v * 100}%`, top: -66, transform: "translateX(-50%)", textAlign: "center" }}>
            <div style={{ width: 6, height: 66, margin: "0 auto", background: m.c, opacity: valor >= m.v ? 1 : 0.45 }} />
            <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 30, color: m.c, opacity: valor >= m.v ? 1 : 0.5, textShadow: "0 2px 8px #000" }}>{m.t}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 0 · Gancho: atleta + corte del muslo con fibras rojas y blancas -----------------------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [1.2, 1.2, 6.2], l: [0.12, 0.62, 0], fov: 36 },
      { b: 1, p: [-0.6, 1.0, 5.4], l: [0.12, 0.66, 0], fov: 36 },
    ],
    b,
  );
  const lentas = visible(b, 0.12, 0.48, 0.06);
  const rapidas = visible(b, 0.3, 0.56, 0.06);
  const ambas = entre(b, 0.62, 0.72) * (0.6 + 0.4 * Math.sin(b * 40));
  const lupa = entre(b, 0.05, 0.16);
  const muslo: V3 = [-0.2, 0.74, 0.08];
  const haz: V3 = [0.62, 0.9, 0.25];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <group position={[-0.3, 0, 0]} rotation={[0, 0.25, 0]}>
          <Atleta ej="parado" brilla={0.15 + 0.3 * Math.max(lentas, rapidas)} />
          <Piso />
        </group>
        {lupa > 0.01 ? (
          <>
            <Enlace a={muslo} b={[haz[0] - 0.36 * lupa, haz[1], haz[2]]} r={0.008} color={K.tinta} op={0.7} />
            <F2Haz p={haz} r={0.4} escala={lupa} act={[Math.max(lentas, ambas), Math.max(rapidas, ambas), Math.max(rapidas, ambas)]} />
          </>
        ) : null}
      </Escena3D>
      <Chip b={b} a={0.0} z={0.55} t="FIBRAS MUSCULARES · PARTE 2" x={540} y={330} color={K.lima} />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [haz[0] - 0.15, haz[1] + 0.1, haz[2] + 0.05], t: "Lentas (rojas)", a: 0.14, z: 0.6, o: [-60, -150], color: F2_COL.I },
          { p: [haz[0] + 0.12, haz[1] - 0.15, haz[2] + 0.05], t: "Rápidas (blancas)", a: 0.32, z: 0.6, o: [-40, 170], color: F2_COL.IIx },
        ]}
      />
      <Titular b={b} a={0.6} z={1} y={290} tam={130} t={<>¿Cuáles <span style={{ color: K.lima }}>usar</span>?</>} />
    </AbsoluteFill>
  );
};

// 1 · Neurona motora -> unidad motora (2 unidades: lenta roja y rápida blanca) ------------
const camUnidades = (b: number): Cam =>
  camara(
    [
      { b: 0.3, p: [0, 0.5, 10.6], l: [0, 0.15, 0], fov: 40 },
      { b: 1, p: [0.9, 0.6, 9.9], l: [0, 0.15, 0], fov: 40 },
    ],
    b,
  );

const UnidadEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuera = b < 0.28;
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [1.9, 1.3, 4.2], l: [0, 1.0, 0], fov: 36 },
          { b: 0.28, p: [1.5, 1.1, 2.7], l: [0.05, 0.95, 0], fov: 36 },
        ],
        b,
      )
    : camUnidades(b);
  const pulsoVia = lineal(b, 0.04, 0.24);
  const pL = lineal(b, 0.32, 0.46);
  const pR = lineal(b, 0.62, 0.76);
  const actL = entre(b, 0.45, 0.5);
  const actR = entre(b, 0.75, 0.8);
  const L: V3 = [-0.95, 1.55, 0];
  const R: V3 = [0.75, 1.55, 0];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={fuera ? undefined : [8, 24]}>
        {fuera ? (
          <>
            <Atleta ej="parado" musculo={0.45} />
            <ViaMotora medula={entre(b, 0.02, 0.1)} nervio={entre(b, 0.1, 0.2)} pulso={pulsoVia} />
            <Piso />
          </>
        ) : (
          <>
            <F2Medula p={[0, 1.6, 0]} largo={4.4} r={0.42} brillo={Math.max(actL, actR)} />
            <F2Unidad p={L} color={F2_COL.I} tam={0.13} n={3} sep={0.36} ax={1.25} act={actL} pulso={pL} rf={0.13} alto={1.9} seed="ul" />
            <F2Unidad p={R} color={F2_COL.IIx} tam={0.24} n={5} sep={0.34} ax={1.25} act={actR} pulso={pR} rf={0.15} alto={1.9} seed="ur" />
            <Polvo b={b} radio={6} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.28]} />
      {fuera ? (
        <Etiquetas cam={cam} b={b} items={[{ p: puntoVia(0.15), t: "Médula espinal", a: 0.04, z: 0.27, o: [-40, 60], color: NERVIO_C }]} />
      ) : (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [L[0] + 0.1, L[1] + 0.1, 0], t: "Neurona motora", a: 0.32, z: 0.6, o: [40, -150], color: NERVIO_C },
            { p: [L[0], -1.0, 0.15], t: "Unidad lenta", a: 0.5, z: 1, o: [-20, 170], color: F2_COL.I },
            { p: [R[0], -1.0, 0.15], t: "Unidad rápida", a: 0.8, z: 1, o: [-10, 170], color: F2_COL.IIx },
          ]}
        />
      )}
      <Dato b={b} a={0.52} z={1} t="UNIDAD MOTORA" sub="1 neurona + sus fibras · mismo tipo" color={K.amarillo} y={270} tam={90} />
    </AbsoluteFill>
  );
};

// 2 · Neurona pequeña (umbral bajo) vs grande (umbral alto) ---------------------------------
const Umbral: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const senal = b < 0.5 ? mix(0, 0.3, entre(b, 0.06, 0.22)) : mix(0.3, 0.95, entre(b, 0.55, 0.78));
  const UL = 0.2;
  const UR = 0.7;
  const onL = senal >= UL;
  const onR = senal >= UR;
  const cam = camara(
    [
      { b: 0, p: [0, 1.0, 10.6], l: [0, 0.55, 0], fov: 40 },
      { b: 1, p: [-0.8, 0.9, 10.0], l: [0, 0.55, 0], fov: 40 },
    ],
    b,
  );
  const L: V3 = [-0.85, 0.9, 0];
  const R: V3 = [0.85, 0.9, 0];
  const cer: V3 = [0, 2.45, -0.6];
  const via = (s: V3): V3[] => [[cer[0], cer[1] - 0.55, cer[2]], [s[0] * 0.4, (cer[1] + s[1]) / 2, -0.3], [s[0], s[1] + 0.35, 0]];
  const ciclo = (b * 7) % 1;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 24]}>
        <group position={cer} scale={0.55}>
          <Cerebro motor={senal} />
        </group>
        {[L, R].map((s, i) => (
          <group key={i}>
            <Tubo puntos={via(s)} radio={0.022} color={NERVIO_C} emisivo={0.2 + senal * 1.2} opacidad={0.8} />
            {senal > 0.02 ? <Mol p={mix3(via(s)[0], via(s)[2], (b * 3 + i * 0.3) % 1)} color="#fff3a0" r={0.03 + senal * 0.05} brillo={2} /> : null}
          </group>
        ))}
        <F2Unidad p={L} color={F2_COL.I} tam={0.12} n={3} sep={0.34} ax={1.2} act={onL ? 0.9 : 0} pulso={onL ? ciclo : -1} rf={0.13} alto={1.7} seed="ul" />
        <F2Unidad p={R} color={F2_COL.IIx} tam={0.27} n={4} sep={0.34} ax={1.2} act={onR ? 0.9 : 0} pulso={onR ? (ciclo + 0.4) % 1 : -1} rf={0.15} alto={1.7} seed="ur" />
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [L[0] - 0.1, L[1], 0], t: "Neurona pequeña", a: 0.08, z: 1, o: [20, -170], color: F2_COL.I },
          { p: [R[0] + 0.15, R[1], 0], t: "Neurona grande", a: 0.48, z: 1, o: [-20, -240], color: F2_COL.IIx },
        ]}
      />
      <Medidor
        b={b}
        a={0.02}
        z={1}
        y={250}
        valor={senal}
        titulo="SEÑAL DEL CEREBRO"
        marcas={[
          { v: UL, c: "#ff6b7a", t: "lenta" },
          { v: UR, c: F2_COL.IIx, t: "rápida" },
        ]}
      />
      <Chip b={b} a={0.22} z={0.52} t="POCA SEÑAL → SOLO LA LENTA" x={540} y={1110} color={K.amarillo} />
      <Chip b={b} a={0.78} z={1} t="SEÑAL FUERTE → TAMBIÉN LA RÁPIDA" x={540} y={1110} color={K.naranja} />
    </AbsoluteFill>
  );
};

// 3 · Principio del tamaño: I -> IIa -> IIx según la fuerza -----------------------------
const ORDEN = [
  { x: -1.15, c: F2_COL.I, tam: 0.11, n: 2, th: 0.15, t: "Tipo I", lbl: "#ff6b7a" },
  { x: 0, c: F2_COL.IIa, tam: 0.18, n: 3, th: 0.45, t: "IIa", lbl: F2_COL.IIa },
  { x: 1.2, c: F2_COL.IIx, tam: 0.26, n: 3, th: 0.75, t: "IIx", lbl: F2_COL.IIx },
];

const Orden: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuerza = mix(0.05, 0.95, lineal(b, 0.12, 0.72));
  const cam = camara(
    [
      { b: 0, p: [0, 0.8, 11.0], l: [0, 0.3, 0], fov: 40 },
      { b: 1, p: [0.8, 0.9, 10.4], l: [0, 0.3, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 24]}>
        <F2Medula p={[0, 1.6, 0]} largo={4.6} r={0.42} brillo={fuerza} />
        {ORDEN.map((u, i) => {
          const on = entre(fuerza, u.th, u.th + 0.06);
          return (
            <F2Unidad
              key={i}
              p={[u.x, 1.55, 0]}
              color={u.c}
              tam={u.tam}
              n={u.n}
              sep={0.3}
              ax={1.25}
              act={on * 0.9}
              pulso={on > 0.5 ? (b * 6 + i * 0.33) % 1 : -1}
              rf={0.12}
              alto={1.8}
              seed={`o${i}`}
            />
          );
        })}
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={ORDEN.map((u, i) => ({ p: [u.x, -1.1, 0.15] as V3, t: `${i + 1}º ${u.t}`, a: 0.1 + i * 0.03, z: 1, o: [i === 2 ? -30 : i === 0 ? -10 : -20, 160] as [number, number], color: u.lbl }))}
      />
      <Medidor
        b={b}
        a={0.05}
        z={0.74}
        y={250}
        valor={fuerza}
        titulo="FUERZA NECESARIA"
        marcas={ORDEN.map((u) => ({ v: u.th, c: u.lbl, t: u.t }))}
      />
      <Dato b={b} a={0.78} z={1} t="PRINCIPIO DEL TAMAÑO" sub="de neuronas pequeñas a grandes" color={K.lima} y={260} tam={86} />
    </AbsoluteFill>
  );
};

// 4 · Caminar (solo lentas) vs sentadilla pesada (todas) --------------------------------------
const Actividad: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const camina = b < 0.42;
  const cam = camara(
    [
      { b: 0, p: [0.9, 1.1, 5.6], l: [0.15, 0.66, 0], fov: 36 },
      { b: 0.42, p: [0.4, 1.05, 5.3], l: [0.15, 0.66, 0], fov: 36 },
      { b: 0.43, p: [1.2, 1.1, 5.6], l: [0.15, 0.6, 0], fov: 36 },
      { b: 1, p: [0.5, 1.0, 5.3], l: [0.15, 0.6, 0], fov: 36 },
    ],
    b,
  );
  const k = Math.sin(((b - 0.43) * 3.2 % 1) * Math.PI);
  const h = 1.25 * k;
  const r = 2.1 * k;
  const baja = 0.87 - (0.44 * Math.cos(h) + 0.43 * Math.cos(r - h));
  const pie = 0.44 * Math.sin(h) - 0.43 * Math.sin(r - h);
  const iia = entre(b, 0.5, 0.56);
  const iix = entre(b, 0.64, 0.7);
  const act: [number, number, number] = camina ? [0.95, 0.12, 0] : [1, iia, iix];
  const haz: V3 = [0.68, 1.15, 0.3];
  const muslo: V3 = camina ? [-0.2, 0.74, 0.08] : [-0.2, 0.7 - baja, 0.18];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <group position={[-0.3, 0, 0]} rotation={[0, 0.35, 0]}>
          {camina ? (
            <Humano fase={b * 22} marcha={0.45} musculo={0.8} brilla={0.25} colorBrillo={F2_COL.I} />
          ) : (
            <>
              <Atleta ej="sentadilla" k={k} brilla={0.2 + 0.35 * iix} colorBrillo={K.amarillo} />
              <group position={[0, -baja, -pie]}>
                <group rotation={[0.35 * k, 0, 0]}>
                  <F2Barra p={[0, 1.47, 0.15]} />
                </group>
              </group>
            </>
          )}
          <Piso color={camina ? F2_COL.I : K.amarillo} />
        </group>
        <Enlace a={muslo} b={[haz[0] - 0.36, haz[1], haz[2]]} r={0.008} color={K.tinta} op={0.7} />
        <F2Haz p={haz} r={0.38} act={act} seed="hz4" />
      </Escena3D>
      <Destello b={b} en={[0.425]} />
      <Chip b={b} a={0.02} z={0.42} t="CAMINAR" x={540} y={330} color={F2_COL.I} />
      <Chip b={b} a={0.44} z={1} t="SENTADILLA PESADA · SPRINT" x={540} y={330} color={K.amarillo} />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [haz[0] - 0.1, haz[1] + 0.12, haz[2]], t: "Solo lentas", a: 0.12, z: 0.42, o: [-40, -130], color: "#ff6b7a" },
          { p: [haz[0] + 0.1, haz[1] - 0.12, haz[2]], t: "+ IIa y IIx", a: 0.68, z: 1, o: [-60, 170], color: K.amarillo },
        ]}
      />
    </AbsoluteFill>
  );
};

// 5 · Genética + entrenamiento ------------------------------------------------------------
const Genetica: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.4, 7.6], l: [0, -0.25, 0], fov: 40 },
      { b: 1, p: [0.6, 0.3, 7.2], l: [0, -0.3, 0], fov: 40 },
    ],
    b,
  );
  const adn = entre(b, 0.2, 0.32);
  const pesa = entre(b, 0.66, 0.74);
  const cambio = entre(b, 0.72, 0.95);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[6, 20]}>
        <group scale={Math.max(0.001, adn)}>
          <F2ADN p={[0, 0.95, 0]} alto={1.6} r={0.28} giro={b * 5} brillo={0.3 + adn * 0.4} />
        </group>
        <F2Haz p={[-0.78, -0.9, 0]} r={0.62} lentas={0.72} seed="pa" />
        <F2Haz p={[0.78, -0.9, 0]} r={0.62} lentas={0.32} cambio={cambio} seed="pb" act={[0, cambio * 0.4, 0]} />
        {pesa > 0.01 ? <F2Pesa p={[0.78, 0.25, 0.4]} escala={0.55 * pesa} giro={b * 3} /> : null}
        {pesa > 0.01 ? <F2Flecha a={[0.78, 0.05, 0.3]} b={[0.78, -0.2, 0.3]} r={0.03} color={K.lima} op={pesa} /> : null}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Titular b={b} a={0.0} z={0.24} y={290} tam={120} t={<>¿Se pueden <span style={{ color: K.lima }}>cambiar</span>?</>} />
      <Dato b={b} a={0.26} z={0.66} t="GENÉTICA" sub="define tu proporción" color={K.cian} y={270} tam={100} />
      <Dato b={b} a={0.66} z={1} t="GENÉTICA + ENTRENAMIENTO" sub="el entrenamiento las modifica" color={K.lima} y={270} tam={74} />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.78, -1.5, 0.1], t: "Más lentas", a: 0.36, z: 1, o: [-10, 120], color: "#ff6b7a" },
          { p: [0.78, -1.5, 0.1], t: "Más rápidas", a: 0.42, z: 1, o: [-10, 120], color: F2_COL.IIx },
        ]}
      />
    </AbsoluteFill>
  );
};

// 6 · IIx -> IIa (fácil); I <-> II (difícil) ----------------------------------------------
const Cambio: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const parte1 = b < 0.58;
  const u = entre(b, 0.18, 0.5);
  const col = (k: number) => {
    const a = [0xf4, 0xe1, 0xd8];
    const z = [0xee, 0x7d, 0x93];
    return `rgb(${a.map((v, i) => Math.round(mix(v, z[i], k))).join(",")})`;
  };
  const cam = parte1
    ? camara(
        [
          { b: 0, p: [0, 0.4, 6.4], l: [0, -0.1, 0], fov: 40 },
          { b: 0.58, p: [0.5, 0.3, 5.8], l: [0, -0.1, 0], fov: 40 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.58, p: [0, 0.3, 6.4], l: [0, -0.2, 0], fov: 40 },
          { b: 1, p: [-0.5, 0.4, 6.0], l: [0, -0.2, 0], fov: 40 },
        ],
        b,
      );
  const tacha = entre(b, 0.8, 0.86);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[5, 18]}>
        {parte1 ? (
          [-0.75, 0, 0.75].map((x, i) => {
            const k = entre(b, 0.18 + i * 0.06, 0.4 + i * 0.06);
            return <F2Fibra key={i} p={[x, -0.3, 0]} color={col(k)} r={0.25} alto={2.6} op={0.62} mito={1 + k * 7} seed={`c${i}`} act={0.15 * k} />;
          })
        ) : (
          <>
            <F2Fibra p={[-0.85, -0.4, 0]} color={F2_COL.I} r={0.27} alto={2.4} op={0.7} mito={9} seed="ci" />
            <F2Fibra p={[0.85, -0.4, 0]} color={F2_COL.IIx} r={0.3} alto={2.4} op={0.8} mito={2} seed="cx" />
            <F2Flecha a={[-0.45, -0.1, 0.3]} b={[0.45, -0.1, 0.3]} r={0.05} color={K.tinta} doble />
            {tacha > 0.01 ? <F2Tacha p={[0, -0.1, 0.45]} tam={0.6 * tacha} /> : null}
          </>
        )}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Destello b={b} en={[0.58]} />
      <Chip b={b} a={0.02} z={0.2} t="PESAS" x={360} y={330} color={K.naranja} />
      <Chip b={b} a={0.06} z={0.2} t="CARDIO" x={720} y={330} color={K.cian} />
      <Dato
        b={b}
        a={0.22}
        z={0.58}
        t={<><span style={{ color: F2_COL.IIx }}>IIx</span> → <span style={{ color: F2_COL.IIa }}>IIa</span></>}
        sub={u > 0.5 ? "más mitocondrias · más resistentes" : "se transforman"}
        color={F2_COL.IIa}
        y={270}
        tam={110}
      />
      <Dato b={b} a={0.62} z={1} t={<><span style={{ color: "#ff6b7a" }}>I</span> ⇄ <span style={{ color: F2_COL.IIx }}>II</span></>} sub="mucho más difícil" color={K.rojo} y={270} tam={110} />
      {parte1 ? (
        <Etiquetas cam={cam} b={b} items={[{ p: [0.75, 0.3, 0.2], t: "Mitocondrias", a: 0.38, z: 0.57, o: [-30, 230], color: "#ff7b54" }]} />
      ) : (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [-0.85, -1.4, 0.25], t: "Lenta", a: 0.62, z: 1, o: [-10, 120], color: "#ff6b7a" },
            { p: [0.85, -1.4, 0.3], t: "Rápida", a: 0.64, z: 1, o: [-10, 120], color: F2_COL.IIx },
          ]}
        />
      )}
    </AbsoluteFill>
  );
};

// 7 · Pesas: crece la rápida. Cardio: mitocondrias y capilares en la lenta ----------------------
const Adaptacion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const crece = entre(b, 0.12, 0.45);
  const mito = entre(b, 0.55, 0.85);
  const cap = entre(b, 0.68, 0.95);
  const cam = camara(
    [
      { b: 0, p: [0, 0.5, 6.6], l: [0, -0.1, 0], fov: 40 },
      { b: 1, p: [0.3, 0.6, 6.2], l: [0, -0.1, 0], fov: 40 },
    ],
    b,
  );
  const sube = Math.abs(Math.sin(b * 14)) * 0.12;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[5, 18]}>
        <F2Fibra p={[-0.75, -0.6, 0]} color={F2_COL.IIx} r={0.26} grosor={1 + crece * 0.6} alto={2.0} act={0.2 * crece} seed="ax" mito={2} op={0.92} />
        <F2Fibra p={[0.8, -0.6, 0]} color={F2_COL.I} r={0.26} alto={2.0} op={0.5} mito={3 + mito * 12} capilares={cap} seed="ai" />
        <F2Pesa p={[-0.75, 0.95 + sube, 0]} escala={0.6} giro={0.2} />
        <mesh position={[0.02, -0.3, -0.2]}>
          <boxGeometry args={[0.02, 3.2, 0.02]} />
          <meshBasicMaterial color={K.suave} transparent opacity={0.35} />
        </mesh>
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Chip b={b} a={0.02} z={1} t="PESAS" x={300} y={330} color={K.naranja} />
      <Chip b={b} a={0.48} z={1} t="CARDIO" x={780} y={330} color={K.cian} />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.75, -0.4, 0.3 * (1 + crece * 0.6)], t: "Crece", a: 0.22, z: 1, o: [10, 260], color: K.naranja },
          { p: [0.8, 0.2, 0.15], t: "+ Mitocondrias", a: 0.6, z: 1, o: [-60, -200], color: "#ff7b54" },
          { p: [0.8 + 0.3, -1.0, 0.0], t: "+ Capilares", a: 0.72, z: 1, o: [-80, 240], color: "#ff2a3d" },
        ]}
      />
      <Dato b={b} a={0.1} z={0.5} t="RÁPIDAS: CRECEN" sub="más hipertrofia con pesas" color={K.naranja} y={400} tam={58} />
      <Dato b={b} a={0.55} z={1} t="LENTAS: + MOTOR AERÓBICO" sub="mitocondrias y capilares" color={K.cian} y={400} tam={58} />
    </AbsoluteFill>
  );
};

// 8 · Nutrición: proteína repara / carbohidratos recargan glucógeno ------------------------------
const Nutricion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 1.3, 6.4], l: [0, 0.05, 0], fov: 40 },
      { b: 1, p: [0.5, 1.2, 6.0], l: [0, 0.05, 0], fov: 40 },
    ],
    b,
  );
  const amino = lineal(b, 0.12, 0.5);
  const repara = entre(b, 0.25, 0.52);
  const arroz = entre(b, 0.5, 0.58);
  const glu = lineal(b, 0.58, 0.92);
  const fibra: V3 = [0, 0.6, 0];
  const plato: V3 = [-0.75, -0.3, 0.2];
  const bol: V3 = [0.8, -0.3, 0.2];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[6, 20]}>
        <group rotation={[0, 0, Math.PI / 2]} position={fibra}>
          <F2Fibra p={[0, 0, 0]} color={F2_COL.IIx} r={0.36} alto={2.3} op={0.6} dano={1 - repara} grosor={1 + repara * 0.12} gluco={2 + glu * 22} act={repara * 0.15} seed="nf" />
        </group>
        <Plato p={plato} escala={1} />
        <Pechuga p={[plato[0] - 0.12, plato[1] + 0.1, plato[2] - 0.1]} escala={0.7} />
        <Huevo p={[plato[0] + 0.22, plato[1] + 0.06, plato[2] + 0.18]} escala={0.7} />
        <group scale={0.5} position={[plato[0] + 0.22, plato[1] + 0.03, plato[2] - 0.22]}>
          <Frijoles p={[0, 0, 0]} />
        </group>
        {arroz > 0.01 ? <F2Arroz p={bol} escala={arroz} /> : null}
        {amino > 0 && amino < 1
          ? Array.from({ length: 10 }).map((_, i) => {
              const t = Math.min(1, Math.max(0, amino * 1.6 - i * 0.06));
              if (t <= 0 || t >= 1) return null;
              const p = mix3([plato[0] + (i % 3) * 0.1, plato[1] + 0.2, plato[2]], [-0.9 + i * 0.2, fibra[1] - 0.2, 0.3], t);
              return <Mol key={i} p={[p[0] + Math.sin(t * 6 + i) * 0.1, p[1], p[2]]} color={AA[i % AA.length]} r={0.06} />;
            })
          : null}
        {glu > 0 && glu < 1
          ? Array.from({ length: 7 }).map((_, i) => {
              const t = Math.min(1, Math.max(0, glu * 1.5 - i * 0.07));
              if (t <= 0 || t >= 1) return null;
              const p = mix3([bol[0], bol[1] + 0.3, bol[2]], [-0.8 + i * 0.27, fibra[1], 0.2], t);
              return (
                <group key={i} rotation={[0, t * 4, 0]} position={p}>
                  <Cadena n={6} anillo sep={0.07} color={K.amarillo} brillo={0.6} />
                </group>
              );
            })
          : null}
        {glu > 0.6 ? <Glucogeno p={[1.0, fibra[1], 0.42]} escala={0.6} /> : null}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Chip b={b} a={0.06} z={0.52} t="PROTEÍNA → REPARA Y CRECE" x={540} y={330} color={K.lima} />
      <Chip b={b} a={0.54} z={1} t="CARBOHIDRATOS → GLUCÓGENO" x={540} y={330} color={K.amarillo} />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.5, -0.2, 0.3], t: "Aminoácidos", a: 0.2, z: 0.5, o: [-40, -80], color: K.lima },
          { p: [0.9, fibra[1] - 0.2, 0.3], t: "Fibra rápida", a: 0.06, z: 0.5, o: [-60, -150], color: F2_COL.IIx },
          { p: [0.6, -0.2, 0.3], t: "Glucosa", a: 0.64, z: 0.92, o: [30, -60], color: K.amarillo },
          { p: [1.0, fibra[1], 0.42], t: "Glucógeno", a: 0.8, z: 1, o: [-60, -150], color: "#9d84ff" },
        ]}
      />
    </AbsoluteFill>
  );
};

// 9 · Cierre con comentarios -------------------------------------------------------------
const Final: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Qué <span style={{ color: K.lima }}>tema</span> sigue?</>}
    escribe="Explica…"
    ideas={["HIPERTROFIA", "FATIGA", "CARDIO EN AYUNAS"]}
  />
);

const T = [
  "En la parte uno viste las fibras lentas y las rápidas. Ahora: ¿cómo decide tu cuerpo **cuáles usar**?",
  "Cada fibra recibe órdenes de una **neurona motora**. Una neurona y todas sus fibras forman una **unidad motora**, y todas esas fibras son del mismo tipo.",
  "Las unidades lentas tienen neuronas pequeñas que se activan con poca señal. Las rápidas tienen neuronas grandes que necesitan una señal más fuerte.",
  "Por eso se reclutan **en orden**: primero las lentas, y solo cuando necesitas más fuerza se suman las rápidas. Se llama **principio del tamaño**.",
  "Caminar usa casi solo fibras lentas. Una sentadilla pesada o un sprint ya enciende también las **dos X**.",
  "¿Y se pueden cambiar? Tu proporción depende mucho de tu **genética**, pero el entrenamiento sí las modifica.",
  "Con pesas o con cardio, muchas fibras **dos X** se vuelven **dos A**, más resistentes. Convertir lentas en rápidas, o al revés, es mucho más difícil.",
  "Además, las fibras rápidas son las que más **crecen** con las pesas, y las lentas ganan **mitocondrias** y capilares con el cardio.",
  "Y la nutrición acompaña: **proteína** suficiente para reparar y crecer, y **carbohidratos** para recargar el glucógeno que gastan tus fibras rápidas.",
  "Entrena las dos: **fuerza** para tus fibras rápidas y **cardio** para las lentas. ¿Qué tema quieres que explique después? **Escríbelo en los comentarios**.",
];

const ESCENAS = [Gancho, UnidadEscena, Umbral, Orden, Actividad, Genetica, Cambio, Adaptacion, Nutricion, Final];

export const FIBRAS2: ShortDef = {
  id: "Short-Fibras2",
  titulo: "Fibras rápidas y lentas. Parte 2: ¿se pueden cambiar?",
  planos: ESCENAS.map((Escena, i) => ({ id: `fibras2-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
