// Short: ¿De dónde sacan energía tus músculos? Parte 2: el sistema aeróbico
// (borrador: las escenas 3D se escriben en este archivo)
import React from "react";
import { AbsoluteFill } from "remotion";
import { PlanoDef } from "../fisio/motor";
import { EscenaProximos } from "./cierre";
import { K, ShortDef } from "./marco";

const Vacia: React.FC<{ textos: string[] }> = () => <AbsoluteFill />;

const Final: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaProximos
    textos={textos}
    items={[{ t: "Fibras rápidas y lentas", sub: "por qué no todas son iguales", color: K.cian, a: 0.1 }]}
  />
);

const T = [
  "En la parte uno viste los sistemas rápidos. Ahora el más grande: el **sistema aeróbico**, que funciona con **oxígeno** dentro de las mitocondrias.",
  "El oxígeno entra por tus pulmones, viaja en la sangre y llega a la fibra hasta las **mitocondrias**, las fábricas de energía.",
  "Ahí, el piruvato de la glucosa y los **ácidos grasos** de la grasa se convierten en un mismo combustible: el **acetil coenzima A**.",
  "Ese combustible entra al **ciclo de Krebs**, una rueda de reacciones que libera electrones cargados de energía.",
  "Los electrones pasan por la **cadena respiratoria**. Al final, el oxígeno los recibe y se forma agua.",
  "Con esa energía, una pequeña turbina, la **ATP sintasa**, gira y fabrica ATP en grande: unos **treinta ATP** por cada glucosa, contra solo dos de la glucólisis.",
  "Es lento para arrancar, pero casi **no se agota**: es el sistema de caminar, trotar o jugar un partido completo.",
  "Recuerda: los **tres sistemas trabajan juntos** desde el primer segundo. Lo que cambia es cuál **domina**, según la intensidad y la duración.",
  "Y todos dependen de tu plato: **carbohidratos** para el glucógeno, **grasas** como combustible, y vitaminas del **complejo B** y **hierro** para que la mitocondria funcione.",
  "En el próximo video: por qué no todas tus fibras son iguales, las **rápidas** y las **lentas**. ¿Qué tema quieres después? **Escríbelo en los comentarios**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), Final];

export const ENERGIA2: ShortDef = {
  id: "Short-Energia2",
  titulo: "¿De dónde sacan energía tus músculos? Parte 2: el sistema aeróbico",
  planos: ESCENAS.map((Escena, i) => ({ id: `energia2-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
