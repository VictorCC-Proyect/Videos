// Short: Magnesio: el mineral de tus músculos
// (borrador: las escenas 3D se escriben en este archivo)
import React from "react";
import { AbsoluteFill } from "remotion";
import { PlanoDef } from "../fisio/motor";
import { EscenaCierre } from "./cierre";
import { ShortDef } from "./marco";

const Vacia: React.FC<{ textos: string[] }> = () => <AbsoluteFill />;

const T = [
  "El **magnesio** participa en más de **300 reacciones** de tu cuerpo.",
  "En el músculo es clave: el ATP casi siempre trabaja **unido al magnesio**.",
  "El calcio hace que el músculo se **contraiga**, y el magnesio ayuda a que se **relaje** y a que el calcio regrese a su lugar.",
  "Si te falta, pueden aparecer **cansancio**, debilidad y, en algunas personas, **calambres**.",
  "Lo encuentras en **semillas**, nueces, cacao, frijoles, verduras de hoja verde y granos enteros.",
  "Los suplementos ayudan sobre todo si tienes **deficiencia**. En exceso causan diarrea, y con enfermedad renal hay que tener **cuidado**.",
  "Sígueme para más **nutrición explicada con ciencia**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), EscenaCierre];

export const MAGNESIO: ShortDef = {
  id: "Short-Magnesio",
  titulo: "Magnesio: el mineral de tus músculos",
  planos: ESCENAS.map((Escena, i) => ({ id: `magnesio-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
