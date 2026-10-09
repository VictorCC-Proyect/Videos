// Short: Cafeína antes de entrenar: cómo funciona
// (borrador: las escenas 3D se escriben en este archivo)
import React from "react";
import { AbsoluteFill } from "remotion";
import { PlanoDef } from "../fisio/motor";
import { EscenaCierre } from "./cierre";
import { ShortDef } from "./marco";

const Vacia: React.FC<{ textos: string[] }> = () => <AbsoluteFill />;

const T = [
  "¿Por qué la **cafeína** antes de entrenar te hace rendir más?",
  "Durante el día se acumula en tu cerebro la **adenosina**, que se une a sus receptores y te da **cansancio**.",
  "La cafeína tiene una forma parecida: **bloquea esos receptores**, y la sensación de fatiga baja.",
  "Resultado: sientes menos esfuerzo, te concentras mejor y rindes un poco más en **fuerza y resistencia**.",
  "La dosis estudiada es de **3 a 6 mg por kilo** de peso, unos **30 a 60 minutos** antes. Empieza por la parte baja.",
  "Para alguien de 70 kilos, 3 mg por kilo son unos **210 mg**: más o menos dos tazas de café.",
  "No pases de **400 mg al día** si eres adulto sano, y evítala de 6 a 8 horas antes de dormir.",
  "Si tienes presión alta, ansiedad, problemas del corazón o estás embarazada, **consulta antes**.",
  "Sígueme para más **nutrición explicada con ciencia**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), EscenaCierre];

export const CAFEINA: ShortDef = {
  id: "Short-Cafeina",
  titulo: "Cafeína antes de entrenar: cómo funciona",
  planos: ESCENAS.map((Escena, i) => ({ id: `cafeina-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
