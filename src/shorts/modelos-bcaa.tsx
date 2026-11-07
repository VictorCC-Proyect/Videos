// Modelos 3D del short "¿Sirven los BCAA?": aminoacidos ramificados con su rama lateral,
// bote de BCAA rotulado, casco y megafono (metafora de la obra), pared de ladrillos y medidor de dolor.
import React from "react";
import * as THREE from "three";
import { mix, V3 } from "../fisio/motor";
import { Enlace, Esfera } from "../fisio/modelos/energia";
import { K } from "./marco";
import { LEU_C } from "./modelos-mtor";

/** Colores fijos: leucina naranja (serie), isoleucina azul, valina magenta. */
export const ISO_C = "#4d8dff";
export const VAL_C = "#ff5cc8";
export const BCAA_C = [LEU_C, ISO_C, VAL_C];
/** Los 9 aminoacidos esenciales (los 3 primeros son los BCAA). */
export const EAA_C = [LEU_C, ISO_C, VAL_C, K.amarillo, "#5cf2a0", K.morado, K.cian, "#ff9a9a", "#e8dcc0"];
export const EAA_N = ["Leucina", "Isoleucina", "Valina", "Lisina", "Metionina", "Fenilalanina", "Treonina", "Triptófano", "Histidina"];

const cl = (v: number) => Math.min(1, Math.max(0, v));

// ---- Aminoacido ramificado (esqueleto + cadena lateral con su rama) -------------------

type Tipo = 0 | 1 | 2; // 0 leucina, 1 isoleucina, 2 valina

/** Atomos de la cadena lateral (coordenadas locales, la cadena sube en +Y desde el carbono alfa). */
const LATERAL: Record<Tipo, { p: V3[]; e: [number, number][]; rama: number }> = {
  // Leu: Cb - Cg < (CH3, CH3)
  0: { p: [[0, 0.32, 0], [0, 0.6, 0.02], [-0.24, 0.8, 0], [0.24, 0.8, 0]], e: [[-1, 0], [0, 1], [1, 2], [1, 3]], rama: 1 },
  // Ile: Cb < (CH3, Cg - Cd)
  1: { p: [[0, 0.32, 0], [0.26, 0.46, 0], [-0.2, 0.56, 0], [-0.2, 0.86, 0]], e: [[-1, 0], [0, 1], [0, 2], [2, 3]], rama: 0 },
  // Val: Cb < (CH3, CH3)
  2: { p: [[0, 0.32, 0], [-0.24, 0.52, 0], [0.24, 0.52, 0]], e: [[-1, 0], [0, 1], [0, 2]], rama: 0 },
};

/** Punto de la ramificacion (local, sin escala) para rotular la "rama". */
export const ramaBCAA = (tipo: Tipo): V3 => LATERAL[tipo].p[LATERAL[tipo].rama];

/**
 * Aminoacido BCAA: carbono alfa con su grupo amino (blanco) y carboxilo (rojo) y la cadena lateral
 * ramificada del color del aminoacido. rama 0..1 hace brillar la ramificacion.
 */
