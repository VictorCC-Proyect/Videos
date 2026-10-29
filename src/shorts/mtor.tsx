// Short: mTOR, el interruptor que hace crecer tu músculo. Tensión, leucina, insulina; freno AMPK; entrenamiento concurrente.
// Fuentes: Reidy y Rasmussen 2016 (J Nutr), Lundberg et al. 2022 (Sports Med), Kerksick et al. 2017 (ISSN).
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { Polvo } from "../fisio/modelos/comun";
import { Enlace, Esfera, Membrana, Mol } from "../fisio/modelos/energia";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaComentarios } from "./cierre";
import { Chip, Dato, Destello, INTER, K, ShortDef, Titular } from "./marco";
import { Atleta, Huevo, Pechuga, Piso, Plato } from "./modelos";
import { Reloj3D } from "./modelos-ayunas";
import { Columna } from "./modelos-energia";
import { Camino } from "./modelos-fatiga";
import { F2Flecha } from "./modelos-fibras";
import { INS, Llave, REC, Receptor } from "./modelos-glucosa";
import { FibraMiofibrillas, Filamento, H_ACTINA, H_MIOSINA, H_RIBO, Interruptor, Ribosoma, Sensor } from "./modelos-hipertrofia";
import { Aprox, Bateria, bolaInterruptor, Candado, Check, Ciclista, Edamame, ENERGIA_C, ESTIMULO_C, LEU_C, Leucina, MTOR_C, Pedestal, VasoLeche, AMPK_C } from "./modelos-mtor";
import { Barra3D, Rotulos } from "./modelos-sueno";
import { Mancuerna, Tarjeta3D } from "./modelos-ventana";
import { camViaje, cortesViaje, Viaje } from "./viaje";

const AA = [K.cian, K.rosa, K.morado, "#7fb2ff", "#5fd3c6", "#e7a4ff"];

/** Punto que recorre una polilinea (u 0..1). */
const enRuta = (ruta: V3[], u: number): V3 => {
  const n = ruta.length - 1;
  const k = Math.min(n - 1, Math.floor(Math.max(0, Math.min(1, u)) * n));
  return mix3(ruta[k], ruta[k + 1], Math.max(0, Math.min(1, u)) * n - k);
};

/** Pulsos que viajan de a -> b en bucle (velocidad v, n pulsos). */
const Pulsos: React.FC<{ a: V3; b: V3; t: number; op: number; color?: string; n?: number; r?: number }> = ({ a, b, t, op, color = "#ffffff", n = 3, r = 0.06 }) =>
  op <= 0.01 ? null : (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <Mol key={i} p={mix3(a, b, (t + i / n) % 1)} color={color} r={r} brillo={1.6} op={op} />
      ))}
    </>
  );

// 0 · Gancho: atleta haciendo curl; viaje al interior de la fibra donde está el interruptor -----------
const SW0: V3 = [0, -0.15, 5.5];

const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const k = Math.sin(((b * 3.2) % 1) * Math.PI);
  const fuera = b < 0.42;
  const t = mix(0.28, 1, lineal(b, 0.42, 0.8));
  const camFuera = camara(
    [
      { b: 0, p: [0.5, 1.1, 6.2], l: [0, 0.72, 0], fov: 36 },
      { b: 0.3, p: [-0.2, 1.15, 5.4], l: [0.05, 0.8, 0], fov: 36 },
      { b: 0.42, p: [0.48, 1.36, 0.62], l: [0.22, 1.3, 0.04], fov: 36 },
    ],
    b,
  );
  const cam = fuera ? camFuera : camViaje(t);
  const aparece = entre(b, 0.78, 0.86);
  const intenta = Math.max(0, Math.sin(lineal(b, 0.86, 0.98) * Math.PI)) * 0.35;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2} niebla={!fuera && t > 0.72 ? [10, 34] : undefined}>
        {fuera ? (
          <>
            <Atleta ej="curl" k={k} brilla={0.2 + 0.45 * k} colorBrillo={MTOR_C} musculo={0.9} />
            <Piso />
          </>
        ) : (
          <>
            <Viaje t={t} b={b} interior={{ pcr: 6, brillo: 0.15 }} />
            {aparece > 0 ? <Interruptor p={SW0} on={intenta} escala={0.6 * aparece} /> : null}
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.42, ...cortesViaje(0.42, 0.8).slice(1)]} />
      <Chip b={b} a={0.04} z={0.3} t="VIDEO DE HIPERTROFIA" x={540} y={330} color={K.suave} />
      <Titular b={b} a={0.3} z={0.42} y={300} tam={140} color={MTOR_C} t="mTOR" />
      <Chip b={b} a={0.45} z={0.58} t="MÚSCULO" x={540} y={330} color={K.rojo} />
      <Chip b={b} a={0.6} z={0.78} t="FIBRA MUSCULAR" x={540} y={330} color={K.rosa} />
      <Titular b={b} a={0.8} z={1.1} y={300} tam={140} color={MTOR_C} t="mTOR" />
      <Chip b={b} a={0.84} z={1.1} t="EL INTERRUPTOR DEL MÚSCULO" x={540} y={1100} color={MTOR_C} />
    </AbsoluteFill>
  );
};

// 1 · mTOR = sensor: revisa energía, nutrientes y estímulo ----------------------------------------
const SW1: V3 = [0, -1.15, 0];
const ENTRADAS: { p: V3; t: string; color: string; a: number }[] = [
  { p: [-1.15, 0.75, 0], t: "ENERGÍA", color: ENERGIA_C, a: 0.51 },
  { p: [0, 1.15, -0.2], t: "NUTRIENTES", color: LEU_C, a: 0.58 },
  { p: [1.15, 0.75, 0], t: "ESTÍMULO", color: ESTIMULO_C, a: 0.65 },
];

