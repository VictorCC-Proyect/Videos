// Short: ¿La L-carnitina quema grasa? Lipólisis, albúmina, carnitina y la analogía del puerto.
// Fuentes: Holway, Nutrición sin dogmas, Tomo 1, 1.6.5–1.6.8 (pp. 41–42); Wall et al. 2011 (J Physiol); Talenezhad et al. 2020 (Clin Nutr ESPEN); Askarpour et al. 2019 (Pharmacol Res).
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3 } from "../fisio/motor";
import { Polvo, rnd } from "../fisio/modelos/comun";
import { Cadena, GotaLipido, Membrana, MitocondriaGrande, Vaso } from "../fisio/modelos/energia";
import { CilindroX } from "../fisio/modelos/musculo";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaComentarios } from "./cierre";
import { Chip, Dato, Destello, K, ShortDef, Titular } from "./marco";
import { Atleta, Bascula, Piso, Rinones } from "./modelos";
import { Reloj3D } from "./modelos-ayunas";
import { Adipocito } from "./modelos-ayuno";
import { Suprarrenales, SUPRA } from "./modelos-cortisol";
import { AcetilCoA, Capsula, FlechasCiclo } from "./modelos-energia";
import { Glucosa, GLU, INS, Llave } from "./modelos-glucosa";
import { Barra3D, Rotulos } from "./modelos-sueno";
import {
  ADRE_C,
  Adrenalina,
  ALB_C,
  Albumina,
  Barco,
  Calendario24,
  CARN_C,
  Carnitina,
  Contenedor,
  Estibador,
  Fogata,
  FrascoCarnitina,
  GLICEROL_C,
  GRASO,
  Grua,
  HSL_C,
  Libro,
  Lipasa,
  Mar,
  Muelle,
  OAA_C,
  Puerta,
  rebote,
  Trigliceridos,
} from "./modelos-carnitina";
import { camViaje, cortesViaje, Viaje } from "./viaje";

// 0 · Gancho: frasco de L-carnitina, capsulas, atleta en la bascula ------------------------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [2.4, 1.6, 6.8], l: [-0.1, 0.95, 0], fov: 36 },
      { b: 1, p: [-1.6, 1.4, 6.6], l: [-0.1, 0.98, 0], fov: 36 },
    ],
    b,
  );
  const tapa = entre(b, 0.1, 0.25);
  const boca: V3 = [-0.6, 0.75, 0.75];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <group position={[0.35, 0, 0]}>
          <group scale={1.7}>
            <Bascula />
          </group>
          <group position={[0, 0.11, 0]}>
            <Atleta ej="parado" brilla={0.15 + 0.2 * Math.sin(b * 6) ** 2} colorBrillo={CARN_C} />
          </group>
        </group>
        <FrascoCarnitina p={[-0.6, 0, 0.75]} escala={0.68} giro={0.4} tapa={tapa} brillo={0.3} />
        {Array.from({ length: 9 }).map((_, i) => {
          const k = entre(b, 0.2 + i * 0.03, 0.45 + i * 0.03);
          if (k <= 0) return null;
          const fin: V3 = [-1.3 + rnd(`gx${i}`) * 1.0, 0.9 + rnd(`gy${i}`) * 1.0, 0.5 + rnd(`gz${i}`) * 0.6];
          const q = mix3(boca, fin, k);
          return <Capsula key={i} p={[q[0], q[1] + Math.sin(b * 6 + i) * 0.04 * k, q[2]]} escala={1.25} rot={[b * 3 + i, i, b * 2 + i * 0.7]} color={CARN_C} />;
        })}
        <Piso r={1.4} color={CARN_C} />
      </Escena3D>
      <Titular b={b} a={0.03} z={1} y={290} tam={150} t="¿Quema grasa?" />
      <Chip b={b} a={0.38} z={1} t="DE LOS MÁS POPULARES" x={540} y={1100} color={CARN_C} />
    </AbsoluteFill>
  );
};

// 1 · Ejercicio moderado -> suprarrenales liberan adrenalina -> sangre -> tejido adiposo ----
const RIN: V3 = [-0.6, 1.45, 0];
const supra = (l: number): V3 => [RIN[0] + l * 0.47, RIN[1] + 0.56, 0.25];
const V0: V3 = [-1.3, 1.0, 0.45];
const V1: V3 = [1.25, -1.15, 0.45];
const ADIPOS: { p: V3; r: number }[] = [
  { p: [1.0, -2.05, 0], r: 0.6 },
  { p: [1.85, -1.55, -0.45], r: 0.52 },
  { p: [0.25, -2.55, -0.35], r: 0.5 },
];

