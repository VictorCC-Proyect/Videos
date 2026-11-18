// Short: ¿Por qué los principiantes ganan músculo y pierden grasa a la vez? Recomposición + paradoja del principiante.
// Fuentes: Holway, Nutrición sin dogmas, Tomo 1, 1.6.12; Longland et al. 2016 (Am J Clin Nutr); Naddafha et al. 2026 (JISSN).
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3 } from "../fisio/motor";
import { Polvo, rnd } from "../fisio/modelos/comun";
import { Humano } from "../fisio/modelos/cuerpo";
import { Cadena } from "../fisio/modelos/energia";
import { CilindroX } from "../fisio/modelos/musculo";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaComentarios } from "./cierre";
import { Chip, Dato, Destello, K, Sello, ShortDef, Titular } from "./marco";
import { Huevo, Pechuga, Piso, Plato } from "./modelos";
import { Adipocito } from "./modelos-ayuno";
import { GRASO } from "./modelos-carnitina";
import { F2Flecha, F2Tacha } from "./modelos-fibras";
import { Glucosa } from "./modelos-glucosa";
import { H_ACTINA, H_MIOSINA, Ribosoma } from "./modelos-hipertrofia";
import { Balanza, Rotulos } from "./modelos-sueno";
import { CuerpoSoma } from "./modelos-somatotipos";
import { Arroz, Mancuerna, PanRebanada, Platano, Puerta, Tarjeta3D } from "./modelos-ventana";
import {
  BarraCambio,
  Bateria,
  CalendarioSemanas,
  CurvaProgreso,
  Horno,
  InteriorMitos,
  LibroHolway,
  Lena,
  MITO_POS,
  puntoCurva,
} from "./modelos-principiante";
import { camViaje, cortesViaje, Viaje } from "./viaje";

const curl = (b: number, vel: number) => Math.sin(((b * vel) % 1) * Math.PI);

// 0 · Gancho: principiante con mancuerna; en 3 meses pierde grasa y gana musculo a la vez --------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const k = curl(b, 4.2);
  const cambio = entre(b, 0.22, 0.62);
  const mes = Math.min(3, Math.floor(cambio * 3.02));
  const cam = camara(
    [
      { b: 0, p: [1.6, 1.3, 6.2], l: [0, 0.72, 0], fov: 36 },
      { b: 0.6, p: [-0.6, 1.2, 5.9], l: [0, 0.74, 0], fov: 36 },
      { b: 1, p: [-1.4, 1.2, 6.3], l: [0, 0.72, 0], fov: 36 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <CuerpoSoma
          endo={mix(5.5, 2.2, cambio)}
          meso={mix(3.2, 5.2, cambio)}
          ecto={2}
          pesa
          codo={-0.15 - 2.0 * k}
          verGrasa={mix(1, 0.3, cambio)}
          brilla={0.1 + 0.35 * cambio}
          colorBrillo={K.lima}
        />
        <Piso color={K.lima} brillo={0.3} />
      </Escena3D>
      <Chip b={b} a={0.03} z={0.22} t="PRINCIPIANTE" x={540} y={330} color={K.cian} />
      <Chip b={b} a={0.22} z={0.66} t={`MES ${mes}`} x={540} y={330} color={K.lima} />
      <Chip b={b} a={0.3} z={0.66} t="− GRASA" x={330} y={1100} color={K.amarillo} />
      <Chip b={b} a={0.38} z={0.66} t="+ MÚSCULO" x={750} y={1100} color={K.lima} />
      <Titular b={b} a={0.64} z={1.1} y={250} tam={110} color={K.tinta} t={<>¿Las dos al <span style={{ color: K.lima }}>mismo tiempo</span>?</>} />
      <Chip b={b} a={0.76} z={1.1} t="SI DICEN QUE HAY QUE COMER DE MÁS" x={540} y={1100} color={K.naranja} />
    </AbsoluteFill>
  );
};

// 1 · Recomposicion corporal: dos flechas simultaneas sobre el cuerpo ------------------------------
const Recomposicion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const c = entre(b, 0.1, 0.75);
  const fl = entre(b, 0.08, 0.3);
  const pulso = 0.5 + 0.5 * Math.sin(b * 30);
  const cam = camara(
    [
      { b: 0, p: [0.8, 1.2, 5.6], l: [0, 0.78, 0], fov: 38 },
      { b: 1, p: [-0.9, 1.2, 5.8], l: [0, 0.78, 0], fov: 38 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <CuerpoSoma endo={mix(4.5, 2.4, c)} meso={mix(3.6, 5.0, c)} ecto={2} verGrasa={mix(1, 0.3, c)} brilla={0.15 + 0.3 * c} colorBrillo={K.lima} />
        <Piso color={K.lima} brillo={0.3} />
        <F2Flecha a={[0.62, 0.85, 0.1]} b={[0.62, 0.85 + 0.75 * fl, 0.1]} color={K.lima} r={0.05} op={fl * (0.75 + 0.25 * pulso)} />
        <F2Flecha a={[-0.62, 1.55, 0.1]} b={[-0.62, 1.55 - 0.75 * fl, 0.1]} color={K.amarillo} r={0.05} op={fl * (0.75 + 0.25 * pulso)} />
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [0.62, 1.78, 0.1], t: "MÚSCULO ↑", a: 0.12, z: 1.1, color: K.lima, tam: 40, anton: true },
          { p: [-0.62, 0.6, 0.1], t: "GRASA ↓", a: 0.16, z: 1.1, color: K.amarillo, tam: 40, anton: true },
        ]}
      />
      <Dato b={b} a={0.03} z={1.1} t="Recomposición corporal" sub="ganar músculo y perder grasa a la vez" color={K.lima} y={250} tam={80} />
      <Chip b={b} a={0.62} z={1.1} t="SOBRE TODO EN PRINCIPIANTES" x={540} y={1100} color={K.cian} />
    </AbsoluteFill>
  );
};

