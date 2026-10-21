// Modelos 3D de los shorts de fibras musculares (rapidas y lentas).
import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../fisio/motor";
import { hexPack, rnd } from "../fisio/modelos/comun";
import { CabezaMiosina, Mitocondria } from "../fisio/modelos/musculo";
import { Esfera, Glucogeno } from "../fisio/modelos/energia";
import { Creatina, MiniATP } from "../fisio/energia/e1";
import { O2Mol } from "./modelos-energia";

// ---- Parte 1 (que son) ---------------------------------------------------------

/** Colores de los tipos de fibra. */
export const F1_COL = { I: "#a8192b", IIa: "#e9788c", IIx: "#f4e1d8", II: "#f1d3c9" };
export type F1Tipo = "I" | "IIa" | "IIx";

type F1Celda = { x: number; y: number; r: number; tipo: "I" | "II"; giro: number };

const f1Celdas = (R: number, sep: number): F1Celda[] =>
  hexPack(R, sep).map(([x, y], i) => {
    const tipo = rnd(`f1t${i}`) < 0.5 ? "I" : "II";
    return {
      x: x + (rnd(`f1x${i}`) - 0.5) * sep * 0.12,
      y: y + (rnd(`f1y${i}`) - 0.5) * sep * 0.12,
      r: sep * (tipo === "I" ? 0.5 : 0.56) * (0.94 + rnd(`f1r${i}`) * 0.1),
      tipo,
      giro: rnd(`f1g${i}`) * 0.5,
    };
  });

/** Celda mas cercana a un punto (para poner etiquetas en el corte). */
export const f1CeldaCerca = (tipo: "I" | "II", cerca: [number, number], R = 1.6, sep = 0.22): V3 => {
  const c = f1Celdas(R, sep)
    .filter((k) => k.tipo === tipo)
    .sort((a, b) => Math.hypot(a.x - cerca[0], a.y - cerca[1]) - Math.hypot(b.x - cerca[0], b.y - cerca[1]))[0];
  return [c.x, c.y, 0.02];
};

/**
 * Haz de fibras en corte transversal (mosaico tipo histologia). El eje del haz va en Z
 * y la cara de corte mira hacia +Z. cual = tipo resaltado; resalta = 0..1.
 */
