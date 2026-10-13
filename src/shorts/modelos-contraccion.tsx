// Modelos 3D de los shorts de contraccion muscular (partes 1 y 2).
// Cada parte agrega aqui sus exports nuevos sin modificar los existentes.
import React from "react";
import * as THREE from "three";
import { entre, mix, mix3, V3 } from "../fisio/motor";
import { difusion, Particulas, rnd, Tubo } from "../fisio/modelos/comun";
import { CilindroX } from "../fisio/modelos/musculo";
import { K } from "./marco";

// ---- Parte 2 ---------------------------------------------------------------------

/** Candado 3D (metafora de la tropomiosina tapando los sitios). abierto 0..1. */
export const Candado: React.FC<{ p: V3; abierto?: number; escala?: number; color?: string; brillo?: number; giro?: number }> = ({
  p,
  abierto = 0,
  escala = 1,
  color = "#3ec46d",
  brillo = 0.25,
  giro = 0,
}) => (
  <group position={p} scale={escala} rotation={[0, giro, 0]}>
    {/* cuerpo */}
    <mesh>
      <boxGeometry args={[0.5, 0.4, 0.18]} />
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={brillo} metalness={0.4} roughness={0.3} clearcoat={0.8} />
    </mesh>
    {/* cerradura */}
    <mesh position={[0, 0.03, 0.092]}>
      <circleGeometry args={[0.045, 20]} />
      <meshBasicMaterial color="#061317" />
    </mesh>
    <mesh position={[0, -0.04, 0.092]}>
      <planeGeometry args={[0.03, 0.1]} />
      <meshBasicMaterial color="#061317" />
    </mesh>
    {/* arco: sube y gira sobre la pata izquierda */}
    <group position={[-0.15, 0.12 * abierto, 0]} rotation={[0, abierto * 2.2, 0]}>
      <group position={[0.15, 0, 0]}>
        <mesh position={[0, 0.32, 0]}>
          <torusGeometry args={[0.15, 0.035, 12, 32, Math.PI]} />
          <meshPhysicalMaterial color="#d9e2f2" metalness={0.8} roughness={0.25} />
        </mesh>
        {[-0.15, 0.15].map((x) => (
          <mesh key={x} position={[x, 0.24, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.16, 12]} />
            <meshPhysicalMaterial color="#d9e2f2" metalness={0.8} roughness={0.25} />
          </mesh>
        ))}
      </group>
    </group>
  </group>
);

/** Destello esferico (ej. al romperse el ATP). t 0..1: crece y se desvanece. */
export const Chispa: React.FC<{ p: V3; t: number; color?: string; r?: number }> = ({ p, t, color = K.amarillo, r = 0.35 }) =>
  t > 0 && t < 1 ? (
    <group position={p}>
      <mesh scale={0.3 + t * 1.2}>
        <sphereGeometry args={[r, 20, 14]} />
        <meshBasicMaterial color={color} transparent opacity={0.7 * (1 - t)} depthWrite={false} />
      </mesh>
      <mesh scale={0.2 + t * 0.5}>
        <sphereGeometry args={[r * 0.6, 16, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={1 - t} depthWrite={false} />
      </mesh>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} rotation={[0, 0, (i / 8) * Math.PI * 2]} position={[0, 0, 0]}>
          <boxGeometry args={[r * (0.6 + t * 3), 0.015, 0.015]} />
          <meshBasicMaterial color={color} transparent opacity={1 - t} depthWrite={false} />
        </mesh>
      ))}
    </group>
  ) : null;

/** Ion generico con halo (sodio, potasio, etc.). */
export const IonColor: React.FC<{ p: V3; color: string; r?: number; op?: number; brillo?: number }> = ({ p, color, r = 0.1, op = 1, brillo = 1 }) => (
  <group position={p}>
    <mesh>
      <sphereGeometry args={[r, 20, 14]} />
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.5 + brillo} roughness={0.2} clearcoat={1} transparent={op < 1} opacity={op} />
    </mesh>
    <mesh>
      <sphereGeometry args={[r * 2.1, 14, 10]} />
      <meshBasicMaterial color={color} transparent opacity={0.2 * op} depthWrite={false} />
    </mesh>
  </group>
);