// 2 · Viaje a la fibra de un principiante: muy sensible, ribosomas a toda velocidad -----------------
const RIBOS: { p: V3; c: string; g: number }[] = [
  { p: [-1.2, 0.5, 1.2], c: H_ACTINA, g: 0.2 },
  { p: [1.1, -0.4, 1.4], c: H_MIOSINA, g: -0.25 },
  { p: [-0.3, -1.9, 1.5], c: H_ACTINA, g: 0.1 },
];

const Sensible: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const t = lineal(b, 0, 0.52);
  const dentro = b >= 0.52;
  const k = curl(b, 3.0);
  const prende = entre(b, 0.55, 0.68);
  const pulso = 0.5 + 0.5 * Math.sin(b * 34);
  const cam = dentro
    ? camara(
        [
          { b: 0.52, p: [0, 0.3, 10.5], l: [0, -0.9, 0], fov: 40 },
          { b: 1, p: [0.6, 0.2, 8.6], l: [0, -0.8, 0], fov: 40 },
        ],
        b,
      )
    : camViaje(t);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2} niebla={t > 0.72 ? [10, 34] : undefined}>
        {!dentro ? (
          <Viaje t={t} b={b} ej="curl" k={k} colorBrillo={K.lima} interior={{ pcr: 0, brillo: 0.2 }} />
        ) : (
          <>
            <InteriorMitos n={2} tam={0.7} brillo={0.15 + prende * 0.5 * pulso} />
            {RIBOS.map((r, i) => (
              <Ribosoma key={i} p={r.p} color={r.c} n={prende * 14 * (0.6 + 0.4 * ((b * 5 + i * 0.3) % 1))} avance={b * 40} escala={0.85} giro={r.g} />
            ))}
            <Polvo b={b} radio={5} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[...cortesViaje(0, 0.52).slice(1), 0.52]} color={K.lima} />
      <Chip b={b} a={0.04} z={0.3} t="PRIMER ESTÍMULO" x={540} y={330} color={K.cian} />
      {dentro ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [RIBOS[0].p[0] - 0.3, RIBOS[0].p[1], RIBOS[0].p[2]], t: "Ribosomas", a: 0.6, z: 1.1, o: [-60, 90], color: "#5fd3c6" },
            { p: [RIBOS[1].p[0], RIBOS[1].p[1] + 1.0, RIBOS[1].p[2]], t: "Proteína nueva", a: 0.7, z: 1.1, o: [40, -80], color: K.lima },
          ]}
        />
      ) : null}
      <Dato b={b} a={0.56} z={1.1} t="Muy sensible" sub="la síntesis de proteína se dispara" color={K.lima} y={250} tam={96} />
    </AbsoluteFill>
  );
};

// 3 · La grasa como reserva: deficit leve -> sale energia de los adipocitos hacia el musculo ----------
const ADIPOS: V3[] = [
  [0, 0, 0],
  [1.05, 0.1, -0.2],
  [-1.05, 0.05, -0.1],
  [0.5, 0.95, -0.3],
  [-0.55, 0.95, -0.25],
  [0.5, -0.9, -0.3],
  [-0.5, -0.9, -0.2],
];
const BAL: V3 = [-4.4, -0.9, 0];
const FIBRA_Y = -2.6;