export const F1HazMixto: React.FC<{
  R?: number;
  sep?: number;
  largo?: number;
  cual?: "I" | "II" | null;
  resalta?: number;
  color?: number; // 0 = todas grises, 1 = colores reales
}> = ({ R = 1.6, sep = 0.22, largo = 3, cual = null, resalta = 0, color = 1 }) => {
  const celdas = useMemo(() => f1Celdas(R, sep), [R, sep]);
  const gris = new THREE.Color("#b88a8a");
  const apagado = new THREE.Color("#2a1416");
  return (
    <group>
      {/* tejido conectivo de fondo (perimisio) */}
      <mesh position={[0, 0, -largo / 2 - 0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[R + sep * 0.7, R + sep * 0.7, largo, 48]} />
        <meshStandardMaterial color="#efc9b8" roughness={0.7} />
      </mesh>
      {celdas.map((c, i) => {
        const base = new THREE.Color(c.tipo === "I" ? F1_COL.I : F1_COL.II);
        const col = gris.clone().lerp(base, color);
        const es = cual === c.tipo;
        if (cual && !es) col.lerp(apagado, resalta * 0.7);
        const hex = `#${col.getHexString()}`;
        return (
          <mesh key={i} position={[c.x, c.y, -largo / 2 + 0.03]} rotation={[Math.PI / 2, c.giro, 0]}>
            <cylinderGeometry args={[c.r, c.r, largo, 6]} />
            <meshPhysicalMaterial
              color={hex}
              emissive={hex}
              emissiveIntensity={es ? 0.1 + resalta * 0.45 : 0.08}
              roughness={0.45}
              clearcoat={0.4}
            />
          </mesh>
        );
      })}
    </group>
  );
};

/** Fibra entera de pie (eje Y), con estrias. contrae: 0..1 se acorta y engrosa. */
export const F1Fibra: React.FC<{
  p?: V3;
  tipo: keyof typeof F1_COL;
  radio?: number;
  largo?: number;
  contrae?: number;
  brillo?: number;
}> = ({ p = [0, 0, 0], tipo, radio = 0.45, largo = 2.4, contrae = 0, brillo = 0 }) => {
  const col = F1_COL[tipo];
  const sy = 1 - 0.12 * contrae;
  const sr = 1 + 0.08 * contrae;
  const n = Math.round(largo / 0.16);
  return (
    <group position={p} scale={[sr, sy, sr]}>
      <mesh>
        <cylinderGeometry args={[radio, radio, largo, 40]} />
        <meshPhysicalMaterial color={col} emissive={col} emissiveIntensity={0.08 + brillo * 0.5} roughness={0.4} clearcoat={0.5} />
      </mesh>
      {Array.from({ length: n }).map((_, i) => (
        <mesh key={i} position={[0, -largo / 2 + (i + 0.5) * (largo / n), 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radio * 1.003, 0.012, 6, 40]} />
          <meshStandardMaterial color="#000000" transparent opacity={0.22} depthWrite={false} />
        </mesh>
      ))}
      <mesh position={[0, largo / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radio * 0.97, 40]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.25 + brillo * 0.5} roughness={0.6} />
      </mesh>
    </group>
  );
};

/** Mioglobina: proteina globular roja con su grupo hemo; o2 = 0..1 oxigeno enganchado. */
export const F1Mioglobina: React.FC<{ p: V3; o2?: number; escala?: number; brillo?: number; giro?: number }> = ({
  p,
  o2 = 1,
  escala = 1,
  brillo = 0.25,
  giro = 0,
}) => (
  <group position={p} scale={escala} rotation={[0, giro, giro * 0.5]}>
    <Esfera p={[0, 0, 0]} r={0.1} color="#d22c3c" brillo={brillo} />
    <Esfera p={[0.08, 0.06, 0.02]} r={0.07} color="#c21f33" brillo={brillo} />
    <Esfera p={[-0.08, 0.05, -0.02]} r={0.07} color="#e0414f" brillo={brillo} />
    <Esfera p={[0.0, -0.08, 0.04]} r={0.065} color="#b81a2e" brillo={brillo} />
    {o2 > 0 ? <O2Mol p={[0.12, 0.13, 0.06]} escala={0.55} op={o2} giro={0.6} /> : null}
  </group>
);

/** Capilar enrollado en espiral alrededor de una fibra vertical, con globulos rojos. */
export const F1Capilar: React.FC<{ R: number; largo: number; a0: number; vueltas?: number; t: number; op?: number; radio?: number }> = ({
  R,
  largo,
  a0,
  vueltas = 0.35,
  t,
  op = 1,
  radio = 0.07,
}) => {
  const curva = useMemo(() => {
    const pts = Array.from({ length: 16 }).map((_, i) => {
      const u = i / 15;
      const a = a0 + u * vueltas * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * R, -largo / 2 + u * largo, Math.sin(a) * R);
    });
    return new THREE.CatmullRomCurve3(pts);
  }, [R, largo, a0, vueltas]);
  const geo = useMemo(() => new THREE.TubeGeometry(curva, 64, radio, 10, false), [curva, radio]);
  if (op <= 0) return null;
  const n = 9;
  return (
    <group>
      <mesh geometry={geo}>
        <meshPhysicalMaterial color="#c4162c" emissive="#c4162c" emissiveIntensity={0.15} transparent opacity={0.5 * op} depthWrite={false} roughness={0.3} />
      </mesh>
      {Array.from({ length: n }).map((_, i) => {
        const f = (i / n + t) % 1;
        const q = curva.getPointAt(f);
        return (
          <mesh key={i} position={[q.x, q.y, q.z]} scale={[1, 0.5, 1]}>
            <sphereGeometry args={[radio * 0.8, 14, 10]} />
            <meshStandardMaterial color="#e3263a" emissive="#e3263a" emissiveIntensity={0.35} transparent={op < 1} opacity={op} />
          </mesh>
        );
      })}
    </group>
  );
};

const enCilindro = (seed: string, i: number, R: number, largo: number): V3 => {
  const a = rnd(`${seed}a${i}`) * Math.PI * 2;
  const r = Math.sqrt(rnd(`${seed}r${i}`)) * R;
  return [Math.cos(a) * r, (rnd(`${seed}y${i}`) - 0.5) * largo, Math.sin(a) * r];
};

/**
 * Una fibra vista de cerca (membrana translucida) con su contenido.
 * Cantidades: mito, mio (mioglobina), pcr, gluc, cap (capilares). ver* = 0..1 aparicion.
 */
