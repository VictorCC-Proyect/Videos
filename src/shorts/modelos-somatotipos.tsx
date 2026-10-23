// Modelos 3D del short de somatotipos (Heath-Carter): cuerpo deformable en 3 ejes,
// instrumentos de cineantropometria (plicometro, cinta, calibre, estadiometro) y la somatocarta.
import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../fisio/motor";
import { rnd } from "../fisio/modelos/comun";
import { C } from "../fisio/tema";

const GRASA = "#f3cf6a";
const yM = -0.35; // techo del musculo en CortePiel

// ---- Cuerpo parametrizado ----------------------------------------------------------

export type Soma = { endo: number; meso: number; ecto: number };

/** Medidas derivadas de las tres calificaciones (unidades de escena, pies en y = 0). */
export const somaMedidas = ({ endo, meso, ecto }: Soma) => {
  const ls = 1 + 0.05 * (ecto - 3); // largo de extremidades
  const tl = 1 + 0.025 * (ecto - 3); // largo del tronco
  const delgado = Math.min(1.15, Math.max(0.78, 1 - 0.05 * (ecto - 3)));
  const mm = (1 + 0.12 * (meso - 4)) * delgado; // grosor muscular
  const hb = 1 + 0.08 * (meso - 4); // grosor oseo
  const g = 0.015 * endo; // espesor de grasa
  const pie = 0.07;
  const muslo = 0.44 * ls;
  const pierna = 0.43 * ls;
  const cadera = pie + muslo + pierna;
  const hombroY = cadera + 0.52 * tl;
  const ancho = 0.2 * (1 + 0.09 * (meso - 4)) * (1 - 0.025 * (ecto - 3)) + g * 0.4;
  const brazo = 0.3 * ls;
  const antebrazo = 0.27 * ls;
  return { ls, tl, mm, hb, g, pie, muslo, pierna, cadera, hombroY, ancho, brazo, antebrazo, cabeza: hombroY + 0.2 };
};

/** Puntos utiles para etiquetas/camara (brazo derecho con abduccion `abd`). */
export const somaPuntos = (s: Soma, abd = 0.14) => {
  const m = somaMedidas(s);
  const dir: V3 = [Math.sin(abd), -Math.cos(abd), 0];
  const hom: V3 = [m.ancho, m.hombroY - 0.02, 0];
  const en = (k: number): V3 => [hom[0] + dir[0] * m.brazo * k, hom[1] + dir[1] * m.brazo * k, 0];
  const xr = 0.1 + m.g * 0.3;
  return {
    hombro: hom,
    brazo: en(0.5),
    codo: en(1),
    triceps: [en(0.5)[0], en(0.5)[1], -0.045 * m.mm - m.g] as V3,
    rodilla: [xr, m.pie + m.pierna, 0] as V3,
    pantorrilla: [xr, m.pie + m.pierna * 0.68, -0.02] as V3,
    abdomen: [0, m.cadera + 0.14, 0.1 + m.g * 2] as V3,
    cabeza: [0, m.cabeza + 0.14, 0] as V3,
    alto: m.cabeza + 0.13,
  };
};

const Seg: React.FC<{
  largo: number;
  r: number;
  hueso: number;
  grasa: number;
  rot?: [number, number, number];
  pos?: V3;
  musculo: number;
  verGrasa: number;
  brilla: number;
  colorBrillo: string;
  tono: string;
  children?: React.ReactNode;
}> = ({ largo, r, hueso, grasa, rot = [0, 0, 0], pos = [0, 0, 0], musculo, verGrasa, brilla, colorBrillo, tono, children }) => (
  <group position={pos} rotation={rot}>
    <mesh position={[0, -largo / 2, 0]}>
      <cylinderGeometry args={[hueso, hueso * 0.9, largo * 0.92, 12]} />
      <meshStandardMaterial color={C.hueso} roughness={0.55} />
    </mesh>
    <mesh position={[0, -largo * 0.04, 0]}>
      <sphereGeometry args={[hueso * 1.6, 16, 12]} />
      <meshStandardMaterial color={C.hueso} roughness={0.55} />
    </mesh>
    {musculo > 0.01 ? (
      <mesh position={[0, -largo / 2, 0]} scale={[1, 1, 0.9]}>
        <capsuleGeometry args={[r, Math.max(0.01, largo - r * 1.4), 8, 20]} />
        <meshPhysicalMaterial
          color={tono}
          emissive={colorBrillo}
          emissiveIntensity={brilla * 0.9}
          roughness={0.45}
          clearcoat={0.4}
          transparent
          opacity={musculo}
          depthWrite={false}
        />
      </mesh>
    ) : null}
    {verGrasa > 0.01 && grasa > 0.004 ? (
      <mesh position={[0, -largo / 2, 0]} scale={[1, 1, 0.92]}>
        <capsuleGeometry args={[r + grasa, Math.max(0.01, largo - r * 1.4), 8, 20]} />
        <meshPhysicalMaterial color={GRASA} roughness={0.6} transparent opacity={0.4 * verGrasa} depthWrite={false} />
      </mesh>
    ) : null}
    <group position={[0, -largo, 0]}>{children}</group>
  </group>
);