const Reserva: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const inclina = entre(b, 0.42, 0.56) * 0.22;
  const libera = lineal(b, 0.64, 1);
  const cam = camara(
    [
      { b: 0, p: [0.6, 0.2, 10.0], l: [0, -0.8, 0], fov: 38 },
      { b: 0.34, p: [-0.4, 0.1, 10.2], l: [0, -0.85, 0], fov: 38 },
      { b: 0.42, p: [BAL[0] + 0.3, 1.2, 7.4], l: [BAL[0], 0.1, 0], fov: 38 },
      { b: 0.58, p: [BAL[0] - 0.2, 1.1, 7.2], l: [BAL[0], 0.1, 0], fov: 38 },
      { b: 0.68, p: [0.5, -0.3, 11.0], l: [0, -1.9, 0], fov: 38 },
      { b: 1, p: [-0.4, -0.4, 10.4], l: [0, -1.9, 0], fov: 38 },
    ],
    b,
  );
  const gota = mix(0.8, 0.7, libera);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2} niebla={[8, 22]}>
        {ADIPOS.map((p, i) => (
          <Adipocito key={i} p={p} r={0.55} gota={gota} brillo={0.1 * libera} />
        ))}
        {/* fibra muscular que recibe el combustible */}
        <group position={[0, FIBRA_Y, -0.2]}>
          <CilindroX radio={0.45} largo={6} x={3} color="#c03a46" estriado={8} tapa="#e0707a" emisivo={0.25 * libera} />
        </group>
        {Array.from({ length: 12 }).map((_, i) => {
          const f = (libera * 2.2 + rnd(`ag${i}`)) % 1;
          if (libera <= 0.01) return null;
          const ini = mix3(ADIPOS[i % 7], [0, -0.6, 0.4], 0.4);
          const fin: V3 = [(rnd(`agx${i}`) - 0.5) * 3, FIBRA_Y + 0.3, 0.3];
          const p = mix3(ini, fin, f);
          return (
            <group key={i} position={p} rotation={[0, 0, 1.2 + i]}>
              <Cadena n={6} color={GRASO} sep={0.08} brillo={0.6} op={Math.min(1, libera * 4) * (1 - f * 0.6)} />
            </group>
          );
        })}
        <F2Flecha a={[1.7, -0.9, 0.4]} b={[1.7, FIBRA_Y + 0.6, 0.4]} color={K.amarillo} r={0.04} op={entre(b, 0.66, 0.74)} />
        <group position={BAL} scale={0.72}>
          <Balanza inclina={inclina} sintesis={6} degrada={8} />
        </group>
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [BAL[0] - 0.95, BAL[1] + 1.7, 0.3], t: "COMES", a: 0.44, z: 0.64, color: "#3ee07a", tam: 52, anton: true },
          { p: [BAL[0] + 0.95, BAL[1] + 1.55, 0.3], t: "GASTAS", a: 0.46, z: 0.64, color: K.rojo, tam: 52, anton: true },
          { p: [1.85, -1.75, 0.4], t: "ENERGÍA", a: 0.72, z: 1.1, color: K.amarillo, tam: 34, anton: true, ancla: "izq" },
        ]}
      />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-1.05, 0.3, 0.4], t: "Adipocitos", a: 0.06, z: 0.38, o: [-40, -120], color: GRASO },
          { p: [-1.6, FIBRA_Y + 0.3, 0.2], t: "Músculo", a: 0.74, z: 1.1, o: [-30, 110], color: "#ff8f9a" },
        ]}
      />
      <Dato b={b} a={0.04} z={1.1} t="Reserva de energía" sub={b < 0.4 ? "tu grasa guarda combustible" : "comes un poco menos de lo que gastas"} color={K.amarillo} y={250} tam={84} />
    </AbsoluteFill>
  );
};

// 4 · Estudio Longland 2016: 4 semanas, 2.4 g/kg, +1.2 kg magra y -4.8 kg grasa ----------------------
const CAL4: V3 = [-3.6, 0.9, 0];
const PLATO4: V3 = [0, 0.4, 0];
const BARRAS4: V3 = [3.6, 0.2, 0];
const ESC_B = 0.32;