export const AminoBCAA: React.FC<{ tipo: Tipo; p: V3; escala?: number; giro?: number; op?: number; rama?: number }> = ({
  tipo,
  p,
  escala = 1,
  giro = 0,
  op = 1,
  rama = 0,
}) => {
  const col = BCAA_C[tipo];
  const L = LATERAL[tipo];
  const ca: V3 = [0, 0, 0];
  const n: V3 = [-0.3, -0.16, 0];
  const c: V3 = [0.3, -0.16, 0];
  const o1: V3 = [0.48, -0.02, 0];
  const o2: V3 = [0.36, -0.4, 0];
  const at = (i: number): V3 => (i < 0 ? ca : L.p[i]);
  return (
    <group position={p} scale={escala} rotation={[0, giro, 0]}>
      {/* esqueleto comun */}
      <Enlace a={ca} b={n} r={0.035} op={op} />
      <Enlace a={ca} b={c} r={0.035} op={op} />
      <Enlace a={c} b={o1} r={0.03} op={op} />
      <Enlace a={c} b={o2} r={0.03} op={op} />
      <Esfera p={ca} r={0.13} color={col} brillo={0.5} op={op} />
      <Esfera p={n} r={0.1} color="#e6ecff" brillo={0.2} op={op} />
      <Esfera p={c} r={0.09} color="#9aa7b0" brillo={0.1} op={op} />
      <Esfera p={o1} r={0.08} color="#ff5a5a" brillo={0.3} op={op} />
      <Esfera p={o2} r={0.08} color="#ff5a5a" brillo={0.3} op={op} />
      {/* cadena lateral ramificada */}
      {L.e.map(([a, b2], i) => (
        <Enlace key={i} a={at(a)} b={at(b2)} r={0.035} color={col} brillo={0.3 + rama * 0.8} op={op} />
      ))}
      {L.p.map((q, i) => (
        <Esfera key={i} p={q} r={i === L.rama ? 0.09 : 0.1} color={col} brillo={0.4 + (i === L.rama ? rama * 1.4 : 0)} op={op} />
      ))}
      {rama > 0.02 ? (
        <mesh position={L.p[L.rama]}>
          <sphereGeometry args={[0.26, 16, 12]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.16 * rama * op} depthWrite={false} />
        </mesh>
      ) : null}
      <mesh>
        <sphereGeometry args={[0.55, 16, 12]} />
        <meshBasicMaterial color={col} transparent opacity={0.06 * op} depthWrite={false} />
      </mesh>
    </group>
  );
};

// ---- Bote de BCAA rotulado ------------------------------------------------------------

let texBCAA: THREE.Texture | null = null;
const etiquetaBCAA = () => {
  if (texBCAA) return texBCAA;
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "#ff9a3d");
  g.addColorStop(1, LEU_C);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);
  ctx.fillStyle = "#101418";
  ctx.fillRect(0, 196, 512, 60);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#101418";
  ctx.font = "900 150px Anton, Impact, 'Arial Black', sans-serif";
  ctx.fillText("BCAA", 256, 104);
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 38px Inter, Arial, sans-serif";
  ctx.fillText("2 : 1 : 1", 256, 226);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  texBCAA = t;
  return t;
};

/** Bote de BCAA (base en y = 0, etiqueta de cara a +Z). tapa 0..1 levanta la tapa. */
export const FrascoBCAA: React.FC<{ p: V3; escala?: number; giro?: number; tapa?: number; brillo?: number }> = ({ p, escala = 1, giro = 0, tapa = 0, brillo = 0 }) => (
  <group position={p} scale={escala} rotation={[0, giro, 0]}>
    <mesh position={[0, 0.45, 0]}>
      <cylinderGeometry args={[0.4, 0.4, 0.9, 48]} />
      <meshPhysicalMaterial color="#14181c" roughness={0.3} clearcoat={0.8} emissive={LEU_C} emissiveIntensity={brillo * 0.2} />
    </mesh>
    <mesh position={[0, 0.45, 0]}>
      <cylinderGeometry args={[0.405, 0.405, 0.58, 48, 1, true, -1.25, 2.5]} />
      <meshStandardMaterial map={etiquetaBCAA()} emissive="#ffffff" emissiveMap={etiquetaBCAA()} emissiveIntensity={0.35 + brillo * 0.4} side={THREE.DoubleSide} />
    </mesh>
    <group position={[0, 0.96 + tapa * 0.5, tapa * -0.1]} rotation={[-tapa * 0.5, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.36, 0.36, 0.14, 40]} />
        <meshPhysicalMaterial color="#f4f7f2" roughness={0.35} clearcoat={0.6} />
      </mesh>
    </group>
    <mesh position={[0, 0.91, 0]}>
      <cylinderGeometry args={[0.34, 0.38, 0.04, 40]} />
      <meshStandardMaterial color="#2a3238" />
    </mesh>
    {tapa > 0.05 ? (
      <mesh position={[0, 0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.32, 32]} />
        <meshStandardMaterial color="#ffe0b8" emissive={LEU_C} emissiveIntensity={0.3} />
      </mesh>
    ) : null}
  </group>
);