export const F1FibraCerca: React.FC<{
  b: number;
  color: string;
  radio?: number;
  largo?: number;
  mito?: number;
  mio?: number;
  pcr?: number;
  gluc?: number;
  cap?: number;
  verMito?: number;
  verMio?: number;
  verPcr?: number;
  verGluc?: number;
  verCap?: number;
  o2?: number;
}> = ({
  b,
  color,
  radio = 1,
  largo = 5,
  mito = 0,
  mio = 0,
  pcr = 0,
  gluc = 0,
  cap = 0,
  verMito = 1,
  verMio = 1,
  verPcr = 1,
  verGluc = 1,
  verCap = 1,
  o2 = 1,
}) => {
  const Ri = radio * 0.82;
  const L = largo * 0.88;
  return (
    <group>
      {/* sarcolema translucido */}
      <mesh>
        <cylinderGeometry args={[radio, radio, largo, 48, 1, true]} />
        <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.12} transparent opacity={0.28} roughness={0.25} clearcoat={0.8} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* miofibrillas tenues */}
      {hexPack(radio * 0.62, radio * 0.42).map(([x, z], i) => (
        <mesh key={`f${i}`} position={[x, 0, z]}>
          <cylinderGeometry args={[radio * 0.15, radio * 0.15, largo * 0.98, 16, 1, true]} />
          <meshStandardMaterial color={color} transparent opacity={0.18} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {verMito > 0
        ? Array.from({ length: mito }).map((_, i) => (
            <Mitocondria key={`m${i}`} pos={enCilindro("f1m", i, Ri, L)} rot={[rnd(`f1mr${i}`), 0, Math.PI / 2 + (rnd(`f1mq${i}`) - 0.5) * 0.8]} escala={radio * 0.9 * verMito} />
          ))
        : null}
      {verMio > 0
        ? Array.from({ length: mio }).map((_, i) => {
            const p = enCilindro("f1o", i, Ri, L);
            return <F1Mioglobina key={`o${i}`} p={[p[0], p[1] + Math.sin(b * 3 + i) * 0.04, p[2]]} o2={o2} escala={radio * 0.85 * verMio} giro={i} />;
          })
        : null}
      {verPcr > 0
        ? Array.from({ length: pcr }).map((_, i) => {
            const p = enCilindro("f1p", i, Ri, L);
            return <Creatina key={`p${i}`} p={[p[0], p[1] + Math.sin(b * 3 + i) * 0.04, p[2]]} fosfato={1} escala={radio * 0.85 * verPcr} />;
          })
        : null}
      {verGluc > 0
        ? Array.from({ length: gluc }).map((_, i) => <Glucogeno key={`g${i}`} p={enCilindro("f1g", i, Ri * 0.9, L)} escala={radio * 0.75 * verGluc} />)
        : null}
      {Array.from({ length: cap }).map((_, i) => (
        <F1Capilar key={`c${i}`} R={radio + 0.1} largo={largo} a0={(i / Math.max(1, cap)) * Math.PI * 2 + 0.6} vueltas={0.3} t={b * 1.2 + i * 0.3} op={verCap} radio={radio * 0.08} />
      ))}
    </group>
  );
};

/**
 * Fila de cabezas de miosina sobre un filamento grueso, tirando de un filamento de actina.
 * fase = ciclos completados (continuo). Cada ciclo: ATP se une, se hidroliza y la cabeza golpea.
 */
export const F1FilaMiosina: React.FC<{ p: V3; fase: number; n?: number; largo?: number; color?: string; paso?: number }> = ({
  p,
  fase,
  n = 5,
  largo = 2.4,
  color = "#c45de8",
  paso = 0.07,
}) => {
  const desliza = fase * paso;
  const yAct = 0.62;
  const nAct = 26;
  return (
    <group position={p}>
      {/* filamento grueso */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, largo + 0.2, 16]} />
        <meshStandardMaterial color="#7a3fc4" emissive="#7a3fc4" emissiveIntensity={0.2} />
      </mesh>
      {/* actina (se desliza) */}
      <group position={[desliza, yAct, 0]}>
        {Array.from({ length: nAct }).map((_, i) => (
          <Esfera key={i} p={[-largo / 2 - 0.3 + i * 0.12, Math.sin(i * 1.3) * 0.02, 0]} r={0.065} color="#f2b83a" brillo={0.15} />
        ))}
        {/* disco Z al extremo */}
        <mesh position={[-largo / 2 - 0.42, 0, 0]}>
          <boxGeometry args={[0.06, 0.5, 0.3]} />
          <meshStandardMaterial color="#e8f0ff" emissive="#9fd8ff" emissiveIntensity={0.4} />
        </mesh>
      </group>
      {Array.from({ length: n }).map((_, i) => {
        const x = -largo / 2 + 0.2 + (i * (largo - 0.4)) / (n - 1);
        const u = (((fase + i * 0.17) % 1) + 1) % 1;
        // armada (+0.5) -> golpe de fuerza (-0.4) -> se suelta -> se vuelve a armar
        const ang = u < 0.35 ? 0.5 - (0.9 * u) / 0.35 : u < 0.5 ? -0.4 : -0.4 + (0.9 * (u - 0.5)) / 0.5;
        const golpe = u < 0.35 ? Math.sin((u / 0.35) * Math.PI) : 0;
        const atp = u >= 0.36 && u < 0.62 ? Math.sin(((u - 0.36) / 0.26) * Math.PI) : 0;
        return (
          <group key={i} position={[x, 0.05, 0.05]}>
            <group scale={0.55}>
              <CabezaMiosina angulo={ang} color={color} />
            </group>
            {golpe > 0.05 ? (
              <mesh position={[0, 0.5, 0.05]}>
                <sphereGeometry args={[0.12 + 0.08 * golpe, 12, 10]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.35 * golpe} depthWrite={false} />
              </mesh>
            ) : null}
            {atp > 0.02 ? <MiniATP p={[-0.05, 0.52 + 0.1 * atp, 0.2]} escala={0.9} op={atp} brillo={0.8} /> : null}
          </group>
        );
      })}
    </group>
  );
};

