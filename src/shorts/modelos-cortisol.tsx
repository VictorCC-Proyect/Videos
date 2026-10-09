// Modelos 3D propios del short de cortisol: molecula de cortisol (esteroide),
// glandulas suprarrenales, sol / luna, cama y frasco "anticortisol".
import React from "react";
import * as THREE from "three";
import { V3 } from "../fisio/motor";
import { Enlace, Esfera } from "../fisio/modelos/energia";
import { K } from "./marco";

export const CORT = "#ff9a3d";
export const ACTH = "#43e0ff";
export const SUPRA = "#ffcf3f";

// ---- Molecula de cortisol: esqueleto esteroide (3 anillos de 6 + 1 de 5) -------

const anillo = (c: [number, number], n: number, r: number, fase: number): [number, number][] =>
  Array.from({ length: n }).map((_, i) => {
    const a = fase + (i / n) * Math.PI * 2;
    return [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
  });

const S = 0.2;
const R3 = Math.sqrt(3);
const ANILLOS: [number, number][][] = [
  anillo([0, 0], 6, S, Math.PI / 2),
  anillo([R3 * S, 0], 6, S, Math.PI / 2),
  anillo([R3 * S * 1.5, 1.5 * S], 6, S, Math.PI / 2),
  anillo([R3 * S * 1.5 + S * 1.55, 1.5 * S + S * 0.15], 5, S * 0.86, Math.PI),
];
// atomos unicos (los anillos fusionados comparten vertices)
const ATOMOS: [number, number][] = [];
ANILLOS.flat().forEach((q) => {
  if (!ATOMOS.some((o) => Math.hypot(o[0] - q[0], o[1] - q[1]) < S * 0.3)) ATOMOS.push(q);
});
const CX = ATOMOS.reduce((a, q) => a + q[0], 0) / ATOMOS.length;
const CY = ATOMOS.reduce((a, q) => a + q[1], 0) / ATOMOS.length;

/** Cortisol: cuatro anillos fusionados (naranja) con sus oxigenos (rojo). */
export const MolCortisol: React.FC<{ p: V3; escala?: number; op?: number; brillo?: number; giro?: number }> = ({
  p,
  escala = 1,
  op = 1,
  brillo = 0.45,
  giro = 0,
}) => (
  <group position={p} scale={escala} rotation={[0.3, giro, 0.2]}>
    <group position={[-CX, -CY, 0]}>
      {ATOMOS.map((q, i) => (
        <Esfera key={i} p={[q[0], q[1], 0]} r={0.075} color={CORT} brillo={brillo} op={op} />
      ))}
      {ANILLOS.map((r, j) =>
        r.map((q, i) => {
          const s = r[(i + 1) % r.length];
          return <Enlace key={`${j}-${i}`} a={[q[0], q[1], 0]} b={[s[0], s[1], 0]} r={0.022} op={op} />;
        }),
      )}
      {/* oxigenos: C3 (cetona), C11 y C17 (hidroxilos) */}
      {[
        [ANILLOS[0][2], [-0.25, 0.05]],
        [ANILLOS[2][1], [0, 0.22]],
        [ANILLOS[3][1], [0.15, 0.2]],
      ].map(([q, d], i) => {
        const o: V3 = [q[0] + d[0], q[1] + d[1], 0];
        return (
          <group key={`o${i}`}>
            <Enlace a={[q[0], q[1], 0]} b={o} r={0.022} op={op} />
            <Esfera p={o} r={0.07} color={K.rojo} brillo={brillo} op={op} />
          </group>
        );
      })}
    </group>
    <mesh>
      <sphereGeometry args={[0.55, 16, 12]} />
      <meshBasicMaterial color={CORT} transparent opacity={0.08 * op} depthWrite={false} />
    </mesh>
  </group>
);

// ---- Glandula suprarrenal: "sombrero" amarillo encima de cada rinon ------------

/** Suprarrenales en la misma posicion que los rinones de `Rinones` (x = ±0.85). */
export const Suprarrenales: React.FC<{ brillo?: number }> = ({ brillo = 0 }) => (
  <group>
    {[-1, 1].map((l) => (
      <group key={l} position={[l * 0.85, 0, 0]} rotation={[0, 0, l * 0.18]}>
        <mesh position={[0, 0.98, 0]} scale={[0.5, 0.42, 0.34]}>
          <coneGeometry args={[1, 1, 3, 1]} />
          <meshPhysicalMaterial color={SUPRA} emissive="#ffb000" emissiveIntensity={0.15 + brillo} roughness={0.35} clearcoat={0.6} flatShading />
        </mesh>
        {brillo > 0 ? (
          <mesh position={[0, 0.98, 0]}>
            <sphereGeometry args={[0.42, 16, 12]} />
            <meshBasicMaterial color={SUPRA} transparent opacity={0.18 * brillo} depthWrite={false} />
          </mesh>
        ) : null}
      </group>
    ))}
  </group>
);

// ---- Astros ---------------------------------------------------------------

export const Sol: React.FC<{ p: V3; r?: number; op?: number }> = ({ p, r = 0.8, op = 1 }) => (
  <group position={p}>
    <mesh>
      <sphereGeometry args={[r, 40, 30]} />
      <meshBasicMaterial color="#ffb347" transparent={op < 1} opacity={op} />
    </mesh>
    {[1.3, 1.7].map((k, i) => (
      <mesh key={i}>
        <sphereGeometry args={[r * k, 24, 18]} />
        <meshBasicMaterial color="#ff8a3d" transparent opacity={(0.2 - i * 0.08) * op} depthWrite={false} />
      </mesh>
    ))}
  </group>
);

export const Luna: React.FC<{ p: V3; r?: number }> = ({ p, r = 0.5 }) => (
  <group position={p}>
    <mesh>
      <sphereGeometry args={[r, 40, 30]} />
      <meshStandardMaterial color="#e8efff" emissive="#c8d6ff" emissiveIntensity={0.7} />
    </mesh>
    {[
      [0.18, 0.12, 0.42, 0.09],
      [-0.15, -0.1, 0.44, 0.07],
      [0.05, -0.22, 0.43, 0.05],
    ].map(([x, y, z, s], i) => (
      <mesh key={i} position={[x * r * 2, y * r * 2, z * r * 2]}>
        <sphereGeometry args={[s * r * 2, 12, 10]} />
        <meshStandardMaterial color="#aab6d6" />
      </mesh>
    ))}
    <mesh>
      <sphereGeometry args={[r * 1.8, 24, 18]} />
      <meshBasicMaterial color="#9fb8ff" transparent opacity={0.12} depthWrite={false} />
    </mesh>
  </group>
);

/** Estrellas fijas de fondo. */
export const Estrellas: React.FC<{ op?: number; n?: number }> = ({ op = 1, n = 40 }) => (
  <group>
    {Array.from({ length: n }).map((_, i) => {
      const x = Math.sin(i * 12.9898) * 43758.5453;
      const y = Math.sin(i * 78.233) * 12543.123;
      const fx = x - Math.floor(x);
      const fy = y - Math.floor(y);
      return (
        <mesh key={i} position={[(fx - 0.5) * 9, 1.2 + fy * 4.5, -4 - (i % 3)]}>
          <sphereGeometry args={[0.025 + (i % 3) * 0.01, 6, 4]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={op * (0.5 + (i % 2) * 0.5)} />
        </mesh>
      );
    })}
  </group>
);

// ---- Cama ------------------------------------------------------------------

/** Cama a lo largo del eje X (colchon a la altura y = 0.42). */
export const Cama: React.FC = () => (
  <group>
    <mesh position={[0, 0.18, 0]}>
      <boxGeometry args={[2.3, 0.3, 1.0]} />
      <meshStandardMaterial color="#3a2c4a" roughness={0.7} />
    </mesh>
    <mesh position={[0, 0.38, 0]}>
      <boxGeometry args={[2.2, 0.12, 0.95]} />
      <meshPhysicalMaterial color="#dfe6f5" roughness={0.6} />
    </mesh>
    <mesh position={[-0.88, 0.5, 0]} scale={[0.32, 0.1, 0.6]}>
      <sphereGeometry args={[1, 24, 16]} />
      <meshPhysicalMaterial color="#ffffff" roughness={0.5} />
    </mesh>
    {/* cobija */}
    <mesh position={[0.35, 0.5, 0]} scale={[1, 1, 1]}>
      <boxGeometry args={[1.45, 0.08, 1.0]} />
      <meshPhysicalMaterial color="#4f8dff" emissive="#2a4fa0" emissiveIntensity={0.15} roughness={0.6} />
    </mesh>
    <mesh position={[-1.13, 0.45, 0]}>
      <boxGeometry args={[0.06, 0.85, 1.0]} />
      <meshStandardMaterial color="#2a1f36" />
    </mesh>
  </group>
);

// ---- Frasco "anticortisol" con la etiqueta tachada --------------------------------

export const FrascoAnti: React.FC<{ p: V3; escala?: number; tacha?: number; giro?: number }> = ({ p, escala = 1, tacha = 0, giro = 0 }) => (
  <group position={p} scale={escala} rotation={[0, giro, 0]}>
    <mesh position={[0, 0.5, 0]}>
      <cylinderGeometry args={[0.36, 0.36, 1.0, 40]} />
      <meshPhysicalMaterial color="#2b1a0f" roughness={0.2} clearcoat={1} transparent opacity={0.92} />
    </mesh>
    <mesh position={[0, 0.48, 0]}>
      <cylinderGeometry args={[0.365, 0.365, 0.5, 40, 1, true]} />
      <meshStandardMaterial color="#f4f7f2" emissive={CORT} emissiveIntensity={0.08} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 0.48, 0.368]}>
      <circleGeometry args={[0.13, 24]} />
      <meshStandardMaterial color={CORT} emissive={CORT} emissiveIntensity={0.6} />
    </mesh>
    <mesh position={[0, 1.07, 0]}>
      <cylinderGeometry args={[0.25, 0.25, 0.16, 32]} />
      <meshPhysicalMaterial color="#d9dde2" roughness={0.3} metalness={0.4} />
    </mesh>
    {tacha > 0
      ? [-1, 1].map((s) => (
          <mesh key={s} position={[0, 0.48, 0.42]} rotation={[0, 0, s * 0.75]} scale={[tacha, 1, 1]}>
            <boxGeometry args={[1.1, 0.09, 0.04]} />
            <meshStandardMaterial color={K.rojo} emissive={K.rojo} emissiveIntensity={0.8} />
          </mesh>
        ))
      : null}
  </group>
);

/** Capsula de suplemento. */
export const CapsulaAnti: React.FC<{ p: V3; rot?: V3; escala?: number }> = ({ p, rot = [0, 0, 0], escala = 1 }) => (
  <group position={p} rotation={rot} scale={escala}>
    <mesh position={[0, 0.05, 0]}>
      <capsuleGeometry args={[0.07, 0.1, 8, 16]} />
      <meshPhysicalMaterial color="#f4f7f2" clearcoat={1} roughness={0.15} />
    </mesh>
    <mesh position={[0, -0.05, 0]}>
      <capsuleGeometry args={[0.072, 0.08, 8, 16]} />
      <meshPhysicalMaterial color={CORT} emissive={CORT} emissiveIntensity={0.2} clearcoat={1} roughness={0.15} />
    </mesh>
  </group>
);