const Adrenal: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuera = b < 0.3;
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [3.0, 1.3, 5.6], l: [0, 0.7, 0], fov: 36 },
          { b: 0.3, p: [1.6, 1.2, 3.4], l: [0, 1.0, 0], fov: 36 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.3, p: [0.2, -0.2, 14.0], l: [0.2, -0.85, 0], fov: 40 },
          { b: 1, p: [0.8, -0.3, 13.0], l: [0.3, -0.9, 0], fov: 40 },
        ],
        b,
      );
  const camino = (k: number, i: number): V3 => {
    const l = i % 2 ? 1 : -1;
    if (k < 0.2) return mix3(supra(l), V0, k / 0.2);
    if (k < 0.8) {
      const q = mix3(V0, V1, (k - 0.2) / 0.6);
      return [q[0] + Math.sin(i * 2.3) * 0.12, q[1] + Math.cos(i * 1.7) * 0.12, q[2]];
    }
    const a = ADIPOS[i % 3];
    const dir: V3 = [V1[0] - a.p[0], V1[1] - a.p[1], 0.6];
    const n = Math.hypot(...dir);
    const dest: V3 = [a.p[0] + (dir[0] / n) * a.r + (rnd(`ad${i}`) - 0.5) * 0.3, a.p[1] + (dir[1] / n) * a.r + (rnd(`ae${i}`) - 0.5) * 0.3, a.p[2] + (dir[2] / n) * a.r];
    return mix3(V1, dest, (k - 0.8) / 0.2);
  };
  const llega = entre(b, 0.72, 0.9);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={fuera ? undefined : [9, 26]}>
        {fuera ? (
          <>
            <Atleta ej="sprint" fase={b * 16} brilla={0.1 + 0.5 * entre(b, 0.12, 0.28)} colorBrillo={ADRE_C} />
            <Piso color={ADRE_C} />
          </>
        ) : (
          <>
            <group position={RIN} scale={0.55}>
              <Rinones brillo={0.02} />
              <Suprarrenales brillo={0.3 + 0.5 * entre(b, 0.32, 0.42)} />
            </group>
            <Vaso desde={[-1.6, 1.3, 0.4]} hasta={[1.55, -1.45, 0.4]} t={b * 1.4} radio={0.34} />
            {ADIPOS.map((a, i) => (
              <Adipocito key={i} p={a.p} r={a.r} gota={0.74} brillo={0.25 * llega} />
            ))}
            {Array.from({ length: 12 }).map((_, i) => {
              const a0 = 0.33 + i * 0.035;
              const k = lineal(b, a0, a0 + 0.4);
              if (k <= 0) return null;
              return <Adrenalina key={i} p={camino(k, i)} escala={0.75} giro={b * 5 + i} op={Math.min(1, k * 8)} />;
            })}
            <Polvo b={b} radio={6} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.3]} />
      <Chip b={b} a={0.04} z={0.29} t="EJERCICIO MODERADO" x={540} y={330} color={ADRE_C} />
      {!fuera ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [supra(-1)[0], supra(-1)[1] + 0.1, 0.2], t: "Suprarrenales", a: 0.33, z: 1.2, o: [-30, -90], color: SUPRA },
            { p: [0.05, -0.05, 0.5], t: "Sangre", a: 0.42, z: 1.2, o: [-80, 60], color: "#ff6b6b" },
            { p: [ADIPOS[0].p[0] + 0.3, ADIPOS[0].p[1] - 0.45, 0.3], t: "Tejido adiposo", a: 0.72, z: 1.2, o: [-60, 90], color: GRASO },
          ]}
        />
      ) : null}
      <Dato b={b} a={0.38} z={1.2} t="Adrenalina" sub="viaja por la sangre" color={ADRE_C} y={260} tam={100} />
    </AbsoluteFill>
  );
};

// 2 · Lipasa hormono sensible corta triglicéridos; a los 15–20 min se acelera -------------
const TRIG: V3[] = [
  [-1.25, 1.0, 0],
  [-0.15, 1.15, -0.2],
  [-1.15, 0.2, 0.1],
  [-0.05, 0.3, -0.1],
  [-1.25, -0.6, 0],
  [-0.15, -0.5, 0.1],
];
const CORTES = TRIG.map((_, i) => 0.2 + 0.64 * Math.sqrt(i / (TRIG.length - 1)));
const juntura = (i: number): V3 => [TRIG[i][0] + 0.12, TRIG[i][1] + 0.1, TRIG[i][2] + 0.28];

const Lipolisis: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.6, 0.5, 12.0], l: [-0.1, 0.3, 0], fov: 40 },
      { b: 0.2, p: [0.3, 0.4, 10.0], l: [-0.1, 0.35, 0], fov: 40 },
      { b: 1, p: [-0.2, 0.3, 9.4], l: [-0.1, 0.35, 0], fov: 40 },
    ],
    b,
  );
  // la lipasa salta de un triglicerido al siguiente
  const hechos = CORTES.filter((c) => b >= c).length;
  const sig = Math.min(hechos, TRIG.length - 1);
  const ant = Math.max(0, hechos - 1);
  const ini = hechos === 0 ? 0.1 : CORTES[hechos - 1] + 0.02;
  const fin = hechos === 0 ? CORTES[0] - 0.02 : (CORTES[hechos] ?? 1) - 0.015;
  const desde: V3 = hechos === 0 ? [-2.4, 2.2, 0.6] : juntura(ant);
  const hsl = hechos >= TRIG.length ? juntura(TRIG.length - 1) : mix3(desde, juntura(sig), entre(b, ini, Math.max(ini + 0.01, fin)));
  const minutos = 20 * lineal(b, 0.08, 0.9);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[7, 22]}>
        <Adipocito p={[0, -0.1, -2.6]} r={2.7} gota={0.8} brillo={0.08} />
        <GotaLipido p={[-0.6, 0.3, -1.4]} r={0.01} />
        {TRIG.map((p, i) => {
          const s = entre(b, CORTES[i], CORTES[i] + 0.1) + 1.6 * lineal(b, CORTES[i] + 0.1, 1);
          return <Trigliceridos key={i} p={p} escala={0.85} suelta={s} op={1} opAG={1 - 0.6 * lineal(b, CORTES[i] + 0.15, 1)} />;
        })}
        <Lipasa p={hsl} escala={0.75} boca={0.5 + 0.5 * Math.sin(b * 70)} brillo={0.35} giro={-0.5} />
        <Reloj3D p={[0.75, -1.35, 0.3]} r={0.36} hora={minutos / 60} color={K.lima} />
        <Polvo b={b} radio={5} color={GRASO} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [TRIG[0][0], TRIG[0][1] + 0.25, 0], t: "Triglicérido", a: 0.04, z: 0.22, o: [-20, -90], color: GRASO },
          { p: [hsl[0] - 0.15, hsl[1] + 0.15, hsl[2]], t: "Lipasa (HSL)", a: 0.14, z: 0.5, o: [-60, -80], color: HSL_C },
          { p: [TRIG[0][0], TRIG[0][1] - 0.18, 0], t: "Glicerol", a: 0.3, z: 0.56, o: [-30, 100], color: GLICEROL_C },
          { p: [TRIG[0][0] + 1.3, TRIG[0][1] + 0.95, 0.2], t: "Ácidos grasos", a: 0.3, z: 0.56, o: [-40, -80], color: GRASO },
          { p: [0.75, -1.0, 0.3], t: `${Math.round(minutos)} min`, a: 0.1, z: 1.2, o: [-40, 110], color: K.lima },
        ]}
      />
      <Dato b={b} a={0.12} z={0.6} t="Lipasa hormono sensible" sub="corta los triglicéridos" color={HSL_C} y={260} tam={72} />
      <Dato b={b} a={0.62} z={1.2} t="15–20 min" sub="la liberación se acelera" color={K.lima} y={260} tam={110} />
    </AbsoluteFill>
  );
};

