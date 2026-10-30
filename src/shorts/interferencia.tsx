// Short: ¿El cardio te quita músculo? mTOR vs. PGC-1 y el efecto de interferencia.
// Fuentes: Holway, Nutrición sin dogmas, Tomo 1, 2.7.3 (pp. 82–84); Lundberg et al. 2022 (Sports Med).
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { C } from "../fisio/tema";
import { Polvo, rnd } from "../fisio/modelos/comun";
import { GotaLipido, Mol } from "../fisio/modelos/energia";
import { Mitocondria } from "../fisio/modelos/musculo";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaComentarios } from "./cierre";
import { Chip, Dato, Destello, INTER, K, ShortDef, Titular } from "./marco";
import { Atleta, Bascula, Frijoles, Pechuga, Piso, Plato, Proteina } from "./modelos";
import { Velocimetro } from "./modelos-calambres";
import { Columna, O2Mol } from "./modelos-energia";
import { Camino } from "./modelos-fatiga";
import { F2_COL, F2Fibra, F2Flecha, F2Tacha } from "./modelos-fibras";
import { INS, Llave } from "./modelos-glucosa";
import { FibraMiofibrillas, Filamento, H_ACTINA, H_MIOSINA, H_NUCLEO, H_RIBO, Interruptor, Ribosoma } from "./modelos-hipertrofia";
import { CAMINADORA_Y, Caminadora, Choque, Libro, Palanca, PGC_C, Pulsos, Zapatilla } from "./modelos-interferencia";
import { Aprox, bolaInterruptor, Check, Ciclista, Leucina, MTOR_C, Pedestal } from "./modelos-mtor";
import { Rotulos } from "./modelos-sueno";
import { Arroz, Igual, Mancuerna, Tarjeta3D } from "./modelos-ventana";
import { camViaje, cortesViaje, Viaje } from "./viaje";

const MITO_C = C.mitocondria;
const LEU_P = "#ff7a1a";

/** Corredor de lado sobre la caminadora (mira a +Z, el grupo se gira). */
const Corredor: React.FC<{ b: number; brilla?: number; color?: string }> = ({ b, brilla = 0.25, color = PGC_C }) => (
  <group>
    <Caminadora avance={b * 26} color={color} />
    <group position={[0, CAMINADORA_Y, 0]}>
      <Atleta ej="sprint" fase={b * 34} musculo={0.85} brilla={brilla} colorBrillo={color} />
    </group>
  </group>
);

// 0 · Gancho: corredor + levantador -> viaje al interior de la fibra: dos interruptores ----------------
const SW0_M: V3 = [-0.5, -0.45, 5.8];
const SW0_P: V3 = [0.5, -0.45, 5.8];
const LEV: V3 = [0.62, 0, 0];

const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuera = b < 0.4;
  const k = Math.sin(((b * 3.2) % 1) * Math.PI);
  const t = mix(0.28, 1, lineal(b, 0.4, 0.74));
  const camFuera = camara(
    [
      { b: 0, p: [0.2, 1.25, 8.4], l: [0, 0.72, 0], fov: 36 },
      { b: 0.28, p: [-0.1, 1.2, 7.6], l: [0.1, 0.75, 0], fov: 36 },
      { b: 0.4, p: [LEV[0] + 0.48, 1.36, 0.62], l: [LEV[0] + 0.22, 1.3, 0.04], fov: 36 },
    ],
    b,
  );
  const cam = fuera ? camFuera : camViaje(t);
  const aparece = entre(b, 0.74, 0.8);
  const pulso = Math.sin(b * 22);
  const onM = entre(b, 0.8, 0.86) * (0.55 + 0.45 * pulso);
  const onP = entre(b, 0.86, 0.92) * (0.55 - 0.45 * pulso);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2} niebla={!fuera && t > 0.72 ? [10, 34] : undefined}>
        {fuera ? (
          <>
            <group position={[-0.62, 0, 0]} rotation={[0, 0.85, 0]}>
              <Corredor b={b} brilla={0.2 + 0.3 * entre(b, 0.05, 0.15)} />
            </group>
            <group position={LEV}>
              <Atleta ej="curl" k={k} brilla={0.2 + 0.45 * k} colorBrillo={MTOR_C} musculo={0.9} />
              <Piso color={MTOR_C} />
            </group>
          </>
        ) : (
          <>
            <Viaje t={t} b={b} interior={{ pcr: 6, brillo: 0.15 }} />
            {aparece > 0 ? (
              <>
                <Interruptor p={SW0_M} on={onM} escala={0.48 * aparece} />
                <Palanca p={SW0_P} on={onP} escala={0.48 * aparece} />
              </>
            ) : null}
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.4, ...cortesViaje(0.4, 0.74).slice(1)]} />
      <Titular
        b={b}
        a={0.02}
        z={0.4}
        y={270}
        tam={104}
        t={
          <>
            ¿El <span style={{ color: PGC_C }}>cardio</span> te quita <span style={{ color: MTOR_C }}>músculo</span>?
          </>
        }
      />
      <Chip b={b} a={0.1} z={0.4} t="CARDIO" x={300} y={1100} color={PGC_C} />
      <Chip b={b} a={0.13} z={0.4} t="PESAS" x={790} y={1100} color={MTOR_C} />
      <Chip b={b} a={0.42} z={0.56} t="MÚSCULO" x={540} y={330} color={K.rojo} />
      <Chip b={b} a={0.56} z={0.74} t="FIBRA MUSCULAR" x={540} y={330} color={K.rosa} />
      <Titular
        b={b}
        a={0.78}
        z={1.1}
        y={290}
        tam={120}
        t={
          <>
            <span style={{ color: MTOR_C }}>mTOR</span> vs <span style={{ color: PGC_C }}>PGC-1</span>
          </>
        }
      />
      {!fuera ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [SW0_M[0], SW0_M[1] - 0.15, SW0_M[2]], t: "mTOR", a: 0.82, z: 1.1, o: [-40, 110], color: MTOR_C },
            { p: [SW0_P[0], SW0_P[1] - 0.15, SW0_P[2]], t: "PGC-1", a: 0.88, z: 1.1, o: [40, 110], color: PGC_C },
          ]}
        />
      ) : null}
    </AbsoluteFill>
  );
};

