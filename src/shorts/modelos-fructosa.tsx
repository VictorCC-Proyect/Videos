// Modelos 3D del short de fructosa: fructosa (anillo de 5), fresa, frutero, manzana en corte
// con malla de fibra, dientes, estomago, malla de fibra, exprimidor, caramelo, tache,
// hepatocito y multitud de personas.
import React from "react";
import * as THREE from "three";
import { mix, V3 } from "../fisio/motor";
import { rnd, Tubo } from "../fisio/modelos/comun";
import { Cadena } from "../fisio/modelos/energia";
import { K } from "./marco";
import { Glucosa, Manzana } from "./modelos-glucosa";
import { Naranja } from "./modelos-colageno";
import { Platano } from "./modelos-ventana";

export const FRU = "#ff7ab6";
export const FIBRA_C = "#5fd35a";
export const AGUA_C = "#6fd8ff";

/** Molecula de fructosa: anillo de 5 (furanosa), color propio. */
export const Fructosa: React.FC<{ p: V3; escala?: number; op?: number; brillo?: number; rot?: V3 }> = ({ p, escala = 1, op = 1, brillo = 0.5, rot = [0, 0, 0] }) => (
  <group position={p} scale={escala} rotation={rot}>
    <Cadena n={5} anillo color={FRU} sep={0.12} op={op} brillo={brillo} />
  </group>
);

// ---- Fruta ---------------------------------------------------------------------

