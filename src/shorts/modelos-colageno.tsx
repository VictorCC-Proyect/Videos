// Modelos 3D del short de colageno: triple helice, tendon, fibrilla, fibroblasto,
// vitamina C, naranja, shaker y reloj.
import React from "react";
import * as THREE from "three";
import { mix, mix3, V3 } from "../fisio/motor";
import { hexPack, rnd, Tubo } from "../fisio/modelos/comun";
import { Enlace, Esfera, Mol } from "../fisio/modelos/energia";
import { K } from "./marco";

export const TENDON = "#f1e2c2";
export const GLY = K.lima;
export const PRO = K.cian;
export const HYP = K.morado;
export const VITC = K.amarillo;
/** Color del "esqueleto" de cada una de las 3 cadenas alfa. */
export const CADENAS = ["#ff5c8a", "#5aa9ff", "#f4f7f2"];

// ---- Triple helice de colageno ----------------------------------------------------

export type Cuenta = { p: V3; tipo: 0 | 1 | 2; cadena: number; i: number };

/**
 * Posiciones de las cuentas (aminoacidos) de las 3 cadenas. La helice va a lo largo de Y.
 * enrolla: 0 = cadenas sueltas y paralelas, 1 = superhelice. floja: 0..1 desorden.
 * Repeticion Gly-X-Y (tipo 0 = glicina, 1 = prolina, 2 = prolina/hidroxiprolina).
 */
export const cuentasHelice = ({
  largo = 4,
  n = 24,
  R = 0.2,
  paso = 1.6,
  enrolla = 1,
  floja = 0,
  b = 0,
}: {
  largo?: number;
  n?: number;
  R?: number;
  paso?: number;
  enrolla?: number;
  floja?: number;
  b?: number;
}): Cuenta[][] =>
  [0, 1, 2].map((k) =>
    Array.from({ length: n }).map((_, i) => {
      const y = -largo / 2 + ((i + k / 3) / (n - 1)) * largo;
      const a = (y / paso) * Math.PI * 2 + (k * Math.PI * 2) / 3;
      const r = R * (1 + floja * 0.9);
      const enr: V3 = [Math.cos(a) * r, y, Math.sin(a) * r];
      const suelta: V3 = [(k - 1) * 0.55 + Math.cos(i * 1.9) * 0.06, y, Math.sin(i * 1.9) * 0.06];
      const p = mix3(suelta, enr, enrolla);
      const w = floja * 0.22;
      const q: V3 = [
        p[0] + Math.sin(b * 5 + i * 0.7 + k * 2) * w,
        p[1],
        p[2] + Math.cos(b * 4 + i * 0.9 + k) * w,
      ];
      return { p: q, tipo: (i % 3) as 0 | 1 | 2, cadena: k, i };
    }),
  );

export const TripleHelice: React.FC<{
  p?: V3;
  rot?: V3;
  escala?: number;
  largo?: number;
  n?: number;
  enrolla?: number;
  floja?: number;
  hidrox?: number;
  crece?: number;
  b?: number;
  op?: number;
  puentes?: number;
  brillo?: number;
}> = ({ p = [0, 0, 0], rot = [0, 0, 0], escala = 1, largo = 4, n = 24, enrolla = 1, floja = 0, hidrox = 1, crece = 1, b = 0, op = 1, puentes = 0, brillo = 0.3 }) => {
  const cs = cuentasHelice({ largo, n, enrolla, floja, b });
  const lim = Math.max(2, Math.round(n * crece));
  return (
    <group position={p} rotation={rot} scale={escala}>
      {cs.map((cad, k) => {
        const vis = cad.slice(0, lim);
        return (
          <group key={k}>
            <Tubo puntos={vis.map((c) => c.p)} radio={0.035} color={CADENAS[k]} emisivo={0.25} opacidad={op} segmentos={vis.length * 4} />
            {vis.map((c) => {
              const hx = c.tipo === 2 && rnd(`hx${k}${c.i}`) < hidrox;
              const col = c.tipo === 0 ? GLY : c.tipo === 1 ? PRO : hx ? HYP : PRO;
              return (
                <group key={c.i}>
                  <Esfera p={c.p} r={c.tipo === 0 ? 0.07 : 0.095} color={col} brillo={brillo} op={op} />
                  {hx && hidrox < 1 ? <Mol p={c.p} color={VITC} r={0.06} brillo={1.6} op={op} /> : null}
                </group>
              );
            })}
          </group>
        );
      })}
      {/* puentes (enlaces de hidrogeno) entre cadenas: la helice se estabiliza */}
      {puentes > 0
        ? cs[0].slice(0, lim).map((c, i) =>
            i % 3 === 0 && i + 1 < lim ? (
              <group key={`pt${i}`}>
                <Enlace a={c.p} b={cs[1][i].p} r={0.018} color={VITC} brillo={1.2} op={puentes * op} />
                <Enlace a={cs[1][i].p} b={cs[2][i].p} r={0.018} color={VITC} brillo={1.2} op={puentes * op} />
              </group>
            ) : null,
          )
        : null}
    </group>
  );
};

