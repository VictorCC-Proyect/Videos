// Short: ¿Sirven los BCAA? Leucina enciende mTOR, pero se necesitan los 9 aminoácidos esenciales.
// Fuentes: Wolfe 2017 (JISSN), Jackman et al. 2017 (Front Physiol), Salem et al. 2024 (Sports Med Open), Weber et al. 2021 (Amino Acids).
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
    pregunta={<>¿Tú tomas <span style={{ color: K.lima }}>BCAA</span>?</>}
    escribe="Yo…"
    ideas={["SÍ, SIEMPRE", "YA NO", "NUNCA"]}
  />
);

const T = [
  "Los BCAA son de los suplementos más vendidos del gym. Pero ¿de verdad te ayudan a **ganar músculo**?",
  "Los BCAA son tres **aminoácidos de cadena ramificada**: **leucina**, **isoleucina** y **valina**.",
  "La leucina es la que enciende **mTOR**, el interruptor de la síntesis de proteína que ya te expliqué.",
  "Pero encender el interruptor no basta: para construir proteína nueva, tu fibra necesita los **nueve aminoácidos esenciales**, no solo tres.",
  "Es como una obra: puedes tener al jefe dando órdenes, pero sin **ladrillos** suficientes la pared no se levanta.",
  "Si solo tomas BCAA, los demás aminoácidos tienen que salir de **romper tu propio músculo**. Por eso una revisión concluyó que los BCAA solos no logran una respuesta anabólica real.",
  "En un estudio, unos cinco gramos de BCAA subieron la síntesis de proteína un **veintidós por ciento**, pero cerca de la **mitad** de lo que se logra con proteína completa.",
  "¿Y las agujetas? Varios metaanálisis encuentran que los BCAA pueden reducir un poco el **dolor muscular** después de entrenar.",
  "Pero si ya comes suficiente proteína al día, ese extra es pequeño: tu comida ya trae muchos BCAA.",
  "Unos **treinta gramos** de proteína de pollo, huevo o suero ya traen de **cinco a seis gramos** de BCAA, junto con todos los demás aminoácidos.",
  "Tu dinero rinde más en **proteína completa** que en BCAA. ¿Tú los tomas? **Escríbelo en los comentarios**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), Final];

export const BCAA: ShortDef = {
  id: "Short-Bcaa",
  titulo: "¿Sirven los BCAA?",
  planos: ESCENAS.map((Escena, i) => ({ id: `bcaa-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