/** Fresa: cono rojo con semillas y cáliz verde (punta hacia abajo). */
export const Fresa: React.FC<{ p: V3; escala?: number; giro?: number }> = ({ p, escala = 1, giro = 0 }) => (
  <group position={p} scale={escala} rotation={[0, giro, 0]}>
    <mesh rotation={[Math.PI, 0, 0]} scale={[1, 1, 1]}>
      <coneGeometry args={[0.09, 0.15, 20]} />
      <meshPhysicalMaterial color="#e3192f" emissive="#a00012" emissiveIntensity={0.15} roughness={0.35} clearcoat={0.6} />
    </mesh>
    <mesh position={[0, 0.07, 0]} scale={[1, 0.45, 1]}>
      <sphereGeometry args={[0.09, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshPhysicalMaterial color="#e3192f" roughness={0.35} clearcoat={0.6} />
    </mesh>
    {Array.from({ length: 12 }).map((_, i) => {
      const a = i * 2.4;
      const h = (i % 4) / 4;
      const r = 0.085 * (1 - h * 0.8);
      return (
        <mesh key={i} position={[Math.cos(a) * r, 0.05 - h * 0.12, Math.sin(a) * r]}>
          <sphereGeometry args={[0.008, 6, 4]} />
          <meshStandardMaterial color="#ffe36a" emissive="#ffd23f" emissiveIntensity={0.4} />
        </mesh>
      );
    })}
    {Array.from({ length: 5 }).map((_, i) => (
      <mesh key={`h${i}`} position={[Math.cos((i / 5) * Math.PI * 2) * 0.05, 0.11, Math.sin((i / 5) * Math.PI * 2) * 0.05]} rotation={[0, -(i / 5) * Math.PI * 2, 0.5]} scale={[0.05, 0.008, 0.02]}>
        <sphereGeometry args={[1, 10, 6]} />
        <meshStandardMaterial color="#2f9a3a" />
      </mesh>
    ))}
  </group>
);

/** Frutero: cuenco con manzana, platano, naranja y fresas. Base en y = 0. */
export const Frutero: React.FC<{ p: V3; escala?: number; giro?: number }> = ({ p, escala = 1, giro = 0 }) => (
  <group position={p} scale={escala} rotation={[0, giro, 0]}>
    <mesh position={[0, 0.22, 0]}>
      <sphereGeometry args={[0.32, 40, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      <meshPhysicalMaterial color="#e9eef0" roughness={0.25} clearcoat={0.8} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.32, 0.015, 8, 48]} />
      <meshStandardMaterial color={K.lima} emissive={K.lima} emissiveIntensity={0.3} />
    </mesh>
    <mesh position={[0, 0.0, 0]}>
      <cylinderGeometry args={[0.1, 0.12, 0.02, 24]} />
      <meshStandardMaterial color="#cfd8dc" />
    </mesh>
    <Manzana p={[-0.1, 0.27, 0.06]} escala={1.15} />
    <Naranja p={[0.12, 0.27, -0.06]} escala={0.32} />
    <Platano p={[0.0, 0.33, 0.13]} escala={0.62} giro={0.3} />
    <Fresa p={[0.16, 0.26, 0.14]} escala={0.8} giro={0.4} />
    <Fresa p={[-0.2, 0.25, -0.1]} escala={0.8} giro={1.4} />
    <Fresa p={[0.02, 0.28, -0.17]} escala={0.8} giro={2.2} />
  </group>
);

// ---- Manzana abierta: fibra, agua y azucares atrapados ---------------------------

const MALLA_LINEAS: V3[][] = (() => {
  const out: V3[][] = [];
  const R = 0.9;
  for (let k = -3; k <= 3; k++) {
    const c = k * 0.24;
    const h = Math.sqrt(Math.max(0, R * R - c * c)) * 0.95;
    if (h < 0.15) continue;
    out.push(Array.from({ length: 9 }).map((_, i) => [c + Math.sin(i * 1.3 + k) * 0.035, -h + (i / 8) * 2 * h, 0] as V3));
    out.push(Array.from({ length: 9 }).map((_, i) => [-h + (i / 8) * 2 * h, c + Math.sin(i * 1.1 + k * 2) * 0.035, 0] as V3));
  }
  return out;
})();

/** Celdas de la malla (centros) donde quedan gotas de agua y azucares. */
export const CELDAS_MANZANA: V3[] = (() => {
  const out: V3[] = [];
  for (let i = -3; i <= 2; i++)
    for (let j = -3; j <= 2; j++) {
      const x = (i + 0.5) * 0.24;
      const y = (j + 0.5) * 0.24;
      if (x * x + y * y < 0.62) out.push([x, y, 0.05]);
    }
  return out;
})();

/**
 * Media manzana grande (radio 1) con la cara de corte hacia +Z.
 * malla/agua/azucar 0..1 encienden cada componente.
 */
export const ManzanaCorte: React.FC<{ malla?: number; agua?: number; azucar?: number; brilloMalla?: number }> = ({ malla = 1, agua = 1, azucar = 1, brilloMalla = 0.3 }) => (
  <group scale={[1, 0.92, 1]}>
    <mesh>
      <sphereGeometry args={[1, 48, 32, Math.PI, Math.PI]} />
      <meshPhysicalMaterial color="#c8202c" clearcoat={0.8} roughness={0.3} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 0, 0.001]}>
      <circleGeometry args={[0.99, 64]} />
      <meshPhysicalMaterial color="#f6e7b8" emissive="#f2d98a" emissiveIntensity={0.12} roughness={0.7} />
    </mesh>
    {/* corazon y semillas */}
    <mesh position={[0, 0, 0.004]} scale={[0.22, 0.32, 1]}>
      <circleGeometry args={[1, 5]} />
      <meshStandardMaterial color="#e9d08e" />
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * 0.07, 0.02, 0.02]} rotation={[0, 0, s * 0.3]} scale={[0.035, 0.06, 0.02]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color="#4a2a12" />
      </mesh>
    ))}
    <mesh position={[0, 1.02, 0]}>
      <cylinderGeometry args={[0.03, 0.04, 0.3, 8]} />
      <meshStandardMaterial color="#5a3a1a" />
    </mesh>
    {/* malla de fibra */}
    {malla > 0.02 ? (
      <group position={[0, 0, 0.03]} scale={[malla, malla, 1]}>
        {MALLA_LINEAS.map((pts, i) => (
          <Tubo key={i} puntos={pts} radio={0.018} color={FIBRA_C} emisivo={brilloMalla} segmentos={24} />
        ))}
      </group>
    ) : null}
    {/* agua */}
    {agua > 0.02
      ? CELDAS_MANZANA.filter((_, i) => i % 2 === 0).map((c, i) => (
          <mesh key={`a${i}`} position={[c[0] + 0.04, c[1] + 0.03, 0.05]} scale={agua}>
            <sphereGeometry args={[0.045, 14, 10]} />
            <meshPhysicalMaterial color={AGUA_C} emissive={AGUA_C} emissiveIntensity={0.35} transparent opacity={0.85} roughness={0.05} clearcoat={1} />
          </mesh>
        ))
      : null}
    {/* pocos azucares atrapados */}
    {azucar > 0.02
      ? CELDAS_MANZANA.filter((_, i) => i % 5 === 2).map((c, i) =>
          i % 2 ? (
            <Glucosa key={`g${i}`} p={[c[0] - 0.04, c[1] - 0.04, 0.07]} escala={0.55 * azucar} />
          ) : (
            <Fructosa key={`f${i}`} p={[c[0] - 0.04, c[1] - 0.04, 0.07]} escala={0.55 * azucar} />
          ),
        )
      : null}
  </group>
);