// 3 · Acidos grasos montados en albumina por la sangre hasta el musculo ---------------------
const NALB = 5;
const posAlb = (i: number, b: number): V3 => [-4 + ((b * 0.5 + i / NALB) % 1) * 8, Math.sin(i * 1.3) * 0.32, 0.15 * Math.cos(i * 2.1)];

const Transporte: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [-0.6, 1.4, 9.0], l: [-0.6, -0.5, 0], fov: 40 },
      { b: 0.55, p: [0.3, 1.3, 8.8], l: [0.3, -0.55, 0], fov: 40 },
      { b: 1, p: [1.5, 0.9, 9.0], l: [1.4, -0.75, 0], fov: 40 },
    ],
    b,
  );
  const ref = posAlb(2, b);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[6, 20]}>
        <Vaso desde={[-5, 0, 0]} hasta={[5, 0, 0]} t={b * 1.1} radio={0.9} />
        {Array.from({ length: NALB }).map((_, i) => (
          <Albumina key={i} p={posAlb(i, b)} r={0.3} n={3 + (i % 2)} giro={b * 2 + i} seed={`al${i}`} />
        ))}
        <group position={[0, -1.85, -0.2]}>
          <CilindroX radio={0.6} largo={10} x={5} color="#c03a46" estriado={9} emisivo={0.3 * entre(b, 0.7, 0.95)} />
        </group>
        {/* acidos grasos que se sueltan y entran al musculo */}
        {Array.from({ length: 5 }).map((_, i) => {
          const a0 = 0.62 + i * 0.06;
          const k = entre(b, a0, a0 + 0.2);
          if (k <= 0 || k >= 1) return null;
          const x = 0.6 + i * 0.45;
          return <Cadena key={i} n={6} p={mix3([x, -0.45, 0.4], [x + 0.1, -1.6, 0.6], k)} color={GRASO} sep={0.1} brillo={0.7} op={k > 0.85 ? (1 - k) * 6.6 : 1} />;
        })}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-1.6, 0.75, 0.3], t: "Vaso sanguíneo", a: 0.03, z: 0.4, o: [-20, -90], color: "#ff6b6b" },
          { p: [ref[0], ref[1] + 0.25, ref[2]], t: "Albúmina", a: 0.42, z: 1.2, o: [-40, -110], color: ALB_C },
          { p: [ref[0] + 0.4, ref[1] - 0.3, ref[2]], t: "Ácidos grasos", a: 0.5, z: 0.85, o: [40, 120], color: GRASO },
          { p: [2.0, -2.4, 0.7], t: "Músculo", a: 0.7, z: 1.2, o: [-60, 80], color: K.rojo },
        ]}
      />
      <Dato b={b} a={0.4} z={1.2} t="Albúmina" sub="el taxi de la grasa en la sangre" color={ALB_C} y={260} tam={104} />
      <Chip b={b} a={0.08} z={0.4} t="LA GRASA NO SE MEZCLA CON LA SANGRE" x={540} y={330} color={GRASO} />
    </AbsoluteFill>
  );
};

// 4 · Al musculo: la grasa entra a la mitocondria solo con carnitina -------------------------
const MITO: V3 = [-0.75, -0.35, 0];
const MEMB_X = MITO[0] + 0.81;
const AG_Y = [0.85, 0.0, -0.85].map((y) => MITO[1] + y);

