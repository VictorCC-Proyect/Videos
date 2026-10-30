// Modelos 3D del short de interferencia (mTOR vs. PGC-1). Se suman a los de mTOR, hipertrofia y fibras.
import React from "react";
import * as THREE from "three";
import { mix, mix3, V3 } from "../fisio/motor";
import { Mol } from "../fisio/modelos/energia";
import { K } from "./marco";

/** Color fijo de PGC-1 en todo el video (mTOR = lima, MTOR_C). */
export const PGC_C = "#2fb8ff";

const cl = (v: number) => Math.min(1, Math.max(0, v));

/** Punto que recorre una polilinea (u 0..1). */
export const enRuta = (ruta: V3[], u: number): V3 => {
  const n = ruta.length - 1;
  const v = cl(u);
  const k = Math.min(n - 1, Math.floor(v * n));
  return mix3(ruta[k], ruta[k + 1], v * n - k);
};

/** Pulsos que viajan de a -> b en bucle (t avanza, n pulsos, arco = curva hacia arriba). */
export const Pulsos: React.FC<{ a: V3; b: V3; t: number; op: number; color?: string; n?: number; r?: number; arco?: number }> = ({
  a,
  b,
  t,
  op,
  color = "#ffffff",
  n = 3,
  r = 0.06,
  arco = 0,
}) =>
  op <= 0.01 ? null : (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const u = (((t + i / n) % 1) + 1) % 1;
        const p = mix3(a, b, u);
        return <Mol key={i} p={[p[0], p[1] + Math.sin(u * Math.PI) * arco, p[2]]} color={color} r={r} brillo={1.6} op={op} />;
      })}
    </>
  );

// ---- Palanca de color (misma geometria que el Interruptor de mTOR) -----------------------------

/** Palanca tipo interruptor con color propio (PGC-1 = cian). on 0..1; la bola coincide con bolaInterruptor. */
export const Palanca: React.FC<{ p: V3; on: number; escala?: number; color?: string }> = ({ p, on, escala = 1, color = PGC_C }) => {
  const col = new THREE.Color("#ff4d4d").lerp(new THREE.Color(color), cl(on));
  const hex = `#${col.getHexString()}`;
  return (
    <group position={p} scale={escala}>
      <mesh>
        <boxGeometry args={[1.3, 0.4, 0.8]} />
        <meshPhysicalMaterial color="#1b2a30" roughness={0.4} clearcoat={0.6} emissive={color} emissiveIntensity={on * 0.15} />
      </mesh>
      {/* franja de color en el frente para distinguirla de la de mTOR */}
      <mesh position={[0, -0.12, 0.405]}>
        <boxGeometry args={[1.1, 0.06, 0.01]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4 + on * 0.8} />
      </mesh>
      <mesh position={[0, 0.205, 0]}>
        <boxGeometry args={[0.9, 0.02, 0.24]} />
        <meshStandardMaterial color="#05090b" />
      </mesh>
      <group position={[0, 0.2, 0]} rotation={[0, 0, mix(0.65, -0.65, cl(on))]}>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.05, 0.07, 0.7, 16]} />
          <meshStandardMaterial color="#c9d3dc" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.74, 0]}>
          <sphereGeometry args={[0.13, 24, 16]} />
          <meshPhysicalMaterial color={hex} emissive={hex} emissiveIntensity={0.4 + on * 1.2} clearcoat={0.7} />
        </mesh>
      </group>
      <mesh position={[0.5, 0.05, 0.41]}>
        <sphereGeometry args={[0.07, 16, 12]} />
        <meshBasicMaterial color={hex} />
      </mesh>
      {on > 0.05 ? (
        <mesh>
          <sphereGeometry args={[1.1, 24, 16]} />
          <meshBasicMaterial color={color} transparent opacity={on * 0.1} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
};

// ---- Caminadora ----------------------------------------------------------------------------

/** Caminadora a lo largo de Z (el corredor mira a +Z). La banda queda en y = CAMINADORA_Y. */
export const CAMINADORA_Y = 0.15;

export const Caminadora: React.FC<{ avance: number; color?: string; pantalla?: number }> = ({ avance, color = PGC_C, pantalla = 0.6 }) => {
  const largo = 1.7;
  return (
    <group>
      {/* base */}
      <mesh position={[0, 0.07, -0.05]}>
        <boxGeometry args={[0.66, 0.12, largo]} />
        <meshPhysicalMaterial color="#26343a" roughness={0.5} clearcoat={0.4} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.3, 0.135, -0.05]}>
          <boxGeometry args={[0.07, 0.03, largo]} />
          <meshStandardMaterial color="#c9d3dc" metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
      {/* banda */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, CAMINADORA_Y - 0.008, -0.05]}>
        <planeGeometry args={[0.52, largo - 0.06]} />
        <meshStandardMaterial color="#0b1215" roughness={0.9} />
      </mesh>
      {Array.from({ length: 10 }).map((_, i) => {
        const z = ((((i * 0.17 - avance) % 1.6) + 1.6) % 1.6) - 0.85;
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, CAMINADORA_Y - 0.006, z]}>
            <planeGeometry args={[0.5, 0.012]} />
            <meshBasicMaterial color="#33454c" />
          </mesh>
        );
      })}
      {/* postes, pasamanos y consola */}
      {[-1, 1].map((s) => (
        <group key={`p${s}`}>
          <mesh position={[s * 0.31, 0.62, 0.8]} rotation={[0.12, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.035, 1.0, 12]} />
            <meshStandardMaterial color="#c9d3dc" metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position={[s * 0.36, 1.0, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.42, 10]} />
            <meshStandardMaterial color="#c9d3dc" metalness={0.6} roughness={0.35} />
          </mesh>
        </group>
      ))}
      <group position={[0, 1.13, 0.86]} rotation={[-0.55, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.7, 0.24, 0.07]} />
          <meshPhysicalMaterial color="#1b2a30" roughness={0.4} clearcoat={0.6} />
        </mesh>
        <mesh position={[0, 0, -0.037]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.5, 0.15]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={pantalla} />
        </mesh>
      </group>
    </group>
  );
};

