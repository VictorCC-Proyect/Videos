// Short: ¿La L-carnitina quema grasa? Lipólisis, albúmina, carnitina y la analogía del puerto.
// Fuentes: Holway, Nutrición sin dogmas, Tomo 1, 1.6.5–1.6.8 (pp. 41–42); Wall et al. 2011 (J Physiol); Talenezhad et al. 2020 (Clin Nutr ESPEN); Askarpour et al. 2019 (Pharmacol Res).
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
    pregunta={<>¿Has tomado <span style={{ color: K.lima }}>L-carnitina</span>?</>}
    escribe="Yo…"
    ideas={["SÍ, Y NO NOTÉ NADA", "SÍ, ME FUNCIONÓ", "NUNCA"]}
  />
);

const T = [
  "¿La L-carnitina quema grasa? Es de los suplementos más populares para bajar de peso. Vamos a ver qué pasa de verdad en tu cuerpo.",
  "Cuando empiezas un ejercicio moderado, liberas **adrenalina**, que viaja por la sangre hasta tu tejido adiposo.",
  "Ahí activa una enzima, la **lipasa hormono sensible**, que rompe los triglicéridos y suelta **ácidos grasos**. Entre los **quince y veinte minutos**, esa liberación se vuelve más eficiente.",
  "Como la grasa no se mezcla con la sangre, los ácidos grasos viajan montados en una proteína: la **albúmina**.",
  "Al llegar al músculo tienen que entrar a la **mitocondria**, el único lugar donde la grasa se quema. Pero no entran solos: necesitan a la **carnitina**.",
  "De ahí nace el mito: si tomo más carnitina, quemo más grasa. Francis Holway lo explica con un **puerto**.",
  "La carnitina son los **estibadores** que bajan los contenedores. Si llenas el puerto de estibadores pero no llegan **barcos**, no se descarga más rápido.",
  "Los barcos son los ácidos grasos que libera el **ejercicio**. Además, la mayoría de la carnitina que tomas se queda en la **sangre** y no entra al músculo.",
  "Para meterla al músculo, un estudio necesitó **veinticuatro semanas**, con carbohidratos en cada toma para subir la insulina. Y solo aumentó un **veintiuno por ciento**.",
  "En los metaanálisis, la pérdida de peso es pequeña: alrededor de **un kilo**, sobre todo en personas con sobrepeso que además cambian sus hábitos.",
  "Y un dato curioso: la grasa se quema en la hoguera de los **carbohidratos**. Para oxidar grasa, tu mitocondria necesita algo de glucosa.",
  "¿Tú has tomado L-carnitina? **Escríbelo en los comentarios**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), Final];

export const CARNITINA: ShortDef = {
  id: "Short-Carnitina",
  titulo: "¿La L-carnitina quema grasa?",
  planos: ESCENAS.map((Escena, i) => ({ id: `carnitina-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
