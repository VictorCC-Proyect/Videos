// Modelos 3D del short de glucosa: pan dulce, refresco, medidor, vellosidades,
// pancreas, insulina (llave), receptor de insulina, GLUT4 y la membrana muscular.
import React from "react";
import * as THREE from "three";
import { mix, mix3, V3 } from "../fisio/motor";
import { rnd } from "../fisio/modelos/comun";
import { Cadena, Membrana, Mol } from "../fisio/modelos/energia";
import { CilindroX } from "../fisio/modelos/musculo";
import { K } from "./marco";

export const GLU = "#ffd166";
export const INS = "#4f8dff";
export const GLUT = "#3ee08f";
export const REC = "#b48cff";
const GRIS = "#6b717c";

export const mezcla = (a: string, b: string, t: number) =>
  "#" + new THREE.Color(a).lerp(new THREE.Color(b), Math.min(1, Math.max(0, t))).getHexString();

/** Molecula de glucosa: anillo de 6 carbonos. */
export const Glucosa: React.FC<{ p: V3; escala?: number; op?: number; brillo?: number }> = ({ p, escala = 1, op = 1, brillo = 0.45 }) => (
  <group position={p} scale={escala}>
    <Cadena n={6} anillo color={GLU} sep={0.12} op={op} brillo={brillo} />
  </group>
);

// ---- Comida -------------------------------------------------------------------

