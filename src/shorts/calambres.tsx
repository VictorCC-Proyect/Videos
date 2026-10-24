// Short: ¿Por qué dan calambres? Teoría neuromuscular (husos vs Golgi) frente al mito del potasio.
// Fuentes: Miller et al. 2022 (J Athl Train), Schwellnus et al. 2011 (Ironman), Costa et al. 2026 (Muscle Nerve, metaanálisis).
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
    pregunta={<>¿Dónde te dan más <span style={{ color: K.lima }}>calambres</span>?</>}
    escribe="A mí en…"
    ideas={["PANTORRILLA", "MUSLO", "PIE"]}
  />
);

const T = [
  "En la encuesta de mis historias ganó este tema: ¿por qué dan **calambres**? Y spoiler: casi nunca es por falta de **potasio**.",
  "Un calambre es una contracción **involuntaria**, repentina y dolorosa: el músculo se queda trabado y no se suelta.",
  "Tu músculo solo se contrae cuando una **neurona motora** le manda la señal. En un calambre, esa neurona se pone a disparar sin parar.",
  "¿Por qué? En el músculo hay dos sensores: los **husos musculares**, que lo activan, y los **órganos tendinosos de Golgi**, que lo frenan.",
  "Con la **fatiga**, los husos se aceleran y los de Golgi frenan menos. Se rompe el equilibrio y la neurona dispara de más.",
  "Por eso suelen llegar al final del esfuerzo, con el músculo cansado y **acortado**, como la pantorrilla con el pie en punta.",
  "¿Y la deshidratación? En triatletas de Ironman, los que tuvieron calambres **no** estaban más deshidratados ni con menos sodio: iban **más rápido** y ya habían tenido calambres antes.",
  "Un metaanálisis de este año lo confirma: el factor más fuerte es haberlos tenido antes, que multiplica el riesgo por **cuatro**. Y el potasio de quienes se acalambraron no estaba bajo: estaba **alto**.",
  "Aun así, no parece haber una sola causa: en algunas personas, sudar mucho en el calor y perder **sodio** también puede sumar.",
  "Si te da uno, **estira** suavemente el músculo hasta que pase: el estiramiento activa a los órganos de Golgi, que ayudan a frenar a la neurona.",
  "Para prevenirlos: entrena a la intensidad a la que compites, sube la carga poco a poco y descansa bien. Y si sudas mucho, recupera el **sodio**, no solo el agua.",
  "¿A ti en qué músculo te dan más calambres? **Escríbelo en los comentarios**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), Final];

export const CALAMBRES: ShortDef = {
  id: "Short-Calambres",
  titulo: "¿Por qué dan calambres?",
  planos: ESCENAS.map((Escena, i) => ({ id: `calambres-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
