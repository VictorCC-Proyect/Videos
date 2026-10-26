// Modelos 3D del short "¿Qué le pasa a tu músculo mientras duermes?".
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Cam, mix, V3, visible } from "../fisio/motor";
import { Esfera } from "../fisio/modelos/energia";
import { ANTON, INTER, K } from "./marco";

// ---- Fases del sueno -----------------------------------------------------------------

export const FASE_COL = { W: K.amarillo, R: "#ff6fd8", L: K.cian, P: "#3b6bff" };
export type Fase = keyof typeof FASE_COL;
/** Nivel vertical de cada fase (hipnograma clasico: despierto arriba, profundo abajo). */
export const FASE_Y: Record<Fase, number> = { W: 3, R: 2, L: 1, P: 0 };
export const FASE_NOMBRE: Record<Fase, string> = { W: "DESPIERTO", R: "REM", L: "LIGERO", P: "PROFUNDO" };

/** Una noche de 8 h (minutos): 5 ciclos de ~90-100 min; profundo al inicio, REM al final. */
export const NOCHE: [Fase, number, number][] = [
  ["W", 0, 8],
  ["L", 8, 25],
  ["P", 25, 75],
  ["L", 75, 85],
  ["R", 85, 95],
  ["L", 95, 110],
  ["P", 110, 155],
  ["L", 155, 170],
  ["R", 170, 190],
  ["L", 190, 215],
  ["P", 215, 235],
  ["L", 235, 255],
  ["R", 255, 285],
  ["L", 285, 335],
  ["R", 335, 380],
  ["L", 380, 420],
  ["R", 420, 470],
  ["W", 470, 480],
];
export const CICLOS = [95, 190, 285, 380];

/**
 * Hipnograma 3D: bloques por fase (x = tiempo, y = nivel). hasta = minutos ya dibujados;
 * resalta = indice del bloque a iluminar (-1 ninguno); ancho y alto en unidades de escena.
 */
export const Hipnograma: React.FC<{ hasta: number; ancho?: number; alto?: number; resalta?: number; fase?: Fase | null; ciclos?: number }> = ({
  hasta,
  ancho = 4,
  alto = 2.4,
  resalta = -1,
  fase = null,
  ciclos = 0,
}) => {
  const X = (m: number) => -ancho / 2 + (m / 480) * ancho;
  const Y = (f: Fase) => (FASE_Y[f] / 3) * alto;
  return (
    <group>
      {/* carriles */}
      {(Object.keys(FASE_Y) as Fase[]).map((f) => (
        <mesh key={f} position={[0, Y(f), -0.2]}>
          <boxGeometry args={[ancho + 0.1, 0.012, 0.012]} />
          <meshBasicMaterial color={FASE_COL[f]} transparent opacity={0.3 + (fase === f ? 0.5 : 0)} />
        </mesh>
      ))}
      {/* separadores de ciclo */}
      {CICLOS.map((m, i) => (
        <mesh key={m} position={[X(m), alto / 2, -0.25]}>
          <boxGeometry args={[0.01, alto + 0.3, 0.01]} />
          <meshBasicMaterial color="#9fb8ff" transparent opacity={0.22 * Math.min(1, Math.max(0, ciclos * 5 - i))} />
        </mesh>
      ))}
      {NOCHE.map(([f, a, z], i) => {
        if (hasta <= a) return null;
        const zz = Math.min(z, hasta);
        const w = X(zz) - X(a);
        const on = resalta === i || fase === f;
        const prev = i > 0 ? NOCHE[i - 1][0] : f;
        const dy = Y(prev) - Y(f);
        return (
          <group key={i}>
            <mesh position={[X(a) + w / 2, Y(f), 0]}>
              <boxGeometry args={[Math.max(0.01, w), 0.14, 0.32]} />
              <meshPhysicalMaterial color={FASE_COL[f]} emissive={FASE_COL[f]} emissiveIntensity={on ? 1.1 : 0.35} roughness={0.35} clearcoat={0.6} />
            </mesh>
            {i > 0 && dy !== 0 ? (
              <mesh position={[X(a), Y(f) + dy / 2, 0]}>
                <boxGeometry args={[0.03, Math.abs(dy), 0.08]} />
                <meshStandardMaterial color="#dfe8ff" emissive="#dfe8ff" emissiveIntensity={0.3} />
              </mesh>
            ) : null}
          </group>
        );
      })}
    </group>
  );
};

