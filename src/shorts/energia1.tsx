// Short: ¿De dónde sacan energía tus músculos? Parte 1: los sistemas rápidos.
// Del atleta al interior de la fibra: el ATP solo dura 2-3 s; moneda ATP -> ADP;
// sistema de fosfagenos (PCr + ADP -> ATP, ~10 s) y glucolisis (glucosa -> 2 piruvato
// + 2 ATP, lactato y protones); linea de tiempo 0-10 s / 10 s-2 min.
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { Polvo, rnd } from "../fisio/modelos/comun";
import { Cadena, Esfera, Glucogeno, Mol, MoleculaATP, Vaso } from "../fisio/modelos/energia";
import { Creatina, MiniATP } from "../fisio/energia/e1";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaComentarios } from "./cierre";
import { ANTON, Chip, Dato, Destello, INTER, K, ShortDef, Titular } from "./marco";
import { Atleta, Golpe, InteriorFibra, Piso } from "./modelos";
import { camViaje, cortesViaje, Viaje } from "./viaje";
import {
  enPista,
  GLUCOSA_C,
  LACTATO_C,
  MotorAerobico,
  MotorFosfagenos,
  MotorGlucolisis,
  Pista,
  VERDE_PCR,
} from "./modelos-energia";

const PIRUVATO = K.naranja;
const FOSFATO = "#ff9a2e";

// 0 · Gancho: curl -> fibra; el ATP se gasta en 2-3 s; 3 sistemas ------------------
const M1: V3 = [-0.8, 0.5, 0];
const M2: V3 = [0.85, 0.5, 0];
const M3: V3 = [0, -1.25, 0];

const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const t = lineal(b, 0, 0.32);
  const dentro = t >= 1;
  const motores = b >= 0.68;
  const gasta = lineal(b, 0.4, 0.64);
  const cam = !dentro
    ? camViaje(t)
    : motores
      ? camara(
          [
            { b: 0.68, p: [0, 0.2, 13.0], l: [0, -0.9, 0], fov: 40 },
            { b: 1, p: [0.6, 0, 11.6], l: [0, -1.0, 0], fov: 40 },
          ],
          b,
        )
      : camara(
          [
            { b: 0.32, p: [0, 0.3, 10.5], l: [0, -0.9, 0], fov: 40 },
            { b: 0.68, p: [0.4, 0.3, 9.4], l: [0, -0.9, 0], fov: 40 },
          ],
          b,
        );
  const ap = entre(b, 0.7, 0.8);
  const c = (b * 3) % 1;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={dentro ? (motores ? [11, 22] : [10, 30]) : t > 0.72 ? [10, 34] : undefined}>
        {!dentro ? (
          <Viaje t={t} b={b} ej="curl" k={Math.sin(((b * 6) % 1) * Math.PI)} colorBrillo={K.amarillo} interior={{ pcr: 0, atp: 12, brillo: 0.3 }} />
        ) : motores ? (
          <>
            <group position={[0, 0, -6]}>
              <InteriorFibra b={b} pcr={0} brillo={0.05} />
            </group>
            <group scale={ap}>
              <group position={M1}>
                <MotorFosfagenos c={c} />
              </group>
              <group position={M2}>
                <MotorGlucolisis c={(c + 0.33) % 1} />
              </group>
              <group position={M3}>
                <MotorAerobico c={(c + 0.66) % 1} />
              </group>
            </group>
            <Polvo b={b} radio={5} />
          </>
        ) : (
          <>
            <InteriorFibra b={b} pcr={0} atp={12 * (1 - gasta)} brillo={0.5 * (1 - gasta)} />
            <Polvo b={b} radio={5} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[...cortesViaje(0, 0.32), 0.68]} />
      <Chip b={b} a={0.0} z={0.3} t="SISTEMAS DE ENERGÍA · PARTE 1" x={540} y={330} color={K.amarillo} />
      <Dato
        b={b}
        a={0.38}
        z={0.68}
        t="2–3 s"
        sub={gasta >= 1 ? "¡ATP agotado!" : "de ATP guardado"}
        color={gasta >= 1 ? K.rojo : K.naranja}
        y={270}
        tam={150}
      />
      {motores ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [M1[0] - 0.3, M1[1] + 0.3, 0], t: "1 · Fosfágenos", a: 0.74, z: 1, o: [-10, -170], color: VERDE_PCR },
            { p: [M2[0] + 0.1, M2[1] + 0.3, 0], t: "2 · Glucólisis", a: 0.79, z: 1, o: [10, -170], color: GLUCOSA_C },
            { p: [M3[0] + 0.5, M3[1] - 0.4, 0], t: "3 · Aeróbico", a: 0.84, z: 1, o: [60, 120], color: K.naranja },
          ]}
        />
      ) : null}
      <Titular b={b} a={0.72} z={1} y={250} tam={130} t={<><span style={{ color: K.lima }}>3</span> sistemas</>} />
    </AbsoluteFill>
  );
};