const Entrada: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const viaje = b < 0.3;
  const t = lineal(b, 0, 0.3);
  const cam = viaje
    ? camViaje(t)
    : camara(
        [
          { b: 0.3, p: [0.7, 0.0, 11.0], l: [0.4, -0.75, 0], fov: 40 },
          { b: 1, p: [0.2, -0.1, 10.2], l: [0.35, -0.75, 0], fov: 40 },
        ],
        b,
      );
  const llega = AG_Y.map((_, j) => entre(b, 0.36 + j * 0.05, 0.56 + j * 0.05));
  const toma = AG_Y.map((_, j) => entre(b, 0.66 + j * 0.03, 0.74 + j * 0.03));
  const mete = AG_Y.map((_, j) => entre(b, 0.78 + j * 0.03, 0.94 + j * 0.03));
  const carn = entre(b, 0.6, 0.66);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={viaje ? (t > 0.72 ? [10, 34] : undefined) : [7, 22]}>
        {viaje ? (
          <Viaje t={t} b={b} ej="sprint" fase={b * 30} />
        ) : (
          <>
            <group position={MITO} rotation={[0, 0, Math.PI / 2]} scale={0.9}>
              <MitocondriaGrande brillo={0.15 + 0.4 * entre(b, 0.85, 1)} />
            </group>
            {AG_Y.map((y, j) => {
              const x0 = 2.4;
              const golpe = MEMB_X + 0.08;
              const atras = mix(x0, golpe, 0.55);
              let x = rebote(llega[j], x0, golpe, 0.6);
              if (toma[j] > 0) x = mix(atras, MEMB_X + 0.32, toma[j]);
              x -= mete[j] * 1.35;
              return <Cadena key={j} n={8} p={[x, y + 0.04, 0.25]} color={GRASO} sep={0.11} brillo={0.6 + 0.4 * mete[j]} />;
            })}
            {carn > 0
              ? AG_Y.map((y, j) => (
                  <Carnitina key={`c${j}`} p={[MEMB_X + 0.08 - mete[j] * 1.35, y, 0.3]} escala={1.4 * carn} brillo={0.6 + 0.6 * toma[j]} giro={Math.PI} />
                ))
              : null}
            {/* destellos del choque */}
            {AG_Y.map((y, j) => {
              const k = 1 - Math.abs(llega[j] - 0.6) / 0.08;
              return k > 0 ? (
                <mesh key={`g${j}`} position={[MEMB_X + 0.05, y, 0.3]}>
                  <sphereGeometry args={[0.18 + 0.12 * k, 16, 12]} />
                  <meshBasicMaterial color={K.rojo} transparent opacity={0.5 * k} depthWrite={false} />
                </mesh>
              ) : null;
            })}
            <Polvo b={b} radio={5} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[...cortesViaje(0, 0.3).slice(0, 2), 0.3]} />
      <Chip b={b} a={0.03} z={0.29} t="LLEGAN AL MÚSCULO" x={540} y={330} color={K.rojo} />
      {!viaje ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [MITO[0] - 0.3, MITO[1] + 1.7, 0.2], t: "Mitocondria", a: 0.32, z: 1.2, o: [-20, -80], color: K.naranja },
            { p: [1.5, AG_Y[0] + 0.1, 0.25], t: "Ácidos grasos", a: 0.4, z: 0.66, o: [-40, -110], color: GRASO },
            { p: [MEMB_X + 0.08, AG_Y[2] - 0.1, 0.3], t: "Carnitina", a: 0.62, z: 1.2, o: [40, 120], color: CARN_C },
          ]}
        />
      ) : null}
      <Chip b={b} a={0.5} z={0.68} t="NO ENTRAN SOLOS" x={540} y={1100} color={K.rojo} />
      <Dato b={b} a={0.32} z={0.6} t="Mitocondria" sub="el único lugar donde se quema la grasa" color={K.naranja} y={260} tam={96} />
      <Dato b={b} a={0.62} z={1.2} t="Carnitina" sub="los mete a la mitocondria" color={CARN_C} y={260} tam={110} />
    </AbsoluteFill>
  );
};

// ---- Puerto (metafora de Holway) -----------------------------------------------------------
const PUESTOS: V3[] = (() => {
  const out: { p: V3; k: number }[] = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 8; c++) out.push({ p: [-1.3 + c * 0.36 + (r % 2) * 0.1, 0.35, -0.55 + r * 0.33], k: rnd(`pu${r}-${c}`) });
  return out.sort((x, y) => x.k - y.k).map((o) => o.p);
})();

const Puerto: React.FC<{ b: number; n: number; children?: React.ReactNode }> = ({ b, n, children }) => (
  <>
    <Mar b={b} />
    <Muelle ancho={3.6} fondo={1.6} />
    <Grua p={[1.62, 0.35, 0.3]} escala={0.9} />
    {PUESTOS.slice(0, n).map((p, i) => (
      <Estibador key={i} p={p} paso={0.3 * Math.sin(b * 5 + i)} giro={Math.PI * 0.75 + (rnd(`eg${i}`) - 0.5) * 0.9} />
    ))}
    {children}
  </>
);

const camPuerto = (b: number, a = 0, z = 1) =>
  camara(
    [
      { b: a, p: [2.6, 2.3, 4.6], l: [-0.2, -0.15, -1.2], fov: 40 },
      { b: z, p: [1.4, 2.1, 5.0], l: [-0.3, -0.15, -1.2], fov: 40 },
    ],
    b,
  );

