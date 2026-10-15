import React from "react";
import { AbsoluteFill } from "remotion";
import { entre, lineal, mix, PlanoDef, useBeat } from "../motor";
import { C, FUENTE } from "../tema";
import { Lista, Rico, Tarjeta, TituloGrande } from "../ui";
import { Fondo, FiguraIzq } from "../actividad/a1";
import { Corazon } from "../actividad/a2";
import { COL_K, Curvas, Indicador, Pasos } from "./comun";

const SEC = "3.1 Frecuencia cardiaca";

/** Corazon 3D latiendo, colocado a la izquierda. */
export const CorazonIzq: React.FC<{ b: number; lpm: number; dx?: number }> = ({ b, lpm, dx = -560 }) => (
  <div style={{ position: "absolute", left: dx, top: -60, width: 1920, height: 1080 }}>
    <Corazon b={b} lpm={lpm} />
  </div>
);

// ---- Portada ---------------------------------------------------------------

const Portada: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, opacity: 0.55 }}>
        <Corazon b={b} lpm={mix(70, 150, entre(b, 0.5, 1.8))} />
      </div>
      <TituloGrande
        b={b}
        a={0}
        z={2}
        sup="Unidad 3 · Fisiología del ejercicio"
        t="Sistema cardiovascular"
        sub="Adaptaciones y respuestas al ejercicio · FC · VO₂ · Deuda de O₂ · MET · Control por FC"
      />
    </AbsoluteFill>
  );
};

// ---- Que es la FC y quien la controla -------------------------------------------

const Definicion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const lpm = b < 2 ? 70 : b < 2.5 ? mix(70, 55, entre(b, 2, 2.4)) : mix(55, 150, entre(b, 2.5, 2.9));
  return (
    <AbsoluteFill>
      <CorazonIzq b={b} lpm={lpm} />
      <Indicador x={110} y={760} valor={String(Math.round(lpm))} unidad="lpm" color={COL_K.fc} />
      <Pasos
        b={b}
        x={760}
        y={130}
        w={1100}
        titulo="Frecuencia cardiaca (FC)"
        color={COL_K.fc}
        lineas={[
          { a: 0, t: "Número de **latidos del corazón por minuto** (lpm)" },
          { a: 0.3, t: "Se mide con el **pulso** o un **pulsómetro**" },
          { a: 1, t: "Marcapasos natural: **nodo sinoauricular** (aurícula derecha)" },
          { a: 1.3, t: "Por sí solo late a **≈ 100 lpm**" },
          { a: 2, t: "**Parasimpático (nervio vago)**: frena → baja la FC", color: COL_K.vs },
          { a: 2.4, t: "**Simpático + adrenalina**: acelera → sube la FC", color: COL_K.fc },
        ]}
      />
    </AbsoluteFill>
  );
};

// ---- Valores de referencia -----------------------------------------------------

