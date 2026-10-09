// Modelos 3D del short de microbiota: intestino dentro del cuerpo, luz del colon,
// bacterias, fibra, epitelio del colon (colonocitos + uniones + moco), comida
// ultraprocesada y saludable, emulsionantes, edulcorantes e inflamacion.
import React from "react";
import * as THREE from "three";
import { mix, V3 } from "../fisio/motor";
import { rnd, Tubo } from "../fisio/modelos/comun";
import { mezcla } from "./modelos-glucosa";
import { K } from "./marco";

export const FIBRA = "#3ec46d";
export const BUT = K.lima;
export const MOCO = "#8fc8ff";
const GRIS = "#6b717c";
export const BACT = ["#43e0ff", "#a78bfa", "#ffb347", "#47d18c", "#ff7eb6"];

// ---- Intestino dentro del abdomen ---------------------------------------------

const COLON: V3[] = [
  [-0.02, 0.92, 0.03],
  [-0.1, 0.94, 0.03],
  [-0.115, 1.04, 0.035],
  [-0.11, 1.15, 0.03],
  [-0.02, 1.17, 0.05],
  [0.08, 1.16, 0.04],
  [0.115, 1.1, 0.03],
  [0.12, 1.0, 0.03],
  [0.09, 0.92, 0.035],
  [0.03, 0.9, 0.04],
];
const DELGADO: V3[] = Array.from({ length: 34 }).map((_, i) => {
  const u = i / 33;
  return [Math.sin(u * Math.PI * 9) * 0.06, 1.11 - u * 0.15, 0.045 + Math.cos(u * Math.PI * 9) * 0.02] as V3;
});

/** Colon (marco) + intestino delgado enrollado. Coordenadas del cuerpo de Humano. */
export const IntestinoCuerpo: React.FC<{ brillo?: number }> = ({ brillo = 0 }) => (
  <group>
    <Tubo puntos={COLON} radio={0.024} color="#e88a9a" emisivo={0.15 + brillo} segmentos={80} />
    <Tubo puntos={DELGADO} radio={0.013} color="#f5b0bd" emisivo={0.12 + brillo * 0.8} segmentos={200} />
  </group>
);

// ---- Luz (interior) del colon: tubo rosado visto desde dentro -------------------

export const Lumen: React.FC<{ R?: number; largo?: number }> = ({ R = 2.4, largo = 22 }) => (
  <group position={[0, 0, -largo / 2 + 5]}>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[R, R, largo, 48, 1, true]} />
      <meshPhysicalMaterial color="#c2546a" emissive="#ff6f8f" emissiveIntensity={0.12} roughness={0.55} clearcoat={0.5} side={THREE.BackSide} />
    </mesh>
    {/* pliegues (haustras) */}
    {Array.from({ length: Math.floor(largo / 1.6) }).map((_, i) => (
      <mesh key={i} position={[0, 0, largo / 2 - 0.8 - i * 1.6]}>
        <torusGeometry args={[R, 0.16, 12, 48]} />
        <meshPhysicalMaterial color="#e07a90" emissive="#ff8fa3" emissiveIntensity={0.1} roughness={0.5} clearcoat={0.5} />
      </mesh>
    ))}
  </group>
);

// ---- Bacterias ------------------------------------------------------------------

/** Bacteria: baston (capsula) o coco (par de esferas). */
export const Bacteria: React.FC<{ p: V3; rot?: V3; color: string; escala?: number; op?: number; coco?: boolean; brillo?: number }> = ({
  p,
  rot = [0, 0, 0],
  color,
  escala = 1,
  op = 1,
  coco = false,
  brillo = 0.25,
}) => (
  <group position={p} rotation={rot} scale={escala}>
    {coco ? (
      [-0.07, 0.07].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <sphereGeometry args={[0.08, 16, 12]} />
          <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={brillo} roughness={0.35} clearcoat={0.6} transparent={op < 1} opacity={op} />
        </mesh>
      ))
    ) : (
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.065, 0.2, 8, 16]} />
        <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={brillo} roughness={0.35} clearcoat={0.6} transparent={op < 1} opacity={op} />
      </mesh>
    )}
  </group>
);

export type ColoniaProps = {
  b: number;
  n: number;
  centro?: V3;
  caja?: V3;
  seed?: string;
  escala?: number;
  /** 0..1: las bacterias se vuelven grises */
  gris?: number;
  /** 0..1: fraccion de bacterias que desaparece */
  desaparece?: number;
  /** 0..1: se acercan a los objetivos */
  atraer?: number;
  objetivos?: V3[];
  /** desplazamiento vertical extra (para acercarse a la pared) */
  baja?: number;
};