// 1 · Moneda ATP: suelta el 3.er fosfato -> energia -> la miosina tira; queda ADP -------
const ATP_P: V3 = [0.1, 0.35, 0];
const ATP_S = 0.62;
const GOLPE_P: V3 = [0.15, -1.45, 0];
const GOLPE_S = 0.4;

const Moneda: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const carga = entre(b, 0.25, 0.4);
  const suelta = entre(b, 0.4, 0.55) * 0.55;
  const vuela = entre(b, 0.45, 0.6);
  const golpe = entre(b, 0.58, 0.72);
  const cam = camara(
    [
      { b: 0, p: [0, -0.2, 7.2], l: [0, -0.2, 0], fov: 40 },
      { b: 0.35, p: [0.3, -0.3, 8.8], l: [0, -0.35, 0], fov: 40 },
      { b: 1, p: [-0.4, -0.4, 9.2], l: [0, -0.4, 0], fov: 40 },
    ],
    b,
  );
  const enlace: V3 = [ATP_P[0] + 1.0 * ATP_S, ATP_P[1] - 0.1 * ATP_S, 0.1];
  const cabeza: V3 = [GOLPE_P[0] - 0.1, GOLPE_P[1] - 0.05, 0.25];
  const orbe = mix3(enlace, cabeza, vuela);
  const pi: V3 = [ATP_P[0] + (1.25 + suelta * 1.2) * ATP_S, ATP_P[1] + (-0.1 + suelta * 0.5) * ATP_S, 0];
  const adp = b >= 0.55;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[7, 20]}>
        <group position={ATP_P} scale={ATP_S} rotation={[0, Math.sin(b * 3) * 0.15, 0]}>
          <MoleculaATP suelta={suelta} energia={carga * (1 - vuela)} />
        </group>
        {vuela > 0 && vuela < 1 ? <Mol p={orbe} color={K.amarillo} r={0.16} brillo={2} /> : null}
        <group position={GOLPE_P} scale={GOLPE_S} rotation={[0, 0.25, 0]}>
          <Golpe b={b} giro={mix(-0.6, 0.5, golpe)} desliza={golpe * 0.3} brillo={vuela >= 1 ? 1 - golpe * 0.6 : 0} />
        </group>
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Destello b={b} en={[0.45]} color={K.amarillo} />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [ATP_P[0] - 1.0 * ATP_S, ATP_P[1] + 0.3 * ATP_S, 0], t: adp ? "ADP" : "ATP", a: 0.04, z: 1, o: [-30, -120], color: "#4f8dff" },
          { p: [ATP_P[0] + 0.75 * ATP_S, ATP_P[1] - 0.15 * ATP_S, 0], t: "3 fosfatos", a: 0.22, z: 0.42, o: [40, 110], color: FOSFATO },
          { p: pi, t: "Fosfato libre", a: 0.5, z: 0.75, o: [-40, -110], color: FOSFATO },
          { p: [GOLPE_P[0] - 0.3, GOLPE_P[1] + 0.6, 0], t: "Miosina", a: 0.55, z: 1, o: [-70, 90], color: "#b48cff" },
          { p: [GOLPE_P[0] + 0.25, GOLPE_P[1] - 0.6, 0], t: "Actina", a: 0.6, z: 1, o: [70, 40], color: "#f2b83a" },
        ]}
      />
      <Dato b={b} a={0.02} z={0.55} t="ATP" sub="la moneda de energía" color={K.amarillo} y={270} tam={130} />
      <Dato b={b} a={0.58} z={1} t="¡Golpe!" sub="la energía mueve a la miosina" color={K.naranja} y={270} tam={110} />
      <Chip b={b} a={0.76} z={1} t="ADP → HAY QUE RECARGARLO" x={540} y={1100} color={K.cian} />
    </AbsoluteFill>
  );
};

