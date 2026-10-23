// Modelos 3D propios del short de cardio en ayunas: sol, reloj, barras apiladas,
// velocimetro de rendimiento, llama de gasto y balanza con bloques.
import React from "react";
import * as THREE from "three";
import { V3 } from "../fisio/motor";
import { Tubo } from "../fisio/modelos/comun";
import { K } from "./marco";

/** Sol al amanecer: disco brillante con halo. */
export const Sol: React.FC<{ p: V3; r?: number; brillo?: number }> = ({ p, r = 0.8, brillo = 1 }) => (
  <group position={p}>
    <mesh>
      <sphereGeometry args={[r, 40, 30]} />
      <meshBasicMaterial color="#ffd27a" />
    </mesh>
    {[1.3, 1.7, 2.3].map((k, i) => (
      <mesh key={i}>
        <sphereGeometry args={[r * k, 32, 24]} />
        <meshBasicMaterial color={i === 2 ? "#ff7a45" : "#ffb347"} transparent opacity={(0.28 - i * 0.07) * brillo} depthWrite={false} />
      </mesh>
    ))}
  </group>
);

/** Reloj de pared: esfera, 12 marcas y dos manecillas. hora en horas (6 = 6:00). */
export const Reloj3D: React.FC<{ p: V3; r?: number; hora: number; color?: string }> = ({ p, r = 0.45, hora, color = K.lima }) => {
  const aH = -((hora % 12) / 12) * Math.PI * 2;
  const aM = -(hora % 1) * Math.PI * 2;
  const mano = (a: number, largo: number, ancho: number, c: string, z: number) => (
    <group rotation={[0, 0, a]} position={[0, 0, z]}>
      <mesh position={[0, largo / 2, 0]}>
        <boxGeometry args={[ancho, largo, 0.02]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
  return (
    <group position={p}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r * 1.08, r * 1.08, 0.08, 48]} />
        <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.35} metalness={0.3} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <circleGeometry args={[r, 48]} />
        <meshStandardMaterial color="#0b1d21" />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(a) * r * 0.82, Math.cos(a) * r * 0.82, 0.05]} rotation={[0, 0, -a]}>
            <boxGeometry args={[0.025, i % 3 === 0 ? 0.1 : 0.05, 0.01]} />
            <meshBasicMaterial color="#e8f4f2" />
          </mesh>
        );
      })}
      {mano(aH, r * 0.5, 0.05, "#f4f7f2", 0.06)}
      {mano(aM, r * 0.75, 0.03, color, 0.07)}
      <mesh position={[0, 0, 0.08]}>
        <sphereGeometry args={[0.035, 12, 10]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
};