/**
 * Cuerpo estilizado (mismo look que Humano: hueso blanco dentro de musculo rojo translucido)
 * que se deforma con las tres calificaciones de Heath-Carter:
 * endo = capa de grasa amarilla (tronco y extremidades), meso = hombros, musculo y hueso,
 * ecto = estatura y extremidades largas y finas.
 */
export const CuerpoSoma: React.FC<
  Soma & {
    musculo?: number;
    verGrasa?: number;
    brilla?: number;
    colorBrillo?: string;
    tono?: string;
    abd?: number; // abduccion de brazos
    codo?: number; // flexion de codos (negativo = hacia delante)
    fase?: number;
    marcha?: number;
    pesa?: boolean;
  }
> = ({
  endo,
  meso,
  ecto,
  musculo = 0.8,
  verGrasa = 1,
  brilla = 0,
  colorBrillo = C.musculoClaro,
  tono = C.musculo,
  abd = 0.14,
  codo = -0.15,
  fase = 0,
  marcha = 0,
  pesa = false,
}) => {
  const m = somaMedidas({ endo, meso, ecto });
  const g = m.g * verGrasa;
  const sm = { musculo, verGrasa, brilla, colorBrillo, tono };
  const s = Math.sin(fase) * marcha;
  const sube = Math.abs(Math.cos(fase)) * 0.025 * marcha;
  const piel = (op: number) => (
    <meshPhysicalMaterial color={tono} emissive={colorBrillo} emissiveIntensity={brilla * 0.6} transparent opacity={op} roughness={0.45} clearcoat={0.4} depthWrite={false} />
  );
  const grasaMat = <meshPhysicalMaterial color={GRASA} roughness={0.6} transparent opacity={0.42 * verGrasa} depthWrite={false} />;
  const yPecho = m.cadera + 0.33 * m.tl;
  const yVientre = m.cadera + 0.12 * m.tl;
  return (
    <group position={[0, sube, 0]}>
      {/* cabeza */}
      <mesh position={[0, m.cabeza, 0]}>
        <sphereGeometry args={[0.1, 28, 20]} />
        <meshStandardMaterial color={C.hueso} roughness={0.5} />
      </mesh>
      <mesh position={[0, m.cabeza + 0.01, 0]} scale={[1 + g * 1.5, 1.12, 1.05 + g * 1.5]}>
        <sphereGeometry args={[0.118, 28, 20]} />
        {piel(musculo * 0.7)}
      </mesh>
      {/* cuello */}
      <mesh position={[0, m.hombroY + 0.06, 0]}>
        <cylinderGeometry args={[0.045 * m.mm + g * 0.5, 0.055 * m.mm + g * 0.6, 0.12, 16]} />
        {piel(musculo * 0.8)}
      </mesh>
      {/* columna y costillas */}
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh key={i} position={[0, m.cadera + 0.04 + i * 0.036 * m.tl, -0.035]}>
          <cylinderGeometry args={[0.021 * m.hb, 0.021 * m.hb, 0.028, 10]} />
          <meshStandardMaterial color={C.hueso} />
        </mesh>
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[0, m.hombroY - 0.06 - i * 0.042 * m.tl, 0]} rotation={[Math.PI / 2 + 0.25, 0, 0]} scale={[m.ancho / 0.2, 0.75, 1]}>
          <torusGeometry args={[0.12 - Math.abs(i - 3) * 0.006, 0.008 * m.hb, 6, 28]} />
          <meshStandardMaterial color={C.hueso} />
        </mesh>
      ))}
      <mesh position={[0, m.cadera + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.7, 1]}>
        <torusGeometry args={[0.1, 0.03 * m.hb, 10, 24]} />
        <meshStandardMaterial color={C.hueso} />
      </mesh>
      {/* torax (ancho de hombros = robustez) */}
      <mesh position={[0, yPecho, 0]} scale={[m.ancho * 0.95, 0.27 * m.tl, 0.12 * Math.sqrt(m.mm)]}>
        <sphereGeometry args={[1, 32, 24]} />
        {piel(musculo * 0.75)}
      </mesh>
      {/* abdomen */}
      <mesh position={[0, yVientre, 0]} scale={[0.135 * Math.sqrt(m.mm), 0.2 * m.tl, 0.095]}>
        <sphereGeometry args={[1, 32, 24]} />
        {piel(musculo * 0.75)}
      </mesh>
      {/* deltoides */}
      {[1, -1].map((l) => (
        <mesh key={l} position={[l * (m.ancho - 0.005), m.hombroY - 0.03, 0]} scale={[1, 0.9, 0.85]}>
          <sphereGeometry args={[0.06 * m.mm, 20, 16]} />
          {piel(musculo * 0.85)}
        </mesh>
      ))}
      {/* grasa del tronco: envoltura + vientre */}
      {verGrasa > 0.01 ? (
        <>
          <mesh position={[0, yPecho, 0]} scale={[m.ancho * 0.95 + g * 1.1, 0.27 * m.tl + g * 0.5, 0.12 * Math.sqrt(m.mm) + g * 1.4]}>
            <sphereGeometry args={[1, 32, 24]} />
            {grasaMat}
          </mesh>
          <mesh position={[0, yVientre - g * 0.3, g * 0.9]} scale={[0.135 * Math.sqrt(m.mm) + g * 1.8, 0.2 * m.tl + g * 0.9, 0.095 + g * 2.4]}>
            <sphereGeometry args={[1, 32, 24]} />
            {grasaMat}
          </mesh>
          <mesh position={[0, m.cadera - 0.02, -0.01]} scale={[0.15 + g * 1.6, 0.12 + g * 0.4, 0.1 + g * 1.4]}>
            <sphereGeometry args={[1, 28, 20]} />
            {grasaMat}
          </mesh>
        </>
      ) : null}
      {/* brazos */}
      {([1, -1] as const).map((lado) => (
        <group key={lado} position={[lado * m.ancho, m.hombroY - 0.02, 0]}>
          <Seg
            largo={m.brazo}
            r={0.046 * m.mm}
            hueso={0.013 * m.hb}
            grasa={g * 0.9}
            rot={[-lado * s * 0.45, 0, lado * abd]}
            {...sm}
          >
            <Seg
              largo={m.antebrazo}
              r={0.037 * m.mm}
              hueso={0.011 * m.hb}
              grasa={g * 0.6}
              rot={[codo - (marcha > 0 ? 1.1 + Math.max(0, -lado * s) * 0.4 : 0), 0, 0]}
              {...sm}
            >
              <mesh position={[0, -0.05, 0]} scale={[1, 1.4, 0.45]}>
                <sphereGeometry args={[0.045, 16, 12]} />
                {piel(musculo)}
              </mesh>
              {pesa ? (
                <group position={[0, -0.07, 0]}>
                  <mesh rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.012, 0.012, 0.24, 10]} />
                    <meshStandardMaterial color="#c9d3dc" metalness={0.8} roughness={0.3} />
                  </mesh>
                  {[-0.1, 0.1].map((x) => (
                    <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                      <cylinderGeometry args={[0.055, 0.055, 0.04, 20]} />
                      <meshStandardMaterial color="#2a2f36" metalness={0.5} roughness={0.4} />
                    </mesh>
                  ))}
                </group>
              ) : null}
            </Seg>
          </Seg>
        </group>
      ))}
      {/* piernas */}
      {([1, -1] as const).map((lado) => {
        const ci = lado * s * 0.55;
        const ro = Math.max(0, Math.sin(fase - 1.2 + (lado < 0 ? Math.PI : 0))) * 0.9 * marcha;
        return (
          <group key={lado} position={[lado * (0.095 + g * 0.5), m.cadera, 0]}>
            <Seg largo={m.muslo} r={0.072 * m.mm} hueso={0.017 * m.hb} grasa={g * 1.1} rot={[ci, 0, lado * 0.035]} {...sm}>
              <Seg largo={m.pierna} r={0.052 * m.mm} hueso={0.014 * m.hb} grasa={g * 0.7} rot={[ro, 0, 0]} {...sm}>
                <mesh position={[0, -0.02, 0.06]} scale={[0.8, 0.4, 1.8]}>
                  <sphereGeometry args={[0.05, 16, 12]} />
                  {piel(musculo)}
                </mesh>
              </Seg>
            </Seg>
          </group>
        );
      })}
    </group>
  );
};

