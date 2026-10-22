import React from "react";
import { AbsoluteFill } from "remotion";
import { entre, lineal, PlanoDef, useBeat } from "../motor";
import { C, FUENTE } from "../tema";
import { Lista, Rico, Tarjeta, TituloGrande } from "../ui";
import { Fondo } from "../actividad/a1";
import { Curvas, Indicador, Pasos } from "../cardio/comun";
import { Atleta, COL_F } from "./comun";

const SEC = "5.4 Entrenamiento de la velocidad";

// Velocidad en un 100 m: acelera, llega al maximo y cae un poco al final.
const vel100 = (x: number) => (x < 0.6 ? 0.92 * (1 - Math.exp(-x / 0.17)) : 0.92 * (1 - Math.exp(-0.6 / 0.17)) - (x - 0.6) * 0.18);

const Definicion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fases = b >= 1;
  return (
    <AbsoluteFill>
      {!fases ? (
        <>
          <Atleta b={b} modo="sprint" color={COL_F.vel} brilla={0.4} />
          <Pasos
            b={b}
            x={640}
            y={130}
            w={1220}
            titulo="Velocidad"
            color={COL_F.vel}
            lineas={[
              { a: 0, t: "Capacidad de realizar una acción en el **menor tiempo posible**" },
              { a: 0.4, t: "**Gestual**: rapidez de un gesto técnico (saque de tenis, lanzamiento)", color: COL_F.vel },
              { a: 0.6, t: "**De desplazamiento**: tiempo para recorrer una distancia (100 m)", color: COL_F.res },
            ]}
          />
        </>
      ) : (
        <Fondo>
          <div style={{ position: "absolute", left: 90, top: 120, fontFamily: FUENTE, fontSize: 34, fontWeight: 900, color: C.texto }}>Las fases de un sprint de 100 m</div>
          <Curvas
            x={90}
            y={180}
            w={1740}
            h={560}
            series={[{ f: vel100, color: COL_F.vel, hasta: lineal(b, 1.05, 2.6) }]}
            ejeX="Distancia (m)"
            ejeY="Velocidad"
            ticksX={["0", "20", "40", "60", "80", "100"]}
            areas={[
              { x0: 0, x1: 0.04, color: C.acento, t: "Reacción", op: entre(b, 1.1, 1.25) },
              { x0: 0.04, x1: 0.3, color: COL_F.fuerza, t: "Aceleración", op: entre(b, 1.4, 1.55) },
              { x0: 0.3, x1: 0.6, color: COL_F.flex, t: "Velocidad máxima", op: entre(b, 2, 2.15) },
              { x0: 0.6, x1: 1, color: COL_F.morado, t: "Resistencia a la velocidad", op: entre(b, 2.4, 2.55) },
            ]}
          />
        </Fondo>
      )}
    </AbsoluteFill>
  );
};

const Factores: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <AbsoluteFill>
      <Atleta b={b} modo="sprint" color={COL_F.fuerza} brilla={0.45} />
      <Tarjeta b={b} a={0} z={2} x={640} y={130} w={1220} titulo="¿De qué depende?" color={COL_F.fuerza} tam={28}>
        <Lista
          items={[
            "**Fibras rápidas (tipo II)**: muy ligadas a la **genética**",
            "**Sistema nervioso**: frecuencia de impulsos y **coordinación**",
            "**Fuerza y potencia** de piernas",
            "**Técnica** de carrera",
            "Energía de los **fosfágenos (ATP-PCr)**: dura **≈ 10 s** al máximo",
          ]}
          b={b}
          a={0}
          paso={0.2}
          color={COL_F.fuerza}
        />
      </Tarjeta>
      <div style={{ position: "absolute", left: 640, top: 600, width: 1220, fontFamily: FUENTE, color: C.texto, background: "rgba(4,9,20,0.88)", borderRadius: 16, padding: "16px 24px", borderLeft: `6px solid ${COL_F.vel}`, opacity: entre(b, 1, 1.15) }}>
        <div style={{ fontSize: 36, fontWeight: 900, color: COL_F.vel }}>Velocidad = longitud × frecuencia de zancada</div>
        <div style={{ fontSize: 27, marginTop: 6 }}>Bolt en su punto máximo: ≈ 2.7 m por zancada × ≈ 4.5 zancadas/s ≈ <b style={{ color: COL_F.vel }}>12 m/s (≈ 44 km/h)</b></div>
      </div>
    </AbsoluteFill>
  );
};