// 2 · Sistema 1: fosfagenos. PCr + ADP -> Cr + ATP al instante ---------------------
const PCR_P: V3 = [-1.0, 0.4, 0];
const ADP_P: V3 = [0.55, 0.4, 0];

const Fosfagenos: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const salto = entre(b, 0.38, 0.6);
  const listo = salto >= 1;
  const brilla = entre(b, 0.6, 0.7);
  const cam = camara(
    [
      { b: 0, p: [0, 0.6, 11.5], l: [0, -0.1, 0], fov: 40 },
      { b: 0.3, p: [0, 0.5, 9.6], l: [0, -0.2, 0], fov: 40 },
      { b: 1, p: [0.5, 0.4, 9.0], l: [0, -0.2, 0], fov: 40 },
    ],
    b,
  );
  const fos: V3 = mix3([PCR_P[0] + 0.2 * 3.2, PCR_P[1] - 0.06 * 3.2, 0], [ADP_P[0] + 0.28 * 3.2, ADP_P[1], 0], salto);
  const arco = Math.sin(salto * Math.PI) * 0.7;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[6, 22]}>
        <group position={[0, 0, -4.5]}>
          <InteriorFibra b={b} pcr={22} carga={1} brillo={0.1} />
        </group>
        <Creatina p={PCR_P} fosfato={0} escala={3.2} />
        {!listo ? <Esfera p={[fos[0], fos[1] + arco, fos[2]]} r={0.21} color={FOSFATO} brillo={0.6 + salto} /> : null}
        <MiniATP p={ADP_P} n={listo ? 3 : 2} escala={3.2} brillo={0.3 + brilla * 0.9} />
        {listo ? (
          <mesh position={[ADP_P[0] + 0.4, ADP_P[1], 0]}>
            <sphereGeometry args={[0.6 + brilla * 0.3, 24, 16]} />
            <meshBasicMaterial color="#fff2a8" transparent opacity={0.22 * (1 - entre(b, 0.8, 1) * 0.6)} depthWrite={false} />
          </mesh>
        ) : null}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Destello b={b} en={[0.6]} color={K.amarillo} />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [PCR_P[0], PCR_P[1] + 0.3, 0], t: salto < 0.6 ? "Fosfocreatina (PCr)" : "Creatina", a: 0.15, z: 1, o: [-10, -130], color: VERDE_PCR },
          { p: [ADP_P[0] + 0.3, ADP_P[1] + 0.25, 0], t: listo ? "¡ATP!" : "ADP", a: 0.22, z: 1, o: [20, -130], color: K.naranja },
          { p: [PCR_P[0] + 0.64, PCR_P[1] - 0.2, 0], t: "Fosfato", a: 0.3, z: 0.42, o: [-40, 130], color: FOSFATO },
        ]}
      />
      <Dato b={b} a={0.02} z={1} t="1 · Fosfágenos" sub="fosfocreatina + ADP → ATP" color={VERDE_PCR} y={260} tam={104} />
      <Chip b={b} a={0.64} z={1} t="⚡ AL INSTANTE" x={300} y={1100} color={K.amarillo} />
      <Chip b={b} a={0.82} z={1} t="SIN OXÍGENO" x={790} y={1100} color={K.cian} />
    </AbsoluteFill>
  );
};

