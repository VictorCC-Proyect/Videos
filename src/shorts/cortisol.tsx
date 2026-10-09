// Short: Cortisol: ¿enemigo o aliado?
// (borrador: las escenas 3D se escriben en este archivo)
import React from "react";
import { AbsoluteFill } from "remotion";
import { PlanoDef } from "../fisio/motor";
import { EscenaCierre } from "./cierre";
import { ShortDef } from "./marco";

const Vacia: React.FC<{ textos: string[] }> = () => <AbsoluteFill />;

const T = [
  "El **cortisol** no es tu enemigo: es la hormona que te **despierta** cada mañana.",
  "Lo producen las **glándulas suprarrenales**, encima de los riñones, cuando tu cerebro detecta estrés.",
  "Durante el ejercicio, el cortisol ayuda a liberar **glucosa** y grasa para darte energía.",
  "El problema es cuando se queda **alto todo el día**: poco sueño, estrés constante o dietas demasiado estrictas.",
  "El cortisol alto por mucho tiempo favorece la degradación de **proteína muscular**, aumenta el apetito y la **grasa abdominal**.",
  "Lo que lo regula: **dormir** de 7 a 9 horas, comer suficiente, entrenar con descansos y manejar el estrés.",
  "Y no, no necesitas suplementos **anticortisol**.",
  "Sígueme para más **nutrición explicada con ciencia**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), EscenaCierre];

export const CORTISOL: ShortDef = {
  id: "Short-Cortisol",
  titulo: "Cortisol: ¿enemigo o aliado?",
  planos: ESCENAS.map((Escena, i) => ({ id: `cortisol-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
