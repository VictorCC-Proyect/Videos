// Short: ¿Por qué dan calambres? Teoría neuromuscular (husos vs Golgi) frente al mito del potasio.
// Fuentes: Miller et al. 2022 (J Athl Train), Schwellnus et al. 2011 (Ironman), Costa et al. 2026 (Muscle Nerve, metaanálisis).
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, Cam, entre, mix, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { Polvo, rnd } from "../fisio/modelos/comun";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaComentarios } from "./cierre";
import { Chip, Dato, Destello, INTER, K, pop, ShortDef, Titular } from "./marco";
import { Atleta } from "./modelos";
import { Columna } from "./modelos-energia";
import { IonColor } from "./modelos-contraccion";
import { F2Flecha, F2Tacha } from "./modelos-fibras";
import { Botella, Camino, Reloj } from "./modelos-fatiga";
import {
  AtletaSentado,
  CADERA_Y,
  CIR,
  Circuito,
  emisiones,
  Escalera,
  gemelo,
  GEMELO_SENTADO,
  GOLGI_C,
  GOTAS_SUDOR,
  Gota,
  HUSO_C,
  llegada,
  Luna,
  PIE_SENTADO,
  Pierna,
  Platano,
  Sal,
  Sol,
  Velocimetro,
} from "./modelos-calambres";

const NA_C = "#f6f8ff";
const K_C = "#b07bff";

