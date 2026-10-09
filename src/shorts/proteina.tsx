// Short 3: ¿Cuanta proteina necesitas? Del plato al musculo: los aminoacidos
// llegan a la fibra y construyen miofibrillas.
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { Polvo, rnd } from "../fisio/modelos/comun";
import { Esfera, GotaLipido } from "../fisio/modelos/energia";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { ANTON, Chip, Cierre, Dato, Destello, INTER, K, ShortDef, Titular } from "./marco";
import { Atleta, Bascula, Frijoles, Huevo, InteriorFibra, Pechuga, Piso, Plato, Proteina, Rinones } from "./modelos";
import { camViaje, cortesViaje, Viaje } from "./viaje";

const COLS = [K.lima, K.cian, K.naranja, K.rosa, K.morado, K.amarillo];

// 0 · Gancho -------------------------------------------------------------------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 1.3, 6.4], l: [0, 0.6, 0], fov: 36 },
      { b: 1, p: [1.4, 1.2, 5.6], l: [0, 0.65, 0], fov: 36 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Atleta ej="parado" brilla={0.2} />
        <Piso />
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2 + b * 2.5;
          return <Proteina key={i} p={[Math.cos(a) * 1.0, 0.5 + (i % 3) * 0.45, Math.sin(a) * 1.0]} escala={0.8} giro={a} seed={`g${i}`} />;
        })}
      </Escena3D>
      <Titular b={b} a={0.02} z={1} y={290} tam={150} t={<>¿Cuánta <span style={{ color: K.lima }}>proteína</span>?</>} />
    </AbsoluteFill>
  );
};

// 1 · Sedentario: 0.8 g/kg ------------------------------------------------------
const Sedentario: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [2.2, 1.3, 5.6], l: [0, 0.65, 0], fov: 36 },
      { b: 1, p: [-1.6, 1.2, 5.4], l: [0, 0.65, 0], fov: 36 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={[0, 0.06, 0]}>
          <Atleta ej="parado" />
        </group>
        <Bascula />
        <Piso color={K.cian} />
      </Escena3D>
      <Chip b={b} a={0.03} z={1} t="SEDENTARIO" x={540} y={1100} color={K.cian} />
      <Dato b={b} a={0.35} z={1} t="0.8 g / kg" sub="de peso corporal al día" color={K.cian} y={260} tam={130} />
    </AbsoluteFill>
  );
};

// 2 · Entrenas fuerza: viaje al musculo, los aminoacidos construyen ----------------
const Fuerza: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const t = lineal(b, 0, 0.55);
  const cam = camViaje(t);
  const llega = entre(b, 0.58, 0.95);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={t > 0.72 ? [10, 34] : undefined}>
        <Viaje t={t} b={b} ej="curl" k={Math.sin(((b * 3) % 1) * Math.PI)} colorBrillo={K.lima} interior={{ pcr: 0, brillo: llega * 0.8 }} />
        {t >= 1
          ? Array.from({ length: 30 }).map((_, i) => {
              const ini: V3 = [(rnd(`fa${i}`) - 0.5) * 9, 4 + rnd(`fb${i}`) * 3, 1.5];
              const fin: V3 = [[-2, 0, 2, -1, 1][i % 5], (rnd(`fc${i}`) - 0.5) * 6, 0.1];
              const f = Math.min(1, Math.max(0, llega * 1.6 - rnd(`fd${i}`) * 0.6));
              return <Esfera key={i} p={mix3(ini, fin, f)} r={0.13} color={COLS[i % 6]} brillo={0.6} op={1 - f * 0.4} />;
            })
          : null}
      </Escena3D>
      <Destello b={b} en={cortesViaje(0, 0.55)} />
      <Chip b={b} a={0.6} z={1} t="AMINOÁCIDOS → MÚSCULO" x={540} y={1100} color={K.lima} />
      <Dato b={b} a={0.65} z={1} t="1.6–2.2 g / kg" sub="si entrenas fuerza" color={K.lima} y={260} tam={110} />
    </AbsoluteFill>
  );
};