// ---- Boca: dientes que mastican -----------------------------------------------

const arcoDientes = (n: number, R: number): { p: V3; a: number }[] =>
  Array.from({ length: n }).map((_, i) => {
    const a = mix(-1.25, 1.25, i / (n - 1));
    return { p: [Math.sin(a) * R, 0, Math.cos(a) * R * 0.8], a };
  });

const Arcada: React.FC<{ arriba: boolean }> = ({ arriba }) => {
  const s = arriba ? 1 : -1;
  const dientes = arcoDientes(10, 0.42);
  const encia: V3[] = Array.from({ length: 14 }).map((_, i) => {
    const a = mix(-1.35, 1.35, i / 13);
    return [Math.sin(a) * 0.44, s * 0.1, Math.cos(a) * 0.44 * 0.8];
  });
  return (
    <group>
      <Tubo puntos={encia} radio={0.07} color="#e36a85" emisivo={0.15} segmentos={40} />
      {dientes.map((d, i) => {
        const frente = Math.abs(d.a) < 0.5;
        return (
          <mesh key={i} position={[d.p[0], s * 0.02, d.p[2]]} rotation={[0, d.a, 0]}>
            <boxGeometry args={[frente ? 0.1 : 0.12, 0.14, frente ? 0.05 : 0.11]} />
            <meshPhysicalMaterial color="#fbfaf2" roughness={0.25} clearcoat={0.9} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Dientes superiores e inferiores; abre 0..1 separa las arcadas (masticar). */
export const Dientes: React.FC<{ p: V3; escala?: number; abre: number }> = ({ p, escala = 1, abre }) => (
  <group position={p} scale={escala}>
    <group position={[0, 0.1 + abre * 0.18, 0]} rotation={[-abre * 0.25, 0, 0]}>
      <Arcada arriba />
    </group>
    <group position={[0, -0.1 - abre * 0.1, 0]} rotation={[abre * 0.12, 0, 0]}>
      <Arcada arriba={false} />
    </group>
  </group>
);

// ---- Estomago y malla de fibra --------------------------------------------------

/** Estomago estilizado translucido (contenido aparte). Centro en p. */
export const Estomago: React.FC<{ p: V3; escala?: number; brillo?: number }> = ({ p, escala = 1, brillo = 0 }) => (
  <group position={p} scale={escala}>
    <mesh rotation={[0, 0, -0.5]} scale={[1.25, 0.85, 0.7]}>
      <sphereGeometry args={[1, 40, 28]} />
      <meshPhysicalMaterial color="#f08aa0" emissive="#ff7f9a" emissiveIntensity={0.12 + brillo} transparent opacity={0.3} roughness={0.3} clearcoat={0.8} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
    <Tubo puntos={[[-0.7, 0.55, 0], [-0.75, 1.1, 0], [-0.7, 1.7, 0]]} radio={0.17} color="#f08aa0" emisivo={0.15} opacidad={0.55} />
    <Tubo puntos={[[0.95, -0.45, 0], [1.25, -0.6, 0], [1.4, -1.0, 0], [1.2, -1.4, 0]]} radio={0.16} color="#f08aa0" emisivo={0.15} opacidad={0.55} />
  </group>
);

/** Bola de fibra: aros entrelazados (red que atrapa azucares). */
export const MallaFibra: React.FC<{ p: V3; r?: number; brillo?: number; giro?: number; op?: number }> = ({ p, r = 0.5, brillo = 0.3, giro = 0, op = 1 }) => (
  <group position={p} rotation={[0.3, giro, 0.1]}>
    {Array.from({ length: 7 }).map((_, i) => (
      <mesh key={i} rotation={[(i * Math.PI) / 7, (i * 1.9) % Math.PI, 0]}>
        <torusGeometry args={[r * (0.92 + 0.08 * Math.sin(i)), 0.022, 8, 48]} />
        <meshStandardMaterial color={FIBRA_C} emissive={FIBRA_C} emissiveIntensity={brillo} transparent={op < 1} opacity={op} />
      </mesh>
    ))}
  </group>
);

// ---- Jugo, dulces, iconos -----------------------------------------------------------

/** Exprimidor de citricos: plato + cono acanalado; pulpa y fibra quedan en el plato. */
export const Exprimidor: React.FC<{ p: V3; escala?: number; pulpa?: number; brillo?: number }> = ({ p, escala = 1, pulpa = 1, brillo = 0 }) => (
  <group position={p} scale={escala}>
    <mesh position={[0, 0.04, 0]}>
      <cylinderGeometry args={[0.36, 0.3, 0.08, 40]} />
      <meshPhysicalMaterial color="#e8f6ff" transparent opacity={0.75} roughness={0.1} clearcoat={1} />
    </mesh>
    <mesh position={[0, 0.09, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.35, 0.025, 8, 40]} />
      <meshPhysicalMaterial color="#e8f6ff" roughness={0.1} clearcoat={1} />
    </mesh>
    <mesh position={[0, 0.2, 0]}>
      <coneGeometry args={[0.14, 0.24, 12]} />
      <meshPhysicalMaterial color="#f4fbff" roughness={0.2} clearcoat={1} flatShading />
    </mesh>
    {pulpa > 0.02
      ? Array.from({ length: 9 }).map((_, i) => {
          const a = i * 0.7 + 0.3;
          const r = 0.19 + (i % 3) * 0.04;
          return (
            <group key={i} position={[Math.cos(a) * r, 0.1, Math.sin(a) * r]} scale={pulpa}>
              {i % 3 === 0 ? (
                <Tubo puntos={[[-0.05, 0, 0], [0, 0.02, 0.03], [0.06, 0, 0.01]]} radio={0.012} color={FIBRA_C} emisivo={0.3 + brillo} />
              ) : (
                <mesh scale={[1, 0.5, 0.8]}>
                  <sphereGeometry args={[0.035, 10, 8]} />
                  <meshStandardMaterial color="#ffb54a" emissive={FIBRA_C} emissiveIntensity={brillo * 0.5} />
                </mesh>
              )}
            </group>
          );
        })
      : null}
  </group>
);

/** Caramelo envuelto. */
export const Caramelo: React.FC<{ p: V3; color?: string; escala?: number; giro?: number }> = ({ p, color = "#ff5c8a", escala = 1, giro = 0 }) => (
  <group position={p} scale={escala} rotation={[0, giro, 0]}>
    <mesh scale={[1.2, 0.9, 0.9]}>
      <sphereGeometry args={[0.08, 20, 14]} />
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.2} roughness={0.2} clearcoat={1} />
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * 0.13, 0, 0]} rotation={[0, 0, s * (Math.PI / 2)]}>
        <coneGeometry args={[0.06, 0.08, 12]} />
        <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.8} />
      </mesh>
    ))}
  </group>
);

