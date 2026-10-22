// Modelos 3D compartidos por los shorts de sistemas de energia (partes 1 y 2).
import React from "react";
import * as THREE from "three";
import { entre, mix3, V3 } from "../fisio/motor";
import { Cadena, Enlace, Esfera, GotaLipido, MitocondriaGrande, Mol } from "../fisio/modelos/energia";
import { Creatina, MiniATP } from "../fisio/energia/e1";
import { K } from "./marco";

// ---- Parte 2 (sistema aerobico) ------------------------------------------------

/** Molecula de O2: dos oxigenos cian unidos. */
export const O2Mol: React.FC<{ p: V3; escala?: number; op?: number; giro?: number }> = ({ p, escala = 1, op = 1, giro = 0 }) => (
  <group position={p} scale={escala} rotation={[0, 0, giro]}>
    <Esfera p={[-0.075, 0, 0]} r={0.085} color="#43e0ff" brillo={0.6} op={op} />
    <Esfera p={[0.075, 0, 0]} r={0.085} color="#43e0ff" brillo={0.6} op={op} />
    <mesh>
      <sphereGeometry args={[0.2, 12, 10]} />
      <meshBasicMaterial color="#43e0ff" transparent opacity={0.14 * op} depthWrite={false} />
    </mesh>
  </group>
);

/** Acetil-CoA: grupo acetilo de 2 carbonos + "cola" de coenzima A (morada). */
export const AcetilCoA: React.FC<{ p: V3; escala?: number; op?: number; cola?: number; brillo?: number }> = ({
  p,
  escala = 1,
  op = 1,
  cola = 1,
  brillo = 0.4,
}) => {
  const tail: V3[] = Array.from({ length: 4 }).map((_, i) => [0.28 + i * 0.12, Math.sin(i * 1.4) * 0.06 - 0.02, 0]);
  return (
    <group position={p} scale={escala}>
      <Esfera p={[-0.08, 0, 0]} r={0.08} color="#ffb000" brillo={brillo} op={op} />
      <Esfera p={[0.08, 0.04, 0]} r={0.08} color="#ffb000" brillo={brillo} op={op} />
      <Enlace a={[-0.08, 0, 0]} b={[0.08, 0.04, 0]} r={0.022} op={op} />
      {cola > 0.02 ? (
        <group scale={cola}>
          <Enlace a={[0.08, 0.04, 0]} b={tail[0]} r={0.018} color="#d6b8ff" op={op} />
          {tail.map((q, i) => (
            <Esfera key={i} p={q} r={i === 3 ? 0.075 : 0.045} color="#b48cff" brillo={0.35} op={op} />
          ))}
          {tail.slice(0, -1).map((q, i) => (
            <Enlace key={`e${i}`} a={q} b={tail[i + 1]} r={0.016} color="#d6b8ff" op={op} />
          ))}
        </group>
      ) : null}
    </group>
  );
};

/** Flechas (conos) repartidas sobre un circulo que giran con el ciclo. */
export const FlechasCiclo: React.FC<{ R?: number; giro: number; n?: number; color?: string }> = ({ R = 1.6, giro, n = 8, color = "#9fd8ff" }) => (
  <group rotation={[0, 0, -giro]}>
    {Array.from({ length: n }).map((_, i) => {
      const a = ((i + 0.5) / n) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.cos(a) * R, Math.sin(a) * R, 0]} rotation={[0, 0, a + Math.PI]}>
          <coneGeometry args={[0.07, 0.2, 12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
        </mesh>
      );
    })}
  </group>
);

/** Electron portado (NADH = cian, FADH2 = verde) con su chispa amarilla. */
export const Portador: React.FC<{ p: V3; color?: string; op?: number; t?: number }> = ({ p, color = "#5ec8ff", op = 1, t = 0 }) => (
  <group position={p}>
    <Esfera p={[0, 0, 0]} r={0.11} color={color} brillo={0.5} op={op} />
    <Mol p={[Math.cos(t * 9) * 0.17, Math.sin(t * 9) * 0.17, 0.05]} color="#ffe14d" r={0.05} op={op} brillo={1.4} />
  </group>
);

/** Medio aguacate: pulpa verde con hueso. */
export const Aguacate: React.FC<{ p: V3; escala?: number; giro?: number }> = ({ p, escala = 1, giro = 0 }) => (
  <group position={p} scale={escala} rotation={[0, giro, 0]}>
    <mesh scale={[0.22, 0.09, 0.3]}>
      <sphereGeometry args={[1, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshPhysicalMaterial color="#2f5d1e" roughness={0.6} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.205, 0.285, 1]}>
      <circleGeometry args={[1, 32]} />
      <meshStandardMaterial color="#cde67a" roughness={0.5} />
    </mesh>
    <mesh position={[0, 0.03, -0.04]} scale={[0.085, 0.07, 0.09]}>
      <sphereGeometry args={[1, 20, 14]} />
      <meshPhysicalMaterial color="#7a4a24" clearcoat={0.6} roughness={0.3} />
    </mesh>
  </group>
);