// ---- Instrumentos de cineantropometria ------------------------------------------------

const METAL = "#c9d3dc";

/** Plicometro (calibre de pliegues). Puntas en el origen, separadas en Y por `abre`; el cuerpo sale hacia +X. */
export const Plicometro: React.FC<{ p: V3; abre?: number; escala?: number; rot?: [number, number, number] }> = ({
  p,
  abre = 0.1,
  escala = 1,
  rot = [0, 0, 0],
}) => (
  <group position={p} scale={escala} rotation={rot}>
    {[1, -1].map((s) => (
      <group key={s}>
        <mesh position={[0.2, s * (abre / 2 + 0.02 + 0.03), 0]} rotation={[0, 0, s * -0.12]}>
          <boxGeometry args={[0.4, 0.025, 0.04]} />
          <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.005, s * (abre / 2 + 0.008), 0]}>
          <boxGeometry args={[0.03, 0.016, 0.05]} />
          <meshStandardMaterial color="#e9eef2" metalness={0.6} roughness={0.25} />
        </mesh>
      </group>
    ))}
    <mesh position={[0.42, 0, 0]}>
      <boxGeometry args={[0.08, 0.2 + abre * 0.3, 0.05]} />
      <meshStandardMaterial color="#2a2f36" metalness={0.4} roughness={0.4} />
    </mesh>
    <mesh position={[0.42, 0.04, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.075, 0.075, 0.025, 32]} />
      <meshStandardMaterial color="#f4f7f2" roughness={0.3} />
    </mesh>
    <mesh position={[0.42, 0.04, 0.045]} rotation={[0, 0, -0.8 + abre * 6]}>
      <boxGeometry args={[0.006, 0.06, 0.004]} />
      <meshStandardMaterial color="#ff3344" emissive="#ff3344" emissiveIntensity={0.6} />
    </mesh>
    <mesh position={[0.62, 0, 0]} rotation={[0, 0, 0.1]}>
      <boxGeometry args={[0.3, 0.05, 0.04]} />
      <meshStandardMaterial color="#2a2f36" metalness={0.4} roughness={0.4} />
    </mesh>
  </group>
);