// 1 · El libro de Holway se abre: pesas -> señal lima, cardio -> señal cian ---------------------------
const LIB: V3 = [0, 0.75, 0];
const PESA1: V3 = [-1.0, -0.45, 0.2];
const ZAP1: V3 = [1.0, -0.5, 0.2];
const FIB1: V3 = [0, -1.6, 0];

const Libro1: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const llega = entre(b, 0.0, 0.08);
  const abre = entre(b, 0.38, 0.52);
  const sale = [entre(b, 0.55, 0.62), entre(b, 0.6, 0.67)];
  const senal = visible(b, 0.68, 1.2, 0.04);
  const cam = camara(
    [
      { b: 0, p: [0.5, 1.1, 5.6], l: [0, 0.45, 0], fov: 40 },
      { b: 0.4, p: [-0.2, 1.0, 5.4], l: [0, 0.5, 0], fov: 40 },
      { b: 0.58, p: [0.3, 0.6, 9.6], l: [0, -0.45, 0], fov: 40 },
      { b: 1, p: [-0.4, 0.5, 9.4], l: [0, -0.5, 0], fov: 40 },
    ],
    b,
  );
  const fib: [V3, V3] = [
    [FIB1[0] - 0.55, FIB1[1] + 0.25, 0.3],
    [FIB1[0] + 0.55, FIB1[1] + 0.25, 0.3],
  ];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 22]}>
        <group position={[LIB[0], LIB[1] + (1 - llega) * -0.4, LIB[2]]} rotation={[0.08, mix(-0.35, 0, entre(b, 0, 0.4)), 0]} scale={llega}>
          <Libro abre={abre} brillo={abre * 0.8} />
        </group>
        {abre > 0.6 ? (
          <>
            <F2Flecha a={[LIB[0] - 0.25, LIB[1] - 0.6, 0.3]} b={mix3([LIB[0] - 0.25, LIB[1] - 0.6, 0.3], [PESA1[0] + 0.15, PESA1[1] + 0.35, 0.3], sale[0])} color={MTOR_C} r={0.035} op={sale[0]} />
            <F2Flecha a={[LIB[0] + 0.25, LIB[1] - 0.6, 0.3]} b={mix3([LIB[0] + 0.25, LIB[1] - 0.6, 0.3], [ZAP1[0] - 0.15, ZAP1[1] + 0.35, 0.3], sale[1])} color={PGC_C} r={0.035} op={sale[1]} />
          </>
        ) : null}
        {sale[0] > 0 ? (
          <>
            <Mancuerna p={PESA1} escala={0.6 * sale[0]} giro={0.2 + Math.sin(b * 8) * 0.15} />
            <Pedestal p={[PESA1[0], PESA1[1] - 0.25, PESA1[2]]} color={MTOR_C} on={senal} r={0.36} />
          </>
        ) : null}
        {sale[1] > 0 ? (
          <>
            <Zapatilla p={[ZAP1[0], ZAP1[1] - 0.18, ZAP1[2]]} escala={1.0 * sale[1]} giro={-0.5} />
            <Pedestal p={[ZAP1[0], ZAP1[1] - 0.2, ZAP1[2]]} color={PGC_C} on={senal} r={0.36} />
          </>
        ) : null}
        {b > 0.5 ? (
          <group position={FIB1} rotation={[0, 0, Math.PI / 2]}>
            <F2Fibra p={[0, 0, 0]} color="#d24a58" r={0.28} alto={2.6} act={0.15 * senal} />
          </group>
        ) : null}
        <Pulsos a={[PESA1[0], PESA1[1] - 0.3, 0.3]} b={fib[0]} t={b * 5} op={senal} color={MTOR_C} n={3} r={0.07} />
        <Pulsos a={[ZAP1[0], ZAP1[1] - 0.3, 0.3]} b={fib[1]} t={b * 5 + 0.2} op={senal} color={PGC_C} n={3} r={0.07} />
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [LIB[0], LIB[1] + 0.2, 0.2], t: <>NUTRICIÓN<br />SIN DOGMAS</>, a: 0.06, z: 0.4, color: K.tinta, tam: 46, anton: true },
          { p: [LIB[0], LIB[1] - 0.3, 0.2], t: "Francis Holway", a: 0.1, z: 0.4, color: "#f7d9a8", tam: 30 },
          { p: [PESA1[0], PESA1[1] - 0.5, 0.3], t: "PESAS", a: 0.58, z: 1.1, color: MTOR_C, tam: 34 },
          { p: [ZAP1[0], ZAP1[1] - 0.5, 0.3], t: "CARDIO", a: 0.63, z: 1.1, color: PGC_C, tam: 34 },
        ]}
      />
      <Etiquetas cam={cam} b={b} items={[{ p: [FIB1[0] + 1.2, FIB1[1], 0.3], t: "Músculo", a: 0.7, z: 1.1, o: [-40, 90], color: "#f39aa0" }]} />
      <Destello b={b} en={[0.45]} color="#fff3c4" />
      <Dato b={b} a={0.02} z={0.5} t="HOLWAY" sub="Nutrición sin dogmas" color="#f7d9a8" y={250} tam={104} />
      <Dato
        b={b}
        a={0.6}
        z={1.1}
        t={
          <>
            <span style={{ color: MTOR_C }}>PESAS</span> ≠ <span style={{ color: PGC_C }}>CARDIO</span>
          </>
        }
        color="#ffffff"
        y={250}
        tam={100}
      />
      <Chip b={b} a={0.72} z={1.1} t="CADA ENTRENAMIENTO, UNA SEÑAL" x={540} y={1110} color={K.tinta} />
    </AbsoluteFill>
  );
};

