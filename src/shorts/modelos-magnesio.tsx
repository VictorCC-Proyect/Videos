// Modelos 3D del short de magnesio: ion Mg2+, Mg-ATP, reticulo sarcoplasmico con
// bombas SERCA, frasco de suplemento y alimentos ricos en magnesio.
import React from "react";
import * as THREE from "three";
import { mix, V3 } from "../fisio/motor";
import { rnd, Tubo } from "../fisio/modelos/comun";
import { Enlace, Esfera, MoleculaATP } from "../fisio/modelos/energia";
import { K } from "./marco";

export const MG = "#5dffc4";
export const CA = "#2fe6ff";
export const RETICULO = "#4f8dff";

// ---- Iones -----------------------------------------------------------------------

/** Ion de magnesio: esfera verde menta brillante con halo. */
export const IonMg: React.FC<{ p: V3; r?: number; brillo?: number; op?: number }> = ({ p, r = 0.12, brillo = 1, op = 1 }) => (
  <group position={p}>
    <mesh>
      <sphereGeometry args={[r, 24, 18]} />
      <meshPhysicalMaterial color={MG} emissive={MG} emissiveIntensity={0.6 + brillo} roughness={0.2} clearcoat={1} transparent={op < 1} opacity={op} />
    </mesh>
    <mesh>
      <sphereGeometry args={[r * 2.1, 16, 12]} />
      <meshBasicMaterial color={MG} transparent opacity={0.2 * op} depthWrite={false} />
    </mesh>
  </group>
);

/** Ion de calcio (cian, pequeno). */
export const IonCa: React.FC<{ p: V3; r?: number; op?: number }> = ({ p, r = 0.055, op = 1 }) => (
  <group position={p}>
    <mesh>
      <sphereGeometry args={[r, 12, 10]} />
      <meshStandardMaterial color={CA} emissive={CA} emissiveIntensity={1.8} transparent={op < 1} opacity={op} />
    </mesh>
    <mesh>
      <sphereGeometry args={[r * 2.2, 10, 8]} />
      <meshBasicMaterial color={CA} transparent opacity={0.18 * op} depthWrite={false} />
    </mesh>
  </group>
);

/** Posicion del Mg2+ cuando esta unido entre los fosfatos beta y gamma del ATP. */
export const MG_EN_ATP: V3 = [1.0, -0.5, 0.05];

/**
 * ATP con su ion de magnesio. une 0..1 acerca el Mg2+ desde fuera hasta quedar
 * coordinado con los fosfatos beta y gamma (enlaces punteados).
 */
export const MgATP: React.FC<{ une?: number; brillo?: number }> = ({ une = 1, brillo = 0 }) => {
  const mg = [mix(1.0, MG_EN_ATP[0], une), mix(-2.0, MG_EN_ATP[1], une), mix(0.6, MG_EN_ATP[2], une)] as V3;
  const fos: V3[] = [
    [0.75, -0.1, 0],
    [1.25, -0.1, 0],
  ];
  return (
    <group>
      <MoleculaATP resalta={une > 0.9 ? "fosfatos" : null} energia={brillo} />
      <IonMg p={mg} r={0.17} brillo={0.6 + une * 0.6} />
      {une > 0.9
        ? fos.map((f, i) => <Enlace key={i} a={mg} b={f} r={0.022} color={MG} brillo={1.2} op={(une - 0.9) * 10 * 0.8} />)
        : null}
    </group>
  );
};

// ---- Reticulo sarcoplasmico alrededor de un sarcomero vertical -------------------

/** Altura de las cisternas terminales (cerca de las uniones A-I). */
export const CISTERNAS = [-1.35, 1.35];
export const R_RETICULO = 1.15;

/** Bombas SERCA (posiciones sobre la cara frontal del reticulo). */
export const BOMBAS: V3[] = [-0.6, -0.2, 0.2, 0.6].flatMap((y, i) => {
  const a = (i % 2 ? 0.35 : -0.35) + Math.PI / 2;
  return [[Math.cos(a) * R_RETICULO, y * 1.2, Math.sin(a) * R_RETICULO] as V3];
});

/** Funda de tubulos azules (reticulo) con dos cisternas terminales. */
export const Reticulo: React.FC<{ brillo?: number; op?: number }> = ({ brillo = 0, op = 0.75 }) => (
  <group>
    {Array.from({ length: 12 }).map((_, k) => {
      const a = (k / 12) * Math.PI * 2;
      const pts: V3[] = Array.from({ length: 9 }).map((__, j) => {
        const t = j / 8;
        const aa = a + Math.sin(t * Math.PI * 2 + k) * 0.1;
        return [Math.cos(aa) * R_RETICULO, mix(CISTERNAS[0], CISTERNAS[1], t), Math.sin(aa) * R_RETICULO];
      });
      return <Tubo key={k} puntos={pts} radio={0.035} color={RETICULO} emisivo={0.2 + brillo * 0.6} opacidad={op} segmentos={32} />;
    })}
    {CISTERNAS.map((y) => (
      <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R_RETICULO, 0.12, 16, 64]} />
        <meshPhysicalMaterial
          color={RETICULO}
          emissive={RETICULO}
          emissiveIntensity={0.25 + brillo}
          transparent
          opacity={Math.min(1, op + 0.15)}
          roughness={0.25}
          clearcoat={0.6}
        />
      </mesh>
    ))}
  </group>
);

