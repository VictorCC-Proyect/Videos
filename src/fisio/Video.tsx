import React from "react";
import { Series } from "remotion";
import { PlanoDef } from "./motor";
import { durPlanos, Planos } from "./ui";
import { CAP0 } from "./capitulos/cap0";
import { CAP1 } from "./capitulos/cap1";
import { CAP2 } from "./capitulos/cap2";
import { CAP3 } from "./capitulos/cap3";
import { CAP4 } from "./capitulos/cap4";
import { CAP5 } from "./capitulos/cap5";
import { CAP6 } from "./capitulos/cap6";
import { E1 } from "./energia/e1";
import { E2 } from "./energia/e2";
import { E3 } from "./energia/e3";
import { E4 } from "./energia/e4";
import { E5 } from "./energia/e5";
import { E6 } from "./energia/e6";
import { A1 } from "./actividad/a1";
import { A2 } from "./actividad/a2";
import { A3, A4 } from "./actividad/a3";
import { K1 } from "./cardio/k1";
import { K2 } from "./cardio/k2";
import { K3 } from "./cardio/k3";
import { K4 } from "./cardio/k4";

export type Capitulo = { id: string; titulo: string; planos: PlanoDef[] };

export const CAPITULOS: Capitulo[] = [
  { id: "Cap0-Introduccion", titulo: "Introducción", planos: CAP0 },
  { id: "Cap1-Musculo", titulo: "1.1 Músculo esquelético", planos: CAP1 },
  { id: "Cap2-Fibras", titulo: "1.2 Fibras musculares", planos: CAP2 },
  { id: "Cap3-Hueso", titulo: "1.3 Sistema óseo", planos: CAP3 },
  { id: "Cap4-Articulaciones", titulo: "Articulaciones", planos: CAP4 },
  { id: "Cap5-Tendones-Ligamentos", titulo: "Tendones y ligamentos", planos: CAP5 },
  { id: "Cap6-Sistema-Nervioso", titulo: "1.4 Sistema nervioso", planos: CAP6 },
];

// Unidad 2: Sistemas energeticos
export const CAPITULOS_ENERGIA: Capitulo[] = [
  { id: "E1-ATP-Fosfagenos", titulo: "ATP y fosfágenos", planos: E1 },
  { id: "E2-Glucolisis-Anaerobica", titulo: "Glucólisis anaeróbica", planos: E2 },
  { id: "E3-Metabolismo-Aerobico", titulo: "Metabolismo aeróbico", planos: E3 },
  { id: "E4-Grasas-Aminoacidos", titulo: "Grasas y aminoácidos", planos: E4 },
  { id: "E5-Continuum", titulo: "Continuum energético", planos: E5 },
  { id: "E6-Umbral-Anaerobico", titulo: "Umbral anaeróbico", planos: E6 },
];

// Unidad 4: Ejercicio, actividad fisica y deporte
export const CAPITULOS_ACTIVIDAD: Capitulo[] = [
  { id: "A1-Definiciones", titulo: "4.1 Definiciones y características", planos: A1 },
  { id: "A2-Intensidad", titulo: "4.2 Intensidad del entrenamiento", planos: A2 },
  { id: "A3-Carga-Volumen", titulo: "4.3 Carga-volumen", planos: A3 },
  { id: "A4-Repaso", titulo: "Repaso", planos: A4 },
];

// Unidad 3: Sistema cardiovascular
export const CAPITULOS_CARDIO: Capitulo[] = [
  { id: "K1-Frecuencia-Cardiaca", titulo: "3.1 Frecuencia cardiaca", planos: K1 },
  { id: "K2-VO2", titulo: "3.2 Consumo de oxígeno y VO₂máx", planos: K2 },
  { id: "K3-Deuda-O2-MET", titulo: "3.3 Deuda de oxígeno y 3.4 MET", planos: K3 },
  { id: "K4-Control-FC", titulo: "3.5 Control por FC y repaso", planos: K4 },
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

export const VideoEnergia: React.FC = () => (
  <Series>
    {CAPITULOS_ENERGIA.map((c) => (
      <Series.Sequence key={c.id} durationInFrames={durCapitulo(c)} name={c.id}>
        <Planos planos={c.planos} />
      </Series.Sequence>
    ))}
  </Series>
);

export const VideoActividad: React.FC = () => (
  <Series>
    {CAPITULOS_ACTIVIDAD.map((c) => (
      <Series.Sequence key={c.id} durationInFrames={durCapitulo(c)} name={c.id}>
        <Planos planos={c.planos} />
      </Series.Sequence>
    ))}
  </Series>
);

export const VideoCardio: React.FC = () => (
  <Series>
    {CAPITULOS_CARDIO.map((c) => (
      <Series.Sequence key={c.id} durationInFrames={durCapitulo(c)} name={c.id}>
        <Planos planos={c.planos} />
      </Series.Sequence>
    ))}
  </Series>
);

export const CapituloView: React.FC<{ capId: string }> = ({ capId }) => {
  const c = [...CAPITULOS, ...CAPITULOS_ENERGIA, ...CAPITULOS_ACTIVIDAD, ...CAPITULOS_CARDIO].find((x) => x.id === capId) ?? CAPITULOS[0];
  return <Planos planos={c.planos} />;
};