/** Capsula de vitamina (dos mitades de color). */
export const Capsula: React.FC<{ p: V3; escala?: number; rot?: V3; color?: string }> = ({ p, escala = 1, rot = [0, 0, 1.2], color = "#ff8a3d" }) => (
  <group position={p} scale={escala} rotation={rot}>
    <mesh position={[0, 0.05, 0]}>
      <capsuleGeometry args={[0.045, 0.1, 8, 16]} />
      <meshPhysicalMaterial color={color} clearcoat={1} roughness={0.15} />
    </mesh>
    <mesh position={[0, -0.05, 0]}>
      <capsuleGeometry args={[0.046, 0.1, 8, 16]} />
      <meshPhysicalMaterial color="#fff4d6" clearcoat={1} roughness={0.15} />
    </mesh>
  </group>
);

/** Hierro: esfera roja metalica. */
export const Hierro: React.FC<{ p: V3; r?: number; brillo?: number }> = ({ p, r = 0.12, brillo = 0.2 }) => (
  <mesh position={p}>
    <sphereGeometry args={[r, 32, 24]} />
    <meshPhysicalMaterial color="#b3262e" emissive="#ff3b3b" emissiveIntensity={brillo} metalness={0.85} roughness={0.25} clearcoat={1} />
  </mesh>
);

