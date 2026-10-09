// Short: Colágeno: ¿sirve tomarlo?
// (borrador: las escenas 3D se escriben en este archivo)
import React from "react";
import { AbsoluteFill } from "remotion";
import { PlanoDef } from "../fisio/motor";
import { EscenaCierre } from "./cierre";
import { ShortDef } from "./marco";

const Vacia: React.FC<{ textos: string[] }> = () => <AbsoluteFill />;

const T = [
  "¿El **colágeno** que tomas va directo a tu piel y a tus articulaciones? **No exactamente**.",
  "El colágeno es la proteína más abundante de tu cuerpo: forma **tendones**, ligamentos, piel y hueso.",
  "Cuando lo comes, tu intestino lo rompe en **aminoácidos** y péptidos pequeños, como a cualquier proteína.",
  "Luego tus células, los **fibroblastos**, usan esos aminoácidos para fabricar su propio colágeno donde haga falta.",
  "Y para armarlo necesitan **vitamina C**.",
  "Algunos estudios sugieren que **15 gramos** de colágeno con vitamina C, una hora antes de entrenar, aumentan la síntesis de colágeno en los tendones.",
  "Pero no reemplaza lo básico: **proteína suficiente**, carga progresiva y descanso.",
  "Sígueme para más **nutrición explicada con ciencia**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), EscenaCierre];

export const COLAGENO: ShortDef = {
  id: "Short-Colageno",
  titulo: "Colágeno: ¿sirve tomarlo?",
  planos: ESCENAS.map((Escena, i) => ({ id: `colageno-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