/** Barra horizontal de nivel (fatiga, cansancio...). */
const Medidor: React.FC<{ b: number; a: number; z: number; valor: number; titulo: string; y: number; color?: string }> = ({ b, a, z, valor, titulo, y, color = K.naranja }) => {
  const op = visible(b, a, z, 0.08);
  if (op <= 0) return null;
  const ancho = 720;
  return (
    <div style={{ position: "absolute", top: y, left: (1080 - ancho) / 2, width: ancho, opacity: op, transform: `scale(${pop(b, a)})` }}>
      <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 44, color: K.tinta, textAlign: "center", marginBottom: 12, textShadow: "0 4px 16px #000" }}>
        {titulo} <span style={{ color }}>{Math.round(valor * 100)}%</span>
      </div>
      <div style={{ position: "relative", height: 56, borderRadius: 999, background: "rgba(4,14,17,0.85)", border: "4px solid rgba(255,255,255,0.35)", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${Math.max(0, Math.min(1, valor)) * 100}%`,
            background: `linear-gradient(90deg, ${K.amarillo}, ${color})`,
            boxShadow: `0 0 30px ${color}`,
          }}
        />
      </div>
    </div>
  );
};

/** Posicion de mundo de un punto local de la Pierna (grupo en pos, escala s). */
const enPierna = (pos: V3, s: number, q: V3): V3 => [pos[0] + q[0] * s, pos[1] + q[1] * s, pos[2] + q[2] * s];

const camSentado = (b: number, a: number, z: number): Cam =>
  camara(
    [
      { b: a, p: [4.6, 1.9, 4.0], l: [0.1, 0.12, 0.42], fov: 36 },
      { b: z, p: [4.1, 1.7, 3.6], l: [0.1, 0.12, 0.42], fov: 36 },
    ],
    b,
  );

// 0 · Gancho: corre, se detiene y se agarra la pantorrilla ------------------------------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const corre = b < 0.4;
  const d = Math.max(0, Math.min(b, 0.4) - 0.22);
  const fase = 34 * (Math.min(b, 0.22) + d - (d * d) / (2 * 0.18));
  const cam = corre
    ? camara(
        [
          { b: 0, p: [0.9, 1.3, 6.6], l: [0.1, 0.78, 0], fov: 36 },
          { b: 0.4, p: [0.7, 1.2, 5.9], l: [0.1, 0.74, 0], fov: 36 },
        ],
        b,
      )
    : camSentado(b, 0.4, 1);
  const tiembla = Math.sin(b * 140) * 0.006;
  const PL: V3 = [-0.25, 0.85, 0.6];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {corre ? (
          <>
            <group rotation={[0, Math.PI / 2, 0]}>
              <Camino avance={-fase * 0.55} />
            </group>
            <group rotation={[0, Math.PI / 2, 0]}>
              <Atleta ej="sprint" fase={fase} brilla={entre(b, 0.25, 0.4) * 0.5} colorBrillo={K.rojo} />
            </group>
          </>
        ) : (
          <>
            <group rotation={[0, 0, 0]}>
              <Camino avance={0} ancho={2.2} />
            </group>
            <AtletaSentado
              inclina={0.55}
              manos={[
                [0.21, CADERA_Y + 0.08 + tiembla, 0.66],
                [0.05, CADERA_Y + 0.09 - tiembla, 0.55],
              ]}
              gemelo={0.6 + 0.4 * Math.sin(b * 40) ** 2}
            />
            {b > 0.64 ? (
              <group position={PL} scale={0.38 * Math.max(0, pop(b, 0.64))}>
                <Platano p={[0, 0, 0]} rot={[0, 0.9, 0.15]} />
              </group>
            ) : null}
            {b > 0.86 ? <F2Tacha p={[PL[0] + 0.05, PL[1], PL[2] + 0.1]} tam={0.32 * Math.max(0, pop(b, 0.86))} /> : null}
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.4]} color={K.rojo} />
      {!corre ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: GEMELO_SENTADO, t: "Pantorrilla", a: 0.44, z: 0.64, o: [60, 120], color: K.rojo },
            { p: [PL[0], PL[1] + 0.08, PL[2]], t: "Potasio", a: 0.68, z: 1.1, o: [40, -120], color: K.amarillo },
          ]}
        />
      ) : null}
      <Chip b={b} a={0.02} z={0.4} t="GANÓ EN LA ENCUESTA" x={540} y={320} color={K.lima} />
      <Titular b={b} a={0.42} z={1.1} y={280} tam={150} t="¿Calambres?" color={K.tinta} />
      <Chip b={b} a={0.88} z={1.1} t="CASI NUNCA ES ESO" x={540} y={1100} color={K.rojo} />
    </AbsoluteFill>
  );
};

// 1 · Contraccion involuntaria que no se suelta ----------------------------------------
const PIERNA_P: V3 = [0, 1.05, 0];
const PIERNA_S = 1.2;
const camPierna = (b: number, a: number, z: number): Cam =>
  camara(
    [
      { b: a, p: [7.0, 0.85, 1.2], l: [0, 0.48, 0.05], fov: 36 },
      { b: z, p: [6.8, 0.7, -0.4], l: [0, 0.48, 0.05], fov: 36 },
    ],
    b,
  );

const Calambre: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuera = b < 0.2;
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [4.1, 1.7, 3.6], l: [0.1, 0.12, 0.42], fov: 36 },
          { b: 0.2, p: [0.6, 0.24, 1.4], l: [0.13, 0.08, 0.62], fov: 36 },
        ],
        b,
      )
    : camPierna(b, 0.2, 1);
  const c = entre(b, 0.28, 0.32);
  const brilla = c * (0.6 + 0.4 * Math.sin(b * 34) ** 2);
  const vib = c * Math.sin(b * 300) * 0.008;
  const g = gemelo(0.55 * c);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {fuera ? (
          <AtletaSentado inclina={0.55} manos={[[0.21, CADERA_Y + 0.08, 0.66], [0.05, CADERA_Y + 0.09, 0.55]]} gemelo={0.8} />
        ) : (
          <>
            <group position={PIERNA_P} scale={PIERNA_S}>
              <Pierna punta={0.55 * c} contrae={c} brilla={brilla} vib={vib} />
            </group>
            <Polvo b={b} radio={4} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.2]} />
      {!fuera ? (
        <Etiquetas cam={cam} b={b} items={[{ p: enPierna(PIERNA_P, PIERNA_S, g.centro), t: "Gemelos", a: 0.22, z: 1.1, o: [-80, -150], color: K.rojo }]} />
      ) : null}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(255,40,40,${0.3 * brilla}) 100%)` }} />
      <Chip b={b} a={0.3} z={1.1} t="INVOLUNTARIA" x={290} y={1100} color={K.amarillo} />
      <Chip b={b} a={0.5} z={1.1} t="DOLOROSA" x={790} y={1100} color={K.rojo} />
      <Dato b={b} a={0.74} z={1.1} t="NO SE SUELTA" sub="el músculo se queda trabado" color={K.rojo} y={260} tam={104} />
    </AbsoluteFill>
  );
};

// Camara comun del circuito medula -> musculo.
const CAM_CIR: Cam = { p: [0.35, -0.25, 14.8], l: [0.35, -0.7, 0], fov: 40 };

// 2 · La neurona motora dispara sin parar ----------------------------------------------
const EM2 = emisiones((x) => (x < 0.12 ? 0 : x < 0.6 ? 5 : mix(5, 75, entre(x, 0.6, 0.88))));
const DUR = 0.12;