// 5 · El mito: mas carnitina = mas grasa quemada; Holway y el puerto -------------------------
const Mito: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fase = b < 0.56 ? 0 : b < 0.82 ? 1 : 2;
  const inclina = -2.0 * entre(b, 0.1, 0.22);
  const base: V3 = [-0.75, 0.55, 0];
  const esc = 0.9;
  const boca: V3 = [base[0] + Math.sin(-inclina) * esc, base[1] + Math.cos(-inclina) * esc, 0];
  const cam =
    fase === 0
      ? camara(
          [
            { b: 0, p: [0.3, 0.6, 6.6], l: [0, -0.15, 0], fov: 40 },
            { b: 0.56, p: [-0.3, 0.4, 6.0], l: [0, -0.3, 0], fov: 40 },
          ],
          b,
        )
      : fase === 1
        ? camara(
            [
              { b: 0.56, p: [0.4, 0.5, 4.4], l: [0, -0.1, 0], fov: 40 },
              { b: 0.82, p: [-0.3, 0.4, 4.0], l: [0, -0.1, 0], fov: 40 },
            ],
            b,
          )
        : camPuerto(b, 0.82, 1);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={fase === 2 ? [6, 18] : undefined}>
        {fase === 0 ? (
          <>
            <FrascoCarnitina p={base} escala={esc} inclina={inclina} tapa={entre(b, 0.06, 0.12)} brillo={0.3} />
            {Array.from({ length: 42 }).map((_, i) => {
              const a0 = 0.2 + i * 0.007;
              const k = lineal(b, a0, a0 + 0.12);
              if (k <= 0) return null;
              const fin: V3 = [0.55 + (rnd(`mx${i}`) - 0.5) * 1.5, -1.55 + rnd(`my${i}`) * 0.45 + (1 - Math.abs(rnd(`mx${i}`) - 0.5) * 2) * 0.35, (rnd(`mz${i}`) - 0.5) * 0.8];
              const q: V3 = [mix(boca[0], fin[0], k), mix(boca[1], fin[1], k * k), mix(0, fin[2], k)];
              return <Carnitina key={i} p={q} escala={0.9} giro={i + b * 3 * (1 - k)} />;
            })}
          </>
        ) : fase === 1 ? (
          <group rotation={[0, mix(-1.2, 0.25, entre(b, 0.56, 0.68)), 0]}>
            <Libro p={[0, -0.05, 0]} escala={1.15} />
          </group>
        ) : (
          <Puerto b={b} n={6} />
        )}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Destello b={b} en={[0.56, 0.82]} />
      <Titular b={b} a={0.02} z={0.2} y={300} tam={150} t="El mito" color={K.rojo} />
      <Dato
        b={b}
        a={0.2}
        z={0.56}
        t={
          <>
            <span style={{ color: CARN_C }}>+ carnitina</span>
            <br />= ¿+ grasa quemada?
          </>
        }
        color={GRASO}
        y={250}
        tam={80}
      />
      <Chip b={b} a={0.6} z={0.82} t="FRANCIS HOLWAY" x={540} y={330} color={K.lima} />
      <Titular b={b} a={0.84} z={1.2} y={290} tam={140} t="Un puerto" color={CARN_C} />
    </AbsoluteFill>
  );
};

// 6 · Muchos estibadores (carnitina), pero no llegan barcos --------------------------------------
const Estibadores: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camPuerto(b);
  const n = Math.round(4 + 28 * entre(b, 0.25, 0.6));
  const fantasma = entre(b, 0.68, 0.8);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[6, 18]}>
        <Puerto b={b} n={n}>
          {fantasma > 0 ? <Barco p={[-0.1, 0, -1.35]} carga={6} op={0.32 * fantasma} balanceo={Math.sin(b * 6) * 0.02} /> : null}
        </Puerto>
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [PUESTOS[0][0], PUESTOS[0][1] + 0.35, PUESTOS[0][2]], t: "Estibadores", a: 0.08, z: 0.6, o: [-40, -110], color: CARN_C },
          { p: [0.2, 0.5, -1.35], t: "¿Barcos?", a: 0.7, z: 1.2, o: [-30, -120], color: GRASO },
        ]}
      />
      <Dato b={b} a={0.1} z={0.66} t="Estibadores = carnitina" sub="bajan los contenedores" color={CARN_C} y={260} tam={80} />
      <Dato b={b} a={0.68} z={1.2} t="Sin barcos" sub="no hay nada que descargar" color={GRASO} y={260} tam={110} />
      <Chip b={b} a={0.4} z={0.66} t="+ ESTIBADORES" x={540} y={1100} color={CARN_C} />
      <Chip b={b} a={0.8} z={1.2} t="NO SE DESCARGA MÁS RÁPIDO" x={540} y={1100} color={K.rojo} />
    </AbsoluteFill>
  );
};

// 7 · Los barcos los trae el ejercicio; la carnitina tomada se queda en la sangre ----------------
const CARGADORES = Array.from({ length: 6 }).map((_, c) => -1.05 + c * 0.42);
const OCIOSOS = PUESTOS.filter((p) => p[2] > 0.05).slice(0, 12);

