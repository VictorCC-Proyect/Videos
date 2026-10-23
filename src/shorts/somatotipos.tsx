// Short: Somatotipos (ectomorfo, mesomorfo, endomorfo): qué dice la ciencia
// Basado en Holway, Nutrición sin dogmas (1.3.3, 1.3.4, 2.7.1): Sheldon -> Heath-Carter -> somatocarta.
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, mix, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { Polvo } from "../fisio/modelos/comun";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaComentarios } from "./cierre";
import { Chip, Dato, Destello, K, Sello, ShortDef, Titular } from "./marco";
import { Bascula, Frijoles, Pechuga, Piso, Plato } from "./modelos";
import { F1Fibra, F2ADN, F2Arroz, F2Tacha } from "./modelos-fibras";
import {
  BarraCal,
  Calibre,
  cartaVertices,
  Cinta,
  CortePiel,
  CuerpoSoma,
  Estadiometro,
  Plicometro,
  POBLACION,
  puntoCarta,
  PuntoCarta,
  Soma,
  somaMedidas,
  somaPuntos,
  Somatocarta,
} from "./modelos-somatotipos";

// Codigo de color de los tres componentes.
const CE = { endo: K.amarillo, meso: K.rosa, ecto: K.cian };
const ECTO: Soma = { endo: 1.5, meso: 2.5, ecto: 6 };
const MESO: Soma = { endo: 1.5, meso: 6.5, ecto: 1 };
const ENDO: Soma = { endo: 7, meso: 3.5, ecto: 0.5 };
const TRES: { s: Soma; x: number; n: string; c: string }[] = [
  { s: ECTO, x: -0.8, n: "ECTOMORFO", c: CE.ecto },
  { s: MESO, x: 0, n: "MESOMORFO", c: CE.meso },
  { s: ENDO, x: 0.8, n: "ENDOMORFO", c: CE.endo },
];
const mixSoma = (a: Soma, z: Soma, t: number): Soma => ({ endo: mix(a.endo, z.endo, t), meso: mix(a.meso, z.meso, t), ecto: mix(a.ecto, z.ecto, t) });
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

// 0 · Gancho: lo pidieron en los comentarios -----------------------------------------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [1.6, 1.5, 7.0], l: [0, 0.78, 0], fov: 40 },
      { b: 1, p: [-1.4, 1.3, 6.6], l: [0, 0.78, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        {TRES.map((c, i) => {
          const sube = entre(b, 0.22 + i * 0.1, 0.34 + i * 0.1);
          return (
            <group key={i} position={[c.x, 0, 0]} rotation={[0, (1 - sube) * 2.5 + Math.sin(b * 4 + i) * 0.15, 0]} scale={0.3 + 0.7 * sube}>
              <CuerpoSoma {...c.s} brilla={visible(b, 0.22 + i * 0.1, 0.5) * 0.4} colorBrillo={c.c} />
              <Piso r={0.38} color={c.c} />
            </group>
          );
        })}
      </Escena3D>
      <Chip b={b} a={0.02} z={0.5} t="LO PIDIERON EN LOS COMENTARIOS" x={540} y={330} color={K.lima} />
      {TRES.map((c, i) => (
        <Chip key={i} b={b} a={0.24 + i * 0.1} z={1} t={c.n} x={[220, 540, 860][i]} y={1100} color={c.c} />
      ))}
      <Titular b={b} a={0.55} z={1} y={290} tam={150} t="¿Cuál eres?" />
    </AbsoluteFill>
  );
};

// 1 · Sheldon: tipo de cuerpo = personalidad (descartado) ------------------------------
const Sheldon: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 1.4, 7.4], l: [0, 0.8, 0], fov: 40 },
      { b: 1, p: [0.6, 1.2, 6.6], l: [0, 0.8, 0], fov: 40 },
    ],
    b,
  );
  const tacha = entre(b, 0.8, 0.88);
  const ETIQ = ["Tímido", "Aventurero", "Sociable"];
  return (
    <AbsoluteFill style={{ filter: `sepia(${0.75 - 0.5 * tacha})` }}>
      <Escena3D cam={cam} fondo="#2a2418">
        {TRES.map((c, i) => (
          <group key={i} position={[c.x, 0, 0]}>
            <CuerpoSoma {...c.s} tono="#8a6a5a" musculo={0.75} />
            <Piso r={0.38} color="#d9c39a" brillo={0.3} />
            {tacha > 0 ? <F2Tacha p={[0, 1.2, 0.4]} tam={0.55 * tacha} /> : null}
          </group>
        ))}
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={TRES.map((c, i) => ({
          p: add([c.x, 0, 0], somaPuntos(c.s).cabeza),
          t: ETIQ[i],
          a: 0.42 + i * 0.07,
          z: 1,
          o: [[-30, -150], [30, -230], [30, -110]][i] as [number, number],
          color: "#d9c39a",
        }))}
      />
      <Chip b={b} a={0.02} z={1} t="WILLIAM SHELDON · 1940s" x={540} y={300} color="#d9c39a" />
      <Chip b={b} a={0.3} z={1} t="CUERPO = PERSONALIDAD" x={540} y={1100} color="#d9c39a" />
      <Sello b={b} a={0.84} z={1} t="DESCARTADO" y={560} />
    </AbsoluteFill>
  );
};