// 3 · Ejemplo: 70 kg ---------------------------------------------------------------
const Ejemplo: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [2.0, 1.4, 6.8], l: [0, 0.75, 0], fov: 36 },
      { b: 1, p: [-1.8, 1.3, 7.0], l: [0, 0.75, 0], fov: 36 },
    ],
    b,
  );
  const linea = (a: number, txt: string, res: string, col: string) => (
    <div style={{ opacity: visible(b, a, 1.1, 0.06), transform: `translateX(${(1 - entre(b, a, a + 0.08)) * -80}px)`, fontFamily: ANTON, fontSize: 96, color: K.tinta, WebkitTextStroke: "8px #04090b", paintOrder: "stroke fill" }}>
      {txt} <span style={{ color: col }}>{res}</span>
    </div>
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={[0, 0.06, 0]}>
          <Atleta ej="parado" brilla={0.2} />
        </group>
        <Bascula />
        <Piso />
      </Escena3D>
      <Chip b={b} a={0.05} z={1} t="SI PESAS 70 KG" x={540} y={1100} color={K.naranja} />
      <div style={{ position: "absolute", top: 240, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        {linea(0.35, "70 × 1.6 =", "112 g", K.cian)}
        {linea(0.55, "70 × 2.2 =", "154 g", K.lima)}
      </div>
    </AbsoluteFill>
  );
};

// 4 · Repartir en 3-4 comidas ---------------------------------------------------------
const Reparto: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 5.4, 8.4], l: [0, 0.0, 0], fov: 38 },
      { b: 1, p: [0, 4.8, 7.6], l: [0, 0.0, 0], fov: 38 },
    ],
    b,
  );
  const nombres = ["Desayuno", "Comida", "Cena", "Colación"];
  const pos: V3[] = [0, 1, 2, 3].map((i) => {
    const a = (i / 4) * Math.PI * 2 + b * 0.8;
    return [Math.cos(a) * 1.15, 0, Math.sin(a) * 1.15];
  });
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {pos.map((p, i) => {
          const ap = entre(b, 0.1 + i * 0.12, 0.2 + i * 0.12);
          return (
            <group key={i} scale={ap}>
              <Plato p={p} escala={0.9} />
              <Proteina p={[p[0], p[1] + 0.55, p[2]]} escala={0.9} giro={b * 3 + i} seed={`r${i}`} />
            </group>
          );
        })}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas cam={cam} b={b} items={pos.map((p, i) => ({ p: [p[0], 0.1, p[2]] as V3, t: nombres[i], a: 0.15 + i * 0.12, z: 1, o: [0, 70] as [number, number], color: COLS[i] }))} />
      <Dato b={b} a={0.05} z={1} t="3–4 comidas" sub="20–40 g de proteína en cada una" color={K.lima} y={250} tam={110} />
    </AbsoluteFill>
  );
};

// 5 · Alimentos de referencia ---------------------------------------------------------
const Alimentos: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [-1.6, 2.2, 4.4], l: [-1.6, 0.2, 0], fov: 38 },
      { b: 0.4, p: [-1.4, 2.2, 4.4], l: [-1.4, 0.2, 0], fov: 38 },
      { b: 0.55, p: [0, 2.2, 4.4], l: [0, 0.2, 0], fov: 38 },
      { b: 0.68, p: [1.6, 2.2, 4.4], l: [1.6, 0.2, 0], fov: 38 },
      { b: 0.85, p: [1.6, 2.2, 4.4], l: [1.6, 0.2, 0], fov: 38 },
      { b: 1, p: [0, 3.2, 7.8], l: [0, 0.2, 0], fov: 38 },
    ],
    b,
  );
  const items = [
    { x: -1.6, a: 0.04, g: 45, t: "Pollo 150 g" },
    { x: 0, a: 0.47, g: 12, t: "2 huevos" },
    { x: 1.6, a: 0.62, g: 15, t: "1 taza de frijoles" },
  ];
  const actual = [...items].reverse().find((it) => b >= it.a) ?? items[0];
  const cuenta = Math.round(actual.g * entre(b, actual.a + 0.03, actual.a + 0.15));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {items.map((it, i) => {
          const s = entre(b, it.a, it.a + 0.08);
          return (
            <group key={i} position={[it.x, 0, 0]} scale={s}>
              <Plato p={[0, 0, 0]} />
              {i === 0 ? <Pechuga p={[0, 0.15, 0]} /> : null}
              {i === 1 ? (
                <>
                  <Huevo p={[-0.17, 0.05, 0]} escala={0.8} />
                  <Huevo p={[0.18, 0.05, 0.05]} escala={0.8} />
                </>
              ) : null}
              {i === 2 ? <Frijoles p={[0, 0.0, 0]} escala={0.9} /> : null}
              <Proteina p={[0, 0.9, 0]} escala={0.7} desarma={entre(b, it.a + 0.1, it.a + 0.3) * 0.6} giro={b * 4} seed={`a${i}`} />
            </group>
          );
        })}
      </Escena3D>
      <Etiquetas cam={cam} b={b} items={items.map((it) => ({ p: [it.x, 0.1, 0.4] as V3, t: it.t, a: it.a + 0.02, z: 1, o: [0, 90] as [number, number], color: K.lima }))} />
      <Dato b={b} a={0.04} z={0.95} t={`≈ ${cuenta} g`} sub="de proteína" color={K.lima} y={250} tam={140} />
      <Dato b={b} a={0.95} z={1} t="Comida real" color={K.lima} y={250} tam={110} />
    </AbsoluteFill>
  );
};

