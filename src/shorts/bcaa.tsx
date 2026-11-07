// Short: ¿Sirven los BCAA? Leucina enciende mTOR, pero se necesitan los 9 aminoácidos esenciales.
// Fuentes: Wolfe 2017 (JISSN), Jackman et al. 2017 (Front Physiol), Salem et al. 2024 (Sports Med Open), Weber et al. 2021 (Amino Acids).
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { Polvo } from "../fisio/modelos/comun";
import { Esfera, Mol } from "../fisio/modelos/energia";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaComentarios } from "./cierre";
import { Chip, Dato, Destello, INTER, K, ShortDef, Titular } from "./marco";
import { Frijoles, Huevo, Pechuga, Piso, Plato } from "./modelos";
import { AtletaDolor, DOLOR } from "./modelos-agujetas";
import {
  AminoBCAA,
  AminoFantasma,
  BCAA_C,
  Casco,
  EAA_C,
  FrascoBCAA,
  ISO_C,
  MedidorDolor,
  Megafono,
  Ondas,
  Pared,
  ramaBCAA,
  Tache,
  VAL_C,
} from "./modelos-bcaa";
import { Capsula } from "./modelos-energia";
import { FibraMiofibrillas, H_RIBO, Interruptor, Ribosoma } from "./modelos-hipertrofia";
import { bolaInterruptor, LEU_C, Leucina, MTOR_C } from "./modelos-mtor";
import { Balanza, Barra3D, Rotulos } from "./modelos-sueno";
import { AtletaShaker, Shaker } from "./modelos-ventana";
import { camViaje, cortesViaje, tramoViaje, Viaje } from "./viaje";

/** Pulsos que viajan de a -> b en bucle. */
const Pulsos: React.FC<{ a: V3; b: V3; t: number; op: number; color?: string; n?: number; r?: number }> = ({ a, b, t, op, color = "#ffffff", n = 3, r = 0.06 }) =>
  op <= 0.01 ? null : (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <Mol key={i} p={mix3(a, b, (t + i / n) % 1)} color={color} r={r} brillo={1.6} op={op} />
      ))}
    </>
  );

/** Aminoácido simple (esfera) del tipo i (0..8); la leucina usa el modelo naranja de la serie. */
const AA: React.FC<{ tipo: number; p: V3; r?: number; giro?: number; op?: number }> = ({ tipo, p, r = 0.09, giro = 0, op = 1 }) =>
  tipo === 0 ? <Leucina p={p} r={r} giro={giro} op={op} /> : <Esfera p={p} r={r} color={EAA_C[tipo]} brillo={0.5} op={op} />;

/** Pie de fuente pequeño. */
const Fuente: React.FC<{ b: number; a: number; t: string; y?: number }> = ({ b, a, t, y = 1135 }) => (
  <div
    style={{
      position: "absolute",
      top: y,
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: INTER,
      fontWeight: 700,
      fontSize: 28,
      color: K.suave,
      opacity: visible(b, a, 1.1, 0.06),
    }}
  >
    {t}
  </div>
);

// 0 · Gancho: atleta en el gym con su shaker de BCAA; el bote rotulado ---------------------------------
const BANCO0 = 0.7;
const FR0: V3 = [0.72, BANCO0, 0.3];
const CAPS0: { p: V3; rot: V3 }[] = [
  { p: [0.48, BANCO0 + 0.04, 0.5], rot: [Math.PI / 2, 0, 0.4] },
  { p: [0.56, BANCO0 + 0.04, 0.62], rot: [Math.PI / 2, 0, -0.9] },
  { p: [0.92, BANCO0 + 0.04, 0.58], rot: [Math.PI / 2, 0, 1.6] },
  { p: [0.98, BANCO0 + 0.04, 0.42], rot: [Math.PI / 2, 0, 0.2] },
];