/** Posicion de la bacteria i de una colonia (para etiquetas). */
export const posBacteria = ({ b, centro = [0, 0, 0], caja = [2, 1, 1], seed = "co", atraer = 0, objetivos, baja = 0 }: ColoniaProps, i: number): V3 => {
  const s = `${seed}${i}`;
  const libre: V3 = [
    centro[0] + (rnd(`${s}x`) - 0.5) * caja[0] + Math.sin(b * 3 + i * 1.7) * 0.08,
    centro[1] + (rnd(`${s}y`) - 0.5) * caja[1] + Math.cos(b * 2.6 + i) * 0.06 - baja * (0.4 + rnd(`${s}b`) * 0.6),
    centro[2] + (rnd(`${s}z`) - 0.5) * caja[2],
  ];
  if (!objetivos || !objetivos.length || atraer <= 0) return libre;
  const o = objetivos[i % objetivos.length];
  const a = rnd(`${s}a`) * Math.PI * 2;
  const pegado: V3 = [o[0] + Math.cos(a) * 0.14, o[1] + Math.sin(a) * 0.14, o[2] + Math.sin(a * 1.3) * 0.1];
  return [mix(libre[0], pegado[0], atraer), mix(libre[1], pegado[1], atraer), mix(libre[2], pegado[2], atraer)];
};

export const Colonia: React.FC<ColoniaProps> = (props) => {
  const { b, n, seed = "co", escala = 1, gris = 0, desaparece = 0 } = props;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const s = `${seed}${i}`;
        const corte = rnd(`${s}d`);
        const op = desaparece > 0 ? Math.min(1, Math.max(0, (corte - desaparece) / 0.08 + 1)) : 1;
        if (op <= 0.01) return null;
        const g = Math.min(1, gris * (0.6 + rnd(`${s}g`) * 0.8));
        const color = mezcla(BACT[Math.floor(rnd(`${s}c`) * BACT.length)], GRIS, g);
        return (
          <Bacteria
            key={i}
            p={posBacteria(props, i)}
            rot={[rnd(`${s}r`) * 3, rnd(`${s}t`) * 3 + b * (1 + rnd(`${s}v`)), rnd(`${s}u`) * 3]}
            color={color}
            coco={rnd(`${s}k`) > 0.7}
            escala={escala * (0.85 + rnd(`${s}e`) * 0.35) * (op < 1 ? 0.6 + op * 0.4 : 1)}
            op={op}
            brillo={0.25 * (1 - g)}
          />
        );
      })}
    </>
  );
};

// ---- Fibra ----------------------------------------------------------------------

export const puntosFibra = (p: V3, seed: string, largo = 2.4, giro = 0): V3[] =>
  Array.from({ length: 25 }).map((_, i) => {
    const u = i / 24 - 0.5;
    const x = u * largo;
    const y = Math.sin(u * 7 + rnd(seed) * 6) * 0.1;
    const z = Math.cos(u * 5 + rnd(seed + "z") * 6) * 0.12;
    return [p[0] + x * Math.cos(giro) - y * Math.sin(giro), p[1] + x * Math.sin(giro) + y * Math.cos(giro), p[2] + z] as V3;
  });

/** Hebra de fibra; `resto` 0..1 es lo que queda (se come desde los extremos). */
export const Fibra: React.FC<{ puntos: V3[]; resto?: number; brillo?: number }> = ({ puntos, resto = 1, brillo = 0.3 }) => {
  const n = puntos.length;
  const quita = Math.round(((1 - resto) * (n - 3)) / 2);
  const seg = puntos.slice(quita, n - quita);
  if (resto <= 0.02 || seg.length < 3) return null;
  return <Tubo puntos={seg} radio={0.04} color={FIBRA} emisivo={brillo} />;
};

// ---- Epitelio del colon --------------------------------------------------------

export const CELDAS: { p: V3; fila: number }[] = [];
for (let j = 0; j < 5; j++) {
  for (let i = -7; i <= 7; i++) {
    const x = i * 0.6 + (j % 2) * 0.3;
    const z = (j - 2) * 0.52;
    CELDAS.push({ p: [x, 0.07 * Math.sin(x * 1.4 + z * 2), z], fila: j });
  }
}
const ALTO = 1.5;

/**
 * Colonocitos en panal (cara superior en y≈0, columnas hacia abajo) con uniones
 * estrechas (anillo cerca del borde) y capa de moco encima.
 * abiertas 0..1 separa las celulas; brillo las ilumina; moco = grosor 0..1.
 */