const Valores: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const MIN = 30;
  const MAX = 210;
  const W = 1680;
  const px = (v: number) => ((v - MIN) / (MAX - MIN)) * W;
  const tramos = [
    { a: 30, z: 60, t: "Bradicardia", c: COL_K.vs },
    { a: 60, z: 100, t: "Normal en reposo", c: COL_K.o2 },
    { a: 100, z: 210, t: "Taquicardia (en reposo)", c: COL_K.rojo },
  ];
  const marcas = [
    { v: 45, t: "Atleta de resistencia: 40–50", a: 1 },
    { v: 72, t: "Adulto promedio: ≈ 70", a: 0.4 },
    { v: 190, t: "FC máx. (20 años): ≈ 200", a: 1.4 },
  ];
  return (
    <Fondo>
      <div style={{ position: "absolute", left: 120, top: 150, fontFamily: FUENTE, color: C.texto }}>
        <div style={{ fontSize: 40, fontWeight: 900, marginBottom: 40 }}>Valores de FC</div>
        <div style={{ position: "relative", width: W, height: 90 }}>
          {tramos.map((t, i) => (
            <div key={t.t} style={{ position: "absolute", left: px(t.a), width: px(t.z) - px(t.a), height: 80, background: t.c, opacity: 0.2 + 0.7 * entre(b, i * 0.2, i * 0.2 + 0.2), borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#08121f", fontWeight: 900, fontSize: 28 }}>
              {t.t}
            </div>
          ))}
        </div>
        <div style={{ position: "relative", width: W, height: 40 }}>
          {[30, 60, 100, 150, 200].map((v) => (
            <div key={v} style={{ position: "absolute", left: px(v) - 30, width: 60, textAlign: "center", fontSize: 24, color: C.suave }}>
              {v}
            </div>
          ))}
        </div>
        <div style={{ position: "relative", width: W, height: 260 }}>
          {marcas.map((m, i) => (
            <div key={m.t} style={{ position: "absolute", left: px(m.v), top: 10 + i * 70, opacity: entre(b, m.a, m.a + 0.15), display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 4, height: 50, background: C.acento2 }} />
              <div style={{ fontSize: 28, fontWeight: 800, whiteSpace: "nowrap", transform: m.v > 150 ? "translateX(-110%)" : undefined }}>{m.t}</div>
            </div>
          ))}
        </div>
      </div>
    </Fondo>
  );
};

// ---- Respuesta durante el ejercicio ---------------------------------------------

// Tiempo 0..1: reposo hasta 0.15, inicio del ejercicio en 0.2, fin en 0.7.
const fcTiempo = (x: number) => {
  const reposo = 0.25;
  const estable = 0.62;
  if (x < 0.12) return reposo;
  if (x < 0.2) return mix(reposo, 0.33, (x - 0.12) / 0.08); // respuesta anticipatoria
  if (x < 0.7) return estable - (estable - 0.33) * Math.exp(-(x - 0.2) / 0.05) + (x - 0.2) * 0.04;
  return reposo + (estable + 0.02 - reposo) * Math.exp(-(x - 0.7) / 0.07);
};

const Respuesta: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const dos = b >= 2;
  return (
    <Fondo>
      <div style={{ position: "absolute", left: 90, top: 120, fontFamily: FUENTE, fontSize: 36, fontWeight: 900, color: C.texto }}>
        {dos ? "FC frente a la intensidad" : "FC durante una sesión de ejercicio"}
      </div>
      {!dos ? (
        <Curvas
          x={90}
          y={180}
          w={1740}
          h={560}
          series={[{ f: fcTiempo, color: COL_K.fc, hasta: lineal(b, 0.05, 1.9) }]}
          ejeX="Tiempo"
          ejeY="FC (lpm)"
          ticksY={["", "", "", "", ""]}
          areas={[
            { x0: 0.12, x1: 0.2, color: C.acento2, t: "Anticipatoria", op: entre(b, 0.3, 0.45) },
            { x0: 0.2, x1: 0.32, color: COL_K.rojo, t: "Subida rápida", op: entre(b, 0.6, 0.75) },
            { x0: 0.32, x1: 0.7, color: COL_K.o2, t: "Estado estable", op: entre(b, 1, 1.15) },
            { x0: 0.7, x1: 1, color: COL_K.vs, t: "Recuperación", op: entre(b, 1.5, 1.65) },
          ]}
        />
      ) : (
        <Curvas
          x={90}
          y={180}
          w={1100}
          h={560}
          series={[{ f: (x) => 0.2 + x * 0.72 - (x > 0.85 ? (x - 0.85) * 1.2 : 0) * 0.3, color: COL_K.fc, hasta: lineal(b, 2.05, 2.8), t: "FC máx." }]}
          ejeX="Intensidad (% VO₂máx)"
          ejeY="FC (lpm)"
          ticksX={["Reposo", "25 %", "50 %", "75 %", "100 %"]}
        />
      )}
      {dos ? (
        <Tarjeta b={b} a={2} z={3} x={1230} y={180} w={600} titulo="Relación lineal" color={COL_K.fc} tam={28}>
          <Lista items={["A más intensidad, **más FC**", "Hasta llegar a la **FC máxima**", "Por eso la FC sirve para **controlar la intensidad**"]} b={b} a={2.1} paso={0.2} color={COL_K.fc} />
        </Tarjeta>
      ) : null}
    </Fondo>
  );
};