const SensorM: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const on = entre(b, 0.8, 0.88);
  const cam = camara(
    [
      { b: 0, p: [0.5, -0.2, 7.2], l: [0, -0.8, 0], fov: 40 },
      { b: 0.38, p: [0.4, 0.4, 12.0], l: [0, -0.45, 0], fov: 40 },
      { b: 1, p: [-0.5, 0.5, 11.8], l: [0, -0.45, 0], fov: 40 },
    ],
    b,
  );
  const base: V3 = [SW1[0], SW1[1] + 0.25, SW1[2] + 0.2];
  const aa: V3[] = [
    [-0.13, 0.42, 0],
    [0.13, 0.42, 0.05],
    [0, 0.6, -0.05],
    [0, 0.36, 0.15],
  ];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 22]}>
        <Interruptor p={SW1} on={on} escala={0.9} />
        {ENTRADAS.map((e, i) => {
          const llega = entre(b, e.a - 0.02, e.a + 0.02);
          const revisa = lineal(b, e.a - 0.07, e.a);
          const tope: V3 = [e.p[0], e.p[1] + 0.05, e.p[2]];
          return (
            <group key={i}>
              <Enlace a={base} b={tope} r={0.02} color={e.color} op={0.25 + 0.5 * llega} brillo={0.3 + llega} />
              {revisa > 0 && revisa < 1 ? <Mol p={mix3(base, tope, revisa)} color="#ffffff" r={0.08} brillo={2} /> : null}
              <Pulsos a={tope} b={base} t={b * 4 + i * 0.3} op={entre(b, 0.78, 0.82)} color={e.color} n={2} r={0.06} />
              <Pedestal p={e.p} color={e.color} on={llega} />
            </group>
          );
        })}
        {/* energía */}
        <Bateria p={[ENTRADAS[0].p[0], ENTRADAS[0].p[1] + 0.48, 0]} nivel={0.9} escala={0.6} brillo={0.3 + 0.6 * entre(b, 0.49, 0.53)} />
        {/* nutrientes: aminoácidos con leucina */}
        <group position={ENTRADAS[1].p}>
          {aa.map((q, i) => (i === 0 ? <Leucina key={i} p={q} r={0.1} giro={b * 3} /> : <Esfera key={i} p={q} r={0.1} color={AA[i]} brillo={0.4} />))}
          <Enlace a={aa[0]} b={aa[2]} r={0.02} />
          <Enlace a={aa[1]} b={aa[2]} r={0.02} />
          <Enlace a={aa[3]} b={aa[1]} r={0.02} />
        </group>
        {/* estímulo: carga */}
        <Mancuerna p={[ENTRADAS[2].p[0], ENTRADAS[2].p[1] + 0.27, 0]} escala={0.55} giro={0.15} />
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Destello b={b} en={[0.84]} color={MTOR_C} />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [SW1[0] - 0.45, SW1[1] + 0.1, SW1[2] + 0.3], t: "mTOR (proteína)", a: 0.04, z: 1.1, o: [-60, 110], color: MTOR_C },
          ...ENTRADAS.map((e, i) => ({
            p: [e.p[0], e.p[1] + (i === 1 ? 0.75 : 0.95), e.p[2]] as V3,
            t: e.t,
            a: e.a - 0.01,
            z: 1,
            o: [i === 0 ? -20 : i === 2 ? 20 : 60, -90] as [number, number],
            color: e.color,
          })),
        ]}
      />
      <Dato b={b} a={0.36} z={1} t="UN SENSOR" sub="revisa antes de construir" color={MTOR_C} y={250} tam={104} />
    </AbsoluteFill>
  );
};

// 2 · Encendido -> ribosomas -> actina y miosina -> la fibra crece ---------------------------------
const SW2: V3 = [0, 3.55, 0.7];
const RIB_A: V3 = [-0.48, 2.45, 0.9];
const RIB_B: V3 = [0.48, 2.25, 1.0];
const VUELOS = Array.from({ length: 12 }).map((_, i) => {
  const ang = (i / 12) * Math.PI * 2 + 0.4;
  return { tipo: (i % 2 ? "miosina" : "actina") as "actina" | "miosina", fin: [Math.cos(ang) * 0.95, 1.1, Math.sin(ang) * 0.95] as V3 };
});

