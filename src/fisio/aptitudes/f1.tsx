import React from "react";
import { AbsoluteFill } from "remotion";
import { entre, lineal, mix, PlanoDef, useBeat } from "../motor";
import { C, FUENTE } from "../tema";
import { Lista, Rico, Tabla, Tarjeta, TituloGrande } from "../ui";
import { Fondo } from "../actividad/a1";
import { Curvas, Indicador, Pasos } from "../cardio/comun";
import { Atleta, COL_F } from "./comun";

const SEC = "5.1 Entrenamiento de la fuerza";

// ---- Portada ------------------------------------------------------------------

const Portada: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, opacity: 0.6 }}>
        <Atleta b={b} modo="salta" dx={0} color={COL_F.vel} brilla={0.2} />
      </div>
      <TituloGrande
        b={b}
        a={0}
        z={2}
        sup="Unidad 5 · Bases del entrenamiento"
        t="Aptitudes físicas básicas"
        sub="5.1 Fuerza · 5.2 Resistencia aeróbica · 5.3 Flexibilidad · 5.4 Velocidad"
      />
    </AbsoluteFill>
  );
};

// ---- Las cuatro cualidades ------------------------------------------------------

const CUAL = [
  { n: "Fuerza", d: "Vencer u oponerse a una resistencia", e: "1RM en press de banca o sentadilla", c: COL_F.fuerza },
  { n: "Resistencia", d: "Sostener un esfuerzo frente a la fatiga", e: "Test de Cooper · carrera de 3 000 m", c: COL_F.res },
  { n: "Flexibilidad", d: "Amplitud de movimiento articular", e: "Sit and reach · FMS · goniometría", c: COL_F.flex },
  { n: "Velocidad", d: "Moverse en el menor tiempo posible", e: "Sprint de 30 m o 40 yardas", c: COL_F.vel },
];

const Cualidades: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <Fondo>
      <div style={{ position: "absolute", left: 90, right: 90, top: 140, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, fontFamily: FUENTE, color: C.texto }}>
        {CUAL.map((q, i) => {
          const op = entre(b, i * 0.2, i * 0.2 + 0.2);
          return (
            <div key={q.n} style={{ opacity: op, transform: `translateY(${(1 - op) * 20}px)`, background: "rgba(4,9,20,0.86)", borderTop: `6px solid ${q.c}`, borderRadius: 16, padding: "20px 26px", minHeight: 190 }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: q.c }}>{q.n}</div>
              <div style={{ fontSize: 28, marginTop: 6 }}>{q.d}</div>
              <div style={{ fontSize: 26, marginTop: 14, color: C.suave, opacity: entre(b, 1 + i * 0.15, 1.15 + i * 0.15) }}>
                Evaluación: <b style={{ color: q.c }}>{q.e}</b>
              </div>
            </div>
          );
        })}
      </div>
    </Fondo>
  );
};

// ---- Tipos de fuerza ---------------------------------------------------------------

const Tipos: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <AbsoluteFill>
      <Atleta b={b} modo={b < 2 ? "curl" : "salta"} color={COL_F.fuerza} brilla={0.35} />
      <Pasos
        b={b}
        x={640}
        y={130}
        w={1220}
        titulo="Fuerza"
        color={COL_F.fuerza}
        lineas={[
          { a: 0, t: "Capacidad de **vencer u oponerse a una resistencia** mediante la **tensión muscular**" },
          { a: 1, t: "**Fuerza máxima**: la mayor tensión posible → **1RM**", color: COL_F.fuerza },
          { a: 1.3, t: "**Fuerza resistencia**: sostener la fuerza frente al cansancio (series de 20 repeticiones)", color: COL_F.res },
          { a: 2, t: "**Fuerza explosiva (potencia)**: fuerza **+ velocidad**", color: COL_F.vel },
          { a: 2.2, t: "Halterofilia, saltos, lanzamientos · **Potencia = fuerza × velocidad**" },
        ]}
      />
    </AbsoluteFill>
  );
};

// ---- Continuo de repeticiones ----------------------------------------------------

const ZONAS = [
  ["Fuerza máxima", "85–100 %", "1–3", "Máxima tensión neuromuscular", "3–5 min"],
  ["Fuerza", "75–85 %", "4–6", "Alta tensión muscular", "2–5 min"],
  ["Hipertrofia", "60–75 %", "8–12", "Tensión mecánica y estrés metabólico", "30 s–2 min"],
  ["Resistencia muscular", "< 60 %", "15–20+", "Capacidad glucolítica local", "< 1 min"],
];
const COL_Z = [COL_F.fuerza, "#ff9a5a", COL_F.morado, COL_F.res];

