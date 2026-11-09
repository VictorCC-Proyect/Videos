// Modelos 3D del short "¿La L-carnitina quema grasa?": carnitina, adrenalina, trigliceridos,
// lipasa hormono sensible (HSL), albumina, frasco rotulado, libro, calendario de 24 semanas,
// transportador del musculo, la metafora del puerto (muelle, estibadores, barcos) y la hoguera.
import React from "react";
import * as THREE from "three";
import { mix, V3 } from "../fisio/motor";
import { rnd } from "../fisio/modelos/comun";
import { Cadena, Enlace, Esfera, Mol } from "../fisio/modelos/energia";
import { K } from "./marco";

export const CARN_C = K.cian;
export const ADRE_C = "#ff5c8a";
export const ALB_C = "#8fa8ff";
export const GRASO = K.amarillo;
export const HSL_C = K.morado;
export const GLICEROL_C = "#e8f0ff";
export const OAA_C = "#47d18c";

// ---- Moleculas ---------------------------------------------------------------------------

/** L-carnitina: esqueleto corto (cian), amonio cuaternario (azul) y carboxilo (rojo). */
export const Carnitina: React.FC<{ p: V3; escala?: number; op?: number; brillo?: number; giro?: number }> = ({
  p,
  escala = 1,
  op = 1,
  brillo = 0.6,
  giro = 0,
}) => {
  const c: V3[] = [
    [-0.12, -0.03, 0],
    [0, 0.04, 0],
    [0.12, -0.03, 0],
  ];
  const n: V3 = [-0.25, 0.04, 0];
  const o: V3[] = [
    [0.24, 0.04, 0],
    [0.16, -0.15, 0],
  ];
  return (
    <group position={p} scale={escala} rotation={[0, 0, giro]}>
      {c.map((q, i) => (
        <Esfera key={i} p={q} r={0.065} color={CARN_C} brillo={brillo} op={op} />
      ))}
      <Esfera p={[0, 0.17, 0.02]} r={0.045} color="#ff6b6b" brillo={0.3} op={op} />
      <Esfera p={n} r={0.075} color="#4d7dff" brillo={0.5} op={op} />
      {(
        [
          [-0.33, 0.12, 0],
          [-0.31, -0.05, 0.05],
          [-0.27, 0.05, -0.1],
        ] as V3[]
      ).map((q, i) => (
        <Esfera key={`m${i}`} p={q} r={0.04} color="#bfe9ff" brillo={0.2} op={op} />
      ))}
      {o.map((q, i) => (
        <Esfera key={`o${i}`} p={q} r={0.05} color="#ff4b4b" brillo={0.25} op={op} />
      ))}
      <Enlace a={n} b={c[0]} r={0.02} op={op} />
      <Enlace a={c[0]} b={c[1]} r={0.02} op={op} />
      <Enlace a={c[1]} b={c[2]} r={0.02} op={op} />
      <Enlace a={c[2]} b={o[0]} r={0.02} op={op} />
      <Enlace a={c[2]} b={o[1]} r={0.02} op={op} />
      <mesh>
        <sphereGeometry args={[0.36, 16, 12]} />
        <meshBasicMaterial color={CARN_C} transparent opacity={0.13 * op} depthWrite={false} />
      </mesh>
    </group>
  );
};

