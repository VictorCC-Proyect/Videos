// Modelos 3D del short de mTOR (se suman a los de hipertrofia, glucosa, ventana...).
import React from "react";
import * as THREE from "three";
import { mix, V3 } from "../fisio/motor";
import { Humano } from "../fisio/modelos/cuerpo";
import { Tubo } from "../fisio/modelos/comun";
import { Enlace, Esfera } from "../fisio/modelos/energia";
import { K } from "./marco";

/** Colores fijos del video: mTOR = lima (como en hipertrofia). */
export const MTOR_C = K.lima;
export const LEU_C = "#ff7a1a";
export const AMPK_C = "#ff3344";
export const ENERGIA_C = K.amarillo;
export const ESTIMULO_C = K.cian;

const cl = (v: number) => Math.min(1, Math.max(0, v));

/** Posicion de la bola de la palanca del Interruptor (p, on, escala iguales a los del Interruptor). */
export const bolaInterruptor = (p: V3, on: number, escala = 1): V3 => {
  const a = mix(0.65, -0.65, on);
  return [p[0] - Math.sin(a) * 0.74 * escala, p[1] + (0.2 + Math.cos(a) * 0.74) * escala, p[2]];
};

// ---- Bateria (energia disponible) ------------------------------------------------

/** Bateria vertical; nivel 0..1. El color de la carga va de rojo (baja) a amarillo/lima (llena). */
export const Bateria: React.FC<{ p: V3; nivel: number; escala?: number; brillo?: number }> = ({ p, nivel, escala = 1, brillo = 0.6 }) => {
  const n = cl(nivel);
  const col = new THREE.Color(AMPK_C).lerp(new THREE.Color(ENERGIA_C), cl(n * 1.6)).lerp(new THREE.Color(K.lima), cl((n - 0.7) / 0.3));
  const hex = `#${col.getHexString()}`;
  const H = 1.0;
  const h = Math.max(0.02, (H - 0.08) * n);
  return (
    <group position={p} scale={escala}>
      {/* carcasa */}
      <mesh>
        <boxGeometry args={[0.56, H + 0.08, 0.4]} />
        <meshPhysicalMaterial color="#cfefff" transparent opacity={0.16} roughness={0.05} clearcoat={1} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {[
        [0, (H + 0.08) / 2, 0.58, 0.04],
        [0, -(H + 0.08) / 2, 0.58, 0.04],
        [0.28, 0, 0.04, H + 0.08],
        [-0.28, 0, 0.04, H + 0.08],
      ].map(([x, y, w, hh], i) => (
        <mesh key={i} position={[x, y, 0.2]}>
          <boxGeometry args={[w, hh, 0.04]} />
          <meshStandardMaterial color="#e8f4f2" emissive="#e8f4f2" emissiveIntensity={0.25} />
        </mesh>
      ))}
      {/* borne */}
      <mesh position={[0, (H + 0.08) / 2 + 0.06, 0]}>
        <boxGeometry args={[0.22, 0.12, 0.2]} />
        <meshStandardMaterial color="#e8f4f2" emissive="#e8f4f2" emissiveIntensity={0.25} />
      </mesh>
      {/* carga */}
      <mesh position={[0, -H / 2 + 0.04 + h / 2, 0]}>
        <boxGeometry args={[0.46, h, 0.3]} />
        <meshStandardMaterial color={hex} emissive={hex} emissiveIntensity={brillo} />
      </mesh>
      {/* rayo */}
      <mesh position={[0, 0, 0.23]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.07, 0.42, 0.02]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
      </mesh>
    </group>
  );
};

// ---- Leucina (aminoacido resaltado) ------------------------------------------------