// ---- Parte 1 ---------------------------------------------------------------------
// Via motora: medula y nervio en el cuerpo, unidad motora, placa motora y triada.

/** Colores de la parte 1. */
export const NERVIO_C = "#ffd166";
export const ACH_C = "#7cff8a";
export const NA_C = "#ffe14d";
export const CA_C = "#2fe6ff";
export const TUBOT_C = "#9effa9";
export const RETICULO_C = "#4f8dff";
export const DHPR_C = "#ff8a3d";
export const RYR_C = "#d77bff";
export const RECEPTOR_ACH = "#ff9de2";

const curvaDe = (pts: V3[]) => new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q)));
const aV3 = (v: THREE.Vector3): V3 => [v.x, v.y, v.z];

/** Rotacion (Euler) que lleva el eje +Y a la direccion a -> b. */
export const rotHacia = (a: V3, b: V3): V3 => {
  const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
  const e = new THREE.Euler().setFromQuaternion(q);
  return [e.x, e.y, e.z];
};

/** Vainas de mielina (segmentos blancos con nodos de Ranvier) a lo largo de una curva. */
export const Mielina: React.FC<{ puntos: V3[]; n?: number; radio?: number; desde?: number; hasta?: number; op?: number }> = ({
  puntos,
  n = 7,
  radio = 0.08,
  desde = 0.05,
  hasta = 0.85,
  op = 0.55,
}) => {
  const curva = curvaDe(puntos);
  const largo = curva.getLength();
  const paso = (hasta - desde) / n;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const t0 = desde + i * paso + paso * 0.06;
        const t1 = desde + (i + 1) * paso - paso * 0.06;
        const a = aV3(curva.getPointAt(t0));
        const z = aV3(curva.getPointAt(t1));
        const c: V3 = [(a[0] + z[0]) / 2, (a[1] + z[1]) / 2, (a[2] + z[2]) / 2];
        const l = largo * (t1 - t0);
        return (
          <mesh key={i} position={c} rotation={rotHacia(a, z)}>
            <capsuleGeometry args={[radio, Math.max(0.01, l - radio * 2), 6, 16]} />
            <meshPhysicalMaterial color="#fff6e0" transparent opacity={op} roughness={0.3} clearcoat={0.8} depthWrite={false} />
          </mesh>
        );
      })}
    </>
  );
};

// ---- Medula espinal y nervio femoral dentro del atleta (coordenadas de Humano) ----

export const MEDULA_C: V3[] = [
  [0, 1.6, -0.05],
  [0, 1.48, -0.075],
  [0, 1.32, -0.08],
  [0, 1.18, -0.075],
];
export const NERVIO_PIERNA: V3[] = [
  [0, 1.18, -0.075],
  [0.05, 1.08, -0.05],
  [0.09, 0.96, 0.01],
  [0.12, 0.84, 0.06],
  [0.13, 0.7, 0.075],
];
const CURVA_MED = curvaDe([...MEDULA_C, ...NERVIO_PIERNA.slice(1)]);
/** Punto de la via cerebro -> medula -> muslo (t 0..1). */
export const puntoVia = (t: number): V3 => aV3(CURVA_MED.getPointAt(Math.min(1, Math.max(0, t))));

/** Medula (encendida) y nervio que baja al muslo derecho; pulso 0..1 = senal. */
export const ViaMotora: React.FC<{ medula: number; nervio: number; pulso?: number }> = ({ medula, nervio, pulso = -1 }) => (
  <group>
    <Tubo puntos={MEDULA_C} radio={0.022} color={NERVIO_C} emisivo={0.3 + medula * 1.4} segmentos={30} />
    <Tubo puntos={NERVIO_PIERNA} radio={0.008} color={NERVIO_C} emisivo={0.2 + nervio * 1.4} opacidad={0.4 + nervio * 0.6} segmentos={30} />
    {pulso >= 0 && pulso <= 1 ? (
      <group position={puntoVia(pulso)}>
        <mesh>
          <sphereGeometry args={[0.022, 16, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.055, 16, 12]} />
          <meshBasicMaterial color={NERVIO_C} transparent opacity={0.45} depthWrite={false} />
        </mesh>
      </group>
    ) : null}
  </group>
);