const Barcos: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const puerto = b < 0.5;
  const llega = entre(b, 0, 0.2);
  const cam = puerto
    ? camPuerto(b, 0, 0.5)
    : camara(
        [
          { b: 0.5, p: [0, 0.3, 10.0], l: [0, -0.55, 0], fov: 40 },
          { b: 1, p: [0.6, 0.2, 9.4], l: [0.2, -0.6, 0], fov: 40 },
        ],
        b,
      );
  const carga = CARGADORES.map((_, c) => entre(b, 0.2 + c * 0.04, 0.3 + c * 0.04));
  const quedan = carga.filter((k) => k <= 0).length;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={puerto ? [6, 18] : [6, 20]}>
        {puerto ? (
          <Puerto b={b} n={0}>
            <Barco p={[mix(-6.5, -0.1, llega), 0, -1.35]} carga={quedan} balanceo={Math.sin(b * 6) * 0.03} />
            {OCIOSOS.map((p, i) => (
              <Estibador key={`o${i}`} p={p} paso={0.3 * Math.sin(b * 5 + i)} giro={Math.PI * 0.8} />
            ))}
            {CARGADORES.map((x, c) => {
              const k = carga[c];
              const z = mix(-0.62, -0.05, k);
              return (
                <React.Fragment key={c}>
                  <Estibador p={[x, 0.35, z]} paso={k > 0 && k < 1 ? b * 70 : 0} carga={k > 0 && k < 1} giro={k > 0 && k < 1 ? 0 : Math.PI} />
                  {k >= 1 ? <Contenedor p={[x, 0.35, 0.12]} escala={0.6} /> : null}
                </React.Fragment>
              );
            })}
          </Puerto>
        ) : (
          <>
            <Vaso desde={[-4.5, 0.55, 0]} hasta={[4.5, 0.55, 0]} t={b * 1.0} radio={0.8} />
            <group position={[0, -1.65, -0.2]}>
              <CilindroX radio={0.85} largo={10} x={5} color="#c03a46" estriado={9} emisivo={0.1} />
            </group>
            {/* capsulas que se disuelven en la sangre */}
            {[-0.9, 0, 0.9].map((x, i) => {
              const k = entre(b, 0.5 + i * 0.03, 0.62 + i * 0.03);
              return k < 1 ? <Capsula key={i} p={[x, mix(1.7, 0.6, k), 0.3]} escala={3 * (1 - k * 0.7)} rot={[0, 0, 1.2 + b * 4]} color={CARN_C} /> : null;
            })}
            {Array.from({ length: 24 }).map((_, i) => {
              const nace = entre(b, 0.58, 0.68);
              if (nace <= 0) return null;
              const x = -3 + ((b * 0.35 + rnd(`cx${i}`)) % 1) * 6;
              const y0 = 0.55 + (rnd(`cy${i}`) - 0.5) * 1.0;
              // algunas bajan, chocan con el musculo y regresan; dos logran entrar
              const dive = i < 8 ? entre(b, 0.66 + (i % 4) * 0.07, 0.8 + (i % 4) * 0.07) : 0;
              const entra = i === 2 || i === 5;
              let y = y0;
              if (dive > 0) y = entra ? mix(y0, -1.3, dive) : rebote(dive, y0, -0.72, 0.5);
              return <Carnitina key={i} p={[x, y, 0.35 + rnd(`cz${i}`) * 0.3]} escala={1.1 * nace} giro={b * 3 + i} brillo={0.7} />;
            })}
            <Polvo b={b} radio={5} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.5]} />
      {puerto ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[{ p: [mix(-6.5, -0.1, llega) + 0.2, 0.6, -1.35], t: "Ácidos grasos", a: 0.12, z: 0.48, o: [-40, -120], color: GRASO }]}
        />
      ) : (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [-1.2, 1.3, 0.3], t: "Sangre", a: 0.6, z: 1.2, o: [-30, -90], color: "#ff6b6b" },
            { p: [1.3, -1.6, 0.6], t: "Músculo", a: 0.66, z: 1.2, o: [-40, 100], color: K.rojo },
          ]}
        />
      )}
      <Dato b={b} a={0.04} z={0.48} t="Barcos = ácidos grasos" sub="los trae el ejercicio" color={GRASO} y={260} tam={80} />
      <Chip b={b} a={0.22} z={0.48} t="LLEGA EL BARCO: SE DESCARGA" x={540} y={1100} color={CARN_C} />
      <Dato b={b} a={0.54} z={1.2} t="Carnitina tomada" sub="la mayoría no entra al músculo" color={CARN_C} y={260} tam={96} />
      <Chip b={b} a={0.76} z={1.2} t="SE QUEDA EN LA SANGRE" x={540} y={1100} color={K.rojo} />
    </AbsoluteFill>
  );
};

// 8 · Wall 2011: 24 semanas + carbohidratos (insulina) -> solo +21 % -----------------------------
const Estudio: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.3, 3.0, 7.0], l: [0, 2.6, 0], fov: 40 },
      { b: 0.36, p: [-0.2, 2.9, 6.6], l: [0, 2.6, 0], fov: 40 },
      { b: 0.48, p: [0.3, 1.6, 8.2], l: [0.1, 0.25, 0], fov: 40 },
      { b: 0.68, p: [0.2, 1.5, 7.8], l: [0.1, 0.25, 0], fov: 40 },
      { b: 0.8, p: [1.4, 1.2, 9.4], l: [1.0, -0.1, 0], fov: 40 },
      { b: 1, p: [1.1, 1.2, 9.0], l: [1.0, -0.1, 0], fov: 40 },
    ],
    b,
  );
  const semanas = entre(b, 0.06, 0.36);
  const ins = entre(b, 0.42, 0.52);
  const abre = entre(b, 0.52, 0.6);
  const sube = entre(b, 0.74, 0.92);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Calendario24 p={[0, 2.85, 0]} escala={1.15} marca={semanas} />
        {/* membrana del musculo con su transportador */}
        <group position={[0, -0.1, 0]}>
          <Membrana ancho={3.6} prof={1.2} />
        </group>
        <Puerta p={[0, -0.1, 0.3]} abre={abre} brillo={0.4 * abre} />
        <Llave p={mix3([-1.6, 1.4, 0.4], [-0.02, 0.55, 0.35], ins)} escala={1.4} giro={mix(0.6, 0, ins)} op={ins > 0 ? 1 : 0} />
        {[-1.2, -0.6, 0.7, 1.25].map((x, i) => (
          <Glucosa key={i} p={[x, 1.15 + Math.sin(b * 4 + i) * 0.08, -0.1]} escala={1.3} op={ins} />
        ))}
        {Array.from({ length: 12 }).map((_, i) => {
          const x0 = (rnd(`ex${i}`) - 0.5) * 2.8;
          const y0 = 0.55 + rnd(`ey${i}`) * 0.75;
          const pasa = i < 3 ? entre(b, 0.6 + i * 0.08, 0.72 + i * 0.08) : 0;
          const q: V3 = pasa < 0.5 ? mix3([x0, y0, 0.3], [0, 0.45, 0.3], pasa * 2) : mix3([0, 0.45, 0.3], [(i - 1) * 0.4, -0.85, 0.3], (pasa - 0.5) * 2);
          return <Carnitina key={i} p={[q[0] + Math.sin(b * 3 + i) * 0.05 * (1 - pasa), q[1], q[2]]} escala={1.0} giro={b * 2 + i} />;
        })}
        <group position={[2.2, -1.25, 0]}>
          <Barra3D valor={1 + 0.21 * sube} color={CARN_C} alto={1.2} r={0.22} />
        </group>
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [2.2, -1.25 + 0.08 + 1.2 * (1 + 0.21 * sube) + 0.22, 0], t: `+${Math.round(21 * sube)} %`, a: 0.74, z: 1.2, color: CARN_C, tam: 54, anton: true },
          { p: [2.2, -1.45, 0.3], t: "carnitina muscular", a: 0.72, z: 1.2, color: K.tinta, tam: 28 },
        ]}
      />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.02, 0.62, 0.35], t: "Insulina", a: 0.5, z: 0.74, o: [-60, -100], color: INS },
          { p: [1.25, 1.15, -0.1], t: "Carbohidratos", a: 0.46, z: 0.74, o: [20, -110], color: GLU },
          { p: [0.25, -0.1, 0.3], t: "Puerta del músculo", a: 0.55, z: 0.74, o: [40, 110], color: "#3ee08f" },
        ]}
      />
      <Dato b={b} a={0.05} z={0.42} t="24 semanas" sub="2 g + 80 g de carbohidratos, 2 veces al día" color={K.lima} y={250} tam={110} />
      <Dato b={b} a={0.44} z={0.74} t="Insulina" sub="abre la puerta" color={INS} y={260} tam={104} />
      <Dato b={b} a={0.76} z={1.2} t="Solo +21 %" sub="en 6 meses" color={CARN_C} y={260} tam={110} />
      <Chip b={b} a={0.1} z={1.2} t="Wall et al. 2011" x={540} y={1100} color={K.suave} />
    </AbsoluteFill>
  );
};

