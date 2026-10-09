// Short: ¿Las grasas se queman solo después de 30 minutos? El continuum energético
// (borrador: las escenas 3D se escriben en este archivo)
import React from "react";
import { AbsoluteFill } from "remotion";
import { PlanoDef } from "../fisio/motor";
import { EscenaCierre } from "./cierre";
import { ShortDef } from "./marco";

const Vacia: React.FC<{ textos: string[] }> = () => <AbsoluteFill />;

const T = [
  "¿Las grasas solo se empiezan a quemar después de **30 minutos** de ejercicio? **Falso**.",
  "Tus tres sistemas de energía trabajan **al mismo tiempo**, desde el primer segundo. A esto se le llama **continuum energético**.",
  "En los primeros segundos de un esfuerzo máximo domina la **fosfocreatina**.",
  "Si el esfuerzo sigue muy intenso hasta uno o dos minutos, toma el mando la **glucólisis**.",
  "Y a partir de ahí predomina el sistema **aeróbico**, que quema glucosa y **grasas** dentro de la mitocondria.",
  "La grasa se oxida **desde el inicio**. Lo que cambia es la **proporción**: a baja intensidad, más grasa; a alta intensidad, más carbohidrato.",
  "Conforme pasan los minutos, la grasa aporta un porcentaje mayor, pero **no hay un interruptor** que se encienda en el minuto 30.",
  "Y para perder grasa, lo que más cuenta es tu **balance de energía** de todo el día, no solo lo que quemas en la sesión.",
  "Sígueme para más **nutrición explicada con ciencia**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), EscenaCierre];

export const CONTINUUM: ShortDef = {
  id: "Short-Continuum",
  titulo: "¿Las grasas se queman solo después de 30 minutos? El continuum energético",
  planos: ESCENAS.map((Escena, i) => ({ id: `continuum-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
