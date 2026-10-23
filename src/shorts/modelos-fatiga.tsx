// Modelos 3D del short de la fatiga muscular.
import React from "react";
import * as THREE from "three";
import { mix, V3 } from "../fisio/motor";
import { rnd } from "../fisio/modelos/comun";
import { Esfera, Fosfato, Glucogeno } from "../fisio/modelos/energia";
import { CabezaMiosina } from "../fisio/modelos/musculo";
import { K } from "./marco";

export const PI_C = "#ff9a2e";
export const ACTINA_C = "#f2b83a";
export const MIOSINA_C = "#8f4ad8";

/** Mezcla dos colores hex (t 0..1). */
export const mezclaColor = (a: string, z: string, t: number) =>
  "#" + new THREE.Color(a).lerp(new THREE.Color(z), Math.min(1, Math.max(0, t))).getHexString();

// ---- Puentes cruzados: filamento grueso con cabezas + dos filamentos de actina ----

/**
 * Filamento grueso horizontal (miosina) con cabezas arriba y abajo que tiran de la actina.
 * fuerza 0..1: fraccion de cabezas que logran hacer el golpe de fuerza (el resto se queda
 * "armada" y apagada). La actina se desliza en proporcion a la fuerza.
 */
export const Puentes: React.FC<{ b: number; fuerza: number; n?: number; largo?: number; ciclos?: number; desliza: number }> = ({
  b,
  fuerza,
  n = 6,
  largo = 2.8,
  ciclos = 9,
  desliza,
}) => {
  const paso = 0.2;
  const nAct = Math.round(largo / paso) + 2;
  return (
    <group>
      {/* filamento grueso */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.14, 0.14, largo + 0.4, 24]} />
        <meshPhysicalMaterial color={MIOSINA_C} clearcoat={0.5} roughness={0.35} />
      </mesh>
      {/* actina arriba y abajo (perlas que se deslizan) */}
      {[1, -1].map((s) => (
        <group key={s} position={[0, s * 1.12, 0]}>
          {Array.from({ length: nAct }).map((_, i) => {
            const L = nAct * paso;
            const x = ((((i * paso + s * desliza) % L) + L) % L) - L / 2;
            const borde = Math.min(1, Math.max(0, (largo / 2 + 0.25 - Math.abs(x)) / 0.25));
            if (borde <= 0) return null;
            return (
              <group key={i}>
                <Esfera p={[x, Math.sin(i * 1.5) * 0.05, Math.cos(i * 1.5) * 0.05]} r={0.1 * borde} color={ACTINA_C} brillo={0.15} />
              </group>
            );
          })}
        </group>
      ))}
      {/* cabezas */}
      {[1, -1].flatMap((s) =>
        Array.from({ length: n }).map((_, i) => {
          const x = -largo / 2 + 0.25 + (i * (largo - 0.5)) / (n - 1);
          const activa = rnd(`pu${s}${i}`) < fuerza;
          const ph = (b * ciclos + rnd(`pf${s}${i}`)) % 1;
          let ang = -0.7 + Math.sin(b * 40 + i) * 0.03;
          let est = 0.92;
          if (activa) {
            ang = ph < 0.45 ? mix(-0.7, 0.35, ph / 0.45) : mix(0.35, -0.7, (ph - 0.45) / 0.55);
            est = ph < 0.45 ? 1 : 0.92;
          }
          const col = activa ? (ph < 0.45 ? "#7cff8a" : "#5ec8ff") : "#5a6874";
          return (
            <group key={`${s}${i}`} position={[x, s * 0.1, 0]} rotation={[0, 0, s > 0 ? 0 : Math.PI]}>
              <CabezaMiosina angulo={ang} estira={est} color={col} />
            </group>
          );
        }),
      )}
    </group>
  );
};

/** Pi (fosfato inorganico) libre: P naranja con 4 oxigenos. */
export const Pi: React.FC<{ p: V3; escala?: number; op?: number; brillo?: number }> = ({ p, escala = 1, op = 1, brillo = 0.5 }) => (
  <group>
    <Fosfato p={p} escala={escala} op={op} brillo={brillo} />
    <mesh position={p}>
      <sphereGeometry args={[0.3 * escala, 14, 10]} />
      <meshBasicMaterial color={PI_C} transparent opacity={0.14 * op} depthWrite={false} />
    </mesh>
  </group>
);

// ---- Maraton -------------------------------------------------------------------

/** Pared de ladrillos (centrada en x, base en y = 0, cara hacia +z). */
export const Pared: React.FC<{ ancho?: number; alto?: number; op?: number; brillo?: number }> = ({ ancho = 2.4, alto = 2.2, op = 1, brillo = 0 }) => {
  const fil = 9;
  const col = 5;
  const h = alto / fil;
  const w = ancho / col;
  return (
    <group>
      <mesh position={[0, alto / 2, -0.06]}>
        <boxGeometry args={[ancho, alto, 0.1]} />
        <meshStandardMaterial color="#5b4b45" transparent={op < 1} opacity={op} />
      </mesh>
      {Array.from({ length: fil }).flatMap((_, r) =>
        Array.from({ length: col + 1 }).map((__, c) => {
          const off = r % 2 ? w / 2 : 0;
          const x0 = -ancho / 2 + c * w - off;
          const x1 = Math.min(ancho / 2, x0 + w);
          const xa = Math.max(-ancho / 2, x0);
          if (x1 - xa < 0.05) return null;
          const tono = rnd(`la${r}${c}`);
          return (
            <mesh key={`${r}${c}`} position={[(xa + x1) / 2, h * r + h / 2, 0.02]}>
              <boxGeometry args={[x1 - xa - 0.025, h - 0.025, 0.16]} />
              <meshStandardMaterial
                color={mezclaColor("#9c3b2a", "#c45a3c", tono)}
                emissive={K.rojo}
                emissiveIntensity={brillo * 0.4}
                roughness={0.85}
                transparent={op < 1}
                opacity={op}
              />
            </mesh>
          );
        }),
      )}
    </group>
  );
};