/** Pan dulce tipo concha: semiesfera dorada con costra de azucar rayada. */
export const PanDulce: React.FC<{ p: V3; escala?: number; giro?: number }> = ({ p, escala = 1, giro = 0 }) => (
  <group position={p} scale={escala} rotation={[0, giro, 0]}>
    <mesh scale={[1, 0.6, 1]}>
      <sphereGeometry args={[0.5, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshPhysicalMaterial color="#d38a34" roughness={0.6} clearcoat={0.2} />
    </mesh>
    <mesh scale={[1.03, 0.63, 1.03]}>
      <sphereGeometry args={[0.5, 40, 14, 0, Math.PI * 2, 0, Math.PI * 0.36]} />
      <meshPhysicalMaterial color="#f7e3bd" roughness={0.85} />
    </mesh>
    {[0, 1, 2].map((i) => (
      <mesh key={i} rotation={[0, (i * Math.PI) / 3, 0]} scale={[1.05, 0.645, 1.05]}>
        <torusGeometry args={[0.5, 0.012, 6, 48, Math.PI]} />
        <meshStandardMaterial color="#b0702a" />
      </mesh>
    ))}
    <mesh>
      <cylinderGeometry args={[0.5, 0.5, 0.02, 40]} />
      <meshStandardMaterial color="#a8641f" />
    </mesh>
  </group>
);

/** Botella de refresco roja (sin marca). */
export const Refresco: React.FC<{ p: V3; escala?: number }> = ({ p, escala = 1 }) => (
  <group position={p} scale={escala}>
    <mesh position={[0, 0.21, 0]}>
      <cylinderGeometry args={[0.12, 0.12, 0.42, 32]} />
      <meshPhysicalMaterial color="#d0122e" roughness={0.15} clearcoat={1} emissive="#7a0010" emissiveIntensity={0.2} />
    </mesh>
    <mesh position={[0, 0.42, 0]} scale={[1, 0.7, 1]}>
      <sphereGeometry args={[0.12, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshPhysicalMaterial color="#d0122e" roughness={0.15} clearcoat={1} />
    </mesh>
    <mesh position={[0, 0.54, 0]}>
      <cylinderGeometry args={[0.04, 0.05, 0.16, 20]} />
      <meshPhysicalMaterial color="#d0122e" roughness={0.15} clearcoat={1} />
    </mesh>
    <mesh position={[0, 0.63, 0]}>
      <cylinderGeometry args={[0.048, 0.048, 0.04, 20]} />
      <meshStandardMaterial color="#f2f2f2" />
    </mesh>
    <mesh position={[0, 0.22, 0]}>
      <cylinderGeometry args={[0.123, 0.123, 0.12, 32]} />
      <meshStandardMaterial color="#f7f7f7" />
    </mesh>
  </group>
);

/** Mesita redonda. */
export const Mesa: React.FC<{ p: V3; alto?: number }> = ({ p, alto = 0.75 }) => (
  <group position={p}>
    <mesh position={[0, alto, 0]}>
      <cylinderGeometry args={[0.36, 0.36, 0.04, 40]} />
      <meshPhysicalMaterial color="#e8eef0" roughness={0.3} clearcoat={0.6} />
    </mesh>
    <mesh position={[0, alto / 2, 0]}>
      <cylinderGeometry args={[0.035, 0.035, alto, 16]} />
      <meshStandardMaterial color="#8aa0a6" />
    </mesh>
    <mesh position={[0, 0.015, 0]}>
      <cylinderGeometry args={[0.2, 0.2, 0.03, 32]} />
      <meshStandardMaterial color="#8aa0a6" />
    </mesh>
  </group>
);

/** Brocoli: tallo + racimo de esferas verdes. */
export const Brocoli: React.FC<{ p: V3; escala?: number }> = ({ p, escala = 1 }) => (
  <group position={p} scale={escala}>
    <mesh position={[0, 0.08, 0]}>
      <cylinderGeometry args={[0.04, 0.055, 0.16, 12]} />
      <meshStandardMaterial color="#9ccf6a" />
    </mesh>
    {Array.from({ length: 7 }).map((_, i) => {
      const a = (i / 6) * Math.PI * 2;
      const q: V3 = i === 6 ? [0, 0.22, 0] : [Math.cos(a) * 0.07, 0.18, Math.sin(a) * 0.07];
      return (
        <mesh key={i} position={q}>
          <sphereGeometry args={[0.065, 14, 10]} />
          <meshStandardMaterial color="#2f8a3a" roughness={0.9} />
        </mesh>
      );
    })}
  </group>
);

/** Hoja verde (lechuga / espinaca). */
export const Hoja: React.FC<{ p: V3; giro?: number; escala?: number }> = ({ p, giro = 0, escala = 1 }) => (
  <mesh position={p} rotation={[0, giro, 0.15]} scale={[0.2 * escala, 0.025 * escala, 0.11 * escala]}>
    <sphereGeometry args={[1, 20, 12]} />
    <meshStandardMaterial color="#5cc34f" roughness={0.7} />
  </mesh>
);

/** Manzana entera. */
export const Manzana: React.FC<{ p: V3; escala?: number }> = ({ p, escala = 1 }) => (
  <group position={p} scale={escala}>
    <mesh scale={[1, 0.92, 1]}>
      <sphereGeometry args={[0.15, 28, 20]} />
      <meshPhysicalMaterial color="#c8202c" clearcoat={0.8} roughness={0.3} />
    </mesh>
    <mesh position={[0, 0.16, 0]}>
      <cylinderGeometry args={[0.008, 0.01, 0.06, 6]} />
      <meshStandardMaterial color="#5a3a1a" />
    </mesh>
    <mesh position={[0.04, 0.17, 0]} rotation={[0, 0, -0.6]} scale={[0.05, 0.012, 0.025]}>
      <sphereGeometry args={[1, 12, 8]} />
      <meshStandardMaterial color="#4caf50" />
    </mesh>
  </group>
);

// ---- Medidor de glucosa (columna que se llena) --------------------------------

export const Medidor: React.FC<{ p: V3; nivel: number; alto?: number }> = ({ p, nivel, alto = 1.5 }) => {
  const h = Math.max(0.02, alto * nivel);
  const col = nivel < 0.5 ? mezcla(K.lima, K.amarillo, nivel * 2) : mezcla(K.amarillo, K.rojo, (nivel - 0.5) * 2);
  return (
    <group position={p}>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.2, 0.22, 0.06, 32]} />
        <meshStandardMaterial color="#2b3f45" />
      </mesh>
      <mesh position={[0, 0.06 + h / 2, 0]}>
        <cylinderGeometry args={[0.085, 0.085, h, 24]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, 0.06 + alto / 2, 0]}>
        <cylinderGeometry args={[0.11, 0.11, alto, 32, 1, true]} />
        <meshPhysicalMaterial color="#cfefff" transparent opacity={0.22} roughness={0.05} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[0.12, 0.06 + ((i + 1) * alto) / 7, 0]}>
          <boxGeometry args={[0.05, 0.012, 0.012]} />
          <meshBasicMaterial color="#cfe6ea" />
        </mesh>
      ))}
    </group>
  );
};

