// Short: Déficit calórico: por qué no bajas de peso
// (borrador: las escenas 3D se escriben en este archivo)
import React from "react";
import { AbsoluteFill } from "remotion";
import { PlanoDef } from "../fisio/motor";
import { EscenaCierre } from "./cierre";
import { ShortDef } from "./marco";

const Vacia: React.FC<{ textos: string[] }> = () => <AbsoluteFill />;

const T = [
  "Haces dieta, entrenas... y la báscula **no se mueve**. ¿Por qué?",
  "Para perder grasa necesitas un **déficit calórico**: gastar más energía de la que comes.",
  "Entonces tu cuerpo saca la diferencia de la **grasa guardada**: los adipocitos liberan ácidos grasos que se queman en la mitocondria.",
  "Primer error: **subestimar** lo que comes. Aceite, bebidas, salsas y botanas suman más de lo que crees.",
  "Segundo: al comer menos, te **mueves menos** sin darte cuenta y tu cuerpo gasta un poco menos. Es la adaptación metabólica.",
  "Tercero: la báscula engaña. El **agua** y el glucógeno suben y bajan; fíjate en la **tendencia** de varias semanas.",
  "Y si entrenas fuerza, puedes estar ganando **músculo** mientras pierdes grasa.",
  "La clave: un déficit **moderado**, suficiente proteína, entrenar fuerza, dormir bien y ser **constante**.",
  "Sígueme para más **nutrición explicada con ciencia**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), EscenaCierre];

export const DEFICIT: ShortDef = {
  id: "Short-Deficit",
  titulo: "Déficit calórico: por qué no bajas de peso",
  planos: ESCENAS.map((Escena, i) => ({ id: `deficit-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
