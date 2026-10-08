import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../motor";
import { C } from "../tema";
import { rnd, Tubo } from "./comun";

// ---- Primitivas moleculares ---------------------------------------------

export const Esfera: React.FC<{
  p: V3;
  r: number;
  color: string;
  brillo?: number;
  op?: number;
}> = ({ p, r, color, brillo = 0.15, op = 1 }) => (
  <mesh position={p}>
    <sphereGeometry args={[r, 20, 16]} />
    <meshPhysicalMaterial
      color={color}
      emissive={color}
      emissiveIntensity={brillo}
      roughness={0.3}
      clearcoat={0.6}
      transparent={op < 1}
      opacity={op}
    />
  </mesh>
);

/** Cilindro entre dos puntos (enlace quimico). */
export const Enlace: React.FC<{ a: V3; b: V3; r?: number; color?: string; brillo?: number; op?: number }> = ({
  a,
  b,
  r = 0.03,
  color = "#d9e2f2",
  brillo = 0,
  op = 1,
}) => {
  const { pos, quat, largo } = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const d = vb.clone().sub(va);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    return { pos: va.add(vb).multiplyScalar(0.5), quat: q, largo: d.length() };
  }, [a, b]);
  return (
    <mesh position={pos} quaternion={quat}>
      <cylinderGeometry args={[r, r, largo, 10]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={brillo} transparent={op < 1} opacity={op} />
    </mesh>
  );
};

/** Grupo fosfato: P naranja con 4 oxigenos rojos. */
export const Fosfato: React.FC<{ p: V3; brillo?: number; op?: number; escala?: number }> = ({
  p,
  brillo = 0.2,
  op = 1,
  escala = 1,
}) => (
  <group position={p} scale={escala}>
    <Esfera p={[0, 0, 0]} r={0.16} color="#ff9a2e" brillo={brillo} op={op} />
    {(
      [
        [0.17, 0.08, 0],
        [-0.05, 0.17, 0.05],
        [0, -0.12, 0.13],
        [0, -0.08, -0.15],
      ] as V3[]
    ).map((o, i) => (
      <Esfera key={i} p={o} r={0.075} color="#ff4b4b" brillo={0.1} op={op} />
    ))}
  </group>
);

/**
 * Molecula de ATP: adenina (anillos), ribosa y 3 fosfatos en fila.
 * suelta (0..1) aleja el 3.er fosfato (ATP -> ADP + Pi) liberando energia.
 */