const Construye: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const on = entre(b, 0.02, 0.1);
  const hace = lineal(b, 0.24, 0.52);
  const crece = entre(b, 0.66, 0.92);
  const cam = camara(
    [
      { b: 0, p: [0.2, 3.1, 9.0], l: [0, 2.7, 0.9], fov: 40 },
      { b: 0.46, p: [-0.2, 3.1, 8.8], l: [0, 2.7, 0.9], fov: 40 },
      { b: 0.62, p: [0.4, 5.0, 11.5], l: [0, 0.95, 0], fov: 40 },
      { b: 1, p: [-0.5, 5.2, 11.3], l: [0, 0.95, 0], fov: 40 },
    ],
    b,
  );
  const sale = bolaInterruptor(SW2, 1, 0.5);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[6, 22]}>
        <FibraMiofibrillas crece={crece} brillo={0.3 * crece} />
        <Interruptor p={SW2} on={on} escala={0.5} />
        <Pulsos a={[SW2[0] - 0.2, SW2[1] - 0.1, SW2[2]]} b={[RIB_A[0], RIB_A[1] + 0.3, RIB_A[2]]} t={b * 5} op={visible(b, 0.1, 0.55, 0.04)} color={MTOR_C} />
        <Pulsos a={[SW2[0] + 0.2, SW2[1] - 0.1, SW2[2]]} b={[RIB_B[0], RIB_B[1] + 0.3, RIB_B[2]]} t={b * 5 + 0.15} op={visible(b, 0.1, 0.55, 0.04)} color={MTOR_C} />
        <Ribosoma p={RIB_A} color={H_ACTINA} n={hace * 10} avance={b * 8} escala={0.8} giro={0.2} />
        <Ribosoma p={RIB_B} color={H_MIOSINA} n={hace * 10} avance={b * 8} escala={0.8} giro={-0.2} />
        {VUELOS.map((v, i) => {
          const f = entre(b, 0.54 + i * 0.016, 0.74 + i * 0.016);
          if (f <= 0 || f >= 1) return null;
          const ini = mix3(v.tipo === "actina" ? RIB_A : RIB_B, [0, 3.0, 1], 0.3);
          const p = mix3(ini, v.fin, f);
          return <Filamento key={i} p={[p[0], p[1] + Math.sin(f * Math.PI) * 0.4, p[2]]} tipo={v.tipo} escala={0.9} giro={f * 2 + i} />;
        })}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Destello b={b} en={[0.06]} color={MTOR_C} />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [sale[0], sale[1], sale[2]], t: "mTOR encendido", a: 0.06, z: 0.5, o: [70, -60], color: MTOR_C },
          { p: [RIB_A[0] - 0.25, RIB_A[1], RIB_A[2]], t: "Ribosoma", a: 0.25, z: 0.55, o: [-40, 120], color: H_RIBO },
          { p: [RIB_B[0] + 0.2, RIB_B[1] - 0.15, RIB_B[2]], t: "Ribosoma", a: 0.27, z: 0.55, o: [40, 140], color: H_RIBO },
          { p: [-0.6, 1.25, 0.6], t: "Actina", a: 0.78, z: 1.1, o: [-60, 120], color: H_ACTINA },
          { p: [0.6, 1.25, 0.6], t: "Miosina", a: 0.82, z: 1.1, o: [60, 120], color: H_MIOSINA },
        ]}
      />
      <Dato b={b} a={0.36} z={0.6} t="+ PROTEÍNA NUEVA" color={MTOR_C} y={250} tam={92} />
      <Dato b={b} a={0.62} z={1} t="ACTINA + MIOSINA" sub="la fibra se hace más gruesa" color={H_ACTINA} y={250} tam={92} />
    </AbsoluteFill>
  );
};

// 3 · Tensión mecánica -> sensor de la membrana -> señal hasta mTOR -----------------------------------
const NODOS: V3[] = [
  [0.0, 1.05, 0.35],
  [0.45, 0.45, 0.4],
  [-0.35, -0.05, 0.45],
];
const SW3: V3 = [0, -1.0, 0.4];

const Tension: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuera = b < 0.47;
  const rep = Math.max(0, b - 0.04) * 2.4;
  const k = Math.sin((rep % 1) * Math.PI);
  const tira = entre(b, 0.5, 0.6);
  const senal = lineal(b, 0.66, 0.84);
  const on = entre(b, 0.83, 0.9);
  const ruta: V3[] = [[0, 1.0, 0.3], ...NODOS, [SW3[0], SW3[1] + 0.6, SW3[2]]];
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [1.2, 1.15, 5.6], l: [0.05, 0.66, 0], fov: 36 },
          { b: 0.47, p: [0.8, 1.3, 3.8], l: [0.1, 1.0, 0], fov: 36 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.47, p: [0.9, 2.4, 6.6], l: [0, 1.55, 0], fov: 40 },
          { b: 0.64, p: [0.6, 1.4, 10.6], l: [0, 0.5, 0], fov: 40 },
          { b: 1, p: [-0.6, 1.2, 11.4], l: [0.1, 0.35, 0], fov: 40 },
        ],
        b,
      );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2} niebla={fuera ? undefined : [7, 22]}>
        {fuera ? (
          <>
            <Atleta ej="curl" k={k} brilla={0.15 + 0.6 * k * entre(b, 0.1, 0.3)} colorBrillo={ESTIMULO_C} musculo={0.9} />
            <Piso color={ESTIMULO_C} />
          </>
        ) : (
          <>
            <group position={[0, 1.75, 0]}>
              <Membrana ancho={5} prof={2.4} />
            </group>
            <Sensor p={[0, 1.75, 0.3]} tension={tira} />
            <Enlace a={[-2.2, 2.65 + tira * 0.12, 0.3]} b={[2.2, 2.65 + tira * 0.12, 0.3]} r={0.045} color="#f6e7d8" brillo={0.15} />
            {[1, -1].map((s) => (
              <F2Flecha key={s} a={[s * 1.0, 2.9, 0.3]} b={[s * 1.0, 3.2 + tira * 0.4, 0.3]} color={ESTIMULO_C} r={0.05} op={tira} />
            ))}
            {NODOS.map((p, i) => {
              const lit = entre(senal, (i + 0.6) / 4, (i + 1) / 4);
              return <Mol key={i} p={p} color={ESTIMULO_C} r={0.16} brillo={0.2 + lit * 1.6} op={0.5 + 0.5 * Math.max(lit, 0.4)} />;
            })}
            {ruta.slice(1).map((p, i) => (
              <Enlace key={i} a={ruta[i]} b={p} r={0.02} color={ESTIMULO_C} op={0.45} brillo={0.4} />
            ))}
            {senal > 0 && senal < 1 ? <Mol p={enRuta(ruta, senal)} color="#ffffff" r={0.1} brillo={2} /> : null}
            <Interruptor p={SW3} on={on} escala={0.85} />
            <Polvo b={b} radio={4} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.47, 0.86]} />
      <Dato b={b} a={0.08} z={0.5} t="TENSIÓN MECÁNICA" sub="interruptor nº 1" color={ESTIMULO_C} y={250} tam={86} />
      <Dato b={b} a={0.84} z={1} t="SEÑAL → mTOR" sub="tensión mecánica" color={MTOR_C} y={250} tam={92} />
      <Chip b={b} a={0.3} z={0.47} t="CARGA PESADA" x={540} y={1100} color={ESTIMULO_C} />
      {!fuera ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [-0.15, 2.55, 0.3], t: "Sensor de tensión", a: 0.5, z: 0.8, o: [-60, -90], color: ESTIMULO_C },
            { p: [2.0, 1.75, 0.6], t: "Membrana", a: 0.52, z: 0.8, o: [-60, 90], color: "#f7d9a8" },
            { p: NODOS[1], t: "Señal", a: 0.68, z: 1.1, o: [70, -40], color: ESTIMULO_C },
            { p: [SW3[0] - 0.4, SW3[1], SW3[2] + 0.3], t: "mTOR", a: 0.84, z: 1.1, o: [-90, 60], color: MTOR_C },
          ]}
        />
      ) : null}
    </AbsoluteFill>
  );
};