const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const bebe = Math.max(0, Math.sin(lineal(b, 0.08, 0.42) * Math.PI));
  const cam = camara(
    [
      { b: 0, p: [0.9, 1.2, 6.4], l: [0.25, 0.68, 0], fov: 36 },
      { b: 0.45, p: [0.3, 1.1, 5.6], l: [0.25, 0.7, 0], fov: 36 },
      { b: 1, p: [1.1, 1.3, 3.2], l: [0.62, 0.78, 0.3], fov: 36 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <group position={[-0.25, 0, 0]}>
          <AtletaShaker bebe={bebe} musculo={0.9} colorShaker={LEU_C} brilla={0.1} colorBrillo={LEU_C} />
          <Piso color={LEU_C} />
        </group>
        <FrascoBCAA p={FR0} escala={0.42} giro={-0.25} brillo={entre(b, 0.45, 0.6)} />
        {CAPS0.map((c, i) => (
          <Capsula key={i} p={c.p} rot={c.rot} escala={1.2} color={LEU_C} />
        ))}
        <mesh position={[0.72, BANCO0 / 2, 0.4]}>
          <boxGeometry args={[0.75, BANCO0, 0.55]} />
          <meshPhysicalMaterial color="#1d2b30" roughness={0.6} clearcoat={0.3} />
        </mesh>
        <mesh position={[0.72, BANCO0 + 0.005, 0.4]}>
          <boxGeometry args={[0.8, 0.02, 0.6]} />
          <meshStandardMaterial color="#2c3f45" />
        </mesh>
      </Escena3D>
      <Chip b={b} a={0.06} z={0.5} t="DE LOS MÁS VENDIDOS" x={540} y={330} color={LEU_C} />
      <Titular b={b} a={0.5} z={1.1} y={270} tam={124} color={LEU_C} t="¿SIRVEN LOS BCAA?" />
      <Chip b={b} a={0.78} z={1.1} t="¿GANAR MÚSCULO?" x={540} y={1100} color={MTOR_C} />
    </AbsoluteFill>
  );
};

// 1 · Tres aminoácidos de cadena ramificada salen del bote --------------------------------------------
const MOL1: { tipo: 0 | 1 | 2; p: V3; nombre: string; a: number }[] = [
  { tipo: 0, p: [-1.08, -0.55, 0], nombre: "LEUCINA", a: 0.7 },
  { tipo: 1, p: [0, -0.55, 0], nombre: "ISOLEUCINA", a: 0.8 },
  { tipo: 2, p: [1.08, -0.55, 0], nombre: "VALINA", a: 0.9 },
];
const FR1: V3 = [0, -1.95, 0];
const ESC1 = 0.85;

const Ramificados: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const tapa = entre(b, 0.02, 0.12);
  const rama = visible(b, 0.42, 0.68, 0.05);
  const cam = camara(
    [
      { b: 0, p: [0.3, -0.9, 8.4], l: [0, -1.35, 0], fov: 40 },
      { b: 1, p: [-0.3, -0.8, 8.9], l: [0, -1.3, 0], fov: 40 },
    ],
    b,
  );
  const pos = MOL1.map((m, i) => {
    const f = entre(b, 0.1 + i * 0.07, 0.32 + i * 0.07);
    const q = mix3([FR1[0], FR1[1] + 0.65, FR1[2]], m.p, f);
    return { f, q: [q[0], q[1] + Math.sin(b * 5 + i * 2) * 0.04, q[2]] as V3 };
  });
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 22]}>
        <FrascoBCAA p={FR1} escala={0.7} tapa={tapa} />
        {MOL1.map((m, i) =>
          pos[i].f > 0 ? (
            <AminoBCAA
              key={i}
              tipo={m.tipo}
              p={pos[i].q}
              escala={ESC1 * mix(0.3, 1, pos[i].f)}
              giro={Math.sin(b * 3 + i) * 0.45}
              rama={Math.max(rama, entre(b, m.a, m.a + 0.04) * visible(b, m.a, 1.1, 0.04))}
            />
          ) : null,
        )}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          ...MOL1.map((m, i) => {
            const r = ramaBCAA(m.tipo);
            return { p: [pos[i].q[0] + r[0] * ESC1, pos[i].q[1] + r[1] * ESC1, pos[i].q[2]] as V3, t: "Rama", a: 0.44 + i * 0.03, z: 0.68, o: [0, -80] as [number, number], color: "#ffffff" };
          }),
        ]}
      />
      <Rotulos cam={cam} b={b} items={MOL1.map((m, i) => ({ p: [pos[i].q[0], pos[i].q[1] - 0.6 * ESC1, 0.2] as V3, t: m.nombre, a: m.a, z: 1.1, color: BCAA_C[m.tipo], tam: 40, anton: true }))} />
      <Dato b={b} a={0.12} z={1.1} t="3 AMINOÁCIDOS" sub="de cadena ramificada" color={LEU_C} y={250} tam={100} />
    </AbsoluteFill>
  );
};

// 2 · Viaje al interior de la fibra: la leucina enciende mTOR -----------------------------------------
const SW2: V3 = [0, -0.15, 5.5];
const LEU2: V3[] = [
  [-1.3, 1.4, 6.2],
  [1.3, 1.2, 6.0],
  [-1.0, -1.3, 6.3],
  [1.2, -1.1, 5.8],
  [0.1, 1.8, 5.6],
];

const Enciende: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const t = lineal(b, 0.1, 0.5);
  const tramo = tramoViaje(t);
  const cam = camViaje(t);
  const aparece = entre(b, 0.46, 0.54);
  const on = entre(b, 0.7, 0.78);
  const meta = bolaInterruptor(SW2, 0, 0.6);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2} niebla={t > 0.72 ? [10, 34] : undefined}>
        {tramo === 0 ? (
          <>
            <AtletaShaker bebe={0.6 + 0.4 * Math.sin(lineal(b, 0, 0.1) * Math.PI)} musculo={0.9} colorShaker={LEU_C} brilla={0.2 + 0.6 * entre(b, 0.0, 0.12)} colorBrillo={LEU_C} />
            <Piso color={LEU_C} />
          </>
        ) : (
          <Viaje t={t} b={b} interior={{ pcr: 6, brillo: 0.15 }} />
        )}
        {aparece > 0 ? (
          <>
            <Interruptor p={SW2} on={on} escala={0.6 * aparece} />
            {LEU2.map((q, i) => {
              const f = entre(b, 0.52 + i * 0.03, 0.68 + i * 0.02);
              if (f >= 1) return null;
              const p = mix3(q, [meta[0], meta[1], meta[2] + 0.1], f);
              return <Leucina key={i} p={p} r={0.075} giro={b * 6 + i} op={aparece} />;
            })}
            <Pulsos a={[SW2[0], SW2[1] + 0.3, SW2[2]]} b={[SW2[0], SW2[1] + 1.4, SW2[2]]} t={b * 4} op={on} color={MTOR_C} n={3} r={0.05} />
          </>
        ) : null}
      </Escena3D>
      <Destello b={b} en={[...cortesViaje(0.1, 0.5), 0.74]} />
      <Dato b={b} a={0.02} z={0.5} t="LEUCINA" sub="el BCAA estrella" color={LEU_C} y={250} tam={104} />
      <Titular b={b} a={0.72} z={1.1} y={270} tam={140} color={MTOR_C} t="mTOR" />
      <Chip b={b} a={0.74} z={1.1} t="LEUCINA → mTOR" x={540} y={1100} color={LEU_C} />
      {aparece > 0 ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: LEU2[0], t: "Leucina", a: 0.53, z: 0.7, o: [40, -80], color: LEU_C },
            { p: [SW2[0] + 0.3, SW2[1] - 0.1, SW2[2] + 0.2], t: "mTOR", a: 0.6, z: 1.1, o: [90, 90], color: MTOR_C },
          ]}
        />
      ) : null}
    </AbsoluteFill>
  );
};

