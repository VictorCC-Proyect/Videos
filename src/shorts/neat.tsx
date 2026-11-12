// Short: ¿Por qué tu amigo come de todo y no engorda? El NEAT (termogénesis por actividad sin ejercicio).
// Fuentes: Levine et al. 1999 (Science), Levine y Kotz 2005 (Acta Physiol Scand).
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
    pregunta={<>¿Eres <span style={{ color: K.lima }}>ese amigo</span>?</>}
    escribe="@"
    ideas={["YO SOY ESE AMIGO", "ENGORDO CON VERLA", "TENGO UNO 👇"]}
  />
);

const T = [
  "Todos tenemos ese amigo que come de todo y no engorda. **Etiquétalo**, porque hoy te explico su secreto.",
  "Tu gasto de energía del día tiene varias partes: el **metabolismo basal**, la digestión, el ejercicio, y una que casi nadie conoce: el **NEAT**.",
  "El NEAT es la energía que gastas moviéndote **sin hacer ejercicio**: caminar, estar de pie, subir escaleras, gesticular, hasta mover la pierna.",
  "Y aquí viene lo sorprendente: entre dos personas de tamaño parecido, el NEAT puede variar hasta **dos mil calorías** al día.",
  "En un estudio famoso, dieciséis personas comieron **mil calorías extra** al día durante ocho semanas.",
  "Algunas subieron **diez veces** más grasa que otras. ¿La diferencia? El **NEAT**: varios, sin darse cuenta, empezaron a moverse mucho más.",
  "Su cuerpo encendía el NEAT para quemar el exceso: más movimientos pequeños, más tiempo de pie, más **inquietud**.",
  "Además, muchas veces ese amigo no come tanto como crees: lo ves en la fiesta, pero no lo ves saltarse la cena o comer poco al día siguiente.",
  "Y la **genética** también influye en cuánto se mueve cada quien de forma espontánea.",
  "La buena noticia: el NEAT se puede **aumentar**. Camina más, usa las escaleras, levántate cada hora y haz tus llamadas de pie.",
  "¿Tú eres ese amigo, o engordas con solo ver la comida? **Escríbelo en los comentarios** y etiqueta a ese amigo.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), Final];

export const NEAT: ShortDef = {
  id: "Short-Neat",
  titulo: "¿Por qué tu amigo come de todo y no engorda?",
  planos: ESCENAS.map((Escena, i) => ({ id: `neat-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