// 9 · Metaanalisis: ~1 kg de perdida, sobre todo con sobrepeso + habitos ---------------------------
const Peso: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [1.8, 2.4, 8.6], l: [0, 1.35, 0], fov: 40 },
      { b: 1, p: [-1.2, 2.2, 8.2], l: [0, 1.35, 0], fov: 40 },
    ],
    b,
  );
  const promesa = entre(b, 0.05, 0.25);
  const real = entre(b, 0.3, 0.45);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <group scale={3.6}>
          <Bascula />
        </group>
        <group position={[-0.55, 0.22, -0.1]}>
          <Barra3D valor={promesa} color={K.naranja} alto={2.0} r={0.26} />
        </group>
        <group position={[0.55, 0.22, -0.1]}>
          <Barra3D valor={0.1 * real} color={K.lima} alto={2.0} r={0.26} />
        </group>
        <FrascoCarnitina p={[-1.45, 0, 0.6]} escala={0.6} giro={0.5} brillo={0.2} />
        <Piso r={1.6} color={K.lima} />
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [-0.55, 0.3 + 2.0 * promesa + 0.25, -0.1], t: "lo que promete", a: 0.1, z: 1.2, color: K.naranja, tam: 34 },
          { p: [0.55, 0.62, -0.1], t: "≈ 1 kg", a: 0.38, z: 1.2, color: K.lima, tam: 56, anton: true },
        ]}
      />
      <Dato b={b} a={0.32} z={1.2} t="≈ 1 kg" sub="pérdida promedio en metaanálisis" color={K.lima} y={260} tam={130} />
      <Chip b={b} a={0.58} z={1.2} t="SOBREPESO" x={250} y={1100} color={K.naranja} />
      <Chip b={b} a={0.7} z={1.2} t="+ CAMBIO DE HÁBITOS" x={760} y={1100} color={K.lima} />
    </AbsoluteFill>
  );
};