// 3 · El ribosoma necesita los 9 esenciales: solo llegan 3 y la cadena se detiene ---------------------
const RIB3: V3 = [0, -0.35, 0];
const ESC3 = 1.3;
const SW3: V3 = [-0.95, 1.0, 0];
/** Secuencia que pide el ARNm (tipos 0..8). Los 3 primeros son BCAA; el 4º (lisina) no llega. */
const SEC3 = [0, 2, 1, 3, 6, 0, 4, 8];
const slot3 = (i: number): V3 => [RIB3[0] + Math.sin(i * 0.9) * 0.1 + i * 0.07, RIB3[1] + 0.6 + i * 0.14, RIB3[2] + 0.1 + Math.cos(i * 0.9) * 0.1];
const FILA3 = Array.from({ length: 9 }).map((_, i) => [(i - 4) * 0.36, -1.3, 0.3] as V3);

const NueveEsenciales: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const on = entre(b, 0.02, 0.08);
  const llega = [0, 1, 2].map((i) => entre(b, 0.16 + i * 0.07, 0.26 + i * 0.07));
  const para = entre(b, 0.42, 0.46);
  const fila = entre(b, 0.52, 0.6);
  const cam = camara(
    [
      { b: 0, p: [0.3, 0.5, 8.2], l: [0, -0.1, 0], fov: 40 },
      { b: 0.48, p: [-0.3, 0.4, 8.6], l: [0, -0.15, 0], fov: 40 },
      { b: 0.62, p: [0.2, 0.1, 10.8], l: [0, -0.56, 0], fov: 40 },
      { b: 1, p: [-0.3, 0.1, 11.0], l: [0, -0.56, 0], fov: 40 },
    ],
    b,
  );
  const ini = (i: number): V3 => [-1.9 + i * 0.25, -0.6 + i * 0.5, 0.6];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 24]}>
        <Interruptor p={SW3} on={on} escala={0.5} />
        <Pulsos a={[SW3[0] + 0.2, SW3[1], SW3[2]]} b={[RIB3[0] - 0.3, RIB3[1] + 0.3, RIB3[2]]} t={b * 4} op={visible(b, 0.06, 0.46, 0.04)} color={MTOR_C} />
        <Ribosoma p={RIB3} color={H_RIBO} n={0} avance={lineal(b, 0, 0.42) * 8} escala={ESC3} />
        {para > 0 ? (
          <mesh position={[RIB3[0], RIB3[1], RIB3[2]]}>
            <sphereGeometry args={[0.62 + 0.04 * Math.sin(b * 40), 24, 16]} />
            <meshBasicMaterial color={K.rojo} transparent opacity={0.12 * para} depthWrite={false} />
          </mesh>
        ) : null}
        {/* cadena: 3 BCAA colocados y huecos de los que faltan */}
        {SEC3.map((tipo, i) => {
          if (i < 3) {
            const f = llega[i];
            if (f <= 0) return null;
            const p = mix3(ini(i), slot3(i), f);
            return <AA key={i} tipo={tipo} p={p} r={0.09} giro={b * 3} />;
          }
          return <AminoFantasma key={i} p={slot3(i)} color={EAA_C[tipo]} op={entre(b, 0.3, 0.4)} pulso={i === 3 ? 0.5 + 0.5 * Math.sin(b * 30) : 0} />;
        })}
        {/* los 9 esenciales: solo hay 3 */}
        {fila > 0
          ? FILA3.map((q, i) => (
              <group key={i}>
                {i < 3 ? <AA tipo={i} p={q} r={0.12 * fila} giro={b * 3} /> : <AminoFantasma p={q} color={EAA_C[i]} r={0.12 * fila} />}
                {i >= 3 ? <Tache p={[q[0], q[1], q[2] + 0.15]} escala={0.55} op={entre(b, 0.62 + (i - 3) * 0.02, 0.66 + (i - 3) * 0.02)} /> : null}
              </group>
            ))
          : null}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Destello b={b} en={[0.44]} color={K.rojo} />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [SW3[0] - 0.2, SW3[1] - 0.1, SW3[2] + 0.2], t: "mTOR encendido", a: 0.04, z: 0.5, o: [40, 110], color: MTOR_C },
          { p: [RIB3[0] + 0.3, RIB3[1] - 0.1, RIB3[2] + 0.2], t: "Ribosoma", a: 0.08, z: 0.5, o: [90, 60], color: H_RIBO },
          { p: slot3(3), t: "Falta lisina", a: 0.44, z: 0.62, o: [100, -30], color: K.rojo },
        ]}
      />
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [FILA3[1][0], FILA3[1][1] - 0.35, 0.3], t: "BCAA", a: 0.58, z: 1.1, color: LEU_C, tam: 34, anton: true },
          { p: [FILA3[6][0], FILA3[6][1] - 0.35, 0.3], t: "LOS OTROS 6", a: 0.64, z: 1.1, color: K.suave, tam: 34, anton: true },
        ]}
      />
      <Dato b={b} a={0.02} z={0.42} t="ENCENDER NO BASTA" sub="hay que construir" color={MTOR_C} y={250} tam={90} />
      <Dato b={b} a={0.44} z={1.1} t="SE NECESITAN LOS 9" sub="aminoácidos esenciales" color={K.amarillo} y={250} tam={100} />
      <Chip b={b} a={0.84} z={1.1} t="NO SOLO 3" x={540} y={1035} color={K.rojo} />
    </AbsoluteFill>
  );
};

