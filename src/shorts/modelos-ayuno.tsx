// Modelos 3D propios del short de ayuno: adipocito, cerebro, celula con autofagia.
import React from "react";
import * as THREE from "three";
import { mix, mix3, V3 } from "../fisio/motor";
import { rnd } from "../fisio/modelos/comun";
import { Esfera, GotaLipido } from "../fisio/modelos/energia";
import { K } from "./marco";

/** Adipocito: celula grande translucida con una gota lipidica que ocupa casi todo. */
export const Adipocito: React.FC<{ p: V3; r?: number; gota?: number; brillo?: number }> = ({ p, r = 0.8, gota = 0.7, brillo = 0 }) => (
  <group position={p}>
    <mesh>
      <sphereGeometry args={[r, 40, 30]} />
      <meshPhysicalMaterial
        color="#f6e7c8"
        emissive="#ffcf70"
        emissiveIntensity={0.08 + brillo}
        transparent
        opacity={0.28}
        roughness={0.2}
        clearcoat={0.8}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
    <GotaLipido p={[0, 0, 0]} r={r * gota} />
    {/* nucleo aplastado contra la membrana */}
    <mesh position={[-r * 0.72, -r * 0.45, r * 0.3]} scale={[0.5, 0.28, 0.4]}>
      <sphereGeometry args={[r * 0.35, 20, 14]} />
      <meshStandardMaterial color="#7b5cd6" emissive="#7b5cd6" emissiveIntensity={0.25} />
    </mesh>
  </group>
);

/** Celula generica translucida (higado / musculo) para guardar glucogeno. */
export const CelulaSimple: React.FC<{ p: V3; r?: number; color?: string }> = ({ p, r = 0.8, color = "#e88a7a" }) => (
  <group position={p}>
    <mesh scale={[1.1, 0.9, 0.8]}>
      <sphereGeometry args={[r, 40, 30]} />
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.12} transparent opacity={0.25} roughness={0.25} clearcoat={0.6} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
    <mesh position={[r * 0.55, r * 0.35, -r * 0.2]} scale={0.22}>
      <sphereGeometry args={[r, 20, 14]} />
      <meshStandardMaterial color="#7b5cd6" emissive="#7b5cd6" emissiveIntensity={0.25} />
    </mesh>
  </group>
);

/** Cerebro estilizado: dos hemisferios rosados con surcos. */
export const Cerebro: React.FC<{ p: V3; escala?: number; brillo?: number; giro?: number }> = ({ p, escala = 1, brillo = 0, giro = 0 }) => (
  <group position={p} scale={escala} rotation={[0.15, giro, 0]}>
    {[-1, 1].map((s) => (
      <group key={s} position={[s * 0.36, 0, 0]}>
        <mesh scale={[0.62, 0.68, 1]}>
          <sphereGeometry args={[0.6, 40, 30]} />
          <meshPhysicalMaterial color="#f29bb0" emissive="#ff6f9a" emissiveIntensity={0.12 + brillo} roughness={0.5} clearcoat={0.4} />
        </mesh>
        {/* surcos */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh
            key={i}
            scale={[0.62, 0.68, 1]}
            rotation={[(rnd(`cs${s}${i}`) - 0.5) * 2.2, (rnd(`ct${s}${i}`) - 0.5) * 1.2 + (s > 0 ? 0.3 : -0.3), rnd(`cu${s}${i}`) * Math.PI]}
          >
            <torusGeometry args={[0.6, 0.018, 6, 48, Math.PI * (0.7 + rnd(`cv${s}${i}`) * 0.6)]} />
            <meshStandardMaterial color="#b4566f" />
          </mesh>
        ))}
      </group>
    ))}
    {/* tronco encefalico */}
    <mesh position={[0, -0.45, -0.15]} rotation={[0.3, 0, 0]}>
      <cylinderGeometry args={[0.1, 0.07, 0.4, 16]} />
      <meshPhysicalMaterial color="#e78aa0" roughness={0.5} />
    </mesh>
  </group>
);

