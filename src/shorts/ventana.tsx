// Short: ¿Existe la "ventana anabólica"? Qué comer antes y después de entrenar.
// Fuentes: Aragon y Schoenfeld 2013 (JISSN), Schoenfeld et al. 2017 (PeerJ), Kerksick et al. 2017 (ISSN nutrient timing).
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
    pregunta={<>¿Cuándo tomas tu <span style={{ color: K.lima }}>proteína</span>?</>}
    escribe="Yo la tomo…"
    ideas={["AL SALIR DEL GYM", "ANTES DE ENTRENAR", "EN MIS COMIDAS"]}
  />
);

const T = [
  "Seguro te han dicho que tienes **treinta minutos** después de entrenar para tomar tu proteína, o pierdes el músculo. ¿De verdad existe esa **ventana anabólica**?",
  "La idea viene de algo real: después de entrenar, tu músculo está más **sensible** a la proteína y la síntesis sube.",
  "Pero esa sensibilidad no dura media hora: dura **muchas horas**, hasta un día después de la sesión.",
  "En un estudio, tomar **veinticinco gramos** de proteína justo antes o justo después de entrenar dio **los mismos resultados** en fuerza y músculo durante diez semanas.",
  "Además, si comiste proteína unas horas antes, esos aminoácidos siguen en tu sangre **durante y después** del entrenamiento.",
  "Lo que más pesa es tu proteína **total del día**, repartida en tomas de **veinte a cuarenta gramos** cada tres o cuatro horas.",
  "Entonces, ¿qué comer **antes**? Entre una y tres horas antes, una comida con **carbohidratos** y algo de **proteína**: llegas con energía y sin sentirte pesado.",
  "¿Y **después**? Una comida con proteína y carbohidratos en las siguientes horas. No tienes que correr al vestidor por el licuado.",
  "¿Cuándo sí conviene comer pronto? Si entrenaste **en ayunas**, o si vuelves a entrenar **el mismo día**.",
  "En ese caso, para recargar el **glucógeno** rápido, come carbohidratos desde el primer momento, junto con algo de proteína.",
  "En resumen, no es una ventana de treinta minutos, es más bien una **puerta abierta** durante varias horas.",
  "¿Tú cuándo tomas tu proteína? **Escríbelo en los comentarios**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), Final];

export const VENTANA: ShortDef = {
  id: "Short-Ventana",
  titulo: "¿Existe la ventana anabólica? Qué comer antes y después de entrenar",
  planos: ESCENAS.map((Escena, i) => ({ id: `ventana-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