// 3 · Sprint / salto: la PCr se agota en ~10 s ------------------------------------
const Agota: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuera = b < 0.42;
  const gasto = lineal(b, 0.04, 0.82);
  const seg = Math.min(10, Math.floor(gasto * 10.4));
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [4.4, 1.3, 5.2], l: [0, 0.65, 0], fov: 36 },
          { b: 0.42, p: [3.0, 1.1, 5.4], l: [0, 0.65, 0], fov: 36 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.42, p: [0, 0.4, 11.0], l: [0, -0.9, 0], fov: 40 },
          { b: 1, p: [0.5, 0.3, 9.6], l: [0, -0.9, 0], fov: 40 },
        ],
        b,
      );
  const vacio = seg >= 10;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={fuera ? undefined : [6, 22]}>
        {fuera ? (
          <>
            <Atleta ej="sprint" fase={b * 30} brilla={0.7} colorBrillo={VERDE_PCR} />
            <Piso color={VERDE_PCR} />
          </>
        ) : (
          <InteriorFibra b={b} pcr={24} carga={1 - gasto} brillo={0.35 * (1 - gasto)} />
        )}
      </Escena3D>
      <Destello b={b} en={[0.42]} />
      <Dato
        b={b}
        a={0.03}
        z={0.86}
        t={`${seg} s`}
        sub={`reserva de PCr: ${Math.round((1 - gasto) * 100)} %`}
        color={vacio ? K.rojo : VERDE_PCR}
        y={260}
        tam={150}
      />
      <Dato b={b} a={0.86} z={1} t="~10 s" sub="máxima potencia" color={K.lima} y={260} tam={150} />
      <Chip b={b} a={0.52} z={1} t="SPRINT · SALTO · SERIE PESADA" x={540} y={1100} color={VERDE_PCR} />
      {!fuera ? (
        <Etiquetas cam={cam} b={b} items={[{ p: [0.9, 1.4, 0.6], t: vacio ? "Creatina sin fosfato" : "Fosfocreatina", a: 0.45, z: 1, o: [60, -90], color: VERDE_PCR }]} />
      ) : null}
    </AbsoluteFill>
  );
};

// 4 · Sistema 2: glucolisis. Glucosa de la sangre y del glucogeno al citoplasma ------
const VASO_X = -0.95;
const GLUCO_P: V3 = [0.7, -0.75, 0.2];
const CENTRO: V3 = [-0.05, 0.05, 0.4];

const Glucolisis: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.2, 9.0], l: [0, -0.5, 0], fov: 40 },
      { b: 1, p: [0.6, 0.0, 7.6], l: [0, -0.55, 0], fov: 40 },
    ],
    b,
  );
  const deSangre = visible(b, 0.2, 1.2, 0.08);
  const deGluco = visible(b, 0.44, 1.2, 0.08);
  const rompe = entre(b, 0.62, 0.72);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[7, 24]}>
        <group position={[0, 0, -4]}>
          <InteriorFibra b={b} pcr={0} brillo={0.1} />
        </group>
        <Vaso desde={[VASO_X, 3.2, -0.3]} hasta={[VASO_X, -3.4, -0.3]} t={b * 1.3} radio={0.38} />
        <Glucogeno p={GLUCO_P} escala={2.4} />
        {Array.from({ length: 4 }).map((_, i) => {
          const f = (b * 1.6 + i / 4) % 1;
          const ini: V3 = [VASO_X, 1.2 - i * 0.9, -0.2];
          const p = mix3(ini, [CENTRO[0] - 0.2, CENTRO[1] + 0.5 - i * 0.3, CENTRO[2]], f);
          return <Cadena key={`s${i}`} n={6} anillo p={p} color={GLUCOSA_C} sep={0.13} brillo={0.5} op={deSangre * Math.min(1, (1 - f) * 4)} />;
        })}
        {Array.from({ length: 4 }).map((_, i) => {
          const f = (b * 1.4 + i / 4) % 1;
          const ini: V3 = [GLUCO_P[0] + (rnd(`gq${i}`) - 0.5) * 0.6, GLUCO_P[1] + (rnd(`gw${i}`) - 0.5) * 0.6, GLUCO_P[2] + 0.3];
          const p = mix3(ini, [CENTRO[0] + 0.15, CENTRO[1] - 0.3 + i * 0.2, CENTRO[2]], f);
          return <Cadena key={`g${i}`} n={6} anillo p={p} color={GLUCOSA_C} sep={0.13} brillo={0.5} op={deGluco * Math.min(1, (1 - f) * 4)} />;
        })}
        {rompe > 0 ? <Mol p={CENTRO} color={K.amarillo} r={0.25 + 0.2 * Math.sin(b * 20) ** 2} op={0.6 * rompe} brillo={1.2} /> : null}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [VASO_X, 1.4, -0.3], t: "Sangre: glucosa de la comida", a: 0.22, z: 1, o: [30, -110], color: K.rojo },
          { p: [GLUCO_P[0] + 0.2, GLUCO_P[1] - 0.4, GLUCO_P[2]], t: "Glucógeno", a: 0.45, z: 1, o: [-30, 130], color: "#a58cff" },
          { p: CENTRO, t: "Citoplasma", a: 0.62, z: 1, o: [-60, 90], color: GLUCOSA_C },
        ]}
      />
      <Dato b={b} a={0.02} z={1} t="2 · Glucólisis" sub="romper glucosa" color={GLUCOSA_C} y={260} tam={104} />
      <Chip b={b} a={0.8} z={1} t="SIN OXÍGENO" x={540} y={1100} color={K.cian} />
    </AbsoluteFill>
  );
};

