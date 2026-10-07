import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { V3 } from "../motor";

// ---- Texturas procedurales (se generan una vez) -------------------------

const cache = new Map<string, THREE.Texture>();

const lienzo = (
  key: string,
  w: number,
  h: number,
  pintar: (ctx: CanvasRenderingContext2D) => void,
) => {
  const ya = cache.get(key);
  if (ya) return ya;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  pintar(ctx);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, t);
  return t;
};

/** Patron de bandas de un sarcomero (Z, I, A, H, M) repetido a lo largo de V. */
export const texEstriada = () =>
  lienzo("estriada", 4, 256, (ctx) => {
    const banda = (y0: number, y1: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(0, y0, 4, y1 - y0);
    };
    banda(0, 256, "#e46a72"); // I (clara)
    banda(46, 210, "#8e1d2a"); // A (oscura)
    banda(108, 148, "#b23a46"); // H
    banda(126, 130, "#5a0c16"); // M
    banda(0, 5, "#3a0710"); // Z
    banda(251, 256, "#3a0710");
  });

/** Corte transversal con circulos empaquetados (para caras de cilindros). */
export const texCorte = (fondo: string, punto: string, borde: string, n = 9) =>
  lienzo(`corte-${fondo}-${punto}-${n}`, 512, 512, (ctx) => {
    ctx.fillStyle = fondo;
    ctx.fillRect(0, 0, 512, 512);
    const r = 256 / n;
    for (let row = -1; row < n * 2 + 2; row++) {
      for (let col = -1; col < n + 2; col++) {
        const x = col * r * 2 + (row % 2) * r;
        const y = row * r * 1.732;
        ctx.beginPath();
        ctx.arc(x, y, r * 0.86, 0, Math.PI * 2);
        ctx.fillStyle = punto;
        ctx.fill();
        ctx.lineWidth = r * 0.12;
        ctx.strokeStyle = borde;
        ctx.stroke();
      }
    }
  });

// ---- Utilidades geometricas --------------------------------------------

/** Puntos de una red hexagonal dentro de un circulo de radio R. */
export const hexPack = (R: number, sep: number): [number, number][] => {
  const out: [number, number][] = [];
  const n = Math.ceil(R / sep) + 1;
  for (let i = -n; i <= n; i++) {
    for (let j = -n; j <= n; j++) {
      const x = sep * (i + j / 2);
      const y = sep * (j * Math.sqrt(3)) / 2;
      if (Math.hypot(x, y) <= R + 1e-6) out.push([x, y]);
    }
  }
  return out;
};

export const rnd = (seed: string | number) => random(seed);

export const useGeo = <T,>(f: () => T, deps: unknown[]) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(f, deps);

/** Tubo que sigue una lista de puntos. */
export const Tubo: React.FC<{
  puntos: V3[];
  radio: number;
  color: string;
  emisivo?: number;
  opacidad?: number;
  segmentos?: number;
}> = ({ puntos, radio, color, emisivo = 0, opacidad = 1, segmentos }) => {
  const key = puntos.map((p) => p.map((v) => v.toFixed(3)).join(",")).join(";");
  const geo = useMemo(() => {
    const curva = new THREE.CatmullRomCurve3(
      puntos.map((p) => new THREE.Vector3(...p)),
    );
    return new THREE.TubeGeometry(curva, segmentos ?? puntos.length * 4, radio, 10, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, radio, segmentos]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emisivo}
        roughness={0.45}
        transparent={opacidad < 1}
        opacity={opacidad}
      />
    </mesh>
  );
};

/** Particulas brillantes (iones, neurotransmisores...). */
export const Particulas: React.FC<{
  pos: V3[];
  radio: number;
  color: string;
  opacidad?: number;
  brillo?: number;
}> = ({ pos, radio, color, opacidad = 1, brillo = 1.2 }) => (
  <>
    {pos.map((p, i) => (
      <group key={i} position={p}>
        <mesh>
          <sphereGeometry args={[radio, 12, 10]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={brillo}
            transparent={opacidad < 1}
            opacity={opacidad}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[radio * 2.2, 10, 8]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.18 * opacidad}
            depthWrite={false}
          />
        </mesh>
      </group>
    ))}
  </>
);

/** Polvo flotante para dar profundidad (estilo documental). */
export const Polvo: React.FC<{ b: number; radio?: number; n?: number; color?: string }> = ({
  b,
  radio = 6,
  n = 70,
  color = "#9fd8ff",
}) => (
  <>
    {Array.from({ length: n }).map((_, i) => {
      const x = (rnd(`px${i}`) - 0.5) * radio * 2;
      const y = (rnd(`py${i}`) - 0.5) * radio * 2 + Math.sin(b * 0.7 + i) * 0.05 * radio;
      const z = (rnd(`pz${i}`) - 0.5) * radio * 2;
      return (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[radio * 0.004 * (0.5 + rnd(`ps${i}`)), 6, 6]} />
          <meshBasicMaterial color={color} transparent opacity={0.35} />
        </mesh>
      );
    })}
  </>
);

/** Interpola una trayectoria con "ruido" para iones que difunden. */
export const difusion = (
  desde: V3,
  hasta: V3,
  t: number,
  seed: string,
  amp = 0.3,
): V3 => {
  const a = rnd(seed + "a") * Math.PI * 2;
  const k = Math.sin(t * Math.PI);
  return [
    desde[0] + (hasta[0] - desde[0]) * t + Math.sin(a + t * 9) * amp * k,
    desde[1] + (hasta[1] - desde[1]) * t + Math.cos(a * 1.3 + t * 7) * amp * k,
    desde[2] + (hasta[2] - desde[2]) * t + Math.sin(a * 0.7 + t * 11) * amp * k,
  ];
};
