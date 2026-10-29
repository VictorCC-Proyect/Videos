// Short: mTOR, el interruptor que hace crecer tu músculo. Tensión, leucina, insulina; freno AMPK; entrenamiento concurrente.
// Fuentes: Reidy y Rasmussen 2016 (J Nutr), Lundberg et al. 2022 (Sports Med), Kerksick et al. 2017 (ISSN).
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
    pregunta={<>¿Ya sabías qué era <span style={{ color: K.lima }}>mTOR</span>?</>}
    escribe="La verdad…"
    ideas={["NO TENÍA IDEA", "ME SONABA", "YA LO SABÍA"]}
  />
);

const T = [
  "En el video de hipertrofia te mencioné una palabra: **mTOR**. Hoy te explico qué es este interruptor y cómo encenderlo para ganar músculo.",
  "mTOR es una proteína dentro de tus células que funciona como un **sensor**: revisa si hay energía, nutrientes y estímulo suficientes para construir.",
  "Cuando se enciende, activa a los **ribosomas** para fabricar proteína nueva. En el músculo, eso significa más **actina y miosina**.",
  "Su primer interruptor es la **tensión mecánica**: cuando la fibra hace fuerza contra una carga pesada, la señal llega hasta mTOR.",
  "El segundo es la **leucina**, un aminoácido de la proteína. Con más de **dos gramos** de leucina en una comida, mTOR se enciende con fuerza.",
  "Eso lo consigues con unos **veinticinco a treinta gramos** de proteína de buena calidad: pollo, huevo, lácteos o soya.",
  "La **insulina** y la energía disponible también lo apoyan: mTOR solo construye cuando hay material y combustible.",
  "Su freno se llama **AMPK**: se enciende cuando falta energía, como en un ayuno muy largo o en un déficit muy agresivo.",
  "¿Y el cardio apaga tus ganancias? El tamaño del músculo casi no se afecta. En las fibras el efecto es **pequeño**, y parece mayor si corres que si pedaleas.",
  "Para encender mTOR: entrena pesado y cerca del fallo, reparte tu proteína en comidas con suficiente leucina, y evita los déficits extremos.",
  "¿Ya sabías qué era mTOR? **Escríbelo en los comentarios**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), Final];

export const MTOR: ShortDef = {
  id: "Short-Mtor",
  titulo: "mTOR: el interruptor que hace crecer tu músculo",
  planos: ESCENAS.map((Escena, i) => ({ id: `mtor-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