/** Pastel 3D de proporcion de fibras lentas (rojo) y rapidas (claro). frac = lentas 0..1. */
export const F1Pastel: React.FC<{ p: V3; frac: number; r?: number; grosor?: number }> = ({ p, frac, r = 0.5, grosor = 0.16 }) => {
  const f = Math.min(0.999, Math.max(0.001, frac));
  const ta = Math.PI * 2 * f;
  return (
    <group position={p} rotation={[Math.PI / 2 - 0.25, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[r, r, grosor, 64, 1, false, Math.PI, ta]} />
        <meshPhysicalMaterial color={F1_COL.I} emissive={F1_COL.I} emissiveIntensity={0.25} roughness={0.35} clearcoat={0.6} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[r * 0.97, r * 0.97, grosor * 0.94, 64, 1, false, Math.PI + ta, Math.PI * 2 - ta]} />
        <meshPhysicalMaterial color={F1_COL.II} emissive={F1_COL.II} emissiveIntensity={0.12} roughness={0.4} clearcoat={0.4} />
      </mesh>
    </group>
  );
};

// =====================================================================================
// ---- Modelos de "Fibras Parte 2" (prefijo F2; imports con alias para no chocar) ------
// =====================================================================================
import * as F2React from "react";
import * as F2THREE from "three";
import { mix as f2mix, V3 as F2V3 } from "../fisio/motor";
import { hexPack as f2HexPack, rnd as f2Rnd, Tubo as F2Tubo } from "../fisio/modelos/comun";
import { Mitocondria as F2Mitocondria } from "../fisio/modelos/musculo";
import { Enlace as F2Enlace, Esfera as F2Esfera } from "../fisio/modelos/energia";
import { Mielina as F2Mielina } from "./modelos-contraccion";

/** Colores por tipo de fibra: I (roja, lenta), IIa (rosada), IIx (blanca, rapida). */
export const F2_COL = { I: "#c01f30", IIa: "#ee7d93", IIx: "#f4e1d8", nervio: "#ffd166", senal: "#fff3a0" };
export const F2_TIPOS = [F2_COL.I, F2_COL.IIa, F2_COL.IIx];

let f2TexCache: F2THREE.Texture | null = null;
/** Estriado en grises: se multiplica por el color de la fibra (sirve para rojas y blancas). */
const f2TexEstriado = () => {
  if (f2TexCache) return f2TexCache;
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 4, 128);
  ctx.fillStyle = "#b9b0ad";
  ctx.fillRect(0, 26, 4, 76);
  ctx.fillStyle = "#8e8280";
  ctx.fillRect(0, 0, 4, 4);
  ctx.fillRect(0, 124, 4, 4);
  const t = new F2THREE.CanvasTexture(c);
  t.wrapS = F2THREE.RepeatWrapping;
  t.wrapT = F2THREE.RepeatWrapping;
  t.colorSpace = F2THREE.SRGBColorSpace;
  f2TexCache = t;
  return t;
};

/** Punto a lo largo de una polilinea (t 0..1, por longitud). */
export const f2Polilinea = (pts: F2V3[], t: number): F2V3 => {
  const seg = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1], q[2] - pts[i][2]));
  const tot = seg.reduce((a, s) => a + s, 0);
  let d = Math.min(1, Math.max(0, t)) * tot;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const u = seg[i] > 0 ? Math.min(1, d / seg[i]) : 0;
      return [f2mix(pts[i][0], pts[i + 1][0], u), f2mix(pts[i][1], pts[i + 1][1], u), f2mix(pts[i][2], pts[i + 1][2], u)];
    }
    d -= seg[i];
  }
  return pts[pts.length - 1];
};