/** Posicion (local del Hipnograma) del punto de la noche en el minuto m. */
export const puntoHipno = (m: number, ancho = 4, alto = 2.4): V3 => {
  const s = NOCHE.find(([, a, z]) => m >= a && m < z) ?? NOCHE[NOCHE.length - 1];
  return [-ancho / 2 + (m / 480) * ancho, (FASE_Y[s[0]] / 3) * alto, 0.2];
};

/** Hipnograma pequeno 2D (svg) para esquinas; resalta un bloque. */
export const MiniHipno: React.FC<{ x: number; y: number; w: number; h: number; resalta?: number; op?: number; cursor?: number }> = ({
  x,
  y,
  w,
  h,
  resalta = -1,
  op = 1,
  cursor = -1,
}) => {
  if (op <= 0) return null;
  const X = (m: number) => 150 + (m / 480) * (w - 170);
  const Y = (f: Fase) => 20 + (1 - FASE_Y[f] / 3) * (h - 60);
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: x, top: y, opacity: op, background: "rgba(4,14,17,0.8)", borderRadius: 24, border: "3px solid #2c4b55" }}>
      {(Object.keys(FASE_Y) as Fase[]).map((f) => (
        <text key={f} x={138} y={Y(f) + 9} textAnchor="end" fill={FASE_COL[f]} fontFamily={INTER} fontWeight={900} fontSize={22}>
          {FASE_NOMBRE[f]}
        </text>
      ))}
      {NOCHE.map(([f, a, z], i) => (
        <rect key={i} x={X(a)} y={Y(f) - 7} width={X(z) - X(a)} height={14} rx={4} fill={FASE_COL[f]} opacity={resalta < 0 || resalta === i ? 1 : 0.35} />
      ))}
      {resalta >= 0 ? (
        <rect x={X(NOCHE[resalta][1]) - 6} y={Y(NOCHE[resalta][0]) - 18} width={X(NOCHE[resalta][2]) - X(NOCHE[resalta][1]) + 12} height={36} rx={10} fill="none" stroke="#fff" strokeWidth={4} />
      ) : null}
      {cursor >= 0 ? <line x1={X(cursor)} x2={X(cursor)} y1={8} y2={h - 30} stroke="#fff" strokeWidth={4} /> : null}
      {[0, 2, 4, 6, 8].map((hh) => (
        <text key={hh} x={X(hh * 60)} y={h - 8} textAnchor="middle" fill={K.suave} fontFamily={INTER} fontWeight={800} fontSize={20}>
          {hh} h
        </text>
      ))}
    </svg>
  );
};

// ---- Textos pegados a puntos 3D (sin linea) ---------------------------------------------

const proyectar = (cam: Cam, p: V3, w: number, h: number) => {
  const c = new THREE.PerspectiveCamera(cam.fov, w / h, 0.01, 2000);
  c.position.set(...cam.p);
  c.lookAt(new THREE.Vector3(...cam.l));
  c.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(c);
  return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, ok: v.z < 1 };
};

export type Rotulo = { p: V3; t: React.ReactNode; a: number; z: number; color?: string; tam?: number; ancla?: "izq" | "der" | "centro"; anton?: boolean };

/** Textos sueltos que siguen puntos 3D (para ejes, valores, horas). */
export const Rotulos: React.FC<{ cam: Cam; b: number; items: Rotulo[] }> = ({ cam, b, items }) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {items.map((e, i) => {
        const op = visible(b, e.a, e.z, 0.06);
        if (op <= 0) return null;
        const q = proyectar(cam, e.p, width, height);
        if (!q.ok) return null;
        const tx = e.ancla === "der" ? "-100%" : e.ancla === "izq" ? "0%" : "-50%";
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: q.x,
              top: q.y,
              transform: `translate(${tx}, -50%)`,
              opacity: op,
              fontFamily: e.anton ? ANTON : INTER,
              fontWeight: 900,
              fontSize: e.tam ?? 30,
              color: e.color ?? K.tinta,
              whiteSpace: "nowrap",
              textShadow: "0 0 12px #000, 0 0 4px #000",
            }}
          >
            {e.t}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---- Habitacion ----------------------------------------------------------------------

/** Ventana con marco y cielo nocturno (de cara a +Z). */
export const Ventana: React.FC<{ ancho?: number; alto?: number }> = ({ ancho = 1.4, alto = 1.6 }) => (
  <group>
    <mesh position={[0, 0, -0.02]}>
      <planeGeometry args={[ancho, alto]} />
      <meshBasicMaterial color="#10224a" />
    </mesh>
    {[
      [0, alto / 2, ancho + 0.12, 0.08],
      [0, -alto / 2, ancho + 0.12, 0.08],
      [ancho / 2, 0, 0.08, alto],
      [-ancho / 2, 0, 0.08, alto],
      [0, 0, 0.05, alto],
      [0, 0.1, ancho, 0.05],
    ].map(([x, y, w, h], i) => (
      <mesh key={i} position={[x, y, 0.02]}>
        <boxGeometry args={[w, h, 0.06]} />
        <meshStandardMaterial color="#d9d2c4" roughness={0.6} />
      </mesh>
    ))}
    {/* cortinas */}
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * (ancho / 2 + 0.2), -0.05, 0.08]} scale={[0.22, alto / 2 + 0.15, 0.06]}>
        <sphereGeometry args={[1, 20, 16]} />
        <meshStandardMaterial color="#2b3c78" roughness={0.9} />
      </mesh>
    ))}
  </group>
);