/** Adrenalina (epinefrina): anillo aromatico con dos OH y cadena lateral con amina. */
export const Adrenalina: React.FC<{ p: V3; escala?: number; op?: number; giro?: number }> = ({ p, escala = 1, op = 1, giro = 0 }) => {
  const ring: V3[] = Array.from({ length: 6 }).map((_, i) => {
    const a = (i / 6) * Math.PI * 2;
    return [Math.cos(a) * 0.13, Math.sin(a) * 0.13, 0];
  });
  const lado: V3[] = [
    [0.26, 0, 0],
    [0.37, 0.07, 0],
    [0.49, 0, 0],
  ];
  return (
    <group position={p} scale={escala} rotation={[0.4, giro, giro * 0.5]}>
      {ring.map((q, i) => (
        <Esfera key={i} p={q} r={0.05} color={ADRE_C} brillo={0.6} op={op} />
      ))}
      {ring.map((q, i) => (
        <Enlace key={`e${i}`} a={q} b={ring[(i + 1) % 6]} r={0.018} op={op} />
      ))}
      {lado.map((q, i) => (
        <Esfera key={`l${i}`} p={q} r={0.045} color={ADRE_C} brillo={0.5} op={op} />
      ))}
      <Enlace a={ring[0]} b={lado[0]} r={0.018} op={op} />
      <Enlace a={lado[0]} b={lado[1]} r={0.018} op={op} />
      <Enlace a={lado[1]} b={lado[2]} r={0.018} op={op} />
      <Esfera p={[0.37, 0.19, 0]} r={0.04} color="#ff4b4b" op={op} />
      <Esfera p={[0.6, 0.05, 0]} r={0.045} color="#4d7dff" op={op} />
      <Esfera p={[-0.2, 0.12, 0]} r={0.04} color="#ff4b4b" op={op} />
      <Esfera p={[-0.2, -0.12, 0]} r={0.04} color="#ff4b4b" op={op} />
      <mesh position={[0.15, 0, 0]}>
        <sphereGeometry args={[0.42, 16, 12]} />
        <meshBasicMaterial color={ADRE_C} transparent opacity={0.12 * op} depthWrite={false} />
      </mesh>
    </group>
  );
};

/** Desplazamiento de cada acido graso al soltarse del triglicerido. */
const SALIDA: V3[] = [
  [0.9, 0.9, 0.2],
  [1.3, 0.05, 0.3],
  [0.8, -0.85, 0.1],
];

/**
 * Triglicerido: glicerol (3 esferas claras en vertical) + 3 acidos grasos (cadenas amarillas).
 * suelta 0..1 separa los acidos grasos (los corta la lipasa).
 */
export const Trigliceridos: React.FC<{ p: V3; escala?: number; suelta?: number; op?: number; opAG?: number }> = ({
  p,
  escala = 1,
  suelta = 0,
  op = 1,
  opAG = 1,
}) => (
  <group position={p} scale={escala}>
    {[0.22, 0, -0.22].map((y, i) => (
      <group key={i}>
        <Esfera p={[0, y, 0]} r={0.075} color={GLICEROL_C} brillo={0.3} op={op} />
        {i < 2 ? <Enlace a={[0, y, 0]} b={[0, y - 0.22, 0]} r={0.025} op={op} /> : null}
        {suelta < 0.05 ? <Enlace a={[0, y, 0]} b={[0.12, y, 0]} r={0.022} color="#ffe79a" op={op} /> : null}
        <Cadena
          n={8}
          p={[0.14 + SALIDA[i][0] * suelta, y + SALIDA[i][1] * suelta, SALIDA[i][2] * suelta]}
          color={GRASO}
          sep={0.11}
          brillo={0.5 + suelta * 0.4}
          op={op * opAG}
        />
      </group>
    ))}
  </group>
);