/** Cinta metrica rodeando un segmento (anillo con marcas). El eje del anillo es Y local. */
export const Cinta: React.FC<{ p: V3; r: number; rot?: [number, number, number]; brillo?: number }> = ({ p, r, rot = [0, 0, 0], brillo = 0.3 }) => (
  <group position={p} rotation={rot}>
    <mesh>
      <cylinderGeometry args={[r, r, 0.022, 48, 1, true]} />
      <meshStandardMaterial color="#ffd23f" emissive="#ffd23f" emissiveIntensity={brillo} side={THREE.DoubleSide} roughness={0.5} />
    </mesh>
    {Array.from({ length: 24 }).map((_, i) => {
      const a = (i / 24) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.cos(a) * (r + 0.001), 0.004, Math.sin(a) * (r + 0.001)]} rotation={[0, -a, 0]}>
          <boxGeometry args={[0.002, i % 4 === 0 ? 0.014 : 0.008, 0.003]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      );
    })}
    <mesh position={[r + 0.03, -0.02, 0]} rotation={[0, 0, 0.5]}>
      <boxGeometry args={[0.09, 0.022, 0.002]} />
      <meshStandardMaterial color="#ffd23f" emissive="#ffd23f" emissiveIntensity={brillo} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

/** Calibre de diametros oseos: barra en X con dos ramas hacia -Y separadas `abre`. */
export const Calibre: React.FC<{ p: V3; abre: number; rot?: [number, number, number]; escala?: number }> = ({ p, abre, rot = [0, 0, 0], escala = 1 }) => (
  <group position={p} rotation={rot} scale={escala}>
    <mesh position={[0, 0.12, 0]}>
      <boxGeometry args={[abre + 0.16, 0.025, 0.012]} />
      <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.25} />
    </mesh>
    {Array.from({ length: 12 }).map((_, i) => (
      <mesh key={i} position={[-abre / 2 - 0.06 + i * ((abre + 0.12) / 11), 0.128, 0.007]}>
        <boxGeometry args={[0.002, 0.012, 0.002]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    ))}
    {[1, -1].map((s) => (
      <mesh key={s} position={[(s * abre) / 2, 0.06, 0]}>
        <boxGeometry args={[0.014, 0.13, 0.012]} />
        <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.25} />
      </mesh>
    ))}
  </group>
);