/** Impulso nervioso: punto blanco con halo. */
export const F2Pulso: F2React.FC<{ p: F2V3; r?: number }> = ({ p, r = 0.05 }) => (
  <group position={p}>
    <mesh>
      <sphereGeometry args={[r, 16, 12]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
    <mesh>
      <sphereGeometry args={[r * 2.6, 16, 12]} />
      <meshBasicMaterial color={F2_COL.nervio} transparent opacity={0.45} depthWrite={false} />
    </mesh>
  </group>
);

/**
 * Fibra muscular vertical (centro en p). act = brillo de activacion; grosor escala el radio
 * (hipertrofia); mito = n.o de mitocondrias visibles dentro; capilares 0..1; gluco = n.o de
 * granulos de glucogeno; dano 0..1 = microrroturas en la superficie.
 */
export const F2Fibra: F2React.FC<{
  p: F2V3;
  color: string;
  r?: number;
  alto?: number;
  act?: number;
  grosor?: number;
  mito?: number;
  capilares?: number;
  op?: number;
  gluco?: number;
  dano?: number;
  seed?: string;
}> = ({ p, color, r = 0.18, alto = 2.4, act = 0, grosor = 1, mito = 0, capilares = 0, op = 1, gluco = 0, dano = 0, seed = "f2f" }) => {
  const R = r * grosor;
  const tex = F2React.useMemo(() => {
    const t = f2TexEstriado().clone();
    t.needsUpdate = true;
    t.repeat.set(1, Math.round(alto * 7));
    return t;
  }, [alto]);
  const trans = op < 1;
  const nM = Math.floor(mito);
  const nG = Math.floor(gluco);
  const helices = capilares > 0.01 ? [0, Math.PI] : [];
  return (
    <group position={p}>
      <mesh>
        <cylinderGeometry args={[R, R, alto, 40, 1, true]} />
        <meshPhysicalMaterial
          color={color}
          map={tex}
          emissive={color}
          emissiveIntensity={0.06 + act * 0.9}
          roughness={0.45}
          clearcoat={0.35}
          transparent={trans}
          opacity={op}
          depthWrite={!trans}
          side={F2THREE.DoubleSide}
        />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, (s * alto) / 2, 0]} rotation={[-s * Math.PI / 2, 0, 0]}>
          <circleGeometry args={[R, 40]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15 + act * 0.6} transparent={trans} opacity={op} roughness={0.6} />
        </mesh>
      ))}
      {act > 0.02 ? (
        <mesh>
          <cylinderGeometry args={[R * 1.35, R * 1.35, alto * 1.02, 32, 1, true]} />
          <meshBasicMaterial color="#ffe066" transparent opacity={act * 0.22} depthWrite={false} side={F2THREE.DoubleSide} />
        </mesh>
      ) : null}
      {Array.from({ length: nM }).map((_, i) => {
        const a = f2Rnd(`${seed}ma${i}`) * Math.PI * 2;
        const rr = R * (0.35 + f2Rnd(`${seed}mr${i}`) * 0.4);
        const y = (f2Rnd(`${seed}my${i}`) - 0.5) * alto * 0.85;
        return (
          <F2Mitocondria key={i} pos={[Math.cos(a) * rr, y, Math.sin(a) * rr]} rot={[0, a, Math.PI / 2]} escala={Math.min(0.55, R * 1.5)} />
        );
      })}
      {Array.from({ length: nG }).map((_, i) => {
        const a = f2Rnd(`${seed}ga${i}`) * Math.PI * 2;
        const rr = R * f2Rnd(`${seed}gr${i}`) * 0.75;
        const y = (f2Rnd(`${seed}gy${i}`) - 0.5) * alto * 0.85;
        return <F2Esfera key={`g${i}`} p={[Math.cos(a) * rr, y, Math.sin(a) * rr]} r={Math.max(0.03, R * 0.13)} color="#7b5cff" brillo={0.6} />;
      })}
      {helices.map((f0) => {
        const pts: F2V3[] = Array.from({ length: 13 }).map((_, k) => {
          const u = k / 12;
          const a = f0 + u * Math.PI * 3;
          const rr = R * 1.07 + 0.02;
          return [Math.cos(a) * rr, (u - 0.5) * alto * 0.98, Math.sin(a) * rr];
        });
        return <F2Tubo key={f0} puntos={pts} radio={0.022} color="#ff2a3d" emisivo={0.5} opacidad={Math.min(1, capilares * 1.4)} segmentos={60} />;
      })}
      {dano > 0.02
        ? Array.from({ length: 5 }).map((_, i) => {
            const a = -0.9 + i * 0.45;
            const y = (f2Rnd(`${seed}dy${i}`) - 0.5) * alto * 0.7;
            return (
              <mesh key={`d${i}`} position={[Math.sin(a) * R * 1.01, y, Math.cos(a) * R * 1.01]} rotation={[0, a, 0.5]} scale={[R * 0.9, 0.025, 0.02]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color="#3a0610" transparent opacity={dano} />
              </mesh>
            );
          })
        : null}
    </group>
  );
};