// ---- Unidad motora: 1 motoneurona + sus fibras -------------------------------------

export const SOMA: V3 = [-0.9, 1.4, 0];
export const AXON_UM: V3[] = [SOMA, [-0.72, 1.0, 0.1], [-0.38, 0.55, 0.15], [-0.08, 0.15, 0.1], [0, -0.2, 0.05]];
const CURVA_UM = curvaDe(AXON_UM);
export const FIBRAS_UM: { y: number; z: number; mia: boolean; x: number }[] = Array.from({ length: 15 }).map((_, i) => {
  const fila = Math.floor(i / 5);
  const col = i % 5;
  return {
    y: -0.85 - fila * 0.34,
    z: -0.75 + col * 0.38 + (fila % 2) * 0.12,
    mia: [0, 3, 6, 8, 11, 14].includes(i),
    x: -1.0 + rnd(`umx${i}`) * 2.0,
  };
});
/** Punto del impulso en la unidad motora: t 0..0.7 axon, 0.7..1 ramas (rama i). */
export const puntoUM = (t: number, rama: number): V3 => {
  if (t < 0.7) return aV3(CURVA_UM.getPointAt(Math.max(0, t / 0.7)));
  const f = FIBRAS_UM.filter((q) => q.mia)[rama];
  const u = Math.min(1, (t - 0.7) / 0.3);
  const ini = AXON_UM[AXON_UM.length - 1];
  const fin: V3 = [f.x, f.y + 0.13, f.z];
  return [mix(ini[0], fin[0], u), mix(ini[1], fin[1], u) + Math.sin(u * Math.PI) * 0.08, mix(ini[2], fin[2], u)];
};

export const UnidadMotora: React.FC<{ pulso: number; activa: number; otras?: number }> = ({ pulso, activa, otras = 0 }) => {
  const mias = FIBRAS_UM.filter((q) => q.mia);
  return (
    <group>
      {/* trozo de medula espinal (sustancia gris) con el cuerpo de la motoneurona */}
      <mesh position={[-0.9, 1.5, -0.2]}>
        <cylinderGeometry args={[0.55, 0.55, 1.1, 40]} />
        <meshPhysicalMaterial color="#e8d6c8" transparent opacity={0.12} roughness={0.5} depthWrite={false} />
      </mesh>
      <mesh position={SOMA}>
        <sphereGeometry args={[0.17, 28, 20]} />
        <meshPhysicalMaterial color={NERVIO_C} emissive={NERVIO_C} emissiveIntensity={0.4 + activa * 0.8} roughness={0.35} clearcoat={0.6} />
      </mesh>
      {/* dendritas */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2 + 0.4;
        const d: V3 = [SOMA[0] + Math.cos(a) * 0.42, SOMA[1] + Math.sin(a) * 0.36 + 0.05, SOMA[2] + (rnd(`dz${i}`) - 0.5) * 0.3];
        const m: V3 = [SOMA[0] + Math.cos(a + 0.3) * 0.22, SOMA[1] + Math.sin(a + 0.3) * 0.2, SOMA[2]];
        return <Tubo key={i} puntos={[SOMA, m, d]} radio={0.022} color={NERVIO_C} emisivo={0.3} segmentos={10} />;
      })}
      {/* axon con mielina */}
      <Tubo puntos={AXON_UM} radio={0.035} color={NERVIO_C} emisivo={0.35 + activa * 0.5} segmentos={50} />
      <Mielina puntos={AXON_UM} n={6} radio={0.07} desde={0.12} hasta={0.92} />
      {/* ramas terminales y placas */}
      {mias.map((f, i) => {
        const ini = AXON_UM[AXON_UM.length - 1];
        const fin: V3 = [f.x, f.y + 0.13, f.z];
        const mid: V3 = [mix(ini[0], fin[0], 0.5), mix(ini[1], fin[1], 0.5) + 0.08, mix(ini[2], fin[2], 0.5)];
        return (
          <group key={i}>
            <Tubo puntos={[ini, mid, fin]} radio={0.016} color={NERVIO_C} emisivo={0.35 + activa * 0.8} segmentos={14} />
            <mesh position={fin} scale={[1.4, 0.5, 1]}>
              <sphereGeometry args={[0.05, 14, 10]} />
              <meshStandardMaterial color={NERVIO_C} emissive={NERVIO_C} emissiveIntensity={0.5 + activa} />
            </mesh>
          </group>
        );
      })}
      {/* fibras musculares */}
      {FIBRAS_UM.map((f, i) => (
        <group key={i}>
          <CilindroX
            radio={0.13}
            largo={4.4}
            x={2.2}
            y={f.y}
            z={f.z}
            color={f.mia ? "#ff7a4a" : "#b8323e"}
            estriado={12}
            emisivo={f.mia ? activa * 1.1 : otras * 0.05}
            tapa="#d75b65"
          />
          {f.mia && activa > 0.05 ? (
            <mesh position={[0, f.y, f.z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.2, 0.2, 4.4, 24, 1, true]} />
              <meshBasicMaterial color={K.amarillo} transparent opacity={activa * 0.22} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
          ) : null}
        </group>
      ))}
      {/* impulso */}
      {pulso > 0 && pulso < 1
        ? (pulso < 0.7 ? [0] : mias.map((_, i) => i)).map((r) => (
            <group key={r} position={puntoUM(pulso, r)}>
              <mesh>
                <sphereGeometry args={[0.06, 16, 12]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              <mesh>
                <sphereGeometry args={[0.15, 16, 12]} />
                <meshBasicMaterial color={NERVIO_C} transparent opacity={0.45} depthWrite={false} />
              </mesh>
            </group>
          ))
        : null}
    </group>
  );
};