// 2 · mTOR: fuerza + proteína + insulina encienden la palanca lima -> ribosomas -> fibra más gruesa ------
const SW2: V3 = [0, 1.25, 0.4];
const ESC2 = 0.62;
const IN2: { p: V3; a: number }[] = [
  { p: [-1.15, 2.45, 0.3], a: 0.03 },
  { p: [0, 2.75, 0.1], a: 0.11 },
  { p: [1.15, 2.45, 0.3], a: 0.19 },
];
const RIB2_A: V3 = [-0.55, 0.15, 0.9];
const RIB2_B: V3 = [0.55, 0.0, 1.0];
const FIB2_Y = -1.75;
const VUELOS = Array.from({ length: 12 }).map((_, i) => {
  const ang = (i / 12) * Math.PI * 2 + 0.4;
  return { tipo: (i % 2 ? "miosina" : "actina") as "actina" | "miosina", fin: [Math.cos(ang) * 0.95, FIB2_Y + 1.1, Math.sin(ang) * 0.95] as V3 };
});

const MtorS: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const ap = IN2.map((e) => entre(b, e.a, e.a + 0.06));
  const on = entre(b, 0.28, 0.36);
  const hace = lineal(b, 0.42, 0.66);
  const crece = entre(b, 0.7, 0.95);
  const cam = camara(
    [
      { b: 0, p: [0.3, 2.5, 9.0], l: [0, 1.6, 0], fov: 40 },
      { b: 0.36, p: [-0.2, 2.4, 9.2], l: [0, 1.55, 0], fov: 40 },
      { b: 0.55, p: [0.4, 1.8, 11.6], l: [0, 0.0, 0], fov: 40 },
      { b: 1, p: [-0.5, 1.4, 10.6], l: [0, -0.35, 0], fov: 40 },
    ],
    b,
  );
  const bola = bolaInterruptor(SW2, 1, ESC2);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[7, 24]}>
        <group position={[0, FIB2_Y, 0]}>
          <FibraMiofibrillas crece={crece} brillo={0.3 * crece} />
        </group>
        <Interruptor p={SW2} on={on} escala={ESC2} />
        {/* entradas */}
        {ap[0] > 0 ? <Mancuerna p={IN2[0].p} escala={0.55 * ap[0]} giro={0.2 + Math.sin(b * 10) * 0.12} /> : null}
        {ap[1] > 0 ? <Proteina p={IN2[1].p} n={8} escala={0.55 * ap[1]} giro={b * 2} seed="i2" /> : null}
        {ap[1] > 0 ? <Leucina p={[IN2[1].p[0] + 0.2, IN2[1].p[1] + 0.2, IN2[1].p[2] + 0.1]} r={0.07 * ap[1]} giro={b * 4} /> : null}
        {ap[2] > 0 ? <Llave p={IN2[2].p} escala={1.5 * ap[2]} giro={Math.PI + Math.sin(b * 6) * 0.2} /> : null}
        {IN2.map((e, i) => (
          <Pulsos key={i} a={[e.p[0], e.p[1] - 0.25, e.p[2]]} b={[SW2[0] + (i - 1) * 0.25, SW2[1] + 0.35, SW2[2]]} t={b * 5 + i * 0.3} op={visible(b, e.a + 0.06, 0.4, 0.03)} color={[MTOR_C, LEU_P, INS][i]} n={2} r={0.06} />
        ))}
        {/* mTOR -> ribosomas */}
        <Pulsos a={[SW2[0] - 0.2, SW2[1] - 0.1, SW2[2]]} b={[RIB2_A[0], RIB2_A[1] + 0.3, RIB2_A[2]]} t={b * 5} op={visible(b, 0.36, 0.7, 0.04)} color={MTOR_C} />
        <Pulsos a={[SW2[0] + 0.2, SW2[1] - 0.1, SW2[2]]} b={[RIB2_B[0], RIB2_B[1] + 0.3, RIB2_B[2]]} t={b * 5 + 0.15} op={visible(b, 0.36, 0.7, 0.04)} color={MTOR_C} />
        <Ribosoma p={RIB2_A} color={H_ACTINA} n={hace * 9} avance={b * 8} escala={0.75} giro={0.2} />
        <Ribosoma p={RIB2_B} color={H_MIOSINA} n={hace * 9} avance={b * 8} escala={0.75} giro={-0.2} />
        {VUELOS.map((v, i) => {
          const f = entre(b, 0.62 + i * 0.014, 0.8 + i * 0.014);
          if (f <= 0 || f >= 1) return null;
          const ini = v.tipo === "actina" ? RIB2_A : RIB2_B;
          const p = mix3(ini, v.fin, f);
          return <Filamento key={i} p={[p[0], p[1] + Math.sin(f * Math.PI) * 0.4, p[2]]} tipo={v.tipo} escala={0.9} giro={f * 2 + i} />;
        })}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Destello b={b} en={[0.32]} color={MTOR_C} />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [IN2[0].p[0], IN2[0].p[1] + 0.2, IN2[0].p[2]], t: "Fuerza", a: 0.05, z: 0.5, o: [-10, -90], color: MTOR_C },
          { p: [IN2[1].p[0], IN2[1].p[1] + 0.3, IN2[1].p[2]], t: "Proteína", a: 0.13, z: 0.5, o: [60, -80], color: LEU_P },
          { p: [IN2[2].p[0], IN2[2].p[1] + 0.25, IN2[2].p[2]], t: "Insulina", a: 0.21, z: 0.5, o: [10, -90], color: INS },
          { p: [bola[0], bola[1], bola[2]], t: "mTOR", a: 0.3, z: 1.1, o: [90, -30], color: MTOR_C },
          { p: [RIB2_A[0] - 0.25, RIB2_A[1], RIB2_A[2]], t: "Ribosomas", a: 0.44, z: 0.72, o: [-50, 110], color: H_RIBO },
          { p: [-0.9, FIB2_Y + 0.6, 0.6], t: "Fibra más gruesa", a: 0.78, z: 1.1, o: [-30, 150], color: "#f39aa0" },
        ]}
      />
      <Dato b={b} a={0.34} z={1.1} t="mTOR" sub="llave maestra de la hipertrofia" color={MTOR_C} y={250} tam={110} />
    </AbsoluteFill>
  );
};

