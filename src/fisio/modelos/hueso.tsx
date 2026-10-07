import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../motor";
import { C } from "../tema";
import { rnd, Tubo } from "./comun";

// ---- Hueso largo con corte ----------------------------------------------

const PERFIL: [number, number][] = [
  [0.001, -2.15],
  [0.3, -2.12],
  [0.5, -2.0],
  [0.58, -1.8],
  [0.55, -1.55],
  [0.4, -1.3],
  [0.3, -1.0],
  [0.27, -0.5],
  [0.26, 0],
  [0.27, 0.5],
  [0.3, 1.0],
  [0.4, 1.3],
  [0.55, 1.55],
  [0.58, 1.8],
  [0.5, 2.0],
  [0.3, 2.12],
  [0.001, 2.15],
];

const radioEn = (y: number) => {
  for (let i = 0; i < PERFIL.length - 1; i++) {
    const [r0, y0] = PERFIL[i];
    const [r1, y1] = PERFIL[i + 1];
    if (y >= y0 && y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
  }
  return 0;
};

export const HuesoLargo: React.FC<{
  corte?: number; // 0 = entero, 1 = corte de un cuarto
  cartilago?: number;
  periostio?: number;
  resalta?: "compacto" | "esponjoso" | "medula" | null;
}> = ({ corte = 0, cartilago = 1, periostio = 0, resalta = null }) => {
  const ang = corte * Math.PI * 0.5;
  const geo = useMemo(
    () =>
      new THREE.LatheGeometry(
        PERFIL.map(([r, y]) => new THREE.Vector2(r, y)),
        64,
        ang,
        Math.PI * 2 - ang,
      ),
    [ang],
  );
  const geoCart = useMemo(() => {
    const top = PERFIL.filter(([, y]) => y > 1.75).map(([r, y]) => new THREE.Vector2(r * 1.03, y + 0.02));
    return new THREE.LatheGeometry(top, 48, ang, Math.PI * 2 - ang);
  }, [ang]);
  const trab = useMemo(() => {
    const out: { p: V3; r: number }[] = [];
    for (let i = 0; i < 160; i++) {
      const y = (rnd(`ty${i}`) > 0.5 ? 1 : -1) * (1.2 + rnd(`tyy${i}`) * 0.85);
      const R = radioEn(Math.abs(y) * Math.sign(y)) * 0.82;
      const a = rnd(`ta${i}`) * Math.PI * 2;
      const r = Math.sqrt(rnd(`tr${i}`)) * R;
      out.push({ p: [Math.cos(a) * r, y, Math.sin(a) * r], r: 0.035 + rnd(`ts${i}`) * 0.03 });
    }
    return out;
  }, []);
  const glow = (k: string) => (resalta === k ? 0.6 : 0);
  return (
    <group>
      <mesh geometry={geo}>
        <meshPhysicalMaterial
          color={C.hueso}
          emissive={C.hueso}
          emissiveIntensity={glow("compacto") * 0.4}
          roughness={0.55}
          clearcoat={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      {cartilago > 0
        ? [1, -1].map((s) => (
            <mesh key={s} geometry={geoCart} scale={[1, s, 1]}>
              <meshPhysicalMaterial color={C.cartilago} transparent opacity={0.8 * cartilago} roughness={0.2} clearcoat={0.8} side={THREE.DoubleSide} />
            </mesh>
          ))
        : null}
      {periostio > 0 ? (
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 2.2, 48, 1, true, ang, Math.PI * 2 - ang]} />
          <meshPhysicalMaterial color="#ffb3a7" transparent opacity={0.45 * periostio} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ) : null}
      {corte > 0 ? (
        <>
          {/* canal medular con medula amarilla */}
          <mesh>
            <cylinderGeometry args={[0.17, 0.17, 2.3, 32]} />
            <meshStandardMaterial color={C.medulaAmarilla} emissive={C.medulaAmarilla} emissiveIntensity={0.15 + glow("medula")} />
          </mesh>
          {/* hueso esponjoso con medula roja en las epifisis */}
          {trab.map((t, i) => (
            <mesh key={i} position={t.p}>
              <sphereGeometry args={[t.r, 8, 6]} />
              <meshStandardMaterial
                color={i % 3 ? C.huesoOscuro : C.medulaRoja}
                emissive={i % 3 ? C.huesoOscuro : C.medulaRoja}
                emissiveIntensity={0.1 + glow("esponjoso")}
              />
            </mesh>
          ))}
          {/* lineas epifisarias */}
          {[1.3, -1.3].map((y) => (
            <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.05, radioEn(y) * 0.97, 32]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </>
      ) : null}
    </group>
  );
};

// ---- Osteona (sistema de Havers) ---------------------------------------

export const Osteona: React.FC<{ pos?: V3; escala?: number; capas?: number }> = ({
  pos = [0, 0, 0],
  escala = 1,
  capas = 5,
}) => (
  <group position={pos} scale={escala}>
    {Array.from({ length: capas }).map((_, i) => {
      const r = 0.18 + i * 0.13;
      return (
        <mesh key={i}>
          <cylinderGeometry args={[r, r, 2 - i * 0.12, 48, 1, true]} />
          <meshPhysicalMaterial
            color={i % 2 ? "#efe2c7" : "#e3cfa7"}
            roughness={0.6}
            side={THREE.DoubleSide}
            transparent
            opacity={0.92}
          />
        </mesh>
      );
    })}
    {/* conducto de Havers: arteria, vena y nervio */}
    <mesh position={[0.05, 0, 0]}>
      <cylinderGeometry args={[0.05, 0.05, 2.4, 12]} />
      <meshStandardMaterial color="#e3263a" emissive="#e3263a" emissiveIntensity={0.3} />
    </mesh>
    <mesh position={[-0.06, 0, 0.03]}>
      <cylinderGeometry args={[0.045, 0.045, 2.4, 12]} />
      <meshStandardMaterial color="#3a63e0" emissive="#3a63e0" emissiveIntensity={0.3} />
    </mesh>
    <mesh position={[0, 0, -0.07]}>
      <cylinderGeometry args={[0.025, 0.025, 2.4, 8]} />
      <meshStandardMaterial color={C.nervio} emissive={C.nervio} emissiveIntensity={0.4} />
    </mesh>
    {/* lagunas con osteocitos */}
    {Array.from({ length: 24 }).map((_, i) => {
      const capa = 1 + (i % (capas - 1));
      const r = 0.18 + capa * 0.13 - 0.06;
      const a = rnd(`ol${i}`) * Math.PI * 2;
      const y = (rnd(`oy${i}`) - 0.5) * 1.6;
      return (
        <mesh key={i} position={[Math.cos(a) * r, y, Math.sin(a) * r]} scale={[1, 0.5, 1]}>
          <sphereGeometry args={[0.035, 8, 6]} />
          <meshStandardMaterial color={C.osteocito} emissive={C.osteocito} emissiveIntensity={0.4} />
        </mesh>
      );
    })}
  </group>
);

/** Red trabecular (hueso esponjoso). */
export const Trabeculas: React.FC<{ pos?: V3; tam?: number; medula?: number }> = ({
  pos = [0, 0, 0],
  tam = 1.2,
  medula = 1,
}) => {
  const nodos = useMemo(
    () =>
      Array.from({ length: 34 }).map((_, i): V3 => [
        (rnd(`nx${i}`) - 0.5) * tam * 2,
        (rnd(`ny${i}`) - 0.5) * tam * 2,
        (rnd(`nz${i}`) - 0.5) * tam * 2,
      ]),
    [tam],
  );
  const aristas = useMemo(() => {
    const out: [number, number][] = [];
    nodos.forEach((a, i) => {
      const d = nodos
        .map((b, j) => ({ j, d: Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) }))
        .filter((x) => x.j !== i)
        .sort((x, y) => x.d - y.d)
        .slice(0, 3);
      d.forEach(({ j }) => {
        if (!out.some(([p, q]) => (p === j && q === i) || (p === i && q === j))) out.push([i, j]);
      });
    });
    return out;
  }, [nodos]);
  return (
    <group position={pos}>
      {aristas.map(([i, j], k) => (
        <Tubo key={k} puntos={[nodos[i], nodos[j]]} radio={0.06} color={C.hueso} segmentos={4} />
      ))}
      {nodos.map((n, i) => (
        <mesh key={i} position={n}>
          <sphereGeometry args={[0.09, 10, 8]} />
          <meshStandardMaterial color={C.hueso} />
        </mesh>
      ))}
      {medula > 0
        ? Array.from({ length: 40 }).map((_, i) => (
            <mesh
              key={`m${i}`}
              position={[(rnd(`mx${i}`) - 0.5) * tam * 1.8, (rnd(`my${i}`) - 0.5) * tam * 1.8, (rnd(`mz${i}`) - 0.5) * tam * 1.8]}
            >
              <sphereGeometry args={[0.05, 8, 6]} />
              <meshStandardMaterial color={C.medulaRoja} emissive={C.medulaRoja} emissiveIntensity={0.3} transparent opacity={medula} />
            </mesh>
          ))
        : null}
    </group>
  );
};

// ---- Celulas oseas ------------------------------------------------------

export const Osteoblasto: React.FC<{ pos: V3; aplanado?: number; brillo?: number; op?: number }> = ({
  pos,
  aplanado = 0,
  brillo = 0,
  op = 1,
}) => (
  <group position={pos} scale={[1 + aplanado * 0.6, 1 - aplanado * 0.75, 1 + aplanado * 0.3]}>
    <mesh position={[0, 0.2, 0]} scale={[0.23, 0.21, 0.23]}>
      <icosahedronGeometry args={[1, 1]} />
      <meshPhysicalMaterial
        color={aplanado > 0.5 ? "#9fd1ff" : C.osteoblasto}
        emissive={C.osteoblasto}
        emissiveIntensity={0.15 + brillo}
        roughness={0.35}
        clearcoat={0.5}
        transparent
        opacity={0.85 * op}
        depthWrite={false}
      />
    </mesh>
    <mesh position={[0, 0.27, 0]}>
      <sphereGeometry args={[0.1, 12, 10]} />
      <meshStandardMaterial color="#2b3f9e" transparent={op < 1} opacity={op} />
    </mesh>
  </group>
);

export const Osteocito: React.FC<{ pos: V3; brillo?: number; dendritas?: V3[] }> = ({
  pos,
  brillo = 0,
  dendritas = [],
}) => (
  <group>
    <mesh position={pos} scale={[1.4, 0.7, 1]}>
      <sphereGeometry args={[0.13, 16, 12]} />
      <meshStandardMaterial color={C.osteocito} emissive={C.osteocito} emissiveIntensity={0.3 + brillo} />
    </mesh>
    {dendritas.map((d, i) => (
      <Tubo key={i} puntos={[pos, [(pos[0] + d[0]) / 2 + 0.05, (pos[1] + d[1]) / 2, (pos[2] + d[2]) / 2], d]} radio={0.018} color={C.osteocito} emisivo={0.3 + brillo} segmentos={10} />
    ))}
  </group>
);

export const Osteoclasto: React.FC<{ pos: V3; op?: number; escala?: number; brillo?: number }> = ({
  pos,
  op = 1,
  escala = 1,
  brillo = 0,
}) =>
  op > 0.01 ? (
    <group position={pos} scale={escala}>
      <mesh position={[0, 0.3, 0]} scale={[1.6, 0.7, 1.1]}>
        <sphereGeometry args={[0.5, 32, 24]} />
        <meshPhysicalMaterial
          color={C.osteoclasto}
          emissive={C.osteoclasto}
          emissiveIntensity={0.15 + brillo}
          transparent
          opacity={0.8 * op}
          roughness={0.3}
          clearcoat={0.6}
          depthWrite={false}
        />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-0.5 + i * 0.2, 0.38 + (i % 2) * 0.06, (i % 3) * 0.1 - 0.1]}>
          <sphereGeometry args={[0.07, 10, 8]} />
          <meshStandardMaterial color="#3b1a6e" transparent opacity={op} />
        </mesh>
      ))}
      {/* borde en cepillo */}
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh key={`c${i}`} position={[-0.65 + i * 0.1, 0.02, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.14, 6]} />
          <meshStandardMaterial color="#e3b5ff" transparent opacity={op} />
        </mesh>
      ))}
    </group>
  ) : null;