export const MoleculaATP: React.FC<{
  suelta?: number;
  energia?: number;
  resalta?: "adenina" | "ribosa" | "fosfatos" | null;
  fosfatos?: number;
}> = ({ suelta = 0, energia = 0, resalta = null, fosfatos = 3 }) => {
  const r = (k: string) => (resalta === k ? 0.9 : 0.15);
  const hex: V3[] = Array.from({ length: 6 }).map((_, i) => {
    const a = (i / 6) * Math.PI * 2;
    return [-1.55 + Math.cos(a) * 0.32, 0.25 + Math.sin(a) * 0.32, 0];
  });
  const pen: V3[] = Array.from({ length: 5 }).map((_, i) => {
    const a = (i / 5) * Math.PI * 2 + Math.PI;
    return [-1.0 + Math.cos(a) * 0.27, 0.35 + Math.sin(a) * 0.27, 0];
  });
  const rib: V3[] = Array.from({ length: 5 }).map((_, i) => {
    const a = (i / 5) * Math.PI * 2 + Math.PI / 2;
    return [-0.35 + Math.cos(a) * 0.28, -0.25 + Math.sin(a) * 0.28, 0];
  });
  const ps: V3[] = [
    [0.25, -0.1, 0],
    [0.75, -0.1, 0],
    [1.25 + suelta * 1.2, -0.1 + suelta * 0.5, 0],
  ];
  return (
    <group>
      {hex.map((p, i) => (
        <Esfera key={`h${i}`} p={p} r={0.1} color="#4f8dff" brillo={r("adenina")} />
      ))}
      {hex.map((p, i) => (
        <Enlace key={`he${i}`} a={p} b={hex[(i + 1) % 6]} color="#9fc0ff" />
      ))}
      {pen.map((p, i) => (
        <Esfera key={`p${i}`} p={p} r={0.1} color="#4f8dff" brillo={r("adenina")} />
      ))}
      {pen.map((p, i) => (
        <Enlace key={`pe${i}`} a={p} b={pen[(i + 1) % 5]} color="#9fc0ff" />
      ))}
      {rib.map((p, i) => (
        <Esfera key={`r${i}`} p={p} r={0.1} color="#47d18c" brillo={r("ribosa")} />
      ))}
      {rib.map((p, i) => (
        <Enlace key={`re${i}`} a={p} b={rib[(i + 1) % 5]} color="#a8f0c8" />
      ))}
      <Enlace a={pen[3]} b={rib[1]} />
      <Enlace a={rib[4]} b={ps[0]} />
      {ps.slice(0, fosfatos).map((p, i) => (
        <Fosfato key={i} p={p} brillo={r("fosfatos") + (i === 2 ? energia : 0)} />
      ))}
      {fosfatos > 1 ? <Enlace a={ps[0]} b={ps[1]} color="#ffd34d" brillo={0.6} r={0.035} /> : null}
      {fosfatos > 2 && suelta < 0.05 ? <Enlace a={ps[1]} b={ps[2]} color="#ffd34d" brillo={0.6 + energia} r={0.035} /> : null}
      {energia > 0 ? (
        <mesh position={[1.0 + suelta * 0.5, -0.1 + suelta * 0.25, 0]}>
          <sphereGeometry args={[0.25 + energia * 0.5, 24, 16]} />
          <meshBasicMaterial color="#fff2a8" transparent opacity={0.35 * energia * (1 - suelta * 0.6)} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Pequena etiqueta-molecula generica: esfera de color con halo. */
export const Mol: React.FC<{ p: V3; color: string; r?: number; op?: number; brillo?: number }> = ({
  p,
  color,
  r = 0.09,
  op = 1,
  brillo = 0.8,
}) => (
  <group position={p}>
    <Esfera p={[0, 0, 0]} r={r} color={color} brillo={brillo} op={op} />
    <mesh>
      <sphereGeometry args={[r * 1.9, 12, 10]} />
      <meshBasicMaterial color={color} transparent opacity={0.16 * op} depthWrite={false} />
    </mesh>
  </group>
);

/** Cadena de carbonos (glucosa, piruvato, acidos grasos...). */
export const Cadena: React.FC<{
  n: number;
  p?: V3;
  anillo?: boolean;
  color?: string;
  sep?: number;
  op?: number;
  brillo?: number;
}> = ({ n, p = [0, 0, 0], anillo = false, color = "#3a3a3a", sep = 0.2, op = 1, brillo = 0.1 }) => {
  const pts: V3[] = Array.from({ length: n }).map((_, i) => {
    if (anillo) {
      const a = (i / n) * Math.PI * 2;
      return [Math.cos(a) * sep * 1.1, Math.sin(a) * sep * 1.1, 0];
    }
    return [i * sep, i % 2 ? 0.08 : -0.08, 0];
  });
  return (
    <group position={p}>
      {pts.map((q, i) => (
        <Esfera key={i} p={q} r={sep * 0.42} color={color} brillo={brillo} op={op} />
      ))}
      {pts.map((q, i) =>
        i < n - 1 || anillo ? <Enlace key={`e${i}`} a={q} b={pts[(i + 1) % n]} r={0.025} op={op} /> : null,
      )}
    </group>
  );
};

// ---- Organulos y organos ------------------------------------------------

/** Mitocondria grande en corte, con crestas. */
export const MitocondriaGrande: React.FC<{ op?: number; brillo?: number; corte?: boolean }> = ({
  op = 1,
  brillo = 0,
  corte = true,
}) => (
  <group>
    <mesh rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.7]}>
      <capsuleGeometry args={[0.9, 2.2, 12, 32]} />
      <meshPhysicalMaterial
        color={C.mitocondria}
        emissive={C.mitocondria}
        emissiveIntensity={0.1 + brillo}
        transparent
        opacity={0.35 * op}
        roughness={0.3}
        clearcoat={0.5}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
    {corte
      ? Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} position={[-1.5 + i * 0.5, (i % 2 ? 0.3 : -0.3), 0]} scale={[0.12, 0.62, 0.5]}>
            <capsuleGeometry args={[0.5, 0.8, 8, 16]} />
            <meshPhysicalMaterial color="#ffc29a" emissive="#ff7b54" emissiveIntensity={0.2 + brillo} transparent opacity={0.85 * op} />
          </mesh>
        ))
      : null}
  </group>
);