const Metodos: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const REGLAS = [
    { n: "Máxima intensidad", t: "Más del **95 %**: si no es al máximo, no es velocidad", c: COL_F.fuerza },
    { n: "Distancias cortas", t: "**10 a 60 m**, menos de **10 s**", c: COL_F.vel },
    { n: "Pausa completa", t: "≈ **1 min por cada 10 m** (2–5 min): reponer la PCr", c: COL_F.res },
    { n: "Sin fatiga", t: "Al **inicio** de la sesión y con **volumen bajo**", c: COL_F.flex },
  ];
  return (
    <Fondo>
      <div style={{ position: "absolute", left: 90, right: 90, top: 130, fontFamily: FUENTE, color: C.texto }}>
        <div style={{ fontSize: 40, fontWeight: 900, marginBottom: 16 }}>Reglas del entrenamiento de velocidad</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
          {REGLAS.map((r, i) => {
            const op = entre(b, i * 0.2, i * 0.2 + 0.2);
            return (
              <div key={r.n} style={{ opacity: op, background: "rgba(4,9,20,0.86)", borderTop: `6px solid ${r.c}`, borderRadius: 14, padding: "16px 18px", minHeight: 170 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: r.c }}>{r.n}</div>
                <div style={{ fontSize: 25, marginTop: 8 }}>
                  <Rico t={r.t} color={r.c} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, opacity: entre(b, 1, 1.15) }}>
          {[
            { n: "Reacción", t: "Salidas ante **señales** (sonido, vista, tacto)" },
            { n: "Aceleración", t: "**Salidas**, cuestas cortas, **arrastres de trineo**" },
            { n: "Velocidad máxima", t: "**Sprints lanzados**, pliometría y **fuerza**" },
          ].map((m, i) => (
            <div key={m.n} style={{ opacity: entre(b, 1 + i * 0.2, 1.2 + i * 0.2), background: "rgba(4,9,20,0.86)", borderLeft: `6px solid ${C.acento}`, borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: C.acento }}>{m.n}</div>
              <div style={{ fontSize: 25, marginTop: 6 }}>
                <Rico t={m.t} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Fondo>
  );
};

const Evaluacion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const t = b < 1 ? Math.min(4.2, lineal(b, 0.2, 0.9) * 4.2) : 4.2;
  return (
    <AbsoluteFill>
      <Atleta b={b} modo="sprint" color={COL_F.vel} brilla={0.4} />
      <Indicador x={380} y={600} valor={t.toFixed(2)} unidad="s · 30 m" color={COL_F.vel} />
      <Pasos
        b={b}
        x={640}
        y={130}
        w={1220}
        titulo="Evaluar la velocidad"
        color={COL_F.vel}
        tam={29}
        lineas={[
          { a: 0, t: "**Sprint de 30 m** o de **40 yardas** (36.6 m)" },
          { a: 0.2, t: "Con **fotocélulas**: el cronómetro manual tiene más error" },
          { a: 0.4, t: "Se toma el **mejor de 2–3 intentos**, con pausa completa" },
          { a: 1, t: "Ejemplo: 30 m en **4.2 s**", color: COL_F.vel },
          { a: 1.15, t: "30 ÷ 4.2 = **7.1 m/s** · × 3.6 = **25.7 km/h**", grande: true, color: COL_F.vel },
          { a: 1.5, t: "También: **tiempo de reacción** y saltos (potencia)" },
        ]}
      />
    </AbsoluteFill>
  );
};

// ---- Repaso -------------------------------------------------------------------------

const Repaso: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cards = [
    { n: "5.1 Fuerza", c: COL_F.fuerza, a: 0, l: ["Máxima · resistencia · explosiva", "Continuo: 1–3 / 4–6 / 8–12 / 15+", "Hipertrofia de 1 a 30 rep cerca del fallo", "1RM directo o **Brzycki**"] },
    { n: "5.2 Resistencia", c: COL_F.res, a: 0.4, l: ["Aeróbica ≈ 65 % VO₂máx", "Zonas 1–5 · **FatMax** en zona 3", "Continuos e interválicos · 80/20", "Cooper · 3 000 m · Yo-Yo"] },
    { n: "5.3 Flexibilidad", c: COL_F.flex, a: 1, l: ["Estática y dinámica", "Estático 10–30 s · **FNP**", "Dinámico antes, estático después", "Sit and reach · goniometría · FMS"] },
    { n: "5.4 Velocidad", c: COL_F.vel, a: 1.4, l: ["Reacción · aceleración · máxima", "Máximo, corto, **pausa completa**", "Longitud × frecuencia de zancada", "30 m o 40 yardas"] },
  ];
  return (
    <Fondo>
      <div style={{ position: "absolute", left: 60, right: 60, top: 130, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, fontFamily: FUENTE, color: C.texto }}>
        {cards.map((k) => {
          const op = entre(b, k.a, k.a + 0.2);
          return (
            <div key={k.n} style={{ opacity: op, transform: `translateY(${(1 - op) * 20}px)`, background: "rgba(4,9,20,0.86)", borderRadius: 16, padding: "18px 20px", borderTop: `6px solid ${k.c}` }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: k.c, marginBottom: 12 }}>{k.n}</div>
              <div style={{ fontSize: 25 }}>
                <Lista items={k.l} color={k.c} />
              </div>
            </div>
          );
        })}
      </div>
    </Fondo>
  );
};

const Preguntas: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const q = b < 1 ? 0 : 1;
  const pregs = [
    { p: "Levantas 100 kg × 5 repeticiones: ¿tu 1RM estimado (Brzycki)?", r: ["1.0278 − 0.0278 × 5 = 0.889", "100 ÷ 0.889 ≈ **112.5 kg**"] },
    { p: "Antes de un sprint, ¿estiramiento estático largo o dinámico?", r: ["**Dinámico**", "El estático largo (> 60 s) baja la **fuerza y la velocidad**"] },
  ];
  const pr = pregs[q];
  return (
    <AbsoluteFill>
      <Atleta b={b} modo={q === 0 ? "sentadilla" : "sprint"} color={COL_F.vel} brilla={0.3} />
      <div key={q} style={{ position: "absolute", left: 700, top: 150, width: 1160, fontFamily: FUENTE, color: C.texto }}>
        <div style={{ fontSize: 28, color: C.acento2, fontWeight: 800, letterSpacing: 3 }}>PREGUNTA DE REPASO {q + 1}</div>
        <div style={{ fontSize: 42, fontWeight: 900, marginTop: 10, opacity: entre(b, q, q + 0.15) }}>{pr.p}</div>
        <div style={{ marginTop: 26, background: "rgba(4,9,20,0.88)", borderRadius: 16, padding: "20px 28px", borderLeft: `6px solid ${COL_F.flex}`, fontSize: 34 }}>
          {pr.r.map((t, i) => (
            <div key={t} style={{ opacity: entre(b, q + 0.35 + i * 0.2, q + 0.45 + i * 0.2), marginBottom: 8 }}>
              <Rico t={t} color={COL_F.flex} />
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Final: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, opacity: 0.6 }}>
        <Atleta b={b} modo="salta" dx={-480} color={COL_F.vel} brilla={0.3} />
      </div>
      <TituloGrande b={b} a={0} z={1.2} sup="Unidad 5" t="¡A entrenar con método!" sub="Fuerza · Resistencia aeróbica · Flexibilidad · Velocidad" />
    </AbsoluteFill>
  );
};

export const F4: PlanoDef[] = [
  {
    id: "f-vel-def",
    seccion: SEC,
    textos: [
      "La **velocidad** es la capacidad de realizar una acción en el **menor tiempo posible**. Puede ser **gestual**, la rapidez de un gesto técnico como un saque de tenis, o **de desplazamiento**, el tiempo para recorrer una distancia, como en los 100 metros.",
      "En un sprint hay varias fases. Primero el **tiempo de reacción**, de unas **15 a 20 centésimas de segundo**; después la **aceleración**, en los primeros 20 a 30 metros.",
      "Luego la **velocidad máxima**, entre los 30 y 60 metros; y al final, la **resistencia a la velocidad**, que es mantenerla mientras aparece la fatiga.",
    ],
    Escena: Definicion,
  },
  {
    id: "f-vel-factores",
    seccion: SEC + " · Factores",
    textos: [
      "Depende de las **fibras rápidas tipo II**, muy ligadas a la **genética**; del **sistema nervioso** y la coordinación; de la **fuerza y la potencia** de piernas; de la **técnica**; y de los **fosfágenos**, que dan energía máxima durante unos **10 segundos**.",
      "Además, **velocidad = longitud de zancada × frecuencia de zancada**. En su punto máximo, Usain Bolt daba unos 2.7 metros por zancada a unas 4.5 zancadas por segundo: unos **12 metros por segundo**, alrededor de **44 kilómetros por hora**.",
    ],
    Escena: Factores,
  },
  {
    id: "f-vel-metodos",
    seccion: SEC + " · Metodología",
    textos: [
      "Reglas del entrenamiento de velocidad: **intensidad máxima**, por encima del 95 %; **distancias cortas**, de 10 a 60 metros; **pausa completa**, alrededor de **1 minuto por cada 10 metros**, para reponer la fosfocreatina; y **sin fatiga**, al inicio de la sesión y con poco volumen.",
      "Métodos según la fase: para la **reacción**, salidas ante señales; para la **aceleración**, salidas, cuestas cortas y **arrastres de trineo**; y para la **velocidad máxima**, **sprints lanzados**, pliometría y trabajo de **fuerza**.",
    ],
    Escena: Metodos,
  },
  {
    id: "f-vel-evaluacion",
    seccion: SEC + " · Evaluación",
    textos: [
      "Se evalúa con un **sprint de 30 metros** o de **40 yardas**, de preferencia con **fotocélulas**, tomando el **mejor de 2 o 3 intentos** con pausa completa.",
      "Ejemplo: 30 metros en **4.2 segundos**: 30 ÷ 4.2 = **7.1 metros por segundo**, que multiplicado por 3.6 da **25.7 kilómetros por hora**. También se mide el **tiempo de reacción** y los **saltos**.",
    ],
    Escena: Evaluacion,
  },
  {
    id: "f-repaso",
    seccion: "Repaso",
    textos: [
      "**Resumen.** Fuerza: máxima, resistencia y explosiva; el continuo de repeticiones; hipertrofia de 1 a 30 repeticiones cerca del fallo. Resistencia aeróbica: zonas, **FatMax**, métodos continuos e interválicos y el modelo 80/20.",
      "Flexibilidad: estática y dinámica; **dinámico antes**, estático y FNP **después**. Velocidad: reacción, aceleración y velocidad máxima, siempre **al máximo, corta y con pausa completa**.",
    ],
    Escena: Repaso,
  },
  {
    id: "f-preguntas",
    seccion: "Repaso · Preguntas",
    textos: [
      "Pregunta: si levantas **100 kilos 5 veces**, ¿cuál es tu 1RM estimado? 1.0278 − 0.0278 × 5 = 0.889, y 100 ÷ 0.889 ≈ **112.5 kilos**.",
      "Otra: antes de un sprint, ¿estiramiento estático largo o dinámico? **Dinámico**, porque el estático de más de 60 segundos baja la fuerza y la velocidad.",
    ],
    Escena: Preguntas,
  },
  {
    id: "f-final",
    seccion: "",
    textos: [
      "Con esto ya tienes la Unidad 5 completa. ¡A entrenar con método!",
    ],
    Escena: Final,
  },
];