// ---- Placa motora (union neuromuscular) ---------------------------------------------
// Fibra a lo largo de X (radio 2, centro y = -2): su membrana superior queda en y = 0.

export const AXON_PM: V3[] = [
  [-3.6, 3.3, -0.4],
  [-2.3, 2.7, -0.25],
  [-1.2, 1.8, 0],
  [-0.45, 1.1, 0],
  [0, 0.8, 0],
];
const CURVA_PM = curvaDe(AXON_PM);
export const puntoAxonPM = (t: number): V3 => aV3(CURVA_PM.getPointAt(Math.min(1, Math.max(0, t))));
export const BOTON: V3 = [0, 0.72, 0];

/** Receptores de acetilcolina en la membrana, bajo el boton. */
export const RECEPTORES_ACH: V3[] = Array.from({ length: 16 }).map((_, i) => {
  const a = (i / 16) * Math.PI * 2 + (i % 2) * 0.2;
  const r = i % 2 ? 0.42 : 0.24;
  return [Math.cos(a) * r, 0.03, Math.sin(a) * r * 0.75];
});

const ACH_N = 40;
/** Posicion de cada molecula de ACh: sale del boton y cae en un receptor (las 16 primeras). */
export const posAch = (i: number, t: number): V3 => {
  const a = rnd(`aa${i}`) * Math.PI * 2;
  const r = rnd(`ar${i}`) * 0.35;
  const ini: V3 = [Math.cos(a) * r * 0.7, 0.38, Math.sin(a) * r * 0.5];
  const rec = RECEPTORES_ACH[i % RECEPTORES_ACH.length];
  const fin: V3 = i < RECEPTORES_ACH.length ? [rec[0], 0.1, rec[2]] : [Math.cos(a) * (r + 0.15), 0.12 + rnd(`ah${i}`) * 0.18, Math.sin(a) * (r + 0.1) * 0.7];
  const u = Math.min(1, Math.max(0, t * 1.4 - rnd(`at${i}`) * 0.4));
  return difusion(ini, fin, u, `ach${i}`, 0.05);
};

/** Iones de sodio: del espacio sinaptico, por el poro del receptor, hacia dentro de la fibra. */
export const posNa = (i: number, t: number): V3 => {
  const rec = RECEPTORES_ACH[i % RECEPTORES_ACH.length];
  const a = rnd(`na${i}`) * Math.PI * 2;
  const ini: V3 = [rec[0] + Math.cos(a) * 0.25, 0.3 + rnd(`nh${i}`) * 0.15, rec[2] + Math.sin(a) * 0.2];
  const poro: V3 = [rec[0], 0.03, rec[2]];
  const fin: V3 = [rec[0] * 1.5 + Math.cos(a) * 0.2, -0.45 - rnd(`nd${i}`) * 0.4, rec[2] * 1.3];
  const u = Math.min(1, Math.max(0, t * 1.5 - rnd(`nt${i}`) * 0.5));
  return u < 0.5 ? mix3(ini, poro, u * 2) : mix3(poro, fin, (u - 0.5) * 2);
};

