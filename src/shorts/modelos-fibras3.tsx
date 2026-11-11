// Modelos 3D del short de fibras, parte 3: qué decide el tipo de fibra y hasta dónde cambia.
import React, { useMemo } from "react";
import * as THREE from "three";
import { mix, V3 } from "../fisio/motor";
import { hexPack, rnd, Tubo } from "../fisio/modelos/comun";
import { Esfera } from "../fisio/modelos/energia";
import { F2_COL, F2ADN, f2Polilinea } from "./modelos-fibras";

/** Rojo legible para textos del tipo I. */
export const F3_ROJO_TXT = "#ff5c6c";

/** Mezcla dos colores hex (t 0..1). */
export const f3Mezcla = (a: string, z: string, t: number) =>
  `#${new THREE.Color(a).lerp(new THREE.Color(z), Math.min(1, Math.max(0, t))).getHexString()}`;

/** Puntos de una polilinea entre las fracciones a y z (para nervios que crecen o se retraen). */
export const f3Tramo = (pts: V3[], a: number, z: number, n = 14): V3[] =>
  Array.from({ length: n }).map((_, i) => f2Polilinea(pts, mix(a, z, i / (n - 1))));

// ---- Corte transversal con % de IIx controlable --------------------------------------

/**
 * Corte de un musculo (mosaico tipo tincion) de cara a +Z. lentas = fraccion tipo I;
 * iix = fraccion del total que es IIx (el resto, IIa). Al bajar iix, las IIx pasan a IIa
 * (rosadas) y al subir reaparecen: siempre las mismas celdas, de forma continua.
 */
export const F3Corte: React.FC<{ p?: V3; r?: number; lentas?: number; iix?: number; brillaIIx?: number; seed?: string }> = ({
  p = [0, 0, 0],
  r = 1,
  lentas = 0.45,
  iix = 0.09,
  brillaIIx = 0,
  seed = "f3c",
}) => {
  const sep = r * 0.17;
  const pos = useMemo(() => hexPack(r * 0.92, sep), [r, sep]);
  const n = pos.length;
  // orden fijo de las celdas rapidas: las primeras de la lista son IIx
  const rapidas = useMemo(
    () =>
      pos
        .map((_, i) => i)
        .filter((i) => rnd(`${seed}t${i}`) >= lentas)
        .sort((a, b) => rnd(`${seed}v${a}`) - rnd(`${seed}v${b}`)),
    [pos, lentas, seed],
  );
  const rango = new Map(rapidas.map((i, k) => [i, k]));
  const nIIx = iix * n;
  return (
    <group position={p}>
      <mesh position={[0, 0, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r, r, 0.12, 56]} />
        <meshStandardMaterial color="#3b0d14" roughness={0.7} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.06]}>
        <cylinderGeometry args={[r * 1.02, r * 1.02, 0.16, 56, 1, true]} />
        <meshStandardMaterial color="#f2d6c8" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {pos.map(([x, y], i) => {
        const k = rango.get(i);
        let hex: string = F2_COL.I;
        let es = 0;
        if (k !== undefined) {
          es = Math.min(1, Math.max(0, nIIx - k)); // 1 = IIx, 0 = IIa (transicion suave)
          hex = f3Mezcla(F2_COL.IIa, F2_COL.IIx, es);
        }
        const rf = sep * 0.47 * (k === undefined ? 0.92 : 1.05);
        const glow = es * brillaIIx;
        return (
          <group key={i} position={[x + (rnd(`${seed}x${i}`) - 0.5) * sep * 0.12, y + (rnd(`${seed}y${i}`) - 0.5) * sep * 0.1, 0]}>
            <mesh rotation={[Math.PI / 2, rnd(`${seed}g${i}`), 0]}>
              <cylinderGeometry args={[rf, rf, 0.1, 6]} />
              <meshPhysicalMaterial color={hex} emissive={hex} emissiveIntensity={0.08 + glow * 0.5} roughness={0.4} clearcoat={0.4} />
            </mesh>
            {glow > 0.02 ? (
              <mesh position={[0, 0, 0.06]}>
                <ringGeometry args={[rf * 1.0, rf * 1.25, 24]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={glow * 0.8} depthWrite={false} />
              </mesh>
            ) : null}
          </group>
        );
      })}
    </group>
  );
};

const f3Orden = (r: number, lentas: number, seed: string) => {
  const pos = hexPack(r * 0.92, r * 0.17);
  const idx = pos.map((_, i) => i);
  const rap = idx.filter((i) => rnd(`${seed}t${i}`) >= lentas).sort((a, b) => rnd(`${seed}v${a}`) - rnd(`${seed}v${b}`));
  const len = idx.filter((i) => rnd(`${seed}t${i}`) < lentas);
  return { pos, rap, len };
};