/** Aminoacido suelto (cuenta con halo). tipo 0 glicina, 1 prolina, 2 hidroxiprolina. */
export const Amino: React.FC<{ p: V3; tipo: number; r?: number; op?: number }> = ({ p, tipo, r = 0.1, op = 1 }) => (
  <Mol p={p} color={tipo === 0 ? GLY : tipo === 1 ? PRO : HYP} r={r} op={op} brillo={0.7} />
);

// ---- Tendon: haz de fascículos (vertical) ------------------------------------------

/** Tendon vertical en corte: vaina translucida + fasciculos con fibras. nuevas = fibras nuevas brillantes (0..1). */
export const HazTendon: React.FC<{ alto?: number; R?: number; brillo?: number; nuevas?: number; b?: number }> = ({
  alto = 6,
  R = 1.2,
  brillo = 0,
  nuevas = 0,
  b = 0,
}) => {
  const fasc = hexPack(R - 0.32, 0.5);
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[R, R * 1.05, alto, 48, 1, true]} />
        <meshPhysicalMaterial color={TENDON} transparent opacity={0.16} roughness={0.4} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {fasc.map(([x, z], i) => (
        <group key={i} position={[x, -rnd(`fl${i}`) * 0.25, z]}>
          <mesh>
            <cylinderGeometry args={[0.22, 0.22, alto - 0.3, 24]} />
            <meshPhysicalMaterial color={TENDON} emissive={TENDON} emissiveIntensity={0.05 + brillo * 0.3} roughness={0.5} clearcoat={0.3} />
          </mesh>
          {/* fibras nuevas (sintesis de colageno) a lo largo del fasciculo */}
          {nuevas > 0
            ? [0, 1, 2, 3].map((k) => {
                if (rnd(`nf${i}_${k}`) > nuevas) return null;
                const a = k * 1.57 + i;
                return (
                  <mesh key={`n${k}`} position={[Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2]}>
                    <cylinderGeometry args={[0.035, 0.035, alto - 0.3, 10]} />
                    <meshStandardMaterial color={K.lima} emissive={K.lima} emissiveIntensity={0.8 + 0.4 * Math.sin(b * 10 + i + k)} />
                  </mesh>
                );
              })
            : null}
          {/* fibras en la cara de corte */}
          {hexPack(0.17, 0.075).map(([u, v], j) => {
            const nueva = rnd(`nv${i}_${j}`) < nuevas * 0.6;
            return (
              <mesh key={j} position={[u, (alto - 0.3) / 2 + 0.01, v]}>
                <cylinderGeometry args={[0.03, 0.03, 0.04, 10]} />
                <meshStandardMaterial
                  color={nueva ? K.lima : "#fff8e6"}
                  emissive={nueva ? K.lima : "#ffffff"}
                  emissiveIntensity={nueva ? 1 + 0.4 * Math.sin(b * 12 + j) : 0.1}
                />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
};

// ---- Fibrilla: moleculas escalonadas (bandas) -------------------------------------

/** Fibrilla vertical hecha de moleculas de colageno escalonadas (patron de bandas). */
export const Fibrilla: React.FC<{ alto?: number; R?: number; brillo?: number; destaca?: number }> = ({ alto = 6, R = 0.55, brillo = 0, destaca = -1 }) => {
  const cols = hexPack(R, 0.16);
  const L = 1.0;
  const gap = 0.16;
  return (
    <group>
      {cols.map(([x, z], i) => {
        const off = ((i * 3) % 5) * ((L + gap) / 5);
        const n = Math.ceil(alto / (L + gap)) + 1;
        return Array.from({ length: n }).map((_, j) => {
          const y = -alto / 2 + off + j * (L + gap);
          const y0 = Math.max(-alto / 2, y);
          const y1 = Math.min(alto / 2, y + L);
          if (y1 - y0 < 0.1) return null;
          const es = i === destaca && j === 2;
          return (
            <mesh key={`${i}_${j}`} position={[x, (y0 + y1) / 2, z]}>
              <cylinderGeometry args={[0.055, 0.055, y1 - y0, 10]} />
              <meshStandardMaterial
                color={es ? K.rosa : TENDON}
                emissive={es ? K.rosa : TENDON}
                emissiveIntensity={es ? 0.9 : 0.06 + brillo * 0.3}
                roughness={0.5}
              />
            </mesh>
          );
        });
      })}
    </group>
  );
};

/** Fibras horizontales de fondo (matriz del tendon). */
export const FondoFibras: React.FC<{ z?: number; n?: number; ancho?: number; brillo?: number; nuevas?: number; b?: number }> = ({
  z = -1.5,
  n = 9,
  ancho = 14,
  brillo = 0,
  nuevas = 0,
  b = 0,
}) => (
  <group>
    {Array.from({ length: n }).map((_, i) => {
      const y = -3.2 + (i / (n - 1)) * 6.4;
      const pts: V3[] = Array.from({ length: 12 }).map((__, j) => {
        const x = -ancho / 2 + (j / 11) * ancho;
        return [x, y + Math.sin(x * 1.3 + i) * 0.08, z - rnd(`fz${i}`) * 0.8];
      });
      const nueva = i / n < nuevas;
      return (
        <Tubo
          key={i}
          puntos={pts}
          radio={0.13}
          color={nueva ? K.lima : TENDON}
          emisivo={nueva ? 0.6 + 0.3 * Math.sin(b * 10 + i) : 0.05 + brillo}
          opacidad={0.85}
          segmentos={48}
        />
      );
    })}
  </group>
);

// ---- Fibroblasto ------------------------------------------------------------------------

export const FIBRO = "#7d96ff";

/** Celula alargada (fusiforme) con prolongaciones y nucleo; horizontal (eje X). */
export const Fibroblasto: React.FC<{ p?: V3; escala?: number; brillo?: number; op?: number }> = ({ p = [0, 0, 0], escala = 1, brillo = 0, op = 0.42 }) => (
  <group position={p} scale={escala}>
    <mesh scale={[2.6, 0.75, 0.85]}>
      <sphereGeometry args={[1, 48, 32]} />
      <meshPhysicalMaterial color={FIBRO} emissive={FIBRO} emissiveIntensity={0.12 + brillo * 0.4} transparent opacity={op} roughness={0.35} clearcoat={0.5} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
    {/* prolongaciones */}
    {(
      [
        [[2.4, 0.1, 0], [3.4, 0.35, 0.1], [4.4, 0.3, 0]],
        [[-2.4, -0.1, 0], [-3.4, -0.4, 0.1], [-4.4, -0.35, 0]],
        [[1.2, 0.6, 0.2], [1.6, 1.2, 0.3], [2.1, 1.6, 0.2]],
        [[-1.0, -0.6, 0.2], [-1.5, -1.2, 0.3], [-2.0, -1.5, 0.2]],
      ] as V3[][]
    ).map((pts, i) => (
      <Tubo key={i} puntos={pts} radio={0.12} color={FIBRO} emisivo={0.15} opacidad={0.5} segmentos={16} />
    ))}
    {/* nucleo */}
    <mesh position={[-0.9, 0, -0.1]} scale={[0.75, 0.42, 0.45]}>
      <sphereGeometry args={[1, 32, 24]} />
      <meshPhysicalMaterial color="#3d4fd6" emissive="#3d4fd6" emissiveIntensity={0.35} roughness={0.4} clearcoat={0.4} />
    </mesh>
    {/* reticulo endoplasmico (donde se arman las cadenas) */}
    {[0, 1, 2].map((i) => (
      <Tubo
        key={`re${i}`}
        puntos={Array.from({ length: 8 }).map((_, j): V3 => [0.1 + j * 0.25, -0.4 + i * 0.14 + Math.sin(j * 1.4 + i) * 0.06, -0.3])}
        radio={0.035}
        color="#9fb0ff"
        emisivo={0.3}
        opacidad={0.7}
        segmentos={24}
      />
    ))}
  </group>
);

// ---- Vitamina C y naranja -------------------------------------------------------------

/** Vitamina C (acido ascorbico) estilizada: anillo de 5 con 2 oxigenos. */
export const VitaminaC: React.FC<{ p: V3; escala?: number; op?: number; giro?: number }> = ({ p, escala = 1, op = 1, giro = 0 }) => {
  const anillo: V3[] = Array.from({ length: 5 }).map((_, i) => {
    const a = (i / 5) * Math.PI * 2;
    return [Math.cos(a) * 0.16, Math.sin(a) * 0.16, 0];
  });
  return (
    <group position={p} scale={escala} rotation={[giro * 0.7, giro, 0]}>
      {anillo.map((q, i) => (
        <Esfera key={i} p={q} r={0.06} color={VITC} brillo={0.9} op={op} />
      ))}
      {anillo.map((q, i) => (
        <Enlace key={`e${i}`} a={q} b={anillo[(i + 1) % 5]} r={0.02} color="#fff3b0" op={op} />
      ))}
      <Esfera p={[0.3, 0.1, 0]} r={0.05} color={K.naranja} brillo={0.8} op={op} />
      <Enlace a={anillo[0]} b={[0.3, 0.1, 0]} r={0.02} color="#fff3b0" op={op} />
      <mesh>
        <sphereGeometry args={[0.32, 14, 10]} />
        <meshBasicMaterial color={VITC} transparent opacity={0.14 * op} depthWrite={false} />
      </mesh>
    </group>
  );
};

/** Naranja entera con hoja. */
export const Naranja: React.FC<{ p: V3; escala?: number; giro?: number }> = ({ p, escala = 1, giro = 0 }) => (
  <group position={p} scale={escala} rotation={[0.2, giro, 0]}>
    <mesh>
      <icosahedronGeometry args={[0.5, 5]} />
      <meshPhysicalMaterial color="#ff8c1a" emissive="#ff7a00" emissiveIntensity={0.12} roughness={0.55} clearcoat={0.4} />
    </mesh>
    <mesh position={[0, 0.5, 0]}>
      <cylinderGeometry args={[0.02, 0.03, 0.06, 8]} />
      <meshStandardMaterial color="#5a7a2a" />
    </mesh>
    <mesh position={[0.12, 0.53, 0]} rotation={[0, 0, -0.5]} scale={[0.18, 0.04, 0.09]}>
      <sphereGeometry args={[1, 14, 10]} />
      <meshStandardMaterial color="#3fae4a" />
    </mesh>
  </group>
);

// ---- Shaker y reloj -------------------------------------------------------------------

/** Shaker con colageno en polvo disuelto. Mide ~1.4 de alto (base en y = 0). */
export const Shaker: React.FC<{ p?: V3; rot?: V3; escala?: number; nivel?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], escala = 1, nivel = 0.7 }) => (
  <group position={p} rotation={rot} scale={escala}>
    <mesh position={[0, 0.6, 0]}>
      <cylinderGeometry args={[0.42, 0.36, 1.2, 40, 1, true]} />
      <meshPhysicalMaterial color="#e8f6ff" transparent opacity={0.25} roughness={0.05} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
    <mesh position={[0, (1.2 * nivel) / 2, 0]}>
      <cylinderGeometry args={[0.36 + 0.06 * nivel, 0.35, 1.2 * nivel, 40]} />
      <meshPhysicalMaterial color="#ffd9c7" emissive="#ffb59a" emissiveIntensity={0.15} transparent opacity={0.85} roughness={0.3} />
    </mesh>
    {/* tapa */}
    <mesh position={[0, 1.28, 0]}>
      <cylinderGeometry args={[0.44, 0.44, 0.18, 40]} />
      <meshStandardMaterial color="#1d2b33" roughness={0.4} />
    </mesh>
    <mesh position={[0, 1.42, 0]}>
      <cylinderGeometry args={[0.1, 0.14, 0.12, 20]} />
      <meshStandardMaterial color={K.lima} emissive={K.lima} emissiveIntensity={0.3} />
    </mesh>
    {/* etiqueta */}
    <mesh position={[0, 0.55, 0]}>
      <cylinderGeometry args={[0.4, 0.39, 0.3, 40, 1, true]} />
      <meshStandardMaterial color={K.rosa} emissive={K.rosa} emissiveIntensity={0.2} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

/** Reloj de pared; t = 0..1 vueltas del minutero. */
export const Reloj: React.FC<{ p: V3; escala?: number; t?: number }> = ({ p, escala = 1, t = 0 }) => (
  <group position={p} scale={escala}>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.5, 0.5, 0.08, 48]} />
      <meshStandardMaterial color="#f4f7f2" roughness={0.4} />
    </mesh>
    <mesh>
      <torusGeometry args={[0.5, 0.05, 12, 48]} />
      <meshStandardMaterial color={K.cian} emissive={K.cian} emissiveIntensity={0.4} />
    </mesh>
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.sin(a) * 0.4, Math.cos(a) * 0.4, 0.05]} rotation={[0, 0, -a]}>
          <boxGeometry args={[0.025, i % 3 ? 0.05 : 0.1, 0.01]} />
          <meshStandardMaterial color="#1d2b33" />
        </mesh>
      );
    })}
    {/* minutero y horario */}
    <group position={[0, 0, 0.06]} rotation={[0, 0, -t * Math.PI * 2]}>
      <mesh position={[0, 0.17, 0]}>
        <boxGeometry args={[0.03, 0.34, 0.01]} />
        <meshStandardMaterial color="#1d2b33" />
      </mesh>
    </group>
    <group position={[0, 0, 0.07]} rotation={[0, 0, -(t / 12) * Math.PI * 2 - 1.2]}>
      <mesh position={[0, 0.11, 0]}>
        <boxGeometry args={[0.04, 0.22, 0.01]} />
        <meshStandardMaterial color={K.rosa} />
      </mesh>
    </group>
  </group>
);