// 3 · PGC-1: el corredor enciende la palanca cian -> núcleo -> nuevas mitocondrias ----------------
const SW3: V3 = [0, 0.5, 0.5];
const ESC3 = 0.6;
const NUC3: V3 = [-0.6, -0.55, 0.75];
const FIB3_Y = -0.95;
const MITOS3 = Array.from({ length: 14 }).map((_, i) => {
  const a = rnd(`m3a${i}`) * Math.PI * 2;
  const rr = 0.25 + rnd(`m3r${i}`) * 0.6;
  return { p: [Math.cos(a) * rr, FIB3_Y - 0.9 + rnd(`m3y${i}`) * 1.75, Math.sin(a) * rr * 0.8 + 0.1] as V3, rot: [rnd(`m3x${i}`) * 3, a, rnd(`m3z${i}`) * 3] as V3 };
});

const PgcS: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuera = b < 0.3;
  const on = entre(b, 0.36, 0.44);
  const alNucleo = lineal(b, 0.44, 0.54);
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [0.5, 1.15, 5.8], l: [0, 0.75, 0], fov: 36 },
          { b: 0.3, p: [0.95, 0.95, 3.3], l: [0.1, 0.65, 0], fov: 36 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.3, p: [0.3, 0.9, 6.4], l: [0, 0.0, 0], fov: 40 },
          { b: 0.55, p: [0.5, 0.3, 9.4], l: [0, -0.55, 0], fov: 40 },
          { b: 1, p: [-0.5, 0.2, 9.0], l: [0, -0.6, 0], fov: 40 },
        ],
        b,
      );
  const bola = bolaInterruptor(SW3, 1, ESC3);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={fuera ? K.fondo2 : undefined} niebla={fuera ? undefined : [6, 20]}>
        {fuera ? (
          <group rotation={[0, 0.85, 0]}>
            <Corredor b={b} brilla={0.2 + 0.6 * entre(b, 0.06, 0.2)} />
          </group>
        ) : (
          <>
            <F2Fibra p={[0, FIB3_Y, 0]} color={F2_COL.I} r={1.05} alto={2.2} op={0.28} act={0} />
            <Palanca p={SW3} on={on} escala={ESC3} />
            {/* núcleo */}
            <mesh position={NUC3} scale={[0.2, 0.36, 0.12]}>
              <sphereGeometry args={[1, 24, 16]} />
              <meshStandardMaterial color={H_NUCLEO} emissive={alNucleo > 0.9 ? PGC_C : H_NUCLEO} emissiveIntensity={0.5 + 0.8 * entre(b, 0.52, 0.56)} />
            </mesh>
            {alNucleo > 0 && alNucleo < 1 ? <Mol p={mix3([bola[0], bola[1] - 0.2, bola[2]], NUC3, alNucleo)} color={PGC_C} r={0.1} brillo={2} /> : null}
            {MITOS3.map((m, i) => {
              const vieja = i < 3;
              const s = vieja ? 1 : entre(b, 0.56 + (i - 3) * 0.03, 0.62 + (i - 3) * 0.03);
              if (s <= 0) return null;
              const viaje = vieja ? 1 : entre(b, 0.52 + (i - 3) * 0.03, 0.58 + (i - 3) * 0.03);
              return (
                <group key={i}>
                  {!vieja && viaje < 1 ? <Mol p={mix3(NUC3, m.p, viaje)} color={PGC_C} r={0.05} brillo={1.6} /> : null}
                  <Mitocondria pos={m.p} rot={m.rot} escala={0.85 * s} />
                  {!vieja && s < 1 ? <Mol p={m.p} color={MITO_C} r={0.25 * (1 - s) + 0.02} brillo={1.2} op={1 - s} /> : null}
                </group>
              );
            })}
            <Polvo b={b} radio={4} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.3]} />
      <Chip b={b} a={0.04} z={0.3} t="CARDIO · FONDO" x={540} y={1100} color={PGC_C} />
      {!fuera ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [bola[0], bola[1], bola[2]], t: "PGC-1", a: 0.38, z: 1.1, o: [90, -30], color: PGC_C },
            { p: NUC3, t: "Núcleo", a: 0.48, z: 0.7, o: [-60, -80], color: "#8fa4ff" },
            { p: MITOS3[8].p, t: "Mitocondrias nuevas", a: 0.68, z: 1.1, o: [70, 150], color: MITO_C },
          ]}
        />
      ) : null}
      <Dato b={b} a={0.4} z={1.1} t="PGC-1" sub="más mitocondrias" color={PGC_C} y={250} tam={110} />
    </AbsoluteFill>
  );
};

// 4 · Fibra lenta: más mitocondrias y capilares, entra O₂; igual de gruesa ------------------------------
const FA: V3 = [-0.78, 0, 0];
const FB: V3 = [0.78, 0, 0];
const O2S = Array.from({ length: 10 }).map((_, i) => ({
  ini: [FB[0] + (rnd(`o2x${i}`) - 0.5) * 1.6, 1.6 + rnd(`o2y${i}`) * 0.6, 0.4 + rnd(`o2z${i}`) * 0.3] as V3,
  fin: [FB[0] + (rnd(`o2fx${i}`) - 0.5) * 0.4, -0.8 + rnd(`o2fy${i}`) * 1.4, 0.15] as V3,
  d: i * 0.025,
}));