/** Higado estilizado. */
export const Higado: React.FC<{ brillo?: number }> = ({ brillo = 0 }) => (
  <group>
    <mesh scale={[1.4, 0.7, 0.8]} rotation={[0, 0, -0.2]}>
      <sphereGeometry args={[1, 40, 28]} />
      <meshPhysicalMaterial color="#8a2f2a" emissive="#c2554a" emissiveIntensity={0.1 + brillo} roughness={0.4} clearcoat={0.5} />
    </mesh>
    <mesh position={[0.9, -0.2, 0.1]} scale={[0.7, 0.45, 0.6]}>
      <sphereGeometry args={[1, 32, 24]} />
      <meshPhysicalMaterial color="#7b2924" emissive="#c2554a" emissiveIntensity={0.1 + brillo} roughness={0.4} clearcoat={0.5} />
    </mesh>
  </group>
);

/** Vaso sanguineo con globulos rojos que fluyen. */
export const Vaso: React.FC<{ desde: V3; hasta: V3; t: number; radio?: number; comprime?: number }> = ({
  desde,
  hasta,
  t,
  radio = 0.25,
  comprime = 0,
}) => {
  const n = 10;
  const flujo = 1 - comprime;
  return (
    <group>
      <Tubo puntos={[desde, [(desde[0] + hasta[0]) / 2, (desde[1] + hasta[1]) / 2, (desde[2] + hasta[2]) / 2], hasta]} radio={radio * (1 - comprime * 0.75)} color="#c4162c" opacidad={0.45} segmentos={20} />
      {flujo > 0.05
        ? Array.from({ length: n }).map((_, i) => {
            const f = (i / n + t * flujo) % 1;
            const p: V3 = [
              desde[0] + (hasta[0] - desde[0]) * f,
              desde[1] + (hasta[1] - desde[1]) * f + Math.sin(i * 2) * radio * 0.3,
              desde[2] + (hasta[2] - desde[2]) * f,
            ];
            return (
              <mesh key={i} position={p} scale={[1, 0.45, 1]}>
                <sphereGeometry args={[radio * 0.35, 16, 12]} />
                <meshStandardMaterial color="#e3263a" emissive="#e3263a" emissiveIntensity={0.3} />
              </mesh>
            );
          })
        : null}
    </group>
  );
};

/** Pulmones estilizados (para la hiperventilacion). */
export const Pulmones: React.FC<{ respira: number }> = ({ respira }) => (
  <group scale={1 + respira * 0.08}>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * 0.55, 0, 0]} scale={[0.45, 0.8, 0.4]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshPhysicalMaterial color="#f29ba8" emissive="#ff8fa3" emissiveIntensity={0.15 + respira * 0.3} roughness={0.5} clearcoat={0.3} />
      </mesh>
    ))}
    <mesh position={[0, 0.95, 0]}>
      <cylinderGeometry args={[0.08, 0.08, 0.6, 12]} />
      <meshStandardMaterial color="#e6c7c7" />
    </mesh>
  </group>
);

// ---- Membrana mitocondrial interna con la cadena de transporte ----------

/** Bicapa lipidica: dos capas de cabezas esfericas. */
export const Membrana: React.FC<{ ancho?: number; prof?: number }> = ({ ancho = 8, prof = 2 }) => {
  const cabezas = useMemo(() => {
    const out: V3[] = [];
    for (let x = -ancho / 2; x <= ancho / 2; x += 0.22)
      for (let z = -prof / 2; z <= prof / 2; z += 0.22) {
        out.push([x, 0.28, z]);
        out.push([x, -0.28, z]);
      }
    return out;
  }, [ancho, prof]);
  const geo = useMemo(() => new THREE.SphereGeometry(0.1, 8, 6), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f7d9a8", roughness: 0.5 }), []);
  return (
    <group>
      {cabezas.map((p, i) => (
        <mesh key={i} position={p} geometry={geo} material={mat} />
      ))}
      <mesh>
        <boxGeometry args={[ancho, 0.45, prof]} />
        <meshStandardMaterial color="#e9b46a" transparent opacity={0.35} />
      </mesh>
    </group>
  );
};

export const Complejo: React.FC<{ p: V3; color: string; escala?: V3; brillo?: number }> = ({
  p,
  color,
  escala = [0.45, 0.75, 0.45],
  brillo = 0,
}) => (
  <mesh position={p} scale={escala}>
    <sphereGeometry args={[1, 28, 20]} />
    <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.15 + brillo} roughness={0.35} clearcoat={0.6} />
  </mesh>
);