// ---- Zapatilla (icono de una sesion de cardio) -----------------------------------------------

/** Zapatilla de correr a lo largo de X (punta a +X). */
export const Zapatilla: React.FC<{ p: V3; escala?: number; color?: string; giro?: number; op?: number }> = ({ p, escala = 1, color = PGC_C, giro = 0, op = 1 }) => {
  const tr = op < 1;
  return (
    <group position={p} scale={escala} rotation={[0, giro, 0]}>
      {/* suela */}
      <mesh position={[0, 0.03, 0]} scale={[1, 1, 1]}>
        <boxGeometry args={[0.56, 0.07, 0.2]} />
        <meshStandardMaterial color="#f4f7f2" roughness={0.6} transparent={tr} opacity={op} />
      </mesh>
      <mesh position={[0.27, 0.05, 0]} scale={[0.05, 0.045, 0.1]}>
        <sphereGeometry args={[1, 16, 10]} />
        <meshStandardMaterial color="#f4f7f2" roughness={0.6} transparent={tr} opacity={op} />
      </mesh>
      {/* empeine */}
      <mesh position={[0.06, 0.12, 0]} rotation={[0, 0, -0.18]} scale={[0.3, 0.1, 0.095]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.4} clearcoat={0.5} transparent={tr} opacity={op} />
      </mesh>
      <mesh position={[-0.17, 0.17, 0]} scale={[0.12, 0.13, 0.095]}>
        <sphereGeometry args={[1, 20, 14]} />
        <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.4} clearcoat={0.5} transparent={tr} opacity={op} />
      </mesh>
      {/* cordones */}
      {[0.02, 0.09, 0.16].map((x) => (
        <mesh key={x} position={[x, 0.21 - x * 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.16, 6]} />
          <meshStandardMaterial color="#ffffff" transparent={tr} opacity={op} />
        </mesh>
      ))}
    </group>
  );
};

// ---- Libro --------------------------------------------------------------------------------

