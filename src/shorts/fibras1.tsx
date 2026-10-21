// Short: Fibras rápidas y lentas. Parte 1: qué son y en qué se diferencian
// Del atleta a la fibra: tipo I (roja, aeróbica) vs tipo II (blanca, explosiva), IIa y IIx.
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
    pregunta={<>¿Eres más de fibras <span style={{ color: K.lima }}>rápidas</span> o lentas?</>}
    escribe="Yo soy más de…"
    ideas={["LENTAS · RESISTENCIA", "RÁPIDAS · FUERZA", "MITAD Y MITAD"]}
  />
);

const T = [
  "¿Por qué un maratonista puede correr horas y un velocista explota en diez segundos? Gran parte de la respuesta está en sus **fibras musculares**.",
  "Cada músculo mezcla dos grandes tipos de fibras: las **lentas**, o tipo uno, y las **rápidas**, o tipo dos.",
  "Las fibras lentas son **rojas**: tienen mucha **mioglobina**, que guarda oxígeno, muchos capilares y muchas **mitocondrias**.",
  "Por eso usan sobre todo el **sistema aeróbico**. Se contraen con menos fuerza, pero casi **no se cansan**.",
  "Las fibras rápidas son más **blancas** y gruesas: tienen menos mitocondrias, pero mucha **fosfocreatina** y **glucógeno**.",
  "Su miosina gasta ATP mucho más rápido, así que se contraen **más rápido y con más fuerza**, pero se fatigan en segundos.",
  "Y las rápidas son de dos tipos: las **dos A**, rápidas pero resistentes, y las **dos X**, las más explosivas y las que antes se cansan.",
  "En el muslo de una persona promedio, cerca de la **mitad** son lentas. En maratonistas de élite pueden llegar al **ochenta por ciento**, y en velocistas, a apenas una **cuarta parte**.",
  "En la **parte dos**: cómo decide tu cerebro qué fibras usar, y si el entrenamiento puede cambiarlas. ¿Tú eres más de fibras rápidas o lentas? **Escríbelo en los comentarios**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), Final];

export const FIBRAS1: ShortDef = {
  id: "Short-Fibras1",
  titulo: "Fibras rápidas y lentas. Parte 1: qué son",
  planos: ESCENAS.map((Escena, i) => ({ id: `fibras1-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
