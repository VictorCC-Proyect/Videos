// Short: Fibras rápidas y lentas. Parte 3: qué decide el tipo de fibra y hasta dónde puede cambiar.
// Fuentes: Andersen y Aagaard 2000 (Muscle Nerve), Schiaffino et al. 2025 (Cold Spring Harb Perspect Biol), Coletti et al. 2022 (Eur J Transl Myol).
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
    pregunta={<>¿Qué tema para la <span style={{ color: K.lima }}>parte 4</span>?</>}
    escribe="Quiero…"
    ideas={["FIBRAS Y DEPORTE", "FIBRAS Y EDAD", "CRECER CADA FIBRA"]}
  />
);

const T = [
  "En la parte dos viste que el entrenamiento puede cambiar tus fibras. Hoy vamos más profundo: ¿qué decide el tipo de una fibra y **hasta dónde** puede cambiar?",
  "El tipo de fibra lo marca su **miosina**: cada tipo fabrica una versión distinta, más lenta o más rápida, que gasta ATP a diferente velocidad.",
  "¿Y quién decide qué miosina fabricar? Sobre todo, la **neurona** que la controla. En experimentos clásicos, al cambiarle el nervio a un músculo, sus fibras cambiaron de tipo.",
  "Lo que cuenta es el **patrón** de la señal: impulsos lentos y constantes mantienen el calcio elevado en la fibra y encienden los genes de fibra **lenta**.",
  "Mientras cambian, muchas fibras son **híbridas**: fabrican dos tipos de miosina al mismo tiempo, como una fibra en obra.",
  "En un estudio, con tres meses de pesas, las fibras **dos X** bajaron de un nueve a un dos por ciento: casi todas se volvieron **dos A**.",
  "Pero después de tres meses **sin entrenar**, las dos X regresaron y quedaron por encima del inicio: un **diecisiete** por ciento. Es el efecto **rebote**.",
  "Sin entrenamiento, la fibra vuelve a un programa más rápido, pero el músculo también pierde la **fuerza** que habías ganado.",
  "Con la edad pasa lo contrario: algunas fibras rápidas pierden su neurona, una neurona **lenta** las adopta, y se vuelven lentas.",
  "El ejercicio a lo largo de la vida ayuda a **conservar** esas conexiones. Por eso entrenar fuerza es clave para envejecer mejor.",
  "¿Qué tema quieres para la parte cuatro? **Escríbelo en los comentarios**.",
];

const ESCENAS = [...T.slice(0, -1).map(() => Vacia), Final];

export const FIBRAS3: ShortDef = {
  id: "Short-Fibras3",
  titulo: "¿Se pueden cambiar tus fibras musculares? Parte 3",
  planos: ESCENAS.map((Escena, i) => ({ id: `fibras3-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
