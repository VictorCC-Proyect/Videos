// Short: ¿Qué le pasa a tu músculo mientras duermes? Fases del sueño, GH, atonía REM, síntesis de proteína nocturna.
// Fuentes: Lamon et al. 2021 (Physiol Rep), Trommelen et al. 2023 (Sports Med), Snijders et al. 2019 (Front Nutr), Nedeltcheva et al. 2010 (Ann Intern Med).
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3 } from "../fisio/motor";
import { Polvo, rnd } from "../fisio/modelos/comun";
import { Esfera, Mol, Vaso } from "../fisio/modelos/energia";
import { CilindroX } from "../fisio/modelos/musculo";
import { Cerebro } from "../fisio/capitulos/cap6";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaComentarios } from "./cierre";
import { Chip, Dato, Destello, K, pop, ShortDef, Titular } from "./marco";
import { Atleta, Piso, VasoAgua } from "./modelos";
import { Cama, Filamento, H_ACTINA, H_MIOSINA, H_RIBO, Manta, Ribosoma } from "./modelos-hipertrofia";
import { CORT, Luna } from "./modelos-cortisol";
import { Taza } from "./modelos-cafeina";
import { F2Medula, F2Pulso, F2Tacha, F2Unidad, f2Polilinea } from "./modelos-fibras";
import { Luna as LunaC, Sol } from "./modelos-calambres";
import { camViaje, cortesViaje, Viaje } from "./viaje";
import {
  Balanza,
  Barra3D,
  Bloque,
  Calendario,
  Celular,
  Cuarto,
  FASE_COL,
  FASE_NOMBRE,
  FASE_Y,
  GH_C,
  Halo,
  Hipnograma,
  Hipofisis,
  MiniHipno,
  MolGH,
  Onda,
  puntoHipno,
  RelojNoche,
  Rotulos,
  Termometro,
  Ventana,
} from "./modelos-sueno";

const NOCHE_F = "#0b1a33";
const VERDE = "#3ee07a";
const TESTO = "#4f8dff";

// ---- Dormitorio comun ----------------------------------------------------------------------

/** Posicion del atleta acostado boca arriba en la Cama (cabeza hacia +X, en la almohada). */
const ACOSTADO: V3 = [-0.85, 0.66, 0];
const CABEZA: V3 = [0.83, 0.68, 0];
const BRAZO: V3 = [0.35, 0.68, 0.26];

const Dormido: React.FC<{ b: number; brilla?: number; colorBrillo?: string; musculo?: number; manta?: boolean }> = ({
  b,
  brilla = 0,
  colorBrillo = K.cian,
  musculo = 0.8,
  manta = true,
}) => {
  const respira = Math.sin(b * 16) * 0.015;
  return (
    <>
      <Cama />
      <group position={ACOSTADO} rotation={[0, -Math.PI / 2, 0]}>
        <group rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, 1 + respira]}>
          <Atleta ej="parado" brilla={brilla} colorBrillo={colorBrillo} musculo={musculo} />
        </group>
      </group>
      {manta ? (
        <group position={[0, -0.02, 0]}>
          <Manta />
        </group>
      ) : null}
    </>
  );
};

const Dormitorio: React.FC = () => (
  <>
    <Cuarto />
    <group position={[-0.2, 2.1, -1.15]}>
      <Ventana />
      <Luna p={[0.35, 0.35, -0.05]} r={0.2} />
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[(rnd(`vs${i}`) - 0.5) * 1.3, (rnd(`vy${i}`) - 0.5) * 1.5, -0.06]}>
          <sphereGeometry args={[0.018, 6, 4]} />
          <meshBasicMaterial color="#fff6d0" />
        </mesh>
      ))}
    </group>
    <pointLight position={[0, 2.2, 0.5]} color="#8fb0ff" intensity={4} distance={6} />
  </>
);

/** Zzz que suben desde la cabeza. */
const Zzz: React.FC<{ b: number; op?: number }> = ({ b, op = 1 }) => (
  <>
    {Array.from({ length: 3 }).map((_, i) => {
      const f = (b * 2 + i / 3) % 1;
      return <Mol key={i} p={[CABEZA[0] + f * 0.3, CABEZA[1] + 0.3 + f * 0.9, 0.1]} color="#9fb8ff" r={0.04 + f * 0.04} op={(1 - f) * op} />;
    })}
  </>
);

