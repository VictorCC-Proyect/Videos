// Short: Somatotipos (ectomorfo, mesomorfo, endomorfo): qué dice la ciencia
// Basado en Holway, Nutrición sin dogmas (1.3.3, 1.3.4, 2.7.1): Sheldon -> Heath-Carter -> somatocarta.
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
    pregunta={<>¿Cómo <span style={{ color: K.lima }}>comer y entrenar</span> según tu tipo?</>}
    escribe="Sí, soy…"
    ideas={["ECTOMORFO", "MESOMORFO", "ENDOMORFO"]}
  />
);

const T = [
  "En el video de ayer me pidieron en los comentarios hablar de los **somatotipos**. ¿Eres ectomorfo, mesomorfo o endomorfo? Vamos a ver qué dice la ciencia.",
  "La idea viene de William **Sheldon**, en los años cuarenta. Él decía que tu tipo de cuerpo definía hasta tu **personalidad**. Eso hoy está **descartado**.",
  "Lo que sí se usa en nutrición es el somatotipo de **Heath y Carter**: no son tres cajas, son **tres componentes** que todos tenemos, cada uno con su calificación.",
  "La **endomorfia** es la adiposidad relativa: cuánta grasa tienes para tu tamaño. Se calcula con **pliegues cutáneos**.",
  "La **mesomorfia** es la robustez de músculo y hueso. Se mide con **diámetros óseos** y **perímetros** de brazo y pierna.",
  "La **ectomorfia** es la linealidad: qué tan alto y delgado eres en relación con tu peso.",
  "Con esas tres calificaciones se marca un punto en un triángulo: la **somatocarta**. Casi nadie es un tipo puro: la mayoría somos una **mezcla**.",
  "Y el físico se parece al deporte: los fondistas tienden a la ectomorfia, con más fibras lentas; los velocistas y lanzadores, a la mesomorfia, con más fibras rápidas.",
  "La genética te da una tendencia, como viste con tus fibras, pero **no te condena**: con entrenamiento y alimentación tu somatotipo **cambia**, porque cambian tu grasa y tu músculo.",
  "Por eso no todos responden igual a la misma rutina: un ectomorfo necesita más energía para ganar peso, y un endomorfo, cuidar más su composición corporal.",
  "¿Quieres un video de cómo **comer y entrenar** según tu somatotipo? **Escríbelo en los comentarios**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), Final];

export const SOMATOTIPOS: ShortDef = {
  id: "Short-Somatotipos",
  titulo: "Somatotipos: ¿eres ectomorfo, mesomorfo o endomorfo?",
  planos: ESCENAS.map((Escena, i) => ({ id: `somatotipos-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
