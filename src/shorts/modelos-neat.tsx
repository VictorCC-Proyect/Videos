// Modelos 3D del short del NEAT: persona sentada (inquieta / que se levanta / que come),
// persona gesticulando, silla, mesa larga, pizza, hamburguesa, pastel, escalones, huellas,
// helice de ADN y marcador "+kcal".
import React from "react";
import { V3 } from "../fisio/motor";
import { Humano } from "../fisio/modelos/cuerpo";
import { rnd } from "../fisio/modelos/comun";
import { K } from "./marco";

export const NEAT_C = K.lima;
export const BASAL_C = "#3b8bff";
export const TEF_C = K.naranja;
export const EJER_C = K.rosa;

// ---- Personas ----------------------------------------------------------------------------

/**
 * Persona sentada (origen = pies). levanta 0..1 la pone de pie; pierna 0..1 = rebote del
 * talon; come 0..1 sube la mano derecha a la boca; gesto 0..1 = mueve los brazos al hablar.
 * La silla de una persona sentada va en SILLA_Z (asiento a 0.43 de alto).
 */
export const SILLA_Z = -0.42;

export const PersonaSentada: React.FC<{
  levanta?: number;
  pierna?: number;
  come?: number;
  gesto?: number;
  fase?: number;
  musculo?: number;
  brilla?: number;
  colorBrillo?: string;
}> = ({ levanta = 0, pierna = 0, come = 0, gesto = 0, fase = 0, musculo = 0.8, brilla = 0, colorBrillo }) => {
  const h = (Math.PI / 2) * (1 - levanta);
  const r = h;
  const baja = 0.87 - (0.44 * Math.cos(h) + 0.43 * Math.cos(r - h));
  const pie = 0.44 * Math.sin(h) - 0.43 * Math.sin(r - h);
  const rebote = Math.max(0, Math.sin(fase)) * pierna;
  const inclina = 0.35 * Math.sin(Math.PI * levanta);
  const g = Math.sin(fase * 0.7) * gesto;
  const hombroD: [number, number, number] = [-0.35 - 0.75 * come - (0.5 + 0.3 * g) * gesto, 0, 0.14 + 0.25 * gesto];
  const hombroI: [number, number, number] = [-0.35 - (0.5 - 0.3 * g) * gesto, 0, -0.14 - 0.25 * gesto];
  return (
    <group position={[0, -baja, -pie]}>
      <group rotation={[inclina, 0, 0]}>
        <Humano
          musculo={musculo}
          brilla={brilla}
          colorBrillo={colorBrillo}
          pose={{
            caderaD: [-h - 0.16 * rebote, 0, 0.06],
            caderaI: [-h, 0, -0.06],
            rodillaD: r + 0.1 * rebote,
            rodillaI: r,
            hombroD: levanta > 0.5 ? [0, 0, 0.12] : hombroD,
            hombroI: levanta > 0.5 ? [0, 0, -0.12] : hombroI,
            codoD: levanta > 0.5 ? -0.15 : -1.1 - 1.15 * come - 0.4 * gesto,
            codoI: levanta > 0.5 ? -0.15 : -1.1 - 0.4 * gesto,
          }}
        />
      </group>
    </group>
  );
};

/** Persona de pie que gesticula (brazos que suben y bajan) y cambia el peso de pierna. */
export const PersonaGesto: React.FC<{ fase: number; gesto?: number; musculo?: number; brilla?: number; colorBrillo?: string }> = ({
  fase,
  gesto = 1,
  musculo = 0.8,
  brilla = 0,
  colorBrillo,
}) => {
  const a = Math.sin(fase) * gesto;
  const c = Math.sin(fase * 1.3 + 1) * gesto;
  return (
    <group rotation={[0, 0, 0.03 * Math.sin(fase * 0.5) * gesto]}>
      <Humano
        musculo={musculo}
        brilla={brilla}
        colorBrillo={colorBrillo}
        pose={{
          hombroD: [-0.5 - 0.5 * gesto - 0.35 * a, 0, 0.2 + 0.35 * gesto],
          hombroI: [-0.5 - 0.5 * gesto - 0.35 * c, 0, -0.2 - 0.35 * gesto],
          codoD: -0.3 - 1.0 * gesto - 0.3 * a,
          codoI: -0.3 - 1.0 * gesto - 0.3 * c,
          caderaD: [0, 0, 0.05],
          caderaI: [0, 0, -0.05],
          rodillaD: 0.12 * Math.max(0, Math.sin(fase * 0.5)) * gesto,
          rodillaI: 0.12 * Math.max(0, -Math.sin(fase * 0.5)) * gesto,
        }}
      />
    </group>
  );
};

// ---- Muebles -----------------------------------------------------------------------------

