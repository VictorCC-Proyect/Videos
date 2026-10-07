import React from "react";
import { C } from "../tema";

// Figura humana procedural: huesos blancos dentro de musculo rojo translucido.

type SegProps = {
  largo: number;
  grosor: number;
  rot?: [number, number, number];
  pos?: [number, number, number];
  musculo: number;
  brilla?: number;
  children?: React.ReactNode;
};

const Segmento: React.FC<SegProps> = ({
  largo,
  grosor,
  rot = [0, 0, 0],
  pos = [0, 0, 0],
  musculo,
  brilla = 0,
  children,
}) => (
  <group position={pos} rotation={rot}>
    {/* hueso */}
    <mesh position={[0, -largo / 2, 0]}>
      <cylinderGeometry args={[grosor * 0.22, grosor * 0.22, largo * 0.92, 12]} />
      <meshStandardMaterial color={C.hueso} roughness={0.55} />
    </mesh>
    <mesh position={[0, -largo * 0.04, 0]}>
      <sphereGeometry args={[grosor * 0.34, 16, 12]} />
      <meshStandardMaterial color={C.hueso} roughness={0.55} />
    </mesh>
    {/* musculo */}
    {musculo > 0.01 ? (
      <mesh position={[0, -largo / 2, 0]} scale={[1, 1, 0.9]}>
        <capsuleGeometry args={[grosor, Math.max(0.01, largo - grosor * 1.4), 8, 20]} />
        <meshPhysicalMaterial
          color={C.musculo}
          emissive={C.musculoClaro}
          emissiveIntensity={brilla * 0.9}
          roughness={0.45}
          clearcoat={0.4}
          transparent
          opacity={musculo}
          depthWrite={musculo > 0.9}
        />
      </mesh>
    ) : null}
    <group position={[0, -largo, 0]}>{children}</group>
  </group>
);

export const Humano: React.FC<{
  fase?: number; // ciclo de marcha en radianes
  marcha?: number; // amplitud 0..1
  musculo?: number; // opacidad del musculo
  brillaMuslo?: number;
  pose?: {
    hombroI?: [number, number, number];
    hombroD?: [number, number, number];
    codoI?: number;
    codoD?: number;
    caderaI?: [number, number, number];
    caderaD?: [number, number, number];
    rodillaI?: number;
    rodillaD?: number;
    antebrazoD?: number; // pronacion/supinacion
  };
}> = ({ fase = 0, marcha = 0, musculo = 0.55, brillaMuslo = 0, pose = {} }) => {
  const s = Math.sin(fase) * marcha;
  const cD: [number, number, number] = pose.caderaD ?? [s * 0.55, 0, 0];
  const cI: [number, number, number] = pose.caderaI ?? [-s * 0.55, 0, 0];
  const rD = pose.rodillaD ?? Math.max(0, Math.sin(fase - 1.2)) * 0.9 * marcha;
  const rI = pose.rodillaI ?? Math.max(0, Math.sin(fase + Math.PI - 1.2)) * 0.9 * marcha;
  const hD: [number, number, number] = pose.hombroD ?? [-s * 0.45, 0, 0.12];
  const hI: [number, number, number] = pose.hombroI ?? [s * 0.45, 0, -0.12];
  const coD = pose.codoD ?? -0.25 - Math.max(0, -s) * 0.3;
  const coI = pose.codoI ?? -0.25 - Math.max(0, s) * 0.3;
  const sube = Math.abs(Math.cos(fase)) * 0.025 * marcha;
  return (
    <group position={[0, sube, 0]}>
      {/* cabeza y cuello */}
      <mesh position={[0, 1.66, 0]}>
        <sphereGeometry args={[0.105, 32, 24]} />
        <meshStandardMaterial color={C.hueso} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.67, 0]} scale={[1, 1.12, 1.05]}>
        <sphereGeometry args={[0.122, 32, 24]} />
        <meshPhysicalMaterial
          color={C.musculo}
          transparent
          opacity={musculo * 0.7}
          roughness={0.4}
          clearcoat={0.4}
          depthWrite={false}
        />
      </mesh>
      {/* columna */}
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh key={i} position={[0, 1.0 + i * 0.039, -0.035]}>
          <cylinderGeometry args={[0.022, 0.022, 0.03, 10]} />
          <meshStandardMaterial color={C.hueso} />
        </mesh>
      ))}
      {/* costillas */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh
          key={i}
          position={[0, 1.42 - i * 0.042, 0]}
          rotation={[Math.PI / 2 + 0.25, 0, 0]}
          scale={[1, 0.75, 1]}
        >
          <torusGeometry args={[0.13 - Math.abs(i - 3) * 0.006, 0.008, 6, 28]} />
          <meshStandardMaterial color={C.hueso} />
        </mesh>
      ))}
      {/* pelvis */}
      <mesh position={[0, 0.98, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.7, 1]}>
        <torusGeometry args={[0.1, 0.03, 10, 24]} />
        <meshStandardMaterial color={C.hueso} />
      </mesh>
      {/* tronco */}
      <mesh position={[0, 1.24, 0]} scale={[1, 1, 0.62]}>
        <capsuleGeometry args={[0.17, 0.4, 8, 24]} />
        <meshPhysicalMaterial
          color={C.musculo}
          transparent
          opacity={musculo * 0.75}
          roughness={0.45}
          clearcoat={0.4}
          depthWrite={false}
        />
      </mesh>
      {/* brazos */}
      {([1, -1] as const).map((lado) => (
        <group key={lado} position={[0.23 * lado, 1.47, 0]}>
          <Segmento
            largo={0.3}
            grosor={0.05}
            rot={lado > 0 ? hD : hI}
            musculo={musculo}
          >
            <Segmento
              largo={0.27}
              grosor={0.04}
              rot={[lado > 0 ? coD : coI, lado > 0 ? (pose.antebrazoD ?? 0) : 0, 0]}
              musculo={musculo}
            >
              <mesh position={[0, -0.05, 0]} scale={[1, 1.4, 0.45]}>
                <sphereGeometry args={[0.045, 16, 12]} />
                <meshPhysicalMaterial
                  color={C.musculo}
                  transparent
                  opacity={musculo}
                  roughness={0.5}
                />
              </mesh>
            </Segmento>
          </Segmento>
        </group>
      ))}
      {/* piernas */}
      {([1, -1] as const).map((lado) => (
        <group key={lado} position={[0.1 * lado, 0.95, 0]}>
          <Segmento
            largo={0.44}
            grosor={0.075}
            rot={lado > 0 ? cD : cI}
            musculo={musculo}
            brilla={lado > 0 ? brillaMuslo : 0}
          >
            <Segmento
              largo={0.43}
              grosor={0.055}
              rot={[lado > 0 ? rD : rI, 0, 0]}
              musculo={musculo}
            >
              <mesh position={[0, -0.02, 0.06]} scale={[0.8, 0.4, 1.8]}>
                <sphereGeometry args={[0.05, 16, 12]} />
                <meshPhysicalMaterial color={C.musculo} transparent opacity={musculo} />
              </mesh>
            </Segmento>
          </Segmento>
        </group>
      ))}
    </group>
  );
};