/** Numero de celdas del corte (para convertir % en celdas). */
export const f3NCeldas = (r = 1) => hexPack(r * 0.92, r * 0.17).length;

/** Posicion (en el corte, sin p) de la k-esima celda rapida en orden de conversion (k < iix*n son IIx). */
export const f3CeldaRapida = (k: number, r = 1, lentas = 0.45, seed = "f3c"): V3 => {
  const { pos, rap } = f3Orden(r, lentas, seed);
  const i = rap[Math.min(Math.max(0, k), rap.length - 1)];
  return [pos[i][0], pos[i][1], 0.06];
};

/** Celda lenta (tipo I) mas cercana a un punto. */
export const f3CeldaLenta = (cerca: [number, number], r = 1, lentas = 0.45, seed = "f3c"): V3 => {
  const { pos, len } = f3Orden(r, lentas, seed);
  const i = [...len].sort((a, b) => Math.hypot(pos[a][0] - cerca[0], pos[a][1] - cerca[1]) - Math.hypot(pos[b][0] - cerca[0], pos[b][1] - cerca[1]))[0];
  return [pos[i][0], pos[i][1], 0.06];
};

// ---- Neurona motora (soma suelto + nervios) -----------------------------------------

/** Soma de una motoneurona con dendritas. act = brillo; apaga 0..1 = se vuelve gris y opaca. */
export const F3Soma: React.FC<{ p: V3; tam?: number; act?: number; apaga?: number; seed?: string }> = ({ p, tam = 0.16, act = 0, apaga = 0, seed = "s" }) => {
  const col = f3Mezcla(F2_COL.nervio, "#4a4f55", apaga);
  const glow = (0.35 + act * 1.2) * (1 - apaga * 0.9);
  const op = 1 - apaga * 0.45;
  return (
    <group position={p}>
      <mesh>
        <sphereGeometry args={[tam, 28, 20]} />
        <meshPhysicalMaterial color={col} emissive={col} emissiveIntensity={glow} roughness={0.35} clearcoat={0.6} transparent={op < 1} opacity={op} />
      </mesh>
      <mesh position={[0, 0, tam * 0.55]}>
        <sphereGeometry args={[tam * 0.38, 16, 12]} />
        <meshStandardMaterial color={f3Mezcla("#b0742a", "#2a2d31", apaga)} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2 + 0.5;
        if (Math.sin(a) < -0.75) return null;
        const d: V3 = [Math.cos(a) * tam * 2.8, Math.sin(a) * tam * 2.4 + tam * 0.4, (rnd(`${seed}dz${i}`) - 0.5) * tam * 2];
        const m: V3 = [Math.cos(a + 0.3) * tam * 1.5, Math.sin(a + 0.3) * tam * 1.3, d[2] * 0.4];
        return <Tubo key={i} puntos={[[0, 0, 0], m, d]} radio={0.012 + tam * 0.05} color={col} emisivo={glow * 0.6} opacidad={op} segmentos={10} />;
      })}
    </group>
  );
};

/** Nervio (tubo) dibujado entre las fracciones a..z de su recorrido. */
export const F3Nervio: React.FC<{ pts: V3[]; a?: number; z?: number; r?: number; act?: number; apaga?: number }> = ({
  pts,
  a = 0,
  z = 1,
  r = 0.022,
  act = 0,
  apaga = 0,
}) => {
  if (z - a < 0.01) return null;
  const col = f3Mezcla(F2_COL.nervio, "#4a4f55", apaga);
  const op = 1 - apaga * 0.5;
  return <Tubo puntos={f3Tramo(pts, a, z)} radio={r} color={col} emisivo={(0.35 + act * 0.9) * (1 - apaga * 0.9)} opacidad={op} segmentos={40} />;
};

/** Placa motora (union nervio-fibra). */
export const F3Placa: React.FC<{ p: V3; op?: number; act?: number }> = ({ p, op = 1, act = 0 }) =>
  op > 0.02 ? (
    <mesh position={p} scale={[1.3, 0.6, 1]}>
      <sphereGeometry args={[0.055, 14, 10]} />
      <meshStandardMaterial color={F2_COL.nervio} emissive={F2_COL.nervio} emissiveIntensity={0.5 + act} transparent={op < 1} opacity={op} />
    </mesh>
  ) : null;

// ---- Fibra hibrida (dos miosinas a la vez) --------------------------------------------

/**
 * Fibra vertical con franjas longitudinales de dos colores (coexpresa dos miosinas).
 * mezcla 0..1 = cuanto del segundo color tiene.
 */
