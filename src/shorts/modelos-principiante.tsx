// Modelos 3D del short "paradoja del principiante": libro de Holway que se abre, interior de fibra
// con pocas/muchas mitocondrias, horno de ladrillos y leña (metáfora), batería, calendario de semanas,
// barras de cambio (+/-) y curva de progreso.
import React from "react";
import * as THREE from "three";
import { mix, V3 } from "../fisio/motor";
import { rnd } from "../fisio/modelos/comun";
import { Esfera } from "../fisio/modelos/energia";
import { CilindroX } from "../fisio/modelos/musculo";
import { Tubo } from "../fisio/modelos/comun";
import { K } from "./marco";
import { MIOFIBRILLAS } from "./modelos";

const cl = (v: number) => Math.min(1, Math.max(0, v));

// ---- Texturas de canvas ------------------------------------------------------------------

const texCache: Record<string, THREE.CanvasTexture> = {};
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

/** Portada propia (solo como cita): "Nutrición sin dogmas · Francis Holway". */
const portada = () =>
  textura("pr-portada", 360, 504, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 360, 504);
    g.addColorStop(0, "#14323a");
    g.addColorStop(1, "#071417");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 360, 504);
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

/** Pagina interior: "1.6.12 La paradoja del principiante" con renglones. */
const pagina = () =>
  textura("pr-pagina", 360, 504, (ctx) => {
    ctx.fillStyle = "#f3ecd9";
    ctx.fillRect(0, 0, 360, 504);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#1d6f5c";
    ctx.font = "800 26px Inter, Arial, sans-serif";
    ctx.fillText("1.6.12", 30, 50);
    ctx.fillStyle = "#14323a";
    ctx.font = "900 44px Anton, Impact, 'Arial Black', sans-serif";
    ctx.fillText("LA PARADOJA", 30, 105);
    ctx.fillText("DEL PRINCIPIANTE", 30, 158);
    ctx.fillStyle = "#b7ad94";
    for (let i = 0; i < 12; i++) {
      const w = i % 4 === 3 ? 170 : 300;
      ctx.fillRect(30, 205 + i * 23, w, 8);
    }
  });