const Estudio: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const dias = lineal(b, 0.04, 0.34);
  const k = curl(b, 6);
  const magra = entre(b, 0.6, 0.72) * 1.2;
  const grasa = entre(b, 0.78, 0.88) * -4.8;
  const cam = camara(
    [
      { b: 0, p: [CAL4[0] + 0.9, 1.2, 7.0], l: [CAL4[0] + 0.45, 0.1, 0], fov: 38 },
      { b: 0.34, p: [CAL4[0] + 0.4, 1.1, 7.0], l: [CAL4[0] + 0.45, 0.1, 0], fov: 38 },
      { b: 0.42, p: [PLATO4[0] + 0.3, 2.0, 3.2], l: [PLATO4[0], 0.1, 0], fov: 38 },
      { b: 0.56, p: [PLATO4[0] - 0.3, 2.0, 3.0], l: [PLATO4[0], 0.1, 0], fov: 38 },
      { b: 0.62, p: [BARRAS4[0] + 0.4, 0.4, 8.0], l: [BARRAS4[0], -0.45, 0], fov: 38 },
      { b: 1, p: [BARRAS4[0] - 0.4, 0.4, 8.2], l: [BARRAS4[0], -0.45, 0], fov: 38 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        {/* calendario + persona entrenando */}
        <group position={CAL4} scale={1.25}>
          <CalendarioSemanas semanas={4} marca={dias} />
        </group>
        <group position={[CAL4[0] + 1.25, -0.55, 0.3]} scale={0.6}>
          <CuerpoSoma endo={4} meso={4} ecto={2} pesa codo={-0.15 - 2.0 * k} brilla={0.3} colorBrillo={K.naranja} />
        </group>
        {/* plato alto en proteina */}
        <group position={PLATO4}>
          <Plato p={[0, 0, 0]} escala={1.1} />
          <Pechuga p={[-0.12, 0.1, 0.05]} escala={0.95} />
          <Huevo p={[0.32, 0.06, 0.25]} escala={0.75} />
          <Huevo p={[0.3, 0.06, -0.22]} escala={0.7} />
        </group>
        {/* barras de cambio */}
        <group position={BARRAS4}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.9, 0.025, 0.6]} />
            <meshStandardMaterial color="#cfe0dc" emissive="#cfe0dc" emissiveIntensity={0.3} />
          </mesh>
          <group position={[-0.45, 0, 0]}>
            <BarraCambio valor={magra * ESC_B} color={K.lima} />
          </group>
          <group position={[0.45, 0, 0]}>
            <BarraCambio valor={grasa * ESC_B} color={K.amarillo} />
          </group>
        </group>
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [PLATO4[0], 0.9, 0], t: "2.4 g/kg", a: 0.44, z: 0.6, color: K.lima, tam: 78, anton: true },
          { p: [BARRAS4[0] - 0.45, 0.78, 0], t: `+${magra.toFixed(1)} kg`, a: 0.6, z: 1.1, color: K.lima, tam: 54, anton: true },
          { p: [BARRAS4[0] - 0.45, -0.25, 0], t: "masa magra", a: 0.62, z: 1.1, color: K.tinta, tam: 30 },
          { p: [BARRAS4[0] + 0.45, 0.38, 0], t: `${grasa.toFixed(1)} kg`.replace("-", "−"), a: 0.8, z: 1.1, color: K.amarillo, tam: 54, anton: true },
          { p: [BARRAS4[0] + 0.45, 0.14, 0], t: "grasa", a: 0.82, z: 1.1, color: K.tinta, tam: 30 },
        ]}
      />
      <Dato b={b} a={0.03} z={0.4} t="4 semanas" sub="entreno intenso + déficit" color={K.cian} y={250} tam={100} />
      <Dato b={b} a={0.4} z={0.6} t="Proteína alta" sub="por kilo de peso al día" color={K.lima} y={250} tam={96} />
      <Dato b={b} a={0.6} z={1.1} t="Ganaron y perdieron" sub="a la vez, en 4 semanas" color={K.lima} y={250} tam={86} />
      <Chip b={b} a={0.15} z={0.4} t="DÉFICIT ~40 %" x={540} y={1100} color={K.naranja} />
      <Chip b={b} a={0.66} z={1.1} t="Longland et al. 2016" x={540} y={1100} color={K.suave} />
    </AbsoluteFill>
  );
};