const Neurona: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.3, 0.1, 13], l: [0.1, -0.45, 0], fov: 40 },
      { b: 0.45, p: [0.4, -0.2, 14.4], l: [0.25, -0.65, 0], fov: 40 },
      { b: 1, p: CAM_CIR.p, l: CAM_CIR.l, fov: 40 },
    ],
    b,
  );
  const act = Math.max(llegada(b, EM2, DUR, 0.07), entre(b, 0.7, 0.82));
  const hz = Math.round(mix(8, 60, entre(b, 0.6, 0.88)) + (b > 0.62 ? Math.sin(b * 90) * 2 : 0));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[9, 28]}>
        <Circuito b={b} act={act} motorEm={EM2} sensores={0} dur={DUR} />
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [1.6, 1.75, 0.3], t: "Médula espinal", a: 0.04, z: 1.1, o: [-40, -120], color: K.amarillo },
          { p: CIR.S, t: "Neurona motora", a: 0.26, z: 1.1, o: [-60, 130], color: K.amarillo },
          { p: [-0.74, -0.4, 0.13], t: "Músculo", a: 0.4, z: 1.1, o: [-50, 40], color: K.rojo },
        ]}
      />
      <Dato
        b={b}
        a={0.4}
        z={1.1}
        t={<>{hz} <span style={{ fontSize: 60 }}>disparos/s</span></>}
        sub={b < 0.62 ? "señal normal" : "calambre: ráfaga continua"}
        color={b < 0.62 ? K.amarillo : K.rojo}
        y={250}
        tam={110}
      />
      <Chip b={b} a={0.84} z={1.1} t="SIN PARAR" x={540} y={1100} color={K.rojo} />
    </AbsoluteFill>
  );
};

// 3 · Dos sensores: husos (activan) y Golgi (frenan) -----------------------------------
const EM3_M = emisiones((x) => (x < 0.05 ? 0 : 7));
const EM3_H = emisiones((x) => (x < 0.42 ? 0 : 11));
const EM3_G = emisiones((x) => (x < 0.7 ? 0 : 11));

const Sensores: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: CAM_CIR.p, l: CAM_CIR.l, fov: 40 },
      { b: 0.5, p: [-0.2, -0.25, 14.4], l: [0.25, -0.7, 0], fov: 40 },
      { b: 1, p: [0.9, -0.25, 14.6], l: [0.35, -0.7, 0], fov: 40 },
    ],
    b,
  );
  const sens = entre(b, 0.12, 0.3);
  const hA = entre(b, 0.38, 0.45) * (0.6 + 0.4 * Math.sin(b * 30) ** 2);
  const gA = entre(b, 0.66, 0.72) * (0.6 + 0.4 * Math.sin(b * 30) ** 2);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[9, 28]}>
        <Circuito b={b} act={llegada(b, EM3_M, DUR, 0.06) * 0.7} motorEm={EM3_M} husoEm={EM3_H} golgiEm={EM3_G} husoAct={hA} golgiAct={gA} interAct={gA} sensores={sens} dur={DUR} />
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [CIR.huso[0] - 0.1, CIR.huso[1] + 0.1, CIR.huso[2]], t: "Huso muscular · ACTIVA (+)", a: 0.38, z: 1.1, o: [40, -230], color: HUSO_C },
          { p: [CIR.golgi[0] - 0.1, CIR.golgi[1], CIR.golgi[2]], t: "Órgano de Golgi · FRENA (−)", a: 0.66, z: 1.1, o: [50, 50], color: GOLGI_C },
        ]}
      />
      <Dato b={b} a={0.12} z={1.1} t="2 SENSORES" sub="dentro del músculo y del tendón" color={K.cian} y={260} tam={104} />
    </AbsoluteFill>
  );
};

// 4 · Fatiga: husos suben, Golgi baja, la neurona dispara de mas ----------------------
const fat4 = (x: number) => entre(x, 0.05, 0.62);
const EM4_H = emisiones((x) => mix(6, 32, entre(x, 0.22, 0.42)));
const EM4_G = emisiones((x) => mix(14, 2, entre(x, 0.4, 0.6)));
const EM4_M = emisiones((x) => mix(7, 55, entre(x, 0.66, 0.92)));