/**
 * Unidad motora vertical: soma de la motoneurona en p, axon que baja y se ramifica a n fibras
 * (todas del mismo color). tam = radio del soma (pequeno = lenta, grande = rapida).
 * pulso 0..1: 0..0.6 por el axon, 0.6..1 por las ramas (fuera de rango = sin impulso).
 */
export const F2Unidad: F2React.FC<{
  p: F2V3;
  color: string;
  tam?: number;
  n?: number;
  sep?: number;
  ax?: number;
  act?: number;
  pulso?: number;
  rf?: number;
  alto?: number;
  seed?: string;
}> = ({ p, color, tam = 0.14, n = 4, sep = 0.4, ax = 1.2, act = 0, pulso = -1, rf = 0.14, alto = 1.8, seed = "u" }) => {
  const axR = 0.012 + tam * 0.12;
  const axon: F2V3[] = [
    [0, -tam * 0.9, 0],
    [0.04, -ax * 0.35, 0.04],
    [-0.03, -ax * 0.7, 0.03],
    [0, -ax, 0],
  ];
  const fin = axon[axon.length - 1];
  const fibras = Array.from({ length: n }).map((_, i) => (i - (n - 1) / 2) * sep);
  const placa = (x: number): F2V3 => [x, -ax - 0.42, rf + 0.01];
  const rama = (x: number): F2V3[] => [fin, [x * 0.55, -ax - 0.16, rf * 0.5], placa(x)];
  const glow = 0.35 + act * 1.2;
  return (
    <group position={p}>
      <mesh>
        <sphereGeometry args={[tam, 28, 20]} />
        <meshPhysicalMaterial color={F2_COL.nervio} emissive={F2_COL.nervio} emissiveIntensity={glow} roughness={0.35} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, 0, tam * 0.55]}>
        <sphereGeometry args={[tam * 0.38, 16, 12]} />
        <meshStandardMaterial color="#b0742a" />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2 + 0.5;
        if (Math.sin(a) < -0.75) return null;
        const d: F2V3 = [Math.cos(a) * tam * 2.8, Math.sin(a) * tam * 2.4 + tam * 0.4, (f2Rnd(`${seed}dz${i}`) - 0.5) * tam * 2];
        const m: F2V3 = [Math.cos(a + 0.3) * tam * 1.5, Math.sin(a + 0.3) * tam * 1.3, d[2] * 0.4];
        return <F2Tubo key={i} puntos={[[0, 0, 0], m, d]} radio={axR * 0.7} color={F2_COL.nervio} emisivo={0.3 + act * 0.6} segmentos={10} />;
      })}
      <F2Tubo puntos={axon} radio={axR} color={F2_COL.nervio} emisivo={0.35 + act * 0.8} segmentos={30} />
      <F2Mielina puntos={axon} n={4} radio={axR * 2.1} desde={0.12} hasta={0.92} />
      {fibras.map((x, i) => (
        <group key={i}>
          <F2Tubo puntos={rama(x)} radio={axR * 0.6} color={F2_COL.nervio} emisivo={0.35 + act * 0.9} segmentos={14} />
          <mesh position={placa(x)} scale={[1.3, 1, 0.5]}>
            <sphereGeometry args={[0.045, 14, 10]} />
            <meshStandardMaterial color={F2_COL.nervio} emissive={F2_COL.nervio} emissiveIntensity={0.5 + act} />
          </mesh>
          <F2Fibra p={[x, -ax - 0.25 - alto / 2, 0]} color={color} r={rf} alto={alto} act={act} seed={`${seed}${i}`} />
        </group>
      ))}
      {pulso >= 0 && pulso < 1
        ? pulso < 0.6
          ? <F2Pulso p={f2Polilinea([[0, 0, 0], ...axon], pulso / 0.6)} r={axR * 1.6} />
          : fibras.map((x, i) => <F2Pulso key={i} p={f2Polilinea(rama(x), (pulso - 0.6) / 0.4)} r={axR * 1.4} />)
        : null}
    </group>
  );
};

/** Trozo de medula espinal (horizontal, a lo largo de X) con la sustancia gris en mariposa. */
export const F2Medula: F2React.FC<{ p: F2V3; largo?: number; r?: number; brillo?: number }> = ({ p, largo = 4, r = 0.45, brillo = 0 }) => (
  <group position={p}>
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[r, r, largo, 40, 1, true]} />
      <meshPhysicalMaterial color="#efe2d4" emissive="#ffd166" emissiveIntensity={brillo * 0.15} transparent opacity={0.16} roughness={0.5} depthWrite={false} side={F2THREE.DoubleSide} />
    </mesh>
    {[1, -1].map((s) => (
      <mesh key={s} position={[(s * largo) / 2, 0, 0]} rotation={[0, (s * Math.PI) / 2, 0]}>
        <circleGeometry args={[r, 40]} />
        <meshStandardMaterial color="#e9d6c4" transparent opacity={0.35} />
      </mesh>
    ))}
    <mesh scale={[largo * 0.48, r * 0.55, r * 0.35]}>
      <sphereGeometry args={[1, 32, 16]} />
      <meshStandardMaterial color="#9d8a86" transparent opacity={0.22} depthWrite={false} />
    </mesh>
  </group>
);