/** Camino recto a lo largo de Z con lineas que avanzan (avance = distancia recorrida). */
export const Camino: React.FC<{ avance: number; largo?: number; ancho?: number }> = ({ avance, largo = 16, ancho = 1.4 }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
      <planeGeometry args={[ancho, largo]} />
      <meshStandardMaterial color="#1d3036" roughness={0.9} />
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={s} rotation={[-Math.PI / 2, 0, 0]} position={[s * (ancho / 2 - 0.05), 0, 0]}>
        <planeGeometry args={[0.04, largo]} />
        <meshBasicMaterial color={K.lima} transparent opacity={0.5} />
      </mesh>
    ))}
    {Array.from({ length: 16 }).map((_, i) => {
      const z = ((((i - avance) % 16) + 16) % 16) - 8;
      return (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, -z]}>
          <planeGeometry args={[0.05, 0.4]} />
          <meshBasicMaterial color="#e8f0ee" transparent opacity={0.55} />
        </mesh>
      );
    })}
  </group>
);

/** Deposito de glucogeno: capsula transparente con granulos; nivel 0..1. */
export const TanqueGlucogeno: React.FC<{ nivel: number; b?: number; escala?: number }> = ({ nivel, b = 0, escala = 1 }) => {
  const N = 18;
  return (
    <group scale={escala}>
      <mesh>
        <capsuleGeometry args={[0.42, 0.9, 12, 32]} />
        <meshPhysicalMaterial color="#cfefff" transparent opacity={0.16} roughness={0.05} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {Array.from({ length: N }).map((_, i) => {
        const orden = i / N;
        if (orden >= nivel) return null;
        const y = -0.6 + (Math.floor(i / 3) * 1.15) / Math.ceil(N / 3);
        const a = (i % 3) * 2.1 + Math.floor(i / 3);
        const p: V3 = [Math.cos(a) * 0.18, y + 0.08 + Math.sin(b * 3 + i) * 0.02, Math.sin(a) * 0.18];
        return <Glucogeno key={i} p={p} escala={0.85} />;
      })}
    </group>
  );
};

// ---- Iconos de los consejos --------------------------------------------------

/** Botella de agua (base en y = 0). */
export const Botella: React.FC<{ nivel?: number }> = ({ nivel = 0.8 }) => (
  <group>
    <mesh position={[0, 0.5, 0]}>
      <cylinderGeometry args={[0.22, 0.22, 1, 32, 1, true]} />
      <meshPhysicalMaterial color="#d8f6ff" transparent opacity={0.25} roughness={0.05} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
    <mesh position={[0, 1.08, 0]}>
      <cylinderGeometry args={[0.1, 0.22, 0.18, 32, 1, true]} />
      <meshPhysicalMaterial color="#d8f6ff" transparent opacity={0.25} roughness={0.05} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
    <mesh position={[0, (0.98 * nivel) / 2 + 0.01, 0]}>
      <cylinderGeometry args={[0.2, 0.2, 0.98 * nivel, 32]} />
      <meshPhysicalMaterial color={K.cian} emissive={K.cian} emissiveIntensity={0.25} transparent opacity={0.6} roughness={0.1} depthWrite={false} />
    </mesh>
    <mesh position={[0, 1.24, 0]}>
      <cylinderGeometry args={[0.11, 0.11, 0.14, 24]} />
      <meshStandardMaterial color="#2f8bff" roughness={0.4} />
    </mesh>
    <mesh position={[0, 0.5, 0]}>
      <cylinderGeometry args={[0.225, 0.225, 0.3, 32, 1, true]} />
      <meshStandardMaterial color={K.lima} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

/** Reloj de pared / cronometro de descanso; t = vueltas de la aguja. */
export const Reloj: React.FC<{ t: number; color?: string }> = ({ t, color = K.amarillo }) => (
  <group>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.55, 0.55, 0.08, 48]} />
      <meshStandardMaterial color="#f4f7f2" roughness={0.4} />
    </mesh>
    <mesh>
      <torusGeometry args={[0.57, 0.07, 16, 48]} />
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.3} clearcoat={0.8} roughness={0.25} />
    </mesh>
    <mesh position={[0, 0.72, 0]}>
      <cylinderGeometry args={[0.08, 0.08, 0.14, 20]} />
      <meshStandardMaterial color={color} />
    </mesh>
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.sin(a) * 0.45, Math.cos(a) * 0.45, 0.05]} rotation={[0, 0, -a]}>
          <boxGeometry args={[0.03, i % 3 ? 0.06 : 0.12, 0.02]} />
          <meshStandardMaterial color="#061317" />
        </mesh>
      );
    })}
    <group rotation={[0, 0, -t * Math.PI * 2]} position={[0, 0, 0.06]}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.04, 0.4, 0.02]} />
        <meshStandardMaterial color={K.rojo} emissive={K.rojo} emissiveIntensity={0.4} />
      </mesh>
    </group>
    <group rotation={[0, 0, -t * 0.4]} position={[0, 0, 0.055]}>
      <mesh position={[0, 0.13, 0]}>
        <boxGeometry args={[0.06, 0.26, 0.02]} />
        <meshStandardMaterial color="#061317" />
      </mesh>
    </group>
    <mesh position={[0, 0, 0.07]}>
      <sphereGeometry args={[0.04, 12, 10]} />
      <meshStandardMaterial color="#061317" />
    </mesh>
  </group>
);