/** Tache (X) 3D de cara a +Z. */
export const Tache: React.FC<{ p: V3; escala?: number; color?: string; op?: number }> = ({ p, escala = 1, color = K.rojo, op = 1 }) => (
  <group position={p} scale={escala}>
    {[0.78, -0.78].map((r) => (
      <mesh key={r} rotation={[0, 0, r]}>
        <boxGeometry args={[0.08, 0.4, 0.08]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent={op < 1} opacity={op} />
      </mesh>
    ))}
  </group>
);

// ---- Higado por dentro ----------------------------------------------------------------

/** Hepatocito: prisma hexagonal translucido con nucleo (de cara a +Z). */
export const Hepatocito: React.FC<{ p: V3; r?: number; brillo?: number; op?: number }> = ({ p, r = 1, brillo = 0, op = 1 }) => (
  <group position={p}>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[r, r, 0.5, 6]} />
      <meshPhysicalMaterial color="#b8444a" emissive="#e0626a" emissiveIntensity={0.1 + brillo} transparent opacity={0.32 * op} roughness={0.3} clearcoat={0.7} depthWrite={false} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[r * 0.98, 0.03, 6, 6]} />
      <meshStandardMaterial color="#ff9a9a" emissive="#ff6f6f" emissiveIntensity={0.4} transparent={op < 1} opacity={op} />
    </mesh>
    <mesh position={[r * 0.3, -r * 0.25, 0]}>
      <sphereGeometry args={[r * 0.22, 24, 18]} />
      <meshPhysicalMaterial color="#8a5cd6" emissive="#7a4fd0" emissiveIntensity={0.3} transparent opacity={0.85 * op} clearcoat={0.6} />
    </mesh>
  </group>
);

