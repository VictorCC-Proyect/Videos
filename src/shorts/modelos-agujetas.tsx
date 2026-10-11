// Modelos 3D del short de las agujetas (dolor muscular de aparicion tardia).
import React from "react";
import * as THREE from "three";
import { mix, V3 } from "../fisio/motor";
import { Humano } from "../fisio/modelos/cuerpo";
import { rnd } from "../fisio/modelos/comun";
import { Esfera } from "../fisio/modelos/energia";
import { K } from "./marco";

export const DOLOR = "#ff3b3b";
export const DEFENSA = "#d9c8ff";
export const SATELITE = "#b6ff3a";
export const SENSIB = "#ffe14a";

// ---- Atleta con el muslo dolorido ----------------------------------------------

/** Halo rojo que envuelve el muslo derecho (cadera en y = 0.95, x = 0.1). */
const HaloMuslo: React.FC<{ a: number; dolor: number }> = ({ a, dolor }) =>
  dolor > 0.01 ? (
    <group position={[0.1, 0.95, 0]} rotation={[a, 0, 0]}>
      <mesh position={[0, -0.22, 0]} scale={[1, 2.6, 1]}>
        <sphereGeometry args={[0.12, 20, 14]} />
        <meshBasicMaterial color={DOLOR} transparent opacity={0.3 * dolor} depthWrite={false} />
      </mesh>
      <mesh position={[0, -0.22, 0]} scale={[1, 2.2, 1]}>
        <sphereGeometry args={[0.17, 20, 14]} />
        <meshBasicMaterial color={DOLOR} transparent opacity={0.12 * dolor} depthWrite={false} />
      </mesh>
    </group>
  ) : null;

/**
 * Atleta (misma pose que Atleta de modelos.tsx) con el cuadriceps derecho que se
 * ilumina en rojo segun `dolor` (0..1). ej: sentadilla (k profundidad), parado o marcha.
 */
export const AtletaDolor: React.FC<{
  ej: "sentadilla" | "parado" | "marcha";
  k?: number;
  fase?: number;
  marcha?: number;
  dolor?: number;
  brilla?: number;
  colorBrillo?: string;
}> = ({ ej, k = 0, fase = 0, marcha = 0.6, dolor = 0, brilla = 0, colorBrillo = DOLOR }) => {
  const hum = { musculo: 0.8, brilla, brillaMuslo: Math.max(brilla, dolor), colorBrillo };
  if (ej === "sentadilla") {
    const h = 1.25 * k;
    const r = 2.1 * k;
    const baja = 0.87 - (0.44 * Math.cos(h) + 0.43 * Math.cos(r - h));
    const pie = 0.44 * Math.sin(h) - 0.43 * Math.sin(r - h);
    return (
      <group position={[0, -baja, -pie]}>
        <group rotation={[0.35 * k, 0, 0]}>
          <Humano
            {...hum}
            pose={{
              caderaD: [-h, 0, 0.05],
              caderaI: [-h, 0, -0.05],
              rodillaD: r,
              rodillaI: r,
              hombroD: [-1.45, 0, 0.12],
              hombroI: [-1.45, 0, -0.12],
              codoD: -0.1,
              codoI: -0.1,
            }}
          />
          <HaloMuslo a={-h} dolor={dolor} />
        </group>
      </group>
    );
  }
  if (ej === "marcha") {
    const s = Math.sin(fase) * marcha;
    return (
      <group>
        <Humano {...hum} fase={fase} marcha={marcha} />
        <group position={[0, Math.abs(Math.cos(fase)) * 0.025 * marcha, 0]}>
          <HaloMuslo a={s * 0.55} dolor={dolor} />
        </group>
      </group>
    );
  }
  return (
    <group>
      <Humano
        {...hum}
        pose={{ hombroD: [0, 0, 0.12], hombroI: [0, 0, -0.12], codoD: -0.15, codoI: -0.15, caderaD: [0, 0, 0.04], caderaI: [0, 0, -0.04], rodillaD: 0, rodillaI: 0 }}
      />
      <HaloMuslo a={0} dolor={dolor} />
    </group>
  );
};

// ---- Flecha 3D -------------------------------------------------------------------