// 4 · Leucina: la proteína se desarma; la leucina llena el medidor y enciende mTOR ------------------
const SW4: V3 = [-0.7, 0.75, 0];
const GAUGE: V3 = [0.8, -1.75, 0];
const ALTO4 = 1.8;
const CADENA = Array.from({ length: 12 }).map((_, i) => {
  const a = i * 0.9;
  return {
    leu: i === 2 || i === 6 || i === 9,
    p: [-0.7 + Math.cos(a) * 0.2, -0.55 + (i - 6) * 0.1, Math.sin(a) * 0.2] as V3,
    suelta: [-0.7 + Math.cos(i * 2.1) * 0.6, -0.55 + Math.sin(i * 1.7) * 0.5, Math.sin(i * 3.1) * 0.3] as V3,
  };
});
const LEU_EXTRA = Array.from({ length: 7 }).map((_, i) => [-0.95 + (i % 4) * 0.17, -1.6 + Math.floor(i / 4) * 0.05, 0.1 + (i % 2) * 0.15] as V3);

const LeucinaM: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const desarma = entre(b, 0.24, 0.38);
  const llenado = lineal(b, 0.4, 0.66) * 1.15;
  const cruza = llenado >= 1;
  const on = entre(b, 0.66, 0.74);
  const tope: V3 = [GAUGE[0], GAUGE[1] + 0.08 + ALTO4 * Math.min(1.15, llenado), GAUGE[2]];
  const cam = camara(
    [
      { b: 0, p: [-0.8, -0.3, 7.0], l: [-0.6, -0.9, 0], fov: 40 },
      { b: 0.36, p: [0.3, 0.3, 12.0], l: [0, -0.7, 0], fov: 40 },
      { b: 1, p: [-0.4, 0.4, 12.1], l: [0, -0.7, 0], fov: 40 },
    ],
    b,
  );
  const leus = [...CADENA.filter((c) => c.leu).map((c) => mix3(c.p, c.suelta, desarma)), ...LEU_EXTRA];
  const g = Math.min(2.3, llenado * 2);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 22]}>
        <Interruptor p={SW4} on={on} escala={0.75} />
        {on > 0.3 ? (
          <mesh position={[SW4[0], SW4[1] + 0.3, SW4[2]]}>
            <sphereGeometry args={[1.0 + 0.1 * Math.sin(b * 30), 24, 16]} />
            <meshBasicMaterial color={MTOR_C} transparent opacity={0.08 * on} depthWrite={false} />
          </mesh>
        ) : null}
        {/* plato con pollo */}
        <Plato p={[-0.7, -1.8, 0]} escala={1.1} />
        <Pechuga p={[-0.7, -1.71, 0]} escala={0.75} />
        {/* proteína -> aminoácidos */}
        {CADENA.map((c, i) => {
          const q = mix3(c.p, c.suelta, desarma);
          if (c.leu) return null;
          return <Esfera key={i} p={[q[0], q[1] + Math.sin(b * 3 + i) * 0.03 * desarma, q[2]]} r={0.085} color={AA[i % AA.length]} brillo={0.3} op={mix(1, 0.55, desarma)} />;
        })}
        {desarma < 1 ? CADENA.slice(0, -1).map((c, i) => <Enlace key={`e${i}`} a={mix3(c.p, c.suelta, desarma)} b={mix3(CADENA[i + 1].p, CADENA[i + 1].suelta, desarma)} r={0.018} op={1 - desarma} />) : null}
        {leus.map((p0, i) => {
          const f = entre(b, 0.4 + i * 0.025, 0.5 + i * 0.025);
          const ini: V3 = i < 3 ? p0 : [p0[0], p0[1] + 0.25 * entre(b, 0.3, 0.38), p0[2]];
          if (i >= 3 && b < 0.3) return null;
          if (f >= 1) return null;
          const p = mix3(ini, [GAUGE[0], GAUGE[1] + ALTO4 * 1.4, GAUGE[2]], f);
          return <Leucina key={i} p={[p[0], p[1] + Math.sin(f * Math.PI) * 0.4, p[2]]} r={0.085} giro={b * 4 + i} />;
        })}
        {/* medidor de leucina: el aro marca 2 g */}
        <group position={GAUGE}>
          <Barra3D valor={Math.max(0.01, llenado)} color={LEU_C} alto={ALTO4} r={0.2} />
        </group>
        <Pulsos a={tope} b={[SW4[0] + 0.3, SW4[1], SW4[2]]} t={b * 5} op={on} color={LEU_C} n={3} r={0.07} />
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Destello b={b} en={[0.68]} color={MTOR_C} />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: CADENA[6].p, t: "Leucina", a: 0.08, z: 0.4, o: [90, -60], color: LEU_C },
          { p: [-0.7, -0.55, 0.2], t: "Proteína", a: 0.04, z: 0.26, o: [-60, -60], color: K.cian },
          { p: [-1.2, -0.75, 0.2], t: "Aminoácidos", a: 0.3, z: 0.6, o: [-10, 120], color: K.cian },
          { p: [SW4[0] - 0.4, SW4[1], SW4[2] + 0.3], t: "mTOR", a: 0.6, z: 1.1, o: [-40, 90], color: MTOR_C },
        ]}
      />
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [GAUGE[0] + 0.32, GAUGE[1] + 0.08 + ALTO4, 0], t: "2 g", a: 0.4, z: 1.1, color: "#ffffff", tam: 44, ancla: "izq", anton: true },
          { p: [GAUGE[0], GAUGE[1] + ALTO4 * 1.45 + 0.2, 0], t: "LEUCINA", a: 0.4, z: 1.1, color: LEU_C, tam: 34 },
        ]}
      />
      <Dato b={b} a={0.08} z={0.4} t="LEUCINA" sub="un aminoácido de la proteína" color={LEU_C} y={250} tam={104} />
      <Dato b={b} a={0.4} z={0.66} t={`${g.toFixed(1)} g`} sub="de leucina en la comida" color={LEU_C} y={250} tam={110} />
      <Dato b={b} a={0.66} z={1} t="> 2 g" sub="mTOR se enciende con fuerza" color={cruza ? MTOR_C : LEU_C} y={250} tam={120} />
    </AbsoluteFill>
  );
};

