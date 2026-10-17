import React from "react";
import { AbsoluteFill } from "remotion";
import { entre, lineal, PlanoDef, useBeat } from "../motor";
import { C, FUENTE } from "../tema";
import { Lista, Rico, Tarjeta } from "../ui";
import { Fondo, FiguraIzq } from "../actividad/a1";
import { COL_K, Curvas, Pasos } from "./comun";

const SEC = "3.3 Deuda de oxígeno";
const SEC_M = "3.4 MET";

// VO2 en el tiempo: reposo hasta 0.2, ejercicio de 0.2 a 0.6, recuperacion despues.
const REP = 0.15;
const DEM = 0.7;
const vo2t = (x: number) => {
  if (x < 0.2) return REP;
  if (x < 0.6) return DEM - (DEM - REP) * Math.exp(-(x - 0.2) / 0.05);
  const y0 = DEM - (DEM - REP) * Math.exp(-0.4 / 0.05);
  const t = x - 0.6;
  return REP + (y0 - REP) * (0.6 * Math.exp(-t / 0.03) + 0.4 * Math.exp(-t / 0.14));
};
const demanda = (x: number) => (x < 0.2 || x > 0.6 ? REP : DEM);

const Deuda: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <Fondo>
      <div style={{ position: "absolute", left: 90, top: 120, fontFamily: FUENTE, fontSize: 36, fontWeight: 900, color: C.texto }}>Consumo de O₂ antes, durante y después del ejercicio</div>
      <Curvas
        x={90}
        y={180}
        w={1740}
        h={600}
        series={[
          { f: demanda, color: C.suave, punteada: true, hasta: entre(b, 0, 0.3) },
          { f: vo2t, color: COL_K.o2, hasta: b < 2 ? lineal(b, 0.1, 1.2) : lineal(b, 2, 2.6) },
        ]}
        ejeX="Tiempo"
        ejeY="VO₂"
        areas={[
          { x0: 0.2, x1: 0.42, color: COL_K.rojo, t: "Déficit de O₂", op: entre(b, 0.6, 0.8), bajo: vo2t, sobre: demanda },
          { x0: 0.42, x1: 0.6, color: COL_K.o2, t: "Estado estable", op: entre(b, 1.1, 1.3), bajo: () => REP, sobre: vo2t },
          { x0: 0.6, x1: 1, color: COL_K.deuda, t: "Deuda de O₂ (EPOC)", op: entre(b, 2.2, 2.4), bajo: () => REP, sobre: vo2t },
        ]}
        marcas={[
          { x: 0.2, t: "Inicio", color: C.acento, op: entre(b, 0.2, 0.35) },
          { x: 0.6, t: "Fin", color: C.acento, op: entre(b, 1.9, 2.05) },
        ]}
      />
    </Fondo>
  );
};

const Componentes: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: -300, top: 0, width: 1920, height: 1080 }}>
        <FiguraIzq b={b} modo="quieto" brilla={0.35 - b * 0.08} colorBrillo={COL_K.deuda} />
      </div>
      <Tarjeta b={b} a={0} z={3} x={640} y={130} w={590} titulo="Componente rápido" color={COL_K.o2} tam={26}>
        <div style={{ fontSize: 22, color: C.suave, marginBottom: 8 }}>Aláctico · 2–3 minutos</div>
        <Lista items={["**Resintetizar ATP y PCr**", "Recargar el O₂ de la **mioglobina** y la **hemoglobina**"]} b={b} a={0.2} paso={0.25} color={COL_K.o2} />
      </Tarjeta>
      <Tarjeta b={b} a={1} z={3} x={1270} y={130} w={590} titulo="Componente lento" color={COL_K.deuda} tam={26}>
        <div style={{ fontSize: 22, color: C.suave, marginBottom: 8 }}>Láctico · minutos a horas</div>
        <Lista
          items={["Eliminar y reciclar el **lactato**", "**Temperatura** corporal elevada", "**Hormonas** (adrenalina, noradrenalina)", "**Respiración y FC** todavía altas"]}
          b={b}
          a={1.1}
          paso={0.15}
          color={COL_K.deuda}
        />
      </Tarjeta>
      <div style={{ position: "absolute", left: 640, top: 600, width: 1220, fontFamily: FUENTE, fontSize: 32, fontWeight: 800, color: C.texto, background: "rgba(4,9,20,0.86)", borderRadius: 14, padding: "18px 26px", opacity: entre(b, 2, 2.15), borderLeft: `6px solid ${COL_K.rojo}` }}>
        <Rico t="A **mayor intensidad** (y duración), **mayor EPOC** y más calorías después del ejercicio." color={COL_K.rojo} />
      </div>
    </AbsoluteFill>
  );
};

// ---- 3.4 MET --------------------------------------------------------------------

