// Modelos 3D del short de calambres: pierna con gemelo que se acorta, huso muscular,
// organo tendinoso de Golgi, circuito medula-musculo con trenes de impulsos, atleta
// sentado (brazos por cinematica inversa) e iconos (platano, velocimetro, gota, sal, sol, luna).
import React, { useMemo } from "react";
import * as THREE from "three";
import { mix, V3 } from "../fisio/motor";
import { rnd, Tubo } from "../fisio/modelos/comun";
import { Humano } from "../fisio/modelos/cuerpo";
import { F2_COL, F2Medula, F2Unidad, f2Polilinea } from "./modelos-fibras";
import { K } from "./marco";

export const HUSO_C = "#5be37d";
export const GOLGI_C = "#ff5f6d";
export const TENDON_C = "#efe6d8";
export const MUSC_C = "#b3222f";

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const esc = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const largoV = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const rotX = (q: V3, f: number): V3 => [q[0], q[1] * Math.cos(f) - q[2] * Math.sin(f), q[1] * Math.sin(f) + q[2] * Math.cos(f)];
const quatY = (d: V3) => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...d).normalize());

// ---- Impulsos ---------------------------------------------------------------------

/** Momentos (en beats) en que se emite un impulso, con una frecuencia variable (impulsos por beat). */
export const emisiones = (rate: (b: number) => number, a = -0.2, z = 1.1, paso = 0.001) => {
  const out: number[] = [];
  let acc = 0.999;
  for (let b = a; b < z; b += paso) {
    acc += Math.max(0, rate(b)) * paso;
    if (acc >= 1) {
      out.push(b);
      acc -= 1;
    }
  }
  return out;
};

/** 0..1: destello cuando un impulso termina su recorrido (llega al musculo). */
export const llegada = (b: number, em: number[], dur: number, decae = 0.06) =>
  Math.max(0, ...em.map((e) => {
    const d = b - e - dur;
    return d >= 0 && d < decae ? 1 - d / decae : 0;
  }));