/** Libro de pie (de cara a +Z) que se abre: abre 0..1 gira la portada sobre el lomo. Abierto queda centrado. */
export const LibroHolway: React.FC<{ abre: number; brillo?: number }> = ({ abre, brillo = 0 }) => {
  const a = cl(abre);
  const ancho = 1.0;
  const alto = 1.4;
  const grosor = 0.2;
  const tapa = <meshPhysicalMaterial color="#0c2328" roughness={0.45} clearcoat={0.6} />;
  return (
    <group position={[mix(-ancho / 2, 0, a), 0, 0]}>
      <mesh position={[ancho / 2, 0, -grosor / 2]}>
        <boxGeometry args={[ancho + 0.04, alto + 0.04, 0.03]} />
        {tapa}
      </mesh>
      <mesh position={[-0.005, 0, 0]}>
        <boxGeometry args={[0.03, alto + 0.04, grosor + 0.03]} />
        {tapa}
      </mesh>
      <mesh position={[ancho / 2 - 0.01, 0, 0]}>
        <boxGeometry args={[ancho - 0.04, alto - 0.04, grosor - 0.03]} />
        <meshStandardMaterial color="#f3ecd9" roughness={0.9} />
      </mesh>
      <mesh position={[ancho / 2 - 0.01, 0, grosor / 2 - 0.014]}>
        <planeGeometry args={[ancho - 0.06, alto - 0.06]} />
        <meshStandardMaterial map={pagina()} emissive="#ffffff" emissiveMap={pagina()} emissiveIntensity={0.25 + brillo * 0.4} roughness={0.9} />
      </mesh>
      <group position={[0, 0, grosor / 2]} rotation={[0, -a * 2.8, 0]}>
        <mesh position={[ancho / 2, 0, 0.015]}>
          <boxGeometry args={[ancho + 0.04, alto + 0.04, 0.03]} />
          {tapa}
        </mesh>
        <mesh position={[ancho / 2, 0, 0.032]}>
          <planeGeometry args={[ancho, alto]} />
          <meshStandardMaterial map={portada()} emissive="#ffffff" emissiveMap={portada()} emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[ancho / 2, 0, -0.001]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[ancho - 0.04, alto - 0.04]} />
          <meshStandardMaterial color="#efe6cf" roughness={0.9} />
        </mesh>
      </group>
      {brillo > 0.02 ? (
        <mesh position={[ancho / 2, 0, 0.25]}>
          <sphereGeometry args={[alto * 0.75, 24, 16]} />
          <meshBasicMaterial color="#fff3c4" transparent opacity={brillo * 0.08} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
};

// ---- Interior de la fibra con mitocondrias variables ---------------------------------------

/** Lugares de las mitocondrias (capa frontal, entre las miofibrillas). */
export const MITO_POS: { p: V3; r: number }[] = [
  { p: [-0.9, 0.5, 0.6], r: 1.3 },
  { p: [1.0, -0.9, 0.7], r: 1.6 },
  { p: [0.2, 1.9, 0.4], r: 1.5 },
  { p: [-1.6, -1.7, 0.5], r: 1.7 },
  { p: [1.7, 1.2, 0.3], r: 1.2 },
  { p: [-0.1, -2.6, 0.6], r: 1.4 },
  { p: [-2.1, 1.6, 0.2], r: 1.8 },
  { p: [2.2, -2.3, 0.3], r: 1.3 },
  { p: [0.3, -0.2, 1.0], r: 1.7 },
  { p: [-1.1, 2.9, 0.3], r: 1.4 },
  { p: [1.4, 2.8, 0.2], r: 1.6 },
  { p: [-2.4, -0.4, 0.4], r: 1.5 },
];

/** Mitocondria con crestas (naranja). escala 1 ~ 0.9 de largo. */
export const MitoCrestas: React.FC<{ p: V3; escala?: number; rot?: number; brillo?: number; op?: number }> = ({ p, escala = 1, rot = 0, brillo = 0, op = 1 }) => (
  <group position={p} scale={escala} rotation={[0.3, 0, rot]}>
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <capsuleGeometry args={[0.2, 0.5, 10, 24]} />
      <meshPhysicalMaterial color={K.naranja} emissive={K.naranja} emissiveIntensity={0.25 + brillo} transparent opacity={0.85 * op} roughness={0.3} clearcoat={0.5} />
    </mesh>
    {Array.from({ length: 5 }).map((_, i) => (
      <mesh key={i} position={[-0.3 + i * 0.15, i % 2 ? 0.05 : -0.05, 0.02]} scale={[0.035, 0.13, 0.12]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#ffd2b0" emissive="#ff9b6a" emissiveIntensity={0.3 + brillo} transparent opacity={op} />
      </mesh>
    ))}
  </group>
);

/**
 * Interior de una fibra (miofibrillas de pie) con n mitocondrias de tamaño tam.
 * nace 0..1 hace aparecer la ultima (para que se vean "multiplicarse"); apagado 0..1 oscurece la fibra.
 */
export const InteriorMitos: React.FC<{ n: number; tam: number; brillo?: number; apagado?: number; brilloMito?: number }> = ({
  n,
  tam,
  brillo = 0,
  apagado = 0,
  brilloMito = 0,
}) => {
  const entero = Math.floor(n);
  const frac = n - entero;
  const col = new THREE.Color("#c03a46").lerp(new THREE.Color("#4a3a40"), apagado * 0.7).getStyle();
  return (
    <group>
      <group rotation={[0, 0, Math.PI / 2]}>
        {MIOFIBRILLAS.map(([x, z], i) => (
          <CilindroX key={i} radio={0.5} largo={14} x={7} y={-x} z={z} color={col} estriado={10} emisivo={brillo * 0.5} />
        ))}
      </group>
      {MITO_POS.slice(0, Math.min(MITO_POS.length, entero + 1)).map((m, i) => {
        const s = i < entero ? 1 : frac;
        if (s <= 0.01) return null;
        return <MitoCrestas key={i} p={m.p} escala={tam * (0.4 + 0.6 * s)} rot={m.r} brillo={brilloMito} op={Math.min(1, s * 1.5) * (1 - apagado * 0.4)} />;
      })}
    </group>
  );
};

// ---- Horno de ladrillos y leña (metáfora de Holway) ----------------------------------------

const LADRILLOS: { y: number; r: number; th: number; phi: number }[] = (() => {
  const out: { y: number; r: number; th: number; phi: number }[] = [];
  const R = 0.85;
  const filas = 7;
  for (let j = 0; j < filas; j++) {
    const phi = (j / filas) * (Math.PI / 2) * 0.96;
    const r = R * Math.cos(phi);
    const y = 0.1 + R * Math.sin(phi);
    const n = Math.max(5, Math.round((2 * Math.PI * r) / 0.24));
    for (let i = 0; i < n; i++) {
      const th = (i / n) * Math.PI * 2 + (j % 2) * (Math.PI / n);
      // boca del horno (de cara a +Z)
      const d = Math.atan2(Math.sin(th), Math.cos(th));
      if (j < 3 && Math.abs(d) < 0.5) continue;
      out.push({ y, r, th, phi });
    }
  }
  return out;
})();
export const N_LADRILLOS = LADRILLOS.length;

/** Horno de ladrillos (domo) que se construye de abajo arriba: construye 0..1. fuego 0..1 enciende el interior. */
export const Horno: React.FC<{ construye: number; fuego?: number; b?: number }> = ({ construye, fuego = 0, b = 0 }) => {
  const k = cl(construye) * N_LADRILLOS;
  const listos = Math.floor(k);
  const frac = k - listos;
  return (
    <group>
      {/* base */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[1.0, 1.05, 0.1, 40]} />
        <meshStandardMaterial color="#8d8173" roughness={0.9} />
      </mesh>
      {LADRILLOS.slice(0, Math.min(N_LADRILLOS, listos + 1)).map((l, i) => {
        const cae = i < listos ? 0 : 1 - frac;
        const tono = new THREE.Color("#b5532f").lerp(new THREE.Color("#d9774a"), rnd(`lad${i}`) * 0.6).getStyle();
        return (
          <group key={i} rotation={[0, l.th, 0]}>
            <mesh position={[0, l.y + cae * 0.8, l.r]} rotation={[-l.phi, 0, 0]}>
              <boxGeometry args={[0.21, 0.11, 0.12]} />
              <meshStandardMaterial color={tono} roughness={0.85} transparent={cae > 0} opacity={1 - cae * 0.6} />
            </mesh>
          </group>
        );
      })}
      {fuego > 0.01 ? (
        <>
          {Array.from({ length: 5 }).map((_, i) => {
            const f = 0.75 + 0.25 * Math.sin(b * 45 + i * 2.1);
            const h = 0.45 * f * fuego;
            const a = (i / 5) * Math.PI * 2;
            const col = i % 2 ? K.naranja : K.amarillo;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.15, 0.12 + h / 2, Math.sin(a) * 0.15 + 0.1]}>
                <coneGeometry args={[0.1, h, 16]} />
                <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.7} transparent opacity={0.9} depthWrite={false} />
              </mesh>
            );
          })}
          <pointLight position={[0, 0.4, 0.4]} intensity={6 * fuego} distance={3} color={K.naranja} />
        </>
      ) : null}
    </group>
  );
};