// ---- Intestino: vellosidades ---------------------------------------------------

export const VELLOS: V3[] = [
  ...[-2.1, -1.4, -0.7, 0, 0.7, 1.4, 2.1].map((x) => [x, 0, 0.45] as V3),
  ...[-1.75, -1.05, -0.35, 0.35, 1.05, 1.75].map((x) => [x, 0, -0.55] as V3),
];

export const Vellosidades: React.FC<{ b: number; brillo?: number }> = ({ b, brillo = 0 }) => (
  <group>
    <mesh position={[0, -0.3, 0]}>
      <boxGeometry args={[6.4, 0.6, 2.4]} />
      <meshPhysicalMaterial color="#d9707f" roughness={0.6} clearcoat={0.3} />
    </mesh>
    {VELLOS.map((v, i) => (
      <group key={i} position={v} rotation={[Math.sin(b * 2 + i * 1.3) * 0.05, 0, Math.sin(b * 3 + i) * 0.07]}>
        <mesh position={[0, 0.8, 0]}>
          <capsuleGeometry args={[0.26, 1.05, 10, 20]} />
          <meshPhysicalMaterial color="#f5a6b3" emissive="#ff8fa3" emissiveIntensity={0.08 + brillo * 0.3} transparent opacity={0.72} roughness={0.45} clearcoat={0.4} depthWrite={false} />
        </mesh>
        {/* capilar dentro de la vellosidad */}
        <mesh position={[0, 0.72, 0]}>
          <capsuleGeometry args={[0.07, 0.95, 6, 12]} />
          <meshStandardMaterial color="#c4162c" emissive="#e3263a" emissiveIntensity={0.35} />
        </mesh>
      </group>
    ))}
  </group>
);

/** Carbohidrato complejo: varias glucosas unidas. */
export const Almidon: React.FC<{ p: V3; n?: number; separa: number; op?: number; giro?: number }> = ({ p, n = 4, separa, op = 1, giro = 0 }) => {
  const paso = 0.34 + separa * 0.5;
  return (
    <group position={p} rotation={[0, 0, giro]}>
      {Array.from({ length: n }).map((_, i) => (
        <Glucosa key={i} p={[(i - (n - 1) / 2) * paso, (i % 2 ? 0.06 : -0.06) * (1 + separa * 3), 0]} op={op} />
      ))}
      {separa < 0.15
        ? Array.from({ length: n - 1 }).map((_, i) => (
            <mesh key={`e${i}`} position={[(i + 0.5 - (n - 1) / 2) * paso, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.025, 0.025, 0.12, 8]} />
              <meshStandardMaterial color="#fff2c4" emissive="#ffd166" emissiveIntensity={0.4} transparent opacity={op * (1 - separa / 0.15)} />
            </mesh>
          ))
        : null}
    </group>
  );
};

// ---- Pancreas -------------------------------------------------------------------

