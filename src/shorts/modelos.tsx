// Modelos 3D propios de los shorts (se suman a los de src/fisio/modelos).
import React from "react";
import * as THREE from "three";
import { mix, V3 } from "../fisio/motor";
import { Humano } from "../fisio/modelos/cuerpo";
import { rnd, Tubo } from "../fisio/modelos/comun";
import { CabezaMiosina, CilindroX } from "../fisio/modelos/musculo";
import { Esfera, Mol } from "../fisio/modelos/energia";
import { Creatina, MiniATP } from "../fisio/energia/e1";
import { K } from "./marco";

// ---- Atleta con poses de ejercicio --------------------------------------------

export type Ejercicio = "sentadilla" | "curl" | "flex" | "parado" | "sprint";

/** k: 0..1 profundidad del movimiento (0 = arriba). */
export const Atleta: React.FC<{
  ej: Ejercicio;
  k?: number;
  fase?: number;
  brilla?: number;
  colorBrillo?: string;
  musculo?: number;
  pesa?: boolean;
}> = ({ ej, k = 0, fase = 0, brilla = 0, colorBrillo, musculo = 0.8, pesa }) => {
  if (ej === "sprint") {
    return <Humano fase={fase} marcha={1.7} musculo={musculo} brilla={brilla} colorBrillo={colorBrillo} />;
  }
  if (ej === "sentadilla") {
    const h = 1.25 * k;
    const r = 2.1 * k;
    const baja = 0.87 - (0.44 * Math.cos(h) + 0.43 * Math.cos(r - h));
    const pie = 0.44 * Math.sin(h) - 0.43 * Math.sin(r - h);
    return (
      <group position={[0, -baja, -pie]}>
        <group rotation={[0.35 * k, 0, 0]} position={[0, 0, 0]}>
          <Humano
            musculo={musculo}
            brilla={brilla}
            colorBrillo={colorBrillo}
            pose={{
              caderaD: [-h, 0, 0.05],
              caderaI: [-h, 0, -0.05],
              rodillaD: r,
              rodillaI: r,
              hombroD: [-1.45, 0, 0.12],
              hombroI: [-1.45, 0, -0.12],
              codoD: -0.1,
              codoI: -0.1,
            }}
          />
        </group>
      </group>
    );
  }
  if (ej === "curl") {
    const c = -0.15 - 2.2 * k;
    return (
      <Humano
        musculo={musculo}
        brilla={brilla}
        colorBrillo={colorBrillo}
        pesa={pesa ?? true}
        pose={{ hombroD: [0, 0, 0.1], hombroI: [0, 0, -0.1], codoD: c, codoI: c, caderaD: [0, 0, 0.05], caderaI: [0, 0, -0.05], rodillaD: 0, rodillaI: 0 }}
      />
    );
  }
  if (ej === "flex") {
    return (
      <Humano
        musculo={musculo}
        brilla={brilla}
        colorBrillo={colorBrillo}
        pose={{
          hombroD: [0, 0, 1.55],
          hombroI: [0, 0, -1.55],
          codoD: -2.0 - 0.2 * k,
          codoI: -2.0 - 0.2 * k,
          antebrazoD: 0,
          caderaD: [0, 0, 0.12],
          caderaI: [0, 0, -0.12],
          rodillaD: 0,
          rodillaI: 0,
        }}
      />
    );
  }
  return (
    <Humano
      musculo={musculo}
      brilla={brilla}
      colorBrillo={colorBrillo}
      pose={{ hombroD: [0, 0, 0.12], hombroI: [0, 0, -0.12], codoD: -0.15, codoI: -0.15, caderaD: [0, 0, 0.04], caderaI: [0, 0, -0.04], rodillaD: 0, rodillaI: 0 }}
    />
  );
};

/** Plataforma redonda bajo los pies. */
export const Piso: React.FC<{ color?: string; r?: number; brillo?: number }> = ({ color = K.lima, r = 0.75, brillo = 0.4 }) => (
  <group position={[0, -0.005, 0]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[r, 64]} />
      <meshStandardMaterial color="#0d2a2f" roughness={0.8} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
      <ringGeometry args={[r * 0.96, r, 64]} />
      <meshBasicMaterial color={color} transparent opacity={brillo} />
    </mesh>
  </group>
);

