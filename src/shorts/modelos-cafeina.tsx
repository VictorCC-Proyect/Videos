// Modelos 3D del short de cafeina: taza, moleculas (adenosina / cafeina), sinapsis con
// receptores en copa, atleta bebiendo, corazon, luna y cama.
import React, { useMemo } from "react";
import * as THREE from "three";
import { mix, V3 } from "../fisio/motor";
import { rnd } from "../fisio/modelos/comun";
import { Humano } from "../fisio/modelos/cuerpo";
import { Enlace, Esfera } from "../fisio/modelos/energia";
import { K } from "./marco";

export const CAFE = "#6b3b22";
export const ADENOSINA = "#7b6bff";
export const CAFEINA_C = "#f3e6d2";
export const RECEPTOR = "#3ee0c0";
export const NEURONA = "#d86f95";

// ---- Taza de cafe humeante ------------------------------------------------------

/** Taza con asa toroidal y vapor. vapor 0..1 intensidad; b anima el vapor. */
export const Taza: React.FC<{ p?: V3; escala?: number; b?: number; vapor?: number; giro?: number; brillo?: number; color?: string }> = ({
  p = [0, 0, 0],
  escala = 1,
  b = 0,
  vapor = 1,
  giro = 0,
  brillo = 0,
  color = "#f4f7f2",
}) => (
  <group position={p} scale={escala} rotation={[0, giro, 0]}>
    {/* cuerpo */}
    <mesh position={[0, 0.3, 0]}>
      <cylinderGeometry args={[0.32, 0.25, 0.6, 40, 1, true]} />
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={brillo} roughness={0.25} clearcoat={0.9} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 0.005, 0]}>
      <cylinderGeometry args={[0.25, 0.25, 0.01, 40]} />
      <meshPhysicalMaterial color={color} roughness={0.25} />
    </mesh>
    {/* borde */}
    <mesh position={[0, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.32, 0.018, 10, 48]} />
      <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={0.9} />
    </mesh>
    {/* cafe */}
    <mesh position={[0, 0.54, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.31, 40]} />
      <meshStandardMaterial color={CAFE} emissive="#3a1d0c" emissiveIntensity={0.4} roughness={0.2} />
    </mesh>
    {/* asa */}
    <mesh position={[0.3, 0.32, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <torusGeometry args={[0.14, 0.035, 12, 32, Math.PI]} />
      <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={0.9} />
    </mesh>
    {/* plato */}
    <mesh position={[0, -0.02, 0]}>
      <cylinderGeometry args={[0.5, 0.42, 0.04, 48]} />
      <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.8} />
    </mesh>
    {/* vapor */}
    {vapor > 0
      ? Array.from({ length: 30 }).map((_, i) => {
          const hilo = i % 3;
          const t = (b * 1.4 + i / 30 + rnd(`vt${i}`) * 0.1) % 1;
          const x = (hilo - 1) * 0.12 + Math.sin(t * 7 + hilo * 2) * 0.07;
          const z = Math.cos(t * 5 + hilo) * 0.05;
          return (
            <mesh key={i} position={[x, 0.62 + t * 0.9, z]}>
              <sphereGeometry args={[0.04 + t * 0.06, 10, 8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={vapor * 0.32 * Math.sin(t * Math.PI)} depthWrite={false} />
            </mesh>
          );
        })
      : null}
  </group>
);

// ---- Atleta bebiendo ----------------------------------------------------------------

/** Atleta de pie que sube la taza a la boca. bebe 0..1 (0 = brazo abajo). */
export const AtletaTaza: React.FC<{ bebe: number; b: number; brilla?: number }> = ({ bebe, b, brilla = 0 }) => {
  const a = mix(0, -0.8, bebe);
  const c = mix(-0.6, -2.25, bebe);
  const codo: V3 = [0.23, 1.47 - 0.3 * Math.cos(a), -0.3 * Math.sin(a)];
  const mano: V3 = [0.23, codo[1] - 0.34 * Math.cos(a + c), codo[2] - 0.34 * Math.sin(a + c)];
  return (
    <group>
      <Humano
        musculo={0.8}
        brilla={brilla}
        pose={{ hombroD: [a, 0, 0.04], hombroI: [0, 0, -0.12], codoD: c, codoI: -0.15, caderaD: [0, 0, 0.04], caderaI: [0, 0, -0.04], rodillaD: 0, rodillaI: 0 }}
      />
      <Taza p={[mano[0] - 0.02, mano[1] - 0.06, mano[2] + 0.02]} escala={0.17} giro={Math.PI} b={b} vapor={1} />
    </group>
  );
};

// ---- Moleculas: nucleo de purina (anillo de 6 fusionado con anillo de 5) ----------------

const HEX: [number, number][] = [30, 90, 150, 210, 270, 330].map((g) => [0.2 * Math.cos((g * Math.PI) / 180), 0.2 * Math.sin((g * Math.PI) / 180)]);
const PENTA: [number, number][] = [HEX[0], [0.364, 0.162], [0.481, 0], [0.364, -0.162], HEX[5]];

const Anillo: React.FC<{ pts: [number, number][]; color: string; brillo: number; op: number }> = ({ pts, color, brillo, op }) => (
  <>
    {pts.map((q, i) => {
      const s = pts[(i + 1) % pts.length];
      return <Enlace key={i} a={[q[0], q[1], 0]} b={[s[0], s[1], 0]} r={0.028} color={color} brillo={brillo * 0.5} op={op} />;
    })}
    {pts.map((q, i) => (
      <Esfera key={`a${i}`} p={[q[0], q[1], 0]} r={0.06} color={color} brillo={brillo} op={op} />
    ))}
  </>
);

const Rama: React.FC<{ de: [number, number]; a: [number, number]; r: number; color: string; colEnlace: string; brillo: number; op: number }> = ({
  de,
  a,
  r,
  color,
  colEnlace,
  brillo,
  op,
}) => (
  <>
    <Enlace a={[de[0], de[1], 0]} b={[a[0], a[1], 0]} r={0.025} color={colEnlace} op={op} />
    <Esfera p={[a[0], a[1], 0]} r={r} color={color} brillo={brillo} op={op} />
  </>
);

/** Adenosina: purina + grupo amino + ribosa (azul-violeta). */
export const Adenosina: React.FC<{ p: V3; escala?: number; rot?: V3; brillo?: number; op?: number }> = ({ p, escala = 1, rot = [0, 0, 0], brillo = 0.45, op = 1 }) => {
  const centro: [number, number] = [0.6, -0.5];
  const ribosa: [number, number][] = [0, 1, 2, 3, 4].map((k) => {
    const g = Math.PI / 2 + 0.6 + (k * 2 * Math.PI) / 5;
    return [centro[0] + 0.15 * Math.cos(g), centro[1] + 0.15 * Math.sin(g)];
  });
  return (
    <group position={p} scale={escala} rotation={rot}>
      <group position={[-0.2, 0.12, 0]}>
        <Anillo pts={HEX} color={ADENOSINA} brillo={brillo} op={op} />
        <Anillo pts={PENTA} color={ADENOSINA} brillo={brillo} op={op} />
        <Rama de={HEX[1]} a={[0, 0.38]} r={0.07} color="#4f8dff" colEnlace={ADENOSINA} brillo={brillo} op={op} />
        <Enlace a={[PENTA[3][0], PENTA[3][1], 0]} b={[ribosa[1][0], ribosa[1][1], 0]} r={0.025} color={ADENOSINA} op={op} />
        <Anillo pts={ribosa} color="#a99bff" brillo={brillo * 0.8} op={op} />
        <Rama de={ribosa[3]} a={[ribosa[3][0] + 0.05, ribosa[3][1] - 0.17]} r={0.05} color="#ff6b6b" colEnlace="#a99bff" brillo={0.3} op={op} />
      </group>
    </group>
  );
};

/** Cafeina (1,3,7-trimetilxantina): purina + 2 oxigenos + 3 metilos (crema/cafe). */
export const Cafeina: React.FC<{ p: V3; escala?: number; rot?: V3; brillo?: number; op?: number }> = ({ p, escala = 1, rot = [0, 0, 0], brillo = 0.35, op = 1 }) => (
  <group position={p} scale={escala} rotation={rot}>
    <group position={[-0.14, 0, 0]}>
      <Anillo pts={HEX} color={CAFEINA_C} brillo={brillo} op={op} />
      <Anillo pts={PENTA} color={CAFEINA_C} brillo={brillo} op={op} />
      <Rama de={HEX[1]} a={[0, 0.37]} r={0.065} color="#ff5050" colEnlace={CAFEINA_C} brillo={0.3} op={op} />
      <Rama de={HEX[3]} a={[-0.32, -0.19]} r={0.065} color="#ff5050" colEnlace={CAFEINA_C} brillo={0.3} op={op} />
      <Rama de={HEX[2]} a={[-0.33, 0.19]} r={0.075} color="#9a5b34" colEnlace={CAFEINA_C} brillo={0.25} op={op} />
      <Rama de={HEX[4]} a={[0, -0.37]} r={0.075} color="#9a5b34" colEnlace={CAFEINA_C} brillo={0.25} op={op} />
      <Rama de={PENTA[1]} a={[0.45, 0.33]} r={0.075} color="#9a5b34" colEnlace={CAFEINA_C} brillo={0.25} op={op} />
    </group>
  </group>
);

// ---- Sinapsis: membrana de la neurona con receptores en copa ------------------------

/** Receptores en la membrana (x, z). La copa abre hacia +y; la boca queda en y = BOCA. */
export const RECEPTORES_C: [number, number][] = [
  [-0.95, -0.45],
  [0, -0.55],
  [0.95, -0.45],
  [-0.5, 0.45],
  [0.5, 0.45],
];
export const BOCA = 0.42;

export const ReceptorCopa: React.FC<{ p: V3; ocupado?: number; color?: string }> = ({ p, ocupado = 0, color = RECEPTOR }) => (
  <group position={p}>
    {/* tallo que atraviesa la membrana */}
    <mesh position={[0, 0.0, 0]}>
      <cylinderGeometry args={[0.09, 0.11, 0.42, 16]} />
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.25} roughness={0.35} />
    </mesh>
    {/* copa */}
    <mesh position={[0, 0.3, 0]}>
      <cylinderGeometry args={[0.3, 0.1, 0.26, 32, 1, true]} />
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.3 + ocupado * 0.3} roughness={0.3} clearcoat={0.6} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, BOCA, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.3, 0.03, 10, 40]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </mesh>
  </group>
);