/** Bomba SERCA: canal incrustado en el reticulo; activa muestra su Mg-ATP. */
export const Serca: React.FC<{ p: V3; activa?: number }> = ({ p, activa = 0 }) => {
  const dir = new THREE.Vector3(p[0], 0, p[2]).normalize();
  const rotY = Math.atan2(dir.x, dir.z);
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.32, 20]} />
        <meshPhysicalMaterial color="#ffd23f" emissive="#ffb21f" emissiveIntensity={0.25 + activa * 0.9} roughness={0.3} clearcoat={0.6} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.08, 0.025, 8, 20]} />
        <meshStandardMaterial color="#1a2a30" />
      </mesh>
      {activa > 0 ? (
        <group position={[0.2, -0.12, 0.12]}>
          <Esfera p={[0, 0, 0]} r={0.06} color="#4f8dff" brillo={0.4} op={Math.min(1, activa * 2)} />
          <Esfera p={[0.09, 0, 0]} r={0.04} color="#ff9a2e" brillo={0.5} op={Math.min(1, activa * 2)} />
          <Esfera p={[0.17, 0, 0]} r={0.04} color="#ff9a2e" brillo={0.5} op={Math.min(1, activa * 2)} />
          <IonMg p={[0.13, -0.08, 0.02]} r={0.045} brillo={1} op={Math.min(1, activa * 2)} />
        </group>
      ) : null}
    </group>
  );
};

// ---- Suplemento ------------------------------------------------------------------

export const Capsula: React.FC<{ p: V3; rot?: V3; escala?: number }> = ({ p, rot = [0, 0, 0], escala = 1 }) => (
  <group position={p} rotation={rot} scale={escala}>
    <mesh position={[0, 0.05, 0]}>
      <capsuleGeometry args={[0.06, 0.1, 8, 16]} />
      <meshPhysicalMaterial color="#f4f7f2" clearcoat={1} roughness={0.15} />
    </mesh>
    <mesh position={[0, -0.04, 0]}>
      <capsuleGeometry args={[0.062, 0.08, 8, 16]} />
      <meshPhysicalMaterial color={MG} emissive={MG} emissiveIntensity={0.2} clearcoat={1} roughness={0.15} />
    </mesh>
  </group>
);

export const Frasco: React.FC<{ p: V3; escala?: number }> = ({ p, escala = 1 }) => (
  <group position={p} scale={escala}>
    <mesh position={[0, 0.45, 0]}>
      <cylinderGeometry args={[0.32, 0.32, 0.9, 40]} />
      <meshPhysicalMaterial color="#e9f2ef" roughness={0.25} clearcoat={0.8} />
    </mesh>
    <mesh position={[0, 0.42, 0]}>
      <cylinderGeometry args={[0.325, 0.325, 0.42, 40, 1, true]} />
      <meshStandardMaterial color="#0f3a3a" emissive={MG} emissiveIntensity={0.15} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 0.42, 0.33]}>
      <circleGeometry args={[0.11, 24]} />
      <meshStandardMaterial color={MG} emissive={MG} emissiveIntensity={0.7} />
    </mesh>
    <mesh position={[0, 0.96, 0]}>
      <cylinderGeometry args={[0.22, 0.22, 0.14, 32]} />
      <meshPhysicalMaterial color="#2a3f45" roughness={0.4} clearcoat={0.5} />
    </mesh>
  </group>
);

// ---- Alimentos ---------------------------------------------------------------------

/** Montoncito de semillas de calabaza (pepitas verdes, aplanadas). */
export const Pepitas: React.FC<{ p: V3; escala?: number }> = ({ p, escala = 1 }) => (
  <group position={p} scale={escala}>
    {Array.from({ length: 26 }).map((_, i) => {
      const a = rnd(`pp${i}`) * Math.PI * 2;
      const r = Math.sqrt(rnd(`pr${i}`)) * 0.3;
      return (
        <mesh
          key={i}
          position={[Math.cos(a) * r, 0.04 + (0.3 - r) * 0.25 + rnd(`ph${i}`) * 0.03, Math.sin(a) * r]}
          rotation={[rnd(`pa${i}`) * 0.8, a, rnd(`pb${i}`) * 0.8]}
          scale={[0.075, 0.02, 0.045]}
        >
          <sphereGeometry args={[1, 14, 10]} />
          <meshStandardMaterial color={i % 4 ? "#5f8f3e" : "#79a84e"} roughness={0.55} />
        </mesh>
      );
    })}
  </group>
);

