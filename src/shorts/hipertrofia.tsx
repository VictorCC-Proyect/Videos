// Short: Hipertrofia. Tensión mecánica -> mTOR -> síntesis de proteína -> fibra más gruesa.
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
    pregunta={<>¿Cuántos <span style={{ color: K.lima }}>días</span> entrenas?</>}
    escribe="Entreno…"
    ideas={["2–3 DÍAS", "4–5 DÍAS", "6 O MÁS"]}
  />
);

const T = [
  "Unos ganan músculo rápido y otros no. Para entenderlo, hay que ver qué pasa **dentro** de tu fibra cuando entrenas: la **hipertrofia**.",
  "Hipertrofia es que tus fibras musculares se hacen más **gruesas**. No aparecen fibras nuevas: las que ya tienes crecen.",
  "Todo empieza con la **tensión mecánica**: cuando levantas algo pesado o llevas la serie cerca del fallo, la fibra se tensa con mucha fuerza.",
  "La fibra detecta esa tensión y enciende una señal interna, la vía **mTOR**: el interruptor que ordena fabricar más proteína.",
  "Los ribosomas fabrican más **actina y miosina**, se añaden nuevos sarcómeros y la fibra gana grosor.",
  "Y para sostener una fibra más grande, las **células satélite** le donan núcleos nuevos.",
  "Pero el músculo crece en el **descanso**, no en el gym: la síntesis de proteína sigue elevada hasta **uno o dos días** después de entrenar.",
  "Y necesita material: alrededor de **1.6 gramos de proteína por kilo** al día, repartida en varias comidas, y dormir bien.",
  "Las fibras **rápidas** son las que más crecen. Por eso importa llevar cada serie cerca del fallo: así también las reclutas.",
  "En el próximo video: por qué te **fatigas**. ¿Cuántos días a la semana entrenas? **Escríbelo en los comentarios**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), Final];

export const HIPERTROFIA: ShortDef = {
  id: "Short-Hipertrofia",
  titulo: "Hipertrofia: cómo crece tu músculo",
  planos: ESCENAS.map((Escena, i) => ({ id: `hipertrofia-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