// 0 · Gancho: dormitorio de noche, el musculo brilla --------------------------------------------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const brillo = entre(b, 0.45, 0.75);
  const cam = camara(
    [
      { b: 0, p: [1.6, 2.4, 8.2], l: [0, 0.3, 0], fov: 38 },
      { b: 0.55, p: [1.0, 2.1, 6.0], l: [0.05, 0.38, 0], fov: 38 },
      { b: 1, p: [0.7, 1.7, 3.8], l: [0.15, 0.45, 0], fov: 38 },
    ],
    b,
  );
  const pulso = 0.5 + 0.5 * Math.sin(b * 14);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={NOCHE_F} luz={0.7}>
        <Dormitorio />
        <Dormido b={b} brilla={brillo * (0.35 + 0.35 * pulso)} colorBrillo={K.cian} />
        <Zzz b={b} />
      </Escena3D>
      <Dato b={b} a={0.02} z={0.5} t="CRECE EN EL DESCANSO" sub="(video de hipertrofia)" color={K.lima} y={260} tam={80} />
      <Titular b={b} a={0.52} z={1.1} y={270} tam={120} t="Mientras duermes" color={K.cian} />
      <Chip b={b} a={0.6} z={1.1} t="¿QUÉ LE PASA A TU MÚSCULO?" x={540} y={1100} color={K.cian} />
    </AbsoluteFill>
  );
};

// 1 · Hipnograma: ciclos de ~90 min ---------------------------------------------------------------
const HA = 3.3;
const HH = 2.4;
const HP: V3 = [0.25, -0.4, 0];
const Ciclos: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const m = lineal(b, 0.04, 0.96) * 480;
  const fase = b > 0.82 ? "R" : b > 0.66 ? "P" : b > 0.52 ? "L" : null;
  const cam = camara(
    [
      { b: 0, p: [0.9, 0.2, 13.2], l: [-0.25, -0.3, 0], fov: 40 },
      { b: 1, p: [-1.4, 0.1, 12.8], l: [-0.25, -0.3, 0], fov: 40 },
    ],
    b,
  );
  const cur = mix3(puntoHipno(m, HA, HH), [0, 0, 0], 0);
  const curW: V3 = [HP[0] + cur[0], HP[1] + cur[1], HP[2] + cur[2]];
  const ciclos = entre(b, 0.15, 0.45);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={NOCHE_F} luz={0.8}>
        <group position={HP}>
          <Hipnograma hasta={m} ancho={HA} alto={HH} fase={fase} ciclos={ciclos} />
          <mesh position={[cur[0], HH / 2, -0.1]}>
            <boxGeometry args={[0.02, HH + 0.4, 0.02]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
          </mesh>
        </group>
        <Esfera p={curW} r={0.11} color="#ffffff" brillo={1} />
        <group position={[-1.9, 2.75, -0.5]} scale={0.55}>
          <LunaC />
        </group>
        <Polvo b={b} radio={6} color="#9fb8ff" />
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          ...(Object.keys(FASE_Y) as (keyof typeof FASE_Y)[]).map((f) => ({
            p: [HP[0] - HA / 2 - 0.12, HP[1] + (FASE_Y[f] / 3) * HH, 0] as V3,
            t: FASE_NOMBRE[f],
            a: 0.02,
            z: 1.1,
            color: FASE_COL[f],
            ancla: "der" as const,
            tam: fase === f ? 38 : 28,
          })),
          ...[0, 2, 4, 6, 8].map((h) => ({ p: [HP[0] - HA / 2 + (h / 8) * HA, HP[1] - 0.35, 0] as V3, t: `${h} h`, a: 0.02, z: 1.1, color: K.suave, tam: 28 })),
          ...[0, 1, 2, 3, 4].map((i) => ({
            p: [HP[0] - HA / 2 + ((i * 95 + 47) / 480) * HA, HP[1] + HH + 0.32, 0] as V3,
            t: "~90′",
            a: 0.18 + i * 0.05,
            z: 1.1,
            color: K.tinta,
            tam: 26,
          })),
        ]}
      />
      <Dato b={b} a={0.12} z={1.1} t="Ciclos de ~90 min" color={K.cian} y={250} tam={96} />
      <Chip b={b} a={0.52} z={1.1} t="LIGERO" x={210} y={1145} color={FASE_COL.L} />
      <Chip b={b} a={0.66} z={1.1} t="PROFUNDO" x={520} y={1145} color={FASE_COL.P} />
      <Chip b={b} a={0.82} z={1.1} t="REM" x={830} y={1145} color={FASE_COL.R} />
    </AbsoluteFill>
  );
};