/** Lipasa hormono sensible como "pac-man" (metafora rotulada). Boca de cara a +X; boca 0..1. */
export const Lipasa: React.FC<{ p: V3; escala?: number; boca?: number; brillo?: number; giro?: number }> = ({
  p,
  escala = 1,
  boca = 0.5,
  brillo = 0.3,
  giro = 0,
}) => {
  const ang = 0.08 + boca * 0.55;
  const mat = (
    <meshPhysicalMaterial color={HSL_C} emissive={HSL_C} emissiveIntensity={brillo} roughness={0.3} clearcoat={0.7} side={THREE.DoubleSide} />
  );
  return (
    <group position={p} scale={escala} rotation={[0, giro, 0]}>
      <mesh rotation={[0, 0, ang]}>
        <sphereGeometry args={[0.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        {mat}
      </mesh>
      <mesh rotation={[0, 0, -ang]}>
        <sphereGeometry args={[0.3, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        {mat}
      </mesh>
      {/* ojo */}
      <group rotation={[0, 0, ang]}>
        <mesh position={[0.08, 0.2, 0.17]}>
          <sphereGeometry args={[0.045, 12, 10]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.1, 0.2, 0.205]}>
          <sphereGeometry args={[0.022, 10, 8]} />
          <meshBasicMaterial color="#10141a" />
        </mesh>
      </group>
      <mesh>
        <sphereGeometry args={[0.48, 16, 12]} />
        <meshBasicMaterial color={HSL_C} transparent opacity={0.1} depthWrite={false} />
      </mesh>
    </group>
  );
};

/** Albumina: proteina globular grande con acidos grasos pegados (n cadenas). */
export const Albumina: React.FC<{ p: V3; r?: number; n?: number; giro?: number; seed?: string; op?: number }> = ({
  p,
  r = 0.35,
  n = 3,
  giro = 0,
  seed = "al",
  op = 1,
}) => (
  <group position={p} rotation={[0, 0, giro]}>
    <mesh>
      <sphereGeometry args={[r, 32, 24]} />
      <meshPhysicalMaterial color={ALB_C} emissive={ALB_C} emissiveIntensity={0.18} roughness={0.4} clearcoat={0.5} transparent={op < 1} opacity={op} />
    </mesh>
    {Array.from({ length: 7 }).map((_, i) => {
      const a = rnd(`${seed}a${i}`) * Math.PI * 2;
      const e = (rnd(`${seed}e${i}`) - 0.5) * 2.4;
      const q: V3 = [Math.cos(a) * Math.cos(e) * r * 0.8, Math.sin(e) * r * 0.8, Math.sin(a) * Math.cos(e) * r * 0.8];
      return (
        <mesh key={i} position={q}>
          <sphereGeometry args={[r * 0.45, 16, 12]} />
          <meshPhysicalMaterial color={ALB_C} emissive={ALB_C} emissiveIntensity={0.15} roughness={0.45} clearcoat={0.4} transparent={op < 1} opacity={op} />
        </mesh>
      );
    })}
    {Array.from({ length: n }).map((_, i) => {
      const a = (i / Math.max(1, n)) * Math.PI * 2 + 0.6;
      return (
        <group key={`c${i}`} rotation={[0, 0, a]}>
          <Cadena n={6} p={[r * 1.05, 0, 0.1]} color={GRASO} sep={0.1} brillo={0.6} op={op} />
        </group>
      );
    })}
  </group>
);

// ---- Objetos rotulados ------------------------------------------------------------------

const texCache: Record<string, THREE.Texture> = {};

const textura = (clave: string, w: number, h: number, pintar: (ctx: CanvasRenderingContext2D) => void) => {
  if (texCache[clave]) return texCache[clave];
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  pintar(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  texCache[clave] = t;
  return t;
};

const etiquetaFrasco = () =>
  textura("frasco", 512, 256, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "#7ff0ff");
    g.addColorStop(1, "#1aa6c9");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = "#0b1d24";
    ctx.fillRect(0, 196, 512, 60);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#0b1d24";
    ctx.font = "900 46px Inter, Arial, sans-serif";
    ctx.fillText("L-", 256, 46);
    ctx.font = "900 104px Anton, Impact, 'Arial Black', sans-serif";
    ctx.fillText("CARNITINA", 256, 124);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 34px Inter, Arial, sans-serif";
    ctx.fillText("¿QUEMA GRASA?", 256, 226);
  });

/** Bote de L-carnitina (base en y = 0, etiqueta de cara a +Z). tapa 0..1 levanta la tapa. */
export const FrascoCarnitina: React.FC<{ p: V3; escala?: number; giro?: number; tapa?: number; brillo?: number; inclina?: number }> = ({
  p,
  escala = 1,
  giro = 0,
  tapa = 0,
  brillo = 0,
  inclina = 0,
}) => (
  <group position={p} scale={escala} rotation={[0, giro, inclina]}>
    <mesh position={[0, 0.45, 0]}>
      <cylinderGeometry args={[0.38, 0.38, 0.9, 48]} />
      <meshPhysicalMaterial color="#f4f7f2" roughness={0.3} clearcoat={0.8} emissive={CARN_C} emissiveIntensity={brillo * 0.2} />
    </mesh>
    <mesh position={[0, 0.45, 0]}>
      <cylinderGeometry args={[0.385, 0.385, 0.6, 48, 1, true, -1.25, 2.5]} />
      <meshStandardMaterial map={etiquetaFrasco()} emissive="#ffffff" emissiveMap={etiquetaFrasco()} emissiveIntensity={0.35 + brillo * 0.4} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 0.91, 0]}>
      <cylinderGeometry args={[0.3, 0.36, 0.06, 40]} />
      <meshStandardMaterial color="#d8dee0" />
    </mesh>
    <group position={[0, 0.98 + tapa * 0.4, 0]} rotation={[-tapa * 0.6, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.31, 0.31, 0.14, 40]} />
        <meshPhysicalMaterial color="#1aa6c9" roughness={0.35} clearcoat={0.6} />
      </mesh>
    </group>
  </group>
);