// 2 · Heath-Carter: tres componentes con calificacion -----------------------------------
const HeathCarter: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const t = entre(b, 0.5, 0.85);
  const val = { endo: mix(0, 3, t), meso: mix(0, 5, t), ecto: mix(0, 2, t) };
  const cuerpo: Soma = { endo: Math.max(1, val.endo), meso: Math.max(1.5, val.meso), ecto: Math.max(2, 4 - val.meso * 0.4) };
  const cam = camara(
    [
      { b: 0, p: [-0.4, 1.4, 6.6], l: [0.15, 0.85, 0], fov: 38 },
      { b: 1, p: [0.8, 1.3, 6.0], l: [0.15, 0.85, 0], fov: 38 },
    ],
    b,
  );
  const BAR: { k: keyof Soma; x: number; n: string }[] = [
    { k: "endo", x: 0.25, n: "ENDO" },
    { k: "meso", x: 0.62, n: "MESO" },
    { k: "ecto", x: 0.99, n: "ECTO" },
  ];
  const alto = 1.2;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={[-0.5, 0, 0]} rotation={[0, 0.25 + Math.sin(b * 3) * 0.2, 0]}>
          <CuerpoSoma {...cuerpo} brilla={0.15} />
          <Piso r={0.4} />
        </group>
        {BAR.map((x) => (
          <BarraCal key={x.k} p={[x.x, 0.15, 0]} valor={val[x.k]} alto={alto} color={CE[x.k]} />
        ))}
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={BAR.map((x, i) => ({
          p: [x.x, 0.15 + (val[x.k] / 8) * alto, 0] as V3,
          t: `${x.n} ${Math.round(val[x.k])}`,
          a: 0.55 + i * 0.03,
          z: 1,
          o: [-25, -45] as [number, number],
          color: CE[x.k],
        }))}
      />
      <Chip b={b} a={0.02} z={0.17} t="HEATH Y CARTER" x={540} y={330} color={K.lima} />
      <Titular b={b} a={0.2} z={0.5} y={300} tam={110} t="No son 3 cajas" color={K.tinta} />
      <Dato b={b} a={0.55} z={1} t="3 – 5 – 2" sub="3 componentes, cada uno con su nota" y={270} />
    </AbsoluteFill>
  );
};

