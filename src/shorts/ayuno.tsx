// Short: Ayuno intermitente: qué pasa en tu cuerpo por horas
// (borrador: las escenas 3D se escriben en este archivo)
import React from "react";
import { AbsoluteFill } from "remotion";
import { PlanoDef } from "../fisio/motor";
import { EscenaCierre } from "./cierre";
import { ShortDef } from "./marco";

const Vacia: React.FC<{ textos: string[] }> = () => <AbsoluteFill />;

const T = [
  "¿Qué pasa en tu cuerpo cuando **dejas de comer**? Vamos hora por hora.",
  "De **0 a 4 horas** estás digiriendo: la **insulina** sube y guardas la glucosa como glucógeno y grasa.",
  "De **4 a 12 horas** la insulina baja y el hígado libera glucosa de su **glucógeno** para mantenerte estable.",
  "De **12 a 18 horas** el glucógeno del hígado se va agotando y aumenta la **quema de grasa**.",
  "Con la grasa, el hígado empieza a fabricar **cuerpos cetónicos**: un combustible extra para el cerebro y los músculos.",
  "Con ayunos más largos aumenta la **autofagia**, el reciclaje de partes viejas de la célula, aunque en humanos todavía se está estudiando.",
  "¿Y para bajar de peso? Funciona igual que otras dietas **si al final comes menos calorías**. No es magia.",
  "Ojo: no es para todos. Si estás embarazada, tienes diabetes o has tenido trastornos de la conducta alimentaria, consulta antes a un profesional.",
  "Sígueme para más **nutrición explicada con ciencia**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), EscenaCierre];

export const AYUNO: ShortDef = {
  id: "Short-Ayuno",
  titulo: "Ayuno intermitente: qué pasa en tu cuerpo por horas",
  planos: ESCENAS.map((Escena, i) => ({ id: `ayuno-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