const portadaLibro = () =>
  textura("libro", 360, 512, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 360, 512);
    g.addColorStop(0, "#14323a");
    g.addColorStop(1, "#071417");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 360, 512);
    ctx.fillStyle = K.lima;
    ctx.fillRect(28, 40, 304, 8);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#f4f7f2";
    ctx.font = "900 70px Anton, Impact, 'Arial Black', sans-serif";
    ctx.fillText("NUTRICIÓN", 180, 140);
    ctx.fillText("SIN", 180, 220);
    ctx.fillText("DOGMAS", 180, 300);
    ctx.fillStyle = K.lima;
    ctx.fillRect(28, 360, 304, 4);
    ctx.fillStyle = "#cfe0dc";
    ctx.font = "800 34px Inter, Arial, sans-serif";
    ctx.fillText("Francis Holway", 180, 410);
    ctx.font = "700 26px Inter, Arial, sans-serif";
    ctx.fillText("Tomo 1", 180, 455);
  });

/** Libro de pie con portada (de cara a +Z). */
export const Libro: React.FC<{ p: V3; escala?: number; giro?: number }> = ({ p, escala = 1, giro = 0 }) => (
  <group position={p} scale={escala} rotation={[0, giro, 0]}>
    <mesh>
      <boxGeometry args={[0.9, 1.28, 0.2]} />
      <meshPhysicalMaterial color="#0c2328" roughness={0.5} clearcoat={0.4} />
    </mesh>
    <mesh position={[0.02, 0, -0.005]}>
      <boxGeometry args={[0.86, 1.22, 0.17]} />
      <meshStandardMaterial color="#f1ead8" />
    </mesh>
    <mesh position={[0, 0, 0.102]}>
      <planeGeometry args={[0.9, 1.28]} />
      <meshStandardMaterial map={portadaLibro()} emissive="#ffffff" emissiveMap={portadaLibro()} emissiveIntensity={0.3} />
    </mesh>
  </group>
);

/** Calendario de 24 semanas (6 x 4). marca 0..1 = semanas cumplidas. De cara a +Z. */
export const Calendario24: React.FC<{ p: V3; escala?: number; marca?: number }> = ({ p, escala = 1, marca = 0 }) => (
  <group position={p} scale={escala}>
    <mesh>
      <boxGeometry args={[1.7, 1.4, 0.06]} />
      <meshStandardMaterial color="#f4f7f2" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.56, 0.035]}>
      <boxGeometry args={[1.7, 0.26, 0.02]} />
      <meshStandardMaterial color={CARN_C} emissive={CARN_C} emissiveIntensity={0.3} />
    </mesh>
    {[-0.5, 0, 0.5].map((x) => (
      <mesh key={x} position={[x, 0.72, 0.04]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.06, 0.015, 8, 16]} />
        <meshStandardMaterial color="#9aa5a8" metalness={0.6} />
      </mesh>
    ))}
    {Array.from({ length: 24 }).map((_, i) => {
      const x = -0.65 + (i % 6) * 0.26;
      const y = 0.25 - Math.floor(i / 6) * 0.22;
      const on = i < Math.round(marca * 24);
      return (
        <mesh key={i} position={[x, y, 0.04]}>
          <boxGeometry args={[0.2, 0.16, on ? 0.04 : 0.015]} />
          <meshStandardMaterial color={on ? K.lima : "#d5dcdd"} emissive={on ? K.lima : "#000000"} emissiveIntensity={on ? 0.5 : 0} />
        </mesh>
      );
    })}
  </group>
);