// 5 · 25–30 g de proteína ≈ > 2 g de leucina: pollo, huevo, lácteos o soya --------------------------
const COMIDA_P: V3[] = [
  [-0.85, -1.15, 0.3],
  [-0.3, -1.2, 0.7],
  [0.3, -1.2, 0.7],
  [0.85, -1.15, 0.3],
];

const Comida: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const prot = lineal(b, 0.16, 0.42);
  const leu = lineal(b, 0.3, 0.52);
  const sale = [0.6, 0.67, 0.74, 0.8].map((a) => entre(b, a, a + 0.06));
  const cam = camara(
    [
      { b: 0, p: [0.3, 1.0, 8.6], l: [0, 0.1, 0], fov: 40 },
      { b: 0.52, p: [-0.3, 1.6, 12.0], l: [0, -0.45, 0], fov: 40 },
      { b: 1, p: [0.4, 1.8, 12.0], l: [0, -0.45, 0], fov: 40 },
    ],
    b,
  );
  const PROT: V3 = [-0.55, -0.15, 0];
  const LEUB: V3 = [0.55, -0.15, 0];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 22]}>
        <group position={PROT}>
          <Barra3D valor={Math.max(0.01, prot)} color={K.cian} alto={1.3} r={0.24} />
        </group>
        <group position={LEUB}>
          <Barra3D valor={Math.max(0.01, leu * 1.1)} color={LEU_C} alto={1.3} r={0.24} />
        </group>
        {leu > 0 && leu < 1
          ? [0, 1, 2].map((i) => {
              const f = (leu * 3 + i / 3) % 1;
              return <Leucina key={i} p={mix3([PROT[0] + 0.1, PROT[1] + 0.2 + prot * 1.2, 0.2], [LEUB[0], LEUB[1] + 1.7, 0.2], f)} r={0.07} giro={b * 5} />;
            })
          : null}
        <Plato p={[0, -1.3, 0.4]} escala={1.85} />
        {sale[0] > 0 ? <Pechuga p={COMIDA_P[0]} escala={0.7 * sale[0]} /> : null}
        {sale[1] > 0 ? <Huevo p={COMIDA_P[1]} escala={0.9 * sale[1]} /> : null}
        {sale[2] > 0 ? <VasoLeche p={[COMIDA_P[2][0], COMIDA_P[2][1] - 0.05, COMIDA_P[2][2]]} escala={0.8 * sale[2]} /> : null}
        {sale[3] > 0 ? <Edamame p={COMIDA_P[3]} escala={1.0 * sale[3]} /> : null}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [PROT[0], PROT[1] - 0.25, 0.3], t: "PROTEÍNA", a: 0.16, z: 1.1, color: K.cian, tam: 32 },
          { p: [LEUB[0], LEUB[1] - 0.25, 0.3], t: "LEUCINA", a: 0.3, z: 1.1, color: LEU_C, tam: 32 },
          { p: [0, PROT[1] + 1.0, 0], t: "≈", a: 0.4, z: 1.1, color: "#ffffff", tam: 90, anton: true },
        ]}
      />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: COMIDA_P[0], t: "Pollo", a: 0.62, z: 1.1, o: [-30, -90], color: "#f3dcc0" },
          { p: COMIDA_P[1], t: "Huevo", a: 0.69, z: 1.1, o: [-60, 90], color: "#ffb21f" },
          { p: [COMIDA_P[2][0], COMIDA_P[2][1] + 0.1, COMIDA_P[2][2]], t: "Lácteos", a: 0.76, z: 1.1, o: [60, 90], color: "#f4f7f2" },
          { p: COMIDA_P[3], t: "Soya", a: 0.82, z: 1.1, o: [30, -90], color: "#8fdc4f" },
        ]}
      />
      <Dato b={b} a={0.16} z={0.38} t="25–30 g" sub="de proteína por comida" color={K.cian} y={250} tam={110} />
      <Dato b={b} a={0.38} z={1} t="≈ > 2 g LEUCINA" sub="proteína de buena calidad" color={LEU_C} y={250} tam={92} />
    </AbsoluteFill>
  );
};

// 6 · Insulina + energía: material y combustible --------------------------------------------------------
const MEM6 = 1.0;
const REC6: V3 = [-0.55, MEM6, 0.4];
const SW6: V3 = [0, -1.0, 0.4];
const BAT6: V3 = [1.2, -0.3, 0.4];
const MAT6: V3 = [-1.2, -0.55, 0.4];