/** Impulso con halo de color. */
export const PulsoC: React.FC<{ p: V3; r?: number; color?: string }> = ({ p, r = 0.05, color = F2_COL.nervio }) => (
  <group position={p}>
    <mesh>
      <sphereGeometry args={[r, 14, 10]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
    <mesh>
      <sphereGeometry args={[r * 2.6, 14, 10]} />
      <meshBasicMaterial color={color} transparent opacity={0.5} depthWrite={false} />
    </mesh>
  </group>
);

/** Tren de impulsos que recorre una polilinea; em = momentos de emision, dur = beats de viaje. */
export const Tren: React.FC<{ pts: V3[]; b: number; em: number[]; dur: number; r?: number; color?: string }> = ({ pts, b, em, dur, r = 0.05, color }) => (
  <>
    {em.map((e, i) => {
      const u = (b - e) / dur;
      if (u < 0 || u > 1) return null;
      return <PulsoC key={i} p={f2Polilinea(pts, u)} r={r} color={color} />;
    })}
  </>
);

// ---- Pierna (rodilla en el origen, tobillo en y = -1, frente hacia +z) ------------------

const LT = 0.5; // tendon de Aquiles

/** Geometria del gemelo segun el angulo del pie (punta 0..1 = flexion plantar). */
export const gemelo = (punta: number) => {
  const phi = punta * 0.85;
  const A: V3 = [0, -1, 0];
  const talon = add(A, rotX([0, -0.05, -0.15], phi));
  const O: V3 = [0, 0.1, -0.07];
  const tot = largoV(sub(talon, O));
  const lm = tot - LT;
  const dir = esc(sub(talon, O), 1 / tot);
  const J = add(O, esc(dir, lm));
  return { phi, A, talon, O, J, lm, dir, centro: add(add(O, esc(dir, lm * 0.5)), [0, 0, -0.05]) as V3 };
};

/**
 * Pierna de perfil: huesos, piel translucida y gemelo (2 cabezas) con tendon de Aquiles.
 * punta = pie en punta (el gemelo se acorta de verdad); contrae = abultamiento extra;
 * brilla = brillo rojo; vib = desplazamiento de vibracion.
 */
export const Pierna: React.FC<{ punta?: number; contrae?: number; brilla?: number; colorBrillo?: string; piel?: number; vib?: number }> = ({
  punta = 0,
  contrae = 0,
  brilla = 0,
  colorBrillo = K.rojo,
  piel = 0.28,
  vib = 0,
}) => {
  const g = gemelo(punta);
  const gordo = Math.sqrt(0.68 / g.lm) * (1 + 0.16 * contrae);
  const q = quatY(g.dir);
  const hueso = "#efe6d2";
  return (
    <group>
      {/* huesos */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.55, 16]} />
        <meshStandardMaterial color={hueso} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.04, -0.01]} scale={[1.2, 0.8, 1.1]}>
        <sphereGeometry args={[0.075, 20, 14]} />
        <meshStandardMaterial color={hueso} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.03, 0.085]} scale={[1, 1.2, 0.6]}>
        <sphereGeometry args={[0.04, 16, 12]} />
        <meshStandardMaterial color={hueso} roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.49, 0.02]}>
        <cylinderGeometry args={[0.042, 0.036, 0.95, 16]} />
        <meshStandardMaterial color={hueso} roughness={0.5} />
      </mesh>
      <mesh position={[0.065, -0.5, -0.02]}>
        <cylinderGeometry args={[0.016, 0.016, 0.9, 10]} />
        <meshStandardMaterial color={hueso} roughness={0.5} />
      </mesh>
      {/* gemelo: dos cabezas */}
      {[1, -1].map((s) => (
        <group key={s} position={add(g.centro, [s * 0.05, 0, vib * s])} quaternion={q}>
          <mesh scale={[0.065 * gordo, g.lm * 0.56, 0.085 * gordo]}>
            <sphereGeometry args={[1, 32, 24]} />
            <meshPhysicalMaterial color={MUSC_C} emissive={colorBrillo} emissiveIntensity={brilla * 0.9} roughness={0.42} clearcoat={0.5} />
          </mesh>
          {brilla > 0.02 ? (
            <mesh scale={[0.1 * gordo, g.lm * 0.62, 0.13 * gordo]}>
              <sphereGeometry args={[1, 24, 16]} />
              <meshBasicMaterial color={colorBrillo} transparent opacity={0.22 * brilla} depthWrite={false} />
            </mesh>
          ) : null}
        </group>
      ))}
      {/* tendon de Aquiles */}
      <Tubo puntos={[add(g.O, esc(g.dir, g.lm * 0.8)), g.J, add(g.talon, [0, 0.03, -0.01])]} radio={0.026} color={TENDON_C} emisivo={0.1} />
      {/* pie */}
      <group position={g.A} rotation={[g.phi, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.05, 16, 12]} />
          <meshStandardMaterial color={hueso} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.05, -0.09]} scale={[0.05, 0.05, 0.08]}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color={hueso} roughness={0.5} />
        </mesh>
        {[-0.045, -0.015, 0.015, 0.045].map((x, i) => (
          <group key={i}>
            <mesh position={[x, -0.07, 0.2]} rotation={[Math.PI / 2 + 0.12, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.26, 8]} />
              <meshStandardMaterial color={hueso} roughness={0.5} />
            </mesh>
            <mesh position={[x, -0.09, 0.36]}>
              <sphereGeometry args={[0.017, 10, 8]} />
              <meshStandardMaterial color={hueso} roughness={0.5} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, -0.06, 0.12]} scale={[0.1, 0.065, 0.3]}>
          <sphereGeometry args={[1, 32, 20]} />
          <meshPhysicalMaterial color="#e9a48e" transparent opacity={piel} roughness={0.5} depthWrite={false} />
        </mesh>
      </group>
      {/* piel de muslo y pierna */}
      <mesh position={[0, 0.3, -0.01]}>
        <capsuleGeometry args={[0.17, 0.42, 8, 24]} />
        <meshPhysicalMaterial color="#e9a48e" transparent opacity={piel} roughness={0.5} depthWrite={false} />
      </mesh>
      <mesh position={[0, -0.5, -0.06]} scale={[1, 1, 1.15]}>
        <capsuleGeometry args={[0.14, 0.8, 8, 24]} />
        <meshPhysicalMaterial color="#e9a48e" transparent opacity={piel} roughness={0.5} depthWrite={false} />
      </mesh>
    </group>
  );
};

