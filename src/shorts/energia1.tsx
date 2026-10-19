// Short: ¿De dónde sacan energía tus músculos? Parte 1: los sistemas rápidos
// (borrador: las escenas 3D se escriben en este archivo)
import React from "react";
import { AbsoluteFill } from "remotion";
import { PlanoDef } from "../fisio/motor";
import { EscenaComentarios } from "./cierre";
import { K, ShortDef } from "./marco";

const Vacia: React.FC<{ textos: string[] }> = () => <AbsoluteFill />;

const Final: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Qué <span style={{ color: K.lima }}>sistema</span> usas más?</>}
    escribe="Yo uso más…"
    ideas={["FOSFÁGENOS", "GLUCÓLISIS", "AERÓBICO"]}
  />
);

const T = [
  "Ya viste que tu músculo se contrae gracias al ATP. Pero solo guarda ATP para unos **dos o tres segundos**. ¿De dónde saca más? Tiene **tres sistemas** para fabricarlo.",
  "El ATP es la moneda de energía: al soltar uno de sus **fosfatos**, libera la energía que mueve a la miosina. Queda ADP, y hay que volver a cargarlo.",
  "Sistema uno: los **fosfágenos**. La fosfocreatina le regala su fosfato al ADP y forma ATP **al instante**, sin oxígeno.",
  "Es el más rápido y potente, pero se agota en unos **diez segundos**. Es el sistema de un sprint, un salto o una serie muy pesada.",
  "Sistema dos: la **glucólisis**. La glucosa, que viene de tu comida o del glucógeno del músculo, se rompe en el citoplasma sin necesitar oxígeno.",
  "Cada glucosa se parte en dos **piruvatos** y deja **dos ATP** netos. Es rápida, pero rinde poco.",
  "Si el esfuerzo es muy intenso, el piruvato se convierte en **lactato** y se acumulan protones: eso es el ardor del que te hablé.",
  "La glucólisis domina en esfuerzos de unos **diez segundos a dos minutos**, como correr cuatrocientos metros.",
  "En la **parte dos**: el sistema más grande de todos, el que usa oxígeno y quema grasa. ¿Cuál de estos sistemas usas más cuando entrenas? **Escríbelo en los comentarios**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), Final];

export const ENERGIA1: ShortDef = {
  id: "Short-Energia1",
  titulo: "¿De dónde sacan energía tus músculos? Parte 1: los sistemas rápidos",
  planos: ESCENAS.map((Escena, i) => ({ id: `energia1-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