const PAN_SEG = Array.from({ length: 11 }).map((_, i) => {
  const u = i / 10;
  return { c: [mix(-2.0, 2.2, u), 0.35 * Math.sin(u * Math.PI) - 0.15 * u, 0] as V3, r: mix(0.62, 0.26, u) };
});
const PAN_LOB = Array.from({ length: 46 }).map((_, i) => {
  const s = PAN_SEG[Math.floor(rnd(`pl${i}`) * PAN_SEG.length)];
  const a = rnd(`pa${i}`) * Math.PI * 2;
  const e = (rnd(`pe${i}`) - 0.3) * 1.6;
  const d: V3 = [Math.cos(a) * Math.cos(e) * 0.5, Math.sin(e) * 0.75, Math.sin(a) * Math.cos(e) * 0.75];
  return { p: [s.c[0] + d[0] * s.r, s.c[1] + d[1] * s.r, s.c[2] + d[2] * s.r] as V3, r: s.r * (0.3 + rnd(`pr${i}`) * 0.18) };
});
export const ISLOTES: V3[] = [1, 3, 4, 6, 7, 9].map((k, i) => {
  const s = PAN_SEG[k];
  return [s.c[0] + (i % 2 ? 0.08 : -0.06), s.c[1] + (i % 2 ? 0.18 : -0.1) * s.r, s.c[2] + s.r * 0.78];
});

export const Pancreas: React.FC<{ brillo?: number; islotes?: number }> = ({ brillo = 0, islotes = 0 }) => (
  <group>
    {PAN_SEG.map((s, i) => (
      <mesh key={i} position={s.c} scale={[1.25, 0.8, 0.82]}>
        <sphereGeometry args={[s.r, 28, 20]} />
        <meshPhysicalMaterial color="#f0a07c" emissive="#ff8a6a" emissiveIntensity={0.08 + brillo * 0.35} roughness={0.55} clearcoat={0.3} />
      </mesh>
    ))}
    {PAN_LOB.map((l, i) => (
      <mesh key={`l${i}`} position={l.p}>
        <sphereGeometry args={[l.r, 14, 10]} />
        <meshPhysicalMaterial color="#f4b08e" emissive="#ff8a6a" emissiveIntensity={0.06 + brillo * 0.3} roughness={0.6} />
      </mesh>
    ))}
    {ISLOTES.map((p, i) => (
      <group key={`i${i}`} position={p}>
        <mesh>
          <sphereGeometry args={[0.11, 16, 12]} />
          <meshStandardMaterial color="#fff0b0" emissive="#ffd23f" emissiveIntensity={0.3 + islotes * 1.6} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.2 + islotes * 0.08, 14, 10]} />
          <meshBasicMaterial color="#ffd23f" transparent opacity={0.12 + islotes * 0.25} depthWrite={false} />
        </mesh>
      </group>
    ))}
  </group>
);

// ---- Insulina (llave), receptor y GLUT4 ------------------------------------------

/** Insulina representada como llave azul (metafora rotulada). */
export const Llave: React.FC<{ p: V3; escala?: number; giro?: number; op?: number; brillo?: number; color?: string }> = ({
  p,
  escala = 1,
  giro = 0,
  op = 1,
  brillo = 0.5,
  color = INS,
}) => (
  <group position={p} scale={escala} rotation={[0, 0, giro]}>
    <mesh position={[0, 0.17, 0]}>
      <torusGeometry args={[0.085, 0.035, 10, 24]} />
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={brillo} clearcoat={0.8} roughness={0.25} transparent={op < 1} opacity={op} />
    </mesh>
    <mesh position={[0, -0.04, 0]}>
      <boxGeometry args={[0.05, 0.28, 0.05]} />
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={brillo} clearcoat={0.8} roughness={0.25} transparent={op < 1} opacity={op} />
    </mesh>
    {[-0.12, -0.18].map((y, i) => (
      <mesh key={i} position={[0.05, y, 0]}>
        <boxGeometry args={[0.07 - i * 0.02, 0.035, 0.05]} />
        <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={brillo} transparent={op < 1} opacity={op} />
      </mesh>
    ))}
    <mesh>
      <sphereGeometry args={[0.24, 12, 10]} />
      <meshBasicMaterial color={color} transparent opacity={0.1 * op} depthWrite={false} />
    </mesh>
  </group>
);