// 6 · Perder grasa sin perder musculo --------------------------------------------------
const Definir: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const baja = entre(b, 0.15, 0.85);
  const cam = camara(
    [
      { b: 0, p: [0, 0.4, 11], l: [0, -0.9, 0], fov: 40 },
      { b: 1, p: [-0.6, 0.3, 10], l: [0, -0.9, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[9, 28]}>
        <InteriorFibra b={b} pcr={0} brillo={0.5} />
        {Array.from({ length: 7 }).map((_, i) => (
          <GotaLipido key={i} p={[(rnd(`gl${i}`) - 0.5) * 5, (rnd(`gm${i}`) - 0.5) * 5, 1.4]} r={0.55 * (1 - baja * 0.8)} op={1 - baja * 0.5} />
        ))}
      </Escena3D>
      <Chip b={b} a={0.15} z={1} t="GRASA ↓" x={330} y={1100} color={K.amarillo} />
      <Chip b={b} a={0.3} z={1} t="MÚSCULO ✓" x={750} y={1100} color={K.lima} />
      <Dato b={b} a={0.45} z={1} t="Parte alta" sub="cerca de 2.2 g / kg" color={K.lima} y={260} tam={130} />
    </AbsoluteFill>
  );
};

// 7 · Rinon ---------------------------------------------------------------------------
const Rinon: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.2, 10.0], l: [0, -1.1, 0], fov: 40 },
      { b: 1, p: [-1.4, 0.4, 9.0], l: [0, -1.1, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Rinones brillo={0.15 + 0.25 * entre(b, 0.3, 0.5)} />
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Dato b={b} a={0.3} z={1} t="Sin evidencia" sub="de daño en personas sanas" color={K.lima} y={260} tam={110} />
      <Chip b={b} a={0.65} z={1} t="¿ENFERMEDAD RENAL? → TU MÉDICO" x={540} y={1100} color={K.naranja} />
      <div style={{ position: "absolute", top: 1480, left: 0, right: 0, textAlign: "center", fontFamily: INTER, fontWeight: 700, fontSize: 30, color: K.suave, opacity: visible(b, 0.05, 1) }}>
        ¿Daña el riñón?
      </div>
    </AbsoluteFill>
  );
};

// 8 · Cierre --------------------------------------------------------------------------
const Final: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara([{ b: 0, p: [0, 1.1, 6.4], l: [0, 1.05, 0], fov: 36 }], b);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[0, -0.5 + b * 1.2, 0]}>
          <Atleta ej="flex" k={Math.sin(b * 8) * 0.5 + 0.5} brilla={0.5} colorBrillo={K.lima} />
          <Piso />
        </group>
      </Escena3D>
      <Cierre b={b} />
    </AbsoluteFill>
  );
};

const T = [
  "¿Cuánta **proteína** necesitas al día? Depende de **ti**, no de un número mágico.",
  "Si eres sedentario, el mínimo recomendado es **0.8 g por kilo** de peso corporal.",
  "Si entrenas fuerza o quieres ganar músculo: de **1.6 a 2.2 g por kilo**.",
  "Ejemplo: si pesas 70 kilos, son entre **112 y 154 g** de proteína al día.",
  "Repártela en **3 o 4 comidas**, con unos **20 a 40 g** en cada una.",
  "Como referencia: 150 g de pechuga de pollo cocida aportan unos **45 g**; dos huevos, unos **12**; y una taza de frijoles, unos **15**.",
  "Si quieres perder grasa sin perder músculo, apunta a la **parte alta** del rango.",
  "¿Mucha proteína daña el riñón? En personas sanas **no hay evidencia**. Si ya tienes enfermedad renal, consulta a tu médico.",
  "Sígueme para más **nutrición explicada con ciencia**.",
];

const ESCENAS = [Gancho, Sedentario, Fuerza, Ejemplo, Reparto, Alimentos, Definir, Rinon, Final];

export const PROTEINA: ShortDef = {
  id: "Short-Proteina",
  titulo: "¿Cuánta proteína necesitas?",
  planos: ESCENAS.map((Escena, i) => ({ id: `proteina-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