/** Membrana de la neurona; actividad 0..1 = brillo y senales electricas que corren por dentro. */
export const Sinapsis: React.FC<{ b: number; actividad: number; ocupado?: number[] }> = ({ b, actividad, ocupado = [] }) => (
  <group>
    {/* membrana postsinaptica */}
    <mesh position={[0, -0.2, 0]}>
      <boxGeometry args={[4.2, 0.22, 2.4]} />
      <meshPhysicalMaterial color={NEURONA} emissive={K.amarillo} emissiveIntensity={0.05 + actividad * 0.55} roughness={0.45} clearcoat={0.5} />
    </mesh>
    {/* interior de la neurona */}
    <mesh position={[0, -0.85, 0]}>
      <boxGeometry args={[4.2, 1.1, 2.4]} />
      <meshPhysicalMaterial color="#5a2a4a" emissive={K.amarillo} emissiveIntensity={actividad * 0.18} transparent opacity={0.55} roughness={0.6} depthWrite={false} />
    </mesh>
    {/* bicapa: cabezas de fosfolipidos */}
    {Array.from({ length: 21 }).flatMap((_, i) =>
      [-1.1, 1.1].map((z) => (
        <mesh key={`${i}${z}`} position={[-2.0 + i * 0.2, -0.08, z]}>
          <sphereGeometry args={[0.07, 10, 8]} />
          <meshStandardMaterial color="#f2b8cc" />
        </mesh>
      )),
    )}
    {/* senales electricas (impulsos) */}
    {Array.from({ length: 14 }).map((_, i) => {
      const t = (b * 2.2 + rnd(`si${i}`)) % 1;
      const x = -2.0 + t * 4.0;
      return (
        <mesh key={i} position={[x, -0.75 + (rnd(`sy${i}`) - 0.5) * 0.6, (rnd(`sz${i}`) - 0.5) * 1.8]}>
          <sphereGeometry args={[0.06, 10, 8]} />
          <meshBasicMaterial color={K.amarillo} transparent opacity={actividad * 0.9} />
        </mesh>
      );
    })}
    {RECEPTORES_C.map(([x, z], i) => (
      <ReceptorCopa key={i} p={[x, 0, z]} ocupado={ocupado[i] ?? 0} />
    ))}
  </group>
);

