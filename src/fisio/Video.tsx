import React from "react";
import { Series } from "remotion";
import { PlanoDef } from "./motor";
import { durPlanos, Planos } from "./ui";
import { CAP0 } from "./capitulos/cap0";
import { CAP1 } from "./capitulos/cap1";
import { CAP2 } from "./capitulos/cap2";
import { CAP3 } from "./capitulos/cap3";

export type Capitulo = { id: string; titulo: string; planos: PlanoDef[] };

export const CAPITULOS: Capitulo[] = [
  { id: "Cap0-Introduccion", titulo: "Introducción", planos: CAP0 },
  { id: "Cap1-Musculo", titulo: "1.1 Músculo esquelético", planos: CAP1 },
  { id: "Cap2-Fibras", titulo: "1.2 Fibras musculares", planos: CAP2 },
  { id: "Cap3-Hueso", titulo: "1.3 Sistema óseo", planos: CAP3 },
];

export const durCapitulo = (c: Capitulo) => durPlanos(c.planos);

export const VideoCompleto: React.FC = () => (
  <Series>
    {CAPITULOS.map((c) => (
      <Series.Sequence key={c.id} durationInFrames={durCapitulo(c)} name={c.id}>
        <Planos planos={c.planos} />
      </Series.Sequence>
    ))}
  </Series>
);

export const CapituloView: React.FC<{ capId: string }> = ({ capId }) => {
  const c = CAPITULOS.find((x) => x.id === capId) ?? CAPITULOS[0];
  return <Planos planos={c.planos} />;
};