const Insulina: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const llega = entre(b, 0.03, 0.12);
  const unida = entre(b, 0.11, 0.15);
  const senal = lineal(b, 0.15, 0.3);
  const carga = entre(b, 0.14, 0.3);
  const on = 0.45 * entre(b, 0.28, 0.36) + 0.55 * entre(b, 0.66, 0.78);
  const prot = lineal(b, 0.78, 0.98);
  const cam = camara(
    [
      { b: 0, p: [0.4, 2.0, 7.0], l: [-0.2, 1.1, 0], fov: 40 },
      { b: 0.3, p: [0.6, 1.1, 12.4], l: [0, -0.1, 0], fov: 40 },
      { b: 1, p: [-0.5, 1.0, 12.6], l: [0, -0.15, 0], fov: 40 },
    ],
    b,
  );
  const sitio: V3 = [REC6[0], REC6[1] + 0.86, REC6[2]];
  const llave: V3 = mix3([REC6[0] + 0.7, MEM6 + 1.7, REC6[2] + 0.3], sitio, llega);
  const rutaS: V3[] = [[REC6[0], REC6[1] - 0.6, REC6[2]], [REC6[0] + 0.1, -0.2, REC6[2] + 0.1], [SW6[0] - 0.25, SW6[1] + 0.45, SW6[2]]];
  const amin: V3[] = Array.from({ length: 9 }).map((_, i) => [MAT6[0] + Math.cos(i * 2.3) * 0.25, MAT6[1] + Math.floor(i / 3) * 0.17, MAT6[2] + Math.sin(i * 2.3) * 0.2]);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 24]}>
        <group position={[0, MEM6, 0]}>
          <Membrana ancho={5.2} prof={2.4} />
        </group>
        <Receptor p={REC6} activo={unida} />
        <Llave p={llave} escala={1.4} giro={Math.PI} brillo={0.5 + unida * 0.5} op={Math.min(1, llega * 4 + 0.01)} />
        {senal > 0 && senal < 1 ? <Mol p={enRuta(rutaS, senal)} color={INS} r={0.1} brillo={2} /> : null}
        {rutaS.slice(1).map((p, i) => (
          <Enlace key={i} a={rutaS[i]} b={p} r={0.018} color={INS} op={0.35 * unida} brillo={0.5} />
        ))}
        <Interruptor p={SW6} on={on} escala={0.85} />
        {/* combustible */}
        <Bateria p={BAT6} nivel={mix(0.15, 1, carga)} escala={0.75} />
        <Pulsos a={[BAT6[0] - 0.2, BAT6[1] - 0.2, BAT6[2]]} b={[SW6[0] + 0.5, SW6[1] + 0.2, SW6[2]]} t={b * 4} op={entre(b, 0.66, 0.72)} color={ENERGIA_C} />
        {/* material: aminoácidos */}
        {amin.map((q, i) => (i % 4 === 0 ? <Leucina key={i} p={q} r={0.075} giro={b * 3 + i} /> : <Esfera key={i} p={q} r={0.075} color={AA[i % AA.length]} brillo={0.4} />))}
        <Pulsos a={[MAT6[0] + 0.2, MAT6[1] + 0.1, MAT6[2]]} b={[SW6[0] - 0.5, SW6[1] + 0.2, SW6[2]]} t={b * 4 + 0.2} op={entre(b, 0.64, 0.7)} color={K.cian} />
        {/* fabrica proteína */}
        {prot > 0
          ? Array.from({ length: Math.round(2 + prot * 9) }).map((_, i) => (
              <Esfera key={`p${i}`} p={[SW6[0] - 0.6 + i * 0.12, SW6[1] - 0.42 + Math.sin(i * 1.2) * 0.06, SW6[2] + 0.5]} r={0.06} color={i % 2 ? H_ACTINA : H_MIOSINA} brillo={0.5} />
            ))
          : null}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [llave[0], llave[1] + 0.25, llave[2]], t: "Insulina", a: 0.04, z: 0.5, o: [90, 40], color: INS },
          { p: [REC6[0] - 0.2, REC6[1] + 0.3, REC6[2]], t: "Receptor", a: 0.12, z: 0.5, o: [-60, -90], color: REC },
          { p: [BAT6[0], BAT6[1] + 0.45, BAT6[2]], t: "Energía", a: 0.16, z: 1.1, o: [-20, -100], color: ENERGIA_C },
          { p: [MAT6[0], MAT6[1] + 0.4, MAT6[2]], t: "Aminoácidos", a: 0.62, z: 1.1, o: [20, -110], color: K.cian },
          { p: [SW6[0] + 0.3, SW6[1] - 0.1, SW6[2] + 0.3], t: "mTOR", a: 0.32, z: 1.1, o: [60, 110], color: MTOR_C },
        ]}
      />
      <Dato b={b} a={0.04} z={0.62} t="INSULINA + ENERGÍA" sub="también lo apoyan" color={INS} y={250} tam={86} />
      <Dato b={b} a={0.62} z={1} t="MATERIAL + COMBUSTIBLE" color={MTOR_C} y={250} tam={78} />
    </AbsoluteFill>
  );
};

// 7 · AMPK, el freno: falta energía -> candado rojo baja la palanca ----------------------------------
const SW7: V3 = [0.1, -0.4, 0];
const ESC7 = 0.95;