const Fatiga: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.3, -0.3, 16.2], l: [0.3, -0.75, 0], fov: 40 },
      { b: 1, p: [0.8, -0.3, 15.8], l: [0.3, -0.75, 0], fov: 40 },
    ],
    b,
  );
  const hN = mix(0.35, 0.95, entre(b, 0.22, 0.42));
  const gN = mix(0.85, 0.2, entre(b, 0.4, 0.6));
  const act = Math.max(llegada(b, EM4_M, DUR, 0.06) * 0.7, entre(b, 0.75, 0.9));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[10, 30]}>
        <Circuito b={b} act={act} motorEm={EM4_M} husoEm={EM4_H} golgiEm={EM4_G} husoAct={hN} golgiAct={gN * 0.8} interAct={gN * 0.8} dur={DUR} />
        <Columna p={[-1.6, -1.95, 0]} nivel={hN} color={HUSO_C} alto={1.4} r={0.2} />
        <Columna p={[2.3, -1.95, 0]} nivel={gN} color={GOLGI_C} alto={1.4} r={0.2} />
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-1.6, -1.95 + 0.1 + 1.4 * hN, 0], t: "Huso ↑", a: 0.24, z: 1.1, o: [20, -90], color: HUSO_C },
          { p: [2.3, -1.95 + 0.1 + 1.4 * gN, 0], t: "Golgi ↓", a: 0.42, z: 1.1, o: [-20, -90], color: GOLGI_C },
        ]}
      />
      <Medidor b={b} a={0.02} z={0.64} valor={mix(0.1, 0.95, fat4(b))} titulo="FATIGA" y={260} color={K.naranja} />
      <Dato b={b} a={0.64} z={1.1} t="SE ROMPE EL EQUILIBRIO" sub="más “acelera”, menos “frena”" color={K.rojo} y={260} tam={80} />
      <Chip b={b} a={0.86} z={1.1} t="DISPARA DE MÁS" x={540} y={1100} color={K.rojo} />
    </AbsoluteFill>
  );
};

// 5 · Al final del esfuerzo, con el musculo acortado -----------------------------------
const Acortado: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camPierna(b, 0, 1);
  const punta = entre(b, 0.58, 0.86);
  const g = gemelo(punta);
  const brilla = entre(b, 0.86, 0.95) * (0.5 + 0.5 * Math.sin(b * 34) ** 2);
  const W = (q: V3) => enPierna(PIERNA_P, PIERNA_S, q);
  const lado: V3 = [0, 0, -0.3];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={PIERNA_P} scale={PIERNA_S}>
          <Pierna punta={punta} contrae={punta * 0.5} brilla={Math.max(brilla, 0.15 * entre(b, 0.1, 0.5))} colorBrillo={K.naranja} vib={brilla * Math.sin(b * 300) * 0.006} />
        </group>
        {b > 0.6 ? <F2Flecha a={W(add3(g.O, lado))} b={W(add3(g.J, lado))} color={K.amarillo} r={0.03} doble /> : null}
        {b > 0.12 ? (
          <group position={[0.2, 1.3, -0.9]} rotation={[0, Math.PI / 2, 0]} scale={0.32 * Math.max(0, pop(b, 0.12))}>
            <Reloj t={b * 2} color={K.naranja} />
          </group>
        ) : null}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: W(add3(g.centro, [0, 0, -0.08])), t: "Gemelo acortado", a: 0.66, z: 1.1, o: [-60, 170], color: K.amarillo },
          { p: W([0, -1.12, 0.3]), t: "Pie en punta", a: 0.84, z: 1.1, o: [-60, -40], color: K.cian },
        ]}
      />
      <Medidor b={b} a={0.02} z={0.6} valor={mix(0.35, 0.95, entre(b, 0.1, 0.55))} titulo="CANSANCIO" y={260} color={K.rojo} />
      <Dato b={b} a={0.62} z={1.1} t="ACORTADO" sub="+ cansado = más riesgo" color={K.amarillo} y={260} tam={120} />
      <Chip b={b} a={0.2} z={1.1} t="FINAL DEL ESFUERZO" x={540} y={1100} color={K.naranja} />
    </AbsoluteFill>
  );
};

const add3 = (a: V3, c: V3): V3 => [a[0] + c[0], a[1] + c[1], a[2] + c[2]];

// 6 · Ironman: misma hidratacion y sodio; mas rapido y con antecedentes -----------------
const CARRILES = [-0.82, 0, 0.82];
const RAPIDO = 2;