/** Posicion de la molecula cuando esta encajada en el receptor i. */
export const enReceptor = (i: number, alto = 0.08): V3 => [RECEPTORES_C[i][0], BOCA + alto, RECEPTORES_C[i][1]];

// ---- Corazon estilizado --------------------------------------------------------------

export const Corazon: React.FC<{ p?: V3; escala?: number; pulso?: number; brillo?: number }> = ({ p = [0, 0, 0], escala = 1, pulso = 0, brillo = 0.3 }) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.9);
    s.bezierCurveTo(-0.15, -0.65, -1.0, -0.3, -1.0, 0.25);
    s.bezierCurveTo(-1.0, 0.75, -0.45, 0.95, 0, 0.55);
    s.bezierCurveTo(0.45, 0.95, 1.0, 0.75, 1.0, 0.25);
    s.bezierCurveTo(1.0, -0.3, 0.15, -0.65, 0, -0.9);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.35, bevelEnabled: true, bevelThickness: 0.22, bevelSize: 0.18, bevelSegments: 8, curveSegments: 32 });
    g.center();
    return g;
  }, []);
  const k = 1 + pulso * 0.12;
  return (
    <group position={p} scale={escala * k}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial color="#e2384d" emissive={K.rojo} emissiveIntensity={brillo + pulso * 0.5} roughness={0.3} clearcoat={0.8} />
      </mesh>
      <mesh scale={1.25}>
        <sphereGeometry args={[0.9, 24, 18]} />
        <meshBasicMaterial color={K.rojo} transparent opacity={0.06 + pulso * 0.1} depthWrite={false} />
      </mesh>
    </group>
  );
};

