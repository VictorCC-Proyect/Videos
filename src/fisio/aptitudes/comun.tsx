import React from "react";
import { Humano } from "../modelos/cuerpo";
import { Polvo } from "../modelos/comun";
import { Escena3D } from "../ui";
import { FiguraIzq } from "../actividad/a1";

export const SEC_F = "Unidad 5 · Bases del entrenamiento de las aptitudes físicas";
export const COL_F = { fuerza: "#ff6b6b", res: "#3fb6e0", flex: "#7cff8a", vel: "#ffcf5a", morado: "#c25bff" };

type Modo = "camina" | "corre" | "curl" | "sentadilla" | "quieto" | "estira" | "salta" | "sprint";

/** Atleta 3D colocado en un lienzo de 1920 px desplazado dx a la izquierda. */
export const Atleta: React.FC<{ b: number; modo: Modo; brilla?: number; color?: string; dx?: number; giro?: number }> = ({
  b,
  modo,
  brilla = 0.3,
  color,
  dx = -260,
  giro = 0.5,
}) => {
  const envoltura = (hijo: React.ReactNode) => <div style={{ position: "absolute", left: dx, top: 0, width: 1920, height: 1080 }}>{hijo}</div>;
  if (modo !== "estira" && modo !== "salta" && modo !== "sprint") return envoltura(<FiguraIzq b={b} modo={modo} brilla={brilla} colorBrillo={color} giro={giro} />);
  const cam = { p: [2.0, 1.25, 3.7] as [number, number, number], l: [0.95, 0.95, 0] as [number, number, number], fov: 36 };
  let fig: React.ReactNode;
  if (modo === "sprint") fig = <Humano fase={b * 20} marcha={2.1} musculo={0.55} brilla={brilla} colorBrillo={color} />;
  else if (modo === "estira") {
    // Elevacion de pierna estirada con los brazos al frente (isquiosurales)
    const f = (Math.sin(b * 2.5) + 1) / 2;
    fig = (
      <Humano
        musculo={0.55}
        brilla={brilla}
        colorBrillo={color}
        pose={{ caderaD: [-(0.5 + 1.0 * f), 0, 0], rodillaD: 0, caderaI: [0, 0, 0], rodillaI: 0, hombroD: [-1.5, 0, 0.1], hombroI: [-1.5, 0, -0.1], codoD: 0, codoI: 0 }}
      />
    );
  } else {
    // Salto con contramovimiento: flexion, impulso y vuelo
    const t = (b * 1.3) % 1;
    const baja = t < 0.3 ? Math.sin((t / 0.3) * Math.PI) : 0;
    const vuelo = t >= 0.3 && t < 0.75 ? Math.sin(((t - 0.3) / 0.45) * Math.PI) : 0;
    fig = (
      <group position={[0, -baja * 0.25 + vuelo * 0.45, 0]}>
        <Humano
          musculo={0.55}
          brilla={brilla + vuelo * 0.4}
          colorBrillo={color}
          pose={{
            caderaD: [-baja * 1.0, 0, 0],
            caderaI: [-baja * 1.0, 0, 0],
            rodillaD: baja * 1.5,
            rodillaI: baja * 1.5,
            hombroD: [baja * 0.8 - vuelo * 2.6, 0, 0.1],
            hombroI: [baja * 0.8 - vuelo * 2.6, 0, -0.1],
            codoD: 0,
            codoI: 0,
          }}
        />
      </group>
    );
  }
  return envoltura(
    <Escena3D cam={cam}>
      <group rotation={[0, giro + Math.sin(b * 0.6) * 0.15, 0]}>{fig}</group>
      <Polvo b={b} radio={3} />
    </Escena3D>,
  );
};