export const PlacaMotora: React.FC<{
  b: number;
  llega?: number; // 0..1 impulso por el axon
  fusion?: number; // 0..1 vesiculas -> membrana
  ach?: number; // 0..1 difusion de ACh
  achOp?: number;
  union?: number; // 0..1 receptores ocupados/abiertos
  sodio?: number; // 0..1 entrada de Na+
  onda?: number; // 0..1 potencial de accion por la membrana (anillos)
  largoFibra?: number;
}> = ({ b, llega = -1, fusion = 0, ach = 0, achOp = 1, union = 0, sodio = 0, onda = 0, largoFibra = 16 }) => {
  const vesiculas = Array.from({ length: 14 }).map((_, i): V3 => {
    const a = rnd(`va${i}`) * Math.PI * 2;
    const r = 0.08 + rnd(`vr${i}`) * 0.22;
    const ini: V3 = [Math.cos(a) * r, 0.68 + rnd(`vy${i}`) * 0.2 + Math.sin(b * 6 + i) * 0.01, Math.sin(a) * r * 0.6];
    const fin: V3 = [ini[0] * 0.8, 0.43, ini[2] * 0.8];
    return mix3(ini, fin, i < 8 ? fusion : 0);
  });
  const L = largoFibra;
  return (
    <group>
      {/* fibra muscular */}
      <group position={[0, -2, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[2, 2, L, 72, 1, true]} />
          <meshPhysicalMaterial color="#c4404c" emissive="#ff6a5a" emissiveIntensity={0.05 + sodio * 0.15} roughness={0.45} clearcoat={0.3} side={THREE.DoubleSide} />
        </mesh>
        {/* estrias sutiles */}
        {Array.from({ length: Math.round(L / 0.5) }).map((_, i) => (
          <mesh key={i} position={[-L / 2 + 0.25 + i * 0.5, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[2.005, 0.012, 6, 72]} />
            <meshStandardMaterial color="#8e2632" />
          </mesh>
        ))}
        {/* onda del potencial de accion: anillos que corren a ambos lados */}
        {onda > 0 && onda < 1
          ? [-1, 1].map((s) => (
              <group key={s} position={[s * onda * (L / 2), 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <mesh>
                  <torusGeometry args={[2.03, 0.07, 12, 80]} />
                  <meshBasicMaterial color="#fff7c2" />
                </mesh>
                <mesh>
                  <torusGeometry args={[2.05, 0.26, 12, 80]} />
                  <meshBasicMaterial color={NA_C} transparent opacity={0.35} depthWrite={false} />
                </mesh>
              </group>
            ))
          : null}
      </group>
      {/* receptores de ACh (canales) */}
      {RECEPTORES_ACH.map((p, i) => (
        <group key={i} position={p}>
          <mesh>
            <cylinderGeometry args={[0.05, 0.055, 0.1, 14, 1, true]} />
            <meshPhysicalMaterial color={RECEPTOR_ACH} emissive="#ff4fc8" emissiveIntensity={0.3 + union * 0.9} roughness={0.35} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.045, 0.014, 8, 20]} />
            <meshStandardMaterial color={RECEPTOR_ACH} emissive="#ff4fc8" emissiveIntensity={0.4 + union} />
          </mesh>
          {/* poro: brilla amarillo cuando deja pasar Na+ */}
          <mesh position={[0, 0.0, 0]}>
            <cylinderGeometry args={[0.022 * (0.4 + union * 0.6), 0.022 * (0.4 + union * 0.6), 0.11, 10]} />
            <meshBasicMaterial color={union > 0.5 ? NA_C : "#3a1030"} transparent opacity={0.9} />
          </mesh>
        </group>
      ))}
      {/* axon (con mielina) y boton terminal */}
      <Tubo puntos={AXON_PM} radio={0.11} color={NERVIO_C} emisivo={0.25} segmentos={80} />
      <Mielina puntos={AXON_PM} n={3} radio={0.2} desde={0.0} hasta={0.62} op={0.5} />
      <mesh position={BOTON} scale={[1, 0.62, 0.75]}>
        <sphereGeometry args={[0.55, 40, 28]} />
        <meshPhysicalMaterial color={NERVIO_C} emissive={NERVIO_C} emissiveIntensity={0.08 + (llega > 0.9 && llega < 1.2 ? 0.6 : 0)} transparent opacity={0.42} roughness={0.3} clearcoat={0.6} depthWrite={false} />
      </mesh>
      {llega >= 0 && llega <= 1 ? <Particulas pos={[puntoAxonPM(llega)]} radio={0.1} color="#ffffff" brillo={3} /> : null}
      <Particulas pos={vesiculas} radio={0.065} color={ACH_C} opacidad={1 - fusion * 0.55} brillo={0.4} />
      {ach > 0 && achOp > 0 ? (
        <Particulas pos={Array.from({ length: ACH_N }).map((_, i) => posAch(i, ach))} radio={0.024} color={ACH_C} opacidad={achOp} brillo={1.6} />
      ) : null}
      {sodio > 0 && sodio < 1.2 ? (
        <Particulas pos={Array.from({ length: 34 }).map((_, i) => posNa(i, sodio))} radio={0.042} color={NA_C} brillo={1.6} opacidad={1 - entre(sodio, 0.9, 1.15)} />
      ) : null}
    </group>
  );
};

// ---- Triada en primer plano: tubulo T + 2 cisternas, sensores (DHPR) y compuertas (RyR) ----
// Vista lateral: tubulo T horizontal en y = 0, cisternas arriba y abajo, miofibrillas al exterior.

export const CANALES_X = [-0.9, -0.3, 0.3, 0.9];
export const Y_CISTERNA = 1.0;
export const R_CISTERNA = 0.42;
export const R_TUBOT = 0.28;
export const Y_MIOFIBRILLA = 2.2;
export const LARGO_TRIADA = 3.0;

/** Ca2+ i: dentro de la cisterna -> compuerta -> sale hacia la miofibrilla (t 0..1). */
export const posCa = (i: number, t: number, b: number): V3 => {
  const lado = i % 2 ? 1 : -1;
  const c = CANALES_X[Math.floor(i / 2) % CANALES_X.length];
  const dentro: V3 = [
    (rnd(`cx${i}`) - 0.5) * (LARGO_TRIADA - 0.4) + Math.sin(b * 3 + i) * 0.03,
    lado * (Y_CISTERNA + (rnd(`cy${i}`) - 0.5) * 0.4),
    (rnd(`cz${i}`) - 0.5) * 0.45,
  ];
  if (t <= 0) return dentro;
  const poro: V3 = [c, lado * (Y_CISTERNA - R_CISTERNA - 0.12), 0];
  const fuera: V3 = [c + (rnd(`cf${i}`) - 0.5) * 1.2, lado * 0.42, 0.55 + rnd(`cg${i}`) * 0.25];
  const fin: V3 = [(rnd(`ch${i}`) - 0.5) * (LARGO_TRIADA + 0.6), lado * (Y_MIOFIBRILLA - 0.45 - rnd(`ci${i}`) * 0.2), 0.2 + (rnd(`cj${i}`) - 0.3) * 0.6];
  if (t < 0.3) return mix3(dentro, poro, t / 0.3);
  if (t < 0.5) return mix3(poro, fuera, (t - 0.3) / 0.2);
  return difusion(fuera, fin, (t - 0.5) / 0.5, `cd${i}`, 0.12);
};

export const TriadaZoom: React.FC<{
  b: number;
  onda?: number; // 0..1 potencial de accion por el tubulo T
  sensor?: number; // 0..1 sensores (DHPR) cambian de forma
  abre?: number; // 0..1 compuertas (RyR) abiertas
  ca?: number; // 0..1 salida de calcio
  nCa?: number;
  miofibrillas?: number; // opacidad 0..1
  brilloMio?: number;
}> = ({ b, onda = 0, sensor = 0, abre = 0, ca = 0, nCa = 56, miofibrillas = 0, brilloMio = 0 }) => {
  const L = LARGO_TRIADA;
  const xOnda = mix(L / 2 + 0.3, -L / 2 - 0.3, onda);
  return (
    <group>
      {/* tubulo T */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[R_TUBOT, R_TUBOT, L + 1.2, 40, 1, true]} />
        <meshPhysicalMaterial color={TUBOT_C} emissive={TUBOT_C} emissiveIntensity={0.15 + (onda > 0 && onda < 1 ? 0.35 : 0)} transparent opacity={0.6} roughness={0.3} clearcoat={0.6} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {onda > 0 && onda < 1 ? (
        <group position={[xOnda, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <torusGeometry args={[R_TUBOT + 0.01, 0.035, 10, 40]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh>
            <torusGeometry args={[R_TUBOT + 0.02, 0.12, 10, 40]} />
            <meshBasicMaterial color={NA_C} transparent opacity={0.4} depthWrite={false} />
          </mesh>
        </group>
      ) : null}
      {/* cisternas terminales del reticulo */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, s * Y_CISTERNA, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.9]}>
          <capsuleGeometry args={[R_CISTERNA, L - R_CISTERNA * 2, 12, 32]} />
          <meshPhysicalMaterial color={RETICULO_C} emissive={RETICULO_C} emissiveIntensity={0.2 + abre * 0.25} transparent opacity={0.38} roughness={0.25} clearcoat={0.7} depthWrite={false} />
        </mesh>
      ))}
      {/* sensores (DHPR) en el tubulo y compuertas (RyR) en el reticulo */}
      {CANALES_X.flatMap((x, i) =>
        [-1, 1].map((s) => {
          const tilt = sensor * 0.45 * (i % 2 ? 1 : -1);
          const sep = 0.035 + abre * 0.06;
          const yR = s * (Y_CISTERNA - R_CISTERNA * 0.9 - 0.1);
          return (
            <group key={`${i}${s}`}>
              <group position={[x, s * (R_TUBOT + 0.04), 0]} rotation={[0, 0, tilt]}>
                <mesh>
                  <boxGeometry args={[0.15, 0.1, 0.18]} />
                  <meshPhysicalMaterial color={DHPR_C} emissive={DHPR_C} emissiveIntensity={0.3 + sensor * 1.0} roughness={0.3} clearcoat={0.6} />
                </mesh>
              </group>
              {[-1, 1].map((h) => (
                <mesh key={h} position={[x + h * sep, yR, 0]}>
                  <boxGeometry args={[0.07, 0.2, 0.2]} />
                  <meshPhysicalMaterial color={RYR_C} emissive={RYR_C} emissiveIntensity={0.3 + abre * 0.6} roughness={0.3} clearcoat={0.6} />
                </mesh>
              ))}
              {abre > 0.2 ? (
                <mesh position={[x, yR, 0]}>
                  <boxGeometry args={[sep * 2 - 0.07, 0.2, 0.12]} />
                  <meshBasicMaterial color={CA_C} transparent opacity={0.5 * abre} depthWrite={false} />
                </mesh>
              ) : null}
            </group>
          );
        }),
      )}
      {/* calcio */}
      {Array.from({ length: nCa }).map((_, i) => {
        const tt = Math.min(1, Math.max(0, ca * 1.6 - rnd(`cr${i}`) * 0.6));
        const p = posCa(i, tt, b);
        return (
          <group key={i} position={p}>
            <mesh>
              <sphereGeometry args={[0.045, 12, 10]} />
              <meshStandardMaterial color={CA_C} emissive={CA_C} emissiveIntensity={1.8} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.1, 10, 8]} />
              <meshBasicMaterial color={CA_C} transparent opacity={0.18} depthWrite={false} />
            </mesh>
          </group>
        );
      })}
      {/* miofibrillas arriba y abajo */}
      {miofibrillas > 0
        ? [-1, 1].map((s) => (
            <CilindroX
              key={s}
              radio={0.55}
              largo={L + 2}
              x={(L + 2) / 2}
              y={s * Y_MIOFIBRILLA}
              color="#c03a46"
              estriado={4}
              tapa="#d75b65"
              emisivo={brilloMio}
              opacidad={miofibrillas}
            />
          ))
        : null}
    </group>
  );
};
