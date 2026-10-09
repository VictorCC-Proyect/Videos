// Escena final comun: atleta en pose de fuerza + nombre del canal + SIGUEME.
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, useBeat } from "../fisio/motor";
import { Escena3D } from "../fisio/ui";
import { Cierre, K } from "./marco";
import { Atleta, Piso } from "./modelos";

export const CTA = "Sígueme para más **nutrición explicada con ciencia**.";

export const EscenaCierre: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara([{ b: 0, p: [0, 1.1, 6.4], l: [0, 1.05, 0], fov: 36 }], b);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[0, -0.5 + b * 1.2, 0]}>
          <Atleta ej="flex" k={Math.sin(b * 8) * 0.5 + 0.5} brilla={0.5} colorBrillo={K.lima} />
          <Piso />
        </group>
      </Escena3D>
      <Cierre b={b} />
    </AbsoluteFill>
  );
};
