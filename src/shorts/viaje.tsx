// Viaje de camara: del cuerpo al interior de una fibra muscular (formato vertical).
// Se usa en todos los shorts para "entrar" al musculo.
import React from "react";
import { Cam, camara, entre, mix3, V3 } from "../fisio/motor";
import { Polvo } from "../fisio/modelos/comun";
import { NivelFibra, NivelMusculo } from "../fisio/modelos/musculo";
import { Atleta, Ejercicio, InteriorFibra, Piso } from "./modelos";
import { deEje } from "./marco";

/** Tramos del viaje (fracciones de 0..1). */
const T1 = 0.28; // cuerpo -> muslo
const T2 = 0.5; // musculo en corte
const T3 = 0.72; // fibra en corte

/** Camara de un nivel cilindrico (como en el capitulo 1) girada para verse de pie. */
const camNivel = (u: number): Cam => {
  const ida = entre(u, 0, 0.8);
  const zum = entre(u, 0.8, 1);
  const p = mix3(mix3([3.6, 1.8, 3.4], [1.4, 0.5, 0.7], ida), [0.2, 0, 0.02], zum);
  const l = mix3(mix3([-1.4, 0, 0], [-0.2, 0, 0], ida), [-1, 0, 0], zum);
  return { p: deEje(p), l: deEje(l), fov: 42 };
};

export const tramoViaje = (t: number) => (t < T1 ? 0 : t < T2 ? 1 : t < T3 ? 2 : 3);
export const cortesViaje = (a: number, z: number) => [T1, T2, T3].map((k) => a + (z - a) * k);

/** Camara del viaje; t = 0..1 a lo largo del recorrido. */
export const camViaje = (t: number, interiorFin: V3 = [0, 0.3, 10.5]): Cam => {
  const n = tramoViaje(t);
  if (n === 0) {
    return camara(
      [
        { b: 0, p: [0.6, 1.2, 6.6], l: [0, 0.6, 0], fov: 36 },
        { b: 0.6, p: [0.75, 0.85, 1.7], l: [0.12, 0.62, 0], fov: 36 },
        { b: 1, p: [0.16, 0.74, 0.28], l: [0.11, 0.7, 0], fov: 36 },
      ],
      t / T1,
    );
  }
  if (n === 1) return camNivel((t - T1) / (T2 - T1));
  if (n === 2) return camNivel((t - T2) / (T3 - T2));
  return camara(
    [
      { b: 0, p: [0, 0.3, 22], l: [0, -0.6, 0], fov: 40 },
      { b: 1, p: interiorFin, l: [0, -0.9, 0], fov: 40 },
    ],
    (t - T3) / (1 - T3),
  );
};

/** Contenido 3D del viaje. */
export const Viaje: React.FC<{
  t: number;
  b: number;
  ej?: Ejercicio;
  k?: number;
  fase?: number;
  colorBrillo?: string;
  interior?: Omit<React.ComponentProps<typeof InteriorFibra>, "b">;
}> = ({ t, b, ej = "sentadilla", k = 0, fase = 0, colorBrillo, interior }) => {
  const n = tramoViaje(t);
  const brillaMuslo = entre(t, T1 * 0.4, T1 * 0.9);
  return (
    <>
      {n === 0 ? (
        <>
          <Atleta ej={ej} k={k} fase={fase} brilla={brillaMuslo * 0.8} colorBrillo={colorBrillo} />
          <Piso />
        </>
      ) : null}
      {n === 1 ? (
        <group rotation={[0, 0, Math.PI / 2]}>
          <NivelMusculo brilla={entre(t, T2 - 0.08, T2)} />
        </group>
      ) : null}
      {n === 2 ? (
        <group rotation={[0, 0, Math.PI / 2]}>
          <NivelFibra brilla={entre(t, T3 - 0.08, T3)} />
        </group>
      ) : null}
      {n === 3 ? <InteriorFibra b={b} {...interior} /> : null}
      {n >= 1 ? <Polvo b={b} radio={5} /> : null}
    </>
  );
};
