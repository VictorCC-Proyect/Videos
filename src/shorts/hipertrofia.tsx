// Short: Hipertrofia. Tensión mecánica -> mTOR -> síntesis de proteína -> fibra más gruesa.
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { Polvo } from "../fisio/modelos/comun";
import { Enlace, Esfera, Membrana, Mol } from "../fisio/modelos/energia";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaComentarios } from "./cierre";
import { Chip, Dato, Destello, INTER, K, ShortDef, Titular } from "./marco";
import { Atleta, Frijoles, Huevo, Pechuga, Piso, Plato, Proteina } from "./modelos";
import { F2_COL, F2Barra, F2Fibra, F2Flecha, F2Tacha } from "./modelos-fibras";
import {
  Biceps,
  Cama,
  celdaHaz,
  CorteHaz,
  FibraMiofibrillas,
  FibraSatelite,
  Filamento,
  H_ACTINA,
  H_MIOSINA,
  H_NUCLEO,
  H_RIBO,
  H_SATELITE,
  Interruptor,
  Manta,
  nFibrasHaz,
  posSatelite,
  Ribosoma,
  Sarcomeros,
  Sensor,
} from "./modelos-hipertrofia";
import { camViaje, cortesViaje, Viaje } from "./viaje";

const AA = [K.lima, K.cian, K.naranja, K.rosa, K.morado, K.amarillo];