// 5 · Holway: la paradoja del principiante; pocas mitocondrias, la grasa casi no entra ---------------
const Paradoja: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const libro = b < 0.44;
  const abre = entre(b, 0.06, 0.26);
  const cam = libro
    ? camara(
        [
          { b: 0, p: [0.5, 0.0, 6.6], l: [0, -0.4, 0], fov: 38 },
          { b: 0.44, p: [-0.2, 0.0, 6.0], l: [0, -0.4, 0], fov: 38 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.44, p: [0.4, 0.4, 9.6], l: [0, -0.6, 0], fov: 40 },
          { b: 1, p: [-0.4, 0.3, 8.0], l: [-0.2, -0.5, 0], fov: 40 },
        ],
        b,
      );
  const ag = lineal(b, 0.5, 1);
  const M = [MITO_POS[0].p, MITO_POS[1].p];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2} niebla={libro ? undefined : [8, 26]}>
        {libro ? (
          <LibroHolway abre={abre} brillo={entre(b, 0.2, 0.32)} />
        ) : (
          <>
            <InteriorMitos n={2} tam={0.75} brilloMito={0.2} />
            {Array.from({ length: 10 }).map((_, i) => {
              const m = M[i % 2];
              const llega = entre(ag, i * 0.06, i * 0.06 + 0.35);
              if (llega <= 0) return null;
              const entra = i % 5 === 0;
              const ang = i * 1.7;
              const cola: V3 = [m[0] + Math.cos(ang) * (0.75 + 0.1 * (i % 3)), m[1] + Math.sin(ang) * 0.7, m[2] + 0.3];
              const ini: V3 = [i % 2 ? 4.5 : -4.5, m[1] + (rnd(`py${i}`) - 0.5) * 2, 0.8];
              const fin = entra ? m : cola;
              const p = mix3(ini, fin, llega);
              const ondea = entra ? 0 : Math.sin(b * 30 + i) * 0.05 * llega;
              const op = entra ? 1 - entre(llega, 0.85, 1) : 1;
              return (
                <group key={i} position={[p[0], p[1] + ondea, p[2]]} rotation={[0, 0, ang]}>
                  <Cadena n={8} color={GRASO} sep={0.09} brillo={0.6} op={op} />
                </group>
              );
            })}
            <Polvo b={b} radio={5} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.44]} />
      {libro ? <Chip b={b} a={0.02} z={0.44} t="FRANCIS HOLWAY" x={540} y={330} color={K.cian} /> : null}
      {!libro ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [M[0][0], M[0][1] + 0.25, M[0][2]], t: "Mitocondria", a: 0.5, z: 1.1, o: [-60, -110], color: K.naranja },
            { p: [M[1][0] + 0.6, M[1][1] + 0.5, M[1][2] + 0.3], t: "Ácidos grasos", a: 0.66, z: 1.1, o: [40, 140], color: GRASO },
          ]}
        />
      ) : null}
      <Dato b={b} a={0.5} z={1.1} t="Pocas mitocondrias" sub="aún no queman mucha grasa" color={K.naranja} y={250} tam={90} />
    </AbsoluteFill>
  );
};

// 6 · Biogenesis 2-3 meses; mientras tanto, la glucosa es el combustible principal ----------------------
const CAL6: V3 = [0, 5.2, 0];

const Biogenesis: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const sem = lineal(b, 0.04, 0.5);
  const crece = entre(b, 0.12, 0.62);
  const glu = entre(b, 0.55, 0.68);
  const cam = camara(
    [
      { b: 0, p: [0.4, CAL6[1] - 0.1, 4.6], l: [0, CAL6[1] - 0.6, 0], fov: 40 },
      { b: 0.14, p: [0.2, CAL6[1] - 0.2, 5.0], l: [0, CAL6[1] - 0.7, 0], fov: 40 },
      { b: 0.3, p: [0.4, 0.4, 9.6], l: [0, -0.4, 0], fov: 40 },
      { b: 1, p: [-0.5, 0.3, 9.0], l: [0, -0.5, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2} niebla={[8, 26]}>
        <group position={CAL6} scale={1.3}>
          <CalendarioSemanas semanas={12} marca={sem} color={K.naranja} />
        </group>
        <InteriorMitos n={2 + crece * 10} tam={mix(0.75, 1.05, crece)} brilloMito={0.2 + 0.3 * crece} />
        {glu > 0
          ? Array.from({ length: 26 }).map((_, i) => {
              const f = (b * 1.6 + rnd(`gl${i}`)) % 1;
              const x = (rnd(`glx${i}`) - 0.5) * 5;
              const p: V3 = [x + Math.sin(f * 6 + i) * 0.2, 3.8 - f * 7.6, 1.2 + rnd(`glz${i}`) * 0.8];
              return <Glucosa key={i} p={p} escala={1.6} op={glu * Math.min(1, (1 - f) * 4, f * 6)} brillo={0.6} />;
            })
          : null}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[{ p: [0, CAL6[1] + 1.25, 0], t: `SEMANA ${Math.max(1, Math.ceil(sem * 12))}`, a: 0.02, z: 0.3, color: K.tinta, tam: 46, anton: true }]}
      />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: MITO_POS[4].p, t: "Más mitocondrias", a: 0.36, z: 0.62, o: [-80, -120], color: K.naranja },
          { p: [-1.8, 1.0, 1.6], t: "Glucosa", a: 0.68, z: 1.1, o: [-30, -130], color: "#ffd166" },
        ]}
      />
      <Dato b={b} a={0.03} z={0.6} t="2–3 meses" sub="para fabricar más mitocondrias" color={K.naranja} y={250} tam={110} />
      <Dato b={b} a={0.6} z={1.1} t="Depende de la glucosa" sub="combustible principal al empezar" color="#ffd166" y={250} tam={82} />
    </AbsoluteFill>
  );
};