// 3 · Endomorfia: pliegues cutaneos ---------------------------------------------------
const ENDO3: Soma = { endo: 5.5, meso: 3.5, ecto: 1 };
const Endomorfia: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const corte = 0.42;
  const fuera = b < corte;
  const pt = somaPuntos(ENDO3);
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [2.2, 1.5, 5.4], l: [0, 0.85, 0], fov: 38 },
          { b: 0.2, p: [2.0, 1.5, -3.0], l: [0.1, 1.0, 0], fov: 38 },
          { b: corte, p: [1.05, 1.45, -1.55], l: add(pt.triceps, [0, -0.15, 0]), fov: 38 },
        ],
        b,
      )
    : camara(
        [
          { b: corte, p: [0.7, 1.2, 6.2], l: [0, 0.05, 0], fov: 40 },
          { b: 1, p: [-0.8, 1.3, 5.8], l: [0, 0.1, 0], fov: 40 },
        ],
        b,
      );
  const pinza = entre(b, 0.55, 0.75);
  const grasa = 0.6;
  const yP = -0.35 + grasa + 0.1;
  const hP = pinza * 0.55;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={fuera ? undefined : [5, 14]}>
        {fuera ? (
          <>
            <CuerpoSoma {...ENDO3} />
            <Piso r={0.45} />
            <Plicometro p={add(pt.triceps, [0, 0, -0.01])} abre={0.05} escala={0.5} rot={[0, Math.PI / 2, Math.PI / 2]} />
          </>
        ) : (
          <>
            <CortePiel pliegue={pinza} grasa={grasa} brilloGrasa={entre(b, 0.78, 0.9)} />
            <group position={[0, yP + hP * 0.45, 0.3]} rotation={[1.15, 0, 0]}>
              <Plicometro p={[0, 0, 0]} abre={0.43} escala={1.3} rot={[0, 0, Math.PI / 2]} />
            </group>
            <Polvo b={b} radio={4} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[corte]} />
      {fuera ? (
        <Etiquetas cam={cam} b={b} items={[{ p: pt.triceps, t: "Pliegue del tríceps", a: 0.24, z: corte, o: [-60, 150], color: CE.endo }]} />
      ) : (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [-0.9, yP - 0.05, 0.5], t: "Piel", a: 0.46, z: 1, o: [-40, -170], color: "#e8a58f" },
            { p: [-0.75, -0.05, 0.5], t: "Grasa subcutánea", a: 0.5, z: 1, o: [30, 220], color: CE.endo },
            { p: [0.8, -0.6, 0.5], t: "Músculo", a: 0.54, z: 1, o: [30, 150], color: K.rojo },
            { p: [0, yP + hP * 0.6, 0.5], t: "Pliegue = piel + grasa", a: 0.76, z: 1, o: [60, -170], color: K.lima },
          ]}
        />
      )}
      <Dato b={b} a={0.05} z={1} t="ENDOMORFIA" sub="grasa relativa a tu tamaño" color={CE.endo} y={260} tam={90} />
      <Chip b={b} a={0.8} z={1} t="TRÍCEPS · SUBESCAPULAR · SUPRAESPINAL" x={540} y={1110} color={CE.endo} />
    </AbsoluteFill>
  );
};

// 4 · Mesomorfia: diametros oseos y perimetros -------------------------------------------
const MESO4: Soma = { endo: 1.5, meso: 6, ecto: 1.5 };
const Mesomorfia: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const abd = 1.45;
  const flex = entre(b, 0.1, 0.25);
  const pt = somaPuntos(MESO4, abd);
  const m = somaMedidas(MESO4);
  const rod: V3 = [0.11, m.pie + m.pierna, 0];
  const pant: V3 = [0.105, m.pie + m.pierna * 0.68, 0];
  const cerca = b > 0.2 ? 1 : 0;
  const cam = camara(
    [
      { b: 0, p: [0.4, 1.3, 5.8], l: [0, 0.85, 0], fov: 38 },
      { b: 0.22, p: [2.9, 1.75, 2.6], l: [0.4, 1.25, 0], fov: 38 },
      { b: 0.5, p: [2.7, 1.7, 2.4], l: [0.4, 1.25, 0], fov: 38 },
      { b: 0.62, p: [2.6, 0.45, 2.4], l: [0.1, 0.5, 0], fov: 38 },
      { b: 1, p: [1.9, 0.4, 2.9], l: [0.1, 0.5, 0], fov: 38 },
    ],
    b,
  );
  const cintaB = entre(b, 0.3, 0.38);
  const cal = entre(b, 0.66, 0.74);
  const cintaP = entre(b, 0.8, 0.88);
  const rBrazo = 0.046 * m.mm + m.g * 0.9 + 0.006;
  const rPant = 0.052 * m.mm + m.g * 0.7 + 0.006;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <CuerpoSoma {...MESO4} abd={mix(0.14, abd, flex)} codo={mix(-0.15, -2.0, flex)} musculo={0.8 - 0.35 * cerca} brilla={0.2 + 0.3 * flex} />
        <Piso r={0.45} />
        {cintaB > 0 ? <Cinta p={pt.brazo} r={rBrazo * (1.6 - 0.6 * cintaB)} rot={[0, 0, abd]} /> : null}
        {cal > 0 ? <Calibre p={[rod[0], rod[1], 0.05 + 0.25 * (1 - cal)]} abre={0.13} rot={[Math.PI / 2, 0, 0]} escala={0.9} /> : null}
        {cintaP > 0 ? <Cinta p={pant} r={rPant * (1.6 - 0.6 * cintaP)} rot={[0, 0, 0.035]} /> : null}
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: add(pt.brazo, [0, rBrazo, 0]), t: "Perímetro: brazo flexionado", a: 0.36, z: 0.55, o: [-40, 150], color: K.amarillo },
          { p: pt.codo, t: "Hueso: húmero", a: 0.42, z: 0.55, o: [20, 230], color: "#efe6d2" },
          { p: add(rod, [0, 0, 0.1]), t: "Diámetro óseo: fémur", a: 0.7, z: 1, o: [-60, -160], color: "#efe6d2" },
          { p: add(pant, [0, 0, rPant]), t: "Perímetro: pantorrilla", a: 0.86, z: 1, o: [-60, 150], color: K.amarillo },
        ]}
      />
      <Dato b={b} a={0.05} z={1} t="MESOMORFIA" sub="robustez de músculo y hueso" color={CE.meso} y={260} tam={90} />
    </AbsoluteFill>
  );
};