/** Silla (origen = centro del piso bajo el asiento; respaldo hacia -z). */
export const Silla: React.FC<{ p: V3; color?: string }> = ({ p, color = "#3a5a63" }) => (
  <group position={p}>
    <mesh position={[0, 0.41, 0]}>
      <boxGeometry args={[0.46, 0.05, 0.44]} />
      <meshPhysicalMaterial color={color} roughness={0.5} clearcoat={0.4} />
    </mesh>
    <mesh position={[0, 0.72, -0.21]}>
      <boxGeometry args={[0.46, 0.56, 0.05]} />
      <meshPhysicalMaterial color={color} roughness={0.5} clearcoat={0.4} />
    </mesh>
    {[
      [-0.2, -0.19],
      [0.2, -0.19],
      [-0.2, 0.19],
      [0.2, 0.19],
    ].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.2, z]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 10]} />
        <meshStandardMaterial color="#8aa0a6" metalness={0.5} />
      </mesh>
    ))}
  </group>
);

/** Mesa rectangular (origen = centro en el piso). */
export const MesaLarga: React.FC<{ p: V3; ancho?: number; fondo?: number; alto?: number }> = ({ p, ancho = 2.2, fondo = 0.8, alto = 0.74 }) => (
  <group position={p}>
    <mesh position={[0, alto, 0]}>
      <boxGeometry args={[ancho, 0.05, fondo]} />
      <meshPhysicalMaterial color="#e8eef0" roughness={0.3} clearcoat={0.6} />
    </mesh>
    {[
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ].map(([x, z], i) => (
      <mesh key={i} position={[x * (ancho / 2 - 0.08), alto / 2, z * (fondo / 2 - 0.08)]}>
        <cylinderGeometry args={[0.03, 0.03, alto, 12]} />
        <meshStandardMaterial color="#8aa0a6" />
      </mesh>
    ))}
  </group>
);

/** Escalones (suben hacia +x). n escalones de alto h y huella d. */
export const Escalones: React.FC<{ p: V3; n?: number; h?: number; d?: number; ancho?: number; color?: string }> = ({
  p,
  n = 4,
  h = 0.18,
  d = 0.32,
  ancho = 0.8,
  color = "#4f6b72",
}) => (
  <group position={p}>
    {Array.from({ length: n }).map((_, i) => (
      <mesh key={i} position={[i * d + d / 2, ((i + 1) * h) / 2, 0]}>
        <boxGeometry args={[d, (i + 1) * h, ancho]} />
        <meshPhysicalMaterial color={color} roughness={0.6} clearcoat={0.3} />
      </mesh>
    ))}
    {Array.from({ length: n }).map((_, i) => (
      <mesh key={`b${i}`} position={[i * d + 0.02, (i + 1) * h + 0.004, 0]}>
        <boxGeometry args={[0.04, 0.01, ancho]} />
        <meshBasicMaterial color={K.lima} />
      </mesh>
    ))}
  </group>
);

