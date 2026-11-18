// Short: ¿Por qué los principiantes ganan músculo y pierden grasa a la vez? Recomposición + paradoja del principiante.
// Fuentes: Holway, Nutrición sin dogmas, Tomo 1, 1.6.12; Longland et al. 2016 (Am J Clin Nutr); Naddafha et al. 2026 (JISSN).
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
    pregunta={<>¿Cuánto llevas <span style={{ color: K.lima }}>entrenando</span>?</>}
    escribe="Llevo…"
    ideas={["ACABO DE EMPEZAR", "MENOS DE 1 AÑO", "MÁS DE 1 AÑO"]}
  />
);

const T = [
  "Empiezas en el gym y en unos meses bajas grasa y subes músculo al mismo tiempo. ¿Cómo es posible, si dicen que para crecer hay que comer de más?",
  "Se llama **recomposición corporal**: ganar músculo y perder grasa en la misma etapa. Y pasa sobre todo en **principiantes**.",
  "Tu músculo nunca había recibido ese estímulo: está muy **sensible**, y la síntesis de proteína se dispara con poco.",
  "Mientras tanto, tu grasa es una **reserva de energía**: si comes un poco menos de lo que gastas, de ahí sale el combustible extra.",
  "Un estudio lo mostró en solo cuatro semanas: con entrenamiento intenso, déficit y **2.4 gramos** de proteína por kilo, ganaron **1.2 kilos** de masa magra y perdieron casi **cinco** de grasa.",
  "Pero ojo con lo que Francis Holway llama la **paradoja del principiante**: tus mitocondrias todavía no están listas para quemar mucha grasa.",
  "Fabricar más mitocondrias toma unos **dos a tres meses** de entrenamiento constante. Mientras tanto, tu cuerpo depende sobre todo de la **glucosa**.",
  "Si al empezar quitas los carbohidratos de golpe, te quedas sin glucosa y sin una máquina de grasa lista: llega la fatiga, rindes mal, y muchos abandonan.",
  "Como dice Holway: no quites la leña antes de construir el **horno**.",
  "La receta: un déficit **moderado**, proteína alta, carbohidratos de calidad para entrenar, y fuerza que vaya subiendo poco a poco.",
  "Y aprovéchalo: este efecto es más fuerte al principio, y con los años de entrenamiento se vuelve más lento.",
  "¿Cuánto tiempo llevas entrenando? **Escríbelo en los comentarios**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), Final];

export const PRINCIPIANTE: ShortDef = {
  id: "Short-Principiante",
  titulo: "¿Por qué los principiantes ganan músculo y pierden grasa al mismo tiempo?",
  planos: ESCENAS.map((Escena, i) => ({ id: `principiante-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