export const F3FibraHibrida: React.FC<{ p?: V3; r?: number; alto?: number; a: string; z: string; mezcla?: number; giro?: number; act?: number }> = ({
  p = [0, 0, 0],
  r = 0.45,
  alto = 2.6,
  a,
  z,
  mezcla = 0.5,
  giro = 0,
  act = 0,
}) => {
  const N = 14;
  const filas = 9;
  return (
    <group position={p} rotation={[0, giro, 0]}>
      {Array.from({ length: N * filas }).map((_, k) => {
        const i = k % N;
        const j = Math.floor(k / N);
        const u = rnd(`fh${i}_${j}`) * 0.6 + (i % 2) * 0.4;
        const c = u < mezcla ? z : a;
        const h = alto / filas;
        return (
          <mesh key={k} position={[0, -alto / 2 + h * (j + 0.5), 0]}>
            <cylinderGeometry args={[r, r, h * 0.995, 6, 1, true, (i / N) * Math.PI * 2, (Math.PI * 2) / N]} />
            <meshPhysicalMaterial color={c} emissive={c} emissiveIntensity={0.08 + act} roughness={0.45} clearcoat={0.35} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      {/* estrias */}
      {Array.from({ length: 18 }).map((_, i) => (
        <mesh key={`e${i}`} position={[0, -alto / 2 + ((i + 0.5) * alto) / 18, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r * 1.003, 0.008, 6, 48]} />
          <meshStandardMaterial color="#8e8280" />
        </mesh>
      ))}
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, (s * alto) / 2, 0]} rotation={[-s * Math.PI / 2, 0, 0]}>
          <circleGeometry args={[r, 40]} />
          <meshStandardMaterial color={f3Mezcla(a, z, mezcla)} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};

/** Molecula de miosina (cola + dos cabezas) de un color: la "pieza" que se fabrica. */
export const F3Miosina: React.FC<{ p: V3; color: string; escala?: number; giro?: number; op?: number }> = ({ p, color, escala = 1, giro = 0, op = 1 }) => (
  <group position={p} scale={escala} rotation={[0, 0, giro]}>
    <mesh position={[-0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.028, 0.028, 0.5, 10]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} transparent={op < 1} opacity={op} />
    </mesh>
    {[1, -1].map((s) => (
      <Esfera key={s} p={[0.17, s * 0.05, 0]} r={0.065} color={color} brillo={0.5} op={op} />
    ))}
  </group>
);

// ---- Nucleo con genes ------------------------------------------------------------------

/**
 * Nucleo (esfera translucida) con un tramo de ADN horizontal y genes que se encienden.
 * genes = [{ color, on }] a lo largo del ADN.
 */
export const F3Nucleo: React.FC<{ p: V3; r?: number; genes: { color: string; on: number }[]; giro?: number }> = ({ p, r = 0.55, genes, giro = 0 }) => (
  <group position={p}>
    <mesh>
      <sphereGeometry args={[r, 40, 28]} />
      <meshPhysicalMaterial color="#4a6bff" emissive="#4a6bff" emissiveIntensity={0.15} transparent opacity={0.22} roughness={0.2} clearcoat={1} depthWrite={false} />
    </mesh>
    <group rotation={[0, 0, Math.PI / 2]} scale={0.55}>
      <F2ADN p={[0, 0, 0]} alto={r * 2.6} r={0.18} giro={giro} n={16} brillo={0.25} />
    </group>
    {genes.map((g, i) => {
      const x = (i - (genes.length - 1) / 2) * ((r * 1.25) / Math.max(1, genes.length - 1)) * (genes.length > 1 ? 1 : 0);
      return (
        <group key={i} position={[x, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.13, 0.13, 0.16, 20]} />
            <meshStandardMaterial
              color={f3Mezcla("#3a3f45", g.color, g.on)}
              emissive={g.color}
              emissiveIntensity={g.on * 1.2}
              transparent
              opacity={0.55 + g.on * 0.4}
            />
          </mesh>
          {g.on > 0.05 ? (
            <mesh>
              <sphereGeometry args={[0.24, 16, 12]} />
              <meshBasicMaterial color={g.color} transparent opacity={g.on * 0.25} depthWrite={false} />
            </mesh>
          ) : null}
        </group>
      );
    })}
  </group>
);

// ---- Simbolos ------------------------------------------------------------------------

/** Linea punteada horizontal (a lo largo de X). */
export const F3Punteada: React.FC<{ p: V3; largo: number; color?: string; n?: number }> = ({ p, largo, color = "#ffffff", n = 14 }) => (
  <group position={p}>
    {Array.from({ length: n }).map((_, i) => (
      <mesh key={i} position={[-largo / 2 + ((i + 0.5) * largo) / n, 0, 0]}>
        <boxGeometry args={[(largo / n) * 0.55, 0.025, 0.025]} />
        <meshBasicMaterial color={color} />
      </mesh>
    ))}
  </group>
);