// ---- Metafora de la obra -----------------------------------------------------------------

/** Casco de obra amarillo (base en y = 0). */
export const Casco: React.FC<{ p: V3; escala?: number; color?: string }> = ({ p, escala = 1, color = K.amarillo }) => (
  <group position={p} scale={escala}>
    <mesh>
      <sphereGeometry args={[0.32, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.8} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 0.005, 0.04]} scale={[1, 1, 1.15]}>
      <cylinderGeometry args={[0.44, 0.44, 0.03, 40]} />
      <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.8} />
    </mesh>
    <mesh position={[0, 0.2, 0]} scale={[0.25, 1, 1]}>
      <sphereGeometry args={[0.26, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshPhysicalMaterial color="#fff1a0" roughness={0.3} />
    </mesh>
  </group>
);

/** Megafono que apunta a +X. */
export const Megafono: React.FC<{ p: V3; escala?: number; rot?: V3; brillo?: number }> = ({ p, escala = 1, rot = [0, 0, 0], brillo = 0 }) => (
  <group position={p} scale={escala} rotation={rot}>
    <mesh position={[0.18, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <cylinderGeometry args={[0.07, 0.2, 0.42, 28, 1, true]} />
      <meshPhysicalMaterial color="#f4f7f2" roughness={0.3} clearcoat={0.6} side={THREE.DoubleSide} emissive={K.lima} emissiveIntensity={brillo * 0.3} />
    </mesh>
    <mesh position={[0.395, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <torusGeometry args={[0.2, 0.02, 8, 32]} />
      <meshStandardMaterial color={K.rojo} emissive={K.rojo} emissiveIntensity={0.4} />
    </mesh>
    <mesh position={[-0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.06, 0.06, 0.12, 16]} />
      <meshStandardMaterial color="#2a3238" />
    </mesh>
    <mesh position={[0.02, -0.12, 0]}>
      <boxGeometry args={[0.05, 0.18, 0.05]} />
      <meshStandardMaterial color="#2a3238" />
    </mesh>
  </group>
);

/** Ondas de "orden" que salen del megafono hacia +X. f = fase 0..1 (en bucle). */
export const Ondas: React.FC<{ p: V3; f: number; op?: number; color?: string }> = ({ p, f, op = 1, color = K.lima }) =>
  op <= 0.01 ? null : (
    <group position={p}>
      {[0, 0.33, 0.66].map((o) => {
        const u = (f + o) % 1;
        return (
          <mesh key={o} position={[u * 0.9, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.12 + u * 0.3, 0.018, 8, 32, Math.PI * 0.7]} />
            <meshBasicMaterial color={color} transparent opacity={op * (1 - u)} />
          </mesh>
        );
      })}
    </group>
  );

export const LADRILLO = { w: 0.42, h: 0.2, d: 0.24 };

/** Posicion (local) del ladrillo i en una pared de `cols` columnas, aparejo trabado. */
export const posLadrillo = (i: number, cols: number): V3 => {
  const fila = Math.floor(i / cols);
  const k = i % cols;
  const off = fila % 2 ? LADRILLO.w * 0.5 : 0;
  return [(k - (cols - 1) / 2) * (LADRILLO.w + 0.03) + off - LADRILLO.w * 0.25, LADRILLO.h / 2 + fila * (LADRILLO.h + 0.03), 0];
};

/** Ladrillo-aminoacido (de cara a +Z). */
export const Ladrillo: React.FC<{ p: V3; color: string; op?: number; rot?: V3 }> = ({ p, color, op = 1, rot = [0, 0, 0] }) => (
  <mesh position={p} rotation={rot}>
    <boxGeometry args={[LADRILLO.w, LADRILLO.h, LADRILLO.d]} />
    <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.25} roughness={0.5} clearcoat={0.3} transparent={op < 1} opacity={op} />
  </mesh>
);

/** Hueco de ladrillo (contorno fantasma). */
export const HuecoLadrillo: React.FC<{ p: V3; op?: number }> = ({ p, op = 1 }) => (
  <mesh position={p}>
    <boxGeometry args={[LADRILLO.w, LADRILLO.h, LADRILLO.d]} />
    <meshBasicMaterial color="#cfefff" wireframe transparent opacity={0.28 * op} />
  </mesh>
);

/**
 * Pared de `filas` x `cols`. Se colocan los primeros `n` ladrillos (de abajo arriba);
 * los de `faltan` no llegan nunca y quedan como hueco.
 */
export const Pared: React.FC<{ p: V3; n: number; filas?: number; cols?: number; faltan?: number[]; escala?: number }> = ({ p, n, filas = 6, cols = 6, faltan = [], escala = 1 }) => (
  <group position={p} scale={escala}>
    {Array.from({ length: filas * cols }).map((_, i) => {
      const q = posLadrillo(i, cols);
      const pone = cl(n - i);
      if (faltan.includes(i) || pone <= 0) return <HuecoLadrillo key={i} p={q} />;
      return <Ladrillo key={i} p={[q[0], q[1] + (1 - pone) * 0.5, q[2]]} color={EAA_C[(i * 4) % 9]} op={Math.min(1, pone * 2)} />;
    })}
  </group>
);

// ---- Medidor de dolor (aguja) ---------------------------------------------------------------

/** Medidor semicircular verde -> rojo, de cara a +Z. nivel 0..1 mueve la aguja. */
export const MedidorDolor: React.FC<{ p: V3; nivel: number; escala?: number }> = ({ p, nivel, escala = 1 }) => {
  const N = 9;
  const ang = mix(Math.PI * 0.95, Math.PI * 0.05, cl(nivel));
  return (
    <group position={p} scale={escala}>
      <mesh position={[0, 0.25, -0.06]}>
        <boxGeometry args={[1.5, 0.95, 0.06]} />
        <meshPhysicalMaterial color="#0c2328" roughness={0.6} clearcoat={0.5} />
      </mesh>
      {Array.from({ length: N }).map((_, i) => {
        const a0 = Math.PI - (i / N) * Math.PI;
        const col = `#${new THREE.Color("#3ee07a").lerp(new THREE.Color(K.amarillo), cl(i / (N / 2))).lerp(new THREE.Color("#ff3b3b"), cl((i - N / 2) / (N / 2))).getHexString()}`;
        return (
          <mesh key={i} position={[0, 0, 0]} rotation={[0, 0, a0 - Math.PI / N]}>
            <ringGeometry args={[0.5, 0.62, 8, 1, 0.02, Math.PI / N - 0.04]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.6} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      <group rotation={[0, 0, ang - Math.PI / 2]} position={[0, 0, 0.02]}>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.035, 0.5, 0.02]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.03]}>
        <circleGeometry args={[0.06, 20]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

// ---- Aminoacido que falta ------------------------------------------------------------------

/** Hueco de un aminoacido que no llego: esfera de alambre del color que se necesitaba. */
export const AminoFantasma: React.FC<{ p: V3; color: string; r?: number; op?: number; pulso?: number }> = ({ p, color, r = 0.09, op = 1, pulso = 0 }) => (
  <group position={p}>
    <mesh>
      <sphereGeometry args={[r, 10, 8]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={(0.45 + 0.3 * pulso) * op} />
    </mesh>
    <mesh>
      <sphereGeometry args={[r * 0.98, 16, 12]} />
      <meshBasicMaterial color="#061317" transparent opacity={0.5 * op} depthWrite={false} />
    </mesh>
  </group>
);

/** Tache rojo (X) de cara a +Z. */
export const Tache: React.FC<{ p: V3; escala?: number; op?: number; color?: string }> = ({ p, escala = 1, op = 1, color = K.rojo }) =>
  op <= 0.01 ? null : (
    <group position={p} scale={escala}>
      {[-1, 1].map((s) => (
        <mesh key={s} rotation={[0, 0, s * 0.785]}>
          <boxGeometry args={[0.07, 0.36, 0.04]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} transparent={op < 1} opacity={op} />
        </mesh>
      ))}
    </group>
  );
