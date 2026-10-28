// Modelos 3D del short "¿Existe la ventana anabólica?": shaker, atleta con shaker,
// ventana que se cierra, puerta abierta con luz, comida con carbohidratos, mancuerna,
// tarjetas 3D, calendario de semanas y signo igual.
import React from "react";
import * as THREE from "three";
import { mix, V3 } from "../fisio/motor";
import { Humano } from "../fisio/modelos/cuerpo";
import { rnd, Tubo } from "../fisio/modelos/comun";
import { K } from "./marco";

// ---- Shaker / licuado de proteina ----------------------------------------------------

/** Vaso shaker (origen en el centro). nivel 0..1 del licuado; inclina en rad (para beber). */
export const Shaker: React.FC<{ nivel?: number; escala?: number; inclina?: number; color?: string; brillo?: number }> = ({
  nivel = 0.8,
  escala = 1,
  inclina = 0,
  color = K.lima,
  brillo = 0.3,
}) => {
  const h = 0.17;
  const r = 0.042;
  const liq = Math.max(0.005, h * 0.95 * nivel);
  return (
    <group scale={escala} rotation={[inclina, 0, 0]}>
      {/* cuerpo transparente */}
      <mesh>
        <cylinderGeometry args={[r, r * 0.88, h, 32, 1, true]} />
        <meshPhysicalMaterial color="#e8f6ff" transparent opacity={0.3} roughness={0.05} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* licuado */}
      <mesh position={[0, -h / 2 + liq / 2 + 0.003, 0]}>
        <cylinderGeometry args={[r * 0.95, r * 0.85, liq, 28]} />
        <meshPhysicalMaterial color="#e9cfa6" emissive="#c9935a" emissiveIntensity={0.15} roughness={0.4} />
      </mesh>
      {/* fondo */}
      <mesh position={[0, -h / 2, 0]}>
        <cylinderGeometry args={[r * 0.88, r * 0.88, 0.008, 28]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={brillo} />
      </mesh>
      {/* tapa y pico */}
      <mesh position={[0, h / 2 + 0.018, 0]}>
        <cylinderGeometry args={[r * 1.05, r * 1.05, 0.036, 28]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={brillo} roughness={0.35} />
      </mesh>
      <mesh position={[0, h / 2 + 0.048, r * 0.4]}>
        <cylinderGeometry args={[0.011, 0.014, 0.026, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={brillo} />
      </mesh>
      {/* banda con marcas */}
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[r * 1.01, r * 0.97, 0.03, 28, 1, true]} />
        <meshStandardMaterial color="#20343a" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// ---- Atleta con shaker en la mano derecha --------------------------------------------

type Rot3 = [number, number, number];

/** Posicion de la mano (relativa al Humano) dado el angulo del hombro y del codo. */
export const manoHumano = (hombro: Rot3, codo: number, lado: 1 | -1 = 1): V3 => {
  const v = new THREE.Vector3(0, -0.33, 0)
    .applyEuler(new THREE.Euler(codo, 0, 0))
    .add(new THREE.Vector3(0, -0.3, 0))
    .applyEuler(new THREE.Euler(...hombro));
  return [0.23 * lado + v.x, 1.47 + v.y, v.z];
};

const POSE_SOSTIENE = { hombro: [-0.35, 0, 0.14] as Rot3, codo: -1.25 };
const POSE_BEBE = { hombro: [-1.35, 0, 0.32] as Rot3, codo: -2.05 };

/**
 * Atleta (Humano) con un shaker en la mano derecha. bebe 0..1 lleva el shaker a la boca.
 * marcha/fase: camina en el sitio. vacio 0..1 baja el nivel del licuado.
 */
export const AtletaShaker: React.FC<{
  bebe?: number;
  marcha?: number;
  fase?: number;
  brilla?: number;
  colorBrillo?: string;
  musculo?: number;
  vacio?: number;
  colorShaker?: string;
}> = ({ bebe = 0, marcha = 0, fase = 0, brilla = 0, colorBrillo, musculo = 0.8, vacio = 0, colorShaker }) => {
  const hombro: Rot3 = [
    mix(POSE_SOSTIENE.hombro[0], POSE_BEBE.hombro[0], bebe),
    0,
    mix(POSE_SOSTIENE.hombro[2], POSE_BEBE.hombro[2], bebe),
  ];
  const codo = mix(POSE_SOSTIENE.codo, POSE_BEBE.codo, bebe);
  const mano = manoHumano(hombro, codo, 1);
  const sube = Math.abs(Math.cos(fase)) * 0.025 * marcha;
  return (
    <group>
      <Humano
        fase={fase}
        marcha={marcha}
        musculo={musculo}
        brilla={brilla}
        colorBrillo={colorBrillo}
        pose={{ hombroD: hombro, codoD: codo, ...(marcha === 0 ? { hombroI: [0, 0, -0.12], codoI: -0.15, caderaD: [0, 0, 0.04], caderaI: [0, 0, -0.04], rodillaD: 0, rodillaI: 0 } : {}) }}
      />
      <group position={[mano[0] - 0.01, mano[1] + sube + 0.02, mano[2] + 0.02]}>
        <Shaker nivel={0.85 * (1 - vacio)} inclina={-bebe * 1.9} color={colorShaker} />
      </group>
    </group>
  );
};

// ---- Ventana que se cierra ------------------------------------------------------------

/** Ventana con dos hojas que se cierran (de cara a +Z, centrada). cierre 0..1, luz 0..1 del cristal. */
export const MarcoVentana: React.FC<{ ancho?: number; alto?: number; cierre: number; luz?: number; color?: string }> = ({
  ancho = 1.6,
  alto = 1.8,
  cierre,
  luz = 1,
  color = K.amarillo,
}) => {
  const g = 0.09;
  const ang = (1 - cierre) * 1.45;
  return (
    <group>
      {/* luz del otro lado */}
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[ancho, alto]} />
        <meshBasicMaterial color={new THREE.Color("#1a2a2e").lerp(new THREE.Color(color), 0.15 + 0.85 * luz)} />
      </mesh>
      {/* marco */}
      {[
        [0, alto / 2 + g / 2, ancho + g * 2, g],
        [0, -alto / 2 - g / 2, ancho + g * 2, g],
        [ancho / 2 + g / 2, 0, g, alto],
        [-ancho / 2 - g / 2, 0, g, alto],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <boxGeometry args={[w, h, 0.14]} />
          <meshPhysicalMaterial color="#e7e1d4" roughness={0.5} clearcoat={0.4} />
        </mesh>
      ))}
      {/* repisa */}
      <mesh position={[0, -alto / 2 - g - 0.03, 0.08]}>
        <boxGeometry args={[ancho + g * 3, 0.06, 0.3]} />
        <meshPhysicalMaterial color="#e7e1d4" roughness={0.5} />
      </mesh>
      {/* hojas */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (ancho / 2), 0, 0.05]} rotation={[0, s * ang, 0]}>
          <group position={[-s * (ancho / 4), 0, 0]}>
            <mesh>
              <boxGeometry args={[ancho / 2 - 0.01, alto - 0.01, 0.05]} />
              <meshPhysicalMaterial color="#8a3b2e" roughness={0.55} clearcoat={0.3} />
            </mesh>
            {/* listones (persiana) */}
            {Array.from({ length: 7 }).map((_, i) => (
              <mesh key={i} position={[0, -alto / 2 + ((i + 1) * alto) / 8, 0.03]}>
                <boxGeometry args={[ancho / 2 - 0.12, 0.03, 0.02]} />
                <meshStandardMaterial color="#5e2219" />
              </mesh>
            ))}
          </group>
        </group>
      ))}
    </group>
  );
};

