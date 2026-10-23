// Modelos 3D del short de hipertrofia.
import React, { useMemo } from "react";
import * as THREE from "three";
import { mix, V3 } from "../fisio/motor";
import { C } from "../fisio/tema";
import { hexPack, rnd, Tubo } from "../fisio/modelos/comun";
import { CilindroX } from "../fisio/modelos/musculo";
import { Enlace, Esfera } from "../fisio/modelos/energia";
import { F2_COL } from "./modelos-fibras";
import { K } from "./marco";

export const H_ACTINA = "#f2b83a";
export const H_MIOSINA = "#a46bf0";
export const H_NUCLEO = "#4a6bff";
export const H_SATELITE = "#7ef0b8";
export const H_RIBO = "#5fd3c6";

const cl = (v: number) => Math.min(1, Math.max(0, v));

// ---- Biceps extra (para el atleta "grande" haciendo curl) ----------------------

/** Volumen extra en los brazos del Humano en pose "curl" (hombros a +-0.1 rad). */
export const Biceps: React.FC<{ tam?: number; brilla?: number; colorBrillo?: string }> = ({ tam = 1, brilla = 0, colorBrillo = C.musculoClaro }) => (
  <>
    {([1, -1] as const).map((lado) => (
      <group key={lado} position={[0.23 * lado, 1.47, 0]} rotation={[0, 0, 0.1 * lado]}>
        {/* biceps */}
        <mesh position={[0, -0.15, 0.035]} scale={[0.066 * tam, 0.12, 0.066 * tam]}>
          <sphereGeometry args={[1, 24, 18]} />
          <meshPhysicalMaterial color={C.musculo} emissive={colorBrillo} emissiveIntensity={brilla * 0.9} roughness={0.45} clearcoat={0.4} />
        </mesh>
        {/* triceps */}
        <mesh position={[0, -0.13, -0.03]} scale={[0.058 * tam, 0.13, 0.058 * tam]}>
          <sphereGeometry args={[1, 24, 18]} />
          <meshPhysicalMaterial color={C.musculo} emissive={colorBrillo} emissiveIntensity={brilla * 0.6} roughness={0.45} clearcoat={0.4} />
        </mesh>
        {/* deltoides */}
        <mesh position={[0.02 * lado, -0.01, 0]} scale={[0.075 * tam, 0.07, 0.075 * tam]}>
          <sphereGeometry args={[1, 20, 14]} />
          <meshPhysicalMaterial color={C.musculo} emissive={colorBrillo} emissiveIntensity={brilla * 0.5} roughness={0.45} clearcoat={0.4} />
        </mesh>
      </group>
    ))}
  </>
);

// ---- Corte transversal de un haz de fibras ------------------------------------

type CeldaH = { x: number; y: number; tipo: 0 | 1 | 2 };

const celdasHaz = (R: number, sep: number, seed: string): CeldaH[] =>
  hexPack(R, sep).map(([x, y], i) => {
    const u = rnd(`${seed}t${i}`);
    return {
      x: x + (rnd(`${seed}x${i}`) - 0.5) * sep * 0.1,
      y: y + (rnd(`${seed}y${i}`) - 0.5) * sep * 0.1,
      tipo: u < 0.5 ? 0 : u < 0.8 ? 1 : 2,
    };
  });

/** Numero de fibras del corte (para el contador). */
export const nFibrasHaz = (R = 0.8, sep = 0.2) => hexPack(R, sep).length;

/** Celda de un tipo cerca de un punto (para etiquetas). */
export const celdaHaz = (tipo: 0 | 1 | 2, cerca: [number, number], R = 0.8, sep = 0.2, seed = "hh", esc = 1): V3 => {
  const c = celdasHaz(R, sep, seed)
    .filter((k) => k.tipo === tipo)
    .sort((a, b) => Math.hypot(a.x - cerca[0], a.y - cerca[1]) - Math.hypot(b.x - cerca[0], b.y - cerca[1]))[0];
  return [c.x * esc, c.y * esc, 0.05];
};