// 5 · Glucosa (6 C) -> 2 piruvatos (3 C) + 2 ATP netos --------------------------------
const Rompe: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const parte = entre(b, 0.18, 0.38);
  const atp1 = entre(b, 0.48, 0.56);
  const atp2 = entre(b, 0.58, 0.66);
  const n = (atp1 > 0.5 ? 1 : 0) + (atp2 > 0.5 ? 1 : 0);
  const cam = camara(
    [
      { b: 0, p: [0, 0.1, 6.6], l: [0, -0.05, 0], fov: 40 },
      { b: 1, p: [0.5, 0.0, 7.8], l: [0, -0.1, 0], fov: 40 },
    ],
    b,
  );
  const c: V3 = [0, 0.0, 0];
  const piruA = mix3([-0.3, 0.1, 0], [-1.0, 0.45, 0], parte);
  const piruB = mix3([-0.3, -0.1, 0], [0.3, -0.75, 0], parte);
  const pA: V3 = [-0.6, -0.85, 0.4];
  const pB: V3 = [0.3, 0.85, 0.4];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[5, 16]}>
        <group position={[0, 0, -5]}>
          <InteriorFibra b={b} pcr={0} brillo={0.05} />
        </group>
        <group rotation={[0, Math.sin(b * 2.4) * 0.25, 0]}>
          {parte < 0.05 ? (
            <Cadena n={6} anillo p={c} color={GLUCOSA_C} sep={0.38} brillo={0.4 + Math.sin(b * 40) ** 2 * 0.3 * entre(b, 0.1, 0.18)} />
          ) : (
            <>
              <Cadena n={3} p={piruA} color={PIRUVATO} sep={0.34} brillo={0.4} />
              <Cadena n={3} p={piruB} color={PIRUVATO} sep={0.34} brillo={0.4} />
            </>
          )}
          {atp1 > 0 ? <MiniATP p={mix3(c, pA, atp1)} escala={2.2 * atp1} brillo={0.9} /> : null}
          {atp2 > 0 ? <MiniATP p={mix3(c, pB, atp2)} escala={2.2 * atp2} brillo={0.9} /> : null}
        </group>
        <Polvo b={b} radio={3} />
      </Escena3D>
      <Destello b={b} en={[0.2]} color={K.amarillo} />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [c[0], c[1] + 0.45, 0], t: "Glucosa (6 C)", a: 0.02, z: 0.2, o: [40, -130], color: GLUCOSA_C },
          { p: [piruA[0] + 0.3, piruA[1] + 0.1, 0], t: "Piruvato (3 C)", a: 0.3, z: 1, o: [20, -120], color: PIRUVATO },
          { p: [piruB[0] + 0.5, piruB[1] - 0.1, 0], t: "Piruvato (3 C)", a: 0.34, z: 1, o: [40, 110], color: PIRUVATO },
        ]}
      />
      <Dato b={b} a={0.02} z={0.45} t="1 glucosa → 2 piruvatos" color={GLUCOSA_C} y={270} tam={84} />
      <Dato b={b} a={0.46} z={1} t={`+${n} ATP`} sub="netos por glucosa" color={K.naranja} y={260} tam={150} />
      <Chip b={b} a={0.74} z={1} t="RÁPIDA, PERO RINDE POCO" x={540} y={1100} color={K.amarillo} />
    </AbsoluteFill>
  );
};