/** Pared de fondo y suelo de la habitacion. */
export const Cuarto: React.FC<{ color?: string }> = ({ color = "#16213f" }) => (
  <group>
    <mesh position={[0, 2, -1.2]}>
      <planeGeometry args={[14, 7]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 1.5]}>
      <planeGeometry args={[14, 6]} />
      <meshStandardMaterial color="#1c1a26" roughness={0.9} />
    </mesh>
  </group>
);

/** Telefono con pantalla encendida (luz azul). */
export const Celular: React.FC<{ brillo?: number }> = ({ brillo = 1 }) => (
  <group>
    <mesh>
      <boxGeometry args={[0.16, 0.3, 0.02]} />
      <meshStandardMaterial color="#111" roughness={0.3} />
    </mesh>
    <mesh position={[0, 0, 0.011]}>
      <planeGeometry args={[0.14, 0.27]} />
      <meshBasicMaterial color="#9fdcff" />
    </mesh>
    <mesh position={[0, 0, 0.05]}>
      <sphereGeometry args={[0.22, 20, 14]} />
      <meshBasicMaterial color="#6fc8ff" transparent opacity={0.16 * brillo} depthWrite={false} />
    </mesh>
    <pointLight position={[0, 0, 0.3]} color="#7fd0ff" intensity={3 * brillo} distance={3} />
  </group>
);

// ---- Hormonas ------------------------------------------------------------------------

export const GH_C = "#5cf2a0";

/** Hipofisis: tallo + glandula esferica (local: tallo arriba). */
export const Hipofisis: React.FC<{ brillo?: number; escala?: number }> = ({ brillo = 0, escala = 1 }) => (
  <group scale={escala}>
    <mesh position={[0, 0.12, 0]}>
      <cylinderGeometry args={[0.025, 0.035, 0.22, 12]} />
      <meshStandardMaterial color="#f0b8b8" />
    </mesh>
    <mesh scale={[1.2, 0.9, 1]}>
      <sphereGeometry args={[0.1, 24, 18]} />
      <meshPhysicalMaterial color="#ffb3c1" emissive={GH_C} emissiveIntensity={0.2 + brillo * 1.4} roughness={0.4} clearcoat={0.5} />
    </mesh>
    <mesh>
      <sphereGeometry args={[0.24, 20, 14]} />
      <meshBasicMaterial color={GH_C} transparent opacity={0.15 * brillo} depthWrite={false} />
    </mesh>
  </group>
);

/** Hormona del crecimiento: proteina globular de 4 helices (esquema). */
export const MolGH: React.FC<{ p: V3; escala?: number; giro?: number; op?: number }> = ({ p, escala = 1, giro = 0, op = 1 }) => (
  <group position={p} scale={escala} rotation={[0.4, giro, 0.2]}>
    {[0, 1, 2, 3].map((i) => {
      const a = (i / 4) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.cos(a) * 0.07, 0, Math.sin(a) * 0.07]}>
          <capsuleGeometry args={[0.045, 0.16, 6, 12]} />
          <meshStandardMaterial color={GH_C} emissive={GH_C} emissiveIntensity={0.7} transparent={op < 1} opacity={op} />
        </mesh>
      );
    })}
  </group>
);

// ---- Medidores -----------------------------------------------------------------------