/** Leucina: esfera naranja con anillo, para distinguirla de los demas aminoacidos. */
export const Leucina: React.FC<{ p: V3; r?: number; op?: number; brillo?: number; giro?: number }> = ({ p, r = 0.09, op = 1, brillo = 0.8, giro = 0 }) => (
  <group position={p} rotation={[0.9, giro, 0.3]}>
    <Esfera p={[0, 0, 0]} r={r} color={LEU_C} brillo={brillo} op={op} />
    <mesh>
      <torusGeometry args={[r * 1.6, r * 0.18, 8, 28]} />
      <meshStandardMaterial color="#ffe0b8" emissive={LEU_C} emissiveIntensity={0.8} transparent={op < 1} opacity={op} />
    </mesh>
    <mesh>
      <sphereGeometry args={[r * 2.2, 12, 10]} />
      <meshBasicMaterial color={LEU_C} transparent opacity={0.14 * op} depthWrite={false} />
    </mesh>
  </group>
);

// ---- AMPK: candado rojo (freno) ------------------------------------------------------

/** Candado rojo que representa a AMPK (metafora rotulada). act 0..1 = brillo; cierra 0..1 baja el arco. */
export const Candado: React.FC<{ p: V3; escala?: number; act?: number; cierra?: number; op?: number; giro?: number }> = ({
  p,
  escala = 1,
  act = 0,
  cierra = 1,
  op = 1,
  giro = 0,
}) => (
  <group position={p} scale={escala} rotation={[0, 0, giro]}>
    <mesh>
      <boxGeometry args={[0.62, 0.5, 0.26]} />
      <meshPhysicalMaterial color={AMPK_C} emissive={AMPK_C} emissiveIntensity={0.2 + act * 0.9} clearcoat={0.7} roughness={0.3} transparent={op < 1} opacity={op} />
    </mesh>
    <mesh position={[0, 0.25 + mix(0.16, 0, cierra), 0]}>
      <torusGeometry args={[0.19, 0.05, 12, 28, Math.PI]} />
      <meshStandardMaterial color="#c9d3dc" metalness={0.8} roughness={0.3} transparent={op < 1} opacity={op} />
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * 0.19, 0.25 + mix(0.16, 0, cierra) - 0.06, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.14, 12]} />
        <meshStandardMaterial color="#c9d3dc" metalness={0.8} roughness={0.3} transparent={op < 1} opacity={op} />
      </mesh>
    ))}
    {/* cerradura */}
    <mesh position={[0, 0.02, 0.135]}>
      <circleGeometry args={[0.06, 20]} />
      <meshBasicMaterial color="#2a0508" />
    </mesh>
    <mesh position={[0, -0.07, 0.135]}>
      <planeGeometry args={[0.04, 0.12]} />
      <meshBasicMaterial color="#2a0508" />
    </mesh>
    {act > 0.02 ? (
      <mesh>
        <sphereGeometry args={[0.6, 20, 14]} />
        <meshBasicMaterial color={AMPK_C} transparent opacity={act * 0.14 * op} depthWrite={false} />
      </mesh>
    ) : null}
  </group>
);

// ---- Comida extra ------------------------------------------------------------------

/** Vaso de leche (lacteos). */
export const VasoLeche: React.FC<{ p: V3; escala?: number; nivel?: number }> = ({ p, escala = 1, nivel = 0.8 }) => (
  <group position={p} scale={escala}>
    <mesh position={[0, 0.3, 0]}>
      <cylinderGeometry args={[0.2, 0.17, 0.6, 32, 1, true]} />
      <meshPhysicalMaterial color="#dff4ff" transparent opacity={0.25} roughness={0.05} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
    <mesh position={[0, (0.6 * nivel) / 2 + 0.01, 0]}>
      <cylinderGeometry args={[0.17 + 0.03 * nivel, 0.165, 0.6 * nivel, 32]} />
      <meshPhysicalMaterial color="#fbfbf6" roughness={0.35} clearcoat={0.3} />
    </mesh>
  </group>
);

/** Vainas de soya (edamame). */
export const Edamame: React.FC<{ p: V3; escala?: number }> = ({ p, escala = 1 }) => (
  <group position={p} scale={escala}>
    {[
      [-0.12, 0, 0.05, 0.4],
      [0.1, 0.02, -0.06, -0.3],
      [0.0, 0.06, 0.12, 1.2],
    ].map(([x, y, z, r], i) => (
      <group key={i} position={[x, y + 0.06, z]} rotation={[Math.PI / 2, 0, r]}>
        <mesh scale={[0.85, 1, 0.6]}>
          <capsuleGeometry args={[0.08, 0.32, 8, 16]} />
          <meshPhysicalMaterial color="#6fbf3a" roughness={0.5} clearcoat={0.3} />
        </mesh>
        {[-0.12, 0, 0.12].map((yy) => (
          <mesh key={yy} position={[0, yy, -0.03]} scale={[0.07, 0.07, 0.06]}>
            <sphereGeometry args={[1, 12, 10]} />
            <meshStandardMaterial color="#8fdc4f" />
          </mesh>
        ))}
      </group>
    ))}
  </group>
);

