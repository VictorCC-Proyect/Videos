// Modelos 3D del short "¿Por qué unos ganan músculo más rápido que otros?" (respondedores).
// Hubal et al. 2005 (585 personas, 12 semanas, flexores del codo), Bamman et al. 2007, Holway 2.7.1.
import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../fisio/motor";
import { hexPack, rnd } from "../fisio/modelos/comun";
import { F2_COL } from "./modelos-fibras";
import { K } from "./marco";

const PIEL = ["#f1c9a5", "#d9a77c", "#b07a52", "#8a5a3a", "#f3d6bf"];
const ROPA = [K.cian, K.lima, K.naranja, K.rosa, K.morado, K.amarillo, "#5fd3a8", "#e8eef0"];

// ---- Multitud con mancuerna -------------------------------------------------------------

/** Personita (~0.36 de alto) con una mancuerna en la mano derecha; alza 0..1 = curl. */
export const PersonaPesa: React.FC<{ p: V3; ropa: string; piel: string; escala?: number; alza?: number; brillo?: number }> = ({
  p,
  ropa,
  piel,
  escala = 1,
  alza = 0,
  brillo = 0,
}) => (
  <group position={p} scale={escala}>
    <mesh position={[0, 0.13, 0]}>
      <capsuleGeometry args={[0.055, 0.15, 4, 10]} />
      <meshStandardMaterial color={ropa} emissive={ropa} emissiveIntensity={0.15 + brillo} roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.3, 0]}>
      <sphereGeometry args={[0.05, 12, 8]} />
      <meshStandardMaterial color={piel} roughness={0.6} />
    </mesh>
    <group position={[0.075, 0.06 + alza * 0.12, 0.02 + alza * 0.03]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.09, 6]} />
        <meshStandardMaterial color="#c9d3dc" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 1]}>
        <cylinderGeometry args={[0.026, 0.026, 0.1, 8, 1, true]} />
        <meshStandardMaterial color="#2a2f36" side={THREE.DoubleSide} />
      </mesh>
    </group>
  </group>
);

/** Rejilla filas x cols de PersonaPesa sobre el piso (xz). aparece 0..1; fase mueve los curls. */
export const GenteConPesa: React.FC<{ filas: number; cols: number; sep?: number; aparece?: number; fase?: number; seed?: string }> = ({
  filas,
  cols,
  sep = 0.2,
  aparece = 1,
  fase = 0,
  seed = "g5",
}) => (
  <group>
    {Array.from({ length: filas * cols }).map((_, i) => {
      const orden = (Math.floor(i / cols) + rnd(`${seed}o${i}`) * 4) / (filas + 4);
      if (orden > aparece) return null;
      const f = Math.floor(i / cols);
      const c = i % cols;
      const x = (c - (cols - 1) / 2) * sep + (rnd(`${seed}x${i}`) - 0.5) * sep * 0.35;
      const z = (f - (filas - 1) / 2) * sep + (rnd(`${seed}z${i}`) - 0.5) * sep * 0.35;
      const k = Math.min(1, (aparece - orden) / 0.06);
      const alza = Math.max(0, Math.sin(fase + rnd(`${seed}f${i}`) * 1.2));
      return (
        <PersonaPesa
          key={i}
          p={[x, 0, z]}
          escala={(0.85 + rnd(`${seed}s${i}`) * 0.3) * k}
          alza={alza}
          ropa={ROPA[Math.floor(rnd(`${seed}r${i}`) * ROPA.length)]}
          piel={PIEL[Math.floor(rnd(`${seed}p${i}`) * PIEL.length)]}
        />
      );
    })}
  </group>
);

// ---- Histograma de respuestas ------------------------------------------------------------

/**
 * Cambio de tamaño del bíceps ordenado de menor a mayor (ilustrativo con los extremos del
 * estudio de Hubal 2005: −2 % a +59 %, la mayoría alrededor de +15–25 %).
 */
export const RESPUESTAS: number[] = (() => {
  const n = 41;
  const zMax = Math.log((n - 0.5) / 0.5);
  return Array.from({ length: n }).map((_, i) => {
    const q = (i + 0.5) / n;
    const z = Math.log(q / (1 - q)) / zMax; // -1..1
    return z < 0 ? 18 + z * 20 : 18 + Math.pow(z, 1.6) * 41;
  });
})();