/** Barra apilada (columna con segmentos de color). Cada segmento: alto en unidades. */
export const BarraApilada: React.FC<{ p: V3; segs: { v: number; color: string }[]; r?: number; alto?: number }> = ({ p, segs, r = 0.22, alto = 2 }) => {
  let y = 0.08;
  return (
    <group position={p}>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[r * 1.5, r * 1.6, 0.08, 40]} />
        <meshStandardMaterial color="#2b3f45" />
      </mesh>
      {segs.map((s, i) => {
        const h = Math.max(0.001, s.v);
        const yc = y + h / 2;
        y += h;
        return (
          <mesh key={i} position={[0, yc, 0]}>
            <cylinderGeometry args={[r, r, h, 32]} />
            <meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={0.55} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.08 + alto / 2, 0]}>
        <cylinderGeometry args={[r * 1.25, r * 1.25, alto, 32, 1, true]} />
        <meshPhysicalMaterial color="#cfefff" transparent opacity={0.16} roughness={0.05} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
};

/** Velocimetro de rendimiento: arco rojo->verde y aguja. nivel 0..1. */
export const Velocimetro: React.FC<{ p: V3; nivel: number; r?: number }> = ({ p, nivel, r = 0.6 }) => {
  const n = 9;
  const colores = ["#ff4d4d", "#ff6f3d", "#ff8a3d", "#ffb13d", "#ffd23f", "#e4e83a", "#c6f432", "#8fe04a", "#47d18c"];
  const ang = Math.PI * (1 - nivel);
  return (
    <group position={p}>
      <mesh position={[0, r * 0.35, -0.04]}>
        <circleGeometry args={[r * 1.2, 48, 0, Math.PI]} />
        <meshStandardMaterial color="#0b1d21" transparent opacity={0.9} />
      </mesh>
      {Array.from({ length: n }).map((_, i) => {
        const a0 = Math.PI - ((i + 1) / n) * Math.PI;
        return (
          <mesh key={i} position={[0, r * 0.35, 0]}>
            <ringGeometry args={[r * 0.8, r, 12, 1, a0 + 0.02, Math.PI / n - 0.04]} />
            <meshBasicMaterial color={colores[i]} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      <group position={[0, r * 0.35, 0.03]} rotation={[0, 0, ang - Math.PI / 2]}>
        <mesh position={[0, r * 0.42, 0]}>
          <boxGeometry args={[0.04, r * 0.84, 0.03]} />
          <meshStandardMaterial color="#f4f7f2" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
      </group>
      <mesh position={[0, r * 0.35, 0.05]}>
        <sphereGeometry args={[0.06, 16, 12]} />
        <meshStandardMaterial color="#f4f7f2" />
      </mesh>
    </group>
  );
};

/** Llama estilizada (gasto de energia). */
export const LlamaGasto: React.FC<{ p: V3; escala?: number; b: number }> = ({ p, escala = 1, b }) => {
  const f = 1 + Math.sin(b * 40) * 0.06;
  return (
    <group position={p} scale={[escala, escala * f, escala]}>
      <mesh position={[0, 0.28, 0]}>
        <coneGeometry args={[0.18, 0.56, 24]} />
        <meshStandardMaterial color={K.naranja} emissive={K.naranja} emissiveIntensity={1.2} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0.2, 0.02]}>
        <coneGeometry args={[0.1, 0.36, 20]} />
        <meshStandardMaterial color={K.amarillo} emissive={K.amarillo} emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
};

/** Bloque-pesa de color (para la balanza). */
export const Bloque: React.FC<{ p: V3; tam: V3; color: string; op?: number }> = ({ p, tam, color, op = 1 }) => (
  <mesh position={[p[0], p[1] + tam[1] / 2, p[2]]}>
    <boxGeometry args={tam} />
    <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.3} clearcoat={0.7} transparent={op < 1} opacity={op} />
  </mesh>
);

/** Balanza de dos platillos. ang > 0 baja el lado derecho. Devuelve contenido en cada platillo. */
export const BALANZA = { alto: 2.1, L: 1.2, cuelga: 0.95 };
export const platilloBalanza = (s: number, ang: number): V3 => [s * BALANZA.L * Math.cos(ang), BALANZA.alto - s * BALANZA.L * Math.sin(ang) - BALANZA.cuelga + 0.03, 0];

export const BalanzaPlatos: React.FC<{ ang: number; izq: React.ReactNode; der: React.ReactNode }> = ({ ang, izq, der }) => {
  const { alto, L, cuelga } = BALANZA;
  const ext = (s: number): V3 => [s * L * Math.cos(ang), alto - s * L * Math.sin(ang), 0];
  const metal = <meshPhysicalMaterial color="#cfd8dc" metalness={0.7} roughness={0.25} clearcoat={0.6} />;
  const platillo = (s: number, cont: React.ReactNode) => {
    const e = ext(s);
    const pp: V3 = [e[0], e[1] - cuelga, 0];
    return (
      <group key={s}>
        {[-1, 1].map((q) => (
          <Tubo key={q} puntos={[e, [pp[0] + q * 0.25, pp[1] + 0.02, 0]]} radio={0.012} color="#cfd8dc" />
        ))}
        <mesh position={pp}>
          <cylinderGeometry args={[0.6, 0.45, 0.06, 48]} />
          {metal}
        </mesh>
        <group position={[pp[0], pp[1] + 0.03, 0]}>{cont}</group>
      </group>
    );
  };
  return (
    <group>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.55, 0.65, 0.12, 48]} />
        {metal}
      </mesh>
      <mesh position={[0, alto / 2, 0]}>
        <cylinderGeometry args={[0.07, 0.09, alto, 24]} />
        {metal}
      </mesh>
      <mesh position={[0, alto, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.12, 24]} />
        <meshStandardMaterial color={K.lima} emissive={K.lima} emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, alto, 0]} rotation={[0, 0, -ang]}>
        <boxGeometry args={[L * 2, 0.07, 0.07]} />
        {metal}
      </mesh>
      {platillo(-1, izq)}
      {platillo(1, der)}
    </group>
  );
};