/** ATP sintasa: canal en la membrana + tallo + cabeza F1 que gira. */
export const ATPsintasa: React.FC<{ p: V3; giro: number; brillo?: number }> = ({ p, giro, brillo = 0 }) => (
  <group position={p}>
    <group rotation={[0, giro, 0]}>
      <mesh>
        <cylinderGeometry args={[0.38, 0.38, 0.5, 12]} />
        <meshPhysicalMaterial color="#b48cff" emissive="#b48cff" emissiveIntensity={0.2 + brillo} />
      </mesh>
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.8, 10]} />
        <meshStandardMaterial color="#d9c8ff" />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.32, -1.15, Math.sin(a) * 0.32]}>
            <sphereGeometry args={[0.2, 16, 12]} />
            <meshPhysicalMaterial color={i % 2 ? "#ff8a5c" : "#ffb38a"} emissive="#ff8a5c" emissiveIntensity={0.15 + brillo} clearcoat={0.5} />
          </mesh>
        );
      })}
    </group>
    <mesh position={[0.5, -0.6, 0]}>
      <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
      <meshStandardMaterial color="#9a86c9" />
    </mesh>
  </group>
);

// ---- Rueda del ciclo de Krebs --------------------------------------------

export const KREBS = [
  "Citrato",
  "Isocitrato",
  "α-cetoglutarato",
  "Succinil-CoA",
  "Succinato",
  "Fumarato",
  "Malato",
  "Oxalacetato",
];

export const posKrebs = (i: number, giro = 0, R = 1.6): V3 => {
  const a = Math.PI / 2 - (i / KREBS.length) * Math.PI * 2 - giro;
  return [Math.cos(a) * R, Math.sin(a) * R, 0];
};

export const RuedaKrebs: React.FC<{ giro: number; resalta?: number; R?: number }> = ({ giro, resalta = -1, R = 1.6 }) => (
  <group>
    <mesh>
      <torusGeometry args={[R, 0.04, 10, 96]} />
      <meshStandardMaterial color="#9fd8ff" emissive="#5ec8ff" emissiveIntensity={0.4} />
    </mesh>
    {KREBS.map((_, i) => {
      const p = posKrebs(i, 0, R);
      return (
        <Esfera
          key={i}
          p={p}
          r={i === resalta ? 0.2 : 0.15}
          color={i === 7 ? "#ffd166" : "#7fd6ff"}
          brillo={i === resalta ? 1.2 : 0.3}
        />
      );
    })}
    {/* marcador que recorre el ciclo */}
    <Mol p={posKrebs(0, giro, R)} color="#ffffff" r={0.1} />
  </group>
);

// ---- Celula muscular por dentro --------------------------------------------

/** Glucogeno: racimo de granulos. */
export const Glucogeno: React.FC<{ p: V3; escala?: number; op?: number }> = ({ p, escala = 1, op = 1 }) => (
  <group position={p} scale={escala}>
    {Array.from({ length: 14 }).map((_, i) => (
      <Esfera
        key={i}
        p={[(rnd(`g${i}`) - 0.5) * 0.4, (rnd(`gy${i}`) - 0.5) * 0.4, (rnd(`gz${i}`) - 0.5) * 0.4]}
        r={0.07}
        color="#5b3fc4"
        brillo={0.25}
        op={op}
      />
    ))}
  </group>
);

export const GotaLipido: React.FC<{ p: V3; r?: number; op?: number }> = ({ p, r = 0.3, op = 1 }) => (
  <mesh position={p}>
    <sphereGeometry args={[r, 24, 18]} />
    <meshPhysicalMaterial color="#ffd34d" emissive="#ffb000" emissiveIntensity={0.2} transparent opacity={0.85 * op} clearcoat={0.8} roughness={0.15} />
  </mesh>
);

/** Cinta de correr con un corredor estilizado encima. */
export const Cinta: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <mesh position={[0, -0.05, 0]}>
      <boxGeometry args={[1.8, 0.1, 0.7]} />
      <meshStandardMaterial color="#232a3a" />
    </mesh>
    {Array.from({ length: 12 }).map((_, i) => (
      <mesh key={i} position={[(((i / 12 - t * 2) % 1) + 1) % 1 * 1.7 - 0.85, 0.005, 0]}>
        <boxGeometry args={[0.03, 0.01, 0.66]} />
        <meshStandardMaterial color="#4a5675" />
      </mesh>
    ))}
  </group>
);