// 7 · Error: quitar los carbohidratos de golpe -> fatiga, rindes mal, abandono -------------------------
const Abandono: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fase = b < 0.3 ? 0 : b < 0.62 ? 1 : 2;
  const tacha = entre(b, 0.08, 0.16);
  const bat = mix(0.9, 0.08, entre(b, 0.34, 0.6));
  const sale = entre(b, 0.66, 0.98);
  const cam =
    fase === 0
      ? camara(
          [
            { b: 0, p: [0.3, 2.7, 4.4], l: [0, -0.15, 0], fov: 38 },
            { b: 0.3, p: [-0.3, 2.6, 4.1], l: [0, -0.15, 0], fov: 38 },
          ],
          b,
        )
      : fase === 1
        ? camara(
            [
              { b: 0.3, p: [0.6, 0.3, 9.4], l: [0.3, -0.6, 0], fov: 40 },
              { b: 0.62, p: [-0.2, 0.2, 8.6], l: [0.3, -0.6, 0], fov: 40 },
            ],
            b,
          )
        : camara(
            [
              { b: 0.62, p: [1.6, 1.4, 5.6], l: [0, 0.75, 0], fov: 38 },
              { b: 1, p: [1.0, 1.3, 5.2], l: [0, 0.8, 0], fov: 38 },
            ],
            b,
          );
  const zH = mix(1.6, -0.4, sale);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2} niebla={fase === 1 ? [8, 26] : undefined}>
        {fase === 0 ? (
          <>
            <Plato p={[0, 0, 0]} escala={1.3} />
            <Arroz p={[-0.3, 0.03, -0.1]} escala={1.3} />
            <PanRebanada p={[0.35, 0.03, -0.15]} escala={1.1} giro={-0.3} />
            <Platano p={[0.1, 0.1, 0.35]} escala={0.9} giro={0.4} />
            <F2Tacha p={[0, 0.45, 0.2]} tam={0.75 * tacha} op={tacha} />
          </>
        ) : null}
        {fase === 1 ? (
          <>
            <InteriorMitos n={2} tam={0.75} apagado={entre(b, 0.34, 0.6)} />
            {Array.from({ length: 3 }).map((_, i) => {
              const f = (b * 1.2 + i / 3) % 1;
              return <Glucosa key={i} p={[-1.4 + i * 1.2, 3.4 - f * 6.8, 1.4]} escala={1.6} op={(1 - entre(b, 0.4, 0.58)) * 0.9} brillo={0.5} />;
            })}
            <group position={[1.3, -1.9, 2.0]} scale={1.2}>
              <Bateria nivel={bat} />
            </group>
            <Polvo b={b} radio={5} />
          </>
        ) : null}
        {fase === 2 ? (
          <>
            <group position={[0, 0, -0.9]}>
              <Puerta abre={entre(b, 0.64, 0.74)} luz={0.9} />
            </group>
            <group position={[0.05, 0, zH]} rotation={[0, Math.PI, 0]}>
              <Humano fase={b * 22} marcha={0.75} musculo={0.8 * (1 - entre(b, 0.9, 1))} brilla={0.1} colorBrillo={K.rojo} />
            </group>
          </>
        ) : null}
      </Escena3D>
      <Destello b={b} en={[0.3, 0.62]} />
      {fase === 0 ? <Chip b={b} a={0.03} z={0.3} t="SIN CARBOHIDRATOS" x={540} y={330} color={K.rojo} /> : null}
      {fase === 1 ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [1.3, -0.4, 2.0], t: "Energía", a: 0.36, z: 0.62, o: [-40, -110], color: K.rojo },
            { p: MITO_POS[0].p, t: "Pocas mitocondrias", a: 0.4, z: 0.62, o: [-30, -150], color: K.naranja },
          ]}
        />
      ) : null}
      <Dato b={b} a={0.34} z={0.62} t="Sin glucosa" sub="y sin máquina de grasa lista" color={K.rojo} y={250} tam={100} />
      <Chip b={b} a={0.46} z={0.62} t="FATIGA" x={540} y={1100} color={K.rojo} />
      <Chip b={b} a={0.64} z={1.1} t="RINDES MAL" x={540} y={330} color={K.naranja} />
      <Sello b={b} a={0.84} z={1.1} t="ABANDONO" y={1000} color={K.rojo} />
    </AbsoluteFill>
  );
};

// 8 · Metafora de Holway: no quites la leña antes de construir el horno ---------------------------------
const HORNO: V3 = [-0.4, 0, 0];
const LENA: V3 = [0.9, 0, 0.35];