// 6 · Esfuerzo intenso: piruvato -> lactato y se acumulan protones (ardor) -----------
const CENTROS: V3[] = [
  [-1.1, 0.2, 2.2],
  [0.5, -0.5, 2.0],
  [-0.5, -1.6, 2.3],
];

const Ardor: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const lact = entre(b, 0.25, 0.45);
  const acum = entre(b, 0.45, 0.85);
  const cam = camara(
    [
      { b: 0, p: [0, 0.4, 10.4], l: [0, -0.8, 0], fov: 40 },
      { b: 1, p: [-0.5, 0.3, 9.0], l: [0, -0.8, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 26]}>
        <InteriorFibra b={b} pcr={0} atp={4} hplus={8 + 46 * acum} brillo={0.15 + acum * 0.7} />
        {CENTROS.map((c, i) => (
          <group key={i}>
            <Cadena n={3} p={c} color={lact > 0.5 ? LACTATO_C : PIRUVATO} sep={0.26} brillo={0.5 + lact * 0.4} />
            {acum > 0
              ? [0, 1].map((j) => {
                  const d: V3 = [c[0] + (rnd(`ah${i}${j}`) - 0.3) * 1.4, c[1] + (rnd(`av${i}${j}`) - 0.5) * 1.2, c[2] - 0.6];
                  return <Mol key={j} p={mix3([c[0] + 0.26, c[1], c[2]], d, entre(b, 0.45 + i * 0.05, 0.65 + i * 0.05))} color={K.rojo} r={0.1} />;
                })
              : null}
          </group>
        ))}
      </Escena3D>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(255,40,40,${0.08 * acum}) 20%, rgba(255,40,40,${0.42 * acum}) 100%)` }} />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [CENTROS[0][0] + 0.26, CENTROS[0][1] + 0.1, CENTROS[0][2]], t: lact < 0.5 ? "Piruvato" : "Lactato", a: 0.06, z: 1, o: [-30, -120], color: lact < 0.5 ? PIRUVATO : LACTATO_C },
          { p: [0.3, -2.2, 1.2], t: "H⁺ (protones)", a: 0.55, z: 1, o: [60, 70], color: K.rojo },
        ]}
      />
      <Dato b={b} a={0.02} z={0.5} t="Esfuerzo muy intenso" color={K.naranja} y={270} tam={84} />
      <Dato
        b={b}
        a={0.5}
        z={1}
        t={<><span style={{ color: LACTATO_C }}>Lactato</span> + <span style={{ color: K.rojo }}>H⁺</span></>}
        sub="se acumulan protones"
        color={K.rojo}
        y={260}
        tam={110}
      />
      <Chip b={b} a={0.74} z={1} t="🔥 ARDOR (PROTONES)" x={540} y={1100} color={K.rojo} />
    </AbsoluteFill>
  );
};

// 7 · Linea de tiempo: 0-10 s fosfagenos, 10 s-2 min glucolisis; 400 m ---------------
const RX = 1.35;
const RZ = 2.9;
const R_CARRIL = 0.2;
const posTiempo = (s: number) => (s <= 10 ? (s / 10) * 0.28 : 0.28 + 0.72 * Math.min(1, (s - 10) / 110));

const Linea: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const corre = lineal(b, 0.04, 1);
  const s = corre * 55;
  const { p, rot } = enPista(corre, RX + R_CARRIL, RZ + R_CARRIL);
  const cam = camara(
    [
      { b: 0, p: [3.0, 12.4, 12.6], l: [0, -1.9, 0], fov: 40 },
      { b: 1, p: [-2.8, 12.0, 12.8], l: [0, -1.9, 0], fov: 40 },
    ],
    b,
  );
  const op = visible(b, 0.06, 1.2, 0.08);
  const enGlu = s > 10;
  const mm = Math.floor(s / 60);
  const ss = String(Math.floor(s % 60)).padStart(2, "0");
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Pista rx={RX} rz={RZ} ancho={0.7} />
        <group position={p} rotation={[0, rot, 0]} scale={0.62}>
          <Atleta ej="sprint" fase={b * 60} brilla={0.8} colorBrillo={enGlu ? GLUCOSA_C : VERDE_PCR} />
        </group>
      </Escena3D>
      <Dato b={b} a={0.1} z={1} t="10 s – 2 min" sub="domina la glucólisis" color={GLUCOSA_C} y={250} tam={120} />
      <Chip b={b} a={0.6} z={1} t={`🏃 400 m · ${mm}:${ss}`} x={540} y={520} color={K.tinta} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 975, opacity: op }}>
        <div style={{ display: "flex", fontFamily: INTER, fontWeight: 900, fontSize: 30, color: K.tinta, marginBottom: 10 }}>
          <div style={{ width: "28%", color: VERDE_PCR }}>1 · FOSFÁGENOS</div>
          <div style={{ width: "72%", textAlign: "center", color: GLUCOSA_C }}>2 · GLUCÓLISIS</div>
        </div>
        <div style={{ position: "relative", height: 44, borderRadius: 22, overflow: "hidden", display: "flex", border: "3px solid rgba(255,255,255,0.35)" }}>
          <div style={{ width: "28%", background: VERDE_PCR, opacity: enGlu ? 0.45 : 1 }} />
          <div style={{ width: "72%", background: GLUCOSA_C, opacity: enGlu ? 1 : 0.45 }} />
        </div>
        <div style={{ position: "relative", height: 50, fontFamily: ANTON, fontSize: 34, color: K.tinta }}>
          <span style={{ position: "absolute", left: 0, top: 6 }}>0</span>
          <span style={{ position: "absolute", left: "28%", top: 6, transform: "translateX(-50%)" }}>10 s</span>
          <span style={{ position: "absolute", right: 0, top: 6 }}>2 min</span>
        </div>
        <div
          style={{
            position: "absolute",
            top: 36,
            left: `${posTiempo(s) * 100}%`,
            width: 14,
            height: 64,
            marginLeft: -7,
            borderRadius: 7,
            background: K.tinta,
            boxShadow: "0 0 20px rgba(255,255,255,0.9)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const Final: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Qué <span style={{ color: K.lima }}>sistema</span> usas más?</>}
    escribe="Yo uso más…"
    ideas={["FOSFÁGENOS", "GLUCÓLISIS", "AERÓBICO"]}
  />
);

const T = [
  "Ya viste que tu músculo se contrae gracias al ATP. Pero solo guarda ATP para unos **dos o tres segundos**. ¿De dónde saca más? Tiene **tres sistemas** para fabricarlo.",
  "El ATP es la moneda de energía: al soltar uno de sus **fosfatos**, libera la energía que mueve a la miosina. Queda ADP, y hay que volver a cargarlo.",
  "Sistema uno: los **fosfágenos**. La fosfocreatina le regala su fosfato al ADP y forma ATP **al instante**, sin oxígeno.",
  "Es el más rápido y potente, pero se agota en unos **diez segundos**. Es el sistema de un sprint, un salto o una serie muy pesada.",
  "Sistema dos: la **glucólisis**. La glucosa, que viene de tu comida o del glucógeno del músculo, se rompe en el citoplasma sin necesitar oxígeno.",
  "Cada glucosa se parte en dos **piruvatos** y deja **dos ATP** netos. Es rápida, pero rinde poco.",
  "Si el esfuerzo es muy intenso, el piruvato se convierte en **lactato** y se acumulan protones: eso es el ardor del que te hablé.",
  "La glucólisis domina en esfuerzos de unos **diez segundos a dos minutos**, como correr cuatrocientos metros.",
  "En la **parte dos**: el sistema más grande de todos, el que usa oxígeno y quema grasa. ¿Cuál de estos sistemas usas más cuando entrenas? **Escríbelo en los comentarios**.",
];

const ESCENAS = [Gancho, Moneda, Fosfagenos, Agota, Glucolisis, Rompe, Ardor, Linea, Final];

export const ENERGIA1: ShortDef = {
  id: "Short-Energia1",
  titulo: "¿De dónde sacan energía tus músculos? Parte 1: los sistemas rápidos",
  planos: ESCENAS.map((Escena, i) => ({ id: `energia1-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