// 4 · Metáfora de la obra: el jefe (mTOR) da órdenes, pero faltan ladrillos ---------------------------
const SW4: V3 = [-1.2, -0.95, 0.2];
const ESC4 = 0.7;
const PARED4: V3 = [0.55, -1.15, 0];
const FALTAN4 = [2, 8, 9];

const Obra: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const ordena = visible(b, 0.12, 1.1, 0.05);
  const n = lineal(b, 0.3, 0.62) * 13;
  const bola = bolaInterruptor(SW4, 1, ESC4);
  const cam = camara(
    [
      { b: 0, p: [-0.2, 0.4, 8.4], l: [-0.2, -0.55, 0], fov: 40 },
      { b: 1, p: [0.5, 0.5, 8.8], l: [-0.1, -0.5, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 24]}>
        <Interruptor p={SW4} on={1} escala={ESC4} />
        <Casco p={[bola[0], bola[1] + 0.04, bola[2]]} escala={0.42} />
        <Megafono p={[bola[0] + 0.28, bola[1] - 0.12, bola[2] + 0.1]} escala={0.8} rot={[0, 0, 0.12]} brillo={ordena} />
        <Ondas p={[bola[0] + 0.65, bola[1] - 0.07, bola[2] + 0.1]} f={b * 4} op={ordena} />
        <Pared p={PARED4} n={n} filas={6} cols={5} faltan={FALTAN4} />
        {/* suelo de la obra */}
        <mesh position={[0, -1.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.6, 48]} />
          <meshStandardMaterial color="#13262b" roughness={0.9} />
        </mesh>
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [SW4[0] + 0.05, bola[1] + 0.55, SW4[2]], t: "JEFE = mTOR", a: 0.18, z: 1.1, color: MTOR_C, tam: 40, anton: true },
          { p: [PARED4[0] + 0.1, PARED4[1] + 1.65, 0], t: "LADRILLOS = AMINOÁCIDOS", a: 0.62, z: 1.1, color: K.amarillo, tam: 40, anton: true },
        ]}
      />
      <Etiquetas cam={cam} b={b} items={[{ p: [PARED4[0] + 0.3, PARED4[1] + 1.2, 0.1], t: "Faltan ladrillos", a: 0.7, z: 1.1, o: [-40, 130], color: K.rojo }]} />
      <Dato b={b} a={0.02} z={0.62} t="COMO UNA OBRA" color={K.amarillo} y={250} tam={104} />
      <Dato b={b} a={0.62} z={1.1} t="SIN LADRILLOS" sub="la pared no se levanta" color={K.rojo} y={250} tam={104} />
    </AbsoluteFill>
  );
};

// 5 · Sin los demás aminoácidos, la fibra se desarma para obtenerlos; la balanza no gana ------------
const FIB5: V3 = [-0.95, -0.7, -0.2];
const RIB5: V3 = [0.8, 0.15, 0.3];
/** Proteína de la fibra (hélice) con aminoácidos que NO son BCAA. */
const PROT5 = Array.from({ length: 12 }).map((_, i) => {
  const a = i * 0.95;
  return {
    tipo: 3 + (i % 6),
    p: [-0.35 + Math.cos(a) * 0.17, -1.35 + i * 0.13, 0.5 + Math.sin(a) * 0.17] as V3,
  };
});
const BCAA5: { tipo: number; ini: V3 }[] = [
  { tipo: 0, ini: [0.4, 2.2, 0.4] },
  { tipo: 1, ini: [1.2, 2.3, 0.2] },
  { tipo: 2, ini: [1.8, 1.9, 0.5] },
];