/** Barra horizontal de esfuerzo con marcas. */
const Medidor: React.FC<{ b: number; a: number; z: number; valor: number; titulo: string; y: number; marcas?: { v: number; c: string; t: string }[] }> = ({
  b,
  a,
  z,
  valor,
  titulo,
  y,
  marcas = [],
}) => {
  const op = visible(b, a, z, 0.08);
  if (op <= 0) return null;
  const ancho = 760;
  return (
    <div style={{ position: "absolute", top: y, left: (1080 - ancho) / 2, width: ancho, opacity: op }}>
      <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 38, color: K.tinta, textAlign: "center", marginBottom: 10, textShadow: "0 4px 16px #000" }}>{titulo}</div>
      <div style={{ position: "relative", height: 50, borderRadius: 999, background: "rgba(4,14,17,0.85)", border: "4px solid rgba(255,255,255,0.35)", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${Math.max(0, Math.min(1, valor)) * 100}%`,
            background: `linear-gradient(90deg, ${K.amarillo}, ${K.rojo})`,
            boxShadow: `0 0 30px ${K.naranja}`,
          }}
        />
        {marcas.map((m, i) => (
          <div key={i} style={{ position: "absolute", left: `${m.v * 100}%`, top: 0, bottom: 0, width: 5, background: m.c, opacity: valor >= m.v ? 1 : 0.5 }} />
        ))}
      </div>
    </div>
  );
};

// 0 · Gancho: dos atletas haciendo curl; viaje al interior del bíceps ---------------------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const k = Math.sin(((b * 3.4) % 1) * Math.PI);
  const fuera = b < 0.52;
  const t = mix(0.28, 1, lineal(b, 0.52, 0.94));
  const camFuera = camara(
    [
      { b: 0, p: [0.4, 1.1, 6.4], l: [0, 0.74, 0], fov: 36 },
      { b: 0.34, p: [-0.3, 1.1, 6.0], l: [0.05, 0.76, 0], fov: 36 },
      { b: 0.52, p: [0.98, 1.36, 0.62], l: [0.72, 1.3, 0.04], fov: 36 },
    ],
    b,
  );
  const cam = fuera ? camFuera : camViaje(t);
  const grande = 0.5;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2} niebla={!fuera && t > 0.72 ? [10, 34] : undefined}>
        {fuera ? (
          <>
            <group position={[-grande, 0, 0]}>
              <Atleta ej="curl" k={k} brilla={0.1} />
              <Piso color={K.suave} brillo={0.25} />
            </group>
            <group position={[grande, 0, 0]}>
              <Atleta ej="curl" k={k} brilla={0.2 + 0.4 * k} colorBrillo={K.lima} musculo={0.9} />
              <Biceps tam={1.4} brilla={0.2 + 0.4 * k} colorBrillo={K.lima} />
              <Piso />
            </group>
          </>
        ) : (
          <Viaje t={t} b={b} interior={{ pcr: 0, brillo: 0.2 }} />
        )}
      </Escena3D>
      <Destello b={b} en={[0.52, ...cortesViaje(0.52, 0.94).slice(1)]} />
      <Chip b={b} a={0.03} z={0.5} t="HIPERTROFIA" x={540} y={330} color={K.lima} />
      <Chip b={b} a={0.08} z={0.5} t="GANA RÁPIDO" x={720} y={1100} color={K.lima} />
      <Chip b={b} a={0.16} z={0.5} t="LE CUESTA" x={360} y={1100} color={K.suave} />
      <Chip b={b} a={0.55} z={0.66} t="MÚSCULO" x={540} y={330} color={K.rojo} />
      <Chip b={b} a={0.68} z={0.8} t="FIBRA MUSCULAR" x={540} y={330} color={K.rosa} />
      <Titular b={b} a={0.82} z={1.1} y={290} tam={140} color={K.lima} t="Hipertrofia" />
    </AbsoluteFill>
  );
};

// 1 · Las fibras se engrosan: mismo número, más área ---------------------------------------
const Grosor: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const g = 1 + 0.25 * entre(b, 0.14, 0.42) + 0.15 * entre(b, 0.74, 0.9);
  const fantasma = visible(b, 0.5, 0.74, 0.06);
  const tacha = entre(b, 0.58, 0.64);
  const n = nFibrasHaz();
  const cam = camara(
    [
      { b: 0, p: [1.4, 1.3, 7.0], l: [0, -0.2, 0], fov: 38 },
      { b: 1, p: [-1.0, 1.0, 7.8], l: [0, -0.25, 0], fov: 38 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[-0.15, 0, 0]}>
          <CorteHaz grosor={[g, g, g]} act={[0.15 * (g - 1), 0.15 * (g - 1), 0.15 * (g - 1)]} />
          {fantasma > 0.01 ? (
            <group position={[0.15, -0.05, 0.75]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.22, 0.22, 0.4, 7]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.35 * fantasma} depthWrite={false} />
              </mesh>
              <F2Tacha p={[0, 0, 0.3]} tam={0.4 * tacha} op={fantasma} />
            </group>
          ) : null}
        </group>
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Dato b={b} a={0.04} z={1} t={`${n} fibras`} sub={b < 0.45 ? "se hacen más gruesas" : "mismo número · más área"} color={K.lima} y={250} tam={110} />
      <Chip b={b} a={0.52} z={1} t="NO HAY FIBRAS NUEVAS" x={540} y={1100} color={K.rojo} />
    </AbsoluteFill>
  );
};

// 2 · Tensión mecánica: carga pesada -> la fibra se tensa ------------------------------------
const Tension: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuera = b < 0.6;
  const rep = Math.max(0, b - 0.06) * (fuera ? 3.1 : 2.0);
  const k = Math.sin((rep % 1) * Math.PI) * mix(1, 0.65, entre(b, 0.3, 0.6));
  const h = 1.25 * k;
  const r = 2.1 * k;
  const baja = 0.87 - (0.44 * Math.cos(h) + 0.43 * Math.cos(r - h));
  const pie = 0.44 * Math.sin(h) - 0.43 * Math.sin(r - h);
  const tens = entre(b, 0.62, 0.8);
  const pulso = 0.6 + 0.4 * Math.sin(b * 40);
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [1.4, 1.2, 5.8], l: [0.1, 0.62, 0], fov: 36 },
          { b: 0.6, p: [0.4, 1.0, 4.8], l: [0.1, 0.6, 0], fov: 36 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.6, p: [1.4, 0.5, 7.6], l: [0, -0.35, 0], fov: 40 },
          { b: 1, p: [-1.0, 0.4, 8.2], l: [0, -0.4, 0], fov: 40 },
        ],
        b,
      );
  const n = 3;
  const L = 1.0 + 0.16 * tens;
  const ext = (n * L) / 2;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2} niebla={fuera ? undefined : [7, 20]}>
        {fuera ? (
          <group rotation={[0, 0.35, 0]}>
            <Atleta ej="sentadilla" k={k} brilla={0.2 + 0.5 * entre(b, 0.25, 0.55)} colorBrillo={K.amarillo} />
            <group position={[0, -baja, -pie]}>
              <group rotation={[0.35 * k, 0, 0]}>
                <F2Barra p={[0, 1.47, 0.15]} largo={1.7} />
              </group>
            </group>
            <Piso color={K.amarillo} />
          </group>
        ) : (
          <>
            <Sarcomeros n={n} estira={tens} tension={tens * pulso} fase={b} />
            {[1, -1].map((s) => (
              <F2Flecha key={s} a={[0, s * (ext + 0.08), 0]} b={[0, s * (ext + 0.3 + 0.55 * tens), 0]} color={K.amarillo} r={0.06} op={tens} />
            ))}
            {[1, -1].map((s) => (
              <F2Flecha key={`l${s}`} a={[0.62, s * 0.4, 0]} b={[0.62, s * (0.4 + 0.5 * tens), 0]} color={K.naranja} r={0.035} op={tens} />
            ))}
            <Polvo b={b} radio={4} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.6]} />
      <Dato b={b} a={0.03} z={1} t="TENSIÓN MECÁNICA" color={K.amarillo} y={250} tam={86} />
      <Chip b={b} a={0.22} z={0.42} t="PESO ALTO" x={540} y={1100} color={K.amarillo} />
      <Chip b={b} a={0.42} z={0.6} t="CERCA DEL FALLO" x={540} y={1100} color={K.naranja} />
      {!fuera ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [0, -L / 2, 0.3], t: "Sarcómero", a: 0.64, z: 1, o: [-90, 0], color: K.cian },
            { p: [0.1, L * 0.5 - 0.15, 0.2], t: "Miosina", a: 0.68, z: 1, o: [100, -40], color: H_MIOSINA },
            { p: [0.18, -L - 0.32, 0.15], t: "Actina", a: 0.7, z: 1, o: [100, 40], color: H_ACTINA },
          ]}
        />
      ) : null}
    </AbsoluteFill>
  );
};

// 3 · Sensor en la membrana -> cascada -> interruptor mTOR -----------------------------------
const NODOS: V3[] = [
  [0.0, 1.05, 0.35],
  [0.45, 0.45, 0.4],
  [-0.35, -0.05, 0.45],
];
const SWITCH: V3 = [0, -1.0, 0.4];

const MTor: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const tira = entre(b, 0.04, 0.2);
  const senal = lineal(b, 0.22, 0.52);
  const on = entre(b, 0.52, 0.6);
  const prot = lineal(b, 0.7, 0.95);
  const ruta: V3[] = [[0, 1.0 + 0.0, 0.3], ...NODOS, [SWITCH[0], SWITCH[1] + 0.6, SWITCH[2]]];
  const tramo = Math.min(ruta.length - 2, Math.floor(senal * (ruta.length - 1)));
  const u = senal * (ruta.length - 1) - tramo;
  const pulsoP = mix3(ruta[tramo], ruta[tramo + 1], u);
  const cam = camara(
    [
      { b: 0, p: [0.9, 1.9, 5.6], l: [0, 1.4, 0], fov: 40 },
      { b: 0.22, p: [0.7, 1.6, 6.4], l: [0, 1.0, 0], fov: 40 },
      { b: 0.52, p: [0.4, 0.9, 7.2], l: [0, -0.2, 0], fov: 40 },
      { b: 1, p: [-0.7, 0.7, 7.4], l: [0.15, -0.45, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[7, 22]}>
        {/* membrana de la fibra (fuera = arriba) */}
        <group position={[0, 1.75, 0]}>
          <Membrana ancho={5} prof={2.4} />
        </group>
        <Sensor p={[0, 1.75, 0.3]} tension={tira} />
        {/* matriz extracelular que tira del sensor */}
        <Enlace a={[-2.2, 2.65 + tira * 0.12, 0.3]} b={[2.2, 2.65 + tira * 0.12, 0.3]} r={0.045} color="#f6e7d8" brillo={0.15} />
        <F2Flecha a={[1.0, 2.9, 0.3]} b={[1.0, 3.2 + tira * 0.4, 0.3]} color={K.amarillo} r={0.05} op={tira} />
        <F2Flecha a={[-1.0, 2.9, 0.3]} b={[-1.0, 3.2 + tira * 0.4, 0.3]} color={K.amarillo} r={0.05} op={tira} />
        {/* cascada de señal */}
        {NODOS.map((p, i) => {
          const lit = entre(senal, (i + 0.6) / 4, (i + 1) / 4);
          return <Mol key={i} p={p} color={K.amarillo} r={0.16} brillo={0.2 + lit * 1.6} op={0.5 + 0.5 * Math.max(lit, 0.4)} />;
        })}
        {ruta.slice(1, -1).map((p, i) => (
          <Enlace key={i} a={ruta[i]} b={p} r={0.02} color={K.amarillo} op={0.45} brillo={0.4} />
        ))}
        <Enlace a={NODOS[2]} b={ruta[ruta.length - 1]} r={0.02} color={K.amarillo} op={0.45} brillo={0.4} />
        {senal > 0 && senal < 1 ? <Mol p={pulsoP} color="#ffffff" r={0.09} brillo={2} /> : null}
        <Interruptor p={SWITCH} on={on} escala={0.85} />
        {/* orden: fabricar proteína */}
        {prot > 0 ? <Proteina p={[0.75, -1.85, 0.6]} n={Math.round(3 + prot * 11)} escala={0.9} giro={b * 2} seed="mt" /> : null}
        {prot > 0 ? <F2Flecha a={[0.35, -1.25, 0.5]} b={[0.65, -1.5, 0.6]} color={K.lima} r={0.03} op={Math.min(1, prot * 3)} /> : null}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.15, 2.55, 0.3], t: "Sensor de tensión", a: 0.08, z: 0.45, o: [-60, -90], color: K.cian },
          { p: [2.0, 1.75, 0.6], t: "Membrana", a: 0.12, z: 0.4, o: [-60, 90], color: "#f7d9a8" },
          { p: NODOS[1], t: "Señal", a: 0.3, z: 0.6, o: [70, -40], color: K.amarillo },
          { p: [SWITCH[0] - 0.4, SWITCH[1], SWITCH[2] + 0.3], t: "mTOR", a: 0.56, z: 1, o: [-90, 60], color: K.lima },
          { p: [0.75, -1.85, 0.6], t: "+ proteína", a: 0.78, z: 1, o: [60, 80], color: K.lima },
        ]}
      />
      <Dato b={b} a={0.56} z={1} t="mTOR" sub="interruptor: fabrica más proteína" color={K.lima} y={250} tam={110} />
    </AbsoluteFill>
  );
};

// 4 · Ribosomas -> actina y miosina -> nuevas miofibrillas en paralelo -----------------------
const RIB_A: V3 = [-0.42, 2.55, 0.9];
const RIB_B: V3 = [0.42, 2.05, 1.1];
const VUELOS = Array.from({ length: 12 }).map((_, i) => {
  const ang = (i / 12) * Math.PI * 2 + 0.4;
  return { tipo: (i % 2 ? "miosina" : "actina") as "actina" | "miosina", fin: [Math.cos(ang) * 0.95, 1.1, Math.sin(ang) * 0.95] as V3 };
});

const Ribosomas: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const hace = lineal(b, 0.04, 0.42);
  const crece = entre(b, 0.55, 0.9);
  const cam = camara(
    [
      { b: 0, p: [0.2, 2.9, 6.2], l: [0, 2.6, 0.9], fov: 40 },
      { b: 0.4, p: [-0.2, 2.95, 5.9], l: [0, 2.6, 0.9], fov: 40 },
      { b: 0.6, p: [0.4, 4.3, 6.9], l: [0, 0.55, 0], fov: 40 },
      { b: 1, p: [-0.5, 4.5, 6.8], l: [0, 0.5, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[6, 22]}>
        <FibraMiofibrillas crece={crece} brillo={0.3 * crece} />
        <Ribosoma p={RIB_A} color={H_ACTINA} n={hace * 10} avance={b * 8} escala={0.8} giro={0.2} />
        <Ribosoma p={RIB_B} color={H_MIOSINA} n={hace * 10} avance={b * 8} escala={0.8} giro={-0.2} />
        {VUELOS.map((v, i) => {
          const f = entre(b, 0.42 + i * 0.016, 0.62 + i * 0.016);
          if (f <= 0 || f >= 1) return null;
          const ini = mix3(v.tipo === "actina" ? RIB_A : RIB_B, [0, 3.0, 1], 0.3);
          const p = mix3(ini, v.fin, f);
          return <Filamento key={i} p={[p[0], p[1] + Math.sin(f * Math.PI) * 0.4, p[2]]} tipo={v.tipo} escala={0.9} giro={f * 2 + i} />;
        })}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Destello b={b} en={[0.5]} color={K.lima} />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [RIB_A[0] - 0.25, RIB_A[1], RIB_A[2]], t: "Ribosoma", a: 0.04, z: 0.44, o: [60, 110], color: H_RIBO },
          { p: [RIB_A[0], RIB_A[1] + 0.75, RIB_A[2]], t: "Actina", a: 0.16, z: 0.46, o: [-70, -60], color: H_ACTINA },
          { p: [RIB_B[0], RIB_B[1] + 0.75, RIB_B[2]], t: "Miosina", a: 0.2, z: 0.46, o: [70, -60], color: H_MIOSINA },
          { p: [1.05, 1.3, 0.3], t: "Nuevas miofibrillas", a: 0.68, z: 1, o: [-40, 230], color: K.lima },
        ]}
      />
      <Dato b={b} a={0.62} z={1} t="+ MIOFIBRILLAS" sub="en paralelo → fibra más gruesa" color={K.lima} y={250} tam={96} />
    </AbsoluteFill>
  );
};

// 5 · Células satélite donan núcleos ------------------------------------------------------------
const Satelites: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const R = 0.8 * (1 + 0.14 * entre(b, 0.03, 0.3));
  const activa = entre(b, 0.36, 0.5);
  const fusion = [0, 1, 2].map((i) => entre(b, 0.52 + i * 0.07, 0.68 + i * 0.07));
  const nuevos = fusion.filter((f) => f > 0.6).length;
  const cam = camara(
    [
      { b: 0, p: [0.8, 0.9, 8.4], l: [0, -0.15, 0], fov: 38 },
      { b: 1, p: [-1.0, 0.7, 7.6], l: [-0.1, -0.15, 0], fov: 38 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[7, 20]}>
        <group rotation={[0, b * 0.5, 0]}>
          <FibraSatelite R={R} activa={activa} fusion={fusion} />
        </group>
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={{ ...cam }}
        b={b}
        items={[
          { p: rot(posSatelite(0, R, fusion[0]), b * 0.5), t: "Célula satélite", a: 0.36, z: 0.62, o: [-80, -90], color: H_SATELITE },
          { p: rot(posSatelite(1, R, fusion[1]), b * 0.5), t: "Núcleo nuevo", a: 0.74, z: 1, o: [-90, 90], color: H_NUCLEO },
        ]}
      />
      <Chip b={b} a={0.04} z={0.36} t="FIBRA MÁS GRANDE" x={540} y={330} color={K.rosa} />
      <Dato b={b} a={0.66} z={1} t="+ NÚCLEOS" sub="para sostener la fibra" color={H_NUCLEO} y={250} tam={104} />
      <Chip b={b} a={0.6} z={1} t={`MIONÚCLEOS: ${7 + nuevos}`} x={540} y={1100} color={K.cian} />
    </AbsoluteFill>
  );
};

/** Gira un punto alrededor del eje Y (para que las etiquetas sigan al modelo que rota). */
const rot = ([x, y, z]: V3, a: number): V3 => [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];

// 6 · Crece en el descanso: curva de síntesis de proteína 24–48 h ----------------------------------
const mps = (h: number) => (1 - Math.exp(-h / 3)) * (1 - (h / 50) ** 2);

const Curva: React.FC<{ b: number; a: number; z: number; prog: number }> = ({ b, a, z, prog }) => {
  const op = visible(b, a, z, 0.08);
  if (op <= 0) return null;
  const W = 860;
  const Hh = 300;
  const x0 = 70;
  const y0 = 250;
  const X = (h: number) => x0 + (h / 48) * (W - x0 - 30);
  const Y = (v: number) => y0 - v * 190;
  const hMax = prog * 48;
  const pts = Array.from({ length: 97 })
    .map((_, i) => (i / 96) * 48)
    .filter((h) => h <= hMax)
    .map((h) => `${X(h).toFixed(1)},${Y(mps(h)).toFixed(1)}`);
  const hc = Math.max(0, hMax);
  return (
    <div style={{ position: "absolute", left: (1080 - W) / 2, top: 820, width: W, height: Hh + 60, opacity: op }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(4,14,17,0.82)", borderRadius: 30, border: "3px solid rgba(255,255,255,0.18)" }} />
      <svg width={W} height={Hh + 60} style={{ position: "absolute", left: 0, top: 0 }}>
        <rect x={X(24)} y={30} width={X(48) - X(24)} height={y0 - 30} fill={K.lima} opacity={0.1} />
        <line x1={x0} y1={y0} x2={X(48)} y2={y0} stroke="rgba(255,255,255,0.6)" strokeWidth={3} />
        <line x1={x0} y1={y0} x2={x0} y2={36} stroke="rgba(255,255,255,0.6)" strokeWidth={3} />
        {[0, 12, 24, 36, 48].map((h) => (
          <g key={h}>
            <line x1={X(h)} y1={y0} x2={X(h)} y2={y0 + 10} stroke="#fff" strokeWidth={3} />
            <text x={X(h)} y={y0 + 42} fill={K.tinta} fontFamily={INTER} fontWeight={800} fontSize={30} textAnchor="middle">
              {h}
            </text>
          </g>
        ))}
        <text x={X(48) - 4} y={y0 + 80} fill={K.suave} fontFamily={INTER} fontWeight={800} fontSize={28} textAnchor="end">
          horas después de entrenar
        </text>
        <text x={x0 + 14} y={56} fill={K.lima} fontFamily={INTER} fontWeight={900} fontSize={30}>
          Síntesis de proteína
        </text>
        <text x={X(36)} y={92} fill={K.lima} fontFamily={INTER} fontWeight={900} fontSize={30} textAnchor="middle" opacity={prog > 0.55 ? 1 : 0.3}>
          24–48 h
        </text>
        {pts.length > 1 ? <polyline points={pts.join(" ")} fill="none" stroke={K.lima} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" /> : null}
        {prog > 0 ? <circle cx={X(hc)} cy={Y(mps(hc))} r={13} fill="#fff" stroke={K.lima} strokeWidth={5} /> : null}
        <text x={x0 + 10} y={y0 - 12} fill={K.naranja} fontFamily={INTER} fontWeight={900} fontSize={24}>
          ENTRENO
        </text>
      </svg>
    </div>
  );
};

const Descanso: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const prog = lineal(b, 0.42, 0.9);
  const resp = Math.sin(b * 9);
  const cam = camara(
    [
      { b: 0, p: [0.8, 2.6, 7.4], l: [0, -0.35, 0], fov: 38 },
      { b: 1, p: [-0.5, 2.4, 7.8], l: [0, -0.45, 0], fov: 38 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo="#0b1a33" luz={0.8}>
        <group position={[0, -0.2, 0]}>
          <Cama />
          <group position={[-0.81, 0.86, 0.02]} rotation={[0, 0, -Math.PI / 2]} scale={[1, 1, 1 + resp * 0.01]}>
            <Atleta ej="parado" musculo={0.9} brilla={0.2 + 0.35 * prog} colorBrillo={K.lima} />
          </group>
          <group position={[0, -0.04, 0]}>
            <Manta />
          </group>
        </group>
      </Escena3D>
      {/* luna y zzz */}
      <svg width={140} height={140} viewBox="0 0 24 24" style={{ position: "absolute", left: 860, top: 460, opacity: entre(b, 0.02, 0.12) }}>
        <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill={K.amarillo} />
      </svg>
      {[0, 1, 2].map((i) => {
        const f = ((b * 2.2 + i / 3) % 1);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 700 + f * 80,
              top: 600 - f * 130,
              fontFamily: INTER,
              fontWeight: 900,
              fontSize: 40 + f * 30,
              color: K.cian,
              opacity: Math.sin(f * Math.PI) * entre(b, 0.02, 0.1),
            }}
          >
            z
          </div>
        );
      })}
      <Dato b={b} a={0.04} z={1} t="CRECE EN EL DESCANSO" sub="no en el gym" color={K.lima} y={250} tam={76} />
      <Curva b={b} a={0.4} z={1.1} prog={prog} />
    </AbsoluteFill>
  );
};

// 7 · Material: ~1.6 g/kg/día, varias comidas, dormir -----------------------------------------
const PLATO: V3 = [0, -0.55, 0];
const COMIDAS: V3[] = [
  [-0.32, -0.42, 0.18],
  [0.3, -0.45, 0.12],
  [0.02, -0.45, -0.25],
];
const AMINOS = Array.from({ length: 27 }).map((_, i) => {
  const j = i % 3;
  const c = COMIDAS[j];
  const k = Math.floor(i / 3);
  return {
    color: AA[i % AA.length],
    cadena: [c[0] + Math.cos(k * 0.9) * 0.1, c[1] + 0.25 + k * 0.06, c[2] + Math.sin(k * 0.9) * 0.1] as V3,
    fin: [-0.9 + (i / 26) * 1.8, 0.45 + Math.sin(i * 2.1) * 0.2, 0.3 + Math.cos(i * 1.3) * 0.15] as V3,
  };
});

const Comidas: React.FC<{ b: number; a: number; z: number }> = ({ b, a, z }) => {
  const op = visible(b, a, z, 0.06);
  if (op <= 0) return null;
  const h = ["8:00", "13:00", "17:00", "21:00"];
  return (
    <div style={{ position: "absolute", top: 250, left: 0, right: 0, textAlign: "center", opacity: op }}>
      <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 44, color: K.tinta, marginBottom: 14, textShadow: "0 4px 16px #000" }}>
        REPARTIDA EN <span style={{ color: K.lima }}>3–4 COMIDAS</span>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 18 }}>
        {h.map((t, i) => {
          const on = entre(b, a + 0.03 + i * 0.04, a + 0.06 + i * 0.04);
          return (
            <div
              key={i}
              style={{
                width: 170,
                padding: "14px 0",
                borderRadius: 24,
                fontFamily: INTER,
                fontWeight: 900,
                fontSize: 38,
                color: on > 0.5 ? "#071316" : K.suave,
                background: on > 0.5 ? K.lima : "rgba(4,14,17,0.8)",
                border: "3px solid rgba(255,255,255,0.25)",
                transform: `scale(${0.9 + 0.1 * on})`,
              }}
            >
              {t}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Material: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const suelta = entre(b, 0.08, 0.2);
  const llega = entre(b, 0.66, 0.84);
  const cam = camara(
    [
      { b: 0, p: [0, 1.0, 6.8], l: [0, -0.25, 0], fov: 38 },
      { b: 1, p: [0.8, 1.2, 6.6], l: [0, -0.25, 0], fov: 38 },
    ],
    b,
  );
  const dorm = b > 0.84;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={dorm ? "#0b1a33" : K.fondo2}>
        <group rotation={[0, 0, Math.PI / 2]} position={[0, 0.45, 0]}>
          <F2Fibra p={[0, 0, 0]} color="#d24a58" r={0.3} alto={2.1} grosor={1 + 0.12 * llega} act={0.1 + 0.4 * llega} seed="mat" />
        </group>
        <group position={PLATO}>
          <Plato p={[0, 0, 0]} escala={1.5} />
          <Pechuga p={[-0.32, 0.08, 0.18]} escala={0.6} />
          <Huevo p={[0.3, 0.05, 0.12]} escala={0.75} />
          <Frijoles p={[0.02, 0.02, -0.25]} escala={0.45} />
        </group>
        {AMINOS.map((a, i) => {
          const f = entre(b, 0.22 + (i % 9) * 0.025, 0.5 + (i % 9) * 0.025);
          const ini = mix3(a.cadena, [a.cadena[0] * 2.2, a.cadena[1] + 0.25, a.cadena[2] + 0.4], suelta);
          const p = mix3(ini, a.fin, f);
          if (f >= 1 && llega > 0.5) return null;
          return <Esfera key={i} p={p} r={0.055} color={a.color} brillo={0.5} />;
        })}
        {suelta < 1
          ? COMIDAS.map((c, j) =>
              AMINOS.filter((_, i) => i % 3 === j)
                .slice(0, -1)
                .map((a, k) => <Enlace key={`${j}${k}`} a={a.cadena} b={AMINOS[(k + 1) * 3 + j].cadena} r={0.015} op={1 - suelta} />),
            )
          : null}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.6, -0.1, 0.3], t: "Aminoácidos", a: 0.2, z: 0.5, o: [-60, 80], color: K.cian },
          { p: [0.9, 0.55, 0.3], t: "Fibra", a: 0.4, z: 0.84, o: [10, -90], color: K.rosa },
        ]}
      />
      <Dato b={b} a={0.12} z={0.56} t="≈1.6 g/kg/día" sub="de proteína" color={K.lima} y={250} tam={104} />
      <Comidas b={b} a={0.56} z={0.84} />
      {dorm ? (
        <div style={{ position: "absolute", top: 250, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: entre(b, 0.84, 0.9) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, background: "rgba(4,14,17,0.85)", border: `4px solid ${K.amarillo}`, borderRadius: 34, padding: "14px 40px" }}>
            <svg width={90} height={90} viewBox="0 0 24 24">
              <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill={K.amarillo} />
            </svg>
            <span style={{ fontFamily: '"Anton", Impact, sans-serif', fontSize: 92, color: K.amarillo }}>+ DORMIR BIEN</span>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// 8 · Fibras rápidas crecen más; cerca del fallo se reclutan -----------------------------------
const Reclutar: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fase1 = b < 0.4;
  const crece = entre(b, 0.08, 0.3);
  const esf = entre(b, 0.44, 0.86);
  const lento = mix(3.2, 1.6, esf);
  const k = Math.sin((((b - 0.4) * lento) % 1) * Math.PI);
  const act: [number, number, number] = fase1 ? [0.2, 0.2, 0.2] : [entre(esf, 0.02, 0.12), entre(esf, 0.42, 0.52), entre(esf, 0.82, 0.92)];
  const gII = mix(1, 1.3, fase1 ? crece : entre(b, 0.88, 0.98));
  const gI = mix(1, 1.08, fase1 ? crece : entre(b, 0.88, 0.98));
  const haz: V3 = [0.62, 1.15, 0.3];
  const cam = fase1
    ? camara(
        [
          { b: 0, p: [1.0, 0.9, 7.2], l: [0, -0.15, 0], fov: 38 },
          { b: 0.4, p: [-0.6, 0.8, 7.6], l: [0, -0.15, 0], fov: 38 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.4, p: [0.3, 1.15, 5.6], l: [0.12, 0.74, 0], fov: 36 },
          { b: 1, p: [0.1, 1.1, 5.3], l: [0.12, 0.74, 0], fov: 36 },
        ],
        b,
      );
  const bic: V3 = [-0.45 + 0.24, 1.32, 0.06];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        {fase1 ? (
          <group rotation={[-0.12, 0, 0]}>
            <CorteHaz grosor={[gI, gII, gII]} tipos={1} act={act} seed="rc" />
          </group>
        ) : (
          <>
            <group position={[-0.45, 0, 0]}>
              <Atleta ej="curl" k={k} brilla={0.15 + 0.6 * esf} colorBrillo={esf > 0.8 ? K.rojo : K.amarillo} />
              <Piso color={esf > 0.8 ? K.rojo : K.amarillo} />
            </group>
            <Enlace a={bic} b={[haz[0] - 0.38, haz[1], haz[2]]} r={0.008} color={K.tinta} op={0.7} />
            <group position={haz} scale={0.42}>
              <CorteHaz grosor={[gI, gII, gII]} tipos={1} act={act} seed="rc" />
            </group>
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.4]} />
      {fase1 ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: rotX(celdaHaz(2, [0.4, 0.5], 0.8, 0.2, "rc", gII)), t: "Rápidas (tipo II)", a: 0.08, z: 0.4, o: [-60, -110], color: F2_COL.IIx },
            { p: rotX(celdaHaz(0, [-0.3, -0.5], 0.8, 0.2, "rc", gII)), t: "Lentas (tipo I)", a: 0.14, z: 0.4, o: [60, 120], color: "#ff6b7a" },
          ]}
        />
      ) : null}
      <Dato b={b} a={0.03} z={0.4} t="TIPO II" sub="las que más crecen" color={F2_COL.IIx} y={250} tam={110} />
      <Dato b={b} a={0.44} z={0.82} t={`Rep ${Math.min(10, 1 + Math.floor(esf * 9.99))}`} sub={esf > 0.5 ? "se suman las rápidas" : "solo lentas"} color={K.amarillo} y={250} tam={100} />
      <Dato b={b} a={0.82} z={1} t="CERCA DEL FALLO" sub="así reclutas las rápidas" color={K.rojo} y={250} tam={92} />
      <Medidor
        b={b}
        a={0.42}
        z={1}
        valor={esf}
        titulo="ESFUERZO"
        y={1010}
        marcas={[
          { v: 0.42, c: F2_COL.IIa, t: "IIa" },
          { v: 0.82, c: F2_COL.IIx, t: "IIx" },
        ]}
      />
    </AbsoluteFill>
  );
};

/** Aplica la inclinación del corte en la fase 1 (rotación -0.12 en X). */
const rotX = ([x, y, z]: V3, a = -0.12): V3 => [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];

const Final: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Cuántos <span style={{ color: K.lima }}>días</span> entrenas?</>}
    escribe="Entreno…"
    ideas={["2–3 DÍAS", "4–5 DÍAS", "6 O MÁS"]}
  />
);

const T = [
  "Unos ganan músculo rápido y otros no. Para entenderlo, hay que ver qué pasa **dentro** de tu fibra cuando entrenas: la **hipertrofia**.",
  "Hipertrofia es que tus fibras musculares se hacen más **gruesas**. No aparecen fibras nuevas: las que ya tienes crecen.",
  "Todo empieza con la **tensión mecánica**: cuando levantas algo pesado o llevas la serie cerca del fallo, la fibra se tensa con mucha fuerza.",
  "La fibra detecta esa tensión y enciende una señal interna, la vía **mTOR**: el interruptor que ordena fabricar más proteína.",
  "Los ribosomas fabrican más **actina y miosina**, se añaden nuevos sarcómeros y la fibra gana grosor.",
  "Y para sostener una fibra más grande, las **células satélite** le donan núcleos nuevos.",
  "Pero el músculo crece en el **descanso**, no en el gym: la síntesis de proteína sigue elevada hasta **uno o dos días** después de entrenar.",
  "Y necesita material: alrededor de **1.6 gramos de proteína por kilo** al día, repartida en varias comidas, y dormir bien.",
  "Las fibras **rápidas** son las que más crecen. Por eso importa llevar cada serie cerca del fallo: así también las reclutas.",
  "En el próximo video: por qué te **fatigas**. ¿Cuántos días a la semana entrenas? **Escríbelo en los comentarios**.",
];

const ESCENAS = [Gancho, Grosor, Tension, MTor, Ribosomas, Satelites, Descanso, Material, Reclutar, Final];

export const HIPERTROFIA: ShortDef = {
  id: "Short-Hipertrofia",
  titulo: "Hipertrofia: cómo crece tu músculo",
  planos: ESCENAS.map((Escena, i) => ({ id: `hipertrofia-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