// 2 · Sueno profundo -> hipofisis -> GH -----------------------------------------------------------
const HIPO: V3 = [0, -0.86, 0.36];
const RUTA_GH: V3[] = [HIPO, [0.15, -1.25, 0.72], [0.15, -4.25, 0.72], [0, -4.75, 0.6]];
const Hormona: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const libera = entre(b, 0.45, 0.6);
  const cam = camara(
    [
      { b: 0, p: [7.6, 0.0, 4.0], l: [0, -0.45, 0.2], fov: 38 },
      { b: 0.5, p: [5.8, -0.5, 3.4], l: [0, -0.9, 0.3], fov: 38 },
      { b: 0.82, p: [6.8, -3.7, 4.2], l: [0, -4.5, 0.4], fov: 40 },
      { b: 1, p: [6.4, -3.9, 3.8], l: [0, -4.6, 0.4], fov: 40 },
    ],
    b,
  );
  const llega = entre(b, 0.75, 0.95);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo="#141a3a" luz={0.85}>
        <Cerebro op={1} />
        <group position={HIPO}>
          <Hipofisis brillo={libera + 0.3 * Math.sin(b * 30) ** 2 * libera} escala={1.1} />
        </group>
        <Vaso desde={[0, -1.25, 0.5]} hasta={[0, -4.4, 0.5]} t={b * 1.2} radio={0.16} />
        <group position={[0, -4.95, 0.5]} rotation={[0, Math.PI / 2, 0]}>
          <CilindroX radio={0.5} largo={3} x={1.5} color="#c03a46" estriado={6} emisivo={0.6 * llega} />
        </group>
        {Array.from({ length: 16 }).map((_, i) => {
          const a = 0.46 + i * 0.022;
          const f = entre(b, a, a + 0.34);
          if (f <= 0) return null;
          const p = f2Polilinea(RUTA_GH, Math.min(1, f));
          const fin: V3 = [(rnd(`gx${i}`) - 0.5) * 0.5, -4.85 + (rnd(`gy${i}`) - 0.5) * 0.3, 0.5 + (rnd(`gz${i}`) - 0.5) * 2.4];
          const q = f >= 1 ? fin : f > 0.88 ? mix3(p as V3, fin, (f - 0.88) / 0.12) : (p as V3);
          return <MolGH key={i} p={[q[0] + Math.sin(i * 3 + b * 9) * 0.06, q[1], q[2]]} escala={1.5} giro={b * 6 + i} />;
        })}
        <Polvo b={b} radio={5} color="#9fb8ff" />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: HIPO, t: "Hipófisis", a: 0.32, z: 0.66, o: [70, 110], color: GH_C },
          { p: [0, 0.6, 0.3], t: "Cerebro", a: 0.08, z: 0.4, o: [70, -90], color: "#ff9fb0" },
          { p: [0, -2.6, 0.5], t: "Sangre", a: 0.66, z: 1.1, o: [-60, -80], color: K.rojo },
          { p: [0, -4.9, 1.6], t: "Músculo", a: 0.8, z: 1.1, o: [-60, 90], color: K.lima },
        ]}
      />
      <MiniHipno x={170} y={980} w={740} h={190} resalta={2} op={entre(b, 0.02, 0.08) * (1 - entre(b, 0.5, 0.56))} />
      <Dato b={b} a={0.02} z={0.5} t="Sueño profundo" sub="sobre todo al inicio de la noche" color={FASE_COL.P} y={250} tam={96} />
      <Dato b={b} a={0.6} z={1.1} t="Hormona del crecimiento" sub="el pulso más grande del día" color={GH_C} y={250} tam={76} />
    </AbsoluteFill>
  );
};

