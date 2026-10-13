// Short: ¿Cómo le ordena tu cerebro al músculo que se contraiga? (Parte 1)
// (borrador: las escenas 3D se escriben en este archivo)
import React from "react";
import { AbsoluteFill } from "remotion";
import { PlanoDef } from "../fisio/motor";
import { EscenaComentarios } from "./cierre";
import { K, ShortDef } from "./marco";

const Vacia: React.FC<{ textos: string[] }> = () => <AbsoluteFill />;

const Comentarios: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Te quedó <span style={{ color: K.lima }}>alguna duda</span>?</>}
    escribe="Mi duda es…"
    ideas={["¿Y LA FATIGA?", "¿Y LOS CALAMBRES?", "UNIDAD MOTORA", "TÚBULOS T"]}
  />
);

const T = [
  "Ya viste cómo tu cuerpo fabrica ATP. Ahora mira en qué lo gasta: en **contraer tus músculos**. Parte uno.",
  "Todo empieza en tu cerebro: la **corteza motora** decide el movimiento y manda una señal eléctrica por la médula espinal.",
  "Esa señal viaja por una **motoneurona** hasta el músculo. Una sola neurona controla muchas fibras: eso es una **unidad motora**.",
  "Al llegar a la **placa motora**, la neurona libera **acetilcolina**, un mensajero químico.",
  "La acetilcolina se une a sus receptores en la fibra, entra **sodio** y se dispara un **potencial de acción**: una onda eléctrica que recorre toda la membrana.",
  "La onda se mete al interior de la fibra por los **túbulos T**, unos túneles en la membrana.",
  "Ahí activa unos sensores que abren las compuertas del **retículo sarcoplásmico**, el almacén de calcio de la fibra.",
  "Y el **calcio** sale disparado hacia las miofibrillas. Todo esto, en **milésimas de segundo**.",
  "El calcio ya está libre... En la **parte dos** te muestro qué hace dentro del músculo. ¿Te quedó alguna duda? **Escríbela en los comentarios**, y sígueme para no perdértela.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), Comentarios];

export const CONTRACCION1: ShortDef = {
  id: "Short-Contraccion1",
  titulo: "¿Cómo le ordena tu cerebro al músculo que se contraiga? (Parte 1)",
  planos: ESCENAS.map((Escena, i) => ({ id: `contraccion1-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