export const Epitelio: React.FC<{ abiertas?: number; brillo?: number; moco?: number; inflama?: number }> = ({
  abiertas = 0,
  brillo = 0,
  moco = 1,
  inflama = 0,
}) => {
  const enc = 1 - 0.3 * abiertas;
  const union = mezcla("#47d18c", K.rojo, abiertas);
  const cel = mezcla("#e9909c", "#c0566a", inflama * 0.6);
  return (
    <group>
      {CELDAS.map((c, i) => (
        <group key={i} position={c.p}>
          <mesh position={[0, -ALTO / 2, 0]} scale={[enc, 1, enc]}>
            <cylinderGeometry args={[0.346, 0.346, ALTO, 6]} />
            <meshPhysicalMaterial color={cel} emissive={brillo > 0 ? "#ffcf70" : cel} emissiveIntensity={0.06 + brillo * 0.45} roughness={0.5} clearcoat={0.4} flatShading />
          </mesh>
          {/* nucleo visible por el corte frontal */}
          {c.fila === 4 ? (
            <mesh position={[0, -1.0, 0.27 * enc]} scale={[0.15, 0.22, 0.08]}>
              <sphereGeometry args={[1, 16, 12]} />
              <meshStandardMaterial color="#7b5cd6" emissive="#7b5cd6" emissiveIntensity={0.3} />
            </mesh>
          ) : null}
          {/* union estrecha */}
          <mesh position={[0, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]} scale={enc}>
            <torusGeometry args={[0.33, 0.035, 6, 6]} />
            <meshStandardMaterial color={union} emissive={union} emissiveIntensity={0.5 + 0.4 * (1 - abiertas)} transparent opacity={1 - 0.55 * abiertas} />
          </mesh>
        </group>
      ))}
      {moco > 0.02 ? (
        <mesh position={[0, 0.1 + (moco * 0.75) / 2, 0]}>
          <boxGeometry args={[9, moco * 0.75, 2.7]} />
          <meshPhysicalMaterial color="#a8dcff" emissive={MOCO} emissiveIntensity={0.7} transparent opacity={0.32} roughness={0.2} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Altura de la superficie del moco. */
export const topeMoco = (moco: number) => 0.1 + moco * 0.75;

// ---- Inflamacion ---------------------------------------------------------------

export const Chispas: React.FC<{ b: number; n?: number; nivel: number; y?: number; ancho?: number; seed?: string }> = ({
  b,
  n = 22,
  nivel,
  y = 0.1,
  ancho = 3.4,
  seed = "ch",
}) =>
  nivel <= 0.01 ? null : (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const f = (b * 3 + rnd(`${seed}${i}f`)) % 1;
        const s = Math.sin(f * Math.PI) * nivel;
        if (rnd(`${seed}${i}n`) > nivel + 0.2) return null;
        return (
          <mesh
            key={i}
            position={[(rnd(`${seed}${i}x`) - 0.5) * ancho, y + f * 0.5, (rnd(`${seed}${i}z`) - 0.5) * 2]}
            rotation={[f * 4, f * 3 + i, 0]}
            scale={0.07 * s + 0.001}
          >
            <octahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color={i % 3 ? K.rojo : "#ffb020"} transparent opacity={0.9} />
          </mesh>
        );
      })}
    </>
  );

// ---- Moleculas -----------------------------------------------------------------

/** Emulsionante: cabeza polar + cola grasa (molecula anfipatica). */
export const Emulsionante: React.FC<{ p: V3; rot?: number; escala?: number; op?: number }> = ({ p, rot = 0, escala = 1, op = 1 }) => (
  <group position={p} rotation={[0, 0, rot]} scale={escala}>
    <mesh>
      <sphereGeometry args={[0.07, 16, 12]} />
      <meshPhysicalMaterial color={K.morado} emissive={K.morado} emissiveIntensity={0.5} transparent={op < 1} opacity={op} />
    </mesh>
    {[1, 2, 3, 4].map((k) => (
      <mesh key={k} position={[k * 0.065, (k % 2 ? 1 : -1) * 0.02, 0]}>
        <sphereGeometry args={[0.032, 10, 8]} />
        <meshStandardMaterial color="#ffd166" emissive="#ffd166" emissiveIntensity={0.3} transparent={op < 1} opacity={op} />
      </mesh>
    ))}
  </group>
);

/** Cristal de edulcorante. */
export const Cristal: React.FC<{ p: V3; giro?: number; escala?: number; op?: number }> = ({ p, giro = 0, escala = 1, op = 1 }) => (
  <mesh position={p} rotation={[giro, giro * 1.3, 0.4]} scale={[0.07 * escala, 0.1 * escala, 0.07 * escala]}>
    <octahedronGeometry args={[1, 0]} />
    <meshPhysicalMaterial color="#ffffff" emissive="#dff6ff" emissiveIntensity={0.45} roughness={0.05} clearcoat={1} transparent opacity={0.9 * op} flatShading />
  </mesh>
);

/** Sobrecito de edulcorante. */
export const Sobre: React.FC<{ p: V3; rot?: V3; color?: string; escala?: number }> = ({ p, rot = [0, 0, 0], color = "#ff7eb6", escala = 1 }) => (
  <group position={p} rotation={rot} scale={escala}>
    <mesh>
      <boxGeometry args={[0.6, 0.38, 0.05]} />
      <meshPhysicalMaterial color="#fafafa" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0, 0.027]}>
      <boxGeometry args={[0.6, 0.16, 0.005]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
    </mesh>
  </group>
);