/**
 * Haz de fibras en corte transversal (eje en Z, cara hacia +Z). grosor = [I, IIa, IIx] escala
 * del radio de cada tipo; tipos 0..1 = de color uniforme a colores por tipo; act = brillo por tipo.
 * Las posiciones se separan con el mayor grosor: mismo numero de fibras, mas area.
 */
export const CorteHaz: React.FC<{
  R?: number;
  sep?: number;
  largo?: number;
  grosor?: [number, number, number];
  tipos?: number;
  act?: [number, number, number];
  seed?: string;
}> = ({ R = 0.8, sep = 0.2, largo = 1.4, grosor = [1, 1, 1], tipos = 0, act = [0, 0, 0], seed = "hh" }) => {
  const celdas = useMemo(() => celdasHaz(R, sep, seed), [R, sep, seed]);
  const esc = Math.max(...grosor);
  const uni = new THREE.Color("#c4404c");
  const COLS = [F2_COL.I, F2_COL.IIa, F2_COL.IIx];
  const Rt = (R + sep * 0.75) * esc;
  return (
    <group>
      {/* perimisio (tejido conectivo) */}
      <mesh position={[0, 0, -largo / 2 - 0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[Rt, Rt, largo, 64]} />
        <meshStandardMaterial color="#f0cdbd" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, -largo / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[Rt * 1.02, Rt * 1.02, largo * 1.01, 64, 1, true]} />
        <meshStandardMaterial color="#f6dccf" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {celdas.map((c, i) => {
        const g = grosor[c.tipo];
        const r = sep * 0.44 * g;
        const col = uni.clone().lerp(new THREE.Color(COLS[c.tipo]), tipos);
        const hex = `#${col.getHexString()}`;
        const a = act[c.tipo];
        return (
          <group key={i} position={[c.x * esc, c.y * esc, 0]}>
            <mesh position={[0, 0, -largo / 2 + 0.02]} rotation={[Math.PI / 2, i * 0.37, 0]}>
              <cylinderGeometry args={[r, r, largo, 7]} />
              <meshPhysicalMaterial color={hex} emissive={hex} emissiveIntensity={0.1 + a * 0.8} roughness={0.42} clearcoat={0.4} />
            </mesh>
            {a > 0.02 ? (
              <mesh position={[0, 0, 0.04]}>
                <circleGeometry args={[r * 1.15, 20]} />
                <meshBasicMaterial color="#ffe066" transparent opacity={a * 0.35} depthWrite={false} />
              </mesh>
            ) : null}
          </group>
        );
      })}
    </group>
  );
};

// ---- Sarcomeros en serie bajo tension -------------------------------------------

const MIOS_POS = hexPack(0.24, 0.13);

/**
 * Miofibrilla vertical: n sarcomeros (discos Z, actina amarilla, miosina morada).
 * estira 0..1 alarga los sarcomeros; tension 0..1 = brillo; fase mueve las cabezas.
 */