const Degrada: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fase1 = b < 0.5;
  const rompe = entre(b, 0.14, 0.3);
  const llegaB = entre(b, 0.02, 0.12);
  const construye = lineal(b, 0.22, 0.48);
  const cam = fase1
    ? camara(
        [
          { b: 0, p: [0.3, 0.4, 9.6], l: [0, -0.6, 0], fov: 40 },
          { b: 0.5, p: [-0.3, 0.3, 9.2], l: [0, -0.6, 0], fov: 40 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.5, p: [0.3, 2.0, 10.4], l: [0, 0.55, 0], fov: 40 },
          { b: 1, p: [-0.4, 2.1, 11.0], l: [0, 0.55, 0], fov: 40 },
        ],
        b,
      );
  const salida: V3 = [RIB5[0] - 0.35, RIB5[1] - 0.05, RIB5[2] + 0.1];
  const inclina = 0.06 * Math.sin(b * 14);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 24]}>
        {fase1 ? (
          <>
            <group position={FIB5} scale={[0.55 * mix(1, 0.92, rompe), 0.55, 0.55 * mix(1, 0.92, rompe)]}>
              <FibraMiofibrillas brillo={0.6 * rompe * (0.6 + 0.4 * Math.sin(b * 30))} />
            </group>
            {rompe > 0.05 ? (
              <mesh position={FIB5}>
                <sphereGeometry args={[0.95, 24, 16]} />
                <meshBasicMaterial color={K.rojo} transparent opacity={0.1 * rompe} depthWrite={false} />
              </mesh>
            ) : null}
            {/* proteína de la fibra que se rompe y suelta aminoácidos hacia el ribosoma */}
            {PROT5.map((a, i) => {
              const f = entre(b, 0.2 + i * 0.015, 0.36 + i * 0.015);
              if (f >= 1) return null;
              const suelta = mix3(a.p, [a.p[0] + 0.25 + Math.sin(i * 2.1) * 0.3, a.p[1] + Math.cos(i * 1.7) * 0.15, a.p[2] + 0.2], rompe);
              const p = mix3(suelta, salida, f);
              return <AA key={i} tipo={a.tipo} p={[p[0], p[1] + Math.sin(f * Math.PI) * 0.35, p[2]]} r={0.075} />;
            })}
            {BCAA5.map((a, i) => {
              if (construye > 0.15 * (i + 1)) return null;
              return <AA key={`b${i}`} tipo={a.tipo} p={mix3(a.ini, salida, llegaB * 0.85)} r={0.08} giro={b * 4} />;
            })}
            <Ribosoma p={RIB5} color={K.amarillo} n={construye * 12} avance={construye * 8} escala={1.1} />
          </>
        ) : (
          <>
            <Balanza inclina={inclina} sintesis={8} degrada={8} />
            <Polvo b={b} radio={4} />
          </>
        )}
        {fase1 ? <Polvo b={b} radio={4} /> : null}
      </Escena3D>
      <Destello b={b} en={[0.5]} />
      {fase1 ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [BCAA5[0].ini[0], BCAA5[0].ini[1], BCAA5[0].ini[2]], t: "BCAA", a: 0.02, z: 0.16, o: [-60, -60], color: LEU_C },
            { p: [FIB5[0], FIB5[1] + 0.75, FIB5[2]], t: "Tu músculo", a: 0.1, z: 0.5, o: [40, -130], color: "#f39aa0" },
            { p: PROT5[6].p, t: "Los demás aminoácidos", a: 0.22, z: 0.5, o: [110, 70], color: K.amarillo },
            { p: [RIB5[0] + 0.3, RIB5[1] - 0.2, RIB5[2]], t: "Ribosoma", a: 0.06, z: 0.5, o: [-40, 120], color: H_RIBO },
          ]}
        />
      ) : (
        <Rotulos
          cam={cam}
          b={b}
          items={[
            { p: [-1.3, 0.95, 0.3], t: "SÍNTESIS", a: 0.52, z: 1.1, color: "#3ee07a", tam: 40, anton: true },
            { p: [1.3, 0.95, 0.3], t: "DEGRADACIÓN", a: 0.54, z: 1.1, color: K.rojo, tam: 40, anton: true },
          ]}
        />
      )}
      <Dato b={b} a={0.12} z={0.5} t="ROMPE TU MÚSCULO" sub="para sacar los demás aminoácidos" color={K.rojo} y={250} tam={92} />
      <Dato b={b} a={0.56} z={1.1} t="BCAA SOLOS" sub="sin respuesta anabólica real" color={K.amarillo} y={250} tam={104} />
      <Chip b={b} a={0.66} z={1.1} t="NO GANA LA SÍNTESIS" x={540} y={1060} color={K.amarillo} />
      <Fuente b={b} a={0.6} t="Wolfe 2017 (revisión)" />
    </AbsoluteFill>
  );
};

// 6 · Barras: placebo, BCAA (+22 %) y proteína completa (≈ el doble del aumento) ------------------------
const BAR6: { x: number; v: number; color: string; a: number; z: number; nombre: string }[] = [
  { x: -1.0, v: 1.0, color: K.suave, a: 0.04, z: 0.18, nombre: "PLACEBO" },
  { x: 0, v: 1.22, color: LEU_C, a: 0.2, z: 0.4, nombre: "BCAA" },
  { x: 1.0, v: 1.44, color: MTOR_C, a: 0.62, z: 0.8, nombre: "PROTEÍNA\nCOMPLETA" },
];
const ALTO6 = 1.1;
const Y6 = -1.0;