/** Estadiometro: poste con marcas cada 10 cm y tope que baja hasta `h`. */
export const Estadiometro: React.FC<{ p: V3; h: number; alto?: number }> = ({ p, h, alto = 2.2 }) => (
  <group position={p}>
    <mesh position={[0, alto / 2, 0]}>
      <boxGeometry args={[0.06, alto, 0.04]} />
      <meshStandardMaterial color="#e8eef0" roughness={0.4} />
    </mesh>
    {Array.from({ length: Math.floor(alto * 10) }).map((_, i) => (
      <mesh key={i} position={[0.034, i * 0.1, 0.0]}>
        <boxGeometry args={[i % 5 === 0 ? 0.05 : 0.025, 0.006, 0.042]} />
        <meshStandardMaterial color="#0d2a2f" />
      </mesh>
    ))}
    <mesh position={[0.17, h, 0]}>
      <boxGeometry args={[0.3, 0.025, 0.14]} />
      <meshStandardMaterial color="#43e0ff" emissive="#43e0ff" emissiveIntensity={0.5} />
    </mesh>
    <mesh position={[0, 0.01, 0.1]}>
      <boxGeometry args={[0.3, 0.02, 0.3]} />
      <meshStandardMaterial color="#e8eef0" roughness={0.4} />
    </mesh>
  </group>
);