// 5 · Ectomorfia: linealidad (talla / raiz cubica del peso) --------------------------------
const ECTO5: Soma = { endo: 1, meso: 2, ecto: 6.5 };
const Ectomorfia: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const pt = somaPuntos(ECTO5);
  const alto = pt.alto + 0.06;
  const baja = entre(b, 0.25, 0.45);
  const cam = camara(
    [
      { b: 0, p: [1.4, 1.4, 6.6], l: [-0.1, 0.95, 0], fov: 38 },
      { b: 1, p: [-1.2, 1.3, 6.2], l: [-0.1, 0.95, 0], fov: 38 },
    ],
    b,
  );
  const fantasma = visible(b, 0.55, 1);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Estadiometro p={[-0.45, 0, -0.15]} h={mix(2.25, alto, baja)} alto={2.3} />
        <group position={[0.05, 0.06, 0]}>
          <CuerpoSoma {...ECTO5} brilla={0.25} colorBrillo={CE.ecto} />
        </group>
        <group position={[0.05, 0, 0]}>
          <Bascula />
        </group>
        {fantasma > 0 ? (
          <group position={[0.75, 0, -0.3]}>
            <CuerpoSoma endo={3} meso={5} ecto={1.5} musculo={0.35 * fantasma} verGrasa={0.5 * fantasma} />
          </group>
        ) : null}
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.3, alto, -0.15], t: "Talla", a: 0.38, z: 1, o: [-40, -120], color: CE.ecto },
          { p: [0.05, 0.06, 0.25], t: "Peso", a: 0.5, z: 1, o: [60, 120], color: K.lima },
          { p: [0.75, 1.5, -0.3], t: "Menos lineal", a: 0.62, z: 1, o: [-30, -200], color: "#9fb8b4" },
        ]}
      />
      <Dato b={b} a={0.05} z={1} t="ECTOMORFIA" sub="linealidad" color={CE.ecto} y={260} tam={90} />
      <Chip b={b} a={0.7} z={1} t="TALLA ÷ ∛PESO" x={540} y={1100} color={CE.ecto} />
    </AbsoluteFill>
  );
};

// 6 · Somatocarta: un punto por persona; casi todos mixtos -------------------------------
const YO: Soma = { endo: 3, meso: 5, ecto: 2 };
const ESC = 0.075;
const Carta: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const traza = entre(b, 0.05, 0.3);
  const cam = camara(
    [
      { b: 0, p: [0.6, -0.2, 4.6], l: [0, -0.2, 0], fov: 38 },
      { b: 1, p: [-0.4, -0.1, 4.1], l: [0, -0.15, 0], fov: 38 },
    ],
    b,
  );
  const v = cartaVertices(ESC);
  const yo = puntoCarta(YO, ESC);
  const pob = entre(b, 0.55, 0.85);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Somatocarta esc={ESC} traza={traza} />
        {b > 0.35 ? <PuntoCarta p={yo} color={K.lima} r={0.05 * Math.min(1, (b - 0.35) / 0.05)} /> : null}
        {POBLACION.map((s, i) => {
          const k = Math.min(1, Math.max(0, pob * 1.6 - (i / POBLACION.length) * 0.6) * 3);
          return k > 0 ? <PuntoCarta key={i} p={puntoCarta(s, ESC)} color="#9fd8ff" r={0.022 * k} op={0.85} /> : null;
        })}
        <Polvo b={b} radio={4} n={40} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: v.meso, t: "Mesomorfia", a: 0.12, z: 1, o: [40, -80], color: CE.meso },
          { p: v.endo, t: "Endomorfia", a: 0.18, z: 1, o: [-10, 110], color: CE.endo },
          { p: v.ecto, t: "Ectomorfia", a: 0.24, z: 1, o: [10, 110], color: CE.ecto },
          { p: yo, t: "3 – 5 – 2", a: 0.36, z: 0.6, o: [-70, -90], color: K.lima },
        ]}
      />
      <Dato b={b} a={0.02} z={1} t="SOMATOCARTA" sub="tus 3 notas = un punto" color={K.lima} y={260} tam={90} />
      <Chip b={b} a={0.78} z={1} t="LA MAYORÍA = MEZCLA" x={540} y={1100} color={K.cian} />
    </AbsoluteFill>
  );
};

