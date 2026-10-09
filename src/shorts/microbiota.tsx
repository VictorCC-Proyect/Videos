// Short: Ultraprocesados, edulcorantes y microbiota intestinal
// (borrador: las escenas 3D se escriben en este archivo)
import React from "react";
import { AbsoluteFill } from "remotion";
import { PlanoDef } from "../fisio/motor";
import { EscenaCierre } from "./cierre";
import { ShortDef } from "./marco";

const Vacia: React.FC<{ textos: string[] }> = () => <AbsoluteFill />;

const T = [
  "En tu intestino viven **billones de bacterias**: tu microbiota. Y lo que comes las cambia.",
  "Las bacterias buenas se alimentan de **fibra**: la fermentan y producen **ácidos grasos de cadena corta**, como el butirato.",
  "El butirato alimenta a las células del colon y ayuda a mantener fuerte la **barrera intestinal**.",
  "Los **ultraprocesados** suelen tener poca fibra y mucho azúcar, grasa y aditivos.",
  "Algunos **emulsionantes**, en estudios sobre todo con animales, adelgazan la capa de moco que protege el intestino y favorecen la **inflamación**.",
  "¿Y los **edulcorantes**? La sacarina y la sucralosa han alterado la microbiota en algunos estudios, aunque la evidencia todavía es **mixta**.",
  "Menos fibra y más aditivos: menos bacterias benéficas y una **barrera más débil**.",
  "Lo que ayuda: **fibra** de frutas, verduras, leguminosas y granos enteros, y alimentos **fermentados** como el yogur.",
  "Sígueme para más **nutrición explicada con ciencia**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), EscenaCierre];

export const MICROBIOTA: ShortDef = {
  id: "Short-Microbiota",
  titulo: "Ultraprocesados, edulcorantes y microbiota intestinal",
  planos: ESCENAS.map((Escena, i) => ({ id: `microbiota-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
