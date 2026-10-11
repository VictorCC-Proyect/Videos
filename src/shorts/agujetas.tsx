// Short: ¿Por qué duelen los músculos al día siguiente? (agujetas / DOMS)
// Continuación del short del ardor. (borrador: las escenas 3D se escriben en este archivo)
import React from "react";
import { AbsoluteFill } from "remotion";
import { PlanoDef } from "../fisio/motor";
import { EscenaComentarios } from "./cierre";
import { K, ShortDef } from "./marco";

const Vacia: React.FC<{ textos: string[] }> = () => <AbsoluteFill />;

const Comentarios: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Qué <span style={{ color: K.lima }}>suplemento</span> explico?</>}
    escribe="Quiero el de…"
    ideas={["OMEGA 3", "PROTEÍNA WHEY", "BETA-ALANINA", "VITAMINA D", "ASHWAGANDHA"]}
  />
);

const T = [
  "En el video del ardor te dije que las agujetas eran otra cosa. ¿Por qué te duelen los músculos **al día siguiente**?",
  "Primero: **no** es el lactato. El lactato se va de tu músculo en **menos de una hora**, y las agujetas aparecen de **12 a 24 horas** después, con su máximo entre las **24 y 72**.",
  "Aparecen sobre todo con ejercicios **nuevos**, más intensos o con fase **excéntrica**: cuando el músculo se alarga mientras hace fuerza, como al bajar en una sentadilla.",
  "En esa fase, algunos sarcómeros se estiran de más y se producen **microdesgarros** en las fibras y en el tejido que las rodea.",
  "Tu cuerpo responde con **inflamación**: llegan células de defensa, se acumula líquido y se liberan sustancias que **sensibilizan** a los nervios del dolor.",
  "Por eso duele al **moverte** o al presionar el músculo, y no tanto en reposo.",
  "Mientras tanto, se activan las **células satélite**, y el músculo se repara y se **adapta**.",
  "La buena noticia: si repites el ejercicio, la próxima vez dolerá **mucho menos**. Se llama efecto de **carga repetida**.",
  "¿Cómo aliviarlas? Movimiento suave, **dormir bien** y suficiente **proteína**. Y ojo: más dolor **no** significa mejor entrenamiento.",
  "Si el dolor es muy intenso, la orina se pone **oscura** o hay mucha hinchazón, acude al **médico**.",
  "¿Qué suplemento quieres que explique en el próximo video? **Escríbelo en los comentarios**, y sígueme para más nutrición explicada con ciencia.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), Comentarios];

export const AGUJETAS: ShortDef = {
  id: "Short-Agujetas",
  titulo: "¿Por qué duelen los músculos al día siguiente?",
  planos: ESCENAS.map((Escena, i) => ({ id: `agujetas-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