/** Centros de un panal de 7 hepatocitos (radio r). */
export const panal = (r: number): V3[] => {
  const d = r * Math.sqrt(3);
  return [[0, 0, 0], ...Array.from({ length: 6 }).map((_, i) => {
    const a = Math.PI / 6 + (i * Math.PI) / 3;
    return [Math.cos(a) * d, Math.sin(a) * d, 0] as V3;
  })];
};

// ---- Multitud -------------------------------------------------------------------------

const PIEL = ["#f1c9a5", "#d9a77c", "#b07a52", "#8a5a3a", "#f3d6bf"];
const ROPA = [K.cian, K.lima, K.naranja, K.rosa, K.morado, K.amarillo, "#5fd3a8", "#e8eef0"];

/** Persona estilizada (cuerpo capsula + cabeza), ~0.36 de alto. */
export const Personita: React.FC<{ p: V3; ropa: string; piel: string; escala?: number; brillo?: number }> = ({ p, ropa, piel, escala = 1, brillo = 0 }) => (
  <group position={p} scale={escala}>
    <mesh position={[0, 0.13, 0]}>
      <capsuleGeometry args={[0.055, 0.15, 6, 12]} />
      <meshStandardMaterial color={ropa} emissive={ropa} emissiveIntensity={0.15 + brillo} roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.3, 0]}>
      <sphereGeometry args={[0.05, 14, 10]} />
      <meshStandardMaterial color={piel} roughness={0.6} />
    </mesh>
  </group>
);

/** Rejilla de personas sobre el piso (xz). aparece 0..1 cuantas se ven. */
export const Multitud: React.FC<{ filas: number; cols: number; sep?: number; aparece?: number; seed?: string }> = ({ filas, cols, sep = 0.26, aparece = 1, seed = "m" }) => {
  const n = filas * cols;
  return (
    <group>
      {Array.from({ length: n }).map((_, i) => {
        const orden = rnd(`${seed}o${i}`);
        if (orden > aparece) return null;
        const f = Math.floor(i / cols);
        const c = i % cols;
        const x = (c - (cols - 1) / 2) * sep + (rnd(`${seed}x${i}`) - 0.5) * sep * 0.5;
        const z = (f - (filas - 1) / 2) * sep + (rnd(`${seed}z${i}`) - 0.5) * sep * 0.5;
        const k = Math.min(1, (aparece - orden) / 0.08);
        return (
          <Personita
            key={i}
            p={[x, 0, z]}
            escala={(0.85 + rnd(`${seed}s${i}`) * 0.3) * k}
            ropa={ROPA[Math.floor(rnd(`${seed}r${i}`) * ROPA.length)]}
            piel={PIEL[Math.floor(rnd(`${seed}p${i}`) * PIEL.length)]}
          />
        );
      })}
    </group>
  );
};
