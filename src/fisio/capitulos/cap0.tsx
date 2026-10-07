import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, PlanoDef, useBeat, visible } from "../motor";
import { Humano } from "../modelos/cuerpo";
import { C } from "../tema";
import { Escena3D, Etiquetas, Lista, Tarjeta, TituloGrande } from "../ui";

const Portada: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 1.2, 4.2], l: [0, 1.0, 0], fov: 35 },
      { b: 2, p: [1.2, 1.25, 3.2], l: [0, 1.0, 0], fov: 35 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[0, b * 0.5, 0]}>
          <Humano fase={b * 5} marcha={1} musculo={0.5} />
        </group>
      </Escena3D>
      <TituloGrande
        b={b}
        a={0}
        z={2}
        sup="Fisiología y metodología del entrenamiento"
        t="Aparato locomotor"
        sub="Músculo · Hueso · Articulaciones · Tendones · Ligamentos · Sistema nervioso"
      />
    </AbsoluteFill>
  );
};

const SistemaLocomotor: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 1.1, 3.6], l: [0, 0.95, 0], fov: 35 },
      { b: 1, p: [-1.6, 1.3, 2.6], l: [0, 1.0, 0], fov: 35 },
      { b: 2, p: [0.9, 1.4, 1.6], l: [0, 1.25, 0], fov: 35 },
      { b: 3, p: [0.9, 1.4, 1.6], l: [0, 1.25, 0], fov: 35 },
    ],
    b,
  );
  // Al explicar los huesos el musculo se vuelve casi transparente.
  const musculo = 0.6 - 0.45 * visible(b, 1, 2.2);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Humano fase={b * 4} marcha={0.8 * (1 - entre(b, 1.8, 2.2))} musculo={musculo} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0.1, 0.72, 0], t: "Músculos", a: 1, z: 2, o: [90, -40], color: C.musculoClaro },
          { p: [-0.1, 0.6, 0], t: "Huesos", a: 1, z: 2, o: [-90, 30], color: C.hueso },
          { p: [0.1, 0.52, 0], t: "Articulaciones", a: 1, z: 2, o: [90, 60] },
          { p: [0, 1.3, 0.1], t: "Protección de órganos", a: 2, z: 3, o: [80, -60] },
        ]}
      />
      <Tarjeta b={b} a={0} z={3} x={1240} y={150} w={600} titulo="Sistema locomotor">
        <Lista
          b={b}
          a={0}
          paso={0.7}
          items={["Movimiento", "Postura", "Interacción con el entorno", "Desplazamiento y estabilidad", "Protección y producción de células sanguíneas"]}
        />
      </Tarjeta>
    </AbsoluteFill>
  );
};

export const CAP0: PlanoDef[] = [
  {
    id: "portada",
    seccion: "",
    textos: [
      "Aparato locomotor: un viaje desde el cuerpo humano hasta el interior de la fibra muscular.",
      "Veremos el **músculo**, las **fibras musculares**, el **hueso**, las **articulaciones**, los **tendones y ligamentos** y el **sistema nervioso** en el movimiento.",
    ],
    Escena: Portada,
  },
  {
    id: "sistema-locomotor",
    seccion: "Introducción",
    textos: [
      "El **sistema locomotor** es el conjunto de estructuras del cuerpo que permite el **movimiento**, la **postura** y la **interacción con el entorno**.",
      "Integra de manera funcional **huesos, músculos y articulaciones**, que trabajan en conjunto para garantizar el **desplazamiento** y la **estabilidad**.",
      "También **protege órganos vitales** y participa en la **producción de células sanguíneas** a través de la **médula ósea**.",
    ],
    Escena: SistemaLocomotor,
  },
];