// ---- Sensores del musculo ---------------------------------------------------------

/** Huso muscular: capsula fusiforme con fibras intrafusales y terminacion sensitiva en espiral. */
export const Huso: React.FC<{ p: V3; largo?: number; r?: number; act?: number; op?: number }> = ({ p, largo = 0.95, r = 0.11, act = 0, op = 1 }) => {
  const helice: V3[] = Array.from({ length: 61 }).map((_, i) => {
    const u = i / 60;
    const a = u * Math.PI * 2 * 6;
    return [Math.cos(a) * r * 0.62, (u - 0.5) * largo * 0.32, Math.sin(a) * r * 0.62];
  });
  if (op <= 0.01) return null;
  return (
    <group position={p}>
      <mesh scale={[r, largo / 2, r]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshPhysicalMaterial color="#d8f0ff" transparent opacity={0.3 * op} roughness={0.1} clearcoat={1} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const a = (i * Math.PI) / 2 + 0.4;
        return (
          <mesh key={i} position={[Math.cos(a) * r * 0.32, 0, Math.sin(a) * r * 0.32]}>
            <cylinderGeometry args={[r * 0.14, r * 0.14, largo * 0.92, 10]} />
            <meshStandardMaterial color="#ee8d9c" transparent opacity={op} />
          </mesh>
        );
      })}
      <Tubo puntos={helice} radio={r * 0.1} color={HUSO_C} emisivo={0.5 + act * 1.5} opacidad={op} segmentos={200} />
      {act > 0.02 ? (
        <mesh scale={[r * 2.2, largo * 0.42, r * 2.2]}>
          <sphereGeometry args={[1, 24, 16]} />
          <meshBasicMaterial color={HUSO_C} transparent opacity={0.2 * act * op} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Organo tendinoso de Golgi: capsula en la union musculo-tendon con terminaciones entre el colageno. */
export const Golgi: React.FC<{ p: V3; act?: number; op?: number }> = ({ p, act = 0, op = 1 }) => {
  if (op <= 0.01) return null;
  return (
    <group position={p}>
      <mesh scale={[0.12, 0.26, 0.09]}>
        <sphereGeometry args={[1, 28, 20]} />
        <meshPhysicalMaterial color="#ffe0e4" transparent opacity={0.3 * op} roughness={0.1} clearcoat={1} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {[-0.05, -0.017, 0.017, 0.05].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <cylinderGeometry args={[0.011, 0.011, 0.46, 8]} />
          <meshStandardMaterial color={TENDON_C} transparent opacity={op} />
        </mesh>
      ))}
      {[-0.06, -0.03, 0, 0.03, 0.06].map((x, i) => (
        <Tubo
          key={i}
          puntos={[
            [0, 0.2, 0.02],
            [x * 0.6, 0.1, 0.03],
            [x + 0.012, 0.0, 0.02 - (i % 2) * 0.02],
            [x - 0.012, -0.1, 0.03],
            [x, -0.17, 0.01],
          ]}
          radio={0.009}
          color={GOLGI_C}
          emisivo={0.5 + act * 1.5}
          opacidad={op}
          segmentos={24}
        />
      ))}
      {act > 0.02 ? (
        <mesh scale={[0.24, 0.36, 0.2]}>
          <sphereGeometry args={[1, 24, 16]} />
          <meshBasicMaterial color={GOLGI_C} transparent opacity={0.22 * act * op} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
};

// ---- Circuito medula -> motoneurona -> musculo + sensores -----------------------------

export const CIR = {
  S: [-0.2, 1.5, 0.05] as V3,
  ax: 0.95,
  tam: 0.17,
  n: 4,
  sep: 0.36,
  rf: 0.13,
  alto: 1.6,
  huso: [-0.2, -0.48, 0.34] as V3,
  golgi: [0.16, -1.45, 0.22] as V3,
  inter: [0.75, 1.62, 0.15] as V3,
};
const FONDO_FIBRAS = CIR.S[1] - CIR.ax - 0.25 - CIR.alto;

export const VIA_HUSO: V3[] = [
  [-0.1, -0.48, 0.4],
  [0.5, -0.22, 0.52],
  [0.9, 0.45, 0.45],
  [0.78, 1.2, 0.28],
  [0.25, 1.55, 0.16],
  [-0.03, 1.52, 0.1],
];
export const VIA_GOLGI: V3[] = [
  [0.26, -1.4, 0.28],
  [1.05, -1.05, 0.4],
  [1.42, -0.1, 0.36],
  [1.42, 0.95, 0.26],
  [1.1, 1.55, 0.18],
  [0.84, 1.62, 0.15],
];
export const VIA_INTER: V3[] = [
  [0.68, 1.62, 0.15],
  [0.3, 1.71, 0.14],
  [-0.03, 1.6, 0.1],
];

/** Recorrido del impulso motor: soma -> axon -> rama i -> placa motora. */
export const viaMotora = (i: number): V3[] => {
  const { S, ax, tam, n, sep, rf } = CIR;
  const x = (i - (n - 1) / 2) * sep;
  const rel: V3[] = [
    [0, 0, 0],
    [0, -tam * 0.9, 0],
    [0.04, -ax * 0.35, 0.04],
    [-0.03, -ax * 0.7, 0.03],
    [0, -ax, 0],
    [x * 0.55, -ax - 0.16, rf * 0.5],
    [x, -ax - 0.42, rf + 0.01],
  ];
  return rel.map((q) => add(S, q));
};

/** Tendon: haces de colageno bajo las fibras. */
const Tendon: React.FC = () => {
  const { S, n, sep } = CIR;
  return (
    <group>
      {Array.from({ length: n }).map((_, i) => {
        const x = S[0] + (i - (n - 1) / 2) * sep;
        return (
          <Tubo
            key={i}
            puntos={[
              [x, FONDO_FIBRAS + 0.02, 0],
              [mix(x, S[0], 0.4), FONDO_FIBRAS - 0.35, 0],
              [mix(x, S[0], 0.7), FONDO_FIBRAS - 0.75, 0],
            ]}
            radio={0.06}
            color={TENDON_C}
            emisivo={0.05}
          />
        );
      })}
      <mesh position={[S[0], FONDO_FIBRAS - 0.85, 0]}>
        <capsuleGeometry args={[0.16, 0.25, 8, 16]} />
        <meshStandardMaterial color={TENDON_C} roughness={0.5} />
      </mesh>
    </group>
  );
};

/**
 * Circuito completo. em* = momentos de emision de cada tren de impulsos.
 * act = activacion del musculo; sensores 0..1 = muestra husos/Golgi y sus vias.
 */
export const Circuito: React.FC<{
  b: number;
  act?: number;
  motorEm?: number[];
  husoEm?: number[];
  golgiEm?: number[];
  husoAct?: number;
  golgiAct?: number;
  interAct?: number;
  sensores?: number;
  dur?: number;
  colorAct?: string;
}> = ({ b, act = 0, motorEm = [], husoEm = [], golgiEm = [], husoAct = 0, golgiAct = 0, interAct = 0, sensores = 1, dur = 0.12, colorAct = K.rojo }) => {
  const { S, ax, tam, n, sep, rf, alto } = CIR;
  const xs = Array.from({ length: n }).map((_, i) => S[0] + (i - (n - 1) / 2) * sep);
  const op = sensores;
  return (
    <group>
      <F2Medula p={[0.2, 1.6, 0]} largo={4.6} r={0.45} brillo={act} />
      <F2Unidad p={S} color={F2_COL.I} tam={tam} n={n} sep={sep} ax={ax} act={act * 0.6} pulso={-1} rf={rf} alto={alto} seed="cal" />
      {act > 0.02
        ? xs.map((x) => (
            <mesh key={x} position={[x, FONDO_FIBRAS + alto / 2, 0]}>
              <cylinderGeometry args={[rf * 1.25, rf * 1.25, alto * 1.0, 24, 1, true]} />
              <meshBasicMaterial color={colorAct} transparent opacity={0.25 * act} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
          ))
        : null}
      <Tendon />
      {/* sensores y sus vias */}
      <Huso p={CIR.huso} act={husoAct} op={op} />
      <Golgi p={CIR.golgi} act={golgiAct} op={op} />
      {op > 0.01 ? (
        <>
          <Tubo puntos={VIA_HUSO} radio={0.022} color={HUSO_C} emisivo={0.3 + husoAct} opacidad={op} segmentos={60} />
          <Tubo puntos={VIA_GOLGI} radio={0.022} color={GOLGI_C} emisivo={0.3 + golgiAct} opacidad={op} segmentos={60} />
          <Tubo puntos={VIA_INTER} radio={0.018} color={GOLGI_C} emisivo={0.3 + interAct} opacidad={op} segmentos={30} />
          <mesh position={CIR.inter}>
            <sphereGeometry args={[0.075, 20, 14]} />
            <meshPhysicalMaterial color={GOLGI_C} emissive={GOLGI_C} emissiveIntensity={0.3 + interAct * 1.5} transparent opacity={op} clearcoat={0.6} />
          </mesh>
          <Tren pts={VIA_HUSO} b={b} em={husoEm} dur={dur * 1.2} r={0.035} color={HUSO_C} />
          <Tren pts={VIA_GOLGI} b={b} em={golgiEm} dur={dur * 1.4} r={0.035} color={GOLGI_C} />
          <Tren pts={VIA_INTER} b={b} em={golgiEm.map((e) => e + dur * 1.4)} dur={dur * 0.4} r={0.03} color={GOLGI_C} />
        </>
      ) : null}
      {Array.from({ length: n }).map((_, i) => (
        <Tren key={i} pts={viaMotora(i)} b={b} em={motorEm} dur={dur} r={0.04} />
      ))}
    </group>
  );
};

// ---- Atleta sentado (brazos por cinematica inversa) ----------------------------------

const brazoIK = (S: THREE.Vector3, T: THREE.Vector3, polo: THREE.Vector3, a = 0.3, c = 0.3) => {
  const d = T.clone().sub(S);
  const L = Math.min(d.length(), a + c - 0.002);
  const t = d.normalize();
  const cosA = (a * a + L * L - c * c) / (2 * a * L);
  const A = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const p = polo.clone().sub(t.clone().multiplyScalar(polo.dot(t))).normalize();
  const u = t.clone().multiplyScalar(Math.cos(A)).add(p.clone().multiplyScalar(Math.sin(A)));
  const E = S.clone().add(u.clone().multiplyScalar(a));
  const Tp = S.clone().add(t.clone().multiplyScalar(L));
  const f = Tp.sub(E).normalize();
  const ang = u.angleTo(f);
  let w = f.clone().sub(u.clone().multiplyScalar(f.dot(u)));
  if (w.length() < 1e-4) w = p.clone().negate();
  w.normalize();
  const Y = u.clone().negate();
  const X = new THREE.Vector3().crossVectors(Y, w);
  const m = new THREE.Matrix4().makeBasis(X, Y, w);
  const e = new THREE.Euler().setFromRotationMatrix(m, "XYZ");
  return { hombro: [e.x, e.y, e.z] as [number, number, number], codo: -ang };
};

export const CADERA_Y = 0.11;
/** Centro de la pantorrilla derecha del atleta sentado (pierna estirada hacia +z). */
export const GEMELO_SENTADO: V3 = [0.135, CADERA_Y - 0.02, 0.62];
/** Punta del pie derecho del atleta sentado. */
export const PIE_SENTADO: V3 = [0.15, CADERA_Y + 0.13, 0.87];

/**
 * Atleta sentado en el piso con las piernas estiradas hacia +z. inclina = torso hacia
 * delante (rad); manos = destino de [mano derecha, mano izquierda] en el mundo.
 */
export const AtletaSentado: React.FC<{
  inclina: number;
  manos: [V3, V3];
  musculo?: number;
  brilla?: number;
  colorBrillo?: string;
  gemelo?: number;
  colorGemelo?: string;
}> = ({ inclina, manos, musculo = 0.8, brilla = 0, colorBrillo, gemelo = 0, colorGemelo = K.rojo }) => {
  const eje = new THREE.Vector3(1, 0, 0);
  const local = (w: V3) => {
    const v = new THREE.Vector3(w[0], w[1] - CADERA_Y, w[2]).applyAxisAngle(eje, -inclina);
    v.y += 0.95;
    return v;
  };
  const d = brazoIK(new THREE.Vector3(0.23, 1.47, 0), local(manos[0]), new THREE.Vector3(1, -0.4, -0.5));
  const i = brazoIK(new THREE.Vector3(-0.23, 1.47, 0), local(manos[1]), new THREE.Vector3(-1, -0.4, -0.5));
  return (
    <group>
      <group position={[0, CADERA_Y, 0]} rotation={[inclina, 0, 0]}>
        <group position={[0, -0.95, 0]}>
          <Humano
            musculo={musculo}
            brilla={brilla}
            colorBrillo={colorBrillo}
            pose={{
              hombroD: d.hombro,
              codoD: d.codo,
              hombroI: i.hombro,
              codoI: i.codo,
              caderaD: [-Math.PI / 2 - inclina, 0, 0.06],
              caderaI: [-Math.PI / 2 - inclina, 0, -0.16],
              rodillaD: 0,
              rodillaI: 0,
            }}
          />
        </group>
      </group>
      {gemelo > 0.01 ? (
        <group position={GEMELO_SENTADO} rotation={[0, 0.06, 0]}>
          <mesh scale={[0.062, 0.058, 0.16]}>
            <sphereGeometry args={[1, 24, 16]} />
            <meshStandardMaterial color={colorGemelo} emissive={colorGemelo} emissiveIntensity={0.8 * gemelo} transparent opacity={0.9 * gemelo} />
          </mesh>
          <mesh scale={[0.11, 0.1, 0.24]}>
            <sphereGeometry args={[1, 24, 16]} />
            <meshBasicMaterial color={colorGemelo} transparent opacity={0.28 * gemelo} depthWrite={false} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};

// ---- Iconos ----------------------------------------------------------------------------

/** Platano curvo (a lo largo de X) con tallo y punta oscuros. */
export const Platano: React.FC<{ p: V3; escala?: number; rot?: V3; op?: number }> = ({ p, escala = 1, rot = [0, 0, 0], op = 1 }) => {
  const geo = useMemo(() => {
    const c = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.5, 0.18, 0), new THREE.Vector3(0, -0.28, 0), new THREE.Vector3(0.5, 0.18, 0));
    const N = 40;
    const R = 16;
    const g = new THREE.TubeGeometry(c, N, 0.12, R, false);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const k = 0.25 + 0.75 * Math.pow(Math.sin(Math.PI * u), 0.6);
      const ctr = c.getPointAt(u);
      for (let j = 0; j <= R; j++) {
        const idx = i * (R + 1) + j;
        const v = new THREE.Vector3().fromBufferAttribute(pos, idx).sub(ctr).multiplyScalar(k).add(ctr);
        pos.setXYZ(idx, v.x, v.y, v.z);
      }
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group position={p} scale={escala} rotation={rot}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial color="#ffd84a" emissive="#ffb800" emissiveIntensity={0.12} roughness={0.45} clearcoat={0.4} transparent={op < 1} opacity={op} />
      </mesh>
      <mesh position={[0.52, 0.22, 0]} rotation={[0, 0, -0.7]}>
        <cylinderGeometry args={[0.025, 0.035, 0.12, 10]} />
        <meshStandardMaterial color="#6b4a1e" transparent={op < 1} opacity={op} />
      </mesh>
      <mesh position={[-0.5, 0.18, 0]}>
        <sphereGeometry args={[0.03, 10, 8]} />
        <meshStandardMaterial color="#3a2a12" transparent={op < 1} opacity={op} />
      </mesh>
    </group>
  );
};

/** Velocimetro (media esfera de cara a +z). v 0..1 = posicion de la aguja. */
export const Velocimetro: React.FC<{ v: number }> = ({ v }) => {
  const cols = [K.rojo, K.naranja, K.amarillo, "#9be35b", K.lima];
  return (
    <group>
      <mesh>
        <circleGeometry args={[0.62, 48, 0, Math.PI]} />
        <meshStandardMaterial color="#0d2a2f" side={THREE.DoubleSide} />
      </mesh>
      {cols.map((c, i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 5]} position={[0, 0, 0.01]}>
          <torusGeometry args={[0.52, 0.06, 8, 16, Math.PI / 5 - 0.03]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.5} />
        </mesh>
      ))}
      <group rotation={[0, 0, mix(Math.PI / 2, -Math.PI / 2, Math.max(0, Math.min(1, v)))]} position={[0, 0, 0.04]}>
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.04, 0.44, 0.02]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.05]}>
        <sphereGeometry args={[0.06, 14, 10]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

/** Gota (de agua o de sudor). */
export const Gota: React.FC<{ p: V3; r?: number; op?: number; color?: string }> = ({ p, r = 0.1, op = 1, color = K.cian }) => (
  <group position={p}>
    <mesh>
      <sphereGeometry args={[r, 20, 14]} />
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.8 * op} roughness={0.05} clearcoat={1} />
    </mesh>
    <mesh position={[0, r * 0.95, 0]}>
      <coneGeometry args={[r * 0.9, r * 1.5, 20]} />
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.8 * op} roughness={0.05} clearcoat={1} />
    </mesh>
  </group>
);

/** Cristal de sal (NaCl): cubito blanco. */
export const Sal: React.FC<{ p: V3; r?: number; op?: number; giro?: number }> = ({ p, r = 0.08, op = 1, giro = 0 }) => (
  <mesh position={p} rotation={[0.6, 0.7 + giro, 0.2]}>
    <boxGeometry args={[r * 2, r * 2, r * 2]} />
    <meshPhysicalMaterial color="#f6f8ff" emissive="#dfe8ff" emissiveIntensity={0.35} roughness={0.25} clearcoat={0.8} transparent={op < 1} opacity={op} />
  </mesh>
);

/** Sol con rayos que giran. */
export const Sol: React.FC<{ giro?: number; brillo?: number }> = ({ giro = 0, brillo = 1 }) => (
  <group>
    <mesh>
      <sphereGeometry args={[0.45, 32, 24]} />
      <meshBasicMaterial color="#ffd23f" />
    </mesh>
    <mesh>
      <sphereGeometry args={[0.7, 24, 16]} />
      <meshBasicMaterial color="#ff9a2e" transparent opacity={0.3 * brillo} depthWrite={false} />
    </mesh>
    <group rotation={[0, 0, giro]}>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.82, Math.sin(a) * 0.82, 0]} rotation={[0, 0, a - Math.PI / 2]}>
            <boxGeometry args={[0.07, 0.26, 0.04]} />
            <meshBasicMaterial color="#ffc23f" />
          </mesh>
        );
      })}
    </group>
  </group>
);

