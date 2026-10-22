import React from "react";
import { AbsoluteFill } from "remotion";
import { entre, mix, PlanoDef, useBeat } from "../motor";
import { C, FUENTE } from "../tema";
import { Lista, Rico, Tabla, Tarjeta } from "../ui";
import { Fondo } from "../actividad/a1";
import { Pasos } from "../cardio/comun";
import { Atleta, COL_F } from "./comun";

const SEC = "5.3 Entrenamiento de la flexibilidad";

const Definicion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <AbsoluteFill>
      <Atleta b={b} modo="estira" color={COL_F.flex} brilla={0.35} />
      <Pasos
        b={b}
        x={640}
        y={130}
        w={1220}
        titulo="Flexibilidad"
        color={COL_F.flex}
        tam={28}
        lineas={[
          { a: 0, t: "Capacidad de mover una articulación en su **máxima amplitud de movimiento (ADM)**" },
          { a: 0.3, t: "Suma la **movilidad articular** y la **elasticidad** de músculos, tendones y fascia" },
          { a: 1, t: "**Estática**: amplitud máxima sostenida, **sin velocidad**", color: COL_F.flex },
          { a: 1.25, t: "**Dinámica**: amplitud **durante un movimiento** con velocidad", color: COL_F.vel },
          { a: 2, t: "Factores: **tipo de articulación**, **edad** (baja con los años), **sexo** (mayor en mujeres), **temperatura** y **hora del día**" },
        ]}
      />
    </AbsoluteFill>
  );
};

const METODOS = [
  ["Estático", "Llevar al punto de tensión y mantener 10–30 s", "2–4 repeticiones · ≈ 60 s por músculo"],
  ["Dinámico", "Movimientos controlados en todo el rango", "Ideal en el calentamiento"],
  ["FNP (contraer-relajar)", "Contraer 3–6 s al 20–75 % y luego estirar 10–30 s", "El que más ADM gana; con ayuda"],
  ["Balístico", "Rebotes al final del rango", "Riesgo de lesión; solo avanzados"],
];

const Metodos: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const visibles = b < 1 ? 2 : 4;
  return (
    <Fondo>
      <div style={{ position: "absolute", left: 90, right: 90, top: 130, fontFamily: FUENTE, color: C.texto }}>
        <div style={{ fontSize: 40, fontWeight: 900, marginBottom: 14 }}>Métodos de estiramiento</div>
        <div style={{ background: "rgba(4,9,20,0.9)", borderRadius: 14, padding: "10px 16px" }}>
          <Tabla tam={27} anchos="1fr 1.8fr 1.4fr" cab={["Método", "Cómo se hace", "Dosis / uso"]} filas={METODOS.slice(0, visibles)} b={b} a={0} paso={0.25} />
        </div>
        <div style={{ marginTop: 20, fontSize: 30, background: "rgba(4,9,20,0.88)", borderLeft: `6px solid ${COL_F.flex}`, borderRadius: 12, padding: "14px 22px", opacity: entre(b, 2, 2.15) }}>
          <Rico t="Recomendación general (ACSM): estirar los grandes grupos musculares **al menos 2 a 3 días por semana**; a diario da mejores resultados." color={COL_F.flex} />
        </div>
      </div>
    </Fondo>
  );
};

const Cuando: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <AbsoluteFill>
      <Atleta b={b} modo={b < 1 ? "estira" : "sprint"} color={b < 1 ? COL_F.flex : COL_F.vel} brilla={0.3} />
      <Tarjeta b={b} a={0} z={2} x={640} y={130} w={590} titulo="Antes de entrenar" color={COL_F.vel} tam={27}>
        <Lista items={["Calentamiento **dinámico**", "Estático largo (**> 60 s**) baja un poco la **fuerza y la velocidad**", "Si se hace estático, que sea **corto**"]} b={b} a={0.1} paso={0.25} color={COL_F.vel} />
      </Tarjeta>
      <Tarjeta b={b} a={0.6} z={2} x={1270} y={130} w={590} titulo="Después o aparte" color={COL_F.flex} tam={27}>
        <Lista items={["Estático y **FNP** al final o en otra sesión", "Ahí sí se busca **ganar amplitud**", "Con el músculo **caliente**"]} b={b} a={0.7} paso={0.25} color={COL_F.flex} />
      </Tarjeta>
      <div style={{ position: "absolute", left: 640, top: 560, width: 1220, fontFamily: FUENTE, fontSize: 30, color: C.texto, background: "rgba(4,9,20,0.86)", borderLeft: `6px solid ${COL_F.fuerza}`, borderRadius: 12, padding: "16px 24px", opacity: entre(b, 1, 1.15) }}>
        <Rico t="Más no siempre es mejor: un deportista necesita la flexibilidad **que exige su deporte**. El exceso, sin control muscular, también puede lesionar." color={COL_F.fuerza} />
      </div>
    </AbsoluteFill>
  );
};