const Resistente: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const m = entre(b, 0.06, 0.32);
  const igual = entre(b, 0.82, 0.88);
  const cam = camara(
    [
      { b: 0, p: [0.6, 0.4, 7.8], l: [0.3, -0.45, 0], fov: 40 },
      { b: 0.5, p: [0.2, 0.2, 9.3], l: [0, -0.85, 0], fov: 40 },
      { b: 1, p: [-0.4, 0.2, 9.4], l: [0, -0.85, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 22]}>
        <F2Fibra p={FA} color={F2_COL.I} r={0.45} alto={2.0} mito={3} capilares={0.15} op={0.55} seed="fa" />
        <F2Fibra p={FB} color={F2_COL.I} r={0.45} alto={2.0} mito={3 + m * 11} capilares={m} op={0.55} act={0.12 * entre(b, 0.6, 0.7)} seed="fb" />
        {O2S.map((o, i) => {
          const f = entre(b, 0.34 + o.d, 0.52 + o.d);
          if (f <= 0 || f >= 1) return null;
          return <O2Mol key={i} p={mix3(o.ini, o.fin, f)} escala={0.9} op={Math.min(1, (1 - f) * 3)} giro={f * 4 + i} />;
        })}
        {/* medida del grosor: iguales */}
        {igual > 0
          ? [FA, FB].map((c, i) => (
              <F2Flecha key={i} a={[c[0] - 0.5, c[1] + 1.18, 0.5]} b={[c[0] + 0.5, c[1] + 1.18, 0.5]} color="#ffffff" r={0.025} op={igual} doble />
            ))
          : null}
        {igual > 0 ? <Igual p={[0, 1.18, 0.5]} escala={1.3 * igual} color="#ffffff" /> : null}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [FA[0], -1.25, 0.3], t: "ANTES", a: 0.04, z: 1.1, color: K.suave, tam: 32 },
          { p: [FB[0], -1.25, 0.3], t: "CON PGC-1", a: 0.06, z: 1.1, color: PGC_C, tam: 32 },
        ]}
      />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [FB[0] + 0.3, 0.6, 0.3], t: "Mitocondrias", a: 0.16, z: 0.6, o: [-90, -110], color: MITO_C },
          { p: [FB[0] + 0.47, -0.4, 0.1], t: "Capilares", a: 0.24, z: 0.6, o: [-10, 110], color: "#ff5f6d" },
          { p: [FB[0] - 0.2, 0.9, 0.5], t: "O₂", a: 0.38, z: 0.7, o: [-80, -100], color: K.cian },
        ]}
      />
      <Dato b={b} a={0.02} z={0.62} t="FIBRAS LENTAS" sub="usan mejor el oxígeno" color={F2_COL.IIa} y={250} tam={96} />
      <Dato b={b} a={0.62} z={1.1} t="RESISTENCIA ↑" sub="tamaño ≈ igual" color={PGC_C} y={250} tam={96} />
      <Chip b={b} a={0.64} z={1.1} t="MÁS RESISTENTE" x={290} y={1140} color={PGC_C} />
      <Chip b={b} a={0.84} z={1.1} t="NO MÁS GRANDE" x={790} y={1140} color={K.tinta} />
    </AbsoluteFill>
  );
};

// 5 · Interferencia: exceso de pulsos PGC-1 frena en parte a mTOR; baja la fuerza máxima ------------------
const SW5_M: V3 = [-0.85, 0.35, 0];
const SW5_P: V3 = [0.85, 0.35, 0];
const ESC5 = 0.72;
const VEL5: V3 = [0, -1.55, 0.2];

const Interferencia: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const onP = entre(b, 0.02, 0.08);
  const frena = entre(b, 0.28, 0.48);
  const onM = 1 - 0.45 * frena + 0.04 * frena * Math.sin(b * 70);
  const ap = entre(b, 0.66, 0.72);
  const aguja = mix(0.86, 0.62, entre(b, 0.8, 0.9));
  const bM = bolaInterruptor(SW5_M, onM, ESC5);
  const bP = bolaInterruptor(SW5_P, onP, ESC5);
  const cam = camara(
    [
      { b: 0, p: [0.6, 0.9, 7.6], l: [0, 0.2, 0], fov: 40 },
      { b: 0.6, p: [-0.3, 0.7, 8.4], l: [0, -0.15, 0], fov: 40 },
      { b: 1, p: [0.3, 0.3, 9.4], l: [0, -0.55, 0], fov: 40 },
    ],
    b,
  );
  // tren de pulsos: cada vez más (exceso)
  const n = Math.round(mix(2, 9, entre(b, 0.06, 0.3)));
  const tren = visible(b, 0.06, 0.7, 0.04);
  const ini: V3 = [bP[0] - 0.15, bP[1], bP[2] + 0.1];
  const fin: V3 = [bM[0] + 0.15, bM[1], bM[2] + 0.1];
  const golpe = (b * 9) % 1;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 22]}>
        <Interruptor p={SW5_M} on={onM} escala={ESC5} />
        <Palanca p={SW5_P} on={onP} escala={ESC5} />
        <Pulsos a={ini} b={fin} t={b * 9} op={tren} color={PGC_C} n={n} r={0.075} arco={0.45} />
        {tren > 0.2 && b > 0.12 ? <Choque p={fin} f={golpe} color={PGC_C} r={0.4} /> : null}
        {tren > 0.2 && b > 0.2 ? <Choque p={fin} f={(golpe + 0.5) % 1} color="#ffffff" r={0.3} /> : null}
        {ap > 0 ? (
          <group position={VEL5} scale={1.25 * ap}>
            <Velocimetro v={aguja} />
          </group>
        ) : null}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Destello b={b} en={[0.42]} color={PGC_C} />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [SW5_M[0], SW5_M[1] - 0.2, SW5_M[2] + 0.3], t: "mTOR", a: 0.02, z: 1.1, o: [-20, 110], color: MTOR_C },
          { p: [SW5_P[0], SW5_P[1] - 0.2, SW5_P[2] + 0.3], t: "PGC-1", a: 0.04, z: 1.1, o: [20, 110], color: PGC_C },
        ]}
      />
      <Rotulos cam={cam} b={b} items={[{ p: [VEL5[0], VEL5[1] - 0.3, 0.3], t: "FUERZA MÁXIMA", a: 0.68, z: 1.1, color: K.tinta, tam: 34 }]} />
      <Dato b={b} a={0.06} z={0.4} t="EXCESO" sub="muchas señales de PGC-1" color={PGC_C} y={250} tam={110} />
      <Dato b={b} a={0.42} z={0.76} t={<>EFECTO DE<br />INTERFERENCIA</>} color={K.naranja} y={250} tam={84} />
      <Dato b={b} a={0.76} z={1.1} t="FUERZA MÁXIMA" sub="la más afectada" color={K.rojo} y={250} tam={96} />
    </AbsoluteFill>
  );
};