// 3 · REM: cerebro activo, cuerpo quieto (atonia) -----------------------------------------------
const CORTE_REM = 0.46;
const MED: V3 = [0, 0.5, 0];
const SOMA: V3 = [0.75, 0.55, 0.15];
const REM: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuera = b < CORTE_REM;
  const gris = entre(b, 0.24, 0.42);
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [1.3, 2.1, 4.6], l: [0.3, 0.42, 0], fov: 38 },
          { b: CORTE_REM, p: [0.9, 1.9, 3.8], l: [0.35, 0.45, 0], fov: 38 },
        ],
        b,
      )
    : camara(
        [
          { b: CORTE_REM, p: [1.6, 3.1, 8.6], l: [0.3, 2.3, 0], fov: 40 },
          { b: 0.66, p: [1.8, 1.4, 8.2], l: [0.4, 0.5, 0], fov: 40 },
          { b: 1, p: [2.4, 0.2, 8.2], l: [0.5, -0.5, 0], fov: 40 },
        ],
        b,
      );
  const ondas = [0, 1, 2].map((i) => (b * 2.2 + i / 3) % 1);
  const freno = entre(b, 0.52, 0.62);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={fuera ? NOCHE_F : "#1d1a2e"} luz={fuera ? 0.7 : 0.9}>
        {fuera ? (
          <>
            <Dormitorio />
            <Dormido b={b * 0.2} musculo={mix(0.8, 0.35, gris)} brilla={0.5 * gris} colorBrillo="#7d8ca3" />
            <group position={CABEZA} rotation={[0, 0, -Math.PI / 2]}>
              <Halo r={0.22} color={FASE_COL.R} op={0.18 + 0.12 * Math.sin(b * 40) ** 2} />
              {ondas.map((f, i) => (
                <Onda key={i} f={f} r={0.45} />
              ))}
            </group>
          </>
        ) : (
          <>
            <group position={[0, 3.3, 0]} scale={0.75}>
              <Cerebro motor={0.5 + 0.5 * Math.sin(b * 30) ** 2} />
              {ondas.map((f, i) => (
                <Onda key={i} f={f} r={1.5} />
              ))}
            </group>
            <group position={MED} rotation={[0, 0, Math.PI / 2]}>
              <F2Medula p={[0, 0, 0]} largo={4.2} r={0.4} brillo={0.4} />
            </group>
            <F2Unidad p={SOMA} color="#8c939e" tam={0.16} n={4} sep={0.42} ax={1.2} act={0} />
            {/* ordenes motoras del sueno que bajan por la medula y se apagan en la neurona */}
            {Array.from({ length: 6 }).map((_, i) => {
              const f = (b * 1.6 + i / 6) % 1;
              const p = f2Polilinea([[0, 2.6, 0.1], [0, 1.0, 0.1], [SOMA[0] - 0.15, SOMA[1] + 0.05, SOMA[2]]], f);
              return f < 0.97 ? <F2Pulso key={i} p={p} r={0.07 * (f > 0.8 && b > 0.55 ? (1 - f) * 5 : 1)} /> : null;
            })}
            {/* freno: inhibicion (glicina/GABA) sobre la motoneurona */}
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i / 12) * Math.PI * 2;
              const lejos: V3 = [SOMA[0] + Math.cos(a) * 1.2, SOMA[1] + Math.sin(a) * 1.2, SOMA[2] + 0.3];
              const cerca: V3 = [SOMA[0] + Math.cos(a) * 0.24, SOMA[1] + Math.sin(a) * 0.24, SOMA[2] + 0.1];
              return freno > 0 ? <Mol key={i} p={mix3(lejos, cerca, freno)} color={K.rojo} r={0.05} op={freno} /> : null;
            })}
            <group position={SOMA}>
              <Halo r={0.34} color={K.rojo} op={0.25 * freno} />
            </group>
            <Polvo b={b} radio={5} />
          </>
        )}
      </Escena3D>
      {fuera ? null : (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [0, 3.9, 0], t: "Cerebro: sueña", a: CORTE_REM + 0.02, z: 1.1, o: [-60, -60], color: FASE_COL.R },
            { p: [0, 0.2, 0.4], t: "Médula", a: CORTE_REM + 0.06, z: 1.1, o: [-70, 40], color: "#e9d6c4" },
            { p: SOMA, t: "Motoneurona: frenada", a: 0.56, z: 1.1, o: [30, -150], color: K.rojo },
            { p: [SOMA[0], -1.6, 0.2], t: "Músculo: quieto", a: 0.66, z: 1.1, o: [70, 40], color: "#a7b0bd" },
          ]}
        />
      )}
      <Destello b={b} en={[CORTE_REM]} />
      <Dato b={b} a={0.02} z={CORTE_REM} t="Sueño REM" sub="tu cerebro sueña" color={FASE_COL.R} y={250} tam={110} />
      <Dato b={b} a={CORTE_REM + 0.01} z={1.1} t="Cerebro activo · cuerpo quieto" color={FASE_COL.R} y={250} tam={64} />
      <Chip b={b} a={0.3} z={1.1} t="ATONÍA" x={300} y={1100} color="#c3ccd8" />
      <Chip b={b} a={0.74} z={1.1} t="NO ACTÚAS EL SUEÑO" x={720} y={1100} color={K.lima} />
    </AbsoluteFill>
  );
};