const Evaluacion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const alcance = b < 1 ? mix(-5, 12, (Math.sin(b * 3) + 1) / 2) : 12;
  return (
    <AbsoluteFill>
      <Atleta b={b} modo="estira" color={COL_F.flex} brilla={0.3} />
      {b < 1 ? (
        <Pasos
          b={b}
          x={640}
          y={130}
          w={1220}
          titulo="Sit and reach (test del cajón)"
          color={COL_F.flex}
          tam={28}
          lineas={[
            { a: 0, t: "Sentado, piernas estiradas, se lleva la mano lo más lejos posible sobre el cajón" },
            { a: 0.2, t: `Alcance: **${alcance.toFixed(0)} cm**`, grande: true, color: COL_F.flex },
            { a: 0.5, t: "Debate: ¿mide **isquiosurales** o la movilidad de la **columna**?", color: COL_F.fuerza },
          ]}
        />
      ) : (
        <>
          <Tarjeta b={b} a={1} z={3} x={640} y={130} w={590} titulo="Goniometría" color={COL_F.vel} tam={27}>
            <Lista items={["Mide la amplitud **en grados**", "Articulación por articulación", "Ej.: flexión de cadera ≈ **120°**"]} b={b} a={1.1} paso={0.2} color={COL_F.vel} />
          </Tarjeta>
          <Tarjeta b={b} a={2} z={3} x={1270} y={130} w={590} titulo="FMS" color={COL_F.morado} tam={27}>
            <Lista items={["**Functional Movement Screen**", "**7 patrones** de movimiento", "Cada uno de **0 a 3** puntos → **máximo 21**", "**14 o menos**: más riesgo de lesión"]} b={b} a={2.1} paso={0.2} color={COL_F.morado} />
          </Tarjeta>
        </>
      )}
    </AbsoluteFill>
  );
};

export const F3: PlanoDef[] = [
  {
    id: "f-flex-def",
    seccion: SEC,
    textos: [
      "La **flexibilidad** es la capacidad de mover una articulación en su **máxima amplitud de movimiento**. Suma la **movilidad de la articulación** y la **elasticidad** de músculos, tendones y fascia.",
      "Se divide en **estática**, la amplitud máxima sostenida **sin velocidad**, y **dinámica**, la amplitud que se alcanza **durante un movimiento** con velocidad.",
      "Depende del **tipo de articulación**, de la **edad**, porque disminuye con los años, del **sexo**, ya que suele ser mayor en mujeres, de la **temperatura** del músculo y hasta de la **hora del día**.",
    ],
    Escena: Definicion,
  },
  {
    id: "f-flex-metodos",
    seccion: SEC + " · Métodos",
    textos: [
      "Métodos: el **estiramiento estático**, llevar el músculo al punto de tensión y **mantener de 10 a 30 segundos**, de 2 a 4 repeticiones; y el **dinámico**, movimientos controlados en todo el rango, ideal para el **calentamiento**.",
      "La **facilitación neuromuscular propioceptiva, o FNP**: **contraer** el músculo 3 a 6 segundos y luego **estirarlo** 10 a 30 segundos; es el que más amplitud gana. Y el **balístico**, con rebotes, que tiene **más riesgo** y se reserva para deportistas avanzados.",
      "La recomendación general es estirar los grandes grupos musculares **al menos 2 a 3 días por semana**, y si es a diario, mejor.",
    ],
    Escena: Metodos,
  },
  {
    id: "f-flex-cuando",
    seccion: SEC + " · ¿Cuándo estirar?",
    textos: [
      "¿Cuándo estirar? **Antes de entrenar**, mejor un calentamiento **dinámico**: los estiramientos estáticos largos, de **más de 60 segundos**, pueden **bajar un poco la fuerza y la velocidad**. El estático y la FNP van **al final** o en una sesión aparte.",
      "Y más no siempre es mejor: cada deportista necesita la flexibilidad **que exige su deporte**; el exceso sin control muscular también puede provocar lesiones.",
    ],
    Escena: Cuando,
  },
  {
    id: "f-flex-evaluacion",
    seccion: SEC + " · Evaluación",
    textos: [
      "La prueba más conocida es el **sit and reach**, o **test del cajón**: sentado con las piernas estiradas, se mide hasta dónde llegan las manos. Pero hay **debate**: no está claro si mide la elasticidad de los **isquiosurales** o la movilidad de la **columna**.",
      "Por eso también se usa la **goniometría**, que mide la amplitud de cada articulación **en grados**; por ejemplo, la flexión de cadera ronda los **120 grados**.",
      "Y el **FMS**, o Functional Movement Screen: evalúa **7 patrones de movimiento** con una puntuación de **0 a 3** cada uno, hasta **21 puntos**. Una puntuación de **14 o menos** se asocia a **mayor riesgo de lesión**.",
    ],
    Escena: Evaluacion,
  },
];