/** Huella de pie (de cara a +z, plana); lado 1 = derecha. */
export const Huella: React.FC<{ p: V3; lado?: 1 | -1; escala?: number; color?: string; op?: number }> = ({
  p,
  lado = 1,
  escala = 1,
  color = K.lima,
  op = 1,
}) => (
  <group position={p} scale={escala * lado} rotation={[0, 0, 0.12 * lado]}>
    <mesh scale={[0.09, 0.15, 0.02]}>
      <sphereGeometry args={[1, 20, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={op} />
    </mesh>
    {[-0.05, -0.02, 0.01, 0.04, 0.065].map((x, i) => (
      <mesh key={i} position={[x, 0.19 - Math.abs(i - 1) * 0.012, 0]}>
        <sphereGeometry args={[0.022 - i * 0.002, 12, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={op} />
      </mesh>
    ))}
  </group>
);

// ---- Comida ------------------------------------------------------------------------------

const PEPPERONI: [number, number][] = Array.from({ length: 9 }).map((_, i) => {
  const a = i * 2.4;
  const r = 0.07 + rnd(`pz${i}`) * 0.15;
  return [Math.cos(a) * r, Math.sin(a) * r];
});

/** Pizza entera; faltan rebanadas segun come 0..1. */
export const Pizza: React.FC<{ p: V3; escala?: number; come?: number; giro?: number }> = ({ p, escala = 1, come = 0, giro = 0 }) => {
  const queda = Math.PI * 2 * (1 - come * 0.75);
  return (
    <group position={p} scale={escala} rotation={[0, giro, 0]}>
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.03, 40, 1, false, 0, queda]} />
        <meshStandardMaterial color="#e2a85a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.032, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 0.01, 40, 1, false, 0, queda]} />
        <meshStandardMaterial color="#ffd36b" emissive="#ffb43a" emissiveIntensity={0.15} roughness={0.5} />
      </mesh>
      {PEPPERONI.map(([x, z], i) => {
        const a = Math.atan2(x, z);
        if ((a < 0 ? a + Math.PI * 2 : a) > queda) return null;
        return (
          <mesh key={i} position={[x, 0.04, z]}>
            <cylinderGeometry args={[0.035, 0.035, 0.012, 16]} />
            <meshStandardMaterial color="#c0392b" roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Hamburguesa (origen = base). */
export const Hamburguesa: React.FC<{ p: V3; escala?: number; giro?: number }> = ({ p, escala = 1, giro = 0 }) => (
  <group position={p} scale={escala} rotation={[0, giro, 0]}>
    <mesh position={[0, 0.03, 0]}>
      <cylinderGeometry args={[0.15, 0.14, 0.06, 32]} />
      <meshStandardMaterial color="#d99a4e" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.085, 0]}>
      <cylinderGeometry args={[0.16, 0.16, 0.05, 32]} />
      <meshStandardMaterial color="#6b3a22" roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.115, 0]} rotation={[0, 0.4, 0]}>
      <boxGeometry args={[0.27, 0.012, 0.27]} />
      <meshStandardMaterial color="#ffc93c" emissive="#ffb000" emissiveIntensity={0.15} />
    </mesh>
    <mesh position={[0, 0.13, 0]}>
      <cylinderGeometry args={[0.175, 0.17, 0.02, 24]} />
      <meshStandardMaterial color="#5fd35a" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.14, 0]} scale={[1, 0.6, 1]}>
      <sphereGeometry args={[0.16, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#e0a252" roughness={0.55} />
    </mesh>
  </group>
);

/** Rebanada de pastel con cereza (origen = base). */
export const Pastel: React.FC<{ p: V3; escala?: number; giro?: number }> = ({ p, escala = 1, giro = 0 }) => (
  <group position={p} scale={escala} rotation={[0, giro, 0]}>
    <mesh position={[0, 0.08, 0]}>
      <cylinderGeometry args={[0.2, 0.2, 0.16, 3, 1, false, 0, Math.PI * 2]} />
      <meshStandardMaterial color="#7a3f2a" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.17, 0]}>
      <cylinderGeometry args={[0.205, 0.205, 0.03, 3]} />
      <meshStandardMaterial color="#fff1f5" roughness={0.4} />
    </mesh>
    <mesh position={[0.02, 0.22, 0]}>
      <sphereGeometry args={[0.04, 16, 12]} />
      <meshStandardMaterial color="#e0193f" emissive="#c00" emissiveIntensity={0.2} roughness={0.3} />
    </mesh>
  </group>
);

/** Plato con comida segun cantidad 0..1 (0 = vacio). */
export const PlatoComida: React.FC<{ p: V3; escala?: number; cantidad: number }> = ({ p, escala = 1, cantidad }) => (
  <group position={p} scale={escala}>
    <mesh>
      <cylinderGeometry args={[0.36, 0.28, 0.04, 40]} />
      <meshPhysicalMaterial color="#f4f7f2" clearcoat={0.8} roughness={0.25} />
    </mesh>
    {cantidad > 0.02
      ? Array.from({ length: 12 }).map((_, i) => {
          if (i / 12 >= cantidad) return null;
          const a = i * 2.39;
          const r = 0.04 + (i % 4) * 0.055;
          const col = ["#e2a85a", "#5fd35a", "#c0392b", "#ffd36b"][i % 4];
          return (
            <mesh key={i} position={[Math.cos(a) * r, 0.05 + (i / 12) * 0.08, Math.sin(a) * r]}>
              <sphereGeometry args={[0.07, 14, 10]} />
              <meshStandardMaterial color={col} roughness={0.6} />
            </mesh>
          );
        })
      : null}
  </group>
);

// ---- Genetica ----------------------------------------------------------------------------

/** Helice de ADN vertical (origen = centro). giro en radianes. */
export const ADN: React.FC<{ alto?: number; r?: number; giro?: number; brillo?: number; n?: number }> = ({ alto = 2.4, r = 0.32, giro = 0, brillo = 0.4, n = 22 }) => (
  <group rotation={[0, giro, 0]}>
    {Array.from({ length: n }).map((_, i) => {
      const y = -alto / 2 + (i / (n - 1)) * alto;
      const a = i * 0.55;
      const p1: V3 = [Math.cos(a) * r, y, Math.sin(a) * r];
      const p2: V3 = [-Math.cos(a) * r, y, -Math.sin(a) * r];
      const cols = [K.cian, K.rosa, K.lima, K.amarillo];
      return (
        <group key={i}>
          <mesh position={p1}>
            <sphereGeometry args={[0.055, 14, 10]} />
            <meshStandardMaterial color="#cfe6ff" emissive="#9fd8ff" emissiveIntensity={brillo} />
          </mesh>
          <mesh position={p2}>
            <sphereGeometry args={[0.055, 14, 10]} />
            <meshStandardMaterial color="#cfe6ff" emissive="#9fd8ff" emissiveIntensity={brillo} />
          </mesh>
          <mesh position={[0, y, 0]} rotation={[0, -a, Math.PI / 2]}>
            <cylinderGeometry args={[0.018, 0.018, r * 2, 8]} />
            <meshStandardMaterial color={cols[i % 4]} emissive={cols[i % 4]} emissiveIntensity={brillo} />
          </mesh>
        </group>
      );
    })}
  </group>
);
