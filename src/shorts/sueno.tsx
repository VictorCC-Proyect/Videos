// Short: ¿Qué le pasa a tu músculo mientras duermes? Fases del sueño, GH, atonía REM, síntesis de proteína nocturna.
// Fuentes: Lamon et al. 2021 (Physiol Rep), Trommelen et al. 2023 (Sports Med), Snijders et al. 2019 (Front Nutr), Nedeltcheva et al. 2010 (Ann Intern Med).
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
    pregunta={<>¿Cuántas <span style={{ color: K.lima }}>horas</span> duermes?</>}
    escribe="Duermo…"
    ideas={["MENOS DE 6", "6 A 7", "8 O MÁS"]}
  />
);

const T = [
  "En el video de hipertrofia te dije que el músculo crece en el descanso. Hoy vamos a ver qué le pasa a tu músculo **mientras duermes**.",
  "Al dormir pasas por ciclos de unos **noventa minutos**: sueño ligero, sueño **profundo** y sueño **REM**.",
  "En el sueño profundo, sobre todo al inicio de la noche, tu hipófisis libera el pulso más grande del día de **hormona del crecimiento**.",
  "En el sueño REM tu cerebro sueña, pero tus músculos quedan casi **paralizados**: es una protección para que no actúes lo que sueñas.",
  "Mientras tanto, tu fibra sigue en obra: la **síntesis de proteína** que activaste al entrenar continúa durante la noche.",
  "Pero dormir también es un **ayuno** de siete u ocho horas. Sin aminoácidos llegando, el balance de proteína tiende a ser **negativo**.",
  "Por eso, tomar unos **cuarenta gramos de proteína** antes de dormir aumenta la síntesis de proteína durante la noche. Y da igual si es caseína o suero.",
  "¿Y si duermes mal? Una sola noche sin dormir bajó la síntesis de proteína un **dieciocho por ciento**, subió el **cortisol** y bajó la **testosterona**.",
  "Y en personas a dieta, dormir **cinco horas y media** en vez de ocho y media hizo que perdieran más **músculo** y menos grasa.",
  "Para aprovechar la noche: duerme de **siete a nueve horas**, con horarios regulares, en un cuarto oscuro y fresco, y evita la cafeína por la tarde.",
  "¿Cuántas horas duermes normalmente? **Escríbelo en los comentarios**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), Final];

export const SUENO: ShortDef = {
  id: "Short-Sueno",
  titulo: "¿Qué le pasa a tu músculo mientras duermes?",
  planos: ESCENAS.map((Escena, i) => ({ id: `sueno-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