const HornoLena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const construye = mix(0.68, 0.86, lineal(b, 0, 1));
  const saca = entre(b, 0.3, 0.52);
  const tacha = entre(b, 0.55, 0.62);
  const vuelve = entre(b, 0.66, 0.82);
  const s = saca * (1 - vuelve);
  const cam = camara(
    [
      { b: 0, p: [0.6, 0.8, 8.2], l: [0.1, 0.15, 0], fov: 38 },
      { b: 1, p: [-0.4, 0.75, 7.8], l: [0.1, 0.15, 0], fov: 38 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <group position={HORNO}>
          <Horno construye={construye} fuego={0.6} b={b} />
        </group>
        <group position={LENA}>
          <Lena saca={[0.5 * s, 0.6 * s, 0.4 * s]} brillo={0.08} />
        </group>
        <F2Tacha p={[LENA[0] + 0.1, 0.7, LENA[2] + 0.4]} tam={0.5 * tacha} op={tacha} />
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.4, 48]} />
          <meshStandardMaterial color="#123036" roughness={0.9} />
        </mesh>
      </Escena3D>
      <Titular
        b={b}
        a={0.02}
        z={1.1}
        y={240}
        tam={88}
        t={
          <>
            No quites la <span style={{ color: K.amarillo }}>leña</span> antes de construir el <span style={{ color: K.naranja }}>horno</span>
          </>
        }
      />
      <Chip b={b} a={0.1} z={1.1} t="HORNO = MITOCONDRIAS" x={540} y={1040} color={K.naranja} />
      <Chip b={b} a={0.16} z={1.1} t="LEÑA = CARBOHIDRATOS" x={540} y={1125} color={K.amarillo} />
    </AbsoluteFill>
  );
};

// 9 · La receta: cuatro tarjetas --------------------------------------------------------------------------
const CARTA = 1.1;
const SEP = 1.25;
const TARJETAS: { p: V3; t: string; c: string; a: number }[] = [
  { p: [-SEP / 2, SEP / 2, 0], t: "DÉFICIT MODERADO", c: K.cian, a: 0.1 },
  { p: [SEP / 2, SEP / 2, 0], t: "PROTEÍNA ALTA", c: K.rosa, a: 0.3 },
  { p: [-SEP / 2, -SEP / 2, 0], t: "CARBOS DE CALIDAD", c: K.amarillo, a: 0.45 },
  { p: [SEP / 2, -SEP / 2, 0], t: "FUERZA PROGRESIVA", c: K.lima, a: 0.72 },
];

const Receta: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.5, 0.2, 9.6], l: [0, -0.35, 0], fov: 38 },
      { b: 1, p: [-0.5, 0.1, 9.3], l: [0, -0.35, 0], fov: 38 },
    ],
    b,
  );
  const ap = TARJETAS.map((tj) => entre(b, tj.a, tj.a + 0.08));
  const sube = entre(b, 0.78, 0.95);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        {TARJETAS.map((tj, i) => {
          const s = ap[i];
          if (s <= 0.01) return null;
          return (
            <group key={i} position={tj.p} scale={s} rotation={[0, (1 - s) * 1.2 + Math.sin(b * 3 + i) * 0.06, 0]}>
              <Tarjeta3D ancho={CARTA} alto={CARTA} color={tj.c} brillo={0.6} />
              {i === 0 ? (
                <group position={[0, -0.38, 0.05]} scale={0.28}>
                  <Balanza inclina={0.12} sintesis={6} degrada={7} />
                </group>
              ) : null}
              {i === 1 ? (
                <group position={[0, -0.02, 0.15]} rotation={[0.9, 0, 0]}>
                  <Pechuga p={[-0.1, 0, 0]} escala={0.75} />
                  <Huevo p={[0.28, 0, 0.12]} escala={0.6} />
                </group>
              ) : null}
              {i === 2 ? (
                <group position={[0, -0.05, 0.15]} rotation={[0.8, 0, 0]}>
                  <Arroz p={[-0.18, 0, 0]} escala={1.1} />
                  <Platano p={[0.22, 0.05, 0.1]} escala={0.6} giro={0.6} />
                </group>
              ) : null}
              {i === 3 ? (
                <group position={[0, 0, 0.12]}>
                  {[0, 1, 2].map((j) => (
                    <Mancuerna key={j} p={[-0.3 + j * 0.3, -0.3 + j * 0.18 + 0.12 * sube * j, 0]} escala={0.3 + j * 0.06} giro={0.0} color={j === 2 ? "#3a4a2a" : "#2a2f36"} />
                  ))}
                  <F2Flecha a={[0.38, -0.1, 0.1]} b={[0.38, 0.3, 0.1]} color={K.lima} r={0.025} op={sube} />
                </group>
              ) : null}
            </group>
          );
        })}
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={TARJETAS.map((tj) => ({ p: [tj.p[0], tj.p[1] + 0.38, 0.1] as V3, t: tj.t, a: tj.a + 0.04, z: 1.1, color: tj.c, tam: 26 }))}
      />
      <Dato b={b} a={0.02} z={1.1} t="La receta" sub="para recomponer al empezar" color={K.lima} y={250} tam={100} />
    </AbsoluteFill>
  );
};