// ---- Puerta abierta con luz -----------------------------------------------------------

/** Puerta (de cara a +Z, base en y = 0). abre 0..1 gira la hoja hacia el frente; luz 0..1. */
export const Puerta: React.FC<{ ancho?: number; alto?: number; abre: number; luz?: number; color?: string }> = ({
  ancho = 1.1,
  alto = 2.1,
  abre,
  luz = 1,
  color = "#fff3c4",
}) => {
  const g = 0.1;
  return (
    <group>
      {/* pared */}
      <mesh position={[0, alto / 2 + 0.4, -0.08]}>
        <planeGeometry args={[ancho + 3.2, alto + 2.4]} />
        <meshStandardMaterial color="#123036" roughness={0.9} transparent opacity={0.9} />
      </mesh>
      {/* luz del vano */}
      <mesh position={[0, alto / 2, -0.06]}>
        <planeGeometry args={[ancho, alto]} />
        <meshBasicMaterial color={new THREE.Color("#0b1a1d").lerp(new THREE.Color(color), luz)} />
      </mesh>
      {[1.15, 1.35].map((k, i) => (
        <mesh key={i} position={[0, alto / 2, -0.07]}>
          <planeGeometry args={[ancho * k + 0.1, alto * (1 + (k - 1) * 0.4)]} />
          <meshBasicMaterial color={color} transparent opacity={(0.25 - i * 0.1) * luz} depthWrite={false} />
        </mesh>
      ))}
      {/* marco */}
      {[
        [0, alto + g / 2, ancho + g * 2, g],
        [ancho / 2 + g / 2, alto / 2, g, alto],
        [-ancho / 2 - g / 2, alto / 2, g, alto],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <boxGeometry args={[w, h, 0.16]} />
          <meshPhysicalMaterial color="#e7e1d4" roughness={0.5} clearcoat={0.4} />
        </mesh>
      ))}
      {/* hoja (bisagra a la izquierda) */}
      <group position={[-ancho / 2, 0, 0.02]} rotation={[0, -abre * 1.75, 0]}>
        <mesh position={[ancho / 2, alto / 2, 0]}>
          <boxGeometry args={[ancho - 0.02, alto - 0.02, 0.06]} />
          <meshPhysicalMaterial color="#8a3b2e" roughness={0.5} clearcoat={0.3} />
        </mesh>
        {[0.28, 0.72].map((f) => (
          <mesh key={f} position={[ancho / 2, alto * f, 0.035]}>
            <boxGeometry args={[ancho * 0.7, alto * 0.34, 0.02]} />
            <meshStandardMaterial color="#6d2c22" />
          </mesh>
        ))}
        <mesh position={[ancho - 0.12, alto * 0.48, 0.07]}>
          <sphereGeometry args={[0.04, 16, 12]} />
          <meshPhysicalMaterial color="#f2c14e" metalness={0.8} roughness={0.25} />
        </mesh>
      </group>
      {/* haz de luz en el piso */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 1.1]}>
        <planeGeometry args={[ancho * 1.4, 2.2]} />
        <meshBasicMaterial color={color} transparent opacity={0.22 * luz} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 1.4]}>
        <planeGeometry args={[ancho + 3.2, 3.2]} />
        <meshStandardMaterial color="#0d2428" roughness={0.9} />
      </mesh>
    </group>
  );
};