/** Valor -> color (gris = no cambia, lima = crece mucho). */
export const colorRespuesta = (v: number) => {
  const t = Math.min(1, Math.max(0, v / 59));
  return `#${new THREE.Color("#6f7f83").lerp(new THREE.Color(K.lima), t).getHexString()}`;
};

/** Fila de barras a lo largo de X (centrada). prog 0..1 = cuantas han crecido (de izquierda a derecha). */
export const Histograma: React.FC<{ ancho?: number; esc?: number; prog?: number; resalta?: number[] }> = ({ ancho = 2.6, esc = 0.028, prog = 1, resalta = [] }) => {
  const n = RESPUESTAS.length;
  const paso = ancho / n;
  return (
    <group>
      {/* eje en 0 % */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[ancho + 0.12, 0.012, 0.12]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, -0.02, -0.08]}>
        <boxGeometry args={[ancho + 0.2, 0.04, 0.02]} />
        <meshStandardMaterial color="#2b3f45" />
      </mesh>
      {RESPUESTAS.map((v, i) => {
        const k = Math.min(1, Math.max(0, (prog * (n + 6) - i) / 6));
        const h = Math.max(0.004, Math.abs(v) * esc * k);
        const col = colorRespuesta(v);
        const on = resalta.includes(i) ? 1 : 0;
        return (
          <mesh key={i} position={[-ancho / 2 + (i + 0.5) * paso, v >= 0 ? h / 2 : -h / 2, 0]}>
            <boxGeometry args={[paso * 0.78, h, 0.09]} />
            <meshPhysicalMaterial color={v < 0 ? K.rojo : col} emissive={v < 0 ? K.rojo : col} emissiveIntensity={0.3 + on * 0.8} roughness={0.35} clearcoat={0.5} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Posición (local) de la punta de la barra i del histograma. */
export const puntaBarra = (i: number, ancho = 2.6, esc = 0.028): V3 => {
  const n = RESPUESTAS.length;
  const v = RESPUESTAS[i];
  return [-ancho / 2 + (i + 0.5) * (ancho / n), v * esc + (v >= 0 ? 0.05 : -0.05), 0];
};

// ---- Corte de músculo con proporción de fibras ----------------------------------------------

/**
 * Corte transversal (cara hacia +Z) con una fracción `lentas` de tipo I (rojas) y el resto
 * rápidas (IIa rosadas / IIx blancas). gRap / gLen = grosor de cada grupo (hipertrofia):
 * las posiciones se separan según el área total, así el corte con más rápidas crece más.
 */
export const CorteTipos: React.FC<{ R?: number; sep?: number; lentas: number; gRap?: number; gLen?: number; brillo?: number; seed?: string }> = ({
  R = 0.8,
  sep = 0.2,
  lentas,
  gRap = 1,
  gLen = 1,
  brillo = 0,
  seed = "ct",
}) => {
  const celdas = useMemo(
    () =>
      hexPack(R, sep).map(([x, y], i) => {
        const u = rnd(`${seed}t${i}`);
        const tipo: 0 | 1 | 2 = u < lentas ? 0 : rnd(`${seed}r${i}`) < 0.6 ? 1 : 2;
        return { x: x + (rnd(`${seed}x${i}`) - 0.5) * sep * 0.08, y: y + (rnd(`${seed}y${i}`) - 0.5) * sep * 0.08, tipo };
      }),
    [R, sep, lentas, seed],
  );
  const fl = celdas.filter((c) => c.tipo === 0).length / celdas.length;
  const esc = Math.sqrt(fl * gLen * gLen + (1 - fl) * gRap * gRap);
  const COLS = [F2_COL.I, F2_COL.IIa, F2_COL.IIx];
  const Rt = (R + sep * 0.7) * esc;
  return (
    <group>
      <mesh position={[0, 0, -0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[Rt, Rt, 0.7, 64]} />
        <meshStandardMaterial color="#3b0d14" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, -0.33]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[Rt * 1.03, Rt * 1.03, 0.74, 64, 1, true]} />
        <meshStandardMaterial color="#f2d6c8" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {celdas.map((c, i) => {
        const g = c.tipo === 0 ? gLen : gRap;
        const r = sep * 0.43 * g;
        const hex = COLS[c.tipo];
        const a = c.tipo === 0 ? 0 : brillo;
        return (
          <mesh key={i} position={[c.x * esc, c.y * esc, -0.3]} rotation={[Math.PI / 2, i * 0.37, 0]}>
            <cylinderGeometry args={[r, r, 0.62, 7]} />
            <meshPhysicalMaterial color={hex} emissive={hex} emissiveIntensity={0.1 + a * 0.5} roughness={0.42} clearcoat={0.4} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Radio exterior del CorteTipos con esos parámetros (para colocar rótulos). */
export const radioCorte = (lentas: number, gRap = 1, gLen = 1, R = 0.8, sep = 0.2, seed = "ct") => {
  const pos = hexPack(R, sep);
  const fl = pos.filter((_, i) => rnd(`${seed}t${i}`) < lentas).length / pos.length;
  return (R + sep * 0.7) * Math.sqrt(fl * gLen * gLen + (1 - fl) * gRap * gRap);
};

/** Centro (local, en la cara) de la celda de un tipo (0 = lenta, 1|2 = rápida) más cercana a `cerca`. */
export const celdaTipo = (lentas: number, rapida: boolean, cerca: [number, number], gRap = 1, gLen = 1, R = 0.8, sep = 0.2, seed = "ct"): V3 => {
  const pos = hexPack(R, sep);
  const fl = pos.filter((_, i) => rnd(`${seed}t${i}`) < lentas).length / pos.length;
  const esc = Math.sqrt(fl * gLen * gLen + (1 - fl) * gRap * gRap);
  const c = pos
    .map(([x, y], i) => ({ x: x + (rnd(`${seed}x${i}`) - 0.5) * sep * 0.08, y: y + (rnd(`${seed}y${i}`) - 0.5) * sep * 0.08, lenta: rnd(`${seed}t${i}`) < lentas }))
    .filter((k) => k.lenta !== rapida)
    .sort((a, b) => Math.hypot(a.x - cerca[0], a.y - cerca[1]) - Math.hypot(b.x - cerca[0], b.y - cerca[1]))[0];
  return [c.x * esc, c.y * esc, 0.02];
};

// ---- Hoja de rutina -----------------------------------------------------------------------

/** Hoja de papel con renglones (de cara a +Z); los renglones se marcan con `marca` 0..1. */
export const HojaRutina: React.FC<{ ancho?: number; alto?: number; marca?: number; color?: string }> = ({ ancho = 0.8, alto = 1.0, marca = 0, color = K.lima }) => {
  const n = 5;
  return (
    <group>
      <mesh>
        <boxGeometry args={[ancho, alto, 0.02]} />
        <meshStandardMaterial color="#f4f7f2" roughness={0.7} />
      </mesh>
      <mesh position={[0, alto / 2 - 0.1, 0.012]}>
        <boxGeometry args={[ancho, 0.2, 0.01]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
      </mesh>
      {Array.from({ length: n }).map((_, i) => {
        const y = alto / 2 - 0.3 - i * ((alto - 0.4) / n);
        const on = i / n < marca;
        return (
          <group key={i} position={[0, y, 0.012]}>
            <mesh position={[-ancho / 2 + 0.11, 0, 0]}>
              <boxGeometry args={[0.07, 0.07, 0.01]} />
              <meshStandardMaterial color={on ? color : "#c4ccd0"} emissive={on ? color : "#000"} emissiveIntensity={on ? 0.5 : 0} />
            </mesh>
            <mesh position={[0.05, 0, 0]}>
              <boxGeometry args={[ancho - 0.32, 0.03, 0.01]} />
              <meshStandardMaterial color="#5c6b70" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// ---- Iconos de las tarjetas de "lo que controlas" ---------------------------------------------

/** Luna creciente (de cara a +Z). */
export const Luna: React.FC<{ p: V3; r?: number; color?: string; brillo?: number }> = ({ p, r = 0.18, color = K.amarillo, brillo = 0.6 }) => {
  const forma = useMemo(() => {
    const s = new THREE.Shape();
    s.absarc(0, 0, r, Math.PI * 0.32, Math.PI * 1.68, false);
    s.absarc(r * 0.55, 0, r * 0.82, Math.PI * 1.62, Math.PI * 0.38, true);
    return s;
  }, [r]);
  return (
    <mesh position={p}>
      <extrudeGeometry args={[forma, { depth: 0.05, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2 }]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={brillo} />
    </mesh>
  );
};

/** Barra horizontal de esfuerzo (de cara a +Z), nivel 0..1 de verde a rojo; marca del fallo a la derecha. */
export const BarraEsfuerzo: React.FC<{ nivel: number; ancho?: number }> = ({ nivel, ancho = 0.8 }) => {
  const segs = 8;
  const w = ancho / segs;
  return (
    <group>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[ancho + 0.06, 0.2, 0.03]} />
        <meshStandardMaterial color="#0a1c20" />
      </mesh>
      {Array.from({ length: segs }).map((_, i) => {
        const on = (i + 0.5) / segs <= nivel;
        const col = `#${new THREE.Color(K.lima).lerp(new THREE.Color(K.rojo), i / (segs - 1)).getHexString()}`;
        return (
          <mesh key={i} position={[-ancho / 2 + (i + 0.5) * w, 0, 0.01]}>
            <boxGeometry args={[w * 0.82, 0.14, 0.03]} />
            <meshStandardMaterial color={on ? col : "#2b3a3e"} emissive={on ? col : "#000"} emissiveIntensity={on ? 0.7 : 0} />
          </mesh>
        );
      })}
      <mesh position={[ancho / 2 + 0.06, 0, 0.01]}>
        <boxGeometry args={[0.025, 0.32, 0.03]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
};

// ---- Pista de salida y meta -------------------------------------------------------------------

/** Pista de 2 carriles a lo largo de -Z (desde z=1 hasta z=-largo). salidas = z de cada línea de salida. */
export const Pista: React.FC<{ largo?: number; carril?: number; salidas: [number, number]; meta: number; brilloMeta?: number }> = ({
  largo = 9,
  carril = 0.7,
  salidas,
  meta,
  brilloMeta = 0,
}) => (
  <group>
    <mesh position={[0, -0.01, 1 - largo / 2]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[carril * 2 + 0.6, largo]} />
      <meshStandardMaterial color="#7a2f2a" roughness={0.9} />
    </mesh>
    {[-1, 0, 1].map((k) => (
      <mesh key={k} position={[k * carril, 0, 1 - largo / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.03, largo]} />
        <meshBasicMaterial color="#f4f7f2" />
      </mesh>
    ))}
    {salidas.map((z, i) => (
      <mesh key={i} position={[(i - 0.5) * carril, 0.002, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[carril * 0.96, 0.07]} />
        <meshBasicMaterial color={i ? K.cian : K.naranja} />
      </mesh>
    ))}
    {/* meta: cuadros */}
    {Array.from({ length: 2 }).flatMap((_, f) =>
      Array.from({ length: 12 }).map((__, c) => (
        <mesh key={`${f}-${c}`} position={[-carril + (c + 0.5) * ((carril * 2) / 12), 0.003, meta - f * ((carril * 2) / 12)]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[(carril * 2) / 12, (carril * 2) / 12]} />
          <meshBasicMaterial color={(f + c) % 2 ? "#111111" : "#ffffff"} />
        </mesh>
      )),
    )}
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * (carril + 0.12), 0.6, meta]}>
        <cylinderGeometry args={[0.03, 0.03, 1.2, 12]} />
        <meshStandardMaterial color="#e8eef0" />
      </mesh>
    ))}
    <mesh position={[0, 1.18, meta]}>
      <boxGeometry args={[carril * 2 + 0.24, 0.12, 0.03]} />
      <meshStandardMaterial color={K.lima} emissive={K.lima} emissiveIntensity={0.4 + brilloMeta} />
    </mesh>
  </group>
);