/** Libro de pie de cara a +Z, centrado. abre 0..1 gira la tapa hacia el espectador (pivote en el lomo). */
export const Libro: React.FC<{ abre: number; color?: string; ancho?: number; alto?: number; grosor?: number; brillo?: number }> = ({
  abre,
  color = "#1d4f5c",
  ancho = 1.0,
  alto = 1.4,
  grosor = 0.2,
  brillo = 0,
}) => {
  const a = cl(abre);
  const lineas = Array.from({ length: 9 }).map((_, i) => alto / 2 - 0.22 - i * 0.12);
  const tapa = <meshPhysicalMaterial color={color} roughness={0.45} clearcoat={0.6} emissive={color} emissiveIntensity={0.15 + brillo * 0.4} />;
  return (
    <group position={[mix(-ancho / 2, 0, a), 0, 0]}>
      {/* contratapa */}
      <mesh position={[ancho / 2, 0, -grosor / 2]}>
        <boxGeometry args={[ancho + 0.04, alto + 0.04, 0.03]} />
        {tapa}
      </mesh>
      {/* lomo */}
      <mesh position={[-0.005, 0, 0]}>
        <boxGeometry args={[0.03, alto + 0.04, grosor + 0.03]} />
        {tapa}
      </mesh>
      {/* hojas */}
      <mesh position={[ancho / 2 - 0.01, 0, 0]}>
        <boxGeometry args={[ancho - 0.04, alto - 0.04, grosor - 0.03]} />
        <meshStandardMaterial color="#f3ecd9" roughness={0.9} emissive="#fff6dc" emissiveIntensity={0.1 + brillo * 0.6} />
      </mesh>
      {a > 0.3
        ? lineas.map((y, i) => (
            <mesh key={i} position={[ancho / 2, y, grosor / 2 - 0.012]}>
              <planeGeometry args={[ancho * (i % 3 === 2 ? 0.45 : 0.72), 0.03]} />
              <meshBasicMaterial color="#8a8270" transparent opacity={0.7 * cl((a - 0.3) / 0.4)} />
            </mesh>
          ))
        : null}
      {/* tapa (gira desde el lomo) */}
      <group position={[0, 0, grosor / 2]} rotation={[0, -a * 2.75, 0]}>
        <mesh position={[ancho / 2, 0, 0.015]}>
          <boxGeometry args={[ancho + 0.04, alto + 0.04, 0.03]} />
          {tapa}
        </mesh>
        {/* franjas de la portada */}
        <mesh position={[ancho / 2, alto * 0.18, 0.032]}>
          <planeGeometry args={[ancho * 0.8, 0.02]} />
          <meshBasicMaterial color={K.lima} />
        </mesh>
        <mesh position={[ancho / 2, -alto * 0.26, 0.032]}>
          <planeGeometry args={[ancho * 0.8, 0.02]} />
          <meshBasicMaterial color={PGC_C} />
        </mesh>
        {/* cara interior */}
        <mesh position={[ancho / 2, 0, -0.001]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[ancho - 0.04, alto - 0.04]} />
          <meshStandardMaterial color="#efe6cf" roughness={0.9} />
        </mesh>
      </group>
      {brillo > 0.02 ? (
        <mesh position={[ancho / 2, 0, 0.2]}>
          <sphereGeometry args={[alto * 0.75, 24, 16]} />
          <meshBasicMaterial color="#fff3c4" transparent opacity={brillo * 0.08} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
};

// ---- Choque de senales -----------------------------------------------------------------------

/** Chispa de choque: anillo y esquirlas que se expanden (f 0..1). */
export const Choque: React.FC<{ p: V3; f: number; color?: string; r?: number }> = ({ p, f, color = PGC_C, r = 0.35 }) => {
  if (f <= 0 || f >= 1) return null;
  const op = 1 - f;
  return (
    <group position={p}>
      <mesh scale={0.2 + f * r * 3}>
        <torusGeometry args={[0.3, 0.03, 8, 32]} />
        <meshBasicMaterial color={color} transparent opacity={op} depthWrite={false} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        const d = f * r * 1.4;
        return <Mol key={i} p={[Math.cos(a) * d, Math.sin(a) * d, 0.05]} color="#ffffff" r={0.035} brillo={1.5} op={op} />;
      })}
    </group>
  );
};