/** Tronco (a lo largo de X). */
const Tronco: React.FC<{ p: V3; largo?: number; r?: number; op?: number; brillo?: number }> = ({ p, largo = 0.9, r = 0.09, op = 1, brillo = 0 }) => (
  <group position={p}>
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[r, r * 1.05, largo, 16]} />
      <meshStandardMaterial color="#6b3f22" roughness={0.9} emissive={K.amarillo} emissiveIntensity={brillo} transparent={op < 1} opacity={op} />
    </mesh>
    {[1, -1].map((s) => (
      <mesh key={s} position={[(s * largo) / 2 + s * 0.002, 0, 0]} rotation={[0, (s * Math.PI) / 2, 0]}>
        <circleGeometry args={[r * 0.95, 16]} />
        <meshStandardMaterial color="#d9a066" roughness={0.8} transparent={op < 1} opacity={op} />
      </mesh>
    ))}
  </group>
);

/** Monton de leña (3-2-1 troncos, de cara a +Z). saca = desplazamiento del tronco de arriba. */
export const Lena: React.FC<{ saca?: V3; brillo?: number }> = ({ saca = [0, 0, 0], brillo = 0 }) => {
  const filas = [3, 2];
  const r = 0.09;
  return (
    <group rotation={[0, 0.5, 0]}>
      {filas.map((n, j) =>
        Array.from({ length: n }).map((_, i) => <Tronco key={`${j}${i}`} p={[0, r + j * r * 1.75, (i - (n - 1) / 2) * r * 2.05]} r={r} brillo={brillo} />),
      )}
      <Tronco p={[saca[0], r + 2 * r * 1.75 + saca[1], saca[2]]} r={r} brillo={brillo + 0.1} />
    </group>
  );
};

// ---- Bateria ------------------------------------------------------------------------------

