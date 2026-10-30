// Short: ¿El cardio te quita músculo? mTOR vs. PGC-1 y el efecto de interferencia.
// Fuentes: Holway, Nutrición sin dogmas, Tomo 1, 2.7.3 (pp. 82–84); Lundberg et al. 2022 (Sports Med).
import React from "react";
import { AbsoluteFill } from "remotion";
import { PlanoDef } from "../fisio/motor";
import { EscenaComentarios } from "./cierre";
import { K, ShortDef } from "./marco";

// BORRADOR: escenas vacías, se reemplazan por escenas 3D.
const Vacia: React.FC<{ textos: string[] }> = () => <AbsoluteFill />;

const Final: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Cardio y pesas el <span style={{ color: K.lima }}>mismo día</span>?</>}
    escribe="Yo hago…"
    ideas={["EL MISMO DÍA", "DÍAS SEPARADOS", "SOLO PESAS"]}
  />
);

const T = [
  "¿El cardio te quita músculo? Para responder hay que bajar a la célula: ahí compiten dos señales, **mTOR** y **PGC-1**.",
  "Como explica Francis Holway en Nutrición sin dogmas, cada tipo de entrenamiento le manda al músculo una señal **distinta**.",
  "La fuerza, la proteína y la insulina encienden **mTOR**: la llave maestra de la síntesis de proteína y de la **hipertrofia**.",
  "El cardio y el entrenamiento de fondo encienden **PGC-1**: la orden de fabricar más **mitocondrias**.",
  "Con PGC-1, tus fibras lentas usan mejor el oxígeno y te vuelves más **resistente**, pero no más grande.",
  "El problema es el **exceso**: muchas señales de PGC-1 pueden interferir con mTOR. Es el **efecto de interferencia**, y afecta sobre todo a la fuerza máxima.",
  "Además, el trabajo extra suma **fatiga**, y puede quitarte recuperación y técnica para lo que de verdad entrenas.",
  "Pero ojo: en los estudios, el tamaño total del músculo **casi no cambia** al sumar cardio. En las fibras el efecto es pequeño, y menor en bici que corriendo.",
  "Por eso, si un velocista necesita bajar grasa, la solución no es más cardio, sino ajustar la **dieta**. Carl Lewis bajaba así sus últimos **siete kilos** de grasa.",
  "Para ti: haz cardio por tu salud sin miedo, sepáralo de tus pesas cuando puedas, no lo exageres si buscas fuerza máxima, y cuida tu proteína.",
  "¿Tú haces cardio y pesas el mismo día? **Escríbelo en los comentarios**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), Final];

export const INTERFERENCIA: ShortDef = {
  id: "Short-Interferencia",
  titulo: "¿El cardio te quita músculo? mTOR vs. PGC-1",
  planos: ESCENAS.map((Escena, i) => ({ id: `interferencia-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