const Continuo: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const visibles = b < 1 ? 2 : 4;
  return (
    <Fondo>
      <div style={{ position: "absolute", left: 90, right: 90, top: 130, fontFamily: FUENTE, color: C.texto }}>
        <div style={{ fontSize: 40, fontWeight: 900, marginBottom: 14 }}>El continuo de repeticiones</div>
        <div style={{ display: "flex", height: 60, borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
          {COL_Z.map((c, i) => (
            <div key={i} style={{ flex: 1, background: c, opacity: i < visibles ? 0.9 : 0.15, display: "flex", alignItems: "center", justifyContent: "center", color: "#08121f", fontWeight: 900, fontSize: 24 }}>
              {i === 0 ? "← Más carga" : i === 3 ? "Más repeticiones →" : ""}
            </div>
          ))}
        </div>
        <div style={{ background: "rgba(4,9,20,0.9)", borderRadius: 14, padding: "10px 16px" }}>
          <Tabla tam={26} anchos="1.3fr 0.8fr 0.8fr 1.8fr 0.9fr" cab={["Zona", "% de 1RM", "Repeticiones", "Enfoque", "Descanso"]} filas={ZONAS.slice(0, visibles)} />
        </div>
        <div style={{ marginTop: 18, fontSize: 30, background: "rgba(4,9,20,0.88)", borderLeft: `6px solid ${COL_F.fuerza}`, borderRadius: 12, padding: "14px 22px", opacity: entre(b, 2, 2.15) }}>
          <Rico t="Mito: las series de 20 **no queman grasa**. El ardor son **protones** de la glucólisis; la grasa se oxida en esfuerzos **largos y moderados**." color={COL_F.fuerza} />
        </div>
      </div>
    </Fondo>
  );
};

// ---- Schoenfeld --------------------------------------------------------------------

const Schoenfeld: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuerza = (x: number) => 0.92 - x * 0.62;
  const hiper = (x: number) => (x < 0.06 ? 0.4 + x * 6 : 0.76 + 0.04 * Math.sin(x * 4));
  return (
    <Fondo>
      <div style={{ position: "absolute", left: 90, top: 120, fontFamily: FUENTE, fontSize: 34, fontWeight: 900, color: C.texto }}>Schoenfeld et al. (2021): el continuo revisado</div>
      <Curvas
        x={90}
        y={180}
        w={1100}
        h={560}
        series={[
          { f: hiper, color: COL_F.morado, hasta: lineal(b, 0.1, 0.9), t: "Hipertrofia" },
          { f: fuerza, color: COL_F.fuerza, hasta: lineal(b, 1, 1.6), t: "Fuerza máxima" },
        ]}
        ejeX="Repeticiones por serie (cerca del fallo)"
        ejeY="Ganancia"
        ticksX={["1", "5", "10", "15", "20", "25", "30"]}
      />
      <Tarjeta b={b} a={0} z={2.05} x={1230} y={180} w={620} titulo="Lo que dice la evidencia" color={COL_F.morado} tam={27}>
        <Lista
          items={[
            "Hay **hipertrofia de 1 a 30 repeticiones** si la serie llega **cerca del fallo**",
            "Carga mínima: **más del 30 % del 1RM**",
            "Para **fuerza máxima**, mejor cargas **pesadas (> 80 %)**: adaptación **nerviosa**",
            "**8–12 rep**: lo más eficiente para acumular volumen",
          ]}
          b={b}
          a={0.2}
          paso={0.4}
          color={COL_F.morado}
        />
      </Tarjeta>
    </Fondo>
  );
};

// ---- Metodologia: variables y umbrales ------------------------------------------------