/**
 * Corte transversal de un musculo (mosaico de fibras, como una tincion histologica), de cara a +Z.
 * act = [I, IIa, IIx] activacion; lentas = fraccion de fibras tipo I; cambio = fraccion de IIx
 * que ya se volvio IIa.
 */
export const F2Haz: F2React.FC<{
  p: F2V3;
  r?: number;
  act?: [number, number, number];
  lentas?: number;
  cambio?: number;
  seed?: string;
  escala?: number;
}> = ({ p, r = 0.5, act = [0, 0, 0], lentas = 0.5, cambio = 0, seed = "hz", escala = 1 }) => {
  const sep = r * 0.2;
  const pos = F2React.useMemo(() => f2HexPack(r * 0.9, sep), [r, sep]);
  return (
    <group position={p} scale={escala}>
      <mesh position={[0, 0, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r, r, 0.12, 48]} />
        <meshStandardMaterial color="#3b0d14" roughness={0.7} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.06]}>
        <cylinderGeometry args={[r * 1.02, r * 1.02, 0.16, 48, 1, true]} />
        <meshStandardMaterial color="#f2d6c8" roughness={0.6} side={F2THREE.DoubleSide} />
      </mesh>
      {pos.map(([x, y], i) => {
        const u = f2Rnd(`${seed}t${i}`);
        let tipo = u < lentas ? 0 : u < lentas + (1 - lentas) * 0.55 ? 1 : 2;
        let col = new F2THREE.Color(F2_TIPOS[tipo]);
        if (tipo === 2) {
          const c = Math.min(1, Math.max(0, (cambio - f2Rnd(`${seed}c${i}`) * 0.8) / 0.2));
          col = col.lerp(new F2THREE.Color(F2_COL.IIa), c);
          if (c > 0.5) tipo = 1;
        }
        const a = act[tipo];
        const hex = `#${col.getHexString()}`;
        const rf = sep * 0.46 * (tipo === 0 ? 0.92 : 1.05);
        return (
          <group key={i} position={[x + (f2Rnd(`${seed}x${i}`) - 0.5) * sep * 0.12, y, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[rf, rf, 0.1, 18]} />
              <meshPhysicalMaterial color={hex} emissive={hex} emissiveIntensity={0.08 + a * 0.85} roughness={0.4} clearcoat={0.4} />
            </mesh>
            {a > 0.02 ? (
              <mesh position={[0, 0, 0.06]}>
                <circleGeometry args={[rf * 1.25, 18]} />
                <meshBasicMaterial color="#ffe066" transparent opacity={a * 0.35} depthWrite={false} />
              </mesh>
            ) : null}
          </group>
        );
      })}
    </group>
  );
};

/** Doble helice de ADN vertical (centro en p). */
export const F2ADN: F2React.FC<{ p: F2V3; alto?: number; r?: number; giro?: number; n?: number; brillo?: number }> = ({
  p,
  alto = 2,
  r = 0.32,
  giro = 0,
  n = 18,
  brillo = 0.3,
}) => {
  const PARES = ["#43e0ff", "#ffd23f", "#ff5c8a", "#c6f432"];
  return (
    <group position={p} rotation={[0, giro, 0]}>
      {Array.from({ length: n }).map((_, i) => {
        const y = (i / (n - 1) - 0.5) * alto;
        const a = i * 0.55;
        const A: F2V3 = [Math.cos(a) * r, y, Math.sin(a) * r];
        const B: F2V3 = [-A[0], y, -A[2]];
        const M: F2V3 = [0, y, 0];
        return (
          <group key={i}>
            <F2Esfera p={A} r={0.07} color="#7aa8ff" brillo={brillo} />
            <F2Esfera p={B} r={0.07} color="#b48cff" brillo={brillo} />
            <F2Enlace a={A} b={M} r={0.028} color={PARES[i % 4]} brillo={brillo} />
            <F2Enlace a={M} b={B} r={0.028} color={PARES[(i + 2) % 4]} brillo={brillo} />
          </group>
        );
      })}
    </group>
  );
};