// ---- Comida ultraprocesada --------------------------------------------------------

export const BolsaPapas: React.FC<{ p: V3; rot?: V3; escala?: number }> = ({ p, rot = [0, 0, 0], escala = 1 }) => (
  <group position={p} rotation={rot} scale={escala}>
    <mesh scale={[0.34, 0.44, 0.12]}>
      <sphereGeometry args={[1, 32, 20]} />
      <meshPhysicalMaterial color="#ffb020" roughness={0.25} clearcoat={1} metalness={0.2} />
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[0, s * 0.42, 0]}>
        <boxGeometry args={[0.6, 0.06, 0.04]} />
        <meshStandardMaterial color="#c8ccd2" metalness={0.7} roughness={0.3} />
      </mesh>
    ))}
    <mesh position={[0, 0, 0.115]} scale={[0.17, 0.12, 0.02]}>
      <sphereGeometry args={[1, 24, 12]} />
      <meshStandardMaterial color="#d0122e" emissive="#d0122e" emissiveIntensity={0.2} />
    </mesh>
  </group>
);

export const Galleta: React.FC<{ p: V3; rot?: V3; escala?: number }> = ({ p, rot = [0, 0, 0], escala = 1 }) => (
  <group position={p} rotation={rot} scale={escala}>
    {[-0.05, 0.05].map((y) => (
      <mesh key={y} position={[0, y, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.06, 32]} />
        <meshStandardMaterial color="#3a2116" roughness={0.8} />
      </mesh>
    ))}
    <mesh>
      <cylinderGeometry args={[0.22, 0.22, 0.05, 32]} />
      <meshStandardMaterial color="#f6f1e6" roughness={0.6} />
    </mesh>
  </group>
);

// ---- Comida saludable -------------------------------------------------------------

export const Espiga: React.FC<{ p: V3; escala?: number; rot?: number }> = ({ p, escala = 1, rot = 0 }) => (
  <group position={p} scale={escala} rotation={[0, 0, rot]}>
    <mesh position={[0, -0.2, 0]}>
      <cylinderGeometry args={[0.012, 0.015, 0.5, 8]} />
      <meshStandardMaterial color="#c9a24a" />
    </mesh>
    {Array.from({ length: 10 }).map((_, i) => (
      <mesh key={i} position={[(i % 2 ? 1 : -1) * 0.035, 0.08 + Math.floor(i / 2) * 0.06, 0]} rotation={[0, 0, (i % 2 ? -1 : 1) * 0.5]}>
        <capsuleGeometry args={[0.025, 0.05, 6, 10]} />
        <meshStandardMaterial color="#e2b65a" roughness={0.6} />
      </mesh>
    ))}
  </group>
);

export const Yogur: React.FC<{ p: V3; escala?: number }> = ({ p, escala = 1 }) => (
  <group position={p} scale={escala}>
    <mesh>
      <cylinderGeometry args={[0.2, 0.15, 0.32, 32]} />
      <meshPhysicalMaterial color="#f7f7f2" roughness={0.4} clearcoat={0.5} />
    </mesh>
    <mesh position={[0, 0.02, 0]}>
      <cylinderGeometry args={[0.193, 0.168, 0.1, 32]} />
      <meshStandardMaterial color="#5aa9ff" emissive="#5aa9ff" emissiveIntensity={0.2} />
    </mesh>
    <mesh position={[0, 0.165, 0]}>
      <cylinderGeometry args={[0.205, 0.205, 0.015, 32]} />
      <meshStandardMaterial color="#d8dde2" metalness={0.7} roughness={0.3} />
    </mesh>
  </group>
);