/** Receptor de insulina: proteina en "Y" que atraviesa la membrana. */
export const Receptor: React.FC<{ p: V3; activo?: number; apagado?: number }> = ({ p, activo = 0, apagado = 0 }) => {
  const col = mezcla(REC, GRIS, apagado);
  const mat = <meshPhysicalMaterial color={col} emissive={col} emissiveIntensity={0.12 + activo * 0.9} roughness={0.35} clearcoat={0.6} />;
  return (
    <group position={p}>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.08, 0.05, 0]}>
            <capsuleGeometry args={[0.06, 0.6, 6, 12]} />
            {mat}
          </mesh>
          <mesh position={[s * 0.17, 0.62, 0]} rotation={[0, 0, -s * 0.5]}>
            <capsuleGeometry args={[0.07, 0.36, 6, 12]} />
            {mat}
          </mesh>
          <mesh position={[s * 0.1, -0.48, 0]}>
            <sphereGeometry args={[0.11, 16, 12]} />
            {mat}
          </mesh>
        </group>
      ))}
    </group>
  );
};

/** Transportador GLUT4: 4 subunidades alrededor de un poro. */
export const Glut4: React.FC<{ p: V3; escala?: number; brillo?: number; op?: number }> = ({ p, escala = 1, brillo = 0.2, op = 1 }) => (
  <group position={p} scale={escala}>
    {[0, 1, 2, 3].map((i) => {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      return (
        <mesh key={i} position={[Math.cos(a) * 0.1, 0, Math.sin(a) * 0.1]}>
          <capsuleGeometry args={[0.065, 0.62, 6, 12]} />
          <meshPhysicalMaterial color={GLUT} emissive={GLUT} emissiveIntensity={brillo} roughness={0.35} clearcoat={0.6} transparent={op < 1} opacity={op} />
        </mesh>
      );
    })}
  </group>
);

/** Vesicula con GLUT4 dentro (antes de llegar a la membrana). */
export const Vesicula: React.FC<{ p: V3; fusion: number; brillo?: number }> = ({ p, fusion, brillo = 0.2 }) => (
  <group position={p}>
    {fusion < 1 ? (
      <mesh scale={1 - fusion * 0.7}>
        <sphereGeometry args={[0.36, 24, 18]} />
        <meshPhysicalMaterial color="#a8ecff" emissive="#43e0ff" emissiveIntensity={0.15} transparent opacity={0.28 * (1 - fusion)} roughness={0.1} clearcoat={1} depthWrite={false} />
      </mesh>
    ) : null}
    <Glut4 p={[0, 0, 0]} escala={mix(0.55, 1, fusion)} brillo={brillo} />
  </group>
);

// ---- Membrana de la celula muscular con todo el proceso ---------------------------

export const RECEPTORES: V3[] = [
  [-0.85, 0, 0.55],
  [0.95, 0, -0.55],
  [0.15, 0, -1.25],
  [-1.25, 0, -0.75],
];
export const GLUTS: V3[] = [
  [0.3, 0, 0.6],
  [-0.4, 0, -0.35],
  [1.1, 0, 0.45],
];

const GLU_FUERA: V3[] = Array.from({ length: 14 }).map((_, i) => [
  (rnd(`gx${i}`) - 0.5) * 2.8,
  0.7 + rnd(`gy${i}`) * 0.75,
  (rnd(`gz${i}`) - 0.5) * 2.2,
]);

/**
 * Corte de la membrana de una celula muscular: afuera (sangre) arriba, adentro abajo.
 * insulina 0..1 llegada; unida 0..1; sube 0..1 vesiculas GLUT4; entra 0..1 glucosa;
 * apagado 0..1 receptores "sordos" (la insulina rebota); nGlut cuantas vesiculas suben;
 * contrae 0..1 miofibrillas en contraccion; nGlu glucosas afuera.
 */