/** Transportador de la membrana del musculo (metafora "puerta"): dos mitades que se separan. */
export const Puerta: React.FC<{ p: V3; abre?: number; brillo?: number }> = ({ p, abre = 0, brillo = 0 }) => (
  <group position={p}>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * (0.15 + abre * 0.2), 0, 0]}>
        <capsuleGeometry args={[0.13, 0.55, 8, 16]} />
        <meshPhysicalMaterial color="#3ee08f" emissive="#3ee08f" emissiveIntensity={0.2 + brillo} roughness={0.35} clearcoat={0.6} />
      </mesh>
    ))}
  </group>
);

// ---- Metafora del puerto -------------------------------------------------------------------

/** Mar: plano azul con reflejos que se mueven. */
export const Mar: React.FC<{ b: number; ancho?: number; prof?: number; z?: number }> = ({ b, ancho = 16, prof = 10, z = -4 }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, z]}>
      <planeGeometry args={[ancho, prof]} />
      <meshPhysicalMaterial color="#0b4a66" emissive="#0a3550" emissiveIntensity={0.3} roughness={0.15} clearcoat={1} />
    </mesh>
    {Array.from({ length: 26 }).map((_, i) => {
      const x = (rnd(`mx${i}`) - 0.5) * ancho * 0.9 + Math.sin(b * 3 + i) * 0.15;
      const zz = z + (rnd(`mz${i}`) - 0.5) * prof * 0.9;
      return (
        <mesh key={i} position={[x, 0.01, zz]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.5 + rnd(`ml${i}`) * 0.6, 0.03]} />
          <meshBasicMaterial color="#8fe3ff" transparent opacity={0.25 + 0.2 * Math.sin(b * 8 + i * 1.7)} />
        </mesh>
      );
    })}
  </group>
);

/** Muelle de madera (borde hacia -Z, encima del mar). Cubierta a y = 0.35. */
export const Muelle: React.FC<{ ancho?: number; fondo?: number }> = ({ ancho = 5, fondo = 1.6 }) => (
  <group>
    <mesh position={[0, 0.2, 0]}>
      <boxGeometry args={[ancho, 0.3, fondo]} />
      <meshStandardMaterial color="#7a5433" roughness={0.8} />
    </mesh>
    {Array.from({ length: Math.round(ancho / 0.3) }).map((_, i) => (
      <mesh key={i} position={[-ancho / 2 + 0.15 + i * 0.3, 0.352, 0]}>
        <boxGeometry args={[0.26, 0.005, fondo - 0.02]} />
        <meshStandardMaterial color={i % 2 ? "#9b6d43" : "#8a5f3a"} roughness={0.85} />
      </mesh>
    ))}
    {Array.from({ length: 6 }).map((_, i) => (
      <mesh key={`b${i}`} position={[-ancho / 2 + 0.4 + i * ((ancho - 0.8) / 5), 0.42, -fondo / 2 + 0.1]}>
        <cylinderGeometry args={[0.05, 0.06, 0.14, 16]} />
        <meshStandardMaterial color="#2a3238" metalness={0.5} roughness={0.4} />
      </mesh>
    ))}
    {Array.from({ length: 6 }).map((_, i) => (
      <mesh key={`p${i}`} position={[-ancho / 2 + 0.3 + i * ((ancho - 0.6) / 5), -0.1, -fondo / 2 + 0.08]}>
        <cylinderGeometry args={[0.07, 0.07, 0.6, 12]} />
        <meshStandardMaterial color="#4f3622" roughness={0.9} />
      </mesh>
    ))}
  </group>
);

/** Contenedor de carga (amarillo = grasa). Base en y = 0. */
export const Contenedor: React.FC<{ p: V3; escala?: number; color?: string; op?: number; rot?: number }> = ({
  p,
  escala = 1,
  color = GRASO,
  op = 1,
  rot = 0,
}) => (
  <group position={p} scale={escala} rotation={[0, rot, 0]}>
    <mesh position={[0, 0.11, 0]}>
      <boxGeometry args={[0.42, 0.22, 0.2]} />
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.25} roughness={0.4} clearcoat={0.4} transparent={op < 1} opacity={op} />
    </mesh>
    {[-0.15, -0.05, 0.05, 0.15].map((x) => (
      <mesh key={x} position={[x, 0.11, 0.102]}>
        <boxGeometry args={[0.02, 0.2, 0.005]} />
        <meshStandardMaterial color="#b88a10" transparent={op < 1} opacity={op} />
      </mesh>
    ))}
  </group>
);