const MetDef: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const W = 1680;
  const ACT = [
    { t: "Dormir", m: 0.9 },
    { t: "Sentado", m: 1.3 },
    { t: "Caminar 5 km/h", m: 3.5 },
    { t: "Bici 20 km/h", m: 8 },
    { t: "Correr 12 km/h", m: 11.5 },
    { t: "VO₂máx 49", m: 14 },
  ];
  const px = (m: number) => (m / 15) * W;
  return (
    <Fondo>
      <Pasos
        b={b}
        x={120}
        y={130}
        w={1680}
        titulo="MET · equivalente metabólico"
        color={COL_K.met}
        lineas={[
          { a: 0, t: "**1 MET** = gasto en reposo = **3.5 ml de O₂/kg/min** ≈ **1 kcal/kg/h**" },
          { a: 0.4, t: "Una actividad de 6 METs gasta **6 veces** lo del reposo" },
          { a: 1, t: "**METs = VO₂ ÷ 3.5** → VO₂máx de 49 ml/kg/min = **14 METs** de capacidad máxima", color: COL_K.met },
        ]}
      />
      <div style={{ position: "absolute", left: 120, top: 560, width: W, height: 220, fontFamily: FUENTE, color: C.texto }}>
        <div style={{ position: "absolute", top: 90, left: 0, width: W, height: 10, borderRadius: 5, background: "linear-gradient(90deg, #5ec8ff, #7cff8a, #ffcf5a, #ff4d4d)", opacity: entre(b, 0.5, 0.7) }} />
        {ACT.map((a, i) => {
          const op = entre(b, 0.6 + i * 0.12, 0.75 + i * 0.12);
          return (
            <div key={a.t} style={{ position: "absolute", left: px(a.m) - 100, width: 200, top: i % 2 ? 120 : 0, textAlign: "center", opacity: op }}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{a.t}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: i === ACT.length - 1 ? COL_K.met : C.acento2 }}>{a.m} METs</div>
            </div>
          );
        })}
      </div>
    </Fondo>
  );
};

const MetCalc: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: -300, top: 0, width: 1920, height: 1080 }}>
        <FiguraIzq b={b} modo={b < 1 ? "corre" : "camina"} brilla={0.3} colorBrillo={COL_K.met} />
      </div>
      <Pasos
        b={b}
        x={640}
        y={130}
        w={1220}
        titulo="Calorías con METs"
        color={COL_K.met}
        lineas={[
          { a: 0, t: "**kcal/min = METs × 3.5 × kg ÷ 200**", grande: true, color: COL_K.met },
          { a: 0.3, t: "70 kg haciendo una actividad de **8 METs**" },
          { a: 0.5, t: "8 × 3.5 × 70 ÷ 200 = **9.8 kcal/min**" },
          { a: 0.7, t: "En 30 minutos: 9.8 × 30 ≈ **294 kcal**", color: COL_K.o2 },
          { a: 1, t: "**MET-minutos por semana** = METs × minutos" },
          { a: 1.2, t: "150 min caminando a 4 METs = **600 MET-min/semana**" },
          { a: 1.4, t: "Meta de salud: **500 a 1 000 MET-min/semana**", color: COL_K.o2 },
        ]}
      />
    </AbsoluteFill>
  );
};

export const K3: PlanoDef[] = [
  {
    id: "k-deuda",
    seccion: SEC,
    textos: [
      "Al empezar el ejercicio, la demanda de energía sube **de golpe**, pero el consumo de oxígeno **tarda** en ajustarse. Esa diferencia es el **déficit de oxígeno**, y se cubre con la **fosfocreatina** y la **glucólisis anaeróbica**.",
      "Después de unos minutos, si la intensidad es moderada, el VO₂ alcanza un **estado estable**: el oxígeno que llega cubre la demanda.",
      "Al terminar, el VO₂ **no vuelve al reposo de inmediato**: se mantiene elevado un tiempo. Ese oxígeno extra es la **deuda de oxígeno**, término de **Hill (1922)**; hoy se llama **EPOC**, exceso de consumo de oxígeno post-ejercicio.",
    ],
    Escena: Deuda,
  },
  {
    id: "k-epoc",
    seccion: SEC + " · Componentes del EPOC",
    textos: [
      "El EPOC tiene un **componente rápido**, o aláctico, que dura **2 a 3 minutos**: sirve para **resintetizar el ATP y la fosfocreatina** y recargar el oxígeno de la **mioglobina** y la **hemoglobina**.",
      "Y un **componente lento**, o láctico, que puede durar **de minutos a horas**: elimina y recicla el **lactato**, y compensa la **temperatura elevada**, las **hormonas** como la adrenalina, y la **respiración y FC** que siguen altas.",
      "A **mayor intensidad** y duración del ejercicio, **mayor es el EPOC**, y más energía se gasta después de entrenar.",
    ],
    Escena: Componentes,
  },
  {
    id: "k-met-def",
    seccion: SEC_M,
    textos: [
      "El **MET**, o equivalente metabólico, es el gasto de energía en **reposo**: **3.5 ml de oxígeno por kilo por minuto**, aproximadamente **1 kcal por kilo por hora**. Una actividad de 6 METs gasta **6 veces** lo del reposo.",
      "Se conecta directo con el VO₂: **METs = VO₂ ÷ 3.5**. Alguien con un VO₂máx de **49** tiene una capacidad máxima de **14 METs**.",
    ],
    Escena: MetDef,
  },
  {
    id: "k-met-calc",
    seccion: SEC_M + " · Cálculos",
    textos: [
      "Para calcular calorías: **kcal por minuto = METs × 3.5 × kilos ÷ 200**. Una persona de **70 kilos** a **8 METs**: 8 × 3.5 × 70 ÷ 200 = **9.8 kcal por minuto**; en 30 minutos, unas **294 kcal**.",
      "Los **MET-minutos por semana** suman todo: 150 minutos caminando a 4 METs son **600 MET-minutos**. La meta para la salud es de **500 a 1 000 MET-minutos por semana**.",
    ],
    Escena: MetCalc,
  },
];