// ---- Comida con carbohidratos -------------------------------------------------------------

/** Monton de arroz blanco. */
export const Arroz: React.FC<{ p: V3; escala?: number }> = ({ p, escala = 1 }) => (
  <group position={p} scale={escala}>
    <mesh scale={[1, 0.55, 1]}>
      <sphereGeometry args={[0.26, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#f3f0e6" roughness={0.8} />
    </mesh>
    {Array.from({ length: 34 }).map((_, i) => {
      const a = rnd(`ar${i}`) * Math.PI * 2;
      const e = rnd(`ae${i}`) * 1.3;
      const q: V3 = [Math.cos(a) * Math.sin(e) * 0.26, Math.cos(e) * 0.26 * 0.55, Math.sin(a) * Math.sin(e) * 0.26];
      return (
        <mesh key={i} position={q} rotation={[rnd(`ax${i}`) * 3, a, 0]} scale={[0.035, 0.014, 0.014]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
      );
    })}
  </group>
);

/** Rebanada de pan (de pie, de cara a +Z). */
export const PanRebanada: React.FC<{ p: V3; escala?: number; giro?: number }> = ({ p, escala = 1, giro = 0 }) => (
  <group position={p} scale={escala} rotation={[0, giro, 0]}>
    <mesh position={[0, 0.13, 0]}>
      <boxGeometry args={[0.34, 0.26, 0.06]} />
      <meshStandardMaterial color="#b9773a" roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.29, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 1]}>
      <cylinderGeometry args={[0.13, 0.13, 0.06, 28]} />
      <meshStandardMaterial color="#b9773a" roughness={0.8} />
    </mesh>
    {[-0.09, 0.09].map((x) => (
      <mesh key={x} position={[x, 0.29, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.06, 24]} />
        <meshStandardMaterial color="#b9773a" roughness={0.8} />
      </mesh>
    ))}
    {/* miga */}
    <mesh position={[0, 0.17, 0.031]}>
      <planeGeometry args={[0.29, 0.28]} />
      <meshStandardMaterial color="#f4ddb0" roughness={0.9} />
    </mesh>
    {[-0.08, 0.08].map((x) => (
      <mesh key={x} position={[x, 0.3, 0.031]}>
        <circleGeometry args={[0.085, 24]} />
        <meshStandardMaterial color="#f4ddb0" roughness={0.9} />
      </mesh>
    ))}
  </group>
);

/** Platano (tubo curvo amarillo con puntas cafes). */
export const Platano: React.FC<{ p: V3; escala?: number; giro?: number }> = ({ p, escala = 1, giro = 0 }) => {
  const pts: V3[] = [
    [-0.3, 0.12, 0],
    [-0.15, 0.03, 0],
    [0, 0, 0],
    [0.15, 0.03, 0],
    [0.3, 0.12, 0],
  ];
  return (
    <group position={p} scale={escala} rotation={[0, giro, 0]}>
      <Tubo puntos={pts} radio={0.065} color="#ffd23f" emisivo={0.15} segmentos={24} />
      {[pts[0], pts[4]].map((q, i) => (
        <mesh key={i} position={q}>
          <sphereGeometry args={[0.04, 10, 8]} />
          <meshStandardMaterial color="#5a3b1c" />
        </mesh>
      ))}
    </group>
  );
};

// ---- Pesas, tarjetas y simbolos ---------------------------------------------------------

/** Mancuerna horizontal (eje X). */
export const Mancuerna: React.FC<{ p: V3; escala?: number; giro?: number; color?: string }> = ({ p, escala = 1, giro = 0, color = "#2a2f36" }) => (
  <group position={p} scale={escala} rotation={[0, 0, giro]}>
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.04, 0.04, 0.9, 16]} />
      <meshStandardMaterial color="#c9d3dc" metalness={0.8} roughness={0.3} />
    </mesh>
    {[-1, 1].map((s) =>
      [0.3, 0.38].map((x, i) => (
        <mesh key={`${s}${i}`} position={[s * x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2 - i * 0.04, 0.2 - i * 0.04, 0.07, 32]} />
          <meshPhysicalMaterial color={color} metalness={0.4} roughness={0.35} clearcoat={0.5} />
        </mesh>
      )),
    )}
  </group>
);