// ---- Gasto cardiaco -----------------------------------------------------------------

const Gasto: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const lpm = b < 1 ? 70 : mix(70, 190, entre(b, 1, 1.5));
  return (
    <AbsoluteFill>
      <CorazonIzq b={b} lpm={lpm} />
      <Indicador x={110} y={760} valor={String(Math.round(lpm))} unidad="lpm" color={COL_K.fc} />
      <Pasos
        b={b}
        x={760}
        y={130}
        w={1100}
        titulo="Gasto cardiaco (Q)"
        color={COL_K.vs}
        lineas={[
          { a: 0, t: "Litros de sangre que bombea el corazón **por minuto**" },
          { a: 0.3, t: "**Q = FC × volumen sistólico (VS)**", grande: true, color: COL_K.vs },
          { a: 0.6, t: "VS: sangre expulsada **en cada latido**" },
          { a: 1, t: "Reposo: 70 × 70 ml ≈ **5 L/min**" },
          { a: 1.4, t: "Ejercicio máximo: 190 × 120 ml ≈ **23 L/min**" },
          { a: 1.7, t: "Atletas de élite: **hasta 35–40 L/min**", color: COL_K.o2 },
          { a: 2, t: "El VS sube hasta **≈ 40–60 % del VO₂máx**; después, el aumento depende sobre todo de la **FC**" },
        ]}
      />
    </AbsoluteFill>
  );
};

// ---- Adaptaciones al entrenamiento -------------------------------------------------

const Adaptaciones: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const deriva = b >= 2;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: -260, top: 0, width: 1920, height: 1080 }}>
        <FiguraIzq b={b} modo="corre" brilla={deriva ? 0.5 + 0.2 * Math.sin(b * 8) : 0.3} colorBrillo={deriva ? COL_K.rojo : COL_K.o2} />
      </div>
      {!deriva ? (
        <>
          <Tarjeta b={b} a={0} z={2} x={700} y={130} w={1160} titulo="Adaptaciones al entrenamiento aeróbico" color={COL_K.o2} tam={29}>
            <Lista
              items={[
                "**Bradicardia de reposo**: la FC basal baja (atletas 40–50 lpm)",
                "**Más volumen sistólico**: el corazón bombea más en cada latido",
                "**Misma intensidad, menos FC**: el esfuerzo cuesta menos",
                "**Recuperación más rápida** de la FC al terminar",
              ]}
              b={b}
              a={0}
              paso={0.2}
              color={COL_K.o2}
            />
          </Tarjeta>
          <Tarjeta b={b} a={1} z={2} x={700} y={520} w={560} titulo="Resistencia" color={COL_K.vs} tam={26}>
            <Rico t="Cavidad del ventrículo **más grande** (hipertrofia **excéntrica**): más volumen." />
          </Tarjeta>
          <Tarjeta b={b} a={1.3} z={2} x={1300} y={520} w={560} titulo="Fuerza" color={COL_K.fc} tam={26}>
            <Rico t="Pared del ventrículo **más gruesa** (hipertrofia **concéntrica**): más presión." />
          </Tarjeta>
        </>
      ) : (
        <>
          <Curvas
            x={700}
            y={130}
            w={1160}
            h={460}
            series={[
              { f: () => 0.35, color: C.suave, punteada: true, hasta: entre(b, 2, 2.2) },
              { f: (x) => 0.35 + x * 0.35, color: COL_K.rojo, hasta: lineal(b, 2.1, 2.8), t: "FC" },
            ]}
            ejeX="Tiempo a la misma intensidad (min)"
            ejeY="FC"
            ticksX={["0", "20", "40", "60"]}
          />
          <Tarjeta b={b} a={2.3} z={3} x={700} y={620} w={1160} titulo="Deriva cardiovascular" color={COL_K.rojo} tam={27}>
            <Rico t="En esfuerzos largos, sobre todo con **calor** y **deshidratación**, el VS baja y la **FC sube** aunque la intensidad no cambie." />
          </Tarjeta>
        </>
      )}
    </AbsoluteFill>
  );
};