/** Luna creciente con estrellas. */
export const Luna: React.FC = () => (
  <group>
    <mesh rotation={[0, 0, 0.9]}>
      <torusGeometry args={[0.32, 0.13, 16, 48, Math.PI * 1.15]} />
      <meshPhysicalMaterial color="#ffe9a8" emissive="#ffd23f" emissiveIntensity={0.4} roughness={0.4} clearcoat={0.5} />
    </mesh>
    {[
      [0.45, 0.4, 0],
      [0.62, 0.05, 0],
      [0.25, 0.62, 0],
    ].map((q, i) => (
      <mesh key={i} position={q as V3} rotation={[0, 0, i]}>
        <octahedronGeometry args={[0.06 - i * 0.01, 0]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    ))}
  </group>
);

/** Escalera de barras crecientes (carga progresiva); crece 0..1. */
export const Escalera: React.FC<{ crece?: number }> = ({ crece = 1 }) => (
  <group>
    {[0.25, 0.5, 0.75, 1].map((h, i) => {
      const hh = h * Math.min(1, Math.max(0.02, crece * 4 - i));
      return (
        <mesh key={i} position={[(i - 1.5) * 0.3, hh / 2, 0]}>
          <boxGeometry args={[0.24, hh, 0.24]} />
          <meshStandardMaterial color={K.naranja} emissive={K.naranja} emissiveIntensity={0.25 + i * 0.1} />
        </mesh>
      );
    })}
  </group>
);

/** Puntos aleatorios (semilla fija) para gotas de sudor alrededor del tronco. */
export const GOTAS_SUDOR: V3[] = Array.from({ length: 16 }).map((_, i) => [
  (rnd(`sx${i}`) - 0.5) * 0.36,
  0.95 + rnd(`sy${i}`) * 0.65,
  (rnd(`sz${i}`) - 0.5) * 0.3,
]);