// 6 · Fatiga: sesiones extra llenan la fatiga; bajan recuperación y técnica ---------------------------
const COL6: { x: number; t: string; color: string }[] = [
  { x: -1.0, t: "FATIGA", color: K.rojo },
  { x: 0, t: "RECUPERACIÓN", color: K.morado },
  { x: 1.0, t: "TÉCNICA", color: K.amarillo },
];
const BASE6 = -1.5;
const ALTO6 = 1.9;

const Fatiga: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const caidas = [0.1, 0.17, 0.24, 0.31].map((a) => entre(b, a, a + 0.07));
  const fat = Math.min(0.96, mix(0.12, 0.96, entre(b, 0.14, 0.4)));
  const rec = mix(0.85, 0.38, entre(b, 0.5, 0.64));
  const tec = mix(0.85, 0.45, entre(b, 0.64, 0.78));
  const cam = camara(
    [
      { b: 0, p: [-0.6, 0.5, 7.4], l: [-0.6, -0.4, 0], fov: 40 },
      { b: 0.42, p: [0.1, 0.5, 9.2], l: [0, -0.6, 0], fov: 40 },
      { b: 1, p: [0.5, 0.4, 9.2], l: [0, -0.6, 0], fov: 40 },
    ],
    b,
  );
  const niveles = [fat, rec, tec];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 22]}>
        {COL6.map((c, i) => (
          <Columna key={i} p={[c.x, BASE6, 0]} nivel={niveles[i]} color={c.color} alto={ALTO6} r={0.24} />
        ))}
        {caidas.map((f, i) => {
          if (f <= 0 || f >= 1) return null;
          const ini: V3 = [0.2 + i * 0.25, 1.7, 0.3];
          const finp: V3 = [COL6[0].x, BASE6 + ALTO6 * 0.95, 0];
          const p = mix3(ini, finp, f);
          return <Zapatilla key={i} p={[p[0], p[1] + Math.sin(f * Math.PI) * 0.5, p[2]]} escala={0.85 * (1 - 0.6 * f)} giro={f * 3} />;
        })}
        {/* pila de sesiones ya sumadas */}
        {caidas.map((f, i) =>
          f >= 1 ? <Zapatilla key={`s${i}`} p={[COL6[0].x - 0.55, BASE6 + 0.05 + i * 0.26, 0.4]} escala={0.6} giro={0.3} /> : null,
        )}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          ...COL6.map((c, i) => ({ p: [c.x, BASE6 - 0.25, 0.3] as V3, t: c.t, a: i === 0 ? 0.04 : 0.46, z: 1.1, color: c.color, tam: 30 })),
          { p: [COL6[0].x - 0.55, BASE6 + 1.25, 0.4], t: "+ cardio", a: 0.18, z: 1.1, color: PGC_C, tam: 30 },
        ]}
      />
      <Dato b={b} a={0.04} z={0.46} t="+ FATIGA" sub="cada sesión extra suma" color={K.rojo} y={250} tam={110} />
      <Dato b={b} a={0.48} z={1.1} t={<>− RECUPERACIÓN<br />− TÉCNICA</>} color={K.morado} y={250} tam={80} />
    </AbsoluteFill>
  );
};

// 7 · Evidencia: músculo ≈ igual; en las fibras efecto pequeño, menor en bici que corriendo -------------------
const Evidencia: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fase1 = b < 0.5;
  const k = 0.5 + 0.5 * Math.sin(b * 12);
  const crece = entre(b, 0.64, 0.86);
  const cam = fase1
    ? camara(
        [
          { b: 0, p: [0.3, 1.2, 6.6], l: [0, 0.62, 0], fov: 36 },
          { b: 0.5, p: [-0.3, 1.1, 6.3], l: [0, 0.62, 0], fov: 36 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.5, p: [0.2, 2.3, 11.0], l: [0, 1.15, 0], fov: 38 },
          { b: 1, p: [-0.3, 2.4, 10.8], l: [0, 1.15, 0], fov: 38 },
        ],
        b,
      );
  const correr: V3 = [-0.8, 0, 0];
  const pedal: V3 = [0.8, 0, 0];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        {fase1 ? (
          <>
            <group position={[-0.55, 0, 0]}>
              <Atleta ej="flex" k={k} musculo={0.9} brilla={0.25} colorBrillo={MTOR_C} />
              <Piso color={MTOR_C} />
            </group>
            <group position={[0.55, 0, 0]}>
              <Atleta ej="flex" k={k} musculo={0.9} brilla={0.25} colorBrillo={PGC_C} />
              <Piso color={PGC_C} />
            </group>
            {b > 0.3 ? <Aprox p={[0, 1.2, 0.3]} escala={1.1 * entre(b, 0.3, 0.36)} color="#ffffff" /> : null}
          </>
        ) : (
          <>
            <group position={correr} rotation={[0, 0.9, 0]}>
              <Atleta ej="sprint" fase={b * 40} musculo={0.85} brilla={0.2} colorBrillo={K.naranja} />
              <Camino avance={b * 30} largo={2.4} ancho={0.8} />
            </group>
            <group position={pedal} rotation={[0, 0.9, 0]} scale={0.95}>
              <Ciclista giro={b * 28} brilla={0.2} colorBrillo={K.amarillo} color={K.amarillo} />
            </group>
            <Columna p={[correr[0], 2.15, 0]} nivel={0.36 * crece} color={K.naranja} alto={1.0} r={0.17} />
            <Columna p={[pedal[0], 2.15, 0]} nivel={0.14 * crece} color={K.amarillo} alto={1.0} r={0.17} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.5]} />
      {fase1 ? (
        <>
          <Chip b={b} a={0.08} z={0.5} t="SOLO PESAS" x={300} y={1100} color={MTOR_C} />
          <Chip b={b} a={0.1} z={0.5} t="PESAS + CARDIO" x={780} y={1100} color={PGC_C} />
        </>
      ) : (
        <Rotulos
          cam={cam}
          b={b}
          items={[
            { p: [correr[0], 1.95, 0.3], t: "CORRER", a: 0.52, z: 1.1, color: K.naranja, tam: 36 },
            { p: [pedal[0], 1.95, 0.3], t: "PEDALEAR", a: 0.54, z: 1.1, color: K.amarillo, tam: 36 },
          ]}
        />
      )}
      <Dato b={b} a={0.02} z={0.28} t="LOS ESTUDIOS" sub="pesas vs. pesas + cardio" color={K.tinta} y={250} tam={96} />
      <Dato b={b} a={0.28} z={0.5} t="MÚSCULO ≈ IGUAL" sub="el tamaño total casi no cambia" color={MTOR_C} y={250} tam={90} />
      <Dato b={b} a={0.56} z={1.1} t="EFECTO PEQUEÑO" sub="en las fibras · menor en bici" color={K.naranja} y={250} tam={92} />
      <div
        style={{
          position: "absolute",
          top: 1120,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: INTER,
          fontWeight: 700,
          fontSize: 28,
          color: K.suave,
          opacity: visible(b, 0.58, 1.1, 0.06),
        }}
      >
        Lundberg et al. 2022
      </div>
    </AbsoluteFill>
  );
};