const Barras: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.5, 0.5, 8.8], l: [0, -0.55, 0], fov: 40 },
      { b: 1, p: [-0.5, 0.6, 9.0], l: [0, -0.55, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[9, 24]}>
        {BAR6.map((r, i) => {
          const v = Math.max(0.01, r.v * entre(b, r.a, r.z));
          return (
            <group key={i} position={[r.x, Y6, 0]}>
              <Barra3D valor={v} color={r.color} alto={ALTO6} r={0.26} />
            </group>
          );
        })}
        <FrascoBCAA p={[BAR6[1].x + 0.05, Y6, 0.75]} escala={0.32} brillo={0.3} />
        <group position={[BAR6[2].x, Y6 + 0.27, 0.75]}>
          <Shaker escala={3.0} color={MTOR_C} nivel={0.8} />
        </group>
        <Capsula p={[BAR6[0].x, Y6 + 0.05, 0.75]} rot={[Math.PI / 2, 0, 0.6]} escala={1.6} color="#d9e2e6" />
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          ...BAR6.map((r, i) => ({
            p: [r.x, Y6 - 0.24, 0.6] as V3,
            t: i === 2 ? <>PROTEÍNA<br />COMPLETA</> : r.nombre,
            a: r.a,
            z: 1.1,
            color: r.color,
            tam: 34,
            anton: true,
          })),
          { p: [BAR6[1].x, Y6 + 0.08 + ALTO6 * 1.22 + 0.32, 0.3], t: "+22 %", a: 0.4, z: 1.1, color: LEU_C, tam: 60, anton: true },
          { p: [BAR6[2].x, Y6 + 0.08 + ALTO6 * 1.44 + 0.32, 0.3], t: "≈ EL DOBLE", a: 0.8, z: 1.1, color: MTOR_C, tam: 40, anton: true },
          { p: [BAR6[0].x, Y6 + 0.08 + ALTO6 + 0.32, 0.3], t: "BASE", a: 0.18, z: 1.1, color: K.suave, tam: 36, anton: true },
        ]}
      />
      <Dato b={b} a={0.04} z={0.4} t="≈ 5.6 g DE BCAA" sub="después de entrenar" color={LEU_C} y={250} tam={96} />
      <Dato b={b} a={0.4} z={0.66} t="+22 %" sub="síntesis de proteína muscular" color={LEU_C} y={250} tam={120} />
      <Dato b={b} a={0.66} z={1.1} t="+22 % · LA MITAD" sub="que con proteína completa" color={MTOR_C} y={250} tam={96} />
      <Fuente b={b} a={0.3} t="Jackman et al. 2017" y={450} />
    </AbsoluteFill>
  );
};

// 7 · Agujetas: el muslo dolorido se calma un poco con BCAA; el medidor baja ligeramente -------------
const Agujetas: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const dolor0 = entre(b, 0.02, 0.2);
  const alivio = entre(b, 0.55, 0.8);
  const pulso = 0.75 + 0.25 * Math.sin(b * 34);
  const dolor = dolor0 * mix(1, 0.72, alivio) * pulso;
  const nivel = mix(0.15, 0.85, dolor0) - 0.2 * alivio;
  const cam = camara(
    [
      { b: 0, p: [0.6, 1.15, 6.4], l: [0.25, 0.7, 0], fov: 36 },
      { b: 1, p: [-0.1, 1.05, 5.8], l: [0.25, 0.68, 0], fov: 36 },
    ],
    b,
  );
  const muslo: V3 = [-0.25, 0.75, 0.12];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <group position={[-0.35, 0, 0]}>
          <AtletaDolor ej="parado" dolor={dolor} />
          <Piso color={DOLOR} />
        </group>
        <MedidorDolor p={[0.78, 1.25, 0.2]} nivel={nivel} escala={0.55} />
        <mesh position={[0.78, 0.2, 0.35]}>
          <boxGeometry args={[0.5, 0.4, 0.4]} />
          <meshPhysicalMaterial color="#1d2b30" roughness={0.6} clearcoat={0.3} />
        </mesh>
        <FrascoBCAA p={[0.78, 0.4, 0.35]} escala={0.32} brillo={entre(b, 0.4, 0.5)} />
        {[0, 1, 2, 3].map((i) => {
          const f = entre(b, 0.44 + i * 0.04, 0.6 + i * 0.04);
          if (f <= 0 || f >= 1) return null;
          const p = mix3([0.78, 0.8, 0.4], muslo, f);
          return <AA key={i} tipo={i % 3} p={[p[0], p[1] + Math.sin(f * Math.PI) * 0.35, p[2]]} r={0.05} giro={b * 5} />;
        })}
      </Escena3D>
      <Etiquetas cam={cam} b={b} items={[{ p: muslo, t: "Dolor muscular", a: 0.12, z: 1.1, o: [60, 110], color: DOLOR }]} />
      <Rotulos cam={cam} b={b} items={[{ p: [0.78, 1.72, 0.2], t: "DOLOR", a: 0.08, z: 1.1, color: K.tinta, tam: 30, anton: true }]} />
      <Dato b={b} a={0.02} z={0.55} t="¿Y LAS AGUJETAS?" sub="dolor muscular tardío" color={DOLOR} y={250} tam={96} />
      <Dato b={b} a={0.55} z={1.1} t="EFECTO MODESTO" sub="según varios metaanálisis" color={K.amarillo} y={250} tam={96} />
      <Chip b={b} a={0.62} z={1.1} t="UN POCO MENOS DE DOLOR" x={540} y={1100} color={K.amarillo} />
    </AbsoluteFill>
  );
};