// 4 · Zoom a la fibra: la sintesis de proteina sigue de noche -------------------------------------
const RIBOS: V3[] = [
  [-1.3, 0.9, 2.6],
  [1.3, -0.5, 2.6],
  [-0.3, -1.9, 2.8],
];
const Obra: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const t = lineal(b, 0, 0.48);
  const T1 = 0.28;
  const cam =
    t < T1
      ? camara(
          [
            { b: 0, p: [1.0, 2.0, 4.6], l: [0.2, 0.42, 0], fov: 38 },
            { b: 0.55, p: [0.8, 1.5, 2.6], l: [0.3, 0.6, 0.1], fov: 38 },
            { b: 0.8, p: [0.55, 1.1, 1.3], l: BRAZO, fov: 38 },
            { b: 1, p: [0.4, 0.82, 0.55], l: BRAZO, fov: 38 },
          ],
          t / T1,
        )
      : camViaje(t, [0, 0.3, 11]);
  const obra = entre(b, 0.5, 0.65);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={NOCHE_F} luz={0.75} niebla={t > 0.72 ? [9, 30] : undefined}>
        {t < T1 ? (
          <>
            <Dormitorio />
            <Dormido b={b} brilla={0.25 + 0.5 * entre(t, 0.1, 0.25)} colorBrillo={K.lima} />
          </>
        ) : (
          <Viaje t={t} b={b} ej="parado" interior={{ pcr: 0, brillo: 0.15 + 0.3 * obra }} />
        )}
        {t >= 1 ? (
          <>
            {RIBOS.map((p, i) => (
              <Ribosoma key={i} p={p} color={i === 1 ? H_MIOSINA : H_ACTINA} n={lineal(b, 0.5, 0.95) * 10} avance={b * 8} escala={1.3} giro={0.3 - i * 0.3} />
            ))}
            {Array.from({ length: 10 }).map((_, i) => {
              const a = 0.58 + (i % 5) * 0.07;
              const f = entre(b, a, a + 0.22);
              if (f <= 0 || f >= 1) return null;
              const ini = RIBOS[i % 3];
              const fin: V3 = [(i % 2 ? 1 : -1) * (1.2 + rnd(`ox${i}`) * 0.8), -2.5 + rnd(`oy${i}`) * 4.5, 0.2];
              return <Filamento key={i} p={mix3([ini[0], ini[1] + 0.6, ini[2]], fin, f)} tipo={i % 2 ? "miosina" : "actina"} escala={1.4} giro={f * 3 + i} />;
            })}
            {Array.from({ length: 14 }).map((_, i) => {
              const f = (b * 0.7 + i / 14) % 1;
              const r = RIBOS[i % 3];
              return <Esfera key={`aa${i}`} p={mix3([(i % 2 ? 4 : -4), r[1] + (rnd(`ay${i}`) - 0.5) * 2, 2.4], [r[0], r[1] + 0.1, r[2]], f)} r={0.07} color={[K.lima, K.cian, K.naranja, K.rosa][i % 4]} brillo={0.4} op={b > 0.5 ? 1 - f * 0.5 : 0} />;
            })}
          </>
        ) : null}
      </Escena3D>
      <Destello b={b} en={cortesViaje(0, 0.48)} />
      {t >= 1 ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: RIBOS[0], t: "Ribosoma", a: 0.52, z: 1.1, o: [40, -140], color: H_RIBO },
            { p: [2.0, 0.6, 0.4], t: "Actina + miosina", a: 0.66, z: 1.1, o: [-40, -150], color: H_ACTINA },
          ]}
        />
      ) : null}
      <Dato b={b} a={0.5} z={1.1} t="Obra nocturna" sub="sigue la reparación del entreno" color={K.lima} y={250} tam={100} />
      <Chip b={b} a={0.62} z={1.1} t="SÍNTESIS DE PROTEÍNA" x={540} y={1100} color={K.lima} />
    </AbsoluteFill>
  );
};

/** Hora en texto (22.5 -> "22:30"). */
const hhmm = (h: number) => {
  const hh = Math.floor(((h % 24) + 24) % 24);
  const mm = Math.floor((h % 1) * 60);
  return `${hh}:${mm < 10 ? "0" : ""}${mm}`;
};

// 5 · Ayuno nocturno: balance negativo ------------------------------------------------------------
const RELOJ5: V3 = [-1.45, 2.05, 0];
const Ayuno: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const hora = 23 + 8 * lineal(b, 0.05, 0.5);
  const sinAA = entre(b, 0.42, 0.62);
  const neg = entre(b, 0.6, 0.85);
  const cam = camara(
    [
      { b: 0, p: [-0.6, 1.9, 7.4], l: [-0.6, 1.2, 0], fov: 40 },
      { b: 0.45, p: [-0.3, 1.3, 11.2], l: [0, 0.2, 0], fov: 40 },
      { b: 1, p: [0.4, 1.2, 10.8], l: [0, 0.2, 0], fov: 40 },
    ],
    b,
  );
  const PB: V3 = [0, -0.75, 0];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={NOCHE_F} luz={0.85}>
        <group position={RELOJ5} scale={0.6}>
          <RelojNoche hora={hora} />
        </group>
        <group position={[1.5, 2.2, -0.5]} scale={0.5}>
          <LunaC />
        </group>
        <group position={PB} scale={0.85}>
          <Balanza inclina={mix(-0.15, 1, neg)} sintesis={mix(7, 4, neg)} degrada={mix(6, 11, neg)} />
        </group>
        {/* aminoacidos que llegan... y dejan de llegar */}
        {Array.from({ length: 10 }).map((_, i) => {
          const f = (b * 1.5 + i / 10) % 1;
          const tAparece = (b * 1.5 + i / 10 - f) / 1.5;
          if (tAparece > 0.42 - sinAA * 0.2 || b > 0.62) return null;
          const p = mix3([-3.4, 1.2 + Math.sin(i) * 0.4, 0.3], [-1.1, PB[1] + 1.4, 0], f);
          return <Esfera key={i} p={p} r={0.08} color={[K.lima, K.cian, K.naranja, K.rosa][i % 4]} brillo={0.4} op={1 - sinAA} />;
        })}
        <Polvo b={b} radio={5} color="#9fb8ff" />
      </Escena3D>
      <Rotulos cam={cam} b={b} items={[{ p: [RELOJ5[0] + 0.5, RELOJ5[1], 0], t: hhmm(hora), a: 0.02, z: 1.1, color: "#8fb6ff", tam: 54, anton: true, ancla: "izq" }]} />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-1.1, PB[1] + 1.1, 0.3], t: "Síntesis", a: 0.4, z: 1.1, o: [20, 170], color: VERDE },
          { p: [1.1, PB[1] + 1.1, 0.3], t: "Degradación", a: 0.45, z: 1.1, o: [-30, 170], color: K.rojo },
        ]}
      />
      <Dato b={b} a={0.03} z={0.62} t="Ayuno nocturno" sub="7–8 h sin comer" color={K.cian} y={250} tam={100} />
      <Chip b={b} a={0.42} z={0.66} t="SIN AMINOÁCIDOS" x={540} y={1100} color={K.naranja} />
      <Dato b={b} a={0.66} z={1.1} t="Balance NEGATIVO" sub="se degrada más de lo que se construye" color={K.rojo} y={250} tam={96} />
    </AbsoluteFill>
  );
};