// 10 · Aprovechalo: curva de progreso con los años ------------------------------------------------------
const Aprovecha: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const prog = entre(b, 0.06, 0.62);
  const zona = entre(b, 0.15, 0.3);
  const cam = camara(
    [
      { b: 0, p: [0.5, 0.2, 10.6], l: [0, -0.45, 0], fov: 38 },
      { b: 1, p: [-0.5, 0.1, 10.2], l: [0, -0.45, 0], fov: 38 },
    ],
    b,
  );
  const pP = puntoCurva(0.1);
  const pA = puntoCurva(0.85);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <CurvaProgreso prog={prog} zona={zona} />
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [pP[0] + 0.12, pP[1] - 0.05, 0], t: "principiante", a: 0.2, z: 1.1, color: K.lima, tam: 38, anton: true, ancla: "izq" },
          { p: [pA[0] + 0.3, pA[1] + 0.3, 0], t: "años después", a: 0.52, z: 1.1, color: K.suave, tam: 38, anton: true, ancla: "der" },
          { p: [1.6, -1.3, 0], t: "años de entreno", a: 0.08, z: 1.1, color: K.tinta, tam: 28, ancla: "der" },
          { p: [-1.75, 1.35, 0], t: "músculo ganado", a: 0.08, z: 1.1, color: K.tinta, tam: 28, ancla: "izq" },
        ]}
      />
      <Dato b={b} a={0.03} z={1.1} t="Aprovéchalo" sub={b < 0.5 ? "al inicio el efecto es más fuerte" : "con los años se vuelve más lento"} color={K.lima} y={250} tam={110} />
    </AbsoluteFill>
  );
};

const Final: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Cuánto llevas <span style={{ color: K.lima }}>entrenando</span>?</>}
    escribe="Llevo…"
    ideas={["ACABO DE EMPEZAR", "MENOS DE 1 AÑO", "MÁS DE 1 AÑO"]}
  />
);

const T = [
  "Empiezas en el gym y en unos meses bajas grasa y subes músculo al mismo tiempo. ¿Cómo es posible, si dicen que para crecer hay que comer de más?",
  "Se llama **recomposición corporal**: ganar músculo y perder grasa en la misma etapa. Y pasa sobre todo en **principiantes**.",
  "Tu músculo nunca había recibido ese estímulo: está muy **sensible**, y la síntesis de proteína se dispara con poco.",
  "Mientras tanto, tu grasa es una **reserva de energía**: si comes un poco menos de lo que gastas, de ahí sale el combustible extra.",
  "Un estudio lo mostró en solo cuatro semanas: con entrenamiento intenso, déficit y **2.4 gramos** de proteína por kilo, ganaron **1.2 kilos** de masa magra y perdieron casi **cinco** de grasa.",
  "Pero ojo con lo que Francis Holway llama la **paradoja del principiante**: tus mitocondrias todavía no están listas para quemar mucha grasa.",
  "Fabricar más mitocondrias toma unos **dos a tres meses** de entrenamiento constante. Mientras tanto, tu cuerpo depende sobre todo de la **glucosa**.",
  "Si al empezar quitas los carbohidratos de golpe, te quedas sin glucosa y sin una máquina de grasa lista: llega la fatiga, rindes mal, y muchos abandonan.",
  "Como dice Holway: no quites la leña antes de construir el **horno**.",
  "La receta: un déficit **moderado**, proteína alta, carbohidratos de calidad para entrenar, y fuerza que vaya subiendo poco a poco.",
  "Y aprovéchalo: este efecto es más fuerte al principio, y con los años de entrenamiento se vuelve más lento.",
  "¿Cuánto tiempo llevas entrenando? **Escríbelo en los comentarios**.",
];

const ESCENAS = [Gancho, Recomposicion, Sensible, Reserva, Estudio, Paradoja, Biogenesis, Abandono, HornoLena, Receta, Aprovecha, Final];

export const PRINCIPIANTE: ShortDef = {
  id: "Short-Principiante",
  titulo: "¿Por qué los principiantes ganan músculo y pierden grasa al mismo tiempo?",
  planos: ESCENAS.map((Escena, i) => ({ id: `principiante-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
