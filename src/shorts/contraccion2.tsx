// Short: ¿Qué pasa dentro del músculo cuando se contrae? (Parte 2)
// (borrador: las escenas 3D se escriben en este archivo)
import React from "react";
import { AbsoluteFill } from "remotion";
import { PlanoDef } from "../fisio/motor";
import { EscenaComentarios } from "./cierre";
import { K, ShortDef } from "./marco";

const Vacia: React.FC<{ textos: string[] }> = () => <AbsoluteFill />;

const Comentarios: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Qué <span style={{ color: K.lima }}>serie</span> sigue?</>}
    escribe="Quiero una serie de…"
    ideas={["HUESOS", "HORMONAS", "DIGESTIÓN", "CORAZÓN", "SUEÑO"]}
  />
);

const T = [
  "En la parte uno, tu cerebro liberó el calcio dentro de la fibra. Ahora mira qué pasa en el **sarcómero**, la unidad que se contrae.",
  "El sarcómero tiene filamentos finos de **actina** y filamentos gruesos de **miosina**, con cabezas que pueden agarrar a la actina.",
  "En reposo no pueden: la **tropomiosina** tapa los sitios de unión, como un candado, sujeta por la **troponina**.",
  "El **calcio** se une a la troponina, el candado se mueve y los sitios de la actina quedan **libres**.",
  "La cabeza de miosina, ya cargada con energía, se pega a la actina: es el **puente cruzado**.",
  "Suelta el fosfato y hace el **golpe de fuerza**: jala la actina hacia el centro, como un remo.",
  "Llega una nueva molécula de **ATP**, la cabeza se suelta, rompe el ATP y se vuelve a armar para el siguiente jalón.",
  "Millones de cabezas repiten este ciclo, los filamentos **se deslizan** y el sarcómero se acorta. Así se contrae tu músculo.",
  "Para relajarse, una bomba usa ATP para regresar el calcio a su almacén, y el candado se vuelve a cerrar.",
  "¿Qué necesita tu músculo para contraerse? **ATP** y glucógeno como energía, **calcio**, **magnesio**, **sodio** y **potasio**. Todo sale de lo que comes.",
  "¿De qué tema quieres la siguiente serie? **Escríbelo en los comentarios**, y sígueme para más nutrición explicada con ciencia.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), Comentarios];

export const CONTRACCION2: ShortDef = {
  id: "Short-Contraccion2",
  titulo: "¿Qué pasa dentro del músculo cuando se contrae? (Parte 2)",
  planos: ESCENAS.map((Escena, i) => ({ id: `contraccion2-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