export const Membrana4: React.FC<{
  b: number;
  insulina?: number;
  unida?: number;
  sube?: number;
  entra?: number;
  apagado?: number;
  nGlut?: number;
  contrae?: number;
  nGlu?: number;
  rebote?: boolean;
}> = ({ b, insulina = 0, unida = 0, sube = 0, entra = 0, apagado = 0, nGlut = 3, contrae = 0, nGlu = 9, rebote = false }) => {
  const pulso = contrae * (0.5 + 0.5 * Math.sin(b * 40));
  return (
    <group>
      <Membrana ancho={6.4} prof={3.2} />
      {/* interior: miofibrillas */}
      <group position={[0, 0, 0]}>
        {[
          [-1.95, 0.4],
          [-2.25, -0.9],
          [-2.1, -2.1],
        ].map(([y, z], i) => (
          <group key={i} scale={[1 - pulso * 0.04, 1, 1]}>
            <CilindroX radio={0.3} largo={8} x={4} y={y} z={z} color="#c03a46" estriado={9} emisivo={0.1 + pulso * 0.6} />
          </group>
        ))}
      </group>
      {/* receptores */}
      {RECEPTORES.map((r, i) => (
        <Receptor key={i} p={r} activo={rebote ? 0 : unida} apagado={apagado} />
      ))}
      {/* insulina */}
      {insulina > 0
        ? RECEPTORES.map((r, i) => {
            const sitio: V3 = [r[0], 0.86, r[2]];
            const ini: V3 = [r[0] + (i % 2 ? 0.6 : -0.5), 1.6 + i * 0.1, r[2] + 0.3];
            let q = mix3(ini, sitio, Math.min(1, insulina * 1.1 - i * 0.03));
            if (rebote) {
              const f = (b * 2.4 + i * 0.27) % 1;
              const alto = Math.abs(Math.cos(f * Math.PI));
              q = [r[0] + Math.sin(f * 6 + i) * 0.25, 0.95 + alto * 0.6, r[2] + 0.2];
            }
            return <Llave key={i} p={q} escala={1.3} giro={rebote ? Math.sin(b * 9 + i) * 0.5 : Math.PI} brillo={0.5 + unida * 0.5} op={Math.min(1, insulina * 3)} />;
          })
        : null}
      {/* senal desde los receptores hacia las vesiculas */}
      {unida > 0.5 && sube < 1 && !rebote
        ? RECEPTORES.slice(0, 2).flatMap((r, i) =>
            [0, 1, 2, 3].map((k) => {
              const g = GLUTS[i];
              const f = (b * 3 + k / 4) % 1;
              return <Mol key={`s${i}${k}`} p={mix3([r[0], -0.6, r[2]], [g[0], -1.0, g[2]], f)} color={K.amarillo} r={0.05} op={(unida - 0.5) * 2} />;
            }),
          )
        : null}
      {/* vesiculas con GLUT4 */}
      {GLUTS.slice(0, nGlut).map((g, i) => {
        const s = Math.min(1, Math.max(0, sube * 1.25 - i * 0.12));
        const fus = Math.min(1, Math.max(0, (s - 0.8) / 0.2));
        const y = mix(-1.2 - i * 0.08, 0, Math.min(1, s / 0.85));
        return <Vesicula key={i} p={[g[0], y, g[2]]} fusion={fus} brillo={0.2 + fus * 0.5} />;
      })}
      {/* glucosa */}
      {GLU_FUERA.slice(0, nGlu).map((q0, i) => {
        const deriva: V3 = [q0[0] + Math.sin(b * 2 + i) * 0.1, q0[1] + Math.cos(b * 1.7 + i) * 0.08, q0[2]];
        const canal = GLUTS[i % Math.max(1, nGlut)];
        const f = Math.min(1, Math.max(0, entra * 1.6 - (i / nGlu) * 0.6));
        let q = deriva;
        if (f > 0 && i < 9) {
          const arriba: V3 = [canal[0], 0.5, canal[2]];
          const abajo: V3 = [canal[0] + Math.sin(i) * 0.5, -0.8 - (i % 3) * 0.15, canal[2] + Math.cos(i) * 0.3];
          q = f < 0.5 ? mix3(deriva, arriba, f * 2) : mix3(arriba, abajo, (f - 0.5) * 2);
        }
        return <Glucosa key={i} p={q} escala={1.1} brillo={0.5} />;
      })}
    </group>
  );
};