// ---- Iconos -------------------------------------------------------------------------

/** Palomita 3D (de cara a +Z). */
export const Check: React.FC<{ p: V3; escala?: number; color?: string; op?: number }> = ({ p, escala = 1, color = K.lima, op = 1 }) => (
  <group position={p} scale={escala}>
    <mesh position={[-0.11, -0.05, 0]} rotation={[0, 0, 0.8]}>
      <boxGeometry args={[0.08, 0.26, 0.08]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent={op < 1} opacity={op} />
    </mesh>
    <mesh position={[0.08, 0.06, 0]} rotation={[0, 0, -0.62]}>
      <boxGeometry args={[0.08, 0.48, 0.08]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent={op < 1} opacity={op} />
    </mesh>
  </group>
);

/** Signo "aproximadamente igual" en 3D. */
export const Aprox: React.FC<{ p: V3; escala?: number; color?: string }> = ({ p, escala = 1, color = K.lima }) => (
  <group position={p} scale={escala}>
    {[0.09, -0.09].map((y) => (
      <Tubo
        key={y}
        puntos={Array.from({ length: 9 }).map((_, i) => [-0.22 + i * 0.055, y + Math.sin(i * 0.8) * 0.05, 0] as V3)}
        radio={0.032}
        color={color}
        emisivo={0.7}
      />
    ))}
  </group>
);

/** Pedestal redondo con aro de color (para los indicadores que revisa mTOR). */
export const Pedestal: React.FC<{ p: V3; color: string; on?: number; r?: number }> = ({ p, color, on = 0, r = 0.42 }) => (
  <group position={p}>
    <mesh>
      <cylinderGeometry args={[r, r * 1.1, 0.1, 40]} />
      <meshStandardMaterial color="#14262b" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.052, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[r * 0.98, 0.025, 8, 48]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3 + on * 1.3} />
    </mesh>
    {on > 0.02 ? (
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[r * 0.95, r * 0.95, 1.0, 32, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={on * 0.12} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    ) : null}
  </group>
);

// ---- Bicicleta y ciclista ----------------------------------------------------------------

const BICI = { rueda: 0.34, ejeY: 0.34, zRueda: 0.56, bb: [0, 0.34, 0] as V3, sillin: [0, 0.97, -0.24] as V3, manubrio: [0, 1.14, 0.26] as V3, biela: 0.16 };

/** Bicicleta a lo largo de Z (el ciclista mira a +Z). giro = angulo de la biela (rad). */
export const Bici: React.FC<{ giro: number; color?: string }> = ({ giro, color = K.cian }) => {
  const { rueda, ejeY, zRueda, bb, sillin, manubrio, biela } = BICI;
  const ruedaT: V3 = [0, ejeY, -zRueda];
  const ruedaD: V3 = [0, ejeY, zRueda];
  const tubos: [V3, V3][] = [
    [bb, [0, sillin[1] - 0.08, sillin[2] + 0.02]],
    [bb, [0, manubrio[1] - 0.2, manubrio[2] - 0.08]],
    [[0, sillin[1] - 0.12, sillin[2] + 0.03], [0, manubrio[1] - 0.2, manubrio[2] - 0.08]],
    [bb, ruedaT],
    [ruedaT, [0, sillin[1] - 0.12, sillin[2] + 0.03]],
    [[0, manubrio[1] - 0.2, manubrio[2] - 0.08], ruedaD],
    [[0, manubrio[1] - 0.2, manubrio[2] - 0.08], [0, manubrio[1], manubrio[2] - 0.04]],
  ];
  const ped = (s: number): V3 => [s * 0.11, bb[1] - Math.cos(giro + (s > 0 ? 0 : Math.PI)) * biela, bb[2] + Math.sin(giro + (s > 0 ? 0 : Math.PI)) * biela];
  return (
    <group>
      {[ruedaT, ruedaD].map((c, i) => (
        <group key={i} position={c}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[rueda, 0.028, 10, 48]} />
            <meshStandardMaterial color="#1a1d22" roughness={0.7} />
          </mesh>
          {Array.from({ length: 6 }).map((_, k) => (
            <mesh key={k} rotation={[giro * 1.6 + (k * Math.PI) / 6, 0, 0]}>
              <cylinderGeometry args={[0.006, 0.006, rueda * 2, 4]} />
              <meshStandardMaterial color="#c9d3dc" metalness={0.7} />
            </mesh>
          ))}
        </group>
      ))}
      {tubos.map(([a, b], i) => (
        <Enlace key={i} a={a} b={b} r={0.026} color={color} brillo={0.35} />
      ))}
      {/* sillin y manubrio */}
      <mesh position={sillin} scale={[0.09, 0.03, 0.16]}>
        <sphereGeometry args={[1, 16, 10]} />
        <meshStandardMaterial color="#1a1d22" />
      </mesh>
      <mesh position={manubrio} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.46, 10]} />
        <meshStandardMaterial color="#c9d3dc" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* bielas y pedales */}
      {[1, -1].map((s) => {
        const q = ped(s);
        return (
          <group key={s}>
            <Enlace a={[s * 0.06, bb[1], bb[2]]} b={[s * 0.08, q[1], q[2]]} r={0.016} color="#c9d3dc" />
            <mesh position={q}>
              <boxGeometry args={[0.1, 0.02, 0.07]} />
              <meshStandardMaterial color="#2a2f36" />
            </mesh>
          </group>
        );
      })}
      <mesh position={bb} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.03, 24]} />
        <meshStandardMaterial color="#c9d3dc" metalness={0.7} />
      </mesh>
    </group>
  );
};

