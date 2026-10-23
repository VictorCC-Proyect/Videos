// Short: Cardio en ayunas. Insulina baja -> lipólisis -> más oxidación de grasa en la sesión, pero mismo resultado a largo plazo.
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
    pregunta={<>¿Entrenas en <span style={{ color: K.lima }}>ayunas</span>?</>}
    escribe="Yo entreno…"
    ideas={["EN AYUNAS", "DESAYUNO ANTES", "DEPENDE DEL DÍA"]}
  />
);

const T = [
  "¿Hacer cardio en ayunas quema más grasa? Muchos lo juran. Vamos a ver qué pasa en tu cuerpo.",
  "Después de una noche sin comer, tu **insulina** está baja y el glucógeno de tu hígado también.",
  "Con la insulina baja, el tejido adiposo libera más **ácidos grasos**, que viajan por la sangre hasta el músculo.",
  "Así que sí: durante el cardio en ayunas **quemas más grasa** que si hubieras desayunado.",
  "Pero lo que cuenta es el **día completo**: después tu cuerpo compensa, usando más carbohidratos y menos grasa.",
  "Cuando los estudios comparan la pérdida de grasa durante semanas, con las **mismas calorías**, no encuentran una diferencia importante.",
  "Además, en ayunas puedes rendir menos en sesiones **intensas o largas**, y eso significa gastar menos en total.",
  "Conclusión: si te sientes bien en ayunas y te ayuda a ser constante, adelante. Si no, desayuna. Lo que más pesa es tu **déficit calórico** y tu constancia.",
  "¿Tú entrenas en ayunas o desayunas antes? **Escríbelo en los comentarios**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), Final];

export const AYUNAS: ShortDef = {
  id: "Short-Ayunas",
  titulo: "Cardio en ayunas: ¿quema más grasa?",
  planos: ESCENAS.map((Escena, i) => ({ id: `ayunas-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