// 8 · Tu comida ya trae muchos BCAA; el bote es un extra pequeño --------------------------------------
const PLATO8: V3 = [-0.45, -1.35, 0.3];
const FR8: V3 = [1.0, -1.38, 0.4];
const NUBE8 = Array.from({ length: 33 }).map((_, i) => {
  const a = i * 2.399;
  const r = 0.35 + (i % 5) * 0.12;
  return { tipo: i % 3, a, r, h: (i / 33) * 1.0, v: 0.8 + (i % 4) * 0.12 };
});

const ComidaDiaria: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const sube = entre(b, 0.08, 0.5);
  const cam = camara(
    [
      { b: 0, p: [0.2, 0.2, 7.8], l: [0.1, -1.1, 0], fov: 40 },
      { b: 1, p: [-0.4, 0.3, 8.4], l: [0.2, -1.05, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[9, 24]}>
        <Plato p={PLATO8} escala={1.7} />
        <Pechuga p={[PLATO8[0] - 0.3, PLATO8[1] + 0.09, PLATO8[2] + 0.1]} escala={0.75} />
        <Huevo p={[PLATO8[0] + 0.42, PLATO8[1] + 0.06, PLATO8[2] + 0.2]} escala={0.85} />
        <Frijoles p={[PLATO8[0] + 0.2, PLATO8[1] + 0.03, PLATO8[2] - 0.4]} escala={0.55} />
        {NUBE8.map((n, i) => {
          const u = sube * n.v;
          if (u <= 0.02) return null;
          const ang = n.a + b * 2.2;
          const p: V3 = [PLATO8[0] + Math.cos(ang) * n.r * (0.4 + u), PLATO8[1] + 0.3 + u * (0.6 + n.h * 0.9), PLATO8[2] + Math.sin(ang) * n.r * 0.6];
          return <AA key={i} tipo={n.tipo} p={p} r={0.075} giro={b * 3 + i} />;
        })}
        <FrascoBCAA p={FR8} escala={0.3} />
        {[0, 1, 2].map((i) => (
          <AA key={i} tipo={i} p={[FR8[0] - 0.12 + i * 0.12, FR8[1] + 0.48 + Math.sin(b * 6 + i) * 0.03, FR8[2]]} r={0.045} />
        ))}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [FR8[0], FR8[1] - 0.25, FR8[2] + 0.2], t: "EXTRA PEQUEÑO", a: 0.3, z: 1.1, color: LEU_C, tam: 34, anton: true },
          { p: [PLATO8[0], PLATO8[1] - 0.32, PLATO8[2] + 0.3], t: "TU COMIDA DEL DÍA", a: 0.05, z: 1.1, color: K.tinta, tam: 34, anton: true },
        ]}
      />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [PLATO8[0] - 0.5, PLATO8[1] + 0.9, PLATO8[2]], t: "Leucina", a: 0.6, z: 1.1, o: [-40, -70], color: LEU_C },
          { p: [PLATO8[0] + 0.2, PLATO8[1] + 1.3, PLATO8[2]], t: "Isoleucina", a: 0.66, z: 1.1, o: [60, -80], color: ISO_C },
          { p: [PLATO8[0] + 0.6, PLATO8[1] + 0.7, PLATO8[2]], t: "Valina", a: 0.72, z: 1.1, o: [90, -20], color: VAL_C },
        ]}
      />
      <Dato b={b} a={0.02} z={0.55} t="PROTEÍNA SUFICIENTE" sub="en tu día" color={MTOR_C} y={250} tam={92} />
      <Dato b={b} a={0.55} z={1.1} t="YA TRAE BCAA" sub="muchos, en tu comida" color={LEU_C} y={250} tam={104} />
    </AbsoluteFill>
  );
};

// 9 · 30 g de proteína = 5–6 g de BCAA + los demás esenciales -----------------------------------------
const FUENTES9: { x: number; a: number }[] = [
  { x: -0.85, a: 0.14 },
  { x: 0, a: 0.24 },
  { x: 0.85, a: 0.33 },
];
const Y9 = -1.4;
const NUBE9: V3 = [0, -0.15, 0];
const PUNTOS9 = Array.from({ length: 27 }).map((_, i) => {
  const y = 1 - (2 * (i + 0.5)) / 27;
  const r = Math.sqrt(1 - y * y);
  const a = i * 2.399;
  return { tipo: i % 9, q: [Math.cos(a) * r * 0.62, y * 0.62, Math.sin(a) * r * 0.62] as V3, src: i % 3 };
});