// 6 · ~40 g de proteina antes de dormir --------------------------------------------------------------
const VASO6: V3 = [-1.45, -0.9, 0.3];
const BAL6: V3 = [0.95, -1.0, 0];
const Proteina40: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const polvo = lineal(b, 0.05, 0.32);
  const aa = entre(b, 0.36, 0.72);
  const sube = entre(b, 0.42, 0.75);
  const cam = camara(
    [
      { b: 0, p: [-1.1, 0.9, 6.4], l: [-1.1, 0.1, 0], fov: 40 },
      { b: 0.38, p: [-0.2, 1.2, 12.2], l: [0.15, -0.05, 0], fov: 40 },
      { b: 1, p: [0.4, 1.2, 12.0], l: [0.15, -0.05, 0], fov: 40 },
    ],
    b,
  );
  const s = 0.8;
  const platoVerde: V3 = [BAL6[0] - 1.3 * s, BAL6[1] + 1.6 * s, BAL6[2]];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={NOCHE_F} luz={0.9}>
        <group position={VASO6} scale={0.8}>
          <VasoAgua b={b} polvo={polvo} />
        </group>
        <group position={[-1.45, 1.75, -0.3]} scale={0.55}>
          <RelojNoche hora={22.5} />
        </group>
        <group position={BAL6} scale={s}>
          <Balanza inclina={mix(1, -0.8, sube)} sintesis={mix(4, 12, sube)} degrada={mix(11, 6, sube)} />
        </group>
        {Array.from({ length: 22 }).map((_, i) => {
          const a = i * 0.012;
          const f = entre(aa, a, a + 0.6);
          if (f <= 0 || f >= 1) return null;
          const ini: V3 = [VASO6[0] + (rnd(`px${i}`) - 0.5) * 0.4, VASO6[1] + 1.3, VASO6[2]];
          const p = mix3(ini, platoVerde, f);
          return <Esfera key={i} p={[p[0], p[1] + Math.sin(f * Math.PI) * 1.1, p[2]]} r={0.075} color={[K.lima, K.cian, K.naranja, K.rosa, K.morado][i % 5]} brillo={0.45} />;
        })}
        <Polvo b={b} radio={5} color="#9fb8ff" />
      </Escena3D>
      <Rotulos cam={cam} b={b} items={[{ p: [-1.45 + 0.42, 1.75, -0.3], ancla: "izq", t: "22:30", a: 0.02, z: 1.1, color: "#8fb6ff", tam: 44, anton: true }]} />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [VASO6[0], VASO6[1] + 0.6, VASO6[2] + 0.4], t: "Proteína", a: 0.08, z: 1.1, o: [40, 170], color: K.lima },
          { p: platoVerde, t: "Síntesis nocturna ↑", a: 0.6, z: 1.1, o: [10, -170], color: VERDE },
        ]}
      />
      <Dato b={b} a={0.04} z={1.1} t="≈ 40 g de proteína" sub="antes de dormir" color={K.lima} y={250} tam={100} />
      <Chip b={b} a={0.76} z={1.1} t="CASEÍNA = SUERO" x={540} y={1100} color={K.cian} />
    </AbsoluteFill>
  );
};