/** Balanza de proteina: platillo izq = sintesis (verde), der = degradacion (rojo). inclina -1..1 (+ = baja la derecha). */
export const Balanza: React.FC<{ inclina: number; sintesis: number; degrada: number }> = ({ inclina, sintesis, degrada }) => {
  const ang = -inclina * 0.32;
  const L = 1.3;
  const plat = (lado: number): V3 => [lado * L * Math.cos(ang), 2.0 + lado * L * Math.sin(ang), 0];
  const plato = (lado: number, n: number, color: string) => {
    const q = plat(lado);
    return (
      <group position={q} key={lado}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.22, -0.3, 0]} rotation={[0, 0, s * 0.35]}>
            <cylinderGeometry args={[0.008, 0.008, 0.66, 6]} />
            <meshStandardMaterial color="#cfd8dc" />
          </mesh>
        ))}
        <mesh position={[0, -0.62, 0]}>
          <cylinderGeometry args={[0.48, 0.38, 0.06, 40]} />
          <meshPhysicalMaterial color="#d9e2e6" metalness={0.6} roughness={0.3} />
        </mesh>
        {Array.from({ length: Math.round(n) }).map((_, i) => {
          const fila = Math.floor(i / 4);
          const k = i % 4;
          return <Esfera key={i} p={[(k - 1.5) * 0.19 + (fila % 2) * 0.08, -0.5 + fila * 0.16, ((i * 7) % 3 - 1) * 0.1]} r={0.085} color={color} brillo={0.5} />;
        })}
      </group>
    );
  };
  return (
    <group>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.55, 0.65, 0.06, 40]} />
        <meshPhysicalMaterial color="#2b3f45" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 2.0, 16]} />
        <meshPhysicalMaterial color="#c9d3d6" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, 2.0, 0]} rotation={[0, 0, ang]}>
        <boxGeometry args={[L * 2 + 0.1, 0.07, 0.07]} />
        <meshPhysicalMaterial color="#e6edf0" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, 2.07, 0.05]} rotation={[0, 0, ang]}>
        <coneGeometry args={[0.06, 0.25, 12]} />
        <meshStandardMaterial color={K.amarillo} emissive={K.amarillo} emissiveIntensity={0.4} />
      </mesh>
      {plato(-1, sintesis, "#3ee07a")}
      {plato(1, degrada, K.rojo)}
    </group>
  );
};

/** Reloj nocturno (esfera oscura); hora en horas decimales (22.5 = 22:30). */
export const RelojNoche: React.FC<{ hora: number; color?: string }> = ({ hora, color = "#8fb6ff" }) => {
  const h = ((hora % 12) / 12) * Math.PI * 2;
  const m = (hora % 1) * Math.PI * 2;
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.08, 48]} />
        <meshStandardMaterial color="#0f1a33" roughness={0.4} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.57, 0.06, 16, 48]} />
        <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.4} clearcoat={0.8} roughness={0.25} />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(a) * 0.45, Math.cos(a) * 0.45, 0.05]} rotation={[0, 0, -a]}>
            <boxGeometry args={[0.03, i % 3 ? 0.06 : 0.12, 0.02]} />
            <meshBasicMaterial color="#dfe8ff" />
          </mesh>
        );
      })}
      <group rotation={[0, 0, -h]} position={[0, 0, 0.06]}>
        <mesh position={[0, 0.13, 0]}>
          <boxGeometry args={[0.06, 0.26, 0.02]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
      <group rotation={[0, 0, -m]} position={[0, 0, 0.07]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.035, 0.4, 0.02]} />
          <meshStandardMaterial color={K.amarillo} emissive={K.amarillo} emissiveIntensity={0.6} />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.08]}>
        <sphereGeometry args={[0.04, 12, 10]} />
        <meshBasicMaterial color={K.amarillo} />
      </mesh>
    </group>
  );
};