// 7 · Deporte: fondistas ecto (fibras lentas) vs velocistas/lanzadores meso (rapidas) -----
const FONDO: Soma = { endo: 1.5, meso: 4, ecto: 4 };
const VELOZ: Soma = { endo: 1.7, meso: 5.3, ecto: 2.3 };
const LANZA: Soma = { endo: 3.5, meso: 6.5, ecto: 1 };
const Deporte: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const corte = 0.68;
  const fuera = b < corte;
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [2.2, 1.3, 6.2], l: [0, 1.0, 0], fov: 40 },
          { b: corte, p: [-1.4, 1.3, 6.2], l: [0, 1.0, 0], fov: 40 },
        ],
        b,
      )
    : camara(
        [
          { b: corte, p: [0.3, -0.2, 4.4], l: [0, -0.2, 0], fov: 38 },
          { b: 1, p: [-0.3, -0.1, 4.1], l: [0, -0.15, 0], fov: 38 },
        ],
        b,
      );
  const lento = entre(b, 0.22, 0.35);
  const rapido = entre(b, 0.45, 0.58);
  const pF = puntoCarta(FONDO, ESC);
  const pV = puntoCarta(VELOZ, ESC);
  const pL = puntoCarta(LANZA, ESC);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {fuera ? (
          <>
            <group position={[-0.55, 0, 0]} rotation={[0, 0.3, 0]}>
              <CuerpoSoma {...FONDO} fase={b * 22} marcha={1.1} brilla={0.5 * lento} colorBrillo="#ff2a3a" />
              <Piso r={0.4} color={CE.ecto} />
            </group>
            <group position={[0.6, 0, 0]} rotation={[0, -0.3, 0]}>
              <CuerpoSoma {...VELOZ} fase={b * 34} marcha={1.6} brilla={0.5 * rapido} colorBrillo="#ffe6d8" />
              <Piso r={0.4} color={CE.meso} />
            </group>
            {lento > 0 ? <F1Fibra p={[-0.55, 2.0, 0]} tipo="I" radio={0.07 * lento} largo={0.32} brillo={0.8} /> : null}
            {rapido > 0 ? <F1Fibra p={[0.6, 2.0, 0]} tipo="IIx" radio={0.09 * rapido} largo={0.32} brillo={0.6} contrae={Math.abs(Math.sin(b * 30))} /> : null}
          </>
        ) : (
          <>
            <Somatocarta esc={ESC} />
            {POBLACION.map((s, i) => (
              <PuntoCarta key={i} p={puntoCarta(s, ESC)} color="#9fd8ff" r={0.018} op={0.35} />
            ))}
            <PuntoCarta p={pF} color={CE.ecto} r={0.055 * entre(b, 0.72, 0.76)} />
            <PuntoCarta p={pV} color={K.naranja} r={0.055 * entre(b, 0.8, 0.84)} />
            <PuntoCarta p={pL} color={CE.meso} r={0.055 * entre(b, 0.86, 0.9)} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[corte]} />
      {fuera ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [-0.55, 2.17, 0], t: "Fibras lentas", a: 0.25, z: corte, o: [20, -70], color: "#ff4d5e" },
            { p: [0.6, 2.17, 0], t: "Fibras rápidas", a: 0.48, z: corte, o: [-20, -140], color: "#f4e1d8" },
          ]}
        />
      ) : (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: pF, t: "Fondistas", a: 0.72, z: 1, o: [40, 110], color: CE.ecto },
            { p: pV, t: "Velocistas", a: 0.8, z: 1, o: [60, -60], color: K.naranja },
            { p: pL, t: "Lanzadores", a: 0.86, z: 1, o: [-60, -90], color: CE.meso },
          ]}
        />
      )}
      {fuera ? (
        <>
          <Chip b={b} a={0.05} z={corte} t="FONDISTA" x={330} y={1100} color={CE.ecto} />
          <Chip b={b} a={0.4} z={corte} t="VELOCISTA" x={760} y={1100} color={CE.meso} />
        </>
      ) : null}
      <Titular b={b} a={0.02} z={0.22} y={290} tam={110} t="El físico y el deporte" />
      <Titular b={b} a={corte} z={1} y={290} tam={110} t="El físico y el deporte" />
    </AbsoluteFill>
  );
};