// 7 · Una noche sin dormir (Lamon 2021) --------------------------------------------------------------
const CORTE7 = 0.3;
const BARRAS: { x: number; color: string; nombre: string; v: number; a: number; txt: string }[] = [
  { x: -1.25, color: K.lima, nombre: "Síntesis", v: 0.82, a: 0.34, txt: "−18 %" },
  { x: 0, color: CORT, nombre: "Cortisol", v: 1.21, a: 0.62, txt: "+21 %" },
  { x: 1.25, color: TESTO, nombre: "Testosterona", v: 0.76, a: 0.8, txt: "−24 %" },
];
const SinDormir: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuera = b < CORTE7;
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [1.6, 2.2, 5.8], l: [0.2, 0.5, 0], fov: 38 },
          { b: CORTE7, p: [1.2, 1.8, 4.4], l: [0.4, 0.55, 0], fov: 38 },
        ],
        b,
      )
    : camara(
        [
          { b: CORTE7, p: [0.5, 1.7, 11.4], l: [0, 0.4, 0], fov: 38 },
          { b: 1, p: [-0.5, 1.6, 10.8], l: [0, 0.4, 0], fov: 38 },
        ],
        b,
      );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={NOCHE_F} luz={fuera ? 0.6 : 0.9}>
        {fuera ? (
          <>
            <Dormitorio />
            <Dormido b={b * 0.3} manta={false} />
            <group position={[CABEZA[0] - 0.12, CABEZA[1] + 0.5, 0.2]} rotation={[0.5, 0.3, 1.2]} scale={1.6}>
              <Celular brillo={0.8 + 0.2 * Math.sin(b * 50)} />
            </group>
            <group position={[1.7, 2.3, -1.1]} scale={0.45}>
              <RelojNoche hora={3 + b} />
            </group>
          </>
        ) : (
          <>
            {BARRAS.map((o) => (
              <group key={o.nombre} position={[o.x, 0, 0]}>
                <Barra3D valor={mix(1, o.v, entre(b, o.a, o.a + 0.1))} color={o.color} />
              </group>
            ))}
            <Piso color={K.cian} r={2.1} brillo={0.25} />
          </>
        )}
      </Escena3D>
      {fuera ? null : (
        <Rotulos
          cam={cam}
          b={b}
          items={BARRAS.flatMap((o) => [
            { p: [o.x, -0.3, 0.3] as V3, t: o.nombre, a: CORTE7, z: 1.1, color: o.color, tam: 32 },
            { p: [o.x, 0.08 + 1.4 * o.v + 0.32, 0] as V3, t: o.txt, a: o.a + 0.06, z: 1.1, color: o.color, tam: 56, anton: true },
          ])}
        />
      )}
      <Destello b={b} en={[CORTE7]} />
      <Dato b={b} a={0.08} z={1.1} t="1 noche sin dormir" sub="Lamon et al. 2021" color={K.amarillo} y={250} tam={100} />
    </AbsoluteFill>
  );
};

// 8 · A dieta: 5.5 h vs 8.5 h (Nedeltcheva 2010) ------------------------------------------------------
const PERS = [
  { x: -0.95, h: "8.5 h", musc: 1.5, grasa: 1.4, color: K.lima },
  { x: 0.95, h: "5.5 h", musc: 2.4, grasa: 0.6, color: K.rojo },
];
const KG = 0.32;
const Dieta: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const pierde = entre(b, 0.55, 0.92);
  const cam = camara(
    [
      { b: 0, p: [0.6, 1.5, 9.8], l: [0.1, 0.4, 0], fov: 38 },
      { b: 1, p: [-0.5, 1.4, 9.4], l: [0.1, 0.4, 0], fov: 38 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={NOCHE_F} luz={0.95}>
        {PERS.map((o, i) => (
          <group key={i} position={[o.x, 0, 0]}>
            <group scale={0.8} position={[-0.25, 0, -0.2]}>
              <Atleta ej="parado" musculo={0.8} brilla={0.15} colorBrillo={o.color} />
              <Piso color={o.color} r={0.6} />
            </group>
            <group position={[-0.25, 1.85, -0.2]} scale={0.38}>
              <LunaC />
            </group>
            <group position={[0.32, 0, 0.45]}>
              <group position={[-0.17, 0, 0]}>
                <Bloque alto={o.musc * KG * pierde} color="#e0505a" ancho={0.3} />
              </group>
              <group position={[0.17, 0, 0]}>
                <Bloque alto={o.grasa * KG * pierde} color={K.amarillo} ancho={0.3} />
              </group>
            </group>
          </group>
        ))}
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={PERS.flatMap((o) => [
          { p: [o.x - 0.25 + 0.3, 1.85, -0.2] as V3, t: o.h, a: 0.18, z: 1.1, color: o.color, tam: 54, anton: true, ancla: "izq" as const },
          { p: [o.x + 0.15, o.musc * KG + 0.15, 0.45] as V3, t: `−${o.musc} kg`, a: 0.62, z: 1.1, color: "#ff8a94", tam: 28 },
          { p: [o.x + 0.49, o.grasa * KG + 0.15, 0.45] as V3, t: `−${o.grasa}`, a: 0.8, z: 1.1, color: K.amarillo, tam: 28 },
        ])}
      />
      <Dato b={b} a={0.2} z={1.1} t="5.5 h vs 8.5 h" sub="misma dieta · Nedeltcheva 2010" color={K.cian} y={250} tam={100} />
      <Chip b={b} a={0.6} z={1.1} t="+ MÚSCULO PERDIDO" x={285} y={1150} color="#ff8a94" />
      <Chip b={b} a={0.8} z={1.1} t="− GRASA PERDIDA" x={790} y={1150} color={K.amarillo} />
    </AbsoluteFill>
  );
};

// 9 · Checklist para aprovechar la noche ------------------------------------------------------------
const Habitos: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara([{ b: 0, p: [0, 0, 8], l: [0, 0, 0], fov: 40 }], b);
  const items: { a: number; p: V3; t: string; color: string; x: number; y: number }[] = [
    { a: 0.1, p: [-0.75, 1.2, 0], t: "7–9 HORAS", color: K.lima, x: 290, y: 770 },
    { a: 0.36, p: [0.75, 1.2, 0], t: "HORARIO REGULAR", color: K.morado, x: 790, y: 770 },
    { a: 0.5, p: [-0.75, 0.0, 0], t: "OSCURO Y FRESCO", color: K.cian, x: 285, y: 1140 },
    { a: 0.72, p: [0.75, 0.0, 0], t: "NO CAFÉ DE TARDE", color: K.naranja, x: 800, y: 1140 },
  ];
  const s = (a: number) => Math.max(0, pop(b, a, 0.1)) * (b >= a ? 1 : 0);
  const giro = Math.sin(b * 5) * 0.3;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={NOCHE_F}>
        <group position={items[0].p} scale={0.75 * s(items[0].a)} rotation={[0, giro, 0]}>
          <RelojNoche hora={23 + 8 * entre(b, 0.1, 0.35)} />
        </group>
        <group position={items[1].p} scale={0.6 * s(items[1].a)} rotation={[0, giro - 0.3, 0]}>
          <Calendario marca={entre(b, 0.38, 0.5)} />
        </group>
        <group position={items[2].p} scale={0.95 * s(items[2].a)} rotation={[0, giro * 0.5, 0]}>
          <group position={[-0.2, 0.05, 0]} scale={0.38}>
            <Ventana />
            <Luna p={[0.3, 0.35, -0.05]} r={0.18} />
          </group>
          <group position={[0.35, 0.05, 0.2]} scale={0.45}>
            <Termometro nivel={mix(0.8, 0.35, entre(b, 0.55, 0.7))} />
          </group>
        </group>
        <group position={items[3].p} scale={0.95 * s(items[3].a)} rotation={[0.15, giro, 0]}>
          <Taza p={[0, -0.25, 0]} escala={0.6} b={b} vapor={0.6} />
          <group position={[0.38, 0.38, -0.2]} scale={0.25}>
            <Sol giro={b * 2} />
          </group>
          <F2Tacha p={[0, 0, 0.35]} tam={0.45 * entre(b, 0.8, 0.86)} />
        </group>
        <Polvo b={b} radio={5} color="#9fb8ff" />
      </Escena3D>
      <Titular b={b} a={0.02} z={1.1} y={270} tam={104} t="Aprovecha la noche" color={K.cian} />
      {items.map((it) => (
        <Chip key={it.t} b={b} a={it.a + 0.02} z={1.1} t={it.t} x={it.x} y={it.y} color={it.color} />
      ))}
    </AbsoluteFill>
  );
};