// ---- Noche: luna y cama ----------------------------------------------------------------

export const Luna: React.FC<{ p: V3; escala?: number; brillo?: number }> = ({ p, escala = 1, brillo = 0.5 }) => (
  <group position={p} scale={escala}>
    <mesh>
      <sphereGeometry args={[0.5, 40, 30]} />
      <meshStandardMaterial color="#fff3c4" emissive="#ffe08a" emissiveIntensity={brillo} roughness={0.8} />
    </mesh>
    {[
      [0.15, 0.18, 0.44, 0.09],
      [-0.2, -0.1, 0.44, 0.12],
      [0.12, -0.22, 0.43, 0.07],
    ].map(([x, y, z, r], i) => (
      <mesh key={i} position={[x, y, z]} scale={[1, 1, 0.3]}>
        <sphereGeometry args={[r, 16, 12]} />
        <meshStandardMaterial color="#e6d39a" emissive="#c9a95a" emissiveIntensity={0.2} />
      </mesh>
    ))}
    <mesh>
      <sphereGeometry args={[0.8, 24, 18]} />
      <meshBasicMaterial color="#ffe08a" transparent opacity={0.1} depthWrite={false} />
    </mesh>
  </group>
);

export const Cama: React.FC<{ p?: V3; escala?: number }> = ({ p = [0, 0, 0], escala = 1 }) => (
  <group position={p} scale={escala}>
    {/* base */}
    <mesh position={[0, 0.22, 0]}>
      <boxGeometry args={[2.0, 0.24, 1.1]} />
      <meshPhysicalMaterial color="#6b4a3a" roughness={0.6} />
    </mesh>
    {/* colchon */}
    <mesh position={[0, 0.42, 0]}>
      <boxGeometry args={[1.95, 0.18, 1.05]} />
      <meshPhysicalMaterial color="#f4f7f2" roughness={0.7} />
    </mesh>
    {/* cobija */}
    <mesh position={[0.25, 0.53, 0]}>
      <boxGeometry args={[1.5, 0.06, 1.1]} />
      <meshPhysicalMaterial color="#4f6dff" roughness={0.8} />
    </mesh>
    {/* almohada */}
    <mesh position={[-0.72, 0.58, 0]} scale={[0.32, 0.1, 0.42]}>
      <sphereGeometry args={[1, 24, 16]} />
      <meshPhysicalMaterial color="#ffffff" roughness={0.7} />
    </mesh>
    {/* cabecera */}
    <mesh position={[-1.02, 0.6, 0]}>
      <boxGeometry args={[0.08, 0.9, 1.1]} />
      <meshPhysicalMaterial color="#5a3b2d" roughness={0.6} />
    </mesh>
    {/* patas */}
    {[-0.9, 0.9].flatMap((x) =>
      [-0.45, 0.45].map((z) => (
        <mesh key={`${x}${z}`} position={[x, 0.05, z]}>
          <boxGeometry args={[0.08, 0.1, 0.08]} />
          <meshStandardMaterial color="#3a261c" />
        </mesh>
      )),
    )}
  </group>
);