// ---- Interior de una fibra muscular (vertical) ------------------------------

/** Posiciones fijas de las moleculas de PCr entre las miofibrillas. */
export const PCR_POS: V3[] = Array.from({ length: 28 }).map((_, i) => [
  (rnd(`cx${i}`) - 0.5) * 4.6,
  (rnd(`cy${i}`) - 0.5) * 6.4,
  (rnd(`cz${i}`) - 0.5) * 1.6 + 0.4,
]);

export const MIOFIBRILLAS: [number, number][] = [
  [-2.0, -0.7],
  [0, -1.0],
  [2.0, -0.7],
  [-1.0, -2.4],
  [1.0, -2.4],
  [-3.6, -1.6],
  [3.6, -1.6],
];

/**
 * Corte de la fibra: miofibrillas verticales estriadas, mitocondrias y moleculas de
 * fosfocreatina. pcr = cuantas hay (0..28); carga = fraccion con fosfato (0..1).
 */
export const InteriorFibra: React.FC<{
  b: number;
  pcr?: number;
  carga?: number;
  atp?: number;
  brillo?: number;
  agua?: number;
  hinchazon?: number;
  hplus?: number;
  dano?: number;
}> = ({ b, pcr = 18, carga = 1, atp = 0, brillo = 0, agua = 0, hinchazon = 0, hplus = 0, dano = 0 }) => {
  const n = Math.round(pcr);
  const conP = Math.round(n * carga);
  return (
    <group scale={[1 + hinchazon * 0.12, 1, 1 + hinchazon * 0.12]}>
      {/* miofibrillas (de pie) */}
      <group rotation={[0, 0, Math.PI / 2]}>
        {MIOFIBRILLAS.map(([x, z], i) => (
          <CilindroX key={i} radio={0.5} largo={14} x={7} y={-x * (1 + hinchazon * 0.1)} z={z} color="#c03a46" estriado={10} emisivo={brillo * 0.5} />
        ))}
      </group>
      {/* mitocondrias */}
      {[
        [-1.0, 1.6, -0.4],
        [1.1, -1.4, -0.3],
        [0.2, 2.6, -1.5],
      ].map((p, i) => (
        <group key={i} position={p as V3} rotation={[0, 0, 1.4]} scale={0.9}>
          <mesh>
            <capsuleGeometry args={[0.18, 0.7, 8, 16]} />
            <meshPhysicalMaterial color={K.naranja} emissive={K.naranja} emissiveIntensity={0.25} transparent opacity={0.85} clearcoat={0.5} />
          </mesh>
        </group>
      ))}
      {/* fosfocreatina */}
      {PCR_POS.slice(0, n).map((p, i) => (
        <Creatina key={i} p={[p[0], p[1] + Math.sin(b * 2 + i) * 0.06, p[2]]} fosfato={i < conP ? 1 : 0} escala={1.4} op={1} />
      ))}
      {/* ATP flotando */}
      {atp > 0
        ? Array.from({ length: Math.round(atp) }).map((_, i) => (
            <MiniATP key={`a${i}`} p={[(rnd(`ax${i}`) - 0.5) * 2.6, (rnd(`ay${i}`) - 0.5) * 4.4, 0.9 + rnd(`az${i}`) * 0.4]} escala={1.6} brillo={0.6} />
          ))
        : null}
      {/* agua */}
      {agua > 0
        ? Array.from({ length: 40 }).map((_, i) => {
            const f = Math.min(1, Math.max(0, agua * 1.4 - rnd(`wd${i}`) * 0.4));
            if (f <= 0) return null;
            const x0 = (rnd(`wx${i}`) - 0.5) * 7;
            const y0 = (rnd(`wy${i}`) - 0.5) * 5;
            const fin: V3 = [x0 * 0.4, y0, 0.6 + rnd(`wz${i}`) * 0.6];
            const ini: V3 = [x0 > 0 ? 4.5 : -4.5, y0 + 0.5, 0.8];
            return <AguaMol key={`w${i}`} p={[mix(ini[0], fin[0], f), mix(ini[1], fin[1], f) + Math.sin(b * 3 + i) * 0.04, mix(ini[2], fin[2], f)]} escala={0.9} />;
          })
        : null}
      {/* microdesgarros (agujetas) */}
      {dano > 0
        ? Array.from({ length: 14 }).map((_, i) => {
            const [x, z] = MIOFIBRILLAS[i % 5];
            return (
              <mesh key={`d${i}`} position={[x + (rnd(`dx${i}`) - 0.5) * 0.6, (rnd(`dy${i}`) - 0.5) * 6, z + 0.52]} rotation={[0, 0, rnd(`dr${i}`) * 3]} scale={[0.35 * dano, 0.05, 0.05]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#fff2c4" emissive="#ffd23f" emissiveIntensity={1.2 * dano} />
              </mesh>
            );
          })
        : null}
      {/* iones H+ */}
      {hplus > 0
        ? Array.from({ length: Math.round(hplus) }).map((_, i) => (
            <Mol key={`h${i}`} p={[(rnd(`hx${i}`) - 0.5) * 3.2, (rnd(`hy${i}`) - 0.5) * 5 + Math.sin(b * 4 + i) * 0.05, 0.5 + rnd(`hz${i}`) * 0.8]} color={K.rojo} r={0.08} />
          ))
        : null}
    </group>
  );
};

/** Molecula de agua: O rojo + 2 H blancos. */
export const AguaMol: React.FC<{ p: V3; escala?: number; op?: number }> = ({ p, escala = 1, op = 1 }) => (
  <group position={p} scale={escala}>
    <Esfera p={[0, 0, 0]} r={0.09} color={K.cian} brillo={0.6} op={op} />
    <Esfera p={[0.08, 0.07, 0]} r={0.05} color="#ffffff" brillo={0.3} op={op} />
    <Esfera p={[-0.08, 0.07, 0]} r={0.05} color="#ffffff" brillo={0.3} op={op} />
  </group>
);

// ---- Puente cruzado: actina + cabeza de miosina -----------------------------

/** Filamento de actina vertical simplificado con una cabeza de miosina que tira. */
export const Golpe: React.FC<{ b: number; giro: number; desliza: number; brillo?: number }> = ({ giro, desliza, brillo = 0 }) => (
  <group>
    {/* actina (perlas doradas) */}
    <group position={[0.55, -desliza, 0]}>
      {Array.from({ length: 26 }).map((_, i) => (
        <Esfera key={i} p={[Math.sin(i * 1.5) * 0.07, -3 + i * 0.24, Math.cos(i * 1.5) * 0.07]} r={0.11} color="#f2b83a" brillo={0.15} />
      ))}
    </group>
    {/* miosina (barra morada) */}
    <mesh position={[-0.75, 0, 0]}>
      <cylinderGeometry args={[0.16, 0.16, 6, 20]} />
      <meshPhysicalMaterial color="#8f4ad8" clearcoat={0.5} roughness={0.35} />
    </mesh>
    <group position={[-0.7, -0.2, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <CabezaMiosina angulo={giro} />
    </group>
    {brillo > 0 ? <Mol p={[0.3, -0.1, 0.2]} color={K.naranja} r={0.12} brillo={1 + brillo} /> : null}
  </group>
);

// ---- Organos -------------------------------------------------------------------

export const Rinones: React.FC<{ brillo?: number; color?: string }> = ({ brillo = 0, color = "#b4434d" }) => (
  <group>
    {[-1, 1].map((l) => (
      <group key={l} position={[l * 0.85, 0, 0]} rotation={[0, 0, l * 0.18]}>
        <mesh scale={[0.55, 0.9, 0.42]}>
          <sphereGeometry args={[1, 40, 28]} />
          <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.1 + brillo} roughness={0.35} clearcoat={0.6} />
        </mesh>
        <mesh position={[-l * 0.48, 0, 0.05]} scale={[0.18, 0.28, 0.2]}>
          <sphereGeometry args={[1, 20, 14]} />
          <meshStandardMaterial color="#f0c6b0" />
        </mesh>
        <Tubo puntos={[[-l * 0.55, 0, 0], [-l * 0.75, -0.6, 0.1], [-l * 0.7, -1.6, 0.1]]} radio={0.06} color="#f0d8a8" />
      </group>
    ))}
    <Tubo puntos={[[0, 1.4, -0.3], [0, 0, -0.3], [0, -1.6, -0.3]]} radio={0.13} color="#d0303d" emisivo={0.2} />
  </group>
);

/** Vaso de agua; polvo: 0..1 cae y se disuelve. */
export const VasoAgua: React.FC<{ b: number; polvo: number }> = ({ b, polvo }) => (
  <group>
    <mesh position={[0, 0.7, 0]}>
      <cylinderGeometry args={[0.62, 0.52, 1.6, 48, 1, true]} />
      <meshPhysicalMaterial color="#d8f6ff" transparent opacity={0.22} roughness={0.05} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
    <mesh position={[0, 0.5, 0]}>
      <cylinderGeometry args={[0.58, 0.52, 1.15, 48]} />
      <meshPhysicalMaterial color={K.cian} transparent opacity={0.28 + polvo * 0.1} roughness={0.1} depthWrite={false} emissive={K.cian} emissiveIntensity={0.1} />
    </mesh>
    {Array.from({ length: 40 }).map((_, i) => {
      const t = Math.min(1, Math.max(0, polvo * 1.6 - rnd(`pv${i}`) * 0.6));
      if (t <= 0 || t >= 1) return null;
      const x = (rnd(`px${i}`) - 0.5) * 0.7;
      const z = (rnd(`pz${i}`) - 0.5) * 0.7;
      const y = mix(2.0, 0.3, t) + Math.sin(b * 5 + i) * 0.02;
      return (
        <mesh key={i} position={[x * (1 - t * 0.3), y, z]}>
          <sphereGeometry args={[0.035 * (1 - t * 0.7), 8, 6]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} transparent opacity={1 - t * 0.6} />
        </mesh>
      );
    })}
  </group>
);

/** Bascula de piso con pantalla. */
export const Bascula: React.FC = () => (
  <group>
    <mesh position={[0, 0.03, 0]}>
      <boxGeometry args={[0.7, 0.06, 0.55]} />
      <meshPhysicalMaterial color="#e8eef0" clearcoat={0.8} roughness={0.2} />
    </mesh>
    <mesh position={[0, 0.062, 0.2]}>
      <boxGeometry args={[0.24, 0.005, 0.08]} />
      <meshStandardMaterial color="#0d2a2f" emissive={K.lima} emissiveIntensity={0.3} />
    </mesh>
  </group>
);

// ---- Proteinas y comida ------------------------------------------------------

const COLORES_AA = [K.lima, K.cian, K.naranja, K.rosa, K.morado, K.amarillo];

/** Cadena de aminoacidos (proteina). desarma 0..1 separa las cuentas. */
export const Proteina: React.FC<{ p: V3; n?: number; desarma?: number; escala?: number; giro?: number; seed?: string }> = ({
  p,
  n = 10,
  desarma = 0,
  escala = 1,
  giro = 0,
  seed = "pr",
}) => (
  <group position={p} scale={escala} rotation={[0, giro, 0]}>
    {Array.from({ length: n }).map((_, i) => {
      const a = i * 0.9;
      const base: V3 = [Math.cos(a) * 0.22, (i - n / 2) * 0.13, Math.sin(a) * 0.22];
      const lejos: V3 = [(rnd(`${seed}x${i}`) - 0.5) * 2.4, (rnd(`${seed}y${i}`) - 0.5) * 2.4, (rnd(`${seed}z${i}`) - 0.5) * 1.2];
      const q: V3 = [mix(base[0], lejos[0], desarma), mix(base[1], lejos[1], desarma), mix(base[2], lejos[2], desarma)];
      return <Esfera key={i} p={q} r={0.085} color={COLORES_AA[i % COLORES_AA.length]} brillo={0.35} />;
    })}
  </group>
);

export const Plato: React.FC<{ p: V3; escala?: number }> = ({ p, escala = 1 }) => (
  <group position={p} scale={escala}>
    <mesh>
      <cylinderGeometry args={[0.55, 0.42, 0.06, 48]} />
      <meshPhysicalMaterial color="#f4f7f2" clearcoat={0.8} roughness={0.25} />
    </mesh>
  </group>
);

export const Pechuga: React.FC<{ p: V3; escala?: number }> = ({ p, escala = 1 }) => (
  <group position={p} scale={escala}>
    <mesh scale={[0.45, 0.13, 0.28]} rotation={[0, 0.3, 0]}>
      <sphereGeometry args={[1, 32, 20]} />
      <meshPhysicalMaterial color="#f3dcc0" roughness={0.55} clearcoat={0.3} />
    </mesh>
    {[-0.2, -0.05, 0.1, 0.25].map((x) => (
      <mesh key={x} position={[x, 0.1, 0]} rotation={[0, 0.3, 0.2]} scale={[0.02, 0.02, 0.22]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#b07a45" />
      </mesh>
    ))}
  </group>
);

export const Huevo: React.FC<{ p: V3; escala?: number }> = ({ p, escala = 1 }) => (
  <group position={p} scale={escala}>
    <mesh scale={[0.32, 0.05, 0.28]}>
      <sphereGeometry args={[1, 32, 16]} />
      <meshStandardMaterial color="#ffffff" roughness={0.4} />
    </mesh>
    <mesh position={[0, 0.05, 0]} scale={[0.12, 0.07, 0.12]}>
      <sphereGeometry args={[1, 24, 16]} />
      <meshPhysicalMaterial color="#ffb21f" clearcoat={0.8} roughness={0.2} />
    </mesh>
  </group>
);

export const Frijoles: React.FC<{ p: V3; escala?: number }> = ({ p, escala = 1 }) => (
  <group position={p} scale={escala}>
    <mesh position={[0, 0.05, 0]}>
      <sphereGeometry args={[0.42, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      <meshPhysicalMaterial color="#d97a2b" side={THREE.DoubleSide} roughness={0.4} clearcoat={0.4} />
    </mesh>
    {Array.from({ length: 22 }).map((_, i) => (
      <mesh
        key={i}
        position={[(rnd(`fj${i}`) - 0.5) * 0.55, 0.06 + rnd(`fy${i}`) * 0.04, (rnd(`fz${i}`) - 0.5) * 0.55]}
        rotation={[rnd(`fr${i}`) * 3, rnd(`fs${i}`) * 3, 0]}
        scale={[0.07, 0.045, 0.045]}
      >
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#5a1f22" roughness={0.35} />
      </mesh>
    ))}
  </group>
);

// ---- Nervio sensitivo del dolor -------------------------------------------------

/** Terminacion nerviosa con receptores; pulso 0..1 recorre el axon hacia arriba. */
export const Nervio: React.FC<{ activa: number; pulso: number }> = ({ activa, pulso }) => {
  const pts: V3[] = [
    [0, -0.4, 0],
    [0.3, 0.8, 0.1],
    [-0.1, 2.0, 0],
    [0.2, 3.4, -0.2],
    [0, 5, 0],
  ];
  const col = activa > 0.5 ? K.naranja : K.amarillo;
  return (
    <group>
      <Tubo puntos={pts} radio={0.09} color={col} emisivo={0.3 + activa * 0.8} />
      {[
        [-0.5, -0.9, 0.2],
        [0.5, -1.0, 0.1],
        [0, -1.2, 0.4],
        [-0.3, -0.7, -0.4],
      ].map((q, i) => (
        <group key={i}>
          <Tubo puntos={[[0, -0.4, 0], [q[0] * 0.6, q[1] * 0.8, q[2] * 0.6], q as V3]} radio={0.05} color={col} emisivo={0.3 + activa} />
          <Esfera p={q as V3} r={0.16} color={activa > 0.5 ? K.rojo : K.amarillo} brillo={0.3 + activa * 1.5} />
        </group>
      ))}
      {activa > 0.3
        ? [0, 0.33, 0.66].map((o) => {
            const t = (pulso + o) % 1;
            const y = mix(-0.4, 5, t);
            return <Mol key={o} p={[Math.sin(t * 6) * 0.25, y, 0.05]} color="#fff3a0" r={0.13} brillo={2} />;
          })
        : null}
    </group>
  );
};