const Metodologia: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const nivel = b < 1 ? 0.5 : b < 2 ? mix(0.12, 0.95, (Math.sin(b * 3) + 1) / 2) : 0.55;
  const enZona = nivel > 0.25 && nivel < 0.8;
  return (
    <Fondo>
      <Pasos
        b={b}
        x={90}
        y={130}
        w={900}
        titulo="Variables de la carga"
        color={COL_F.fuerza}
        tam={28}
        lineas={[
          { a: 0, t: "**Ejercicios**: primero multiarticulares (sentadilla, peso muerto, press)" },
          { a: 0.15, t: "**Series × repeticiones** y **% de 1RM**" },
          { a: 0.3, t: "**Descanso**: fuerza 3–5 min · hipertrofia 30 s–2 min" },
          { a: 0.45, t: "**Frecuencia**: 2–3 veces por grupo muscular a la semana" },
          { a: 0.6, t: "**Progresión**: subir la carga poco a poco" },
          { a: 2, t: "**Mantenimiento**: 1 sesión/semana al **90–95 % del 1RM** conserva la fuerza", color: COL_F.flex },
        ]}
      />
      <div style={{ position: "absolute", left: 1040, top: 130, width: 800, fontFamily: FUENTE, color: C.texto, background: "rgba(4,9,20,0.88)", borderRadius: 16, padding: "20px 26px", opacity: entre(b, 1, 1.15) }}>
        <div style={{ fontSize: 32, fontWeight: 900, color: C.acento2, marginBottom: 14 }}>Umbrales de estímulo</div>
        <div style={{ position: "relative", height: 420, display: "flex", flexDirection: "column", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ flex: 0.2, background: "rgba(255,77,77,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800 }}>Sobreentrenamiento · lesión</div>
          <div style={{ height: 4, background: COL_F.fuerza }} />
          <div style={{ flex: 0.55, background: "rgba(124,255,138,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 900, color: COL_F.flex }}>Zona óptima</div>
          <div style={{ height: 4, background: COL_F.res }} />
          <div style={{ flex: 0.25, background: "rgba(94,200,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800 }}>Sin adaptación</div>
          <div style={{ position: "absolute", left: 20, right: 20, top: `${(1 - nivel) * 100}%`, height: 6, background: enZona ? COL_F.flex : COL_F.fuerza, boxShadow: `0 0 18px ${enZona ? COL_F.flex : COL_F.fuerza}` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: C.suave, marginTop: 8 }}>
          <span>— Máxima tolerancia (arriba)</span>
          <span>Umbral mínimo (abajo) —</span>
        </div>
      </div>
    </Fondo>
  );
};

// ---- Evaluacion -------------------------------------------------------------------

const Evaluacion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const salto = b >= 2;
  return (
    <AbsoluteFill>
      <Atleta b={b} modo={salto ? "salta" : "sentadilla"} color={COL_F.fuerza} brilla={0.35} />
      {salto ? <Indicador x={110} y={140} valor="0.50" unidad="s de vuelo" color={COL_F.vel} op={entre(b, 2.2, 2.35)} /> : null}
      <Pasos
        b={b}
        x={640}
        y={130}
        w={1220}
        titulo={salto ? "Potencia: salto con contramovimiento (CMJ)" : "Evaluar la fuerza máxima"}
        color={salto ? COL_F.vel : COL_F.fuerza}
        tam={29}
        lineas={
          salto
            ? [
                { a: 2, t: "Plataforma de salto: mide el **tiempo de vuelo**" },
                { a: 2.2, t: "**Altura = 9.81 × t² ÷ 8**" },
                { a: 2.4, t: "0.5 s de vuelo → 9.81 × 0.25 ÷ 8 ≈ **31 cm**", grande: true, color: COL_F.vel },
                { a: 2.6, t: "Depende del **peso corporal**: menos grasa, más salto" },
              ]
            : [
                { a: 0, t: "**Directa (1RM)**: calentamiento y **intentos crecientes**" },
                { a: 0.2, t: "3–5 min de descanso · máximo **3 a 5 intentos**" },
                { a: 1, t: "**Indirecta (Brzycki)**:", color: COL_F.fuerza },
                { a: 1.1, t: "**1RM = peso ÷ (1.0278 − 0.0278 × reps)**", grande: true, color: COL_F.fuerza },
                { a: 1.4, t: "80 kg × 8 reps → 80 ÷ 0.805 ≈ **99 kg**" },
              ]
        }
      />
    </AbsoluteFill>
  );
};

export const F1: PlanoDef[] = [
  {
    id: "f-portada",
    seccion: "",
    textos: [
      "**Unidad 5: Bases del entrenamiento de las aptitudes físicas básicas.** Cómo se entrena y cómo se evalúa cada una de las cualidades que determinan el rendimiento.",
      "Veremos la metodología y evaluación del entrenamiento de **fuerza**, de **resistencia aeróbica**, de **flexibilidad** y de **velocidad**.",
    ],
    Escena: Portada,
  },
  {
    id: "f-cualidades",
    seccion: "Las cualidades físicas básicas",
    textos: [
      "Las **cualidades físicas básicas** son cuatro: la **fuerza**, la **resistencia**, la **flexibilidad** y la **velocidad**. Son los pilares del rendimiento.",
      "Cada una se evalúa con pruebas estandarizadas: la fuerza con el **1RM** en ejercicios multiarticulares; la resistencia con el **test de Cooper** o una carrera de 3 000 metros; la flexibilidad con el **sit and reach** o el **FMS**; y la velocidad con un **sprint de 30 metros o 40 yardas**.",
    ],
    Escena: Cualidades,
  },
  {
    id: "f-tipos",
    seccion: SEC,
    textos: [
      "La **fuerza** es la capacidad de **vencer u oponerse a una resistencia** mediante la **tensión muscular**.",
      "Se manifiesta de varias formas. La **fuerza máxima** es la mayor tensión posible, y se representa con la **repetición máxima, o 1RM**. La **fuerza resistencia** es sostener la fuerza frente al cansancio, como en series de veinte repeticiones.",
      "Y la **fuerza explosiva**, o **potencia**, suma la **velocidad**: es la de los levantamientos olímpicos, los saltos y los lanzamientos. **Potencia = fuerza × velocidad**.",
    ],
    Escena: Tipos,
  },
  {
    id: "f-continuo",
    seccion: SEC + " · Continuo de repeticiones",
    textos: [
      "Tradicionalmente se usa el **continuo de repeticiones**: **fuerza máxima**, de 1 a 3 repeticiones al **85 a 100 % del 1RM**; y **fuerza**, de 4 a 6 repeticiones al **75 a 85 %**, con descansos largos de **3 a 5 minutos**.",
      "**Hipertrofia**, de 8 a 12 repeticiones al **60 a 75 %**, con descansos de 30 segundos a 2 minutos; y **resistencia muscular**, de **15 a 20 o más** repeticiones por debajo del **60 %**.",
      "Ojo con un mito: las series de veinte **no queman grasa**. El ardor que se siente son **protones** de la glucólisis rápida. La grasa se oxida en esfuerzos **largos y moderados**, como caminar o trotar.",
    ],
    Escena: Continuo,
  },
  {
    id: "f-schoenfeld",
    seccion: SEC + " · Nuevo paradigma",
    textos: [
      "La revisión de **Schoenfeld y colaboradores (2021)** cambió el paradigma: se puede ganar músculo en **todo el rango, de 1 a 30 repeticiones**, siempre que la serie llegue **cerca del fallo** y la carga supere el **30 % del 1RM**.",
      "Pero para la **fuerza máxima** siguen siendo mejores las cargas **pesadas, por encima del 80 %**, por las adaptaciones del **sistema nervioso**. Y el rango de **8 a 12** es el más eficiente para acumular volumen con menos desgaste.",
    ],
    Escena: Schoenfeld,
  },
  {
    id: "f-metodologia",
    seccion: SEC + " · Metodología",
    textos: [
      "Para programar la fuerza se manejan **variables**: los **ejercicios**, primero los multiarticulares; las **series, repeticiones y porcentaje del 1RM**; el **descanso**; una **frecuencia** de 2 a 3 veces por grupo muscular a la semana; y la **progresión** de la carga.",
      "El estímulo debe estar en la **zona óptima**: por encima del **umbral mínimo**, porque una carga insignificante no produce adaptación, y por debajo de la **máxima tolerancia**, porque superarla lleva al **sobreentrenamiento** y a la lesión.",
      "Una vez ganada la fuerza, en temporada de competencia basta con **una sesión por semana al 90 o 95 % del 1RM** para **mantenerla**.",
    ],
    Escena: Metodologia,
  },
  {
    id: "f-evaluacion",
    seccion: SEC + " · Evaluación",
    textos: [
      "La fuerza máxima se evalúa con el **test de 1RM directo**: tras calentar, se hacen **intentos con carga creciente**, con 3 a 5 minutos de descanso, hasta encontrar el máximo en **3 a 5 intentos**.",
      "También se puede **estimar** con la fórmula de **Brzycki**: **1RM = peso ÷ (1.0278 − 0.0278 × repeticiones)**. Si levantas **80 kilos 8 veces**: 80 ÷ 0.805 ≈ **99 kilos**.",
      "La **potencia** se mide con el **salto con contramovimiento** en una plataforma que registra el **tiempo de vuelo**: **altura = 9.81 × tiempo al cuadrado ÷ 8**. Medio segundo de vuelo equivale a unos **31 centímetros**.",
    ],
    Escena: Evaluacion,
  },
];