/** Barra-medidor vertical con marca del valor basal (1 = basal). */
export const Barra3D: React.FC<{ valor: number; color: string; alto?: number; r?: number }> = ({ valor, color, alto = 1.4, r = 0.24 }) => {
  const h = Math.max(0.02, alto * valor);
  return (
    <group>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[r * 1.5, r * 1.6, 0.08, 40]} />
        <meshStandardMaterial color="#2b3f45" />
      </mesh>
      <mesh position={[0, 0.08 + h / 2, 0]}>
        <cylinderGeometry args={[r, r, h, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} />
      </mesh>
      <mesh position={[0, 0.08 + (alto * 1.35) / 2, 0]}>
        <cylinderGeometry args={[r * 1.25, r * 1.25, alto * 1.35, 32, 1, true]} />
        <meshPhysicalMaterial color="#cfefff" transparent opacity={0.15} roughness={0.05} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* nivel basal */}
      <mesh position={[0, 0.08 + alto, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r * 1.3, 0.018, 8, 40]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

/** Bloque apilable (kg perdidos): caja con bordes suaves. */
export const Bloque: React.FC<{ alto: number; color: string; ancho?: number; op?: number }> = ({ alto, color, ancho = 0.5, op = 1 }) => (
  <mesh position={[0, Math.max(0.005, alto) / 2, 0]}>
    <boxGeometry args={[ancho, Math.max(0.01, alto), ancho]} />
    <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.35} clearcoat={0.6} transparent={op < 1} opacity={op} />
  </mesh>
);

// ---- Checklist -------------------------------------------------------------------------

/** Calendario de pared con dias marcados (de cara a +Z). marca 0..1 cuantos dias tachados. */
export const Calendario: React.FC<{ marca?: number }> = ({ marca = 1 }) => (
  <group>
    <mesh>
      <boxGeometry args={[1.1, 1.1, 0.06]} />
      <meshStandardMaterial color="#f4f7f2" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.44, 0.035]}>
      <boxGeometry args={[1.1, 0.22, 0.02]} />
      <meshStandardMaterial color={K.morado} emissive={K.morado} emissiveIntensity={0.3} />
    </mesh>
    {[-0.3, 0.3].map((x) => (
      <mesh key={x} position={[x, 0.58, 0.04]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.06, 0.015, 8, 16]} />
        <meshStandardMaterial color="#9aa5a8" metalness={0.6} />
      </mesh>
    ))}
    {Array.from({ length: 16 }).map((_, i) => {
      const x = -0.39 + (i % 4) * 0.26;
      const y = 0.18 - Math.floor(i / 4) * 0.2;
      const on = i / 16 < marca;
      return (
        <mesh key={i} position={[x, y, 0.04]}>
          <boxGeometry args={[0.18, 0.13, 0.015]} />
          <meshStandardMaterial color={on ? K.lima : "#d5dcdf"} emissive={on ? K.lima : "#000"} emissiveIntensity={on ? 0.4 : 0} />
        </mesh>
      );
    })}
  </group>
);

/** Termometro (de cara a +Z); nivel 0..1, color del liquido. */
export const Termometro: React.FC<{ nivel: number; color?: string }> = ({ nivel, color = K.cian }) => (
  <group>
    <mesh position={[0, 0.25, 0]}>
      <capsuleGeometry args={[0.1, 1.1, 8, 20]} />
      <meshPhysicalMaterial color="#e8f6ff" transparent opacity={0.3} roughness={0.05} clearcoat={1} depthWrite={false} />
    </mesh>
    <mesh position={[0, -0.42, 0]}>
      <sphereGeometry args={[0.17, 24, 18]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </mesh>
    <mesh position={[0, -0.32 + (nivel * 1.05) / 2, 0]}>
      <cylinderGeometry args={[0.05, 0.05, Math.max(0.01, nivel * 1.05), 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </mesh>
    {Array.from({ length: 6 }).map((_, i) => (
      <mesh key={i} position={[0.13, -0.2 + i * 0.18, 0]}>
        <boxGeometry args={[0.08, 0.015, 0.015]} />
        <meshBasicMaterial color="#dfe8ff" />
      </mesh>
    ))}
  </group>
);

/** Brillo pulsante (halo) para destacar algo. */
export const Halo: React.FC<{ r: number; color: string; op: number }> = ({ r, color, op }) =>
  op > 0 ? (
    <mesh>
      <sphereGeometry args={[r, 24, 16]} />
      <meshBasicMaterial color={color} transparent opacity={op} depthWrite={false} />
    </mesh>
  ) : null;

/** Onda en anillo que se expande (actividad cerebral). f 0..1. */
export const Onda: React.FC<{ f: number; r?: number; color?: string }> = ({ f, r = 1.4, color = FASE_COL.R }) => (
  <mesh scale={mix(0.3, 1, f)}>
    <torusGeometry args={[r, 0.02, 8, 64]} />
    <meshBasicMaterial color={color} transparent opacity={(1 - f) * 0.8} depthWrite={false} />
  </mesh>
);