const Ampk: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const drena = entre(b, 0.06, 0.34);
  const act = entre(b, 0.22, 0.3);
  const empuja = entre(b, 0.36, 0.5);
  const on = 1 - empuja;
  const bola = bolaInterruptor(SW7, on, ESC7);
  const ini: V3 = [1.05, 1.0, 0.35];
  const contacto: V3 = [bola[0] + 0.28, bola[1] + 0.3, bola[2] + 0.1];
  const pos = b < 0.36 ? mix3(ini, [bolaInterruptor(SW7, 1, ESC7)[0] + 0.28, bolaInterruptor(SW7, 1, ESC7)[1] + 0.3, 0.1], entre(b, 0.28, 0.36)) : contacto;
  const reloj = 6 + lineal(b, 0.52, 0.72) * 14;
  const cam = camara(
    [
      { b: 0, p: [0.5, 0.6, 8.6], l: [0, -0.3, 0], fov: 40 },
      { b: 0.5, p: [0.2, 0.4, 11.0], l: [0, -0.85, 0], fov: 40 },
      { b: 1, p: [-0.5, 0.4, 11.2], l: [0, -0.9, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 24]}>
        <Interruptor p={SW7} on={on} escala={ESC7} />
        <Bateria p={[-1.05, 0.95, 0]} nivel={mix(1, 0.08, drena)} escala={0.75} brillo={0.4 + 0.6 * (drena > 0.9 ? 0.5 + 0.5 * Math.sin(b * 60) : 0)} />
        <Candado p={pos} escala={0.75} act={act} cierra={empuja} op={mix(0.4, 1, act)} giro={0.25 * (1 - empuja)} />
        {empuja > 0 && empuja < 1 ? <F2Flecha a={[bola[0] + 0.55, bola[1] + 0.55, 0.3]} b={[bola[0] - 0.05, bola[1] + 0.1, 0.3]} color={AMPK_C} r={0.035} op={0.9} /> : null}
        {/* causas */}
        {b > 0.5 ? (
          <>
            <Reloj3D p={[-0.95, -1.55, 0.2]} r={0.42 * entre(b, 0.5, 0.56)} hora={reloj} color={K.naranja} />
            <Plato p={[0.95, -1.75, 0.3]} escala={0.9 * entre(b, 0.68, 0.74)} />
            {b > 0.7 ? <Huevo p={[0.95, -1.7, 0.3]} escala={0.3} /> : null}
          </>
        ) : null}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Destello b={b} en={[0.42]} color={AMPK_C} />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-1.05, 1.4, 0], t: "Energía baja", a: 0.3, z: 1.1, o: [20, -70], color: AMPK_C },
          { p: [pos[0], pos[1] + 0.3, pos[2]], t: "AMPK", a: 0.24, z: 1.1, o: [-30, -100], color: AMPK_C },
          { p: [SW7[0] + 0.45, SW7[1] - 0.05, SW7[2] + 0.4], t: "mTOR", a: 0.04, z: 1.1, o: [70, 40], color: MTOR_C },
          { p: [-0.95, -1.15, 0.2], t: "Ayuno muy largo", a: 0.56, z: 1.1, o: [20, -90], color: K.naranja },
          { p: [0.95, -1.7, 0.3], t: "Déficit agresivo", a: 0.74, z: 1.1, o: [-20, -110], color: K.naranja },
        ]}
      />
      <Dato b={b} a={0.06} z={1} t="AMPK = FRENO" sub="se enciende cuando falta energía" color={AMPK_C} y={250} tam={104} />
    </AbsoluteFill>
  );
};

// 8 · Cardio: el músculo casi igual; en las fibras efecto pequeño, mayor corriendo --------------------
const Cardio: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fase1 = b < 0.46;
  const k = 0.5 + 0.5 * Math.sin(b * 12);
  const crece = entre(b, 0.6, 0.85);
  const cam = fase1
    ? camara(
        [
          { b: 0, p: [0.3, 1.2, 6.6], l: [0, 0.62, 0], fov: 36 },
          { b: 0.46, p: [-0.3, 1.1, 6.3], l: [0, 0.62, 0], fov: 36 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.46, p: [0.2, 2.3, 11.0], l: [0, 1.15, 0], fov: 38 },
          { b: 1, p: [-0.3, 2.4, 10.8], l: [0, 1.15, 0], fov: 38 },
        ],
        b,
      );
  const correr: V3 = [-0.78, 0, 0];
  const pedal: V3 = [0.78, 0, 0];
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
              <Atleta ej="flex" k={k} musculo={0.9} brilla={0.25} colorBrillo={K.cian} />
              <Piso color={K.cian} />
            </group>
            {b > 0.24 ? <Aprox p={[0, 1.2, 0.3]} escala={1.1 * entre(b, 0.24, 0.3)} color="#ffffff" /> : null}
          </>
        ) : (
          <>
            <group position={correr} rotation={[0, 0.9, 0]}>
              <Atleta ej="sprint" fase={b * 40} musculo={0.85} brilla={0.2} colorBrillo={K.naranja} />
              <Camino avance={b * 30} largo={2.4} ancho={0.8} />
            </group>
            <group position={pedal} rotation={[0, 0.9, 0]} scale={0.95}>
              <Ciclista giro={b * 28} brilla={0.2} colorBrillo={K.cian} color={K.cian} />
            </group>
            <Columna p={[correr[0], 2.15, 0]} nivel={0.36 * crece} color={K.naranja} alto={1.0} r={0.17} />
            <Columna p={[pedal[0], 2.15, 0]} nivel={0.14 * crece} color={K.cian} alto={1.0} r={0.17} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.46]} />
      {fase1 ? (
        <>
          <Chip b={b} a={0.24} z={0.46} t="SOLO PESAS" x={300} y={1100} color={MTOR_C} />
          <Chip b={b} a={0.26} z={0.46} t="PESAS + CARDIO" x={780} y={1100} color={K.cian} />
        </>
      ) : null}
      {!fase1 ? (
        <Rotulos
          cam={cam}
          b={b}
          items={[
            { p: [correr[0], 1.95, 0.3], t: "CORRER", a: 0.5, z: 1.1, color: K.naranja, tam: 36 },
            { p: [pedal[0], 1.95, 0.3], t: "PEDALEAR", a: 0.52, z: 1.1, color: K.cian, tam: 36 },
          ]}
        />
      ) : null}
      <Dato b={b} a={0.02} z={0.24} t="¿EL CARDIO?" sub="¿apaga tus ganancias?" color={K.naranja} y={250} tam={104} />
      <Dato b={b} a={0.24} z={0.46} t="MÚSCULO ≈ IGUAL" sub="el tamaño casi no cambia" color={MTOR_C} y={250} tam={90} />
      <Dato b={b} a={0.54} z={1} t="EFECTO PEQUEÑO" sub="en las fibras · mayor al correr" color={K.naranja} y={250} tam={92} />
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
          opacity: visible(b, 0.56, 1, 0.06),
        }}
      >
        Lundberg et al. 2022
      </div>
    </AbsoluteFill>
  );
};