// 8 · Velocista: la grasa baja ajustando la dieta, no con más cardio (Carl Lewis, −7 kg) -------------------
const CAM8: V3 = [-1.05, 0, -0.3];
const PLATO8: V3 = [1.05, 0, 0.2];

const Velocista: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fase1 = b < 0.3;
  const tacha = entre(b, 0.38, 0.44);
  const dieta = entre(b, 0.48, 0.55);
  const ok = entre(b, 0.55, 0.6);
  const baja = entre(b, 0.68, 0.92);
  const kg = Math.round(7 * baja);
  const cam = fase1
    ? camara(
        [
          { b: 0, p: [0.4, 1.15, 6.2], l: [0, 0.72, 0], fov: 36 },
          { b: 0.3, p: [-0.2, 1.1, 5.6], l: [0, 0.75, 0], fov: 36 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.3, p: [0.3, 1.8, 8.8], l: [0, 0.5, 0], fov: 36 },
          { b: 1, p: [-0.3, 1.7, 8.4], l: [0, 0.5, 0], fov: 36 },
        ],
        b,
      );
  const gota: V3 = [0.42, 1.35, 0.3];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        {fase1 ? (
          <>
            <group rotation={[0, 0.9, 0]}>
              <Atleta ej="sprint" fase={b * 48} musculo={0.9} brilla={0.25} colorBrillo={K.amarillo} />
              <Camino avance={b * 40} largo={2.6} ancho={0.8} />
            </group>
            {b > 0.14 ? <GotaLipido p={[0.55, 1.2, 0.3]} r={0.2 * entre(b, 0.14, 0.2)} /> : null}
          </>
        ) : (
          <>
            {/* atleta en la báscula */}
            <Bascula />
            <group position={[0, 0.065, 0]}>
              <Atleta ej="parado" musculo={0.9} brilla={0.15 + 0.3 * baja} colorBrillo={K.amarillo} />
            </group>
            <GotaLipido p={gota} r={mix(0.2, 0.07, baja)} op={mix(1, 0.6, baja)} />
            {/* más cardio: tachado */}
            <group position={CAM8} rotation={[0, 0.7, 0]} scale={0.75}>
              <Caminadora avance={0} color={PGC_C} pantalla={0.3} />
            </group>
            {tacha > 0 ? <F2Tacha p={[CAM8[0], 0.75, 0.3]} tam={0.65 * tacha} op={tacha} /> : null}
            {/* dieta ajustada */}
            {dieta > 0 ? (
              <group position={PLATO8} scale={dieta}>
                <Pedestal p={[0, 0.05, 0]} color={K.lima} on={ok} r={0.5} />
                <Plato p={[0, 0.13, 0]} escala={0.8} />
                <Pechuga p={[-0.14, 0.18, 0.05]} escala={0.45} />
                <Arroz p={[0.15, 0.16, -0.08]} escala={0.6} />
                <Frijoles p={[0.12, 0.16, 0.17]} escala={0.28} />
              </group>
            ) : null}
            {ok > 0 ? <Check p={[PLATO8[0], 0.95, 0.3]} escala={1.3 * ok} /> : null}
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.3]} />
      {fase1 ? <Chip b={b} a={0.04} z={0.3} t="VELOCISTA" x={540} y={1100} color={K.amarillo} /> : null}
      <Etiquetas
        cam={cam}
        b={b}
        items={
          fase1
            ? [{ p: [0.55, 1.2, 0.3], t: "Grasa", a: 0.16, z: 0.3, o: [60, -80], color: "#ffd34d" }]
            : [{ p: gota, t: "Grasa", a: 0.3, z: 1.1, o: [70, -90], color: "#ffd34d" }]
        }
      />
      {!fase1 ? (
        <Rotulos
          cam={cam}
          b={b}
          items={[
            { p: [CAM8[0], -0.2, 0.4], t: "MÁS CARDIO", a: 0.34, z: 1.1, color: PGC_C, tam: 30 },
            { p: [PLATO8[0], -0.2, 0.4], t: "DIETA", a: 0.5, z: 1.1, color: K.lima, tam: 30 },
            { p: [gota[0] + 0.25, gota[1] - 0.35, gota[2]], t: `−${kg} kg`, a: 0.68, z: 1.1, color: "#ffd34d", tam: 54, ancla: "izq", anton: true },
          ]}
        />
      ) : null}
      <Dato b={b} a={0.08} z={0.32} t="BAJAR GRASA" sub="sin perder velocidad" color={K.amarillo} y={250} tam={100} />
      <Dato b={b} a={0.36} z={0.6} t="AJUSTA LA DIETA" sub="no más cardio" color={K.lima} y={250} tam={100} />
      <Dato b={b} a={0.6} z={1.1} t="CARL LEWIS" sub="−7 kg de grasa con dieta" color={K.amarillo} y={250} tam={104} />
    </AbsoluteFill>
  );
};