export const Sarcomeros: React.FC<{ n?: number; estira?: number; tension?: number; fase?: number }> = ({
  n = 3,
  estira = 0,
  tension = 0,
  fase = 0,
}) => {
  const L = 1.0 + 0.16 * estira;
  const y0 = (-n * L) / 2;
  return (
    <group>
      {Array.from({ length: n + 1 }).map((_, k) => (
        <mesh key={`z${k}`} position={[0, y0 + k * L, 0]}>
          <cylinderGeometry args={[0.36, 0.36, 0.035, 40]} />
          <meshStandardMaterial color="#e8f0ff" emissive={K.cian} emissiveIntensity={0.15 + tension * 0.5} />
        </mesh>
      ))}
      {Array.from({ length: n }).map((_, s) => {
        const yc = y0 + (s + 0.5) * L;
        return (
          <group key={s} position={[0, yc, 0]}>
            {MIOS_POS.map(([x, z], i) => (
              <group key={i}>
                {/* miosina */}
                <mesh position={[x, 0, z]}>
                  <cylinderGeometry args={[0.028, 0.028, 0.62, 10]} />
                  <meshStandardMaterial color={H_MIOSINA} emissive={H_MIOSINA} emissiveIntensity={0.2 + tension * 0.6} />
                </mesh>
                {[-0.24, -0.14, 0.14, 0.24].map((dy, j) => (
                  <mesh key={j} position={[x + 0.035 * Math.cos(j + i), dy + Math.sin(fase * 6 + j + i) * 0.01, z + 0.035 * Math.sin(j + i)]}>
                    <sphereGeometry args={[0.022, 8, 6]} />
                    <meshStandardMaterial color="#d6a8ff" emissive="#d6a8ff" emissiveIntensity={0.3 + tension * 0.7} />
                  </mesh>
                ))}
                {/* actina desde cada disco Z */}
                {[1, -1].map((sg) => (
                  <mesh key={sg} position={[x + 0.065, sg * (L / 2 - 0.21), z + 0.04]}>
                    <cylinderGeometry args={[0.012, 0.012, 0.42, 6]} />
                    <meshStandardMaterial color={H_ACTINA} emissive={H_ACTINA} emissiveIntensity={0.2 + tension * 0.5} />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
        );
      })}
      {tension > 0.02 ? (
        <mesh>
          <cylinderGeometry args={[0.46, 0.46, n * L, 32, 1, true]} />
          <meshBasicMaterial color={K.amarillo} transparent opacity={tension * 0.12} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ) : null}
    </group>
  );
};

// ---- Mecanosensor e interruptor (metafora de mTOR) ------------------------------

/** Proteina sensora que atraviesa la membrana (como una integrina). La membrana esta en y=0. */
export const Sensor: React.FC<{ p: V3; tension?: number }> = ({ p, tension = 0 }) => {
  const sube = tension * 0.18;
  const col = "#43e0ff";
  return (
    <group position={p}>
      {[-0.09, 0.09].map((x, i) => (
        <Tubo
          key={i}
          puntos={[
            [x * 1.2, -0.75, 0],
            [x, -0.3, 0],
            [x, 0.3, 0],
            [x * 1.6, 0.65 + sube, 0],
          ]}
          radio={0.05}
          color={i ? "#7fb2ff" : col}
          emisivo={0.25 + tension * 1.1}
        />
      ))}
      <Esfera p={[-0.15, 0.8 + sube, 0]} r={0.16} color={col} brillo={0.3 + tension * 1.2} />
      <Esfera p={[0.15, 0.8 + sube, 0]} r={0.16} color="#7fb2ff" brillo={0.3 + tension * 1.2} />
    </group>
  );
};

/** Interruptor tipo palanca. on 0..1 (gira la palanca y enciende). */
export const Interruptor: React.FC<{ p: V3; on: number; escala?: number }> = ({ p, on, escala = 1 }) => {
  const col = new THREE.Color("#ff4d4d").lerp(new THREE.Color(K.lima), on);
  const hex = `#${col.getHexString()}`;
  return (
    <group position={p} scale={escala}>
      <mesh>
        <boxGeometry args={[1.3, 0.4, 0.8]} />
        <meshPhysicalMaterial color="#1b2a30" roughness={0.4} clearcoat={0.6} emissive={K.lima} emissiveIntensity={on * 0.15} />
      </mesh>
      <mesh position={[0, 0.205, 0]}>
        <boxGeometry args={[0.9, 0.02, 0.24]} />
        <meshStandardMaterial color="#05090b" />
      </mesh>
      <group position={[0, 0.2, 0]} rotation={[0, 0, mix(0.65, -0.65, on)]}>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.05, 0.07, 0.7, 16]} />
          <meshStandardMaterial color="#c9d3dc" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.74, 0]}>
          <sphereGeometry args={[0.13, 24, 16]} />
          <meshPhysicalMaterial color={hex} emissive={hex} emissiveIntensity={0.4 + on * 1.2} clearcoat={0.7} />
        </mesh>
      </group>
      {/* luz */}
      <mesh position={[0.5, 0.05, 0.41]}>
        <sphereGeometry args={[0.07, 16, 12]} />
        <meshBasicMaterial color={hex} />
      </mesh>
      {on > 0.05 ? (
        <mesh>
          <sphereGeometry args={[1.1, 24, 16]} />
          <meshBasicMaterial color={K.lima} transparent opacity={on * 0.1} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
};

// ---- Ribosoma ----------------------------------------------------------------------

/** Ribosoma (dos subunidades) leyendo un ARNm; saca una cadena de n cuentas de color. */
export const Ribosoma: React.FC<{ p: V3; color: string; n?: number; avance?: number; escala?: number; giro?: number }> = ({
  p,
  color,
  n = 0,
  avance = 0,
  escala = 1,
  giro = 0,
}) => {
  const k = Math.round(n);
  const arn: V3[] = Array.from({ length: 12 }).map((_, i) => [-1.4 + i * 0.25, -0.08 + Math.sin(i * 1.3) * 0.04, 0.05]);
  return (
    <group position={p} scale={escala} rotation={[0, giro, 0]}>
      <mesh position={[0, 0.13, 0]} scale={[1.25, 0.85, 1]}>
        <sphereGeometry args={[0.3, 32, 24]} />
        <meshPhysicalMaterial color={H_RIBO} emissive={H_RIBO} emissiveIntensity={0.15} roughness={0.5} clearcoat={0.5} />
      </mesh>
      <mesh position={[0, -0.22, 0]} scale={[1.3, 0.62, 1]}>
        <sphereGeometry args={[0.22, 32, 20]} />
        <meshPhysicalMaterial color="#a9eee6" emissive={H_RIBO} emissiveIntensity={0.1} roughness={0.5} clearcoat={0.5} />
      </mesh>
      <group position={[-((avance * 0.25) % 0.25), 0, 0]}>
        <Tubo puntos={arn} radio={0.025} color="#ff9de2" emisivo={0.4} segmentos={50} />
      </group>
      {Array.from({ length: k }).map((_, i) => {
        const a = i * 0.8;
        const q: V3 = [Math.sin(a) * 0.08 * Math.min(1, i / 3), 0.42 + i * 0.075, Math.cos(a) * 0.08 * Math.min(1, i / 3)];
        return <Esfera key={i} p={q} r={0.045} color={color} brillo={0.5} />;
      })}
    </group>
  );
};

/** Filamento suelto (actina = cuentas amarillas, miosina = barra morada) para que vuele hacia la fibra. */
export const Filamento: React.FC<{ p: V3; tipo: "actina" | "miosina"; escala?: number; giro?: number; op?: number }> = ({
  p,
  tipo,
  escala = 1,
  giro = 0,
  op = 1,
}) => (
  <group position={p} scale={escala} rotation={[0, 0, giro]}>
    {tipo === "actina" ? (
      Array.from({ length: 8 }).map((_, i) => (
        <Esfera key={i} p={[Math.sin(i * 1.5) * 0.03, -0.28 + i * 0.08, Math.cos(i * 1.5) * 0.03]} r={0.045} color={H_ACTINA} brillo={0.4} op={op} />
      ))
    ) : (
      <>
        <mesh>
          <cylinderGeometry args={[0.035, 0.035, 0.6, 10]} />
          <meshStandardMaterial color={H_MIOSINA} emissive={H_MIOSINA} emissiveIntensity={0.4} transparent={op < 1} opacity={op} />
        </mesh>
        {[-0.22, -0.11, 0.11, 0.22].map((y, i) => (
          <Esfera key={i} p={[i % 2 ? 0.05 : -0.05, y, 0]} r={0.035} color="#d6a8ff" brillo={0.5} op={op} />
        ))}
      </>
    )}
  </group>
);

// ---- Fibra en corte con miofibrillas (se engrosa al anadir miofibrillas) --------------

const MF_SEP = 0.25;
const MF_BASE = hexPack(0.62, MF_SEP);
const MF_EXTRA = hexPack(1.0, MF_SEP).filter(([x, y]) => Math.hypot(x, y) > 0.63);

/** Fibra vertical abierta por arriba. crece 0..1 suma miofibrillas en paralelo y ensancha la membrana. */
export const FibraMiofibrillas: React.FC<{ crece?: number; alto?: number; brillo?: number }> = ({ crece = 0, alto = 2.6, brillo = 0 }) => {
  const R = mix(0.8, 1.16, crece);
  return (
    <group>
      {/* sarcolema */}
      <mesh>
        <cylinderGeometry args={[R, R, alto, 64, 1, true]} />
        <meshPhysicalMaterial color="#f39aa0" emissive="#f39aa0" emissiveIntensity={0.1 + brillo * 0.3} transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide} roughness={0.4} />
      </mesh>
      <mesh position={[0, alto / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R, 0.025, 10, 64]} />
        <meshStandardMaterial color="#ffc2c6" emissive="#ff8f9a" emissiveIntensity={0.4 + brillo} />
      </mesh>
      <mesh position={[0, -alto / 2 + 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[R, 64]} />
        <meshStandardMaterial color="#4a0f17" side={THREE.DoubleSide} />
      </mesh>
      <group rotation={[0, 0, Math.PI / 2]}>
        {MF_BASE.map(([x, z], i) => (
          <CilindroX key={i} radio={0.1} largo={alto * 0.98} x={alto / 2 - 0.01} y={-x} z={z} color="#c03a46" estriado={9} tapa="#e0707a" />
        ))}
        {MF_EXTRA.map(([x, z], i) => {
          const s = cl((crece * 1.35 - rnd(`mfe${i}`) * 0.35) / 0.4);
          if (s <= 0.02) return null;
          return (
            <CilindroX key={`e${i}`} radio={0.1 * s} largo={alto * 0.98} x={alto / 2 - 0.01} y={-x} z={z} color="#e05a66" estriado={9} tapa={K.lima} emisivo={0.3 * (1 - s) + brillo * 0.3} />
          );
        })}
      </group>
    </group>
  );
};

// ---- Fibra con celulas satelite ---------------------------------------------------------

const NUC_FIBRA = Array.from({ length: 7 }).map((_, i) => ({ a: rnd(`nfa${i}`) * Math.PI * 2, y: -1.4 + i * 0.45 }));
export const SATELITES = [
  { a: -0.55, y: 0.95 },
  { a: 0.25, y: -0.15 },
  { a: -0.15, y: -1.15 },
];

export const posSatelite = (i: number, R: number, fusion: number): V3 => {
  const s = SATELITES[i];
  const rr = mix(R * 1.06, R * 0.86, fusion);
  return [Math.sin(s.a) * rr, s.y, Math.cos(s.a) * rr];
};

/**
 * Fibra translucida con mionucleos en la periferia y celulas satelite pegadas por fuera.
 * activa = brillo de las satelite; fusion[i] 0..1 = la celula i se funde y su nucleo queda dentro.
 */
export const FibraSatelite: React.FC<{ R?: number; alto?: number; activa?: number; fusion?: number[] }> = ({
  R = 0.8,
  alto = 3.6,
  activa = 0,
  fusion = [0, 0, 0],
}) => (
  <group>
    {/* lamina basal */}
    <mesh>
      <cylinderGeometry args={[R * 1.17, R * 1.17, alto, 40, 10, true]} />
      <meshBasicMaterial color="#f1c7b5" wireframe transparent opacity={0.13} />
    </mesh>
    {/* fibra */}
    <mesh>
      <cylinderGeometry args={[R, R, alto, 64, 1, true]} />
      <meshPhysicalMaterial color="#d24a58" emissive="#d24a58" emissiveIntensity={0.12} transparent opacity={0.45} depthWrite={false} side={THREE.DoubleSide} roughness={0.4} clearcoat={0.4} />
    </mesh>
    {Array.from({ length: 18 }).map((_, i) => (
      <mesh key={`e${i}`} position={[0, -alto / 2 + (i + 0.5) * (alto / 18), 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R * 1.002, 0.008, 6, 48]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.2} depthWrite={false} />
      </mesh>
    ))}
    {/* miofibrillas interiores (sugeridas) */}
    {hexPack(R * 0.6, R * 0.3).map(([x, z], i) => (
      <mesh key={`m${i}`} position={[x, 0, z]}>
        <cylinderGeometry args={[R * 0.12, R * 0.12, alto * 0.99, 14]} />
        <meshStandardMaterial color="#9a2632" transparent opacity={0.6} />
      </mesh>
    ))}
    {/* mionucleos propios */}
    {NUC_FIBRA.map((n, i) => (
      <group key={`n${i}`} position={[Math.sin(n.a) * R * 0.86, n.y, Math.cos(n.a) * R * 0.86]} rotation={[0, n.a, 0]}>
        <mesh scale={[0.13, 0.28, 0.07]}>
          <sphereGeometry args={[1, 20, 14]} />
          <meshStandardMaterial color={H_NUCLEO} emissive={H_NUCLEO} emissiveIntensity={0.45} />
        </mesh>
      </group>
    ))}
    {/* celulas satelite */}
    {SATELITES.map((s, i) => {
      const f = fusion[i] ?? 0;
      const p = posSatelite(i, R, f);
      return (
        <group key={`s${i}`} position={p} rotation={[0, s.a, 0]}>
          {f < 0.95 ? (
            <mesh scale={[0.3 * (1 + f * 0.4), 0.42, 0.13 * (1 - f * 0.6)]}>
              <sphereGeometry args={[1, 28, 20]} />
              <meshPhysicalMaterial
                color={H_SATELITE}
                emissive={H_SATELITE}
                emissiveIntensity={0.15 + activa * 0.9}
                transparent
                opacity={0.8 * (1 - f)}
                depthWrite={false}
                roughness={0.35}
                clearcoat={0.6}
              />
            </mesh>
          ) : null}
          <mesh scale={[0.13, mix(0.2, 0.28, f), 0.07]}>
            <sphereGeometry args={[1, 20, 14]} />
            <meshStandardMaterial color={H_NUCLEO} emissive={f > 0.5 ? K.lima : H_NUCLEO} emissiveIntensity={0.5 + activa * 0.3 + Math.sin(f * Math.PI) * 0.8} />
          </mesh>
        </group>
      );
    })}
  </group>
);

// ---- Cama ---------------------------------------------------------------------------

/** Cama a lo largo de X; el colchon queda en y=0.58. */
export const Cama: React.FC<{ largo?: number }> = ({ largo = 2.3 }) => (
  <group>
    <mesh position={[0, 0.2, 0]}>
      <boxGeometry args={[largo + 0.1, 0.25, 1.0]} />
      <meshStandardMaterial color="#3a2a22" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.45, 0]}>
      <boxGeometry args={[largo, 0.26, 0.92]} />
      <meshPhysicalMaterial color="#e8eef5" roughness={0.7} />
    </mesh>
    <mesh position={[largo / 2 + 0.04, 0.55, 0]}>
      <boxGeometry args={[0.1, 0.95, 1.0]} />
      <meshStandardMaterial color="#3a2a22" roughness={0.6} />
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * (largo / 2 - 0.06), 0.04, 0.42]}>
        <boxGeometry args={[0.08, 0.1, 0.08]} />
        <meshStandardMaterial color="#2a1d17" />
      </mesh>
    ))}
    <mesh position={[largo / 2 - 0.3, 0.64, 0]} scale={[0.22, 0.08, 0.36]}>
      <sphereGeometry args={[1, 24, 16]} />
      <meshStandardMaterial color="#ffffff" roughness={0.8} />
    </mesh>
  </group>
);

/** Manta que cubre de la cadera a los pies (sobre la cama). */
export const Manta: React.FC<{ largo?: number; x?: number }> = ({ largo = 1.25, x = -0.45 }) => (
  <mesh position={[x, 0.69, 0.02]} scale={[largo / 2, 0.15, 0.47]}>
    <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
    <meshPhysicalMaterial color="#3d6fd9" roughness={0.6} clearcoat={0.2} side={THREE.DoubleSide} />
  </mesh>
);