/** Estibador (metafora de la carnitina): figurita cian con casco. Base en y = 0, mira a +Z. */
export const Estibador: React.FC<{ p: V3; escala?: number; paso?: number; carga?: boolean; giro?: number; op?: number }> = ({
  p,
  escala = 1,
  paso = 0,
  carga = false,
  giro = 0,
  op = 1,
}) => {
  const s = Math.sin(paso);
  const bob = Math.abs(Math.cos(paso)) * 0.015;
  const tr = op < 1;
  return (
    <group position={[p[0], p[1] + bob, p[2]]} scale={escala} rotation={[0, giro, 0]}>
      {[-1, 1].map((l) => (
        <group key={l} position={[l * 0.04, 0.13, 0]} rotation={[l * s * 0.5, 0, 0]}>
          <mesh position={[0, -0.065, 0]}>
            <capsuleGeometry args={[0.025, 0.08, 6, 10]} />
            <meshStandardMaterial color="#1d3b52" transparent={tr} opacity={op} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.21, 0]}>
        <capsuleGeometry args={[0.06, 0.1, 8, 14]} />
        <meshPhysicalMaterial color={CARN_C} emissive={CARN_C} emissiveIntensity={0.45} roughness={0.35} clearcoat={0.6} transparent={tr} opacity={op} />
      </mesh>
      {[-1, 1].map((l) => (
        <group key={`b${l}`} position={[l * 0.075, 0.26, 0]} rotation={carga ? [Math.PI, 0, -l * 0.25] : [-l * s * 0.5, 0, l * 0.15]}>
          <mesh position={[0, -0.055, 0]}>
            <capsuleGeometry args={[0.02, 0.08, 6, 10]} />
            <meshStandardMaterial color={CARN_C} emissive={CARN_C} emissiveIntensity={0.3} transparent={tr} opacity={op} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.34, 0]}>
        <sphereGeometry args={[0.05, 16, 12]} />
        <meshStandardMaterial color="#f2c8a0" transparent={tr} opacity={op} />
      </mesh>
      <mesh position={[0, 0.365, 0]}>
        <sphereGeometry args={[0.056, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f4f7f2" transparent={tr} opacity={op} />
      </mesh>
      {carga ? <Contenedor p={[0, 0.39, 0]} escala={0.45} op={op} /> : null}
    </group>
  );
};

/** Barco de carga (proa hacia +X). carga = numero de contenedores en cubierta. op < 1 = fantasma. */
export const Barco: React.FC<{ p: V3; escala?: number; carga?: number; op?: number; balanceo?: number }> = ({
  p,
  escala = 1,
  carga = 6,
  op = 1,
  balanceo = 0,
}) => {
  const tr = op < 1;
  const casco = <meshPhysicalMaterial color="#20384f" roughness={0.4} clearcoat={0.6} transparent={tr} opacity={op} depthWrite={!tr} />;
  return (
    <group position={p} scale={escala} rotation={[balanceo, 0, balanceo * 0.4]}>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[2.0, 0.36, 0.7]} />
        {casco}
      </mesh>
      <mesh position={[1.0, 0.12, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 1, 1]}>
        <boxGeometry args={[0.495, 0.36, 0.495]} />
        {casco}
      </mesh>
      <mesh position={[0.1, -0.02, 0]}>
        <boxGeometry args={[2.36, 0.08, 0.72]} />
        <meshStandardMaterial color="#c0392b" transparent={tr} opacity={op} />
      </mesh>
      <mesh position={[-0.75, 0.48, 0]}>
        <boxGeometry args={[0.36, 0.36, 0.56]} />
        <meshStandardMaterial color="#f4f7f2" transparent={tr} opacity={op} />
      </mesh>
      <mesh position={[-0.75, 0.74, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.2, 12]} />
        <meshStandardMaterial color="#c0392b" transparent={tr} opacity={op} />
      </mesh>
      {Array.from({ length: carga }).map((_, i) => {
        const col = i % 3;
        const fila = Math.floor(i / 3) % 2;
        const piso = Math.floor(i / 6);
        return <Contenedor key={i} p={[-0.3 + col * 0.44, 0.3 + piso * 0.22, -0.11 + fila * 0.22]} op={op} />;
      })}
    </group>
  );
};

/** Grua del muelle (base en y = 0). */
export const Grua: React.FC<{ p: V3; escala?: number; giro?: number }> = ({ p, escala = 1, giro = 0 }) => (
  <group position={p} scale={escala} rotation={[0, giro, 0]}>
    {[-1, 1].map((l) => (
      <mesh key={l} position={[l * 0.18, 0.7, 0]}>
        <boxGeometry args={[0.06, 1.4, 0.06]} />
        <meshStandardMaterial color={K.naranja} emissive={K.naranja} emissiveIntensity={0.2} />
      </mesh>
    ))}
    <mesh position={[0, 1.42, -0.5]}>
      <boxGeometry args={[0.08, 0.08, 1.6]} />
      <meshStandardMaterial color={K.naranja} emissive={K.naranja} emissiveIntensity={0.2} />
    </mesh>
    <mesh position={[0, 1.0, -1.15]}>
      <cylinderGeometry args={[0.006, 0.006, 0.8, 6]} />
      <meshStandardMaterial color="#d8dee0" />
    </mesh>
  </group>
);

// ---- Hoguera --------------------------------------------------------------------------------

/** Fogata: troncos cruzados y llamas que titilan. fuerza 0..1 escala las llamas. Base en y = 0. */
export const Fogata: React.FC<{ p: V3; b: number; escala?: number; fuerza?: number }> = ({ p, b, escala = 1, fuerza = 1 }) => (
  <group position={p} scale={escala}>
    {[0, 1, 2, 3].map((i) => (
      <mesh key={i} position={[0, 0.08, 0]} rotation={[0, (i / 4) * Math.PI, Math.PI / 2 - 0.25]}>
        <cylinderGeometry args={[0.07, 0.08, 1.1, 14]} />
        <meshStandardMaterial color="#6b3f22" roughness={0.9} emissive="#ff6a00" emissiveIntensity={0.15 * fuerza} />
      </mesh>
    ))}
    {Array.from({ length: 7 }).map((_, i) => {
      const a = (i / 7) * Math.PI * 2;
      const r = i === 0 ? 0 : 0.16;
      const f = 0.75 + 0.25 * Math.sin(b * 45 + i * 2.1);
      const h = (i === 0 ? 1.0 : 0.6) * f * fuerza;
      const col = i === 0 ? K.amarillo : i % 2 ? K.naranja : "#ff5a2a";
      return (
        <mesh key={`f${i}`} position={[Math.cos(a) * r, 0.15 + h / 2, Math.sin(a) * r]}>
          <coneGeometry args={[i === 0 ? 0.2 : 0.13, h, 20]} />
          <meshStandardMaterial color={col} emissive={col} emissiveIntensity={1.4} transparent opacity={0.88} depthWrite={false} />
        </mesh>
      );
    })}
    <mesh position={[0, 0.5, 0]}>
      <sphereGeometry args={[0.75, 20, 14]} />
      <meshBasicMaterial color={K.naranja} transparent opacity={0.1 * fuerza} depthWrite={false} />
    </mesh>
    {Array.from({ length: 10 }).map((_, i) => {
      const k = (b * 1.4 + rnd(`ch${i}`)) % 1;
      return (
        <Mol
          key={`c${i}`}
          p={[(rnd(`cx${i}`) - 0.5) * 0.5 + Math.sin(k * 6 + i) * 0.1, 0.4 + k * 1.4, (rnd(`cz${i}`) - 0.5) * 0.4]}
          color={K.naranja}
          r={0.02}
          op={(1 - k) * fuerza}
          brillo={1.5}
        />
      );
    })}
  </group>
);

/** Interpolacion de un valor con rebote (para "chocar y regresar"). */
export const rebote = (k: number, a: number, z: number, choque = 0.6) =>
  k < choque ? mix(a, z, k / choque) : mix(z, mix(a, z, 0.55), (k - choque) / (1 - choque));