// 9 · Checklist + las dos palancas en equilibrio ---------------------------------------------------
const FILAS: { y: number; t: React.ReactNode; a: number; color: string }[] = [
  { y: 1.2, t: <>CARDIO POR SALUD</>, a: 0.08, color: PGC_C },
  { y: 0.5, t: <>SEPÁRALO DE<br />LAS PESAS</>, a: 0.3, color: K.tinta },
  { y: -0.2, t: <>SIN EXCESO SI BUSCAS<br />FUERZA MÁXIMA</>, a: 0.5, color: K.naranja },
  { y: -0.9, t: <>CUIDA TU<br />PROTEÍNA</>, a: 0.8, color: MTOR_C },
];
const SW9_M: V3 = [-0.75, -1.7, 0];
const SW9_P: V3 = [0.75, -1.7, 0];

const Checklist: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const marcas = FILAS.map((f) => entre(b, f.a + 0.06, f.a + 0.1));
  const onP = entre(b, 0.12, 0.2);
  const onM = entre(b, 0.86, 0.94);
  const cam = camara(
    [
      { b: 0, p: [0.4, -0.3, 13.8], l: [0, -1.1, 0], fov: 40 },
      { b: 1, p: [-0.4, -0.4, 14.0], l: [0, -1.1, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[9, 24]}>
        {FILAS.map((f, i) => {
          const s = entre(b, f.a - 0.04, f.a + 0.02);
          if (s <= 0) return null;
          return (
            <group key={i} position={[0, f.y, 0]} scale={[s, s, 1]}>
              <Tarjeta3D ancho={3.0} alto={0.6} color={f.color} brillo={0.3 + marcas[i] * 0.8} />
              <group position={[-1.12, 0, 0.15]}>
                {i === 0 ? <Zapatilla p={[0, -0.12, 0]} escala={0.75} giro={0.3 + Math.sin(b * 6) * 0.2} /> : null}
                {i === 1 ? <Mancuerna p={[0, 0, 0]} escala={0.42} giro={0.2 + Math.sin(b * 10) * 0.1} /> : null}
                {i === 2 ? (
                  <group position={[0, -0.1, 0]} scale={0.38}>
                    <Velocimetro v={0.85} />
                  </group>
                ) : null}
                {i === 3 ? (
                  <>
                    <Pechuga p={[-0.05, -0.12, 0]} escala={0.48} />
                    <Leucina p={[0.13, 0.15, 0.1]} r={0.08} giro={b * 4} />
                  </>
                ) : null}
              </group>
              {marcas[i] > 0 ? <Check p={[1.2, 0, 0.12]} escala={0.85 * marcas[i]} color={i === 0 ? PGC_C : K.lima} /> : null}
            </group>
          );
        })}
        <Interruptor p={SW9_M} on={onM} escala={0.6} />
        <Palanca p={SW9_P} on={onP} escala={0.6} />
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Destello b={b} en={[0.92]} />
      <Rotulos
        cam={cam}
        b={b}
        items={FILAS.map((f) => ({ p: [-0.74, f.y, 0.1] as V3, t: f.t, a: f.a, z: 1.1, color: K.tinta, tam: 28, ancla: "izq" as const }))}
      />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [SW9_M[0] - 0.2, SW9_M[1] - 0.1, SW9_M[2] + 0.4], t: "mTOR", a: 0.04, z: 1.1, o: [-60, 50], color: MTOR_C },
          { p: [SW9_P[0] + 0.2, SW9_P[1] - 0.1, SW9_P[2] + 0.4], t: "PGC-1", a: 0.04, z: 1.1, o: [60, 50], color: PGC_C },
        ]}
      />
      <Dato b={b} a={0.02} z={0.9} t="PARA TI" color={K.tinta} y={250} tam={104} />
      <Dato
        b={b}
        a={0.9}
        z={1.1}
        t={
          <>
            <span style={{ color: MTOR_C }}>FUERZA</span> + <span style={{ color: PGC_C }}>SALUD</span>
          </>
        }
        color="#ffffff"
        y={250}
        tam={100}
      />
    </AbsoluteFill>
  );
};

const Final: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Cardio y pesas el <span style={{ color: K.lima }}>mismo día</span>?</>}
    escribe="Yo hago…"
    ideas={["EL MISMO DÍA", "DÍAS SEPARADOS", "SOLO PESAS"]}
  />
);

const T = [
  "¿El cardio te quita músculo? Para responder hay que bajar a la célula: ahí compiten dos señales, **mTOR** y **PGC-1**.",
  "Como explica Francis Holway en Nutrición sin dogmas, cada tipo de entrenamiento le manda al músculo una señal **distinta**.",
  "La fuerza, la proteína y la insulina encienden **mTOR**: la llave maestra de la síntesis de proteína y de la **hipertrofia**.",
  "El cardio y el entrenamiento de fondo encienden **PGC-1**: la orden de fabricar más **mitocondrias**.",
  "Con PGC-1, tus fibras lentas usan mejor el oxígeno y te vuelves más **resistente**, pero no más grande.",
  "El problema es el **exceso**: muchas señales de PGC-1 pueden interferir con mTOR. Es el **efecto de interferencia**, y afecta sobre todo a la fuerza máxima.",
  "Además, el trabajo extra suma **fatiga**, y puede quitarte recuperación y técnica para lo que de verdad entrenas.",
  "Pero ojo: en los estudios, el tamaño total del músculo **casi no cambia** al sumar cardio. En las fibras el efecto es pequeño, y menor en bici que corriendo.",
  "Por eso, si un velocista necesita bajar grasa, la solución no es más cardio, sino ajustar la **dieta**. Carl Lewis bajaba así sus últimos **siete kilos** de grasa.",
  "Para ti: haz cardio por tu salud sin miedo, sepáralo de tus pesas cuando puedas, no lo exageres si buscas fuerza máxima, y cuida tu proteína.",
  "¿Tú haces cardio y pesas el mismo día? **Escríbelo en los comentarios**.",
];

const ESCENAS = [Gancho, Libro1, MtorS, PgcS, Resistente, Interferencia, Fatiga, Evidencia, Velocista, Checklist, Final];

export const INTERFERENCIA: ShortDef = {
  id: "Short-Interferencia",
  titulo: "¿El cardio te quita músculo? mTOR vs. PGC-1",
  planos: ESCENAS.map((Escena, i) => ({ id: `interferencia-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