/** Barra de calificacion (0..max) vertical tipo termometro. */
export const BarraCal: React.FC<{ p: V3; valor: number; max?: number; alto?: number; color: string }> = ({ p, valor, max = 8, alto = 1.2, color }) => {
  const h = Math.max(0.001, (valor / max) * alto);
  return (
    <group position={p}>
      <mesh position={[0, alto / 2, 0]}>
        <cylinderGeometry args={[0.09, 0.09, alto, 28, 1, true]} />
        <meshPhysicalMaterial color="#cfe6ff" transparent opacity={0.18} roughness={0.1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.07, 0.07, h, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      {Array.from({ length: max + 1 }).map((_, i) => (
        <mesh key={i} position={[0, (i / max) * alto, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.092, 0.004, 6, 28]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
};

// ---- Corte de piel: piel -> grasa subcutanea -> musculo ---------------------------------

/**
 * Bloque de tejido visto de frente (cara de corte en +Z). pliegue 0..1 levanta un pliegue
 * de piel + grasa (sin musculo), como lo pellizca el plicometro.
 */
export const CortePiel: React.FC<{ pliegue: number; grasa?: number; brilloGrasa?: number }> = ({ pliegue, grasa = 0.6, brilloGrasa = 0 }) => {
  const W = 2.6;
  const D = 1.0;
  // yM = techo del musculo
  const yG = yM + grasa; // techo de la grasa
  const yP = yG + 0.1; // superficie de la piel
  const adip = useMemo(() => {
    const out: V3[] = [];
    const n = Math.max(1, Math.round(grasa / 0.17));
    for (let j = 0; j < n; j++)
      for (let i = 0; i < 15; i++) {
        const x = -W / 2 + 0.1 + i * ((W - 0.2) / 14) + (j % 2) * 0.08;
        if (Math.abs(x) < 0.32 || x > W / 2 - 0.05) continue;
        out.push([x, yM + (j + 0.5) * (grasa / n), D / 2 - 0.02]);
      }
    return out;
  }, [grasa]);
  const fibras = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let j = 0; j < 5; j++)
      for (let i = 0; i < 17; i++) out.push([-W / 2 + 0.08 + i * 0.155 + (j % 2) * 0.07, yM - 0.09 - j * 0.15, 0.06 + rnd(`cf${i}-${j}`) * 0.012]);
    return out.filter((f) => f[0] < W / 2 - 0.05);
  }, []);
  const hP = pliegue * 0.55; // altura del pliegue
  return (
    <group>
      {/* musculo */}
      <mesh position={[0, yM - 0.42, 0]}>
        <boxGeometry args={[W, 0.84, D]} />
        <meshPhysicalMaterial color="#7d1620" roughness={0.6} />
      </mesh>
      {fibras.map(([x, y, r], i) => (
        <mesh key={i} position={[x, y, D / 2 - 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[r, r, 0.42, 14]} />
          <meshPhysicalMaterial color="#b3222f" roughness={0.45} clearcoat={0.4} />
        </mesh>
      ))}
      {/* fascia */}
      <mesh position={[0, yM + 0.006, 0]}>
        <boxGeometry args={[W, 0.012, D]} />
        <meshStandardMaterial color="#efe6d2" />
      </mesh>
      {/* grasa subcutanea */}
      <mesh position={[0, yM + grasa / 2, 0]}>
        <boxGeometry args={[W, grasa, D]} />
        <meshPhysicalMaterial color="#e9bf55" emissive={GRASA} emissiveIntensity={0.05 + brilloGrasa * 0.4} roughness={0.6} />
      </mesh>
      {adip.map((p, i) => (
        <mesh key={i} position={p} scale={[1, 1, 0.5]}>
          <sphereGeometry args={[0.075, 16, 12]} />
          <meshPhysicalMaterial color={GRASA} emissive={GRASA} emissiveIntensity={0.15 + brilloGrasa * 0.5} roughness={0.25} clearcoat={0.8} />
        </mesh>
      ))}
      {/* piel */}
      <mesh position={[0, yG + 0.05, 0]}>
        <boxGeometry args={[W, 0.1, D]} />
        <meshPhysicalMaterial color="#e8a58f" roughness={0.5} clearcoat={0.3} />
      </mesh>
      {/* pliegue: piel + grasa levantadas (doble capa, sin musculo) */}
      {pliegue > 0.01 ? (
        <group position={[0, yP - 0.02, 0]}>
          <mesh position={[0, hP / 2, 0]} scale={[1, 1, 1]}>
            <boxGeometry args={[0.36, hP, D * 0.98]} />
            <meshPhysicalMaterial color="#e9bf55" emissive={GRASA} emissiveIntensity={0.1 + brilloGrasa * 0.4} roughness={0.6} />
          </mesh>
          <mesh position={[0, hP, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 1]}>
            <cylinderGeometry args={[0.2, 0.2, D * 0.99, 28]} />
            <meshPhysicalMaterial color="#e8a58f" roughness={0.5} clearcoat={0.3} />
          </mesh>
          {[1, -1].map((s) => (
            <mesh key={s} position={[s * 0.19, hP / 2, 0]}>
              <boxGeometry args={[0.03, hP, D * 0.99]} />
              <meshPhysicalMaterial color="#e8a58f" roughness={0.5} />
            </mesh>
          ))}
          {[0.3, 0.62].map((k) => (
            <mesh key={k} position={[0, hP * k, D / 2 - 0.01]} scale={[1, 1, 0.5]}>
              <sphereGeometry args={[0.07, 14, 10]} />
              <meshPhysicalMaterial color={GRASA} emissive={GRASA} emissiveIntensity={0.15 + brilloGrasa * 0.5} roughness={0.25} clearcoat={0.8} />
            </mesh>
          ))}
        </group>
      ) : null}
    </group>
  );
};

// ---- Somatocarta ----------------------------------------------------------------------

/** Coordenadas de Heath-Carter: X = ecto - endo, Y = 2*meso - (endo + ecto). Centrado en Y = 3. */
export const puntoCarta = (s: Soma, esc = 0.075): V3 => [(s.ecto - s.endo) * esc, (2 * s.meso - s.endo - s.ecto - 3) * esc, 0.02];

const VERT = { endo: { endo: 7, meso: 1, ecto: 1 }, meso: { endo: 1, meso: 7, ecto: 1 }, ecto: { endo: 1, meso: 1, ecto: 7 } };
export const cartaVertices = (esc = 0.075) => ({
  endo: puntoCarta(VERT.endo, esc),
  meso: puntoCarta(VERT.meso, esc),
  ecto: puntoCarta(VERT.ecto, esc),
});

const arco = (a: V3, b: V3, bulto: number, n = 24): V3[] => {
  const m: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0];
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const L = Math.hypot(dx, dy);
  // normal hacia fuera (el centro de la carta queda cerca del origen)
  let nx = dy / L;
  let ny = -dx / L;
  if (nx * m[0] + ny * m[1] < 0) {
    nx = -nx;
    ny = -ny;
  }
  const c: V3 = [m[0] + nx * bulto * L, m[1] + ny * bulto * L, 0];
  return Array.from({ length: n + 1 }).map((_, i) => {
    const t = i / n;
    const u = 1 - t;
    return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1], 0] as V3;
  });
};

const Linea: React.FC<{ pts: V3[]; color: string; r?: number; op?: number; brillo?: number }> = ({ pts, color, r = 0.012, op = 1, brillo = 0.5 }) => {
  const key = pts.map((p) => `${p[0].toFixed(3)},${p[1].toFixed(3)}`).join(";");
  const geo = useMemo(() => {
    const curva = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    return new THREE.TubeGeometry(curva, Math.max(8, pts.length * 2), r, 8, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, r]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={brillo} transparent={op < 1} opacity={op} />
    </mesh>
  );
};

/** Somatocarta de Heath-Carter en el plano XY: triangulo curvo y ejes desde el centro. */
export const Somatocarta: React.FC<{ esc?: number; traza?: number; op?: number }> = ({ esc = 0.075, traza = 1, op = 1 }) => {
  const v = cartaVertices(esc);
  const lados: [V3, V3][] = [
    [v.endo, v.meso],
    [v.meso, v.ecto],
    [v.ecto, v.endo],
  ];
  const centro = puntoCarta({ endo: 3, meso: 3, ecto: 3 }, esc);
  const corte = (pts: V3[], t: number) => pts.slice(0, Math.max(2, Math.round(pts.length * t)));
  return (
    <group>
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[esc * 18, esc * 22]} />
        <meshStandardMaterial color="#0a2328" transparent opacity={0.75 * op} />
      </mesh>
      {lados.map(([a, b], i) => {
        const t = Math.min(1, Math.max(0, traza * 3 - i));
        return t > 0 ? <Linea key={i} pts={corte(arco(a, b, 0.12), t)} color="#f4f7f2" r={0.014} op={op} /> : null;
      })}
      {traza > 0.95
        ? [v.endo, v.meso, v.ecto].map((p, i) => <Linea key={i} pts={[centro, p]} color="#9fb8b4" r={0.006} op={0.6 * op} brillo={0.2} />)
        : null}
    </group>
  );
};

/** Punto brillante sobre la carta. */
export const PuntoCarta: React.FC<{ p: V3; color: string; r?: number; op?: number }> = ({ p, color, r = 0.05, op = 1 }) => (
  <group position={p}>
    <mesh>
      <sphereGeometry args={[r, 20, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} transparent={op < 1} opacity={op} />
    </mesh>
    <mesh>
      <sphereGeometry args={[r * 1.8, 20, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.18 * op} depthWrite={false} />
    </mesh>
  </group>
);

/** Poblacion ilustrativa (no son datos reales): la mayoria cae en zonas mixtas. */
export const POBLACION: Soma[] = Array.from({ length: 90 }).map((_, i) => {
  const endo = 1.5 + rnd(`pe${i}`) * 4.5;
  const meso = 2 + rnd(`pm${i}`) * 4;
  const ecto = Math.max(0.5, 4.2 - endo * 0.45 + (rnd(`pc${i}`) - 0.5) * 2.4);
  return { endo, meso, ecto };
});