/** Cinematica inversa de una pierna (muslo 0.44, pierna 0.43) hacia un pie en (adelante f, abajo d). */
const ikPierna = (f: number, d: number): [number, number] => {
  const L1 = 0.44;
  const L2 = 0.45;
  const D = Math.min(L1 + L2 - 0.001, Math.hypot(f, d));
  const fi = Math.atan2(f, d);
  const al = Math.acos(cl((L1 * L1 + D * D - L2 * L2) / (2 * L1 * D)));
  const be = Math.acos(cl((L1 * L1 + L2 * L2 - D * D) / (2 * L1 * L2)));
  return [fi + al, Math.PI - be];
};

/** Ciclista pedaleando (Humano sobre la Bici). giro = angulo de la biela. */
export const Ciclista: React.FC<{ giro: number; brilla?: number; colorBrillo?: string; color?: string }> = ({ giro, brilla = 0, colorBrillo, color }) => {
  const { bb, sillin, biela } = BICI;
  const cadera: V3 = [0, sillin[1] + 0.04, sillin[2]];
  const pierna = (fase: number) => {
    const py = bb[1] - Math.cos(fase) * biela + 0.03;
    const pz = bb[2] + Math.sin(fase) * biela;
    return ikPierna(pz - cadera[2], cadera[1] - py);
  };
  const [hD, rD] = pierna(giro);
  const [hI, rI] = pierna(giro + Math.PI);
  return (
    <group>
      <Bici giro={giro} color={color} />
      <group position={[0, cadera[1] - 0.95, cadera[2]]}>
        <Humano
          musculo={0.8}
          brilla={brilla}
          colorBrillo={colorBrillo}
          pose={{
            caderaD: [-hD, 0, 0.02],
            caderaI: [-hI, 0, -0.02],
            rodillaD: rD,
            rodillaI: rI,
            hombroD: [-0.92, 0, 0.12],
            hombroI: [-0.92, 0, -0.12],
            codoD: -0.2,
            codoI: -0.2,
          }}
        />
      </group>
    </group>
  );
};