const Final: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Cuántas <span style={{ color: K.lima }}>horas</span> duermes?</>}
    escribe="Duermo…"
    ideas={["MENOS DE 6", "6 A 7", "8 O MÁS"]}
  />
);

const T = [
  "En el video de hipertrofia te dije que el músculo crece en el descanso. Hoy vamos a ver qué le pasa a tu músculo **mientras duermes**.",
  "Al dormir pasas por ciclos de unos **noventa minutos**: sueño ligero, sueño **profundo** y sueño **REM**.",
  "En el sueño profundo, sobre todo al inicio de la noche, tu hipófisis libera el pulso más grande del día de **hormona del crecimiento**.",
  "En el sueño REM tu cerebro sueña, pero tus músculos quedan casi **paralizados**: es una protección para que no actúes lo que sueñas.",
  "Mientras tanto, tu fibra sigue en obra: la **síntesis de proteína** que activaste al entrenar continúa durante la noche.",
  "Pero dormir también es un **ayuno** de siete u ocho horas. Sin aminoácidos llegando, el balance de proteína tiende a ser **negativo**.",
  "Por eso, tomar unos **cuarenta gramos de proteína** antes de dormir aumenta la síntesis de proteína durante la noche. Y da igual si es caseína o suero.",
  "¿Y si duermes mal? Una sola noche sin dormir bajó la síntesis de proteína un **dieciocho por ciento**, subió el **cortisol** y bajó la **testosterona**.",
  "Y en personas a dieta, dormir **cinco horas y media** en vez de ocho y media hizo que perdieran más **músculo** y menos grasa.",
  "Para aprovechar la noche: duerme de **siete a nueve horas**, con horarios regulares, en un cuarto oscuro y fresco, y evita la cafeína por la tarde.",
  "¿Cuántas horas duermes normalmente? **Escríbelo en los comentarios**.",
];

const ESCENAS = [Gancho, Ciclos, Hormona, REM, Obra, Ayuno, Proteina40, SinDormir, Dieta, Habitos, Final];

export const SUENO: ShortDef = {
  id: "Short-Sueno",
  titulo: "¿Qué le pasa a tu músculo mientras duermes?",
  planos: ESCENAS.map((Escena, i) => ({ id: `sueno-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