const Completa: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const sale = FUENTES9.map((f) => entre(b, f.a, f.a + 0.06));
  const bcaa = entre(b, 0.42, 0.62);
  const resto = entre(b, 0.7, 0.88);
  const gramos = mix(0, 5.5, lineal(b, 0.44, 0.62));
  const cam = camara(
    [
      { b: 0, p: [0.3, 0.0, 8.2], l: [0, -1.1, 0], fov: 40 },
      { b: 1, p: [-0.4, 0.1, 8.8], l: [0, -1.05, 0], fov: 40 },
    ],
    b,
  );
  const giro = b * 2;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[9, 24]}>
        <Plato p={[0, Y9, 0.3]} escala={2.0} />
        {sale[0] > 0 ? <Pechuga p={[FUENTES9[0].x, Y9 + 0.09, 0.4]} escala={0.65 * sale[0]} /> : null}
        {sale[1] > 0 ? <Huevo p={[FUENTES9[1].x, Y9 + 0.06, 0.6]} escala={0.85 * sale[1]} /> : null}
        {sale[2] > 0 ? (
          <group position={[FUENTES9[2].x, Y9 + 0.3, 0.4]}>
            <Shaker escala={3.0 * sale[2]} color={MTOR_C} nivel={0.8} />
          </group>
        ) : null}
        {PUNTOS9.map((pt, i) => {
          const esB = pt.tipo < 3;
          const f = esB ? entre(b, 0.42 + (i % 9) * 0.008, 0.58 + (i % 9) * 0.008) : entre(b, 0.7 + (i % 9) * 0.01, 0.86 + (i % 9) * 0.01);
          if (f <= 0) return null;
          const c = Math.cos(giro);
          const s = Math.sin(giro);
          const dest: V3 = [NUBE9[0] + pt.q[0] * c - pt.q[2] * s, NUBE9[1] + pt.q[1], NUBE9[2] + pt.q[0] * s + pt.q[2] * c];
          const ini: V3 = [FUENTES9[pt.src].x, Y9 + 0.3, 0.4];
          const p = mix3(ini, dest, f);
          return <AA key={i} tipo={pt.tipo} p={[p[0], p[1] + Math.sin(f * Math.PI) * 0.3, p[2]]} r={0.1} giro={b * 3 + i} />;
        })}
        {bcaa > 0 ? (
          <mesh position={NUBE9}>
            <sphereGeometry args={[0.95, 24, 16]} />
            <meshBasicMaterial color={resto > 0.5 ? MTOR_C : LEU_C} transparent opacity={0.06 * bcaa} depthWrite={false} />
          </mesh>
        ) : null}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [FUENTES9[0].x, Y9 + 0.15, 0.4], t: "Pollo", a: 0.16, z: 0.42, o: [30, 100], color: "#f3dcc0" },
          { p: [FUENTES9[1].x, Y9 + 0.1, 0.6], t: "Huevo", a: 0.26, z: 0.42, o: [0, 100], color: "#ffb21f" },
          { p: [FUENTES9[2].x, Y9 + 0.3, 0.4], t: "Suero", a: 0.35, z: 0.42, o: [-20, 110], color: MTOR_C },
          { p: [NUBE9[0] + 0.6, NUBE9[1] - 0.4, 0], t: "+ los otros 6 esenciales", a: 0.78, z: 1.1, o: [-40, 150], color: K.amarillo },
        ]}
      />
      <Dato b={b} a={0.02} z={0.42} t="30 g" sub="de proteína" color={MTOR_C} y={250} tam={120} />
      <Dato b={b} a={0.42} z={0.7} t={gramos >= 5.45 ? "5–6 g BCAA" : `${gramos.toFixed(1)} g BCAA`} sub="leucina · isoleucina · valina" color={LEU_C} y={250} tam={110} />
      <Dato b={b} a={0.7} z={1.1} t="PROTEÍNA COMPLETA" sub="5–6 g de BCAA + los 9 esenciales" color={MTOR_C} y={250} tam={92} />
    </AbsoluteFill>
  );
};

const Final: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Tú tomas <span style={{ color: K.lima }}>BCAA</span>?</>}
    escribe="Yo…"
    ideas={["SÍ, SIEMPRE", "YA NO", "NUNCA"]}
  />
);

const T = [
  "Los BCAA son de los suplementos más vendidos del gym. Pero ¿de verdad te ayudan a **ganar músculo**?",
  "Los BCAA son tres **aminoácidos de cadena ramificada**: **leucina**, **isoleucina** y **valina**.",
  "La leucina es la que enciende **mTOR**, el interruptor de la síntesis de proteína que ya te expliqué.",
  "Pero encender el interruptor no basta: para construir proteína nueva, tu fibra necesita los **nueve aminoácidos esenciales**, no solo tres.",
  "Es como una obra: puedes tener al jefe dando órdenes, pero sin **ladrillos** suficientes la pared no se levanta.",
  "Si solo tomas BCAA, los demás aminoácidos tienen que salir de **romper tu propio músculo**. Por eso una revisión concluyó que los BCAA solos no logran una respuesta anabólica real.",
  "En un estudio, unos cinco gramos de BCAA subieron la síntesis de proteína un **veintidós por ciento**, pero cerca de la **mitad** de lo que se logra con proteína completa.",
  "¿Y las agujetas? Varios metaanálisis encuentran que los BCAA pueden reducir un poco el **dolor muscular** después de entrenar.",
  "Pero si ya comes suficiente proteína al día, ese extra es pequeño: tu comida ya trae muchos BCAA.",
  "Unos **treinta gramos** de proteína de pollo, huevo o suero ya traen de **cinco a seis gramos** de BCAA, junto con todos los demás aminoácidos.",
  "Tu dinero rinde más en **proteína completa** que en BCAA. ¿Tú los tomas? **Escríbelo en los comentarios**.",
];

const ESCENAS = [Gancho, Ramificados, Enciende, NueveEsenciales, Obra, Degrada, Barras, Agujetas, ComidaDiaria, Completa, Final];

export const BCAA: ShortDef = {
  id: "Short-Bcaa",
  titulo: "¿Sirven los BCAA?",
  planos: ESCENAS.map((Escena, i) => ({ id: `bcaa-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