/** Flecha punteada (cuentas) a lo largo de una curva cuadratica; prog 0..1 cuanto se ha dibujado. */
export const FlechaPuntos: React.FC<{ desde: V3; hasta: V3; ctrl: V3; prog: number; color?: string; n?: number; r?: number }> = ({
  desde,
  hasta,
  ctrl,
  prog,
  color = K.cian,
  n = 14,
  r = 0.025,
}) => (
  <group>
    {Array.from({ length: n }).map((_, i) => {
      const t = i / (n - 1);
      if (t > prog) return null;
      const a = mix3(desde, ctrl, t);
      const z = mix3(ctrl, hasta, t);
      return <Esfera key={i} p={mix3(a, z, t)} r={i === n - 1 ? r * 1.8 : r} color={color} brillo={1} />;
    })}
  </group>
);

/** Cruz roja (tachado) en 3D, mirando a +Z. */
export const Tache: React.FC<{ p: V3; escala?: number; op?: number }> = ({ p, escala = 1, op = 1 }) => (
  <group position={p} scale={escala * mix(0.2, 1, op)}>
    {[0.785, -0.785].map((a) => (
      <mesh key={a} rotation={[0, 0, a]}>
        <boxGeometry args={[0.32, 0.06, 0.02]} />
        <meshBasicMaterial color={K.rojo} transparent opacity={op} />
      </mesh>
    ))}
  </group>
);
