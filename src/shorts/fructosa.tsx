// Short: ¿La fruta engorda porque tiene fructosa? Hígado y fructosa, dosis, matriz de la fruta, evidencia.
// Fuentes: Sievenpiper et al. 2012 (Ann Intern Med), Bertoia et al. 2015 (PLoS Med).
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
    pregunta={<>¿Cuántas <span style={{ color: K.lima }}>frutas</span> comes al día?</>}
    escribe="Como…"
    ideas={["NINGUNA", "1 A 2", "3 O MÁS"]}
  />
);

const T = [
  "¿La fruta engorda porque tiene **fructosa**? Muchos la dejan por miedo al azúcar. Vamos a ver qué pasa de verdad en tu cuerpo.",
  "La fructosa es el azúcar natural de la fruta. A diferencia de la glucosa, casi toda la procesa tu **hígado**.",
  "Cuando llega en **exceso**, el hígado puede convertir una parte en **grasa**. De ahí nace el miedo.",
  "Pero la dosis importa: una manzana mediana tiene unos **diez gramos** de fructosa. Un refresco de seiscientos mililitros, más de **treinta**.",
  "Además, la fruta viene en un paquete especial: **fibra**, **agua**, y además hay que **masticarla**.",
  "La fibra hace que el azúcar se absorba **más lento**, y el agua y el volumen te **llenan**: es difícil comer fruta de más.",
  "En estudios controlados, cambiar otros carbohidratos por fructosa **sin subir las calorías** no cambió el peso. Lo que hizo subir de peso fue el **exceso de calorías**.",
  "Y en más de **ciento treinta mil** personas seguidas durante años, quienes comían más fruta subían **menos** de peso.",
  "El problema no es la fruta entera: son los azúcares **añadidos**, los refrescos y hasta los **jugos**, donde pierdes la fibra y tomas mucho azúcar en segundos.",
  "Así que come fruta **entera**, de dos a tres porciones al día, y deja los jugos y refrescos para algo ocasional.",
  "¿Cuántas frutas comes al día? **Escríbelo en los comentarios**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), Final];

export const FRUCTOSA: ShortDef = {
  id: "Short-Fructosa",
  titulo: "¿La fruta engorda porque tiene fructosa?",
  planos: ESCENAS.map((Escena, i) => ({ id: `fructosa-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