// 8 · El somatotipo cambia: menos grasa, mas musculo; el punto se mueve -----------------
const ANTES: Soma = { endo: 5.5, meso: 3.5, ecto: 1 };
const DESPUES: Soma = { endo: 2.5, meso: 5.5, ecto: 1.8 };
const ESC8 = 0.05;
const Cambia: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const t = entre(b, 0.45, 0.85);
  const s = mixSoma(ANTES, DESPUES, t);
  const adn = visible(b, 0, 0.4);
  const carta = entre(b, 0.35, 0.45);
  const cam = camara(
    [
      { b: 0, p: [0, 1.3, 6.0], l: [0.1, 0.85, 0], fov: 38 },
      { b: 1, p: [-0.5, 1.2, 5.6], l: [0.1, 0.85, 0], fov: 38 },
    ],
    b,
  );
  const C0: V3 = [0.6, 1.05, 0];
  const p0 = add(C0, puntoCarta(ANTES, ESC8));
  const p1 = add(C0, puntoCarta(s, ESC8));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={[-0.45, 0, 0]} rotation={[0, 0.35 + Math.sin(b * 3) * 0.15, 0]}>
          <CuerpoSoma {...s} brilla={0.35 * visible(b, 0.5, 0.9)} colorBrillo={K.lima} pesa={b > 0.45} codo={b > 0.45 ? -0.15 - 2.0 * Math.max(0, Math.sin(b * 30)) : -0.15} />
          <Piso r={0.42} />
        </group>
        {adn > 0 ? <F2ADN p={[0.55, 1.05, 0]} alto={1.1 * adn} r={0.16} n={14} giro={b * 6} /> : null}
        {carta > 0 ? (
          <group position={C0} scale={carta}>
            <Somatocarta esc={ESC8} />
          </group>
        ) : null}
        {carta > 0 ? (
          <>
            <PuntoCarta p={p0} color="#9fb8b4" r={0.03} op={0.6} />
            <PuntoCarta p={p1} color={K.lima} r={0.04} />
          </>
        ) : null}
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[{ p: [0.55, 1.6, 0], t: "Genética = tendencia", a: 0.05, z: 0.38, o: [-30, -120], color: K.morado }]}
      />
      <Chip b={b} a={0.55} z={1} t="− GRASA" x={300} y={1100} color={CE.endo} />
      <Chip b={b} a={0.65} z={1} t="+ MÚSCULO" x={760} y={1100} color={CE.meso} />
      <Titular b={b} a={0.2} z={0.62} y={300} tam={120} t="No te condena" color={K.lima} />
      <Dato b={b} a={0.66} z={1} t="TU SOMATOTIPO CAMBIA" sub="porque cambian tu grasa y tu músculo" y={260} tam={76} />
    </AbsoluteFill>
  );
};