/** Flecha 3D de a hacia b (doble = punta en ambos lados). */
export const F2Flecha: F2React.FC<{ a: F2V3; b: F2V3; color?: string; r?: number; op?: number; doble?: boolean }> = ({
  a,
  b,
  color = "#c6f432",
  r = 0.05,
  op = 1,
  doble = false,
}) => {
  const d = new F2THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const largo = d.length();
  const q = new F2THREE.Quaternion().setFromUnitVectors(new F2THREE.Vector3(0, 1, 0), d.clone().normalize());
  const punta = r * 4;
  const ini = doble ? punta : 0;
  return (
    <group position={a} quaternion={q}>
      <mesh position={[0, (ini + largo - punta) / 2, 0]}>
        <cylinderGeometry args={[r, r, Math.max(0.01, largo - punta - ini), 14]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent={op < 1} opacity={op} />
      </mesh>
      <mesh position={[0, largo - punta / 2, 0]}>
        <coneGeometry args={[r * 2.4, punta, 20]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent={op < 1} opacity={op} />
      </mesh>
      {doble ? (
        <mesh position={[0, punta / 2, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[r * 2.4, punta, 20]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent={op < 1} opacity={op} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Aspa roja de "tachado". */
export const F2Tacha: F2React.FC<{ p: F2V3; tam?: number; op?: number }> = ({ p, tam = 0.6, op = 1 }) => (
  <group position={p} scale={tam}>
    {[1, -1].map((s) => (
      <mesh key={s} rotation={[0, 0, (s * Math.PI) / 4]}>
        <boxGeometry args={[0.2, 1.3, 0.12]} />
        <meshStandardMaterial color="#ff3344" emissive="#ff3344" emissiveIntensity={0.8} transparent opacity={op} />
      </mesh>
    ))}
  </group>
);

/** Mancuerna (horizontal, a lo largo de X). */
export const F2Pesa: F2React.FC<{ p: F2V3; escala?: number; giro?: number }> = ({ p, escala = 1, giro = 0 }) => (
  <group position={p} scale={escala} rotation={[0.3, giro, 0]}>
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.05, 0.05, 1.1, 16]} />
      <meshStandardMaterial color="#c9d3dc" metalness={0.8} roughness={0.3} />
    </mesh>
    {[-0.42, -0.3, 0.3, 0.42].map((x) => (
      <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[Math.abs(x) > 0.4 ? 0.22 : 0.28, Math.abs(x) > 0.4 ? 0.22 : 0.28, 0.1, 28]} />
        <meshStandardMaterial color="#2a2f36" metalness={0.5} roughness={0.4} />
      </mesh>
    ))}
  </group>
);

/** Barra olimpica con discos (a lo largo de X), para la sentadilla pesada. */
export const F2Barra: F2React.FC<{ p: F2V3; largo?: number }> = ({ p, largo = 1.5 }) => (
  <group position={p}>
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.014, 0.014, largo, 12]} />
      <meshStandardMaterial color="#c9d3dc" metalness={0.8} roughness={0.3} />
    </mesh>
    {[-1, 1].flatMap((s) =>
      [0, 1].map((k) => (
        <mesh key={`${s}${k}`} position={[s * (largo / 2 - 0.12 - k * 0.06), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2 - k * 0.04, 0.2 - k * 0.04, 0.05, 32]} />
          <meshStandardMaterial color={k ? "#2a2f36" : "#c0392b"} metalness={0.3} roughness={0.5} />
        </mesh>
      )),
    )}
  </group>
);

/** Tazon de arroz (carbohidratos). */
export const F2Arroz: F2React.FC<{ p: F2V3; escala?: number }> = ({ p, escala = 1 }) => (
  <group position={p} scale={escala}>
    <mesh position={[0, 0.05, 0]}>
      <sphereGeometry args={[0.42, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      <meshPhysicalMaterial color="#3d7bd9" side={F2THREE.DoubleSide} roughness={0.35} clearcoat={0.5} />
    </mesh>
    <mesh position={[0, 0.06, 0]} scale={[0.4, 0.14, 0.4]}>
      <sphereGeometry args={[1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#f7f3ea" roughness={0.8} />
    </mesh>
    {Array.from({ length: 26 }).map((_, i) => {
      const a = f2Rnd(`ar${i}`) * Math.PI * 2;
      const rr = Math.sqrt(f2Rnd(`arr${i}`)) * 0.34;
      const h = 0.06 + 0.14 * Math.sqrt(Math.max(0, 1 - (rr / 0.4) ** 2));
      return (
        <mesh key={i} position={[Math.cos(a) * rr, h, Math.sin(a) * rr]} rotation={[f2Rnd(`arx${i}`) * 3, a, 0]} scale={[0.018, 0.045, 0.018]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      );
    })}
  </group>
);