const Ironman: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [2.4, 2.1, 9.4], l: [0, 1.05, 0], fov: 36 },
      { b: 1, p: [1.5, 2.0, 9.0], l: [0.1, 1.1, 0.3], fov: 36 },
    ],
    b,
  );
  const sale = entre(b, 0.68, 0.82);
  const avance = b * 26;
  const gota = entre(b, 0.28, 0.36);
  const sal = entre(b, 0.5, 0.58);
  const zR = mix(0, 0.9, sale);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Camino avance={-avance} ancho={2.8} largo={18} />
        {CARRILES.map((x, i) => {
          const z = i === RAPIDO ? zR : 0;
          const vel = i === RAPIDO ? 1 + 0.5 * sale : 1;
          return (
            <group key={i} position={[x, 0, z]}>
              <Atleta ej="sprint" fase={b * 30 * vel + i * 1.7} brilla={i === RAPIDO ? 0.45 * entre(b, 0.25, 0.32) : 0} colorBrillo={K.rojo} />
              {gota > 0 ? <Gota p={[-0.14, 2.02, 0]} r={0.075 * pop(b, 0.28)} /> : null}
              {sal > 0 ? <Sal p={[0.14, 2.0, 0]} r={0.065 * pop(b, 0.5)} giro={b * 3} /> : null}
            </group>
          );
        })}
        {b > 0.7 ? (
          <group position={[CARRILES[RAPIDO], 2.32, zR]} scale={0.36 * Math.max(0, pop(b, 0.7))} rotation={[0, 0.2, 0]}>
            <Velocimetro v={mix(0.45, 0.95, entre(b, 0.72, 0.85))} />
          </group>
        ) : null}
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [CARRILES[RAPIDO] + 0.1, 0.9, zR], t: "Con calambres", a: 0.26, z: 0.66, o: [-110, -20], color: K.rojo },
          { p: [CARRILES[0] - 0.14, 2.05, 0], t: "≈ agua", a: 0.32, z: 1.1, o: [-20, -100], color: K.cian },
          { p: [CARRILES[1] + 0.14, 2.0, 0], t: "≈ sodio", a: 0.52, z: 1.1, o: [-20, -150], color: NA_C },
          { p: [CARRILES[RAPIDO] + 0.05, 0.7, zR], t: "Ya tuvo calambres antes", a: 0.83, z: 1.1, o: [-110, 30], color: K.rojo },
        ]}
      />
      <Dato b={b} a={0.12} z={1.1} t="IRONMAN · 210 TRIATLETAS" sub="Schwellnus et al. 2011" color={K.cian} y={250} tam={74} />
      <Chip b={b} a={0.42} z={0.68} t="NO MÁS DESHIDRATADOS" x={540} y={1100} color={K.cian} />
      <Chip b={b} a={0.7} z={1.1} t="IBAN MÁS RÁPIDO" x={540} y={1100} color={K.lima} />
    </AbsoluteFill>
  );
};

// 7 · Metaanalisis 2026: antecedentes x4.4; potasio alto -------------------------------
const Meta: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.5, 1.4, 8.2], l: [0, 0.55, 0], fov: 38 },
      { b: 0.6, p: [-0.2, 1.4, 7.9], l: [0, 0.55, 0], fov: 38 },
      { b: 0.7, p: [4.5, 1.3, 7.2], l: [4.3, 0.75, 0], fov: 38 },
      { b: 1, p: [4.8, 1.3, 6.8], l: [4.3, 0.75, 0], fov: 38 },
    ],
    b,
  );
  const crece = entre(b, 0.18, 0.52);
  const H1 = 0.34;
  const barras = [
    { x: -0.6, h: H1 * Math.min(1, crece * 3), c: "#8fa3a8", t: "SIN antecedentes · ×1" },
    { x: 0.6, h: H1 * mix(1, 4.4, crece) * Math.min(1, crece * 3), c: K.rojo, t: "CON antecedentes · ×4.4" },
  ];
  const baja = entre(b, 0.72, 0.78);
  const tacha = b > 0.82;
  const sube = entre(b, 0.88, 0.94);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <mesh position={[0, -0.03, 0]}>
          <boxGeometry args={[2.6, 0.06, 1.0]} />
          <meshStandardMaterial color="#163238" />
        </mesh>
        {barras.map((x, i) => (
          <mesh key={i} position={[x.x, x.h / 2, 0]}>
            <boxGeometry args={[0.7, Math.max(0.01, x.h), 0.5]} />
            <meshPhysicalMaterial color={x.c} emissive={x.c} emissiveIntensity={0.3} clearcoat={0.5} roughness={0.35} />
          </mesh>
        ))}
        <group position={[3.75, 0.85, 0]} scale={0.7}>
          <Platano p={[0, 0, 0]} rot={[0, 0, 0.1]} />
        </group>
        {Array.from({ length: 7 }).map((_, i) => (
          <IonColor
            key={i}
            p={[3.75 + (rnd(`ki${i}`) - 0.5) * 1.2, 0.5 + rnd(`kj${i}`) * 0.9 + Math.sin(b * 6 + i) * 0.04, 0.3 + rnd(`kk${i}`) * 0.4]}
            color={K_C}
            r={0.06 + sube * 0.02}
            brillo={0.4 + sube}
          />
        ))}
        {baja > 0 ? <F2Flecha a={[4.55, 1.65, 0.2]} b={[4.55, 0.55, 0.2]} color="#7d8b8f" r={0.05} op={baja} /> : null}
        {tacha ? <F2Tacha p={[4.55, 1.1, 0.35]} tam={0.6 * Math.max(0, pop(b, 0.82))} /> : null}
        {sube > 0 ? <F2Flecha a={[5.1, 0.45, 0.2]} b={[5.1, 0.45 + 1.4 * sube, 0.2]} color={K.lima} r={0.07} /> : null}
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          ...barras.map((x, i) => ({ p: [x.x, x.h, 0.25] as V3, t: x.t, a: 0.26 + i * 0.12, z: 0.66, o: [i ? -30 : 20, i ? 80 : -150] as [number, number], color: x.c })),
          { p: [3.75, 1.05, 0], t: "Potasio (K⁺)", a: 0.66, z: 1.1, o: [-40, -150], color: K_C },
        ]}
      />
      <Dato b={b} a={0.02} z={0.42} t="METAANÁLISIS 2026" sub="Costa et al." color={K.cian} y={260} tam={96} />
      <Dato b={b} a={0.42} z={0.66} t="RIESGO ×4" sub="si ya tuviste calambres (OR ≈ 4.4)" color={K.rojo} y={260} tam={120} />
      <Dato b={b} a={0.68} z={1.1} t="POTASIO: ALTO" sub="no bajo, en quienes se acalambraron" color={K_C} y={260} tam={104} />
    </AbsoluteFill>
  );
};