/** Tarjeta/panel 3D con borde luminoso (de cara a +Z, centrada). */
export const Tarjeta3D: React.FC<{ ancho: number; alto: number; color: string; brillo?: number }> = ({ ancho, alto, color, brillo = 0.6 }) => {
  const g = 0.04;
  return (
    <group>
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[ancho, alto, 0.05]} />
        <meshPhysicalMaterial color="#0c2328" roughness={0.6} clearcoat={0.5} transparent opacity={0.92} />
      </mesh>
      {[
        [0, alto / 2, ancho + g, g],
        [0, -alto / 2, ancho + g, g],
        [ancho / 2, 0, g, alto],
        [-ancho / 2, 0, g, alto],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <boxGeometry args={[w, h, 0.05]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={brillo} />
        </mesh>
      ))}
    </group>
  );
};

/** Signo "=" en 3D. */
export const Igual: React.FC<{ p: V3; escala?: number; color?: string }> = ({ p, escala = 1, color = K.lima }) => (
  <group position={p} scale={escala}>
    {[0.07, -0.07].map((y) => (
      <mesh key={y} position={[0, y, 0]}>
        <boxGeometry args={[0.3, 0.07, 0.07]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
      </mesh>
    ))}
  </group>
);

/** Tablero de semanas (de cara a +Z): n casillas en 2 filas; marca 0..1 cuantas se encienden. */
export const Semanas: React.FC<{ n?: number; marca: number; color?: string }> = ({ n = 10, marca, color = K.lima }) => {
  const cols = Math.ceil(n / 2);
  const w = cols * 0.2 + 0.1;
  return (
    <group>
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[w, 0.56, 0.04]} />
        <meshStandardMaterial color="#f4f7f2" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.25, -0.005]}>
        <boxGeometry args={[w, 0.1, 0.03]} />
        <meshStandardMaterial color={K.morado} emissive={K.morado} emissiveIntensity={0.35} />
      </mesh>
      {Array.from({ length: n }).map((_, i) => {
        const on = i < marca * n - 0.01;
        return (
          <mesh key={i} position={[-w / 2 + 0.15 + (i % cols) * 0.2, 0.07 - Math.floor(i / cols) * 0.19, 0]}>
            <boxGeometry args={[0.16, 0.14, 0.02]} />
            <meshStandardMaterial color={on ? color : "#d5dcdf"} emissive={on ? color : "#000"} emissiveIntensity={on ? 0.45 : 0} />
          </mesh>
        );
      })}
    </group>
  );
};
