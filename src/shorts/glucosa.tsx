// Short: Picos de glucosa y resistencia a la insulina
// (borrador: las escenas 3D se escriben en este archivo)
import React from "react";
import { AbsoluteFill } from "remotion";
import { PlanoDef } from "../fisio/motor";
import { EscenaCierre } from "./cierre";
import { ShortDef } from "./marco";

const Vacia: React.FC<{ textos: string[] }> = () => <AbsoluteFill />;

const T = [
  "¿Ese sueño después de comer pan dulce con refresco? Es un **pico de glucosa**.",
  "Los carbohidratos se digieren en el intestino y llegan a la sangre como **glucosa**.",
  "El páncreas responde liberando **insulina**: la llave que abre las células para que la glucosa entre.",
  "En el músculo, la insulina lleva los transportadores **GLUT4** a la superficie, y por ahí entra la glucosa.",
  "Si comes muchos azúcares rápidos, la glucosa sube muy alto y luego **cae de golpe**: hambre y cansancio.",
  "Cuando esto se repite por años, junto con sedentarismo y grasa abdominal, las células **responden cada vez menos** a la insulina.",
  "Eso es la **resistencia a la insulina**: el páncreas tiene que producir más y más, y puede terminar en **diabetes tipo 2**.",
  "Lo que ayuda: comer **fibra y proteína** primero, preferir alimentos enteros y **caminar** después de comer.",
  "Porque el músculo en movimiento capta glucosa **incluso sin insulina**.",
  "Sígueme para más **nutrición explicada con ciencia**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), EscenaCierre];

export const GLUCOSA: ShortDef = {
  id: "Short-Glucosa",
  titulo: "Picos de glucosa y resistencia a la insulina",
  planos: ESCENAS.map((Escena, i) => ({ id: `glucosa-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