/** Flecha que apunta hacia -Y (abajo) en su sistema local. */
export const Flecha3D: React.FC<{ p: V3; largo?: number; color?: string; op?: number; rot?: V3 }> = ({ p, largo = 0.6, color = K.amarillo, op = 1, rot = [0, 0, 0] }) => (
  <group position={p} rotation={rot}>
    <mesh position={[0, largo * 0.15, 0]}>
      <cylinderGeometry args={[0.035, 0.035, largo * 0.7, 12]} />
      <meshBasicMaterial color={color} transparent opacity={op} />
    </mesh>
    <mesh position={[0, -largo * 0.3, 0]} rotation={[Math.PI, 0, 0]}>
      <coneGeometry args={[0.09, largo * 0.3, 16]} />
      <meshBasicMaterial color={color} transparent opacity={op} />
    </mesh>
  </group>
);

// ---- Microdesgarros ----------------------------------------------------------------

/** Destellos blancos/amarillos alargados (grietas) repartidos en una caja. */
export const Desgarros: React.FC<{ n?: number; caja: V3; centro?: V3; dano: number; seed?: string; b?: number }> = ({
  n = 10,
  caja,
  centro = [0, 0, 0],
  dano,
  seed = "dg",
  b = 0,
}) =>
  dano > 0.01 ? (
    <group position={centro}>
      {Array.from({ length: n }).map((_, i) => {
        const d = Math.min(1, Math.max(0, dano * 1.5 - rnd(`${seed}d${i}`) * 0.5));
        if (d <= 0) return null;
        const p: V3 = [(rnd(`${seed}x${i}`) - 0.5) * caja[0], (rnd(`${seed}y${i}`) - 0.5) * caja[1], (rnd(`${seed}z${i}`) - 0.5) * caja[2]];
        const tit = 0.75 + 0.25 * Math.sin(b * 40 + i * 2.1);
        return (
          <group key={i} position={p} rotation={[0, 0, rnd(`${seed}r${i}`) * 3]}>
            <mesh scale={[0.38 * d, 0.045, 0.045]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#fff6d8" emissive="#ffe27a" emissiveIntensity={1.5 * d * tit} />
            </mesh>
            <mesh scale={[0.3 * d, 0.12 * d, 0.05]} rotation={[0, 0, 0.5]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.25 * d * tit} depthWrite={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  ) : null;

/** Chispa (estrella de rayos) para marcar una rotura puntual. */
export const Chispa: React.FC<{ p: V3; escala?: number; op?: number; color?: string }> = ({ p, escala = 1, op = 1, color = "#ffffff" }) =>
  op > 0.01 ? (
    <group position={p} scale={escala}>
      {[0, 0.8, 1.6, 2.4].map((a) => (
        <mesh key={a} rotation={[0, 0, a]} scale={[0.9, 0.05, 0.05]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={color} transparent opacity={op} />
        </mesh>
      ))}
      <mesh>
        <sphereGeometry args={[0.22, 16, 12]} />
        <meshBasicMaterial color={K.amarillo} transparent opacity={0.5 * op} depthWrite={false} />
      </mesh>
    </group>
  ) : null;

// ---- Celulas ---------------------------------------------------------------------

/** Celula de defensa tipo macrofago: cuerpo blanco-morado con bultos y pseudopodos. */
export const Macrofago: React.FC<{ p: V3; escala?: number; brillo?: number; op?: number; giro?: number; seed?: string }> = ({
  p,
  escala = 1,
  brillo = 0.2,
  op = 1,
  giro = 0,
  seed = "mf",
}) => (
  <group position={p} scale={escala} rotation={[0.3, giro, 0.2]}>
    <mesh scale={[1, 0.9, 0.95]}>
      <sphereGeometry args={[0.5, 32, 24]} />
      <meshPhysicalMaterial color={DEFENSA} emissive={K.morado} emissiveIntensity={brillo} roughness={0.5} clearcoat={0.4} transparent opacity={0.8 * op} depthWrite={false} />
    </mesh>
    {/* nucleo */}
    <mesh position={[0.08, 0.04, 0.05]} scale={[1.1, 0.8, 0.8]}>
      <sphereGeometry args={[0.22, 24, 16]} />
      <meshStandardMaterial color="#6a3fc4" emissive="#6a3fc4" emissiveIntensity={0.3} transparent opacity={op} />
    </mesh>
    {/* bultos y pseudopodos */}
    {Array.from({ length: 9 }).map((_, i) => {
      const a = rnd(`${seed}a${i}`) * Math.PI * 2;
      const e = (rnd(`${seed}e${i}`) - 0.5) * 2.4;
      const dir: V3 = [Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e)];
      const pseudo = i % 3 === 0;
      return (
        <mesh
          key={i}
          position={[dir[0] * (pseudo ? 0.58 : 0.44), dir[1] * (pseudo ? 0.52 : 0.4), dir[2] * (pseudo ? 0.55 : 0.42)]}
          scale={pseudo ? [0.11, 0.11, 0.11] : [0.17, 0.17, 0.17]}
        >
          <sphereGeometry args={[1, 14, 10]} />
          <meshPhysicalMaterial color={DEFENSA} emissive={K.morado} emissiveIntensity={brillo} roughness={0.5} transparent opacity={0.85 * op} />
        </mesh>
      );
    })}
    {/* granulos */}
    {Array.from({ length: 6 }).map((_, i) => (
      <Esfera key={`g${i}`} p={[(rnd(`${seed}gx${i}`) - 0.5) * 0.6, (rnd(`${seed}gy${i}`) - 0.5) * 0.5, 0.2]} r={0.04} color={SENSIB} brillo={0.6} op={op} />
    ))}
  </group>
);

/** Celula satelite: pequena celula alargada verde lima pegada a la fibra. */
export const CelulaSatelite: React.FC<{ p: V3; escala?: number; activa?: number; op?: number; rot?: V3 }> = ({
  p,
  escala = 1,
  activa = 0,
  op = 1,
  rot = [0, 0, 0],
}) =>
  op > 0.01 ? (
    <group position={p} scale={escala} rotation={rot}>
      <mesh scale={[0.18, 0.42, 0.13]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshPhysicalMaterial color={SATELITE} emissive={SATELITE} emissiveIntensity={0.25 + activa * 1.2} roughness={0.4} clearcoat={0.5} transparent opacity={op} />
      </mesh>
      <mesh position={[0, 0, 0.06]} scale={[0.09, 0.18, 0.08]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#3d7a12" emissive="#3d7a12" emissiveIntensity={0.3} transparent opacity={op} />
      </mesh>
      {activa > 0.05 ? (
        <mesh scale={[0.3, 0.6, 0.25]}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshBasicMaterial color={SATELITE} transparent opacity={0.18 * activa * op} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  ) : null;

// ---- Objetos -----------------------------------------------------------------------

/** Dedo (capsula color piel con una) que presiona hacia -Z (hacia el frente del muslo). */
export const Dedo: React.FC<{ p: V3; escala?: number }> = ({ p, escala = 1 }) => (
  <group position={p} scale={escala} rotation={[-Math.PI / 2, 0, 0]}>
    <mesh position={[0, -0.25, 0]}>
      <capsuleGeometry args={[0.07, 0.5, 8, 16]} />
      <meshPhysicalMaterial color="#e9b896" roughness={0.6} clearcoat={0.2} />
    </mesh>
    <mesh position={[0, 0.06, 0.045]} scale={[0.85, 0.75, 0.4]}>
      <sphereGeometry args={[0.08, 16, 12]} />
      <meshPhysicalMaterial color="#ffe3d6" clearcoat={1} roughness={0.15} />
    </mesh>
  </group>
);

/** Vaso con liquido de color (orina normal / oscura). nivel 0..1. */
export const VasoLiquido: React.FC<{ p: V3; color: string; nivel?: number; escala?: number }> = ({ p, color, nivel = 0.7, escala = 1 }) => (
  <group position={p} scale={escala}>
    <mesh position={[0, 0.7, 0]}>
      <cylinderGeometry args={[0.5, 0.42, 1.4, 40, 1, true]} />
      <meshPhysicalMaterial color="#d8f6ff" transparent opacity={0.22} roughness={0.05} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
    <mesh position={[0, 0.02 + (1.3 * nivel) / 2, 0]}>
      <cylinderGeometry args={[mix(0.43, 0.48, nivel), 0.42, 1.3 * nivel, 40]} />
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.15} roughness={0.15} clearcoat={0.6} transparent opacity={0.92} />
    </mesh>
  </group>
);