export const K1: PlanoDef[] = [
  {
    id: "k-portada",
    seccion: "",
    textos: [
      "**Unidad 3: Sistema cardiovascular, adaptaciones y respuestas al ejercicio.** El corazón y los vasos son el sistema que lleva el oxígeno hasta el músculo que trabaja.",
      "Veremos la **frecuencia cardiaca**, el **consumo de oxígeno y el VO₂máx**, la **deuda de oxígeno**, los **METs** y cómo **controlar la intensidad con la frecuencia cardiaca**.",
    ],
    Escena: Portada,
  },
  {
    id: "k-fc-def",
    seccion: SEC,
    textos: [
      "La **frecuencia cardiaca** es el número de **latidos del corazón por minuto**. Se mide tomando el **pulso** o con un **pulsómetro**.",
      "El marcapasos natural del corazón es el **nodo sinoauricular**, en la aurícula derecha. Por sí solo marcaría unos **100 latidos por minuto**.",
      "El **sistema nervioso autónomo** la ajusta: el **parasimpático**, por el **nervio vago**, la frena; el **simpático** y la **adrenalina** la aceleran.",
    ],
    Escena: Definicion,
  },
  {
    id: "k-fc-valores",
    seccion: SEC + " · Valores",
    textos: [
      "En reposo, lo normal en un adulto es entre **60 y 100 latidos por minuto**, con un promedio cercano a **70**.",
      "Por debajo de 60 se llama **bradicardia**, y en **atletas de resistencia** es normal ver **40 a 50**. Por encima de 100 en reposo es **taquicardia**. La FC máxima de alguien de 20 años ronda los **200**.",
    ],
    Escena: Valores,
  },
  {
    id: "k-fc-respuesta",
    seccion: SEC + " · Respuesta al ejercicio",
    textos: [
      "Antes de empezar, la FC ya sube un poco: es la **respuesta anticipatoria**, por el simpático. Al iniciar el ejercicio **sube rápido** durante los primeros minutos.",
      "Si la intensidad es constante y submáxima, a los **2 o 3 minutos** se alcanza un **estado estable**. Al terminar, la FC **baja rápido** al principio y luego más lento: es la **recuperación**.",
      "Si la intensidad va aumentando, la FC sube **de forma casi lineal** hasta llegar a la **FC máxima**. Por eso la FC es tan útil para **controlar la intensidad**.",
    ],
    Escena: Respuesta,
  },
  {
    id: "k-gasto",
    seccion: SEC + " · Gasto cardiaco",
    textos: [
      "La FC es parte del **gasto cardiaco**, los litros de sangre que bombea el corazón por minuto: **gasto cardiaco = FC × volumen sistólico**, que es la sangre expulsada en cada latido.",
      "En reposo: 70 latidos por 70 mililitros, unos **5 litros por minuto**. En ejercicio máximo: 190 por 120 mililitros, unos **23 litros por minuto**; en atletas de élite puede llegar a **35 o 40**.",
      "El volumen sistólico aumenta hasta el **40 o 60 % del VO₂máx**; a partir de ahí, el gasto cardiaco sube sobre todo por el aumento de la **FC**.",
    ],
    Escena: Gasto,
  },
  {
    id: "k-adaptaciones",
    seccion: SEC + " · Adaptaciones",
    textos: [
      "Con el entrenamiento aeróbico aparecen **adaptaciones**: **bradicardia de reposo**, **mayor volumen sistólico**, **menor FC a la misma intensidad** y una **recuperación más rápida**.",
      "El corazón también cambia de forma: en **resistencia**, el ventrículo izquierdo **agranda su cavidad** (hipertrofia excéntrica); en **fuerza**, **engrosa su pared** (hipertrofia concéntrica). Es el llamado **corazón de atleta**.",
      "Ojo con la **deriva cardiovascular**: en esfuerzos largos, sobre todo con **calor y deshidratación**, el volumen sistólico baja y la **FC sube** aunque la intensidad sea la misma.",
    ],
    Escena: Adaptaciones,
  },
];
