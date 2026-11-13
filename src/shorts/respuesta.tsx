// Short: ¿Por qué unos ganan músculo más rápido que otros? Genética, fibras y somatotipos.
// Fuentes: Hubal et al. 2005 (Med Sci Sports Exerc), Bamman et al. 2007 (J Appl Physiol), Holway, Nutrición sin dogmas, Tomo 1, 2.7.1.
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
    pregunta={<>¿Ganas músculo <span style={{ color: K.lima }}>rápido o lento</span>?</>}
    escribe="Yo gano…"
    ideas={["RÁPIDO", "LENTO", "ME CUESTA MUCHO"]}
  />
);

const T = [
  "¿Por qué tu amigo gana músculo en tres meses y tú no, con la misma rutina? Hoy juntamos todo lo de la serie: **genética**, **fibras** y **somatotipos**.",
  "En un estudio, **quinientas ochenta y cinco** personas entrenaron el bíceps durante doce semanas con el mismo programa.",
  "Algunas casi no cambiaron, y otras aumentaron el tamaño de su músculo hasta un **cincuenta y nueve por ciento**. Su fuerza llegó a más que duplicarse.",
  "Primera razón: las **fibras**. Las rápidas, tipo dos, son las que más crecen. Quien nace con más fibras rápidas tiene más material para crecer.",
  "Segunda: los **genes de crecimiento** y las células satélite. En quienes más crecieron, esas señales se encendieron con mucha más fuerza.",
  "En quienes no crecieron, esas señales casi no se movieron, aunque hicieron exactamente el mismo entrenamiento.",
  "Tercera: el **somatotipo**. Como explica Holway, el mesomorfo responde rápido, al ectomorfo le cuesta mucho ganar músculo, y el endomorfo gana músculo pero también grasa con facilidad.",
  "Y cuarta, lo que sí controlas: la **proteína**, las **calorías**, el **sueño** y qué tan cerca del fallo entrenas cambian mucho el resultado.",
  "La genética te da el **punto de partida**, no el final: casi todos responden cuando ajustan su entrenamiento y su alimentación.",
  "Por eso no copies la rutina de tu amigo. Ajusta tu comida a tu tipo de cuerpo, dale tiempo, y compárate **contigo mismo**, no con él.",
  "¿Tú ganas músculo rápido o lento? **Escríbelo en los comentarios**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), Final];

export const RESPUESTA: ShortDef = {
  id: "Short-Respuesta",
  titulo: "¿Por qué unos ganan músculo más rápido que otros?",
  planos: ESCENAS.map((Escena, i) => ({ id: `respuesta-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