/** Nueces: mitades rugosas color madera. */
export const Nueces: React.FC<{ p: V3; escala?: number }> = ({ p, escala = 1 }) => (
  <group position={p} scale={escala}>
    {Array.from({ length: 7 }).map((_, i) => {
      const a = (i / 7) * Math.PI * 2;
      const r = i === 6 ? 0 : 0.18;
      const c: V3 = [Math.cos(a) * r, i === 6 ? 0.14 : 0.07, Math.sin(a) * r];
      return (
        <group key={i} position={c} rotation={[rnd(`nr${i}`), a, 0]}>
          {[-1, 1].map((l) => (
            <mesh key={l} position={[l * 0.035, 0, 0]} scale={[0.05, 0.05, 0.075]}>
              <sphereGeometry args={[1, 10, 8]} />
              <meshStandardMaterial color="#b9844a" roughness={0.85} flatShading />
            </mesh>
          ))}
        </group>
      );
    })}
  </group>
);

/** Barra de cacao/chocolate oscuro con cuadros. */
export const Cacao: React.FC<{ p: V3; escala?: number; giro?: number }> = ({ p, escala = 1, giro = 0.3 }) => (
  <group position={p} scale={escala} rotation={[0, giro, 0]}>
    <mesh position={[0, 0.03, 0]}>
      <boxGeometry args={[0.62, 0.04, 0.42]} />
      <meshPhysicalMaterial color="#3b2014" roughness={0.35} clearcoat={0.5} />
    </mesh>
    {Array.from({ length: 12 }).map((_, i) => (
      <mesh key={i} position={[-0.23 + (i % 4) * 0.153, 0.065, -0.135 + Math.floor(i / 4) * 0.135]}>
        <boxGeometry args={[0.13, 0.04, 0.115]} />
        <meshPhysicalMaterial color="#4a2818" roughness={0.3} clearcoat={0.6} />
      </mesh>
    ))}
    {/* granos de cacao */}
    {[
      [0.36, 0.06, 0.18],
      [0.4, 0.06, 0.02],
    ].map((q, i) => (
      <mesh key={i} position={q as V3} rotation={[0, i, 0]} scale={[0.07, 0.04, 0.045]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color="#6b3a22" roughness={0.6} />
      </mesh>
    ))}
  </group>
);

/** Espinaca: varias hojas verde oscuro con nervio central. */
export const Espinaca: React.FC<{ p: V3; escala?: number }> = ({ p, escala = 1 }) => (
  <group position={p} scale={escala}>
    {Array.from({ length: 7 }).map((_, i) => {
      const a = (i / 7) * Math.PI * 2;
      return (
        <group key={i} position={[Math.cos(a) * 0.14, 0.04 + i * 0.012, Math.sin(a) * 0.14]} rotation={[0, -a, 0.18]}>
          <mesh scale={[0.2, 0.02, 0.12]}>
            <sphereGeometry args={[1, 20, 12]} />
            <meshStandardMaterial color={i % 2 ? "#2f7d32" : "#3a9440"} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.018, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.006, 0.006, 0.36, 6]} />
            <meshStandardMaterial color="#9ad37a" />
          </mesh>
        </group>
      );
    })}
  </group>
);

/** Granos enteros: avena/trigo en monton + espigas. */
export const Granos: React.FC<{ p: V3; escala?: number }> = ({ p, escala = 1 }) => (
  <group position={p} scale={escala}>
    {Array.from({ length: 40 }).map((_, i) => {
      const a = rnd(`gr${i}`) * Math.PI * 2;
      const r = Math.sqrt(rnd(`gq${i}`)) * 0.3;
      return (
        <mesh
          key={i}
          position={[Math.cos(a) * r, 0.035 + (0.3 - r) * 0.3, Math.sin(a) * r]}
          rotation={[rnd(`ga${i}`) * 3, rnd(`gb${i}`) * 3, 0]}
          scale={[0.04, 0.022, 0.022]}
        >
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color={i % 3 ? "#d9b26a" : "#c49450"} roughness={0.7} />
        </mesh>
      );
    })}
    {[-0.12, 0.05, 0.18].map((x, i) => (
      <group key={i} position={[x, 0.3, -0.18]} rotation={[0, 0, (i - 1) * 0.3]}>
        <mesh position={[0, -0.12, 0]}>
          <cylinderGeometry args={[0.008, 0.01, 0.3, 6]} />
          <meshStandardMaterial color="#c9a24a" />
        </mesh>
        {Array.from({ length: 8 }).map((_, k) => (
          <mesh key={k} position={[(k % 2 ? 1 : -1) * 0.022, 0.04 + Math.floor(k / 2) * 0.04, 0]} rotation={[0, 0, (k % 2 ? -1 : 1) * 0.5]}>
            <capsuleGeometry args={[0.016, 0.03, 4, 8]} />
            <meshStandardMaterial color="#e2b65a" roughness={0.6} />
          </mesh>
        ))}
      </group>
    ))}
  </group>
);

/** Colores de apoyo. */
export const COLOR_ALIMENTO = { pepitas: "#79a84e", nueces: "#d9a066", cacao: "#a0623e", frijoles: K.naranja, espinaca: "#47d18c", granos: "#e2b65a" };