/** Columna-medidor de un sistema energetico (nivel 0..1). */
export const Columna: React.FC<{ p: V3; nivel: number; color: string; alto?: number; r?: number }> = ({ p, nivel, color, alto = 2, r = 0.22 }) => {
  const h = Math.max(0.02, alto * nivel);
  return (
    <group position={p}>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[r * 1.5, r * 1.6, 0.08, 40]} />
        <meshStandardMaterial color="#2b3f45" />
      </mesh>
      <mesh position={[0, 0.08 + h / 2, 0]}>
        <cylinderGeometry args={[r, r, h, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35 + 0.6 * nivel} />
      </mesh>
      <mesh position={[0, 0.08 + alto / 2, 0]}>
        <cylinderGeometry args={[r * 1.25, r * 1.25, alto, 32, 1, true]} />
        <meshPhysicalMaterial color="#cfefff" transparent opacity={0.18} roughness={0.05} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
};

// ---- Parte 1 (sistemas rapidos) -------------------------------------------------

export const VERDE_PCR = "#47d18c";
export const GLUCOSA_C = "#ffd166";
export const LACTATO_C = "#ff8fd0";

/** Halo de color detras de un "motor" (se enciende con act). */
export const HaloMotor: React.FC<{ color: string; act: number; r?: number }> = ({ color, act, r = 0.8 }) => (
  <mesh position={[0, 0, -0.4]}>
    <sphereGeometry args={[r, 32, 24]} />
    <meshBasicMaterial color={color} transparent opacity={0.03 + 0.12 * act} depthWrite={false} />
  </mesh>
);

/** Motor 1 (fosfagenos): la fosfocreatina cede su fosfato al ADP -> ATP (ciclo c 0..1). */
export const MotorFosfagenos: React.FC<{ c: number; act?: number }> = ({ c, act = 1 }) => {
  const op = 0.35 + 0.65 * act;
  const viaja = entre(c, 0.15, 0.55);
  const sale = entre(c, 0.6, 1);
  const fos: V3 = mix3([0.15, -0.13, 0.05], [0.37, -0.5, 0.05], viaja);
  return (
    <group>
      <HaloMotor color={VERDE_PCR} act={act} />
      <Creatina p={[-0.45, 0.05, 0]} fosfato={c < 0.15 ? 1 : 0} escala={3} op={op} />
      {c >= 0.15 && c < 0.58 ? <Esfera p={fos} r={0.2} color="#ff9a2e" brillo={0.6 + act} op={op} /> : null}
      {c < 0.58 ? (
        <MiniATP p={[-0.3, -0.5, 0]} n={2} escala={2.4} op={op} brillo={0.3} />
      ) : (
        <MiniATP p={[-0.3 + sale * 0.5, -0.5 + sale * 1.0, 0.2]} n={3} escala={2.4} op={op * (1 - sale * 0.8)} brillo={0.4 + act} />
      )}
    </group>
  );
};

/** Motor 2 (glucolisis): glucosa (anillo de 6 C) -> 2 piruvatos (3 C) + ATP. */
export const MotorGlucolisis: React.FC<{ c: number; act?: number }> = ({ c, act = 1 }) => {
  const op = 0.35 + 0.65 * act;
  const parte = entre(c, 0.35, 0.65);
  const fade = 1 - entre(c, 0.85, 1);
  return (
    <group>
      <HaloMotor color={GLUCOSA_C} act={act} />
      {parte < 0.05 ? (
        <Cadena n={6} anillo p={[0, 0, 0]} color={GLUCOSA_C} sep={0.22} op={op} brillo={0.3 + act * 0.4} />
      ) : (
        <>
          <Cadena n={3} p={mix3([-0.2, 0.1, 0], [-0.7, 0.3, 0], parte)} color={K.naranja} sep={0.22} op={op * fade} brillo={0.4} />
          <Cadena n={3} p={mix3([-0.2, -0.1, 0], [0.1, -0.45, 0], parte)} color={K.naranja} sep={0.22} op={op * fade} brillo={0.4} />
          <MiniATP p={mix3([0, 0, 0.1], [0.35, 0.55, 0.2], parte)} escala={2 * parte} op={op * fade} brillo={0.4 + act} />
          <MiniATP p={mix3([0, 0, 0.1], [-0.45, -0.6, 0.2], parte)} escala={2 * parte} op={op * fade} brillo={0.4 + act} />
        </>
      )}
    </group>
  );
};

/** Motor 3 (aerobico): mitocondria con acidos grasos y piruvato entrando. */
export const MotorAerobico: React.FC<{ c: number; act?: number }> = ({ c, act = 1 }) => {
  const op = 0.35 + 0.65 * act;
  const f2 = (c + 0.5) % 1;
  return (
    <group>
      <HaloMotor color={K.naranja} act={act} r={1.1} />
      <group scale={0.42}>
        <MitocondriaGrande op={op} brillo={act * 0.3} />
      </group>
      <GotaLipido p={[-1.15, 0.2, 0.2]} r={0.24} op={op} />
      <Cadena n={6} p={mix3([-1.2, 0.1, 0.3], [-0.55, 0, 0.3], c)} color="#ffd34d" sep={0.1} op={op * (1 - c * 0.7)} brillo={0.4} />
      <Cadena n={3} p={mix3([1.0, 0.45, 0.3], [0.35, 0.05, 0.3], f2)} color={K.naranja} sep={0.12} op={op * (1 - f2 * 0.7)} brillo={0.4} />
      <MiniATP p={[0.2 + c * 0.3, 0.3 + c * 0.6, 0.4]} escala={1.8} op={op * (1 - c)} brillo={0.4 + act} />
    </group>
  );
};

/** Pista de atletismo ovalada (eje largo en Z), plana sobre y = 0. */
export const Pista: React.FC<{ rx?: number; rz?: number; ancho?: number; carriles?: number }> = ({ rx = 1.4, rz = 2.9, ancho = 0.7, carriles = 4 }) => {
  const anillo = (a: number, w: number) => {
    const s = new THREE.Shape();
    s.absellipse(0, 0, rx + a + w, rz + a + w, 0, Math.PI * 2, false, 0);
    const h = new THREE.Path();
    h.absellipse(0, 0, rx + a, rz + a, 0, Math.PI * 2, true, 0);
    s.holes.push(h);
    return new THREE.ShapeGeometry(s, 96);
  };
  const geo = React.useMemo(() => ({ pista: anillo(0, ancho), lineas: Array.from({ length: carriles + 1 }).map((_, i) => anillo((i * ancho) / carriles - 0.008, 0.016)) }), [rx, rz, ancho, carriles]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh position={[0, 0, -0.01]}>
        <circleGeometry args={[1, 64]} />
        <meshStandardMaterial color="#0d2a2f" />
      </mesh>
      <mesh scale={[rx, rz, 1]} position={[0, 0, -0.005]}>
        <circleGeometry args={[1, 64]} />
        <meshStandardMaterial color="#1f6b3a" roughness={0.9} />
      </mesh>
      <mesh geometry={geo.pista}>
        <meshStandardMaterial color="#b5452f" roughness={0.85} />
      </mesh>
      {geo.lineas.map((g, i) => (
        <mesh key={i} geometry={g} position={[0, 0, 0.004]}>
          <meshBasicMaterial color="#f4f7f2" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
};

/** Punto y orientacion (rotacion Y) de un corredor en la pista; u = vueltas (0..1 = 400 m). */
export const enPista = (u: number, rx: number, rz: number): { p: V3; rot: number } => {
  const a = u * Math.PI * 2;
  const p: V3 = [rx * Math.cos(a), 0, -rz * Math.sin(a)];
  const d: V3 = [-rx * Math.sin(a), 0, -rz * Math.cos(a)];
  return { p, rot: Math.atan2(d[0], d[2]) };
};