/** Mitocondria pequena (gris = vieja/danada). */
export const MitoMini: React.FC<{ p: V3; escala?: number; vieja?: boolean; op?: number; rot?: number }> = ({ p, escala = 1, vieja = false, op = 1, rot = 0 }) => {
  const c = vieja ? "#8a8f96" : K.naranja;
  return (
    <group position={p} scale={escala} rotation={[0, 0, rot]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.18, 0.4, 8, 20]} />
        <meshPhysicalMaterial color={c} emissive={c} emissiveIntensity={vieja ? 0.05 : 0.25} transparent opacity={0.8 * op} roughness={vieja ? 0.8 : 0.3} />
      </mesh>
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[-0.24 + i * 0.16, i % 2 ? 0.05 : -0.05, 0]} scale={[0.04, 0.12, 0.1]}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color={vieja ? "#5d6168" : "#ffc29a"} transparent opacity={op} />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Autofagia: el fagoforo (casquete de membrana doble) envuelve un organelo viejo,
 * se cierra (autofagosoma), se fusiona con un lisosoma y el contenido se recicla.
 * cierra 0..1, fusion 0..1, recicla 0..1.
 */
export const Autofagia: React.FC<{ p: V3; cierra: number; fusion: number; recicla: number }> = ({ p, cierra, fusion, recicla }) => {
  const R = 0.62;
  const theta = mix(0.35, Math.PI, cierra);
  const lis: V3 = mix3([1.6, -1.0, 0.2], [0.35, -0.2, 0.05], fusion);
  const mezcla = fusion > 0.95 ? 1 : 0;
  return (
    <group position={p}>
      {/* organelo viejo */}
      {recicla < 1 ? <MitoMini p={[0, 0, 0]} vieja op={1 - recicla} escala={1 - recicla * 0.5} rot={0.3} /> : null}
      {/* fagoforo: dos casquetes (membrana doble) que se cierran desde atras hacia la camara */}
      {[R, R * 0.9].map((r, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[r, 40, 30, 0, Math.PI * 2, Math.PI - theta, theta]} />
          <meshPhysicalMaterial
            color={mezcla ? "#7ad8a0" : "#9fd8ff"}
            emissive={mezcla ? "#47d18c" : "#43e0ff"}
            emissiveIntensity={0.25 + 0.4 * recicla}
            transparent
            opacity={i === 0 ? 0.45 : 0.3}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
      {/* lisosoma */}
      {fusion < 1 ? (
        <mesh position={lis} scale={mix(1, 0.6, fusion)}>
          <sphereGeometry args={[0.32, 24, 18]} />
          <meshPhysicalMaterial color="#47d18c" emissive="#47d18c" emissiveIntensity={0.4} transparent opacity={0.75} />
        </mesh>
      ) : null}
      {/* piezas recicladas que salen */}
      {recicla > 0
        ? Array.from({ length: 14 }).map((_, i) => {
            const d: V3 = [(rnd(`af${i}`) - 0.5) * 3.2, (rnd(`ag${i}`) - 0.5) * 3.2, (rnd(`ah${i}`) - 0.3) * 1.2];
            return <Esfera key={i} p={mix3([0, 0, 0], d, recicla)} r={0.06} color={[K.lima, K.cian, K.amarillo, K.morado][i % 4]} brillo={0.6} op={Math.min(1, recicla * 3)} />;
          })
        : null}
    </group>
  );
};

/** Celula grande en corte (citoplasma translucido + nucleo). */
export const CelulaCorte: React.FC<{ r?: number }> = ({ r = 2.4 }) => (
  <group>
    <mesh scale={[1, 1.15, 0.6]}>
      <sphereGeometry args={[r, 48, 36]} />
      <meshPhysicalMaterial color="#2a7f8f" emissive="#43e0ff" emissiveIntensity={0.06} transparent opacity={0.18} roughness={0.2} clearcoat={0.8} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
    <mesh position={[-r * 0.35, r * 0.55, -0.6]}>
      <sphereGeometry args={[r * 0.3, 32, 24]} />
      <meshPhysicalMaterial color="#7b5cd6" emissive="#7b5cd6" emissiveIntensity={0.25} transparent opacity={0.85} roughness={0.4} />
    </mesh>
  </group>
);