// 9 · Checklist para encender mTOR --------------------------------------------------------------
const FILAS: { y: number; t: React.ReactNode; a: number; color: string }[] = [
  { y: 1.0, t: <>ENTRENA PESADO<br />CERCA DEL FALLO</>, a: 0.16, color: ESTIMULO_C },
  { y: 0.15, t: <>PROTEÍNA REPARTIDA<br />CON LEUCINA</>, a: 0.4, color: LEU_C },
  { y: -0.7, t: <>SIN DÉFICIT<br />EXTREMO</>, a: 0.77, color: ENERGIA_C },
];
const SW9: V3 = [0, -1.75, 0];

const Checklist: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const marcas = FILAS.map((f) => entre(b, f.a + 0.06, f.a + 0.1));
  const on = 0.25 * marcas[0] + 0.25 * marcas[1] + 0.5 * marcas[2];
  const cam = camara(
    [
      { b: 0, p: [0.4, 0.0, 12.4], l: [0, -1.0, 0], fov: 40 },
      { b: 1, p: [-0.4, -0.1, 12.6], l: [0, -1.0, 0], fov: 40 },
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
              <Tarjeta3D ancho={2.9} alto={0.72} color={f.color} brillo={0.3 + marcas[i] * 0.8} />
              <group position={[-1.05, 0, 0.15]}>
                {i === 0 ? <Mancuerna p={[0, 0, 0]} escala={0.45} giro={0.2 + Math.sin(b * 10) * 0.1} /> : null}
                {i === 1 ? (
                  <>
                    <Pechuga p={[-0.05, -0.12, 0]} escala={0.5} />
                    <Leucina p={[0.12, 0.17, 0.1]} r={0.09} giro={b * 4} />
                  </>
                ) : null}
                {i === 2 ? <Bateria p={[0, 0, 0]} nivel={0.95} escala={0.55} /> : null}
              </group>
              {marcas[i] > 0 ? <Check p={[1.12, 0, 0.12]} escala={0.9 * marcas[i]} /> : null}
            </group>
          );
        })}
        <Interruptor p={SW9} on={on} escala={0.65} />
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Destello b={b} en={[0.88]} />
      <Rotulos
        cam={cam}
        b={b}
        items={FILAS.map((f) => ({ p: [-0.66, f.y, 0.1] as V3, t: f.t, a: f.a, z: 1.1, color: K.tinta, tam: 30, ancla: "izq" as const }))}
      />
      <Etiquetas cam={cam} b={b} items={[{ p: [SW9[0] - 0.45, SW9[1] + 0.1, SW9[2] + 0.4], t: "mTOR", a: 0.04, z: 1.1, o: [-80, 60], color: MTOR_C }]} />
      <Dato b={b} a={0.02} z={1} t="ENCIENDE mTOR" color={MTOR_C} y={250} tam={104} />
    </AbsoluteFill>
  );
};

const Final: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Ya sabías qué era <span style={{ color: K.lima }}>mTOR</span>?</>}
    escribe="La verdad…"
    ideas={["NO TENÍA IDEA", "ME SONABA", "YA LO SABÍA"]}
  />
);

const T = [
  "En el video de hipertrofia te mencioné una palabra: **mTOR**. Hoy te explico qué es este interruptor y cómo encenderlo para ganar músculo.",
  "mTOR es una proteína dentro de tus células que funciona como un **sensor**: revisa si hay energía, nutrientes y estímulo suficientes para construir.",
  "Cuando se enciende, activa a los **ribosomas** para fabricar proteína nueva. En el músculo, eso significa más **actina y miosina**.",
  "Su primer interruptor es la **tensión mecánica**: cuando la fibra hace fuerza contra una carga pesada, la señal llega hasta mTOR.",
  "El segundo es la **leucina**, un aminoácido de la proteína. Con más de **dos gramos** de leucina en una comida, mTOR se enciende con fuerza.",
  "Eso lo consigues con unos **veinticinco a treinta gramos** de proteína de buena calidad: pollo, huevo, lácteos o soya.",
  "La **insulina** y la energía disponible también lo apoyan: mTOR solo construye cuando hay material y combustible.",
  "Su freno se llama **AMPK**: se enciende cuando falta energía, como en un ayuno muy largo o en un déficit muy agresivo.",
  "¿Y el cardio apaga tus ganancias? El tamaño del músculo casi no se afecta. En las fibras el efecto es **pequeño**, y parece mayor si corres que si pedaleas.",
  "Para encender mTOR: entrena pesado y cerca del fallo, reparte tu proteína en comidas con suficiente leucina, y evita los déficits extremos.",
  "¿Ya sabías qué era mTOR? **Escríbelo en los comentarios**.",
];

const ESCENAS = [Gancho, SensorM, Construye, Tension, LeucinaM, Comida, Insulina, Ampk, Cardio, Checklist, Final];

export const MTOR: ShortDef = {
  id: "Short-Mtor",
  titulo: "mTOR: el interruptor que hace crecer tu músculo",
  planos: ESCENAS.map((Escena, i) => ({ id: `mtor-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