// 10 · La grasa se quema en la hoguera de los carbohidratos -----------------------------------------
const Hoguera: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuego = b < 0.52;
  const cam = fuego
    ? camara(
        [
          { b: 0, p: [0.6, 1.8, 7.6], l: [0, 0.75, 0], fov: 40 },
          { b: 0.52, p: [-0.5, 1.6, 7.0], l: [0, 0.75, 0], fov: 40 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.52, p: [0, 0.2, 8.8], l: [0, -0.1, 0], fov: 40 },
          { b: 1, p: [0.4, 0.1, 8.2], l: [0, -0.1, 0], fov: 40 },
        ],
        b,
      );
  const glu = entre(b, 0.55, 0.7);
  const beta = entre(b, 0.6, 0.72);
  const une = entre(b, 0.74, 0.86);
  const gira = lineal(b, 0.86, 1);
  const OAA: V3 = [-0.25, 0.75, 0.2];
  const oaa = glu < 1 ? mix3([-1.3, -1.7, 0.3], OAA, glu) : OAA;
  const acPos = (i: number): V3 => mix3([0.7 + i * 0.22, 1.5, 0.3], [0.08, 0.85, 0.3], une * (i === 0 ? 1 : 0));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={fuego ? undefined : [6, 20]}>
        {fuego ? (
          <>
            <Fogata p={[0, -0.6, 0]} b={b} escala={1.5} fuerza={0.8 + 0.2 * entre(b, 0.2, 0.4)} />
            {[0, 1, 2, 3, 4].map((i) => {
              const a = (i / 5) * Math.PI * 2 + 0.3;
              return <Glucosa key={i} p={[Math.cos(a) * 0.95, -0.42, Math.sin(a) * 0.7 + 0.2]} escala={1.6} brillo={0.7} />;
            })}
            {[0, 1, 2].map((i) => {
              const k = entre(b, 0.18 + i * 0.09, 0.36 + i * 0.09);
              if (k <= 0 || k >= 1) return null;
              return <Cadena key={`a${i}`} n={7} p={[-0.45 + i * 0.12, mix(1.3, -0.1, k), 0.3 - i * 0.2]} color={GRASO} sep={0.12} brillo={0.6 + k} op={k > 0.8 ? (1 - k) * 5 : 1} />;
            })}
          </>
        ) : (
          <>
            <group position={[0, -0.25, -1.6]} rotation={[0, 0, Math.PI / 2]} scale={1.05}>
              <MitocondriaGrande op={0.45} brillo={0.1 + 0.3 * gira} corte={false} />
            </group>
            <group position={[0, -0.25, 0]}>
              <FlechasCiclo R={1.0} giro={b * 3} color="#9fd8ff" />
              <mesh>
                <torusGeometry args={[1.0, 0.025, 8, 64]} />
                <meshStandardMaterial color="#9fd8ff" emissive="#9fd8ff" emissiveIntensity={0.3 + gira} transparent opacity={0.6} />
              </mesh>
            </group>
            {glu < 0.95 ? <Glucosa p={mix3([-1.3, -1.7, 0.3], OAA, glu)} escala={1.6} op={1 - glu} /> : null}
            {glu > 0.4 ? (
              <group position={gira > 0 ? [Math.cos(1.85 - gira * 6) * 1.0, -0.25 + Math.sin(1.85 - gira * 6) * 1.0, 0.2] : oaa}>
                <Cadena n={4} p={[-0.17, 0, 0]} color={OAA_C} sep={0.12} brillo={0.6 + gira} op={Math.min(1, (glu - 0.4) * 3)} />
                {gira > 0 ? <AcetilCoA p={[0.32, 0.05, 0]} escala={1.6} cola={0} /> : null}
              </group>
            ) : null}
            {beta < 0.98 ? <Cadena n={8} p={[0.65, 1.5, 0.3]} color={GRASO} sep={0.12} brillo={0.6} op={1 - beta} /> : null}
            {beta > 0.3 && gira <= 0
              ? [0, 1, 2, 3].map((i) => <AcetilCoA key={i} p={acPos(i)} escala={1.6} op={Math.min(1, (beta - 0.3) * 3)} />)
              : null}
            <Polvo b={b} radio={5} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.52]} />
      {fuego ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [0.95, -0.42, 0.45], t: "Glucosa", a: 0.1, z: 0.52, o: [-40, 120], color: GLU },
            { p: [-0.3, 1.2, 0.3], t: "Ácidos grasos", a: 0.22, z: 0.52, o: [60, -60], color: GRASO },
          ]}
        />
      ) : (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [-1.1, -1.4, 0.3], t: "Glucosa", a: 0.55, z: 0.7, o: [40, 110], color: GLU },
            { p: [OAA[0] - 0.1, OAA[1] + 0.05, 0.2], t: "Oxaloacetato", a: 0.68, z: 1.2, o: [-60, -90], color: OAA_C },
            { p: [1.0, 1.55, 0.3], t: "Ácidos grasos → acetil-CoA", a: 0.6, z: 0.86, o: [-60, -110], color: GRASO },
            { p: [0.8, -1.0, 0.2], t: "Ciclo de Krebs", a: 0.86, z: 1.2, o: [-20, 120], color: "#9fd8ff" },
          ]}
        />
      )}
      <Titular
        b={b}
        a={0.1}
        z={1.2}
        y={250}
        tam={84}
        t={
          <>
            La grasa se quema en la hoguera de los <span style={{ color: GLU }}>carbohidratos</span>
          </>
        }
      />
    </AbsoluteFill>
  );
};

const Final: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Has tomado <span style={{ color: K.lima }}>L-carnitina</span>?</>}
    escribe="Yo…"
    ideas={["SÍ, Y NO NOTÉ NADA", "SÍ, ME FUNCIONÓ", "NUNCA"]}
  />
);

const T = [
  "¿La L-carnitina quema grasa? Es de los suplementos más populares para bajar de peso. Vamos a ver qué pasa de verdad en tu cuerpo.",
  "Cuando empiezas un ejercicio moderado, liberas **adrenalina**, que viaja por la sangre hasta tu tejido adiposo.",
  "Ahí activa una enzima, la **lipasa hormono sensible**, que rompe los triglicéridos y suelta **ácidos grasos**. Entre los **quince y veinte minutos**, esa liberación se vuelve más eficiente.",
  "Como la grasa no se mezcla con la sangre, los ácidos grasos viajan montados en una proteína: la **albúmina**.",
  "Al llegar al músculo tienen que entrar a la **mitocondria**, el único lugar donde la grasa se quema. Pero no entran solos: necesitan a la **carnitina**.",
  "De ahí nace el mito: si tomo más carnitina, quemo más grasa. Francis Holway lo explica con un **puerto**.",
  "La carnitina son los **estibadores** que bajan los contenedores. Si llenas el puerto de estibadores pero no llegan **barcos**, no se descarga más rápido.",
  "Los barcos son los ácidos grasos que libera el **ejercicio**. Además, la mayoría de la carnitina que tomas se queda en la **sangre** y no entra al músculo.",
  "Para meterla al músculo, un estudio necesitó **veinticuatro semanas**, con carbohidratos en cada toma para subir la insulina. Y solo aumentó un **veintiuno por ciento**.",
  "En los metaanálisis, la pérdida de peso es pequeña: alrededor de **un kilo**, sobre todo en personas con sobrepeso que además cambian sus hábitos.",
  "Y un dato curioso: la grasa se quema en la hoguera de los **carbohidratos**. Para oxidar grasa, tu mitocondria necesita algo de glucosa.",
  "¿Tú has tomado L-carnitina? **Escríbelo en los comentarios**.",
];

const ESCENAS = [Gancho, Adrenal, Lipolisis, Transporte, Entrada, Mito, Estibadores, Barcos, Estudio, Peso, Hoguera, Final];

export const CARNITINA: ShortDef = {
  id: "Short-Carnitina",
  titulo: "¿La L-carnitina quema grasa?",
  planos: ESCENAS.map((Escena, i) => ({ id: `carnitina-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