/** Batería vertical (base en y = 0, de cara a +Z). nivel 0..1 (verde -> amarillo -> rojo). */
export const Bateria: React.FC<{ nivel: number; escala?: number }> = ({ nivel, escala = 1 }) => {
  const n = 5;
  const col = nivel > 0.55 ? K.lima : nivel > 0.3 ? K.amarillo : K.rojo;
  return (
    <group scale={escala}>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.5, 1.0, 0.32]} />
        <meshPhysicalMaterial color="#cfefff" transparent opacity={0.18} roughness={0.05} clearcoat={1} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.2, 0.08, 0.16]} />
        <meshStandardMaterial color="#9fb8b4" metalness={0.5} />
      </mesh>
      {Array.from({ length: n }).map((_, i) => {
        const on = cl(nivel * n - i);
        if (on <= 0.02) return null;
        return (
          <mesh key={i} position={[0, 0.14 + i * 0.19, 0]} scale={[1, on, 1]}>
            <boxGeometry args={[0.4, 0.15, 0.24]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.7} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---- Calendario por semanas ---------------------------------------------------------------

/** Calendario (de cara a +Z): filas = semanas, 7 dias por fila. marca 0..1 = dias cumplidos. */
export const CalendarioSemanas: React.FC<{ semanas: number; marca: number; color?: string; cab?: string }> = ({ semanas, marca, color = K.lima, cab = K.morado }) => {
  const c = 0.15;
  const w = 7 * c + 0.12;
  const h = semanas * c + 0.12;
  const dias = semanas * 7;
  return (
    <group>
      <mesh position={[0, -0.04, -0.03]}>
        <boxGeometry args={[w, h + 0.26, 0.04]} />
        <meshStandardMaterial color="#f4f7f2" roughness={0.6} />
      </mesh>
      <mesh position={[0, h / 2 + 0.03, -0.005]}>
        <boxGeometry args={[w, 0.16, 0.03]} />
        <meshStandardMaterial color={cab} emissive={cab} emissiveIntensity={0.35} />
      </mesh>
      {Array.from({ length: dias }).map((_, i) => {
        const on = i < marca * dias - 0.01;
        return (
          <mesh key={i} position={[-w / 2 + 0.06 + c / 2 + (i % 7) * c, h / 2 - 0.06 - c / 2 - Math.floor(i / 7) * c - 0.04, 0]}>
            <boxGeometry args={[c * 0.82, c * 0.82, 0.02]} />
            <meshStandardMaterial color={on ? color : "#d5dcdf"} emissive={on ? color : "#000"} emissiveIntensity={on ? 0.45 : 0} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---- Barras de cambio y curva -------------------------------------------------------------

/** Barra que crece hacia arriba (valor > 0) o hacia abajo (valor < 0) desde y = 0. */
export const BarraCambio: React.FC<{ valor: number; color: string; ancho?: number }> = ({ valor, color, ancho = 0.5 }) => {
  const h = Math.max(0.01, Math.abs(valor));
  return (
    <mesh position={[0, (Math.sign(valor) * h) / 2, 0]}>
      <boxGeometry args={[ancho, h, ancho * 0.6]} />
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.45} roughness={0.35} clearcoat={0.6} />
    </mesh>
  );
};

/** Punto de la curva de progreso (u 0..1 = años de entrenamiento). Sube rapido y se aplana. */
export const puntoCurva = (u: number, ancho = 3.2, alto = 2.0): V3 => {
  const k = 4.2;
  return [-ancho / 2 + u * ancho, -alto / 2 + (alto * (1 - Math.exp(-k * u))) / (1 - Math.exp(-k)), 0];
};

/** Ejes + curva de progreso dibujada hasta prog; zona empinada resaltada (zona 0..1). */
export const CurvaProgreso: React.FC<{ prog: number; zona?: number; ancho?: number; alto?: number }> = ({ prog, zona = 0, ancho = 3.2, alto = 2.0 }) => {
  const n = Math.max(2, Math.round(40 * prog));
  const pts: V3[] = Array.from({ length: n }).map((_, i) => puntoCurva((i / (n - 1)) * Math.max(0.02, prog), ancho, alto));
  const fin = puntoCurva(Math.max(0.02, prog), ancho, alto);
  const x0 = -ancho / 2;
  const y0 = -alto / 2;
  return (
    <group>
      {/* ejes */}
      <mesh position={[0, y0 - 0.05, 0]}>
        <boxGeometry args={[ancho + 0.2, 0.035, 0.035]} />
        <meshStandardMaterial color="#cfe0dc" />
      </mesh>
      <mesh position={[ancho / 2 + 0.12, y0 - 0.05, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.06, 0.16, 12]} />
        <meshStandardMaterial color="#cfe0dc" />
      </mesh>
      <mesh position={[x0 - 0.05, 0.05, 0]}>
        <boxGeometry args={[0.035, alto + 0.2, 0.035]} />
        <meshStandardMaterial color="#cfe0dc" />
      </mesh>
      <mesh position={[x0 - 0.05, alto / 2 + 0.17, 0]}>
        <coneGeometry args={[0.06, 0.16, 12]} />
        <meshStandardMaterial color="#cfe0dc" />
      </mesh>
      {/* zona del principiante */}
      {zona > 0.01 ? (
        <mesh position={[x0 + ancho * 0.12, 0, -0.05]}>
          <planeGeometry args={[ancho * 0.24, alto]} />
          <meshBasicMaterial color={K.lima} transparent opacity={0.16 * zona} depthWrite={false} />
        </mesh>
      ) : null}
      <Tubo puntos={pts} radio={0.045} color={K.lima} emisivo={0.6} segmentos={80} />
      <Esfera p={fin} r={0.1} color="#ffffff" brillo={1.2} />
    </group>
  );
};
