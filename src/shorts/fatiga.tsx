// Short: Fatiga muscular. PCr agotada, fosfato inorgánico, protones, glucógeno y fatiga central.
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
    pregunta={<>¿El cardio en ayunas quema <span style={{ color: K.lima }}>más grasa</span>?</>}
    escribe="Yo creo que…"
    ideas={["SÍ", "NO", "DEPENDE"]}
  />
);

const T = [
  "¿Por qué llega un momento en que ya no puedes hacer **ni una repetición más**? Eso es la **fatiga**, y no tiene una sola causa.",
  "La fatiga es la caída de tu capacidad para producir fuerza. Puede venir del **músculo** o del **sistema nervioso**.",
  "En el músculo, primero se agota la **fosfocreatina**, y el ATP ya no se recarga tan rápido.",
  "Se acumula **fosfato inorgánico**, que le estorba a la miosina y a la liberación de calcio: es uno de los principales culpables en esfuerzos intensos.",
  "Los **protones** bajan el pH y dan ese ardor. Y el **lactato** no es el villano: de hecho, se reutiliza como combustible.",
  "En esfuerzos largos, el problema es que se vacía el **glucógeno**: es la famosa **pared** de los maratonistas.",
  "Y también hay fatiga **central**: tu cerebro reduce la señal que manda a los músculos para protegerte.",
  "Para retrasarla: entrena tu sistema energético, llega con el **glucógeno lleno**, hidrátate y descansa entre series según tu objetivo.",
  "En el próximo video: ¿el **cardio en ayunas** quema más grasa? ¿Tú qué crees? **Escríbelo en los comentarios**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), Final];

export const FATIGA: ShortDef = {
  id: "Short-Fatiga",
  titulo: "Fatiga: por qué ya no puedes ni una repetición más",
  planos: ESCENAS.map((Escena, i) => ({ id: `fatiga-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