// 9 · Misma rutina, distinta respuesta ------------------------------------------------
const E9: Soma = { endo: 1.5, meso: 2.5, ecto: 5.5 };
const N9: Soma = { endo: 6.5, meso: 4, ecto: 0.7 };
const Rutina: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const k = Math.max(0, Math.sin(b * 22));
  const codo = -0.15 - 2.1 * k;
  const cam = camara(
    [
      { b: 0, p: [0, 1.7, 6.4], l: [0, 0.7, 0], fov: 40 },
      { b: 1, p: [0.5, 1.8, 5.8], l: [0, 0.7, 0], fov: 40 },
    ],
    b,
  );
  const comida = entre(b, 0.3, 0.42);
  const comp = entre(b, 0.65, 0.78);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={[-0.55, 0, 0]}>
          <CuerpoSoma {...E9} pesa codo={codo} abd={0.1} brilla={0.3 * comida} colorBrillo={K.naranja} />
          <Piso r={0.42} color={CE.ecto} />
          {comida > 0 ? (
            <group position={[0, 0.55, 0.55]} rotation={[0.35, 0, 0]} scale={comida * 1.1}>
              <Plato p={[0, 0, 0]} escala={0.6} />
              <F2Arroz p={[-0.12, 0.03, -0.05]} escala={0.32} />
              <Pechuga p={[0.13, 0.05, 0.05]} escala={0.28} />
              <Frijoles p={[0.02, 0.03, 0.18]} escala={0.22} />
            </group>
          ) : null}
        </group>
        <group position={[0.55, 0, 0]}>
          <CuerpoSoma {...N9} pesa codo={codo} abd={0.12} verGrasa={1 - 0.4 * comp} brilla={0.3 * comp} colorBrillo={K.lima} />
          {comp > 0 ? (
            <group position={[0, 0.6, 0.6]} rotation={[0.35, 0, 0]} scale={comp * 0.75}>
              <Plato p={[0, 0, 0]} escala={0.6} />
              <Pechuga p={[0.05, 0.05, 0]} escala={0.3} />
              <Frijoles p={[-0.16, 0.03, 0.12]} escala={0.18} />
            </group>
          ) : null}
          <Piso r={0.42} color={CE.endo} />
        </group>
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.68, 1.3, 0], t: "Ectomorfo", a: 0.15, z: 1, o: [-15, -40], color: CE.ecto },
          { p: [0.38, 1.3, 0], t: "Endomorfo", a: 0.2, z: 1, o: [-15, -40], color: CE.endo },
        ]}
      />
      <Titular b={b} a={0.02} z={0.32} y={290} tam={110} t="Misma rutina" />
      <Chip b={b} a={0.35} z={1} t="+ ENERGÍA" x={260} y={330} color={K.naranja} />
      <Chip b={b} a={0.68} z={1} t="COMPOSICIÓN CORPORAL" x={700} y={420} color={K.lima} />
    </AbsoluteFill>
  );
};

const Final: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Cómo <span style={{ color: K.lima }}>comer y entrenar</span> según tu tipo?</>}
    escribe="Sí, soy…"
    ideas={["ECTOMORFO", "MESOMORFO", "ENDOMORFO"]}
  />
);

const T = [
  "En el video de ayer me pidieron en los comentarios hablar de los **somatotipos**. ¿Eres ectomorfo, mesomorfo o endomorfo? Vamos a ver qué dice la ciencia.",
  "La idea viene de William **Sheldon**, en los años cuarenta. Él decía que tu tipo de cuerpo definía hasta tu **personalidad**. Eso hoy está **descartado**.",
  "Lo que sí se usa en nutrición es el somatotipo de **Heath y Carter**: no son tres cajas, son **tres componentes** que todos tenemos, cada uno con su calificación.",
  "La **endomorfia** es la adiposidad relativa: cuánta grasa tienes para tu tamaño. Se calcula con **pliegues cutáneos**.",
  "La **mesomorfia** es la robustez de músculo y hueso. Se mide con **diámetros óseos** y **perímetros** de brazo y pierna.",
  "La **ectomorfia** es la linealidad: qué tan alto y delgado eres en relación con tu peso.",
  "Con esas tres calificaciones se marca un punto en un triángulo: la **somatocarta**. Casi nadie es un tipo puro: la mayoría somos una **mezcla**.",
  "Y el físico se parece al deporte: los fondistas tienden a la ectomorfia, con más fibras lentas; los velocistas y lanzadores, a la mesomorfia, con más fibras rápidas.",
  "La genética te da una tendencia, como viste con tus fibras, pero **no te condena**: con entrenamiento y alimentación tu somatotipo **cambia**, porque cambian tu grasa y tu músculo.",
  "Por eso no todos responden igual a la misma rutina: un ectomorfo necesita más energía para ganar peso, y un endomorfo, cuidar más su composición corporal.",
  "¿Quieres un video de cómo **comer y entrenar** según tu somatotipo? **Escríbelo en los comentarios**.",
];

const ESCENAS = [Gancho, Sheldon, HeathCarter, Endomorfia, Mesomorfia, Ectomorfia, Carta, Deporte, Cambia, Rutina, Final];

export const SOMATOTIPOS: ShortDef = {
  id: "Short-Somatotipos",
  titulo: "Somatotipos: ¿eres ectomorfo, mesomorfo o endomorfo?",
  planos: ESCENAS.map((Escena, i) => ({ id: `somatotipos-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
