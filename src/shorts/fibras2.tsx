// Short: Fibras rápidas y lentas. Parte 2: cómo se reclutan y si se pueden cambiar
// Neurona motora -> unidad motora -> principio del tamaño -> adaptaciones al entrenamiento.
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
    pregunta={<>¿Qué <span style={{ color: K.lima }}>tema</span> sigue?</>}
    escribe="Explica…"
    ideas={["HIPERTROFIA", "FATIGA", "CARDIO EN AYUNAS"]}
  />
);

const T = [
  "En la parte uno viste las fibras lentas y las rápidas. Ahora: ¿cómo decide tu cuerpo **cuáles usar**?",
  "Cada fibra recibe órdenes de una **neurona motora**. Una neurona y todas sus fibras forman una **unidad motora**, y todas esas fibras son del mismo tipo.",
  "Las unidades lentas tienen neuronas pequeñas que se activan con poca señal. Las rápidas tienen neuronas grandes que necesitan una señal más fuerte.",
  "Por eso se reclutan **en orden**: primero las lentas, y solo cuando necesitas más fuerza se suman las rápidas. Se llama **principio del tamaño**.",
  "Caminar usa casi solo fibras lentas. Una sentadilla pesada o un sprint ya enciende también las **dos X**.",
  "¿Y se pueden cambiar? Tu proporción depende mucho de tu **genética**, pero el entrenamiento sí las modifica.",
  "Con pesas o con cardio, muchas fibras **dos X** se vuelven **dos A**, más resistentes. Convertir lentas en rápidas, o al revés, es mucho más difícil.",
  "Además, las fibras rápidas son las que más **crecen** con las pesas, y las lentas ganan **mitocondrias** y capilares con el cardio.",
  "Y la nutrición acompaña: **proteína** suficiente para reparar y crecer, y **carbohidratos** para recargar el glucógeno que gastan tus fibras rápidas.",
  "Entrena las dos: **fuerza** para tus fibras rápidas y **cardio** para las lentas. ¿Qué tema quieres que explique después? **Escríbelo en los comentarios**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), Final];

export const FIBRAS2: ShortDef = {
  id: "Short-Fibras2",
  titulo: "Fibras rápidas y lentas. Parte 2: ¿se pueden cambiar?",
  planos: ESCENAS.map((Escena, i) => ({ id: `fibras2-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
