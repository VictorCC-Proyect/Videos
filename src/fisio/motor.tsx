// Motor del video: el tiempo de cada plano se mide en "beats" (uno por texto de
// narracion). b = 2.5 significa "a la mitad del tercer texto". Camara, etiquetas
// y animaciones se sincronizan con la narracion usando esta unidad.
import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import narracion from "./narracion.json";

export const FPS = 30;
// Velocidad de lectura (caracteres por segundo) para calcular cuanto dura cada texto.
const CPS = 14;
export const FADE = 12;

/** Duracion (s) de la narracion de cada texto, indexada por hashTexto. */
const NARRACION: Record<string, number> = narracion;

/** FNV-1a de 32 bits; debe coincidir con scripts/narracion.py. */
export const hashTexto = (t: string) => {
  let h = 0x811c9dc5;
  for (const ch of t) {
    h ^= ch.codePointAt(0) ?? 0;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
};

export const tieneNarracion = (t: string) => NARRACION[hashTexto(t)] !== undefined;

export const durTexto = (t: string) => {
  const voz = NARRACION[hashTexto(t)];
  if (voz !== undefined) return Math.round(FPS * Math.max(3.5, voz + 0.9));
  return Math.round(FPS * Math.max(4.5, 2 + t.replace(/\*\*/g, "").length / CPS));
};

export const durTextos = (textos: string[]) =>
  textos.reduce((a, t) => a + durTexto(t), 0) + FADE;

export type PlanoDef = {
  id: string;
  seccion: string;
  textos: string[];
  Escena: React.FC<{ textos: string[] }>;
};

export const durPlano = (p: PlanoDef) => durTextos(p.textos);

/** Posicion actual medida en beats (indice de texto + progreso dentro de el). */
export const useBeat = (textos: string[]) => {
  const frame = useCurrentFrame();
  return beatDeFrame(textos, frame);
};

export const beatDeFrame = (textos: string[], frame: number) => {
  let inicio = 0;
  for (let i = 0; i < textos.length; i++) {
    const d = durTexto(textos[i]);
    if (frame < inicio + d) return i + (frame - inicio) / d;
    inicio += d;
  }
  return textos.length;
};

/** Progreso 0..1 suavizado entre los beats a y z. */
export const entre = (b: number, a: number, z: number) =>
  interpolate(b, [a, z], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

/** Progreso lineal 0..1 entre a y z (para movimientos constantes). */
export const lineal = (b: number, a: number, z: number) =>
  interpolate(b, [a, z], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Opacidad visible entre beats a y z con fundidos cortos. */
export const visible = (b: number, a: number, z: number, f = 0.15) =>
  Math.min(entre(b, a, a + f), 1 - entre(b, z - f, z));

export const mix = (a: number, z: number, t: number) => a + (z - a) * t;

export type V3 = [number, number, number];
export const mix3 = (a: V3, z: V3, t: number): V3 => [
  mix(a[0], z[0], t),
  mix(a[1], z[1], t),
  mix(a[2], z[2], t),
];

// ---- Camara -------------------------------------------------------------
export type CamKey = { b: number; p: V3; l: V3; fov?: number };
export type Cam = { p: V3; l: V3; fov: number };

export const camara = (keys: CamKey[], b: number): Cam => {
  const k = [...keys].sort((x, y) => x.b - y.b);
  if (b <= k[0].b) return { p: k[0].p, l: k[0].l, fov: k[0].fov ?? 40 };
  for (let i = 0; i < k.length - 1; i++) {
    const a = k[i];
    const z = k[i + 1];
    if (b <= z.b) {
      const t = entre(b, a.b, z.b);
      return {
        p: mix3(a.p, z.p, t),
        l: mix3(a.l, z.l, t),
        fov: mix(a.fov ?? 40, z.fov ?? 40, t),
      };
    }
  }
  const u = k[k.length - 1];
  return { p: u.p, l: u.l, fov: u.fov ?? 40 };
};

/** Movimiento orbital: util para que la camara "respire" alrededor de un punto. */
export const orbita = (
  centro: V3,
  radio: number,
  altura: number,
  angulo: number,
): V3 => [
  centro[0] + Math.sin(angulo) * radio,
  centro[1] + altura,
  centro[2] + Math.cos(angulo) * radio,
];