// 8 · Varias causas: sudar mucho en el calor y perder sodio puede sumar ------------------
const Sudor: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [-0.6, 1.5, 7.2], l: [-0.42, 0.95, 0], fov: 36 },
      { b: 1, p: [-0.2, 1.4, 6.8], l: [-0.4, 0.95, 0], fov: 36 },
    ],
    b,
  );
  const calor = entre(b, 0.38, 0.5);
  const sodio = entre(b, 0.72, 0.8);
  const bloques = [
    { a: 0.12, t: "Fatiga", c: K.morado },
    { a: 0.22, t: "Antecedentes", c: K.naranja },
    { a: 0.84, t: "Sudor + sodio", c: K.cian },
  ];
  const BX = -1.0;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={calor > 0.01 ? "#3a2210" : undefined}>
        <group rotation={[0, Math.PI / 2, 0]}>
          <Camino avance={-b * 20} />
          <Atleta ej="sprint" fase={b * 30} brilla={0.25 * calor} colorBrillo={K.naranja} />
        </group>
        {calor > 0 ? (
          <group position={[0.3, 2.5, -2.2]} scale={0.6 * calor}>
            <Sol giro={b * 2} />
          </group>
        ) : null}
        {calor > 0
          ? GOTAS_SUDOR.map((q, i) => {
              const f = (b * 2.2 + rnd(`sf${i}`)) % 1;
              const p: V3 = [q[0] - f * 0.35, q[1] - f * f * (q[1] - 0.02), q[2] + 0.12];
              return (
                <group key={i}>
                  <Gota p={p} r={0.035} op={calor * (1 - f * 0.4)} />
                  {sodio > 0 && i % 2 === 0 ? <Sal p={[p[0], p[1] - 0.005, p[2] + 0.04]} r={0.014 * sodio} /> : null}
                </group>
              );
            })
          : null}
        {bloques.map((x, i) => {
          if (b < x.a) return null;
          const k = entre(b, x.a, x.a + 0.06);
          return (
            <mesh key={i} position={[BX, 0.19 + i * 0.4 + (1 - k) * 1.5, -0.3]} rotation={[0, 0.3, 0]}>
              <boxGeometry args={[0.38, 0.38, 0.38]} />
              <meshPhysicalMaterial color={x.c} emissive={x.c} emissiveIntensity={0.35} clearcoat={0.6} roughness={0.3} transparent opacity={k} />
            </mesh>
          );
        })}
      </Escena3D>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 70% 20%, rgba(255,160,40,${0.18 * calor}) 0%, transparent 60%)` }} />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          ...bloques.map((x, i) => ({ p: [BX + 0.1, 0.19 + i * 0.4, -0.1] as V3, t: x.t, a: x.a + 0.04, z: 1.1, o: [50, -40] as [number, number], color: x.c })),
          { p: [0.0, 0.7, 0.15], t: "Na⁺ en el sudor", a: 0.76, z: 1.1, o: [70, 60], color: NA_C },
        ]}
      />
      <Dato b={b} a={0.03} z={1.1} t="VARIAS CAUSAS" sub="no hay un solo culpable" color={K.lima} y={260} tam={110} />
      <Chip b={b} a={0.48} z={1.1} t="SUDAR MUCHO + CALOR" x={540} y={1100} color={K.naranja} />
    </AbsoluteFill>
  );
};

// 9 · Estirar: el Golgi frena a la neurona y el musculo se relaja ------------------------
const EM9_M = emisiones((x) => (x < 0.7 ? 55 : mix(55, 0, entre(x, 0.7, 0.88))));
const EM9_G = emisiones((x) => (x < 0.46 ? 2 : 30));
const EM9_H = emisiones(() => 8);

const Estira: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuera = b < 0.4;
  const cam = fuera ? camSentado(b, 0, 0.4) : camara([{ b: 0.4, p: CAM_CIR.p, l: CAM_CIR.l, fov: 40 }, { b: 1, p: [0.9, -0.25, 14.4], l: [0.35, -0.7, 0], fov: 40 }], b);
  const k = entre(b, 0.04, 0.24);
  const inclina = mix(0.45, 0.85, k);
  const manoD = mix3([0.2, CADERA_Y + 0.12, 0.42], [PIE_SENTADO[0] + 0.05, PIE_SENTADO[1] + 0.02, PIE_SENTADO[2] + 0.02], k);
  const manoI = mix3([-0.12, CADERA_Y + 0.12, 0.4], [PIE_SENTADO[0] - 0.07, PIE_SENTADO[1] + 0.01, PIE_SENTADO[2] + 0.02], k);
  const gA = entre(b, 0.46, 0.56) * (0.7 + 0.3 * Math.sin(b * 30) ** 2);
  const act = 1 - entre(b, 0.72, 0.92);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={fuera ? undefined : [9, 28]}>
        {fuera ? (
          <>
            <Camino avance={0} ancho={2.2} />
            <AtletaSentado inclina={inclina} manos={[manoD, manoI]} gemelo={1 - 0.4 * entre(b, 0.25, 0.4)} />
          </>
        ) : (
          <>
            <Circuito
              b={b}
              act={act}
              motorEm={EM9_M}
              husoEm={EM9_H}
              golgiEm={EM9_G}
              husoAct={0.3}
              golgiAct={gA}
              interAct={gA}
              dur={DUR}
              colorAct={act > 0.5 ? K.rojo : K.amarillo}
            />
            <Polvo b={b} radio={6} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.4]} />
      {fuera ? (
        <Etiquetas cam={cam} b={b} items={[{ p: GEMELO_SENTADO, t: "Estira la pantorrilla", a: 0.2, z: 0.4, o: [60, 120], color: K.lima }]} />
      ) : (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [CIR.golgi[0] - 0.1, CIR.golgi[1], CIR.golgi[2]], t: "Golgi: ¡ACTIVADO!", a: 0.46, z: 1.1, o: [60, 50], color: GOLGI_C },
            { p: CIR.inter, t: "Freno", a: 0.6, z: 1.1, o: [40, -120], color: GOLGI_C },
            { p: CIR.S, t: "Neurona: se calma", a: 0.76, z: 1.1, o: [-50, 90], color: K.amarillo },
          ]}
        />
      )}
      <Dato b={b} a={0.03} z={0.42} t="ESTIRA SUAVE" sub="hasta que pase" color={K.lima} y={260} tam={110} />
      <Dato b={b} a={0.46} z={1.1} t={act > 0.5 ? "GOLGI FRENA" : "SE RELAJA"} sub={act > 0.5 ? "el estiramiento lo activa" : "la ráfaga se apaga"} color={act > 0.5 ? GOLGI_C : K.lima} y={260} tam={110} />
    </AbsoluteFill>
  );
};

// 10 · Prevencion ----------------------------------------------------------------------
const Prevenir: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara([{ b: 0, p: [0, 0, 8], l: [0, 0, 0], fov: 40 }], b);
  const items: { a: number; p: V3; t: string; color: string; x: number; y: number }[] = [
    { a: 0.1, p: [-0.75, 1.0, 0], t: "RITMO DE COMPETENCIA", color: K.lima, x: 300, y: 790 },
    { a: 0.34, p: [0.75, 1.0, 0], t: "CARGA POCO A POCO", color: K.naranja, x: 780, y: 790 },
    { a: 0.52, p: [-0.75, -0.1, 0], t: "DESCANSO", color: K.amarillo, x: 300, y: 1120 },
    { a: 0.72, p: [0.75, -0.1, 0], t: "SODIO + AGUA", color: K.cian, x: 780, y: 1120 },
  ];
  const s = (a: number) => Math.max(0, pop(b, a, 0.1)) * (b >= a ? 1 : 0);
  const giro = Math.sin(b * 5) * 0.35;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={items[0].p} scale={0.85 * s(items[0].a)} rotation={[0, giro, 0]}>
          <group position={[0, -0.2, 0]}>
            <Velocimetro v={0.55 + 0.25 * Math.sin(b * 6)} />
          </group>
        </group>
        <group position={items[1].p} scale={0.75 * s(items[1].a)} rotation={[0.15, giro - 0.4, 0]}>
          <group position={[0, -0.45, 0]}>
            <Escalera crece={entre(b, items[1].a, items[1].a + 0.2)} />
          </group>
        </group>
        <group position={items[2].p} scale={0.9 * s(items[2].a)} rotation={[0, giro * 0.5, 0]}>
          <Luna />
        </group>
        <group position={items[3].p} scale={0.6 * s(items[3].a)} rotation={[0.1, giro, -0.1]}>
          <group position={[-0.15, -0.62, 0]}>
            <Botella />
          </group>
          {[0, 1, 2].map((i) => (
            <Sal key={i} p={[0.4 + (i % 2) * 0.12, -0.4 + i * 0.22, 0.2]} r={0.07} giro={b * 2 + i} />
          ))}
        </group>
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas cam={cam} b={b} items={[{ p: [1.05, -0.3, 0.2], t: "Na⁺", a: 0.76, z: 1.1, o: [30, -60], color: NA_C }]} />
      <Titular b={b} a={0.02} z={1.1} y={280} tam={110} t="Para prevenirlos" color={K.lima} />
      {items.map((it) => (
        <Chip key={it.t} b={b} a={it.a + 0.02} z={1.1} t={it.t} x={it.x} y={it.y} color={it.color} />
      ))}
    </AbsoluteFill>
  );
};

const Final: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Dónde te dan más <span style={{ color: K.lima }}>calambres</span>?</>}
    escribe="A mí en…"
    ideas={["PANTORRILLA", "MUSLO", "PIE"]}
  />
);

const T = [
  "En la encuesta de mis historias ganó este tema: ¿por qué dan **calambres**? Y spoiler: casi nunca es por falta de **potasio**.",
  "Un calambre es una contracción **involuntaria**, repentina y dolorosa: el músculo se queda trabado y no se suelta.",
  "Tu músculo solo se contrae cuando una **neurona motora** le manda la señal. En un calambre, esa neurona se pone a disparar sin parar.",
  "¿Por qué? En el músculo hay dos sensores: los **husos musculares**, que lo activan, y los **órganos tendinosos de Golgi**, que lo frenan.",
  "Con la **fatiga**, los husos se aceleran y los de Golgi frenan menos. Se rompe el equilibrio y la neurona dispara de más.",
  "Por eso suelen llegar al final del esfuerzo, con el músculo cansado y **acortado**, como la pantorrilla con el pie en punta.",
  "¿Y la deshidratación? En triatletas de Ironman, los que tuvieron calambres **no** estaban más deshidratados ni con menos sodio: iban **más rápido** y ya habían tenido calambres antes.",
  "Un metaanálisis de este año lo confirma: el factor más fuerte es haberlos tenido antes, que multiplica el riesgo por **cuatro**. Y el potasio de quienes se acalambraron no estaba bajo: estaba **alto**.",
  "Aun así, no parece haber una sola causa: en algunas personas, sudar mucho en el calor y perder **sodio** también puede sumar.",
  "Si te da uno, **estira** suavemente el músculo hasta que pase: el estiramiento activa a los órganos de Golgi, que ayudan a frenar a la neurona.",
  "Para prevenirlos: entrena a la intensidad a la que compites, sube la carga poco a poco y descansa bien. Y si sudas mucho, recupera el **sodio**, no solo el agua.",
  "¿A ti en qué músculo te dan más calambres? **Escríbelo en los comentarios**.",
];

const ESCENAS = [Gancho, Calambre, Neurona, Sensores, Fatiga, Acortado, Ironman, Meta, Sudor, Estira, Prevenir, Final];

export const CALAMBRES: ShortDef = {
  id: "Short-Calambres",
  titulo: "¿Por qué dan calambres?",
  planos: ESCENAS.map((Escena, i) => ({ id: `calambres-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
